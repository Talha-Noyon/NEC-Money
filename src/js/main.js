(function ($) {
	/*Homepage Slider*/
    $('#home-slider').owlCarousel({
        rtl:true,
        loop:false,
        //margin:10,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:5
            }
        },
        //navigation: true, // Show next and prev buttons
        slideSpeed: 300,
        autoplay:true,
        singleItem: true,
        nav: false
    })

	/*Section Animation When Scrolling About Page*/
    AOS.init({
        duration: 1200,
    })


})(jQuery);