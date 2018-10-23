(function($) {
  'use strict';

  let _defaults = {
    responsiveThreshold: 0 // breakpoint for swipeable
  };

  class Parallax extends Component {
    constructor(el, options) {
      super(Parallax, el, options);

      this.el.M_Parallax = this;

      /**
       * Options for the Parallax
       * @member Parallax#options
       * @prop {Number} responsiveThreshold
       */
      this.options = $.extend({}, Parallax.defaults, options);
      this._enabled = window.innerWidth > this.options.responsiveThreshold;

      this.$img = this.$el.find('img').first();
      this.$img.each(function() {
        let el = this;
        if (el.complete) $(el).trigger('load');
      });

      this._updateParallax();
      this._setupEventHandlers();
      this._setupStyles();

      Parallax._parallaxes.push(this);
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
      return domElem.M_Parallax;
    }

    /**
     * Teardown component
     */
    destroy() {
      Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
      this.$img[0].style.transform = '';
      this._removeEventHandlers();

      this.$el[0].M_Parallax = undefined;
    }

    static _handleScroll() {
      for (let i = 0; i < Parallax._parallaxes.length; i++) {
        let parallaxInstance = Parallax._parallaxes[i];
        parallaxInstance._updateParallax.call(parallaxInstance);
      }
    }

    static _handleWindowResize() {
      for (let i = 0; i < Parallax._parallaxes.length; i++) {
        let parallaxInstance = Parallax._parallaxes[i];
        parallaxInstance._enabled =
          window.innerWidth > parallaxInstance.options.responsiveThreshold;
      }
    }

    _setupEventHandlers() {
      this._handleImageLoadBound = this._handleImageLoad.bind(this);
      this.$img[0].addEventListener('load', this._handleImageLoadBound);

      if (Parallax._parallaxes.length === 0) {
        Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
        window.addEventListener('scroll', Parallax._handleScrollThrottled);

        Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
        window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
      }
    }

    _removeEventHandlers() {
      this.$img[0].removeEventListener('load', this._handleImageLoadBound);

      if (Parallax._parallaxes.length === 0) {
        window.removeEventListener('scroll', Parallax._handleScrollThrottled);
        window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
      }
    }

    _setupStyles() {
      this.$img[0].style.opacity = 1;
    }

    _handleImageLoad() {
      this._updateParallax();
    }

    _updateParallax() {
      let containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
      let imgHeight = this.$img[0].offsetHeight;
      let parallaxDist = imgHeight - containerHeight;
      let bottom = this.$el.offset().top + containerHeight;
      let top = this.$el.offset().top;
      let scrollTop = M.getDocumentScrollTop();
      let windowHeight = window.innerHeight;
      let windowBottom = scrollTop + windowHeight;
      let percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
      let parallax = parallaxDist * percentScrolled;

      if (!this._enabled) {
        this.$img[0].style.transform = '';
      } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
        this.$img[0].style.transform = `translate3D(-50%, ${parallax}px, 0)`;
      }
    }
  }

  /**
   * @static
   * @memberof Parallax
   */
  Parallax._parallaxes = [];

  M.Parallax = Parallax;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwYXJhbGxheC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIHJlc3BvbnNpdmVUaHJlc2hvbGQ6IDAgLy8gYnJlYWtwb2ludCBmb3Igc3dpcGVhYmxlXHJcbiAgfTtcclxuXHJcbiAgY2xhc3MgUGFyYWxsYXggZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgc3VwZXIoUGFyYWxsYXgsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9QYXJhbGxheCA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIFBhcmFsbGF4XHJcbiAgICAgICAqIEBtZW1iZXIgUGFyYWxsYXgjb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSByZXNwb25zaXZlVGhyZXNob2xkXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUGFyYWxsYXguZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICB0aGlzLl9lbmFibGVkID0gd2luZG93LmlubmVyV2lkdGggPiB0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZVRocmVzaG9sZDtcclxuXHJcbiAgICAgIHRoaXMuJGltZyA9IHRoaXMuJGVsLmZpbmQoJ2ltZycpLmZpcnN0KCk7XHJcbiAgICAgIHRoaXMuJGltZy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBlbCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGVsLmNvbXBsZXRlKSAkKGVsKS50cmlnZ2VyKCdsb2FkJyk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5fdXBkYXRlUGFyYWxsYXgoKTtcclxuICAgICAgdGhpcy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIHRoaXMuX3NldHVwU3R5bGVzKCk7XHJcblxyXG4gICAgICBQYXJhbGxheC5fcGFyYWxsYXhlcy5wdXNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX1BhcmFsbGF4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIFBhcmFsbGF4Ll9wYXJhbGxheGVzLnNwbGljZShQYXJhbGxheC5fcGFyYWxsYXhlcy5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgdGhpcy4kaW1nWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xyXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcblxyXG4gICAgICB0aGlzLiRlbFswXS5NX1BhcmFsbGF4ID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBfaGFuZGxlU2Nyb2xsKCkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBhcmFsbGF4Ll9wYXJhbGxheGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHBhcmFsbGF4SW5zdGFuY2UgPSBQYXJhbGxheC5fcGFyYWxsYXhlc1tpXTtcclxuICAgICAgICBwYXJhbGxheEluc3RhbmNlLl91cGRhdGVQYXJhbGxheC5jYWxsKHBhcmFsbGF4SW5zdGFuY2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIF9oYW5kbGVXaW5kb3dSZXNpemUoKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUGFyYWxsYXguX3BhcmFsbGF4ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgcGFyYWxsYXhJbnN0YW5jZSA9IFBhcmFsbGF4Ll9wYXJhbGxheGVzW2ldO1xyXG4gICAgICAgIHBhcmFsbGF4SW5zdGFuY2UuX2VuYWJsZWQgPVxyXG4gICAgICAgICAgd2luZG93LmlubmVyV2lkdGggPiBwYXJhbGxheEluc3RhbmNlLm9wdGlvbnMucmVzcG9uc2l2ZVRocmVzaG9sZDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUltYWdlTG9hZEJvdW5kID0gdGhpcy5faGFuZGxlSW1hZ2VMb2FkLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuJGltZ1swXS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5faGFuZGxlSW1hZ2VMb2FkQm91bmQpO1xyXG5cclxuICAgICAgaWYgKFBhcmFsbGF4Ll9wYXJhbGxheGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIFBhcmFsbGF4Ll9oYW5kbGVTY3JvbGxUaHJvdHRsZWQgPSBNLnRocm90dGxlKFBhcmFsbGF4Ll9oYW5kbGVTY3JvbGwsIDUpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBQYXJhbGxheC5faGFuZGxlU2Nyb2xsVGhyb3R0bGVkKTtcclxuXHJcbiAgICAgICAgUGFyYWxsYXguX2hhbmRsZVdpbmRvd1Jlc2l6ZVRocm90dGxlZCA9IE0udGhyb3R0bGUoUGFyYWxsYXguX2hhbmRsZVdpbmRvd1Jlc2l6ZSwgNSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIFBhcmFsbGF4Ll9oYW5kbGVXaW5kb3dSZXNpemVUaHJvdHRsZWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuJGltZ1swXS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5faGFuZGxlSW1hZ2VMb2FkQm91bmQpO1xyXG5cclxuICAgICAgaWYgKFBhcmFsbGF4Ll9wYXJhbGxheGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBQYXJhbGxheC5faGFuZGxlU2Nyb2xsVGhyb3R0bGVkKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgUGFyYWxsYXguX2hhbmRsZVdpbmRvd1Jlc2l6ZVRocm90dGxlZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfc2V0dXBTdHlsZXMoKSB7XHJcbiAgICAgIHRoaXMuJGltZ1swXS5zdHlsZS5vcGFjaXR5ID0gMTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlSW1hZ2VMb2FkKCkge1xyXG4gICAgICB0aGlzLl91cGRhdGVQYXJhbGxheCgpO1xyXG4gICAgfVxyXG5cclxuICAgIF91cGRhdGVQYXJhbGxheCgpIHtcclxuICAgICAgbGV0IGNvbnRhaW5lckhlaWdodCA9IHRoaXMuJGVsLmhlaWdodCgpID4gMCA/IHRoaXMuZWwucGFyZW50Tm9kZS5vZmZzZXRIZWlnaHQgOiA1MDA7XHJcbiAgICAgIGxldCBpbWdIZWlnaHQgPSB0aGlzLiRpbWdbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICBsZXQgcGFyYWxsYXhEaXN0ID0gaW1nSGVpZ2h0IC0gY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICBsZXQgYm90dG9tID0gdGhpcy4kZWwub2Zmc2V0KCkudG9wICsgY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICBsZXQgdG9wID0gdGhpcy4kZWwub2Zmc2V0KCkudG9wO1xyXG4gICAgICBsZXQgc2Nyb2xsVG9wID0gTS5nZXREb2N1bWVudFNjcm9sbFRvcCgpO1xyXG4gICAgICBsZXQgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICBsZXQgd2luZG93Qm90dG9tID0gc2Nyb2xsVG9wICsgd2luZG93SGVpZ2h0O1xyXG4gICAgICBsZXQgcGVyY2VudFNjcm9sbGVkID0gKHdpbmRvd0JvdHRvbSAtIHRvcCkgLyAoY29udGFpbmVySGVpZ2h0ICsgd2luZG93SGVpZ2h0KTtcclxuICAgICAgbGV0IHBhcmFsbGF4ID0gcGFyYWxsYXhEaXN0ICogcGVyY2VudFNjcm9sbGVkO1xyXG5cclxuICAgICAgaWYgKCF0aGlzLl9lbmFibGVkKSB7XHJcbiAgICAgICAgdGhpcy4kaW1nWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xyXG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbSA+IHNjcm9sbFRvcCAmJiB0b3AgPCBzY3JvbGxUb3AgKyB3aW5kb3dIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLiRpbWdbMF0uc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNEKC01MCUsICR7cGFyYWxsYXh9cHgsIDApYDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBQYXJhbGxheFxyXG4gICAqL1xyXG4gIFBhcmFsbGF4Ll9wYXJhbGxheGVzID0gW107XHJcblxyXG4gIE0uUGFyYWxsYXggPSBQYXJhbGxheDtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFBhcmFsbGF4LCAncGFyYWxsYXgnLCAnTV9QYXJhbGxheCcpO1xyXG4gIH1cclxufSkoY2FzaCk7XHJcbiJdLCJmaWxlIjoicGFyYWxsYXguanMifQ==
