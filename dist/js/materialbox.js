(function($, anim) {
  'use strict';

  let _defaults = {
    inDuration: 275,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   *
   */
  class Materialbox extends Component {
    /**
     * Construct Materialbox instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Materialbox, el, options);

      this.el.M_Materialbox = this;

      /**
       * Options for the modal
       * @member Materialbox#options
       * @prop {Number} [inDuration=275] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before materialbox is opened
       * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
       * @prop {Function} onCloseStart - Callback function called before materialbox is closed
       * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
       */
      this.options = $.extend({}, Materialbox.defaults, options);

      this.overlayActive = false;
      this.doneAnimating = true;
      this.placeholder = $('<div></div>').addClass('material-placeholder');
      this.originalWidth = 0;
      this.originalHeight = 0;
      this.originInlineStyles = this.$el.attr('style');
      this.caption = this.el.getAttribute('data-caption') || '';

      // Wrap
      this.$el.before(this.placeholder);
      this.placeholder.append(this.$el);

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
      return domElem.M_Materialbox;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_Materialbox = undefined;

      // Unwrap image
      $(this.placeholder)
        .after(this.el)
        .remove();

      this.$el.removeAttr('style');
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
      this.el.addEventListener('click', this._handleMaterialboxClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleMaterialboxClickBound);
    }

    /**
     * Handle Materialbox Click
     * @param {Event} e
     */
    _handleMaterialboxClick(e) {
      // If already modal, return to original
      if (this.doneAnimating === false || (this.overlayActive && this.doneAnimating)) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Handle Window Scroll
     */
    _handleWindowScroll() {
      if (this.overlayActive) {
        this.close();
      }
    }

    /**
     * Handle Window Resize
     */
    _handleWindowResize() {
      if (this.overlayActive) {
        this.close();
      }
    }

    /**
     * Handle Window Resize
     * @param {Event} e
     */
    _handleWindowEscape(e) {
      // ESC key
      if (e.keyCode === 27 && this.doneAnimating && this.overlayActive) {
        this.close();
      }
    }

    /**
     * Find ancestors with overflow: hidden; and make visible
     */
    _makeAncestorsOverflowVisible() {
      this.ancestorsChanged = $();
      let ancestor = this.placeholder[0].parentNode;
      while (ancestor !== null && !$(ancestor).is(document)) {
        let curr = $(ancestor);
        if (curr.css('overflow') !== 'visible') {
          curr.css('overflow', 'visible');
          if (this.ancestorsChanged === undefined) {
            this.ancestorsChanged = curr;
          } else {
            this.ancestorsChanged = this.ancestorsChanged.add(curr);
          }
        }
        ancestor = ancestor.parentNode;
      }
    }

    /**
     * Animate image in
     */
    _animateImageIn() {
      let animOptions = {
        targets: this.el,
        height: [this.originalHeight, this.newHeight],
        width: [this.originalWidth, this.newWidth],
        left:
          M.getDocumentScrollLeft() +
          this.windowWidth / 2 -
          this.placeholder.offset().left -
          this.newWidth / 2,
        top:
          M.getDocumentScrollTop() +
          this.windowHeight / 2 -
          this.placeholder.offset().top -
          this.newHeight / 2,
        duration: this.options.inDuration,
        easing: 'easeOutQuad',
        complete: () => {
          this.doneAnimating = true;

          // onOpenEnd callback
          if (typeof this.options.onOpenEnd === 'function') {
            this.options.onOpenEnd.call(this, this.el);
          }
        }
      };

      // Override max-width or max-height if needed
      this.maxWidth = this.$el.css('max-width');
      this.maxHeight = this.$el.css('max-height');
      if (this.maxWidth !== 'none') {
        animOptions.maxWidth = this.newWidth;
      }
      if (this.maxHeight !== 'none') {
        animOptions.maxHeight = this.newHeight;
      }

      anim(animOptions);
    }

    /**
     * Animate image out
     */
    _animateImageOut() {
      let animOptions = {
        targets: this.el,
        width: this.originalWidth,
        height: this.originalHeight,
        left: 0,
        top: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          this.placeholder.css({
            height: '',
            width: '',
            position: '',
            top: '',
            left: ''
          });

          // Revert to width or height attribute
          if (this.attrWidth) {
            this.$el.attr('width', this.attrWidth);
          }
          if (this.attrHeight) {
            this.$el.attr('height', this.attrHeight);
          }

          this.$el.removeAttr('style');
          this.originInlineStyles && this.$el.attr('style', this.originInlineStyles);

          // Remove class
          this.$el.removeClass('active');
          this.doneAnimating = true;

          // Remove overflow overrides on ancestors
          if (this.ancestorsChanged.length) {
            this.ancestorsChanged.css('overflow', '');
          }

          // onCloseEnd callback
          if (typeof this.options.onCloseEnd === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      };

      anim(animOptions);
    }

    /**
     * Update open and close vars
     */
    _updateVars() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.caption = this.el.getAttribute('data-caption') || '';
    }

    /**
     * Open Materialbox
     */
    open() {
      this._updateVars();
      this.originalWidth = this.el.getBoundingClientRect().width;
      this.originalHeight = this.el.getBoundingClientRect().height;

      // Set states
      this.doneAnimating = false;
      this.$el.addClass('active');
      this.overlayActive = true;

      // onOpenStart callback
      if (typeof this.options.onOpenStart === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Set positioning for placeholder
      this.placeholder.css({
        width: this.placeholder[0].getBoundingClientRect().width + 'px',
        height: this.placeholder[0].getBoundingClientRect().height + 'px',
        position: 'relative',
        top: 0,
        left: 0
      });

      this._makeAncestorsOverflowVisible();

      // Set css on origin
      this.$el.css({
        position: 'absolute',
        'z-index': 1000,
        'will-change': 'left, top, width, height'
      });

      // Change from width or height attribute to css
      this.attrWidth = this.$el.attr('width');
      this.attrHeight = this.$el.attr('height');
      if (this.attrWidth) {
        this.$el.css('width', this.attrWidth + 'px');
        this.$el.removeAttr('width');
      }
      if (this.attrHeight) {
        this.$el.css('width', this.attrHeight + 'px');
        this.$el.removeAttr('height');
      }

      // Add overlay
      this.$overlay = $('<div id="materialbox-overlay"></div>')
        .css({
          opacity: 0
        })
        .one('click', () => {
          if (this.doneAnimating) {
            this.close();
          }
        });

      // Put before in origin image to preserve z-index layering.
      this.$el.before(this.$overlay);

      // Set dimensions if needed
      let overlayOffset = this.$overlay[0].getBoundingClientRect();
      this.$overlay.css({
        width: this.windowWidth + 'px',
        height: this.windowHeight + 'px',
        left: -1 * overlayOffset.left + 'px',
        top: -1 * overlayOffset.top + 'px'
      });

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);

      // Animate Overlay
      anim({
        targets: this.$overlay[0],
        opacity: 1,
        duration: this.options.inDuration,
        easing: 'easeOutQuad'
      });

      // Add and animate caption if it exists
      if (this.caption !== '') {
        if (this.$photocaption) {
          anim.remove(this.$photoCaption[0]);
        }
        this.$photoCaption = $('<div class="materialbox-caption"></div>');
        this.$photoCaption.text(this.caption);
        $('body').append(this.$photoCaption);
        this.$photoCaption.css({ display: 'inline' });

        anim({
          targets: this.$photoCaption[0],
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });
      }

      // Resize Image
      let ratio = 0;
      let widthPercent = this.originalWidth / this.windowWidth;
      let heightPercent = this.originalHeight / this.windowHeight;
      this.newWidth = 0;
      this.newHeight = 0;

      if (widthPercent > heightPercent) {
        ratio = this.originalHeight / this.originalWidth;
        this.newWidth = this.windowWidth * 0.9;
        this.newHeight = this.windowWidth * 0.9 * ratio;
      } else {
        ratio = this.originalWidth / this.originalHeight;
        this.newWidth = this.windowHeight * 0.9 * ratio;
        this.newHeight = this.windowHeight * 0.9;
      }

      this._animateImageIn();

      // Handle Exit triggers
      this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
      this._handleWindowResizeBound = this._handleWindowResize.bind(this);
      this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);

      window.addEventListener('scroll', this._handleWindowScrollBound);
      window.addEventListener('resize', this._handleWindowResizeBound);
      window.addEventListener('keyup', this._handleWindowEscapeBound);
    }

    /**
     * Close Materialbox
     */
    close() {
      this._updateVars();
      this.doneAnimating = false;

      // onCloseStart callback
      if (typeof this.options.onCloseStart === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      anim.remove(this.el);
      anim.remove(this.$overlay[0]);

      if (this.caption !== '') {
        anim.remove(this.$photoCaption[0]);
      }

      // disable exit handlers
      window.removeEventListener('scroll', this._handleWindowScrollBound);
      window.removeEventListener('resize', this._handleWindowResizeBound);
      window.removeEventListener('keyup', this._handleWindowEscapeBound);

      anim({
        targets: this.$overlay[0],
        opacity: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          this.overlayActive = false;
          this.$overlay.remove();
        }
      });

      this._animateImageOut();

      // Remove Caption + reset css settings on image
      if (this.caption !== '') {
        anim({
          targets: this.$photoCaption[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: () => {
            this.$photoCaption.remove();
          }
        });
      }
    }
  }

  M.Materialbox = Materialbox;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXRlcmlhbGJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIGluRHVyYXRpb246IDI3NSxcclxuICAgIG91dER1cmF0aW9uOiAyMDAsXHJcbiAgICBvbk9wZW5TdGFydDogbnVsbCxcclxuICAgIG9uT3BlbkVuZDogbnVsbCxcclxuICAgIG9uQ2xvc2VTdGFydDogbnVsbCxcclxuICAgIG9uQ2xvc2VFbmQ6IG51bGxcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIE1hdGVyaWFsYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IE1hdGVyaWFsYm94IGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKE1hdGVyaWFsYm94LCBlbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmVsLk1fTWF0ZXJpYWxib3ggPSB0aGlzO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBtb2RhbFxyXG4gICAgICAgKiBAbWVtYmVyIE1hdGVyaWFsYm94I29wdGlvbnNcclxuICAgICAgICogQHByb3Age051bWJlcn0gW2luRHVyYXRpb249Mjc1XSAtIExlbmd0aCBpbiBtcyBvZiBlbnRlciB0cmFuc2l0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtvdXREdXJhdGlvbj0yMDBdIC0gTGVuZ3RoIGluIG1zIG9mIGV4aXQgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlblN0YXJ0IC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBtYXRlcmlhbGJveCBpcyBvcGVuZWRcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5FbmQgLSBDYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbWF0ZXJpYWxib3ggaXMgb3BlbmVkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZVN0YXJ0IC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBtYXRlcmlhbGJveCBpcyBjbG9zZWRcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkNsb3NlRW5kIC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1hdGVyaWFsYm94IGlzIGNsb3NlZFxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE1hdGVyaWFsYm94LmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMub3ZlcmxheUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRvbmVBbmltYXRpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLnBsYWNlaG9sZGVyID0gJCgnPGRpdj48L2Rpdj4nKS5hZGRDbGFzcygnbWF0ZXJpYWwtcGxhY2Vob2xkZXInKTtcclxuICAgICAgdGhpcy5vcmlnaW5hbFdpZHRoID0gMDtcclxuICAgICAgdGhpcy5vcmlnaW5hbEhlaWdodCA9IDA7XHJcbiAgICAgIHRoaXMub3JpZ2luSW5saW5lU3R5bGVzID0gdGhpcy4kZWwuYXR0cignc3R5bGUnKTtcclxuICAgICAgdGhpcy5jYXB0aW9uID0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FwdGlvbicpIHx8ICcnO1xyXG5cclxuICAgICAgLy8gV3JhcFxyXG4gICAgICB0aGlzLiRlbC5iZWZvcmUodGhpcy5wbGFjZWhvbGRlcik7XHJcbiAgICAgIHRoaXMucGxhY2Vob2xkZXIuYXBwZW5kKHRoaXMuJGVsKTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX01hdGVyaWFsYm94O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5lbC5NX01hdGVyaWFsYm94ID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgLy8gVW53cmFwIGltYWdlXHJcbiAgICAgICQodGhpcy5wbGFjZWhvbGRlcilcclxuICAgICAgICAuYWZ0ZXIodGhpcy5lbClcclxuICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICB0aGlzLiRlbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlTWF0ZXJpYWxib3hDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlTWF0ZXJpYWxib3hDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlTWF0ZXJpYWxib3hDbGlja0JvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZU1hdGVyaWFsYm94Q2xpY2tCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgTWF0ZXJpYWxib3ggQ2xpY2tcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZU1hdGVyaWFsYm94Q2xpY2soZSkge1xyXG4gICAgICAvLyBJZiBhbHJlYWR5IG1vZGFsLCByZXR1cm4gdG8gb3JpZ2luYWxcclxuICAgICAgaWYgKHRoaXMuZG9uZUFuaW1hdGluZyA9PT0gZmFsc2UgfHwgKHRoaXMub3ZlcmxheUFjdGl2ZSAmJiB0aGlzLmRvbmVBbmltYXRpbmcpKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgV2luZG93IFNjcm9sbFxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlV2luZG93U2Nyb2xsKCkge1xyXG4gICAgICBpZiAodGhpcy5vdmVybGF5QWN0aXZlKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgV2luZG93IFJlc2l6ZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlV2luZG93UmVzaXplKCkge1xyXG4gICAgICBpZiAodGhpcy5vdmVybGF5QWN0aXZlKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgV2luZG93IFJlc2l6ZVxyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlV2luZG93RXNjYXBlKGUpIHtcclxuICAgICAgLy8gRVNDIGtleVxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLmRvbmVBbmltYXRpbmcgJiYgdGhpcy5vdmVybGF5QWN0aXZlKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGFuY2VzdG9ycyB3aXRoIG92ZXJmbG93OiBoaWRkZW47IGFuZCBtYWtlIHZpc2libGVcclxuICAgICAqL1xyXG4gICAgX21ha2VBbmNlc3RvcnNPdmVyZmxvd1Zpc2libGUoKSB7XHJcbiAgICAgIHRoaXMuYW5jZXN0b3JzQ2hhbmdlZCA9ICQoKTtcclxuICAgICAgbGV0IGFuY2VzdG9yID0gdGhpcy5wbGFjZWhvbGRlclswXS5wYXJlbnROb2RlO1xyXG4gICAgICB3aGlsZSAoYW5jZXN0b3IgIT09IG51bGwgJiYgISQoYW5jZXN0b3IpLmlzKGRvY3VtZW50KSkge1xyXG4gICAgICAgIGxldCBjdXJyID0gJChhbmNlc3Rvcik7XHJcbiAgICAgICAgaWYgKGN1cnIuY3NzKCdvdmVyZmxvdycpICE9PSAndmlzaWJsZScpIHtcclxuICAgICAgICAgIGN1cnIuY3NzKCdvdmVyZmxvdycsICd2aXNpYmxlJyk7XHJcbiAgICAgICAgICBpZiAodGhpcy5hbmNlc3RvcnNDaGFuZ2VkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmNlc3RvcnNDaGFuZ2VkID0gY3VycjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5jZXN0b3JzQ2hhbmdlZCA9IHRoaXMuYW5jZXN0b3JzQ2hhbmdlZC5hZGQoY3Vycik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3IucGFyZW50Tm9kZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW5pbWF0ZSBpbWFnZSBpblxyXG4gICAgICovXHJcbiAgICBfYW5pbWF0ZUltYWdlSW4oKSB7XHJcbiAgICAgIGxldCBhbmltT3B0aW9ucyA9IHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLmVsLFxyXG4gICAgICAgIGhlaWdodDogW3RoaXMub3JpZ2luYWxIZWlnaHQsIHRoaXMubmV3SGVpZ2h0XSxcclxuICAgICAgICB3aWR0aDogW3RoaXMub3JpZ2luYWxXaWR0aCwgdGhpcy5uZXdXaWR0aF0sXHJcbiAgICAgICAgbGVmdDpcclxuICAgICAgICAgIE0uZ2V0RG9jdW1lbnRTY3JvbGxMZWZ0KCkgK1xyXG4gICAgICAgICAgdGhpcy53aW5kb3dXaWR0aCAvIDIgLVxyXG4gICAgICAgICAgdGhpcy5wbGFjZWhvbGRlci5vZmZzZXQoKS5sZWZ0IC1cclxuICAgICAgICAgIHRoaXMubmV3V2lkdGggLyAyLFxyXG4gICAgICAgIHRvcDpcclxuICAgICAgICAgIE0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AoKSArXHJcbiAgICAgICAgICB0aGlzLndpbmRvd0hlaWdodCAvIDIgLVxyXG4gICAgICAgICAgdGhpcy5wbGFjZWhvbGRlci5vZmZzZXQoKS50b3AgLVxyXG4gICAgICAgICAgdGhpcy5uZXdIZWlnaHQgLyAyLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgY29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuZG9uZUFuaW1hdGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgLy8gb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbk9wZW5FbmQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlbkVuZC5jYWxsKHRoaXMsIHRoaXMuZWwpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIE92ZXJyaWRlIG1heC13aWR0aCBvciBtYXgtaGVpZ2h0IGlmIG5lZWRlZFxyXG4gICAgICB0aGlzLm1heFdpZHRoID0gdGhpcy4kZWwuY3NzKCdtYXgtd2lkdGgnKTtcclxuICAgICAgdGhpcy5tYXhIZWlnaHQgPSB0aGlzLiRlbC5jc3MoJ21heC1oZWlnaHQnKTtcclxuICAgICAgaWYgKHRoaXMubWF4V2lkdGggIT09ICdub25lJykge1xyXG4gICAgICAgIGFuaW1PcHRpb25zLm1heFdpZHRoID0gdGhpcy5uZXdXaWR0aDtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5tYXhIZWlnaHQgIT09ICdub25lJykge1xyXG4gICAgICAgIGFuaW1PcHRpb25zLm1heEhlaWdodCA9IHRoaXMubmV3SGVpZ2h0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhbmltKGFuaW1PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGUgaW1hZ2Ugb3V0XHJcbiAgICAgKi9cclxuICAgIF9hbmltYXRlSW1hZ2VPdXQoKSB7XHJcbiAgICAgIGxldCBhbmltT3B0aW9ucyA9IHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLmVsLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLm9yaWdpbmFsV2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLm9yaWdpbmFsSGVpZ2h0LFxyXG4gICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgdG9wOiAwLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyLmNzcyh7XHJcbiAgICAgICAgICAgIGhlaWdodDogJycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnJyxcclxuICAgICAgICAgICAgcG9zaXRpb246ICcnLFxyXG4gICAgICAgICAgICB0b3A6ICcnLFxyXG4gICAgICAgICAgICBsZWZ0OiAnJ1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8gUmV2ZXJ0IHRvIHdpZHRoIG9yIGhlaWdodCBhdHRyaWJ1dGVcclxuICAgICAgICAgIGlmICh0aGlzLmF0dHJXaWR0aCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5hdHRyKCd3aWR0aCcsIHRoaXMuYXR0cldpZHRoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0aGlzLmF0dHJIZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwuYXR0cignaGVpZ2h0JywgdGhpcy5hdHRySGVpZ2h0KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xyXG4gICAgICAgICAgdGhpcy5vcmlnaW5JbmxpbmVTdHlsZXMgJiYgdGhpcy4kZWwuYXR0cignc3R5bGUnLCB0aGlzLm9yaWdpbklubGluZVN0eWxlcyk7XHJcblxyXG4gICAgICAgICAgLy8gUmVtb3ZlIGNsYXNzXHJcbiAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICB0aGlzLmRvbmVBbmltYXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBvdmVyZmxvdyBvdmVycmlkZXMgb24gYW5jZXN0b3JzXHJcbiAgICAgICAgICBpZiAodGhpcy5hbmNlc3RvcnNDaGFuZ2VkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuY2VzdG9yc0NoYW5nZWQuY3NzKCdvdmVyZmxvdycsICcnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBvbkNsb3NlRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYW5pbShhbmltT3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgb3BlbiBhbmQgY2xvc2UgdmFyc1xyXG4gICAgICovXHJcbiAgICBfdXBkYXRlVmFycygpIHtcclxuICAgICAgdGhpcy53aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICB0aGlzLndpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgdGhpcy5jYXB0aW9uID0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FwdGlvbicpIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbiBNYXRlcmlhbGJveFxyXG4gICAgICovXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICB0aGlzLl91cGRhdGVWYXJzKCk7XHJcbiAgICAgIHRoaXMub3JpZ2luYWxXaWR0aCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgIHRoaXMub3JpZ2luYWxIZWlnaHQgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuXHJcbiAgICAgIC8vIFNldCBzdGF0ZXNcclxuICAgICAgdGhpcy5kb25lQW5pbWF0aW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgdGhpcy5vdmVybGF5QWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIG9uT3BlblN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0LmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNldCBwb3NpdGlvbmluZyBmb3IgcGxhY2Vob2xkZXJcclxuICAgICAgdGhpcy5wbGFjZWhvbGRlci5jc3Moe1xyXG4gICAgICAgIHdpZHRoOiB0aGlzLnBsYWNlaG9sZGVyWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoICsgJ3B4JyxcclxuICAgICAgICBoZWlnaHQ6IHRoaXMucGxhY2Vob2xkZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgbGVmdDogMFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuX21ha2VBbmNlc3RvcnNPdmVyZmxvd1Zpc2libGUoKTtcclxuXHJcbiAgICAgIC8vIFNldCBjc3Mgb24gb3JpZ2luXHJcbiAgICAgIHRoaXMuJGVsLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgJ3otaW5kZXgnOiAxMDAwLFxyXG4gICAgICAgICd3aWxsLWNoYW5nZSc6ICdsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQnXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2hhbmdlIGZyb20gd2lkdGggb3IgaGVpZ2h0IGF0dHJpYnV0ZSB0byBjc3NcclxuICAgICAgdGhpcy5hdHRyV2lkdGggPSB0aGlzLiRlbC5hdHRyKCd3aWR0aCcpO1xyXG4gICAgICB0aGlzLmF0dHJIZWlnaHQgPSB0aGlzLiRlbC5hdHRyKCdoZWlnaHQnKTtcclxuICAgICAgaWYgKHRoaXMuYXR0cldpZHRoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuY3NzKCd3aWR0aCcsIHRoaXMuYXR0cldpZHRoICsgJ3B4Jyk7XHJcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQXR0cignd2lkdGgnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5hdHRySGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy4kZWwuY3NzKCd3aWR0aCcsIHRoaXMuYXR0ckhlaWdodCArICdweCcpO1xyXG4gICAgICAgIHRoaXMuJGVsLnJlbW92ZUF0dHIoJ2hlaWdodCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgb3ZlcmxheVxyXG4gICAgICB0aGlzLiRvdmVybGF5ID0gJCgnPGRpdiBpZD1cIm1hdGVyaWFsYm94LW92ZXJsYXlcIj48L2Rpdj4nKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm9uZSgnY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5kb25lQW5pbWF0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFB1dCBiZWZvcmUgaW4gb3JpZ2luIGltYWdlIHRvIHByZXNlcnZlIHotaW5kZXggbGF5ZXJpbmcuXHJcbiAgICAgIHRoaXMuJGVsLmJlZm9yZSh0aGlzLiRvdmVybGF5KTtcclxuXHJcbiAgICAgIC8vIFNldCBkaW1lbnNpb25zIGlmIG5lZWRlZFxyXG4gICAgICBsZXQgb3ZlcmxheU9mZnNldCA9IHRoaXMuJG92ZXJsYXlbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIHRoaXMuJG92ZXJsYXkuY3NzKHtcclxuICAgICAgICB3aWR0aDogdGhpcy53aW5kb3dXaWR0aCArICdweCcsXHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLndpbmRvd0hlaWdodCArICdweCcsXHJcbiAgICAgICAgbGVmdDogLTEgKiBvdmVybGF5T2Zmc2V0LmxlZnQgKyAncHgnLFxyXG4gICAgICAgIHRvcDogLTEgKiBvdmVybGF5T2Zmc2V0LnRvcCArICdweCdcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhbmltLnJlbW92ZSh0aGlzLmVsKTtcclxuICAgICAgYW5pbS5yZW1vdmUodGhpcy4kb3ZlcmxheVswXSk7XHJcblxyXG4gICAgICAvLyBBbmltYXRlIE92ZXJsYXlcclxuICAgICAgYW5pbSh7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy4kb3ZlcmxheVswXSxcclxuICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBZGQgYW5kIGFuaW1hdGUgY2FwdGlvbiBpZiBpdCBleGlzdHNcclxuICAgICAgaWYgKHRoaXMuY2FwdGlvbiAhPT0gJycpIHtcclxuICAgICAgICBpZiAodGhpcy4kcGhvdG9jYXB0aW9uKSB7XHJcbiAgICAgICAgICBhbmltLnJlbW92ZSh0aGlzLiRwaG90b0NhcHRpb25bMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLiRwaG90b0NhcHRpb24gPSAkKCc8ZGl2IGNsYXNzPVwibWF0ZXJpYWxib3gtY2FwdGlvblwiPjwvZGl2PicpO1xyXG4gICAgICAgIHRoaXMuJHBob3RvQ2FwdGlvbi50ZXh0KHRoaXMuY2FwdGlvbik7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRwaG90b0NhcHRpb24pO1xyXG4gICAgICAgIHRoaXMuJHBob3RvQ2FwdGlvbi5jc3MoeyBkaXNwbGF5OiAnaW5saW5lJyB9KTtcclxuXHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRwaG90b0NhcHRpb25bMF0sXHJcbiAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5pbkR1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlc2l6ZSBJbWFnZVxyXG4gICAgICBsZXQgcmF0aW8gPSAwO1xyXG4gICAgICBsZXQgd2lkdGhQZXJjZW50ID0gdGhpcy5vcmlnaW5hbFdpZHRoIC8gdGhpcy53aW5kb3dXaWR0aDtcclxuICAgICAgbGV0IGhlaWdodFBlcmNlbnQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0IC8gdGhpcy53aW5kb3dIZWlnaHQ7XHJcbiAgICAgIHRoaXMubmV3V2lkdGggPSAwO1xyXG4gICAgICB0aGlzLm5ld0hlaWdodCA9IDA7XHJcblxyXG4gICAgICBpZiAod2lkdGhQZXJjZW50ID4gaGVpZ2h0UGVyY2VudCkge1xyXG4gICAgICAgIHJhdGlvID0gdGhpcy5vcmlnaW5hbEhlaWdodCAvIHRoaXMub3JpZ2luYWxXaWR0aDtcclxuICAgICAgICB0aGlzLm5ld1dpZHRoID0gdGhpcy53aW5kb3dXaWR0aCAqIDAuOTtcclxuICAgICAgICB0aGlzLm5ld0hlaWdodCA9IHRoaXMud2luZG93V2lkdGggKiAwLjkgKiByYXRpbztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByYXRpbyA9IHRoaXMub3JpZ2luYWxXaWR0aCAvIHRoaXMub3JpZ2luYWxIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5uZXdXaWR0aCA9IHRoaXMud2luZG93SGVpZ2h0ICogMC45ICogcmF0aW87XHJcbiAgICAgICAgdGhpcy5uZXdIZWlnaHQgPSB0aGlzLndpbmRvd0hlaWdodCAqIDAuOTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fYW5pbWF0ZUltYWdlSW4oKTtcclxuXHJcbiAgICAgIC8vIEhhbmRsZSBFeGl0IHRyaWdnZXJzXHJcbiAgICAgIHRoaXMuX2hhbmRsZVdpbmRvd1Njcm9sbEJvdW5kID0gdGhpcy5faGFuZGxlV2luZG93U2Nyb2xsLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVdpbmRvd1Jlc2l6ZUJvdW5kID0gdGhpcy5faGFuZGxlV2luZG93UmVzaXplLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVdpbmRvd0VzY2FwZUJvdW5kID0gdGhpcy5faGFuZGxlV2luZG93RXNjYXBlLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5faGFuZGxlV2luZG93U2Nyb2xsQm91bmQpO1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQpO1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLl9oYW5kbGVXaW5kb3dFc2NhcGVCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBNYXRlcmlhbGJveFxyXG4gICAgICovXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgdGhpcy5fdXBkYXRlVmFycygpO1xyXG4gICAgICB0aGlzLmRvbmVBbmltYXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIG9uQ2xvc2VTdGFydCBjYWxsYmFja1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0LmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICBhbmltLnJlbW92ZSh0aGlzLiRvdmVybGF5WzBdKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmNhcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy4kcGhvdG9DYXB0aW9uWzBdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZGlzYWJsZSBleGl0IGhhbmRsZXJzXHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGxCb3VuZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemVCb3VuZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuX2hhbmRsZVdpbmRvd0VzY2FwZUJvdW5kKTtcclxuXHJcbiAgICAgIGFuaW0oe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMuJG92ZXJsYXlbMF0sXHJcbiAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJyxcclxuICAgICAgICBjb21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vdmVybGF5QWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLl9hbmltYXRlSW1hZ2VPdXQoKTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBDYXB0aW9uICsgcmVzZXQgY3NzIHNldHRpbmdzIG9uIGltYWdlXHJcbiAgICAgIGlmICh0aGlzLmNhcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRwaG90b0NhcHRpb25bMF0sXHJcbiAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5vdXREdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJyxcclxuICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHBob3RvQ2FwdGlvbi5yZW1vdmUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTS5NYXRlcmlhbGJveCA9IE1hdGVyaWFsYm94O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoTWF0ZXJpYWxib3gsICdtYXRlcmlhbGJveCcsICdNX01hdGVyaWFsYm94Jyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuIl0sImZpbGUiOiJtYXRlcmlhbGJveC5qcyJ9
