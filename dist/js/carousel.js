(function($) {
  'use strict';

  let _defaults = {
    duration: 200, // ms
    dist: -100, // zoom scale TODO: make this more intuitive as an option
    shift: 0, // spacing for center image
    padding: 0, // Padding between non center items
    numVisible: 5, // Number of visible items in carousel
    fullWidth: false, // Change to full width styles
    indicators: false, // Toggle indicators
    noWrap: false, // Don't wrap around and cycle through items.
    onCycleTo: null // Callback for when a new slide is cycled to.
  };

  /**
   * @class
   *
   */
  class Carousel extends Component {
    /**
     * Construct Carousel instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Carousel, el, options);

      this.el.M_Carousel = this;

      /**
       * Options for the carousel
       * @member Carousel#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {Number} shift
       * @prop {Number} padding
       * @prop {Number} numVisible
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      this.options = $.extend({}, Carousel.defaults, options);

      // Setup
      this.hasMultipleSlides = this.$el.find('.carousel-item').length > 1;
      this.showIndicators = this.options.indicators && this.hasMultipleSlides;
      this.noWrap = this.options.noWrap || !this.hasMultipleSlides;
      this.pressed = false;
      this.dragged = false;
      this.offset = this.target = 0;
      this.images = [];
      this.itemWidth = this.$el
        .find('.carousel-item')
        .first()
        .innerWidth();
      this.itemHeight = this.$el
        .find('.carousel-item')
        .first()
        .innerHeight();
      this.dim = this.itemWidth * 2 + this.options.padding || 1; // Make sure dim is non zero for divisions.
      this._autoScrollBound = this._autoScroll.bind(this);
      this._trackBound = this._track.bind(this);

      // Full Width carousel setup
      if (this.options.fullWidth) {
        this.options.dist = 0;
        this._setCarouselHeight();

        // Offset fixed items when indicators.
        if (this.showIndicators) {
          this.$el.find('.carousel-fixed-item').addClass('with-indicators');
        }
      }

      // Iterate through slides
      this.$indicators = $('<ul class="indicators"></ul>');
      this.$el.find('.carousel-item').each((el, i) => {
        this.images.push(el);
        if (this.showIndicators) {
          let $indicator = $('<li class="indicator-item"></li>');

          // Add active to first by default.
          if (i === 0) {
            $indicator[0].classList.add('active');
          }

          this.$indicators.append($indicator);
        }
      });
      if (this.showIndicators) {
        this.$el.append(this.$indicators);
      }
      this.count = this.images.length;

      // Cap numVisible at count
      this.options.numVisible = Math.min(this.count, this.options.numVisible);

      // Setup cross browser string
      this.xform = 'transform';
      ['webkit', 'Moz', 'O', 'ms'].every((prefix) => {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
          this.xform = e;
          return false;
        }
        return true;
      });

      this._setupEventHandlers();
      this._scroll(this.offset);
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
      return domElem.M_Carousel;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Carousel = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
      this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
      this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
      this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

      if (typeof window.ontouchstart !== 'undefined') {
        this.el.addEventListener('touchstart', this._handleCarouselTapBound);
        this.el.addEventListener('touchmove', this._handleCarouselDragBound);
        this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
      }

      this.el.addEventListener('mousedown', this._handleCarouselTapBound);
      this.el.addEventListener('mousemove', this._handleCarouselDragBound);
      this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
      this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
      this.el.addEventListener('click', this._handleCarouselClickBound);

      if (this.showIndicators && this.$indicators) {
        this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
        this.$indicators.find('.indicator-item').each((el, i) => {
          el.addEventListener('click', this._handleIndicatorClickBound);
        });
      }

      // Resize
      let throttledResize = M.throttle(this._handleResize, 200);
      this._handleThrottledResizeBound = throttledResize.bind(this);

      window.addEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (typeof window.ontouchstart !== 'undefined') {
        this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
        this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
        this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
      }
      this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
      this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
      this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
      this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
      this.el.removeEventListener('click', this._handleCarouselClickBound);

      if (this.showIndicators && this.$indicators) {
        this.$indicators.find('.indicator-item').each((el, i) => {
          el.removeEventListener('click', this._handleIndicatorClickBound);
        });
      }

      window.removeEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Handle Carousel Tap
     * @param {Event} e
     */
    _handleCarouselTap(e) {
      // Fixes firefox draggable image bug
      if (e.type === 'mousedown' && $(e.target).is('img')) {
        e.preventDefault();
      }
      this.pressed = true;
      this.dragged = false;
      this.verticalDragged = false;
      this.reference = this._xpos(e);
      this.referenceY = this._ypos(e);

      this.velocity = this.amplitude = 0;
      this.frame = this.offset;
      this.timestamp = Date.now();
      clearInterval(this.ticker);
      this.ticker = setInterval(this._trackBound, 100);
    }

    /**
     * Handle Carousel Drag
     * @param {Event} e
     */
    _handleCarouselDrag(e) {
      let x, y, delta, deltaY;
      if (this.pressed) {
        x = this._xpos(e);
        y = this._ypos(e);
        delta = this.reference - x;
        deltaY = Math.abs(this.referenceY - y);
        if (deltaY < 30 && !this.verticalDragged) {
          // If vertical scrolling don't allow dragging.
          if (delta > 2 || delta < -2) {
            this.dragged = true;
            this.reference = x;
            this._scroll(this.offset + delta);
          }
        } else if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;
        } else {
          // Vertical scrolling.
          this.verticalDragged = true;
        }
      }

      if (this.dragged) {
        // If dragging don't allow vertical scroll.
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    /**
     * Handle Carousel Release
     * @param {Event} e
     */
    _handleCarouselRelease(e) {
      if (this.pressed) {
        this.pressed = false;
      } else {
        return;
      }

      clearInterval(this.ticker);
      this.target = this.offset;
      if (this.velocity > 10 || this.velocity < -10) {
        this.amplitude = 0.9 * this.velocity;
        this.target = this.offset + this.amplitude;
      }
      this.target = Math.round(this.target / this.dim) * this.dim;

      // No wrap of items.
      if (this.noWrap) {
        if (this.target >= this.dim * (this.count - 1)) {
          this.target = this.dim * (this.count - 1);
        } else if (this.target < 0) {
          this.target = 0;
        }
      }
      this.amplitude = this.target - this.offset;
      this.timestamp = Date.now();
      requestAnimationFrame(this._autoScrollBound);

      if (this.dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
      return false;
    }

    /**
     * Handle Carousel CLick
     * @param {Event} e
     */
    _handleCarouselClick(e) {
      // Disable clicks if carousel was dragged.
      if (this.dragged) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      } else if (!this.options.fullWidth) {
        let clickedIndex = $(e.target)
          .closest('.carousel-item')
          .index();
        let diff = this._wrap(this.center) - clickedIndex;

        // Disable clicks if carousel was shifted by click
        if (diff !== 0) {
          e.preventDefault();
          e.stopPropagation();
        }
        this._cycleTo(clickedIndex);
      }
    }

    /**
     * Handle Indicator CLick
     * @param {Event} e
     */
    _handleIndicatorClick(e) {
      e.stopPropagation();

      let indicator = $(e.target).closest('.indicator-item');
      if (indicator.length) {
        this._cycleTo(indicator.index());
      }
    }

    /**
     * Handle Throttle Resize
     * @param {Event} e
     */
    _handleResize(e) {
      if (this.options.fullWidth) {
        this.itemWidth = this.$el
          .find('.carousel-item')
          .first()
          .innerWidth();
        this.imageHeight = this.$el.find('.carousel-item.active').height();
        this.dim = this.itemWidth * 2 + this.options.padding;
        this.offset = this.center * 2 * this.itemWidth;
        this.target = this.offset;
        this._setCarouselHeight(true);
      } else {
        this._scroll();
      }
    }

    /**
     * Set carousel height based on first slide
     * @param {Booleam} imageOnly - true for image slides
     */
    _setCarouselHeight(imageOnly) {
      let firstSlide = this.$el.find('.carousel-item.active').length
        ? this.$el.find('.carousel-item.active').first()
        : this.$el.find('.carousel-item').first();
      let firstImage = firstSlide.find('img').first();
      if (firstImage.length) {
        if (firstImage[0].complete) {
          // If image won't trigger the load event
          let imageHeight = firstImage.height();
          if (imageHeight > 0) {
            this.$el.css('height', imageHeight + 'px');
          } else {
            // If image still has no height, use the natural dimensions to calculate
            let naturalWidth = firstImage[0].naturalWidth;
            let naturalHeight = firstImage[0].naturalHeight;
            let adjustedHeight = this.$el.width() / naturalWidth * naturalHeight;
            this.$el.css('height', adjustedHeight + 'px');
          }
        } else {
          // Get height when image is loaded normally
          firstImage.one('load', (el, i) => {
            this.$el.css('height', el.offsetHeight + 'px');
          });
        }
      } else if (!imageOnly) {
        let slideHeight = firstSlide.height();
        this.$el.css('height', slideHeight + 'px');
      }
    }

    /**
     * Get x position from event
     * @param {Event} e
     */
    _xpos(e) {
      // touch event
      if (e.targetTouches && e.targetTouches.length >= 1) {
        return e.targetTouches[0].clientX;
      }

      // mouse event
      return e.clientX;
    }

    /**
     * Get y position from event
     * @param {Event} e
     */
    _ypos(e) {
      // touch event
      if (e.targetTouches && e.targetTouches.length >= 1) {
        return e.targetTouches[0].clientY;
      }

      // mouse event
      return e.clientY;
    }

    /**
     * Wrap index
     * @param {Number} x
     */
    _wrap(x) {
      return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + x % this.count) : x;
    }

    /**
     * Tracks scrolling information
     */
    _track() {
      let now, elapsed, delta, v;

      now = Date.now();
      elapsed = now - this.timestamp;
      this.timestamp = now;
      delta = this.offset - this.frame;
      this.frame = this.offset;

      v = 1000 * delta / (1 + elapsed);
      this.velocity = 0.8 * v + 0.2 * this.velocity;
    }

    /**
     * Auto scrolls to nearest carousel item.
     */
    _autoScroll() {
      let elapsed, delta;

      if (this.amplitude) {
        elapsed = Date.now() - this.timestamp;
        delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
        if (delta > 2 || delta < -2) {
          this._scroll(this.target - delta);
          requestAnimationFrame(this._autoScrollBound);
        } else {
          this._scroll(this.target);
        }
      }
    }

    /**
     * Scroll to target
     * @param {Number} x
     */
    _scroll(x) {
      // Track scrolling state
      if (!this.$el.hasClass('scrolling')) {
        this.el.classList.add('scrolling');
      }
      if (this.scrollingTimeout != null) {
        window.clearTimeout(this.scrollingTimeout);
      }
      this.scrollingTimeout = window.setTimeout(() => {
        this.$el.removeClass('scrolling');
      }, this.options.duration);

      // Start actual scroll
      let i,
        half,
        delta,
        dir,
        tween,
        el,
        alignment,
        zTranslation,
        tweenedOpacity,
        centerTweenedOpacity;
      let lastCenter = this.center;
      let numVisibleOffset = 1 / this.options.numVisible;

      this.offset = typeof x === 'number' ? x : this.offset;
      this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
      delta = this.offset - this.center * this.dim;
      dir = delta < 0 ? 1 : -1;
      tween = -dir * delta * 2 / this.dim;
      half = this.count >> 1;

      if (this.options.fullWidth) {
        alignment = 'translateX(0)';
        centerTweenedOpacity = 1;
      } else {
        alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
        alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
        centerTweenedOpacity = 1 - numVisibleOffset * tween;
      }

      // Set indicator active
      if (this.showIndicators) {
        let diff = this.center % this.count;
        let activeIndicator = this.$indicators.find('.indicator-item.active');
        if (activeIndicator.index() !== diff) {
          activeIndicator.removeClass('active');
          this.$indicators
            .find('.indicator-item')
            .eq(diff)[0]
            .classList.add('active');
        }
      }

      // center
      // Don't show wrapped items.
      if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
        el = this.images[this._wrap(this.center)];

        // Add active class to center item.
        if (!$(el).hasClass('active')) {
          this.$el.find('.carousel-item').removeClass('active');
          el.classList.add('active');
        }
        let transformString = `${alignment} translateX(${-delta / 2}px) translateX(${dir *
          this.options.shift *
          tween *
          i}px) translateZ(${this.options.dist * tween}px)`;
        this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
      }

      for (i = 1; i <= half; ++i) {
        // right side
        if (this.options.fullWidth) {
          zTranslation = this.options.dist;
          tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
        } else {
          zTranslation = this.options.dist * (i * 2 + tween * dir);
          tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
        }
        // Don't show wrapped items.
        if (!this.noWrap || this.center + i < this.count) {
          el = this.images[this._wrap(this.center + i)];
          let transformString = `${alignment} translateX(${this.options.shift +
            (this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
          this._updateItemStyle(el, tweenedOpacity, -i, transformString);
        }

        // left side
        if (this.options.fullWidth) {
          zTranslation = this.options.dist;
          tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
        } else {
          zTranslation = this.options.dist * (i * 2 - tween * dir);
          tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
        }
        // Don't show wrapped items.
        if (!this.noWrap || this.center - i >= 0) {
          el = this.images[this._wrap(this.center - i)];
          let transformString = `${alignment} translateX(${-this.options.shift +
            (-this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
          this._updateItemStyle(el, tweenedOpacity, -i, transformString);
        }
      }

      // center
      // Don't show wrapped items.
      if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
        el = this.images[this._wrap(this.center)];
        let transformString = `${alignment} translateX(${-delta / 2}px) translateX(${dir *
          this.options.shift *
          tween}px) translateZ(${this.options.dist * tween}px)`;
        this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
      }

      // onCycleTo callback
      let $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
      if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
        this.options.onCycleTo.call(this, $currItem[0], this.dragged);
      }

      // One time callback
      if (typeof this.oneTimeCallback === 'function') {
        this.oneTimeCallback.call(this, $currItem[0], this.dragged);
        this.oneTimeCallback = null;
      }
    }

    /**
     * Cycle to target
     * @param {Element} el
     * @param {Number} opacity
     * @param {Number} zIndex
     * @param {String} transform
     */
    _updateItemStyle(el, opacity, zIndex, transform) {
      el.style[this.xform] = transform;
      el.style.zIndex = zIndex;
      el.style.opacity = opacity;
      el.style.visibility = 'visible';
    }

    /**
     * Cycle to target
     * @param {Number} n
     * @param {Function} callback
     */
    _cycleTo(n, callback) {
      let diff = this.center % this.count - n;

      // Account for wraparound.
      if (!this.noWrap) {
        if (diff < 0) {
          if (Math.abs(diff + this.count) < Math.abs(diff)) {
            diff += this.count;
          }
        } else if (diff > 0) {
          if (Math.abs(diff - this.count) < diff) {
            diff -= this.count;
          }
        }
      }

      this.target = this.dim * Math.round(this.offset / this.dim);
      // Next
      if (diff < 0) {
        this.target += this.dim * Math.abs(diff);

        // Prev
      } else if (diff > 0) {
        this.target -= this.dim * diff;
      }

      // Set one time callback
      if (typeof callback === 'function') {
        this.oneTimeCallback = callback;
      }

      // Scroll
      if (this.offset !== this.target) {
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);
      }
    }

    /**
     * Cycle to next item
     * @param {Number} [n]
     */
    next(n) {
      if (n === undefined || isNaN(n)) {
        n = 1;
      }

      let index = this.center + n;
      if (index >= this.count || index < 0) {
        if (this.noWrap) {
          return;
        }

        index = this._wrap(index);
      }
      this._cycleTo(index);
    }

    /**
     * Cycle to previous item
     * @param {Number} [n]
     */
    prev(n) {
      if (n === undefined || isNaN(n)) {
        n = 1;
      }

      let index = this.center - n;
      if (index >= this.count || index < 0) {
        if (this.noWrap) {
          return;
        }

        index = this._wrap(index);
      }

      this._cycleTo(index);
    }

    /**
     * Cycle to nth item
     * @param {Number} [n]
     * @param {Function} callback
     */
    set(n, callback) {
      if (n === undefined || isNaN(n)) {
        n = 0;
      }

      if (n > this.count || n < 0) {
        if (this.noWrap) {
          return;
        }

        n = this._wrap(n);
      }

      this._cycleTo(n, callback);
    }
  }

  M.Carousel = Carousel;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjYXJvdXNlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIGR1cmF0aW9uOiAyMDAsIC8vIG1zXHJcbiAgICBkaXN0OiAtMTAwLCAvLyB6b29tIHNjYWxlIFRPRE86IG1ha2UgdGhpcyBtb3JlIGludHVpdGl2ZSBhcyBhbiBvcHRpb25cclxuICAgIHNoaWZ0OiAwLCAvLyBzcGFjaW5nIGZvciBjZW50ZXIgaW1hZ2VcclxuICAgIHBhZGRpbmc6IDAsIC8vIFBhZGRpbmcgYmV0d2VlbiBub24gY2VudGVyIGl0ZW1zXHJcbiAgICBudW1WaXNpYmxlOiA1LCAvLyBOdW1iZXIgb2YgdmlzaWJsZSBpdGVtcyBpbiBjYXJvdXNlbFxyXG4gICAgZnVsbFdpZHRoOiBmYWxzZSwgLy8gQ2hhbmdlIHRvIGZ1bGwgd2lkdGggc3R5bGVzXHJcbiAgICBpbmRpY2F0b3JzOiBmYWxzZSwgLy8gVG9nZ2xlIGluZGljYXRvcnNcclxuICAgIG5vV3JhcDogZmFsc2UsIC8vIERvbid0IHdyYXAgYXJvdW5kIGFuZCBjeWNsZSB0aHJvdWdoIGl0ZW1zLlxyXG4gICAgb25DeWNsZVRvOiBudWxsIC8vIENhbGxiYWNrIGZvciB3aGVuIGEgbmV3IHNsaWRlIGlzIGN5Y2xlZCB0by5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIENhcm91c2VsIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IENhcm91c2VsIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKENhcm91c2VsLCBlbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmVsLk1fQ2Fyb3VzZWwgPSB0aGlzO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBjYXJvdXNlbFxyXG4gICAgICAgKiBAbWVtYmVyIENhcm91c2VsI29wdGlvbnNcclxuICAgICAgICogQHByb3Age051bWJlcn0gZHVyYXRpb25cclxuICAgICAgICogQHByb3Age051bWJlcn0gZGlzdFxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBzaGlmdFxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBwYWRkaW5nXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IG51bVZpc2libGVcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IGZ1bGxXaWR0aFxyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gaW5kaWNhdG9yc1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gbm9XcmFwXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DeWNsZVRvXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ2Fyb3VzZWwuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gU2V0dXBcclxuICAgICAgdGhpcy5oYXNNdWx0aXBsZVNsaWRlcyA9IHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykubGVuZ3RoID4gMTtcclxuICAgICAgdGhpcy5zaG93SW5kaWNhdG9ycyA9IHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzICYmIHRoaXMuaGFzTXVsdGlwbGVTbGlkZXM7XHJcbiAgICAgIHRoaXMubm9XcmFwID0gdGhpcy5vcHRpb25zLm5vV3JhcCB8fCAhdGhpcy5oYXNNdWx0aXBsZVNsaWRlcztcclxuICAgICAgdGhpcy5wcmVzc2VkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZHJhZ2dlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9mZnNldCA9IHRoaXMudGFyZ2V0ID0gMDtcclxuICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcclxuICAgICAgdGhpcy5pdGVtV2lkdGggPSB0aGlzLiRlbFxyXG4gICAgICAgIC5maW5kKCcuY2Fyb3VzZWwtaXRlbScpXHJcbiAgICAgICAgLmZpcnN0KClcclxuICAgICAgICAuaW5uZXJXaWR0aCgpO1xyXG4gICAgICB0aGlzLml0ZW1IZWlnaHQgPSB0aGlzLiRlbFxyXG4gICAgICAgIC5maW5kKCcuY2Fyb3VzZWwtaXRlbScpXHJcbiAgICAgICAgLmZpcnN0KClcclxuICAgICAgICAuaW5uZXJIZWlnaHQoKTtcclxuICAgICAgdGhpcy5kaW0gPSB0aGlzLml0ZW1XaWR0aCAqIDIgKyB0aGlzLm9wdGlvbnMucGFkZGluZyB8fCAxOyAvLyBNYWtlIHN1cmUgZGltIGlzIG5vbiB6ZXJvIGZvciBkaXZpc2lvbnMuXHJcbiAgICAgIHRoaXMuX2F1dG9TY3JvbGxCb3VuZCA9IHRoaXMuX2F1dG9TY3JvbGwuYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5fdHJhY2tCb3VuZCA9IHRoaXMuX3RyYWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAvLyBGdWxsIFdpZHRoIGNhcm91c2VsIHNldHVwXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZnVsbFdpZHRoKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRpc3QgPSAwO1xyXG4gICAgICAgIHRoaXMuX3NldENhcm91c2VsSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIC8vIE9mZnNldCBmaXhlZCBpdGVtcyB3aGVuIGluZGljYXRvcnMuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd0luZGljYXRvcnMpIHtcclxuICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1maXhlZC1pdGVtJykuYWRkQ2xhc3MoJ3dpdGgtaW5kaWNhdG9ycycpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHNsaWRlc1xyXG4gICAgICB0aGlzLiRpbmRpY2F0b3JzID0gJCgnPHVsIGNsYXNzPVwiaW5kaWNhdG9yc1wiPjwvdWw+Jyk7XHJcbiAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykuZWFjaCgoZWwsIGkpID0+IHtcclxuICAgICAgICB0aGlzLmltYWdlcy5wdXNoKGVsKTtcclxuICAgICAgICBpZiAodGhpcy5zaG93SW5kaWNhdG9ycykge1xyXG4gICAgICAgICAgbGV0ICRpbmRpY2F0b3IgPSAkKCc8bGkgY2xhc3M9XCJpbmRpY2F0b3ItaXRlbVwiPjwvbGk+Jyk7XHJcblxyXG4gICAgICAgICAgLy8gQWRkIGFjdGl2ZSB0byBmaXJzdCBieSBkZWZhdWx0LlxyXG4gICAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgICAgJGluZGljYXRvclswXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmFwcGVuZCgkaW5kaWNhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAodGhpcy5zaG93SW5kaWNhdG9ycykge1xyXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZCh0aGlzLiRpbmRpY2F0b3JzKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmNvdW50ID0gdGhpcy5pbWFnZXMubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gQ2FwIG51bVZpc2libGUgYXQgY291bnRcclxuICAgICAgdGhpcy5vcHRpb25zLm51bVZpc2libGUgPSBNYXRoLm1pbih0aGlzLmNvdW50LCB0aGlzLm9wdGlvbnMubnVtVmlzaWJsZSk7XHJcblxyXG4gICAgICAvLyBTZXR1cCBjcm9zcyBicm93c2VyIHN0cmluZ1xyXG4gICAgICB0aGlzLnhmb3JtID0gJ3RyYW5zZm9ybSc7XHJcbiAgICAgIFsnd2Via2l0JywgJ01veicsICdPJywgJ21zJ10uZXZlcnkoKHByZWZpeCkgPT4ge1xyXG4gICAgICAgIHZhciBlID0gcHJlZml4ICsgJ1RyYW5zZm9ybSc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5ib2R5LnN0eWxlW2VdICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgdGhpcy54Zm9ybSA9IGU7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLl9zY3JvbGwodGhpcy5vZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX0Nhcm91c2VsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5lbC5NX0Nhcm91c2VsID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlQ2Fyb3VzZWxUYXBCb3VuZCA9IHRoaXMuX2hhbmRsZUNhcm91c2VsVGFwLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kID0gdGhpcy5faGFuZGxlQ2Fyb3VzZWxEcmFnLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNhcm91c2VsUmVsZWFzZUJvdW5kID0gdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNhcm91c2VsQ2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZUNhcm91c2VsQ2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbFRhcEJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZUNhcm91c2VsVGFwQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbFJlbGVhc2VCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDYXJvdXNlbENsaWNrQm91bmQpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd0luZGljYXRvcnMgJiYgdGhpcy4kaW5kaWNhdG9ycykge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUluZGljYXRvckNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVJbmRpY2F0b3JDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuJGluZGljYXRvcnMuZmluZCgnLmluZGljYXRvci1pdGVtJykuZWFjaCgoZWwsIGkpID0+IHtcclxuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5kaWNhdG9yQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlc2l6ZVxyXG4gICAgICBsZXQgdGhyb3R0bGVkUmVzaXplID0gTS50aHJvdHRsZSh0aGlzLl9oYW5kbGVSZXNpemUsIDIwMCk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kID0gdGhyb3R0bGVkUmVzaXplLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlVGhyb3R0bGVkUmVzaXplQm91bmQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxUYXBCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbERyYWdCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZUNhcm91c2VsUmVsZWFzZUJvdW5kKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZUNhcm91c2VsVGFwQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kKTtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbFJlbGVhc2VCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDYXJvdXNlbENsaWNrQm91bmQpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuc2hvd0luZGljYXRvcnMgJiYgdGhpcy4kaW5kaWNhdG9ycykge1xyXG4gICAgICAgIHRoaXMuJGluZGljYXRvcnMuZmluZCgnLmluZGljYXRvci1pdGVtJykuZWFjaCgoZWwsIGkpID0+IHtcclxuICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5kaWNhdG9yQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVUaHJvdHRsZWRSZXNpemVCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgQ2Fyb3VzZWwgVGFwXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVDYXJvdXNlbFRhcChlKSB7XHJcbiAgICAgIC8vIEZpeGVzIGZpcmVmb3ggZHJhZ2dhYmxlIGltYWdlIGJ1Z1xyXG4gICAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJyAmJiAkKGUudGFyZ2V0KS5pcygnaW1nJykpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wcmVzc2VkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kcmFnZ2VkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMudmVydGljYWxEcmFnZ2VkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucmVmZXJlbmNlID0gdGhpcy5feHBvcyhlKTtcclxuICAgICAgdGhpcy5yZWZlcmVuY2VZID0gdGhpcy5feXBvcyhlKTtcclxuXHJcbiAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLmFtcGxpdHVkZSA9IDA7XHJcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLm9mZnNldDtcclxuICAgICAgdGhpcy50aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xyXG4gICAgICBjbGVhckludGVydmFsKHRoaXMudGlja2VyKTtcclxuICAgICAgdGhpcy50aWNrZXIgPSBzZXRJbnRlcnZhbCh0aGlzLl90cmFja0JvdW5kLCAxMDApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIENhcm91c2VsIERyYWdcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUNhcm91c2VsRHJhZyhlKSB7XHJcbiAgICAgIGxldCB4LCB5LCBkZWx0YSwgZGVsdGFZO1xyXG4gICAgICBpZiAodGhpcy5wcmVzc2VkKSB7XHJcbiAgICAgICAgeCA9IHRoaXMuX3hwb3MoZSk7XHJcbiAgICAgICAgeSA9IHRoaXMuX3lwb3MoZSk7XHJcbiAgICAgICAgZGVsdGEgPSB0aGlzLnJlZmVyZW5jZSAtIHg7XHJcbiAgICAgICAgZGVsdGFZID0gTWF0aC5hYnModGhpcy5yZWZlcmVuY2VZIC0geSk7XHJcbiAgICAgICAgaWYgKGRlbHRhWSA8IDMwICYmICF0aGlzLnZlcnRpY2FsRHJhZ2dlZCkge1xyXG4gICAgICAgICAgLy8gSWYgdmVydGljYWwgc2Nyb2xsaW5nIGRvbid0IGFsbG93IGRyYWdnaW5nLlxyXG4gICAgICAgICAgaWYgKGRlbHRhID4gMiB8fCBkZWx0YSA8IC0yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlID0geDtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKHRoaXMub2Zmc2V0ICsgZGVsdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5kcmFnZ2VkKSB7XHJcbiAgICAgICAgICAvLyBJZiBkcmFnZ2luZyBkb24ndCBhbGxvdyB2ZXJ0aWNhbCBzY3JvbGwuXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBWZXJ0aWNhbCBzY3JvbGxpbmcuXHJcbiAgICAgICAgICB0aGlzLnZlcnRpY2FsRHJhZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5kcmFnZ2VkKSB7XHJcbiAgICAgICAgLy8gSWYgZHJhZ2dpbmcgZG9uJ3QgYWxsb3cgdmVydGljYWwgc2Nyb2xsLlxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIENhcm91c2VsIFJlbGVhc2VcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUNhcm91c2VsUmVsZWFzZShlKSB7XHJcbiAgICAgIGlmICh0aGlzLnByZXNzZWQpIHtcclxuICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aWNrZXIpO1xyXG4gICAgICB0aGlzLnRhcmdldCA9IHRoaXMub2Zmc2V0O1xyXG4gICAgICBpZiAodGhpcy52ZWxvY2l0eSA+IDEwIHx8IHRoaXMudmVsb2NpdHkgPCAtMTApIHtcclxuICAgICAgICB0aGlzLmFtcGxpdHVkZSA9IDAuOSAqIHRoaXMudmVsb2NpdHk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLm9mZnNldCArIHRoaXMuYW1wbGl0dWRlO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudGFyZ2V0ID0gTWF0aC5yb3VuZCh0aGlzLnRhcmdldCAvIHRoaXMuZGltKSAqIHRoaXMuZGltO1xyXG5cclxuICAgICAgLy8gTm8gd3JhcCBvZiBpdGVtcy5cclxuICAgICAgaWYgKHRoaXMubm9XcmFwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0ID49IHRoaXMuZGltICogKHRoaXMuY291bnQgLSAxKSkge1xyXG4gICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmRpbSAqICh0aGlzLmNvdW50IC0gMSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRhcmdldCA8IDApIHtcclxuICAgICAgICAgIHRoaXMudGFyZ2V0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5hbXBsaXR1ZGUgPSB0aGlzLnRhcmdldCAtIHRoaXMub2Zmc2V0O1xyXG4gICAgICB0aGlzLnRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hdXRvU2Nyb2xsQm91bmQpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuZHJhZ2dlZCkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBDYXJvdXNlbCBDTGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlQ2Fyb3VzZWxDbGljayhlKSB7XHJcbiAgICAgIC8vIERpc2FibGUgY2xpY2tzIGlmIGNhcm91c2VsIHdhcyBkcmFnZ2VkLlxyXG4gICAgICBpZiAodGhpcy5kcmFnZ2VkKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuZnVsbFdpZHRoKSB7XHJcbiAgICAgICAgbGV0IGNsaWNrZWRJbmRleCA9ICQoZS50YXJnZXQpXHJcbiAgICAgICAgICAuY2xvc2VzdCgnLmNhcm91c2VsLWl0ZW0nKVxyXG4gICAgICAgICAgLmluZGV4KCk7XHJcbiAgICAgICAgbGV0IGRpZmYgPSB0aGlzLl93cmFwKHRoaXMuY2VudGVyKSAtIGNsaWNrZWRJbmRleDtcclxuXHJcbiAgICAgICAgLy8gRGlzYWJsZSBjbGlja3MgaWYgY2Fyb3VzZWwgd2FzIHNoaWZ0ZWQgYnkgY2xpY2tcclxuICAgICAgICBpZiAoZGlmZiAhPT0gMCkge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY3ljbGVUbyhjbGlja2VkSW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgSW5kaWNhdG9yIENMaWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVJbmRpY2F0b3JDbGljayhlKSB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICBsZXQgaW5kaWNhdG9yID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmluZGljYXRvci1pdGVtJyk7XHJcbiAgICAgIGlmIChpbmRpY2F0b3IubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fY3ljbGVUbyhpbmRpY2F0b3IuaW5kZXgoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBUaHJvdHRsZSBSZXNpemVcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZVJlc2l6ZShlKSB7XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZnVsbFdpZHRoKSB7XHJcbiAgICAgICAgdGhpcy5pdGVtV2lkdGggPSB0aGlzLiRlbFxyXG4gICAgICAgICAgLmZpbmQoJy5jYXJvdXNlbC1pdGVtJylcclxuICAgICAgICAgIC5maXJzdCgpXHJcbiAgICAgICAgICAuaW5uZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VIZWlnaHQgPSB0aGlzLiRlbC5maW5kKCcuY2Fyb3VzZWwtaXRlbS5hY3RpdmUnKS5oZWlnaHQoKTtcclxuICAgICAgICB0aGlzLmRpbSA9IHRoaXMuaXRlbVdpZHRoICogMiArIHRoaXMub3B0aW9ucy5wYWRkaW5nO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gdGhpcy5jZW50ZXIgKiAyICogdGhpcy5pdGVtV2lkdGg7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLm9mZnNldDtcclxuICAgICAgICB0aGlzLl9zZXRDYXJvdXNlbEhlaWdodCh0cnVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9zY3JvbGwoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGNhcm91c2VsIGhlaWdodCBiYXNlZCBvbiBmaXJzdCBzbGlkZVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFtfSBpbWFnZU9ubHkgLSB0cnVlIGZvciBpbWFnZSBzbGlkZXNcclxuICAgICAqL1xyXG4gICAgX3NldENhcm91c2VsSGVpZ2h0KGltYWdlT25seSkge1xyXG4gICAgICBsZXQgZmlyc3RTbGlkZSA9IHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtLmFjdGl2ZScpLmxlbmd0aFxyXG4gICAgICAgID8gdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0uYWN0aXZlJykuZmlyc3QoKVxyXG4gICAgICAgIDogdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0nKS5maXJzdCgpO1xyXG4gICAgICBsZXQgZmlyc3RJbWFnZSA9IGZpcnN0U2xpZGUuZmluZCgnaW1nJykuZmlyc3QoKTtcclxuICAgICAgaWYgKGZpcnN0SW1hZ2UubGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKGZpcnN0SW1hZ2VbMF0uY29tcGxldGUpIHtcclxuICAgICAgICAgIC8vIElmIGltYWdlIHdvbid0IHRyaWdnZXIgdGhlIGxvYWQgZXZlbnRcclxuICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IGZpcnN0SW1hZ2UuaGVpZ2h0KCk7XHJcbiAgICAgICAgICBpZiAoaW1hZ2VIZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0JywgaW1hZ2VIZWlnaHQgKyAncHgnKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIElmIGltYWdlIHN0aWxsIGhhcyBubyBoZWlnaHQsIHVzZSB0aGUgbmF0dXJhbCBkaW1lbnNpb25zIHRvIGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICBsZXQgbmF0dXJhbFdpZHRoID0gZmlyc3RJbWFnZVswXS5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBuYXR1cmFsSGVpZ2h0ID0gZmlyc3RJbWFnZVswXS5uYXR1cmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICBsZXQgYWRqdXN0ZWRIZWlnaHQgPSB0aGlzLiRlbC53aWR0aCgpIC8gbmF0dXJhbFdpZHRoICogbmF0dXJhbEhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCdoZWlnaHQnLCBhZGp1c3RlZEhlaWdodCArICdweCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBHZXQgaGVpZ2h0IHdoZW4gaW1hZ2UgaXMgbG9hZGVkIG5vcm1hbGx5XHJcbiAgICAgICAgICBmaXJzdEltYWdlLm9uZSgnbG9hZCcsIChlbCwgaSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5jc3MoJ2hlaWdodCcsIGVsLm9mZnNldEhlaWdodCArICdweCcpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCFpbWFnZU9ubHkpIHtcclxuICAgICAgICBsZXQgc2xpZGVIZWlnaHQgPSBmaXJzdFNsaWRlLmhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0Jywgc2xpZGVIZWlnaHQgKyAncHgnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHggcG9zaXRpb24gZnJvbSBldmVudFxyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfeHBvcyhlKSB7XHJcbiAgICAgIC8vIHRvdWNoIGV2ZW50XHJcbiAgICAgIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA+PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtb3VzZSBldmVudFxyXG4gICAgICByZXR1cm4gZS5jbGllbnRYO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHkgcG9zaXRpb24gZnJvbSBldmVudFxyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfeXBvcyhlKSB7XHJcbiAgICAgIC8vIHRvdWNoIGV2ZW50XHJcbiAgICAgIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA+PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtb3VzZSBldmVudFxyXG4gICAgICByZXR1cm4gZS5jbGllbnRZO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV3JhcCBpbmRleFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcclxuICAgICAqL1xyXG4gICAgX3dyYXAoeCkge1xyXG4gICAgICByZXR1cm4geCA+PSB0aGlzLmNvdW50ID8geCAlIHRoaXMuY291bnQgOiB4IDwgMCA/IHRoaXMuX3dyYXAodGhpcy5jb3VudCArIHggJSB0aGlzLmNvdW50KSA6IHg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFja3Mgc2Nyb2xsaW5nIGluZm9ybWF0aW9uXHJcbiAgICAgKi9cclxuICAgIF90cmFjaygpIHtcclxuICAgICAgbGV0IG5vdywgZWxhcHNlZCwgZGVsdGEsIHY7XHJcblxyXG4gICAgICBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICBlbGFwc2VkID0gbm93IC0gdGhpcy50aW1lc3RhbXA7XHJcbiAgICAgIHRoaXMudGltZXN0YW1wID0gbm93O1xyXG4gICAgICBkZWx0YSA9IHRoaXMub2Zmc2V0IC0gdGhpcy5mcmFtZTtcclxuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAgICAgdiA9IDEwMDAgKiBkZWx0YSAvICgxICsgZWxhcHNlZCk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHkgPSAwLjggKiB2ICsgMC4yICogdGhpcy52ZWxvY2l0eTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF1dG8gc2Nyb2xscyB0byBuZWFyZXN0IGNhcm91c2VsIGl0ZW0uXHJcbiAgICAgKi9cclxuICAgIF9hdXRvU2Nyb2xsKCkge1xyXG4gICAgICBsZXQgZWxhcHNlZCwgZGVsdGE7XHJcblxyXG4gICAgICBpZiAodGhpcy5hbXBsaXR1ZGUpIHtcclxuICAgICAgICBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHRoaXMudGltZXN0YW1wO1xyXG4gICAgICAgIGRlbHRhID0gdGhpcy5hbXBsaXR1ZGUgKiBNYXRoLmV4cCgtZWxhcHNlZCAvIHRoaXMub3B0aW9ucy5kdXJhdGlvbik7XHJcbiAgICAgICAgaWYgKGRlbHRhID4gMiB8fCBkZWx0YSA8IC0yKSB7XHJcbiAgICAgICAgICB0aGlzLl9zY3JvbGwodGhpcy50YXJnZXQgLSBkZWx0YSk7XHJcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYXV0b1Njcm9sbEJvdW5kKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fc2Nyb2xsKHRoaXMudGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB0byB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XHJcbiAgICAgKi9cclxuICAgIF9zY3JvbGwoeCkge1xyXG4gICAgICAvLyBUcmFjayBzY3JvbGxpbmcgc3RhdGVcclxuICAgICAgaWYgKCF0aGlzLiRlbC5oYXNDbGFzcygnc2Nyb2xsaW5nJykpIHtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGluZycpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnNjcm9sbGluZ1RpbWVvdXQgIT0gbnVsbCkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5zY3JvbGxpbmdUaW1lb3V0KTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnNjcm9sbGluZ1RpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ3Njcm9sbGluZycpO1xyXG4gICAgICB9LCB0aGlzLm9wdGlvbnMuZHVyYXRpb24pO1xyXG5cclxuICAgICAgLy8gU3RhcnQgYWN0dWFsIHNjcm9sbFxyXG4gICAgICBsZXQgaSxcclxuICAgICAgICBoYWxmLFxyXG4gICAgICAgIGRlbHRhLFxyXG4gICAgICAgIGRpcixcclxuICAgICAgICB0d2VlbixcclxuICAgICAgICBlbCxcclxuICAgICAgICBhbGlnbm1lbnQsXHJcbiAgICAgICAgelRyYW5zbGF0aW9uLFxyXG4gICAgICAgIHR3ZWVuZWRPcGFjaXR5LFxyXG4gICAgICAgIGNlbnRlclR3ZWVuZWRPcGFjaXR5O1xyXG4gICAgICBsZXQgbGFzdENlbnRlciA9IHRoaXMuY2VudGVyO1xyXG4gICAgICBsZXQgbnVtVmlzaWJsZU9mZnNldCA9IDEgLyB0aGlzLm9wdGlvbnMubnVtVmlzaWJsZTtcclxuXHJcbiAgICAgIHRoaXMub2Zmc2V0ID0gdHlwZW9mIHggPT09ICdudW1iZXInID8geCA6IHRoaXMub2Zmc2V0O1xyXG4gICAgICB0aGlzLmNlbnRlciA9IE1hdGguZmxvb3IoKHRoaXMub2Zmc2V0ICsgdGhpcy5kaW0gLyAyKSAvIHRoaXMuZGltKTtcclxuICAgICAgZGVsdGEgPSB0aGlzLm9mZnNldCAtIHRoaXMuY2VudGVyICogdGhpcy5kaW07XHJcbiAgICAgIGRpciA9IGRlbHRhIDwgMCA/IDEgOiAtMTtcclxuICAgICAgdHdlZW4gPSAtZGlyICogZGVsdGEgKiAyIC8gdGhpcy5kaW07XHJcbiAgICAgIGhhbGYgPSB0aGlzLmNvdW50ID4+IDE7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZ1bGxXaWR0aCkge1xyXG4gICAgICAgIGFsaWdubWVudCA9ICd0cmFuc2xhdGVYKDApJztcclxuICAgICAgICBjZW50ZXJUd2VlbmVkT3BhY2l0eSA9IDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxpZ25tZW50ID0gJ3RyYW5zbGF0ZVgoJyArICh0aGlzLmVsLmNsaWVudFdpZHRoIC0gdGhpcy5pdGVtV2lkdGgpIC8gMiArICdweCkgJztcclxuICAgICAgICBhbGlnbm1lbnQgKz0gJ3RyYW5zbGF0ZVkoJyArICh0aGlzLmVsLmNsaWVudEhlaWdodCAtIHRoaXMuaXRlbUhlaWdodCkgLyAyICsgJ3B4KSc7XHJcbiAgICAgICAgY2VudGVyVHdlZW5lZE9wYWNpdHkgPSAxIC0gbnVtVmlzaWJsZU9mZnNldCAqIHR3ZWVuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTZXQgaW5kaWNhdG9yIGFjdGl2ZVxyXG4gICAgICBpZiAodGhpcy5zaG93SW5kaWNhdG9ycykge1xyXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5jZW50ZXIgJSB0aGlzLmNvdW50O1xyXG4gICAgICAgIGxldCBhY3RpdmVJbmRpY2F0b3IgPSB0aGlzLiRpbmRpY2F0b3JzLmZpbmQoJy5pbmRpY2F0b3ItaXRlbS5hY3RpdmUnKTtcclxuICAgICAgICBpZiAoYWN0aXZlSW5kaWNhdG9yLmluZGV4KCkgIT09IGRpZmYpIHtcclxuICAgICAgICAgIGFjdGl2ZUluZGljYXRvci5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzXHJcbiAgICAgICAgICAgIC5maW5kKCcuaW5kaWNhdG9yLWl0ZW0nKVxyXG4gICAgICAgICAgICAuZXEoZGlmZilbMF1cclxuICAgICAgICAgICAgLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2VudGVyXHJcbiAgICAgIC8vIERvbid0IHNob3cgd3JhcHBlZCBpdGVtcy5cclxuICAgICAgaWYgKCF0aGlzLm5vV3JhcCB8fCAodGhpcy5jZW50ZXIgPj0gMCAmJiB0aGlzLmNlbnRlciA8IHRoaXMuY291bnQpKSB7XHJcbiAgICAgICAgZWwgPSB0aGlzLmltYWdlc1t0aGlzLl93cmFwKHRoaXMuY2VudGVyKV07XHJcblxyXG4gICAgICAgIC8vIEFkZCBhY3RpdmUgY2xhc3MgdG8gY2VudGVyIGl0ZW0uXHJcbiAgICAgICAgaWYgKCEkKGVsKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0cmFuc2Zvcm1TdHJpbmcgPSBgJHthbGlnbm1lbnR9IHRyYW5zbGF0ZVgoJHstZGVsdGEgLyAyfXB4KSB0cmFuc2xhdGVYKCR7ZGlyICpcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5zaGlmdCAqXHJcbiAgICAgICAgICB0d2VlbiAqXHJcbiAgICAgICAgICBpfXB4KSB0cmFuc2xhdGVaKCR7dGhpcy5vcHRpb25zLmRpc3QgKiB0d2Vlbn1weClgO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1TdHlsZShlbCwgY2VudGVyVHdlZW5lZE9wYWNpdHksIDAsIHRyYW5zZm9ybVN0cmluZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gaGFsZjsgKytpKSB7XHJcbiAgICAgICAgLy8gcmlnaHQgc2lkZVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZnVsbFdpZHRoKSB7XHJcbiAgICAgICAgICB6VHJhbnNsYXRpb24gPSB0aGlzLm9wdGlvbnMuZGlzdDtcclxuICAgICAgICAgIHR3ZWVuZWRPcGFjaXR5ID0gaSA9PT0gaGFsZiAmJiBkZWx0YSA8IDAgPyAxIC0gdHdlZW4gOiAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB6VHJhbnNsYXRpb24gPSB0aGlzLm9wdGlvbnMuZGlzdCAqIChpICogMiArIHR3ZWVuICogZGlyKTtcclxuICAgICAgICAgIHR3ZWVuZWRPcGFjaXR5ID0gMSAtIG51bVZpc2libGVPZmZzZXQgKiAoaSAqIDIgKyB0d2VlbiAqIGRpcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERvbid0IHNob3cgd3JhcHBlZCBpdGVtcy5cclxuICAgICAgICBpZiAoIXRoaXMubm9XcmFwIHx8IHRoaXMuY2VudGVyICsgaSA8IHRoaXMuY291bnQpIHtcclxuICAgICAgICAgIGVsID0gdGhpcy5pbWFnZXNbdGhpcy5fd3JhcCh0aGlzLmNlbnRlciArIGkpXTtcclxuICAgICAgICAgIGxldCB0cmFuc2Zvcm1TdHJpbmcgPSBgJHthbGlnbm1lbnR9IHRyYW5zbGF0ZVgoJHt0aGlzLm9wdGlvbnMuc2hpZnQgK1xyXG4gICAgICAgICAgICAodGhpcy5kaW0gKiBpIC0gZGVsdGEpIC8gMn1weCkgdHJhbnNsYXRlWigke3pUcmFuc2xhdGlvbn1weClgO1xyXG4gICAgICAgICAgdGhpcy5fdXBkYXRlSXRlbVN0eWxlKGVsLCB0d2VlbmVkT3BhY2l0eSwgLWksIHRyYW5zZm9ybVN0cmluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBsZWZ0IHNpZGVcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZ1bGxXaWR0aCkge1xyXG4gICAgICAgICAgelRyYW5zbGF0aW9uID0gdGhpcy5vcHRpb25zLmRpc3Q7XHJcbiAgICAgICAgICB0d2VlbmVkT3BhY2l0eSA9IGkgPT09IGhhbGYgJiYgZGVsdGEgPiAwID8gMSAtIHR3ZWVuIDogMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgelRyYW5zbGF0aW9uID0gdGhpcy5vcHRpb25zLmRpc3QgKiAoaSAqIDIgLSB0d2VlbiAqIGRpcik7XHJcbiAgICAgICAgICB0d2VlbmVkT3BhY2l0eSA9IDEgLSBudW1WaXNpYmxlT2Zmc2V0ICogKGkgKiAyIC0gdHdlZW4gKiBkaXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBEb24ndCBzaG93IHdyYXBwZWQgaXRlbXMuXHJcbiAgICAgICAgaWYgKCF0aGlzLm5vV3JhcCB8fCB0aGlzLmNlbnRlciAtIGkgPj0gMCkge1xyXG4gICAgICAgICAgZWwgPSB0aGlzLmltYWdlc1t0aGlzLl93cmFwKHRoaXMuY2VudGVyIC0gaSldO1xyXG4gICAgICAgICAgbGV0IHRyYW5zZm9ybVN0cmluZyA9IGAke2FsaWdubWVudH0gdHJhbnNsYXRlWCgkey10aGlzLm9wdGlvbnMuc2hpZnQgK1xyXG4gICAgICAgICAgICAoLXRoaXMuZGltICogaSAtIGRlbHRhKSAvIDJ9cHgpIHRyYW5zbGF0ZVooJHt6VHJhbnNsYXRpb259cHgpYDtcclxuICAgICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1TdHlsZShlbCwgdHdlZW5lZE9wYWNpdHksIC1pLCB0cmFuc2Zvcm1TdHJpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2VudGVyXHJcbiAgICAgIC8vIERvbid0IHNob3cgd3JhcHBlZCBpdGVtcy5cclxuICAgICAgaWYgKCF0aGlzLm5vV3JhcCB8fCAodGhpcy5jZW50ZXIgPj0gMCAmJiB0aGlzLmNlbnRlciA8IHRoaXMuY291bnQpKSB7XHJcbiAgICAgICAgZWwgPSB0aGlzLmltYWdlc1t0aGlzLl93cmFwKHRoaXMuY2VudGVyKV07XHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybVN0cmluZyA9IGAke2FsaWdubWVudH0gdHJhbnNsYXRlWCgkey1kZWx0YSAvIDJ9cHgpIHRyYW5zbGF0ZVgoJHtkaXIgKlxyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLnNoaWZ0ICpcclxuICAgICAgICAgIHR3ZWVufXB4KSB0cmFuc2xhdGVaKCR7dGhpcy5vcHRpb25zLmRpc3QgKiB0d2Vlbn1weClgO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1TdHlsZShlbCwgY2VudGVyVHdlZW5lZE9wYWNpdHksIDAsIHRyYW5zZm9ybVN0cmluZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG9uQ3ljbGVUbyBjYWxsYmFja1xyXG4gICAgICBsZXQgJGN1cnJJdGVtID0gdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0nKS5lcSh0aGlzLl93cmFwKHRoaXMuY2VudGVyKSk7XHJcbiAgICAgIGlmIChsYXN0Q2VudGVyICE9PSB0aGlzLmNlbnRlciAmJiB0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ3ljbGVUbyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkN5Y2xlVG8uY2FsbCh0aGlzLCAkY3Vyckl0ZW1bMF0sIHRoaXMuZHJhZ2dlZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9uZSB0aW1lIGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vbmVUaW1lQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9uZVRpbWVDYWxsYmFjay5jYWxsKHRoaXMsICRjdXJySXRlbVswXSwgdGhpcy5kcmFnZ2VkKTtcclxuICAgICAgICB0aGlzLm9uZVRpbWVDYWxsYmFjayA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEN5Y2xlIHRvIHRhcmdldFxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB6SW5kZXhcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0cmFuc2Zvcm1cclxuICAgICAqL1xyXG4gICAgX3VwZGF0ZUl0ZW1TdHlsZShlbCwgb3BhY2l0eSwgekluZGV4LCB0cmFuc2Zvcm0pIHtcclxuICAgICAgZWwuc3R5bGVbdGhpcy54Zm9ybV0gPSB0cmFuc2Zvcm07XHJcbiAgICAgIGVsLnN0eWxlLnpJbmRleCA9IHpJbmRleDtcclxuICAgICAgZWwuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHk7XHJcbiAgICAgIGVsLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDeWNsZSB0byB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBfY3ljbGVUbyhuLCBjYWxsYmFjaykge1xyXG4gICAgICBsZXQgZGlmZiA9IHRoaXMuY2VudGVyICUgdGhpcy5jb3VudCAtIG47XHJcblxyXG4gICAgICAvLyBBY2NvdW50IGZvciB3cmFwYXJvdW5kLlxyXG4gICAgICBpZiAoIXRoaXMubm9XcmFwKSB7XHJcbiAgICAgICAgaWYgKGRpZmYgPCAwKSB7XHJcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZiArIHRoaXMuY291bnQpIDwgTWF0aC5hYnMoZGlmZikpIHtcclxuICAgICAgICAgICAgZGlmZiArPSB0aGlzLmNvdW50O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICAgIGlmIChNYXRoLmFicyhkaWZmIC0gdGhpcy5jb3VudCkgPCBkaWZmKSB7XHJcbiAgICAgICAgICAgIGRpZmYgLT0gdGhpcy5jb3VudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5kaW0gKiBNYXRoLnJvdW5kKHRoaXMub2Zmc2V0IC8gdGhpcy5kaW0pO1xyXG4gICAgICAvLyBOZXh0XHJcbiAgICAgIGlmIChkaWZmIDwgMCkge1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ICs9IHRoaXMuZGltICogTWF0aC5hYnMoZGlmZik7XHJcblxyXG4gICAgICAgIC8vIFByZXZcclxuICAgICAgfSBlbHNlIGlmIChkaWZmID4gMCkge1xyXG4gICAgICAgIHRoaXMudGFyZ2V0IC09IHRoaXMuZGltICogZGlmZjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IG9uZSB0aW1lIGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9uZVRpbWVDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTY3JvbGxcclxuICAgICAgaWYgKHRoaXMub2Zmc2V0ICE9PSB0aGlzLnRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gdGhpcy50YXJnZXQgLSB0aGlzLm9mZnNldDtcclxuICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2F1dG9TY3JvbGxCb3VuZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEN5Y2xlIHRvIG5leHQgaXRlbVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtuXVxyXG4gICAgICovXHJcbiAgICBuZXh0KG4pIHtcclxuICAgICAgaWYgKG4gPT09IHVuZGVmaW5lZCB8fCBpc05hTihuKSkge1xyXG4gICAgICAgIG4gPSAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgaW5kZXggPSB0aGlzLmNlbnRlciArIG47XHJcbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLmNvdW50IHx8IGluZGV4IDwgMCkge1xyXG4gICAgICAgIGlmICh0aGlzLm5vV3JhcCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLl93cmFwKGluZGV4KTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9jeWNsZVRvKGluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEN5Y2xlIHRvIHByZXZpb3VzIGl0ZW1cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbl1cclxuICAgICAqL1xyXG4gICAgcHJldihuKSB7XHJcbiAgICAgIGlmIChuID09PSB1bmRlZmluZWQgfHwgaXNOYU4obikpIHtcclxuICAgICAgICBuID0gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGluZGV4ID0gdGhpcy5jZW50ZXIgLSBuO1xyXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5jb3VudCB8fCBpbmRleCA8IDApIHtcclxuICAgICAgICBpZiAodGhpcy5ub1dyYXApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluZGV4ID0gdGhpcy5fd3JhcChpbmRleCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2N5Y2xlVG8oaW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3ljbGUgdG8gbnRoIGl0ZW1cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbl1cclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIHNldChuLCBjYWxsYmFjaykge1xyXG4gICAgICBpZiAobiA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKG4pKSB7XHJcbiAgICAgICAgbiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuID4gdGhpcy5jb3VudCB8fCBuIDwgMCkge1xyXG4gICAgICAgIGlmICh0aGlzLm5vV3JhcCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IHRoaXMuX3dyYXAobik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2N5Y2xlVG8obiwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTS5DYXJvdXNlbCA9IENhcm91c2VsO1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoQ2Fyb3VzZWwsICdjYXJvdXNlbCcsICdNX0Nhcm91c2VsJyk7XHJcbiAgfVxyXG59KShjYXNoKTtcclxuIl0sImZpbGUiOiJjYXJvdXNlbC5qcyJ9
