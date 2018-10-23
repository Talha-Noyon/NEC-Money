(function($, anim) {
  'use strict';

  let _defaults = {
    opacity: 0.5,
    inDuration: 250,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true,
    dismissible: true,
    startingTop: '4%',
    endingTop: '10%'
  };

  /**
   * @class
   *
   */
  class Modal extends Component {
    /**
     * Construct Modal instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Modal, el, options);

      this.el.M_Modal = this;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=250] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before modal is opened
       * @prop {Function} onOpenEnd - Callback function called after modal is opened
       * @prop {Function} onCloseStart - Callback function called before modal is closed
       * @prop {Function} onCloseEnd - Callback function called after modal is closed
       * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
       * @prop {String} [startingTop='4%'] - startingTop
       * @prop {String} [endingTop='10%'] - endingTop
       */
      this.options = $.extend({}, Modal.defaults, options);

      /**
       * Describes open/close state of modal
       * @type {Boolean}
       */
      this.isOpen = false;

      this.id = this.$el.attr('id');
      this._openingTrigger = undefined;
      this.$overlay = $('<div class="modal-overlay"></div>');
      this.el.tabIndex = 0;
      this._nthModalOpened = 0;

      Modal._count++;
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
      return domElem.M_Modal;
    }

    /**
     * Teardown component
     */
    destroy() {
      Modal._count--;
      this._removeEventHandlers();
      this.el.removeAttribute('style');
      this.$overlay.remove();
      this.el.M_Modal = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
      this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

      if (Modal._count === 1) {
        document.body.addEventListener('click', this._handleTriggerClick);
      }
      this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
      this.el.addEventListener('click', this._handleModalCloseClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (Modal._count === 0) {
        document.body.removeEventListener('click', this._handleTriggerClick);
      }
      this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
      this.el.removeEventListener('click', this._handleModalCloseClickBound);
    }

    /**
     * Handle Trigger Click
     * @param {Event} e
     */
    _handleTriggerClick(e) {
      let $trigger = $(e.target).closest('.modal-trigger');
      if ($trigger.length) {
        let modalId = M.getIdFromTrigger($trigger[0]);
        let modalInstance = document.getElementById(modalId).M_Modal;
        if (modalInstance) {
          modalInstance.open($trigger);
        }
        e.preventDefault();
      }
    }

    /**
     * Handle Overlay Click
     */
    _handleOverlayClick() {
      if (this.options.dismissible) {
        this.close();
      }
    }

    /**
     * Handle Modal Close Click
     * @param {Event} e
     */
    _handleModalCloseClick(e) {
      let $closeTrigger = $(e.target).closest('.modal-close');
      if ($closeTrigger.length) {
        this.close();
      }
    }

    /**
     * Handle Keydown
     * @param {Event} e
     */
    _handleKeydown(e) {
      // ESC key
      if (e.keyCode === 27 && this.options.dismissible) {
        this.close();
      }
    }

    /**
     * Handle Focus
     * @param {Event} e
     */
    _handleFocus(e) {
      // Only trap focus if this modal is the last model opened (prevents loops in nested modals).
      if (!this.el.contains(e.target) && this._nthModalOpened === Modal._modalsOpen) {
        this.el.focus();
      }
    }

    /**
     * Animate in modal
     */
    _animateIn() {
      // Set initial styles
      $.extend(this.el.style, {
        display: 'block',
        opacity: 0
      });
      $.extend(this.$overlay[0].style, {
        display: 'block',
        opacity: 0
      });

      // Animate overlay
      anim({
        targets: this.$overlay[0],
        opacity: this.options.opacity,
        duration: this.options.inDuration,
        easing: 'easeOutQuad'
      });

      // Define modal animation options
      let enterAnimOptions = {
        targets: this.el,
        duration: this.options.inDuration,
        easing: 'easeOutCubic',
        // Handle modal onOpenEnd callback
        complete: () => {
          if (typeof this.options.onOpenEnd === 'function') {
            this.options.onOpenEnd.call(this, this.el, this._openingTrigger);
          }
        }
      };

      // Bottom sheet animation
      if (this.el.classList.contains('bottom-sheet')) {
        $.extend(enterAnimOptions, {
          bottom: 0,
          opacity: 1
        });
        anim(enterAnimOptions);

        // Normal modal animation
      } else {
        $.extend(enterAnimOptions, {
          top: [this.options.startingTop, this.options.endingTop],
          opacity: 1,
          scaleX: [0.8, 1],
          scaleY: [0.8, 1]
        });
        anim(enterAnimOptions);
      }
    }

    /**
     * Animate out modal
     */
    _animateOut() {
      // Animate overlay
      anim({
        targets: this.$overlay[0],
        opacity: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuart'
      });

      // Define modal animation options
      let exitAnimOptions = {
        targets: this.el,
        duration: this.options.outDuration,
        easing: 'easeOutCubic',
        // Handle modal ready callback
        complete: () => {
          this.el.style.display = 'none';
          this.$overlay.remove();

          // Call onCloseEnd callback
          if (typeof this.options.onCloseEnd === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      };

      // Bottom sheet animation
      if (this.el.classList.contains('bottom-sheet')) {
        $.extend(exitAnimOptions, {
          bottom: '-100%',
          opacity: 0
        });
        anim(exitAnimOptions);

        // Normal modal animation
      } else {
        $.extend(exitAnimOptions, {
          top: [this.options.endingTop, this.options.startingTop],
          opacity: 0,
          scaleX: 0.8,
          scaleY: 0.8
        });
        anim(exitAnimOptions);
      }
    }

    /**
     * Open Modal
     * @param {cash} [$trigger]
     */
    open($trigger) {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      Modal._modalsOpen++;
      this._nthModalOpened = Modal._modalsOpen;

      // Set Z-Index based on number of currently open modals
      this.$overlay[0].style.zIndex = 1000 + Modal._modalsOpen * 2;
      this.el.style.zIndex = 1000 + Modal._modalsOpen * 2 + 1;

      // Set opening trigger, undefined indicates modal was opened by javascript
      this._openingTrigger = !!$trigger ? $trigger[0] : undefined;

      // onOpenStart callback
      if (typeof this.options.onOpenStart === 'function') {
        this.options.onOpenStart.call(this, this.el, this._openingTrigger);
      }

      if (this.options.preventScrolling) {
        document.body.style.overflow = 'hidden';
      }

      this.el.classList.add('open');
      this.el.insertAdjacentElement('afterend', this.$overlay[0]);

      if (this.options.dismissible) {
        this._handleKeydownBound = this._handleKeydown.bind(this);
        this._handleFocusBound = this._handleFocus.bind(this);
        document.addEventListener('keydown', this._handleKeydownBound);
        document.addEventListener('focus', this._handleFocusBound, true);
      }

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);
      this._animateIn();

      // Focus modal
      this.el.focus();

      return this;
    }

    /**
     * Close Modal
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      Modal._modalsOpen--;
      this._nthModalOpened = 0;

      // Call onCloseStart callback
      if (typeof this.options.onCloseStart === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      this.el.classList.remove('open');

      // Enable body scrolling only if there are no more modals open.
      if (Modal._modalsOpen === 0) {
        document.body.style.overflow = '';
      }

      if (this.options.dismissible) {
        document.removeEventListener('keydown', this._handleKeydownBound);
        document.removeEventListener('focus', this._handleFocusBound, true);
      }

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);
      this._animateOut();
      return this;
    }
  }

  /**
   * @static
   * @memberof Modal
   */
  Modal._modalsOpen = 0;

  /**
   * @static
   * @memberof Modal
   */
  Modal._count = 0;

  M.Modal = Modal;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtb2RhbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIG9wYWNpdHk6IDAuNSxcclxuICAgIGluRHVyYXRpb246IDI1MCxcclxuICAgIG91dER1cmF0aW9uOiAyNTAsXHJcbiAgICBvbk9wZW5TdGFydDogbnVsbCxcclxuICAgIG9uT3BlbkVuZDogbnVsbCxcclxuICAgIG9uQ2xvc2VTdGFydDogbnVsbCxcclxuICAgIG9uQ2xvc2VFbmQ6IG51bGwsXHJcbiAgICBwcmV2ZW50U2Nyb2xsaW5nOiB0cnVlLFxyXG4gICAgZGlzbWlzc2libGU6IHRydWUsXHJcbiAgICBzdGFydGluZ1RvcDogJzQlJyxcclxuICAgIGVuZGluZ1RvcDogJzEwJSdcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIE1vZGFsIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IE1vZGFsIGluc3RhbmNlIGFuZCBzZXQgdXAgb3ZlcmxheVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihNb2RhbCwgZWwsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5NX01vZGFsID0gdGhpcztcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcHRpb25zIGZvciB0aGUgbW9kYWxcclxuICAgICAgICogQG1lbWJlciBNb2RhbCNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtvcGFjaXR5PTAuNV0gLSBPcGFjaXR5IG9mIHRoZSBtb2RhbCBvdmVybGF5XHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtpbkR1cmF0aW9uPTI1MF0gLSBMZW5ndGggaW4gbXMgb2YgZW50ZXIgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbb3V0RHVyYXRpb249MjUwXSAtIExlbmd0aCBpbiBtcyBvZiBleGl0IHRyYW5zaXRpb25cclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5TdGFydCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBiZWZvcmUgbW9kYWwgaXMgb3BlbmVkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25PcGVuRW5kIC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1vZGFsIGlzIG9wZW5lZFxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2VTdGFydCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBiZWZvcmUgbW9kYWwgaXMgY2xvc2VkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZUVuZCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBtb2RhbCBpcyBjbG9zZWRcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtkaXNtaXNzaWJsZT10cnVlXSAtIEFsbG93IG1vZGFsIHRvIGJlIGRpc21pc3NlZCBieSBrZXlib2FyZCBvciBvdmVybGF5IGNsaWNrXHJcbiAgICAgICAqIEBwcm9wIHtTdHJpbmd9IFtzdGFydGluZ1RvcD0nNCUnXSAtIHN0YXJ0aW5nVG9wXHJcbiAgICAgICAqIEBwcm9wIHtTdHJpbmd9IFtlbmRpbmdUb3A9JzEwJSddIC0gZW5kaW5nVG9wXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTW9kYWwuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBvcGVuL2Nsb3NlIHN0YXRlIG9mIG1vZGFsXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgIHRoaXMuaWQgPSB0aGlzLiRlbC5hdHRyKCdpZCcpO1xyXG4gICAgICB0aGlzLl9vcGVuaW5nVHJpZ2dlciA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhpcy4kb3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJtb2RhbC1vdmVybGF5XCI+PC9kaXY+Jyk7XHJcbiAgICAgIHRoaXMuZWwudGFiSW5kZXggPSAwO1xyXG4gICAgICB0aGlzLl9udGhNb2RhbE9wZW5lZCA9IDA7XHJcblxyXG4gICAgICBNb2RhbC5fY291bnQrKztcclxuICAgICAgdGhpcy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fTW9kYWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgTW9kYWwuX2NvdW50LS07XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XHJcbiAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlKCk7XHJcbiAgICAgIHRoaXMuZWwuTV9Nb2RhbCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZU92ZXJsYXlDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlT3ZlcmxheUNsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZU1vZGFsQ2xvc2VDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlTW9kYWxDbG9zZUNsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICBpZiAoTW9kYWwuX2NvdW50ID09PSAxKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRyaWdnZXJDbGljayk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy4kb3ZlcmxheVswXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZU92ZXJsYXlDbGlja0JvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZU1vZGFsQ2xvc2VDbGlja0JvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgaWYgKE1vZGFsLl9jb3VudCA9PT0gMCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUcmlnZ2VyQ2xpY2spO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuJG92ZXJsYXlbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVPdmVybGF5Q2xpY2tCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVNb2RhbENsb3NlQ2xpY2tCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgVHJpZ2dlciBDbGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlVHJpZ2dlckNsaWNrKGUpIHtcclxuICAgICAgbGV0ICR0cmlnZ2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsLXRyaWdnZXInKTtcclxuICAgICAgaWYgKCR0cmlnZ2VyLmxlbmd0aCkge1xyXG4gICAgICAgIGxldCBtb2RhbElkID0gTS5nZXRJZEZyb21UcmlnZ2VyKCR0cmlnZ2VyWzBdKTtcclxuICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vZGFsSWQpLk1fTW9kYWw7XHJcbiAgICAgICAgaWYgKG1vZGFsSW5zdGFuY2UpIHtcclxuICAgICAgICAgIG1vZGFsSW5zdGFuY2Uub3BlbigkdHJpZ2dlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIE92ZXJsYXkgQ2xpY2tcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZU92ZXJsYXlDbGljaygpIHtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXNtaXNzaWJsZSkge1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIE1vZGFsIENsb3NlIENsaWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVNb2RhbENsb3NlQ2xpY2soZSkge1xyXG4gICAgICBsZXQgJGNsb3NlVHJpZ2dlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbC1jbG9zZScpO1xyXG4gICAgICBpZiAoJGNsb3NlVHJpZ2dlci5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBLZXlkb3duXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVLZXlkb3duKGUpIHtcclxuICAgICAgLy8gRVNDIGtleVxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLm9wdGlvbnMuZGlzbWlzc2libGUpIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBGb2N1c1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlRm9jdXMoZSkge1xyXG4gICAgICAvLyBPbmx5IHRyYXAgZm9jdXMgaWYgdGhpcyBtb2RhbCBpcyB0aGUgbGFzdCBtb2RlbCBvcGVuZWQgKHByZXZlbnRzIGxvb3BzIGluIG5lc3RlZCBtb2RhbHMpLlxyXG4gICAgICBpZiAoIXRoaXMuZWwuY29udGFpbnMoZS50YXJnZXQpICYmIHRoaXMuX250aE1vZGFsT3BlbmVkID09PSBNb2RhbC5fbW9kYWxzT3Blbikge1xyXG4gICAgICAgIHRoaXMuZWwuZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW5pbWF0ZSBpbiBtb2RhbFxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZUluKCkge1xyXG4gICAgICAvLyBTZXQgaW5pdGlhbCBzdHlsZXNcclxuICAgICAgJC5leHRlbmQodGhpcy5lbC5zdHlsZSwge1xyXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICB9KTtcclxuICAgICAgJC5leHRlbmQodGhpcy4kb3ZlcmxheVswXS5zdHlsZSwge1xyXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEFuaW1hdGUgb3ZlcmxheVxyXG4gICAgICBhbmltKHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLiRvdmVybGF5WzBdLFxyXG4gICAgICAgIG9wYWNpdHk6IHRoaXMub3B0aW9ucy5vcGFjaXR5LFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBEZWZpbmUgbW9kYWwgYW5pbWF0aW9uIG9wdGlvbnNcclxuICAgICAgbGV0IGVudGVyQW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dEN1YmljJyxcclxuICAgICAgICAvLyBIYW5kbGUgbW9kYWwgb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgY29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uT3BlbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuRW5kLmNhbGwodGhpcywgdGhpcy5lbCwgdGhpcy5fb3BlbmluZ1RyaWdnZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEJvdHRvbSBzaGVldCBhbmltYXRpb25cclxuICAgICAgaWYgKHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdib3R0b20tc2hlZXQnKSkge1xyXG4gICAgICAgICQuZXh0ZW5kKGVudGVyQW5pbU9wdGlvbnMsIHtcclxuICAgICAgICAgIGJvdHRvbTogMCxcclxuICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICBhbmltKGVudGVyQW5pbU9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBOb3JtYWwgbW9kYWwgYW5pbWF0aW9uXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJC5leHRlbmQoZW50ZXJBbmltT3B0aW9ucywge1xyXG4gICAgICAgICAgdG9wOiBbdGhpcy5vcHRpb25zLnN0YXJ0aW5nVG9wLCB0aGlzLm9wdGlvbnMuZW5kaW5nVG9wXSxcclxuICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICBzY2FsZVg6IFswLjgsIDFdLFxyXG4gICAgICAgICAgc2NhbGVZOiBbMC44LCAxXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFuaW0oZW50ZXJBbmltT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGUgb3V0IG1vZGFsXHJcbiAgICAgKi9cclxuICAgIF9hbmltYXRlT3V0KCkge1xyXG4gICAgICAvLyBBbmltYXRlIG92ZXJsYXlcclxuICAgICAgYW5pbSh7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy4kb3ZlcmxheVswXSxcclxuICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIERlZmluZSBtb2RhbCBhbmltYXRpb24gb3B0aW9uc1xyXG4gICAgICBsZXQgZXhpdEFuaW1PcHRpb25zID0ge1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMuZWwsXHJcbiAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5vdXREdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0Q3ViaWMnLFxyXG4gICAgICAgIC8vIEhhbmRsZSBtb2RhbCByZWFkeSBjYWxsYmFja1xyXG4gICAgICAgIGNvbXBsZXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgIC8vIENhbGwgb25DbG9zZUVuZCBjYWxsYmFja1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DbG9zZUVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZUVuZC5jYWxsKHRoaXMsIHRoaXMuZWwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEJvdHRvbSBzaGVldCBhbmltYXRpb25cclxuICAgICAgaWYgKHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdib3R0b20tc2hlZXQnKSkge1xyXG4gICAgICAgICQuZXh0ZW5kKGV4aXRBbmltT3B0aW9ucywge1xyXG4gICAgICAgICAgYm90dG9tOiAnLTEwMCUnLFxyXG4gICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFuaW0oZXhpdEFuaW1PcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gTm9ybWFsIG1vZGFsIGFuaW1hdGlvblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQuZXh0ZW5kKGV4aXRBbmltT3B0aW9ucywge1xyXG4gICAgICAgICAgdG9wOiBbdGhpcy5vcHRpb25zLmVuZGluZ1RvcCwgdGhpcy5vcHRpb25zLnN0YXJ0aW5nVG9wXSxcclxuICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICBzY2FsZVg6IDAuOCxcclxuICAgICAgICAgIHNjYWxlWTogMC44XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYW5pbShleGl0QW5pbU9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcGVuIE1vZGFsXHJcbiAgICAgKiBAcGFyYW0ge2Nhc2h9IFskdHJpZ2dlcl1cclxuICAgICAqL1xyXG4gICAgb3BlbigkdHJpZ2dlcikge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgTW9kYWwuX21vZGFsc09wZW4rKztcclxuICAgICAgdGhpcy5fbnRoTW9kYWxPcGVuZWQgPSBNb2RhbC5fbW9kYWxzT3BlbjtcclxuXHJcbiAgICAgIC8vIFNldCBaLUluZGV4IGJhc2VkIG9uIG51bWJlciBvZiBjdXJyZW50bHkgb3BlbiBtb2RhbHNcclxuICAgICAgdGhpcy4kb3ZlcmxheVswXS5zdHlsZS56SW5kZXggPSAxMDAwICsgTW9kYWwuX21vZGFsc09wZW4gKiAyO1xyXG4gICAgICB0aGlzLmVsLnN0eWxlLnpJbmRleCA9IDEwMDAgKyBNb2RhbC5fbW9kYWxzT3BlbiAqIDIgKyAxO1xyXG5cclxuICAgICAgLy8gU2V0IG9wZW5pbmcgdHJpZ2dlciwgdW5kZWZpbmVkIGluZGljYXRlcyBtb2RhbCB3YXMgb3BlbmVkIGJ5IGphdmFzY3JpcHRcclxuICAgICAgdGhpcy5fb3BlbmluZ1RyaWdnZXIgPSAhISR0cmlnZ2VyID8gJHRyaWdnZXJbMF0gOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAvLyBvbk9wZW5TdGFydCBjYWxsYmFja1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydC5jYWxsKHRoaXMsIHRoaXMuZWwsIHRoaXMuX29wZW5pbmdUcmlnZ2VyKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmV2ZW50U2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcclxuICAgICAgdGhpcy5lbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgdGhpcy4kb3ZlcmxheVswXSk7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRpc21pc3NpYmxlKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlS2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlS2V5ZG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUZvY3VzQm91bmQgPSB0aGlzLl9oYW5kbGVGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVLZXlkb3duQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlRm9jdXNCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICBhbmltLnJlbW92ZSh0aGlzLiRvdmVybGF5WzBdKTtcclxuICAgICAgdGhpcy5fYW5pbWF0ZUluKCk7XHJcblxyXG4gICAgICAvLyBGb2N1cyBtb2RhbFxyXG4gICAgICB0aGlzLmVsLmZvY3VzKCk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIE1vZGFsXHJcbiAgICAgKi9cclxuICAgIGNsb3NlKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICBNb2RhbC5fbW9kYWxzT3Blbi0tO1xyXG4gICAgICB0aGlzLl9udGhNb2RhbE9wZW5lZCA9IDA7XHJcblxyXG4gICAgICAvLyBDYWxsIG9uQ2xvc2VTdGFydCBjYWxsYmFja1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0LmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xyXG5cclxuICAgICAgLy8gRW5hYmxlIGJvZHkgc2Nyb2xsaW5nIG9ubHkgaWYgdGhlcmUgYXJlIG5vIG1vcmUgbW9kYWxzIG9wZW4uXHJcbiAgICAgIGlmIChNb2RhbC5fbW9kYWxzT3BlbiA9PT0gMCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXNtaXNzaWJsZSkge1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVLZXlkb3duQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlRm9jdXNCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICBhbmltLnJlbW92ZSh0aGlzLiRvdmVybGF5WzBdKTtcclxuICAgICAgdGhpcy5fYW5pbWF0ZU91dCgpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgTW9kYWxcclxuICAgKi9cclxuICBNb2RhbC5fbW9kYWxzT3BlbiA9IDA7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgTW9kYWxcclxuICAgKi9cclxuICBNb2RhbC5fY291bnQgPSAwO1xyXG5cclxuICBNLk1vZGFsID0gTW9kYWw7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihNb2RhbCwgJ21vZGFsJywgJ01fTW9kYWwnKTtcclxuICB9XHJcbn0pKGNhc2gsIE0uYW5pbWUpO1xyXG4iXSwiZmlsZSI6Im1vZGFsLmpzIn0=
