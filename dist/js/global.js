// Required for Meteor package, the use of window prevents export by Meteor
(function(window) {
  if (window.Package) {
    M = {};
  } else {
    window.M = {};
  }

  // Check for jQuery
  M.jQueryLoaded = !!window.jQuery;
})(window);

// AMD
if (typeof define === 'function' && define.amd) {
  define('M', [], function() {
    return M;
  });

  // Common JS
} else if (typeof exports !== 'undefined' && !exports.nodeType) {
  if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
    exports = module.exports = M;
  }
  exports.default = M;
}

M.version = '1.0.0';

M.keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};

/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
M.keyDown = false;
let docHandleKeydown = function(e) {
  M.keyDown = true;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = true;
  }
};
let docHandleKeyup = function(e) {
  M.keyDown = false;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = false;
  }
};
let docHandleFocus = function(e) {
  if (M.keyDown) {
    document.body.classList.add('keyboard-focused');
  }
};
let docHandleBlur = function(e) {
  document.body.classList.remove('keyboard-focused');
};
document.addEventListener('keydown', docHandleKeydown, true);
document.addEventListener('keyup', docHandleKeyup, true);
document.addEventListener('focus', docHandleFocus, true);
document.addEventListener('blur', docHandleBlur, true);

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function(plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function(methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      let params = Array.prototype.slice.call(arguments, 1);

      // Getter methods
      if (methodOrOptions.slice(0, 3) === 'get') {
        let instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, params);
      }

      // Void methods
      return this.each(function() {
        let instance = this[classRef];
        instance[methodOrOptions].apply(instance, params);
      });

      // Initialize plugin if options or no argument is passed in
    } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      plugin.init(this, arguments[0]);
      return this;
    }

    // Return error if an unrecognized  method name is passed in
    jQuery.error(`Method ${methodOrOptions} does not exist on jQuery.${pluginName}`);
  };
};

/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function(context) {
  // Use document.body if no context is given
  let root = !!context ? context : document.body;

  let registry = {
    Autocomplete: root.querySelectorAll('.autocomplete:not(.no-autoinit)'),
    Carousel: root.querySelectorAll('.carousel:not(.no-autoinit)'),
    Chips: root.querySelectorAll('.chips:not(.no-autoinit)'),
    Collapsible: root.querySelectorAll('.collapsible:not(.no-autoinit)'),
    Datepicker: root.querySelectorAll('.datepicker:not(.no-autoinit)'),
    Dropdown: root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'),
    Materialbox: root.querySelectorAll('.materialboxed:not(.no-autoinit)'),
    Modal: root.querySelectorAll('.modal:not(.no-autoinit)'),
    Parallax: root.querySelectorAll('.parallax:not(.no-autoinit)'),
    Pushpin: root.querySelectorAll('.pushpin:not(.no-autoinit)'),
    ScrollSpy: root.querySelectorAll('.scrollspy:not(.no-autoinit)'),
    FormSelect: root.querySelectorAll('select:not(.no-autoinit)'),
    Sidenav: root.querySelectorAll('.sidenav:not(.no-autoinit)'),
    Tabs: root.querySelectorAll('.tabs:not(.no-autoinit)'),
    TapTarget: root.querySelectorAll('.tap-target:not(.no-autoinit)'),
    Timepicker: root.querySelectorAll('.timepicker:not(.no-autoinit)'),
    Tooltip: root.querySelectorAll('.tooltipped:not(.no-autoinit)'),
    FloatingActionButton: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)')
  };

  for (let pluginName in registry) {
    let plugin = M[pluginName];
    plugin.init(registry[pluginName]);
  }
};

/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function(obj) {
  let tagStr = obj.prop('tagName') || '';
  let idStr = obj.attr('id') || '';
  let classStr = obj.attr('class') || '';
  return (tagStr + idStr + classStr).replace(/\s/g, '');
};

// Unique Random ID
M.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
})();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function(hash) {
  return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, '\\$1');
};

