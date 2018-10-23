(function($) {
  'use strict';

  let _defaults = {
    onOpen: undefined,
    onClose: undefined
  };

  /**
   * @class
   *
   */
  class TapTarget extends Component {
    /**
     * Construct TapTarget instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(TapTarget, el, options);

      this.el.M_TapTarget = this;

      /**
       * Options for the select
       * @member TapTarget#options
       * @prop {Function} onOpen - Callback function called when feature discovery is opened
       * @prop {Function} onClose - Callback function called when feature discovery is closed
       */
      this.options = $.extend({}, TapTarget.defaults, options);

      this.isOpen = false;

      // setup
      this.$origin = $('#' + this.$el.attr('data-target'));
      this._setup();

      this._calculatePositioning();
      this._setupEventHandlers();
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
      return domElem.M_TapTarget;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.TapTarget = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
      this._handleTargetClickBound = this._handleTargetClick.bind(this);
      this._handleOriginClickBound = this._handleOriginClick.bind(this);

      this.el.addEventListener('click', this._handleTargetClickBound);
      this.originEl.addEventListener('click', this._handleOriginClickBound);

      // Resize
      let throttledResize = M.throttle(this._handleResize, 200);
      this._handleThrottledResizeBound = throttledResize.bind(this);

      window.addEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleTargetClickBound);
      this.originEl.removeEventListener('click', this._handleOriginClickBound);
      window.removeEventListener('resize', this._handleThrottledResizeBound);
    }

    /**
     * Handle Target Click
     * @param {Event} e
     */
    _handleTargetClick(e) {
      this.open();
    }

    /**
     * Handle Origin Click
     * @param {Event} e
     */
    _handleOriginClick(e) {
      this.close();
    }

    /**
     * Handle Resize
     * @param {Event} e
     */
    _handleResize(e) {
      this._calculatePositioning();
    }

    /**
     * Handle Resize
     * @param {Event} e
     */
    _handleDocumentClick(e) {
      if (!$(e.target).closest('.tap-target-wrapper').length) {
        this.close();
        e.preventDefault();
        e.stopPropagation();
      }
    }

    /**
     * Setup Tap Target
     */
    _setup() {
      // Creating tap target
      this.wrapper = this.$el.parent()[0];
      this.waveEl = $(this.wrapper).find('.tap-target-wave')[0];
      this.originEl = $(this.wrapper).find('.tap-target-origin')[0];
      this.contentEl = this.$el.find('.tap-target-content')[0];

      // Creating wrapper
      if (!$(this.wrapper).hasClass('.tap-target-wrapper')) {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('tap-target-wrapper');
        this.$el.before($(this.wrapper));
        this.wrapper.append(this.el);
      }

      // Creating content
      if (!this.contentEl) {
        this.contentEl = document.createElement('div');
        this.contentEl.classList.add('tap-target-content');
        this.$el.append(this.contentEl);
      }

      // Creating foreground wave
      if (!this.waveEl) {
        this.waveEl = document.createElement('div');
        this.waveEl.classList.add('tap-target-wave');

        // Creating origin
        if (!this.originEl) {
          this.originEl = this.$origin.clone(true, true);
          this.originEl.addClass('tap-target-origin');
          this.originEl.removeAttr('id');
          this.originEl.removeAttr('style');
          this.originEl = this.originEl[0];
          this.waveEl.append(this.originEl);
        }

        this.wrapper.append(this.waveEl);
      }
    }

    /**
     * Calculate positioning
     */
    _calculatePositioning() {
      // Element or parent is fixed position?
      let isFixed = this.$origin.css('position') === 'fixed';
      if (!isFixed) {
        let parents = this.$origin.parents();
        for (let i = 0; i < parents.length; i++) {
          isFixed = $(parents[i]).css('position') == 'fixed';
          if (isFixed) {
            break;
          }
        }
      }

      // Calculating origin
      let originWidth = this.$origin.outerWidth();
      let originHeight = this.$origin.outerHeight();
      let originTop = isFixed
        ? this.$origin.offset().top - M.getDocumentScrollTop()
        : this.$origin.offset().top;
      let originLeft = isFixed
        ? this.$origin.offset().left - M.getDocumentScrollLeft()
        : this.$origin.offset().left;

      // Calculating screen
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let centerX = windowWidth / 2;
      let centerY = windowHeight / 2;
      let isLeft = originLeft <= centerX;
      let isRight = originLeft > centerX;
      let isTop = originTop <= centerY;
      let isBottom = originTop > centerY;
      let isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

      // Calculating tap target
      let tapTargetWidth = this.$el.outerWidth();
      let tapTargetHeight = this.$el.outerHeight();
      let tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
      let tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
      let tapTargetPosition = isFixed ? 'fixed' : 'absolute';

      // Calculating content
      let tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
      let tapTargetTextHeight = tapTargetHeight / 2;
      let tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
      let tapTargetTextBottom = 0;
      let tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
      let tapTargetTextRight = 0;
      let tapTargetTextPadding = originWidth;
      let tapTargetTextAlign = isBottom ? 'bottom' : 'top';

      // Calculating wave
      let tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
      let tapTargetWaveHeight = tapTargetWaveWidth;
      let tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
      let tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

      // Setting tap target
      let tapTargetWrapperCssObj = {};
      tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
      tapTargetWrapperCssObj.right = isRight
        ? windowWidth - tapTargetLeft - tapTargetWidth + 'px'
        : '';
      tapTargetWrapperCssObj.bottom = isBottom
        ? windowHeight - tapTargetTop - tapTargetHeight + 'px'
        : '';
      tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
      tapTargetWrapperCssObj.position = tapTargetPosition;
      $(this.wrapper).css(tapTargetWrapperCssObj);

      // Setting content
      $(this.contentEl).css({
        width: tapTargetTextWidth + 'px',
        height: tapTargetTextHeight + 'px',
        top: tapTargetTextTop + 'px',
        right: tapTargetTextRight + 'px',
        bottom: tapTargetTextBottom + 'px',
        left: tapTargetTextLeft + 'px',
        padding: tapTargetTextPadding + 'px',
        verticalAlign: tapTargetTextAlign
      });

      // Setting wave
      $(this.waveEl).css({
        top: tapTargetWaveTop + 'px',
        left: tapTargetWaveLeft + 'px',
        width: tapTargetWaveWidth + 'px',
        height: tapTargetWaveHeight + 'px'
      });
    }

    /**
     * Open TapTarget
     */
    open() {
      if (this.isOpen) {
        return;
      }

      // onOpen callback
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen.call(this, this.$origin[0]);
      }

      this.isOpen = true;
      this.wrapper.classList.add('open');

      document.body.addEventListener('click', this._handleDocumentClickBound, true);
      document.body.addEventListener('touchend', this._handleDocumentClickBound);
    }

    /**
     * Close Tap Target
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      // onClose callback
      if (typeof this.options.onClose === 'function') {
        this.options.onClose.call(this, this.$origin[0]);
      }

      this.isOpen = false;
      this.wrapper.classList.remove('open');

      document.body.removeEventListener('click', this._handleDocumentClickBound, true);
      document.body.removeEventListener('touchend', this._handleDocumentClickBound);
    }
  }

  M.TapTarget = TapTarget;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0YXBUYXJnZXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBfZGVmYXVsdHMgPSB7XHJcbiAgICBvbk9wZW46IHVuZGVmaW5lZCxcclxuICAgIG9uQ2xvc2U6IHVuZGVmaW5lZFxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcbiAgY2xhc3MgVGFwVGFyZ2V0IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFRhcFRhcmdldCBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihUYXBUYXJnZXQsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9UYXBUYXJnZXQgPSB0aGlzO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBzZWxlY3RcclxuICAgICAgICogQG1lbWJlciBUYXBUYXJnZXQjb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlbiAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIGZlYXR1cmUgZGlzY292ZXJ5IGlzIG9wZW5lZFxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2UgLSBDYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2hlbiBmZWF0dXJlIGRpc2NvdmVyeSBpcyBjbG9zZWRcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYXBUYXJnZXQuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIHNldHVwXHJcbiAgICAgIHRoaXMuJG9yaWdpbiA9ICQoJyMnICsgdGhpcy4kZWwuYXR0cignZGF0YS10YXJnZXQnKSk7XHJcbiAgICAgIHRoaXMuX3NldHVwKCk7XHJcblxyXG4gICAgICB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbmluZygpO1xyXG4gICAgICB0aGlzLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKCkge1xyXG4gICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gc3VwZXIuaW5pdCh0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICBsZXQgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgcmV0dXJuIGRvbUVsZW0uTV9UYXBUYXJnZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLmVsLlRhcFRhcmdldCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlVGFyZ2V0Q2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZVRhcmdldENsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZU9yaWdpbkNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVPcmlnaW5DbGljay5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRhcmdldENsaWNrQm91bmQpO1xyXG4gICAgICB0aGlzLm9yaWdpbkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlT3JpZ2luQ2xpY2tCb3VuZCk7XHJcblxyXG4gICAgICAvLyBSZXNpemVcclxuICAgICAgbGV0IHRocm90dGxlZFJlc2l6ZSA9IE0udGhyb3R0bGUodGhpcy5faGFuZGxlUmVzaXplLCAyMDApO1xyXG4gICAgICB0aGlzLl9oYW5kbGVUaHJvdHRsZWRSZXNpemVCb3VuZCA9IHRocm90dGxlZFJlc2l6ZS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRhcmdldENsaWNrQm91bmQpO1xyXG4gICAgICB0aGlzLm9yaWdpbkVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlT3JpZ2luQ2xpY2tCb3VuZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVUaHJvdHRsZWRSZXNpemVCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgVGFyZ2V0IENsaWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVUYXJnZXRDbGljayhlKSB7XHJcbiAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIE9yaWdpbiBDbGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlT3JpZ2luQ2xpY2soZSkge1xyXG4gICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgUmVzaXplXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVSZXNpemUoZSkge1xyXG4gICAgICB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIFJlc2l6ZVxyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlRG9jdW1lbnRDbGljayhlKSB7XHJcbiAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhcC10YXJnZXQtd3JhcHBlcicpLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgVGFwIFRhcmdldFxyXG4gICAgICovXHJcbiAgICBfc2V0dXAoKSB7XHJcbiAgICAgIC8vIENyZWF0aW5nIHRhcCB0YXJnZXRcclxuICAgICAgdGhpcy53cmFwcGVyID0gdGhpcy4kZWwucGFyZW50KClbMF07XHJcbiAgICAgIHRoaXMud2F2ZUVsID0gJCh0aGlzLndyYXBwZXIpLmZpbmQoJy50YXAtdGFyZ2V0LXdhdmUnKVswXTtcclxuICAgICAgdGhpcy5vcmlnaW5FbCA9ICQodGhpcy53cmFwcGVyKS5maW5kKCcudGFwLXRhcmdldC1vcmlnaW4nKVswXTtcclxuICAgICAgdGhpcy5jb250ZW50RWwgPSB0aGlzLiRlbC5maW5kKCcudGFwLXRhcmdldC1jb250ZW50JylbMF07XHJcblxyXG4gICAgICAvLyBDcmVhdGluZyB3cmFwcGVyXHJcbiAgICAgIGlmICghJCh0aGlzLndyYXBwZXIpLmhhc0NsYXNzKCcudGFwLXRhcmdldC13cmFwcGVyJykpIHtcclxuICAgICAgICB0aGlzLndyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0aGlzLndyYXBwZXIuY2xhc3NMaXN0LmFkZCgndGFwLXRhcmdldC13cmFwcGVyJyk7XHJcbiAgICAgICAgdGhpcy4kZWwuYmVmb3JlKCQodGhpcy53cmFwcGVyKSk7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyLmFwcGVuZCh0aGlzLmVsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRpbmcgY29udGVudFxyXG4gICAgICBpZiAoIXRoaXMuY29udGVudEVsKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRFbC5jbGFzc0xpc3QuYWRkKCd0YXAtdGFyZ2V0LWNvbnRlbnQnKTtcclxuICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy5jb250ZW50RWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDcmVhdGluZyBmb3JlZ3JvdW5kIHdhdmVcclxuICAgICAgaWYgKCF0aGlzLndhdmVFbCkge1xyXG4gICAgICAgIHRoaXMud2F2ZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdGhpcy53YXZlRWwuY2xhc3NMaXN0LmFkZCgndGFwLXRhcmdldC13YXZlJyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0aW5nIG9yaWdpblxyXG4gICAgICAgIGlmICghdGhpcy5vcmlnaW5FbCkge1xyXG4gICAgICAgICAgdGhpcy5vcmlnaW5FbCA9IHRoaXMuJG9yaWdpbi5jbG9uZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgIHRoaXMub3JpZ2luRWwuYWRkQ2xhc3MoJ3RhcC10YXJnZXQtb3JpZ2luJyk7XHJcbiAgICAgICAgICB0aGlzLm9yaWdpbkVsLnJlbW92ZUF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICB0aGlzLm9yaWdpbkVsLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XHJcbiAgICAgICAgICB0aGlzLm9yaWdpbkVsID0gdGhpcy5vcmlnaW5FbFswXTtcclxuICAgICAgICAgIHRoaXMud2F2ZUVsLmFwcGVuZCh0aGlzLm9yaWdpbkVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmQodGhpcy53YXZlRWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgcG9zaXRpb25pbmdcclxuICAgICAqL1xyXG4gICAgX2NhbGN1bGF0ZVBvc2l0aW9uaW5nKCkge1xyXG4gICAgICAvLyBFbGVtZW50IG9yIHBhcmVudCBpcyBmaXhlZCBwb3NpdGlvbj9cclxuICAgICAgbGV0IGlzRml4ZWQgPSB0aGlzLiRvcmlnaW4uY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnO1xyXG4gICAgICBpZiAoIWlzRml4ZWQpIHtcclxuICAgICAgICBsZXQgcGFyZW50cyA9IHRoaXMuJG9yaWdpbi5wYXJlbnRzKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpc0ZpeGVkID0gJChwYXJlbnRzW2ldKS5jc3MoJ3Bvc2l0aW9uJykgPT0gJ2ZpeGVkJztcclxuICAgICAgICAgIGlmIChpc0ZpeGVkKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRpbmcgb3JpZ2luXHJcbiAgICAgIGxldCBvcmlnaW5XaWR0aCA9IHRoaXMuJG9yaWdpbi5vdXRlcldpZHRoKCk7XHJcbiAgICAgIGxldCBvcmlnaW5IZWlnaHQgPSB0aGlzLiRvcmlnaW4ub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgbGV0IG9yaWdpblRvcCA9IGlzRml4ZWRcclxuICAgICAgICA/IHRoaXMuJG9yaWdpbi5vZmZzZXQoKS50b3AgLSBNLmdldERvY3VtZW50U2Nyb2xsVG9wKClcclxuICAgICAgICA6IHRoaXMuJG9yaWdpbi5vZmZzZXQoKS50b3A7XHJcbiAgICAgIGxldCBvcmlnaW5MZWZ0ID0gaXNGaXhlZFxyXG4gICAgICAgID8gdGhpcy4kb3JpZ2luLm9mZnNldCgpLmxlZnQgLSBNLmdldERvY3VtZW50U2Nyb2xsTGVmdCgpXHJcbiAgICAgICAgOiB0aGlzLiRvcmlnaW4ub2Zmc2V0KCkubGVmdDtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0aW5nIHNjcmVlblxyXG4gICAgICBsZXQgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgbGV0IHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgbGV0IGNlbnRlclggPSB3aW5kb3dXaWR0aCAvIDI7XHJcbiAgICAgIGxldCBjZW50ZXJZID0gd2luZG93SGVpZ2h0IC8gMjtcclxuICAgICAgbGV0IGlzTGVmdCA9IG9yaWdpbkxlZnQgPD0gY2VudGVyWDtcclxuICAgICAgbGV0IGlzUmlnaHQgPSBvcmlnaW5MZWZ0ID4gY2VudGVyWDtcclxuICAgICAgbGV0IGlzVG9wID0gb3JpZ2luVG9wIDw9IGNlbnRlclk7XHJcbiAgICAgIGxldCBpc0JvdHRvbSA9IG9yaWdpblRvcCA+IGNlbnRlclk7XHJcbiAgICAgIGxldCBpc0NlbnRlclggPSBvcmlnaW5MZWZ0ID49IHdpbmRvd1dpZHRoICogMC4yNSAmJiBvcmlnaW5MZWZ0IDw9IHdpbmRvd1dpZHRoICogMC43NTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0aW5nIHRhcCB0YXJnZXRcclxuICAgICAgbGV0IHRhcFRhcmdldFdpZHRoID0gdGhpcy4kZWwub3V0ZXJXaWR0aCgpO1xyXG4gICAgICBsZXQgdGFwVGFyZ2V0SGVpZ2h0ID0gdGhpcy4kZWwub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgbGV0IHRhcFRhcmdldFRvcCA9IG9yaWdpblRvcCArIG9yaWdpbkhlaWdodCAvIDIgLSB0YXBUYXJnZXRIZWlnaHQgLyAyO1xyXG4gICAgICBsZXQgdGFwVGFyZ2V0TGVmdCA9IG9yaWdpbkxlZnQgKyBvcmlnaW5XaWR0aCAvIDIgLSB0YXBUYXJnZXRXaWR0aCAvIDI7XHJcbiAgICAgIGxldCB0YXBUYXJnZXRQb3NpdGlvbiA9IGlzRml4ZWQgPyAnZml4ZWQnIDogJ2Fic29sdXRlJztcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0aW5nIGNvbnRlbnRcclxuICAgICAgbGV0IHRhcFRhcmdldFRleHRXaWR0aCA9IGlzQ2VudGVyWCA/IHRhcFRhcmdldFdpZHRoIDogdGFwVGFyZ2V0V2lkdGggLyAyICsgb3JpZ2luV2lkdGg7XHJcbiAgICAgIGxldCB0YXBUYXJnZXRUZXh0SGVpZ2h0ID0gdGFwVGFyZ2V0SGVpZ2h0IC8gMjtcclxuICAgICAgbGV0IHRhcFRhcmdldFRleHRUb3AgPSBpc1RvcCA/IHRhcFRhcmdldEhlaWdodCAvIDIgOiAwO1xyXG4gICAgICBsZXQgdGFwVGFyZ2V0VGV4dEJvdHRvbSA9IDA7XHJcbiAgICAgIGxldCB0YXBUYXJnZXRUZXh0TGVmdCA9IGlzTGVmdCAmJiAhaXNDZW50ZXJYID8gdGFwVGFyZ2V0V2lkdGggLyAyIC0gb3JpZ2luV2lkdGggOiAwO1xyXG4gICAgICBsZXQgdGFwVGFyZ2V0VGV4dFJpZ2h0ID0gMDtcclxuICAgICAgbGV0IHRhcFRhcmdldFRleHRQYWRkaW5nID0gb3JpZ2luV2lkdGg7XHJcbiAgICAgIGxldCB0YXBUYXJnZXRUZXh0QWxpZ24gPSBpc0JvdHRvbSA/ICdib3R0b20nIDogJ3RvcCc7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGluZyB3YXZlXHJcbiAgICAgIGxldCB0YXBUYXJnZXRXYXZlV2lkdGggPSBvcmlnaW5XaWR0aCA+IG9yaWdpbkhlaWdodCA/IG9yaWdpbldpZHRoICogMiA6IG9yaWdpbldpZHRoICogMjtcclxuICAgICAgbGV0IHRhcFRhcmdldFdhdmVIZWlnaHQgPSB0YXBUYXJnZXRXYXZlV2lkdGg7XHJcbiAgICAgIGxldCB0YXBUYXJnZXRXYXZlVG9wID0gdGFwVGFyZ2V0SGVpZ2h0IC8gMiAtIHRhcFRhcmdldFdhdmVIZWlnaHQgLyAyO1xyXG4gICAgICBsZXQgdGFwVGFyZ2V0V2F2ZUxlZnQgPSB0YXBUYXJnZXRXaWR0aCAvIDIgLSB0YXBUYXJnZXRXYXZlV2lkdGggLyAyO1xyXG5cclxuICAgICAgLy8gU2V0dGluZyB0YXAgdGFyZ2V0XHJcbiAgICAgIGxldCB0YXBUYXJnZXRXcmFwcGVyQ3NzT2JqID0ge307XHJcbiAgICAgIHRhcFRhcmdldFdyYXBwZXJDc3NPYmoudG9wID0gaXNUb3AgPyB0YXBUYXJnZXRUb3AgKyAncHgnIDogJyc7XHJcbiAgICAgIHRhcFRhcmdldFdyYXBwZXJDc3NPYmoucmlnaHQgPSBpc1JpZ2h0XHJcbiAgICAgICAgPyB3aW5kb3dXaWR0aCAtIHRhcFRhcmdldExlZnQgLSB0YXBUYXJnZXRXaWR0aCArICdweCdcclxuICAgICAgICA6ICcnO1xyXG4gICAgICB0YXBUYXJnZXRXcmFwcGVyQ3NzT2JqLmJvdHRvbSA9IGlzQm90dG9tXHJcbiAgICAgICAgPyB3aW5kb3dIZWlnaHQgLSB0YXBUYXJnZXRUb3AgLSB0YXBUYXJnZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgOiAnJztcclxuICAgICAgdGFwVGFyZ2V0V3JhcHBlckNzc09iai5sZWZ0ID0gaXNMZWZ0ID8gdGFwVGFyZ2V0TGVmdCArICdweCcgOiAnJztcclxuICAgICAgdGFwVGFyZ2V0V3JhcHBlckNzc09iai5wb3NpdGlvbiA9IHRhcFRhcmdldFBvc2l0aW9uO1xyXG4gICAgICAkKHRoaXMud3JhcHBlcikuY3NzKHRhcFRhcmdldFdyYXBwZXJDc3NPYmopO1xyXG5cclxuICAgICAgLy8gU2V0dGluZyBjb250ZW50XHJcbiAgICAgICQodGhpcy5jb250ZW50RWwpLmNzcyh7XHJcbiAgICAgICAgd2lkdGg6IHRhcFRhcmdldFRleHRXaWR0aCArICdweCcsXHJcbiAgICAgICAgaGVpZ2h0OiB0YXBUYXJnZXRUZXh0SGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICB0b3A6IHRhcFRhcmdldFRleHRUb3AgKyAncHgnLFxyXG4gICAgICAgIHJpZ2h0OiB0YXBUYXJnZXRUZXh0UmlnaHQgKyAncHgnLFxyXG4gICAgICAgIGJvdHRvbTogdGFwVGFyZ2V0VGV4dEJvdHRvbSArICdweCcsXHJcbiAgICAgICAgbGVmdDogdGFwVGFyZ2V0VGV4dExlZnQgKyAncHgnLFxyXG4gICAgICAgIHBhZGRpbmc6IHRhcFRhcmdldFRleHRQYWRkaW5nICsgJ3B4JyxcclxuICAgICAgICB2ZXJ0aWNhbEFsaWduOiB0YXBUYXJnZXRUZXh0QWxpZ25cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBTZXR0aW5nIHdhdmVcclxuICAgICAgJCh0aGlzLndhdmVFbCkuY3NzKHtcclxuICAgICAgICB0b3A6IHRhcFRhcmdldFdhdmVUb3AgKyAncHgnLFxyXG4gICAgICAgIGxlZnQ6IHRhcFRhcmdldFdhdmVMZWZ0ICsgJ3B4JyxcclxuICAgICAgICB3aWR0aDogdGFwVGFyZ2V0V2F2ZVdpZHRoICsgJ3B4JyxcclxuICAgICAgICBoZWlnaHQ6IHRhcFRhcmdldFdhdmVIZWlnaHQgKyAncHgnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbiBUYXBUYXJnZXRcclxuICAgICAqL1xyXG4gICAgb3BlbigpIHtcclxuICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBvbk9wZW4gY2FsbGJhY2tcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uT3Blbi5jYWxsKHRoaXMsIHRoaXMuJG9yaWdpblswXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQsIHRydWUpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0JvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIFRhcCBUYXJnZXRcclxuICAgICAqL1xyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG9uQ2xvc2UgY2FsbGJhY2tcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlLmNhbGwodGhpcywgdGhpcy4kb3JpZ2luWzBdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQsIHRydWUpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0JvdW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE0uVGFwVGFyZ2V0ID0gVGFwVGFyZ2V0O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoVGFwVGFyZ2V0LCAndGFwVGFyZ2V0JywgJ01fVGFwVGFyZ2V0Jyk7XHJcbiAgfVxyXG59KShjYXNoKTtcclxuIl0sImZpbGUiOiJ0YXBUYXJnZXQuanMifQ==
