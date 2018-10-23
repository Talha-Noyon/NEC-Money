(function($, anim) {
  'use strict';

  let _defaults = {
    exitDelay: 200,
    enterDelay: 0,
    html: null,
    margin: 5,
    inDuration: 250,
    outDuration: 200,
    position: 'bottom',
    transitionMovement: 10
  };

  /**
   * @class
   *
   */
  class Tooltip extends Component {
    /**
     * Construct Tooltip instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Tooltip, el, options);

      this.el.M_Tooltip = this;
      this.options = $.extend({}, Tooltip.defaults, options);

      this.isOpen = false;
      this.isHovered = false;
      this.isFocused = false;
      this._appendTooltipEl();
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
      return domElem.M_Tooltip;
    }

    /**
     * Teardown component
     */
    destroy() {
      $(this.tooltipEl).remove();
      this._removeEventHandlers();
      this.el.M_Tooltip = undefined;
    }

    _appendTooltipEl() {
      let tooltipEl = document.createElement('div');
      tooltipEl.classList.add('material-tooltip');
      this.tooltipEl = tooltipEl;

      let tooltipContentEl = document.createElement('div');
      tooltipContentEl.classList.add('tooltip-content');
      tooltipContentEl.innerHTML = this.options.html;
      tooltipEl.appendChild(tooltipContentEl);
      document.body.appendChild(tooltipEl);
    }

    _updateTooltipContent() {
      this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
    }

    _setupEventHandlers() {
      this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
      this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
      this._handleFocusBound = this._handleFocus.bind(this);
      this._handleBlurBound = this._handleBlur.bind(this);
      this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
      this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
      this.el.addEventListener('focus', this._handleFocusBound, true);
      this.el.addEventListener('blur', this._handleBlurBound, true);
    }

    _removeEventHandlers() {
      this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
      this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
      this.el.removeEventListener('focus', this._handleFocusBound, true);
      this.el.removeEventListener('blur', this._handleBlurBound, true);
    }

    open(isManual) {
      if (this.isOpen) {
        return;
      }
      isManual = isManual === undefined ? true : undefined; // Default value true
      this.isOpen = true;
      // Update tooltip content with HTML attribute options
      this.options = $.extend({}, this.options, this._getAttributeOptions());
      this._updateTooltipContent();
      this._setEnterDelayTimeout(isManual);
    }

    close() {
      if (!this.isOpen) {
        return;
      }

      this.isHovered = false;
      this.isFocused = false;
      this.isOpen = false;
      this._setExitDelayTimeout();
    }

    /**
     * Create timeout which delays when the tooltip closes
     */
    _setExitDelayTimeout() {
      clearTimeout(this._exitDelayTimeout);

      this._exitDelayTimeout = setTimeout(() => {
        if (this.isHovered || this.isFocused) {
          return;
        }

        this._animateOut();
      }, this.options.exitDelay);
    }

    /**
     * Create timeout which delays when the toast closes
     */
    _setEnterDelayTimeout(isManual) {
      clearTimeout(this._enterDelayTimeout);

      this._enterDelayTimeout = setTimeout(() => {
        if (!this.isHovered && !this.isFocused && !isManual) {
          return;
        }

        this._animateIn();
      }, this.options.enterDelay);
    }

    _positionTooltip() {
      let origin = this.el,
        tooltip = this.tooltipEl,
        originHeight = origin.offsetHeight,
        originWidth = origin.offsetWidth,
        tooltipHeight = tooltip.offsetHeight,
        tooltipWidth = tooltip.offsetWidth,
        newCoordinates,
        margin = this.options.margin,
        targetTop,
        targetLeft;

      (this.xMovement = 0), (this.yMovement = 0);

      targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
      targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

      if (this.options.position === 'top') {
        targetTop += -tooltipHeight - margin;
        targetLeft += originWidth / 2 - tooltipWidth / 2;
        this.yMovement = -this.options.transitionMovement;
      } else if (this.options.position === 'right') {
        targetTop += originHeight / 2 - tooltipHeight / 2;
        targetLeft += originWidth + margin;
        this.xMovement = this.options.transitionMovement;
      } else if (this.options.position === 'left') {
        targetTop += originHeight / 2 - tooltipHeight / 2;
        targetLeft += -tooltipWidth - margin;
        this.xMovement = -this.options.transitionMovement;
      } else {
        targetTop += originHeight + margin;
        targetLeft += originWidth / 2 - tooltipWidth / 2;
        this.yMovement = this.options.transitionMovement;
      }

      newCoordinates = this._repositionWithinScreen(
        targetLeft,
        targetTop,
        tooltipWidth,
        tooltipHeight
      );
      $(tooltip).css({
        top: newCoordinates.y + 'px',
        left: newCoordinates.x + 'px'
      });
    }

    _repositionWithinScreen(x, y, width, height) {
      let scrollLeft = M.getDocumentScrollLeft();
      let scrollTop = M.getDocumentScrollTop();
      let newX = x - scrollLeft;
      let newY = y - scrollTop;

      let bounding = {
        left: newX,
        top: newY,
        width: width,
        height: height
      };

      let offset = this.options.margin + this.options.transitionMovement;
      let edges = M.checkWithinContainer(document.body, bounding, offset);

      if (edges.left) {
        newX = offset;
      } else if (edges.right) {
        newX -= newX + width - window.innerWidth;
      }

      if (edges.top) {
        newY = offset;
      } else if (edges.bottom) {
        newY -= newY + height - window.innerHeight;
      }

      return {
        x: newX + scrollLeft,
        y: newY + scrollTop
      };
    }

    _animateIn() {
      this._positionTooltip();
      this.tooltipEl.style.visibility = 'visible';
      anim.remove(this.tooltipEl);
      anim({
        targets: this.tooltipEl,
        opacity: 1,
        translateX: this.xMovement,
        translateY: this.yMovement,
        duration: this.options.inDuration,
        easing: 'easeOutCubic'
      });
    }

    _animateOut() {
      anim.remove(this.tooltipEl);
      anim({
        targets: this.tooltipEl,
        opacity: 0,
        translateX: 0,
        translateY: 0,
        duration: this.options.outDuration,
        easing: 'easeOutCubic'
      });
    }

    _handleMouseEnter() {
      this.isHovered = true;
      this.isFocused = false; // Allows close of tooltip when opened by focus.
      this.open(false);
    }

    _handleMouseLeave() {
      this.isHovered = false;
      this.isFocused = false; // Allows close of tooltip when opened by focus.
      this.close();
    }

    _handleFocus() {
      if (M.tabPressed) {
        this.isFocused = true;
        this.open(false);
      }
    }

    _handleBlur() {
      this.isFocused = false;
      this.close();
    }

    _getAttributeOptions() {
      let attributeOptions = {};
      let tooltipTextOption = this.el.getAttribute('data-tooltip');
      let positionOption = this.el.getAttribute('data-position');

      if (tooltipTextOption) {
        attributeOptions.html = tooltipTextOption;
      }

      if (positionOption) {
        attributeOptions.position = positionOption;
      }
      return attributeOptions;
    }
  }

  M.Tooltip = Tooltip;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0b29sdGlwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBhbmltKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgZXhpdERlbGF5OiAyMDAsXHJcbiAgICBlbnRlckRlbGF5OiAwLFxyXG4gICAgaHRtbDogbnVsbCxcclxuICAgIG1hcmdpbjogNSxcclxuICAgIGluRHVyYXRpb246IDI1MCxcclxuICAgIG91dER1cmF0aW9uOiAyMDAsXHJcbiAgICBwb3NpdGlvbjogJ2JvdHRvbScsXHJcbiAgICB0cmFuc2l0aW9uTW92ZW1lbnQ6IDEwXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuICBjbGFzcyBUb29sdGlwIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFRvb2x0aXAgaW5zdGFuY2VcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgc3VwZXIoVG9vbHRpcCwgZWwsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5NX1Rvb2x0aXAgPSB0aGlzO1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVG9vbHRpcC5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmlzSG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmlzRm9jdXNlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9hcHBlbmRUb29sdGlwRWwoKTtcclxuICAgICAgdGhpcy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fVG9vbHRpcDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAkKHRoaXMudG9vbHRpcEVsKS5yZW1vdmUoKTtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLmVsLk1fVG9vbHRpcCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBfYXBwZW5kVG9vbHRpcEVsKCkge1xyXG4gICAgICBsZXQgdG9vbHRpcEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHRvb2x0aXBFbC5jbGFzc0xpc3QuYWRkKCdtYXRlcmlhbC10b29sdGlwJyk7XHJcbiAgICAgIHRoaXMudG9vbHRpcEVsID0gdG9vbHRpcEVsO1xyXG5cclxuICAgICAgbGV0IHRvb2x0aXBDb250ZW50RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgdG9vbHRpcENvbnRlbnRFbC5jbGFzc0xpc3QuYWRkKCd0b29sdGlwLWNvbnRlbnQnKTtcclxuICAgICAgdG9vbHRpcENvbnRlbnRFbC5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuaHRtbDtcclxuICAgICAgdG9vbHRpcEVsLmFwcGVuZENoaWxkKHRvb2x0aXBDb250ZW50RWwpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXBFbCk7XHJcbiAgICB9XHJcblxyXG4gICAgX3VwZGF0ZVRvb2x0aXBDb250ZW50KCkge1xyXG4gICAgICB0aGlzLnRvb2x0aXBFbC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcC1jb250ZW50JykuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLmh0bWw7XHJcbiAgICB9XHJcblxyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kID0gdGhpcy5faGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQgPSB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUZvY3VzQm91bmQgPSB0aGlzLl9oYW5kbGVGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVCbHVyQm91bmQgPSB0aGlzLl9oYW5kbGVCbHVyLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2hhbmRsZU1vdXNlRW50ZXJCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZU1vdXNlTGVhdmVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9oYW5kbGVGb2N1c0JvdW5kLCB0cnVlKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5faGFuZGxlQmx1ckJvdW5kLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5faGFuZGxlTW91c2VMZWF2ZUJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2hhbmRsZUZvY3VzQm91bmQsIHRydWUpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVCbHVyQm91bmQsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW4oaXNNYW51YWwpIHtcclxuICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlzTWFudWFsID0gaXNNYW51YWwgPT09IHVuZGVmaW5lZCA/IHRydWUgOiB1bmRlZmluZWQ7IC8vIERlZmF1bHQgdmFsdWUgdHJ1ZVxyXG4gICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgIC8vIFVwZGF0ZSB0b29sdGlwIGNvbnRlbnQgd2l0aCBIVE1MIGF0dHJpYnV0ZSBvcHRpb25zXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHRoaXMuX2dldEF0dHJpYnV0ZU9wdGlvbnMoKSk7XHJcbiAgICAgIHRoaXMuX3VwZGF0ZVRvb2x0aXBDb250ZW50KCk7XHJcbiAgICAgIHRoaXMuX3NldEVudGVyRGVsYXlUaW1lb3V0KGlzTWFudWFsKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgaWYgKCF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pc0hvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgdGhpcy5fc2V0RXhpdERlbGF5VGltZW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHRpbWVvdXQgd2hpY2ggZGVsYXlzIHdoZW4gdGhlIHRvb2x0aXAgY2xvc2VzXHJcbiAgICAgKi9cclxuICAgIF9zZXRFeGl0RGVsYXlUaW1lb3V0KCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fZXhpdERlbGF5VGltZW91dCk7XHJcblxyXG4gICAgICB0aGlzLl9leGl0RGVsYXlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb3ZlcmVkIHx8IHRoaXMuaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hbmltYXRlT3V0KCk7XHJcbiAgICAgIH0sIHRoaXMub3B0aW9ucy5leGl0RGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHRpbWVvdXQgd2hpY2ggZGVsYXlzIHdoZW4gdGhlIHRvYXN0IGNsb3Nlc1xyXG4gICAgICovXHJcbiAgICBfc2V0RW50ZXJEZWxheVRpbWVvdXQoaXNNYW51YWwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2VudGVyRGVsYXlUaW1lb3V0KTtcclxuXHJcbiAgICAgIHRoaXMuX2VudGVyRGVsYXlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzSG92ZXJlZCAmJiAhdGhpcy5pc0ZvY3VzZWQgJiYgIWlzTWFudWFsKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hbmltYXRlSW4oKTtcclxuICAgICAgfSwgdGhpcy5vcHRpb25zLmVudGVyRGVsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIF9wb3NpdGlvblRvb2x0aXAoKSB7XHJcbiAgICAgIGxldCBvcmlnaW4gPSB0aGlzLmVsLFxyXG4gICAgICAgIHRvb2x0aXAgPSB0aGlzLnRvb2x0aXBFbCxcclxuICAgICAgICBvcmlnaW5IZWlnaHQgPSBvcmlnaW4ub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgIG9yaWdpbldpZHRoID0gb3JpZ2luLm9mZnNldFdpZHRoLFxyXG4gICAgICAgIHRvb2x0aXBIZWlnaHQgPSB0b29sdGlwLm9mZnNldEhlaWdodCxcclxuICAgICAgICB0b29sdGlwV2lkdGggPSB0b29sdGlwLm9mZnNldFdpZHRoLFxyXG4gICAgICAgIG5ld0Nvb3JkaW5hdGVzLFxyXG4gICAgICAgIG1hcmdpbiA9IHRoaXMub3B0aW9ucy5tYXJnaW4sXHJcbiAgICAgICAgdGFyZ2V0VG9wLFxyXG4gICAgICAgIHRhcmdldExlZnQ7XHJcblxyXG4gICAgICAodGhpcy54TW92ZW1lbnQgPSAwKSwgKHRoaXMueU1vdmVtZW50ID0gMCk7XHJcblxyXG4gICAgICB0YXJnZXRUb3AgPSBvcmlnaW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgTS5nZXREb2N1bWVudFNjcm9sbFRvcCgpO1xyXG4gICAgICB0YXJnZXRMZWZ0ID0gb3JpZ2luLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyBNLmdldERvY3VtZW50U2Nyb2xsTGVmdCgpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9PT0gJ3RvcCcpIHtcclxuICAgICAgICB0YXJnZXRUb3AgKz0gLXRvb2x0aXBIZWlnaHQgLSBtYXJnaW47XHJcbiAgICAgICAgdGFyZ2V0TGVmdCArPSBvcmlnaW5XaWR0aCAvIDIgLSB0b29sdGlwV2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMueU1vdmVtZW50ID0gLXRoaXMub3B0aW9ucy50cmFuc2l0aW9uTW92ZW1lbnQ7XHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBvc2l0aW9uID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgdGFyZ2V0VG9wICs9IG9yaWdpbkhlaWdodCAvIDIgLSB0b29sdGlwSGVpZ2h0IC8gMjtcclxuICAgICAgICB0YXJnZXRMZWZ0ICs9IG9yaWdpbldpZHRoICsgbWFyZ2luO1xyXG4gICAgICAgIHRoaXMueE1vdmVtZW50ID0gdGhpcy5vcHRpb25zLnRyYW5zaXRpb25Nb3ZlbWVudDtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucG9zaXRpb24gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgIHRhcmdldFRvcCArPSBvcmlnaW5IZWlnaHQgLyAyIC0gdG9vbHRpcEhlaWdodCAvIDI7XHJcbiAgICAgICAgdGFyZ2V0TGVmdCArPSAtdG9vbHRpcFdpZHRoIC0gbWFyZ2luO1xyXG4gICAgICAgIHRoaXMueE1vdmVtZW50ID0gLXRoaXMub3B0aW9ucy50cmFuc2l0aW9uTW92ZW1lbnQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGFyZ2V0VG9wICs9IG9yaWdpbkhlaWdodCArIG1hcmdpbjtcclxuICAgICAgICB0YXJnZXRMZWZ0ICs9IG9yaWdpbldpZHRoIC8gMiAtIHRvb2x0aXBXaWR0aCAvIDI7XHJcbiAgICAgICAgdGhpcy55TW92ZW1lbnQgPSB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbk1vdmVtZW50O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXdDb29yZGluYXRlcyA9IHRoaXMuX3JlcG9zaXRpb25XaXRoaW5TY3JlZW4oXHJcbiAgICAgICAgdGFyZ2V0TGVmdCxcclxuICAgICAgICB0YXJnZXRUb3AsXHJcbiAgICAgICAgdG9vbHRpcFdpZHRoLFxyXG4gICAgICAgIHRvb2x0aXBIZWlnaHRcclxuICAgICAgKTtcclxuICAgICAgJCh0b29sdGlwKS5jc3Moe1xyXG4gICAgICAgIHRvcDogbmV3Q29vcmRpbmF0ZXMueSArICdweCcsXHJcbiAgICAgICAgbGVmdDogbmV3Q29vcmRpbmF0ZXMueCArICdweCdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX3JlcG9zaXRpb25XaXRoaW5TY3JlZW4oeCwgeSwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgICBsZXQgc2Nyb2xsTGVmdCA9IE0uZ2V0RG9jdW1lbnRTY3JvbGxMZWZ0KCk7XHJcbiAgICAgIGxldCBzY3JvbGxUb3AgPSBNLmdldERvY3VtZW50U2Nyb2xsVG9wKCk7XHJcbiAgICAgIGxldCBuZXdYID0geCAtIHNjcm9sbExlZnQ7XHJcbiAgICAgIGxldCBuZXdZID0geSAtIHNjcm9sbFRvcDtcclxuXHJcbiAgICAgIGxldCBib3VuZGluZyA9IHtcclxuICAgICAgICBsZWZ0OiBuZXdYLFxyXG4gICAgICAgIHRvcDogbmV3WSxcclxuICAgICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGxldCBvZmZzZXQgPSB0aGlzLm9wdGlvbnMubWFyZ2luICsgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25Nb3ZlbWVudDtcclxuICAgICAgbGV0IGVkZ2VzID0gTS5jaGVja1dpdGhpbkNvbnRhaW5lcihkb2N1bWVudC5ib2R5LCBib3VuZGluZywgb2Zmc2V0KTtcclxuXHJcbiAgICAgIGlmIChlZGdlcy5sZWZ0KSB7XHJcbiAgICAgICAgbmV3WCA9IG9mZnNldDtcclxuICAgICAgfSBlbHNlIGlmIChlZGdlcy5yaWdodCkge1xyXG4gICAgICAgIG5ld1ggLT0gbmV3WCArIHdpZHRoIC0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlZGdlcy50b3ApIHtcclxuICAgICAgICBuZXdZID0gb2Zmc2V0O1xyXG4gICAgICB9IGVsc2UgaWYgKGVkZ2VzLmJvdHRvbSkge1xyXG4gICAgICAgIG5ld1kgLT0gbmV3WSArIGhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBuZXdYICsgc2Nyb2xsTGVmdCxcclxuICAgICAgICB5OiBuZXdZICsgc2Nyb2xsVG9wXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgX2FuaW1hdGVJbigpIHtcclxuICAgICAgdGhpcy5fcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgIHRoaXMudG9vbHRpcEVsLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMudG9vbHRpcEVsKTtcclxuICAgICAgYW5pbSh7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy50b29sdGlwRWwsXHJcbiAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICB0cmFuc2xhdGVYOiB0aGlzLnhNb3ZlbWVudCxcclxuICAgICAgICB0cmFuc2xhdGVZOiB0aGlzLnlNb3ZlbWVudCxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dEN1YmljJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYW5pbWF0ZU91dCgpIHtcclxuICAgICAgYW5pbS5yZW1vdmUodGhpcy50b29sdGlwRWwpO1xyXG4gICAgICBhbmltKHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLnRvb2x0aXBFbCxcclxuICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgIHRyYW5zbGF0ZVg6IDAsXHJcbiAgICAgICAgdHJhbnNsYXRlWTogMCxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgIGVhc2luZzogJ2Vhc2VPdXRDdWJpYydcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZU1vdXNlRW50ZXIoKSB7XHJcbiAgICAgIHRoaXMuaXNIb3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZTsgLy8gQWxsb3dzIGNsb3NlIG9mIHRvb2x0aXAgd2hlbiBvcGVuZWQgYnkgZm9jdXMuXHJcbiAgICAgIHRoaXMub3BlbihmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZU1vdXNlTGVhdmUoKSB7XHJcbiAgICAgIHRoaXMuaXNIb3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaXNGb2N1c2VkID0gZmFsc2U7IC8vIEFsbG93cyBjbG9zZSBvZiB0b29sdGlwIHdoZW4gb3BlbmVkIGJ5IGZvY3VzLlxyXG4gICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZUZvY3VzKCkge1xyXG4gICAgICBpZiAoTS50YWJQcmVzc2VkKSB7XHJcbiAgICAgICAgdGhpcy5pc0ZvY3VzZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub3BlbihmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlQmx1cigpIHtcclxuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9nZXRBdHRyaWJ1dGVPcHRpb25zKCkge1xyXG4gICAgICBsZXQgYXR0cmlidXRlT3B0aW9ucyA9IHt9O1xyXG4gICAgICBsZXQgdG9vbHRpcFRleHRPcHRpb24gPSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS10b29sdGlwJyk7XHJcbiAgICAgIGxldCBwb3NpdGlvbk9wdGlvbiA9IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXBvc2l0aW9uJyk7XHJcblxyXG4gICAgICBpZiAodG9vbHRpcFRleHRPcHRpb24pIHtcclxuICAgICAgICBhdHRyaWJ1dGVPcHRpb25zLmh0bWwgPSB0b29sdGlwVGV4dE9wdGlvbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uKSB7XHJcbiAgICAgICAgYXR0cmlidXRlT3B0aW9ucy5wb3NpdGlvbiA9IHBvc2l0aW9uT3B0aW9uO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVPcHRpb25zO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTS5Ub29sdGlwID0gVG9vbHRpcDtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFRvb2x0aXAsICd0b29sdGlwJywgJ01fVG9vbHRpcCcpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbiJdLCJmaWxlIjoidG9vbHRpcC5qcyJ9
