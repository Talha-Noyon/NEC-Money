(function($, anim) {
  'use strict';

  let _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300
  };

  /**
   * @class
   *
   */
  class Collapsible extends Component {
    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Collapsible, el, options);

      this.el.M_Collapsible = this;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      this.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      this.$headers = this.$el.children('li').children('.collapsible-header');
      this.$headers.attr('tabindex', 0);

      this._setupEventHandlers();

      // Open first active
      let $activeBodies = this.$el.children('li.active').children('.collapsible-body');
      if (this.options.accordion) {
        // Handle Accordion
        $activeBodies.first().css('display', 'block');
      } else {
        // Handle Expandables
        $activeBodies.css('display', 'block');
      }
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
      return domElem.M_Collapsible;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Collapsible = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
      this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
      this.el.addEventListener('click', this._handleCollapsibleClickBound);
      this.$headers.each((header) => {
        header.addEventListener('keydown', this._handleCollapsibleKeydownBound);
      });
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleCollapsibleClickBound);
      this.$headers.each((header) => {
        header.removeEventListener('keydown', this._handleCollapsibleKeydownBound);
      });
    }

    /**
     * Handle Collapsible Click
     * @param {Event} e
     */
    _handleCollapsibleClick(e) {
      let $header = $(e.target).closest('.collapsible-header');
      if (e.target && $header.length) {
        let $collapsible = $header.closest('.collapsible');
        if ($collapsible[0] === this.el) {
          let $collapsibleLi = $header.closest('li');
          let $collapsibleLis = $collapsible.children('li');
          let isActive = $collapsibleLi[0].classList.contains('active');
          let index = $collapsibleLis.index($collapsibleLi);

          if (isActive) {
            this.close(index);
          } else {
            this.open(index);
          }
        }
      }
    }

    /**
     * Handle Collapsible Keydown
     * @param {Event} e
     */
    _handleCollapsibleKeydown(e) {
      if (e.keyCode === 13) {
        this._handleCollapsibleClickBound(e);
      }
    }

    /**
     * Animate in collapsible slide
     * @param {Number} index - 0th index of slide
     */
    _animateIn(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length) {
        let $body = $collapsibleLi.children('.collapsible-body');

        anim.remove($body[0]);
        $body.css({
          display: 'block',
          overflow: 'hidden',
          height: 0,
          paddingTop: '',
          paddingBottom: ''
        });

        let pTop = $body.css('padding-top');
        let pBottom = $body.css('padding-bottom');
        let finalHeight = $body[0].scrollHeight;
        $body.css({
          paddingTop: 0,
          paddingBottom: 0
        });

        anim({
          targets: $body[0],
          height: finalHeight,
          paddingTop: pTop,
          paddingBottom: pBottom,
          duration: this.options.inDuration,
          easing: 'easeInOutCubic',
          complete: (anim) => {
            $body.css({
              overflow: '',
              paddingTop: '',
              paddingBottom: '',
              height: ''
            });

            // onOpenEnd callback
            if (typeof this.options.onOpenEnd === 'function') {
              this.options.onOpenEnd.call(this, $collapsibleLi[0]);
            }
          }
        });
      }
    }

    /**
     * Animate out collapsible slide
     * @param {Number} index - 0th index of slide to open
     */
    _animateOut(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length) {
        let $body = $collapsibleLi.children('.collapsible-body');
        anim.remove($body[0]);
        $body.css('overflow', 'hidden');
        anim({
          targets: $body[0],
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: this.options.outDuration,
          easing: 'easeInOutCubic',
          complete: () => {
            $body.css({
              height: '',
              overflow: '',
              padding: '',
              display: ''
            });

            // onCloseEnd callback
            if (typeof this.options.onCloseEnd === 'function') {
              this.options.onCloseEnd.call(this, $collapsibleLi[0]);
            }
          }
        });
      }
    }

    /**
     * Open Collapsible
     * @param {Number} index - 0th index of slide
     */
    open(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {
        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, $collapsibleLi[0]);
        }

        // Handle accordion behavior
        if (this.options.accordion) {
          let $collapsibleLis = this.$el.children('li');
          let $activeLis = this.$el.children('li.active');
          $activeLis.each((el) => {
            let index = $collapsibleLis.index($(el));
            this.close(index);
          });
        }

        // Animate in
        $collapsibleLi[0].classList.add('active');
        this._animateIn(index);
      }
    }

    /**
     * Close Collapsible
     * @param {Number} index - 0th index of slide
     */
    close(index) {
      let $collapsibleLi = this.$el.children('li').eq(index);
      if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {
        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, $collapsibleLi[0]);
        }

        // Animate out
        $collapsibleLi[0].classList.remove('active');
        this._animateOut(index);
      }
    }
  }

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb2xsYXBzaWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIGFjY29yZGlvbjogdHJ1ZSxcclxuICAgIG9uT3BlblN0YXJ0OiB1bmRlZmluZWQsXHJcbiAgICBvbk9wZW5FbmQ6IHVuZGVmaW5lZCxcclxuICAgIG9uQ2xvc2VTdGFydDogdW5kZWZpbmVkLFxyXG4gICAgb25DbG9zZUVuZDogdW5kZWZpbmVkLFxyXG4gICAgaW5EdXJhdGlvbjogMzAwLFxyXG4gICAgb3V0RHVyYXRpb246IDMwMFxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcbiAgY2xhc3MgQ29sbGFwc2libGUgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgQ29sbGFwc2libGUgaW5zdGFuY2VcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgc3VwZXIoQ29sbGFwc2libGUsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9Db2xsYXBzaWJsZSA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIGNvbGxhcHNpYmxlXHJcbiAgICAgICAqIEBtZW1iZXIgQ29sbGFwc2libGUjb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW2FjY29yZGlvbj1mYWxzZV0gLSBUeXBlIG9mIHRoZSBjb2xsYXBzaWJsZVxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlblN0YXJ0IC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBjb2xsYXBzaWJsZSBpcyBvcGVuZWRcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5FbmQgLSBDYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgY29sbGFwc2libGUgaXMgb3BlbmVkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZVN0YXJ0IC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBjb2xsYXBzaWJsZSBpcyBjbG9zZWRcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkNsb3NlRW5kIC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGFmdGVyIGNvbGxhcHNpYmxlIGlzIGNsb3NlZFxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBpbkR1cmF0aW9uIC0gVHJhbnNpdGlvbiBpbiBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMuXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IG91dER1cmF0aW9uIC0gVHJhbnNpdGlvbiBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2libGUuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gU2V0dXAgdGFiIGluZGljZXNcclxuICAgICAgdGhpcy4kaGVhZGVycyA9IHRoaXMuJGVsLmNoaWxkcmVuKCdsaScpLmNoaWxkcmVuKCcuY29sbGFwc2libGUtaGVhZGVyJyk7XHJcbiAgICAgIHRoaXMuJGhlYWRlcnMuYXR0cigndGFiaW5kZXgnLCAwKTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG5cclxuICAgICAgLy8gT3BlbiBmaXJzdCBhY3RpdmVcclxuICAgICAgbGV0ICRhY3RpdmVCb2RpZXMgPSB0aGlzLiRlbC5jaGlsZHJlbignbGkuYWN0aXZlJykuY2hpbGRyZW4oJy5jb2xsYXBzaWJsZS1ib2R5Jyk7XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjb3JkaW9uKSB7XHJcbiAgICAgICAgLy8gSGFuZGxlIEFjY29yZGlvblxyXG4gICAgICAgICRhY3RpdmVCb2RpZXMuZmlyc3QoKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBIYW5kbGUgRXhwYW5kYWJsZXNcclxuICAgICAgICAkYWN0aXZlQm9kaWVzLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fQ29sbGFwc2libGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLmVsLk1fQ29sbGFwc2libGUgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNvbGxhcHNpYmxlS2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlQ29sbGFwc2libGVLZXlkb3duLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrQm91bmQpO1xyXG4gICAgICB0aGlzLiRoZWFkZXJzLmVhY2goKGhlYWRlcikgPT4ge1xyXG4gICAgICAgIGhlYWRlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlQ29sbGFwc2libGVLZXlkb3duQm91bmQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUNvbGxhcHNpYmxlQ2xpY2tCb3VuZCk7XHJcbiAgICAgIHRoaXMuJGhlYWRlcnMuZWFjaCgoaGVhZGVyKSA9PiB7XHJcbiAgICAgICAgaGVhZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUtleWRvd25Cb3VuZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIENvbGxhcHNpYmxlIENsaWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrKGUpIHtcclxuICAgICAgbGV0ICRoZWFkZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuY29sbGFwc2libGUtaGVhZGVyJyk7XHJcbiAgICAgIGlmIChlLnRhcmdldCAmJiAkaGVhZGVyLmxlbmd0aCkge1xyXG4gICAgICAgIGxldCAkY29sbGFwc2libGUgPSAkaGVhZGVyLmNsb3Nlc3QoJy5jb2xsYXBzaWJsZScpO1xyXG4gICAgICAgIGlmICgkY29sbGFwc2libGVbMF0gPT09IHRoaXMuZWwpIHtcclxuICAgICAgICAgIGxldCAkY29sbGFwc2libGVMaSA9ICRoZWFkZXIuY2xvc2VzdCgnbGknKTtcclxuICAgICAgICAgIGxldCAkY29sbGFwc2libGVMaXMgPSAkY29sbGFwc2libGUuY2hpbGRyZW4oJ2xpJyk7XHJcbiAgICAgICAgICBsZXQgaXNBY3RpdmUgPSAkY29sbGFwc2libGVMaVswXS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgbGV0IGluZGV4ID0gJGNvbGxhcHNpYmxlTGlzLmluZGV4KCRjb2xsYXBzaWJsZUxpKTtcclxuXHJcbiAgICAgICAgICBpZiAoaXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZShpbmRleCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm9wZW4oaW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIENvbGxhcHNpYmxlIEtleWRvd25cclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUNvbGxhcHNpYmxlS2V5ZG93bihlKSB7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ29sbGFwc2libGVDbGlja0JvdW5kKGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRlIGluIGNvbGxhcHNpYmxlIHNsaWRlXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSAwdGggaW5kZXggb2Ygc2xpZGVcclxuICAgICAqL1xyXG4gICAgX2FuaW1hdGVJbihpbmRleCkge1xyXG4gICAgICBsZXQgJGNvbGxhcHNpYmxlTGkgPSB0aGlzLiRlbC5jaGlsZHJlbignbGknKS5lcShpbmRleCk7XHJcbiAgICAgIGlmICgkY29sbGFwc2libGVMaS5sZW5ndGgpIHtcclxuICAgICAgICBsZXQgJGJvZHkgPSAkY29sbGFwc2libGVMaS5jaGlsZHJlbignLmNvbGxhcHNpYmxlLWJvZHknKTtcclxuXHJcbiAgICAgICAgYW5pbS5yZW1vdmUoJGJvZHlbMF0pO1xyXG4gICAgICAgICRib2R5LmNzcyh7XHJcbiAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxyXG4gICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxyXG4gICAgICAgICAgaGVpZ2h0OiAwLFxyXG4gICAgICAgICAgcGFkZGluZ1RvcDogJycsXHJcbiAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgcFRvcCA9ICRib2R5LmNzcygncGFkZGluZy10b3AnKTtcclxuICAgICAgICBsZXQgcEJvdHRvbSA9ICRib2R5LmNzcygncGFkZGluZy1ib3R0b20nKTtcclxuICAgICAgICBsZXQgZmluYWxIZWlnaHQgPSAkYm9keVswXS5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgJGJvZHkuY3NzKHtcclxuICAgICAgICAgIHBhZGRpbmdUb3A6IDAsXHJcbiAgICAgICAgICBwYWRkaW5nQm90dG9tOiAwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogJGJvZHlbMF0sXHJcbiAgICAgICAgICBoZWlnaHQ6IGZpbmFsSGVpZ2h0LFxyXG4gICAgICAgICAgcGFkZGluZ1RvcDogcFRvcCxcclxuICAgICAgICAgIHBhZGRpbmdCb3R0b206IHBCb3R0b20sXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlSW5PdXRDdWJpYycsXHJcbiAgICAgICAgICBjb21wbGV0ZTogKGFuaW0pID0+IHtcclxuICAgICAgICAgICAgJGJvZHkuY3NzKHtcclxuICAgICAgICAgICAgICBvdmVyZmxvdzogJycsXHJcbiAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJycsXHJcbiAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJycsXHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAnJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIG9uT3BlbkVuZCBjYWxsYmFja1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbk9wZW5FbmQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuRW5kLmNhbGwodGhpcywgJGNvbGxhcHNpYmxlTGlbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGUgb3V0IGNvbGxhcHNpYmxlIHNsaWRlXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSAwdGggaW5kZXggb2Ygc2xpZGUgdG8gb3BlblxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZU91dChpbmRleCkge1xyXG4gICAgICBsZXQgJGNvbGxhcHNpYmxlTGkgPSB0aGlzLiRlbC5jaGlsZHJlbignbGknKS5lcShpbmRleCk7XHJcbiAgICAgIGlmICgkY29sbGFwc2libGVMaS5sZW5ndGgpIHtcclxuICAgICAgICBsZXQgJGJvZHkgPSAkY29sbGFwc2libGVMaS5jaGlsZHJlbignLmNvbGxhcHNpYmxlLWJvZHknKTtcclxuICAgICAgICBhbmltLnJlbW92ZSgkYm9keVswXSk7XHJcbiAgICAgICAgJGJvZHkuY3NzKCdvdmVyZmxvdycsICdoaWRkZW4nKTtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6ICRib2R5WzBdLFxyXG4gICAgICAgICAgaGVpZ2h0OiAwLFxyXG4gICAgICAgICAgcGFkZGluZ1RvcDogMCxcclxuICAgICAgICAgIHBhZGRpbmdCb3R0b206IDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZUluT3V0Q3ViaWMnLFxyXG4gICAgICAgICAgY29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAgICAgJGJvZHkuY3NzKHtcclxuICAgICAgICAgICAgICBoZWlnaHQ6ICcnLFxyXG4gICAgICAgICAgICAgIG92ZXJmbG93OiAnJyxcclxuICAgICAgICAgICAgICBwYWRkaW5nOiAnJyxcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIG9uQ2xvc2VFbmQgY2FsbGJhY2tcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DbG9zZUVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwodGhpcywgJGNvbGxhcHNpYmxlTGlbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gQ29sbGFwc2libGVcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIDB0aCBpbmRleCBvZiBzbGlkZVxyXG4gICAgICovXHJcbiAgICBvcGVuKGluZGV4KSB7XHJcbiAgICAgIGxldCAkY29sbGFwc2libGVMaSA9IHRoaXMuJGVsLmNoaWxkcmVuKCdsaScpLmVxKGluZGV4KTtcclxuICAgICAgaWYgKCRjb2xsYXBzaWJsZUxpLmxlbmd0aCAmJiAhJGNvbGxhcHNpYmxlTGlbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xyXG4gICAgICAgIC8vIG9uT3BlblN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydC5jYWxsKHRoaXMsICRjb2xsYXBzaWJsZUxpWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBhY2NvcmRpb24gYmVoYXZpb3JcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFjY29yZGlvbikge1xyXG4gICAgICAgICAgbGV0ICRjb2xsYXBzaWJsZUxpcyA9IHRoaXMuJGVsLmNoaWxkcmVuKCdsaScpO1xyXG4gICAgICAgICAgbGV0ICRhY3RpdmVMaXMgPSB0aGlzLiRlbC5jaGlsZHJlbignbGkuYWN0aXZlJyk7XHJcbiAgICAgICAgICAkYWN0aXZlTGlzLmVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRjb2xsYXBzaWJsZUxpcy5pbmRleCgkKGVsKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoaW5kZXgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGluXHJcbiAgICAgICAgJGNvbGxhcHNpYmxlTGlbMF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZUluKGluZGV4KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xvc2UgQ29sbGFwc2libGVcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIDB0aCBpbmRleCBvZiBzbGlkZVxyXG4gICAgICovXHJcbiAgICBjbG9zZShpbmRleCkge1xyXG4gICAgICBsZXQgJGNvbGxhcHNpYmxlTGkgPSB0aGlzLiRlbC5jaGlsZHJlbignbGknKS5lcShpbmRleCk7XHJcbiAgICAgIGlmICgkY29sbGFwc2libGVMaS5sZW5ndGggJiYgJGNvbGxhcHNpYmxlTGlbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xyXG4gICAgICAgIC8vIG9uQ2xvc2VTdGFydCBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydC5jYWxsKHRoaXMsICRjb2xsYXBzaWJsZUxpWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgb3V0XHJcbiAgICAgICAgJGNvbGxhcHNpYmxlTGlbMF0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU91dChpbmRleCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIE0uQ29sbGFwc2libGUgPSBDb2xsYXBzaWJsZTtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKENvbGxhcHNpYmxlLCAnY29sbGFwc2libGUnLCAnTV9Db2xsYXBzaWJsZScpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbiJdLCJmaWxlIjoiY29sbGFwc2libGUuanMifQ==
