// jQuery Cineslider

(function($, jQthrottle, Modernizr, TweenMax, Hammer){

  'use strict';

  $.fn.cineSlider = function(options) {
    var pluginName = 'jquery.cineSlider';

    var settings = $.extend({
      debug: false,
      shifters: ['#fff', '#000'],
      duration: 2,
      easing: Power2,
      currentSlide: 1,
      swipeVelocity: 0.25,
      lock: false,
      onSlideChangeStart: function($prevSlide, $newSlide){},
      onSlideChangeComplete: function($prevSlide, $newSlide){}
    }, options);

    var
      $container = this,
      $wrapper = $container.find('.cineslider-wrapper'),
      $slides = $container.find('.cineslider-slide'),
      $shifters = null,
      animated = false,
      locked = settings.lock,
      currentSlideIndex = settings.currentSlide - 1
    ;

    function debug(message) {
      if (window.console && window.console.log && settings.debug) {
        window.console.log(pluginName + ': ' + message);
      }
    }

    function exception(message) {
      throw pluginName + ': ' + message;
    }

    function createShifters() {
      for (var i = 0; i < settings.shifters.length; i++) {
        var $shifter = $('<div class="cineslider-shifter">');

        $shifter.css('backgroundColor', settings.shifters[i]);
        $wrapper.append($shifter);
      }

      $shifters = $wrapper.find('.cineslider-shifter');
      debug('Shifters created');
    }

    function mouseWheelRegistration() {
      debug('Mousewheel event registration');

      $container.on('mousewheel', jQthrottle(150, function(e){
        e.preventDefault();

        if (!locked) {
          if (e.deltaY < 0) {
            slideNext();
          } else {
            slidePrev();
          }
        }
      }));
    }

    function touchSwipeRegistration() {
      debug('TouchSwipe event registration using Hammer.js');

      var hammerIstance = new Hammer($wrapper[0]);
      var hammerTap = new Hammer($wrapper[0]);

      hammerIstance
        .get('pan')
        .set({
          direction: Hammer.DIRECTION_VERTICAL,
          velocity: settings.swipeVelocity
        });
      hammerIstance.on('panstart', jQthrottle(150, function(e){
        e.preventDefault();
        if(e.target.className == 'client-logo' || e.target.className == 'owl-stage') {
          // bllock scroll
        } else {
          if (!locked) {
            if (e.direction === Hammer.DIRECTION_DOWN) {
              slidePrev();
              debug('swipedown event triggered');
            } else if (e.direction === Hammer.DIRECTION_UP) {
              slideNext();
              debug('swipeup event triggered');
            }
          }
        }
      }));
    }

    var getSlidingDuration = function() {
      return settings.duration + (settings.duration / 2);
    };

    var slideTo = function(index, force) {
      if (!locked && !animated && index !== currentSlideIndex && (index >= 0 && index < $slides.length)) {
        var
          $currentSlide = $slides.eq(currentSlideIndex),
          $newSlide = $slides.eq(index),
          duration = settings.duration,
          direction = null,
          timeline = new TimelineMax()
        ;

        force = force !== undefined ? force : false;

        if (force) {
          duration = 0.1;
        }

        if (index > currentSlideIndex) {
          direction = 'down';
        } else {
          direction = 'up';
        }

        TweenMax.set($currentSlide, {
          zIndex: 0
        });

        TweenMax.set([$shifters, $newSlide], {
          display: 'block',
          zIndex: 1,
          y: direction === 'down' ? '100%' : '-100%'
        });

        timeline
          .add([
            TweenMax.to(direction === 'down' ? $shifters.first() : $shifters.last(), duration, {
              y: direction === 'down' ? '-100%' : '100%',
              ease: settings.easing.easeIn
            }),
            TweenMax.to(direction === 'down' ? $shifters.last() : $shifters.first(), duration, {
              y: direction === 'down' ? '-100%' : '100%',
              ease: settings.easing.easeInOut,
              delay: duration / 2
            }),
            TweenMax.to($newSlide, duration, {
              y: '0%',
              ease: settings.easing.easeInOut,
              delay: duration / 2
            }),

          ]);

        timeline.eventCallback('onStart', function(){
          animated = true;
          settings.onSlideChangeStart.call(this, $currentSlide, $newSlide, direction);
          $container.trigger('slidechangestart', [$currentSlide, $newSlide, direction]);
          debug('Slide animation start for slide ' + (index + 1));
        });
        timeline.eventCallback('onComplete', function(){
          TweenMax.set([$shifters, $currentSlide], {
            display: 'none'
          });
          $currentSlide.removeClass('cineslider-slide-active');
          $newSlide.addClass('cineslider-slide-active');
          currentSlideIndex = index;
          animated = false;

          settings.onSlideChangeComplete.call(this, $currentSlide, $newSlide, direction);
          $container.trigger('slidechangecomplete', [$currentSlide, $newSlide, direction]);
          debug('Slide animation complete slide ' + (index + 1));
        });
      }
    };

    var slideNext = function() {
      slideTo(currentSlideIndex + 1);
    };

    var slidePrev = function() {
      slideTo(currentSlideIndex - 1);
    };

    var lock = function() {
      locked = true;
    };

    var unlock = function() {
      locked = false;
    };

    var isLock = function() {
      return locked;
    };

    var isAnimate = function() {
      return animated;
    };

    var on = function(event, callback) {
      $container.on(event, callback);
    };

    var one = function(event, callback) {
      $container.one(event, callback);
    };

    var off = function(event) {
      $container.off(event);
    };

    function init() {
      debug('Cineslider Plugin launched');

      if (currentSlideIndex >= 0 && currentSlideIndex < $slides.length) {
        var $currentSlide = $slides.eq(currentSlideIndex);

        $currentSlide
          .addClass('cineslider-slide-active')
          .siblings('.cineslider-slide')
          .hide();

        createShifters();

        if (!Modernizr.touch) {
          mouseWheelRegistration();
        } else {
          touchSwipeRegistration();
          mouseWheelRegistration();
        }

        debug('Cineslider Plugin initialized');
      } else {
        exception('currentSlide index is not in range');
      }
    }

    init();

    return {
      target: this,
      slideTo: slideTo,
      slideNext: slideNext,
      slidePrev: slidePrev,
      getSlidingDuration: getSlidingDuration,
      lock: lock,
      unlock: unlock,
      isLock: isLock,
      isAnimate: isAnimate,
      on: on,
      one: one,
      off: off
    };
  };

})($, $.throttle, Modernizr, TweenMax, Hammer);
;(function($, Modernizr, jQthrottle, TweenMax) {

  'use strict';

  $.fn.splitter = function(options) {

    var pluginName = 'jquery.splitter';

    var settings = $.extend({
      debug: false,
      duration: 0.8,
      easing: Power2,
      hideButtonOnClick: true,
      preventClick: true,
      onButtonClick: function(pageId){}
    }, options);

    var
      $window = $(window),
      $container = $(this),
      $items = $container.find('.splitter-item'),
      animated = false,
      splitted = false
    ;

    function debug(message) {
      if (window.console && window.console.log && settings.debug) {
        window.console.log(pluginName + ': ' + message);
      }
    }

    function exception(message) {
      throw pluginName + ': ' + message;
    }

    function isHorizontal() {
      var
        $firstItem = $items.first(),
        $lastItem = $items.last()
      ;

      return $firstItem.position().top === $lastItem.position().top;
    }

    function openItem($item) {
      if (!animated && !splitted && !$item.hasClass('active')) {
        var $toHide = $item.siblings('.splitter-item');

        $item.addClass('active');
        $toHide.removeClass('active');

        animated = true;
        splitted = true;

        if (isHorizontal()) {
          TweenMax.to($toHide, settings.duration, {
            x: $toHide.css('left') === 'auto' ? '50%' : '-50%',
            ease: settings.easing.easeInOut
          });

          TweenMax.to($item, settings.duration, {
            css: {
              width: '100%'
            },
            ease: settings.easing.easeInOut,
            onComplete: function() {
              animated = false;
            }
          });
        } else {

          TweenMax.to($toHide, settings.duration, {
            y: $toHide.css('bottom') === 'auto' ? '-50%' : '50%',
            ease: settings.easing.easeInOut
          });

          TweenMax.to($item, settings.duration, {
            css: {
              height: '100%'
            },
            ease: settings.easing.easeInOut,
            onComplete: function() {
              animated = false;
            }
          });
        }
      }
    }

    var reset = function(force) {
      force = force !== undefined ? force : true;

      if (!animated && splitted) {
        if (force) {

          $items.removeAttr('style');

          if (isHorizontal()) {
            TweenMax.set($items, {
              x: '0%',
              width: '50%',
              height: '100%'
            });
          } else {
            TweenMax.set($items, {
              y: '0%',
              height: '50%',
              width: '100%'
            });
          }

          $items
            .removeClass('active')
            .find('.splitter-button')
            .removeAttr('style');

          splitted = false;
        }
      }
    };

    var getDuration = function(){
      return settings.duration;
    };

    var on = function(event, callback) {
      $container.on(event, callback);
    };

    var one = function(event, callback) {
      $container.one(event, callback);
    };

    var off = function(event) {
      $container.off(event);
    };

    function init() {
      $items.on('click', '.splitter-button', function(e){

        if (settings.preventClick) {
          e.preventDefault();
        }

        var
          $clicked = $(this),
          clickedPageId = $clicked.attr('href').replace('#', ''),
          $itemToShow = $(e.delegateTarget)
        ;

        if (settings.hideButtonOnClick) {
          TweenMax.to($clicked, settings.duration, {
            alpha: 0,
            ease: settings.easing.easeInOut
          });
        }

        openItem($itemToShow);

        settings.onButtonClick.call(this, clickedPageId);
        $container.trigger('buttonclick', [clickedPageId]);
      });

      $window.on('resize', jQthrottle(150, function(){
        if (!splitted) {
          $items.removeAttr('style');

          if (isHorizontal()) {
            TweenMax.set($items, {
              x: '0%',
              width: '50%',
              height: '100%'
            });
          } else {
            TweenMax.set($items, {
              y: '0%',
              width: '100%',
              height: '50%'
            });
          }
        }
      }));
    }

    init();

    return {
      target: this,
      getDuration: getDuration,
      reset: reset,
      on: on,
      one: one,
      off: off
    };
  };

})($, Modernizr, $.throttle, TweenMax);
;// jQuery Starwars text scroll

