var browserSync    = require('browser-sync')
var critical       = require('critical')                  // current version - "0.9.1" ("1.0.0" - errors during build)
var del            = require('del')
var path           = require('path')
var fs             = require('fs')
var gulp           = require('gulp')
var autoprefixer   = require('gulp-autoprefixer')
var cache          = require('gulp-cache')
var changed        = require('gulp-changed')
var cleanCSS       = require('gulp-clean-css')
var concat         = require('gulp-concat')
var gulpIf         = require('gulp-if')
var imagemin       = require('gulp-imagemin')
var jpegRecompress = require('imagemin-jpeg-recompress')
var sass           = require('gulp-sass')
var sourcemaps     = require('gulp-sourcemaps')
var uglify         = require('gulp-uglify')
var useref         = require('gulp-useref')
var runSequence    = require('run-sequence')
var webp           = require('gulp-webp')

runSequence.options.ignoreUndefinedTasks = false;

// custom modules
var config = require('./config.js');
var plugins = require('./assets/js/list_plugins.js');
var flags = { production: false }



// Development Tasks 
// -----------------
// Start browserSync server
gulp.task('browserSync', function() {
  browserSync(config.sync)
})
// Sass convert
gulp.task('sass', function() {
  return gulp.src(config.devPaths.scss + '**/*.scss')
    .pipe(gulpIf(!flags.production, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: config.settingsAutoprefixer.browsers }))
    .pipe(gulpIf(!flags.production, sourcemaps.write()))
    .pipe(changed(config.devPaths.css, { hasChanged: changed.compareSha1Digest }))
    .pipe(gulp.dest(config.devPaths.css))
    .pipe(browserSync.reload({ stream: true }))
})
// concat all js files into one
gulp.task('pluginsScripts', function () {
  return gulp.src(plugins.plugins)
    .pipe(concat('plugins.js'))
    .pipe(gulp.dest(config.devPaths.scripts))
})
gulp.task('clean:webp', function() {
  return del.sync(config.devPaths.images + 'webp')
})
//Convert to webp
gulp.task('convertImageToWebp', function() {
  return gulp.src([config.devPaths.images + '**/*.{png,jpg,jpeg}', '!webp'])
    .pipe(webp())
    .pipe(gulp.dest(config.devPaths.images + '/webp'))
})
// Clean and convert webp
gulp.task('imageToWebp', function(callback) {
  runSequence('clean:webp', 'convertImageToWebp',
    callback
  )
})
// Watchers
gulp.task('watch', function() {
  gulp.watch(config.devPaths.scss + '**/*.scss', ['sass'])
  gulp.watch(config.devPaths.scripts + '**/*.js', ['pluginsScripts'], browserSync.reload)
  gulp.watch(config.devPaths.html + '**/*.{php,tpl,html}', browserSync.reload)
  gulp.watch(config.devPaths.images + '**/*.{png,jpg,jpeg}', ['imageToWebp'])
})



// Production Tasks
// -----------------
// Clean before production
gulp.task('clean:dist', function() {
  return del.sync(config.distPaths.root)
})
// Contcatenation scripts
gulp.task('useref', function() {
  return gulp.src(config.devPaths.headerTpl)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest(config.distPaths.headerFolder))
})
// Optimizing Images 
gulp.task('images', function() {
  return gulp.src(config.devPaths.images + '**/*')
    .pipe(cache(imagemin([
      imagemin.gifsicle(),
      jpegRecompress({
        loops:4,
        min: 50,
        max: 95,
        quality:'high' 
      }),
      imagemin.optipng()
    ])))
    .pipe(gulp.dest(config.distPaths.images))
})
gulp.task('clear', function (done) {//clear cache with images - if needs
  return cache.clearAll(done)
})
// Copy-paste fonts
gulp.task('fonts', function() {
  return gulp.src(config.devPaths.fonts + '**/*.{woff,woff2}')
  .pipe(gulp.dest(config.distPaths.fonts))
})
// Copy-paste nocombined js
gulp.task('jsNoCombined', function() {
  return gulp.src(config.devPaths.scripts + '/no_combined/*.js')
  .pipe(uglify())
  .pipe(gulp.dest(config.distPaths.scripts + '/no_combined/'))
})
// Minify css
gulp.task('minify', function() {
  return gulp.src(config.distPaths.css + '**/*.css')
    .pipe(cleanCSS({level:{1:{specialComments:0}}}))
    .pipe(gulp.dest(config.distPaths.css))
})
// Generate header for live
function removeNoindex(index, arrayFiles) {
  if (index != arrayFiles) {
    fs.readFile(config.distPaths.html + arrFiles[index], 'utf8', function ( err, data ) {
      data = data.replace('<meta name="robots" content="noindex">', '');
      fs.writeFile(config.distPaths.html + arrFiles[index], data, function() {
        removeNoindex(index + 1, arrayFiles);
      });
    });
  }
}
gulp.task('generateHeaderLive', function () {
  let indexEl = 0;
  let lengthFiles = arrFiles.length;
  removeNoindex(indexEl, lengthFiles);
})
// critical css
var criticalProps = [];
gulp.task('criticalCssSource', function() {
  fs.readdirSync(config.devPaths.css).filter(function(file) {
    if (file.indexOf(".css") > -1) {
      criticalProps.push(config.devPaths.css + file);
    }
  })
});
function eachSourcesCritical(index, array) {
  if (index != array) {
    critical.generate({
      base: config.critical.base,
      inline: true,
      include: config.critical.include,
      ignore: config.critical.ignore,
      src: arrFiles[index],
      css: criticalProps,
      dest: arrFiles[index],
      minify: config.critical.minify,
      timeout: config.critical.timeout,
      height: config.critical.height,
      width: config.critical.width
    }).then(function (output) {
      eachSourcesCritical(index + 1, array);
    });
  }
}
gulp.task('critical', ['criticalCssSource'], function (cb) {
    let indexEl = 0;
    let lengthCriticalSources = arrFiles.length;
    eachSourcesCritical(indexEl, lengthCriticalSources);
})
var arrFiles = [];
function getHTMLFiles() {
  var directoryPath = path.join(config.devPaths.html);
  fs.readdirSync(directoryPath).filter(function(file) {
    if (file.indexOf(".html") > -1) {
      arrFiles.push(file);
    }
  });
}
getHTMLFiles();



// development - local server - default task
gulp.task('default', function(callback) {
  runSequence(
    'clean:dist',
    'pluginsScripts',
    'sass',
    'imageToWebp',
    'browserSync',
    ['watch'],
    callback
  )
})
// production - dev server
gulp.task('production', function(callback) {
  flags.production = true
  runSequence(
    'clean:dist',
    'pluginsScripts',
    'sass',
    'imageToWebp',
    ['useref', 'jsNoCombined', 'images', 'fonts'],
    'minify',
    'critical',
    callback
  )
})
// production - live server
gulp.task('production_live', function(callback) {
  flags.production = true
  runSequence(
    'clean:dist',
    'pluginsScripts',
    'sass',
    'imageToWebp',
    ['useref', 'jsNoCombined', 'images', 'fonts'],
    'generateHeaderLive',
    'minify',
    'critical',
    callback
  )
})