/*!
 * Waves v0.6.4
 * http://fian.my.id/Waves
 *
 * Copyright 2014 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */

;(function(window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem, win,
            box = {top: 0, left: 0},
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function(e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = offset(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var scale       = 'scale('+((el.clientWidth / 100) * 10)+')';

            // Support for touch devices
            if ('touches' in e) {
              relativeY   = (e.touches[0].pageY - pos.top);
              relativeX   = (e.touches[0].pageX - pos.left);
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };

            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.className = ripple.className.replace('waves-notransition', '');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale;
            rippleStyle['-moz-transform'] = scale;
            rippleStyle['-ms-transform'] = scale;
            rippleStyle['-o-transform'] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity   = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-moz-transition-timing-function']    = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-o-transition-timing-function']      = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['transition-timing-function']         = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function(e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName('waves-ripple');
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');
            var scale       = ripple.getAttribute('data-scale');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {
                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                    '-webkit-transform': scale,
                    '-moz-transform': scale,
                    '-ms-transform': scale,
                    '-o-transform': scale,
                    'transform': scale,
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {
                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', elementStyle);

                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function(e) {
            var allow = true;

            if (e.type === 'touchstart') {
                TouchHandler.touches += 1; //push
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                setTimeout(function() {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function(e) {
            TouchHandler.allowEvent(e);
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentNode !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
                element = target;
                break;
            }
            target = target.parentNode;
        }
        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ('ontouchstart' in window) {
                element.addEventListener('touchend', Effect.hide, false);
                element.addEventListener('touchcancel', Effect.hide, false);
            }

            element.addEventListener('mouseup', Effect.hide, false);
            element.addEventListener('mouseleave', Effect.hide, false);
            element.addEventListener('dragend', Effect.hide, false);
        }
    }

    Waves.displayEffect = function(options) {
        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        if ('ontouchstart' in window) {
            document.body.addEventListener('touchstart', showEffect, false);
        }

        document.body.addEventListener('mousedown', showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function(element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === 'input') {
            Effect.wrapInput([element]);
            element = element.parentNode;
        }

        if ('ontouchstart' in window) {
            element.addEventListener('touchstart', showEffect, false);
        }

        element.addEventListener('mousedown', showEffect, false);
    };

    window.Waves = Waves;

    document.addEventListener('DOMContentLoaded', function() {
        Waves.displayEffect();
    }, false);

})(window);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ3YXZlcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogV2F2ZXMgdjAuNi40XHJcbiAqIGh0dHA6Ly9maWFuLm15LmlkL1dhdmVzXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE0IEFsZmlhbmEgRS4gU2lidWVhIGFuZCBvdGhlciBjb250cmlidXRvcnNcclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9maWFucy9XYXZlcy9ibG9iL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cclxuOyhmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgV2F2ZXMgPSBXYXZlcyB8fCB7fTtcclxuICAgIHZhciAkJCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwuYmluZChkb2N1bWVudCk7XHJcblxyXG4gICAgLy8gRmluZCBleGFjdCBwb3NpdGlvbiBvZiBlbGVtZW50XHJcbiAgICBmdW5jdGlvbiBpc1dpbmRvdyhvYmopIHtcclxuICAgICAgICByZXR1cm4gb2JqICE9PSBudWxsICYmIG9iaiA9PT0gb2JqLndpbmRvdztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRXaW5kb3coZWxlbSkge1xyXG4gICAgICAgIHJldHVybiBpc1dpbmRvdyhlbGVtKSA/IGVsZW0gOiBlbGVtLm5vZGVUeXBlID09PSA5ICYmIGVsZW0uZGVmYXVsdFZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb2Zmc2V0KGVsZW0pIHtcclxuICAgICAgICB2YXIgZG9jRWxlbSwgd2luLFxyXG4gICAgICAgICAgICBib3ggPSB7dG9wOiAwLCBsZWZ0OiAwfSxcclxuICAgICAgICAgICAgZG9jID0gZWxlbSAmJiBlbGVtLm93bmVyRG9jdW1lbnQ7XHJcblxyXG4gICAgICAgIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0ICE9PSB0eXBlb2YgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGJveCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbiA9IGdldFdpbmRvdyhkb2MpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvcDogYm94LnRvcCArIHdpbi5wYWdlWU9mZnNldCAtIGRvY0VsZW0uY2xpZW50VG9wLFxyXG4gICAgICAgICAgICBsZWZ0OiBib3gubGVmdCArIHdpbi5wYWdlWE9mZnNldCAtIGRvY0VsZW0uY2xpZW50TGVmdFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29udmVydFN0eWxlKG9iaikge1xyXG4gICAgICAgIHZhciBzdHlsZSA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBhIGluIG9iaikge1xyXG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGEpKSB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZSArPSAoYSArICc6JyArIG9ialthXSArICc7Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHlsZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgRWZmZWN0ID0ge1xyXG5cclxuICAgICAgICAvLyBFZmZlY3QgZGVsYXlcclxuICAgICAgICBkdXJhdGlvbjogNzUwLFxyXG5cclxuICAgICAgICBzaG93OiBmdW5jdGlvbihlLCBlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEaXNhYmxlIHJpZ2h0IGNsaWNrXHJcbiAgICAgICAgICAgIGlmIChlLmJ1dHRvbiA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZWwgPSBlbGVtZW50IHx8IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgcmlwcGxlXHJcbiAgICAgICAgICAgIHZhciByaXBwbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgcmlwcGxlLmNsYXNzTmFtZSA9ICd3YXZlcy1yaXBwbGUnO1xyXG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChyaXBwbGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gR2V0IGNsaWNrIGNvb3JkaW5hdGUgYW5kIGVsZW1lbnQgd2l0ZGhcclxuICAgICAgICAgICAgdmFyIHBvcyAgICAgICAgID0gb2Zmc2V0KGVsKTtcclxuICAgICAgICAgICAgdmFyIHJlbGF0aXZlWSAgID0gKGUucGFnZVkgLSBwb3MudG9wKTtcclxuICAgICAgICAgICAgdmFyIHJlbGF0aXZlWCAgID0gKGUucGFnZVggLSBwb3MubGVmdCk7XHJcbiAgICAgICAgICAgIHZhciBzY2FsZSAgICAgICA9ICdzY2FsZSgnKygoZWwuY2xpZW50V2lkdGggLyAxMDApICogMTApKycpJztcclxuXHJcbiAgICAgICAgICAgIC8vIFN1cHBvcnQgZm9yIHRvdWNoIGRldmljZXNcclxuICAgICAgICAgICAgaWYgKCd0b3VjaGVzJyBpbiBlKSB7XHJcbiAgICAgICAgICAgICAgcmVsYXRpdmVZICAgPSAoZS50b3VjaGVzWzBdLnBhZ2VZIC0gcG9zLnRvcCk7XHJcbiAgICAgICAgICAgICAgcmVsYXRpdmVYICAgPSAoZS50b3VjaGVzWzBdLnBhZ2VYIC0gcG9zLmxlZnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBdHRhY2ggZGF0YSB0byBlbGVtZW50XHJcbiAgICAgICAgICAgIHJpcHBsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaG9sZCcsIERhdGUubm93KCkpO1xyXG4gICAgICAgICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdkYXRhLXNjYWxlJywgc2NhbGUpO1xyXG4gICAgICAgICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCByZWxhdGl2ZVgpO1xyXG4gICAgICAgICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdkYXRhLXknLCByZWxhdGl2ZVkpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHJpcHBsZSBwb3NpdGlvblxyXG4gICAgICAgICAgICB2YXIgcmlwcGxlU3R5bGUgPSB7XHJcbiAgICAgICAgICAgICAgICAndG9wJzogcmVsYXRpdmVZKydweCcsXHJcbiAgICAgICAgICAgICAgICAnbGVmdCc6IHJlbGF0aXZlWCsncHgnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByaXBwbGUuY2xhc3NOYW1lID0gcmlwcGxlLmNsYXNzTmFtZSArICcgd2F2ZXMtbm90cmFuc2l0aW9uJztcclxuICAgICAgICAgICAgcmlwcGxlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBjb252ZXJ0U3R5bGUocmlwcGxlU3R5bGUpKTtcclxuICAgICAgICAgICAgcmlwcGxlLmNsYXNzTmFtZSA9IHJpcHBsZS5jbGFzc05hbWUucmVwbGFjZSgnd2F2ZXMtbm90cmFuc2l0aW9uJywgJycpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2NhbGUgdGhlIHJpcHBsZVxyXG4gICAgICAgICAgICByaXBwbGVTdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9IHNjYWxlO1xyXG4gICAgICAgICAgICByaXBwbGVTdHlsZVsnLW1vei10cmFuc2Zvcm0nXSA9IHNjYWxlO1xyXG4gICAgICAgICAgICByaXBwbGVTdHlsZVsnLW1zLXRyYW5zZm9ybSddID0gc2NhbGU7XHJcbiAgICAgICAgICAgIHJpcHBsZVN0eWxlWyctby10cmFuc2Zvcm0nXSA9IHNjYWxlO1xyXG4gICAgICAgICAgICByaXBwbGVTdHlsZS50cmFuc2Zvcm0gPSBzY2FsZTtcclxuICAgICAgICAgICAgcmlwcGxlU3R5bGUub3BhY2l0eSAgID0gJzEnO1xyXG5cclxuICAgICAgICAgICAgcmlwcGxlU3R5bGVbJy13ZWJraXQtdHJhbnNpdGlvbi1kdXJhdGlvbiddID0gRWZmZWN0LmR1cmF0aW9uICsgJ21zJztcclxuICAgICAgICAgICAgcmlwcGxlU3R5bGVbJy1tb3otdHJhbnNpdGlvbi1kdXJhdGlvbiddICAgID0gRWZmZWN0LmR1cmF0aW9uICsgJ21zJztcclxuICAgICAgICAgICAgcmlwcGxlU3R5bGVbJy1vLXRyYW5zaXRpb24tZHVyYXRpb24nXSAgICAgID0gRWZmZWN0LmR1cmF0aW9uICsgJ21zJztcclxuICAgICAgICAgICAgcmlwcGxlU3R5bGVbJ3RyYW5zaXRpb24tZHVyYXRpb24nXSAgICAgICAgID0gRWZmZWN0LmR1cmF0aW9uICsgJ21zJztcclxuXHJcbiAgICAgICAgICAgIHJpcHBsZVN0eWxlWyctd2Via2l0LXRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJ10gPSAnY3ViaWMtYmV6aWVyKDAuMjUwLCAwLjQ2MCwgMC40NTAsIDAuOTQwKSc7XHJcbiAgICAgICAgICAgIHJpcHBsZVN0eWxlWyctbW96LXRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJ10gICAgPSAnY3ViaWMtYmV6aWVyKDAuMjUwLCAwLjQ2MCwgMC40NTAsIDAuOTQwKSc7XHJcbiAgICAgICAgICAgIHJpcHBsZVN0eWxlWyctby10cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbiddICAgICAgPSAnY3ViaWMtYmV6aWVyKDAuMjUwLCAwLjQ2MCwgMC40NTAsIDAuOTQwKSc7XHJcbiAgICAgICAgICAgIHJpcHBsZVN0eWxlWyd0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbiddICAgICAgICAgPSAnY3ViaWMtYmV6aWVyKDAuMjUwLCAwLjQ2MCwgMC40NTAsIDAuOTQwKSc7XHJcblxyXG4gICAgICAgICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGNvbnZlcnRTdHlsZShyaXBwbGVTdHlsZSkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgVG91Y2hIYW5kbGVyLnRvdWNodXAoZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZWwgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBlbC5jbGllbnRXaWR0aCAqIDEuNDtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBmaXJzdCByaXBwbGVcclxuICAgICAgICAgICAgdmFyIHJpcHBsZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciByaXBwbGVzID0gZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2F2ZXMtcmlwcGxlJyk7XHJcbiAgICAgICAgICAgIGlmIChyaXBwbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJpcHBsZSA9IHJpcHBsZXNbcmlwcGxlcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHJlbGF0aXZlWCAgID0gcmlwcGxlLmdldEF0dHJpYnV0ZSgnZGF0YS14Jyk7XHJcbiAgICAgICAgICAgIHZhciByZWxhdGl2ZVkgICA9IHJpcHBsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpO1xyXG4gICAgICAgICAgICB2YXIgc2NhbGUgICAgICAgPSByaXBwbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXNjYWxlJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgZGVsYXkgYmVldHdlZW4gbW91c2Vkb3duIGFuZCBtb3VzZSBsZWF2ZVxyXG4gICAgICAgICAgICB2YXIgZGlmZiA9IERhdGUubm93KCkgLSBOdW1iZXIocmlwcGxlLmdldEF0dHJpYnV0ZSgnZGF0YS1ob2xkJykpO1xyXG4gICAgICAgICAgICB2YXIgZGVsYXkgPSAzNTAgLSBkaWZmO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlbGF5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZGVsYXkgPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBGYWRlIG91dCByaXBwbGUgYWZ0ZXIgZGVsYXlcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAndG9wJzogcmVsYXRpdmVZKydweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnOiByZWxhdGl2ZVgrJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAnb3BhY2l0eSc6ICcwJyxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRHVyYXRpb25cclxuICAgICAgICAgICAgICAgICAgICAnLXdlYmtpdC10cmFuc2l0aW9uLWR1cmF0aW9uJzogRWZmZWN0LmR1cmF0aW9uICsgJ21zJyxcclxuICAgICAgICAgICAgICAgICAgICAnLW1vei10cmFuc2l0aW9uLWR1cmF0aW9uJzogRWZmZWN0LmR1cmF0aW9uICsgJ21zJyxcclxuICAgICAgICAgICAgICAgICAgICAnLW8tdHJhbnNpdGlvbi1kdXJhdGlvbic6IEVmZmVjdC5kdXJhdGlvbiArICdtcycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zaXRpb24tZHVyYXRpb24nOiBFZmZlY3QuZHVyYXRpb24gKyAnbXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICctd2Via2l0LXRyYW5zZm9ybSc6IHNjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICctbW96LXRyYW5zZm9ybSc6IHNjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICctbXMtdHJhbnNmb3JtJzogc2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgJy1vLXRyYW5zZm9ybSc6IHNjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiBzY2FsZSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcmlwcGxlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBjb252ZXJ0U3R5bGUoc3R5bGUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNoaWxkKHJpcHBsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCBFZmZlY3QuZHVyYXRpb24pO1xyXG4gICAgICAgICAgICB9LCBkZWxheSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gTGl0dGxlIGhhY2sgdG8gbWFrZSA8aW5wdXQ+IGNhbiBwZXJmb3JtIHdhdmVzIGVmZmVjdFxyXG4gICAgICAgIHdyYXBJbnB1dDogZnVuY3Rpb24oZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCBlbGVtZW50cy5sZW5ndGg7IGErKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZWxlbWVudHNbYV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBpbnB1dCBhbHJlYWR5IGhhdmUgcGFyZW50IGp1c3QgcGFzcyB0aHJvdWdoXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpJyAmJiBwYXJlbnQuY2xhc3NOYW1lLmluZGV4T2YoJ3dhdmVzLWVmZmVjdCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFB1dCBlbGVtZW50IGNsYXNzIGFuZCBzdHlsZSB0byB0aGUgc3BlY2lmaWVkIHBhcmVudFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lICsgJyB3YXZlcy1pbnB1dC13cmFwcGVyJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRTdHlsZSA9IGVsLmdldEF0dHJpYnV0ZSgnc3R5bGUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50U3R5bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFN0eWxlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlbGVtZW50U3R5bGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc05hbWUgPSAnd2F2ZXMtYnV0dG9uLWlucHV0JztcclxuICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFB1dCBlbGVtZW50IGFzIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZCh3cmFwcGVyLCBlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc2FibGUgbW91c2Vkb3duIGV2ZW50IGZvciA1MDBtcyBkdXJpbmcgYW5kIGFmdGVyIHRvdWNoXHJcbiAgICAgKi9cclxuICAgIHZhciBUb3VjaEhhbmRsZXIgPSB7XHJcbiAgICAgICAgLyogdXNlcyBhbiBpbnRlZ2VyIHJhdGhlciB0aGFuIGJvb2wgc28gdGhlcmUncyBubyBpc3N1ZXMgd2l0aFxyXG4gICAgICAgICAqIG5lZWRpbmcgdG8gY2xlYXIgdGltZW91dHMgaWYgYW5vdGhlciB0b3VjaCBldmVudCBvY2N1cnJlZFxyXG4gICAgICAgICAqIHdpdGhpbiB0aGUgNTAwbXMuIENhbm5vdCBtb3VzZXVwIGJldHdlZW4gdG91Y2hzdGFydCBhbmRcclxuICAgICAgICAgKiB0b3VjaGVuZCwgbm9yIGluIHRoZSA1MDBtcyBhZnRlciB0b3VjaGVuZC4gKi9cclxuICAgICAgICB0b3VjaGVzOiAwLFxyXG4gICAgICAgIGFsbG93RXZlbnQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGFsbG93ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChlLnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xyXG4gICAgICAgICAgICAgICAgVG91Y2hIYW5kbGVyLnRvdWNoZXMgKz0gMTsgLy9wdXNoXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnIHx8IGUudHlwZSA9PT0gJ3RvdWNoY2FuY2VsJykge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoVG91Y2hIYW5kbGVyLnRvdWNoZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvdWNoSGFuZGxlci50b3VjaGVzIC09IDE7IC8vcG9wIGFmdGVyIDUwMG1zXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdtb3VzZWRvd24nICYmIFRvdWNoSGFuZGxlci50b3VjaGVzID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYWxsb3cgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGFsbG93O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG91Y2h1cDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBUb3VjaEhhbmRsZXIuYWxsb3dFdmVudChlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGVnYXRlZCBjbGljayBoYW5kbGVyIGZvciAud2F2ZXMtZWZmZWN0IGVsZW1lbnQuXHJcbiAgICAgKiByZXR1cm5zIG51bGwgd2hlbiAud2F2ZXMtZWZmZWN0IGVsZW1lbnQgbm90IGluIFwiY2xpY2sgdHJlZVwiXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFdhdmVzRWZmZWN0RWxlbWVudChlKSB7XHJcbiAgICAgICAgaWYgKFRvdWNoSGFuZGxlci5hbGxvd0V2ZW50KGUpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG5cclxuICAgICAgICB3aGlsZSAodGFyZ2V0LnBhcmVudE5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkgJiYgdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCd3YXZlcy1lZmZlY3QnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCdWJibGUgdGhlIGNsaWNrIGFuZCBzaG93IGVmZmVjdCBpZiAud2F2ZXMtZWZmZWN0IGVsZW0gd2FzIGZvdW5kXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNob3dFZmZlY3QoZSkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZ2V0V2F2ZXNFZmZlY3RFbGVtZW50KGUpO1xyXG5cclxuICAgICAgICBpZiAoZWxlbWVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBFZmZlY3Quc2hvdyhlLCBlbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBFZmZlY3QuaGlkZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIEVmZmVjdC5oaWRlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIEVmZmVjdC5oaWRlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIEVmZmVjdC5oaWRlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIEVmZmVjdC5oaWRlLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFdhdmVzLmRpc3BsYXlFZmZlY3QgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG4gICAgICAgIGlmICgnZHVyYXRpb24nIGluIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgRWZmZWN0LmR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vV3JhcCBpbnB1dCBpbnNpZGUgPGk+IHRhZ1xyXG4gICAgICAgIEVmZmVjdC53cmFwSW5wdXQoJCQoJy53YXZlcy1lZmZlY3QnKSk7XHJcblxyXG4gICAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc2hvd0VmZmVjdCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBzaG93RWZmZWN0LCBmYWxzZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIFdhdmVzIHRvIGFuIGlucHV0IGVsZW1lbnQgKG9yIGFueSBlbGVtZW50IHdoaWNoIGRvZXNuJ3RcclxuICAgICAqIGJ1YmJsZSBtb3VzZXVwL21vdXNlZG93biBldmVudHMpLlxyXG4gICAgICogICBJbnRlbmRlZCB0byBiZSB1c2VkIHdpdGggZHluYW1pY2FsbHkgbG9hZGVkIGZvcm1zL2lucHV0cywgb3JcclxuICAgICAqIHdoZXJlIHRoZSB1c2VyIGRvZXNuJ3Qgd2FudCBhIGRlbGVnYXRlZCBjbGljayBoYW5kbGVyLlxyXG4gICAgICovXHJcbiAgICBXYXZlcy5hdHRhY2ggPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgLy9GVVRVUkU6IGF1dG9tYXRpY2FsbHkgYWRkIHdhdmVzIGNsYXNzZXMgYW5kIGFsbG93IHVzZXJzXHJcbiAgICAgICAgLy8gdG8gc3BlY2lmeSB0aGVtIHdpdGggYW4gb3B0aW9ucyBwYXJhbT8gRWcuIGxpZ2h0L2NsYXNzaWMvYnV0dG9uXHJcbiAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW5wdXQnKSB7XHJcbiAgICAgICAgICAgIEVmZmVjdC53cmFwSW5wdXQoW2VsZW1lbnRdKTtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc2hvd0VmZmVjdCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBzaG93RWZmZWN0LCBmYWxzZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5XYXZlcyA9IFdhdmVzO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBXYXZlcy5kaXNwbGF5RWZmZWN0KCk7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG59KSh3aW5kb3cpO1xyXG4iXSwiZmlsZSI6IndhdmVzLmpzIn0=
