(function($, anim) {
  'use strict';

  let _defaults = {
    direction: 'top',
    hoverEnabled: true,
    toolbarEnabled: false
  };

  $.fn.reverse = [].reverse;

  /**
   * @class
   *
   */
  class FloatingActionButton extends Component {
    /**
     * Construct FloatingActionButton instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(FloatingActionButton, el, options);

      this.el.M_FloatingActionButton = this;

      /**
       * Options for the fab
       * @member FloatingActionButton#options
       * @prop {Boolean} [direction] - Direction fab menu opens
       * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
       * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
       */
      this.options = $.extend({}, FloatingActionButton.defaults, options);

      this.isOpen = false;
      this.$anchor = this.$el.children('a').first();
      this.$menu = this.$el.children('ul').first();
      this.$floatingBtns = this.$el.find('ul .btn-floating');
      this.$floatingBtnsReverse = this.$el.find('ul .btn-floating').reverse();
      this.offsetY = 0;
      this.offsetX = 0;

      this.$el.addClass(`direction-${this.options.direction}`);
      if (this.options.direction === 'top') {
        this.offsetY = 40;
      } else if (this.options.direction === 'right') {
        this.offsetX = -40;
      } else if (this.options.direction === 'bottom') {
        this.offsetY = -40;
      } else {
        this.offsetX = 40;
      }
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
      return domElem.M_FloatingActionButton;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_FloatingActionButton = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleFABClickBound = this._handleFABClick.bind(this);
      this._handleOpenBound = this.open.bind(this);
      this._handleCloseBound = this.close.bind(this);

      if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
        this.el.addEventListener('mouseenter', this._handleOpenBound);
        this.el.addEventListener('mouseleave', this._handleCloseBound);
      } else {
        this.el.addEventListener('click', this._handleFABClickBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
        this.el.removeEventListener('mouseenter', this._handleOpenBound);
        this.el.removeEventListener('mouseleave', this._handleCloseBound);
      } else {
        this.el.removeEventListener('click', this._handleFABClickBound);
      }
    }

    /**
     * Handle FAB Click
     */
    _handleFABClick() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Handle Document Click
     * @param {Event} e
     */
    _handleDocumentClick(e) {
      if (!$(e.target).closest(this.$menu).length) {
        this.close();
      }
    }

    /**
     * Open FAB
     */
    open() {
      if (this.isOpen) {
        return;
      }

      if (this.options.toolbarEnabled) {
        this._animateInToolbar();
      } else {
        this._animateInFAB();
      }
      this.isOpen = true;
    }

    /**
     * Close FAB
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      if (this.options.toolbarEnabled) {
        window.removeEventListener('scroll', this._handleCloseBound, true);
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        this._animateOutToolbar();
      } else {
        this._animateOutFAB();
      }
      this.isOpen = false;
    }

    /**
     * Classic FAB Menu open
     */
    _animateInFAB() {
      this.$el.addClass('active');

      let time = 0;
      this.$floatingBtnsReverse.each((el) => {
        anim({
          targets: el,
          opacity: 1,
          scale: [0.4, 1],
          translateY: [this.offsetY, 0],
          translateX: [this.offsetX, 0],
          duration: 275,
          delay: time,
          easing: 'easeInOutQuad'
        });
        time += 40;
      });
    }

    /**
     * Classic FAB Menu close
     */
    _animateOutFAB() {
      this.$floatingBtnsReverse.each((el) => {
        anim.remove(el);
        anim({
          targets: el,
          opacity: 0,
          scale: 0.4,
          translateY: this.offsetY,
          translateX: this.offsetX,
          duration: 175,
          easing: 'easeOutQuad',
          complete: () => {
            this.$el.removeClass('active');
          }
        });
      });
    }

    /**
     * Toolbar transition Menu open
     */
    _animateInToolbar() {
      let scaleFactor;
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let btnRect = this.el.getBoundingClientRect();
      let backdrop = $('<div class="fab-backdrop"></div>');
      let fabColor = this.$anchor.css('background-color');
      this.$anchor.append(backdrop);

      this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
      this.offsetY = windowHeight - btnRect.bottom;
      scaleFactor = windowWidth / backdrop[0].clientWidth;
      this.btnBottom = btnRect.bottom;
      this.btnLeft = btnRect.left;
      this.btnWidth = btnRect.width;

      // Set initial state
      this.$el.addClass('active');
      this.$el.css({
        'text-align': 'center',
        width: '100%',
        bottom: 0,
        left: 0,
        transform: 'translateX(' + this.offsetX + 'px)',
        transition: 'none'
      });
      this.$anchor.css({
        transform: 'translateY(' + -this.offsetY + 'px)',
        transition: 'none'
      });
      backdrop.css({
        'background-color': fabColor
      });

      setTimeout(() => {
        this.$el.css({
          transform: '',
          transition:
            'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
        });
        this.$anchor.css({
          overflow: 'visible',
          transform: '',
          transition: 'transform .2s'
        });

        setTimeout(() => {
          this.$el.css({
            overflow: 'hidden',
            'background-color': fabColor
          });
          backdrop.css({
            transform: 'scale(' + scaleFactor + ')',
            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
          });
          this.$menu
            .children('li')
            .children('a')
            .css({
              opacity: 1
            });

          // Scroll to close.
          this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
          window.addEventListener('scroll', this._handleCloseBound, true);
          document.body.addEventListener('click', this._handleDocumentClickBound, true);
        }, 100);
      }, 0);
    }

    /**
     * Toolbar transition Menu close
     */
    _animateOutToolbar() {
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let backdrop = this.$el.find('.fab-backdrop');
      let fabColor = this.$anchor.css('background-color');

      this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
      this.offsetY = windowHeight - this.btnBottom;

      // Hide backdrop
      this.$el.removeClass('active');
      this.$el.css({
        'background-color': 'transparent',
        transition: 'none'
      });
      this.$anchor.css({
        transition: 'none'
      });
      backdrop.css({
        transform: 'scale(0)',
        'background-color': fabColor
      });
      this.$menu
        .children('li')
        .children('a')
        .css({
          opacity: ''
        });

      setTimeout(() => {
        backdrop.remove();

        // Set initial state.
        this.$el.css({
          'text-align': '',
          width: '',
          bottom: '',
          left: '',
          overflow: '',
          'background-color': '',
          transform: 'translate3d(' + -this.offsetX + 'px,0,0)'
        });
        this.$anchor.css({
          overflow: '',
          transform: 'translate3d(0,' + this.offsetY + 'px,0)'
        });

        setTimeout(() => {
          this.$el.css({
            transform: 'translate3d(0,0,0)',
            transition: 'transform .2s'
          });
          this.$anchor.css({
            transform: 'translate3d(0,0,0)',
            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
          });
        }, 20);
      }, 200);
    }
  }

  M.FloatingActionButton = FloatingActionButton;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(
      FloatingActionButton,
      'floatingActionButton',
      'M_FloatingActionButton'
    );
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJidXR0b25zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBhbmltKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgZGlyZWN0aW9uOiAndG9wJyxcclxuICAgIGhvdmVyRW5hYmxlZDogdHJ1ZSxcclxuICAgIHRvb2xiYXJFbmFibGVkOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gICQuZm4ucmV2ZXJzZSA9IFtdLnJldmVyc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcbiAgY2xhc3MgRmxvYXRpbmdBY3Rpb25CdXR0b24gZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgRmxvYXRpbmdBY3Rpb25CdXR0b24gaW5zdGFuY2VcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgc3VwZXIoRmxvYXRpbmdBY3Rpb25CdXR0b24sIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9GbG9hdGluZ0FjdGlvbkJ1dHRvbiA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIGZhYlxyXG4gICAgICAgKiBAbWVtYmVyIEZsb2F0aW5nQWN0aW9uQnV0dG9uI29wdGlvbnNcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtkaXJlY3Rpb25dIC0gRGlyZWN0aW9uIGZhYiBtZW51IG9wZW5zXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBbaG92ZXJFbmFibGVkPXRydWVdIC0gRW5hYmxlIGhvdmVyIHZzIGNsaWNrXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBbdG9vbGJhckVuYWJsZWQ9ZmFsc2VdIC0gRW5hYmxlIHRvb2xiYXIgdHJhbnNpdGlvblxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEZsb2F0aW5nQWN0aW9uQnV0dG9uLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuJGFuY2hvciA9IHRoaXMuJGVsLmNoaWxkcmVuKCdhJykuZmlyc3QoKTtcclxuICAgICAgdGhpcy4kbWVudSA9IHRoaXMuJGVsLmNoaWxkcmVuKCd1bCcpLmZpcnN0KCk7XHJcbiAgICAgIHRoaXMuJGZsb2F0aW5nQnRucyA9IHRoaXMuJGVsLmZpbmQoJ3VsIC5idG4tZmxvYXRpbmcnKTtcclxuICAgICAgdGhpcy4kZmxvYXRpbmdCdG5zUmV2ZXJzZSA9IHRoaXMuJGVsLmZpbmQoJ3VsIC5idG4tZmxvYXRpbmcnKS5yZXZlcnNlKCk7XHJcbiAgICAgIHRoaXMub2Zmc2V0WSA9IDA7XHJcbiAgICAgIHRoaXMub2Zmc2V0WCA9IDA7XHJcblxyXG4gICAgICB0aGlzLiRlbC5hZGRDbGFzcyhgZGlyZWN0aW9uLSR7dGhpcy5vcHRpb25zLmRpcmVjdGlvbn1gKTtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICd0b3AnKSB7XHJcbiAgICAgICAgdGhpcy5vZmZzZXRZID0gNDA7XHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0WCA9IC00MDtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnYm90dG9tJykge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0WSA9IC00MDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm9mZnNldFggPSA0MDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKCkge1xyXG4gICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gc3VwZXIuaW5pdCh0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICBsZXQgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgcmV0dXJuIGRvbUVsZW0uTV9GbG9hdGluZ0FjdGlvbkJ1dHRvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIHRoaXMuZWwuTV9GbG9hdGluZ0FjdGlvbkJ1dHRvbiA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUZBQkNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVGQUJDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVPcGVuQm91bmQgPSB0aGlzLm9wZW4uYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlQ2xvc2VCb3VuZCA9IHRoaXMuY2xvc2UuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaG92ZXJFbmFibGVkICYmICF0aGlzLm9wdGlvbnMudG9vbGJhckVuYWJsZWQpIHtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9oYW5kbGVPcGVuQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZUNsb3NlQm91bmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVGQUJDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmhvdmVyRW5hYmxlZCAmJiAhdGhpcy5vcHRpb25zLnRvb2xiYXJFbmFibGVkKSB7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5faGFuZGxlT3BlbkJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVDbG9zZUJvdW5kKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRkFCQ2xpY2tCb3VuZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBGQUIgQ2xpY2tcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUZBQkNsaWNrKCkge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBEb2N1bWVudCBDbGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlRG9jdW1lbnRDbGljayhlKSB7XHJcbiAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCh0aGlzLiRtZW51KS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gRkFCXHJcbiAgICAgKi9cclxuICAgIG9wZW4oKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy50b29sYmFyRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGVJblRvb2xiYXIoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9hbmltYXRlSW5GQUIoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBGQUJcclxuICAgICAqL1xyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudG9vbGJhckVuYWJsZWQpIHtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5faGFuZGxlQ2xvc2VCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU91dFRvb2xiYXIoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9hbmltYXRlT3V0RkFCKCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzaWMgRkFCIE1lbnUgb3BlblxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZUluRkFCKCkge1xyXG4gICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICBsZXQgdGltZSA9IDA7XHJcbiAgICAgIHRoaXMuJGZsb2F0aW5nQnRuc1JldmVyc2UuZWFjaCgoZWwpID0+IHtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IGVsLFxyXG4gICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgIHNjYWxlOiBbMC40LCAxXSxcclxuICAgICAgICAgIHRyYW5zbGF0ZVk6IFt0aGlzLm9mZnNldFksIDBdLFxyXG4gICAgICAgICAgdHJhbnNsYXRlWDogW3RoaXMub2Zmc2V0WCwgMF0sXHJcbiAgICAgICAgICBkdXJhdGlvbjogMjc1LFxyXG4gICAgICAgICAgZGVsYXk6IHRpbWUsXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlSW5PdXRRdWFkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRpbWUgKz0gNDA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3NpYyBGQUIgTWVudSBjbG9zZVxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZU91dEZBQigpIHtcclxuICAgICAgdGhpcy4kZmxvYXRpbmdCdG5zUmV2ZXJzZS5lYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGFuaW0ucmVtb3ZlKGVsKTtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IGVsLFxyXG4gICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgIHNjYWxlOiAwLjQsXHJcbiAgICAgICAgICB0cmFuc2xhdGVZOiB0aGlzLm9mZnNldFksXHJcbiAgICAgICAgICB0cmFuc2xhdGVYOiB0aGlzLm9mZnNldFgsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMTc1LFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnLFxyXG4gICAgICAgICAgY29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvb2xiYXIgdHJhbnNpdGlvbiBNZW51IG9wZW5cclxuICAgICAqL1xyXG4gICAgX2FuaW1hdGVJblRvb2xiYXIoKSB7XHJcbiAgICAgIGxldCBzY2FsZUZhY3RvcjtcclxuICAgICAgbGV0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgIGxldCB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgIGxldCBidG5SZWN0ID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgbGV0IGJhY2tkcm9wID0gJCgnPGRpdiBjbGFzcz1cImZhYi1iYWNrZHJvcFwiPjwvZGl2PicpO1xyXG4gICAgICBsZXQgZmFiQ29sb3IgPSB0aGlzLiRhbmNob3IuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJyk7XHJcbiAgICAgIHRoaXMuJGFuY2hvci5hcHBlbmQoYmFja2Ryb3ApO1xyXG5cclxuICAgICAgdGhpcy5vZmZzZXRYID0gYnRuUmVjdC5sZWZ0IC0gd2luZG93V2lkdGggLyAyICsgYnRuUmVjdC53aWR0aCAvIDI7XHJcbiAgICAgIHRoaXMub2Zmc2V0WSA9IHdpbmRvd0hlaWdodCAtIGJ0blJlY3QuYm90dG9tO1xyXG4gICAgICBzY2FsZUZhY3RvciA9IHdpbmRvd1dpZHRoIC8gYmFja2Ryb3BbMF0uY2xpZW50V2lkdGg7XHJcbiAgICAgIHRoaXMuYnRuQm90dG9tID0gYnRuUmVjdC5ib3R0b207XHJcbiAgICAgIHRoaXMuYnRuTGVmdCA9IGJ0blJlY3QubGVmdDtcclxuICAgICAgdGhpcy5idG5XaWR0aCA9IGJ0blJlY3Qud2lkdGg7XHJcblxyXG4gICAgICAvLyBTZXQgaW5pdGlhbCBzdGF0ZVxyXG4gICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgIHRoaXMuJGVsLmNzcyh7XHJcbiAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcclxuICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgIGJvdHRvbTogMCxcclxuICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoJyArIHRoaXMub2Zmc2V0WCArICdweCknLFxyXG4gICAgICAgIHRyYW5zaXRpb246ICdub25lJ1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy4kYW5jaG9yLmNzcyh7XHJcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgnICsgLXRoaXMub2Zmc2V0WSArICdweCknLFxyXG4gICAgICAgIHRyYW5zaXRpb246ICdub25lJ1xyXG4gICAgICB9KTtcclxuICAgICAgYmFja2Ryb3AuY3NzKHtcclxuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IGZhYkNvbG9yXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy4kZWwuY3NzKHtcclxuICAgICAgICAgIHRyYW5zZm9ybTogJycsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uOlxyXG4gICAgICAgICAgICAndHJhbnNmb3JtIC4ycyBjdWJpYy1iZXppZXIoMC41NTAsIDAuMDg1LCAwLjY4MCwgMC41MzApLCBiYWNrZ3JvdW5kLWNvbG9yIDBzIGxpbmVhciAuMnMnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kYW5jaG9yLmNzcyh7XHJcbiAgICAgICAgICBvdmVyZmxvdzogJ3Zpc2libGUnLFxyXG4gICAgICAgICAgdHJhbnNmb3JtOiAnJyxcclxuICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gLjJzJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuJGVsLmNzcyh7XHJcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiBmYWJDb2xvclxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBiYWNrZHJvcC5jc3Moe1xyXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZSgnICsgc2NhbGVGYWN0b3IgKyAnKScsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gLjJzIGN1YmljLWJlemllcigwLjU1MCwgMC4wNTUsIDAuNjc1LCAwLjE5MCknXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuJG1lbnVcclxuICAgICAgICAgICAgLmNoaWxkcmVuKCdsaScpXHJcbiAgICAgICAgICAgIC5jaGlsZHJlbignYScpXHJcbiAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8gU2Nyb2xsIHRvIGNsb3NlLlxyXG4gICAgICAgICAgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlRG9jdW1lbnRDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX2hhbmRsZUNsb3NlQm91bmQsIHRydWUpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgfSwgMTAwKTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb29sYmFyIHRyYW5zaXRpb24gTWVudSBjbG9zZVxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZU91dFRvb2xiYXIoKSB7XHJcbiAgICAgIGxldCB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICBsZXQgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICBsZXQgYmFja2Ryb3AgPSB0aGlzLiRlbC5maW5kKCcuZmFiLWJhY2tkcm9wJyk7XHJcbiAgICAgIGxldCBmYWJDb2xvciA9IHRoaXMuJGFuY2hvci5jc3MoJ2JhY2tncm91bmQtY29sb3InKTtcclxuXHJcbiAgICAgIHRoaXMub2Zmc2V0WCA9IHRoaXMuYnRuTGVmdCAtIHdpbmRvd1dpZHRoIC8gMiArIHRoaXMuYnRuV2lkdGggLyAyO1xyXG4gICAgICB0aGlzLm9mZnNldFkgPSB3aW5kb3dIZWlnaHQgLSB0aGlzLmJ0bkJvdHRvbTtcclxuXHJcbiAgICAgIC8vIEhpZGUgYmFja2Ryb3BcclxuICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB0aGlzLiRlbC5jc3Moe1xyXG4gICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICB0cmFuc2l0aW9uOiAnbm9uZSdcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuJGFuY2hvci5jc3Moe1xyXG4gICAgICAgIHRyYW5zaXRpb246ICdub25lJ1xyXG4gICAgICB9KTtcclxuICAgICAgYmFja2Ryb3AuY3NzKHtcclxuICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZSgwKScsXHJcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiBmYWJDb2xvclxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy4kbWVudVxyXG4gICAgICAgIC5jaGlsZHJlbignbGknKVxyXG4gICAgICAgIC5jaGlsZHJlbignYScpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICBvcGFjaXR5OiAnJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYmFja2Ryb3AucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgIC8vIFNldCBpbml0aWFsIHN0YXRlLlxyXG4gICAgICAgIHRoaXMuJGVsLmNzcyh7XHJcbiAgICAgICAgICAndGV4dC1hbGlnbic6ICcnLFxyXG4gICAgICAgICAgd2lkdGg6ICcnLFxyXG4gICAgICAgICAgYm90dG9tOiAnJyxcclxuICAgICAgICAgIGxlZnQ6ICcnLFxyXG4gICAgICAgICAgb3ZlcmZsb3c6ICcnLFxyXG4gICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnJyxcclxuICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKCcgKyAtdGhpcy5vZmZzZXRYICsgJ3B4LDAsMCknXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kYW5jaG9yLmNzcyh7XHJcbiAgICAgICAgICBvdmVyZmxvdzogJycsXHJcbiAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCcgKyB0aGlzLm9mZnNldFkgKyAncHgsMCknXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy4kZWwuY3NzKHtcclxuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwwLDApJyxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3RyYW5zZm9ybSAuMnMnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuJGFuY2hvci5jc3Moe1xyXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLDAsMCknLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAndHJhbnNmb3JtIC4ycyBjdWJpYy1iZXppZXIoMC41NTAsIDAuMDU1LCAwLjY3NSwgMC4xOTApJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgMjApO1xyXG4gICAgICB9LCAyMDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTS5GbG9hdGluZ0FjdGlvbkJ1dHRvbiA9IEZsb2F0aW5nQWN0aW9uQnV0dG9uO1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoXHJcbiAgICAgIEZsb2F0aW5nQWN0aW9uQnV0dG9uLFxyXG4gICAgICAnZmxvYXRpbmdBY3Rpb25CdXR0b24nLFxyXG4gICAgICAnTV9GbG9hdGluZ0FjdGlvbkJ1dHRvbidcclxuICAgICk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuIl0sImZpbGUiOiJidXR0b25zLmpzIn0=
