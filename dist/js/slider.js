(function($, anim) {
  'use strict';

  let _defaults = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };

  /**
   * @class
   *
   */
  class Slider extends Component {
    /**
     * Construct Slider instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Slider, el, options);

      this.el.M_Slider = this;

      /**
       * Options for the modal
       * @member Slider#options
       * @prop {Boolean} [indicators=true] - Show indicators
       * @prop {Number} [height=400] - height of slider
       * @prop {Number} [duration=500] - Length in ms of slide transition
       * @prop {Number} [interval=6000] - Length in ms of slide interval
       */
      this.options = $.extend({}, Slider.defaults, options);

      // setup
      this.$slider = this.$el.find('.slides');
      this.$slides = this.$slider.children('li');
      this.activeIndex = this.$slides
        .filter(function(item) {
          return $(item).hasClass('active');
        })
        .first()
        .index();
      if (this.activeIndex != -1) {
        this.$active = this.$slides.eq(this.activeIndex);
      }

      this._setSliderHeight();

      // Set initial positions of captions
      this.$slides.find('.caption').each((el) => {
        this._animateCaptionIn(el, 0);
      });

      // Move img src into background-image
      this.$slides.find('img').each((el) => {
        let placeholderBase64 =
          'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if ($(el).attr('src') !== placeholderBase64) {
          $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
          $(el).attr('src', placeholderBase64);
        }
      });

      this._setupIndicators();

      // Show active slide
      if (this.$active) {
        this.$active.css('display', 'block');
      } else {
        this.$slides.first().addClass('active');
        anim({
          targets: this.$slides.first()[0],
          opacity: 1,
          duration: this.options.duration,
          easing: 'easeOutQuad'
        });

        this.activeIndex = 0;
        this.$active = this.$slides.eq(this.activeIndex);

        // Update indicators
        if (this.options.indicators) {
          this.$indicators.eq(this.activeIndex).addClass('active');
        }
      }

      // Adjust height to current slide
      this.$active.find('img').each((el) => {
        anim({
          targets: this.$active.find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: this.options.duration,
          easing: 'easeOutQuad'
        });
      });

      this._setupEventHandlers();

      // auto scroll
      this.start();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Slider;
    }

    /**
     * Teardown component
     */
    destroy() {
      this.pause();
      this._removeIndicators();
      this._removeEventHandlers();
      this.el.M_Slider = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleIntervalBound = this._handleInterval.bind(this);
      this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

      if (this.options.indicators) {
        this.$indicators.each((el) => {
          el.addEventListener('click', this._handleIndicatorClickBound);
        });
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (this.options.indicators) {
        this.$indicators.each((el) => {
          el.removeEventListener('click', this._handleIndicatorClickBound);
        });
      }
    }

    /**
     * Handle indicator click
     * @param {Event} e
     */
    _handleIndicatorClick(e) {
      let currIndex = $(e.target).index();
      this.set(currIndex);
    }

    /**
     * Handle Interval
     */
    _handleInterval() {
      let newActiveIndex = this.$slider.find('.active').index();
      if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0;
      // loop to start
      else newActiveIndex += 1;

      this.set(newActiveIndex);
    }

    /**
     * Animate in caption
     * @param {Element} caption
     * @param {Number} duration
     */
    _animateCaptionIn(caption, duration) {
      let animOptions = {
        targets: caption,
        opacity: 0,
        duration: duration,
        easing: 'easeOutQuad'
      };

      if ($(caption).hasClass('center-align')) {
        animOptions.translateY = -100;
      } else if ($(caption).hasClass('right-align')) {
        animOptions.translateX = 100;
      } else if ($(caption).hasClass('left-align')) {
        animOptions.translateX = -100;
      }

      anim(animOptions);
    }

    /**
     * Set height of slider
     */
    _setSliderHeight() {
      // If fullscreen, do nothing
      if (!this.$el.hasClass('fullscreen')) {
        if (this.options.indicators) {
          // Add height if indicators are present
          this.$el.css('height', this.options.height + 40 + 'px');
        } else {
          this.$el.css('height', this.options.height + 'px');
        }
        this.$slider.css('height', this.options.height + 'px');
      }
    }

    /**
     * Setup indicators
     */
    _setupIndicators() {
      if (this.options.indicators) {
        this.$indicators = $('<ul class="indicators"></ul>');
        this.$slides.each((el, index) => {
          let $indicator = $('<li class="indicator-item"></li>');
          this.$indicators.append($indicator[0]);
        });
        this.$el.append(this.$indicators[0]);
        this.$indicators = this.$indicators.children('li.indicator-item');
      }
    }

    /**
     * Remove indicators
     */
    _removeIndicators() {
      this.$el.find('ul.indicators').remove();
    }

    /**
     * Cycle to nth item
     * @param {Number} index
     */
    set(index) {
      // Wrap around indices.
      if (index >= this.$slides.length) index = 0;
      else if (index < 0) index = this.$slides.length - 1;

      // Only do if index changes
      if (this.activeIndex != index) {
        this.$active = this.$slides.eq(this.activeIndex);
        let $caption = this.$active.find('.caption');
        this.$active.removeClass('active');

        anim({
          targets: this.$active[0],
          opacity: 0,
          duration: this.options.duration,
          easing: 'easeOutQuad',
          complete: () => {
            this.$slides.not('.active').each((el) => {
              anim({
                targets: el,
                opacity: 0,
                translateX: 0,
                translateY: 0,
                duration: 0,
                easing: 'easeOutQuad'
              });
            });
          }
        });

        this._animateCaptionIn($caption[0], this.options.duration);

        // Update indicators
        if (this.options.indicators) {
          this.$indicators.eq(this.activeIndex).removeClass('active');
          this.$indicators.eq(index).addClass('active');
        }

        anim({
          targets: this.$slides.eq(index)[0],
          opacity: 1,
          duration: this.options.duration,
          easing: 'easeOutQuad'
        });

        anim({
          targets: this.$slides.eq(index).find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: this.options.duration,
          delay: this.options.duration,
          easing: 'easeOutQuad'
        });

        this.$slides.eq(index).addClass('active');
        this.activeIndex = index;

        // Reset interval
        this.start();
      }
    }

    /**
     * Pause slider interval
     */
    pause() {
      clearInterval(this.interval);
    }

    /**
     * Start slider interval
     */
    start() {
      clearInterval(this.interval);
      this.interval = setInterval(
        this._handleIntervalBound,
        this.options.duration + this.options.interval
      );
    }

    /**
     * Move to next slide
     */
    next() {
      let newIndex = this.activeIndex + 1;

      // Wrap around indices.
      if (newIndex >= this.$slides.length) newIndex = 0;
      else if (newIndex < 0) newIndex = this.$slides.length - 1;

      this.set(newIndex);
    }

    /**
     * Move to previous slide
     */
    prev() {
      let newIndex = this.activeIndex - 1;

      // Wrap around indices.
      if (newIndex >= this.$slides.length) newIndex = 0;
      else if (newIndex < 0) newIndex = this.$slides.length - 1;

      this.set(newIndex);
    }
  }

  M.Slider = Slider;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzbGlkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBfZGVmYXVsdHMgPSB7XHJcbiAgICBpbmRpY2F0b3JzOiB0cnVlLFxyXG4gICAgaGVpZ2h0OiA0MDAsXHJcbiAgICBkdXJhdGlvbjogNTAwLFxyXG4gICAgaW50ZXJ2YWw6IDYwMDBcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIFNsaWRlciBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBTbGlkZXIgaW5zdGFuY2UgYW5kIHNldCB1cCBvdmVybGF5XHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKFNsaWRlciwgZWwsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5NX1NsaWRlciA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIG1vZGFsXHJcbiAgICAgICAqIEBtZW1iZXIgU2xpZGVyI29wdGlvbnNcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtpbmRpY2F0b3JzPXRydWVdIC0gU2hvdyBpbmRpY2F0b3JzXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtoZWlnaHQ9NDAwXSAtIGhlaWdodCBvZiBzbGlkZXJcclxuICAgICAgICogQHByb3Age051bWJlcn0gW2R1cmF0aW9uPTUwMF0gLSBMZW5ndGggaW4gbXMgb2Ygc2xpZGUgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbaW50ZXJ2YWw9NjAwMF0gLSBMZW5ndGggaW4gbXMgb2Ygc2xpZGUgaW50ZXJ2YWxcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTbGlkZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gc2V0dXBcclxuICAgICAgdGhpcy4kc2xpZGVyID0gdGhpcy4kZWwuZmluZCgnLnNsaWRlcycpO1xyXG4gICAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLiRzbGlkZXIuY2hpbGRyZW4oJ2xpJyk7XHJcbiAgICAgIHRoaXMuYWN0aXZlSW5kZXggPSB0aGlzLiRzbGlkZXNcclxuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgIHJldHVybiAkKGl0ZW0pLmhhc0NsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5maXJzdCgpXHJcbiAgICAgICAgLmluZGV4KCk7XHJcbiAgICAgIGlmICh0aGlzLmFjdGl2ZUluZGV4ICE9IC0xKSB7XHJcbiAgICAgICAgdGhpcy4kYWN0aXZlID0gdGhpcy4kc2xpZGVzLmVxKHRoaXMuYWN0aXZlSW5kZXgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9zZXRTbGlkZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgIC8vIFNldCBpbml0aWFsIHBvc2l0aW9ucyBvZiBjYXB0aW9uc1xyXG4gICAgICB0aGlzLiRzbGlkZXMuZmluZCgnLmNhcHRpb24nKS5lYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGVDYXB0aW9uSW4oZWwsIDApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIE1vdmUgaW1nIHNyYyBpbnRvIGJhY2tncm91bmQtaW1hZ2VcclxuICAgICAgdGhpcy4kc2xpZGVzLmZpbmQoJ2ltZycpLmVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgbGV0IHBsYWNlaG9sZGVyQmFzZTY0ID1cclxuICAgICAgICAgICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQkFQLy8vd0FBQUNINUJBRUtBQUVBTEFBQUFBQUJBQUVBQUFJQ1RBRUFPdz09JztcclxuICAgICAgICBpZiAoJChlbCkuYXR0cignc3JjJykgIT09IHBsYWNlaG9sZGVyQmFzZTY0KSB7XHJcbiAgICAgICAgICAkKGVsKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKFwiJyArICQoZWwpLmF0dHIoJ3NyYycpICsgJ1wiKScpO1xyXG4gICAgICAgICAgJChlbCkuYXR0cignc3JjJywgcGxhY2Vob2xkZXJCYXNlNjQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLl9zZXR1cEluZGljYXRvcnMoKTtcclxuXHJcbiAgICAgIC8vIFNob3cgYWN0aXZlIHNsaWRlXHJcbiAgICAgIGlmICh0aGlzLiRhY3RpdmUpIHtcclxuICAgICAgICB0aGlzLiRhY3RpdmUuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy4kc2xpZGVzLmZpcnN0KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy4kc2xpZGVzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5kdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gMDtcclxuICAgICAgICB0aGlzLiRhY3RpdmUgPSB0aGlzLiRzbGlkZXMuZXEodGhpcy5hY3RpdmVJbmRleCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBpbmRpY2F0b3JzXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmVxKHRoaXMuYWN0aXZlSW5kZXgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkanVzdCBoZWlnaHQgdG8gY3VycmVudCBzbGlkZVxyXG4gICAgICB0aGlzLiRhY3RpdmUuZmluZCgnaW1nJykuZWFjaCgoZWwpID0+IHtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IHRoaXMuJGFjdGl2ZS5maW5kKCcuY2FwdGlvbicpWzBdLFxyXG4gICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgIHRyYW5zbGF0ZVg6IDAsXHJcbiAgICAgICAgICB0cmFuc2xhdGVZOiAwLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5kdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG5cclxuICAgICAgLy8gYXV0byBzY3JvbGxcclxuICAgICAgdGhpcy5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX1NsaWRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUluZGljYXRvcnMoKTtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLmVsLk1fU2xpZGVyID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlSW50ZXJ2YWxCb3VuZCA9IHRoaXMuX2hhbmRsZUludGVydmFsLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUluZGljYXRvckNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVJbmRpY2F0b3JDbGljay5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgdGhpcy4kaW5kaWNhdG9ycy5lYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVJbmRpY2F0b3JDbGlja0JvdW5kKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmluZGljYXRvcnMpIHtcclxuICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUluZGljYXRvckNsaWNrQm91bmQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgaW5kaWNhdG9yIGNsaWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVJbmRpY2F0b3JDbGljayhlKSB7XHJcbiAgICAgIGxldCBjdXJySW5kZXggPSAkKGUudGFyZ2V0KS5pbmRleCgpO1xyXG4gICAgICB0aGlzLnNldChjdXJySW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIEludGVydmFsXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVJbnRlcnZhbCgpIHtcclxuICAgICAgbGV0IG5ld0FjdGl2ZUluZGV4ID0gdGhpcy4kc2xpZGVyLmZpbmQoJy5hY3RpdmUnKS5pbmRleCgpO1xyXG4gICAgICBpZiAodGhpcy4kc2xpZGVzLmxlbmd0aCA9PT0gbmV3QWN0aXZlSW5kZXggKyAxKSBuZXdBY3RpdmVJbmRleCA9IDA7XHJcbiAgICAgIC8vIGxvb3AgdG8gc3RhcnRcclxuICAgICAgZWxzZSBuZXdBY3RpdmVJbmRleCArPSAxO1xyXG5cclxuICAgICAgdGhpcy5zZXQobmV3QWN0aXZlSW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW5pbWF0ZSBpbiBjYXB0aW9uXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGNhcHRpb25cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvblxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZUNhcHRpb25JbihjYXB0aW9uLCBkdXJhdGlvbikge1xyXG4gICAgICBsZXQgYW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgdGFyZ2V0czogY2FwdGlvbixcclxuICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmICgkKGNhcHRpb24pLmhhc0NsYXNzKCdjZW50ZXItYWxpZ24nKSkge1xyXG4gICAgICAgIGFuaW1PcHRpb25zLnRyYW5zbGF0ZVkgPSAtMTAwO1xyXG4gICAgICB9IGVsc2UgaWYgKCQoY2FwdGlvbikuaGFzQ2xhc3MoJ3JpZ2h0LWFsaWduJykpIHtcclxuICAgICAgICBhbmltT3B0aW9ucy50cmFuc2xhdGVYID0gMTAwO1xyXG4gICAgICB9IGVsc2UgaWYgKCQoY2FwdGlvbikuaGFzQ2xhc3MoJ2xlZnQtYWxpZ24nKSkge1xyXG4gICAgICAgIGFuaW1PcHRpb25zLnRyYW5zbGF0ZVggPSAtMTAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhbmltKGFuaW1PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBoZWlnaHQgb2Ygc2xpZGVyXHJcbiAgICAgKi9cclxuICAgIF9zZXRTbGlkZXJIZWlnaHQoKSB7XHJcbiAgICAgIC8vIElmIGZ1bGxzY3JlZW4sIGRvIG5vdGhpbmdcclxuICAgICAgaWYgKCF0aGlzLiRlbC5oYXNDbGFzcygnZnVsbHNjcmVlbicpKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICAvLyBBZGQgaGVpZ2h0IGlmIGluZGljYXRvcnMgYXJlIHByZXNlbnRcclxuICAgICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0JywgdGhpcy5vcHRpb25zLmhlaWdodCArIDQwICsgJ3B4Jyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0JywgdGhpcy5vcHRpb25zLmhlaWdodCArICdweCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLiRzbGlkZXIuY3NzKCdoZWlnaHQnLCB0aGlzLm9wdGlvbnMuaGVpZ2h0ICsgJ3B4Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIGluZGljYXRvcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwSW5kaWNhdG9ycygpIHtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgdGhpcy4kaW5kaWNhdG9ycyA9ICQoJzx1bCBjbGFzcz1cImluZGljYXRvcnNcIj48L3VsPicpO1xyXG4gICAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKChlbCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGxldCAkaW5kaWNhdG9yID0gJCgnPGxpIGNsYXNzPVwiaW5kaWNhdG9yLWl0ZW1cIj48L2xpPicpO1xyXG4gICAgICAgICAgdGhpcy4kaW5kaWNhdG9ycy5hcHBlbmQoJGluZGljYXRvclswXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kKHRoaXMuJGluZGljYXRvcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuJGluZGljYXRvcnMgPSB0aGlzLiRpbmRpY2F0b3JzLmNoaWxkcmVuKCdsaS5pbmRpY2F0b3ItaXRlbScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgaW5kaWNhdG9yc1xyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlSW5kaWNhdG9ycygpIHtcclxuICAgICAgdGhpcy4kZWwuZmluZCgndWwuaW5kaWNhdG9ycycpLnJlbW92ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3ljbGUgdG8gbnRoIGl0ZW1cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxyXG4gICAgICovXHJcbiAgICBzZXQoaW5kZXgpIHtcclxuICAgICAgLy8gV3JhcCBhcm91bmQgaW5kaWNlcy5cclxuICAgICAgaWYgKGluZGV4ID49IHRoaXMuJHNsaWRlcy5sZW5ndGgpIGluZGV4ID0gMDtcclxuICAgICAgZWxzZSBpZiAoaW5kZXggPCAwKSBpbmRleCA9IHRoaXMuJHNsaWRlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgLy8gT25seSBkbyBpZiBpbmRleCBjaGFuZ2VzXHJcbiAgICAgIGlmICh0aGlzLmFjdGl2ZUluZGV4ICE9IGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy4kYWN0aXZlID0gdGhpcy4kc2xpZGVzLmVxKHRoaXMuYWN0aXZlSW5kZXgpO1xyXG4gICAgICAgIGxldCAkY2FwdGlvbiA9IHRoaXMuJGFjdGl2ZS5maW5kKCcuY2FwdGlvbicpO1xyXG4gICAgICAgIHRoaXMuJGFjdGl2ZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy4kYWN0aXZlWzBdLFxyXG4gICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuZHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICBjb21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMubm90KCcuYWN0aXZlJykuZWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgICAgIHRhcmdldHM6IGVsLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IDAsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAwLFxyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDAsXHJcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FuaW1hdGVDYXB0aW9uSW4oJGNhcHRpb25bMF0sIHRoaXMub3B0aW9ucy5kdXJhdGlvbik7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBpbmRpY2F0b3JzXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmVxKHRoaXMuYWN0aXZlSW5kZXgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgIHRoaXMuJGluZGljYXRvcnMuZXEoaW5kZXgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy4kc2xpZGVzLmVxKGluZGV4KVswXSxcclxuICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy4kc2xpZGVzLmVxKGluZGV4KS5maW5kKCcuY2FwdGlvbicpWzBdLFxyXG4gICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgIHRyYW5zbGF0ZVg6IDAsXHJcbiAgICAgICAgICB0cmFuc2xhdGVZOiAwLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5kdXJhdGlvbixcclxuICAgICAgICAgIGRlbGF5OiB0aGlzLm9wdGlvbnMuZHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2xpZGVzLmVxKGluZGV4KS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVJbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICAvLyBSZXNldCBpbnRlcnZhbFxyXG4gICAgICAgIHRoaXMuc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGF1c2Ugc2xpZGVyIGludGVydmFsXHJcbiAgICAgKi9cclxuICAgIHBhdXNlKCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgc2xpZGVyIGludGVydmFsXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoXHJcbiAgICAgICAgdGhpcy5faGFuZGxlSW50ZXJ2YWxCb3VuZCxcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZHVyYXRpb24gKyB0aGlzLm9wdGlvbnMuaW50ZXJ2YWxcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmUgdG8gbmV4dCBzbGlkZVxyXG4gICAgICovXHJcbiAgICBuZXh0KCkge1xyXG4gICAgICBsZXQgbmV3SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4ICsgMTtcclxuXHJcbiAgICAgIC8vIFdyYXAgYXJvdW5kIGluZGljZXMuXHJcbiAgICAgIGlmIChuZXdJbmRleCA+PSB0aGlzLiRzbGlkZXMubGVuZ3RoKSBuZXdJbmRleCA9IDA7XHJcbiAgICAgIGVsc2UgaWYgKG5ld0luZGV4IDwgMCkgbmV3SW5kZXggPSB0aGlzLiRzbGlkZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgIHRoaXMuc2V0KG5ld0luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmUgdG8gcHJldmlvdXMgc2xpZGVcclxuICAgICAqL1xyXG4gICAgcHJldigpIHtcclxuICAgICAgbGV0IG5ld0luZGV4ID0gdGhpcy5hY3RpdmVJbmRleCAtIDE7XHJcblxyXG4gICAgICAvLyBXcmFwIGFyb3VuZCBpbmRpY2VzLlxyXG4gICAgICBpZiAobmV3SW5kZXggPj0gdGhpcy4kc2xpZGVzLmxlbmd0aCkgbmV3SW5kZXggPSAwO1xyXG4gICAgICBlbHNlIGlmIChuZXdJbmRleCA8IDApIG5ld0luZGV4ID0gdGhpcy4kc2xpZGVzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICB0aGlzLnNldChuZXdJbmRleCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNLlNsaWRlciA9IFNsaWRlcjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFNsaWRlciwgJ3NsaWRlcicsICdNX1NsaWRlcicpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbiJdLCJmaWxlIjoic2xpZGVyLmpzIn0=
