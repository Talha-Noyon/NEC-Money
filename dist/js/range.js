(function($, anim) {
  'use strict';

  let _defaults = {};

  /**
   * @class
   *
   */
  class Range extends Component {
    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Range, el, options);

      this.el.M_Range = this;

      /**
       * Options for the range
       * @member Range#options
       */
      this.options = $.extend({}, Range.defaults, options);

      this._mousedown = false;

      // Setup
      this._setupThumb();

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
      return domElem.M_Range;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeThumb();
      this.el.M_Range = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleRangeChangeBound = this._handleRangeChange.bind(this);
      this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
      this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(
        this
      );
      this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
      this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(
        this
      );

      this.el.addEventListener('change', this._handleRangeChangeBound);

      this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
      this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

      this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

      this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
      this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

      this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('change', this._handleRangeChangeBound);

      this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
      this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

      this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

      this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
      this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

      this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
    }

    /**
     * Handle Range Change
     * @param {Event} e
     */
    _handleRangeChange() {
      $(this.value).html(this.$el.val());

      if (!$(this.thumb).hasClass('active')) {
        this._showRangeBubble();
      }

      let offsetLeft = this._calcRangeOffset();
      $(this.thumb)
        .addClass('active')
        .css('left', offsetLeft + 'px');
    }

    /**
     * Handle Range Mousedown and Touchstart
     * @param {Event} e
     */
    _handleRangeMousedownTouchstart(e) {
      // Set indicator value
      $(this.value).html(this.$el.val());

      this._mousedown = true;
      this.$el.addClass('active');

      if (!$(this.thumb).hasClass('active')) {
        this._showRangeBubble();
      }

      if (e.type !== 'input') {
        let offsetLeft = this._calcRangeOffset();
        $(this.thumb)
          .addClass('active')
          .css('left', offsetLeft + 'px');
      }
    }

    /**
     * Handle Range Input, Mousemove and Touchmove
     */
    _handleRangeInputMousemoveTouchmove() {
      if (this._mousedown) {
        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        let offsetLeft = this._calcRangeOffset();
        $(this.thumb)
          .addClass('active')
          .css('left', offsetLeft + 'px');
        $(this.value).html(this.$el.val());
      }
    }

    /**
     * Handle Range Mouseup and Touchend
     */
    _handleRangeMouseupTouchend() {
      this._mousedown = false;
      this.$el.removeClass('active');
    }

    /**
     * Handle Range Blur, Mouseout and Touchleave
     */
    _handleRangeBlurMouseoutTouchleave() {
      if (!this._mousedown) {
        let paddingLeft = parseInt(this.$el.css('padding-left'));
        let marginLeft = 7 + paddingLeft + 'px';

        if ($(this.thumb).hasClass('active')) {
          anim.remove(this.thumb);
          anim({
            targets: this.thumb,
            height: 0,
            width: 0,
            top: 10,
            easing: 'easeOutQuad',
            marginLeft: marginLeft,
            duration: 100
          });
        }
        $(this.thumb).removeClass('active');
      }
    }

    /**
     * Setup dropdown
     */
    _setupThumb() {
      this.thumb = document.createElement('span');
      this.value = document.createElement('span');
      $(this.thumb).addClass('thumb');
      $(this.value).addClass('value');
      $(this.thumb).append(this.value);
      this.$el.after(this.thumb);
    }

    /**
     * Remove dropdown
     */
    _removeThumb() {
      $(this.thumb).remove();
    }

    /**
     * morph thumb into bubble
     */
    _showRangeBubble() {
      let paddingLeft = parseInt(
        $(this.thumb)
          .parent()
          .css('padding-left')
      );
      let marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
      anim.remove(this.thumb);
      anim({
        targets: this.thumb,
        height: 30,
        width: 30,
        top: -30,
        marginLeft: marginLeft,
        duration: 300,
        easing: 'easeOutQuint'
      });
    }

    /**
     * Calculate the offset of the thumb
     * @return {Number}  offset in pixels
     */
    _calcRangeOffset() {
      let width = this.$el.width() - 15;
      let max = parseFloat(this.$el.attr('max')) || 100; // Range default max
      let min = parseFloat(this.$el.attr('min')) || 0; // Range default min
      let percent = (parseFloat(this.$el.val()) - min) / (max - min);
      return percent * width;
    }
  }

  M.Range = Range;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range]'));
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYW5nZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHt9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIFJhbmdlIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFJhbmdlIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKFJhbmdlLCBlbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmVsLk1fUmFuZ2UgPSB0aGlzO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSByYW5nZVxyXG4gICAgICAgKiBAbWVtYmVyIFJhbmdlI29wdGlvbnNcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSYW5nZS5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLl9tb3VzZWRvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFNldHVwXHJcbiAgICAgIHRoaXMuX3NldHVwVGh1bWIoKTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX1JhbmdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5fcmVtb3ZlVGh1bWIoKTtcclxuICAgICAgdGhpcy5lbC5NX1JhbmdlID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlUmFuZ2VDaGFuZ2VCb3VuZCA9IHRoaXMuX2hhbmRsZVJhbmdlQ2hhbmdlLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydEJvdW5kID0gdGhpcy5faGFuZGxlUmFuZ2VNb3VzZWRvd25Ub3VjaHN0YXJ0LmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmVCb3VuZCA9IHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmUuYmluZChcclxuICAgICAgICB0aGlzXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVJhbmdlTW91c2V1cFRvdWNoZW5kQm91bmQgPSB0aGlzLl9oYW5kbGVSYW5nZU1vdXNldXBUb3VjaGVuZC5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVCb3VuZCA9IHRoaXMuX2hhbmRsZVJhbmdlQmx1ck1vdXNlb3V0VG91Y2hsZWF2ZS5iaW5kKFxyXG4gICAgICAgIHRoaXNcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlUmFuZ2VDaGFuZ2VCb3VuZCk7XHJcblxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydEJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlUmFuZ2VNb3VzZWRvd25Ub3VjaHN0YXJ0Qm91bmQpO1xyXG5cclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlUmFuZ2VJbnB1dE1vdXNlbW92ZVRvdWNobW92ZUJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVSYW5nZUlucHV0TW91c2Vtb3ZlVG91Y2htb3ZlQm91bmQpO1xyXG5cclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlUmFuZ2VNb3VzZXVwVG91Y2hlbmRCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVSYW5nZU1vdXNldXBUb3VjaGVuZEJvdW5kKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX2hhbmRsZVJhbmdlQmx1ck1vdXNlb3V0VG91Y2hsZWF2ZUJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuX2hhbmRsZVJhbmdlQmx1ck1vdXNlb3V0VG91Y2hsZWF2ZUJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGxlYXZlJywgdGhpcy5faGFuZGxlUmFuZ2VCbHVyTW91c2VvdXRUb3VjaGxlYXZlQm91bmQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZVJhbmdlQ2hhbmdlQm91bmQpO1xyXG5cclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVSYW5nZU1vdXNlZG93blRvdWNoc3RhcnRCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydEJvdW5kKTtcclxuXHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9oYW5kbGVSYW5nZUlucHV0TW91c2Vtb3ZlVG91Y2htb3ZlQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlUmFuZ2VJbnB1dE1vdXNlbW92ZVRvdWNobW92ZUJvdW5kKTtcclxuXHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2V1cFRvdWNoZW5kQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlUmFuZ2VNb3VzZXVwVG91Y2hlbmRCb3VuZCk7XHJcblxyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB0aGlzLl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hsZWF2ZScsIHRoaXMuX2hhbmRsZVJhbmdlQmx1ck1vdXNlb3V0VG91Y2hsZWF2ZUJvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBSYW5nZSBDaGFuZ2VcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZVJhbmdlQ2hhbmdlKCkge1xyXG4gICAgICAkKHRoaXMudmFsdWUpLmh0bWwodGhpcy4kZWwudmFsKCkpO1xyXG5cclxuICAgICAgaWYgKCEkKHRoaXMudGh1bWIpLmhhc0NsYXNzKCdhY3RpdmUnKSkge1xyXG4gICAgICAgIHRoaXMuX3Nob3dSYW5nZUJ1YmJsZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgb2Zmc2V0TGVmdCA9IHRoaXMuX2NhbGNSYW5nZU9mZnNldCgpO1xyXG4gICAgICAkKHRoaXMudGh1bWIpXHJcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgIC5jc3MoJ2xlZnQnLCBvZmZzZXRMZWZ0ICsgJ3B4Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgUmFuZ2UgTW91c2Vkb3duIGFuZCBUb3VjaHN0YXJ0XHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVSYW5nZU1vdXNlZG93blRvdWNoc3RhcnQoZSkge1xyXG4gICAgICAvLyBTZXQgaW5kaWNhdG9yIHZhbHVlXHJcbiAgICAgICQodGhpcy52YWx1ZSkuaHRtbCh0aGlzLiRlbC52YWwoKSk7XHJcblxyXG4gICAgICB0aGlzLl9tb3VzZWRvd24gPSB0cnVlO1xyXG4gICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICBpZiAoISQodGhpcy50aHVtYikuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XHJcbiAgICAgICAgdGhpcy5fc2hvd1JhbmdlQnViYmxlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlLnR5cGUgIT09ICdpbnB1dCcpIHtcclxuICAgICAgICBsZXQgb2Zmc2V0TGVmdCA9IHRoaXMuX2NhbGNSYW5nZU9mZnNldCgpO1xyXG4gICAgICAgICQodGhpcy50aHVtYilcclxuICAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAgIC5jc3MoJ2xlZnQnLCBvZmZzZXRMZWZ0ICsgJ3B4Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBSYW5nZSBJbnB1dCwgTW91c2Vtb3ZlIGFuZCBUb3VjaG1vdmVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmUoKSB7XHJcbiAgICAgIGlmICh0aGlzLl9tb3VzZWRvd24pIHtcclxuICAgICAgICBpZiAoISQodGhpcy50aHVtYikuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XHJcbiAgICAgICAgICB0aGlzLl9zaG93UmFuZ2VCdWJibGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvZmZzZXRMZWZ0ID0gdGhpcy5fY2FsY1JhbmdlT2Zmc2V0KCk7XHJcbiAgICAgICAgJCh0aGlzLnRodW1iKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgICAgLmNzcygnbGVmdCcsIG9mZnNldExlZnQgKyAncHgnKTtcclxuICAgICAgICAkKHRoaXMudmFsdWUpLmh0bWwodGhpcy4kZWwudmFsKCkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgUmFuZ2UgTW91c2V1cCBhbmQgVG91Y2hlbmRcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZVJhbmdlTW91c2V1cFRvdWNoZW5kKCkge1xyXG4gICAgICB0aGlzLl9tb3VzZWRvd24gPSBmYWxzZTtcclxuICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIFJhbmdlIEJsdXIsIE1vdXNlb3V0IGFuZCBUb3VjaGxlYXZlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmUoKSB7XHJcbiAgICAgIGlmICghdGhpcy5fbW91c2Vkb3duKSB7XHJcbiAgICAgICAgbGV0IHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQodGhpcy4kZWwuY3NzKCdwYWRkaW5nLWxlZnQnKSk7XHJcbiAgICAgICAgbGV0IG1hcmdpbkxlZnQgPSA3ICsgcGFkZGluZ0xlZnQgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiAoJCh0aGlzLnRodW1iKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMudGh1bWIpO1xyXG4gICAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICAgIHRhcmdldHM6IHRoaXMudGh1bWIsXHJcbiAgICAgICAgICAgIGhlaWdodDogMCxcclxuICAgICAgICAgICAgd2lkdGg6IDAsXHJcbiAgICAgICAgICAgIHRvcDogMTAsXHJcbiAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJyxcclxuICAgICAgICAgICAgbWFyZ2luTGVmdDogbWFyZ2luTGVmdCxcclxuICAgICAgICAgICAgZHVyYXRpb246IDEwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQodGhpcy50aHVtYikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBkcm9wZG93blxyXG4gICAgICovXHJcbiAgICBfc2V0dXBUaHVtYigpIHtcclxuICAgICAgdGhpcy50aHVtYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgdGhpcy52YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgJCh0aGlzLnRodW1iKS5hZGRDbGFzcygndGh1bWInKTtcclxuICAgICAgJCh0aGlzLnZhbHVlKS5hZGRDbGFzcygndmFsdWUnKTtcclxuICAgICAgJCh0aGlzLnRodW1iKS5hcHBlbmQodGhpcy52YWx1ZSk7XHJcbiAgICAgIHRoaXMuJGVsLmFmdGVyKHRoaXMudGh1bWIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGRyb3Bkb3duXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVUaHVtYigpIHtcclxuICAgICAgJCh0aGlzLnRodW1iKS5yZW1vdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vcnBoIHRodW1iIGludG8gYnViYmxlXHJcbiAgICAgKi9cclxuICAgIF9zaG93UmFuZ2VCdWJibGUoKSB7XHJcbiAgICAgIGxldCBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KFxyXG4gICAgICAgICQodGhpcy50aHVtYilcclxuICAgICAgICAgIC5wYXJlbnQoKVxyXG4gICAgICAgICAgLmNzcygncGFkZGluZy1sZWZ0JylcclxuICAgICAgKTtcclxuICAgICAgbGV0IG1hcmdpbkxlZnQgPSAtNyArIHBhZGRpbmdMZWZ0ICsgJ3B4JzsgLy8gVE9ETzogZml4IG1hZ2ljIG51bWJlcj9cclxuICAgICAgYW5pbS5yZW1vdmUodGhpcy50aHVtYik7XHJcbiAgICAgIGFuaW0oe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMudGh1bWIsXHJcbiAgICAgICAgaGVpZ2h0OiAzMCxcclxuICAgICAgICB3aWR0aDogMzAsXHJcbiAgICAgICAgdG9wOiAtMzAsXHJcbiAgICAgICAgbWFyZ2luTGVmdDogbWFyZ2luTGVmdCxcclxuICAgICAgICBkdXJhdGlvbjogMzAwLFxyXG4gICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWludCdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgdGhlIG9mZnNldCBvZiB0aGUgdGh1bWJcclxuICAgICAqIEByZXR1cm4ge051bWJlcn0gIG9mZnNldCBpbiBwaXhlbHNcclxuICAgICAqL1xyXG4gICAgX2NhbGNSYW5nZU9mZnNldCgpIHtcclxuICAgICAgbGV0IHdpZHRoID0gdGhpcy4kZWwud2lkdGgoKSAtIDE1O1xyXG4gICAgICBsZXQgbWF4ID0gcGFyc2VGbG9hdCh0aGlzLiRlbC5hdHRyKCdtYXgnKSkgfHwgMTAwOyAvLyBSYW5nZSBkZWZhdWx0IG1heFxyXG4gICAgICBsZXQgbWluID0gcGFyc2VGbG9hdCh0aGlzLiRlbC5hdHRyKCdtaW4nKSkgfHwgMDsgLy8gUmFuZ2UgZGVmYXVsdCBtaW5cclxuICAgICAgbGV0IHBlcmNlbnQgPSAocGFyc2VGbG9hdCh0aGlzLiRlbC52YWwoKSkgLSBtaW4pIC8gKG1heCAtIG1pbik7XHJcbiAgICAgIHJldHVybiBwZXJjZW50ICogd2lkdGg7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNLlJhbmdlID0gUmFuZ2U7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihSYW5nZSwgJ3JhbmdlJywgJ01fUmFuZ2UnKTtcclxuICB9XHJcblxyXG4gIFJhbmdlLmluaXQoJCgnaW5wdXRbdHlwZT1yYW5nZV0nKSk7XHJcbn0pKGNhc2gsIE0uYW5pbWUpO1xyXG4iXSwiZmlsZSI6InJhbmdlLmpzIn0=
