(function($, anim) {
  'use strict';

  let _defaults = {
    html: '',
    displayLength: 4000,
    inDuration: 300,
    outDuration: 375,
    classes: '',
    completeCallback: null,
    activationPercent: 0.8
  };

  class Toast {
    constructor(options) {
      /**
       * Options for the toast
       * @member Toast#options
       */
      this.options = $.extend({}, Toast.defaults, options);
      this.message = this.options.html;

      /**
       * Describes current pan state toast
       * @type {Boolean}
       */
      this.panning = false;

      /**
       * Time remaining until toast is removed
       */
      this.timeRemaining = this.options.displayLength;

      if (Toast._toasts.length === 0) {
        Toast._createContainer();
      }

      // Create new toast
      Toast._toasts.push(this);
      let toastElement = this._createToast();
      toastElement.M_Toast = this;
      this.el = toastElement;
      this.$el = $(toastElement);
      this._animateIn();
      this._setTimer();
    }

    static get defaults() {
      return _defaults;
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Toast;
    }

    /**
     * Append toast container and add event handlers
     */
    static _createContainer() {
      let container = document.createElement('div');
      container.setAttribute('id', 'toast-container');

      // Add event handler
      container.addEventListener('touchstart', Toast._onDragStart);
      container.addEventListener('touchmove', Toast._onDragMove);
      container.addEventListener('touchend', Toast._onDragEnd);

      container.addEventListener('mousedown', Toast._onDragStart);
      document.addEventListener('mousemove', Toast._onDragMove);
      document.addEventListener('mouseup', Toast._onDragEnd);

      document.body.appendChild(container);
      Toast._container = container;
    }

    /**
     * Remove toast container and event handlers
     */
    static _removeContainer() {
      // Add event handler
      document.removeEventListener('mousemove', Toast._onDragMove);
      document.removeEventListener('mouseup', Toast._onDragEnd);

      $(Toast._container).remove();
      Toast._container = null;
    }

    /**
     * Begin drag handler
     * @param {Event} e
     */
    static _onDragStart(e) {
      if (e.target && $(e.target).closest('.toast').length) {
        let $toast = $(e.target).closest('.toast');
        let toast = $toast[0].M_Toast;
        toast.panning = true;
        Toast._draggedToast = toast;
        toast.el.classList.add('panning');
        toast.el.style.transition = '';
        toast.startingXPos = Toast._xPos(e);
        toast.time = Date.now();
        toast.xPos = Toast._xPos(e);
      }
    }

    /**
     * Drag move handler
     * @param {Event} e
     */
    static _onDragMove(e) {
      if (!!Toast._draggedToast) {
        e.preventDefault();
        let toast = Toast._draggedToast;
        toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
        toast.xPos = Toast._xPos(e);
        toast.velocityX = toast.deltaX / (Date.now() - toast.time);
        toast.time = Date.now();

        let totalDeltaX = toast.xPos - toast.startingXPos;
        let activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
        toast.el.style.transform = `translateX(${totalDeltaX}px)`;
        toast.el.style.opacity = 1 - Math.abs(totalDeltaX / activationDistance);
      }
    }

    /**
     * End drag handler
     */
    static _onDragEnd() {
      if (!!Toast._draggedToast) {
        let toast = Toast._draggedToast;
        toast.panning = false;
        toast.el.classList.remove('panning');

        let totalDeltaX = toast.xPos - toast.startingXPos;
        let activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
        let shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance || toast.velocityX > 1;

        // Remove toast
        if (shouldBeDismissed) {
          toast.wasSwiped = true;
          toast.dismiss();

          // Animate toast back to original position
        } else {
          toast.el.style.transition = 'transform .2s, opacity .2s';
          toast.el.style.transform = '';
          toast.el.style.opacity = '';
        }
        Toast._draggedToast = null;
      }
    }

    /**
     * Get x position of mouse or touch event
     * @param {Event} e
     */
    static _xPos(e) {
      if (e.targetTouches && e.targetTouches.length >= 1) {
        return e.targetTouches[0].clientX;
      }
      // mouse event
      return e.clientX;
    }

    /**
     * Remove all toasts
     */
    static dismissAll() {
      for (let toastIndex in Toast._toasts) {
        Toast._toasts[toastIndex].dismiss();
      }
    }

    /**
     * Create toast and append it to toast container
     */
    _createToast() {
      let toast = document.createElement('div');
      toast.classList.add('toast');

      // Add custom classes onto toast
      if (!!this.options.classes.length) {
        $(toast).addClass(this.options.classes);
      }

      // Set content
      if (
        typeof HTMLElement === 'object'
          ? this.message instanceof HTMLElement
          : this.message &&
            typeof this.message === 'object' &&
            this.message !== null &&
            this.message.nodeType === 1 &&
            typeof this.message.nodeName === 'string'
      ) {
        toast.appendChild(this.message);

        // Check if it is jQuery object
      } else if (!!this.message.jquery) {
        $(toast).append(this.message[0]);

        // Insert as html;
      } else {
        toast.innerHTML = this.message;
      }

      // Append toasft
      Toast._container.appendChild(toast);
      return toast;
    }

    /**
     * Animate in toast
     */
    _animateIn() {
      // Animate toast in
      anim({
        targets: this.el,
        top: 0,
        opacity: 1,
        duration: this.options.inDuration,
        easing: 'easeOutCubic'
      });
    }

    /**
     * Create setInterval which automatically removes toast when timeRemaining >= 0
     * has been reached
     */
    _setTimer() {
      if (this.timeRemaining !== Infinity) {
        this.counterInterval = setInterval(() => {
          // If toast is not being dragged, decrease its time remaining
          if (!this.panning) {
            this.timeRemaining -= 20;
          }

          // Animate toast out
          if (this.timeRemaining <= 0) {
            this.dismiss();
          }
        }, 20);
      }
    }

    /**
     * Dismiss toast with animation
     */
    dismiss() {
      window.clearInterval(this.counterInterval);
      let activationDistance = this.el.offsetWidth * this.options.activationPercent;

      if (this.wasSwiped) {
        this.el.style.transition = 'transform .05s, opacity .05s';
        this.el.style.transform = `translateX(${activationDistance}px)`;
        this.el.style.opacity = 0;
      }

      anim({
        targets: this.el,
        opacity: 0,
        marginTop: -40,
        duration: this.options.outDuration,
        easing: 'easeOutExpo',
        complete: () => {
          // Call the optional callback
          if (typeof this.options.completeCallback === 'function') {
            this.options.completeCallback();
          }
          // Remove toast from DOM
          this.$el.remove();
          Toast._toasts.splice(Toast._toasts.indexOf(this), 1);
          if (Toast._toasts.length === 0) {
            Toast._removeContainer();
          }
        }
      });
    }
  }

  /**
   * @static
   * @memberof Toast
   * @type {Array.<Toast>}
   */
  Toast._toasts = [];

  /**
   * @static
   * @memberof Toast
   */
  Toast._container = null;

  /**
   * @static
   * @memberof Toast
   * @type {Toast}
   */
  Toast._draggedToast = null;

  M.Toast = Toast;
  M.toast = function(options) {
    return new Toast(options);
  };
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0b2FzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBfZGVmYXVsdHMgPSB7XHJcbiAgICBodG1sOiAnJyxcclxuICAgIGRpc3BsYXlMZW5ndGg6IDQwMDAsXHJcbiAgICBpbkR1cmF0aW9uOiAzMDAsXHJcbiAgICBvdXREdXJhdGlvbjogMzc1LFxyXG4gICAgY2xhc3NlczogJycsXHJcbiAgICBjb21wbGV0ZUNhbGxiYWNrOiBudWxsLFxyXG4gICAgYWN0aXZhdGlvblBlcmNlbnQ6IDAuOFxyXG4gIH07XHJcblxyXG4gIGNsYXNzIFRvYXN0IHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSB0b2FzdFxyXG4gICAgICAgKiBAbWVtYmVyIFRvYXN0I29wdGlvbnNcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUb2FzdC5kZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgIHRoaXMubWVzc2FnZSA9IHRoaXMub3B0aW9ucy5odG1sO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBjdXJyZW50IHBhbiBzdGF0ZSB0b2FzdFxyXG4gICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMucGFubmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRpbWUgcmVtYWluaW5nIHVudGlsIHRvYXN0IGlzIHJlbW92ZWRcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMudGltZVJlbWFpbmluZyA9IHRoaXMub3B0aW9ucy5kaXNwbGF5TGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKFRvYXN0Ll90b2FzdHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgVG9hc3QuX2NyZWF0ZUNvbnRhaW5lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDcmVhdGUgbmV3IHRvYXN0XHJcbiAgICAgIFRvYXN0Ll90b2FzdHMucHVzaCh0aGlzKTtcclxuICAgICAgbGV0IHRvYXN0RWxlbWVudCA9IHRoaXMuX2NyZWF0ZVRvYXN0KCk7XHJcbiAgICAgIHRvYXN0RWxlbWVudC5NX1RvYXN0ID0gdGhpcztcclxuICAgICAgdGhpcy5lbCA9IHRvYXN0RWxlbWVudDtcclxuICAgICAgdGhpcy4kZWwgPSAkKHRvYXN0RWxlbWVudCk7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVJbigpO1xyXG4gICAgICB0aGlzLl9zZXRUaW1lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX1RvYXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXBwZW5kIHRvYXN0IGNvbnRhaW5lciBhbmQgYWRkIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfY3JlYXRlQ29udGFpbmVyKCkge1xyXG4gICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RvYXN0LWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgLy8gQWRkIGV2ZW50IGhhbmRsZXJcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBUb2FzdC5fb25EcmFnU3RhcnQpO1xyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgVG9hc3QuX29uRHJhZ01vdmUpO1xyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBUb2FzdC5fb25EcmFnRW5kKTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBUb2FzdC5fb25EcmFnU3RhcnQpO1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBUb2FzdC5fb25EcmFnTW92ZSk7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBUb2FzdC5fb25EcmFnRW5kKTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcclxuICAgICAgVG9hc3QuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSB0b2FzdCBjb250YWluZXIgYW5kIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfcmVtb3ZlQ29udGFpbmVyKCkge1xyXG4gICAgICAvLyBBZGQgZXZlbnQgaGFuZGxlclxyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBUb2FzdC5fb25EcmFnTW92ZSk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBUb2FzdC5fb25EcmFnRW5kKTtcclxuXHJcbiAgICAgICQoVG9hc3QuX2NvbnRhaW5lcikucmVtb3ZlKCk7XHJcbiAgICAgIFRvYXN0Ll9jb250YWluZXIgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmVnaW4gZHJhZyBoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfb25EcmFnU3RhcnQoZSkge1xyXG4gICAgICBpZiAoZS50YXJnZXQgJiYgJChlLnRhcmdldCkuY2xvc2VzdCgnLnRvYXN0JykubGVuZ3RoKSB7XHJcbiAgICAgICAgbGV0ICR0b2FzdCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50b2FzdCcpO1xyXG4gICAgICAgIGxldCB0b2FzdCA9ICR0b2FzdFswXS5NX1RvYXN0O1xyXG4gICAgICAgIHRvYXN0LnBhbm5pbmcgPSB0cnVlO1xyXG4gICAgICAgIFRvYXN0Ll9kcmFnZ2VkVG9hc3QgPSB0b2FzdDtcclxuICAgICAgICB0b2FzdC5lbC5jbGFzc0xpc3QuYWRkKCdwYW5uaW5nJyk7XHJcbiAgICAgICAgdG9hc3QuZWwuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xyXG4gICAgICAgIHRvYXN0LnN0YXJ0aW5nWFBvcyA9IFRvYXN0Ll94UG9zKGUpO1xyXG4gICAgICAgIHRvYXN0LnRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIHRvYXN0LnhQb3MgPSBUb2FzdC5feFBvcyhlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHJhZyBtb3ZlIGhhbmRsZXJcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9vbkRyYWdNb3ZlKGUpIHtcclxuICAgICAgaWYgKCEhVG9hc3QuX2RyYWdnZWRUb2FzdCkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBsZXQgdG9hc3QgPSBUb2FzdC5fZHJhZ2dlZFRvYXN0O1xyXG4gICAgICAgIHRvYXN0LmRlbHRhWCA9IE1hdGguYWJzKHRvYXN0LnhQb3MgLSBUb2FzdC5feFBvcyhlKSk7XHJcbiAgICAgICAgdG9hc3QueFBvcyA9IFRvYXN0Ll94UG9zKGUpO1xyXG4gICAgICAgIHRvYXN0LnZlbG9jaXR5WCA9IHRvYXN0LmRlbHRhWCAvIChEYXRlLm5vdygpIC0gdG9hc3QudGltZSk7XHJcbiAgICAgICAgdG9hc3QudGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICAgIGxldCB0b3RhbERlbHRhWCA9IHRvYXN0LnhQb3MgLSB0b2FzdC5zdGFydGluZ1hQb3M7XHJcbiAgICAgICAgbGV0IGFjdGl2YXRpb25EaXN0YW5jZSA9IHRvYXN0LmVsLm9mZnNldFdpZHRoICogdG9hc3Qub3B0aW9ucy5hY3RpdmF0aW9uUGVyY2VudDtcclxuICAgICAgICB0b2FzdC5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgke3RvdGFsRGVsdGFYfXB4KWA7XHJcbiAgICAgICAgdG9hc3QuZWwuc3R5bGUub3BhY2l0eSA9IDEgLSBNYXRoLmFicyh0b3RhbERlbHRhWCAvIGFjdGl2YXRpb25EaXN0YW5jZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCBkcmFnIGhhbmRsZXJcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9vbkRyYWdFbmQoKSB7XHJcbiAgICAgIGlmICghIVRvYXN0Ll9kcmFnZ2VkVG9hc3QpIHtcclxuICAgICAgICBsZXQgdG9hc3QgPSBUb2FzdC5fZHJhZ2dlZFRvYXN0O1xyXG4gICAgICAgIHRvYXN0LnBhbm5pbmcgPSBmYWxzZTtcclxuICAgICAgICB0b2FzdC5lbC5jbGFzc0xpc3QucmVtb3ZlKCdwYW5uaW5nJyk7XHJcblxyXG4gICAgICAgIGxldCB0b3RhbERlbHRhWCA9IHRvYXN0LnhQb3MgLSB0b2FzdC5zdGFydGluZ1hQb3M7XHJcbiAgICAgICAgbGV0IGFjdGl2YXRpb25EaXN0YW5jZSA9IHRvYXN0LmVsLm9mZnNldFdpZHRoICogdG9hc3Qub3B0aW9ucy5hY3RpdmF0aW9uUGVyY2VudDtcclxuICAgICAgICBsZXQgc2hvdWxkQmVEaXNtaXNzZWQgPSBNYXRoLmFicyh0b3RhbERlbHRhWCkgPiBhY3RpdmF0aW9uRGlzdGFuY2UgfHwgdG9hc3QudmVsb2NpdHlYID4gMTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRvYXN0XHJcbiAgICAgICAgaWYgKHNob3VsZEJlRGlzbWlzc2VkKSB7XHJcbiAgICAgICAgICB0b2FzdC53YXNTd2lwZWQgPSB0cnVlO1xyXG4gICAgICAgICAgdG9hc3QuZGlzbWlzcygpO1xyXG5cclxuICAgICAgICAgIC8vIEFuaW1hdGUgdG9hc3QgYmFjayB0byBvcmlnaW5hbCBwb3NpdGlvblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0b2FzdC5lbC5zdHlsZS50cmFuc2l0aW9uID0gJ3RyYW5zZm9ybSAuMnMsIG9wYWNpdHkgLjJzJztcclxuICAgICAgICAgIHRvYXN0LmVsLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xyXG4gICAgICAgICAgdG9hc3QuZWwuc3R5bGUub3BhY2l0eSA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBUb2FzdC5fZHJhZ2dlZFRvYXN0ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHggcG9zaXRpb24gb2YgbW91c2Ugb3IgdG91Y2ggZXZlbnRcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF94UG9zKGUpIHtcclxuICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgIH1cclxuICAgICAgLy8gbW91c2UgZXZlbnRcclxuICAgICAgcmV0dXJuIGUuY2xpZW50WDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhbGwgdG9hc3RzXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBkaXNtaXNzQWxsKCkge1xyXG4gICAgICBmb3IgKGxldCB0b2FzdEluZGV4IGluIFRvYXN0Ll90b2FzdHMpIHtcclxuICAgICAgICBUb2FzdC5fdG9hc3RzW3RvYXN0SW5kZXhdLmRpc21pc3MoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHRvYXN0IGFuZCBhcHBlbmQgaXQgdG8gdG9hc3QgY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIF9jcmVhdGVUb2FzdCgpIHtcclxuICAgICAgbGV0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHRvYXN0LmNsYXNzTGlzdC5hZGQoJ3RvYXN0Jyk7XHJcblxyXG4gICAgICAvLyBBZGQgY3VzdG9tIGNsYXNzZXMgb250byB0b2FzdFxyXG4gICAgICBpZiAoISF0aGlzLm9wdGlvbnMuY2xhc3Nlcy5sZW5ndGgpIHtcclxuICAgICAgICAkKHRvYXN0KS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNldCBjb250ZW50XHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdvYmplY3QnXHJcbiAgICAgICAgICA/IHRoaXMubWVzc2FnZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XHJcbiAgICAgICAgICA6IHRoaXMubWVzc2FnZSAmJlxyXG4gICAgICAgICAgICB0eXBlb2YgdGhpcy5tZXNzYWdlID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgIT09IG51bGwgJiZcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm5vZGVUeXBlID09PSAxICYmXHJcbiAgICAgICAgICAgIHR5cGVvZiB0aGlzLm1lc3NhZ2Uubm9kZU5hbWUgPT09ICdzdHJpbmcnXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRvYXN0LmFwcGVuZENoaWxkKHRoaXMubWVzc2FnZSk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIGl0IGlzIGpRdWVyeSBvYmplY3RcclxuICAgICAgfSBlbHNlIGlmICghIXRoaXMubWVzc2FnZS5qcXVlcnkpIHtcclxuICAgICAgICAkKHRvYXN0KS5hcHBlbmQodGhpcy5tZXNzYWdlWzBdKTtcclxuXHJcbiAgICAgICAgLy8gSW5zZXJ0IGFzIGh0bWw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdG9hc3QuaW5uZXJIVE1MID0gdGhpcy5tZXNzYWdlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBcHBlbmQgdG9hc2Z0XHJcbiAgICAgIFRvYXN0Ll9jb250YWluZXIuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG4gICAgICByZXR1cm4gdG9hc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRlIGluIHRvYXN0XHJcbiAgICAgKi9cclxuICAgIF9hbmltYXRlSW4oKSB7XHJcbiAgICAgIC8vIEFuaW1hdGUgdG9hc3QgaW5cclxuICAgICAgYW5pbSh7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dEN1YmljJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzZXRJbnRlcnZhbCB3aGljaCBhdXRvbWF0aWNhbGx5IHJlbW92ZXMgdG9hc3Qgd2hlbiB0aW1lUmVtYWluaW5nID49IDBcclxuICAgICAqIGhhcyBiZWVuIHJlYWNoZWRcclxuICAgICAqL1xyXG4gICAgX3NldFRpbWVyKCkge1xyXG4gICAgICBpZiAodGhpcy50aW1lUmVtYWluaW5nICE9PSBJbmZpbml0eSkge1xyXG4gICAgICAgIHRoaXMuY291bnRlckludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgLy8gSWYgdG9hc3QgaXMgbm90IGJlaW5nIGRyYWdnZWQsIGRlY3JlYXNlIGl0cyB0aW1lIHJlbWFpbmluZ1xyXG4gICAgICAgICAgaWYgKCF0aGlzLnBhbm5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nIC09IDIwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEFuaW1hdGUgdG9hc3Qgb3V0XHJcbiAgICAgICAgICBpZiAodGhpcy50aW1lUmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNtaXNzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMjApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNtaXNzIHRvYXN0IHdpdGggYW5pbWF0aW9uXHJcbiAgICAgKi9cclxuICAgIGRpc21pc3MoKSB7XHJcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuY291bnRlckludGVydmFsKTtcclxuICAgICAgbGV0IGFjdGl2YXRpb25EaXN0YW5jZSA9IHRoaXMuZWwub2Zmc2V0V2lkdGggKiB0aGlzLm9wdGlvbnMuYWN0aXZhdGlvblBlcmNlbnQ7XHJcblxyXG4gICAgICBpZiAodGhpcy53YXNTd2lwZWQpIHtcclxuICAgICAgICB0aGlzLmVsLnN0eWxlLnRyYW5zaXRpb24gPSAndHJhbnNmb3JtIC4wNXMsIG9wYWNpdHkgLjA1cyc7XHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgke2FjdGl2YXRpb25EaXN0YW5jZX1weClgO1xyXG4gICAgICAgIHRoaXMuZWwuc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFuaW0oe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMuZWwsXHJcbiAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICBtYXJnaW5Ub3A6IC00MCxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgIGVhc2luZzogJ2Vhc2VPdXRFeHBvJyxcclxuICAgICAgICBjb21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgICAgLy8gQ2FsbCB0aGUgb3B0aW9uYWwgY2FsbGJhY2tcclxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNvbXBsZXRlQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvbXBsZXRlQ2FsbGJhY2soKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIFJlbW92ZSB0b2FzdCBmcm9tIERPTVxyXG4gICAgICAgICAgdGhpcy4kZWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICBUb2FzdC5fdG9hc3RzLnNwbGljZShUb2FzdC5fdG9hc3RzLmluZGV4T2YodGhpcyksIDEpO1xyXG4gICAgICAgICAgaWYgKFRvYXN0Ll90b2FzdHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIFRvYXN0Ll9yZW1vdmVDb250YWluZXIoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBUb2FzdFxyXG4gICAqIEB0eXBlIHtBcnJheS48VG9hc3Q+fVxyXG4gICAqL1xyXG4gIFRvYXN0Ll90b2FzdHMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBUb2FzdFxyXG4gICAqL1xyXG4gIFRvYXN0Ll9jb250YWluZXIgPSBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFRvYXN0XHJcbiAgICogQHR5cGUge1RvYXN0fVxyXG4gICAqL1xyXG4gIFRvYXN0Ll9kcmFnZ2VkVG9hc3QgPSBudWxsO1xyXG5cclxuICBNLlRvYXN0ID0gVG9hc3Q7XHJcbiAgTS50b2FzdCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICAgIHJldHVybiBuZXcgVG9hc3Qob3B0aW9ucyk7XHJcbiAgfTtcclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbiJdLCJmaWxlIjoidG9hc3RzLmpzIn0=
