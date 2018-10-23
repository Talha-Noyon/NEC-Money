(function($) {
  'use strict';

  let _defaults = {
    data: [],
    placeholder: '',
    secondaryPlaceholder: '',
    autocompleteOptions: {},
    limit: Infinity,
    onChipAdd: null,
    onChipSelect: null,
    onChipDelete: null
  };

  /**
   * @typedef {Object} chip
   * @property {String} tag  chip tag string
   * @property {String} [image]  chip avatar image string
   */

  /**
   * @class
   *
   */
  class Chips extends Component {
    /**
     * Construct Chips instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Chips, el, options);

      this.el.M_Chips = this;

      /**
       * Options for the modal
       * @member Chips#options
       * @prop {Array} data
       * @prop {String} placeholder
       * @prop {String} secondaryPlaceholder
       * @prop {Object} autocompleteOptions
       */
      this.options = $.extend({}, Chips.defaults, options);

      this.$el.addClass('chips input-field');
      this.chipsData = [];
      this.$chips = $();
      this._setupInput();
      this.hasAutocomplete = Object.keys(this.options.autocompleteOptions).length > 0;

      // Set input id
      if (!this.$input.attr('id')) {
        this.$input.attr('id', M.guid());
      }

      // Render initial chips
      if (this.options.data.length) {
        this.chipsData = this.options.data;
        this._renderChips(this.chipsData);
      }

      // Setup autocomplete if needed
      if (this.hasAutocomplete) {
        this._setupAutocomplete();
      }

      this._setPlaceholder();
      this._setupLabel();
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
      return domElem.M_Chips;
    }

    /**
     * Get Chips Data
     */
    getData() {
      return this.chipsData;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.$chips.remove();
      this.el.M_Chips = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleChipClickBound = this._handleChipClick.bind(this);
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputFocusBound = this._handleInputFocus.bind(this);
      this._handleInputBlurBound = this._handleInputBlur.bind(this);

      this.el.addEventListener('click', this._handleChipClickBound);
      document.addEventListener('keydown', Chips._handleChipsKeydown);
      document.addEventListener('keyup', Chips._handleChipsKeyup);
      this.el.addEventListener('blur', Chips._handleChipsBlur, true);
      this.$input[0].addEventListener('focus', this._handleInputFocusBound);
      this.$input[0].addEventListener('blur', this._handleInputBlurBound);
      this.$input[0].addEventListener('keydown', this._handleInputKeydownBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleChipClickBound);
      document.removeEventListener('keydown', Chips._handleChipsKeydown);
      document.removeEventListener('keyup', Chips._handleChipsKeyup);
      this.el.removeEventListener('blur', Chips._handleChipsBlur, true);
      this.$input[0].removeEventListener('focus', this._handleInputFocusBound);
      this.$input[0].removeEventListener('blur', this._handleInputBlurBound);
      this.$input[0].removeEventListener('keydown', this._handleInputKeydownBound);
    }

    /**
     * Handle Chip Click
     * @param {Event} e
     */
    _handleChipClick(e) {
      let $chip = $(e.target).closest('.chip');
      let clickedClose = $(e.target).is('.close');
      if ($chip.length) {
        let index = $chip.index();
        if (clickedClose) {
          // delete chip
          this.deleteChip(index);
          this.$input[0].focus();
        } else {
          // select chip
          this.selectChip(index);
        }

        // Default handle click to focus on input
      } else {
        this.$input[0].focus();
      }
    }

    /**
     * Handle Chips Keydown
     * @param {Event} e
     */
    static _handleChipsKeydown(e) {
      Chips._keydown = true;

      let $chips = $(e.target).closest('.chips');
      let chipsKeydown = e.target && $chips.length;

      // Don't handle keydown inputs on input and textarea
      if ($(e.target).is('input, textarea') || !chipsKeydown) {
        return;
      }

      let currChips = $chips[0].M_Chips;

      // backspace and delete
      if (e.keyCode === 8 || e.keyCode === 46) {
        e.preventDefault();

        let selectIndex = currChips.chipsData.length;
        if (currChips._selectedChip) {
          let index = currChips._selectedChip.index();
          currChips.deleteChip(index);
          currChips._selectedChip = null;

          // Make sure selectIndex doesn't go negative
          selectIndex = Math.max(index - 1, 0);
        }

        if (currChips.chipsData.length) {
          currChips.selectChip(selectIndex);
        }

        // left arrow key
      } else if (e.keyCode === 37) {
        if (currChips._selectedChip) {
          let selectIndex = currChips._selectedChip.index() - 1;
          if (selectIndex < 0) {
            return;
          }
          currChips.selectChip(selectIndex);
        }

        // right arrow key
      } else if (e.keyCode === 39) {
        if (currChips._selectedChip) {
          let selectIndex = currChips._selectedChip.index() + 1;

          if (selectIndex >= currChips.chipsData.length) {
            currChips.$input[0].focus();
          } else {
            currChips.selectChip(selectIndex);
          }
        }
      }
    }

    /**
     * Handle Chips Keyup
     * @param {Event} e
     */
    static _handleChipsKeyup(e) {
      Chips._keydown = false;
    }

    /**
     * Handle Chips Blur
     * @param {Event} e
     */
    static _handleChipsBlur(e) {
      if (!Chips._keydown) {
        let $chips = $(e.target).closest('.chips');
        let currChips = $chips[0].M_Chips;

        currChips._selectedChip = null;
      }
    }

    /**
     * Handle Input Focus
     */
    _handleInputFocus() {
      this.$el.addClass('focus');
    }

    /**
     * Handle Input Blur
     */
    _handleInputBlur() {
      this.$el.removeClass('focus');
    }

    /**
     * Handle Input Keydown
     * @param {Event} e
     */
    _handleInputKeydown(e) {
      Chips._keydown = true;

      // enter
      if (e.keyCode === 13) {
        // Override enter if autocompleting.
        if (this.hasAutocomplete && this.autocomplete && this.autocomplete.isOpen) {
          return;
        }

        e.preventDefault();
        this.addChip({
          tag: this.$input[0].value
        });
        this.$input[0].value = '';

        // delete or left
      } else if (
        (e.keyCode === 8 || e.keyCode === 37) &&
        this.$input[0].value === '' &&
        this.chipsData.length
      ) {
        e.preventDefault();
        this.selectChip(this.chipsData.length - 1);
      }
    }

    /**
     * Render Chip
     * @param {chip} chip
     * @return {Element}
     */
    _renderChip(chip) {
      if (!chip.tag) {
        return;
      }

      let renderedChip = document.createElement('div');
      let closeIcon = document.createElement('i');
      renderedChip.classList.add('chip');
      renderedChip.textContent = chip.tag;
      renderedChip.setAttribute('tabindex', 0);
      $(closeIcon).addClass('material-icons close');
      closeIcon.textContent = 'close';

      // attach image if needed
      if (chip.image) {
        let img = document.createElement('img');
        img.setAttribute('src', chip.image);
        renderedChip.insertBefore(img, renderedChip.firstChild);
      }

      renderedChip.appendChild(closeIcon);
      return renderedChip;
    }

    /**
     * Render Chips
     */
    _renderChips() {
      this.$chips.remove();
      for (let i = 0; i < this.chipsData.length; i++) {
        let chipEl = this._renderChip(this.chipsData[i]);
        this.$el.append(chipEl);
        this.$chips.add(chipEl);
      }

      // move input to end
      this.$el.append(this.$input[0]);
    }

    /**
     * Setup Autocomplete
     */
    _setupAutocomplete() {
      this.options.autocompleteOptions.onAutocomplete = (val) => {
        this.addChip({
          tag: val
        });
        this.$input[0].value = '';
        this.$input[0].focus();
      };

      this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
    }

    /**
     * Setup Input
     */
    _setupInput() {
      this.$input = this.$el.find('input');
      if (!this.$input.length) {
        this.$input = $('<input></input>');
        this.$el.append(this.$input);
      }

      this.$input.addClass('input');
    }

    /**
     * Setup Label
     */
    _setupLabel() {
      this.$label = this.$el.find('label');
      if (this.$label.length) {
        this.$label.setAttribute('for', this.$input.attr('id'));
      }
    }

    /**
     * Set placeholder
     */
    _setPlaceholder() {
      if (this.chipsData !== undefined && !this.chipsData.length && this.options.placeholder) {
        $(this.$input).prop('placeholder', this.options.placeholder);
      } else if (
        (this.chipsData === undefined || !!this.chipsData.length) &&
        this.options.secondaryPlaceholder
      ) {
        $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
      }
    }

    /**
     * Check if chip is valid
     * @param {chip} chip
     */
    _isValid(chip) {
      if (chip.hasOwnProperty('tag') && chip.tag !== '') {
        let exists = false;
        for (let i = 0; i < this.chipsData.length; i++) {
          if (this.chipsData[i].tag === chip.tag) {
            exists = true;
            break;
          }
        }
        return !exists;
      }

      return false;
    }

    /**
     * Add chip
     * @param {chip} chip
     */
    addChip(chip) {
      if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) {
        return;
      }

      let renderedChip = this._renderChip(chip);
      this.$chips.add(renderedChip);
      this.chipsData.push(chip);
      $(this.$input).before(renderedChip);
      this._setPlaceholder();

      // fire chipAdd callback
      if (typeof this.options.onChipAdd === 'function') {
        this.options.onChipAdd.call(this, this.$el, renderedChip);
      }
    }

    /**
     * Delete chip
     * @param {Number} chip
     */
    deleteChip(chipIndex) {
      let $chip = this.$chips.eq(chipIndex);
      this.$chips.eq(chipIndex).remove();
      this.$chips = this.$chips.filter(function(el) {
        return $(el).index() >= 0;
      });
      this.chipsData.splice(chipIndex, 1);
      this._setPlaceholder();

      // fire chipDelete callback
      if (typeof this.options.onChipDelete === 'function') {
        this.options.onChipDelete.call(this, this.$el, $chip[0]);
      }
    }

    /**
     * Select chip
     * @param {Number} chip
     */
    selectChip(chipIndex) {
      let $chip = this.$chips.eq(chipIndex);
      this._selectedChip = $chip;
      $chip[0].focus();

      // fire chipSelect callback
      if (typeof this.options.onChipSelect === 'function') {
        this.options.onChipSelect.call(this, this.$el, $chip[0]);
      }
    }
  }

  /**
   * @static
   * @memberof Chips
   */
  Chips._keydown = false;

  M.Chips = Chips;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
  }

  $(document).ready(function() {
    // Handle removal of static chips.
    $(document.body).on('click', '.chip .close', function() {
      let $chips = $(this).closest('.chips');
      if ($chips.length && $chips[0].M_Chips) {
        return;
      }
      $(this)
        .closest('.chip')
        .remove();
    });
  });
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjaGlwcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgbGV0IF9kZWZhdWx0cyA9IHtcclxuICAgIGRhdGE6IFtdLFxyXG4gICAgcGxhY2Vob2xkZXI6ICcnLFxyXG4gICAgc2Vjb25kYXJ5UGxhY2Vob2xkZXI6ICcnLFxyXG4gICAgYXV0b2NvbXBsZXRlT3B0aW9uczoge30sXHJcbiAgICBsaW1pdDogSW5maW5pdHksXHJcbiAgICBvbkNoaXBBZGQ6IG51bGwsXHJcbiAgICBvbkNoaXBTZWxlY3Q6IG51bGwsXHJcbiAgICBvbkNoaXBEZWxldGU6IG51bGxcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBjaGlwXHJcbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IHRhZyAgY2hpcCB0YWcgc3RyaW5nXHJcbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IFtpbWFnZV0gIGNoaXAgYXZhdGFyIGltYWdlIHN0cmluZ1xyXG4gICAqL1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIENoaXBzIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IENoaXBzIGluc3RhbmNlIGFuZCBzZXQgdXAgb3ZlcmxheVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihDaGlwcywgZWwsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5lbC5NX0NoaXBzID0gdGhpcztcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcHRpb25zIGZvciB0aGUgbW9kYWxcclxuICAgICAgICogQG1lbWJlciBDaGlwcyNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtBcnJheX0gZGF0YVxyXG4gICAgICAgKiBAcHJvcCB7U3RyaW5nfSBwbGFjZWhvbGRlclxyXG4gICAgICAgKiBAcHJvcCB7U3RyaW5nfSBzZWNvbmRhcnlQbGFjZWhvbGRlclxyXG4gICAgICAgKiBAcHJvcCB7T2JqZWN0fSBhdXRvY29tcGxldGVPcHRpb25zXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ2hpcHMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2NoaXBzIGlucHV0LWZpZWxkJyk7XHJcbiAgICAgIHRoaXMuY2hpcHNEYXRhID0gW107XHJcbiAgICAgIHRoaXMuJGNoaXBzID0gJCgpO1xyXG4gICAgICB0aGlzLl9zZXR1cElucHV0KCk7XHJcbiAgICAgIHRoaXMuaGFzQXV0b2NvbXBsZXRlID0gT2JqZWN0LmtleXModGhpcy5vcHRpb25zLmF1dG9jb21wbGV0ZU9wdGlvbnMpLmxlbmd0aCA+IDA7XHJcblxyXG4gICAgICAvLyBTZXQgaW5wdXQgaWRcclxuICAgICAgaWYgKCF0aGlzLiRpbnB1dC5hdHRyKCdpZCcpKSB7XHJcbiAgICAgICAgdGhpcy4kaW5wdXQuYXR0cignaWQnLCBNLmd1aWQoKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbmRlciBpbml0aWFsIGNoaXBzXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGF0YS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmNoaXBzRGF0YSA9IHRoaXMub3B0aW9ucy5kYXRhO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckNoaXBzKHRoaXMuY2hpcHNEYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0dXAgYXV0b2NvbXBsZXRlIGlmIG5lZWRlZFxyXG4gICAgICBpZiAodGhpcy5oYXNBdXRvY29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLl9zZXR1cEF1dG9jb21wbGV0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9zZXRQbGFjZWhvbGRlcigpO1xyXG4gICAgICB0aGlzLl9zZXR1cExhYmVsKCk7XHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX0NoaXBzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IENoaXBzIERhdGFcclxuICAgICAqL1xyXG4gICAgZ2V0RGF0YSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2hpcHNEYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy4kY2hpcHMucmVtb3ZlKCk7XHJcbiAgICAgIHRoaXMuZWwuTV9DaGlwcyA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNoaXBDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlQ2hpcENsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0Rm9jdXNCb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0Rm9jdXMuYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5faGFuZGxlSW5wdXRCbHVyQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dEJsdXIuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDaGlwQ2xpY2tCb3VuZCk7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBDaGlwcy5faGFuZGxlQ2hpcHNLZXlkb3duKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBDaGlwcy5faGFuZGxlQ2hpcHNLZXl1cCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIENoaXBzLl9oYW5kbGVDaGlwc0JsdXIsIHRydWUpO1xyXG4gICAgICB0aGlzLiRpbnB1dFswXS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2hhbmRsZUlucHV0Rm9jdXNCb3VuZCk7XHJcbiAgICAgIHRoaXMuJGlucHV0WzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVJbnB1dEJsdXJCb3VuZCk7XHJcbiAgICAgIHRoaXMuJGlucHV0WzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDaGlwQ2xpY2tCb3VuZCk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBDaGlwcy5faGFuZGxlQ2hpcHNLZXlkb3duKTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBDaGlwcy5faGFuZGxlQ2hpcHNLZXl1cCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIENoaXBzLl9oYW5kbGVDaGlwc0JsdXIsIHRydWUpO1xyXG4gICAgICB0aGlzLiRpbnB1dFswXS5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2hhbmRsZUlucHV0Rm9jdXNCb3VuZCk7XHJcbiAgICAgIHRoaXMuJGlucHV0WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVJbnB1dEJsdXJCb3VuZCk7XHJcbiAgICAgIHRoaXMuJGlucHV0WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgQ2hpcCBDbGlja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICovXHJcbiAgICBfaGFuZGxlQ2hpcENsaWNrKGUpIHtcclxuICAgICAgbGV0ICRjaGlwID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmNoaXAnKTtcclxuICAgICAgbGV0IGNsaWNrZWRDbG9zZSA9ICQoZS50YXJnZXQpLmlzKCcuY2xvc2UnKTtcclxuICAgICAgaWYgKCRjaGlwLmxlbmd0aCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9ICRjaGlwLmluZGV4KCk7XHJcbiAgICAgICAgaWYgKGNsaWNrZWRDbG9zZSkge1xyXG4gICAgICAgICAgLy8gZGVsZXRlIGNoaXBcclxuICAgICAgICAgIHRoaXMuZGVsZXRlQ2hpcChpbmRleCk7XHJcbiAgICAgICAgICB0aGlzLiRpbnB1dFswXS5mb2N1cygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBzZWxlY3QgY2hpcFxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RDaGlwKGluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERlZmF1bHQgaGFuZGxlIGNsaWNrIHRvIGZvY3VzIG9uIGlucHV0XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy4kaW5wdXRbMF0uZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIENoaXBzIEtleWRvd25cclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9oYW5kbGVDaGlwc0tleWRvd24oZSkge1xyXG4gICAgICBDaGlwcy5fa2V5ZG93biA9IHRydWU7XHJcblxyXG4gICAgICBsZXQgJGNoaXBzID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmNoaXBzJyk7XHJcbiAgICAgIGxldCBjaGlwc0tleWRvd24gPSBlLnRhcmdldCAmJiAkY2hpcHMubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gRG9uJ3QgaGFuZGxlIGtleWRvd24gaW5wdXRzIG9uIGlucHV0IGFuZCB0ZXh0YXJlYVxyXG4gICAgICBpZiAoJChlLnRhcmdldCkuaXMoJ2lucHV0LCB0ZXh0YXJlYScpIHx8ICFjaGlwc0tleWRvd24pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBjdXJyQ2hpcHMgPSAkY2hpcHNbMF0uTV9DaGlwcztcclxuXHJcbiAgICAgIC8vIGJhY2tzcGFjZSBhbmQgZGVsZXRlXHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDggfHwgZS5rZXlDb2RlID09PSA0Nikge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGVjdEluZGV4ID0gY3VyckNoaXBzLmNoaXBzRGF0YS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwKSB7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSBjdXJyQ2hpcHMuX3NlbGVjdGVkQ2hpcC5pbmRleCgpO1xyXG4gICAgICAgICAgY3VyckNoaXBzLmRlbGV0ZUNoaXAoaW5kZXgpO1xyXG4gICAgICAgICAgY3VyckNoaXBzLl9zZWxlY3RlZENoaXAgPSBudWxsO1xyXG5cclxuICAgICAgICAgIC8vIE1ha2Ugc3VyZSBzZWxlY3RJbmRleCBkb2Vzbid0IGdvIG5lZ2F0aXZlXHJcbiAgICAgICAgICBzZWxlY3RJbmRleCA9IE1hdGgubWF4KGluZGV4IC0gMSwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VyckNoaXBzLmNoaXBzRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgIGN1cnJDaGlwcy5zZWxlY3RDaGlwKHNlbGVjdEluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGxlZnQgYXJyb3cga2V5XHJcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzNykge1xyXG4gICAgICAgIGlmIChjdXJyQ2hpcHMuX3NlbGVjdGVkQ2hpcCkge1xyXG4gICAgICAgICAgbGV0IHNlbGVjdEluZGV4ID0gY3VyckNoaXBzLl9zZWxlY3RlZENoaXAuaW5kZXgoKSAtIDE7XHJcbiAgICAgICAgICBpZiAoc2VsZWN0SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGN1cnJDaGlwcy5zZWxlY3RDaGlwKHNlbGVjdEluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJpZ2h0IGFycm93IGtleVxyXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMzkpIHtcclxuICAgICAgICBpZiAoY3VyckNoaXBzLl9zZWxlY3RlZENoaXApIHtcclxuICAgICAgICAgIGxldCBzZWxlY3RJbmRleCA9IGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwLmluZGV4KCkgKyAxO1xyXG5cclxuICAgICAgICAgIGlmIChzZWxlY3RJbmRleCA+PSBjdXJyQ2hpcHMuY2hpcHNEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjdXJyQ2hpcHMuJGlucHV0WzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyQ2hpcHMuc2VsZWN0Q2hpcChzZWxlY3RJbmRleCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgQ2hpcHMgS2V5dXBcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9oYW5kbGVDaGlwc0tleXVwKGUpIHtcclxuICAgICAgQ2hpcHMuX2tleWRvd24gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBDaGlwcyBCbHVyXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfaGFuZGxlQ2hpcHNCbHVyKGUpIHtcclxuICAgICAgaWYgKCFDaGlwcy5fa2V5ZG93bikge1xyXG4gICAgICAgIGxldCAkY2hpcHMgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuY2hpcHMnKTtcclxuICAgICAgICBsZXQgY3VyckNoaXBzID0gJGNoaXBzWzBdLk1fQ2hpcHM7XHJcblxyXG4gICAgICAgIGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIElucHV0IEZvY3VzXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVJbnB1dEZvY3VzKCkge1xyXG4gICAgICB0aGlzLiRlbC5hZGRDbGFzcygnZm9jdXMnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBJbnB1dCBCbHVyXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVJbnB1dEJsdXIoKSB7XHJcbiAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdmb2N1cycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIElucHV0IEtleWRvd25cclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUlucHV0S2V5ZG93bihlKSB7XHJcbiAgICAgIENoaXBzLl9rZXlkb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGVudGVyXHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgLy8gT3ZlcnJpZGUgZW50ZXIgaWYgYXV0b2NvbXBsZXRpbmcuXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzQXV0b2NvbXBsZXRlICYmIHRoaXMuYXV0b2NvbXBsZXRlICYmIHRoaXMuYXV0b2NvbXBsZXRlLmlzT3Blbikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpcCh7XHJcbiAgICAgICAgICB0YWc6IHRoaXMuJGlucHV0WzBdLnZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kaW5wdXRbMF0udmFsdWUgPSAnJztcclxuXHJcbiAgICAgICAgLy8gZGVsZXRlIG9yIGxlZnRcclxuICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAoZS5rZXlDb2RlID09PSA4IHx8IGUua2V5Q29kZSA9PT0gMzcpICYmXHJcbiAgICAgICAgdGhpcy4kaW5wdXRbMF0udmFsdWUgPT09ICcnICYmXHJcbiAgICAgICAgdGhpcy5jaGlwc0RhdGEubGVuZ3RoXHJcbiAgICAgICkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLnNlbGVjdENoaXAodGhpcy5jaGlwc0RhdGEubGVuZ3RoIC0gMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlciBDaGlwXHJcbiAgICAgKiBAcGFyYW0ge2NoaXB9IGNoaXBcclxuICAgICAqIEByZXR1cm4ge0VsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIF9yZW5kZXJDaGlwKGNoaXApIHtcclxuICAgICAgaWYgKCFjaGlwLnRhZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHJlbmRlcmVkQ2hpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBsZXQgY2xvc2VJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xyXG4gICAgICByZW5kZXJlZENoaXAuY2xhc3NMaXN0LmFkZCgnY2hpcCcpO1xyXG4gICAgICByZW5kZXJlZENoaXAudGV4dENvbnRlbnQgPSBjaGlwLnRhZztcclxuICAgICAgcmVuZGVyZWRDaGlwLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAwKTtcclxuICAgICAgJChjbG9zZUljb24pLmFkZENsYXNzKCdtYXRlcmlhbC1pY29ucyBjbG9zZScpO1xyXG4gICAgICBjbG9zZUljb24udGV4dENvbnRlbnQgPSAnY2xvc2UnO1xyXG5cclxuICAgICAgLy8gYXR0YWNoIGltYWdlIGlmIG5lZWRlZFxyXG4gICAgICBpZiAoY2hpcC5pbWFnZSkge1xyXG4gICAgICAgIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBjaGlwLmltYWdlKTtcclxuICAgICAgICByZW5kZXJlZENoaXAuaW5zZXJ0QmVmb3JlKGltZywgcmVuZGVyZWRDaGlwLmZpcnN0Q2hpbGQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZW5kZXJlZENoaXAuYXBwZW5kQ2hpbGQoY2xvc2VJY29uKTtcclxuICAgICAgcmV0dXJuIHJlbmRlcmVkQ2hpcDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlciBDaGlwc1xyXG4gICAgICovXHJcbiAgICBfcmVuZGVyQ2hpcHMoKSB7XHJcbiAgICAgIHRoaXMuJGNoaXBzLnJlbW92ZSgpO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2hpcHNEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGNoaXBFbCA9IHRoaXMuX3JlbmRlckNoaXAodGhpcy5jaGlwc0RhdGFbaV0pO1xyXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZChjaGlwRWwpO1xyXG4gICAgICAgIHRoaXMuJGNoaXBzLmFkZChjaGlwRWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtb3ZlIGlucHV0IHRvIGVuZFxyXG4gICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5wdXRbMF0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgQXV0b2NvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEF1dG9jb21wbGV0ZSgpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLmF1dG9jb21wbGV0ZU9wdGlvbnMub25BdXRvY29tcGxldGUgPSAodmFsKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlwKHtcclxuICAgICAgICAgIHRhZzogdmFsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kaW5wdXRbMF0udmFsdWUgPSAnJztcclxuICAgICAgICB0aGlzLiRpbnB1dFswXS5mb2N1cygpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5hdXRvY29tcGxldGUgPSBNLkF1dG9jb21wbGV0ZS5pbml0KHRoaXMuJGlucHV0WzBdLCB0aGlzLm9wdGlvbnMuYXV0b2NvbXBsZXRlT3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBJbnB1dFxyXG4gICAgICovXHJcbiAgICBfc2V0dXBJbnB1dCgpIHtcclxuICAgICAgdGhpcy4kaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xyXG4gICAgICBpZiAoIXRoaXMuJGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuJGlucHV0ID0gJCgnPGlucHV0PjwvaW5wdXQ+Jyk7XHJcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kKHRoaXMuJGlucHV0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy4kaW5wdXQuYWRkQ2xhc3MoJ2lucHV0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBMYWJlbFxyXG4gICAgICovXHJcbiAgICBfc2V0dXBMYWJlbCgpIHtcclxuICAgICAgdGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5maW5kKCdsYWJlbCcpO1xyXG4gICAgICBpZiAodGhpcy4kbGFiZWwubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy4kbGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCB0aGlzLiRpbnB1dC5hdHRyKCdpZCcpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHBsYWNlaG9sZGVyXHJcbiAgICAgKi9cclxuICAgIF9zZXRQbGFjZWhvbGRlcigpIHtcclxuICAgICAgaWYgKHRoaXMuY2hpcHNEYXRhICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuY2hpcHNEYXRhLmxlbmd0aCAmJiB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpIHtcclxuICAgICAgICAkKHRoaXMuJGlucHV0KS5wcm9wKCdwbGFjZWhvbGRlcicsIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcik7XHJcbiAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgKHRoaXMuY2hpcHNEYXRhID09PSB1bmRlZmluZWQgfHwgISF0aGlzLmNoaXBzRGF0YS5sZW5ndGgpICYmXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnNlY29uZGFyeVBsYWNlaG9sZGVyXHJcbiAgICAgICkge1xyXG4gICAgICAgICQodGhpcy4kaW5wdXQpLnByb3AoJ3BsYWNlaG9sZGVyJywgdGhpcy5vcHRpb25zLnNlY29uZGFyeVBsYWNlaG9sZGVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgY2hpcCBpcyB2YWxpZFxyXG4gICAgICogQHBhcmFtIHtjaGlwfSBjaGlwXHJcbiAgICAgKi9cclxuICAgIF9pc1ZhbGlkKGNoaXApIHtcclxuICAgICAgaWYgKGNoaXAuaGFzT3duUHJvcGVydHkoJ3RhZycpICYmIGNoaXAudGFnICE9PSAnJykge1xyXG4gICAgICAgIGxldCBleGlzdHMgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2hpcHNEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5jaGlwc0RhdGFbaV0udGFnID09PSBjaGlwLnRhZykge1xyXG4gICAgICAgICAgICBleGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICFleGlzdHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBjaGlwXHJcbiAgICAgKiBAcGFyYW0ge2NoaXB9IGNoaXBcclxuICAgICAqL1xyXG4gICAgYWRkQ2hpcChjaGlwKSB7XHJcbiAgICAgIGlmICghdGhpcy5faXNWYWxpZChjaGlwKSB8fCB0aGlzLmNoaXBzRGF0YS5sZW5ndGggPj0gdGhpcy5vcHRpb25zLmxpbWl0KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgcmVuZGVyZWRDaGlwID0gdGhpcy5fcmVuZGVyQ2hpcChjaGlwKTtcclxuICAgICAgdGhpcy4kY2hpcHMuYWRkKHJlbmRlcmVkQ2hpcCk7XHJcbiAgICAgIHRoaXMuY2hpcHNEYXRhLnB1c2goY2hpcCk7XHJcbiAgICAgICQodGhpcy4kaW5wdXQpLmJlZm9yZShyZW5kZXJlZENoaXApO1xyXG4gICAgICB0aGlzLl9zZXRQbGFjZWhvbGRlcigpO1xyXG5cclxuICAgICAgLy8gZmlyZSBjaGlwQWRkIGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2hpcEFkZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkNoaXBBZGQuY2FsbCh0aGlzLCB0aGlzLiRlbCwgcmVuZGVyZWRDaGlwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVsZXRlIGNoaXBcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjaGlwXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZUNoaXAoY2hpcEluZGV4KSB7XHJcbiAgICAgIGxldCAkY2hpcCA9IHRoaXMuJGNoaXBzLmVxKGNoaXBJbmRleCk7XHJcbiAgICAgIHRoaXMuJGNoaXBzLmVxKGNoaXBJbmRleCkucmVtb3ZlKCk7XHJcbiAgICAgIHRoaXMuJGNoaXBzID0gdGhpcy4kY2hpcHMuZmlsdGVyKGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuICQoZWwpLmluZGV4KCkgPj0gMDtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuY2hpcHNEYXRhLnNwbGljZShjaGlwSW5kZXgsIDEpO1xyXG4gICAgICB0aGlzLl9zZXRQbGFjZWhvbGRlcigpO1xyXG5cclxuICAgICAgLy8gZmlyZSBjaGlwRGVsZXRlIGNhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2hpcERlbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkNoaXBEZWxldGUuY2FsbCh0aGlzLCB0aGlzLiRlbCwgJGNoaXBbMF0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3QgY2hpcFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNoaXBcclxuICAgICAqL1xyXG4gICAgc2VsZWN0Q2hpcChjaGlwSW5kZXgpIHtcclxuICAgICAgbGV0ICRjaGlwID0gdGhpcy4kY2hpcHMuZXEoY2hpcEluZGV4KTtcclxuICAgICAgdGhpcy5fc2VsZWN0ZWRDaGlwID0gJGNoaXA7XHJcbiAgICAgICRjaGlwWzBdLmZvY3VzKCk7XHJcblxyXG4gICAgICAvLyBmaXJlIGNoaXBTZWxlY3QgY2FsbGJhY2tcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DaGlwU2VsZWN0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hpcFNlbGVjdC5jYWxsKHRoaXMsIHRoaXMuJGVsLCAkY2hpcFswXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgQ2hpcHNcclxuICAgKi9cclxuICBDaGlwcy5fa2V5ZG93biA9IGZhbHNlO1xyXG5cclxuICBNLkNoaXBzID0gQ2hpcHM7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihDaGlwcywgJ2NoaXBzJywgJ01fQ2hpcHMnKTtcclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gSGFuZGxlIHJlbW92YWwgb2Ygc3RhdGljIGNoaXBzLlxyXG4gICAgJChkb2N1bWVudC5ib2R5KS5vbignY2xpY2snLCAnLmNoaXAgLmNsb3NlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxldCAkY2hpcHMgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jaGlwcycpO1xyXG4gICAgICBpZiAoJGNoaXBzLmxlbmd0aCAmJiAkY2hpcHNbMF0uTV9DaGlwcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAkKHRoaXMpXHJcbiAgICAgICAgLmNsb3Nlc3QoJy5jaGlwJylcclxuICAgICAgICAucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufSkoY2FzaCk7XHJcbiJdLCJmaWxlIjoiY2hpcHMuanMifQ==
