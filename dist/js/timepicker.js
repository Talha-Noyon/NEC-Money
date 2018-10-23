(function($) {
  'use strict';

  let _defaults = {
    dialRadius: 135,
    outerRadius: 105,
    innerRadius: 70,
    tickRadius: 20,
    duration: 350,
    container: null,
    defaultTime: 'now', // default time, 'now' or '13:14' e.g.
    fromNow: 0, // Millisecond offset from the defaultTime
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok'
    },

    autoClose: false, // auto close when minute is selected
    twelveHour: true, // change to 12 hour AM/PM clock from 24 hour
    vibrate: true, // vibrate the device when dragging clock hand

    // Callbacks
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    onSelect: null
  };

  /**
   * @class
   *
   */
  class Timepicker extends Component {
    constructor(el, options) {
      super(Timepicker, el, options);

      this.el.M_Timepicker = this;

      this.options = $.extend({}, Timepicker.defaults, options);

      this.id = M.guid();
      this._insertHTMLIntoDOM();
      this._setupModal();
      this._setupVariables();
      this._setupEventHandlers();

      this._clockSetup();
      this._pickerSetup();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    static _addLeadingZero(num) {
      return (num < 10 ? '0' : '') + num;
    }

    static _createSVGEl(name) {
      let svgNS = 'http://www.w3.org/2000/svg';
      return document.createElementNS(svgNS, name);
    }

    /**
     * @typedef {Object} Point
     * @property {number} x The X Coordinate
     * @property {number} y The Y Coordinate
     */

    /**
     * Get x position of mouse or touch event
     * @param {Event} e
     * @return {Point} x and y location
     */
    static _Pos(e) {
      if (e.targetTouches && e.targetTouches.length >= 1) {
        return { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
      }
      // mouse event
      return { x: e.clientX, y: e.clientY };
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Timepicker;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.modal.destroy();
      $(this.modalEl).remove();
      this.el.M_Timepicker = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
      this._handleInputClickBound = this._handleInputClick.bind(this);
      this._handleClockClickStartBound = this._handleClockClickStart.bind(this);
      this._handleDocumentClickMoveBound = this._handleDocumentClickMove.bind(this);
      this._handleDocumentClickEndBound = this._handleDocumentClickEnd.bind(this);

      this.el.addEventListener('click', this._handleInputClickBound);
      this.el.addEventListener('keydown', this._handleInputKeydownBound);
      this.plate.addEventListener('mousedown', this._handleClockClickStartBound);
      this.plate.addEventListener('touchstart', this._handleClockClickStartBound);

      $(this.spanHours).on('click', this.showView.bind(this, 'hours'));
      $(this.spanMinutes).on('click', this.showView.bind(this, 'minutes'));
    }

    _removeEventHandlers() {
      this.el.removeEventListener('click', this._handleInputClickBound);
      this.el.removeEventListener('keydown', this._handleInputKeydownBound);
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

    _handleClockClickStart(e) {
      e.preventDefault();
      let clockPlateBR = this.plate.getBoundingClientRect();
      let offset = { x: clockPlateBR.left, y: clockPlateBR.top };

      this.x0 = offset.x + this.options.dialRadius;
      this.y0 = offset.y + this.options.dialRadius;
      this.moved = false;
      let clickPos = Timepicker._Pos(e);
      this.dx = clickPos.x - this.x0;
      this.dy = clickPos.y - this.y0;

      // Set clock hands
      this.setHand(this.dx, this.dy, false);

      // Mousemove on document
      document.addEventListener('mousemove', this._handleDocumentClickMoveBound);
      document.addEventListener('touchmove', this._handleDocumentClickMoveBound);

      // Mouseup on document
      document.addEventListener('mouseup', this._handleDocumentClickEndBound);
      document.addEventListener('touchend', this._handleDocumentClickEndBound);
    }

    _handleDocumentClickMove(e) {
      e.preventDefault();
      let clickPos = Timepicker._Pos(e);
      let x = clickPos.x - this.x0;
      let y = clickPos.y - this.y0;
      this.moved = true;
      this.setHand(x, y, false, true);
    }

    _handleDocumentClickEnd(e) {
      e.preventDefault();
      document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
      document.removeEventListener('touchend', this._handleDocumentClickEndBound);
      let clickPos = Timepicker._Pos(e);
      let x = clickPos.x - this.x0;
      let y = clickPos.y - this.y0;
      if (this.moved && x === this.dx && y === this.dy) {
        this.setHand(x, y);
      }

      if (this.currentView === 'hours') {
        this.showView('minutes', this.options.duration / 2);
      } else if (this.options.autoClose) {
        $(this.minutesView).addClass('timepicker-dial-out');
        setTimeout(() => {
          this.done();
        }, this.options.duration / 2);
      }

      if (typeof this.options.onSelect === 'function') {
        this.options.onSelect.call(this, this.hours, this.minutes);
      }

      // Unbind mousemove event
      document.removeEventListener('mousemove', this._handleDocumentClickMoveBound);
      document.removeEventListener('touchmove', this._handleDocumentClickMoveBound);
    }

    _insertHTMLIntoDOM() {
      this.$modalEl = $(Timepicker._template);
      this.modalEl = this.$modalEl[0];
      this.modalEl.id = 'modal-' + this.id;

      // Append popover to input by default
      let containerEl = document.querySelector(this.options.container);
      if (this.options.container && !!containerEl) {
        this.$modalEl.appendTo(containerEl);
      } else {
        this.$modalEl.insertBefore(this.el);
      }
    }

    _setupModal() {
      this.modal = M.Modal.init(this.modalEl, {
        onOpenStart: this.options.onOpenStart,
        onOpenEnd: this.options.onOpenEnd,
        onCloseStart: this.options.onCloseStart,
        onCloseEnd: () => {
          if (typeof this.options.onCloseEnd === 'function') {
            this.options.onCloseEnd.call(this);
          }
          this.isOpen = false;
        }
      });
    }

    _setupVariables() {
      this.currentView = 'hours';
      this.vibrate = navigator.vibrate
        ? 'vibrate'
        : navigator.webkitVibrate
          ? 'webkitVibrate'
          : null;

      this._canvas = this.modalEl.querySelector('.timepicker-canvas');
      this.plate = this.modalEl.querySelector('.timepicker-plate');

      this.hoursView = this.modalEl.querySelector('.timepicker-hours');
      this.minutesView = this.modalEl.querySelector('.timepicker-minutes');
      this.spanHours = this.modalEl.querySelector('.timepicker-span-hours');
      this.spanMinutes = this.modalEl.querySelector('.timepicker-span-minutes');
      this.spanAmPm = this.modalEl.querySelector('.timepicker-span-am-pm');
      this.footer = this.modalEl.querySelector('.timepicker-footer');
      this.amOrPm = 'PM';
    }

    _pickerSetup() {
      let $clearBtn = $(
        `<button class="btn-flat timepicker-clear waves-effect" style="visibility: hidden;" type="button" tabindex="${
          this.options.twelveHour ? '3' : '1'
        }">${this.options.i18n.clear}</button>`
      )
        .appendTo(this.footer)
        .on('click', this.clear.bind(this));
      if (this.options.showClearBtn) {
        $clearBtn.css({ visibility: '' });
      }

      let confirmationBtnsContainer = $('<div class="confirmation-btns"></div>');
      $(
        '<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' +
          (this.options.twelveHour ? '3' : '1') +
          '">' +
          this.options.i18n.cancel +
          '</button>'
      )
        .appendTo(confirmationBtnsContainer)
        .on('click', this.close.bind(this));
      $(
        '<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' +
          (this.options.twelveHour ? '3' : '1') +
          '">' +
          this.options.i18n.done +
          '</button>'
      )
        .appendTo(confirmationBtnsContainer)
        .on('click', this.done.bind(this));
      confirmationBtnsContainer.appendTo(this.footer);
    }

    _clockSetup() {
      if (this.options.twelveHour) {
        this.$amBtn = $('<div class="am-btn">AM</div>');
        this.$pmBtn = $('<div class="pm-btn">PM</div>');
        this.$amBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
        this.$pmBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
      }

      this._buildHoursView();
      this._buildMinutesView();
      this._buildSVGClock();
    }

    _buildSVGClock() {
      // Draw clock hands and others
      let dialRadius = this.options.dialRadius;
      let tickRadius = this.options.tickRadius;
      let diameter = dialRadius * 2;

      let svg = Timepicker._createSVGEl('svg');
      svg.setAttribute('class', 'timepicker-svg');
      svg.setAttribute('width', diameter);
      svg.setAttribute('height', diameter);
      let g = Timepicker._createSVGEl('g');
      g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
      let bearing = Timepicker._createSVGEl('circle');
      bearing.setAttribute('class', 'timepicker-canvas-bearing');
      bearing.setAttribute('cx', 0);
      bearing.setAttribute('cy', 0);
      bearing.setAttribute('r', 4);
      let hand = Timepicker._createSVGEl('line');
      hand.setAttribute('x1', 0);
      hand.setAttribute('y1', 0);
      let bg = Timepicker._createSVGEl('circle');
      bg.setAttribute('class', 'timepicker-canvas-bg');
      bg.setAttribute('r', tickRadius);
      g.appendChild(hand);
      g.appendChild(bg);
      g.appendChild(bearing);
      svg.appendChild(g);
      this._canvas.appendChild(svg);

      this.hand = hand;
      this.bg = bg;
      this.bearing = bearing;
      this.g = g;
    }

    _buildHoursView() {
      let $tick = $('<div class="timepicker-tick"></div>');
      // Hours view
      if (this.options.twelveHour) {
        for (let i = 1; i < 13; i += 1) {
          let tick = $tick.clone();
          let radian = i / 6 * Math.PI;
          let radius = this.options.outerRadius;
          tick.css({
            left:
              this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
            top:
              this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
          });
          tick.html(i === 0 ? '00' : i);
          this.hoursView.appendChild(tick[0]);
          // tick.on(mousedownEvent, mousedown);
        }
      } else {
        for (let i = 0; i < 24; i += 1) {
          let tick = $tick.clone();
          let radian = i / 6 * Math.PI;
          let inner = i > 0 && i < 13;
          let radius = inner ? this.options.innerRadius : this.options.outerRadius;
          tick.css({
            left:
              this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
            top:
              this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
          });
          tick.html(i === 0 ? '00' : i);
          this.hoursView.appendChild(tick[0]);
          // tick.on(mousedownEvent, mousedown);
        }
      }
    }

    _buildMinutesView() {
      let $tick = $('<div class="timepicker-tick"></div>');
      // Minutes view
      for (let i = 0; i < 60; i += 5) {
        let tick = $tick.clone();
        let radian = i / 30 * Math.PI;
        tick.css({
          left:
            this.options.dialRadius +
            Math.sin(radian) * this.options.outerRadius -
            this.options.tickRadius +
            'px',
          top:
            this.options.dialRadius -
            Math.cos(radian) * this.options.outerRadius -
            this.options.tickRadius +
            'px'
        });
        tick.html(Timepicker._addLeadingZero(i));
        this.minutesView.appendChild(tick[0]);
      }
    }

    _handleAmPmClick(e) {
      let $btnClicked = $(e.target);
      this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
      this._updateAmPmView();
    }

    _updateAmPmView() {
      if (this.options.twelveHour) {
        this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
        this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
      }
    }

    _updateTimeFromInput() {
      // Get the time
      let value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
      if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
        if (value[1].toUpperCase().indexOf('AM') > 0) {
          this.amOrPm = 'AM';
        } else {
          this.amOrPm = 'PM';
        }
        value[1] = value[1].replace('AM', '').replace('PM', '');
      }
      if (value[0] === 'now') {
        let now = new Date(+new Date() + this.options.fromNow);
        value = [now.getHours(), now.getMinutes()];
        if (this.options.twelveHour) {
          this.amOrPm = value[0] >= 12 && value[0] < 24 ? 'PM' : 'AM';
        }
      }
      this.hours = +value[0] || 0;
      this.minutes = +value[1] || 0;
      this.spanHours.innerHTML = this.hours;
      this.spanMinutes.innerHTML = Timepicker._addLeadingZero(this.minutes);

      this._updateAmPmView();
    }

    showView(view, delay) {
      if (view === 'minutes' && $(this.hoursView).css('visibility') === 'visible') {
        // raiseCallback(this.options.beforeHourSelect);
      }
      let isHours = view === 'hours',
        nextView = isHours ? this.hoursView : this.minutesView,
        hideView = isHours ? this.minutesView : this.hoursView;
      this.currentView = view;

      $(this.spanHours).toggleClass('text-primary', isHours);
      $(this.spanMinutes).toggleClass('text-primary', !isHours);

      // Transition view
      hideView.classList.add('timepicker-dial-out');
      $(nextView)
        .css('visibility', 'visible')
        .removeClass('timepicker-dial-out');

      // Reset clock hand
      this.resetClock(delay);

      // After transitions ended
      clearTimeout(this.toggleViewTimer);
      this.toggleViewTimer = setTimeout(() => {
        $(hideView).css('visibility', 'hidden');
      }, this.options.duration);
    }

    resetClock(delay) {
      let view = this.currentView,
        value = this[view],
        isHours = view === 'hours',
        unit = Math.PI / (isHours ? 6 : 30),
        radian = value * unit,
        radius =
          isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
        x = Math.sin(radian) * radius,
        y = -Math.cos(radian) * radius,
        self = this;

      if (delay) {
        $(this.canvas).addClass('timepicker-canvas-out');
        setTimeout(() => {
          $(self.canvas).removeClass('timepicker-canvas-out');
          self.setHand(x, y);
        }, delay);
      } else {
        this.setHand(x, y);
      }
    }

    setHand(x, y, roundBy5) {
      let radian = Math.atan2(x, -y),
        isHours = this.currentView === 'hours',
        unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
        z = Math.sqrt(x * x + y * y),
        inner = isHours && z < (this.options.outerRadius + this.options.innerRadius) / 2,
        radius = inner ? this.options.innerRadius : this.options.outerRadius;

      if (this.options.twelveHour) {
        radius = this.options.outerRadius;
      }

      // Radian should in range [0, 2PI]
      if (radian < 0) {
        radian = Math.PI * 2 + radian;
      }

      // Get the round value
      let value = Math.round(radian / unit);

      // Get the round radian
      radian = value * unit;

      // Correct the hours or minutes
      if (this.options.twelveHour) {
        if (isHours) {
          if (value === 0) value = 12;
        } else {
          if (roundBy5) value *= 5;
          if (value === 60) value = 0;
        }
      } else {
        if (isHours) {
          if (value === 12) {
            value = 0;
          }
          value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
        } else {
          if (roundBy5) {
            value *= 5;
          }
          if (value === 60) {
            value = 0;
          }
        }
      }

      // Once hours or minutes changed, vibrate the device
      if (this[this.currentView] !== value) {
        if (this.vibrate && this.options.vibrate) {
          // Do not vibrate too frequently
          if (!this.vibrateTimer) {
            navigator[this.vibrate](10);
            this.vibrateTimer = setTimeout(() => {
              this.vibrateTimer = null;
            }, 100);
          }
        }
      }

      this[this.currentView] = value;
      if (isHours) {
        this['spanHours'].innerHTML = value;
      } else {
        this['spanMinutes'].innerHTML = Timepicker._addLeadingZero(value);
      }

      // Set clock hand and others' position
      let cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
        cy1 = -Math.cos(radian) * (radius - this.options.tickRadius),
        cx2 = Math.sin(radian) * radius,
        cy2 = -Math.cos(radian) * radius;
      this.hand.setAttribute('x2', cx1);
      this.hand.setAttribute('y2', cy1);
      this.bg.setAttribute('cx', cx2);
      this.bg.setAttribute('cy', cy2);
    }

    open() {
      if (this.isOpen) {
        return;
      }

      this.isOpen = true;
      this._updateTimeFromInput();
      this.showView('hours');

      this.modal.open();
    }

    close() {
      if (!this.isOpen) {
        return;
      }

      this.isOpen = false;
      this.modal.close();
    }

    /**
     * Finish timepicker selection.
     */
    done(e, clearValue) {
      // Set input value
      let last = this.el.value;
      let value = clearValue
        ? ''
        : Timepicker._addLeadingZero(this.hours) + ':' + Timepicker._addLeadingZero(this.minutes);
      this.time = value;
      if (!clearValue && this.options.twelveHour) {
        value = `${value} ${this.amOrPm}`;
      }
      this.el.value = value;

      // Trigger change event
      if (value !== last) {
        this.$el.trigger('change');
      }

      this.close();
      this.el.focus();
    }

    clear() {
      this.done(null, true);
    }
  }

  Timepicker._template = [
    '<div class= "modal timepicker-modal">',
    '<div class="modal-content timepicker-container">',
    '<div class="timepicker-digital-display">',
    '<div class="timepicker-text-container">',
    '<div class="timepicker-display-column">',
    '<span class="timepicker-span-hours text-primary"></span>',
    ':',
    '<span class="timepicker-span-minutes"></span>',
    '</div>',
    '<div class="timepicker-display-column timepicker-display-am-pm">',
    '<div class="timepicker-span-am-pm"></div>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="timepicker-analog-display">',
    '<div class="timepicker-plate">',
    '<div class="timepicker-canvas"></div>',
    '<div class="timepicker-dial timepicker-hours"></div>',
    '<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>',
    '</div>',
    '<div class="timepicker-footer"></div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('');

  M.Timepicker = Timepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
  }
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aW1lcGlja2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgZGlhbFJhZGl1czogMTM1LFxyXG4gICAgb3V0ZXJSYWRpdXM6IDEwNSxcclxuICAgIGlubmVyUmFkaXVzOiA3MCxcclxuICAgIHRpY2tSYWRpdXM6IDIwLFxyXG4gICAgZHVyYXRpb246IDM1MCxcclxuICAgIGNvbnRhaW5lcjogbnVsbCxcclxuICAgIGRlZmF1bHRUaW1lOiAnbm93JywgLy8gZGVmYXVsdCB0aW1lLCAnbm93JyBvciAnMTM6MTQnIGUuZy5cclxuICAgIGZyb21Ob3c6IDAsIC8vIE1pbGxpc2Vjb25kIG9mZnNldCBmcm9tIHRoZSBkZWZhdWx0VGltZVxyXG4gICAgc2hvd0NsZWFyQnRuOiBmYWxzZSxcclxuXHJcbiAgICAvLyBpbnRlcm5hdGlvbmFsaXphdGlvblxyXG4gICAgaTE4bjoge1xyXG4gICAgICBjYW5jZWw6ICdDYW5jZWwnLFxyXG4gICAgICBjbGVhcjogJ0NsZWFyJyxcclxuICAgICAgZG9uZTogJ09rJ1xyXG4gICAgfSxcclxuXHJcbiAgICBhdXRvQ2xvc2U6IGZhbHNlLCAvLyBhdXRvIGNsb3NlIHdoZW4gbWludXRlIGlzIHNlbGVjdGVkXHJcbiAgICB0d2VsdmVIb3VyOiB0cnVlLCAvLyBjaGFuZ2UgdG8gMTIgaG91ciBBTS9QTSBjbG9jayBmcm9tIDI0IGhvdXJcclxuICAgIHZpYnJhdGU6IHRydWUsIC8vIHZpYnJhdGUgdGhlIGRldmljZSB3aGVuIGRyYWdnaW5nIGNsb2NrIGhhbmRcclxuXHJcbiAgICAvLyBDYWxsYmFja3NcclxuICAgIG9uT3BlblN0YXJ0OiBudWxsLFxyXG4gICAgb25PcGVuRW5kOiBudWxsLFxyXG4gICAgb25DbG9zZVN0YXJ0OiBudWxsLFxyXG4gICAgb25DbG9zZUVuZDogbnVsbCxcclxuICAgIG9uU2VsZWN0OiBudWxsXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuICBjbGFzcyBUaW1lcGlja2VyIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIHN1cGVyKFRpbWVwaWNrZXIsIGVsLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuTV9UaW1lcGlja2VyID0gdGhpcztcclxuXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUaW1lcGlja2VyLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuaWQgPSBNLmd1aWQoKTtcclxuICAgICAgdGhpcy5faW5zZXJ0SFRNTEludG9ET00oKTtcclxuICAgICAgdGhpcy5fc2V0dXBNb2RhbCgpO1xyXG4gICAgICB0aGlzLl9zZXR1cFZhcmlhYmxlcygpO1xyXG4gICAgICB0aGlzLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgIHRoaXMuX2Nsb2NrU2V0dXAoKTtcclxuICAgICAgdGhpcy5fcGlja2VyU2V0dXAoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKCkge1xyXG4gICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gc3VwZXIuaW5pdCh0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBfYWRkTGVhZGluZ1plcm8obnVtKSB7XHJcbiAgICAgIHJldHVybiAobnVtIDwgMTAgPyAnMCcgOiAnJykgKyBudW07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIF9jcmVhdGVTVkdFbChuYW1lKSB7XHJcbiAgICAgIGxldCBzdmdOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XHJcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTlMsIG5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHR5cGVkZWYge09iamVjdH0gUG9pbnRcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB4IFRoZSBYIENvb3JkaW5hdGVcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB5IFRoZSBZIENvb3JkaW5hdGVcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHggcG9zaXRpb24gb2YgbW91c2Ugb3IgdG91Y2ggZXZlbnRcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqIEByZXR1cm4ge1BvaW50fSB4IGFuZCB5IGxvY2F0aW9uXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfUG9zKGUpIHtcclxuICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICByZXR1cm4geyB4OiBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgeTogZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFkgfTtcclxuICAgICAgfVxyXG4gICAgICAvLyBtb3VzZSBldmVudFxyXG4gICAgICByZXR1cm4geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICBsZXQgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgcmV0dXJuIGRvbUVsZW0uTV9UaW1lcGlja2VyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5tb2RhbC5kZXN0cm95KCk7XHJcbiAgICAgICQodGhpcy5tb2RhbEVsKS5yZW1vdmUoKTtcclxuICAgICAgdGhpcy5lbC5NX1RpbWVwaWNrZXIgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dENsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNsb2NrQ2xpY2tTdGFydEJvdW5kID0gdGhpcy5faGFuZGxlQ2xvY2tDbGlja1N0YXJ0LmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQgPSB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrRW5kQm91bmQgPSB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrRW5kLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duQm91bmQpO1xyXG4gICAgICB0aGlzLnBsYXRlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZUNsb2NrQ2xpY2tTdGFydEJvdW5kKTtcclxuICAgICAgdGhpcy5wbGF0ZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlQ2xvY2tDbGlja1N0YXJ0Qm91bmQpO1xyXG5cclxuICAgICAgJCh0aGlzLnNwYW5Ib3Vycykub24oJ2NsaWNrJywgdGhpcy5zaG93Vmlldy5iaW5kKHRoaXMsICdob3VycycpKTtcclxuICAgICAgJCh0aGlzLnNwYW5NaW51dGVzKS5vbignY2xpY2snLCB0aGlzLnNob3dWaWV3LmJpbmQodGhpcywgJ21pbnV0ZXMnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQpO1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZUlucHV0Q2xpY2soKSB7XHJcbiAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIF9oYW5kbGVJbnB1dEtleWRvd24oZSkge1xyXG4gICAgICBpZiAoZS53aGljaCA9PT0gTS5rZXlzLkVOVEVSKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZUNsb2NrQ2xpY2tTdGFydChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgbGV0IGNsb2NrUGxhdGVCUiA9IHRoaXMucGxhdGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIGxldCBvZmZzZXQgPSB7IHg6IGNsb2NrUGxhdGVCUi5sZWZ0LCB5OiBjbG9ja1BsYXRlQlIudG9wIH07XHJcblxyXG4gICAgICB0aGlzLngwID0gb2Zmc2V0LnggKyB0aGlzLm9wdGlvbnMuZGlhbFJhZGl1cztcclxuICAgICAgdGhpcy55MCA9IG9mZnNldC55ICsgdGhpcy5vcHRpb25zLmRpYWxSYWRpdXM7XHJcbiAgICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IGNsaWNrUG9zID0gVGltZXBpY2tlci5fUG9zKGUpO1xyXG4gICAgICB0aGlzLmR4ID0gY2xpY2tQb3MueCAtIHRoaXMueDA7XHJcbiAgICAgIHRoaXMuZHkgPSBjbGlja1Bvcy55IC0gdGhpcy55MDtcclxuXHJcbiAgICAgIC8vIFNldCBjbG9jayBoYW5kc1xyXG4gICAgICB0aGlzLnNldEhhbmQodGhpcy5keCwgdGhpcy5keSwgZmFsc2UpO1xyXG5cclxuICAgICAgLy8gTW91c2Vtb3ZlIG9uIGRvY3VtZW50XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQpO1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrTW92ZUJvdW5kKTtcclxuXHJcbiAgICAgIC8vIE1vdXNldXAgb24gZG9jdW1lbnRcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tFbmRCb3VuZCk7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0VuZEJvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlRG9jdW1lbnRDbGlja01vdmUoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGxldCBjbGlja1BvcyA9IFRpbWVwaWNrZXIuX1BvcyhlKTtcclxuICAgICAgbGV0IHggPSBjbGlja1Bvcy54IC0gdGhpcy54MDtcclxuICAgICAgbGV0IHkgPSBjbGlja1Bvcy55IC0gdGhpcy55MDtcclxuICAgICAgdGhpcy5tb3ZlZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuc2V0SGFuZCh4LCB5LCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2hhbmRsZURvY3VtZW50Q2xpY2tFbmQoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrRW5kQm91bmQpO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tFbmRCb3VuZCk7XHJcbiAgICAgIGxldCBjbGlja1BvcyA9IFRpbWVwaWNrZXIuX1BvcyhlKTtcclxuICAgICAgbGV0IHggPSBjbGlja1Bvcy54IC0gdGhpcy54MDtcclxuICAgICAgbGV0IHkgPSBjbGlja1Bvcy55IC0gdGhpcy55MDtcclxuICAgICAgaWYgKHRoaXMubW92ZWQgJiYgeCA9PT0gdGhpcy5keCAmJiB5ID09PSB0aGlzLmR5KSB7XHJcbiAgICAgICAgdGhpcy5zZXRIYW5kKHgsIHkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5jdXJyZW50VmlldyA9PT0gJ2hvdXJzJykge1xyXG4gICAgICAgIHRoaXMuc2hvd1ZpZXcoJ21pbnV0ZXMnLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24gLyAyKTtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuYXV0b0Nsb3NlKSB7XHJcbiAgICAgICAgJCh0aGlzLm1pbnV0ZXNWaWV3KS5hZGRDbGFzcygndGltZXBpY2tlci1kaWFsLW91dCcpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kb25lKCk7XHJcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLmR1cmF0aW9uIC8gMik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uU2VsZWN0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uU2VsZWN0LmNhbGwodGhpcywgdGhpcy5ob3VycywgdGhpcy5taW51dGVzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVW5iaW5kIG1vdXNlbW92ZSBldmVudFxyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrTW92ZUJvdW5kKTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja01vdmVCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2luc2VydEhUTUxJbnRvRE9NKCkge1xyXG4gICAgICB0aGlzLiRtb2RhbEVsID0gJChUaW1lcGlja2VyLl90ZW1wbGF0ZSk7XHJcbiAgICAgIHRoaXMubW9kYWxFbCA9IHRoaXMuJG1vZGFsRWxbMF07XHJcbiAgICAgIHRoaXMubW9kYWxFbC5pZCA9ICdtb2RhbC0nICsgdGhpcy5pZDtcclxuXHJcbiAgICAgIC8vIEFwcGVuZCBwb3BvdmVyIHRvIGlucHV0IGJ5IGRlZmF1bHRcclxuICAgICAgbGV0IGNvbnRhaW5lckVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMuY29udGFpbmVyKTtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIgJiYgISFjb250YWluZXJFbCkge1xyXG4gICAgICAgIHRoaXMuJG1vZGFsRWwuYXBwZW5kVG8oY29udGFpbmVyRWwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuJG1vZGFsRWwuaW5zZXJ0QmVmb3JlKHRoaXMuZWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3NldHVwTW9kYWwoKSB7XHJcbiAgICAgIHRoaXMubW9kYWwgPSBNLk1vZGFsLmluaXQodGhpcy5tb2RhbEVsLCB7XHJcbiAgICAgICAgb25PcGVuU3RhcnQ6IHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydCxcclxuICAgICAgICBvbk9wZW5FbmQ6IHRoaXMub3B0aW9ucy5vbk9wZW5FbmQsXHJcbiAgICAgICAgb25DbG9zZVN0YXJ0OiB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0LFxyXG4gICAgICAgIG9uQ2xvc2VFbmQ6ICgpID0+IHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2xvc2VFbmQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2VFbmQuY2FsbCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfc2V0dXBWYXJpYWJsZXMoKSB7XHJcbiAgICAgIHRoaXMuY3VycmVudFZpZXcgPSAnaG91cnMnO1xyXG4gICAgICB0aGlzLnZpYnJhdGUgPSBuYXZpZ2F0b3IudmlicmF0ZVxyXG4gICAgICAgID8gJ3ZpYnJhdGUnXHJcbiAgICAgICAgOiBuYXZpZ2F0b3Iud2Via2l0VmlicmF0ZVxyXG4gICAgICAgICAgPyAnd2Via2l0VmlicmF0ZSdcclxuICAgICAgICAgIDogbnVsbDtcclxuXHJcbiAgICAgIHRoaXMuX2NhbnZhcyA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1jYW52YXMnKTtcclxuICAgICAgdGhpcy5wbGF0ZSA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1wbGF0ZScpO1xyXG5cclxuICAgICAgdGhpcy5ob3Vyc1ZpZXcgPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLnRpbWVwaWNrZXItaG91cnMnKTtcclxuICAgICAgdGhpcy5taW51dGVzVmlldyA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1taW51dGVzJyk7XHJcbiAgICAgIHRoaXMuc3BhbkhvdXJzID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy50aW1lcGlja2VyLXNwYW4taG91cnMnKTtcclxuICAgICAgdGhpcy5zcGFuTWludXRlcyA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1zcGFuLW1pbnV0ZXMnKTtcclxuICAgICAgdGhpcy5zcGFuQW1QbSA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1zcGFuLWFtLXBtJyk7XHJcbiAgICAgIHRoaXMuZm9vdGVyID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy50aW1lcGlja2VyLWZvb3RlcicpO1xyXG4gICAgICB0aGlzLmFtT3JQbSA9ICdQTSc7XHJcbiAgICB9XHJcblxyXG4gICAgX3BpY2tlclNldHVwKCkge1xyXG4gICAgICBsZXQgJGNsZWFyQnRuID0gJChcclxuICAgICAgICBgPGJ1dHRvbiBjbGFzcz1cImJ0bi1mbGF0IHRpbWVwaWNrZXItY2xlYXIgd2F2ZXMtZWZmZWN0XCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW47XCIgdHlwZT1cImJ1dHRvblwiIHRhYmluZGV4PVwiJHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy50d2VsdmVIb3VyID8gJzMnIDogJzEnXHJcbiAgICAgICAgfVwiPiR7dGhpcy5vcHRpb25zLmkxOG4uY2xlYXJ9PC9idXR0b24+YFxyXG4gICAgICApXHJcbiAgICAgICAgLmFwcGVuZFRvKHRoaXMuZm9vdGVyKVxyXG4gICAgICAgIC5vbignY2xpY2snLCB0aGlzLmNsZWFyLmJpbmQodGhpcykpO1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dDbGVhckJ0bikge1xyXG4gICAgICAgICRjbGVhckJ0bi5jc3MoeyB2aXNpYmlsaXR5OiAnJyB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGNvbmZpcm1hdGlvbkJ0bnNDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiY29uZmlybWF0aW9uLWJ0bnNcIj48L2Rpdj4nKTtcclxuICAgICAgJChcclxuICAgICAgICAnPGJ1dHRvbiBjbGFzcz1cImJ0bi1mbGF0IHRpbWVwaWNrZXItY2xvc2Ugd2F2ZXMtZWZmZWN0XCIgdHlwZT1cImJ1dHRvblwiIHRhYmluZGV4PVwiJyArXHJcbiAgICAgICAgICAodGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIgPyAnMycgOiAnMScpICtcclxuICAgICAgICAgICdcIj4nICtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5pMThuLmNhbmNlbCArXHJcbiAgICAgICAgICAnPC9idXR0b24+J1xyXG4gICAgICApXHJcbiAgICAgICAgLmFwcGVuZFRvKGNvbmZpcm1hdGlvbkJ0bnNDb250YWluZXIpXHJcbiAgICAgICAgLm9uKCdjbGljaycsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICQoXHJcbiAgICAgICAgJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCB0aW1lcGlja2VyLWNsb3NlIHdhdmVzLWVmZmVjdFwiIHR5cGU9XCJidXR0b25cIiB0YWJpbmRleD1cIicgK1xyXG4gICAgICAgICAgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyID8gJzMnIDogJzEnKSArXHJcbiAgICAgICAgICAnXCI+JyArXHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuaTE4bi5kb25lICtcclxuICAgICAgICAgICc8L2J1dHRvbj4nXHJcbiAgICAgIClcclxuICAgICAgICAuYXBwZW5kVG8oY29uZmlybWF0aW9uQnRuc0NvbnRhaW5lcilcclxuICAgICAgICAub24oJ2NsaWNrJywgdGhpcy5kb25lLmJpbmQodGhpcykpO1xyXG4gICAgICBjb25maXJtYXRpb25CdG5zQ29udGFpbmVyLmFwcGVuZFRvKHRoaXMuZm9vdGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBfY2xvY2tTZXR1cCgpIHtcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyKSB7XHJcbiAgICAgICAgdGhpcy4kYW1CdG4gPSAkKCc8ZGl2IGNsYXNzPVwiYW0tYnRuXCI+QU08L2Rpdj4nKTtcclxuICAgICAgICB0aGlzLiRwbUJ0biA9ICQoJzxkaXYgY2xhc3M9XCJwbS1idG5cIj5QTTwvZGl2PicpO1xyXG4gICAgICAgIHRoaXMuJGFtQnRuLm9uKCdjbGljaycsIHRoaXMuX2hhbmRsZUFtUG1DbGljay5iaW5kKHRoaXMpKS5hcHBlbmRUbyh0aGlzLnNwYW5BbVBtKTtcclxuICAgICAgICB0aGlzLiRwbUJ0bi5vbignY2xpY2snLCB0aGlzLl9oYW5kbGVBbVBtQ2xpY2suYmluZCh0aGlzKSkuYXBwZW5kVG8odGhpcy5zcGFuQW1QbSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2J1aWxkSG91cnNWaWV3KCk7XHJcbiAgICAgIHRoaXMuX2J1aWxkTWludXRlc1ZpZXcoKTtcclxuICAgICAgdGhpcy5fYnVpbGRTVkdDbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIF9idWlsZFNWR0Nsb2NrKCkge1xyXG4gICAgICAvLyBEcmF3IGNsb2NrIGhhbmRzIGFuZCBvdGhlcnNcclxuICAgICAgbGV0IGRpYWxSYWRpdXMgPSB0aGlzLm9wdGlvbnMuZGlhbFJhZGl1cztcclxuICAgICAgbGV0IHRpY2tSYWRpdXMgPSB0aGlzLm9wdGlvbnMudGlja1JhZGl1cztcclxuICAgICAgbGV0IGRpYW1ldGVyID0gZGlhbFJhZGl1cyAqIDI7XHJcblxyXG4gICAgICBsZXQgc3ZnID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ3N2ZycpO1xyXG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCdjbGFzcycsICd0aW1lcGlja2VyLXN2ZycpO1xyXG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGRpYW1ldGVyKTtcclxuICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZGlhbWV0ZXIpO1xyXG4gICAgICBsZXQgZyA9IFRpbWVwaWNrZXIuX2NyZWF0ZVNWR0VsKCdnJyk7XHJcbiAgICAgIGcuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBkaWFsUmFkaXVzICsgJywnICsgZGlhbFJhZGl1cyArICcpJyk7XHJcbiAgICAgIGxldCBiZWFyaW5nID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ2NpcmNsZScpO1xyXG4gICAgICBiZWFyaW5nLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAndGltZXBpY2tlci1jYW52YXMtYmVhcmluZycpO1xyXG4gICAgICBiZWFyaW5nLnNldEF0dHJpYnV0ZSgnY3gnLCAwKTtcclxuICAgICAgYmVhcmluZy5zZXRBdHRyaWJ1dGUoJ2N5JywgMCk7XHJcbiAgICAgIGJlYXJpbmcuc2V0QXR0cmlidXRlKCdyJywgNCk7XHJcbiAgICAgIGxldCBoYW5kID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ2xpbmUnKTtcclxuICAgICAgaGFuZC5zZXRBdHRyaWJ1dGUoJ3gxJywgMCk7XHJcbiAgICAgIGhhbmQuc2V0QXR0cmlidXRlKCd5MScsIDApO1xyXG4gICAgICBsZXQgYmcgPSBUaW1lcGlja2VyLl9jcmVhdGVTVkdFbCgnY2lyY2xlJyk7XHJcbiAgICAgIGJnLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAndGltZXBpY2tlci1jYW52YXMtYmcnKTtcclxuICAgICAgYmcuc2V0QXR0cmlidXRlKCdyJywgdGlja1JhZGl1cyk7XHJcbiAgICAgIGcuYXBwZW5kQ2hpbGQoaGFuZCk7XHJcbiAgICAgIGcuYXBwZW5kQ2hpbGQoYmcpO1xyXG4gICAgICBnLmFwcGVuZENoaWxkKGJlYXJpbmcpO1xyXG4gICAgICBzdmcuYXBwZW5kQ2hpbGQoZyk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5hcHBlbmRDaGlsZChzdmcpO1xyXG5cclxuICAgICAgdGhpcy5oYW5kID0gaGFuZDtcclxuICAgICAgdGhpcy5iZyA9IGJnO1xyXG4gICAgICB0aGlzLmJlYXJpbmcgPSBiZWFyaW5nO1xyXG4gICAgICB0aGlzLmcgPSBnO1xyXG4gICAgfVxyXG5cclxuICAgIF9idWlsZEhvdXJzVmlldygpIHtcclxuICAgICAgbGV0ICR0aWNrID0gJCgnPGRpdiBjbGFzcz1cInRpbWVwaWNrZXItdGlja1wiPjwvZGl2PicpO1xyXG4gICAgICAvLyBIb3VycyB2aWV3XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudHdlbHZlSG91cikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgMTM7IGkgKz0gMSkge1xyXG4gICAgICAgICAgbGV0IHRpY2sgPSAkdGljay5jbG9uZSgpO1xyXG4gICAgICAgICAgbGV0IHJhZGlhbiA9IGkgLyA2ICogTWF0aC5QSTtcclxuICAgICAgICAgIGxldCByYWRpdXMgPSB0aGlzLm9wdGlvbnMub3V0ZXJSYWRpdXM7XHJcbiAgICAgICAgICB0aWNrLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6XHJcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgKyBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6XHJcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgLSBNYXRoLmNvcyhyYWRpYW4pICogcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRpY2suaHRtbChpID09PSAwID8gJzAwJyA6IGkpO1xyXG4gICAgICAgICAgdGhpcy5ob3Vyc1ZpZXcuYXBwZW5kQ2hpbGQodGlja1swXSk7XHJcbiAgICAgICAgICAvLyB0aWNrLm9uKG1vdXNlZG93bkV2ZW50LCBtb3VzZWRvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI0OyBpICs9IDEpIHtcclxuICAgICAgICAgIGxldCB0aWNrID0gJHRpY2suY2xvbmUoKTtcclxuICAgICAgICAgIGxldCByYWRpYW4gPSBpIC8gNiAqIE1hdGguUEk7XHJcbiAgICAgICAgICBsZXQgaW5uZXIgPSBpID4gMCAmJiBpIDwgMTM7XHJcbiAgICAgICAgICBsZXQgcmFkaXVzID0gaW5uZXIgPyB0aGlzLm9wdGlvbnMuaW5uZXJSYWRpdXMgOiB0aGlzLm9wdGlvbnMub3V0ZXJSYWRpdXM7XHJcbiAgICAgICAgICB0aWNrLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6XHJcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgKyBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6XHJcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgLSBNYXRoLmNvcyhyYWRpYW4pICogcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRpY2suaHRtbChpID09PSAwID8gJzAwJyA6IGkpO1xyXG4gICAgICAgICAgdGhpcy5ob3Vyc1ZpZXcuYXBwZW5kQ2hpbGQodGlja1swXSk7XHJcbiAgICAgICAgICAvLyB0aWNrLm9uKG1vdXNlZG93bkV2ZW50LCBtb3VzZWRvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9idWlsZE1pbnV0ZXNWaWV3KCkge1xyXG4gICAgICBsZXQgJHRpY2sgPSAkKCc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci10aWNrXCI+PC9kaXY+Jyk7XHJcbiAgICAgIC8vIE1pbnV0ZXMgdmlld1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDYwOyBpICs9IDUpIHtcclxuICAgICAgICBsZXQgdGljayA9ICR0aWNrLmNsb25lKCk7XHJcbiAgICAgICAgbGV0IHJhZGlhbiA9IGkgLyAzMCAqIE1hdGguUEk7XHJcbiAgICAgICAgdGljay5jc3Moe1xyXG4gICAgICAgICAgbGVmdDpcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgK1xyXG4gICAgICAgICAgICBNYXRoLnNpbihyYWRpYW4pICogdGhpcy5vcHRpb25zLm91dGVyUmFkaXVzIC1cclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgK1xyXG4gICAgICAgICAgICAncHgnLFxyXG4gICAgICAgICAgdG9wOlxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlhbFJhZGl1cyAtXHJcbiAgICAgICAgICAgIE1hdGguY29zKHJhZGlhbikgKiB0aGlzLm9wdGlvbnMub3V0ZXJSYWRpdXMgLVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudGlja1JhZGl1cyArXHJcbiAgICAgICAgICAgICdweCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aWNrLmh0bWwoVGltZXBpY2tlci5fYWRkTGVhZGluZ1plcm8oaSkpO1xyXG4gICAgICAgIHRoaXMubWludXRlc1ZpZXcuYXBwZW5kQ2hpbGQodGlja1swXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGFuZGxlQW1QbUNsaWNrKGUpIHtcclxuICAgICAgbGV0ICRidG5DbGlja2VkID0gJChlLnRhcmdldCk7XHJcbiAgICAgIHRoaXMuYW1PclBtID0gJGJ0bkNsaWNrZWQuaGFzQ2xhc3MoJ2FtLWJ0bicpID8gJ0FNJyA6ICdQTSc7XHJcbiAgICAgIHRoaXMuX3VwZGF0ZUFtUG1WaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgX3VwZGF0ZUFtUG1WaWV3KCkge1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIpIHtcclxuICAgICAgICB0aGlzLiRhbUJ0bi50b2dnbGVDbGFzcygndGV4dC1wcmltYXJ5JywgdGhpcy5hbU9yUG0gPT09ICdBTScpO1xyXG4gICAgICAgIHRoaXMuJHBtQnRuLnRvZ2dsZUNsYXNzKCd0ZXh0LXByaW1hcnknLCB0aGlzLmFtT3JQbSA9PT0gJ1BNJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlVGltZUZyb21JbnB1dCgpIHtcclxuICAgICAgLy8gR2V0IHRoZSB0aW1lXHJcbiAgICAgIGxldCB2YWx1ZSA9ICgodGhpcy5lbC52YWx1ZSB8fCB0aGlzLm9wdGlvbnMuZGVmYXVsdFRpbWUgfHwgJycpICsgJycpLnNwbGl0KCc6Jyk7XHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudHdlbHZlSG91ciAmJiAhKHR5cGVvZiB2YWx1ZVsxXSA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlWzFdLnRvVXBwZXJDYXNlKCkuaW5kZXhPZignQU0nKSA+IDApIHtcclxuICAgICAgICAgIHRoaXMuYW1PclBtID0gJ0FNJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hbU9yUG0gPSAnUE0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZVsxXSA9IHZhbHVlWzFdLnJlcGxhY2UoJ0FNJywgJycpLnJlcGxhY2UoJ1BNJywgJycpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh2YWx1ZVswXSA9PT0gJ25vdycpIHtcclxuICAgICAgICBsZXQgbm93ID0gbmV3IERhdGUoK25ldyBEYXRlKCkgKyB0aGlzLm9wdGlvbnMuZnJvbU5vdyk7XHJcbiAgICAgICAgdmFsdWUgPSBbbm93LmdldEhvdXJzKCksIG5vdy5nZXRNaW51dGVzKCldO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudHdlbHZlSG91cikge1xyXG4gICAgICAgICAgdGhpcy5hbU9yUG0gPSB2YWx1ZVswXSA+PSAxMiAmJiB2YWx1ZVswXSA8IDI0ID8gJ1BNJyA6ICdBTSc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaG91cnMgPSArdmFsdWVbMF0gfHwgMDtcclxuICAgICAgdGhpcy5taW51dGVzID0gK3ZhbHVlWzFdIHx8IDA7XHJcbiAgICAgIHRoaXMuc3BhbkhvdXJzLmlubmVySFRNTCA9IHRoaXMuaG91cnM7XHJcbiAgICAgIHRoaXMuc3Bhbk1pbnV0ZXMuaW5uZXJIVE1MID0gVGltZXBpY2tlci5fYWRkTGVhZGluZ1plcm8odGhpcy5taW51dGVzKTtcclxuXHJcbiAgICAgIHRoaXMuX3VwZGF0ZUFtUG1WaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1ZpZXcodmlldywgZGVsYXkpIHtcclxuICAgICAgaWYgKHZpZXcgPT09ICdtaW51dGVzJyAmJiAkKHRoaXMuaG91cnNWaWV3KS5jc3MoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnKSB7XHJcbiAgICAgICAgLy8gcmFpc2VDYWxsYmFjayh0aGlzLm9wdGlvbnMuYmVmb3JlSG91clNlbGVjdCk7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGlzSG91cnMgPSB2aWV3ID09PSAnaG91cnMnLFxyXG4gICAgICAgIG5leHRWaWV3ID0gaXNIb3VycyA/IHRoaXMuaG91cnNWaWV3IDogdGhpcy5taW51dGVzVmlldyxcclxuICAgICAgICBoaWRlVmlldyA9IGlzSG91cnMgPyB0aGlzLm1pbnV0ZXNWaWV3IDogdGhpcy5ob3Vyc1ZpZXc7XHJcbiAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2aWV3O1xyXG5cclxuICAgICAgJCh0aGlzLnNwYW5Ib3VycykudG9nZ2xlQ2xhc3MoJ3RleHQtcHJpbWFyeScsIGlzSG91cnMpO1xyXG4gICAgICAkKHRoaXMuc3Bhbk1pbnV0ZXMpLnRvZ2dsZUNsYXNzKCd0ZXh0LXByaW1hcnknLCAhaXNIb3Vycyk7XHJcblxyXG4gICAgICAvLyBUcmFuc2l0aW9uIHZpZXdcclxuICAgICAgaGlkZVZpZXcuY2xhc3NMaXN0LmFkZCgndGltZXBpY2tlci1kaWFsLW91dCcpO1xyXG4gICAgICAkKG5leHRWaWV3KVxyXG4gICAgICAgIC5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCd0aW1lcGlja2VyLWRpYWwtb3V0Jyk7XHJcblxyXG4gICAgICAvLyBSZXNldCBjbG9jayBoYW5kXHJcbiAgICAgIHRoaXMucmVzZXRDbG9jayhkZWxheSk7XHJcblxyXG4gICAgICAvLyBBZnRlciB0cmFuc2l0aW9ucyBlbmRlZFxyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50b2dnbGVWaWV3VGltZXIpO1xyXG4gICAgICB0aGlzLnRvZ2dsZVZpZXdUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICQoaGlkZVZpZXcpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcclxuICAgICAgfSwgdGhpcy5vcHRpb25zLmR1cmF0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldENsb2NrKGRlbGF5KSB7XHJcbiAgICAgIGxldCB2aWV3ID0gdGhpcy5jdXJyZW50VmlldyxcclxuICAgICAgICB2YWx1ZSA9IHRoaXNbdmlld10sXHJcbiAgICAgICAgaXNIb3VycyA9IHZpZXcgPT09ICdob3VycycsXHJcbiAgICAgICAgdW5pdCA9IE1hdGguUEkgLyAoaXNIb3VycyA/IDYgOiAzMCksXHJcbiAgICAgICAgcmFkaWFuID0gdmFsdWUgKiB1bml0LFxyXG4gICAgICAgIHJhZGl1cyA9XHJcbiAgICAgICAgICBpc0hvdXJzICYmIHZhbHVlID4gMCAmJiB2YWx1ZSA8IDEzID8gdGhpcy5vcHRpb25zLmlubmVyUmFkaXVzIDogdGhpcy5vcHRpb25zLm91dGVyUmFkaXVzLFxyXG4gICAgICAgIHggPSBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzLFxyXG4gICAgICAgIHkgPSAtTWF0aC5jb3MocmFkaWFuKSAqIHJhZGl1cyxcclxuICAgICAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgIGlmIChkZWxheSkge1xyXG4gICAgICAgICQodGhpcy5jYW52YXMpLmFkZENsYXNzKCd0aW1lcGlja2VyLWNhbnZhcy1vdXQnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICQoc2VsZi5jYW52YXMpLnJlbW92ZUNsYXNzKCd0aW1lcGlja2VyLWNhbnZhcy1vdXQnKTtcclxuICAgICAgICAgIHNlbGYuc2V0SGFuZCh4LCB5KTtcclxuICAgICAgICB9LCBkZWxheSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZXRIYW5kKHgsIHkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SGFuZCh4LCB5LCByb3VuZEJ5NSkge1xyXG4gICAgICBsZXQgcmFkaWFuID0gTWF0aC5hdGFuMih4LCAteSksXHJcbiAgICAgICAgaXNIb3VycyA9IHRoaXMuY3VycmVudFZpZXcgPT09ICdob3VycycsXHJcbiAgICAgICAgdW5pdCA9IE1hdGguUEkgLyAoaXNIb3VycyB8fCByb3VuZEJ5NSA/IDYgOiAzMCksXHJcbiAgICAgICAgeiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSxcclxuICAgICAgICBpbm5lciA9IGlzSG91cnMgJiYgeiA8ICh0aGlzLm9wdGlvbnMub3V0ZXJSYWRpdXMgKyB0aGlzLm9wdGlvbnMuaW5uZXJSYWRpdXMpIC8gMixcclxuICAgICAgICByYWRpdXMgPSBpbm5lciA/IHRoaXMub3B0aW9ucy5pbm5lclJhZGl1cyA6IHRoaXMub3B0aW9ucy5vdXRlclJhZGl1cztcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudHdlbHZlSG91cikge1xyXG4gICAgICAgIHJhZGl1cyA9IHRoaXMub3B0aW9ucy5vdXRlclJhZGl1cztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmFkaWFuIHNob3VsZCBpbiByYW5nZSBbMCwgMlBJXVxyXG4gICAgICBpZiAocmFkaWFuIDwgMCkge1xyXG4gICAgICAgIHJhZGlhbiA9IE1hdGguUEkgKiAyICsgcmFkaWFuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHJvdW5kIHZhbHVlXHJcbiAgICAgIGxldCB2YWx1ZSA9IE1hdGgucm91bmQocmFkaWFuIC8gdW5pdCk7XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHJvdW5kIHJhZGlhblxyXG4gICAgICByYWRpYW4gPSB2YWx1ZSAqIHVuaXQ7XHJcblxyXG4gICAgICAvLyBDb3JyZWN0IHRoZSBob3VycyBvciBtaW51dGVzXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudHdlbHZlSG91cikge1xyXG4gICAgICAgIGlmIChpc0hvdXJzKSB7XHJcbiAgICAgICAgICBpZiAodmFsdWUgPT09IDApIHZhbHVlID0gMTI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChyb3VuZEJ5NSkgdmFsdWUgKj0gNTtcclxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gNjApIHZhbHVlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGlzSG91cnMpIHtcclxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMTIpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFsdWUgPSBpbm5lciA/ICh2YWx1ZSA9PT0gMCA/IDEyIDogdmFsdWUpIDogdmFsdWUgPT09IDAgPyAwIDogdmFsdWUgKyAxMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHJvdW5kQnk1KSB7XHJcbiAgICAgICAgICAgIHZhbHVlICo9IDU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodmFsdWUgPT09IDYwKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9uY2UgaG91cnMgb3IgbWludXRlcyBjaGFuZ2VkLCB2aWJyYXRlIHRoZSBkZXZpY2VcclxuICAgICAgaWYgKHRoaXNbdGhpcy5jdXJyZW50Vmlld10gIT09IHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmlicmF0ZSAmJiB0aGlzLm9wdGlvbnMudmlicmF0ZSkge1xyXG4gICAgICAgICAgLy8gRG8gbm90IHZpYnJhdGUgdG9vIGZyZXF1ZW50bHlcclxuICAgICAgICAgIGlmICghdGhpcy52aWJyYXRlVGltZXIpIHtcclxuICAgICAgICAgICAgbmF2aWdhdG9yW3RoaXMudmlicmF0ZV0oMTApO1xyXG4gICAgICAgICAgICB0aGlzLnZpYnJhdGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMudmlicmF0ZVRpbWVyID0gbnVsbDtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXNbdGhpcy5jdXJyZW50Vmlld10gPSB2YWx1ZTtcclxuICAgICAgaWYgKGlzSG91cnMpIHtcclxuICAgICAgICB0aGlzWydzcGFuSG91cnMnXS5pbm5lckhUTUwgPSB2YWx1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzWydzcGFuTWludXRlcyddLmlubmVySFRNTCA9IFRpbWVwaWNrZXIuX2FkZExlYWRpbmdaZXJvKHZhbHVlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IGNsb2NrIGhhbmQgYW5kIG90aGVycycgcG9zaXRpb25cclxuICAgICAgbGV0IGN4MSA9IE1hdGguc2luKHJhZGlhbikgKiAocmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMpLFxyXG4gICAgICAgIGN5MSA9IC1NYXRoLmNvcyhyYWRpYW4pICogKHJhZGl1cyAtIHRoaXMub3B0aW9ucy50aWNrUmFkaXVzKSxcclxuICAgICAgICBjeDIgPSBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzLFxyXG4gICAgICAgIGN5MiA9IC1NYXRoLmNvcyhyYWRpYW4pICogcmFkaXVzO1xyXG4gICAgICB0aGlzLmhhbmQuc2V0QXR0cmlidXRlKCd4MicsIGN4MSk7XHJcbiAgICAgIHRoaXMuaGFuZC5zZXRBdHRyaWJ1dGUoJ3kyJywgY3kxKTtcclxuICAgICAgdGhpcy5iZy5zZXRBdHRyaWJ1dGUoJ2N4JywgY3gyKTtcclxuICAgICAgdGhpcy5iZy5zZXRBdHRyaWJ1dGUoJ2N5JywgY3kyKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgdGhpcy5fdXBkYXRlVGltZUZyb21JbnB1dCgpO1xyXG4gICAgICB0aGlzLnNob3dWaWV3KCdob3VycycpO1xyXG5cclxuICAgICAgdGhpcy5tb2RhbC5vcGVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgIGlmICghdGhpcy5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIHRoaXMubW9kYWwuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmlzaCB0aW1lcGlja2VyIHNlbGVjdGlvbi5cclxuICAgICAqL1xyXG4gICAgZG9uZShlLCBjbGVhclZhbHVlKSB7XHJcbiAgICAgIC8vIFNldCBpbnB1dCB2YWx1ZVxyXG4gICAgICBsZXQgbGFzdCA9IHRoaXMuZWwudmFsdWU7XHJcbiAgICAgIGxldCB2YWx1ZSA9IGNsZWFyVmFsdWVcclxuICAgICAgICA/ICcnXHJcbiAgICAgICAgOiBUaW1lcGlja2VyLl9hZGRMZWFkaW5nWmVybyh0aGlzLmhvdXJzKSArICc6JyArIFRpbWVwaWNrZXIuX2FkZExlYWRpbmdaZXJvKHRoaXMubWludXRlcyk7XHJcbiAgICAgIHRoaXMudGltZSA9IHZhbHVlO1xyXG4gICAgICBpZiAoIWNsZWFyVmFsdWUgJiYgdGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIpIHtcclxuICAgICAgICB2YWx1ZSA9IGAke3ZhbHVlfSAke3RoaXMuYW1PclBtfWA7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5lbC52YWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgICAgLy8gVHJpZ2dlciBjaGFuZ2UgZXZlbnRcclxuICAgICAgaWYgKHZhbHVlICE9PSBsYXN0KSB7XHJcbiAgICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgdGhpcy5lbC5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICB0aGlzLmRvbmUobnVsbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUaW1lcGlja2VyLl90ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2IGNsYXNzPSBcIm1vZGFsIHRpbWVwaWNrZXItbW9kYWxcIj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50IHRpbWVwaWNrZXItY29udGFpbmVyXCI+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1kaWdpdGFsLWRpc3BsYXlcIj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLXRleHQtY29udGFpbmVyXCI+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1kaXNwbGF5LWNvbHVtblwiPicsXHJcbiAgICAnPHNwYW4gY2xhc3M9XCJ0aW1lcGlja2VyLXNwYW4taG91cnMgdGV4dC1wcmltYXJ5XCI+PC9zcGFuPicsXHJcbiAgICAnOicsXHJcbiAgICAnPHNwYW4gY2xhc3M9XCJ0aW1lcGlja2VyLXNwYW4tbWludXRlc1wiPjwvc3Bhbj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPGRpdiBjbGFzcz1cInRpbWVwaWNrZXItZGlzcGxheS1jb2x1bW4gdGltZXBpY2tlci1kaXNwbGF5LWFtLXBtXCI+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1zcGFuLWFtLXBtXCI+PC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1hbmFsb2ctZGlzcGxheVwiPicsXHJcbiAgICAnPGRpdiBjbGFzcz1cInRpbWVwaWNrZXItcGxhdGVcIj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLWNhbnZhc1wiPjwvZGl2PicsXHJcbiAgICAnPGRpdiBjbGFzcz1cInRpbWVwaWNrZXItZGlhbCB0aW1lcGlja2VyLWhvdXJzXCI+PC9kaXY+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1kaWFsIHRpbWVwaWNrZXItbWludXRlcyB0aW1lcGlja2VyLWRpYWwtb3V0XCI+PC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLWZvb3RlclwiPjwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PidcclxuICBdLmpvaW4oJycpO1xyXG5cclxuICBNLlRpbWVwaWNrZXIgPSBUaW1lcGlja2VyO1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoVGltZXBpY2tlciwgJ3RpbWVwaWNrZXInLCAnTV9UaW1lcGlja2VyJyk7XHJcbiAgfVxyXG59KShjYXNoKTtcclxuIl0sImZpbGUiOiJ0aW1lcGlja2VyLmpzIn0=
