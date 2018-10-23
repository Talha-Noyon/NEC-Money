(function($) {
  'use strict';

  let _defaults = {
    classes: '',
    dropdownOptions: {}
  };

  /**
   * @class
   *
   */
  class FormSelect extends Component {
    /**
     * Construct FormSelect instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(FormSelect, el, options);

      // Don't init if browser default version
      if (this.$el.hasClass('browser-default')) {
        return;
      }

      this.el.M_FormSelect = this;

      /**
       * Options for the select
       * @member FormSelect#options
       */
      this.options = $.extend({}, FormSelect.defaults, options);

      this.isMultiple = this.$el.prop('multiple');

      // Setup
      this.el.tabIndex = -1;
      this._keysSelected = {};
      this._valueDict = {}; // Maps key to original and generated option element.
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
      return domElem.M_FormSelect;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeDropdown();
      this.el.M_FormSelect = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleSelectChangeBound = this._handleSelectChange.bind(this);
      this._handleOptionClickBound = this._handleOptionClick.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);

      $(this.dropdownOptions)
        .find('li:not(.optgroup)')
        .each((el) => {
          el.addEventListener('click', this._handleOptionClickBound);
        });
      this.el.addEventListener('change', this._handleSelectChangeBound);
      this.input.addEventListener('click', this._handleInputClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      $(this.dropdownOptions)
        .find('li:not(.optgroup)')
        .each((el) => {
          el.removeEventListener('click', this._handleOptionClickBound);
        });
      this.el.removeEventListener('change', this._handleSelectChangeBound);
      this.input.removeEventListener('click', this._handleInputClickBound);
    }

    /**
     * Handle Select Change
     * @param {Event} e
     */
    _handleSelectChange(e) {
      this._setValueToInput();
    }

    /**
     * Handle Option Click
     * @param {Event} e
     */
    _handleOptionClick(e) {
      e.preventDefault();
      let option = $(e.target).closest('li')[0];
      let key = option.id;
      if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
        let selected = true;

        if (this.isMultiple) {
          // Deselect placeholder option if still selected.
          let placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
          if (placeholderOption.length) {
            placeholderOption.removeClass('selected');
            placeholderOption.find('input[type="checkbox"]').prop('checked', false);
            this._toggleEntryFromArray(placeholderOption[0].id);
          }
          selected = this._toggleEntryFromArray(key);
        } else {
          $(this.dropdownOptions)
            .find('li')
            .removeClass('selected');
          $(option).toggleClass('selected', selected);
        }

        // Set selected on original select option
        // Only trigger if selected state changed
        let prevSelected = $(this._valueDict[key].el).prop('selected');
        if (prevSelected !== selected) {
          $(this._valueDict[key].el).prop('selected', selected);
          this.$el.trigger('change');
        }
      }

      e.stopPropagation();
    }

    /**
     * Handle Input Click
     */
    _handleInputClick() {
      if (this.dropdown && this.dropdown.isOpen) {
        this._setValueToInput();
        this._setSelectedStates();
      }
    }

    /**
     * Setup dropdown
     */
    _setupDropdown() {
      this.wrapper = document.createElement('div');
      $(this.wrapper).addClass('select-wrapper ' + this.options.classes);
      this.$el.before($(this.wrapper));
      this.wrapper.appendChild(this.el);

      if (this.el.disabled) {
        this.wrapper.classList.add('disabled');
      }

      // Create dropdown
      this.$selectOptions = this.$el.children('option, optgroup');
      this.dropdownOptions = document.createElement('ul');
      this.dropdownOptions.id = `select-options-${M.guid()}`;
      $(this.dropdownOptions).addClass(
        'dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : '')
      );

      // Create dropdown structure.
      if (this.$selectOptions.length) {
        this.$selectOptions.each((el) => {
          if ($(el).is('option')) {
            // Direct descendant option.
            let optionEl;
            if (this.isMultiple) {
              optionEl = this._appendOptionWithIcon(this.$el, el, 'multiple');
            } else {
              optionEl = this._appendOptionWithIcon(this.$el, el);
            }

            this._addOptionToValueDict(el, optionEl);
          } else if ($(el).is('optgroup')) {
            // Optgroup.
            let selectOptions = $(el).children('option');
            $(this.dropdownOptions).append(
              $('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]
            );

            selectOptions.each((el) => {
              let optionEl = this._appendOptionWithIcon(this.$el, el, 'optgroup-option');
              this._addOptionToValueDict(el, optionEl);
            });
          }
        });
      }

      this.$el.after(this.dropdownOptions);

      // Add input dropdown
      this.input = document.createElement('input');
      $(this.input).addClass('select-dropdown dropdown-trigger');
      this.input.setAttribute('type', 'text');
      this.input.setAttribute('readonly', 'true');
      this.input.setAttribute('data-target', this.dropdownOptions.id);
      if (this.el.disabled) {
        $(this.input).prop('disabled', 'true');
      }

      this.$el.before(this.input);
      this._setValueToInput();

      // Add caret
      let dropdownIcon = $(
        '<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
      );
      this.$el.before(dropdownIcon[0]);

      // Initialize dropdown
      if (!this.el.disabled) {
        let dropdownOptions = $.extend({}, this.options.dropdownOptions);

        // Add callback for centering selected option when dropdown content is scrollable
        dropdownOptions.onOpenEnd = (el) => {
          let selectedOption = $(this.dropdownOptions)
            .find('.selected')
            .first();

          if (selectedOption.length) {
            // Focus selected option in dropdown
            M.keyDown = true;
            this.dropdown.focusedIndex = selectedOption.index();
            this.dropdown._focusFocusedItem();
            M.keyDown = false;

            // Handle scrolling to selected option
            if (this.dropdown.isScrollable) {
              let scrollOffset =
                selectedOption[0].getBoundingClientRect().top -
                this.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
              scrollOffset -= this.dropdownOptions.clientHeight / 2; // center in dropdown
              this.dropdownOptions.scrollTop = scrollOffset;
            }
          }
        };

        if (this.isMultiple) {
          dropdownOptions.closeOnClick = false;
        }
        this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
      }

      // Add initial selections
      this._setSelectedStates();
    }

    /**
     * Add option to value dict
     * @param {Element} el  original option element
     * @param {Element} optionEl  generated option element
     */
    _addOptionToValueDict(el, optionEl) {
      let index = Object.keys(this._valueDict).length;
      let key = this.dropdownOptions.id + index;
      let obj = {};
      optionEl.id = key;

      obj.el = el;
      obj.optionEl = optionEl;
      this._valueDict[key] = obj;
    }

    /**
     * Remove dropdown
     */
    _removeDropdown() {
      $(this.wrapper)
        .find('.caret')
        .remove();
      $(this.input).remove();
      $(this.dropdownOptions).remove();
      $(this.wrapper).before(this.$el);
      $(this.wrapper).remove();
    }

    /**
     * Setup dropdown
     * @param {Element} select  select element
     * @param {Element} option  option element from select
     * @param {String} type
     * @return {Element}  option element added
     */
    _appendOptionWithIcon(select, option, type) {
      // Add disabled attr if disabled
      let disabledClass = option.disabled ? 'disabled ' : '';
      let optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';
      let multipleCheckbox = this.isMultiple
        ? `<label><input type="checkbox"${disabledClass}"/><span>${option.innerHTML}</span></label>`
        : option.innerHTML;
      let liEl = $('<li></li>');
      let spanEl = $('<span></span>');
      spanEl.html(multipleCheckbox);
      liEl.addClass(`${disabledClass} ${optgroupClass}`);
      liEl.append(spanEl);

      // add icons
      let iconUrl = option.getAttribute('data-icon');
      if (!!iconUrl) {
        let imgEl = $(`<img alt="" src="${iconUrl}">`);
        liEl.prepend(imgEl);
      }

      // Check for multiple type.
      $(this.dropdownOptions).append(liEl[0]);
      return liEl[0];
    }

    /**
     * Toggle entry from option
     * @param {String} key  Option key
     * @return {Boolean}  if entry was added or removed
     */
    _toggleEntryFromArray(key) {
      let notAdded = !this._keysSelected.hasOwnProperty(key);
      let $optionLi = $(this._valueDict[key].optionEl);

      if (notAdded) {
        this._keysSelected[key] = true;
      } else {
        delete this._keysSelected[key];
      }

      $optionLi.toggleClass('selected', notAdded);

      // Set checkbox checked value
      $optionLi.find('input[type="checkbox"]').prop('checked', notAdded);

      // use notAdded instead of true (to detect if the option is selected or not)
      $optionLi.prop('selected', notAdded);

      return notAdded;
    }

    /**
     * Set text value to input
     */
    _setValueToInput() {
      let values = [];
      let options = this.$el.find('option');

      options.each((el) => {
        if ($(el).prop('selected')) {
          let text = $(el).text();
          values.push(text);
        }
      });

      if (!values.length) {
        let firstDisabled = this.$el.find('option:disabled').eq(0);
        if (firstDisabled.length && firstDisabled[0].value === '') {
          values.push(firstDisabled.text());
        }
      }

      this.input.value = values.join(', ');
    }

    /**
     * Set selected state of dropdown to match actual select element
     */
    _setSelectedStates() {
      this._keysSelected = {};

      for (let key in this._valueDict) {
        let option = this._valueDict[key];
        let optionIsSelected = $(option.el).prop('selected');
        $(option.optionEl)
          .find('input[type="checkbox"]')
          .prop('checked', optionIsSelected);
        if (optionIsSelected) {
          this._activateOption($(this.dropdownOptions), $(option.optionEl));
          this._keysSelected[key] = true;
        } else {
          $(option.optionEl).removeClass('selected');
        }
      }
    }

    /**
     * Make option as selected and scroll to selected position
     * @param {jQuery} collection  Select options jQuery element
     * @param {Element} newOption  element of the new option
     */
    _activateOption(collection, newOption) {
      if (newOption) {
        if (!this.isMultiple) {
          collection.find('li.selected').removeClass('selected');
        }
        let option = $(newOption);
        option.addClass('selected');
      }
    }

    /**
     * Get Selected Values
     * @return {Array}  Array of selected values
     */
    getSelectedValues() {
      let selectedValues = [];
      for (let key in this._keysSelected) {
        selectedValues.push(this._valueDict[key].el.value);
      }
      return selectedValues;
    }
  }

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZWxlY3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGxldCBfZGVmYXVsdHMgPSB7XHJcbiAgICBjbGFzc2VzOiAnJyxcclxuICAgIGRyb3Bkb3duT3B0aW9uczoge31cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIEZvcm1TZWxlY3QgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgRm9ybVNlbGVjdCBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihGb3JtU2VsZWN0LCBlbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBEb24ndCBpbml0IGlmIGJyb3dzZXIgZGVmYXVsdCB2ZXJzaW9uXHJcbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnYnJvd3Nlci1kZWZhdWx0JykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZWwuTV9Gb3JtU2VsZWN0ID0gdGhpcztcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcHRpb25zIGZvciB0aGUgc2VsZWN0XHJcbiAgICAgICAqIEBtZW1iZXIgRm9ybVNlbGVjdCNvcHRpb25zXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRm9ybVNlbGVjdC5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmlzTXVsdGlwbGUgPSB0aGlzLiRlbC5wcm9wKCdtdWx0aXBsZScpO1xyXG5cclxuICAgICAgLy8gU2V0dXBcclxuICAgICAgdGhpcy5lbC50YWJJbmRleCA9IC0xO1xyXG4gICAgICB0aGlzLl9rZXlzU2VsZWN0ZWQgPSB7fTtcclxuICAgICAgdGhpcy5fdmFsdWVEaWN0ID0ge307IC8vIE1hcHMga2V5IHRvIG9yaWdpbmFsIGFuZCBnZW5lcmF0ZWQgb3B0aW9uIGVsZW1lbnQuXHJcbiAgICAgIHRoaXMuX3NldHVwRHJvcGRvd24oKTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX0Zvcm1TZWxlY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLl9yZW1vdmVEcm9wZG93bigpO1xyXG4gICAgICB0aGlzLmVsLk1fRm9ybVNlbGVjdCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuX2hhbmRsZVNlbGVjdENoYW5nZUJvdW5kID0gdGhpcy5faGFuZGxlU2VsZWN0Q2hhbmdlLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZU9wdGlvbkNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVPcHRpb25DbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dENsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAkKHRoaXMuZHJvcGRvd25PcHRpb25zKVxyXG4gICAgICAgIC5maW5kKCdsaTpub3QoLm9wdGdyb3VwKScpXHJcbiAgICAgICAgLmVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZU9wdGlvbkNsaWNrQm91bmQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZVNlbGVjdENoYW5nZUJvdW5kKTtcclxuICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpXHJcbiAgICAgICAgLmZpbmQoJ2xpOm5vdCgub3B0Z3JvdXApJylcclxuICAgICAgICAuZWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlT3B0aW9uQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlU2VsZWN0Q2hhbmdlQm91bmQpO1xyXG4gICAgICB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBTZWxlY3QgQ2hhbmdlXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVTZWxlY3RDaGFuZ2UoZSkge1xyXG4gICAgICB0aGlzLl9zZXRWYWx1ZVRvSW5wdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBPcHRpb24gQ2xpY2tcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZU9wdGlvbkNsaWNrKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBsZXQgb3B0aW9uID0gJChlLnRhcmdldCkuY2xvc2VzdCgnbGknKVswXTtcclxuICAgICAgbGV0IGtleSA9IG9wdGlvbi5pZDtcclxuICAgICAgaWYgKCEkKG9wdGlvbikuaGFzQ2xhc3MoJ2Rpc2FibGVkJykgJiYgISQob3B0aW9uKS5oYXNDbGFzcygnb3B0Z3JvdXAnKSAmJiBrZXkubGVuZ3RoKSB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZSkge1xyXG4gICAgICAgICAgLy8gRGVzZWxlY3QgcGxhY2Vob2xkZXIgb3B0aW9uIGlmIHN0aWxsIHNlbGVjdGVkLlxyXG4gICAgICAgICAgbGV0IHBsYWNlaG9sZGVyT3B0aW9uID0gJCh0aGlzLmRyb3Bkb3duT3B0aW9ucykuZmluZCgnbGkuZGlzYWJsZWQuc2VsZWN0ZWQnKTtcclxuICAgICAgICAgIGlmIChwbGFjZWhvbGRlck9wdGlvbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXJPcHRpb24ucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyT3B0aW9uLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RvZ2dsZUVudHJ5RnJvbUFycmF5KHBsYWNlaG9sZGVyT3B0aW9uWzBdLmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNlbGVjdGVkID0gdGhpcy5fdG9nZ2xlRW50cnlGcm9tQXJyYXkoa2V5KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJCh0aGlzLmRyb3Bkb3duT3B0aW9ucylcclxuICAgICAgICAgICAgLmZpbmQoJ2xpJylcclxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgJChvcHRpb24pLnRvZ2dsZUNsYXNzKCdzZWxlY3RlZCcsIHNlbGVjdGVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCBzZWxlY3RlZCBvbiBvcmlnaW5hbCBzZWxlY3Qgb3B0aW9uXHJcbiAgICAgICAgLy8gT25seSB0cmlnZ2VyIGlmIHNlbGVjdGVkIHN0YXRlIGNoYW5nZWRcclxuICAgICAgICBsZXQgcHJldlNlbGVjdGVkID0gJCh0aGlzLl92YWx1ZURpY3Rba2V5XS5lbCkucHJvcCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICBpZiAocHJldlNlbGVjdGVkICE9PSBzZWxlY3RlZCkge1xyXG4gICAgICAgICAgJCh0aGlzLl92YWx1ZURpY3Rba2V5XS5lbCkucHJvcCgnc2VsZWN0ZWQnLCBzZWxlY3RlZCk7XHJcbiAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgSW5wdXQgQ2xpY2tcclxuICAgICAqL1xyXG4gICAgX2hhbmRsZUlucHV0Q2xpY2soKSB7XHJcbiAgICAgIGlmICh0aGlzLmRyb3Bkb3duICYmIHRoaXMuZHJvcGRvd24uaXNPcGVuKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0KCk7XHJcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRTdGF0ZXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgZHJvcGRvd25cclxuICAgICAqL1xyXG4gICAgX3NldHVwRHJvcGRvd24oKSB7XHJcbiAgICAgIHRoaXMud3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAkKHRoaXMud3JhcHBlcikuYWRkQ2xhc3MoJ3NlbGVjdC13cmFwcGVyICcgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcyk7XHJcbiAgICAgIHRoaXMuJGVsLmJlZm9yZSgkKHRoaXMud3JhcHBlcikpO1xyXG4gICAgICB0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQodGhpcy5lbCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5lbC5kaXNhYmxlZCkge1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDcmVhdGUgZHJvcGRvd25cclxuICAgICAgdGhpcy4kc2VsZWN0T3B0aW9ucyA9IHRoaXMuJGVsLmNoaWxkcmVuKCdvcHRpb24sIG9wdGdyb3VwJyk7XHJcbiAgICAgIHRoaXMuZHJvcGRvd25PcHRpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcclxuICAgICAgdGhpcy5kcm9wZG93bk9wdGlvbnMuaWQgPSBgc2VsZWN0LW9wdGlvbnMtJHtNLmd1aWQoKX1gO1xyXG4gICAgICAkKHRoaXMuZHJvcGRvd25PcHRpb25zKS5hZGRDbGFzcyhcclxuICAgICAgICAnZHJvcGRvd24tY29udGVudCBzZWxlY3QtZHJvcGRvd24gJyArICh0aGlzLmlzTXVsdGlwbGUgPyAnbXVsdGlwbGUtc2VsZWN0LWRyb3Bkb3duJyA6ICcnKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGRyb3Bkb3duIHN0cnVjdHVyZS5cclxuICAgICAgaWYgKHRoaXMuJHNlbGVjdE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy4kc2VsZWN0T3B0aW9ucy5lYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCQoZWwpLmlzKCdvcHRpb24nKSkge1xyXG4gICAgICAgICAgICAvLyBEaXJlY3QgZGVzY2VuZGFudCBvcHRpb24uXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25FbDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZSkge1xyXG4gICAgICAgICAgICAgIG9wdGlvbkVsID0gdGhpcy5fYXBwZW5kT3B0aW9uV2l0aEljb24odGhpcy4kZWwsIGVsLCAnbXVsdGlwbGUnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBvcHRpb25FbCA9IHRoaXMuX2FwcGVuZE9wdGlvbldpdGhJY29uKHRoaXMuJGVsLCBlbCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2FkZE9wdGlvblRvVmFsdWVEaWN0KGVsLCBvcHRpb25FbCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCQoZWwpLmlzKCdvcHRncm91cCcpKSB7XHJcbiAgICAgICAgICAgIC8vIE9wdGdyb3VwLlxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0T3B0aW9ucyA9ICQoZWwpLmNoaWxkcmVuKCdvcHRpb24nKTtcclxuICAgICAgICAgICAgJCh0aGlzLmRyb3Bkb3duT3B0aW9ucykuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICQoJzxsaSBjbGFzcz1cIm9wdGdyb3VwXCI+PHNwYW4+JyArIGVsLmdldEF0dHJpYnV0ZSgnbGFiZWwnKSArICc8L3NwYW4+PC9saT4nKVswXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgc2VsZWN0T3B0aW9ucy5lYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgICAgIGxldCBvcHRpb25FbCA9IHRoaXMuX2FwcGVuZE9wdGlvbldpdGhJY29uKHRoaXMuJGVsLCBlbCwgJ29wdGdyb3VwLW9wdGlvbicpO1xyXG4gICAgICAgICAgICAgIHRoaXMuX2FkZE9wdGlvblRvVmFsdWVEaWN0KGVsLCBvcHRpb25FbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLiRlbC5hZnRlcih0aGlzLmRyb3Bkb3duT3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBBZGQgaW5wdXQgZHJvcGRvd25cclxuICAgICAgdGhpcy5pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICQodGhpcy5pbnB1dCkuYWRkQ2xhc3MoJ3NlbGVjdC1kcm9wZG93biBkcm9wZG93bi10cmlnZ2VyJyk7XHJcbiAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQnKTtcclxuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJ3RydWUnKTtcclxuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JywgdGhpcy5kcm9wZG93bk9wdGlvbnMuaWQpO1xyXG4gICAgICBpZiAodGhpcy5lbC5kaXNhYmxlZCkge1xyXG4gICAgICAgICQodGhpcy5pbnB1dCkucHJvcCgnZGlzYWJsZWQnLCAndHJ1ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLiRlbC5iZWZvcmUodGhpcy5pbnB1dCk7XHJcbiAgICAgIHRoaXMuX3NldFZhbHVlVG9JbnB1dCgpO1xyXG5cclxuICAgICAgLy8gQWRkIGNhcmV0XHJcbiAgICAgIGxldCBkcm9wZG93bkljb24gPSAkKFxyXG4gICAgICAgICc8c3ZnIGNsYXNzPVwiY2FyZXRcIiBoZWlnaHQ9XCIyNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNNyAxMGw1IDUgNS01elwiLz48cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPjwvc3ZnPidcclxuICAgICAgKTtcclxuICAgICAgdGhpcy4kZWwuYmVmb3JlKGRyb3Bkb3duSWNvblswXSk7XHJcblxyXG4gICAgICAvLyBJbml0aWFsaXplIGRyb3Bkb3duXHJcbiAgICAgIGlmICghdGhpcy5lbC5kaXNhYmxlZCkge1xyXG4gICAgICAgIGxldCBkcm9wZG93bk9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLmRyb3Bkb3duT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBjYWxsYmFjayBmb3IgY2VudGVyaW5nIHNlbGVjdGVkIG9wdGlvbiB3aGVuIGRyb3Bkb3duIGNvbnRlbnQgaXMgc2Nyb2xsYWJsZVxyXG4gICAgICAgIGRyb3Bkb3duT3B0aW9ucy5vbk9wZW5FbmQgPSAoZWwpID0+IHtcclxuICAgICAgICAgIGxldCBzZWxlY3RlZE9wdGlvbiA9ICQodGhpcy5kcm9wZG93bk9wdGlvbnMpXHJcbiAgICAgICAgICAgIC5maW5kKCcuc2VsZWN0ZWQnKVxyXG4gICAgICAgICAgICAuZmlyc3QoKTtcclxuXHJcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIEZvY3VzIHNlbGVjdGVkIG9wdGlvbiBpbiBkcm9wZG93blxyXG4gICAgICAgICAgICBNLmtleURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmRyb3Bkb3duLmZvY3VzZWRJbmRleCA9IHNlbGVjdGVkT3B0aW9uLmluZGV4KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcGRvd24uX2ZvY3VzRm9jdXNlZEl0ZW0oKTtcclxuICAgICAgICAgICAgTS5rZXlEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgc2Nyb2xsaW5nIHRvIHNlbGVjdGVkIG9wdGlvblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kcm9wZG93bi5pc1Njcm9sbGFibGUpIHtcclxuICAgICAgICAgICAgICBsZXQgc2Nyb2xsT2Zmc2V0ID1cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3B0aW9uWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3Bkb3duT3B0aW9ucy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7IC8vIHNjcm9sbCB0byBzZWxlY3RlZCBvcHRpb25cclxuICAgICAgICAgICAgICBzY3JvbGxPZmZzZXQgLT0gdGhpcy5kcm9wZG93bk9wdGlvbnMuY2xpZW50SGVpZ2h0IC8gMjsgLy8gY2VudGVyIGluIGRyb3Bkb3duXHJcbiAgICAgICAgICAgICAgdGhpcy5kcm9wZG93bk9wdGlvbnMuc2Nyb2xsVG9wID0gc2Nyb2xsT2Zmc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZSkge1xyXG4gICAgICAgICAgZHJvcGRvd25PcHRpb25zLmNsb3NlT25DbGljayA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyb3Bkb3duID0gTS5Ecm9wZG93bi5pbml0KHRoaXMuaW5wdXQsIGRyb3Bkb3duT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCBpbml0aWFsIHNlbGVjdGlvbnNcclxuICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRTdGF0ZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBvcHRpb24gdG8gdmFsdWUgZGljdFxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbCAgb3JpZ2luYWwgb3B0aW9uIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gb3B0aW9uRWwgIGdlbmVyYXRlZCBvcHRpb24gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBfYWRkT3B0aW9uVG9WYWx1ZURpY3QoZWwsIG9wdGlvbkVsKSB7XHJcbiAgICAgIGxldCBpbmRleCA9IE9iamVjdC5rZXlzKHRoaXMuX3ZhbHVlRGljdCkubGVuZ3RoO1xyXG4gICAgICBsZXQga2V5ID0gdGhpcy5kcm9wZG93bk9wdGlvbnMuaWQgKyBpbmRleDtcclxuICAgICAgbGV0IG9iaiA9IHt9O1xyXG4gICAgICBvcHRpb25FbC5pZCA9IGtleTtcclxuXHJcbiAgICAgIG9iai5lbCA9IGVsO1xyXG4gICAgICBvYmoub3B0aW9uRWwgPSBvcHRpb25FbDtcclxuICAgICAgdGhpcy5fdmFsdWVEaWN0W2tleV0gPSBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgZHJvcGRvd25cclxuICAgICAqL1xyXG4gICAgX3JlbW92ZURyb3Bkb3duKCkge1xyXG4gICAgICAkKHRoaXMud3JhcHBlcilcclxuICAgICAgICAuZmluZCgnLmNhcmV0JylcclxuICAgICAgICAucmVtb3ZlKCk7XHJcbiAgICAgICQodGhpcy5pbnB1dCkucmVtb3ZlKCk7XHJcbiAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpLnJlbW92ZSgpO1xyXG4gICAgICAkKHRoaXMud3JhcHBlcikuYmVmb3JlKHRoaXMuJGVsKTtcclxuICAgICAgJCh0aGlzLndyYXBwZXIpLnJlbW92ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgZHJvcGRvd25cclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gc2VsZWN0ICBzZWxlY3QgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBvcHRpb24gIG9wdGlvbiBlbGVtZW50IGZyb20gc2VsZWN0XHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxyXG4gICAgICogQHJldHVybiB7RWxlbWVudH0gIG9wdGlvbiBlbGVtZW50IGFkZGVkXHJcbiAgICAgKi9cclxuICAgIF9hcHBlbmRPcHRpb25XaXRoSWNvbihzZWxlY3QsIG9wdGlvbiwgdHlwZSkge1xyXG4gICAgICAvLyBBZGQgZGlzYWJsZWQgYXR0ciBpZiBkaXNhYmxlZFxyXG4gICAgICBsZXQgZGlzYWJsZWRDbGFzcyA9IG9wdGlvbi5kaXNhYmxlZCA/ICdkaXNhYmxlZCAnIDogJyc7XHJcbiAgICAgIGxldCBvcHRncm91cENsYXNzID0gdHlwZSA9PT0gJ29wdGdyb3VwLW9wdGlvbicgPyAnb3B0Z3JvdXAtb3B0aW9uICcgOiAnJztcclxuICAgICAgbGV0IG11bHRpcGxlQ2hlY2tib3ggPSB0aGlzLmlzTXVsdGlwbGVcclxuICAgICAgICA/IGA8bGFiZWw+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiJHtkaXNhYmxlZENsYXNzfVwiLz48c3Bhbj4ke29wdGlvbi5pbm5lckhUTUx9PC9zcGFuPjwvbGFiZWw+YFxyXG4gICAgICAgIDogb3B0aW9uLmlubmVySFRNTDtcclxuICAgICAgbGV0IGxpRWwgPSAkKCc8bGk+PC9saT4nKTtcclxuICAgICAgbGV0IHNwYW5FbCA9ICQoJzxzcGFuPjwvc3Bhbj4nKTtcclxuICAgICAgc3BhbkVsLmh0bWwobXVsdGlwbGVDaGVja2JveCk7XHJcbiAgICAgIGxpRWwuYWRkQ2xhc3MoYCR7ZGlzYWJsZWRDbGFzc30gJHtvcHRncm91cENsYXNzfWApO1xyXG4gICAgICBsaUVsLmFwcGVuZChzcGFuRWwpO1xyXG5cclxuICAgICAgLy8gYWRkIGljb25zXHJcbiAgICAgIGxldCBpY29uVXJsID0gb3B0aW9uLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uJyk7XHJcbiAgICAgIGlmICghIWljb25VcmwpIHtcclxuICAgICAgICBsZXQgaW1nRWwgPSAkKGA8aW1nIGFsdD1cIlwiIHNyYz1cIiR7aWNvblVybH1cIj5gKTtcclxuICAgICAgICBsaUVsLnByZXBlbmQoaW1nRWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBmb3IgbXVsdGlwbGUgdHlwZS5cclxuICAgICAgJCh0aGlzLmRyb3Bkb3duT3B0aW9ucykuYXBwZW5kKGxpRWxbMF0pO1xyXG4gICAgICByZXR1cm4gbGlFbFswXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZSBlbnRyeSBmcm9tIG9wdGlvblxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgT3B0aW9uIGtleVxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gIGlmIGVudHJ5IHdhcyBhZGRlZCBvciByZW1vdmVkXHJcbiAgICAgKi9cclxuICAgIF90b2dnbGVFbnRyeUZyb21BcnJheShrZXkpIHtcclxuICAgICAgbGV0IG5vdEFkZGVkID0gIXRoaXMuX2tleXNTZWxlY3RlZC5oYXNPd25Qcm9wZXJ0eShrZXkpO1xyXG4gICAgICBsZXQgJG9wdGlvbkxpID0gJCh0aGlzLl92YWx1ZURpY3Rba2V5XS5vcHRpb25FbCk7XHJcblxyXG4gICAgICBpZiAobm90QWRkZWQpIHtcclxuICAgICAgICB0aGlzLl9rZXlzU2VsZWN0ZWRba2V5XSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2tleXNTZWxlY3RlZFtrZXldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkb3B0aW9uTGkudG9nZ2xlQ2xhc3MoJ3NlbGVjdGVkJywgbm90QWRkZWQpO1xyXG5cclxuICAgICAgLy8gU2V0IGNoZWNrYm94IGNoZWNrZWQgdmFsdWVcclxuICAgICAgJG9wdGlvbkxpLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLnByb3AoJ2NoZWNrZWQnLCBub3RBZGRlZCk7XHJcblxyXG4gICAgICAvLyB1c2Ugbm90QWRkZWQgaW5zdGVhZCBvZiB0cnVlICh0byBkZXRlY3QgaWYgdGhlIG9wdGlvbiBpcyBzZWxlY3RlZCBvciBub3QpXHJcbiAgICAgICRvcHRpb25MaS5wcm9wKCdzZWxlY3RlZCcsIG5vdEFkZGVkKTtcclxuXHJcbiAgICAgIHJldHVybiBub3RBZGRlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0ZXh0IHZhbHVlIHRvIGlucHV0XHJcbiAgICAgKi9cclxuICAgIF9zZXRWYWx1ZVRvSW5wdXQoKSB7XHJcbiAgICAgIGxldCB2YWx1ZXMgPSBbXTtcclxuICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLiRlbC5maW5kKCdvcHRpb24nKTtcclxuXHJcbiAgICAgIG9wdGlvbnMuZWFjaCgoZWwpID0+IHtcclxuICAgICAgICBpZiAoJChlbCkucHJvcCgnc2VsZWN0ZWQnKSkge1xyXG4gICAgICAgICAgbGV0IHRleHQgPSAkKGVsKS50ZXh0KCk7XHJcbiAgICAgICAgICB2YWx1ZXMucHVzaCh0ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCF2YWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgbGV0IGZpcnN0RGlzYWJsZWQgPSB0aGlzLiRlbC5maW5kKCdvcHRpb246ZGlzYWJsZWQnKS5lcSgwKTtcclxuICAgICAgICBpZiAoZmlyc3REaXNhYmxlZC5sZW5ndGggJiYgZmlyc3REaXNhYmxlZFswXS52YWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgIHZhbHVlcy5wdXNoKGZpcnN0RGlzYWJsZWQudGV4dCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSB2YWx1ZXMuam9pbignLCAnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzZWxlY3RlZCBzdGF0ZSBvZiBkcm9wZG93biB0byBtYXRjaCBhY3R1YWwgc2VsZWN0IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgX3NldFNlbGVjdGVkU3RhdGVzKCkge1xyXG4gICAgICB0aGlzLl9rZXlzU2VsZWN0ZWQgPSB7fTtcclxuXHJcbiAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLl92YWx1ZURpY3QpIHtcclxuICAgICAgICBsZXQgb3B0aW9uID0gdGhpcy5fdmFsdWVEaWN0W2tleV07XHJcbiAgICAgICAgbGV0IG9wdGlvbklzU2VsZWN0ZWQgPSAkKG9wdGlvbi5lbCkucHJvcCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAkKG9wdGlvbi5vcHRpb25FbClcclxuICAgICAgICAgIC5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxyXG4gICAgICAgICAgLnByb3AoJ2NoZWNrZWQnLCBvcHRpb25Jc1NlbGVjdGVkKTtcclxuICAgICAgICBpZiAob3B0aW9uSXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgdGhpcy5fYWN0aXZhdGVPcHRpb24oJCh0aGlzLmRyb3Bkb3duT3B0aW9ucyksICQob3B0aW9uLm9wdGlvbkVsKSk7XHJcbiAgICAgICAgICB0aGlzLl9rZXlzU2VsZWN0ZWRba2V5XSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICQob3B0aW9uLm9wdGlvbkVsKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1ha2Ugb3B0aW9uIGFzIHNlbGVjdGVkIGFuZCBzY3JvbGwgdG8gc2VsZWN0ZWQgcG9zaXRpb25cclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSBjb2xsZWN0aW9uICBTZWxlY3Qgb3B0aW9ucyBqUXVlcnkgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBuZXdPcHRpb24gIGVsZW1lbnQgb2YgdGhlIG5ldyBvcHRpb25cclxuICAgICAqL1xyXG4gICAgX2FjdGl2YXRlT3B0aW9uKGNvbGxlY3Rpb24sIG5ld09wdGlvbikge1xyXG4gICAgICBpZiAobmV3T3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzTXVsdGlwbGUpIHtcclxuICAgICAgICAgIGNvbGxlY3Rpb24uZmluZCgnbGkuc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG9wdGlvbiA9ICQobmV3T3B0aW9uKTtcclxuICAgICAgICBvcHRpb24uYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBTZWxlY3RlZCBWYWx1ZXNcclxuICAgICAqIEByZXR1cm4ge0FycmF5fSAgQXJyYXkgb2Ygc2VsZWN0ZWQgdmFsdWVzXHJcbiAgICAgKi9cclxuICAgIGdldFNlbGVjdGVkVmFsdWVzKCkge1xyXG4gICAgICBsZXQgc2VsZWN0ZWRWYWx1ZXMgPSBbXTtcclxuICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuX2tleXNTZWxlY3RlZCkge1xyXG4gICAgICAgIHNlbGVjdGVkVmFsdWVzLnB1c2godGhpcy5fdmFsdWVEaWN0W2tleV0uZWwudmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZWxlY3RlZFZhbHVlcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE0uRm9ybVNlbGVjdCA9IEZvcm1TZWxlY3Q7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihGb3JtU2VsZWN0LCAnZm9ybVNlbGVjdCcsICdNX0Zvcm1TZWxlY3QnKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG4iXSwiZmlsZSI6InNlbGVjdC5qcyJ9