M.elementOrParentIsFixed = function(element) {
  let $element = $(element);
  let $checkElements = $element.add($element.parents());
  let isFixed = false;
  $checkElements.each(function() {
    if ($(this).css('position') === 'fixed') {
      isFixed = true;
      return false;
    }
  });
  return isFixed;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Escapes hash from special characters
 * @param {Element} container  Container element that acts as the boundary
 * @param {Bounding} bounding  element bounding that is being checked
 * @param {Number} offset  offset from edge that counts as exceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function(container, bounding, offset) {
  let edges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  let containerRect = container.getBoundingClientRect();
  // If body element is smaller than viewport, use viewport height instead.
  let containerBottom =
    container === document.body
      ? Math.max(containerRect.bottom, window.innerHeight)
      : containerRect.bottom;

  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;

  let scrolledX = bounding.left - scrollLeft;
  let scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset || scrolledX < offset) {
    edges.left = true;
  }

  if (
    scrolledX + bounding.width > containerRect.right - offset ||
    scrolledX + bounding.width > window.innerWidth - offset
  ) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset || scrolledY < offset) {
    edges.top = true;
  }

  if (
    scrolledY + bounding.height > containerBottom - offset ||
    scrolledY + bounding.height > window.innerHeight - offset
  ) {
    edges.bottom = true;
  }

  return edges;
};

M.checkPossibleAlignments = function(el, container, bounding, offset) {
  let canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null
  };

  let containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
  let containerRect = container.getBoundingClientRect();
  let containerHeight = Math.min(containerRect.height, window.innerHeight);
  let containerWidth = Math.min(containerRect.width, window.innerWidth);
  let elOffsetRect = el.getBoundingClientRect();

  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;

  let scrolledX = bounding.left - scrollLeft;
  let scrolledYTopEdge = bounding.top - scrollTop;
  let scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow
    ? containerWidth - (scrolledX + bounding.width)
    : window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow
    ? scrolledX - bounding.width + elOffsetRect.width
    : elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow
    ? containerHeight - (scrolledYTopEdge + bounding.height + offset)
    : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow
    ? scrolledYBottomEdge - (bounding.height - offset)
    : elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};

M.getOverflowParent = function(element) {
  if (element == null) {
    return null;
  }

  if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
    return element;
  }

  return M.getOverflowParent(element.parentElement);
};

/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function(trigger) {
  let id = trigger.getAttribute('data-target');
  if (!id) {
    id = trigger.getAttribute('href');
    if (id) {
      id = id.slice(1);
    } else {
      id = '';
    }
  }
  return id;
};