(function($, jQthrottle, kinetic, Modernizr, detect){

  'use strict';

  $.fn.starwarsScroll = function(options) {

    var pluginName = 'jquery.starwars';

    var settings = $.extend({
      debug: false,
      offsetSentenceDistance: 100,
      offsetScale: 0.25,
      offsetAlpha: 0.25,
      stagger: 0.5,
      duration: 1,
      lock: false,
      onInit: function(){},
      onProgress: function(progress){},
      onComplete: function(){},
      onStart: function(){},
      onReverse: function(){},
    }, options);

    var
      $window = $(window),
      $container = $(this),
      $wrapper = $container.find('.starwars-wrapper'),
      $sentences = $wrapper.find('p'),
      $touchFake = null,
      $touchFakeInner = null,
      kineticInstance = null,
      locked = settings.lock
    ;

    var
      scrollTop = 0,
      scrollPercent = 0,
      scrollHeight = 0,
      sequence = new TimelineMax({
        paused: true,
        ease: Linear.easeNone,
        onStart: function() {
          settings.onStart.call();
          $container.trigger('start');
        },
        onComplete: function() {
          settings.onComplete.call();
          $container.trigger('complete');
        },
        onReverseComplete: function() {
          settings.onReverse.call();
          $container.trigger('reverse');
        },
        onUpdate: function() {
          settings.onProgress.call(this, sequence.progress());
          $container.trigger('progress', [sequence.progress()]);
        }
      })
    ;

    function debug(message) {
      if (window.console && window.console.log && settings.debug) {
        window.console.log(pluginName + ': ' + message);
      }
    }

    function exception(message) {
      throw pluginName + ': ' + message;
    }

    function createTouchElements() {
      $touchFake = $('<div>');
      $touchFakeInner = $('<div>');

      $touchFake
        .append($touchFakeInner)
        .appendTo($container)
        .css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        });
    }

    function setSentencesTransforms() {
      $sentences.each(function(index){
        var
          valY = (index * settings.offsetSentenceDistance),
          valScale = 1 - (settings.offsetScale * index),
          valAlpha = 1 - (settings.offsetAlpha * index)
        ;

        TweenMax.set($(this), {
          y: valY + '%',
          scale: valScale,
          alpha: valAlpha
        });
      });

      debug('setup sentences transform before to build the sequence timeline');
    }

    function createSentencesSequence() {
      var finalSteps = Math.round(1 / settings.offsetAlpha);

      $sentences.each(function(index){
        var
          i = 0,
          j = index,
          delay = (settings.stagger * index)
        ;

        for (i = 0; i < j; i++) {
          sequence.to($(this), settings.duration, {
            y: (settings.offsetSentenceDistance * (j - i - 1)) + '%',
            alpha: 1 - (settings.offsetAlpha * (j - i - 1)),
            scale: 1 - (settings.offsetScale * (j - i - 1)),
            ease: Linear.easeNone
          }, delay);

          delay += settings.duration;
        }

        if (index < $sentences.length - 1) {
          for (i = 0; i < finalSteps; i++) {
            sequence.to($(this), settings.duration, {
              y: (-settings.offsetSentenceDistance * (i + 1)) + '%',
              alpha: 1 - (settings.offsetAlpha * (i + 1)),
              scale: 1 + (settings.offsetScale * (i + 1)),
              ease: Linear.easeNone
            }, delay);

            delay += settings.duration;
          }
        }
      });

      debug('sentences sequence created');
    }

    function calculateScrollHeight() {
      var height = 0;

      $sentences.each(function(){
        height += $(this).height() + parseInt($(this).css('marginBottom').replace('px', ''), 10);
      });

      scrollHeight = height;

      if ($touchFakeInner !== null) {
        $touchFakeInner.height(scrollHeight + $window.height());
      }

      debug('calculate scrollHeight parameter: ' + scrollHeight);
    }

    function resizeRegistration() {
      $window.on('resize', jQthrottle(150, function(){
        refresh();
      }));
    }

    function normalizeWheelDelta() {
      /*
       * http://jsbin.com/iqafek/2/edit
       */

      // Keep a distribution of observed values, and scale by the
      // 33rd percentile.
      var distribution = [], done = null, scale = 30;
      return function (n) {
          // Zeroes don't count.
          if (n === 0) return n;
          // After 500 samples, we stop sampling and keep current factor.
          if (done !== null) return n * done;
          var abs = Math.abs(n);
          // Insert value (sorted in ascending order).
          outer: do { // Just used for break goto
              for (var i = 0; i < distribution.length; ++i) {
                  if (abs <= distribution[i]) {
                      distribution.splice(i, 0, abs);
                      break outer;
                  }
              }
              distribution.push(abs);
          } while (false);
          // Factor is scale divided by 33rd percentile.
          var factor = scale / distribution[Math.floor(distribution.length / 3)];
          if (distribution.length == 500) done = factor;
          return n * factor;
      };
    }

    function getRequestAnimationFrame() {
      /*
       * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
       */
      return  window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback) {
                  window.setTimeout(callback, 1000 / 60);
              };
    }

    function mouseWheelRegistration() {
      debug('Mousewheel event registration');

      var
        ua = detect.parse(navigator.userAgent),
        currentY = 0,
        targetY = 0,
        oldY = 0,
        maxScrollTop = 0,
        minScrollTop,
        direction,
        fricton = 0.90, // higher value for slower deceleration def: 0.90
        vy = 0,
        stepAmt = ua.browser.family === 'Firefox' ? 2 : 4,
        minMovement = 0.1,
        requestAnimFrame = getRequestAnimationFrame()
      ;

      normalizeWheelDelta();

      if (ua.os.family === 'Mac OS X') {
        stepAmt = ua.browser.family === 'Firefox' ? 0.2 : 0.8;
      }

      var updateScrollTarget = function (amt) {
        targetY += amt;
        vy += (targetY - oldY) * stepAmt;
        oldY = targetY;
      };

      var render = function () {
        if (vy < -minMovement || vy > minMovement) {
          currentY = (currentY + vy);

          if (scrollTop >= 0 && scrollTop <= scrollHeight) {
            scrollTop = -currentY;
          } else if (scrollTop < 0){
            scrollTop = 0;
            vy = 0;
          } else {
            scrollTop = scrollHeight;
            vy = 0;
          }

          vy *= fricton;

          scrollPercent = scrollTop / scrollHeight;

          if (scrollPercent >= 1) {
            scrollPercent = 1;
          } else if (scrollPercent <= 0) {
            scrollPercent = 0;
          }

          if (sequence.progress() === 1 && scrollPercent === 1) {
            settings.onComplete.call();
            $container.trigger('complete');
          }

          sequence.progress(scrollPercent);
        }
      };

      var animateLoop = function () {
        requestAnimFrame(animateLoop);
        if (!locked) {
          render();
        }
      };

      $container.on('mousewheel', function(e){
        e.preventDefault();

        if (!locked) {
          var
            evt = e.originalEvent,
            delta = evt.detail ? (-1 * evt.detail) : (evt.wheelDelta / 40),
            dir = 0
          ;

          if (!delta) {
            delta = e.deltaY;
          }

          dir = delta < 0 ? -1 : 1;

          if (dir !== direction) {
            vy = 0;
            direction = dir;
          }

          currentY = -1 * scrollTop;

          updateScrollTarget(delta);
        }
      });

      animateLoop();
    }

    function touchMoveRegistration() {
      debug('Touchmove event registration using jquery.kinetic');

      kineticInstance = $touchFake.kinetic({
        x: false,
        moved: function(e){
          if (!locked) {
            scrollTop = e.scrollTop;
            scrollPercent = scrollTop / scrollHeight;

            if (scrollPercent > 1) {
              scrollPercent = 1;
            } else if (scrollPercent < 0) {
              scrollPercent = 0;
            }

            sequence.progress(scrollPercent);
          }
        }
      });
    }

    var refresh = function() {
      var
        currentScrollHeight = scrollHeight,
        currentScrollTop = scrollTop,
        currentScrollPercent = scrollPercent
      ;

      calculateScrollHeight();

      if (currentScrollHeight != scrollHeight) {
        debug('scrollTop recalc because scrollHeight is changed');
        scrollTop = (currentScrollTop * scrollHeight) / currentScrollHeight;

        if ($touchFake !== null) {
          $touchFake.kinetic('scrollTop', scrollTop);
        }
      }
    };

    var reset = function() {
      scrollTop = 0;
      scrollPercent = 0;
      sequence.progress(0);
    };

    var lock = function() {
      locked = true;
    };

    var unlock = function() {
      locked = false;
    };

    var on = function(event, callback) {
      $container.on(event, callback);
    };

    var one = function(event, callback) {
      $container.one(event, callback);
    };

    var off = function(event) {
      $container.off(event);
    };

    function init() {

      if (settings.offsetAlpha <= 0) {
        exception('offsetAlpha parameter must be greater then zero');
      }

      if (Modernizr.touch) {
        createTouchElements();
      }

      calculateScrollHeight();
      setSentencesTransforms();
      createSentencesSequence();

      if (!Modernizr.touch) {
        mouseWheelRegistration();
      } else {
        touchMoveRegistration();
        mouseWheelRegistration();
      }

      resizeRegistration();

      settings.onInit.call();
      debug('plugin initialized');
    }

    init();

    return {
      target: this,
      lock: lock,
      unlock: unlock,
      reset: reset,
      refresh: refresh,
      on: on,
      one: one,
      off: off
    };
  };

})($, $.throttle, $.Kinetic, Modernizr, detect);
;// jQuery Videobg

