// $(document).ready(function(){
// 	//menu
// 	$(document).on("click", ".showMenu", function(){
// 		$(this).toggleClass("opened");
// 		$(".toggleMenu").toggleClass("menu-open");
// 		$("body").toggleClass("active-menu");
// 		$("html").toggleClass("overflow");
// 	});
// 	$(document).on("click", ".close-menu, .overlay", function(){
// 		$('.showMenu').toggleClass("opened");
// 		$(".toggleMenu").removeClass("menu-open");
// 		$("body").removeClass("active-menu");
// 		$("html").removeClass("overflow");
// 	});
// });

$(document).ready(function(){
    $(document).on("click", ".showMenu", function(){
        $(this).toggleClass("opened");
        $(".toggleMenu").toggleClass("menu-open");
        $("body").toggleClass("active-menu");
        $("html").toggleClass("overflow");
    });

	// $(document).on("click", ".list-menu ul li", function(){
	// 	$('.list-menu ul li').removeClass('is-active');
	// 	$(this).addClass('is-active');
	// });


	// Swiper slider
	var mySwiper = new Swiper('.hero-slider', {
		slidesPerView: 1,
		loop: true,
		pagination: false,
		speed: 2000,
		allowTouchMove: false,
		effect: 'fade',
        autoplay: {
            delay: 2000
		}
	});
	$(document).on('mouseenter','.slideRequest', function() {
		mySwiper.slideTo( $('.slideTwoJs').index(),700 );
		$('.section-hero').addClass('pixel-var_1');
	});
	$(document).on('mouseenter','.slideJury', function() {
		mySwiper.slideTo( $('.slideThreeJs').index(),700 );
		$('.section-hero').addClass('pixel-var_2');
	});
	$(document).on('mouseleave','.slideRequest, .slideJury', function() {
		mySwiper.autoplay.start();
		$('.section-hero').removeClass('pixel-var_1');
		$('.section-hero').removeClass('pixel-var_2');
	});
	// Tab
	$(document).on("click", ".navItemJs", function(e){
		e.preventDefault();
		$(".navItemJs").removeClass("is-active").eq($(this).index()).addClass("is-active");
		$(".tab-pane").hide().eq($(this).index()).fadeIn()
	}).eq(0).addClass("is-active");
});