/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function() {
  return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
let getTime =
  Date.now ||
  function() {
    return new Date().getTime();
  };

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function(func, wait, options) {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  options || (options = {});
  let later = function() {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function() {
    let now = getTime();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnbG9iYWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUmVxdWlyZWQgZm9yIE1ldGVvciBwYWNrYWdlLCB0aGUgdXNlIG9mIHdpbmRvdyBwcmV2ZW50cyBleHBvcnQgYnkgTWV0ZW9yXHJcbihmdW5jdGlvbih3aW5kb3cpIHtcclxuICBpZiAod2luZG93LlBhY2thZ2UpIHtcclxuICAgIE0gPSB7fTtcclxuICB9IGVsc2Uge1xyXG4gICAgd2luZG93Lk0gPSB7fTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGZvciBqUXVlcnlcclxuICBNLmpRdWVyeUxvYWRlZCA9ICEhd2luZG93LmpRdWVyeTtcclxufSkod2luZG93KTtcclxuXHJcbi8vIEFNRFxyXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgZGVmaW5lKCdNJywgW10sIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIE07XHJcbiAgfSk7XHJcblxyXG4gIC8vIENvbW1vbiBKU1xyXG59IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiAhZXhwb3J0cy5ub2RlVHlwZSkge1xyXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBNO1xyXG4gIH1cclxuICBleHBvcnRzLmRlZmF1bHQgPSBNO1xyXG59XHJcblxyXG5NLnZlcnNpb24gPSAnMS4wLjAnO1xyXG5cclxuTS5rZXlzID0ge1xyXG4gIFRBQjogOSxcclxuICBFTlRFUjogMTMsXHJcbiAgRVNDOiAyNyxcclxuICBBUlJPV19VUDogMzgsXHJcbiAgQVJST1dfRE9XTjogNDBcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUYWJQcmVzcyBLZXlkb3duIGhhbmRsZXJcclxuICovXHJcbk0udGFiUHJlc3NlZCA9IGZhbHNlO1xyXG5NLmtleURvd24gPSBmYWxzZTtcclxubGV0IGRvY0hhbmRsZUtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgTS5rZXlEb3duID0gdHJ1ZTtcclxuICBpZiAoZS53aGljaCA9PT0gTS5rZXlzLlRBQiB8fCBlLndoaWNoID09PSBNLmtleXMuQVJST1dfRE9XTiB8fCBlLndoaWNoID09PSBNLmtleXMuQVJST1dfVVApIHtcclxuICAgIE0udGFiUHJlc3NlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5sZXQgZG9jSGFuZGxlS2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgTS5rZXlEb3duID0gZmFsc2U7XHJcbiAgaWYgKGUud2hpY2ggPT09IE0ua2V5cy5UQUIgfHwgZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX0RPV04gfHwgZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX1VQKSB7XHJcbiAgICBNLnRhYlByZXNzZWQgPSBmYWxzZTtcclxuICB9XHJcbn07XHJcbmxldCBkb2NIYW5kbGVGb2N1cyA9IGZ1bmN0aW9uKGUpIHtcclxuICBpZiAoTS5rZXlEb3duKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2tleWJvYXJkLWZvY3VzZWQnKTtcclxuICB9XHJcbn07XHJcbmxldCBkb2NIYW5kbGVCbHVyID0gZnVuY3Rpb24oZSkge1xyXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgna2V5Ym9hcmQtZm9jdXNlZCcpO1xyXG59O1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG9jSGFuZGxlS2V5ZG93biwgdHJ1ZSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZG9jSGFuZGxlS2V5dXAsIHRydWUpO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGRvY0hhbmRsZUZvY3VzLCB0cnVlKTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGRvY0hhbmRsZUJsdXIsIHRydWUpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgalF1ZXJ5IHdyYXBwZXIgZm9yIHBsdWdpblxyXG4gKiBAcGFyYW0ge0NsYXNzfSBwbHVnaW4gIGphdmFzY3JpcHQgY2xhc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHBsdWdpbk5hbWUgIGpRdWVyeSBwbHVnaW4gbmFtZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NSZWYgIENsYXNzIHJlZmVyZW5jZSBuYW1lXHJcbiAqL1xyXG5NLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyID0gZnVuY3Rpb24ocGx1Z2luLCBwbHVnaW5OYW1lLCBjbGFzc1JlZikge1xyXG4gIGpRdWVyeS5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKG1ldGhvZE9yT3B0aW9ucykge1xyXG4gICAgLy8gQ2FsbCBwbHVnaW4gbWV0aG9kIGlmIHZhbGlkIG1ldGhvZCBuYW1lIGlzIHBhc3NlZCBpblxyXG4gICAgaWYgKHBsdWdpbi5wcm90b3R5cGVbbWV0aG9kT3JPcHRpb25zXSkge1xyXG4gICAgICBsZXQgcGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuXHJcbiAgICAgIC8vIEdldHRlciBtZXRob2RzXHJcbiAgICAgIGlmIChtZXRob2RPck9wdGlvbnMuc2xpY2UoMCwgMykgPT09ICdnZXQnKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcy5maXJzdCgpWzBdW2NsYXNzUmVmXTtcclxuICAgICAgICByZXR1cm4gaW5zdGFuY2VbbWV0aG9kT3JPcHRpb25zXS5hcHBseShpbnN0YW5jZSwgcGFyYW1zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVm9pZCBtZXRob2RzXHJcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpc1tjbGFzc1JlZl07XHJcbiAgICAgICAgaW5zdGFuY2VbbWV0aG9kT3JPcHRpb25zXS5hcHBseShpbnN0YW5jZSwgcGFyYW1zKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBJbml0aWFsaXplIHBsdWdpbiBpZiBvcHRpb25zIG9yIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCBpblxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWV0aG9kT3JPcHRpb25zID09PSAnb2JqZWN0JyB8fCAhbWV0aG9kT3JPcHRpb25zKSB7XHJcbiAgICAgIHBsdWdpbi5pbml0KHRoaXMsIGFyZ3VtZW50c1swXSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiBlcnJvciBpZiBhbiB1bnJlY29nbml6ZWQgIG1ldGhvZCBuYW1lIGlzIHBhc3NlZCBpblxyXG4gICAgalF1ZXJ5LmVycm9yKGBNZXRob2QgJHttZXRob2RPck9wdGlvbnN9IGRvZXMgbm90IGV4aXN0IG9uIGpRdWVyeS4ke3BsdWdpbk5hbWV9YCk7XHJcbiAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBdXRvbWF0aWNhbGx5IGluaXRpYWxpemUgY29tcG9uZW50c1xyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRleHQgIERPTSBFbGVtZW50IHRvIHNlYXJjaCB3aXRoaW4gZm9yIGNvbXBvbmVudHNcclxuICovXHJcbk0uQXV0b0luaXQgPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgLy8gVXNlIGRvY3VtZW50LmJvZHkgaWYgbm8gY29udGV4dCBpcyBnaXZlblxyXG4gIGxldCByb290ID0gISFjb250ZXh0ID8gY29udGV4dCA6IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gIGxldCByZWdpc3RyeSA9IHtcclxuICAgIEF1dG9jb21wbGV0ZTogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBDYXJvdXNlbDogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWw6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIENoaXBzOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGlwczpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgQ29sbGFwc2libGU6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmNvbGxhcHNpYmxlOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBEYXRlcGlja2VyOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXRlcGlja2VyOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBEcm9wZG93bjogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZHJvcGRvd24tdHJpZ2dlcjpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgTWF0ZXJpYWxib3g6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLm1hdGVyaWFsYm94ZWQ6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIE1vZGFsOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tb2RhbDpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgUGFyYWxsYXg6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLnBhcmFsbGF4Om5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBQdXNocGluOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wdXNocGluOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBTY3JvbGxTcHk6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLnNjcm9sbHNweTpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgRm9ybVNlbGVjdDogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCdzZWxlY3Q6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIFNpZGVuYXY6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLnNpZGVuYXY6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIFRhYnM6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLnRhYnM6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIFRhcFRhcmdldDogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcudGFwLXRhcmdldDpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgVGltZXBpY2tlcjogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcudGltZXBpY2tlcjpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgVG9vbHRpcDogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcudG9vbHRpcHBlZDpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgRmxvYXRpbmdBY3Rpb25CdXR0b246IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmZpeGVkLWFjdGlvbi1idG46bm90KC5uby1hdXRvaW5pdCknKVxyXG4gIH07XHJcblxyXG4gIGZvciAobGV0IHBsdWdpbk5hbWUgaW4gcmVnaXN0cnkpIHtcclxuICAgIGxldCBwbHVnaW4gPSBNW3BsdWdpbk5hbWVdO1xyXG4gICAgcGx1Z2luLmluaXQocmVnaXN0cnlbcGx1Z2luTmFtZV0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSBhcHByb3hpbWF0ZWQgc2VsZWN0b3Igc3RyaW5nIGZvciBhIGpRdWVyeSBvYmplY3RcclxuICogQHBhcmFtIHtqUXVlcnl9IG9iaiAgalF1ZXJ5IG9iamVjdCB0byBiZSBwYXJzZWRcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbk0ub2JqZWN0U2VsZWN0b3JTdHJpbmcgPSBmdW5jdGlvbihvYmopIHtcclxuICBsZXQgdGFnU3RyID0gb2JqLnByb3AoJ3RhZ05hbWUnKSB8fCAnJztcclxuICBsZXQgaWRTdHIgPSBvYmouYXR0cignaWQnKSB8fCAnJztcclxuICBsZXQgY2xhc3NTdHIgPSBvYmouYXR0cignY2xhc3MnKSB8fCAnJztcclxuICByZXR1cm4gKHRhZ1N0ciArIGlkU3RyICsgY2xhc3NTdHIpLnJlcGxhY2UoL1xccy9nLCAnJyk7XHJcbn07XHJcblxyXG4vLyBVbmlxdWUgUmFuZG9tIElEXHJcbk0uZ3VpZCA9IChmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBzNCgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxyXG4gICAgICAudG9TdHJpbmcoMTYpXHJcbiAgICAgIC5zdWJzdHJpbmcoMSk7XHJcbiAgfVxyXG4gIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBzNCgpICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcclxuICB9O1xyXG59KSgpO1xyXG5cclxuLyoqXHJcbiAqIEVzY2FwZXMgaGFzaCBmcm9tIHNwZWNpYWwgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaCAgU3RyaW5nIHJldHVybmVkIGZyb20gdGhpcy5oYXNoXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5NLmVzY2FwZUhhc2ggPSBmdW5jdGlvbihoYXNoKSB7XHJcbiAgcmV0dXJuIGhhc2gucmVwbGFjZSgvKDp8XFwufFxcW3xcXF18LHw9fFxcLykvZywgJ1xcXFwkMScpO1xyXG59O1xyXG5cclxuTS5lbGVtZW50T3JQYXJlbnRJc0ZpeGVkID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gIGxldCAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgbGV0ICRjaGVja0VsZW1lbnRzID0gJGVsZW1lbnQuYWRkKCRlbGVtZW50LnBhcmVudHMoKSk7XHJcbiAgbGV0IGlzRml4ZWQgPSBmYWxzZTtcclxuICAkY2hlY2tFbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCQodGhpcykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgIGlzRml4ZWQgPSB0cnVlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGlzRml4ZWQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge09iamVjdH0gRWRnZXNcclxuICogQHByb3BlcnR5IHtCb29sZWFufSB0b3AgIElmIHRoZSB0b3AgZWRnZSB3YXMgZXhjZWVkZWRcclxuICogQHByb3BlcnR5IHtCb29sZWFufSByaWdodCAgSWYgdGhlIHJpZ2h0IGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gYm90dG9tICBJZiB0aGUgYm90dG9tIGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbGVmdCAgSWYgdGhlIGxlZnQgZWRnZSB3YXMgZXhjZWVkZWRcclxuICovXHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge09iamVjdH0gQm91bmRpbmdcclxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGxlZnQgIGxlZnQgb2Zmc2V0IGNvb3JkaW5hdGVcclxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHRvcCAgdG9wIG9mZnNldCBjb29yZGluYXRlXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSB3aWR0aFxyXG4gKiBAcHJvcGVydHkge051bWJlcn0gaGVpZ2h0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEVzY2FwZXMgaGFzaCBmcm9tIHNwZWNpYWwgY2hhcmFjdGVyc1xyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAgQ29udGFpbmVyIGVsZW1lbnQgdGhhdCBhY3RzIGFzIHRoZSBib3VuZGFyeVxyXG4gKiBAcGFyYW0ge0JvdW5kaW5nfSBib3VuZGluZyAgZWxlbWVudCBib3VuZGluZyB0aGF0IGlzIGJlaW5nIGNoZWNrZWRcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCAgb2Zmc2V0IGZyb20gZWRnZSB0aGF0IGNvdW50cyBhcyBleGNlZWRpbmdcclxuICogQHJldHVybnMge0VkZ2VzfVxyXG4gKi9cclxuTS5jaGVja1dpdGhpbkNvbnRhaW5lciA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgYm91bmRpbmcsIG9mZnNldCkge1xyXG4gIGxldCBlZGdlcyA9IHtcclxuICAgIHRvcDogZmFsc2UsXHJcbiAgICByaWdodDogZmFsc2UsXHJcbiAgICBib3R0b206IGZhbHNlLFxyXG4gICAgbGVmdDogZmFsc2VcclxuICB9O1xyXG5cclxuICBsZXQgY29udGFpbmVyUmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAvLyBJZiBib2R5IGVsZW1lbnQgaXMgc21hbGxlciB0aGFuIHZpZXdwb3J0LCB1c2Ugdmlld3BvcnQgaGVpZ2h0IGluc3RlYWQuXHJcbiAgbGV0IGNvbnRhaW5lckJvdHRvbSA9XHJcbiAgICBjb250YWluZXIgPT09IGRvY3VtZW50LmJvZHlcclxuICAgICAgPyBNYXRoLm1heChjb250YWluZXJSZWN0LmJvdHRvbSwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICA6IGNvbnRhaW5lclJlY3QuYm90dG9tO1xyXG5cclxuICBsZXQgc2Nyb2xsTGVmdCA9IGNvbnRhaW5lci5zY3JvbGxMZWZ0O1xyXG4gIGxldCBzY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsVG9wO1xyXG5cclxuICBsZXQgc2Nyb2xsZWRYID0gYm91bmRpbmcubGVmdCAtIHNjcm9sbExlZnQ7XHJcbiAgbGV0IHNjcm9sbGVkWSA9IGJvdW5kaW5nLnRvcCAtIHNjcm9sbFRvcDtcclxuXHJcbiAgLy8gQ2hlY2sgZm9yIGNvbnRhaW5lciBhbmQgdmlld3BvcnQgZm9yIGVhY2ggZWRnZVxyXG4gIGlmIChzY3JvbGxlZFggPCBjb250YWluZXJSZWN0LmxlZnQgKyBvZmZzZXQgfHwgc2Nyb2xsZWRYIDwgb2Zmc2V0KSB7XHJcbiAgICBlZGdlcy5sZWZ0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGlmIChcclxuICAgIHNjcm9sbGVkWCArIGJvdW5kaW5nLndpZHRoID4gY29udGFpbmVyUmVjdC5yaWdodCAtIG9mZnNldCB8fFxyXG4gICAgc2Nyb2xsZWRYICsgYm91bmRpbmcud2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCAtIG9mZnNldFxyXG4gICkge1xyXG4gICAgZWRnZXMucmlnaHQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgaWYgKHNjcm9sbGVkWSA8IGNvbnRhaW5lclJlY3QudG9wICsgb2Zmc2V0IHx8IHNjcm9sbGVkWSA8IG9mZnNldCkge1xyXG4gICAgZWRnZXMudG9wID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGlmIChcclxuICAgIHNjcm9sbGVkWSArIGJvdW5kaW5nLmhlaWdodCA+IGNvbnRhaW5lckJvdHRvbSAtIG9mZnNldCB8fFxyXG4gICAgc2Nyb2xsZWRZICsgYm91bmRpbmcuaGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0IC0gb2Zmc2V0XHJcbiAgKSB7XHJcbiAgICBlZGdlcy5ib3R0b20gPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGVkZ2VzO1xyXG59O1xyXG5cclxuTS5jaGVja1Bvc3NpYmxlQWxpZ25tZW50cyA9IGZ1bmN0aW9uKGVsLCBjb250YWluZXIsIGJvdW5kaW5nLCBvZmZzZXQpIHtcclxuICBsZXQgY2FuQWxpZ24gPSB7XHJcbiAgICB0b3A6IHRydWUsXHJcbiAgICByaWdodDogdHJ1ZSxcclxuICAgIGJvdHRvbTogdHJ1ZSxcclxuICAgIGxlZnQ6IHRydWUsXHJcbiAgICBzcGFjZU9uVG9wOiBudWxsLFxyXG4gICAgc3BhY2VPblJpZ2h0OiBudWxsLFxyXG4gICAgc3BhY2VPbkJvdHRvbTogbnVsbCxcclxuICAgIHNwYWNlT25MZWZ0OiBudWxsXHJcbiAgfTtcclxuXHJcbiAgbGV0IGNvbnRhaW5lckFsbG93c092ZXJmbG93ID0gZ2V0Q29tcHV0ZWRTdHlsZShjb250YWluZXIpLm92ZXJmbG93ID09PSAndmlzaWJsZSc7XHJcbiAgbGV0IGNvbnRhaW5lclJlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgbGV0IGNvbnRhaW5lckhlaWdodCA9IE1hdGgubWluKGNvbnRhaW5lclJlY3QuaGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIGxldCBjb250YWluZXJXaWR0aCA9IE1hdGgubWluKGNvbnRhaW5lclJlY3Qud2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoKTtcclxuICBsZXQgZWxPZmZzZXRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gIGxldCBzY3JvbGxMZWZ0ID0gY29udGFpbmVyLnNjcm9sbExlZnQ7XHJcbiAgbGV0IHNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxUb3A7XHJcblxyXG4gIGxldCBzY3JvbGxlZFggPSBib3VuZGluZy5sZWZ0IC0gc2Nyb2xsTGVmdDtcclxuICBsZXQgc2Nyb2xsZWRZVG9wRWRnZSA9IGJvdW5kaW5nLnRvcCAtIHNjcm9sbFRvcDtcclxuICBsZXQgc2Nyb2xsZWRZQm90dG9tRWRnZSA9IGJvdW5kaW5nLnRvcCArIGVsT2Zmc2V0UmVjdC5oZWlnaHQgLSBzY3JvbGxUb3A7XHJcblxyXG4gIC8vIENoZWNrIGZvciBjb250YWluZXIgYW5kIHZpZXdwb3J0IGZvciBsZWZ0XHJcbiAgY2FuQWxpZ24uc3BhY2VPblJpZ2h0ID0gIWNvbnRhaW5lckFsbG93c092ZXJmbG93XHJcbiAgICA/IGNvbnRhaW5lcldpZHRoIC0gKHNjcm9sbGVkWCArIGJvdW5kaW5nLndpZHRoKVxyXG4gICAgOiB3aW5kb3cuaW5uZXJXaWR0aCAtIChlbE9mZnNldFJlY3QubGVmdCArIGJvdW5kaW5nLndpZHRoKTtcclxuICBpZiAoY2FuQWxpZ24uc3BhY2VPblJpZ2h0IDwgMCkge1xyXG4gICAgY2FuQWxpZ24ubGVmdCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgZm9yIGNvbnRhaW5lciBhbmQgdmlld3BvcnQgZm9yIFJpZ2h0XHJcbiAgY2FuQWxpZ24uc3BhY2VPbkxlZnQgPSAhY29udGFpbmVyQWxsb3dzT3ZlcmZsb3dcclxuICAgID8gc2Nyb2xsZWRYIC0gYm91bmRpbmcud2lkdGggKyBlbE9mZnNldFJlY3Qud2lkdGhcclxuICAgIDogZWxPZmZzZXRSZWN0LnJpZ2h0IC0gYm91bmRpbmcud2lkdGg7XHJcbiAgaWYgKGNhbkFsaWduLnNwYWNlT25MZWZ0IDwgMCkge1xyXG4gICAgY2FuQWxpZ24ucmlnaHQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGZvciBjb250YWluZXIgYW5kIHZpZXdwb3J0IGZvciBUb3BcclxuICBjYW5BbGlnbi5zcGFjZU9uQm90dG9tID0gIWNvbnRhaW5lckFsbG93c092ZXJmbG93XHJcbiAgICA/IGNvbnRhaW5lckhlaWdodCAtIChzY3JvbGxlZFlUb3BFZGdlICsgYm91bmRpbmcuaGVpZ2h0ICsgb2Zmc2V0KVxyXG4gICAgOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSAoZWxPZmZzZXRSZWN0LnRvcCArIGJvdW5kaW5nLmhlaWdodCArIG9mZnNldCk7XHJcbiAgaWYgKGNhbkFsaWduLnNwYWNlT25Cb3R0b20gPCAwKSB7XHJcbiAgICBjYW5BbGlnbi50b3AgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGZvciBjb250YWluZXIgYW5kIHZpZXdwb3J0IGZvciBCb3R0b21cclxuICBjYW5BbGlnbi5zcGFjZU9uVG9wID0gIWNvbnRhaW5lckFsbG93c092ZXJmbG93XHJcbiAgICA/IHNjcm9sbGVkWUJvdHRvbUVkZ2UgLSAoYm91bmRpbmcuaGVpZ2h0IC0gb2Zmc2V0KVxyXG4gICAgOiBlbE9mZnNldFJlY3QuYm90dG9tIC0gKGJvdW5kaW5nLmhlaWdodCArIG9mZnNldCk7XHJcbiAgaWYgKGNhbkFsaWduLnNwYWNlT25Ub3AgPCAwKSB7XHJcbiAgICBjYW5BbGlnbi5ib3R0b20gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjYW5BbGlnbjtcclxufTtcclxuXHJcbk0uZ2V0T3ZlcmZsb3dQYXJlbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgaWYgKGVsZW1lbnQgPT0gbnVsbCkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBpZiAoZWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSB8fCBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLm92ZXJmbG93ICE9PSAndmlzaWJsZScpIHtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIE0uZ2V0T3ZlcmZsb3dQYXJlbnQoZWxlbWVudC5wYXJlbnRFbGVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIGlkIG9mIGNvbXBvbmVudCBmcm9tIGEgdHJpZ2dlclxyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXIgIHRyaWdnZXJcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbk0uZ2V0SWRGcm9tVHJpZ2dlciA9IGZ1bmN0aW9uKHRyaWdnZXIpIHtcclxuICBsZXQgaWQgPSB0cmlnZ2VyLmdldEF0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKTtcclxuICBpZiAoIWlkKSB7XHJcbiAgICBpZCA9IHRyaWdnZXIuZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICBpZiAoaWQpIHtcclxuICAgICAgaWQgPSBpZC5zbGljZSgxKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlkID0gJyc7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBpZDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNdWx0aSBicm93c2VyIHN1cHBvcnQgZm9yIGRvY3VtZW50IHNjcm9sbCB0b3BcclxuICogQHJldHVybnMge051bWJlcn1cclxuICovXHJcbk0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNdWx0aSBicm93c2VyIHN1cHBvcnQgZm9yIGRvY3VtZW50IHNjcm9sbCBsZWZ0XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XHJcbiAqL1xyXG5NLmdldERvY3VtZW50U2Nyb2xsTGVmdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB3aW5kb3cucGFnZVhPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0IHx8IDA7XHJcbn07XHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge09iamVjdH0gRWRnZXNcclxuICogQHByb3BlcnR5IHtCb29sZWFufSB0b3AgIElmIHRoZSB0b3AgZWRnZSB3YXMgZXhjZWVkZWRcclxuICogQHByb3BlcnR5IHtCb29sZWFufSByaWdodCAgSWYgdGhlIHJpZ2h0IGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gYm90dG9tICBJZiB0aGUgYm90dG9tIGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbGVmdCAgSWYgdGhlIGxlZnQgZWRnZSB3YXMgZXhjZWVkZWRcclxuICovXHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge09iamVjdH0gQm91bmRpbmdcclxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGxlZnQgIGxlZnQgb2Zmc2V0IGNvb3JkaW5hdGVcclxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHRvcCAgdG9wIG9mZnNldCBjb29yZGluYXRlXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSB3aWR0aFxyXG4gKiBAcHJvcGVydHkge051bWJlcn0gaGVpZ2h0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aW1lIGluIG1zXHJcbiAqIEBsaWNlbnNlIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvbWFzdGVyL0xJQ0VOU0VcclxuICogQHR5cGUge2Z1bmN0aW9ufVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAqL1xyXG5sZXQgZ2V0VGltZSA9XHJcbiAgRGF0ZS5ub3cgfHxcclxuICBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICB9O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxyXG4gKiBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cclxuICogYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xyXG4gKiBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xyXG4gKiBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cclxuICogQGxpY2Vuc2UgaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9tYXN0ZXIvTElDRU5TRVxyXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0XHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9uc1xyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAqL1xyXG5NLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xyXG4gIGxldCBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XHJcbiAgbGV0IHRpbWVvdXQgPSBudWxsO1xyXG4gIGxldCBwcmV2aW91cyA9IDA7XHJcbiAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcclxuICBsZXQgbGF0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBnZXRUaW1lKCk7XHJcbiAgICB0aW1lb3V0ID0gbnVsbDtcclxuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XHJcbiAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XHJcbiAgfTtcclxuICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgbm93ID0gZ2V0VGltZSgpO1xyXG4gICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcclxuICAgIGxldCByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcclxuICAgIGNvbnRleHQgPSB0aGlzO1xyXG4gICAgYXJncyA9IGFyZ3VtZW50cztcclxuICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xyXG4gICAgICBwcmV2aW91cyA9IG5vdztcclxuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xyXG4gICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xyXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxufTtcclxuIl0sImZpbGUiOiJnbG9iYWwuanMifQ==
