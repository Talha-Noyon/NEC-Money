(function($) {
  'use strict';

  let _defaults = {};

  /**
   * @class
   *
   */
  class CharacterCounter extends Component {
    /**
     * Construct CharacterCounter instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(CharacterCounter, el, options);

      this.el.M_CharacterCounter = this;

      /**
       * Options for the character counter
       */
      this.options = $.extend({}, CharacterCounter.defaults, options);

      this.isInvalid = false;
      this.isValidLength = false;
      this._setupCounter();
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
      return domElem.M_CharacterCounter;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.CharacterCounter = undefined;
      this._removeCounter();
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleUpdateCounterBound = this.updateCounter.bind(this);

      this.el.addEventListener('focus', this._handleUpdateCounterBound, true);
      this.el.addEventListener('input', this._handleUpdateCounterBound, true);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('focus', this._handleUpdateCounterBound, true);
      this.el.removeEventListener('input', this._handleUpdateCounterBound, true);
    }

    /**
     * Setup counter element
     */
    _setupCounter() {
      this.counterEl = document.createElement('span');
      $(this.counterEl)
        .addClass('character-counter')
        .css({
          float: 'right',
          'font-size': '12px',
          height: 1
        });

      this.$el.parent().append(this.counterEl);
    }

    /**
     * Remove counter element
     */
    _removeCounter() {
      $(this.counterEl).remove();
    }

    /**
     * Update counter
     */
    updateCounter() {
      let maxLength = +this.$el.attr('data-length'),
        actualLength = this.el.value.length;
      this.isValidLength = actualLength <= maxLength;
      let counterString = actualLength;

      if (maxLength) {
        counterString += '/' + maxLength;
        this._validateInput();
      }

      $(this.counterEl).html(counterString);
    }

    /**
     * Add validation classes
     */
    _validateInput() {
      if (this.isValidLength && this.isInvalid) {
        this.isInvalid = false;
        this.$el.removeClass('invalid');
      } else if (!this.isValidLength && !this.isInvalid) {
        this.isInvalid = true;
        this.$el.removeClass('valid');
        this.$el.addClass('invalid');
      }
    }
  }

  M.CharacterCounter = CharacterCounter;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjaGFyYWN0ZXJDb3VudGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge307XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcbiAgY2xhc3MgQ2hhcmFjdGVyQ291bnRlciBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBDaGFyYWN0ZXJDb3VudGVyIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKENoYXJhY3RlckNvdW50ZXIsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9DaGFyYWN0ZXJDb3VudGVyID0gdGhpcztcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcHRpb25zIGZvciB0aGUgY2hhcmFjdGVyIGNvdW50ZXJcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDaGFyYWN0ZXJDb3VudGVyLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuaXNJbnZhbGlkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaXNWYWxpZExlbmd0aCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9zZXR1cENvdW50ZXIoKTtcclxuICAgICAgdGhpcy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fQ2hhcmFjdGVyQ291bnRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIHRoaXMuZWwuQ2hhcmFjdGVyQ291bnRlciA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhpcy5fcmVtb3ZlQ291bnRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlVXBkYXRlQ291bnRlckJvdW5kID0gdGhpcy51cGRhdGVDb3VudGVyLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlVXBkYXRlQ291bnRlckJvdW5kLCB0cnVlKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX2hhbmRsZVVwZGF0ZUNvdW50ZXJCb3VuZCwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9oYW5kbGVVcGRhdGVDb3VudGVyQm91bmQsIHRydWUpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5faGFuZGxlVXBkYXRlQ291bnRlckJvdW5kLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIGNvdW50ZXIgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBfc2V0dXBDb3VudGVyKCkge1xyXG4gICAgICB0aGlzLmNvdW50ZXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgJCh0aGlzLmNvdW50ZXJFbClcclxuICAgICAgICAuYWRkQ2xhc3MoJ2NoYXJhY3Rlci1jb3VudGVyJylcclxuICAgICAgICAuY3NzKHtcclxuICAgICAgICAgIGZsb2F0OiAncmlnaHQnLFxyXG4gICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICcxMnB4JyxcclxuICAgICAgICAgIGhlaWdodDogMVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy4kZWwucGFyZW50KCkuYXBwZW5kKHRoaXMuY291bnRlckVsKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBjb3VudGVyIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZUNvdW50ZXIoKSB7XHJcbiAgICAgICQodGhpcy5jb3VudGVyRWwpLnJlbW92ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIGNvdW50ZXJcclxuICAgICAqL1xyXG4gICAgdXBkYXRlQ291bnRlcigpIHtcclxuICAgICAgbGV0IG1heExlbmd0aCA9ICt0aGlzLiRlbC5hdHRyKCdkYXRhLWxlbmd0aCcpLFxyXG4gICAgICAgIGFjdHVhbExlbmd0aCA9IHRoaXMuZWwudmFsdWUubGVuZ3RoO1xyXG4gICAgICB0aGlzLmlzVmFsaWRMZW5ndGggPSBhY3R1YWxMZW5ndGggPD0gbWF4TGVuZ3RoO1xyXG4gICAgICBsZXQgY291bnRlclN0cmluZyA9IGFjdHVhbExlbmd0aDtcclxuXHJcbiAgICAgIGlmIChtYXhMZW5ndGgpIHtcclxuICAgICAgICBjb3VudGVyU3RyaW5nICs9ICcvJyArIG1heExlbmd0aDtcclxuICAgICAgICB0aGlzLl92YWxpZGF0ZUlucHV0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICQodGhpcy5jb3VudGVyRWwpLmh0bWwoY291bnRlclN0cmluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgdmFsaWRhdGlvbiBjbGFzc2VzXHJcbiAgICAgKi9cclxuICAgIF92YWxpZGF0ZUlucHV0KCkge1xyXG4gICAgICBpZiAodGhpcy5pc1ZhbGlkTGVuZ3RoICYmIHRoaXMuaXNJbnZhbGlkKSB7XHJcbiAgICAgICAgdGhpcy5pc0ludmFsaWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnaW52YWxpZCcpO1xyXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzVmFsaWRMZW5ndGggJiYgIXRoaXMuaXNJbnZhbGlkKSB7XHJcbiAgICAgICAgdGhpcy5pc0ludmFsaWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCd2YWxpZCcpO1xyXG4gICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdpbnZhbGlkJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIE0uQ2hhcmFjdGVyQ291bnRlciA9IENoYXJhY3RlckNvdW50ZXI7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihDaGFyYWN0ZXJDb3VudGVyLCAnY2hhcmFjdGVyQ291bnRlcicsICdNX0NoYXJhY3RlckNvdW50ZXInKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG4iXSwiZmlsZSI6ImNoYXJhY3RlckNvdW50ZXIuanMifQ==
