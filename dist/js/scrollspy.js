(function($, anim) {
  'use strict';

  let _defaults = {
    throttle: 100,
    scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
    activeClass: 'active',
    getActiveElement: function(id) {
      return 'a[href="#' + id + '"]';
    }
  };

  /**
   * @class
   *
   */
  class ScrollSpy extends Component {
    /**
     * Construct ScrollSpy instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(ScrollSpy, el, options);

      this.el.M_ScrollSpy = this;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [throttle=100] - Throttle of scroll handler
       * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
       * @prop {String} [activeClass='active'] - Class applied to active elements
       * @prop {Function} [getActiveElement] - Used to find active element
       */
      this.options = $.extend({}, ScrollSpy.defaults, options);

      // setup
      ScrollSpy._elements.push(this);
      ScrollSpy._count++;
      ScrollSpy._increment++;
      this.tickId = -1;
      this.id = ScrollSpy._increment;
      this._setupEventHandlers();
      this._handleWindowScroll();
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
      return domElem.M_ScrollSpy;
    }

    /**
     * Teardown component
     */
    destroy() {
      ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
      ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
      ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
      ScrollSpy._count--;
      this._removeEventHandlers();
      $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
      this.el.M_ScrollSpy = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      let throttledResize = M.throttle(this._handleWindowScroll, 200);
      this._handleThrottledResizeBound = throttledResize.bind(this);
      this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
      if (ScrollSpy._count === 1) {
        window.addEventListener('scroll', this._handleWindowScrollBound);
        window.addEventListener('resize', this._handleThrottledResizeBound);
        document.body.addEventListener('click', this._handleTriggerClick);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (ScrollSpy._count === 0) {
        window.removeEventListener('scroll', this._handleWindowScrollBound);
        window.removeEventListener('resize', this._handleThrottledResizeBound);
        document.body.removeEventListener('click', this._handleTriggerClick);
      }
    }

    /**
     * Handle Trigger Click
     * @param {Event} e
     */
    _handleTriggerClick(e) {
      let $trigger = $(e.target);
      for (let i = ScrollSpy._elements.length - 1; i >= 0; i--) {
        let scrollspy = ScrollSpy._elements[i];
        if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
          e.preventDefault();
          let offset = scrollspy.$el.offset().top + 1;

          anim({
            targets: [document.documentElement, document.body],
            scrollTop: offset - scrollspy.options.scrollOffset,
            duration: 400,
            easing: 'easeOutCubic'
          });
          break;
        }
      }
    }

    /**
     * Handle Window Scroll
     */
    _handleWindowScroll() {
      // unique tick id
      ScrollSpy._ticks++;

      // viewport rectangle
      let top = M.getDocumentScrollTop(),
        left = M.getDocumentScrollLeft(),
        right = left + window.innerWidth,
        bottom = top + window.innerHeight;

      // determine which elements are in view
      let intersections = ScrollSpy._findElements(top, right, bottom, left);
      for (let i = 0; i < intersections.length; i++) {
        let scrollspy = intersections[i];
        let lastTick = scrollspy.tickId;
        if (lastTick < 0) {
          // entered into view
          scrollspy._enter();
        }

        // update tick id
        scrollspy.tickId = ScrollSpy._ticks;
      }

      for (let i = 0; i < ScrollSpy._elementsInView.length; i++) {
        let scrollspy = ScrollSpy._elementsInView[i];
        let lastTick = scrollspy.tickId;
        if (lastTick >= 0 && lastTick !== ScrollSpy._ticks) {
          // exited from view
          scrollspy._exit();
          scrollspy.tickId = -1;
        }
      }

      // remember elements in view for next tick
      ScrollSpy._elementsInView = intersections;
    }

    /**
     * Find elements that are within the boundary
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     * @param {number} left
     * @return {Array.<ScrollSpy>}   A collection of elements
     */
    static _findElements(top, right, bottom, left) {
      let hits = [];
      for (let i = 0; i < ScrollSpy._elements.length; i++) {
        let scrollspy = ScrollSpy._elements[i];
        let currTop = top + scrollspy.options.scrollOffset || 200;

        if (scrollspy.$el.height() > 0) {
          let elTop = scrollspy.$el.offset().top,
            elLeft = scrollspy.$el.offset().left,
            elRight = elLeft + scrollspy.$el.width(),
            elBottom = elTop + scrollspy.$el.height();

          let isIntersect = !(
            elLeft > right ||
            elRight < left ||
            elTop > bottom ||
            elBottom < currTop
          );

          if (isIntersect) {
            hits.push(scrollspy);
          }
        }
      }
      return hits;
    }

    _enter() {
      ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function(value) {
        return value.height() != 0;
      });

      if (ScrollSpy._visibleElements[0]) {
        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(
          this.options.activeClass
        );
        if (
          ScrollSpy._visibleElements[0][0].M_ScrollSpy &&
          this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id
        ) {
          ScrollSpy._visibleElements.unshift(this.$el);
        } else {
          ScrollSpy._visibleElements.push(this.$el);
        }
      } else {
        ScrollSpy._visibleElements.push(this.$el);
      }

      $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(
        this.options.activeClass
      );
    }

    _exit() {
      ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function(value) {
        return value.height() != 0;
      });

      if (ScrollSpy._visibleElements[0]) {
        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(
          this.options.activeClass
        );

        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter((el) => {
          return el.attr('id') != this.$el.attr('id');
        });
        if (ScrollSpy._visibleElements[0]) {
          // Check if empty
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(
            this.options.activeClass
          );
        }
      }
    }
  }

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elements = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elementsInView = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<cash>}
   */
  ScrollSpy._visibleElements = [];

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._count = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._increment = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._ticks = 0;

  M.ScrollSpy = ScrollSpy;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY3JvbGxzcHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBfZGVmYXVsdHMgPSB7XHJcbiAgICB0aHJvdHRsZTogMTAwLFxyXG4gICAgc2Nyb2xsT2Zmc2V0OiAyMDAsIC8vIG9mZnNldCAtIDIwMCBhbGxvd3MgZWxlbWVudHMgbmVhciBib3R0b20gb2YgcGFnZSB0byBzY3JvbGxcclxuICAgIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcclxuICAgIGdldEFjdGl2ZUVsZW1lbnQ6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIHJldHVybiAnYVtocmVmPVwiIycgKyBpZCArICdcIl0nO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcbiAgY2xhc3MgU2Nyb2xsU3B5IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFNjcm9sbFNweSBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihTY3JvbGxTcHksIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9TY3JvbGxTcHkgPSB0aGlzO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBtb2RhbFxyXG4gICAgICAgKiBAbWVtYmVyIE1vZGFsI29wdGlvbnNcclxuICAgICAgICogQHByb3Age051bWJlcn0gW3Rocm90dGxlPTEwMF0gLSBUaHJvdHRsZSBvZiBzY3JvbGwgaGFuZGxlclxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbc2Nyb2xsT2Zmc2V0PTIwMF0gLSBPZmZzZXQgZm9yIGNlbnRlcmluZyBlbGVtZW50IHdoZW4gc2Nyb2xsZWQgdG9cclxuICAgICAgICogQHByb3Age1N0cmluZ30gW2FjdGl2ZUNsYXNzPSdhY3RpdmUnXSAtIENsYXNzIGFwcGxpZWQgdG8gYWN0aXZlIGVsZW1lbnRzXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gW2dldEFjdGl2ZUVsZW1lbnRdIC0gVXNlZCB0byBmaW5kIGFjdGl2ZSBlbGVtZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgU2Nyb2xsU3B5LmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIHNldHVwXHJcbiAgICAgIFNjcm9sbFNweS5fZWxlbWVudHMucHVzaCh0aGlzKTtcclxuICAgICAgU2Nyb2xsU3B5Ll9jb3VudCsrO1xyXG4gICAgICBTY3JvbGxTcHkuX2luY3JlbWVudCsrO1xyXG4gICAgICB0aGlzLnRpY2tJZCA9IC0xO1xyXG4gICAgICB0aGlzLmlkID0gU2Nyb2xsU3B5Ll9pbmNyZW1lbnQ7XHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKCkge1xyXG4gICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gc3VwZXIuaW5pdCh0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICBsZXQgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgcmV0dXJuIGRvbUVsZW0uTV9TY3JvbGxTcHk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgU2Nyb2xsU3B5Ll9lbGVtZW50cy5zcGxpY2UoU2Nyb2xsU3B5Ll9lbGVtZW50cy5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldy5zcGxpY2UoU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldy5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMuc3BsaWNlKFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzLmluZGV4T2YodGhpcy4kZWwpLCAxKTtcclxuICAgICAgU2Nyb2xsU3B5Ll9jb3VudC0tO1xyXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICQodGhpcy5vcHRpb25zLmdldEFjdGl2ZUVsZW1lbnQodGhpcy4kZWwuYXR0cignaWQnKSkpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XHJcbiAgICAgIHRoaXMuZWwuTV9TY3JvbGxTcHkgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICBsZXQgdGhyb3R0bGVkUmVzaXplID0gTS50aHJvdHRsZSh0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGwsIDIwMCk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kID0gdGhyb3R0bGVkUmVzaXplLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVdpbmRvd1Njcm9sbEJvdW5kID0gdGhpcy5faGFuZGxlV2luZG93U2Nyb2xsLmJpbmQodGhpcyk7XHJcbiAgICAgIGlmIChTY3JvbGxTcHkuX2NvdW50ID09PSAxKSB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX2hhbmRsZVdpbmRvd1Njcm9sbEJvdW5kKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlVGhyb3R0bGVkUmVzaXplQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUcmlnZ2VyQ2xpY2spO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIGlmIChTY3JvbGxTcHkuX2NvdW50ID09PSAwKSB7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX2hhbmRsZVdpbmRvd1Njcm9sbEJvdW5kKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlVGhyb3R0bGVkUmVzaXplQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUcmlnZ2VyQ2xpY2spO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgVHJpZ2dlciBDbGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlVHJpZ2dlckNsaWNrKGUpIHtcclxuICAgICAgbGV0ICR0cmlnZ2VyID0gJChlLnRhcmdldCk7XHJcbiAgICAgIGZvciAobGV0IGkgPSBTY3JvbGxTcHkuX2VsZW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgbGV0IHNjcm9sbHNweSA9IFNjcm9sbFNweS5fZWxlbWVudHNbaV07XHJcbiAgICAgICAgaWYgKCR0cmlnZ2VyLmlzKCdhW2hyZWY9XCIjJyArIHNjcm9sbHNweS4kZWwuYXR0cignaWQnKSArICdcIl0nKSkge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgbGV0IG9mZnNldCA9IHNjcm9sbHNweS4kZWwub2Zmc2V0KCkudG9wICsgMTtcclxuXHJcbiAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgdGFyZ2V0czogW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgZG9jdW1lbnQuYm9keV0sXHJcbiAgICAgICAgICAgIHNjcm9sbFRvcDogb2Zmc2V0IC0gc2Nyb2xsc3B5Lm9wdGlvbnMuc2Nyb2xsT2Zmc2V0LFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogNDAwLFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0Q3ViaWMnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIFdpbmRvdyBTY3JvbGxcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZVdpbmRvd1Njcm9sbCgpIHtcclxuICAgICAgLy8gdW5pcXVlIHRpY2sgaWRcclxuICAgICAgU2Nyb2xsU3B5Ll90aWNrcysrO1xyXG5cclxuICAgICAgLy8gdmlld3BvcnQgcmVjdGFuZ2xlXHJcbiAgICAgIGxldCB0b3AgPSBNLmdldERvY3VtZW50U2Nyb2xsVG9wKCksXHJcbiAgICAgICAgbGVmdCA9IE0uZ2V0RG9jdW1lbnRTY3JvbGxMZWZ0KCksXHJcbiAgICAgICAgcmlnaHQgPSBsZWZ0ICsgd2luZG93LmlubmVyV2lkdGgsXHJcbiAgICAgICAgYm90dG9tID0gdG9wICsgd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIHdoaWNoIGVsZW1lbnRzIGFyZSBpbiB2aWV3XHJcbiAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gU2Nyb2xsU3B5Ll9maW5kRWxlbWVudHModG9wLCByaWdodCwgYm90dG9tLCBsZWZ0KTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnRlcnNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHNjcm9sbHNweSA9IGludGVyc2VjdGlvbnNbaV07XHJcbiAgICAgICAgbGV0IGxhc3RUaWNrID0gc2Nyb2xsc3B5LnRpY2tJZDtcclxuICAgICAgICBpZiAobGFzdFRpY2sgPCAwKSB7XHJcbiAgICAgICAgICAvLyBlbnRlcmVkIGludG8gdmlld1xyXG4gICAgICAgICAgc2Nyb2xsc3B5Ll9lbnRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHRpY2sgaWRcclxuICAgICAgICBzY3JvbGxzcHkudGlja0lkID0gU2Nyb2xsU3B5Ll90aWNrcztcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBTY3JvbGxTcHkuX2VsZW1lbnRzSW5WaWV3Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHNjcm9sbHNweSA9IFNjcm9sbFNweS5fZWxlbWVudHNJblZpZXdbaV07XHJcbiAgICAgICAgbGV0IGxhc3RUaWNrID0gc2Nyb2xsc3B5LnRpY2tJZDtcclxuICAgICAgICBpZiAobGFzdFRpY2sgPj0gMCAmJiBsYXN0VGljayAhPT0gU2Nyb2xsU3B5Ll90aWNrcykge1xyXG4gICAgICAgICAgLy8gZXhpdGVkIGZyb20gdmlld1xyXG4gICAgICAgICAgc2Nyb2xsc3B5Ll9leGl0KCk7XHJcbiAgICAgICAgICBzY3JvbGxzcHkudGlja0lkID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW1lbWJlciBlbGVtZW50cyBpbiB2aWV3IGZvciBuZXh0IHRpY2tcclxuICAgICAgU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldyA9IGludGVyc2VjdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGVsZW1lbnRzIHRoYXQgYXJlIHdpdGhpbiB0aGUgYm91bmRhcnlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3BcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnRcclxuICAgICAqIEByZXR1cm4ge0FycmF5LjxTY3JvbGxTcHk+fSAgIEEgY29sbGVjdGlvbiBvZiBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgX2ZpbmRFbGVtZW50cyh0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQpIHtcclxuICAgICAgbGV0IGhpdHMgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBTY3JvbGxTcHkuX2VsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHNjcm9sbHNweSA9IFNjcm9sbFNweS5fZWxlbWVudHNbaV07XHJcbiAgICAgICAgbGV0IGN1cnJUb3AgPSB0b3AgKyBzY3JvbGxzcHkub3B0aW9ucy5zY3JvbGxPZmZzZXQgfHwgMjAwO1xyXG5cclxuICAgICAgICBpZiAoc2Nyb2xsc3B5LiRlbC5oZWlnaHQoKSA+IDApIHtcclxuICAgICAgICAgIGxldCBlbFRvcCA9IHNjcm9sbHNweS4kZWwub2Zmc2V0KCkudG9wLFxyXG4gICAgICAgICAgICBlbExlZnQgPSBzY3JvbGxzcHkuJGVsLm9mZnNldCgpLmxlZnQsXHJcbiAgICAgICAgICAgIGVsUmlnaHQgPSBlbExlZnQgKyBzY3JvbGxzcHkuJGVsLndpZHRoKCksXHJcbiAgICAgICAgICAgIGVsQm90dG9tID0gZWxUb3AgKyBzY3JvbGxzcHkuJGVsLmhlaWdodCgpO1xyXG5cclxuICAgICAgICAgIGxldCBpc0ludGVyc2VjdCA9ICEoXHJcbiAgICAgICAgICAgIGVsTGVmdCA+IHJpZ2h0IHx8XHJcbiAgICAgICAgICAgIGVsUmlnaHQgPCBsZWZ0IHx8XHJcbiAgICAgICAgICAgIGVsVG9wID4gYm90dG9tIHx8XHJcbiAgICAgICAgICAgIGVsQm90dG9tIDwgY3VyclRvcFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBpZiAoaXNJbnRlcnNlY3QpIHtcclxuICAgICAgICAgICAgaGl0cy5wdXNoKHNjcm9sbHNweSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBoaXRzO1xyXG4gICAgfVxyXG5cclxuICAgIF9lbnRlcigpIHtcclxuICAgICAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMgPSBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUuaGVpZ2h0KCkgIT0gMDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHNbMF0pIHtcclxuICAgICAgICAkKHRoaXMub3B0aW9ucy5nZXRBY3RpdmVFbGVtZW50KFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzWzBdLmF0dHIoJ2lkJykpKS5yZW1vdmVDbGFzcyhcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzc1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHNbMF1bMF0uTV9TY3JvbGxTcHkgJiZcclxuICAgICAgICAgIHRoaXMuaWQgPCBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50c1swXVswXS5NX1Njcm9sbFNweS5pZFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMudW5zaGlmdCh0aGlzLiRlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzLnB1c2godGhpcy4kZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50cy5wdXNoKHRoaXMuJGVsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJCh0aGlzLm9wdGlvbnMuZ2V0QWN0aXZlRWxlbWVudChTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50c1swXS5hdHRyKCdpZCcpKSkuYWRkQ2xhc3MoXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgX2V4aXQoKSB7XHJcbiAgICAgIFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzID0gU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLmhlaWdodCgpICE9IDA7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzWzBdKSB7XHJcbiAgICAgICAgJCh0aGlzLm9wdGlvbnMuZ2V0QWN0aXZlRWxlbWVudChTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50c1swXS5hdHRyKCdpZCcpKSkucmVtb3ZlQ2xhc3MoXHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50cyA9IFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzLmZpbHRlcigoZWwpID0+IHtcclxuICAgICAgICAgIHJldHVybiBlbC5hdHRyKCdpZCcpICE9IHRoaXMuJGVsLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzWzBdKSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBlbXB0eVxyXG4gICAgICAgICAgJCh0aGlzLm9wdGlvbnMuZ2V0QWN0aXZlRWxlbWVudChTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50c1swXS5hdHRyKCdpZCcpKSkuYWRkQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzc1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgU2Nyb2xsU3B5XHJcbiAgICogQHR5cGUge0FycmF5LjxTY3JvbGxTcHk+fVxyXG4gICAqL1xyXG4gIFNjcm9sbFNweS5fZWxlbWVudHMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTY3JvbGxTcHlcclxuICAgKiBAdHlwZSB7QXJyYXkuPFNjcm9sbFNweT59XHJcbiAgICovXHJcbiAgU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldyA9IFtdO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFNjcm9sbFNweVxyXG4gICAqIEB0eXBlIHtBcnJheS48Y2FzaD59XHJcbiAgICovXHJcbiAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTY3JvbGxTcHlcclxuICAgKi9cclxuICBTY3JvbGxTcHkuX2NvdW50ID0gMDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTY3JvbGxTcHlcclxuICAgKi9cclxuICBTY3JvbGxTcHkuX2luY3JlbWVudCA9IDA7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgU2Nyb2xsU3B5XHJcbiAgICovXHJcbiAgU2Nyb2xsU3B5Ll90aWNrcyA9IDA7XHJcblxyXG4gIE0uU2Nyb2xsU3B5ID0gU2Nyb2xsU3B5O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoU2Nyb2xsU3B5LCAnc2Nyb2xsU3B5JywgJ01fU2Nyb2xsU3B5Jyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuIl0sImZpbGUiOiJzY3JvbGxzcHkuanMifQ==