(function($, jQthrottle, Modernizr, videojs){

  'use strict';

  $.fn.videoBg = function(options) {
    var pluginName = 'jquery.videoBg';

    var settings = $.extend({
      debug: false,
      source: undefined,
      muted: true,
      autoplay: true,
      loop: true,
      poster: undefined,
      shadow: true,
      shadowAlpha: 0.3,
      shadowColor: '#000',
      viewport: $(window),
      onVideoFirstPlay: function(){},
      onPosterLoaded: function(){},
      onVideoLoad: function(){}
    }, options);

    var
      $window = $(window),
      $container = $(this),
      video = null,
      player = null
    ;

    function debug(message) {
      if (window.console && window.console.log && settings.debug) {
        window.console.log(pluginName + ': ' + message);
      }
    }

    function exception(message) {
      throw pluginName + ': ' + message;
    }

    function resizeVideo() {
      var
        viewportRatio = settings.viewport.width() / settings.viewport.height(),
        resizeRatio = video.videoWidth / video.videoHeight,
        resizeWidth = video.videoWidth,
        resizeHeight = video.videoHeight,
        offsetLeft = 0,
        offsetTop = 0
      ;

      if(viewportRatio > resizeRatio) {
          resizeWidth = settings.viewport.width();
          resizeHeight = Math.round(settings.viewport.width() / resizeRatio);
      } else {
          resizeWidth = Math.round(settings.viewport.height() * resizeRatio);
          resizeHeight = settings.viewport.height();
      }

      if (resizeWidth > settings.viewport.width()) {
          offsetLeft = -((resizeWidth - settings.viewport.width()) / 2);
      }

      if (resizeHeight > settings.viewport.height()) {
          offsetTop = -((resizeHeight - settings.viewport.height()) / 2);
      }

      $(video).css({
          width: resizeWidth,
          height: resizeHeight,
          marginLeft: offsetLeft,
          marginTop: offsetTop
      });
      debug('Video resized');
    }

    function createVideo() {
      var $video = $('<video>');

      $video
        .addClass('videojs vjs-default-skin')
        .appendTo($container);

      debug('Tag Video created and appended into main container');

      player = videojs($video[0]);

      player.on('loadedmetadata', function(data){
        video = data.target;
        resizeVideo();
        $window.on('resize', jQthrottle(150, resizeVideo));
        settings.onVideoLoad.call();
        $container.trigger('videoload');
        debug('onloadedmetadata callback launched');
      });
      debug('Register videojs loadeddata callback');

      player.one('play', function(){
        settings.onVideoFirstPlay.call();
        $container.trigger('videofirstplay');
        debug('onPlay callback launched');
      });
      debug('Register videojs play event callback');

      player
        .preload('auto')
        .loop(settings.loop)
        .autoplay(settings.autoplay)
        .muted(settings.muted)
        .src(settings.source);
      debug('Player and Video created');

      createShadow();
    }

    function createPoster() {
      var image = new Image();

      $(image).on('load', function(){
        $container.css('backgroundImage', 'url(' + settings.poster + ')');
        debug('Poster created. Maybe you are using a mobile device or an old browser');
        settings.onPosterLoaded.call();
        $container.trigger('posterloaded');
        debug('onPosterLoaded callback launched');
      });
      debug('Register posterload callback');

      createShadow();

      image.src = settings.poster;
    }

    function createShadow() {
      if (settings.shadow && settings.shadowAlpha > 0 && settings.shadowAlpha < 1 && settings.shadowColor !== 'transparent') {

        var $shadow = $('<div>');

        $shadow
          .addClass('videobg-shadow')
          .css({
            opacity: settings.shadowAlpha,
            backgroundColor: settings.shadowColor
          })
          .appendTo($container);

        debug('Shadow created (color: ' + settings.shadowColor + ', alpha: ' + settings.shadowAlpha + ')');
      }
    }

    var getPlayer = function() {
      return player;
    };

    var play = function() {
      if (player) {
        player.play();
      }
    };

    var pause = function() {
      if (player) {
        player.pause();
      }
    };

    var stop = function() {
      if (player) {
        player
          .pause()
          .currentTime(0);
      }
    };

    var on = function(event, callback) {
      $container.on(event, callback);
    };

    var one = function(event, callback) {
      $container.one(event, callback);
    };

    var off = function(event) {
      $container.off(event);
    };

    function init() {
      debug('Plugin launched');

      if (!Modernizr.touch && settings.source !== undefined) {
        createVideo();
      } else if (settings.poster !== undefined) {
        createVideo();
        // createPoster();
      } else {
        exception('Needs to define "source" or "poster" parameter');
      }
    }

    init();

    return {
      target: this,
      getPlayer: getPlayer,
      play: play,
      pause: pause,
      stop: stop,
      on: on,
      one: one,
      off: off
    };
  };

})($, $.throttle, Modernizr, videojs);
;// jquery videopopup
(function($, Modernizr, TweenMax, videojs){

  'use strict';

  $.fn.videoPopup = function(options){
    var pluginName = 'jquery.videoPopup';

    var settings = $.extend({
      debug: false,
      duration: 0.8,
      easing: Power2,
      onBeforeShow: function(){},
      onAfterShow: function(){},
      onBeforeHide: function(){},
      onAfterHide: function(){}
    }, options);

    function debug(message) {
      if (window.console && window.console.log && settings.debug) {
        window.console.log(pluginName + ': ' + message);
      }
    }

    function exception(message) {
      throw pluginName + ': ' + message;
    }

    return this.each(function() {
      var
        $window = $(window),
        $container = $(this),
        $wrapper = $container.find('.video-popup-wrapper'),
        $overlay = $container.find('.video-popup-overlay'),
        $playButton = $container.find('.video-popup-play'),
        $closeButton = $container.find('.video-popup-close'),
        $video = null,
        originalWidth = $container.outerWidth(),
        originalHeight = $container.outerHeight(),
        player = null,
        animated = false
      ;

      function playVideo() {
        if (player) {
          player.play();
          debug('play video');
        }
      }

      function pauseVideo() {
        if (player) {
          player.pause();
          debug('pause video');
        }
      }

      function stopVideo() {
        if (player) {
          player.pause();
          player.currentTime(0);
          debug('stop video');
        }
      }

      function showCloseButton() {
        TweenMax.fromTo($closeButton, settings.duration / 2, {
          css: {
            display: 'block',
            alpha: 0
          }
        },{
          alpha: 1,
          ease: settings.easing.easeOut
        });
        debug('show close button');
      }

      function hideCloseButton() {
        TweenMax.to($closeButton, settings.duration / 2, {
          alpha: 0,
          ease: settings.easing.easeInOut,
          onComplete: function(){
            TweenMax.set($closeButton, {
              css: {
                display: 'none'
              }
            });
          }
        });
        debug('hide close button');
      }

      var hide = function() {
        if (!animated) {
          animated = true;

          settings.onBeforeHide.call();
          debug('onBeforeHide callback launched');

          pauseVideo();
          hideCloseButton();

          TweenMax.to($video, settings.duration / 2, {
            alpha: 0,
            onComplete: function() {
              TweenMax.set($video, {
                css:{
                  display: !Modernizr.touch ? 'none' : 'block',
                  visibility: !Modernizr.touch ? 'visible' : 'hidden'
                }
              });
            }
          });

          TweenMax.fromTo($container, settings.duration, {
            css: {
              top: '50%',
              left: '50%',
              marginLeft: -$window.width() / 2,
              marginTop: -$window.height() / 2
            },
          },{
            css: {
              width: originalWidth,
              height: originalHeight,
              marginLeft: -originalWidth / 2,
              marginTop: -originalHeight / 2
            },
            ease: settings.easing.easeInOut,
            onComplete: function(){
              $container.removeAttr('style');

              TweenMax.to($wrapper, settings.duration / 2, {
                alpha: 1,
                ease: settings.easing.easeInOut
              });
              debug('show video-popup wrapper');
            }
          });
          debug('reduce video-popup container to original size');



          TweenMax.to($overlay, settings.duration, {
            alpha: 0,
            ease: Power2.easeInOut,
            onComplete: function(){

              TweenMax.set($overlay, {
                css:{
                  display: !Modernizr.touch ? 'none' : 'block',
                  visibility: !Modernizr.touch ? 'visible' : 'hidden'
                }
              });

              stopVideo();
              settings.onAfterHide.call();
              animated = false;
              debug('onAfterHide callback launched');
            }
          });
          debug('hide video-popup overlay');
        }
      };

      var show = function() {
        if (!animated) {
          animated = true;
          originalWidth = $container.outerWidth();
          originalHeight = $container.outerHeight();

          settings.onBeforeShow.call();
          debug('onBeforeShow callback launched');

          TweenMax.to($wrapper, settings.duration / 2, {
            alpha: 0
          });
          debug('hide video-popup wrapper');

          TweenMax.fromTo($container, settings.duration, {
            position: 'fixed',
            zIndex: 9999999,
            scale: 0
            // css: {
            //   transform: 'scale(0)',
            //   position: 'fixed',
            //   top: "1%"
            // }
          },{
            css: {
                transform: 'scale(1)',
              width: '100%',
              height: '100%',
              top: '0',
              left: 0,
              marginLeft: 0,
              marginTop: 0
            },
            ease: settings.easing.easeInOut,
            onComplete: function() {
              TweenMax.set($container, {
                css: {
                  top: 0,
                  left: 0,
                  marginLeft: 0,
                  marginTop: 0
                }
              });
            }
          });
          debug('set window size to video-popup container');

          TweenMax.fromTo($overlay, settings.duration, {
            css: {
              display: 'block',
              visibility: 'visible',
              alpha: 0
            }
          },{
            alpha: 1,
            ease: settings.easeInOut,
            onComplete: function(){
              playVideo();
              showCloseButton();
              animated = false;

              TweenMax.fromTo($video, settings.duration / 2, {
                css: {
                  display: 'block',
                  visibility: 'visible',
                  alpha: 0
                }
              }, {
                alpha: 1
              });

              settings.onAfterShow.call();
              debug('onAfterShow callback launched');
            }
          });
          debug('show video-popup overlay');
        }
      };

      function init() {

        videojs($container.find('video')[0]).ready(function(){
          player = this;

          $video = $container.find('.video-js');

          $playButton.on('click', function(e){
            e.preventDefault();
            debug('play button clicked');
            show();
          });

          if (Modernizr.touch) {
            $playButton.one('click', function(e){
              e.preventDefault();
              playVideo();
              debug('force play video on first click (only for mobile)');
            });
          }

          $closeButton.on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            debug('close button clicked');
            hide();
          });

          debug('plugin initialized');
        });
      }

      init();

      return {
        target: this
      };

    });
  };

})($, Modernizr, TweenMax, videojs);
;/**
 * nlform.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
( function( window ) {

    'use strict';

    var document = window.document;

    if (!String.prototype.trim) {
        String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
    }

    function NLForm( el ) {
        this.el = el;
        this.overlay = this.el.querySelector( '.nl-overlay' );
        this.fields = [];
        this.fldOpen = -1;
        this._init();
    }

    NLForm.prototype = {
        _init : function() {
            var self = this;
            Array.prototype.slice.call( this.el.querySelectorAll( 'select' ) ).forEach( function( el, i ) {
                self.fldOpen++;
                self.fields.push( new NLField( self, el, 'dropdown', self.fldOpen ) );
            } );
            Array.prototype.slice.call( this.el.querySelectorAll( 'input' ) ).forEach( function( el, i ) {
                self.fldOpen++;
                self.fields.push( new NLField( self, el, 'input', self.fldOpen ) );
            } );
            this.overlay.addEventListener( 'click', function(ev) { self._closeFlds(); } );
            this.overlay.addEventListener( 'touchstart', function(ev) { self._closeFlds(); } );
        },
        _closeFlds : function() {
            if( this.fldOpen !== -1 ) {
                this.fields[ this.fldOpen ].close();
            }
        }
    };

    function NLField( form, el, type, idx ) {
        this.form = form;
        this.elOriginal = el;
        this.pos = idx;
        this.type = type;
        this._create();
        this._initEvents();
    }

    NLField.prototype = {
        _create : function() {
            if( this.type === 'dropdown' ) {
                this._createDropDown();
            }
            else if( this.type === 'input' ) {
                this._createInput();
            }
        },
        _createDropDown : function() {
            var self = this;
            this.fld = document.createElement( 'div' );
            this.fld.className = 'nl-field nl-dd';
            this.toggle = document.createElement( 'a' );
            this.toggle.innerHTML = this.elOriginal.options[ this.elOriginal.selectedIndex ].innerHTML;
            this.toggle.className = 'nl-field-toggle';
            this.optionsList = document.createElement( 'ul' );
            var ihtml = '';
            Array.prototype.slice.call( this.elOriginal.querySelectorAll( 'option' ) ).forEach( function( el, i ) {
                ihtml += self.elOriginal.selectedIndex === i ? '<li class="nl-dd-checked">' + el.innerHTML + '</li>' : '<li>' + el.innerHTML + '</li>';
                // selected index value
                if( self.elOriginal.selectedIndex === i ) {
                    self.selectedIdx = i;
                }
            } );
            this.optionsList.innerHTML = ihtml;
            this.fld.appendChild( this.toggle );
            this.fld.appendChild( this.optionsList );
            this.elOriginal.parentNode.insertBefore( this.fld, this.elOriginal );
            this.elOriginal.style.display = 'none';
        },
        _createInput : function() {
            var self = this;
            this.fld = document.createElement( 'div' );
            this.fld.className = 'nl-field nl-ti-text';
            this.toggle = document.createElement( 'a' );
            this.toggle.innerHTML = this.elOriginal.getAttribute( 'placeholder' );
            this.toggle.className = 'nl-field-toggle';
            this.optionsList = document.createElement( 'ul' );
            this.getinput = document.createElement( 'input' );
            this.getinput.setAttribute( 'type', 'text' );
            this.getinput.setAttribute( 'placeholder', this.elOriginal.getAttribute( 'placeholder' ) );
            this.getinputWrapper = document.createElement( 'li' );
            this.getinputWrapper.className = 'nl-ti-input';
            this.inputsubmit = document.createElement( 'button' );
            this.inputsubmit.className = 'nl-field-go';
            this.inputsubmit.innerHTML = 'Go';
            this.getinputWrapper.appendChild( this.getinput );
            this.getinputWrapper.appendChild( this.inputsubmit );
            this.example = document.createElement( 'li' );
            this.example.className = 'nl-ti-example';
            this.example.innerHTML = this.elOriginal.getAttribute( 'data-subline' );
            this.optionsList.appendChild( this.getinputWrapper );
            this.optionsList.appendChild( this.example );
            this.fld.appendChild( this.toggle );
            this.fld.appendChild( this.optionsList );
            this.elOriginal.parentNode.insertBefore( this.fld, this.elOriginal );
            this.elOriginal.style.display = 'none';
        },
        _initEvents : function() {
            var self = this;
            this.toggle.addEventListener( 'click', function( ev ) { ev.preventDefault(); ev.stopPropagation(); self._open(); } );
            this.toggle.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); ev.stopPropagation(); self._open(); } );

            if( this.type === 'dropdown' ) {
                var opts = Array.prototype.slice.call( this.optionsList.querySelectorAll( 'li' ) );
                opts.forEach( function( el, i ) {
                    el.addEventListener( 'click', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ) ); } );
                    //el.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ) ); } );
                } );
            }
            else if( this.type === 'input' ) {
                this.getinput.addEventListener( 'keydown', function( ev ) {
                    if ( ev.keyCode == 13 ) {
                        self.close();
                    }
                } );
                this.inputsubmit.addEventListener( 'click', function( ev ) { ev.preventDefault(); self.close(); } );
                this.inputsubmit.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); self.close(); } );
            }

        },
        _open : function() {
            if( this.open ) {
                return false;
            }
            this.open = true;
            this.form.fldOpen = this.pos;
            var self = this;
            this.fld.className += ' nl-field-open';
      if (this.getinput !== undefined) {
        this.getinput.focus();
      }
        },
        close : function( opt, idx ) {
            if( !this.open ) {
                return false;
            }
            this.open = false;
            this.form.fldOpen = -1;
            this.fld.className = this.fld.className.replace(/\b nl-field-open\b/,'');

            if( this.type === 'dropdown' ) {
                if( opt ) {
                    // remove class nl-dd-checked from previous option
                    var selectedopt = this.optionsList.children[ this.selectedIdx ];
                    selectedopt.className = '';
                    opt.className = 'nl-dd-checked';
                    this.toggle.innerHTML = opt.innerHTML;
                    // update selected index value
                    this.selectedIdx = idx;
                    // update original select elementÂ´s value
                    this.elOriginal.value = this.elOriginal.children[ this.selectedIdx ].value;
                }
            }
            else if( this.type === 'input' ) {
                this.getinput.blur();
                this.toggle.innerHTML = this.getinput.value.trim() !== '' ? this.getinput.value : this.getinput.getAttribute( 'placeholder' );
                this.elOriginal.value = this.getinput.value;
            }
        }
    };

    // add to global namespace
    window.NLForm = NLForm;

} )( window );
;(function($, Modernizr, NLForm) {

  'use strict';

  $.fn.nlform = function(options) {

    var pluginName = 'jquery.nlform';

    var settings = $.extend({
      debug: false,
      successCheck: '1'
    }, options);

    var
      $container = $(this),
      $inputs = null,
      $button = null,
      $messages = null
    ;

    function debug(message) {
      if (window.console && window.console.log && settings.debug) {
        window.console.log(pluginName + ': ' + message);
      }
    }

    function exception(message) {
      throw pluginName + ': ' + message;
    }

    function validate() {
      var invalid = [];

      function isEmpty($input) {
        return $input.val().length === 0;
      }

      function isEmail($input) {
        return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/).test($input.val());
      }

      $inputs.each(function(){
        if ($(this).is('input[type="text"]') || $(this).is('textarea') || $(this).is('select')) {
          if (isEmpty($(this))) {
            invalid.push($(this));
          }
        } else if ($(this).is('input[type="email"]')) {
          if (!isEmail($(this))) {
            invalid.push($(this));
          }
        }
      });

      return $(invalid);
    }

    function hideMessages() {
      $messages
        .stop()
        .fadeOut();

      debug('hide messages');
    }

    function showMessage(type) {
      hideMessages();

      $messages
        .filter('.' + type)
        .stop()
        .fadeIn();

      debug('show ' + type + ' message');
    }

    function removeErrorClass() {
      $container
        .find('.nl-field')
        .removeClass('nl-field-error');
    }

    function restoreButton() {
      $button
        .text($button.data('text'))
        .removeAttr('disabled')
        .show();
    }

    var reset = function() {
      hideMessages();
      removeErrorClass();
      restoreButton();
    };

    function init() {
      new NLForm($container[0]);
      $inputs = $container.find('input[name], select[name], textarea[name]');
      $button = $container.find('button[type="submit"]');
      $messages = $container.find('p.error, p.success');

      $button.data('text', $button.text());

      $container.on('submit', function(e){
        e.preventDefault();

        var $invalidElements = validate();

        if ($invalidElements.length > 0) {
          removeErrorClass();

          $invalidElements.each(function(){
            $(this).prev('.nl-field').addClass('nl-field-error');
          });

          showMessage('error');

        } else {
          removeErrorClass();
          hideMessages();

          $button
            .text($button.data('send-text'))
            .addClass('send')
            .attr('disabled', 'disabled');

          $.ajax({
            url: $container.attr('action'),
            method: 'POST',
            data: $container.serialize(),
            success: function(success) {
              if (success === settings.successCheck) {
                showMessage('success');
                $button.hide();
              } else {
                showMessage('error');
                restoreButton();
              }
            }
          });
        }
      });

      debug('initialize');
    }

    init();

    return {
      target: this,
      reset: reset
    };
  };

})($, Modernizr, NLForm);