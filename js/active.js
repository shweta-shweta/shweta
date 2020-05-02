(function ($) {
    'use strict';

    // :: 1.0 Owl Carousel Active JS
    if ($.fn.owlCarousel) {
        // Welcome Slide
        $(".welcome_slides").owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            smartSpeed: 1500,
            nav: true,
            navText: ["<i class='pe-7s-angle-left'</i>", "<i class='pe-7s-angle-right'</i>"]
        })
        // Clients Slides
        $(".client_slides").owlCarousel({
            items: 5,
            loop: true,
            autoplay: true,
            smartSpeed: 800,
            nav: true,
            navText: ["<i class='pe-7s-angle-left'</i>", "<i class='pe-7s-angle-right'</i>"]
        })
        // Portfolio Slides
        $(".portfolio_slides").owlCarousel({
            items: 3,
            loop: true,
            autoplay: true,
            smartSpeed: 800,
            responsive: {
                320: {
                    items: 1
                },
                576: {
                    items: 1
                },
                768: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        })
		
		
		
		// media Slides
        $(".media_slides").owlCarousel({
            items: 3,
            loop: true,
            autoplay: true,
            smartSpeed: 800,
            responsive: {
                320: {
                    items: 1
                },
                576: {
                    items: 1
                },
                768: {
                    items: 2
                },
                992: {
                    items: 3
                }
            }
        })
		
		
    }

    // :: 2.0 ScrollUp Active JS
    if ($.fn.scrollUp) {
        $.scrollUp({
            scrollSpeed: 1500,
            scrollText: '<i class="fa fa-angle-up"></i>'
        });
    }

    // :: 3.0 CounterUp Active JS
    if ($.fn.counterUp) {
        $('.counter').counterUp({
            delay: 10,
            time: 2000
        });
    }

    // :: 4.0 onePageNav Active JS
    if ($.fn.onePageNav) {
        $('#nav').onePageNav({
            currentClass: 'active',
            scrollSpeed: 2000,
            easing: 'easeOutQuad'
        });
    }

    // Magnific-popup Video Active Code
    if ($.fn.magnificPopup) {
        $('.video_btn').magnificPopup({
            disableOn: 0,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: true,
            fixedContentPos: false
        });
        $('.gallery_img').magnificPopup({
            type: 'image',
            gallery: {
                enabled: true
            },
            removalDelay: 300,
            mainClass: 'mfp-fade',
            preloader: true
        });
    }

    // :: 5.0 Meanmenu Active JS
    if ($.fn.meanmenu) {
        $('#nav-menu').meanmenu({
            onePage: true
        });
    }

    // :: 6.0 Jarallax Active JS
    if ($.fn.jarallax) {
        $('.jarallax').jarallax({
            speed: 0.2
        });
    }

    // :: 7.0 matchHeight Active JS
    if ($.fn.matchHeight) {
        $('.item').matchHeight();
    }

    var $window = $(window);

    // :: 8.0 Sticky Active JS
    $window.on('scroll', function () {
        if ($window.scrollTop() > 100) {
            $('.header_area').addClass('sticky slideInDown');
        } else {
            $('.header_area').removeClass('sticky slideInDown');
        }
    });

    // :: 9.0 Preloader active code
    $window.on('load', function () {
        $('#preloader').fadeOut('slow', function () {
            $(this).remove();
        });
    });

})(jQuery);