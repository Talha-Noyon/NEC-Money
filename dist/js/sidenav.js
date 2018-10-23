(function($, anim) {
  'use strict';

  let _defaults = {
    edge: 'left',
    draggable: true,
    inDuration: 250,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true
  };

  /**
   * @class
   */
  class Sidenav extends Component {
    /**
     * Construct Sidenav instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Sidenav, el, options);

      this.el.M_Sidenav = this;
      this.id = this.$el.attr('id');

      /**
       * Options for the Sidenav
       * @member Sidenav#options
       * @prop {String} [edge='left'] - Side of screen on which Sidenav appears
       * @prop {Boolean} [draggable=true] - Allow swipe gestures to open/close Sidenav
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Function called when sidenav starts entering
       * @prop {Function} onOpenEnd - Function called when sidenav finishes entering
       * @prop {Function} onCloseStart - Function called when sidenav starts exiting
       * @prop {Function} onCloseEnd - Function called when sidenav finishes exiting
       */
      this.options = $.extend({}, Sidenav.defaults, options);

      /**
       * Describes open/close state of Sidenav
       * @type {Boolean}
       */
      this.isOpen = false;

      /**
       * Describes if Sidenav is fixed
       * @type {Boolean}
       */
      this.isFixed = this.el.classList.contains('sidenav-fixed');

      /**
       * Describes if Sidenav is being draggeed
       * @type {Boolean}
       */
      this.isDragged = false;

      // Window size variables for window resize checks
      this.lastWindowWidth = window.innerWidth;
      this.lastWindowHeight = window.innerHeight;

      this._createOverlay();
      this._createDragTarget();
      this._setupEventHandlers();
      this._setupClasses();
      this._setupFixed();

      Sidenav._sidenavs.push(this);
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
      return domElem.M_Sidenav;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._enableBodyScrolling();
      this._overlay.parentNode.removeChild(this._overlay);
      this.dragTarget.parentNode.removeChild(this.dragTarget);
      this.el.M_Sidenav = undefined;
      this.el.style.transform = '';

      let index = Sidenav._sidenavs.indexOf(this);
      if (index >= 0) {
        Sidenav._sidenavs.splice(index, 1);
      }
    }

    _createOverlay() {
      let overlay = document.createElement('div');
      this._closeBound = this.close.bind(this);
      overlay.classList.add('sidenav-overlay');

      overlay.addEventListener('click', this._closeBound);

      document.body.appendChild(overlay);
      this._overlay = overlay;
    }

    _setupEventHandlers() {
      if (Sidenav._sidenavs.length === 0) {
        document.body.addEventListener('click', this._handleTriggerClick);
      }

      this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
      this._handleDragTargetReleaseBound = this._handleDragTargetRelease.bind(this);
      this._handleCloseDragBound = this._handleCloseDrag.bind(this);
      this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
      this._handleCloseTriggerClickBound = this._handleCloseTriggerClick.bind(this);

      this.dragTarget.addEventListener('touchmove', this._handleDragTargetDragBound);
      this.dragTarget.addEventListener('touchend', this._handleDragTargetReleaseBound);
      this._overlay.addEventListener('touchmove', this._handleCloseDragBound);
      this._overlay.addEventListener('touchend', this._handleCloseReleaseBound);
      this.el.addEventListener('touchmove', this._handleCloseDragBound);
      this.el.addEventListener('touchend', this._handleCloseReleaseBound);
      this.el.addEventListener('click', this._handleCloseTriggerClickBound);

      // Add resize for side nav fixed
      if (this.isFixed) {
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        window.addEventListener('resize', this._handleWindowResizeBound);
      }
    }

    _removeEventHandlers() {
      if (Sidenav._sidenavs.length === 1) {
        document.body.removeEventListener('click', this._handleTriggerClick);
      }

      this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDragBound);
      this.dragTarget.removeEventListener('touchend', this._handleDragTargetReleaseBound);
      this._overlay.removeEventListener('touchmove', this._handleCloseDragBound);
      this._overlay.removeEventListener('touchend', this._handleCloseReleaseBound);
      this.el.removeEventListener('touchmove', this._handleCloseDragBound);
      this.el.removeEventListener('touchend', this._handleCloseReleaseBound);
      this.el.removeEventListener('click', this._handleCloseTriggerClickBound);

      // Remove resize for side nav fixed
      if (this.isFixed) {
        window.removeEventListener('resize', this._handleWindowResizeBound);
      }
    }

    /**
     * Handle Trigger Click
     * @param {Event} e
     */
    _handleTriggerClick(e) {
      let $trigger = $(e.target).closest('.sidenav-trigger');
      if (e.target && $trigger.length) {
        let sidenavId = M.getIdFromTrigger($trigger[0]);

        let sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
        if (sidenavInstance) {
          sidenavInstance.open($trigger);
        }
        e.preventDefault();
      }
    }

    /**
     * Set variables needed at the beggining of drag
     * and stop any current transition.
     * @param {Event} e
     */
    _startDrag(e) {
      let clientX = e.targetTouches[0].clientX;
      this.isDragged = true;
      this._startingXpos = clientX;
      this._xPos = this._startingXpos;
      this._time = Date.now();
      this._width = this.el.getBoundingClientRect().width;
      this._overlay.style.display = 'block';
      this._initialScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
      this._verticallyScrolling = false;
      anim.remove(this.el);
      anim.remove(this._overlay);
    }

    /**
     * Set variables needed at each drag move update tick
     * @param {Event} e
     */
    _dragMoveUpdate(e) {
      let clientX = e.targetTouches[0].clientX;
      let currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
      this.deltaX = Math.abs(this._xPos - clientX);
      this._xPos = clientX;
      this.velocityX = this.deltaX / (Date.now() - this._time);
      this._time = Date.now();
      if (this._initialScrollTop !== currentScrollTop) {
        this._verticallyScrolling = true;
      }
    }

    /**
     * Handles Dragging of Sidenav
     * @param {Event} e
     */
    _handleDragTargetDrag(e) {
      // Check if draggable
      if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
        return;
      }

      // If not being dragged, set initial drag start variables
      if (!this.isDragged) {
        this._startDrag(e);
      }

      // Run touchmove updates
      this._dragMoveUpdate(e);

      // Calculate raw deltaX
      let totalDeltaX = this._xPos - this._startingXpos;

      // dragDirection is the attempted user drag direction
      let dragDirection = totalDeltaX > 0 ? 'right' : 'left';

      // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
      totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
      if (this.options.edge === dragDirection) {
        totalDeltaX = 0;
      }

      /**
       * transformX is the drag displacement
       * transformPrefix is the initial transform placement
       * Invert values if Sidenav is right edge
       */
      let transformX = totalDeltaX;
      let transformPrefix = 'translateX(-100%)';
      if (this.options.edge === 'right') {
        transformPrefix = 'translateX(100%)';
        transformX = -transformX;
      }

      // Calculate open/close percentage of sidenav, with open = 1 and close = 0
      this.percentOpen = Math.min(1, totalDeltaX / this._width);

      // Set transform and opacity styles
      this.el.style.transform = `${transformPrefix} translateX(${transformX}px)`;
      this._overlay.style.opacity = this.percentOpen;
    }

    /**
     * Handle Drag Target Release
     */
    _handleDragTargetRelease() {
      if (this.isDragged) {
        if (this.percentOpen > 0.2) {
          this.open();
        } else {
          this._animateOut();
        }

        this.isDragged = false;
        this._verticallyScrolling = false;
      }
    }

    /**
     * Handle Close Drag
     * @param {Event} e
     */
    _handleCloseDrag(e) {
      if (this.isOpen) {
        // Check if draggable
        if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
          return;
        }

        // If not being dragged, set initial drag start variables
        if (!this.isDragged) {
          this._startDrag(e);
        }

        // Run touchmove updates
        this._dragMoveUpdate(e);

        // Calculate raw deltaX
        let totalDeltaX = this._xPos - this._startingXpos;

        // dragDirection is the attempted user drag direction
        let dragDirection = totalDeltaX > 0 ? 'right' : 'left';

        // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
        totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
        if (this.options.edge !== dragDirection) {
          totalDeltaX = 0;
        }

        let transformX = -totalDeltaX;
        if (this.options.edge === 'right') {
          transformX = -transformX;
        }

        // Calculate open/close percentage of sidenav, with open = 1 and close = 0
        this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

        // Set transform and opacity styles
        this.el.style.transform = `translateX(${transformX}px)`;
        this._overlay.style.opacity = this.percentOpen;
      }
    }

    /**
     * Handle Close Release
     */
    _handleCloseRelease() {
      if (this.isOpen && this.isDragged) {
        if (this.percentOpen > 0.8) {
          this._animateIn();
        } else {
          this.close();
        }

        this.isDragged = false;
        this._verticallyScrolling = false;
      }
    }

    /**
     * Handles closing of Sidenav when element with class .sidenav-close
     */
    _handleCloseTriggerClick(e) {
      let $closeTrigger = $(e.target).closest('.sidenav-close');
      if ($closeTrigger.length && !this._isCurrentlyFixed()) {
        this.close();
      }
    }

    /**
     * Handle Window Resize
     */
    _handleWindowResize() {
      // Only handle horizontal resizes
      if (this.lastWindowWidth !== window.innerWidth) {
        if (window.innerWidth > 992) {
          this.open();
        } else {
          this.close();
        }
      }

      this.lastWindowWidth = window.innerWidth;
      this.lastWindowHeight = window.innerHeight;
    }

    _setupClasses() {
      if (this.options.edge === 'right') {
        this.el.classList.add('right-aligned');
        this.dragTarget.classList.add('right-aligned');
      }
    }

    _removeClasses() {
      this.el.classList.remove('right-aligned');
      this.dragTarget.classList.remove('right-aligned');
    }

    _setupFixed() {
      if (this._isCurrentlyFixed()) {
        this.open();
      }
    }

    _isCurrentlyFixed() {
      return this.isFixed && window.innerWidth > 992;
    }

    _createDragTarget() {
      let dragTarget = document.createElement('div');
      dragTarget.classList.add('drag-target');
      document.body.appendChild(dragTarget);
      this.dragTarget = dragTarget;
    }

    _preventBodyScrolling() {
      let body = document.body;
      body.style.overflow = 'hidden';
    }

    _enableBodyScrolling() {
      let body = document.body;
      body.style.overflow = '';
    }

    open() {
      if (this.isOpen === true) {
        return;
      }

      this.isOpen = true;

      // Run onOpenStart callback
      if (typeof this.options.onOpenStart === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Handle fixed Sidenav
      if (this._isCurrentlyFixed()) {
        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: 0,
          duration: 0,
          easing: 'easeOutQuad'
        });
        this._enableBodyScrolling();
        this._overlay.style.display = 'none';

        // Handle non-fixed Sidenav
      } else {
        if (this.options.preventScrolling) {
          this._preventBodyScrolling();
        }

        if (!this.isDragged || this.percentOpen != 1) {
          this._animateIn();
        }
      }
    }

    close() {
      if (this.isOpen === false) {
        return;
      }

      this.isOpen = false;

      // Run onCloseStart callback
      if (typeof this.options.onCloseStart === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      // Handle fixed Sidenav
      if (this._isCurrentlyFixed()) {
        let transformX = this.options.edge === 'left' ? '-105%' : '105%';
        this.el.style.transform = `translateX(${transformX})`;

        // Handle non-fixed Sidenav
      } else {
        this._enableBodyScrolling();

        if (!this.isDragged || this.percentOpen != 0) {
          this._animateOut();
        } else {
          this._overlay.style.display = 'none';
        }
      }
    }

    _animateIn() {
      this._animateSidenavIn();
      this._animateOverlayIn();
    }

    _animateSidenavIn() {
      let slideOutPercent = this.options.edge === 'left' ? -1 : 1;
      if (this.isDragged) {
        slideOutPercent =
          this.options.edge === 'left'
            ? slideOutPercent + this.percentOpen
            : slideOutPercent - this.percentOpen;
      }

      anim.remove(this.el);
      anim({
        targets: this.el,
        translateX: [`${slideOutPercent * 100}%`, 0],
        duration: this.options.inDuration,
        easing: 'easeOutQuad',
        complete: () => {
          // Run onOpenEnd callback
          if (typeof this.options.onOpenEnd === 'function') {
            this.options.onOpenEnd.call(this, this.el);
          }
        }
      });
    }

    _animateOverlayIn() {
      let start = 0;
      if (this.isDragged) {
        start = this.percentOpen;
      } else {
        $(this._overlay).css({
          display: 'block'
        });
      }

      anim.remove(this._overlay);
      anim({
        targets: this._overlay,
        opacity: [start, 1],
        duration: this.options.inDuration,
        easing: 'easeOutQuad'
      });
    }

    _animateOut() {
      this._animateSidenavOut();
      this._animateOverlayOut();
    }

    _animateSidenavOut() {
      let endPercent = this.options.edge === 'left' ? -1 : 1;
      let slideOutPercent = 0;
      if (this.isDragged) {
        slideOutPercent =
          this.options.edge === 'left'
            ? endPercent + this.percentOpen
            : endPercent - this.percentOpen;
      }

      anim.remove(this.el);
      anim({
        targets: this.el,
        translateX: [`${slideOutPercent * 100}%`, `${endPercent * 105}%`],
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          // Run onOpenEnd callback
          if (typeof this.options.onCloseEnd === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      });
    }

    _animateOverlayOut() {
      anim.remove(this._overlay);
      anim({
        targets: this._overlay,
        opacity: 0,
        duration: this.options.outDuration,
        easing: 'easeOutQuad',
        complete: () => {
          $(this._overlay).css('display', 'none');
        }
      });
    }
  }

  /**
   * @static
   * @memberof Sidenav
   * @type {Array.<Sidenav>}
   */
  Sidenav._sidenavs = [];

  M.Sidenav = Sidenav;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzaWRlbmF2LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBhbmltKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgZWRnZTogJ2xlZnQnLFxyXG4gICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgaW5EdXJhdGlvbjogMjUwLFxyXG4gICAgb3V0RHVyYXRpb246IDIwMCxcclxuICAgIG9uT3BlblN0YXJ0OiBudWxsLFxyXG4gICAgb25PcGVuRW5kOiBudWxsLFxyXG4gICAgb25DbG9zZVN0YXJ0OiBudWxsLFxyXG4gICAgb25DbG9zZUVuZDogbnVsbCxcclxuICAgIHByZXZlbnRTY3JvbGxpbmc6IHRydWVcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKi9cclxuICBjbGFzcyBTaWRlbmF2IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFNpZGVuYXYgaW5zdGFuY2UgYW5kIHNldCB1cCBvdmVybGF5XHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKFNpZGVuYXYsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9TaWRlbmF2ID0gdGhpcztcclxuICAgICAgdGhpcy5pZCA9IHRoaXMuJGVsLmF0dHIoJ2lkJyk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIFNpZGVuYXZcclxuICAgICAgICogQG1lbWJlciBTaWRlbmF2I29wdGlvbnNcclxuICAgICAgICogQHByb3Age1N0cmluZ30gW2VkZ2U9J2xlZnQnXSAtIFNpZGUgb2Ygc2NyZWVuIG9uIHdoaWNoIFNpZGVuYXYgYXBwZWFyc1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW2RyYWdnYWJsZT10cnVlXSAtIEFsbG93IHN3aXBlIGdlc3R1cmVzIHRvIG9wZW4vY2xvc2UgU2lkZW5hdlxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbaW5EdXJhdGlvbj0yNTBdIC0gTGVuZ3RoIGluIG1zIG9mIGVudGVyIHRyYW5zaXRpb25cclxuICAgICAgICogQHByb3Age051bWJlcn0gW291dER1cmF0aW9uPTIwMF0gLSBMZW5ndGggaW4gbXMgb2YgZXhpdCB0cmFuc2l0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25PcGVuU3RhcnQgLSBGdW5jdGlvbiBjYWxsZWQgd2hlbiBzaWRlbmF2IHN0YXJ0cyBlbnRlcmluZ1xyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlbkVuZCAtIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIHNpZGVuYXYgZmluaXNoZXMgZW50ZXJpbmdcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkNsb3NlU3RhcnQgLSBGdW5jdGlvbiBjYWxsZWQgd2hlbiBzaWRlbmF2IHN0YXJ0cyBleGl0aW5nXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZUVuZCAtIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIHNpZGVuYXYgZmluaXNoZXMgZXhpdGluZ1xyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFNpZGVuYXYuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBvcGVuL2Nsb3NlIHN0YXRlIG9mIFNpZGVuYXZcclxuICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBpZiBTaWRlbmF2IGlzIGZpeGVkXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5pc0ZpeGVkID0gdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoJ3NpZGVuYXYtZml4ZWQnKTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBEZXNjcmliZXMgaWYgU2lkZW5hdiBpcyBiZWluZyBkcmFnZ2VlZFxyXG4gICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaXNEcmFnZ2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBXaW5kb3cgc2l6ZSB2YXJpYWJsZXMgZm9yIHdpbmRvdyByZXNpemUgY2hlY2tzXHJcbiAgICAgIHRoaXMubGFzdFdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgIHRoaXMubGFzdFdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgIHRoaXMuX2NyZWF0ZU92ZXJsYXkoKTtcclxuICAgICAgdGhpcy5fY3JlYXRlRHJhZ1RhcmdldCgpO1xyXG4gICAgICB0aGlzLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5fc2V0dXBDbGFzc2VzKCk7XHJcbiAgICAgIHRoaXMuX3NldHVwRml4ZWQoKTtcclxuXHJcbiAgICAgIFNpZGVuYXYuX3NpZGVuYXZzLnB1c2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fU2lkZW5hdjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIHRoaXMuX2VuYWJsZUJvZHlTY3JvbGxpbmcoKTtcclxuICAgICAgdGhpcy5fb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX292ZXJsYXkpO1xyXG4gICAgICB0aGlzLmRyYWdUYXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmRyYWdUYXJnZXQpO1xyXG4gICAgICB0aGlzLmVsLk1fU2lkZW5hdiA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSAnJztcclxuXHJcbiAgICAgIGxldCBpbmRleCA9IFNpZGVuYXYuX3NpZGVuYXZzLmluZGV4T2YodGhpcyk7XHJcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XHJcbiAgICAgICAgU2lkZW5hdi5fc2lkZW5hdnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVPdmVybGF5KCkge1xyXG4gICAgICBsZXQgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICB0aGlzLl9jbG9zZUJvdW5kID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpO1xyXG4gICAgICBvdmVybGF5LmNsYXNzTGlzdC5hZGQoJ3NpZGVuYXYtb3ZlcmxheScpO1xyXG5cclxuICAgICAgb3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlQm91bmQpO1xyXG5cclxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuICAgICAgdGhpcy5fb3ZlcmxheSA9IG92ZXJsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgaWYgKFNpZGVuYXYuX3NpZGVuYXZzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUcmlnZ2VyQ2xpY2spO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9oYW5kbGVEcmFnVGFyZ2V0RHJhZ0JvdW5kID0gdGhpcy5faGFuZGxlRHJhZ1RhcmdldERyYWcuYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlRHJhZ1RhcmdldFJlbGVhc2VCb3VuZCA9IHRoaXMuX2hhbmRsZURyYWdUYXJnZXRSZWxlYXNlLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNsb3NlRHJhZ0JvdW5kID0gdGhpcy5faGFuZGxlQ2xvc2VEcmFnLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNsb3NlUmVsZWFzZUJvdW5kID0gdGhpcy5faGFuZGxlQ2xvc2VSZWxlYXNlLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNsb3NlVHJpZ2dlckNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDbG9zZVRyaWdnZXJDbGljay5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgdGhpcy5kcmFnVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZURyYWdUYXJnZXREcmFnQm91bmQpO1xyXG4gICAgICB0aGlzLmRyYWdUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVEcmFnVGFyZ2V0UmVsZWFzZUJvdW5kKTtcclxuICAgICAgdGhpcy5fb3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVDbG9zZURyYWdCb3VuZCk7XHJcbiAgICAgIHRoaXMuX292ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDbG9zZVJlbGVhc2VCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlQ2xvc2VEcmFnQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlQ2xvc2VSZWxlYXNlQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlQ2xvc2VUcmlnZ2VyQ2xpY2tCb3VuZCk7XHJcblxyXG4gICAgICAvLyBBZGQgcmVzaXplIGZvciBzaWRlIG5hdiBmaXhlZFxyXG4gICAgICBpZiAodGhpcy5pc0ZpeGVkKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQgPSB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIGlmIChTaWRlbmF2Ll9zaWRlbmF2cy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlVHJpZ2dlckNsaWNrKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5kcmFnVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZURyYWdUYXJnZXREcmFnQm91bmQpO1xyXG4gICAgICB0aGlzLmRyYWdUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVEcmFnVGFyZ2V0UmVsZWFzZUJvdW5kKTtcclxuICAgICAgdGhpcy5fb3ZlcmxheS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVDbG9zZURyYWdCb3VuZCk7XHJcbiAgICAgIHRoaXMuX292ZXJsYXkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDbG9zZVJlbGVhc2VCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlQ2xvc2VEcmFnQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlQ2xvc2VSZWxlYXNlQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlQ2xvc2VUcmlnZ2VyQ2xpY2tCb3VuZCk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgcmVzaXplIGZvciBzaWRlIG5hdiBmaXhlZFxyXG4gICAgICBpZiAodGhpcy5pc0ZpeGVkKSB7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVdpbmRvd1Jlc2l6ZUJvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIFRyaWdnZXIgQ2xpY2tcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZVRyaWdnZXJDbGljayhlKSB7XHJcbiAgICAgIGxldCAkdHJpZ2dlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5zaWRlbmF2LXRyaWdnZXInKTtcclxuICAgICAgaWYgKGUudGFyZ2V0ICYmICR0cmlnZ2VyLmxlbmd0aCkge1xyXG4gICAgICAgIGxldCBzaWRlbmF2SWQgPSBNLmdldElkRnJvbVRyaWdnZXIoJHRyaWdnZXJbMF0pO1xyXG5cclxuICAgICAgICBsZXQgc2lkZW5hdkluc3RhbmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2lkZW5hdklkKS5NX1NpZGVuYXY7XHJcbiAgICAgICAgaWYgKHNpZGVuYXZJbnN0YW5jZSkge1xyXG4gICAgICAgICAgc2lkZW5hdkluc3RhbmNlLm9wZW4oJHRyaWdnZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB2YXJpYWJsZXMgbmVlZGVkIGF0IHRoZSBiZWdnaW5pbmcgb2YgZHJhZ1xyXG4gICAgICogYW5kIHN0b3AgYW55IGN1cnJlbnQgdHJhbnNpdGlvbi5cclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX3N0YXJ0RHJhZyhlKSB7XHJcbiAgICAgIGxldCBjbGllbnRYID0gZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgIHRoaXMuaXNEcmFnZ2VkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5fc3RhcnRpbmdYcG9zID0gY2xpZW50WDtcclxuICAgICAgdGhpcy5feFBvcyA9IHRoaXMuX3N0YXJ0aW5nWHBvcztcclxuICAgICAgdGhpcy5fdGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFRvcCA9IHRoaXMuaXNPcGVuID8gdGhpcy5lbC5zY3JvbGxUb3AgOiBNLmdldERvY3VtZW50U2Nyb2xsVG9wKCk7XHJcbiAgICAgIHRoaXMuX3ZlcnRpY2FsbHlTY3JvbGxpbmcgPSBmYWxzZTtcclxuICAgICAgYW5pbS5yZW1vdmUodGhpcy5lbCk7XHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuX292ZXJsYXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHZhcmlhYmxlcyBuZWVkZWQgYXQgZWFjaCBkcmFnIG1vdmUgdXBkYXRlIHRpY2tcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdNb3ZlVXBkYXRlKGUpIHtcclxuICAgICAgbGV0IGNsaWVudFggPSBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WDtcclxuICAgICAgbGV0IGN1cnJlbnRTY3JvbGxUb3AgPSB0aGlzLmlzT3BlbiA/IHRoaXMuZWwuc2Nyb2xsVG9wIDogTS5nZXREb2N1bWVudFNjcm9sbFRvcCgpO1xyXG4gICAgICB0aGlzLmRlbHRhWCA9IE1hdGguYWJzKHRoaXMuX3hQb3MgLSBjbGllbnRYKTtcclxuICAgICAgdGhpcy5feFBvcyA9IGNsaWVudFg7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlYID0gdGhpcy5kZWx0YVggLyAoRGF0ZS5ub3coKSAtIHRoaXMuX3RpbWUpO1xyXG4gICAgICB0aGlzLl90aW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgaWYgKHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgIT09IGN1cnJlbnRTY3JvbGxUb3ApIHtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNhbGx5U2Nyb2xsaW5nID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlcyBEcmFnZ2luZyBvZiBTaWRlbmF2XHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVEcmFnVGFyZ2V0RHJhZyhlKSB7XHJcbiAgICAgIC8vIENoZWNrIGlmIGRyYWdnYWJsZVxyXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnZ2FibGUgfHwgdGhpcy5faXNDdXJyZW50bHlGaXhlZCgpIHx8IHRoaXMuX3ZlcnRpY2FsbHlTY3JvbGxpbmcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIG5vdCBiZWluZyBkcmFnZ2VkLCBzZXQgaW5pdGlhbCBkcmFnIHN0YXJ0IHZhcmlhYmxlc1xyXG4gICAgICBpZiAoIXRoaXMuaXNEcmFnZ2VkKSB7XHJcbiAgICAgICAgdGhpcy5fc3RhcnREcmFnKGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSdW4gdG91Y2htb3ZlIHVwZGF0ZXNcclxuICAgICAgdGhpcy5fZHJhZ01vdmVVcGRhdGUoZSk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgcmF3IGRlbHRhWFxyXG4gICAgICBsZXQgdG90YWxEZWx0YVggPSB0aGlzLl94UG9zIC0gdGhpcy5fc3RhcnRpbmdYcG9zO1xyXG5cclxuICAgICAgLy8gZHJhZ0RpcmVjdGlvbiBpcyB0aGUgYXR0ZW1wdGVkIHVzZXIgZHJhZyBkaXJlY3Rpb25cclxuICAgICAgbGV0IGRyYWdEaXJlY3Rpb24gPSB0b3RhbERlbHRhWCA+IDAgPyAncmlnaHQnIDogJ2xlZnQnO1xyXG5cclxuICAgICAgLy8gRG9uJ3QgYWxsb3cgdG90YWxEZWx0YVggdG8gZXhjZWVkIFNpZGVuYXYgd2lkdGggb3IgYmUgZHJhZ2dlZCBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uXHJcbiAgICAgIHRvdGFsRGVsdGFYID0gTWF0aC5taW4odGhpcy5fd2lkdGgsIE1hdGguYWJzKHRvdGFsRGVsdGFYKSk7XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWRnZSA9PT0gZHJhZ0RpcmVjdGlvbikge1xyXG4gICAgICAgIHRvdGFsRGVsdGFYID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIHRyYW5zZm9ybVggaXMgdGhlIGRyYWcgZGlzcGxhY2VtZW50XHJcbiAgICAgICAqIHRyYW5zZm9ybVByZWZpeCBpcyB0aGUgaW5pdGlhbCB0cmFuc2Zvcm0gcGxhY2VtZW50XHJcbiAgICAgICAqIEludmVydCB2YWx1ZXMgaWYgU2lkZW5hdiBpcyByaWdodCBlZGdlXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgdHJhbnNmb3JtWCA9IHRvdGFsRGVsdGFYO1xyXG4gICAgICBsZXQgdHJhbnNmb3JtUHJlZml4ID0gJ3RyYW5zbGF0ZVgoLTEwMCUpJztcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lZGdlID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgdHJhbnNmb3JtUHJlZml4ID0gJ3RyYW5zbGF0ZVgoMTAwJSknO1xyXG4gICAgICAgIHRyYW5zZm9ybVggPSAtdHJhbnNmb3JtWDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIG9wZW4vY2xvc2UgcGVyY2VudGFnZSBvZiBzaWRlbmF2LCB3aXRoIG9wZW4gPSAxIGFuZCBjbG9zZSA9IDBcclxuICAgICAgdGhpcy5wZXJjZW50T3BlbiA9IE1hdGgubWluKDEsIHRvdGFsRGVsdGFYIC8gdGhpcy5fd2lkdGgpO1xyXG5cclxuICAgICAgLy8gU2V0IHRyYW5zZm9ybSBhbmQgb3BhY2l0eSBzdHlsZXNcclxuICAgICAgdGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgJHt0cmFuc2Zvcm1QcmVmaXh9IHRyYW5zbGF0ZVgoJHt0cmFuc2Zvcm1YfXB4KWA7XHJcbiAgICAgIHRoaXMuX292ZXJsYXkuc3R5bGUub3BhY2l0eSA9IHRoaXMucGVyY2VudE9wZW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgRHJhZyBUYXJnZXQgUmVsZWFzZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlRHJhZ1RhcmdldFJlbGVhc2UoKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzRHJhZ2dlZCkge1xyXG4gICAgICAgIGlmICh0aGlzLnBlcmNlbnRPcGVuID4gMC4yKSB7XHJcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZU91dCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc0RyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNhbGx5U2Nyb2xsaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBDbG9zZSBEcmFnXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVDbG9zZURyYWcoZSkge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBkcmFnZ2FibGVcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnZ2FibGUgfHwgdGhpcy5faXNDdXJyZW50bHlGaXhlZCgpIHx8IHRoaXMuX3ZlcnRpY2FsbHlTY3JvbGxpbmcpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5vdCBiZWluZyBkcmFnZ2VkLCBzZXQgaW5pdGlhbCBkcmFnIHN0YXJ0IHZhcmlhYmxlc1xyXG4gICAgICAgIGlmICghdGhpcy5pc0RyYWdnZWQpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YXJ0RHJhZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJ1biB0b3VjaG1vdmUgdXBkYXRlc1xyXG4gICAgICAgIHRoaXMuX2RyYWdNb3ZlVXBkYXRlKGUpO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgcmF3IGRlbHRhWFxyXG4gICAgICAgIGxldCB0b3RhbERlbHRhWCA9IHRoaXMuX3hQb3MgLSB0aGlzLl9zdGFydGluZ1hwb3M7XHJcblxyXG4gICAgICAgIC8vIGRyYWdEaXJlY3Rpb24gaXMgdGhlIGF0dGVtcHRlZCB1c2VyIGRyYWcgZGlyZWN0aW9uXHJcbiAgICAgICAgbGV0IGRyYWdEaXJlY3Rpb24gPSB0b3RhbERlbHRhWCA+IDAgPyAncmlnaHQnIDogJ2xlZnQnO1xyXG5cclxuICAgICAgICAvLyBEb24ndCBhbGxvdyB0b3RhbERlbHRhWCB0byBleGNlZWQgU2lkZW5hdiB3aWR0aCBvciBiZSBkcmFnZ2VkIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb25cclxuICAgICAgICB0b3RhbERlbHRhWCA9IE1hdGgubWluKHRoaXMuX3dpZHRoLCBNYXRoLmFicyh0b3RhbERlbHRhWCkpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWRnZSAhPT0gZHJhZ0RpcmVjdGlvbikge1xyXG4gICAgICAgICAgdG90YWxEZWx0YVggPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybVggPSAtdG90YWxEZWx0YVg7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lZGdlID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgICB0cmFuc2Zvcm1YID0gLXRyYW5zZm9ybVg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgb3Blbi9jbG9zZSBwZXJjZW50YWdlIG9mIHNpZGVuYXYsIHdpdGggb3BlbiA9IDEgYW5kIGNsb3NlID0gMFxyXG4gICAgICAgIHRoaXMucGVyY2VudE9wZW4gPSBNYXRoLm1pbigxLCAxIC0gdG90YWxEZWx0YVggLyB0aGlzLl93aWR0aCk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0cmFuc2Zvcm0gYW5kIG9wYWNpdHkgc3R5bGVzXHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgke3RyYW5zZm9ybVh9cHgpYDtcclxuICAgICAgICB0aGlzLl9vdmVybGF5LnN0eWxlLm9wYWNpdHkgPSB0aGlzLnBlcmNlbnRPcGVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgQ2xvc2UgUmVsZWFzZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlQ2xvc2VSZWxlYXNlKCkge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4gJiYgdGhpcy5pc0RyYWdnZWQpIHtcclxuICAgICAgICBpZiAodGhpcy5wZXJjZW50T3BlbiA+IDAuOCkge1xyXG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZUluKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNEcmFnZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fdmVydGljYWxseVNjcm9sbGluZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGNsb3Npbmcgb2YgU2lkZW5hdiB3aGVuIGVsZW1lbnQgd2l0aCBjbGFzcyAuc2lkZW5hdi1jbG9zZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlQ2xvc2VUcmlnZ2VyQ2xpY2soZSkge1xyXG4gICAgICBsZXQgJGNsb3NlVHJpZ2dlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5zaWRlbmF2LWNsb3NlJyk7XHJcbiAgICAgIGlmICgkY2xvc2VUcmlnZ2VyLmxlbmd0aCAmJiAhdGhpcy5faXNDdXJyZW50bHlGaXhlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgV2luZG93IFJlc2l6ZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlV2luZG93UmVzaXplKCkge1xyXG4gICAgICAvLyBPbmx5IGhhbmRsZSBob3Jpem9udGFsIHJlc2l6ZXNcclxuICAgICAgaWYgKHRoaXMubGFzdFdpbmRvd1dpZHRoICE9PSB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDk5Mikge1xyXG4gICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubGFzdFdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgIHRoaXMubGFzdFdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBfc2V0dXBDbGFzc2VzKCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVkZ2UgPT09ICdyaWdodCcpIHtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3JpZ2h0LWFsaWduZWQnKTtcclxuICAgICAgICB0aGlzLmRyYWdUYXJnZXQuY2xhc3NMaXN0LmFkZCgncmlnaHQtYWxpZ25lZCcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3JlbW92ZUNsYXNzZXMoKSB7XHJcbiAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgncmlnaHQtYWxpZ25lZCcpO1xyXG4gICAgICB0aGlzLmRyYWdUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgncmlnaHQtYWxpZ25lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIF9zZXR1cEZpeGVkKCkge1xyXG4gICAgICBpZiAodGhpcy5faXNDdXJyZW50bHlGaXhlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaXNDdXJyZW50bHlGaXhlZCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNGaXhlZCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA+IDk5MjtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlRHJhZ1RhcmdldCgpIHtcclxuICAgICAgbGV0IGRyYWdUYXJnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgZHJhZ1RhcmdldC5jbGFzc0xpc3QuYWRkKCdkcmFnLXRhcmdldCcpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdUYXJnZXQpO1xyXG4gICAgICB0aGlzLmRyYWdUYXJnZXQgPSBkcmFnVGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIF9wcmV2ZW50Qm9keVNjcm9sbGluZygpIHtcclxuICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG4gICAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICB9XHJcblxyXG4gICAgX2VuYWJsZUJvZHlTY3JvbGxpbmcoKSB7XHJcbiAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuICAgICAgYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW4oKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzT3BlbiA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG5cclxuICAgICAgLy8gUnVuIG9uT3BlblN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0LmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEhhbmRsZSBmaXhlZCBTaWRlbmF2XHJcbiAgICAgIGlmICh0aGlzLl9pc0N1cnJlbnRseUZpeGVkKCkpIHtcclxuICAgICAgICBhbmltLnJlbW92ZSh0aGlzLmVsKTtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IHRoaXMuZWwsXHJcbiAgICAgICAgICB0cmFuc2xhdGVYOiAwLFxyXG4gICAgICAgICAgZHVyYXRpb246IDAsXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9lbmFibGVCb2R5U2Nyb2xsaW5nKCk7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgbm9uLWZpeGVkIFNpZGVuYXZcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZXZlbnRTY3JvbGxpbmcpIHtcclxuICAgICAgICAgIHRoaXMuX3ByZXZlbnRCb2R5U2Nyb2xsaW5nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuaXNEcmFnZ2VkIHx8IHRoaXMucGVyY2VudE9wZW4gIT0gMSkge1xyXG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZUluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzT3BlbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBSdW4gb25DbG9zZVN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSGFuZGxlIGZpeGVkIFNpZGVuYXZcclxuICAgICAgaWYgKHRoaXMuX2lzQ3VycmVudGx5Rml4ZWQoKSkge1xyXG4gICAgICAgIGxldCB0cmFuc2Zvcm1YID0gdGhpcy5vcHRpb25zLmVkZ2UgPT09ICdsZWZ0JyA/ICctMTA1JScgOiAnMTA1JSc7XHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgke3RyYW5zZm9ybVh9KWA7XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBub24tZml4ZWQgU2lkZW5hdlxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2VuYWJsZUJvZHlTY3JvbGxpbmcoKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmlzRHJhZ2dlZCB8fCB0aGlzLnBlcmNlbnRPcGVuICE9IDApIHtcclxuICAgICAgICAgIHRoaXMuX2FuaW1hdGVPdXQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9hbmltYXRlSW4oKSB7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVTaWRlbmF2SW4oKTtcclxuICAgICAgdGhpcy5fYW5pbWF0ZU92ZXJsYXlJbigpO1xyXG4gICAgfVxyXG5cclxuICAgIF9hbmltYXRlU2lkZW5hdkluKCkge1xyXG4gICAgICBsZXQgc2xpZGVPdXRQZXJjZW50ID0gdGhpcy5vcHRpb25zLmVkZ2UgPT09ICdsZWZ0JyA/IC0xIDogMTtcclxuICAgICAgaWYgKHRoaXMuaXNEcmFnZ2VkKSB7XHJcbiAgICAgICAgc2xpZGVPdXRQZXJjZW50ID1cclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5lZGdlID09PSAnbGVmdCdcclxuICAgICAgICAgICAgPyBzbGlkZU91dFBlcmNlbnQgKyB0aGlzLnBlcmNlbnRPcGVuXHJcbiAgICAgICAgICAgIDogc2xpZGVPdXRQZXJjZW50IC0gdGhpcy5wZXJjZW50T3BlbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgYW5pbS5yZW1vdmUodGhpcy5lbCk7XHJcbiAgICAgIGFuaW0oe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMuZWwsXHJcbiAgICAgICAgdHJhbnNsYXRlWDogW2Ake3NsaWRlT3V0UGVyY2VudCAqIDEwMH0lYCwgMF0sXHJcbiAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5pbkR1cmF0aW9uLFxyXG4gICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJyxcclxuICAgICAgICBjb21wbGV0ZTogKCkgPT4ge1xyXG4gICAgICAgICAgLy8gUnVuIG9uT3BlbkVuZCBjYWxsYmFja1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5FbmQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9hbmltYXRlT3ZlcmxheUluKCkge1xyXG4gICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICBpZiAodGhpcy5pc0RyYWdnZWQpIHtcclxuICAgICAgICBzdGFydCA9IHRoaXMucGVyY2VudE9wZW47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJCh0aGlzLl9vdmVybGF5KS5jc3Moe1xyXG4gICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhbmltLnJlbW92ZSh0aGlzLl9vdmVybGF5KTtcclxuICAgICAgYW5pbSh7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy5fb3ZlcmxheSxcclxuICAgICAgICBvcGFjaXR5OiBbc3RhcnQsIDFdLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2FuaW1hdGVPdXQoKSB7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVTaWRlbmF2T3V0KCk7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVPdmVybGF5T3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2FuaW1hdGVTaWRlbmF2T3V0KCkge1xyXG4gICAgICBsZXQgZW5kUGVyY2VudCA9IHRoaXMub3B0aW9ucy5lZGdlID09PSAnbGVmdCcgPyAtMSA6IDE7XHJcbiAgICAgIGxldCBzbGlkZU91dFBlcmNlbnQgPSAwO1xyXG4gICAgICBpZiAodGhpcy5pc0RyYWdnZWQpIHtcclxuICAgICAgICBzbGlkZU91dFBlcmNlbnQgPVxyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmVkZ2UgPT09ICdsZWZ0J1xyXG4gICAgICAgICAgICA/IGVuZFBlcmNlbnQgKyB0aGlzLnBlcmNlbnRPcGVuXHJcbiAgICAgICAgICAgIDogZW5kUGVyY2VudCAtIHRoaXMucGVyY2VudE9wZW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICBhbmltKHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLmVsLFxyXG4gICAgICAgIHRyYW5zbGF0ZVg6IFtgJHtzbGlkZU91dFBlcmNlbnQgKiAxMDB9JWAsIGAke2VuZFBlcmNlbnQgKiAxMDV9JWBdLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAoKSA9PiB7XHJcbiAgICAgICAgICAvLyBSdW4gb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYW5pbWF0ZU92ZXJsYXlPdXQoKSB7XHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuX292ZXJsYXkpO1xyXG4gICAgICBhbmltKHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLl9vdmVybGF5LFxyXG4gICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5vdXREdXJhdGlvbixcclxuICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgY29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICAgICQodGhpcy5fb3ZlcmxheSkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTaWRlbmF2XHJcbiAgICogQHR5cGUge0FycmF5LjxTaWRlbmF2Pn1cclxuICAgKi9cclxuICBTaWRlbmF2Ll9zaWRlbmF2cyA9IFtdO1xyXG5cclxuICBNLlNpZGVuYXYgPSBTaWRlbmF2O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoU2lkZW5hdiwgJ3NpZGVuYXYnLCAnTV9TaWRlbmF2Jyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuIl0sImZpbGUiOiJzaWRlbmF2LmpzIn0=
