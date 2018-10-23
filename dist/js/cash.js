/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document, win = window, ArrayProto = Array.prototype, slice = ArrayProto.slice, filter = ArrayProto.filter, push = ArrayProto.push;

  var noop = function () {}, isFunction = function (item) {
    // @see https://crbug.com/568448
    return typeof item === typeof noop && item.call;
  }, isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/, classMatch = /^\.[\w-]*$/, htmlMatch = /<.+>/, singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = (classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
    return elems;
  }

  var frag;
  function parseHTML(str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
      var base = frag.createElement("base");
      base.href = doc.location.href;
      frag.head.appendChild(base);
    }

    frag.body.innerHTML = str;

    return frag.body.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector, i = 0, length;

    if (isString(selector)) {
      elems = (idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context));

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn = cash.fn = cash.prototype = Init.prototype = { // jshint ignore:line
    cash: true,
    length: 0,
    push: push,
    splice: ArrayProto.splice,
    map: ArrayProto.map,
    init: Init
  };

  Object.defineProperty(fn, "constructor", { value: cash });

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments), length = args.length, i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length, i = 0;

    for (; i < l; i++) {
      if (callback.call(collection[i], collection[i], i, collection) === false) {
        break;
      }
    }
  }

  function matches(el, selector) {
    var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
    return !!m && m.call(el, selector);
  }

  function getCompareFunction(selector) {
    return (
    /* Use browser's `matches` function if string */
    isString(selector) ? matches :
    /* Match a cash element */
    selector.cash ? function (el) {
      return selector.is(el);
    } :
    /* Direct comparison */
    function (el, selector) {
      return el === selector;
    });
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length, i = first.length, j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  });

  var uid = cash.uid = "_cash" + Date.now();

  function getDataCache(node) {
    return (node[uid] = node[uid] || {});
  }

  function setData(node, key, value) {
    return (getDataCache(node)[key] = value);
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (name, value) {
      if (isString(name)) {
        return (value === undefined ? getData(this[0], name) : this.each(function (v) {
          return setData(v, name, value);
        }));
      }

      for (var key in name) {
        this.data(key, name[key]);
      }

      return this;
    },

    removeData: function (key) {
      return this.each(function (v) {
        return removeData(v, key);
      });
    }

  });

  var notWhiteMatch = /\S+/g;

  function getClasses(c) {
    return isString(c) && c.match(notWhiteMatch);
  }

  function hasClass(v, c) {
    return (v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className));
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = getClasses(c);

      return (classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      }) : this);
    },

    attr: function (name, value) {
      if (!name) {
        return undefined;
      }

      if (isString(name)) {
        if (value === undefined) {
          return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
        }

        return this.each(function (v) {
          if (v.setAttribute) {
            v.setAttribute(name, value);
          } else {
            v[name] = value;
          }
        });
      }

      for (var key in name) {
        this.attr(key, name[key]);
      }

      return this;
    },

    hasClass: function (c) {
      var check = false, classes = getClasses(c);
      if (classes && classes.length) {
        this.each(function (v) {
          check = hasClass(v, classes[0]);
          return !check;
        });
      }
      return check;
    },

    prop: function (name, value) {
      if (isString(name)) {
        return (value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        }));
      }

      for (var key in name) {
        this.prop(key, name[key]);
      }

      return this;
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      if (!arguments.length) {
        return this.attr("class", "");
      }
      var classes = getClasses(c);
      return (classes ? this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      }) : this);
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = getClasses(c);
      return (classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      }) : this);
    } });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = (isFunction(selector) ? selector : getCompareFunction(selector));

      return cash(filter.call(this, function (e) {
        return comparator(e, selector);
      }));
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return (index < 0 ? this[index + this.length] : this[index]);
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0], collection = elem ? this : cash(child).parent().children();
      return slice.call(collection).indexOf(child);
    },

    last: function () {
      return this.eq(-1);
    }

  });

  var camelCase = (function () {
    var camelRegex = /(?:^\w|[A-Z]|\b\w)/g, whiteSpace = /[\s-_]+/g;
    return function (str) {
      return str.replace(camelRegex, function (letter, index) {
        return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
      }).replace(whiteSpace, "");
    };
  }());

  var getPrefixedProp = (function () {
    var cache = {}, doc = document, div = doc.createElement("div"), style = div.style;

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1), prefixes = ["webkit", "moz", "ms", "o"], props = (prop + " " + (prefixes).join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  }());

  cash.prefixedProp = getPrefixedProp;
  cash.camelCase = camelCase;

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return (arguments.length > 1 ? this.each(function (v) {
          return v.style[prop] = value;
        }) : win.getComputedStyle(this[0])[prop]);
      }

      for (var key in prop) {
        this.css(key, prop[key]);
      }

      return this;
    }

  });

  function compute(el, prop) {
    return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
  }

  each(["Width", "Height"], function (v) {
    var lower = v.toLowerCase();

    fn[lower] = function () {
      return this[0].getBoundingClientRect()[lower];
    };

    fn["inner" + v] = function () {
      return this[0]["client" + v];
    };

    fn["outer" + v] = function (margins) {
      return this[0]["offset" + v] + (margins ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) + compute(this, "margin" + (v === "Width" ? "Right" : "Bottom")) : 0);
    };
  });

  function registerEvent(node, eventName, callback) {
    var eventCache = getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
    eventCache[eventName] = eventCache[eventName] || [];
    eventCache[eventName].push(callback);
    node.addEventListener(eventName, callback);
  }

  function removeEvent(node, eventName, callback) {
    var events = getData(node, "_cashEvents"), eventCache = (events && events[eventName]), index;

    if (!eventCache) {
      return;
    }

    if (callback) {
      node.removeEventListener(eventName, callback);
      index = eventCache.indexOf(callback);
      if (index >= 0) {
        eventCache.splice(index, 1);
      }
    } else {
      each(eventCache, function (event) {
        node.removeEventListener(eventName, event);
      });
      eventCache = [];
    }
  }

  fn.extend({
    off: function (eventName, callback) {
      return this.each(function (v) {
        return removeEvent(v, eventName, callback);
      });
    },

    on: function (eventName, delegate, callback, runOnce) {
      // jshint ignore:line
      var originalCallback;
      if (!isString(eventName)) {
        for (var key in eventName) {
          this.on(key, delegate, eventName[key]);
        }
        return this;
      }

      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }

      if (eventName === "ready") {
        onReady(callback);
        return this;
      }

      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;
          while (!matches(t, delegate)) {
            if (t === this || t === null) {
              return (t = false);
            }

            t = t.parentNode;
          }

          if (t) {
            originalCallback.call(t, e);
          }
        };
      }

      return this.each(function (v) {
        var finalCallback = callback;
        if (runOnce) {
          finalCallback = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    /**
     * Modified
     * Triggers browser event
     * @param String eventName
     * @param Object data - Add properties to event object
     */
    trigger: function (eventName, data) {
      if (document.createEvent) {
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, false);
        evt = this.extend(evt, data);
        return this.each(function (v) {
          return v.dispatchEvent(evt);
        });
      }
    }

  });

  function encode(name, value) {
    return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }

  function getSelectMultiple_(el) {
    var values = [];
    each(el.options, function (o) {
      if (o.selected) {
        values.push(o.value);
      }
    });
    return values.length ? values : null;
  }

  function getSelectSingle_(el) {
    var selectedIndex = el.selectedIndex;
    return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
  }

  function getValue(el) {
    var type = el.type;
    if (!type) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "select-one":
        return getSelectSingle_(el);
      case "select-multiple":
        return getSelectMultiple_(el);
      case "radio":
        return (el.checked) ? el.value : null;
      case "checkbox":
        return (el.checked) ? el.value : null;
      default:
        return el.value ? el.value : null;
    }
  }

  fn.extend({
    serialize: function () {
      var query = "";

      each(this[0].elements || this, function (el) {
        if (el.disabled || el.tagName === "FIELDSET") {
          return;
        }
        var name = el.name;
        switch (el.type.toLowerCase()) {
          case "file":
          case "reset":
          case "submit":
          case "button":
            break;
          case "select-multiple":
            var values = getValue(el);
            if (values !== null) {
              each(values, function (value) {
                query += encode(name, value);
              });
            }
            break;
          default:
            var value = getValue(el);
            if (value !== null) {
              query += encode(name, value);
            }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return getValue(this[0]);
      }

      return this.each(function (v) {
        return v.value = value;
      });
    }

  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(parent, str ? function (v) {
      return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
    } : function (v, i) {
      return insertElement(v, (i === 0 ? child : child.cloneNode(true)), prepend);
    });
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(this.map(function (v) {
        return v.cloneNode(true);
      }));
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = (content.nodeType ? content[0].outerHTML : content);
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;


      cash(selector).each(function (el, i) {
        var parent = el.parentNode, sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore((i === 0 ? v : v.cloneNode(true)), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore((i === 0 ? v : v.cloneNode(true)), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        if (!!v.parentNode) {
          return v.parentNode.removeChild(v);
        }
      });
    },

    text: function (content) {
      if (content === undefined) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return v.textContent = content;
      });
    }

  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    }

  });

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return (!selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      }));
    },

    closest: function (selector) {
      if (!selector || this.length < 1) {
        return cash();
      }
      if (this.is(selector)) {
        return this.filter(selector);
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false, comparator = getCompareFunction(selector);

      this.each(function (el) {
        match = comparator(el, selector);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector || selector.nodeType) {
        return cash(selector && this.has(selector).length ? selector : null);
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      var comparator = (isString(selector) ? function (el) {
        return find(selector, el).length !== 0;
      } : function (el) {
        return el.contains(selector);
      });

      return this.filter(comparator);
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = getCompareFunction(selector);

      return this.filter(function (el) {
        return !comparator(el, selector);
      });
    },

    parent: function () {
      var result = [];

      this.each(function (item) {
        if (item && item.parentNode) {
          result.push(item.parentNode);
        }
      });

      return unique(result);
    },

    parents: function (selector) {
      var last, result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || (selector && matches(last, selector))) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function (selector) {
      var collection = this.parent().children(selector), el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    }

  });


  return cash;
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjYXNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISBjYXNoLWRvbSAxLjMuNSwgaHR0cHM6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvY2FzaCBAbGljZW5zZSBNSVQgKi9cclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgd2luZG93LmNhc2ggPSBmYWN0b3J5KCk7XHJcbn0pKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZG9jID0gZG9jdW1lbnQsIHdpbiA9IHdpbmRvdywgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgc2xpY2UgPSBBcnJheVByb3RvLnNsaWNlLCBmaWx0ZXIgPSBBcnJheVByb3RvLmZpbHRlciwgcHVzaCA9IEFycmF5UHJvdG8ucHVzaDtcclxuXHJcbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fSwgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAvLyBAc2VlIGh0dHBzOi8vY3JidWcuY29tLzU2ODQ0OFxyXG4gICAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSB0eXBlb2Ygbm9vcCAmJiBpdGVtLmNhbGw7XHJcbiAgfSwgaXNTdHJpbmcgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSB0eXBlb2YgXCJcIjtcclxuICB9O1xyXG5cclxuICB2YXIgaWRNYXRjaCA9IC9eI1tcXHctXSokLywgY2xhc3NNYXRjaCA9IC9eXFwuW1xcdy1dKiQvLCBodG1sTWF0Y2ggPSAvPC4rPi8sIHNpbmdsZXQgPSAvXlxcdyskLztcclxuXHJcbiAgZnVuY3Rpb24gZmluZChzZWxlY3RvciwgY29udGV4dCkge1xyXG4gICAgY29udGV4dCA9IGNvbnRleHQgfHwgZG9jO1xyXG4gICAgdmFyIGVsZW1zID0gKGNsYXNzTWF0Y2gudGVzdChzZWxlY3RvcikgPyBjb250ZXh0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsZWN0b3Iuc2xpY2UoMSkpIDogc2luZ2xldC50ZXN0KHNlbGVjdG9yKSA/IGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3IpIDogY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XHJcbiAgICByZXR1cm4gZWxlbXM7XHJcbiAgfVxyXG5cclxuICB2YXIgZnJhZztcclxuICBmdW5jdGlvbiBwYXJzZUhUTUwoc3RyKSB7XHJcbiAgICBpZiAoIWZyYWcpIHtcclxuICAgICAgZnJhZyA9IGRvYy5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQobnVsbCk7XHJcbiAgICAgIHZhciBiYXNlID0gZnJhZy5jcmVhdGVFbGVtZW50KFwiYmFzZVwiKTtcclxuICAgICAgYmFzZS5ocmVmID0gZG9jLmxvY2F0aW9uLmhyZWY7XHJcbiAgICAgIGZyYWcuaGVhZC5hcHBlbmRDaGlsZChiYXNlKTtcclxuICAgIH1cclxuXHJcbiAgICBmcmFnLmJvZHkuaW5uZXJIVE1MID0gc3RyO1xyXG5cclxuICAgIHJldHVybiBmcmFnLmJvZHkuY2hpbGROb2RlcztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uUmVhZHkoZm4pIHtcclxuICAgIGlmIChkb2MucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIpIHtcclxuICAgICAgZm4oKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBJbml0KHNlbGVjdG9yLCBjb250ZXh0KSB7XHJcbiAgICBpZiAoIXNlbGVjdG9yKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGFscmVhZHkgYSBjYXNoIGNvbGxlY3Rpb24sIGRvbid0IGRvIGFueSBmdXJ0aGVyIHByb2Nlc3NpbmdcclxuICAgIGlmIChzZWxlY3Rvci5jYXNoICYmIHNlbGVjdG9yICE9PSB3aW4pIHtcclxuICAgICAgcmV0dXJuIHNlbGVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlbGVtcyA9IHNlbGVjdG9yLCBpID0gMCwgbGVuZ3RoO1xyXG5cclxuICAgIGlmIChpc1N0cmluZyhzZWxlY3RvcikpIHtcclxuICAgICAgZWxlbXMgPSAoaWRNYXRjaC50ZXN0KHNlbGVjdG9yKSA/XHJcbiAgICAgIC8vIElmIGFuIElEIHVzZSB0aGUgZmFzdGVyIGdldEVsZW1lbnRCeUlkIGNoZWNrXHJcbiAgICAgIGRvYy5nZXRFbGVtZW50QnlJZChzZWxlY3Rvci5zbGljZSgxKSkgOiBodG1sTWF0Y2gudGVzdChzZWxlY3RvcikgP1xyXG4gICAgICAvLyBJZiBIVE1MLCBwYXJzZSBpdCBpbnRvIHJlYWwgZWxlbWVudHNcclxuICAgICAgcGFyc2VIVE1MKHNlbGVjdG9yKSA6XHJcbiAgICAgIC8vIGVsc2UgdXNlIGBmaW5kYFxyXG4gICAgICBmaW5kKHNlbGVjdG9yLCBjb250ZXh0KSk7XHJcblxyXG4gICAgICAvLyBJZiBmdW5jdGlvbiwgdXNlIGFzIHNob3J0Y3V0IGZvciBET00gcmVhZHlcclxuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihzZWxlY3RvcikpIHtcclxuICAgICAgb25SZWFkeShzZWxlY3Rvcik7cmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFlbGVtcykge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBhIHNpbmdsZSBET00gZWxlbWVudCBpcyBwYXNzZWQgaW4gb3IgcmVjZWl2ZWQgdmlhIElELCByZXR1cm4gdGhlIHNpbmdsZSBlbGVtZW50XHJcbiAgICBpZiAoZWxlbXMubm9kZVR5cGUgfHwgZWxlbXMgPT09IHdpbikge1xyXG4gICAgICB0aGlzWzBdID0gZWxlbXM7XHJcbiAgICAgIHRoaXMubGVuZ3RoID0gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyZWF0IGxpa2UgYW4gYXJyYXkgYW5kIGxvb3AgdGhyb3VnaCBlYWNoIGl0ZW0uXHJcbiAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoID0gZWxlbXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpc1tpXSA9IGVsZW1zW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjYXNoKHNlbGVjdG9yLCBjb250ZXh0KSB7XHJcbiAgICByZXR1cm4gbmV3IEluaXQoc2VsZWN0b3IsIGNvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGZuID0gY2FzaC5mbiA9IGNhc2gucHJvdG90eXBlID0gSW5pdC5wcm90b3R5cGUgPSB7IC8vIGpzaGludCBpZ25vcmU6bGluZVxyXG4gICAgY2FzaDogdHJ1ZSxcclxuICAgIGxlbmd0aDogMCxcclxuICAgIHB1c2g6IHB1c2gsXHJcbiAgICBzcGxpY2U6IEFycmF5UHJvdG8uc3BsaWNlLFxyXG4gICAgbWFwOiBBcnJheVByb3RvLm1hcCxcclxuICAgIGluaXQ6IEluaXRcclxuICB9O1xyXG5cclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwiY29uc3RydWN0b3JcIiwgeyB2YWx1ZTogY2FzaCB9KTtcclxuXHJcbiAgY2FzaC5wYXJzZUhUTUwgPSBwYXJzZUhUTUw7XHJcbiAgY2FzaC5ub29wID0gbm9vcDtcclxuICBjYXNoLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xyXG4gIGNhc2guaXNTdHJpbmcgPSBpc1N0cmluZztcclxuXHJcbiAgY2FzaC5leHRlbmQgPSBmbi5leHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XHJcblxyXG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyksIGxlbmd0aCA9IGFyZ3MubGVuZ3RoLCBpID0gMTtcclxuXHJcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGFyZ2V0ID0gdGhpcztcclxuICAgICAgaSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoIWFyZ3NbaV0pIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXJnc1tpXSkge1xyXG4gICAgICAgIGlmIChhcmdzW2ldLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgIHRhcmdldFtrZXldID0gYXJnc1tpXVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gZWFjaChjb2xsZWN0aW9uLCBjYWxsYmFjaykge1xyXG4gICAgdmFyIGwgPSBjb2xsZWN0aW9uLmxlbmd0aCwgaSA9IDA7XHJcblxyXG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29sbGVjdGlvbltpXSwgY29sbGVjdGlvbltpXSwgaSwgY29sbGVjdGlvbikgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1hdGNoZXMoZWwsIHNlbGVjdG9yKSB7XHJcbiAgICB2YXIgbSA9IGVsICYmIChlbC5tYXRjaGVzIHx8IGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBlbC5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgZWwubXNNYXRjaGVzU2VsZWN0b3IgfHwgZWwub01hdGNoZXNTZWxlY3Rvcik7XHJcbiAgICByZXR1cm4gISFtICYmIG0uY2FsbChlbCwgc2VsZWN0b3IpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0Q29tcGFyZUZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgLyogVXNlIGJyb3dzZXIncyBgbWF0Y2hlc2AgZnVuY3Rpb24gaWYgc3RyaW5nICovXHJcbiAgICBpc1N0cmluZyhzZWxlY3RvcikgPyBtYXRjaGVzIDpcclxuICAgIC8qIE1hdGNoIGEgY2FzaCBlbGVtZW50ICovXHJcbiAgICBzZWxlY3Rvci5jYXNoID8gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIHJldHVybiBzZWxlY3Rvci5pcyhlbCk7XHJcbiAgICB9IDpcclxuICAgIC8qIERpcmVjdCBjb21wYXJpc29uICovXHJcbiAgICBmdW5jdGlvbiAoZWwsIHNlbGVjdG9yKSB7XHJcbiAgICAgIHJldHVybiBlbCA9PT0gc2VsZWN0b3I7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVuaXF1ZShjb2xsZWN0aW9uKSB7XHJcbiAgICByZXR1cm4gY2FzaChzbGljZS5jYWxsKGNvbGxlY3Rpb24pLmZpbHRlcihmdW5jdGlvbiAoaXRlbSwgaW5kZXgsIHNlbGYpIHtcclxuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gaW5kZXg7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBjYXNoLmV4dGVuZCh7XHJcbiAgICBtZXJnZTogZnVuY3Rpb24gKGZpcnN0LCBzZWNvbmQpIHtcclxuICAgICAgdmFyIGxlbiA9ICtzZWNvbmQubGVuZ3RoLCBpID0gZmlyc3QubGVuZ3RoLCBqID0gMDtcclxuXHJcbiAgICAgIGZvciAoOyBqIDwgbGVuOyBpKyssIGorKykge1xyXG4gICAgICAgIGZpcnN0W2ldID0gc2Vjb25kW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmaXJzdC5sZW5ndGggPSBpO1xyXG4gICAgICByZXR1cm4gZmlyc3Q7XHJcbiAgICB9LFxyXG5cclxuICAgIGVhY2g6IGVhY2gsXHJcbiAgICBtYXRjaGVzOiBtYXRjaGVzLFxyXG4gICAgdW5pcXVlOiB1bmlxdWUsXHJcbiAgICBpc0FycmF5OiBBcnJheS5pc0FycmF5LFxyXG4gICAgaXNOdW1lcmljOiBmdW5jdGlvbiAobikge1xyXG4gICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgdmFyIHVpZCA9IGNhc2gudWlkID0gXCJfY2FzaFwiICsgRGF0ZS5ub3coKTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGF0YUNhY2hlKG5vZGUpIHtcclxuICAgIHJldHVybiAobm9kZVt1aWRdID0gbm9kZVt1aWRdIHx8IHt9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNldERhdGEobm9kZSwga2V5LCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIChnZXREYXRhQ2FjaGUobm9kZSlba2V5XSA9IHZhbHVlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldERhdGEobm9kZSwga2V5KSB7XHJcbiAgICB2YXIgYyA9IGdldERhdGFDYWNoZShub2RlKTtcclxuICAgIGlmIChjW2tleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBjW2tleV0gPSBub2RlLmRhdGFzZXQgPyBub2RlLmRhdGFzZXRba2V5XSA6IGNhc2gobm9kZSkuYXR0cihcImRhdGEtXCIgKyBrZXkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNba2V5XTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZURhdGEobm9kZSwga2V5KSB7XHJcbiAgICB2YXIgYyA9IGdldERhdGFDYWNoZShub2RlKTtcclxuICAgIGlmIChjKSB7XHJcbiAgICAgIGRlbGV0ZSBjW2tleV07XHJcbiAgICB9IGVsc2UgaWYgKG5vZGUuZGF0YXNldCkge1xyXG4gICAgICBkZWxldGUgbm9kZS5kYXRhc2V0W2tleV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjYXNoKG5vZGUpLnJlbW92ZUF0dHIoXCJkYXRhLVwiICsgbmFtZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgZGF0YTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XHJcbiAgICAgIGlmIChpc1N0cmluZyhuYW1lKSkge1xyXG4gICAgICAgIHJldHVybiAodmFsdWUgPT09IHVuZGVmaW5lZCA/IGdldERhdGEodGhpc1swXSwgbmFtZSkgOiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgIHJldHVybiBzZXREYXRhKHYsIG5hbWUsIHZhbHVlKTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhKGtleSwgbmFtZVtrZXldKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZURhdGE6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiByZW1vdmVEYXRhKHYsIGtleSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgdmFyIG5vdFdoaXRlTWF0Y2ggPSAvXFxTKy9nO1xyXG5cclxuICBmdW5jdGlvbiBnZXRDbGFzc2VzKGMpIHtcclxuICAgIHJldHVybiBpc1N0cmluZyhjKSAmJiBjLm1hdGNoKG5vdFdoaXRlTWF0Y2gpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFzQ2xhc3ModiwgYykge1xyXG4gICAgcmV0dXJuICh2LmNsYXNzTGlzdCA/IHYuY2xhc3NMaXN0LmNvbnRhaW5zKGMpIDogbmV3IFJlZ0V4cChcIihefCApXCIgKyBjICsgXCIoIHwkKVwiLCBcImdpXCIpLnRlc3Qodi5jbGFzc05hbWUpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZENsYXNzKHYsIGMsIHNwYWNlZE5hbWUpIHtcclxuICAgIGlmICh2LmNsYXNzTGlzdCkge1xyXG4gICAgICB2LmNsYXNzTGlzdC5hZGQoYyk7XHJcbiAgICB9IGVsc2UgaWYgKHNwYWNlZE5hbWUuaW5kZXhPZihcIiBcIiArIGMgKyBcIiBcIikpIHtcclxuICAgICAgdi5jbGFzc05hbWUgKz0gXCIgXCIgKyBjO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3ModiwgYykge1xyXG4gICAgaWYgKHYuY2xhc3NMaXN0KSB7XHJcbiAgICAgIHYuY2xhc3NMaXN0LnJlbW92ZShjKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHYuY2xhc3NOYW1lID0gdi5jbGFzc05hbWUucmVwbGFjZShjLCBcIlwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZuLmV4dGVuZCh7XHJcbiAgICBhZGRDbGFzczogZnVuY3Rpb24gKGMpIHtcclxuICAgICAgdmFyIGNsYXNzZXMgPSBnZXRDbGFzc2VzKGMpO1xyXG5cclxuICAgICAgcmV0dXJuIChjbGFzc2VzID8gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIHNwYWNlZE5hbWUgPSBcIiBcIiArIHYuY2xhc3NOYW1lICsgXCIgXCI7XHJcbiAgICAgICAgZWFjaChjbGFzc2VzLCBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgYWRkQ2xhc3ModiwgYywgc3BhY2VkTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pIDogdGhpcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGF0dHI6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xyXG4gICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNTdHJpbmcobmFtZSkpIHtcclxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXNbMF0gPyB0aGlzWzBdLmdldEF0dHJpYnV0ZSA/IHRoaXNbMF0uZ2V0QXR0cmlidXRlKG5hbWUpIDogdGhpc1swXVtuYW1lXSA6IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgIGlmICh2LnNldEF0dHJpYnV0ZSkge1xyXG4gICAgICAgICAgICB2LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2W25hbWVdID0gdmFsdWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5hdHRyKGtleSwgbmFtZVtrZXldKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGhhc0NsYXNzOiBmdW5jdGlvbiAoYykge1xyXG4gICAgICB2YXIgY2hlY2sgPSBmYWxzZSwgY2xhc3NlcyA9IGdldENsYXNzZXMoYyk7XHJcbiAgICAgIGlmIChjbGFzc2VzICYmIGNsYXNzZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICBjaGVjayA9IGhhc0NsYXNzKHYsIGNsYXNzZXNbMF0pO1xyXG4gICAgICAgICAgcmV0dXJuICFjaGVjaztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2hlY2s7XHJcbiAgICB9LFxyXG5cclxuICAgIHByb3A6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xyXG4gICAgICBpZiAoaXNTdHJpbmcobmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gKHZhbHVlID09PSB1bmRlZmluZWQgPyB0aGlzWzBdW25hbWVdIDogdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICB2W25hbWVdID0gdmFsdWU7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xyXG4gICAgICAgIHRoaXMucHJvcChrZXksIG5hbWVba2V5XSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVBdHRyOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgaWYgKHYucmVtb3ZlQXR0cmlidXRlKSB7XHJcbiAgICAgICAgICB2LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVsZXRlIHZbbmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoXCJjbGFzc1wiLCBcIlwiKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgY2xhc3NlcyA9IGdldENsYXNzZXMoYyk7XHJcbiAgICAgIHJldHVybiAoY2xhc3NlcyA/IHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGVhY2goY2xhc3NlcywgZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgIHJlbW92ZUNsYXNzKHYsIGMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KSA6IHRoaXMpO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVQcm9wOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgZGVsZXRlIHZbbmFtZV07XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24gKGMsIHN0YXRlKSB7XHJcbiAgICAgIGlmIChzdGF0ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbc3RhdGUgPyBcImFkZENsYXNzXCIgOiBcInJlbW92ZUNsYXNzXCJdKGMpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjbGFzc2VzID0gZ2V0Q2xhc3NlcyhjKTtcclxuICAgICAgcmV0dXJuIChjbGFzc2VzID8gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIHNwYWNlZE5hbWUgPSBcIiBcIiArIHYuY2xhc3NOYW1lICsgXCIgXCI7XHJcbiAgICAgICAgZWFjaChjbGFzc2VzLCBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgaWYgKGhhc0NsYXNzKHYsIGMpKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHYsIGMpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWRkQ2xhc3ModiwgYywgc3BhY2VkTmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pIDogdGhpcyk7XHJcbiAgICB9IH0pO1xyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgYWRkOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcclxuICAgICAgcmV0dXJuIHVuaXF1ZShjYXNoLm1lcmdlKHRoaXMsIGNhc2goc2VsZWN0b3IsIGNvbnRleHQpKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGVhY2g6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICBlYWNoKHRoaXMsIGNhbGxiYWNrKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGVxOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgcmV0dXJuIGNhc2godGhpcy5nZXQoaW5kZXgpKTtcclxuICAgIH0sXHJcblxyXG4gICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgY29tcGFyYXRvciA9IChpc0Z1bmN0aW9uKHNlbGVjdG9yKSA/IHNlbGVjdG9yIDogZ2V0Q29tcGFyZUZ1bmN0aW9uKHNlbGVjdG9yKSk7XHJcblxyXG4gICAgICByZXR1cm4gY2FzaChmaWx0ZXIuY2FsbCh0aGlzLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHJldHVybiBjb21wYXJhdG9yKGUsIHNlbGVjdG9yKTtcclxuICAgICAgfSkpO1xyXG4gICAgfSxcclxuXHJcbiAgICBmaXJzdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lcSgwKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gc2xpY2UuY2FsbCh0aGlzKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gKGluZGV4IDwgMCA/IHRoaXNbaW5kZXggKyB0aGlzLmxlbmd0aF0gOiB0aGlzW2luZGV4XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluZGV4OiBmdW5jdGlvbiAoZWxlbSkge1xyXG4gICAgICB2YXIgY2hpbGQgPSBlbGVtID8gY2FzaChlbGVtKVswXSA6IHRoaXNbMF0sIGNvbGxlY3Rpb24gPSBlbGVtID8gdGhpcyA6IGNhc2goY2hpbGQpLnBhcmVudCgpLmNoaWxkcmVuKCk7XHJcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGNvbGxlY3Rpb24pLmluZGV4T2YoY2hpbGQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsYXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmVxKC0xKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIHZhciBjYW1lbENhc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNhbWVsUmVnZXggPSAvKD86Xlxcd3xbQS1aXXxcXGJcXHcpL2csIHdoaXRlU3BhY2UgPSAvW1xccy1fXSsvZztcclxuICAgIHJldHVybiBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZShjYW1lbFJlZ2V4LCBmdW5jdGlvbiAobGV0dGVyLCBpbmRleCkge1xyXG4gICAgICAgIHJldHVybiBsZXR0ZXJbaW5kZXggPT09IDAgPyBcInRvTG93ZXJDYXNlXCIgOiBcInRvVXBwZXJDYXNlXCJdKCk7XHJcbiAgICAgIH0pLnJlcGxhY2Uod2hpdGVTcGFjZSwgXCJcIik7XHJcbiAgICB9O1xyXG4gIH0oKSk7XHJcblxyXG4gIHZhciBnZXRQcmVmaXhlZFByb3AgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNhY2hlID0ge30sIGRvYyA9IGRvY3VtZW50LCBkaXYgPSBkb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgc3R5bGUgPSBkaXYuc3R5bGU7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwcm9wKSB7XHJcbiAgICAgIHByb3AgPSBjYW1lbENhc2UocHJvcCk7XHJcbiAgICAgIGlmIChjYWNoZVtwcm9wXSkge1xyXG4gICAgICAgIHJldHVybiBjYWNoZVtwcm9wXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHVjUHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpLCBwcmVmaXhlcyA9IFtcIndlYmtpdFwiLCBcIm1velwiLCBcIm1zXCIsIFwib1wiXSwgcHJvcHMgPSAocHJvcCArIFwiIFwiICsgKHByZWZpeGVzKS5qb2luKHVjUHJvcCArIFwiIFwiKSArIHVjUHJvcCkuc3BsaXQoXCIgXCIpO1xyXG5cclxuICAgICAgZWFjaChwcm9wcywgZnVuY3Rpb24gKHApIHtcclxuICAgICAgICBpZiAocCBpbiBzdHlsZSkge1xyXG4gICAgICAgICAgY2FjaGVbcF0gPSBwcm9wID0gY2FjaGVbcHJvcF0gPSBwO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gY2FjaGVbcHJvcF07XHJcbiAgICB9O1xyXG4gIH0oKSk7XHJcblxyXG4gIGNhc2gucHJlZml4ZWRQcm9wID0gZ2V0UHJlZml4ZWRQcm9wO1xyXG4gIGNhc2guY2FtZWxDYXNlID0gY2FtZWxDYXNlO1xyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgY3NzOiBmdW5jdGlvbiAocHJvcCwgdmFsdWUpIHtcclxuICAgICAgaWYgKGlzU3RyaW5nKHByb3ApKSB7XHJcbiAgICAgICAgcHJvcCA9IGdldFByZWZpeGVkUHJvcChwcm9wKTtcclxuICAgICAgICByZXR1cm4gKGFyZ3VtZW50cy5sZW5ndGggPiAxID8gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICByZXR1cm4gdi5zdHlsZVtwcm9wXSA9IHZhbHVlO1xyXG4gICAgICAgIH0pIDogd2luLmdldENvbXB1dGVkU3R5bGUodGhpc1swXSlbcHJvcF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBrZXkgaW4gcHJvcCkge1xyXG4gICAgICAgIHRoaXMuY3NzKGtleSwgcHJvcFtrZXldKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBjb21wdXRlKGVsLCBwcm9wKSB7XHJcbiAgICByZXR1cm4gcGFyc2VJbnQod2luLmdldENvbXB1dGVkU3R5bGUoZWxbMF0sIG51bGwpW3Byb3BdLCAxMCkgfHwgMDtcclxuICB9XHJcblxyXG4gIGVhY2goW1wiV2lkdGhcIiwgXCJIZWlnaHRcIl0sIGZ1bmN0aW9uICh2KSB7XHJcbiAgICB2YXIgbG93ZXIgPSB2LnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgZm5bbG93ZXJdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtsb3dlcl07XHJcbiAgICB9O1xyXG5cclxuICAgIGZuW1wiaW5uZXJcIiArIHZdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpc1swXVtcImNsaWVudFwiICsgdl07XHJcbiAgICB9O1xyXG5cclxuICAgIGZuW1wib3V0ZXJcIiArIHZdID0gZnVuY3Rpb24gKG1hcmdpbnMpIHtcclxuICAgICAgcmV0dXJuIHRoaXNbMF1bXCJvZmZzZXRcIiArIHZdICsgKG1hcmdpbnMgPyBjb21wdXRlKHRoaXMsIFwibWFyZ2luXCIgKyAodiA9PT0gXCJXaWR0aFwiID8gXCJMZWZ0XCIgOiBcIlRvcFwiKSkgKyBjb21wdXRlKHRoaXMsIFwibWFyZ2luXCIgKyAodiA9PT0gXCJXaWR0aFwiID8gXCJSaWdodFwiIDogXCJCb3R0b21cIikpIDogMCk7XHJcbiAgICB9O1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiByZWdpc3RlckV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgIHZhciBldmVudENhY2hlID0gZ2V0RGF0YShub2RlLCBcIl9jYXNoRXZlbnRzXCIpIHx8IHNldERhdGEobm9kZSwgXCJfY2FzaEV2ZW50c1wiLCB7fSk7XHJcbiAgICBldmVudENhY2hlW2V2ZW50TmFtZV0gPSBldmVudENhY2hlW2V2ZW50TmFtZV0gfHwgW107XHJcbiAgICBldmVudENhY2hlW2V2ZW50TmFtZV0ucHVzaChjYWxsYmFjayk7XHJcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVFdmVudChub2RlLCBldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgZXZlbnRzID0gZ2V0RGF0YShub2RlLCBcIl9jYXNoRXZlbnRzXCIpLCBldmVudENhY2hlID0gKGV2ZW50cyAmJiBldmVudHNbZXZlbnROYW1lXSksIGluZGV4O1xyXG5cclxuICAgIGlmICghZXZlbnRDYWNoZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICAgICAgaW5kZXggPSBldmVudENhY2hlLmluZGV4T2YoY2FsbGJhY2spO1xyXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xyXG4gICAgICAgIGV2ZW50Q2FjaGUuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWFjaChldmVudENhY2hlLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBldmVudENhY2hlID0gW107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgb2ZmOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHJlbW92ZUV2ZW50KHYsIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgb246IGZ1bmN0aW9uIChldmVudE5hbWUsIGRlbGVnYXRlLCBjYWxsYmFjaywgcnVuT25jZSkge1xyXG4gICAgICAvLyBqc2hpbnQgaWdub3JlOmxpbmVcclxuICAgICAgdmFyIG9yaWdpbmFsQ2FsbGJhY2s7XHJcbiAgICAgIGlmICghaXNTdHJpbmcoZXZlbnROYW1lKSkge1xyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBldmVudE5hbWUpIHtcclxuICAgICAgICAgIHRoaXMub24oa2V5LCBkZWxlZ2F0ZSwgZXZlbnROYW1lW2tleV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlzRnVuY3Rpb24oZGVsZWdhdGUpKSB7XHJcbiAgICAgICAgY2FsbGJhY2sgPSBkZWxlZ2F0ZTtcclxuICAgICAgICBkZWxlZ2F0ZSA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChldmVudE5hbWUgPT09IFwicmVhZHlcIikge1xyXG4gICAgICAgIG9uUmVhZHkoY2FsbGJhY2spO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZGVsZWdhdGUpIHtcclxuICAgICAgICBvcmlnaW5hbENhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgdmFyIHQgPSBlLnRhcmdldDtcclxuICAgICAgICAgIHdoaWxlICghbWF0Y2hlcyh0LCBkZWxlZ2F0ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHQgPT09IHRoaXMgfHwgdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAodCA9IGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdCA9IHQucGFyZW50Tm9kZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICBvcmlnaW5hbENhbGxiYWNrLmNhbGwodCwgZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBmaW5hbENhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgaWYgKHJ1bk9uY2UpIHtcclxuICAgICAgICAgIGZpbmFsQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50KHYsIGV2ZW50TmFtZSwgZmluYWxDYWxsYmFjayk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWdpc3RlckV2ZW50KHYsIGV2ZW50TmFtZSwgZmluYWxDYWxsYmFjayk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbmU6IGZ1bmN0aW9uIChldmVudE5hbWUsIGRlbGVnYXRlLCBjYWxsYmFjaykge1xyXG4gICAgICByZXR1cm4gdGhpcy5vbihldmVudE5hbWUsIGRlbGVnYXRlLCBjYWxsYmFjaywgdHJ1ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlYWR5OiBvblJlYWR5LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTW9kaWZpZWRcclxuICAgICAqIFRyaWdnZXJzIGJyb3dzZXIgZXZlbnRcclxuICAgICAqIEBwYXJhbSBTdHJpbmcgZXZlbnROYW1lXHJcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBBZGQgcHJvcGVydGllcyB0byBldmVudCBvYmplY3RcclxuICAgICAqL1xyXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcclxuICAgICAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcclxuICAgICAgICBldnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgIGV2dCA9IHRoaXMuZXh0ZW5kKGV2dCwgZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgcmV0dXJuIHYuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBlbmNvZGUobmFtZSwgdmFsdWUpIHtcclxuICAgIHJldHVybiBcIiZcIiArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U2VsZWN0TXVsdGlwbGVfKGVsKSB7XHJcbiAgICB2YXIgdmFsdWVzID0gW107XHJcbiAgICBlYWNoKGVsLm9wdGlvbnMsIGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgIGlmIChvLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgdmFsdWVzLnB1c2goby52YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXMgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U2VsZWN0U2luZ2xlXyhlbCkge1xyXG4gICAgdmFyIHNlbGVjdGVkSW5kZXggPSBlbC5zZWxlY3RlZEluZGV4O1xyXG4gICAgcmV0dXJuIHNlbGVjdGVkSW5kZXggPj0gMCA/IGVsLm9wdGlvbnNbc2VsZWN0ZWRJbmRleF0udmFsdWUgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VmFsdWUoZWwpIHtcclxuICAgIHZhciB0eXBlID0gZWwudHlwZTtcclxuICAgIGlmICghdHlwZSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHN3aXRjaCAodHlwZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNhc2UgXCJzZWxlY3Qtb25lXCI6XHJcbiAgICAgICAgcmV0dXJuIGdldFNlbGVjdFNpbmdsZV8oZWwpO1xyXG4gICAgICBjYXNlIFwic2VsZWN0LW11bHRpcGxlXCI6XHJcbiAgICAgICAgcmV0dXJuIGdldFNlbGVjdE11bHRpcGxlXyhlbCk7XHJcbiAgICAgIGNhc2UgXCJyYWRpb1wiOlxyXG4gICAgICAgIHJldHVybiAoZWwuY2hlY2tlZCkgPyBlbC52YWx1ZSA6IG51bGw7XHJcbiAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxyXG4gICAgICAgIHJldHVybiAoZWwuY2hlY2tlZCkgPyBlbC52YWx1ZSA6IG51bGw7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIGVsLnZhbHVlID8gZWwudmFsdWUgOiBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm4uZXh0ZW5kKHtcclxuICAgIHNlcmlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcXVlcnkgPSBcIlwiO1xyXG5cclxuICAgICAgZWFjaCh0aGlzWzBdLmVsZW1lbnRzIHx8IHRoaXMsIGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIGlmIChlbC5kaXNhYmxlZCB8fCBlbC50YWdOYW1lID09PSBcIkZJRUxEU0VUXCIpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5hbWUgPSBlbC5uYW1lO1xyXG4gICAgICAgIHN3aXRjaCAoZWwudHlwZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICBjYXNlIFwiZmlsZVwiOlxyXG4gICAgICAgICAgY2FzZSBcInJlc2V0XCI6XHJcbiAgICAgICAgICBjYXNlIFwic3VibWl0XCI6XHJcbiAgICAgICAgICBjYXNlIFwiYnV0dG9uXCI6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcInNlbGVjdC1tdWx0aXBsZVwiOlxyXG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0VmFsdWUoZWwpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWVzICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgZWFjaCh2YWx1ZXMsIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcXVlcnkgKz0gZW5jb2RlKG5hbWUsIHZhbHVlKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGdldFZhbHVlKGVsKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgcXVlcnkgKz0gZW5jb2RlKG5hbWUsIHZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gcXVlcnkuc3Vic3RyKDEpO1xyXG4gICAgfSxcclxuXHJcbiAgICB2YWw6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiBnZXRWYWx1ZSh0aGlzWzBdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiB2LnZhbHVlID0gdmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaW5zZXJ0RWxlbWVudChlbCwgY2hpbGQsIHByZXBlbmQpIHtcclxuICAgIGlmIChwcmVwZW5kKSB7XHJcbiAgICAgIHZhciBmaXJzdCA9IGVsLmNoaWxkTm9kZXNbMF07XHJcbiAgICAgIGVsLmluc2VydEJlZm9yZShjaGlsZCwgZmlyc3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWwuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5zZXJ0Q29udGVudChwYXJlbnQsIGNoaWxkLCBwcmVwZW5kKSB7XHJcbiAgICB2YXIgc3RyID0gaXNTdHJpbmcoY2hpbGQpO1xyXG5cclxuICAgIGlmICghc3RyICYmIGNoaWxkLmxlbmd0aCkge1xyXG4gICAgICBlYWNoKGNoaWxkLCBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiBpbnNlcnRDb250ZW50KHBhcmVudCwgdiwgcHJlcGVuZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZWFjaChwYXJlbnQsIHN0ciA/IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHJldHVybiB2Lmluc2VydEFkamFjZW50SFRNTChwcmVwZW5kID8gXCJhZnRlcmJlZ2luXCIgOiBcImJlZm9yZWVuZFwiLCBjaGlsZCk7XHJcbiAgICB9IDogZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgcmV0dXJuIGluc2VydEVsZW1lbnQodiwgKGkgPT09IDAgPyBjaGlsZCA6IGNoaWxkLmNsb25lTm9kZSh0cnVlKSksIHByZXBlbmQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgYWZ0ZXI6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICBjYXNoKHNlbGVjdG9yKS5pbnNlcnRBZnRlcih0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGFwcGVuZDogZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuICAgICAgaW5zZXJ0Q29udGVudCh0aGlzLCBjb250ZW50KTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGFwcGVuZFRvOiBmdW5jdGlvbiAocGFyZW50KSB7XHJcbiAgICAgIGluc2VydENvbnRlbnQoY2FzaChwYXJlbnQpLCB0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGJlZm9yZTogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIGNhc2goc2VsZWN0b3IpLmluc2VydEJlZm9yZSh0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBjYXNoKHRoaXMubWFwKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHYuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICB9KSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGVtcHR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuaHRtbChcIlwiKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWw6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpc1swXS5pbm5lckhUTUw7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHNvdXJjZSA9IChjb250ZW50Lm5vZGVUeXBlID8gY29udGVudFswXS5vdXRlckhUTUwgOiBjb250ZW50KTtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiB2LmlubmVySFRNTCA9IHNvdXJjZTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcblxyXG4gICAgICBjYXNoKHNlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlLCBzaWJsaW5nID0gZWwubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgX3RoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSgoaSA9PT0gMCA/IHYgOiB2LmNsb25lTm9kZSh0cnVlKSksIHNpYmxpbmcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcclxuICAgICAgY2FzaChzZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcclxuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcclxuICAgICAgICBfdGhpczIuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSgoaSA9PT0gMCA/IHYgOiB2LmNsb25lTm9kZSh0cnVlKSksIGVsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmVwZW5kOiBmdW5jdGlvbiAoY29udGVudCkge1xyXG4gICAgICBpbnNlcnRDb250ZW50KHRoaXMsIGNvbnRlbnQsIHRydWUpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGVuZFRvOiBmdW5jdGlvbiAocGFyZW50KSB7XHJcbiAgICAgIGluc2VydENvbnRlbnQoY2FzaChwYXJlbnQpLCB0aGlzLCB0cnVlKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgaWYgKCEhdi5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICByZXR1cm4gdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHQ6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpc1swXS50ZXh0Q29udGVudDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHYudGV4dENvbnRlbnQgPSBjb250ZW50O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIHZhciBkb2NFbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XHJcblxyXG4gIGZuLmV4dGVuZCh7XHJcbiAgICBwb3NpdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgZWwgPSB0aGlzWzBdO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGxlZnQ6IGVsLm9mZnNldExlZnQsXHJcbiAgICAgICAgdG9wOiBlbC5vZmZzZXRUb3BcclxuICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgb2Zmc2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciByZWN0ID0gdGhpc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0b3A6IHJlY3QudG9wICsgd2luLnBhZ2VZT2Zmc2V0IC0gZG9jRWwuY2xpZW50VG9wLFxyXG4gICAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpbi5wYWdlWE9mZnNldCAtIGRvY0VsLmNsaWVudExlZnRcclxuICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgb2Zmc2V0UGFyZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBjYXNoKHRoaXNbMF0ub2Zmc2V0UGFyZW50KTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIGZuLmV4dGVuZCh7XHJcbiAgICBjaGlsZHJlbjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIHZhciBlbGVtcyA9IFtdO1xyXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgcHVzaC5hcHBseShlbGVtcywgZWwuY2hpbGRyZW4pO1xyXG4gICAgICB9KTtcclxuICAgICAgZWxlbXMgPSB1bmlxdWUoZWxlbXMpO1xyXG5cclxuICAgICAgcmV0dXJuICghc2VsZWN0b3IgPyBlbGVtcyA6IGVsZW1zLmZpbHRlcihmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiBtYXRjaGVzKHYsIHNlbGVjdG9yKTtcclxuICAgICAgfSkpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZXN0OiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3RvciB8fCB0aGlzLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICByZXR1cm4gY2FzaCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmlzKHNlbGVjdG9yKSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihzZWxlY3Rvcik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50KCkuY2xvc2VzdChzZWxlY3Rvcik7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG1hdGNoID0gZmFsc2UsIGNvbXBhcmF0b3IgPSBnZXRDb21wYXJlRnVuY3Rpb24oc2VsZWN0b3IpO1xyXG5cclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIG1hdGNoID0gY29tcGFyYXRvcihlbCwgc2VsZWN0b3IpO1xyXG4gICAgICAgIHJldHVybiAhbWF0Y2g7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfSxcclxuXHJcbiAgICBmaW5kOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3RvciB8fCBzZWxlY3Rvci5ub2RlVHlwZSkge1xyXG4gICAgICAgIHJldHVybiBjYXNoKHNlbGVjdG9yICYmIHRoaXMuaGFzKHNlbGVjdG9yKS5sZW5ndGggPyBzZWxlY3RvciA6IG51bGwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZWxlbXMgPSBbXTtcclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHB1c2guYXBwbHkoZWxlbXMsIGZpbmQoc2VsZWN0b3IsIGVsKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHVuaXF1ZShlbGVtcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhhczogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIHZhciBjb21wYXJhdG9yID0gKGlzU3RyaW5nKHNlbGVjdG9yKSA/IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHJldHVybiBmaW5kKHNlbGVjdG9yLCBlbCkubGVuZ3RoICE9PSAwO1xyXG4gICAgICB9IDogZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmNvbnRhaW5zKHNlbGVjdG9yKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5maWx0ZXIoY29tcGFyYXRvcik7XHJcbiAgICB9LFxyXG5cclxuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIGNhc2godGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBub3Q6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBjb21wYXJhdG9yID0gZ2V0Q29tcGFyZUZ1bmN0aW9uKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICByZXR1cm4gIWNvbXBhcmF0b3IoZWwsIHNlbGVjdG9yKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0ucGFyZW50Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB1bmlxdWUocmVzdWx0KTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyZW50czogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIHZhciBsYXN0LCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgIGxhc3QgPSBpdGVtO1xyXG5cclxuICAgICAgICB3aGlsZSAobGFzdCAmJiBsYXN0LnBhcmVudE5vZGUgJiYgbGFzdCAhPT0gZG9jLmJvZHkucGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgbGFzdCA9IGxhc3QucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgICBpZiAoIXNlbGVjdG9yIHx8IChzZWxlY3RvciAmJiBtYXRjaGVzKGxhc3QsIHNlbGVjdG9yKSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobGFzdCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB1bmlxdWUocmVzdWx0KTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJldjogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gY2FzaCh0aGlzWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaWJsaW5nczogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gdGhpcy5wYXJlbnQoKS5jaGlsZHJlbihzZWxlY3RvciksIGVsID0gdGhpc1swXTtcclxuXHJcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgIHJldHVybiBpICE9PSBlbDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuXHJcbiAgcmV0dXJuIGNhc2g7XHJcbn0pO1xyXG4iXSwiZmlsZSI6ImNhc2guanMifQ==
