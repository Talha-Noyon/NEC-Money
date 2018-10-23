(function($) {
  'use strict';

  let _defaults = {
    top: 0,
    bottom: Infinity,
    offset: 0,
    onPositionChange: null
  };

  /**
   * @class
   *
   */
  class Pushpin extends Component {
    /**
     * Construct Pushpin instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Pushpin, el, options);

      this.el.M_Pushpin = this;

      /**
       * Options for the modal
       * @member Pushpin#options
       */
      this.options = $.extend({}, Pushpin.defaults, options);

      this.originalOffset = this.el.offsetTop;
      Pushpin._pushpins.push(this);
      this._setupEventHandlers();
      this._updatePosition();
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
      return domElem.M_Pushpin;
    }

    /**
     * Teardown component
     */
    destroy() {
      this.el.style.top = null;
      this._removePinClasses();
      this._removeEventHandlers();

      // Remove pushpin Inst
      let index = Pushpin._pushpins.indexOf(this);
      Pushpin._pushpins.splice(index, 1);
    }

    static _updateElements() {
      for (let elIndex in Pushpin._pushpins) {
        let pInstance = Pushpin._pushpins[elIndex];
        pInstance._updatePosition();
      }
    }

    _setupEventHandlers() {
      document.addEventListener('scroll', Pushpin._updateElements);
    }

    _removeEventHandlers() {
      document.removeEventListener('scroll', Pushpin._updateElements);
    }

    _updatePosition() {
      let scrolled = M.getDocumentScrollTop() + this.options.offset;

      if (
        this.options.top <= scrolled &&
        this.options.bottom >= scrolled &&
        !this.el.classList.contains('pinned')
      ) {
        this._removePinClasses();
        this.el.style.top = `${this.options.offset}px`;
        this.el.classList.add('pinned');

        // onPositionChange callback
        if (typeof this.options.onPositionChange === 'function') {
          this.options.onPositionChange.call(this, 'pinned');
        }
      }

      // Add pin-top (when scrolled position is above top)
      if (scrolled < this.options.top && !this.el.classList.contains('pin-top')) {
        this._removePinClasses();
        this.el.style.top = 0;
        this.el.classList.add('pin-top');

        // onPositionChange callback
        if (typeof this.options.onPositionChange === 'function') {
          this.options.onPositionChange.call(this, 'pin-top');
        }
      }

      // Add pin-bottom (when scrolled position is below bottom)
      if (scrolled > this.options.bottom && !this.el.classList.contains('pin-bottom')) {
        this._removePinClasses();
        this.el.classList.add('pin-bottom');
        this.el.style.top = `${this.options.bottom - this.originalOffset}px`;

        // onPositionChange callback
        if (typeof this.options.onPositionChange === 'function') {
          this.options.onPositionChange.call(this, 'pin-bottom');
        }
      }
    }

    _removePinClasses() {
      // IE 11 bug (can't remove multiple classes in one line)
      this.el.classList.remove('pin-top');
      this.el.classList.remove('pinned');
      this.el.classList.remove('pin-bottom');
    }
  }

  /**
   * @static
   * @memberof Pushpin
   */
  Pushpin._pushpins = [];

  M.Pushpin = Pushpin;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwdXNocGluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgdG9wOiAwLFxyXG4gICAgYm90dG9tOiBJbmZpbml0eSxcclxuICAgIG9mZnNldDogMCxcclxuICAgIG9uUG9zaXRpb25DaGFuZ2U6IG51bGxcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIFB1c2hwaW4gZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgUHVzaHBpbiBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihQdXNocGluLCBlbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmVsLk1fUHVzaHBpbiA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIG1vZGFsXHJcbiAgICAgICAqIEBtZW1iZXIgUHVzaHBpbiNvcHRpb25zXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUHVzaHBpbi5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLm9yaWdpbmFsT2Zmc2V0ID0gdGhpcy5lbC5vZmZzZXRUb3A7XHJcbiAgICAgIFB1c2hwaW4uX3B1c2hwaW5zLnB1c2godGhpcyk7XHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX1B1c2hwaW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSBudWxsO1xyXG4gICAgICB0aGlzLl9yZW1vdmVQaW5DbGFzc2VzKCk7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBwdXNocGluIEluc3RcclxuICAgICAgbGV0IGluZGV4ID0gUHVzaHBpbi5fcHVzaHBpbnMuaW5kZXhPZih0aGlzKTtcclxuICAgICAgUHVzaHBpbi5fcHVzaHBpbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgX3VwZGF0ZUVsZW1lbnRzKCkge1xyXG4gICAgICBmb3IgKGxldCBlbEluZGV4IGluIFB1c2hwaW4uX3B1c2hwaW5zKSB7XHJcbiAgICAgICAgbGV0IHBJbnN0YW5jZSA9IFB1c2hwaW4uX3B1c2hwaW5zW2VsSW5kZXhdO1xyXG4gICAgICAgIHBJbnN0YW5jZS5fdXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIFB1c2hwaW4uX3VwZGF0ZUVsZW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgUHVzaHBpbi5fdXBkYXRlRWxlbWVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIF91cGRhdGVQb3NpdGlvbigpIHtcclxuICAgICAgbGV0IHNjcm9sbGVkID0gTS5nZXREb2N1bWVudFNjcm9sbFRvcCgpICsgdGhpcy5vcHRpb25zLm9mZnNldDtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICB0aGlzLm9wdGlvbnMudG9wIDw9IHNjcm9sbGVkICYmXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmJvdHRvbSA+PSBzY3JvbGxlZCAmJlxyXG4gICAgICAgICF0aGlzLmVsLmNsYXNzTGlzdC5jb250YWlucygncGlubmVkJylcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlUGluQ2xhc3NlcygpO1xyXG4gICAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gYCR7dGhpcy5vcHRpb25zLm9mZnNldH1weGA7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdwaW5uZWQnKTtcclxuXHJcbiAgICAgICAgLy8gb25Qb3NpdGlvbkNoYW5nZSBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUG9zaXRpb25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlLmNhbGwodGhpcywgJ3Bpbm5lZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQWRkIHBpbi10b3AgKHdoZW4gc2Nyb2xsZWQgcG9zaXRpb24gaXMgYWJvdmUgdG9wKVxyXG4gICAgICBpZiAoc2Nyb2xsZWQgPCB0aGlzLm9wdGlvbnMudG9wICYmICF0aGlzLmVsLmNsYXNzTGlzdC5jb250YWlucygncGluLXRvcCcpKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlUGluQ2xhc3NlcygpO1xyXG4gICAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gMDtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3Bpbi10b3AnKTtcclxuXHJcbiAgICAgICAgLy8gb25Qb3NpdGlvbkNoYW5nZSBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUG9zaXRpb25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlLmNhbGwodGhpcywgJ3Bpbi10b3AnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCBwaW4tYm90dG9tICh3aGVuIHNjcm9sbGVkIHBvc2l0aW9uIGlzIGJlbG93IGJvdHRvbSlcclxuICAgICAgaWYgKHNjcm9sbGVkID4gdGhpcy5vcHRpb25zLmJvdHRvbSAmJiAhdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Bpbi1ib3R0b20nKSkge1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVBpbkNsYXNzZXMoKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3Bpbi1ib3R0b20nKTtcclxuICAgICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9IGAke3RoaXMub3B0aW9ucy5ib3R0b20gLSB0aGlzLm9yaWdpbmFsT2Zmc2V0fXB4YDtcclxuXHJcbiAgICAgICAgLy8gb25Qb3NpdGlvbkNoYW5nZSBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUG9zaXRpb25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlLmNhbGwodGhpcywgJ3Bpbi1ib3R0b20nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlUGluQ2xhc3NlcygpIHtcclxuICAgICAgLy8gSUUgMTEgYnVnIChjYW4ndCByZW1vdmUgbXVsdGlwbGUgY2xhc3NlcyBpbiBvbmUgbGluZSlcclxuICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdwaW4tdG9wJyk7XHJcbiAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgncGlubmVkJyk7XHJcbiAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgncGluLWJvdHRvbScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBQdXNocGluXHJcbiAgICovXHJcbiAgUHVzaHBpbi5fcHVzaHBpbnMgPSBbXTtcclxuXHJcbiAgTS5QdXNocGluID0gUHVzaHBpbjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFB1c2hwaW4sICdwdXNocGluJywgJ01fUHVzaHBpbicpO1xyXG4gIH1cclxufSkoY2FzaCk7XHJcbiJdLCJmaWxlIjoicHVzaHBpbi5qcyJ9
