(function($, anim) {
  'use strict';

  let _defaults = {
    alignment: 'left',
    autoFocus: true,
    constrainWidth: true,
    container: null,
    coverTrigger: true,
    closeOnClick: true,
    hover: false,
    inDuration: 150,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    onItemClick: null
  };

  /**
   * @class
   */
  class Dropdown extends Component {
    constructor(el, options) {
      super(Dropdown, el, options);

      this.el.M_Dropdown = this;
      Dropdown._dropdowns.push(this);

      this.id = M.getIdFromTrigger(el);
      this.dropdownEl = document.getElementById(this.id);
      this.$dropdownEl = $(this.dropdownEl);

      /**
       * Options for the dropdown
       * @member Dropdown#options
       * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
       * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
       * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
       * @prop {Element} container - Container element to attach dropdown to (optional)
       * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
       * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
       * @prop {Boolean} [hover=false] - Open dropdown on hover
       * @prop {Number} [inDuration=150] - Duration of open animation in ms
       * @prop {Number} [outDuration=250] - Duration of close animation in ms
       * @prop {Function} onOpenStart - Function called when dropdown starts opening
       * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
       * @prop {Function} onCloseStart - Function called when dropdown starts closing
       * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
       */
      this.options = $.extend({}, Dropdown.defaults, options);

      /**
       * Describes open/close state of dropdown
       * @type {Boolean}
       */
      this.isOpen = false;

      /**
       * Describes if dropdown content is scrollable
       * @type {Boolean}
       */
      this.isScrollable = false;

      /**
       * Describes if touch moving on dropdown content
       * @type {Boolean}
       */
      this.isTouchMoving = false;

      this.focusedIndex = -1;
      this.filterQuery = [];

      // Move dropdown-content after dropdown-trigger
      if (!!this.options.container) {
        $(this.options.container).append(this.dropdownEl);
      } else {
        this.$el.after(this.dropdownEl);
      }

      this._makeDropdownFocusable();
      this._resetFilterQueryBound = this._resetFilterQuery.bind(this);
      this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
      this._handleDocumentTouchmoveBound = this._handleDocumentTouchmove.bind(this);
      this._handleDropdownClickBound = this._handleDropdownClick.bind(this);
      this._handleDropdownKeydownBound = this._handleDropdownKeydown.bind(this);
      this._handleTriggerKeydownBound = this._handleTriggerKeydown.bind(this);
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
      return domElem.M_Dropdown;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._resetDropdownStyles();
      this._removeEventHandlers();
      Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
      this.el.M_Dropdown = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      // Trigger keydown handler
      this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

      // Item click handler
      this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

      // Hover event handlers
      if (this.options.hover) {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

        // Click event handlers
      } else {
        this._handleClickBound = this._handleClick.bind(this);
        this.el.addEventListener('click', this._handleClickBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);
      this.dropdownEl.removeEventListener('click', this._handleDropdownClickBound);

      if (this.options.hover) {
        this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeaveBound);
      } else {
        this.el.removeEventListener('click', this._handleClickBound);
      }
    }

    _setupTemporaryEventHandlers() {
      // Use capture phase event handler to prevent click
      document.body.addEventListener('click', this._handleDocumentClickBound, true);
      document.body.addEventListener('touchend', this._handleDocumentClickBound);
      document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
      this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
    }

    _removeTemporaryEventHandlers() {
      // Use capture phase event handler to prevent click
      document.body.removeEventListener('click', this._handleDocumentClickBound, true);
      document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
      this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
    }

    _handleClick(e) {
      e.preventDefault();
      this.open();
    }

    _handleMouseEnter() {
      this.open();
    }

    _handleMouseLeave(e) {
      let toEl = e.toElement || e.relatedTarget;
      let leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
      let leaveToActiveDropdownTrigger = false;

      let $closestTrigger = $(toEl).closest('.dropdown-trigger');
      if (
        $closestTrigger.length &&
        !!$closestTrigger[0].M_Dropdown &&
        $closestTrigger[0].M_Dropdown.isOpen
      ) {
        leaveToActiveDropdownTrigger = true;
      }

      // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
      if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
        this.close();
      }
    }

    _handleDocumentClick(e) {
      let $target = $(e.target);
      if (
        this.options.closeOnClick &&
        $target.closest('.dropdown-content').length &&
        !this.isTouchMoving
      ) {
        // isTouchMoving to check if scrolling on mobile.
        setTimeout(() => {
          this.close();
        }, 0);
      } else if (
        $target.closest('.dropdown-trigger').length ||
        !$target.closest('.dropdown-content').length
      ) {
        setTimeout(() => {
          this.close();
        }, 0);
      }
      this.isTouchMoving = false;
    }

    _handleTriggerKeydown(e) {
      // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
      if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ENTER) && !this.isOpen) {
        e.preventDefault();
        this.open();
      }
    }

    /**
     * Handle Document Touchmove
     * @param {Event} e
     */
    _handleDocumentTouchmove(e) {
      let $target = $(e.target);
      if ($target.closest('.dropdown-content').length) {
        this.isTouchMoving = true;
      }
    }

    /**
     * Handle Dropdown Click
     * @param {Event} e
     */
    _handleDropdownClick(e) {
      // onItemClick callback
      if (typeof this.options.onItemClick === 'function') {
        let itemEl = $(e.target).closest('li')[0];
        this.options.onItemClick.call(this, itemEl);
      }
    }

    /**
     * Handle Dropdown Keydown
     * @param {Event} e
     */
    _handleDropdownKeydown(e) {
      if (e.which === M.keys.TAB) {
        e.preventDefault();
        this.close();

        // Navigate down dropdown list
      } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) && this.isOpen) {
        e.preventDefault();
        let direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
        let newFocusedIndex = this.focusedIndex;
        let foundNewIndex = false;
        do {
          newFocusedIndex = newFocusedIndex + direction;

          if (
            !!this.dropdownEl.children[newFocusedIndex] &&
            this.dropdownEl.children[newFocusedIndex].tabIndex !== -1
          ) {
            foundNewIndex = true;
            break;
          }
        } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);

        if (foundNewIndex) {
          this.focusedIndex = newFocusedIndex;
          this._focusFocusedItem();
        }

        // ENTER selects choice on focused item
      } else if (e.which === M.keys.ENTER && this.isOpen) {
        // Search for <a> and <button>
        let focusedElement = this.dropdownEl.children[this.focusedIndex];
        let $activatableElement = $(focusedElement)
          .find('a, button')
          .first();

        // Click a or button tag if exists, otherwise click li tag
        if (!!$activatableElement.length) {
          $activatableElement[0].click();
        } else if (!!focusedElement) {
          focusedElement.click();
        }

        // Close dropdown on ESC
      } else if (e.which === M.keys.ESC && this.isOpen) {
        e.preventDefault();
        this.close();
      }

      // CASE WHEN USER TYPE LETTERS
      let letter = String.fromCharCode(e.which).toLowerCase(),
        nonLetters = [9, 13, 27, 38, 40];
      if (letter && nonLetters.indexOf(e.which) === -1) {
        this.filterQuery.push(letter);

        let string = this.filterQuery.join(''),
          newOptionEl = $(this.dropdownEl)
            .find('li')
            .filter((el) => {
              return (
                $(el)
                  .text()
                  .toLowerCase()
                  .indexOf(string) === 0
              );
            })[0];

        if (newOptionEl) {
          this.focusedIndex = $(newOptionEl).index();
          this._focusFocusedItem();
        }
      }

      this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
    }

    /**
     * Setup dropdown
     */
    _resetFilterQuery() {
      this.filterQuery = [];
    }

    _resetDropdownStyles() {
      this.$dropdownEl.css({
        display: '',
        width: '',
        height: '',
        left: '',
        top: '',
        'transform-origin': '',
        transform: '',
        opacity: ''
      });
    }

    _makeDropdownFocusable() {
      // Needed for arrow key navigation
      this.dropdownEl.tabIndex = 0;

      // Only set tabindex if it hasn't been set by user
      $(this.dropdownEl)
        .children()
        .each(function(el) {
          if (!el.getAttribute('tabindex')) {
            el.setAttribute('tabindex', 0);
          }
        });
    }

    _focusFocusedItem() {
      if (
        this.focusedIndex >= 0 &&
        this.focusedIndex < this.dropdownEl.children.length &&
        this.options.autoFocus
      ) {
        this.dropdownEl.children[this.focusedIndex].focus();
      }
    }

    _getDropdownPosition() {
      let offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
      let triggerBRect = this.el.getBoundingClientRect();
      let dropdownBRect = this.dropdownEl.getBoundingClientRect();

      let idealHeight = dropdownBRect.height;
      let idealWidth = dropdownBRect.width;
      let idealXPos = triggerBRect.left - dropdownBRect.left;
      let idealYPos = triggerBRect.top - dropdownBRect.top;

      let dropdownBounds = {
        left: idealXPos,
        top: idealYPos,
        height: idealHeight,
        width: idealWidth
      };

      // Countainer here will be closest ancestor with overflow: hidden
      let closestOverflowParent = !!this.dropdownEl.offsetParent
        ? this.dropdownEl.offsetParent
        : this.dropdownEl.parentNode;

      let alignments = M.checkPossibleAlignments(
        this.el,
        closestOverflowParent,
        dropdownBounds,
        this.options.coverTrigger ? 0 : triggerBRect.height
      );

      let verticalAlignment = 'top';
      let horizontalAlignment = this.options.alignment;
      idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

      // Reset isScrollable
      this.isScrollable = false;

      if (!alignments.top) {
        if (alignments.bottom) {
          verticalAlignment = 'bottom';
        } else {
          this.isScrollable = true;

          // Determine which side has most space and cutoff at correct height
          if (alignments.spaceOnTop > alignments.spaceOnBottom) {
            verticalAlignment = 'bottom';
            idealHeight += alignments.spaceOnTop;
            idealYPos -= alignments.spaceOnTop;
          } else {
            idealHeight += alignments.spaceOnBottom;
          }
        }
      }

      // If preferred horizontal alignment is possible
      if (!alignments[horizontalAlignment]) {
        let oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
        if (alignments[oppositeAlignment]) {
          horizontalAlignment = oppositeAlignment;
        } else {
          // Determine which side has most space and cutoff at correct height
          if (alignments.spaceOnLeft > alignments.spaceOnRight) {
            horizontalAlignment = 'right';
            idealWidth += alignments.spaceOnLeft;
            idealXPos -= alignments.spaceOnLeft;
          } else {
            horizontalAlignment = 'left';
            idealWidth += alignments.spaceOnRight;
          }
        }
      }

      if (verticalAlignment === 'bottom') {
        idealYPos =
          idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
      }
      if (horizontalAlignment === 'right') {
        idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
      }
      return {
        x: idealXPos,
        y: idealYPos,
        verticalAlignment: verticalAlignment,
        horizontalAlignment: horizontalAlignment,
        height: idealHeight,
        width: idealWidth
      };
    }

    /**
     * Animate in dropdown
     */
    _animateIn() {
      anim.remove(this.dropdownEl);
      anim({
        targets: this.dropdownEl,
        opacity: {
          value: [0, 1],
          easing: 'easeOutQuad'
        },
        scaleX: [0.3, 1],
        scaleY: [0.3, 1],
        duration: this.options.inDuration,
        easing: 'easeOutQuint',
        complete: (anim) => {
          if (this.options.autoFocus) {
            this.dropdownEl.focus();
          }

          // onOpenEnd callback
          if (typeof this.options.onOpenEnd === 'function') {
            this.options.onOpenEnd.call(this, this.el);
          }
        }
      });
    }

    /**
     * Animate out dropdown
     */
    _animateOut() {
      anim.remove(this.dropdownEl);
      anim({
        targets: this.dropdownEl,
        opacity: {
          value: 0,
          easing: 'easeOutQuint'
        },
        scaleX: 0.3,
        scaleY: 0.3,
        duration: this.options.outDuration,
        easing: 'easeOutQuint',
        complete: (anim) => {
          this._resetDropdownStyles();

          // onCloseEnd callback
          if (typeof this.options.onCloseEnd === 'function') {
            this.options.onCloseEnd.call(this, this.el);
          }
        }
      });
    }

    /**
     * Place dropdown
     */
    _placeDropdown() {
      // Set width before calculating positionInfo
      let idealWidth = this.options.constrainWidth
        ? this.el.getBoundingClientRect().width
        : this.dropdownEl.getBoundingClientRect().width;
      this.dropdownEl.style.width = idealWidth + 'px';

      let positionInfo = this._getDropdownPosition();
      this.dropdownEl.style.left = positionInfo.x + 'px';
      this.dropdownEl.style.top = positionInfo.y + 'px';
      this.dropdownEl.style.height = positionInfo.height + 'px';
      this.dropdownEl.style.width = positionInfo.width + 'px';
      this.dropdownEl.style.transformOrigin = `${
        positionInfo.horizontalAlignment === 'left' ? '0' : '100%'
      } ${positionInfo.verticalAlignment === 'top' ? '0' : '100%'}`;
    }

    /**
     * Open Dropdown
     */
    open() {
      if (this.isOpen) {
        return;
      }
      this.isOpen = true;

      // onOpenStart callback
      if (typeof this.options.onOpenStart === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Reset styles
      this._resetDropdownStyles();
      this.dropdownEl.style.display = 'block';

      this._placeDropdown();
      this._animateIn();
      this._setupTemporaryEventHandlers();
    }

    /**
     * Close Dropdown
     */
    close() {
      if (!this.isOpen) {
        return;
      }
      this.isOpen = false;
      this.focusedIndex = -1;

      // onCloseStart callback
      if (typeof this.options.onCloseStart === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      this._animateOut();
      this._removeTemporaryEventHandlers();

      if (this.options.autoFocus) {
        this.el.focus();
      }
    }

    /**
     * Recalculate dimensions
     */
    recalculateDimensions() {
      if (this.isOpen) {
        this.$dropdownEl.css({
          width: '',
          height: '',
          left: '',
          top: '',
          'transform-origin': ''
        });
        this._placeDropdown();
      }
    }
  }

  /**
   * @static
   * @memberof Dropdown
   */
  Dropdown._dropdowns = [];

  M.Dropdown = Dropdown;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkcm9wZG93bi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIGFsaWdubWVudDogJ2xlZnQnLFxyXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxyXG4gICAgY29uc3RyYWluV2lkdGg6IHRydWUsXHJcbiAgICBjb250YWluZXI6IG51bGwsXHJcbiAgICBjb3ZlclRyaWdnZXI6IHRydWUsXHJcbiAgICBjbG9zZU9uQ2xpY2s6IHRydWUsXHJcbiAgICBob3ZlcjogZmFsc2UsXHJcbiAgICBpbkR1cmF0aW9uOiAxNTAsXHJcbiAgICBvdXREdXJhdGlvbjogMjUwLFxyXG4gICAgb25PcGVuU3RhcnQ6IG51bGwsXHJcbiAgICBvbk9wZW5FbmQ6IG51bGwsXHJcbiAgICBvbkNsb3NlU3RhcnQ6IG51bGwsXHJcbiAgICBvbkNsb3NlRW5kOiBudWxsLFxyXG4gICAgb25JdGVtQ2xpY2s6IG51bGxcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKi9cclxuICBjbGFzcyBEcm9wZG93biBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihEcm9wZG93biwgZWwsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5NX0Ryb3Bkb3duID0gdGhpcztcclxuICAgICAgRHJvcGRvd24uX2Ryb3Bkb3ducy5wdXNoKHRoaXMpO1xyXG5cclxuICAgICAgdGhpcy5pZCA9IE0uZ2V0SWRGcm9tVHJpZ2dlcihlbCk7XHJcbiAgICAgIHRoaXMuZHJvcGRvd25FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xyXG4gICAgICB0aGlzLiRkcm9wZG93bkVsID0gJCh0aGlzLmRyb3Bkb3duRWwpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBkcm9wZG93blxyXG4gICAgICAgKiBAbWVtYmVyIERyb3Bkb3duI29wdGlvbnNcclxuICAgICAgICogQHByb3Age1N0cmluZ30gW2FsaWdubWVudD0nbGVmdCddIC0gRWRnZSB3aGljaCB0aGUgZHJvcGRvd24gaXMgYWxpZ25lZCB0b1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW2F1dG9Gb2N1cz10cnVlXSAtIEF1dG9tYXRpY2FsbHkgZm9jdXMgZHJvcGRvd24gZWwgZm9yIGtleWJvYXJkXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBbY29uc3RyYWluV2lkdGg9dHJ1ZV0gLSBDb25zdHJhaW4gd2lkdGggdG8gd2lkdGggb2YgdGhlIGJ1dHRvblxyXG4gICAgICAgKiBAcHJvcCB7RWxlbWVudH0gY29udGFpbmVyIC0gQ29udGFpbmVyIGVsZW1lbnQgdG8gYXR0YWNoIGRyb3Bkb3duIHRvIChvcHRpb25hbClcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtjb3ZlclRyaWdnZXI9dHJ1ZV0gLSBQbGFjZSBkcm9wZG93biBvdmVyIHRyaWdnZXJcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtjbG9zZU9uQ2xpY2s9dHJ1ZV0gLSBDbG9zZSBvbiBjbGljayBvZiBkcm9wZG93biBpdGVtXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBbaG92ZXI9ZmFsc2VdIC0gT3BlbiBkcm9wZG93biBvbiBob3ZlclxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbaW5EdXJhdGlvbj0xNTBdIC0gRHVyYXRpb24gb2Ygb3BlbiBhbmltYXRpb24gaW4gbXNcclxuICAgICAgICogQHByb3Age051bWJlcn0gW291dER1cmF0aW9uPTI1MF0gLSBEdXJhdGlvbiBvZiBjbG9zZSBhbmltYXRpb24gaW4gbXNcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5TdGFydCAtIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIGRyb3Bkb3duIHN0YXJ0cyBvcGVuaW5nXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25PcGVuRW5kIC0gRnVuY3Rpb24gY2FsbGVkIHdoZW4gZHJvcGRvd24gZmluaXNoZXMgb3BlbmluZ1xyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2VTdGFydCAtIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIGRyb3Bkb3duIHN0YXJ0cyBjbG9zaW5nXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZUVuZCAtIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIGRyb3Bkb3duIGZpbmlzaGVzIGNsb3NpbmdcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcm9wZG93bi5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGVzY3JpYmVzIG9wZW4vY2xvc2Ugc3RhdGUgb2YgZHJvcGRvd25cclxuICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBpZiBkcm9wZG93biBjb250ZW50IGlzIHNjcm9sbGFibGVcclxuICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmlzU2Nyb2xsYWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBpZiB0b3VjaCBtb3Zpbmcgb24gZHJvcGRvd24gY29udGVudFxyXG4gICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaXNUb3VjaE1vdmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgdGhpcy5mb2N1c2VkSW5kZXggPSAtMTtcclxuICAgICAgdGhpcy5maWx0ZXJRdWVyeSA9IFtdO1xyXG5cclxuICAgICAgLy8gTW92ZSBkcm9wZG93bi1jb250ZW50IGFmdGVyIGRyb3Bkb3duLXRyaWdnZXJcclxuICAgICAgaWYgKCEhdGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xyXG4gICAgICAgICQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKHRoaXMuZHJvcGRvd25FbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy4kZWwuYWZ0ZXIodGhpcy5kcm9wZG93bkVsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fbWFrZURyb3Bkb3duRm9jdXNhYmxlKCk7XHJcbiAgICAgIHRoaXMuX3Jlc2V0RmlsdGVyUXVlcnlCb3VuZCA9IHRoaXMuX3Jlc2V0RmlsdGVyUXVlcnkuYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlRG9jdW1lbnRDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVEb2N1bWVudFRvdWNobW92ZUJvdW5kID0gdGhpcy5faGFuZGxlRG9jdW1lbnRUb3VjaG1vdmUuYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlRHJvcGRvd25DbGlja0JvdW5kID0gdGhpcy5faGFuZGxlRHJvcGRvd25DbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVEcm9wZG93bktleWRvd25Cb3VuZCA9IHRoaXMuX2hhbmRsZURyb3Bkb3duS2V5ZG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVUcmlnZ2VyS2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlVHJpZ2dlcktleWRvd24uYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fRHJvcGRvd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5fcmVzZXREcm9wZG93blN0eWxlcygpO1xyXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIERyb3Bkb3duLl9kcm9wZG93bnMuc3BsaWNlKERyb3Bkb3duLl9kcm9wZG93bnMuaW5kZXhPZih0aGlzKSwgMSk7XHJcbiAgICAgIHRoaXMuZWwuTV9Ecm9wZG93biA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIC8vIFRyaWdnZXIga2V5ZG93biBoYW5kbGVyXHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZVRyaWdnZXJLZXlkb3duQm91bmQpO1xyXG5cclxuICAgICAgLy8gSXRlbSBjbGljayBoYW5kbGVyXHJcbiAgICAgIHRoaXMuZHJvcGRvd25FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURyb3Bkb3duQ2xpY2tCb3VuZCk7XHJcblxyXG4gICAgICAvLyBIb3ZlciBldmVudCBoYW5kbGVyc1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmhvdmVyKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kID0gdGhpcy5faGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2hhbmRsZU1vdXNlRW50ZXJCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlTW91c2VMZWF2ZUJvdW5kID0gdGhpcy5faGFuZGxlTW91c2VMZWF2ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZU1vdXNlTGVhdmVCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5kcm9wZG93bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQpO1xyXG5cclxuICAgICAgICAvLyBDbGljayBldmVudCBoYW5kbGVyc1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVUcmlnZ2VyS2V5ZG93bkJvdW5kKTtcclxuICAgICAgdGhpcy5kcm9wZG93bkVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRHJvcGRvd25DbGlja0JvdW5kKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaG92ZXIpIHtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9oYW5kbGVNb3VzZUVudGVyQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZU1vdXNlTGVhdmVCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5kcm9wZG93bkVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9zZXR1cFRlbXBvcmFyeUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIC8vIFVzZSBjYXB0dXJlIHBoYXNlIGV2ZW50IGhhbmRsZXIgdG8gcHJldmVudCBjbGlja1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0JvdW5kLCB0cnVlKTtcclxuICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCk7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlRG9jdW1lbnRUb3VjaG1vdmVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZHJvcGRvd25FbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlRHJvcGRvd25LZXlkb3duQm91bmQpO1xyXG4gICAgfVxyXG5cclxuICAgIF9yZW1vdmVUZW1wb3JhcnlFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAvLyBVc2UgY2FwdHVyZSBwaGFzZSBldmVudCBoYW5kbGVyIHRvIHByZXZlbnQgY2xpY2tcclxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZURvY3VtZW50VG91Y2htb3ZlQm91bmQpO1xyXG4gICAgICB0aGlzLmRyb3Bkb3duRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZURyb3Bkb3duS2V5ZG93bkJvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlQ2xpY2soZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIF9oYW5kbGVNb3VzZUVudGVyKCkge1xyXG4gICAgICB0aGlzLm9wZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlTW91c2VMZWF2ZShlKSB7XHJcbiAgICAgIGxldCB0b0VsID0gZS50b0VsZW1lbnQgfHwgZS5yZWxhdGVkVGFyZ2V0O1xyXG4gICAgICBsZXQgbGVhdmVUb0Ryb3Bkb3duQ29udGVudCA9ICEhJCh0b0VsKS5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aDtcclxuICAgICAgbGV0IGxlYXZlVG9BY3RpdmVEcm9wZG93blRyaWdnZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgIGxldCAkY2xvc2VzdFRyaWdnZXIgPSAkKHRvRWwpLmNsb3Nlc3QoJy5kcm9wZG93bi10cmlnZ2VyJyk7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAkY2xvc2VzdFRyaWdnZXIubGVuZ3RoICYmXHJcbiAgICAgICAgISEkY2xvc2VzdFRyaWdnZXJbMF0uTV9Ecm9wZG93biAmJlxyXG4gICAgICAgICRjbG9zZXN0VHJpZ2dlclswXS5NX0Ryb3Bkb3duLmlzT3BlblxyXG4gICAgICApIHtcclxuICAgICAgICBsZWF2ZVRvQWN0aXZlRHJvcGRvd25UcmlnZ2VyID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2xvc2UgaG92ZXIgZHJvcGRvd24gaWYgbW91c2UgZGlkIG5vdCBsZWF2ZSB0byBlaXRoZXIgYWN0aXZlIGRyb3Bkb3duLXRyaWdnZXIgb3IgZHJvcGRvd24tY29udGVudFxyXG4gICAgICBpZiAoIWxlYXZlVG9BY3RpdmVEcm9wZG93blRyaWdnZXIgJiYgIWxlYXZlVG9Ecm9wZG93bkNvbnRlbnQpIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlRG9jdW1lbnRDbGljayhlKSB7XHJcbiAgICAgIGxldCAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICAgIGlmIChcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrICYmXHJcbiAgICAgICAgJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aCAmJlxyXG4gICAgICAgICF0aGlzLmlzVG91Y2hNb3ZpbmdcclxuICAgICAgKSB7XHJcbiAgICAgICAgLy8gaXNUb3VjaE1vdmluZyB0byBjaGVjayBpZiBzY3JvbGxpbmcgb24gbW9iaWxlLlxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICR0YXJnZXQuY2xvc2VzdCgnLmRyb3Bkb3duLXRyaWdnZXInKS5sZW5ndGggfHxcclxuICAgICAgICAhJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aFxyXG4gICAgICApIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmlzVG91Y2hNb3ZpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlVHJpZ2dlcktleWRvd24oZSkge1xyXG4gICAgICAvLyBBUlJPVyBET1dOIE9SIEVOVEVSIFdIRU4gU0VMRUNUIElTIENMT1NFRCAtIG9wZW4gRHJvcGRvd25cclxuICAgICAgaWYgKChlLndoaWNoID09PSBNLmtleXMuQVJST1dfRE9XTiB8fCBlLndoaWNoID09PSBNLmtleXMuRU5URVIpICYmICF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIERvY3VtZW50IFRvdWNobW92ZVxyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlRG9jdW1lbnRUb3VjaG1vdmUoZSkge1xyXG4gICAgICBsZXQgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICBpZiAoJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuaXNUb3VjaE1vdmluZyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBEcm9wZG93biBDbGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlRHJvcGRvd25DbGljayhlKSB7XHJcbiAgICAgIC8vIG9uSXRlbUNsaWNrIGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uSXRlbUNsaWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgbGV0IGl0ZW1FbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2xpJylbMF07XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uSXRlbUNsaWNrLmNhbGwodGhpcywgaXRlbUVsKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIERyb3Bkb3duIEtleWRvd25cclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZURyb3Bkb3duS2V5ZG93bihlKSB7XHJcbiAgICAgIGlmIChlLndoaWNoID09PSBNLmtleXMuVEFCKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgLy8gTmF2aWdhdGUgZG93biBkcm9wZG93biBsaXN0XHJcbiAgICAgIH0gZWxzZSBpZiAoKGUud2hpY2ggPT09IE0ua2V5cy5BUlJPV19ET1dOIHx8IGUud2hpY2ggPT09IE0ua2V5cy5BUlJPV19VUCkgJiYgdGhpcy5pc09wZW4pIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IGUud2hpY2ggPT09IE0ua2V5cy5BUlJPV19ET1dOID8gMSA6IC0xO1xyXG4gICAgICAgIGxldCBuZXdGb2N1c2VkSW5kZXggPSB0aGlzLmZvY3VzZWRJbmRleDtcclxuICAgICAgICBsZXQgZm91bmROZXdJbmRleCA9IGZhbHNlO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIG5ld0ZvY3VzZWRJbmRleCA9IG5ld0ZvY3VzZWRJbmRleCArIGRpcmVjdGlvbjtcclxuXHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICEhdGhpcy5kcm9wZG93bkVsLmNoaWxkcmVuW25ld0ZvY3VzZWRJbmRleF0gJiZcclxuICAgICAgICAgICAgdGhpcy5kcm9wZG93bkVsLmNoaWxkcmVuW25ld0ZvY3VzZWRJbmRleF0udGFiSW5kZXggIT09IC0xXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgZm91bmROZXdJbmRleCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gd2hpbGUgKG5ld0ZvY3VzZWRJbmRleCA8IHRoaXMuZHJvcGRvd25FbC5jaGlsZHJlbi5sZW5ndGggJiYgbmV3Rm9jdXNlZEluZGV4ID49IDApO1xyXG5cclxuICAgICAgICBpZiAoZm91bmROZXdJbmRleCkge1xyXG4gICAgICAgICAgdGhpcy5mb2N1c2VkSW5kZXggPSBuZXdGb2N1c2VkSW5kZXg7XHJcbiAgICAgICAgICB0aGlzLl9mb2N1c0ZvY3VzZWRJdGVtKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFTlRFUiBzZWxlY3RzIGNob2ljZSBvbiBmb2N1c2VkIGl0ZW1cclxuICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSBNLmtleXMuRU5URVIgJiYgdGhpcy5pc09wZW4pIHtcclxuICAgICAgICAvLyBTZWFyY2ggZm9yIDxhPiBhbmQgPGJ1dHRvbj5cclxuICAgICAgICBsZXQgZm9jdXNlZEVsZW1lbnQgPSB0aGlzLmRyb3Bkb3duRWwuY2hpbGRyZW5bdGhpcy5mb2N1c2VkSW5kZXhdO1xyXG4gICAgICAgIGxldCAkYWN0aXZhdGFibGVFbGVtZW50ID0gJChmb2N1c2VkRWxlbWVudClcclxuICAgICAgICAgIC5maW5kKCdhLCBidXR0b24nKVxyXG4gICAgICAgICAgLmZpcnN0KCk7XHJcblxyXG4gICAgICAgIC8vIENsaWNrIGEgb3IgYnV0dG9uIHRhZyBpZiBleGlzdHMsIG90aGVyd2lzZSBjbGljayBsaSB0YWdcclxuICAgICAgICBpZiAoISEkYWN0aXZhdGFibGVFbGVtZW50Lmxlbmd0aCkge1xyXG4gICAgICAgICAgJGFjdGl2YXRhYmxlRWxlbWVudFswXS5jbGljaygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoISFmb2N1c2VkRWxlbWVudCkge1xyXG4gICAgICAgICAgZm9jdXNlZEVsZW1lbnQuY2xpY2soKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsb3NlIGRyb3Bkb3duIG9uIEVTQ1xyXG4gICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IE0ua2V5cy5FU0MgJiYgdGhpcy5pc09wZW4pIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDQVNFIFdIRU4gVVNFUiBUWVBFIExFVFRFUlNcclxuICAgICAgbGV0IGxldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBub25MZXR0ZXJzID0gWzksIDEzLCAyNywgMzgsIDQwXTtcclxuICAgICAgaWYgKGxldHRlciAmJiBub25MZXR0ZXJzLmluZGV4T2YoZS53aGljaCkgPT09IC0xKSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJRdWVyeS5wdXNoKGxldHRlcik7XHJcblxyXG4gICAgICAgIGxldCBzdHJpbmcgPSB0aGlzLmZpbHRlclF1ZXJ5LmpvaW4oJycpLFxyXG4gICAgICAgICAgbmV3T3B0aW9uRWwgPSAkKHRoaXMuZHJvcGRvd25FbClcclxuICAgICAgICAgICAgLmZpbmQoJ2xpJylcclxuICAgICAgICAgICAgLmZpbHRlcigoZWwpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgJChlbClcclxuICAgICAgICAgICAgICAgICAgLnRleHQoKVxyXG4gICAgICAgICAgICAgICAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgICAuaW5kZXhPZihzdHJpbmcpID09PSAwXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlbMF07XHJcblxyXG4gICAgICAgIGlmIChuZXdPcHRpb25FbCkge1xyXG4gICAgICAgICAgdGhpcy5mb2N1c2VkSW5kZXggPSAkKG5ld09wdGlvbkVsKS5pbmRleCgpO1xyXG4gICAgICAgICAgdGhpcy5fZm9jdXNGb2N1c2VkSXRlbSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5maWx0ZXJUaW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLl9yZXNldEZpbHRlclF1ZXJ5Qm91bmQsIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgZHJvcGRvd25cclxuICAgICAqL1xyXG4gICAgX3Jlc2V0RmlsdGVyUXVlcnkoKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyUXVlcnkgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBfcmVzZXREcm9wZG93blN0eWxlcygpIHtcclxuICAgICAgdGhpcy4kZHJvcGRvd25FbC5jc3Moe1xyXG4gICAgICAgIGRpc3BsYXk6ICcnLFxyXG4gICAgICAgIHdpZHRoOiAnJyxcclxuICAgICAgICBoZWlnaHQ6ICcnLFxyXG4gICAgICAgIGxlZnQ6ICcnLFxyXG4gICAgICAgIHRvcDogJycsXHJcbiAgICAgICAgJ3RyYW5zZm9ybS1vcmlnaW4nOiAnJyxcclxuICAgICAgICB0cmFuc2Zvcm06ICcnLFxyXG4gICAgICAgIG9wYWNpdHk6ICcnXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9tYWtlRHJvcGRvd25Gb2N1c2FibGUoKSB7XHJcbiAgICAgIC8vIE5lZWRlZCBmb3IgYXJyb3cga2V5IG5hdmlnYXRpb25cclxuICAgICAgdGhpcy5kcm9wZG93bkVsLnRhYkluZGV4ID0gMDtcclxuXHJcbiAgICAgIC8vIE9ubHkgc2V0IHRhYmluZGV4IGlmIGl0IGhhc24ndCBiZWVuIHNldCBieSB1c2VyXHJcbiAgICAgICQodGhpcy5kcm9wZG93bkVsKVxyXG4gICAgICAgIC5jaGlsZHJlbigpXHJcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oZWwpIHtcclxuICAgICAgICAgIGlmICghZWwuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpKSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfZm9jdXNGb2N1c2VkSXRlbSgpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRoaXMuZm9jdXNlZEluZGV4ID49IDAgJiZcclxuICAgICAgICB0aGlzLmZvY3VzZWRJbmRleCA8IHRoaXMuZHJvcGRvd25FbC5jaGlsZHJlbi5sZW5ndGggJiZcclxuICAgICAgICB0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuZHJvcGRvd25FbC5jaGlsZHJlblt0aGlzLmZvY3VzZWRJbmRleF0uZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9nZXREcm9wZG93blBvc2l0aW9uKCkge1xyXG4gICAgICBsZXQgb2Zmc2V0UGFyZW50QlJlY3QgPSB0aGlzLmVsLm9mZnNldFBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgbGV0IHRyaWdnZXJCUmVjdCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIGxldCBkcm9wZG93bkJSZWN0ID0gdGhpcy5kcm9wZG93bkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgbGV0IGlkZWFsSGVpZ2h0ID0gZHJvcGRvd25CUmVjdC5oZWlnaHQ7XHJcbiAgICAgIGxldCBpZGVhbFdpZHRoID0gZHJvcGRvd25CUmVjdC53aWR0aDtcclxuICAgICAgbGV0IGlkZWFsWFBvcyA9IHRyaWdnZXJCUmVjdC5sZWZ0IC0gZHJvcGRvd25CUmVjdC5sZWZ0O1xyXG4gICAgICBsZXQgaWRlYWxZUG9zID0gdHJpZ2dlckJSZWN0LnRvcCAtIGRyb3Bkb3duQlJlY3QudG9wO1xyXG5cclxuICAgICAgbGV0IGRyb3Bkb3duQm91bmRzID0ge1xyXG4gICAgICAgIGxlZnQ6IGlkZWFsWFBvcyxcclxuICAgICAgICB0b3A6IGlkZWFsWVBvcyxcclxuICAgICAgICBoZWlnaHQ6IGlkZWFsSGVpZ2h0LFxyXG4gICAgICAgIHdpZHRoOiBpZGVhbFdpZHRoXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBDb3VudGFpbmVyIGhlcmUgd2lsbCBiZSBjbG9zZXN0IGFuY2VzdG9yIHdpdGggb3ZlcmZsb3c6IGhpZGRlblxyXG4gICAgICBsZXQgY2xvc2VzdE92ZXJmbG93UGFyZW50ID0gISF0aGlzLmRyb3Bkb3duRWwub2Zmc2V0UGFyZW50XHJcbiAgICAgICAgPyB0aGlzLmRyb3Bkb3duRWwub2Zmc2V0UGFyZW50XHJcbiAgICAgICAgOiB0aGlzLmRyb3Bkb3duRWwucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgIGxldCBhbGlnbm1lbnRzID0gTS5jaGVja1Bvc3NpYmxlQWxpZ25tZW50cyhcclxuICAgICAgICB0aGlzLmVsLFxyXG4gICAgICAgIGNsb3Nlc3RPdmVyZmxvd1BhcmVudCxcclxuICAgICAgICBkcm9wZG93bkJvdW5kcyxcclxuICAgICAgICB0aGlzLm9wdGlvbnMuY292ZXJUcmlnZ2VyID8gMCA6IHRyaWdnZXJCUmVjdC5oZWlnaHRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGxldCB2ZXJ0aWNhbEFsaWdubWVudCA9ICd0b3AnO1xyXG4gICAgICBsZXQgaG9yaXpvbnRhbEFsaWdubWVudCA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQ7XHJcbiAgICAgIGlkZWFsWVBvcyArPSB0aGlzLm9wdGlvbnMuY292ZXJUcmlnZ2VyID8gMCA6IHRyaWdnZXJCUmVjdC5oZWlnaHQ7XHJcblxyXG4gICAgICAvLyBSZXNldCBpc1Njcm9sbGFibGVcclxuICAgICAgdGhpcy5pc1Njcm9sbGFibGUgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmICghYWxpZ25tZW50cy50b3ApIHtcclxuICAgICAgICBpZiAoYWxpZ25tZW50cy5ib3R0b20pIHtcclxuICAgICAgICAgIHZlcnRpY2FsQWxpZ25tZW50ID0gJ2JvdHRvbSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaXNTY3JvbGxhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2lkZSBoYXMgbW9zdCBzcGFjZSBhbmQgY3V0b2ZmIGF0IGNvcnJlY3QgaGVpZ2h0XHJcbiAgICAgICAgICBpZiAoYWxpZ25tZW50cy5zcGFjZU9uVG9wID4gYWxpZ25tZW50cy5zcGFjZU9uQm90dG9tKSB7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsQWxpZ25tZW50ID0gJ2JvdHRvbSc7XHJcbiAgICAgICAgICAgIGlkZWFsSGVpZ2h0ICs9IGFsaWdubWVudHMuc3BhY2VPblRvcDtcclxuICAgICAgICAgICAgaWRlYWxZUG9zIC09IGFsaWdubWVudHMuc3BhY2VPblRvcDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlkZWFsSGVpZ2h0ICs9IGFsaWdubWVudHMuc3BhY2VPbkJvdHRvbTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHByZWZlcnJlZCBob3Jpem9udGFsIGFsaWdubWVudCBpcyBwb3NzaWJsZVxyXG4gICAgICBpZiAoIWFsaWdubWVudHNbaG9yaXpvbnRhbEFsaWdubWVudF0pIHtcclxuICAgICAgICBsZXQgb3Bwb3NpdGVBbGlnbm1lbnQgPSBob3Jpem9udGFsQWxpZ25tZW50ID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xyXG4gICAgICAgIGlmIChhbGlnbm1lbnRzW29wcG9zaXRlQWxpZ25tZW50XSkge1xyXG4gICAgICAgICAgaG9yaXpvbnRhbEFsaWdubWVudCA9IG9wcG9zaXRlQWxpZ25tZW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2lkZSBoYXMgbW9zdCBzcGFjZSBhbmQgY3V0b2ZmIGF0IGNvcnJlY3QgaGVpZ2h0XHJcbiAgICAgICAgICBpZiAoYWxpZ25tZW50cy5zcGFjZU9uTGVmdCA+IGFsaWdubWVudHMuc3BhY2VPblJpZ2h0KSB7XHJcbiAgICAgICAgICAgIGhvcml6b250YWxBbGlnbm1lbnQgPSAncmlnaHQnO1xyXG4gICAgICAgICAgICBpZGVhbFdpZHRoICs9IGFsaWdubWVudHMuc3BhY2VPbkxlZnQ7XHJcbiAgICAgICAgICAgIGlkZWFsWFBvcyAtPSBhbGlnbm1lbnRzLnNwYWNlT25MZWZ0O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaG9yaXpvbnRhbEFsaWdubWVudCA9ICdsZWZ0JztcclxuICAgICAgICAgICAgaWRlYWxXaWR0aCArPSBhbGlnbm1lbnRzLnNwYWNlT25SaWdodDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh2ZXJ0aWNhbEFsaWdubWVudCA9PT0gJ2JvdHRvbScpIHtcclxuICAgICAgICBpZGVhbFlQb3MgPVxyXG4gICAgICAgICAgaWRlYWxZUG9zIC0gZHJvcGRvd25CUmVjdC5oZWlnaHQgKyAodGhpcy5vcHRpb25zLmNvdmVyVHJpZ2dlciA/IHRyaWdnZXJCUmVjdC5oZWlnaHQgOiAwKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaG9yaXpvbnRhbEFsaWdubWVudCA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgIGlkZWFsWFBvcyA9IGlkZWFsWFBvcyAtIGRyb3Bkb3duQlJlY3Qud2lkdGggKyB0cmlnZ2VyQlJlY3Qud2lkdGg7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBpZGVhbFhQb3MsXHJcbiAgICAgICAgeTogaWRlYWxZUG9zLFxyXG4gICAgICAgIHZlcnRpY2FsQWxpZ25tZW50OiB2ZXJ0aWNhbEFsaWdubWVudCxcclxuICAgICAgICBob3Jpem9udGFsQWxpZ25tZW50OiBob3Jpem9udGFsQWxpZ25tZW50LFxyXG4gICAgICAgIGhlaWdodDogaWRlYWxIZWlnaHQsXHJcbiAgICAgICAgd2lkdGg6IGlkZWFsV2lkdGhcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGUgaW4gZHJvcGRvd25cclxuICAgICAqL1xyXG4gICAgX2FuaW1hdGVJbigpIHtcclxuICAgICAgYW5pbS5yZW1vdmUodGhpcy5kcm9wZG93bkVsKTtcclxuICAgICAgYW5pbSh7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy5kcm9wZG93bkVsLFxyXG4gICAgICAgIG9wYWNpdHk6IHtcclxuICAgICAgICAgIHZhbHVlOiBbMCwgMV0sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjYWxlWDogWzAuMywgMV0sXHJcbiAgICAgICAgc2NhbGVZOiBbMC4zLCAxXSxcclxuICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1aW50JyxcclxuICAgICAgICBjb21wbGV0ZTogKGFuaW0pID0+IHtcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcGRvd25FbC5mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG9uT3BlbkVuZCBjYWxsYmFja1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5FbmQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW5pbWF0ZSBvdXQgZHJvcGRvd25cclxuICAgICAqL1xyXG4gICAgX2FuaW1hdGVPdXQoKSB7XHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZHJvcGRvd25FbCk7XHJcbiAgICAgIGFuaW0oe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMuZHJvcGRvd25FbCxcclxuICAgICAgICBvcGFjaXR5OiB7XHJcbiAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWludCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjYWxlWDogMC4zLFxyXG4gICAgICAgIHNjYWxlWTogMC4zLFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1aW50JyxcclxuICAgICAgICBjb21wbGV0ZTogKGFuaW0pID0+IHtcclxuICAgICAgICAgIHRoaXMuX3Jlc2V0RHJvcGRvd25TdHlsZXMoKTtcclxuXHJcbiAgICAgICAgICAvLyBvbkNsb3NlRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBsYWNlIGRyb3Bkb3duXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZURyb3Bkb3duKCkge1xyXG4gICAgICAvLyBTZXQgd2lkdGggYmVmb3JlIGNhbGN1bGF0aW5nIHBvc2l0aW9uSW5mb1xyXG4gICAgICBsZXQgaWRlYWxXaWR0aCA9IHRoaXMub3B0aW9ucy5jb25zdHJhaW5XaWR0aFxyXG4gICAgICAgID8gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxyXG4gICAgICAgIDogdGhpcy5kcm9wZG93bkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUud2lkdGggPSBpZGVhbFdpZHRoICsgJ3B4JztcclxuXHJcbiAgICAgIGxldCBwb3NpdGlvbkluZm8gPSB0aGlzLl9nZXREcm9wZG93blBvc2l0aW9uKCk7XHJcbiAgICAgIHRoaXMuZHJvcGRvd25FbC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25JbmZvLnggKyAncHgnO1xyXG4gICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUudG9wID0gcG9zaXRpb25JbmZvLnkgKyAncHgnO1xyXG4gICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUuaGVpZ2h0ID0gcG9zaXRpb25JbmZvLmhlaWdodCArICdweCc7XHJcbiAgICAgIHRoaXMuZHJvcGRvd25FbC5zdHlsZS53aWR0aCA9IHBvc2l0aW9uSW5mby53aWR0aCArICdweCc7XHJcbiAgICAgIHRoaXMuZHJvcGRvd25FbC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBgJHtcclxuICAgICAgICBwb3NpdGlvbkluZm8uaG9yaXpvbnRhbEFsaWdubWVudCA9PT0gJ2xlZnQnID8gJzAnIDogJzEwMCUnXHJcbiAgICAgIH0gJHtwb3NpdGlvbkluZm8udmVydGljYWxBbGlnbm1lbnQgPT09ICd0b3AnID8gJzAnIDogJzEwMCUnfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcGVuIERyb3Bkb3duXHJcbiAgICAgKi9cclxuICAgIG9wZW4oKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcblxyXG4gICAgICAvLyBvbk9wZW5TdGFydCBjYWxsYmFja1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydC5jYWxsKHRoaXMsIHRoaXMuZWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZXNldCBzdHlsZXNcclxuICAgICAgdGhpcy5fcmVzZXREcm9wZG93blN0eWxlcygpO1xyXG4gICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICB0aGlzLl9wbGFjZURyb3Bkb3duKCk7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVJbigpO1xyXG4gICAgICB0aGlzLl9zZXR1cFRlbXBvcmFyeUV2ZW50SGFuZGxlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIERyb3Bkb3duXHJcbiAgICAgKi9cclxuICAgIGNsb3NlKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZm9jdXNlZEluZGV4ID0gLTE7XHJcblxyXG4gICAgICAvLyBvbkNsb3NlU3RhcnQgY2FsbGJhY2tcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydC5jYWxsKHRoaXMsIHRoaXMuZWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9hbmltYXRlT3V0KCk7XHJcbiAgICAgIHRoaXMuX3JlbW92ZVRlbXBvcmFyeUV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzKSB7XHJcbiAgICAgICAgdGhpcy5lbC5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWNhbGN1bGF0ZSBkaW1lbnNpb25zXHJcbiAgICAgKi9cclxuICAgIHJlY2FsY3VsYXRlRGltZW5zaW9ucygpIHtcclxuICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgdGhpcy4kZHJvcGRvd25FbC5jc3Moe1xyXG4gICAgICAgICAgd2lkdGg6ICcnLFxyXG4gICAgICAgICAgaGVpZ2h0OiAnJyxcclxuICAgICAgICAgIGxlZnQ6ICcnLFxyXG4gICAgICAgICAgdG9wOiAnJyxcclxuICAgICAgICAgICd0cmFuc2Zvcm0tb3JpZ2luJzogJydcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9wbGFjZURyb3Bkb3duKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgRHJvcGRvd25cclxuICAgKi9cclxuICBEcm9wZG93bi5fZHJvcGRvd25zID0gW107XHJcblxyXG4gIE0uRHJvcGRvd24gPSBEcm9wZG93bjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKERyb3Bkb3duLCAnZHJvcGRvd24nLCAnTV9Ecm9wZG93bicpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbiJdLCJmaWxlIjoiZHJvcGRvd24uanMifQ==
