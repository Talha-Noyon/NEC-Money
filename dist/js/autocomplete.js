(function($) {
  'use strict';

  let _defaults = {
    data: {}, // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function(a, b, inputString) {
      // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    }
  };

  /**
   * @class
   *
   */
  class Autocomplete extends Component {
    /**
     * Construct Autocomplete instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Autocomplete, el, options);

      this.el.M_Autocomplete = this;

      /**
       * Options for the autocomplete
       * @member Autocomplete#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {number} shift
       * @prop {number} padding
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      this.options = $.extend({}, Autocomplete.defaults, options);

      // Setup
      this.isOpen = false;
      this.count = 0;
      this.activeIndex = -1;
      this.oldVal;
      this.$inputField = this.$el.closest('.input-field');
      this.$active = $();
      this._mousedown = false;
      this._setupDropdown();

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
      return domElem.M_Autocomplete;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeDropdown();
      this.el.M_Autocomplete = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleInputBlurBound = this._handleInputBlur.bind(this);
      this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(
        this
      );
      this._handleContainerMouseupAndTouchendBound = this._handleContainerMouseupAndTouchend.bind(
        this
      );

      this.el.addEventListener('blur', this._handleInputBlurBound);
      this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
      this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.el.addEventListener('click', this._handleInputClickBound);
      this.container.addEventListener(
        'mousedown',
        this._handleContainerMousedownAndTouchstartBound
      );
      this.container.addEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

      if (typeof window.ontouchstart !== 'undefined') {
        this.container.addEventListener(
          'touchstart',
          this._handleContainerMousedownAndTouchstartBound
        );
        this.container.addEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('blur', this._handleInputBlurBound);
      this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
      this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      this.el.removeEventListener('click', this._handleInputClickBound);
      this.container.removeEventListener(
        'mousedown',
        this._handleContainerMousedownAndTouchstartBound
      );
      this.container.removeEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

      if (typeof window.ontouchstart !== 'undefined') {
        this.container.removeEventListener(
          'touchstart',
          this._handleContainerMousedownAndTouchstartBound
        );
        this.container.removeEventListener(
          'touchend',
          this._handleContainerMouseupAndTouchendBound
        );
      }
    }

    /**
     * Setup dropdown
     */
    _setupDropdown() {
      this.container = document.createElement('ul');
      this.container.id = `autocomplete-options-${M.guid()}`;
      $(this.container).addClass('autocomplete-content dropdown-content');
      this.$inputField.append(this.container);
      this.el.setAttribute('data-target', this.container.id);

      this.dropdown = M.Dropdown.init(this.el, {
        autoFocus: false,
        closeOnClick: false,
        coverTrigger: false,
        onItemClick: (itemEl) => {
          this.selectOption($(itemEl));
        }
      });

      // Sketchy removal of dropdown click handler
      this.el.removeEventListener('click', this.dropdown._handleClickBound);
    }

    /**
     * Remove dropdown
     */
    _removeDropdown() {
      this.container.parentNode.removeChild(this.container);
    }

    /**
     * Handle Input Blur
     */
    _handleInputBlur() {
      if (!this._mousedown) {
        this.close();
        this._resetAutocomplete();
      }
    }

    /**
     * Handle Input Keyup and Focus
     * @param {Event} e
     */
    _handleInputKeyupAndFocus(e) {
      if (e.type === 'keyup') {
        Autocomplete._keydown = false;
      }

      this.count = 0;
      let val = this.el.value.toLowerCase();

      // Don't capture enter or arrow key usage.
      if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
        return;
      }

      // Check if the input isn't empty
      // Check if focus triggered by tab
      if (this.oldVal !== val && (M.tabPressed || e.type !== 'focus')) {
        this.open();
      }

      // Update oldVal
      this.oldVal = val;
    }

    /**
     * Handle Input Keydown
     * @param {Event} e
     */
    _handleInputKeydown(e) {
      Autocomplete._keydown = true;

      // Arrow keys and enter key usage
      let keyCode = e.keyCode,
        liElement,
        numItems = $(this.container).children('li').length;

      // select element on Enter
      if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
        liElement = $(this.container)
          .children('li')
          .eq(this.activeIndex);
        if (liElement.length) {
          this.selectOption(liElement);
          e.preventDefault();
        }
        return;
      }

      // Capture up and down key
      if (keyCode === M.keys.ARROW_UP || keyCode === M.keys.ARROW_DOWN) {
        e.preventDefault();

        if (keyCode === M.keys.ARROW_UP && this.activeIndex > 0) {
          this.activeIndex--;
        }

        if (keyCode === M.keys.ARROW_DOWN && this.activeIndex < numItems - 1) {
          this.activeIndex++;
        }

        this.$active.removeClass('active');
        if (this.activeIndex >= 0) {
          this.$active = $(this.container)
            .children('li')
            .eq(this.activeIndex);
          this.$active.addClass('active');
        }
      }
    }

    /**
     * Handle Input Click
     * @param {Event} e
     */
    _handleInputClick(e) {
      this.open();
    }

    /**
     * Handle Container Mousedown and Touchstart
     * @param {Event} e
     */
    _handleContainerMousedownAndTouchstart(e) {
      this._mousedown = true;
    }

    /**
     * Handle Container Mouseup and Touchend
     * @param {Event} e
     */
    _handleContainerMouseupAndTouchend(e) {
      this._mousedown = false;
    }

    /**
     * Highlight partial match
     */
    _highlight(string, $el) {
      let img = $el.find('img');
      let matchStart = $el
          .text()
          .toLowerCase()
          .indexOf('' + string.toLowerCase() + ''),
        matchEnd = matchStart + string.length - 1,
        beforeMatch = $el.text().slice(0, matchStart),
        matchText = $el.text().slice(matchStart, matchEnd + 1),
        afterMatch = $el.text().slice(matchEnd + 1);
      $el.html(
        `<span>${beforeMatch}<span class='highlight'>${matchText}</span>${afterMatch}</span>`
      );
      if (img.length) {
        $el.prepend(img);
      }
    }

    /**
     * Reset current element position
     */
    _resetCurrentElement() {
      this.activeIndex = -1;
      this.$active.removeClass('active');
    }

    /**
     * Reset autocomplete elements
     */
    _resetAutocomplete() {
      $(this.container).empty();
      this._resetCurrentElement();
      this.oldVal = null;
      this.isOpen = false;
      this._mousedown = false;
    }

    /**
     * Select autocomplete option
     * @param {Element} el  Autocomplete option list item element
     */
    selectOption(el) {
      let text = el.text().trim();
      this.el.value = text;
      this.$el.trigger('change');
      this._resetAutocomplete();
      this.close();

      // Handle onAutocomplete callback.
      if (typeof this.options.onAutocomplete === 'function') {
        this.options.onAutocomplete.call(this, text);
      }
    }

    /**
     * Render dropdown content
     * @param {Object} data  data set
     * @param {String} val  current input value
     */
    _renderDropdown(data, val) {
      this._resetAutocomplete();

      let matchingData = [];

      // Gather all matching data
      for (let key in data) {
        if (data.hasOwnProperty(key) && key.toLowerCase().indexOf(val) !== -1) {
          // Break if past limit
          if (this.count >= this.options.limit) {
            break;
          }

          let entry = {
            data: data[key],
            key: key
          };
          matchingData.push(entry);

          this.count++;
        }
      }

      // Sort
      if (this.options.sortFunction) {
        let sortFunctionBound = (a, b) => {
          return this.options.sortFunction(
            a.key.toLowerCase(),
            b.key.toLowerCase(),
            val.toLowerCase()
          );
        };
        matchingData.sort(sortFunctionBound);
      }

      // Render
      for (let i = 0; i < matchingData.length; i++) {
        let entry = matchingData[i];
        let $autocompleteOption = $('<li></li>');
        if (!!entry.data) {
          $autocompleteOption.append(
            `<img src="${entry.data}" class="right circle"><span>${entry.key}</span>`
          );
        } else {
          $autocompleteOption.append('<span>' + entry.key + '</span>');
        }

        $(this.container).append($autocompleteOption);
        this._highlight(val, $autocompleteOption);
      }
    }

    /**
     * Open Autocomplete Dropdown
     */
    open() {
      let val = this.el.value.toLowerCase();

      this._resetAutocomplete();

      if (val.length >= this.options.minLength) {
        this.isOpen = true;
        this._renderDropdown(this.options.data, val);
      }

      // Open dropdown
      if (!this.dropdown.isOpen) {
        this.dropdown.open();
      } else {
        // Recalculate dropdown when its already open
        this.dropdown.recalculateDimensions();
      }
    }

    /**
     * Close Autocomplete Dropdown
     */
    close() {
      this.dropdown.close();
    }

    /**
     * Update Data
     * @param {Object} data
     */
    updateData(data) {
      let val = this.el.value.toLowerCase();
      this.options.data = data;

      if (this.isOpen) {
        this._renderDropdown(data, val);
      }
    }
  }

  /**
   * @static
   * @memberof Autocomplete
   */
  Autocomplete._keydown = false;

  M.Autocomplete = Autocomplete;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhdXRvY29tcGxldGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBfZGVmYXVsdHMgPSB7XHJcbiAgICBkYXRhOiB7fSwgLy8gQXV0b2NvbXBsZXRlIGRhdGEgc2V0XHJcbiAgICBsaW1pdDogSW5maW5pdHksIC8vIExpbWl0IG9mIHJlc3VsdHMgdGhlIGF1dG9jb21wbGV0ZSBzaG93c1xyXG4gICAgb25BdXRvY29tcGxldGU6IG51bGwsIC8vIENhbGxiYWNrIGZvciB3aGVuIGF1dG9jb21wbGV0ZWRcclxuICAgIG1pbkxlbmd0aDogMSwgLy8gTWluIGNoYXJhY3RlcnMgYmVmb3JlIGF1dG9jb21wbGV0ZSBzdGFydHNcclxuICAgIHNvcnRGdW5jdGlvbjogZnVuY3Rpb24oYSwgYiwgaW5wdXRTdHJpbmcpIHtcclxuICAgICAgLy8gU29ydCBmdW5jdGlvbiBmb3Igc29ydGluZyBhdXRvY29tcGxldGUgcmVzdWx0c1xyXG4gICAgICByZXR1cm4gYS5pbmRleE9mKGlucHV0U3RyaW5nKSAtIGIuaW5kZXhPZihpbnB1dFN0cmluZyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuICBjbGFzcyBBdXRvY29tcGxldGUgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgQXV0b2NvbXBsZXRlIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKEF1dG9jb21wbGV0ZSwgZWwsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5NX0F1dG9jb21wbGV0ZSA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZVxyXG4gICAgICAgKiBAbWVtYmVyIEF1dG9jb21wbGV0ZSNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IGR1cmF0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IGRpc3RcclxuICAgICAgICogQHByb3Age251bWJlcn0gc2hpZnRcclxuICAgICAgICogQHByb3Age251bWJlcn0gcGFkZGluZ1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gZnVsbFdpZHRoXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBpbmRpY2F0b3JzXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBub1dyYXBcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkN5Y2xlVG9cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBdXRvY29tcGxldGUuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gU2V0dXBcclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgICAgIHRoaXMuYWN0aXZlSW5kZXggPSAtMTtcclxuICAgICAgdGhpcy5vbGRWYWw7XHJcbiAgICAgIHRoaXMuJGlucHV0RmllbGQgPSB0aGlzLiRlbC5jbG9zZXN0KCcuaW5wdXQtZmllbGQnKTtcclxuICAgICAgdGhpcy4kYWN0aXZlID0gJCgpO1xyXG4gICAgICB0aGlzLl9tb3VzZWRvd24gPSBmYWxzZTtcclxuICAgICAgdGhpcy5fc2V0dXBEcm9wZG93bigpO1xyXG5cclxuICAgICAgdGhpcy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcclxuICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmluaXQodGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgbGV0IGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgIHJldHVybiBkb21FbGVtLk1fQXV0b2NvbXBsZXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5fcmVtb3ZlRHJvcGRvd24oKTtcclxuICAgICAgdGhpcy5lbC5NX0F1dG9jb21wbGV0ZSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0Qmx1ckJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRCbHVyLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0S2V5dXBBbmRGb2N1c0JvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRLZXl1cEFuZEZvY3VzLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0Q2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlQ29udGFpbmVyTW91c2Vkb3duQW5kVG91Y2hzdGFydEJvdW5kID0gdGhpcy5faGFuZGxlQ29udGFpbmVyTW91c2Vkb3duQW5kVG91Y2hzdGFydC5iaW5kKFxyXG4gICAgICAgIHRoaXNcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5faGFuZGxlQ29udGFpbmVyTW91c2V1cEFuZFRvdWNoZW5kQm91bmQgPSB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmQuYmluZChcclxuICAgICAgICB0aGlzXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVJbnB1dEJsdXJCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLl9oYW5kbGVJbnB1dEtleXVwQW5kRm9jdXNCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9oYW5kbGVJbnB1dEtleXVwQW5kRm9jdXNCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCk7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgJ21vdXNlZG93bicsXHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ29udGFpbmVyTW91c2Vkb3duQW5kVG91Y2hzdGFydEJvdW5kXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCk7XHJcblxyXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICd0b3VjaHN0YXJ0JyxcclxuICAgICAgICAgIHRoaXMuX2hhbmRsZUNvbnRhaW5lck1vdXNlZG93bkFuZFRvdWNoc3RhcnRCb3VuZFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5faGFuZGxlSW5wdXRCbHVyQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5faGFuZGxlSW5wdXRLZXl1cEFuZEZvY3VzQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlSW5wdXRLZXl1cEFuZEZvY3VzQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQpO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICdtb3VzZWRvd24nLFxyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNvbnRhaW5lck1vdXNlZG93bkFuZFRvdWNoc3RhcnRCb3VuZFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlQ29udGFpbmVyTW91c2V1cEFuZFRvdWNoZW5kQm91bmQpO1xyXG5cclxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAndG91Y2hzdGFydCcsXHJcbiAgICAgICAgICB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0Qm91bmRcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAndG91Y2hlbmQnLFxyXG4gICAgICAgICAgdGhpcy5faGFuZGxlQ29udGFpbmVyTW91c2V1cEFuZFRvdWNoZW5kQm91bmRcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBkcm9wZG93blxyXG4gICAgICovXHJcbiAgICBfc2V0dXBEcm9wZG93bigpIHtcclxuICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lci5pZCA9IGBhdXRvY29tcGxldGUtb3B0aW9ucy0ke00uZ3VpZCgpfWA7XHJcbiAgICAgICQodGhpcy5jb250YWluZXIpLmFkZENsYXNzKCdhdXRvY29tcGxldGUtY29udGVudCBkcm9wZG93bi1jb250ZW50Jyk7XHJcbiAgICAgIHRoaXMuJGlucHV0RmllbGQuYXBwZW5kKHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JywgdGhpcy5jb250YWluZXIuaWQpO1xyXG5cclxuICAgICAgdGhpcy5kcm9wZG93biA9IE0uRHJvcGRvd24uaW5pdCh0aGlzLmVsLCB7XHJcbiAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICBjbG9zZU9uQ2xpY2s6IGZhbHNlLFxyXG4gICAgICAgIGNvdmVyVHJpZ2dlcjogZmFsc2UsXHJcbiAgICAgICAgb25JdGVtQ2xpY2s6IChpdGVtRWwpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKCQoaXRlbUVsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFNrZXRjaHkgcmVtb3ZhbCBvZiBkcm9wZG93biBjbGljayBoYW5kbGVyXHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRyb3Bkb3duLl9oYW5kbGVDbGlja0JvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBkcm9wZG93blxyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRHJvcGRvd24oKSB7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIElucHV0IEJsdXJcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUlucHV0Qmx1cigpIHtcclxuICAgICAgaWYgKCF0aGlzLl9tb3VzZWRvd24pIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIElucHV0IEtleXVwIGFuZCBGb2N1c1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlSW5wdXRLZXl1cEFuZEZvY3VzKGUpIHtcclxuICAgICAgaWYgKGUudHlwZSA9PT0gJ2tleXVwJykge1xyXG4gICAgICAgIEF1dG9jb21wbGV0ZS5fa2V5ZG93biA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmNvdW50ID0gMDtcclxuICAgICAgbGV0IHZhbCA9IHRoaXMuZWwudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgIC8vIERvbid0IGNhcHR1cmUgZW50ZXIgb3IgYXJyb3cga2V5IHVzYWdlLlxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAxMyB8fCBlLmtleUNvZGUgPT09IDM4IHx8IGUua2V5Q29kZSA9PT0gNDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBpbnB1dCBpc24ndCBlbXB0eVxyXG4gICAgICAvLyBDaGVjayBpZiBmb2N1cyB0cmlnZ2VyZWQgYnkgdGFiXHJcbiAgICAgIGlmICh0aGlzLm9sZFZhbCAhPT0gdmFsICYmIChNLnRhYlByZXNzZWQgfHwgZS50eXBlICE9PSAnZm9jdXMnKSkge1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGRhdGUgb2xkVmFsXHJcbiAgICAgIHRoaXMub2xkVmFsID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIElucHV0IEtleWRvd25cclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUlucHV0S2V5ZG93bihlKSB7XHJcbiAgICAgIEF1dG9jb21wbGV0ZS5fa2V5ZG93biA9IHRydWU7XHJcblxyXG4gICAgICAvLyBBcnJvdyBrZXlzIGFuZCBlbnRlciBrZXkgdXNhZ2VcclxuICAgICAgbGV0IGtleUNvZGUgPSBlLmtleUNvZGUsXHJcbiAgICAgICAgbGlFbGVtZW50LFxyXG4gICAgICAgIG51bUl0ZW1zID0gJCh0aGlzLmNvbnRhaW5lcikuY2hpbGRyZW4oJ2xpJykubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gc2VsZWN0IGVsZW1lbnQgb24gRW50ZXJcclxuICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5FTlRFUiAmJiB0aGlzLmFjdGl2ZUluZGV4ID49IDApIHtcclxuICAgICAgICBsaUVsZW1lbnQgPSAkKHRoaXMuY29udGFpbmVyKVxyXG4gICAgICAgICAgLmNoaWxkcmVuKCdsaScpXHJcbiAgICAgICAgICAuZXEodGhpcy5hY3RpdmVJbmRleCk7XHJcbiAgICAgICAgaWYgKGxpRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKGxpRWxlbWVudCk7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FwdHVyZSB1cCBhbmQgZG93biBrZXlcclxuICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5BUlJPV19VUCB8fCBrZXlDb2RlID09PSBNLmtleXMuQVJST1dfRE9XTikge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5BUlJPV19VUCAmJiB0aGlzLmFjdGl2ZUluZGV4ID4gMCkge1xyXG4gICAgICAgICAgdGhpcy5hY3RpdmVJbmRleC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5BUlJPV19ET1dOICYmIHRoaXMuYWN0aXZlSW5kZXggPCBudW1JdGVtcyAtIDEpIHtcclxuICAgICAgICAgIHRoaXMuYWN0aXZlSW5kZXgrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJGFjdGl2ZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlSW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgdGhpcy4kYWN0aXZlID0gJCh0aGlzLmNvbnRhaW5lcilcclxuICAgICAgICAgICAgLmNoaWxkcmVuKCdsaScpXHJcbiAgICAgICAgICAgIC5lcSh0aGlzLmFjdGl2ZUluZGV4KTtcclxuICAgICAgICAgIHRoaXMuJGFjdGl2ZS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgSW5wdXQgQ2xpY2tcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUlucHV0Q2xpY2soZSkge1xyXG4gICAgICB0aGlzLm9wZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBDb250YWluZXIgTW91c2Vkb3duIGFuZCBUb3VjaHN0YXJ0XHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0KGUpIHtcclxuICAgICAgdGhpcy5fbW91c2Vkb3duID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBDb250YWluZXIgTW91c2V1cCBhbmQgVG91Y2hlbmRcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUNvbnRhaW5lck1vdXNldXBBbmRUb3VjaGVuZChlKSB7XHJcbiAgICAgIHRoaXMuX21vdXNlZG93biA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlnaGxpZ2h0IHBhcnRpYWwgbWF0Y2hcclxuICAgICAqL1xyXG4gICAgX2hpZ2hsaWdodChzdHJpbmcsICRlbCkge1xyXG4gICAgICBsZXQgaW1nID0gJGVsLmZpbmQoJ2ltZycpO1xyXG4gICAgICBsZXQgbWF0Y2hTdGFydCA9ICRlbFxyXG4gICAgICAgICAgLnRleHQoKVxyXG4gICAgICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIC5pbmRleE9mKCcnICsgc3RyaW5nLnRvTG93ZXJDYXNlKCkgKyAnJyksXHJcbiAgICAgICAgbWF0Y2hFbmQgPSBtYXRjaFN0YXJ0ICsgc3RyaW5nLmxlbmd0aCAtIDEsXHJcbiAgICAgICAgYmVmb3JlTWF0Y2ggPSAkZWwudGV4dCgpLnNsaWNlKDAsIG1hdGNoU3RhcnQpLFxyXG4gICAgICAgIG1hdGNoVGV4dCA9ICRlbC50ZXh0KCkuc2xpY2UobWF0Y2hTdGFydCwgbWF0Y2hFbmQgKyAxKSxcclxuICAgICAgICBhZnRlck1hdGNoID0gJGVsLnRleHQoKS5zbGljZShtYXRjaEVuZCArIDEpO1xyXG4gICAgICAkZWwuaHRtbChcclxuICAgICAgICBgPHNwYW4+JHtiZWZvcmVNYXRjaH08c3BhbiBjbGFzcz0naGlnaGxpZ2h0Jz4ke21hdGNoVGV4dH08L3NwYW4+JHthZnRlck1hdGNofTwvc3Bhbj5gXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChpbWcubGVuZ3RoKSB7XHJcbiAgICAgICAgJGVsLnByZXBlbmQoaW1nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzZXQgY3VycmVudCBlbGVtZW50IHBvc2l0aW9uXHJcbiAgICAgKi9cclxuICAgIF9yZXNldEN1cnJlbnRFbGVtZW50KCkge1xyXG4gICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gLTE7XHJcbiAgICAgIHRoaXMuJGFjdGl2ZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNldCBhdXRvY29tcGxldGUgZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgX3Jlc2V0QXV0b2NvbXBsZXRlKCkge1xyXG4gICAgICAkKHRoaXMuY29udGFpbmVyKS5lbXB0eSgpO1xyXG4gICAgICB0aGlzLl9yZXNldEN1cnJlbnRFbGVtZW50KCk7XHJcbiAgICAgIHRoaXMub2xkVmFsID0gbnVsbDtcclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgdGhpcy5fbW91c2Vkb3duID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3QgYXV0b2NvbXBsZXRlIG9wdGlvblxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbCAgQXV0b2NvbXBsZXRlIG9wdGlvbiBsaXN0IGl0ZW0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBzZWxlY3RPcHRpb24oZWwpIHtcclxuICAgICAgbGV0IHRleHQgPSBlbC50ZXh0KCkudHJpbSgpO1xyXG4gICAgICB0aGlzLmVsLnZhbHVlID0gdGV4dDtcclxuICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgIHRoaXMuX3Jlc2V0QXV0b2NvbXBsZXRlKCk7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgIC8vIEhhbmRsZSBvbkF1dG9jb21wbGV0ZSBjYWxsYmFjay5cclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25BdXRvY29tcGxldGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub25BdXRvY29tcGxldGUuY2FsbCh0aGlzLCB0ZXh0KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyIGRyb3Bkb3duIGNvbnRlbnRcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhICBkYXRhIHNldFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbCAgY3VycmVudCBpbnB1dCB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBfcmVuZGVyRHJvcGRvd24oZGF0YSwgdmFsKSB7XHJcbiAgICAgIHRoaXMuX3Jlc2V0QXV0b2NvbXBsZXRlKCk7XHJcblxyXG4gICAgICBsZXQgbWF0Y2hpbmdEYXRhID0gW107XHJcblxyXG4gICAgICAvLyBHYXRoZXIgYWxsIG1hdGNoaW5nIGRhdGFcclxuICAgICAgZm9yIChsZXQga2V5IGluIGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsKSAhPT0gLTEpIHtcclxuICAgICAgICAgIC8vIEJyZWFrIGlmIHBhc3QgbGltaXRcclxuICAgICAgICAgIGlmICh0aGlzLmNvdW50ID49IHRoaXMub3B0aW9ucy5saW1pdCkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgZW50cnkgPSB7XHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFba2V5XSxcclxuICAgICAgICAgICAga2V5OiBrZXlcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBtYXRjaGluZ0RhdGEucHVzaChlbnRyeSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5jb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU29ydFxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnRGdW5jdGlvbikge1xyXG4gICAgICAgIGxldCBzb3J0RnVuY3Rpb25Cb3VuZCA9IChhLCBiKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNvcnRGdW5jdGlvbihcclxuICAgICAgICAgICAgYS5rZXkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgYi5rZXkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgdmFsLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBtYXRjaGluZ0RhdGEuc29ydChzb3J0RnVuY3Rpb25Cb3VuZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbmRlclxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hdGNoaW5nRGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBlbnRyeSA9IG1hdGNoaW5nRGF0YVtpXTtcclxuICAgICAgICBsZXQgJGF1dG9jb21wbGV0ZU9wdGlvbiA9ICQoJzxsaT48L2xpPicpO1xyXG4gICAgICAgIGlmICghIWVudHJ5LmRhdGEpIHtcclxuICAgICAgICAgICRhdXRvY29tcGxldGVPcHRpb24uYXBwZW5kKFxyXG4gICAgICAgICAgICBgPGltZyBzcmM9XCIke2VudHJ5LmRhdGF9XCIgY2xhc3M9XCJyaWdodCBjaXJjbGVcIj48c3Bhbj4ke2VudHJ5LmtleX08L3NwYW4+YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJGF1dG9jb21wbGV0ZU9wdGlvbi5hcHBlbmQoJzxzcGFuPicgKyBlbnRyeS5rZXkgKyAnPC9zcGFuPicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh0aGlzLmNvbnRhaW5lcikuYXBwZW5kKCRhdXRvY29tcGxldGVPcHRpb24pO1xyXG4gICAgICAgIHRoaXMuX2hpZ2hsaWdodCh2YWwsICRhdXRvY29tcGxldGVPcHRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcGVuIEF1dG9jb21wbGV0ZSBEcm9wZG93blxyXG4gICAgICovXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICBsZXQgdmFsID0gdGhpcy5lbC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgdGhpcy5fcmVzZXRBdXRvY29tcGxldGUoKTtcclxuXHJcbiAgICAgIGlmICh2YWwubGVuZ3RoID49IHRoaXMub3B0aW9ucy5taW5MZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyRHJvcGRvd24odGhpcy5vcHRpb25zLmRhdGEsIHZhbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9wZW4gZHJvcGRvd25cclxuICAgICAgaWYgKCF0aGlzLmRyb3Bkb3duLmlzT3Blbikge1xyXG4gICAgICAgIHRoaXMuZHJvcGRvd24ub3BlbigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFJlY2FsY3VsYXRlIGRyb3Bkb3duIHdoZW4gaXRzIGFscmVhZHkgb3BlblxyXG4gICAgICAgIHRoaXMuZHJvcGRvd24ucmVjYWxjdWxhdGVEaW1lbnNpb25zKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIEF1dG9jb21wbGV0ZSBEcm9wZG93blxyXG4gICAgICovXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgdGhpcy5kcm9wZG93bi5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIERhdGFcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZURhdGEoZGF0YSkge1xyXG4gICAgICBsZXQgdmFsID0gdGhpcy5lbC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICB0aGlzLm9wdGlvbnMuZGF0YSA9IGRhdGE7XHJcblxyXG4gICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJEcm9wZG93bihkYXRhLCB2YWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIEF1dG9jb21wbGV0ZVxyXG4gICAqL1xyXG4gIEF1dG9jb21wbGV0ZS5fa2V5ZG93biA9IGZhbHNlO1xyXG5cclxuICBNLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKEF1dG9jb21wbGV0ZSwgJ2F1dG9jb21wbGV0ZScsICdNX0F1dG9jb21wbGV0ZScpO1xyXG4gIH1cclxufSkoY2FzaCk7XHJcbiJdLCJmaWxlIjoiYXV0b2NvbXBsZXRlLmpzIn0=
