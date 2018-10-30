(function ($) {
    /*Homepage Slider*/
    $('#home-slider').owlCarousel({
        rtl: true,
        loop: false,
        //margin:10,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 3
            },
            1000: {
                items: 5
            }
        },
        //navigation: true, // Show next and prev buttons
        slideSpeed: 300,
        autoplay: true,
        singleItem: true,
        nav: false
    });

    /*Section Animation When Scrolling About Page*/
    AOS.init({
        duration: 1200,
    });

    $('.responsive').slick({
        autoplay: true,
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        centerPadding: '60px',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    centerPadding: '40px',
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    centerPadding: '40px',
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
        ]
    });

})(jQuery);