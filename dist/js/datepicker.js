(function($) {
  'use strict';

  let _defaults = {
    // Close when date is selected
    autoClose: false,

    // the default output format for the input field value
    format: 'mmm dd, yyyy',

    // Used to create date object from current input string
    parse: null,

    // The initial date to view when first opened
    defaultDate: null,

    // Make the `defaultDate` the initial selected value
    setDefaultDate: false,

    disableWeekends: false,

    disableDayFn: null,

    // First day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // The earliest date that can be selected
    minDate: null,
    // Thelatest date that can be selected
    maxDate: null,

    // Number of years either side, or array of upper/lower range
    yearRange: 10,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    startRange: null,
    endRange: null,

    isRTL: false,

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // Render days of the calendar grid that fall in the next or previous month
    showDaysInNextAndPreviousMonths: false,

    // Specify a DOM element to render the calendar in
    container: null,

    // Show clear button
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok',
      previousMonth: '‹',
      nextMonth: '›',
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      monthsShort: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysAbbrev: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    },

    // events array
    events: [],

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null
  };

  /**
   * @class
   *
   */
  class Datepicker extends Component {
    /**
     * Construct Datepicker instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Datepicker, el, options);

      this.el.M_Datepicker = this;

      this.options = $.extend({}, Datepicker.defaults, options);

      // make sure i18n defaults are not lost when only few i18n option properties are passed
      if (!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
        this.options.i18n = $.extend({}, Datepicker.defaults.i18n, options.i18n);
      }

      // Remove time component from minDate and maxDate options
      if (this.options.minDate) this.options.minDate.setHours(0, 0, 0, 0);
      if (this.options.maxDate) this.options.maxDate.setHours(0, 0, 0, 0);

      this.id = M.guid();

      this._setupVariables();
      this._insertHTMLIntoDOM();
      this._setupModal();

      this._setupEventHandlers();

      if (!this.options.defaultDate) {
        this.options.defaultDate = new Date(Date.parse(this.el.value));
      }

      let defDate = this.options.defaultDate;
      if (Datepicker._isDate(defDate)) {
        if (this.options.setDefaultDate) {
          this.setDate(defDate, true);
          this.setInputValue();
        } else {
          this.gotoDate(defDate);
        }
      } else {
        this.gotoDate(new Date());
      }

      /**
       * Describes open/close state of datepicker
       * @type {Boolean}
       */
      this.isOpen = false;
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    static _isDate(obj) {
      return /Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
    }

    static _isWeekend(date) {
      let day = date.getDay();
      return day === 0 || day === 6;
    }

    static _setToStartOfDay(date) {
      if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
    }

    static _getDaysInMonth(year, month) {
      return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
        month
      ];
    }

    static _isLeapYear(year) {
      // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    static _compareDates(a, b) {
      // weak date comparison (use setToStartOfDay(date) to ensure correct result)
      return a.getTime() === b.getTime();
    }

    static _setToStartOfDay(date) {
      if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Datepicker;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.modal.destroy();
      $(this.modalEl).remove();
      this.destroySelects();
      this.el.M_Datepicker = undefined;
    }

    destroySelects() {
      let oldYearSelect = this.calendarEl.querySelector('.orig-select-year');
      if (oldYearSelect) {
        M.FormSelect.getInstance(oldYearSelect).destroy();
      }
      let oldMonthSelect = this.calendarEl.querySelector('.orig-select-month');
      if (oldMonthSelect) {
        M.FormSelect.getInstance(oldMonthSelect).destroy();
      }
    }

    _insertHTMLIntoDOM() {
      if (this.options.showClearBtn) {
        $(this.clearBtn).css({ visibility: '' });
        this.clearBtn.innerHTML = this.options.i18n.clear;
      }

      this.doneBtn.innerHTML = this.options.i18n.done;
      this.cancelBtn.innerHTML = this.options.i18n.cancel;

      if (this.options.container) {
        this.$modalEl.appendTo(this.options.container);
      } else {
        this.$modalEl.insertBefore(this.el);
      }
    }

    _setupModal() {
      this.modalEl.id = 'modal-' + this.id;
      this.modal = M.Modal.init(this.modalEl, {
        onCloseEnd: () => {
          this.isOpen = false;
        }
      });
    }

    toString(format) {
      format = format || this.options.format;
      if (!Datepicker._isDate(this.date)) {
        return '';
      }

      let formatArray = format.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g);
      let formattedDate = formatArray
        .map((label) => {
          if (this.formats[label]) {
            return this.formats[label]();
          }

          return label;
        })
        .join('');
      return formattedDate;
    }

    setDate(date, preventOnSelect) {
      if (!date) {
        this.date = null;
        this._renderDateDisplay();
        return this.draw();
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      }
      if (!Datepicker._isDate(date)) {
        return;
      }

      let min = this.options.minDate,
        max = this.options.maxDate;

      if (Datepicker._isDate(min) && date < min) {
        date = min;
      } else if (Datepicker._isDate(max) && date > max) {
        date = max;
      }

      this.date = new Date(date.getTime());

      this._renderDateDisplay();

      Datepicker._setToStartOfDay(this.date);
      this.gotoDate(this.date);

      if (!preventOnSelect && typeof this.options.onSelect === 'function') {
        this.options.onSelect.call(this, this.date);
      }
    }

    setInputValue() {
      this.el.value = this.toString();
      this.$el.trigger('change', { firedBy: this });
    }

    _renderDateDisplay() {
      let displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
      let i18n = this.options.i18n;
      let day = i18n.weekdaysShort[displayDate.getDay()];
      let month = i18n.monthsShort[displayDate.getMonth()];
      let date = displayDate.getDate();
      this.yearTextEl.innerHTML = displayDate.getFullYear();
      this.dateTextEl.innerHTML = `${day}, ${month} ${date}`;
    }

    /**
     * change view to a specific date
     */
    gotoDate(date) {
      let newCalendar = true;

      if (!Datepicker._isDate(date)) {
        return;
      }

      if (this.calendars) {
        let firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
          lastVisibleDate = new Date(
            this.calendars[this.calendars.length - 1].year,
            this.calendars[this.calendars.length - 1].month,
            1
          ),
          visibleDate = date.getTime();
        // get the end of the month
        lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
        lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
        newCalendar =
          visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
      }

      if (newCalendar) {
        this.calendars = [
          {
            month: date.getMonth(),
            year: date.getFullYear()
          }
        ];
      }

      this.adjustCalendars();
    }

    adjustCalendars() {
      this.calendars[0] = this.adjustCalendar(this.calendars[0]);
      this.draw();
    }

    adjustCalendar(calendar) {
      if (calendar.month < 0) {
        calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
        calendar.month += 12;
      }
      if (calendar.month > 11) {
        calendar.year += Math.floor(Math.abs(calendar.month) / 12);
        calendar.month -= 12;
      }
      return calendar;
    }

    nextMonth() {
      this.calendars[0].month++;
      this.adjustCalendars();
    }

    prevMonth() {
      this.calendars[0].month--;
      this.adjustCalendars();
    }

    render(year, month, randId) {
      let opts = this.options,
        now = new Date(),
        days = Datepicker._getDaysInMonth(year, month),
        before = new Date(year, month, 1).getDay(),
        data = [],
        row = [];
      Datepicker._setToStartOfDay(now);
      if (opts.firstDay > 0) {
        before -= opts.firstDay;
        if (before < 0) {
          before += 7;
        }
      }
      let previousMonth = month === 0 ? 11 : month - 1,
        nextMonth = month === 11 ? 0 : month + 1,
        yearOfPreviousMonth = month === 0 ? year - 1 : year,
        yearOfNextMonth = month === 11 ? year + 1 : year,
        daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
      let cells = days + before,
        after = cells;
      while (after > 7) {
        after -= 7;
      }
      cells += 7 - after;
      let isWeekSelected = false;
      for (let i = 0, r = 0; i < cells; i++) {
        let day = new Date(year, month, 1 + (i - before)),
          isSelected = Datepicker._isDate(this.date)
            ? Datepicker._compareDates(day, this.date)
            : false,
          isToday = Datepicker._compareDates(day, now),
          hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
          isEmpty = i < before || i >= days + before,
          dayNumber = 1 + (i - before),
          monthNumber = month,
          yearNumber = year,
          isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
          isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
          isInRange =
            opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
          isDisabled =
            (opts.minDate && day < opts.minDate) ||
            (opts.maxDate && day > opts.maxDate) ||
            (opts.disableWeekends && Datepicker._isWeekend(day)) ||
            (opts.disableDayFn && opts.disableDayFn(day));

        if (isEmpty) {
          if (i < before) {
            dayNumber = daysInPreviousMonth + dayNumber;
            monthNumber = previousMonth;
            yearNumber = yearOfPreviousMonth;
          } else {
            dayNumber = dayNumber - days;
            monthNumber = nextMonth;
            yearNumber = yearOfNextMonth;
          }
        }

        let dayConfig = {
          day: dayNumber,
          month: monthNumber,
          year: yearNumber,
          hasEvent: hasEvent,
          isSelected: isSelected,
          isToday: isToday,
          isDisabled: isDisabled,
          isEmpty: isEmpty,
          isStartRange: isStartRange,
          isEndRange: isEndRange,
          isInRange: isInRange,
          showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
        };

        row.push(this.renderDay(dayConfig));

        if (++r === 7) {
          data.push(this.renderRow(row, opts.isRTL, isWeekSelected));
          row = [];
          r = 0;
          isWeekSelected = false;
        }
      }
      return this.renderTable(opts, data, randId);
    }

    renderDay(opts) {
      let arr = [];
      let ariaSelected = 'false';
      if (opts.isEmpty) {
        if (opts.showDaysInNextAndPreviousMonths) {
          arr.push('is-outside-current-month');
          arr.push('is-selection-disabled');
        } else {
          return '<td class="is-empty"></td>';
        }
      }
      if (opts.isDisabled) {
        arr.push('is-disabled');
      }

      if (opts.isToday) {
        arr.push('is-today');
      }
      if (opts.isSelected) {
        arr.push('is-selected');
        ariaSelected = 'true';
      }
      if (opts.hasEvent) {
        arr.push('has-event');
      }
      if (opts.isInRange) {
        arr.push('is-inrange');
      }
      if (opts.isStartRange) {
        arr.push('is-startrange');
      }
      if (opts.isEndRange) {
        arr.push('is-endrange');
      }
      return (
        `<td data-day="${opts.day}" class="${arr.join(' ')}" aria-selected="${ariaSelected}">` +
        `<button class="datepicker-day-button" type="button" data-year="${opts.year}" data-month="${
          opts.month
        }" data-day="${opts.day}">${opts.day}</button>` +
        '</td>'
      );
    }

    renderRow(days, isRTL, isRowSelected) {
      return (
        '<tr class="datepicker-row' +
        (isRowSelected ? ' is-selected' : '') +
        '">' +
        (isRTL ? days.reverse() : days).join('') +
        '</tr>'
      );
    }

    renderTable(opts, data, randId) {
      return (
        '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' +
        randId +
        '">' +
        this.renderHead(opts) +
        this.renderBody(data) +
        '</table></div>'
      );
    }

    renderHead(opts) {
      let i,
        arr = [];
      for (i = 0; i < 7; i++) {
        arr.push(
          `<th scope="col"><abbr title="${this.renderDayName(opts, i)}">${this.renderDayName(
            opts,
            i,
            true
          )}</abbr></th>`
        );
      }
      return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
    }

    renderBody(rows) {
      return '<tbody>' + rows.join('') + '</tbody>';
    }

    renderTitle(instance, c, year, month, refYear, randId) {
      let i,
        j,
        arr,
        opts = this.options,
        isMinYear = year === opts.minYear,
        isMaxYear = year === opts.maxYear,
        html =
          '<div id="' +
          randId +
          '" class="datepicker-controls" role="heading" aria-live="assertive">',
        monthHtml,
        yearHtml,
        prev = true,
        next = true;

      for (arr = [], i = 0; i < 12; i++) {
        arr.push(
          '<option value="' +
            (year === refYear ? i - c : 12 + i - c) +
            '"' +
            (i === month ? ' selected="selected"' : '') +
            ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth)
              ? 'disabled="disabled"'
              : '') +
            '>' +
            opts.i18n.months[i] +
            '</option>'
        );
      }

      monthHtml =
        '<select class="datepicker-select orig-select-month" tabindex="-1">' +
        arr.join('') +
        '</select>';

      if ($.isArray(opts.yearRange)) {
        i = opts.yearRange[0];
        j = opts.yearRange[1] + 1;
      } else {
        i = year - opts.yearRange;
        j = 1 + year + opts.yearRange;
      }

      for (arr = []; i < j && i <= opts.maxYear; i++) {
        if (i >= opts.minYear) {
          arr.push(`<option value="${i}" ${i === year ? 'selected="selected"' : ''}>${i}</option>`);
        }
      }

      yearHtml = `<select class="datepicker-select orig-select-year" tabindex="-1">${arr.join(
        ''
      )}</select>`;

      let leftArrow =
        '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
      html += `<button class="month-prev${
        prev ? '' : ' is-disabled'
      }" type="button">${leftArrow}</button>`;

      html += '<div class="selects-container">';
      if (opts.showMonthAfterYear) {
        html += yearHtml + monthHtml;
      } else {
        html += monthHtml + yearHtml;
      }
      html += '</div>';

      if (isMinYear && (month === 0 || opts.minMonth >= month)) {
        prev = false;
      }

      if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
        next = false;
      }

      let rightArrow =
        '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
      html += `<button class="month-next${
        next ? '' : ' is-disabled'
      }" type="button">${rightArrow}</button>`;

      return (html += '</div>');
    }

    /**
     * refresh the HTML
     */
    draw(force) {
      if (!this.isOpen && !force) {
        return;
      }
      let opts = this.options,
        minYear = opts.minYear,
        maxYear = opts.maxYear,
        minMonth = opts.minMonth,
        maxMonth = opts.maxMonth,
        html = '',
        randId;

      if (this._y <= minYear) {
        this._y = minYear;
        if (!isNaN(minMonth) && this._m < minMonth) {
          this._m = minMonth;
        }
      }
      if (this._y >= maxYear) {
        this._y = maxYear;
        if (!isNaN(maxMonth) && this._m > maxMonth) {
          this._m = maxMonth;
        }
      }

      randId =
        'datepicker-title-' +
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 2);

      for (let c = 0; c < 1; c++) {
        this._renderDateDisplay();
        html +=
          this.renderTitle(
            this,
            c,
            this.calendars[c].year,
            this.calendars[c].month,
            this.calendars[0].year,
            randId
          ) + this.render(this.calendars[c].year, this.calendars[c].month, randId);
      }

      this.destroySelects();

      this.calendarEl.innerHTML = html;

      // Init Materialize Select
      let yearSelect = this.calendarEl.querySelector('.orig-select-year');
      let monthSelect = this.calendarEl.querySelector('.orig-select-month');
      M.FormSelect.init(yearSelect, {
        classes: 'select-year',
        dropdownOptions: { container: document.body, constrainWidth: false }
      });
      M.FormSelect.init(monthSelect, {
        classes: 'select-month',
        dropdownOptions: { container: document.body, constrainWidth: false }
      });

      // Add change handlers for select
      yearSelect.addEventListener('change', this._handleYearChange.bind(this));
      monthSelect.addEventListener('change', this._handleMonthChange.bind(this));

      if (typeof this.options.onDraw === 'function') {
        this.options.onDraw(this);
      }
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this._handleInputChangeBound = this._handleInputChange.bind(this);
      this._handleCalendarClickBound = this._handleCalendarClick.bind(this);
      this._finishSelectionBound = this._finishSelection.bind(this);
      this._handleMonthChange = this._handleMonthChange.bind(this);
      this._closeBound = this.close.bind(this);

      this.el.addEventListener('click', this._handleInputClickBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.el.addEventListener('change', this._handleInputChangeBound);
      this.calendarEl.addEventListener('click', this._handleCalendarClickBound);
      this.doneBtn.addEventListener('click', this._finishSelectionBound);
      this.cancelBtn.addEventListener('click', this._closeBound);

      if (this.options.showClearBtn) {
        this._handleClearClickBound = this._handleClearClick.bind(this);
        this.clearBtn.addEventListener('click', this._handleClearClickBound);
      }
    }

    _setupVariables() {
      this.$modalEl = $(Datepicker._template);
      this.modalEl = this.$modalEl[0];

      this.calendarEl = this.modalEl.querySelector('.datepicker-calendar');

      this.yearTextEl = this.modalEl.querySelector('.year-text');
      this.dateTextEl = this.modalEl.querySelector('.date-text');
      if (this.options.showClearBtn) {
        this.clearBtn = this.modalEl.querySelector('.datepicker-clear');
      }
      this.doneBtn = this.modalEl.querySelector('.datepicker-done');
      this.cancelBtn = this.modalEl.querySelector('.datepicker-cancel');

      this.formats = {
        d: () => {
          return this.date.getDate();
        },
        dd: () => {
          let d = this.date.getDate();
          return (d < 10 ? '0' : '') + d;
        },
        ddd: () => {
          return this.options.i18n.weekdaysShort[this.date.getDay()];
        },
        dddd: () => {
          return this.options.i18n.weekdays[this.date.getDay()];
        },
        m: () => {
          return this.date.getMonth() + 1;
        },
        mm: () => {
          let m = this.date.getMonth() + 1;
          return (m < 10 ? '0' : '') + m;
        },
        mmm: () => {
          return this.options.i18n.monthsShort[this.date.getMonth()];
        },
        mmmm: () => {
          return this.options.i18n.months[this.date.getMonth()];
        },
        yy: () => {
          return ('' + this.date.getFullYear()).slice(2);
        },
        yyyy: () => {
          return this.date.getFullYear();
        }
      };
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleInputClickBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      this.el.removeEventListener('change', this._handleInputChangeBound);
      this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
    }

    _handleInputClick() {
      this.open();
    }

    _handleInputKeydown(e) {
      if (e.which === M.keys.ENTER) {
        e.preventDefault();
        this.open();
      }
    }

    _handleCalendarClick(e) {
      if (!this.isOpen) {
        return;
      }

      let $target = $(e.target);
      if (!$target.hasClass('is-disabled')) {
        if (
          $target.hasClass('datepicker-day-button') &&
          !$target.hasClass('is-empty') &&
          !$target.parent().hasClass('is-disabled')
        ) {
          this.setDate(
            new Date(
              e.target.getAttribute('data-year'),
              e.target.getAttribute('data-month'),
              e.target.getAttribute('data-day')
            )
          );
          if (this.options.autoClose) {
            this._finishSelection();
          }
        } else if ($target.closest('.month-prev').length) {
          this.prevMonth();
        } else if ($target.closest('.month-next').length) {
          this.nextMonth();
        }
      }
    }

    _handleClearClick() {
      this.date = null;
      this.setInputValue();
      this.close();
    }

    _handleMonthChange(e) {
      this.gotoMonth(e.target.value);
    }

    _handleYearChange(e) {
      this.gotoYear(e.target.value);
    }

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth(month) {
      if (!isNaN(month)) {
        this.calendars[0].month = parseInt(month, 10);
        this.adjustCalendars();
      }
    }

    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear(year) {
      if (!isNaN(year)) {
        this.calendars[0].year = parseInt(year, 10);
        this.adjustCalendars();
      }
    }

    _handleInputChange(e) {
      let date;

      // Prevent change event from being fired when triggered by the plugin
      if (e.firedBy === this) {
        return;
      }
      if (this.options.parse) {
        date = this.options.parse(this.el.value, this.options.format);
      } else {
        date = new Date(Date.parse(this.el.value));
      }

      if (Datepicker._isDate(date)) {
        this.setDate(date);
      }
    }

    renderDayName(opts, day, abbr) {
      day += opts.firstDay;
      while (day >= 7) {
        day -= 7;
      }
      return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
    }

    /**
     * Set input value to the selected date and close Datepicker
     */
    _finishSelection() {
      this.setInputValue();
      this.close();
    }

    /**
     * Open Datepicker
     */
    open() {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen.call(this);
      }
      this.draw();
      this.modal.open();
      return this;
    }

    /**
     * Close Datepicker
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      if (typeof this.options.onClose === 'function') {
        this.options.onClose.call(this);
      }
      this.modal.close();
      return this;
    }
  }

  Datepicker._template = [
    '<div class= "modal datepicker-modal">',
    '<div class="modal-content datepicker-container">',
    '<div class="datepicker-date-display">',
    '<span class="year-text"></span>',
    '<span class="date-text"></span>',
    '</div>',
    '<div class="datepicker-calendar-container">',
    '<div class="datepicker-calendar"></div>',
    '<div class="datepicker-footer">',
    '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>',
    '<div class="confirmation-btns">',
    '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>',
    '<button class="btn-flat datepicker-done waves-effect" type="button"></button>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('');

  M.Datepicker = Datepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXRlcGlja2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgLy8gQ2xvc2Ugd2hlbiBkYXRlIGlzIHNlbGVjdGVkXHJcbiAgICBhdXRvQ2xvc2U6IGZhbHNlLFxyXG5cclxuICAgIC8vIHRoZSBkZWZhdWx0IG91dHB1dCBmb3JtYXQgZm9yIHRoZSBpbnB1dCBmaWVsZCB2YWx1ZVxyXG4gICAgZm9ybWF0OiAnbW1tIGRkLCB5eXl5JyxcclxuXHJcbiAgICAvLyBVc2VkIHRvIGNyZWF0ZSBkYXRlIG9iamVjdCBmcm9tIGN1cnJlbnQgaW5wdXQgc3RyaW5nXHJcbiAgICBwYXJzZTogbnVsbCxcclxuXHJcbiAgICAvLyBUaGUgaW5pdGlhbCBkYXRlIHRvIHZpZXcgd2hlbiBmaXJzdCBvcGVuZWRcclxuICAgIGRlZmF1bHREYXRlOiBudWxsLFxyXG5cclxuICAgIC8vIE1ha2UgdGhlIGBkZWZhdWx0RGF0ZWAgdGhlIGluaXRpYWwgc2VsZWN0ZWQgdmFsdWVcclxuICAgIHNldERlZmF1bHREYXRlOiBmYWxzZSxcclxuXHJcbiAgICBkaXNhYmxlV2Vla2VuZHM6IGZhbHNlLFxyXG5cclxuICAgIGRpc2FibGVEYXlGbjogbnVsbCxcclxuXHJcbiAgICAvLyBGaXJzdCBkYXkgb2Ygd2VlayAoMDogU3VuZGF5LCAxOiBNb25kYXkgZXRjKVxyXG4gICAgZmlyc3REYXk6IDAsXHJcblxyXG4gICAgLy8gVGhlIGVhcmxpZXN0IGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcclxuICAgIG1pbkRhdGU6IG51bGwsXHJcbiAgICAvLyBUaGVsYXRlc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxyXG4gICAgbWF4RGF0ZTogbnVsbCxcclxuXHJcbiAgICAvLyBOdW1iZXIgb2YgeWVhcnMgZWl0aGVyIHNpZGUsIG9yIGFycmF5IG9mIHVwcGVyL2xvd2VyIHJhbmdlXHJcbiAgICB5ZWFyUmFuZ2U6IDEwLFxyXG5cclxuICAgIC8vIHVzZWQgaW50ZXJuYWxseSAoZG9uJ3QgY29uZmlnIG91dHNpZGUpXHJcbiAgICBtaW5ZZWFyOiAwLFxyXG4gICAgbWF4WWVhcjogOTk5OSxcclxuICAgIG1pbk1vbnRoOiB1bmRlZmluZWQsXHJcbiAgICBtYXhNb250aDogdW5kZWZpbmVkLFxyXG5cclxuICAgIHN0YXJ0UmFuZ2U6IG51bGwsXHJcbiAgICBlbmRSYW5nZTogbnVsbCxcclxuXHJcbiAgICBpc1JUTDogZmFsc2UsXHJcblxyXG4gICAgLy8gUmVuZGVyIHRoZSBtb250aCBhZnRlciB5ZWFyIGluIHRoZSBjYWxlbmRhciB0aXRsZVxyXG4gICAgc2hvd01vbnRoQWZ0ZXJZZWFyOiBmYWxzZSxcclxuXHJcbiAgICAvLyBSZW5kZXIgZGF5cyBvZiB0aGUgY2FsZW5kYXIgZ3JpZCB0aGF0IGZhbGwgaW4gdGhlIG5leHQgb3IgcHJldmlvdXMgbW9udGhcclxuICAgIHNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHM6IGZhbHNlLFxyXG5cclxuICAgIC8vIFNwZWNpZnkgYSBET00gZWxlbWVudCB0byByZW5kZXIgdGhlIGNhbGVuZGFyIGluXHJcbiAgICBjb250YWluZXI6IG51bGwsXHJcblxyXG4gICAgLy8gU2hvdyBjbGVhciBidXR0b25cclxuICAgIHNob3dDbGVhckJ0bjogZmFsc2UsXHJcblxyXG4gICAgLy8gaW50ZXJuYXRpb25hbGl6YXRpb25cclxuICAgIGkxOG46IHtcclxuICAgICAgY2FuY2VsOiAnQ2FuY2VsJyxcclxuICAgICAgY2xlYXI6ICdDbGVhcicsXHJcbiAgICAgIGRvbmU6ICdPaycsXHJcbiAgICAgIHByZXZpb3VzTW9udGg6ICfigLknLFxyXG4gICAgICBuZXh0TW9udGg6ICfigLonLFxyXG4gICAgICBtb250aHM6IFtcclxuICAgICAgICAnSmFudWFyeScsXHJcbiAgICAgICAgJ0ZlYnJ1YXJ5JyxcclxuICAgICAgICAnTWFyY2gnLFxyXG4gICAgICAgICdBcHJpbCcsXHJcbiAgICAgICAgJ01heScsXHJcbiAgICAgICAgJ0p1bmUnLFxyXG4gICAgICAgICdKdWx5JyxcclxuICAgICAgICAnQXVndXN0JyxcclxuICAgICAgICAnU2VwdGVtYmVyJyxcclxuICAgICAgICAnT2N0b2JlcicsXHJcbiAgICAgICAgJ05vdmVtYmVyJyxcclxuICAgICAgICAnRGVjZW1iZXInXHJcbiAgICAgIF0sXHJcbiAgICAgIG1vbnRoc1Nob3J0OiBbXHJcbiAgICAgICAgJ0phbicsXHJcbiAgICAgICAgJ0ZlYicsXHJcbiAgICAgICAgJ01hcicsXHJcbiAgICAgICAgJ0FwcicsXHJcbiAgICAgICAgJ01heScsXHJcbiAgICAgICAgJ0p1bicsXHJcbiAgICAgICAgJ0p1bCcsXHJcbiAgICAgICAgJ0F1ZycsXHJcbiAgICAgICAgJ1NlcCcsXHJcbiAgICAgICAgJ09jdCcsXHJcbiAgICAgICAgJ05vdicsXHJcbiAgICAgICAgJ0RlYydcclxuICAgICAgXSxcclxuICAgICAgd2Vla2RheXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcclxuICAgICAgd2Vla2RheXNTaG9ydDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXSxcclxuICAgICAgd2Vla2RheXNBYmJyZXY6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGV2ZW50cyBhcnJheVxyXG4gICAgZXZlbnRzOiBbXSxcclxuXHJcbiAgICAvLyBjYWxsYmFjayBmdW5jdGlvblxyXG4gICAgb25TZWxlY3Q6IG51bGwsXHJcbiAgICBvbk9wZW46IG51bGwsXHJcbiAgICBvbkNsb3NlOiBudWxsLFxyXG4gICAgb25EcmF3OiBudWxsXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuICBjbGFzcyBEYXRlcGlja2VyIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IERhdGVwaWNrZXIgaW5zdGFuY2UgYW5kIHNldCB1cCBvdmVybGF5XHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKERhdGVwaWNrZXIsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9EYXRlcGlja2VyID0gdGhpcztcclxuXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEYXRlcGlja2VyLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBpMThuIGRlZmF1bHRzIGFyZSBub3QgbG9zdCB3aGVuIG9ubHkgZmV3IGkxOG4gb3B0aW9uIHByb3BlcnRpZXMgYXJlIHBhc3NlZFxyXG4gICAgICBpZiAoISFvcHRpb25zICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2kxOG4nKSAmJiB0eXBlb2Ygb3B0aW9ucy5pMThuID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5pMThuID0gJC5leHRlbmQoe30sIERhdGVwaWNrZXIuZGVmYXVsdHMuaTE4biwgb3B0aW9ucy5pMThuKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRpbWUgY29tcG9uZW50IGZyb20gbWluRGF0ZSBhbmQgbWF4RGF0ZSBvcHRpb25zXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubWluRGF0ZSkgdGhpcy5vcHRpb25zLm1pbkRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubWF4RGF0ZSkgdGhpcy5vcHRpb25zLm1heERhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcblxyXG4gICAgICB0aGlzLmlkID0gTS5ndWlkKCk7XHJcblxyXG4gICAgICB0aGlzLl9zZXR1cFZhcmlhYmxlcygpO1xyXG4gICAgICB0aGlzLl9pbnNlcnRIVE1MSW50b0RPTSgpO1xyXG4gICAgICB0aGlzLl9zZXR1cE1vZGFsKCk7XHJcblxyXG4gICAgICB0aGlzLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmRlZmF1bHREYXRlKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRlZmF1bHREYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZSh0aGlzLmVsLnZhbHVlKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBkZWZEYXRlID0gdGhpcy5vcHRpb25zLmRlZmF1bHREYXRlO1xyXG4gICAgICBpZiAoRGF0ZXBpY2tlci5faXNEYXRlKGRlZkRhdGUpKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zZXREZWZhdWx0RGF0ZSkge1xyXG4gICAgICAgICAgdGhpcy5zZXREYXRlKGRlZkRhdGUsIHRydWUpO1xyXG4gICAgICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZ290b0RhdGUoZGVmRGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZ290b0RhdGUobmV3IERhdGUoKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBEZXNjcmliZXMgb3Blbi9jbG9zZSBzdGF0ZSBvZiBkYXRlcGlja2VyXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKCkge1xyXG4gICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gc3VwZXIuaW5pdCh0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBfaXNEYXRlKG9iaikge1xyXG4gICAgICByZXR1cm4gL0RhdGUvLnRlc3QoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpICYmICFpc05hTihvYmouZ2V0VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgX2lzV2Vla2VuZChkYXRlKSB7XHJcbiAgICAgIGxldCBkYXkgPSBkYXRlLmdldERheSgpO1xyXG4gICAgICByZXR1cm4gZGF5ID09PSAwIHx8IGRheSA9PT0gNjtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgX3NldFRvU3RhcnRPZkRheShkYXRlKSB7XHJcbiAgICAgIGlmIChEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIF9nZXREYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xyXG4gICAgICByZXR1cm4gWzMxLCBEYXRlcGlja2VyLl9pc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdW1xyXG4gICAgICAgIG1vbnRoXHJcbiAgICAgIF07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIF9pc0xlYXBZZWFyKHllYXIpIHtcclxuICAgICAgLy8gc29sdXRpb24gYnkgTWF0dGkgVmlya2t1bmVuOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS80ODgxOTUxXHJcbiAgICAgIHJldHVybiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCkgfHwgeWVhciAlIDQwMCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgX2NvbXBhcmVEYXRlcyhhLCBiKSB7XHJcbiAgICAgIC8vIHdlYWsgZGF0ZSBjb21wYXJpc29uICh1c2Ugc2V0VG9TdGFydE9mRGF5KGRhdGUpIHRvIGVuc3VyZSBjb3JyZWN0IHJlc3VsdClcclxuICAgICAgcmV0dXJuIGEuZ2V0VGltZSgpID09PSBiLmdldFRpbWUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgX3NldFRvU3RhcnRPZkRheShkYXRlKSB7XHJcbiAgICAgIGlmIChEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX0RhdGVwaWNrZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLm1vZGFsLmRlc3Ryb3koKTtcclxuICAgICAgJCh0aGlzLm1vZGFsRWwpLnJlbW92ZSgpO1xyXG4gICAgICB0aGlzLmRlc3Ryb3lTZWxlY3RzKCk7XHJcbiAgICAgIHRoaXMuZWwuTV9EYXRlcGlja2VyID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lTZWxlY3RzKCkge1xyXG4gICAgICBsZXQgb2xkWWVhclNlbGVjdCA9IHRoaXMuY2FsZW5kYXJFbC5xdWVyeVNlbGVjdG9yKCcub3JpZy1zZWxlY3QteWVhcicpO1xyXG4gICAgICBpZiAob2xkWWVhclNlbGVjdCkge1xyXG4gICAgICAgIE0uRm9ybVNlbGVjdC5nZXRJbnN0YW5jZShvbGRZZWFyU2VsZWN0KS5kZXN0cm95KCk7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IG9sZE1vbnRoU2VsZWN0ID0gdGhpcy5jYWxlbmRhckVsLnF1ZXJ5U2VsZWN0b3IoJy5vcmlnLXNlbGVjdC1tb250aCcpO1xyXG4gICAgICBpZiAob2xkTW9udGhTZWxlY3QpIHtcclxuICAgICAgICBNLkZvcm1TZWxlY3QuZ2V0SW5zdGFuY2Uob2xkTW9udGhTZWxlY3QpLmRlc3Ryb3koKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9pbnNlcnRIVE1MSW50b0RPTSgpIHtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Q2xlYXJCdG4pIHtcclxuICAgICAgICAkKHRoaXMuY2xlYXJCdG4pLmNzcyh7IHZpc2liaWxpdHk6ICcnIH0pO1xyXG4gICAgICAgIHRoaXMuY2xlYXJCdG4uaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLmkxOG4uY2xlYXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZG9uZUJ0bi5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuaTE4bi5kb25lO1xyXG4gICAgICB0aGlzLmNhbmNlbEJ0bi5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuaTE4bi5jYW5jZWw7XHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRhaW5lcikge1xyXG4gICAgICAgIHRoaXMuJG1vZGFsRWwuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy4kbW9kYWxFbC5pbnNlcnRCZWZvcmUodGhpcy5lbCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfc2V0dXBNb2RhbCgpIHtcclxuICAgICAgdGhpcy5tb2RhbEVsLmlkID0gJ21vZGFsLScgKyB0aGlzLmlkO1xyXG4gICAgICB0aGlzLm1vZGFsID0gTS5Nb2RhbC5pbml0KHRoaXMubW9kYWxFbCwge1xyXG4gICAgICAgIG9uQ2xvc2VFbmQ6ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0b1N0cmluZyhmb3JtYXQpIHtcclxuICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8IHRoaXMub3B0aW9ucy5mb3JtYXQ7XHJcbiAgICAgIGlmICghRGF0ZXBpY2tlci5faXNEYXRlKHRoaXMuZGF0ZSkpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBmb3JtYXRBcnJheSA9IGZvcm1hdC5zcGxpdCgvKGR7MSw0fXxtezEsNH18eXs0fXx5eXwhLikvZyk7XHJcbiAgICAgIGxldCBmb3JtYXR0ZWREYXRlID0gZm9ybWF0QXJyYXlcclxuICAgICAgICAubWFwKChsYWJlbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHRoaXMuZm9ybWF0c1tsYWJlbF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0c1tsYWJlbF0oKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gbGFiZWw7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuam9pbignJyk7XHJcbiAgICAgIHJldHVybiBmb3JtYXR0ZWREYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERhdGUoZGF0ZSwgcHJldmVudE9uU2VsZWN0KSB7XHJcbiAgICAgIGlmICghZGF0ZSkge1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyRGF0ZURpc3BsYXkoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5kcmF3KCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBkYXRlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKGRhdGUpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIURhdGVwaWNrZXIuX2lzRGF0ZShkYXRlKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG1pbiA9IHRoaXMub3B0aW9ucy5taW5EYXRlLFxyXG4gICAgICAgIG1heCA9IHRoaXMub3B0aW9ucy5tYXhEYXRlO1xyXG5cclxuICAgICAgaWYgKERhdGVwaWNrZXIuX2lzRGF0ZShtaW4pICYmIGRhdGUgPCBtaW4pIHtcclxuICAgICAgICBkYXRlID0gbWluO1xyXG4gICAgICB9IGVsc2UgaWYgKERhdGVwaWNrZXIuX2lzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcclxuICAgICAgICBkYXRlID0gbWF4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XHJcblxyXG4gICAgICB0aGlzLl9yZW5kZXJEYXRlRGlzcGxheSgpO1xyXG5cclxuICAgICAgRGF0ZXBpY2tlci5fc2V0VG9TdGFydE9mRGF5KHRoaXMuZGF0ZSk7XHJcbiAgICAgIHRoaXMuZ290b0RhdGUodGhpcy5kYXRlKTtcclxuXHJcbiAgICAgIGlmICghcHJldmVudE9uU2VsZWN0ICYmIHR5cGVvZiB0aGlzLm9wdGlvbnMub25TZWxlY3QgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub25TZWxlY3QuY2FsbCh0aGlzLCB0aGlzLmRhdGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW5wdXRWYWx1ZSgpIHtcclxuICAgICAgdGhpcy5lbC52YWx1ZSA9IHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJywgeyBmaXJlZEJ5OiB0aGlzIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9yZW5kZXJEYXRlRGlzcGxheSgpIHtcclxuICAgICAgbGV0IGRpc3BsYXlEYXRlID0gRGF0ZXBpY2tlci5faXNEYXRlKHRoaXMuZGF0ZSkgPyB0aGlzLmRhdGUgOiBuZXcgRGF0ZSgpO1xyXG4gICAgICBsZXQgaTE4biA9IHRoaXMub3B0aW9ucy5pMThuO1xyXG4gICAgICBsZXQgZGF5ID0gaTE4bi53ZWVrZGF5c1Nob3J0W2Rpc3BsYXlEYXRlLmdldERheSgpXTtcclxuICAgICAgbGV0IG1vbnRoID0gaTE4bi5tb250aHNTaG9ydFtkaXNwbGF5RGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgbGV0IGRhdGUgPSBkaXNwbGF5RGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgIHRoaXMueWVhclRleHRFbC5pbm5lckhUTUwgPSBkaXNwbGF5RGF0ZS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICB0aGlzLmRhdGVUZXh0RWwuaW5uZXJIVE1MID0gYCR7ZGF5fSwgJHttb250aH0gJHtkYXRlfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgdmlldyB0byBhIHNwZWNpZmljIGRhdGVcclxuICAgICAqL1xyXG4gICAgZ290b0RhdGUoZGF0ZSkge1xyXG4gICAgICBsZXQgbmV3Q2FsZW5kYXIgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xyXG4gICAgICAgIGxldCBmaXJzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgsIDEpLFxyXG4gICAgICAgICAgbGFzdFZpc2libGVEYXRlID0gbmV3IERhdGUoXHJcbiAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLnllYXIsXHJcbiAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJzW3RoaXMuY2FsZW5kYXJzLmxlbmd0aCAtIDFdLm1vbnRoLFxyXG4gICAgICAgICAgICAxXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgdmlzaWJsZURhdGUgPSBkYXRlLmdldFRpbWUoKTtcclxuICAgICAgICAvLyBnZXQgdGhlIGVuZCBvZiB0aGUgbW9udGhcclxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0TW9udGgobGFzdFZpc2libGVEYXRlLmdldE1vbnRoKCkgKyAxKTtcclxuICAgICAgICBsYXN0VmlzaWJsZURhdGUuc2V0RGF0ZShsYXN0VmlzaWJsZURhdGUuZ2V0RGF0ZSgpIC0gMSk7XHJcbiAgICAgICAgbmV3Q2FsZW5kYXIgPVxyXG4gICAgICAgICAgdmlzaWJsZURhdGUgPCBmaXJzdFZpc2libGVEYXRlLmdldFRpbWUoKSB8fCBsYXN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIDwgdmlzaWJsZURhdGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuZXdDYWxlbmRhcikge1xyXG4gICAgICAgIHRoaXMuY2FsZW5kYXJzID0gW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcclxuICAgICAgICAgIH1cclxuICAgICAgICBdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkanVzdENhbGVuZGFycygpIHtcclxuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSB0aGlzLmFkanVzdENhbGVuZGFyKHRoaXMuY2FsZW5kYXJzWzBdKTtcclxuICAgICAgdGhpcy5kcmF3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRqdXN0Q2FsZW5kYXIoY2FsZW5kYXIpIHtcclxuICAgICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xyXG4gICAgICAgIGNhbGVuZGFyLnllYXIgLT0gTWF0aC5jZWlsKE1hdGguYWJzKGNhbGVuZGFyLm1vbnRoKSAvIDEyKTtcclxuICAgICAgICBjYWxlbmRhci5tb250aCArPSAxMjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY2FsZW5kYXIubW9udGggPiAxMSkge1xyXG4gICAgICAgIGNhbGVuZGFyLnllYXIgKz0gTWF0aC5mbG9vcihNYXRoLmFicyhjYWxlbmRhci5tb250aCkgLyAxMik7XHJcbiAgICAgICAgY2FsZW5kYXIubW9udGggLT0gMTI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNhbGVuZGFyO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRNb250aCgpIHtcclxuICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgrKztcclxuICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmV2TW9udGgoKSB7XHJcbiAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLm1vbnRoLS07XHJcbiAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcclxuICAgICAgbGV0IG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgbm93ID0gbmV3IERhdGUoKSxcclxuICAgICAgICBkYXlzID0gRGF0ZXBpY2tlci5fZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpLFxyXG4gICAgICAgIGJlZm9yZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKS5nZXREYXkoKSxcclxuICAgICAgICBkYXRhID0gW10sXHJcbiAgICAgICAgcm93ID0gW107XHJcbiAgICAgIERhdGVwaWNrZXIuX3NldFRvU3RhcnRPZkRheShub3cpO1xyXG4gICAgICBpZiAob3B0cy5maXJzdERheSA+IDApIHtcclxuICAgICAgICBiZWZvcmUgLT0gb3B0cy5maXJzdERheTtcclxuICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xyXG4gICAgICAgICAgYmVmb3JlICs9IDc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBwcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyAxMSA6IG1vbnRoIC0gMSxcclxuICAgICAgICBuZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyAwIDogbW9udGggKyAxLFxyXG4gICAgICAgIHllYXJPZlByZXZpb3VzTW9udGggPSBtb250aCA9PT0gMCA/IHllYXIgLSAxIDogeWVhcixcclxuICAgICAgICB5ZWFyT2ZOZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyB5ZWFyICsgMSA6IHllYXIsXHJcbiAgICAgICAgZGF5c0luUHJldmlvdXNNb250aCA9IERhdGVwaWNrZXIuX2dldERheXNJbk1vbnRoKHllYXJPZlByZXZpb3VzTW9udGgsIHByZXZpb3VzTW9udGgpO1xyXG4gICAgICBsZXQgY2VsbHMgPSBkYXlzICsgYmVmb3JlLFxyXG4gICAgICAgIGFmdGVyID0gY2VsbHM7XHJcbiAgICAgIHdoaWxlIChhZnRlciA+IDcpIHtcclxuICAgICAgICBhZnRlciAtPSA3O1xyXG4gICAgICB9XHJcbiAgICAgIGNlbGxzICs9IDcgLSBhZnRlcjtcclxuICAgICAgbGV0IGlzV2Vla1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwLCByID0gMDsgaSA8IGNlbGxzOyBpKyspIHtcclxuICAgICAgICBsZXQgZGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEgKyAoaSAtIGJlZm9yZSkpLFxyXG4gICAgICAgICAgaXNTZWxlY3RlZCA9IERhdGVwaWNrZXIuX2lzRGF0ZSh0aGlzLmRhdGUpXHJcbiAgICAgICAgICAgID8gRGF0ZXBpY2tlci5fY29tcGFyZURhdGVzKGRheSwgdGhpcy5kYXRlKVxyXG4gICAgICAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgaXNUb2RheSA9IERhdGVwaWNrZXIuX2NvbXBhcmVEYXRlcyhkYXksIG5vdyksXHJcbiAgICAgICAgICBoYXNFdmVudCA9IG9wdHMuZXZlbnRzLmluZGV4T2YoZGF5LnRvRGF0ZVN0cmluZygpKSAhPT0gLTEgPyB0cnVlIDogZmFsc2UsXHJcbiAgICAgICAgICBpc0VtcHR5ID0gaSA8IGJlZm9yZSB8fCBpID49IGRheXMgKyBiZWZvcmUsXHJcbiAgICAgICAgICBkYXlOdW1iZXIgPSAxICsgKGkgLSBiZWZvcmUpLFxyXG4gICAgICAgICAgbW9udGhOdW1iZXIgPSBtb250aCxcclxuICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyLFxyXG4gICAgICAgICAgaXNTdGFydFJhbmdlID0gb3B0cy5zdGFydFJhbmdlICYmIERhdGVwaWNrZXIuX2NvbXBhcmVEYXRlcyhvcHRzLnN0YXJ0UmFuZ2UsIGRheSksXHJcbiAgICAgICAgICBpc0VuZFJhbmdlID0gb3B0cy5lbmRSYW5nZSAmJiBEYXRlcGlja2VyLl9jb21wYXJlRGF0ZXMob3B0cy5lbmRSYW5nZSwgZGF5KSxcclxuICAgICAgICAgIGlzSW5SYW5nZSA9XHJcbiAgICAgICAgICAgIG9wdHMuc3RhcnRSYW5nZSAmJiBvcHRzLmVuZFJhbmdlICYmIG9wdHMuc3RhcnRSYW5nZSA8IGRheSAmJiBkYXkgPCBvcHRzLmVuZFJhbmdlLFxyXG4gICAgICAgICAgaXNEaXNhYmxlZCA9XHJcbiAgICAgICAgICAgIChvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlKSB8fFxyXG4gICAgICAgICAgICAob3B0cy5tYXhEYXRlICYmIGRheSA+IG9wdHMubWF4RGF0ZSkgfHxcclxuICAgICAgICAgICAgKG9wdHMuZGlzYWJsZVdlZWtlbmRzICYmIERhdGVwaWNrZXIuX2lzV2Vla2VuZChkYXkpKSB8fFxyXG4gICAgICAgICAgICAob3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4oZGF5KSk7XHJcblxyXG4gICAgICAgIGlmIChpc0VtcHR5KSB7XHJcbiAgICAgICAgICBpZiAoaSA8IGJlZm9yZSkge1xyXG4gICAgICAgICAgICBkYXlOdW1iZXIgPSBkYXlzSW5QcmV2aW91c01vbnRoICsgZGF5TnVtYmVyO1xyXG4gICAgICAgICAgICBtb250aE51bWJlciA9IHByZXZpb3VzTW9udGg7XHJcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZQcmV2aW91c01vbnRoO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGF5TnVtYmVyID0gZGF5TnVtYmVyIC0gZGF5cztcclxuICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBuZXh0TW9udGg7XHJcbiAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZOZXh0TW9udGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGF5Q29uZmlnID0ge1xyXG4gICAgICAgICAgZGF5OiBkYXlOdW1iZXIsXHJcbiAgICAgICAgICBtb250aDogbW9udGhOdW1iZXIsXHJcbiAgICAgICAgICB5ZWFyOiB5ZWFyTnVtYmVyLFxyXG4gICAgICAgICAgaGFzRXZlbnQ6IGhhc0V2ZW50LFxyXG4gICAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcclxuICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXksXHJcbiAgICAgICAgICBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLFxyXG4gICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcclxuICAgICAgICAgIGlzU3RhcnRSYW5nZTogaXNTdGFydFJhbmdlLFxyXG4gICAgICAgICAgaXNFbmRSYW5nZTogaXNFbmRSYW5nZSxcclxuICAgICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxyXG4gICAgICAgICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogb3B0cy5zaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcm93LnB1c2godGhpcy5yZW5kZXJEYXkoZGF5Q29uZmlnKSk7XHJcblxyXG4gICAgICAgIGlmICgrK3IgPT09IDcpIHtcclxuICAgICAgICAgIGRhdGEucHVzaCh0aGlzLnJlbmRlclJvdyhyb3csIG9wdHMuaXNSVEwsIGlzV2Vla1NlbGVjdGVkKSk7XHJcbiAgICAgICAgICByb3cgPSBbXTtcclxuICAgICAgICAgIHIgPSAwO1xyXG4gICAgICAgICAgaXNXZWVrU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVGFibGUob3B0cywgZGF0YSwgcmFuZElkKTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXJEYXkob3B0cykge1xyXG4gICAgICBsZXQgYXJyID0gW107XHJcbiAgICAgIGxldCBhcmlhU2VsZWN0ZWQgPSAnZmFsc2UnO1xyXG4gICAgICBpZiAob3B0cy5pc0VtcHR5KSB7XHJcbiAgICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xyXG4gICAgICAgICAgYXJyLnB1c2goJ2lzLW91dHNpZGUtY3VycmVudC1tb250aCcpO1xyXG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGlvbi1kaXNhYmxlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gJzx0ZCBjbGFzcz1cImlzLWVtcHR5XCI+PC90ZD4nO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAob3B0cy5pc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgYXJyLnB1c2goJ2lzLWRpc2FibGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRzLmlzVG9kYXkpIHtcclxuICAgICAgICBhcnIucHVzaCgnaXMtdG9kYXknKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3B0cy5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgYXJyLnB1c2goJ2lzLXNlbGVjdGVkJyk7XHJcbiAgICAgICAgYXJpYVNlbGVjdGVkID0gJ3RydWUnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvcHRzLmhhc0V2ZW50KSB7XHJcbiAgICAgICAgYXJyLnB1c2goJ2hhcy1ldmVudCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvcHRzLmlzSW5SYW5nZSkge1xyXG4gICAgICAgIGFyci5wdXNoKCdpcy1pbnJhbmdlJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG9wdHMuaXNTdGFydFJhbmdlKSB7XHJcbiAgICAgICAgYXJyLnB1c2goJ2lzLXN0YXJ0cmFuZ2UnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3B0cy5pc0VuZFJhbmdlKSB7XHJcbiAgICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBgPHRkIGRhdGEtZGF5PVwiJHtvcHRzLmRheX1cIiBjbGFzcz1cIiR7YXJyLmpvaW4oJyAnKX1cIiBhcmlhLXNlbGVjdGVkPVwiJHthcmlhU2VsZWN0ZWR9XCI+YCArXHJcbiAgICAgICAgYDxidXR0b24gY2xhc3M9XCJkYXRlcGlja2VyLWRheS1idXR0b25cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS15ZWFyPVwiJHtvcHRzLnllYXJ9XCIgZGF0YS1tb250aD1cIiR7XHJcbiAgICAgICAgICBvcHRzLm1vbnRoXHJcbiAgICAgICAgfVwiIGRhdGEtZGF5PVwiJHtvcHRzLmRheX1cIj4ke29wdHMuZGF5fTwvYnV0dG9uPmAgK1xyXG4gICAgICAgICc8L3RkPidcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXJSb3coZGF5cywgaXNSVEwsIGlzUm93U2VsZWN0ZWQpIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICAnPHRyIGNsYXNzPVwiZGF0ZXBpY2tlci1yb3cnICtcclxuICAgICAgICAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICtcclxuICAgICAgICAnXCI+JyArXHJcbiAgICAgICAgKGlzUlRMID8gZGF5cy5yZXZlcnNlKCkgOiBkYXlzKS5qb2luKCcnKSArXHJcbiAgICAgICAgJzwvdHI+J1xyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlclRhYmxlKG9wdHMsIGRhdGEsIHJhbmRJZCkge1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci10YWJsZS13cmFwcGVyXCI+PHRhYmxlIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiIGNsYXNzPVwiZGF0ZXBpY2tlci10YWJsZVwiIHJvbGU9XCJncmlkXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArXHJcbiAgICAgICAgcmFuZElkICtcclxuICAgICAgICAnXCI+JyArXHJcbiAgICAgICAgdGhpcy5yZW5kZXJIZWFkKG9wdHMpICtcclxuICAgICAgICB0aGlzLnJlbmRlckJvZHkoZGF0YSkgK1xyXG4gICAgICAgICc8L3RhYmxlPjwvZGl2PidcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXJIZWFkKG9wdHMpIHtcclxuICAgICAgbGV0IGksXHJcbiAgICAgICAgYXJyID0gW107XHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICBhcnIucHVzaChcclxuICAgICAgICAgIGA8dGggc2NvcGU9XCJjb2xcIj48YWJiciB0aXRsZT1cIiR7dGhpcy5yZW5kZXJEYXlOYW1lKG9wdHMsIGkpfVwiPiR7dGhpcy5yZW5kZXJEYXlOYW1lKFxyXG4gICAgICAgICAgICBvcHRzLFxyXG4gICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICApfTwvYWJicj48L3RoPmBcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAnPHRoZWFkPjx0cj4nICsgKG9wdHMuaXNSVEwgPyBhcnIucmV2ZXJzZSgpIDogYXJyKS5qb2luKCcnKSArICc8L3RyPjwvdGhlYWQ+JztcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXJCb2R5KHJvd3MpIHtcclxuICAgICAgcmV0dXJuICc8dGJvZHk+JyArIHJvd3Muam9pbignJykgKyAnPC90Ym9keT4nO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlclRpdGxlKGluc3RhbmNlLCBjLCB5ZWFyLCBtb250aCwgcmVmWWVhciwgcmFuZElkKSB7XHJcbiAgICAgIGxldCBpLFxyXG4gICAgICAgIGosXHJcbiAgICAgICAgYXJyLFxyXG4gICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgaXNNaW5ZZWFyID0geWVhciA9PT0gb3B0cy5taW5ZZWFyLFxyXG4gICAgICAgIGlzTWF4WWVhciA9IHllYXIgPT09IG9wdHMubWF4WWVhcixcclxuICAgICAgICBodG1sID1cclxuICAgICAgICAgICc8ZGl2IGlkPVwiJyArXHJcbiAgICAgICAgICByYW5kSWQgK1xyXG4gICAgICAgICAgJ1wiIGNsYXNzPVwiZGF0ZXBpY2tlci1jb250cm9sc1wiIHJvbGU9XCJoZWFkaW5nXCIgYXJpYS1saXZlPVwiYXNzZXJ0aXZlXCI+JyxcclxuICAgICAgICBtb250aEh0bWwsXHJcbiAgICAgICAgeWVhckh0bWwsXHJcbiAgICAgICAgcHJldiA9IHRydWUsXHJcbiAgICAgICAgbmV4dCA9IHRydWU7XHJcblxyXG4gICAgICBmb3IgKGFyciA9IFtdLCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICBhcnIucHVzaChcclxuICAgICAgICAgICc8b3B0aW9uIHZhbHVlPVwiJyArXHJcbiAgICAgICAgICAgICh5ZWFyID09PSByZWZZZWFyID8gaSAtIGMgOiAxMiArIGkgLSBjKSArXHJcbiAgICAgICAgICAgICdcIicgK1xyXG4gICAgICAgICAgICAoaSA9PT0gbW9udGggPyAnIHNlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJykgK1xyXG4gICAgICAgICAgICAoKGlzTWluWWVhciAmJiBpIDwgb3B0cy5taW5Nb250aCkgfHwgKGlzTWF4WWVhciAmJiBpID4gb3B0cy5tYXhNb250aClcclxuICAgICAgICAgICAgICA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInXHJcbiAgICAgICAgICAgICAgOiAnJykgK1xyXG4gICAgICAgICAgICAnPicgK1xyXG4gICAgICAgICAgICBvcHRzLmkxOG4ubW9udGhzW2ldICtcclxuICAgICAgICAgICAgJzwvb3B0aW9uPidcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb250aEh0bWwgPVxyXG4gICAgICAgICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlci1zZWxlY3Qgb3JpZy1zZWxlY3QtbW9udGhcIiB0YWJpbmRleD1cIi0xXCI+JyArXHJcbiAgICAgICAgYXJyLmpvaW4oJycpICtcclxuICAgICAgICAnPC9zZWxlY3Q+JztcclxuXHJcbiAgICAgIGlmICgkLmlzQXJyYXkob3B0cy55ZWFyUmFuZ2UpKSB7XHJcbiAgICAgICAgaSA9IG9wdHMueWVhclJhbmdlWzBdO1xyXG4gICAgICAgIGogPSBvcHRzLnllYXJSYW5nZVsxXSArIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaSA9IHllYXIgLSBvcHRzLnllYXJSYW5nZTtcclxuICAgICAgICBqID0gMSArIHllYXIgKyBvcHRzLnllYXJSYW5nZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChhcnIgPSBbXTsgaSA8IGogJiYgaSA8PSBvcHRzLm1heFllYXI7IGkrKykge1xyXG4gICAgICAgIGlmIChpID49IG9wdHMubWluWWVhcikge1xyXG4gICAgICAgICAgYXJyLnB1c2goYDxvcHRpb24gdmFsdWU9XCIke2l9XCIgJHtpID09PSB5ZWFyID8gJ3NlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJ30+JHtpfTwvb3B0aW9uPmApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgeWVhckh0bWwgPSBgPHNlbGVjdCBjbGFzcz1cImRhdGVwaWNrZXItc2VsZWN0IG9yaWctc2VsZWN0LXllYXJcIiB0YWJpbmRleD1cIi0xXCI+JHthcnIuam9pbihcclxuICAgICAgICAnJ1xyXG4gICAgICApfTwvc2VsZWN0PmA7XHJcblxyXG4gICAgICBsZXQgbGVmdEFycm93ID1cclxuICAgICAgICAnPHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIk0xNS40MSAxNi4wOWwtNC41OC00LjU5IDQuNTgtNC41OUwxNCA1LjVsLTYgNiA2IDZ6XCIvPjxwYXRoIGQ9XCJNMC0uNWgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPjwvc3ZnPic7XHJcbiAgICAgIGh0bWwgKz0gYDxidXR0b24gY2xhc3M9XCJtb250aC1wcmV2JHtcclxuICAgICAgICBwcmV2ID8gJycgOiAnIGlzLWRpc2FibGVkJ1xyXG4gICAgICB9XCIgdHlwZT1cImJ1dHRvblwiPiR7bGVmdEFycm93fTwvYnV0dG9uPmA7XHJcblxyXG4gICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2VsZWN0cy1jb250YWluZXJcIj4nO1xyXG4gICAgICBpZiAob3B0cy5zaG93TW9udGhBZnRlclllYXIpIHtcclxuICAgICAgICBodG1sICs9IHllYXJIdG1sICsgbW9udGhIdG1sO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGh0bWwgKz0gbW9udGhIdG1sICsgeWVhckh0bWw7XHJcbiAgICAgIH1cclxuICAgICAgaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgIGlmIChpc01pblllYXIgJiYgKG1vbnRoID09PSAwIHx8IG9wdHMubWluTW9udGggPj0gbW9udGgpKSB7XHJcbiAgICAgICAgcHJldiA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNNYXhZZWFyICYmIChtb250aCA9PT0gMTEgfHwgb3B0cy5tYXhNb250aCA8PSBtb250aCkpIHtcclxuICAgICAgICBuZXh0ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCByaWdodEFycm93ID1cclxuICAgICAgICAnPHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIk04LjU5IDE2LjM0bDQuNTgtNC41OS00LjU4LTQuNTlMMTAgNS43NWw2IDYtNiA2elwiLz48cGF0aCBkPVwiTTAtLjI1aDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+PC9zdmc+JztcclxuICAgICAgaHRtbCArPSBgPGJ1dHRvbiBjbGFzcz1cIm1vbnRoLW5leHQke1xyXG4gICAgICAgIG5leHQgPyAnJyA6ICcgaXMtZGlzYWJsZWQnXHJcbiAgICAgIH1cIiB0eXBlPVwiYnV0dG9uXCI+JHtyaWdodEFycm93fTwvYnV0dG9uPmA7XHJcblxyXG4gICAgICByZXR1cm4gKGh0bWwgKz0gJzwvZGl2PicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVmcmVzaCB0aGUgSFRNTFxyXG4gICAgICovXHJcbiAgICBkcmF3KGZvcmNlKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc09wZW4gJiYgIWZvcmNlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBvcHRzID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgIG1pblllYXIgPSBvcHRzLm1pblllYXIsXHJcbiAgICAgICAgbWF4WWVhciA9IG9wdHMubWF4WWVhcixcclxuICAgICAgICBtaW5Nb250aCA9IG9wdHMubWluTW9udGgsXHJcbiAgICAgICAgbWF4TW9udGggPSBvcHRzLm1heE1vbnRoLFxyXG4gICAgICAgIGh0bWwgPSAnJyxcclxuICAgICAgICByYW5kSWQ7XHJcblxyXG4gICAgICBpZiAodGhpcy5feSA8PSBtaW5ZZWFyKSB7XHJcbiAgICAgICAgdGhpcy5feSA9IG1pblllYXI7XHJcbiAgICAgICAgaWYgKCFpc05hTihtaW5Nb250aCkgJiYgdGhpcy5fbSA8IG1pbk1vbnRoKSB7XHJcbiAgICAgICAgICB0aGlzLl9tID0gbWluTW9udGg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLl95ID49IG1heFllYXIpIHtcclxuICAgICAgICB0aGlzLl95ID0gbWF4WWVhcjtcclxuICAgICAgICBpZiAoIWlzTmFOKG1heE1vbnRoKSAmJiB0aGlzLl9tID4gbWF4TW9udGgpIHtcclxuICAgICAgICAgIHRoaXMuX20gPSBtYXhNb250aDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJhbmRJZCA9XHJcbiAgICAgICAgJ2RhdGVwaWNrZXItdGl0bGUtJyArXHJcbiAgICAgICAgTWF0aC5yYW5kb20oKVxyXG4gICAgICAgICAgLnRvU3RyaW5nKDM2KVxyXG4gICAgICAgICAgLnJlcGxhY2UoL1teYS16XSsvZywgJycpXHJcbiAgICAgICAgICAuc3Vic3RyKDAsIDIpO1xyXG5cclxuICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCAxOyBjKyspIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJEYXRlRGlzcGxheSgpO1xyXG4gICAgICAgIGh0bWwgKz1cclxuICAgICAgICAgIHRoaXMucmVuZGVyVGl0bGUoXHJcbiAgICAgICAgICAgIHRoaXMsXHJcbiAgICAgICAgICAgIGMsXHJcbiAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsXHJcbiAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLFxyXG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS55ZWFyLFxyXG4gICAgICAgICAgICByYW5kSWRcclxuICAgICAgICAgICkgKyB0aGlzLnJlbmRlcih0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgcmFuZElkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5kZXN0cm95U2VsZWN0cygpO1xyXG5cclxuICAgICAgdGhpcy5jYWxlbmRhckVsLmlubmVySFRNTCA9IGh0bWw7XHJcblxyXG4gICAgICAvLyBJbml0IE1hdGVyaWFsaXplIFNlbGVjdFxyXG4gICAgICBsZXQgeWVhclNlbGVjdCA9IHRoaXMuY2FsZW5kYXJFbC5xdWVyeVNlbGVjdG9yKCcub3JpZy1zZWxlY3QteWVhcicpO1xyXG4gICAgICBsZXQgbW9udGhTZWxlY3QgPSB0aGlzLmNhbGVuZGFyRWwucXVlcnlTZWxlY3RvcignLm9yaWctc2VsZWN0LW1vbnRoJyk7XHJcbiAgICAgIE0uRm9ybVNlbGVjdC5pbml0KHllYXJTZWxlY3QsIHtcclxuICAgICAgICBjbGFzc2VzOiAnc2VsZWN0LXllYXInLFxyXG4gICAgICAgIGRyb3Bkb3duT3B0aW9uczogeyBjb250YWluZXI6IGRvY3VtZW50LmJvZHksIGNvbnN0cmFpbldpZHRoOiBmYWxzZSB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBNLkZvcm1TZWxlY3QuaW5pdChtb250aFNlbGVjdCwge1xyXG4gICAgICAgIGNsYXNzZXM6ICdzZWxlY3QtbW9udGgnLFxyXG4gICAgICAgIGRyb3Bkb3duT3B0aW9uczogeyBjb250YWluZXI6IGRvY3VtZW50LmJvZHksIGNvbnN0cmFpbldpZHRoOiBmYWxzZSB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQWRkIGNoYW5nZSBoYW5kbGVycyBmb3Igc2VsZWN0XHJcbiAgICAgIHllYXJTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlWWVhckNoYW5nZS5iaW5kKHRoaXMpKTtcclxuICAgICAgbW9udGhTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlTW9udGhDaGFuZ2UuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkRyYXcgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMub25EcmF3KHRoaXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dENsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUlucHV0Q2hhbmdlQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dENoYW5nZS5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVDYWxlbmRhckNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDYWxlbmRhckNsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2ZpbmlzaFNlbGVjdGlvbkJvdW5kID0gdGhpcy5fZmluaXNoU2VsZWN0aW9uLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZU1vbnRoQ2hhbmdlID0gdGhpcy5faGFuZGxlTW9udGhDaGFuZ2UuYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5fY2xvc2VCb3VuZCA9IHRoaXMuY2xvc2UuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlSW5wdXRDaGFuZ2VCb3VuZCk7XHJcbiAgICAgIHRoaXMuY2FsZW5kYXJFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUNhbGVuZGFyQ2xpY2tCb3VuZCk7XHJcbiAgICAgIHRoaXMuZG9uZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2ZpbmlzaFNlbGVjdGlvbkJvdW5kKTtcclxuICAgICAgdGhpcy5jYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZUJvdW5kKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd0NsZWFyQnRuKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ2xlYXJDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlQ2xlYXJDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2xlYXJCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDbGVhckNsaWNrQm91bmQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3NldHVwVmFyaWFibGVzKCkge1xyXG4gICAgICB0aGlzLiRtb2RhbEVsID0gJChEYXRlcGlja2VyLl90ZW1wbGF0ZSk7XHJcbiAgICAgIHRoaXMubW9kYWxFbCA9IHRoaXMuJG1vZGFsRWxbMF07XHJcblxyXG4gICAgICB0aGlzLmNhbGVuZGFyRWwgPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLmRhdGVwaWNrZXItY2FsZW5kYXInKTtcclxuXHJcbiAgICAgIHRoaXMueWVhclRleHRFbCA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcueWVhci10ZXh0Jyk7XHJcbiAgICAgIHRoaXMuZGF0ZVRleHRFbCA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZS10ZXh0Jyk7XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd0NsZWFyQnRuKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhckJ0biA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlci1jbGVhcicpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZG9uZUJ0biA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlci1kb25lJyk7XHJcbiAgICAgIHRoaXMuY2FuY2VsQnRuID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlcGlja2VyLWNhbmNlbCcpO1xyXG5cclxuICAgICAgdGhpcy5mb3JtYXRzID0ge1xyXG4gICAgICAgIGQ6ICgpID0+IHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGQ6ICgpID0+IHtcclxuICAgICAgICAgIGxldCBkID0gdGhpcy5kYXRlLmdldERhdGUoKTtcclxuICAgICAgICAgIHJldHVybiAoZCA8IDEwID8gJzAnIDogJycpICsgZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRkZDogKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pMThuLndlZWtkYXlzU2hvcnRbdGhpcy5kYXRlLmdldERheSgpXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRkZGQ6ICgpID0+IHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaTE4bi53ZWVrZGF5c1t0aGlzLmRhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbTogKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1tOiAoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgbSA9IHRoaXMuZGF0ZS5nZXRNb250aCgpICsgMTtcclxuICAgICAgICAgIHJldHVybiAobSA8IDEwID8gJzAnIDogJycpICsgbTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1tbTogKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pMThuLm1vbnRoc1Nob3J0W3RoaXMuZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1tbW06ICgpID0+IHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaTE4bi5tb250aHNbdGhpcy5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeXk6ICgpID0+IHtcclxuICAgICAgICAgIHJldHVybiAoJycgKyB0aGlzLmRhdGUuZ2V0RnVsbFllYXIoKSkuc2xpY2UoMik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB5eXl5OiAoKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZUlucHV0Q2hhbmdlQm91bmQpO1xyXG4gICAgICB0aGlzLmNhbGVuZGFyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDYWxlbmRhckNsaWNrQm91bmQpO1xyXG4gICAgfVxyXG5cclxuICAgIF9oYW5kbGVJbnB1dENsaWNrKCkge1xyXG4gICAgICB0aGlzLm9wZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlSW5wdXRLZXlkb3duKGUpIHtcclxuICAgICAgaWYgKGUud2hpY2ggPT09IE0ua2V5cy5FTlRFUikge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9oYW5kbGVDYWxlbmRhckNsaWNrKGUpIHtcclxuICAgICAgaWYgKCF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0ICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgaWYgKCEkdGFyZ2V0Lmhhc0NsYXNzKCdpcy1kaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgJHRhcmdldC5oYXNDbGFzcygnZGF0ZXBpY2tlci1kYXktYnV0dG9uJykgJiZcclxuICAgICAgICAgICEkdGFyZ2V0Lmhhc0NsYXNzKCdpcy1lbXB0eScpICYmXHJcbiAgICAgICAgICAhJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtZGlzYWJsZWQnKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdGhpcy5zZXREYXRlKFxyXG4gICAgICAgICAgICBuZXcgRGF0ZShcclxuICAgICAgICAgICAgICBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteWVhcicpLFxyXG4gICAgICAgICAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb250aCcpLFxyXG4gICAgICAgICAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXknKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvQ2xvc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmluaXNoU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICgkdGFyZ2V0LmNsb3Nlc3QoJy5tb250aC1wcmV2JykubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXZNb250aCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHRhcmdldC5jbG9zZXN0KCcubW9udGgtbmV4dCcpLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5uZXh0TW9udGgoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlQ2xlYXJDbGljaygpIHtcclxuICAgICAgdGhpcy5kYXRlID0gbnVsbDtcclxuICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKCk7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlTW9udGhDaGFuZ2UoZSkge1xyXG4gICAgICB0aGlzLmdvdG9Nb250aChlLnRhcmdldC52YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZVllYXJDaGFuZ2UoZSkge1xyXG4gICAgICB0aGlzLmdvdG9ZZWFyKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgbW9udGggKHplcm8taW5kZXgsIGUuZy4gMDogSmFudWFyeSlcclxuICAgICAqL1xyXG4gICAgZ290b01vbnRoKG1vbnRoKSB7XHJcbiAgICAgIGlmICghaXNOYU4obW9udGgpKSB7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGggPSBwYXJzZUludChtb250aCwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZnVsbCB5ZWFyIChlLmcuIFwiMjAxMlwiKVxyXG4gICAgICovXHJcbiAgICBnb3RvWWVhcih5ZWFyKSB7XHJcbiAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS55ZWFyID0gcGFyc2VJbnQoeWVhciwgMTApO1xyXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlSW5wdXRDaGFuZ2UoZSkge1xyXG4gICAgICBsZXQgZGF0ZTtcclxuXHJcbiAgICAgIC8vIFByZXZlbnQgY2hhbmdlIGV2ZW50IGZyb20gYmVpbmcgZmlyZWQgd2hlbiB0cmlnZ2VyZWQgYnkgdGhlIHBsdWdpblxyXG4gICAgICBpZiAoZS5maXJlZEJ5ID09PSB0aGlzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyc2UpIHtcclxuICAgICAgICBkYXRlID0gdGhpcy5vcHRpb25zLnBhcnNlKHRoaXMuZWwudmFsdWUsIHRoaXMub3B0aW9ucy5mb3JtYXQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHRoaXMuZWwudmFsdWUpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKERhdGVwaWNrZXIuX2lzRGF0ZShkYXRlKSkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0ZShkYXRlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlckRheU5hbWUob3B0cywgZGF5LCBhYmJyKSB7XHJcbiAgICAgIGRheSArPSBvcHRzLmZpcnN0RGF5O1xyXG4gICAgICB3aGlsZSAoZGF5ID49IDcpIHtcclxuICAgICAgICBkYXkgLT0gNztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWJiciA/IG9wdHMuaTE4bi53ZWVrZGF5c0FiYnJldltkYXldIDogb3B0cy5pMThuLndlZWtkYXlzW2RheV07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgaW5wdXQgdmFsdWUgdG8gdGhlIHNlbGVjdGVkIGRhdGUgYW5kIGNsb3NlIERhdGVwaWNrZXJcclxuICAgICAqL1xyXG4gICAgX2ZpbmlzaFNlbGVjdGlvbigpIHtcclxuICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKCk7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gRGF0ZXBpY2tlclxyXG4gICAgICovXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uT3Blbi5jYWxsKHRoaXMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgICB0aGlzLm1vZGFsLm9wZW4oKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBEYXRlcGlja2VyXHJcbiAgICAgKi9cclxuICAgIGNsb3NlKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2UuY2FsbCh0aGlzKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1vZGFsLmNsb3NlKCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgRGF0ZXBpY2tlci5fdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdiBjbGFzcz0gXCJtb2RhbCBkYXRlcGlja2VyLW1vZGFsXCI+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudCBkYXRlcGlja2VyLWNvbnRhaW5lclwiPicsXHJcbiAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItZGF0ZS1kaXNwbGF5XCI+JyxcclxuICAgICc8c3BhbiBjbGFzcz1cInllYXItdGV4dFwiPjwvc3Bhbj4nLFxyXG4gICAgJzxzcGFuIGNsYXNzPVwiZGF0ZS10ZXh0XCI+PC9zcGFuPicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1jYWxlbmRhci1jb250YWluZXJcIj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLWNhbGVuZGFyXCI+PC9kaXY+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1mb290ZXJcIj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCBkYXRlcGlja2VyLWNsZWFyIHdhdmVzLWVmZmVjdFwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJjb25maXJtYXRpb24tYnRuc1wiPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImJ0bi1mbGF0IGRhdGVwaWNrZXItY2FuY2VsIHdhdmVzLWVmZmVjdFwiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCBkYXRlcGlja2VyLWRvbmUgd2F2ZXMtZWZmZWN0XCIgdHlwZT1cImJ1dHRvblwiPjwvYnV0dG9uPicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8L2Rpdj4nXHJcbiAgXS5qb2luKCcnKTtcclxuXHJcbiAgTS5EYXRlcGlja2VyID0gRGF0ZXBpY2tlcjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKERhdGVwaWNrZXIsICdkYXRlcGlja2VyJywgJ01fRGF0ZXBpY2tlcicpO1xyXG4gIH1cclxufSkoY2FzaCk7XHJcbiJdLCJmaWxlIjoiZGF0ZXBpY2tlci5qcyJ9
