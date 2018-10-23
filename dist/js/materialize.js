/*!
 * Materialize v1.0.0 (http://materializecss.com)
 * Copyright 2014-2017 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document,
      win = window,
      ArrayProto = Array.prototype,
      slice = ArrayProto.slice,
      filter = ArrayProto.filter,
      push = ArrayProto.push;

  var noop = function () {},
      isFunction = function (item) {
    // @see https://crbug.com/568448
    return typeof item === typeof noop && item.call;
  },
      isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/,
      classMatch = /^\.[\w-]*$/,
      htmlMatch = /<.+>/,
      singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
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

    var elems = selector,
        i = 0,
        length;

    if (isString(selector)) {
      elems = idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context);

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

    var args = slice.call(arguments),
        length = args.length,
        i = 1;

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
    var l = collection.length,
        i = 0;

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
      }
    );
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length,
          i = first.length,
          j = 0;

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
    return node[uid] = node[uid] || {};
  }

  function setData(node, key, value) {
    return getDataCache(node)[key] = value;
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
        return value === undefined ? getData(this[0], name) : this.each(function (v) {
          return setData(v, name, value);
        });
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
    return v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className);
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

      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      }) : this;
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
      var check = false,
          classes = getClasses(c);
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
        return value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        });
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
      return classes ? this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      }) : this;
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
      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      }) : this;
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

      var comparator = isFunction(selector) ? selector : getCompareFunction(selector);

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
      return index < 0 ? this[index + this.length] : this[index];
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0],
          collection = elem ? this : cash(child).parent().children();
      return slice.call(collection).indexOf(child);
    },

    last: function () {
      return this.eq(-1);
    }

  });

  var camelCase = function () {
    var camelRegex = /(?:^\w|[A-Z]|\b\w)/g,
        whiteSpace = /[\s-_]+/g;
    return function (str) {
      return str.replace(camelRegex, function (letter, index) {
        return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
      }).replace(whiteSpace, "");
    };
  }();

  var getPrefixedProp = function () {
    var cache = {},
        doc = document,
        div = doc.createElement("div"),
        style = div.style;

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
          prefixes = ["webkit", "moz", "ms", "o"],
          props = (prop + " " + prefixes.join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  }();

  cash.prefixedProp = getPrefixedProp;
  cash.camelCase = camelCase;

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return arguments.length > 1 ? this.each(function (v) {
          return v.style[prop] = value;
        }) : win.getComputedStyle(this[0])[prop];
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
    var events = getData(node, "_cashEvents"),
        eventCache = events && events[eventName],
        index;

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
              return t = false;
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
        var evt = document.createEvent('HTMLEvents');
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
        return el.checked ? el.value : null;
      case "checkbox":
        return el.checked ? el.value : null;
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
      return insertElement(v, i === 0 ? child : child.cloneNode(true), prepend);
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
      var source = content.nodeType ? content[0].outerHTML : content;
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;

      cash(selector).each(function (el, i) {
        var parent = el.parentNode,
            sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), el);
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

      return !selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      });
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

      var match = false,
          comparator = getCompareFunction(selector);

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
      var comparator = isString(selector) ? function (el) {
        return find(selector, el).length !== 0;
      } : function (el) {
        return el.contains(selector);
      };

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
      var last,
          result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || selector && matches(last, selector)) {
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
      var collection = this.parent().children(selector),
          el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    }

  });

  return cash;
});
;
var Component = function () {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  function Component(classDef, el, options) {
    _classCallCheck(this, Component);

    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + ' is not an HTML Element'));
    }

    // If exists, destroy and reinitialize in child
    var ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }

    this.el = el;
    this.$el = cash(el);
  }

  /**
   * Initializes components
   * @param {class} classDef
   * @param {Element | NodeList | jQuery} els
   * @param {Object} options
   */


  _createClass(Component, null, [{
    key: "init",
    value: function init(classDef, els, options) {
      var instances = null;
      if (els instanceof Element) {
        instances = new classDef(els, options);
      } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
        var instancesArr = [];
        for (var i = 0; i < els.length; i++) {
          instancesArr.push(new classDef(els[i], options));
        }
        instances = instancesArr;
      }

      return instances;
    }
  }]);

  return Component;
}();

; // Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
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
  define('M', [], function () {
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
var docHandleKeydown = function (e) {
  M.keyDown = true;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = true;
  }
};
var docHandleKeyup = function (e) {
  M.keyDown = false;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = false;
  }
};
var docHandleFocus = function (e) {
  if (M.keyDown) {
    document.body.classList.add('keyboard-focused');
  }
};
var docHandleBlur = function (e) {
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
M.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function (methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      var params = Array.prototype.slice.call(arguments, 1);

      // Getter methods
      if (methodOrOptions.slice(0, 3) === 'get') {
        var instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, params);
      }

      // Void methods
      return this.each(function () {
        var instance = this[classRef];
        instance[methodOrOptions].apply(instance, params);
      });

      // Initialize plugin if options or no argument is passed in
    } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      plugin.init(this, arguments[0]);
      return this;
    }

    // Return error if an unrecognized  method name is passed in
    jQuery.error("Method " + methodOrOptions + " does not exist on jQuery." + pluginName);
  };
};

/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function (context) {
  // Use document.body if no context is given
  var root = !!context ? context : document.body;

  var registry = {
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

  for (var pluginName in registry) {
    var plugin = M[pluginName];
    plugin.init(registry[pluginName]);
  }
};

/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function (obj) {
  var tagStr = obj.prop('tagName') || '';
  var idStr = obj.attr('id') || '';
  var classStr = obj.attr('class') || '';
  return (tagStr + idStr + classStr).replace(/\s/g, '');
};

// Unique Random ID
M.guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
}();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function (hash) {
  return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, '\\$1');
};

M.elementOrParentIsFixed = function (element) {
  var $element = $(element);
  var $checkElements = $element.add($element.parents());
  var isFixed = false;
  $checkElements.each(function () {
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
M.checkWithinContainer = function (container, bounding, offset) {
  var edges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  var containerRect = container.getBoundingClientRect();
  // If body element is smaller than viewport, use viewport height instead.
  var containerBottom = container === document.body ? Math.max(containerRect.bottom, window.innerHeight) : containerRect.bottom;

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset || scrolledX < offset) {
    edges.left = true;
  }

  if (scrolledX + bounding.width > containerRect.right - offset || scrolledX + bounding.width > window.innerWidth - offset) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset || scrolledY < offset) {
    edges.top = true;
  }

  if (scrolledY + bounding.height > containerBottom - offset || scrolledY + bounding.height > window.innerHeight - offset) {
    edges.bottom = true;
  }

  return edges;
};

M.checkPossibleAlignments = function (el, container, bounding, offset) {
  var canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null
  };

  var containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
  var containerRect = container.getBoundingClientRect();
  var containerHeight = Math.min(containerRect.height, window.innerHeight);
  var containerWidth = Math.min(containerRect.width, window.innerWidth);
  var elOffsetRect = el.getBoundingClientRect();

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledYTopEdge = bounding.top - scrollTop;
  var scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) : window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width : elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) : elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};

M.getOverflowParent = function (element) {
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
M.getIdFromTrigger = function (trigger) {
  var id = trigger.getAttribute('data-target');
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
M.getDocumentScrollTop = function () {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function () {
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
var getTime = Date.now || function () {
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
M.throttle = function (func, wait, options) {
  var context = void 0,
      args = void 0,
      result = void 0;
  var timeout = null;
  var previous = 0;
  options || (options = {});
  var later = function () {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function () {
    var now = getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
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
; /*
  v2.2.0
  2017 Julian Garnier
  Released under the MIT license
  */
var $jscomp = { scope: {} };$jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (e, r, p) {
  if (p.get || p.set) throw new TypeError("ES3 does not support getters and setters.");e != Array.prototype && e != Object.prototype && (e[r] = p.value);
};$jscomp.getGlobal = function (e) {
  return "undefined" != typeof window && window === e ? e : "undefined" != typeof global && null != global ? global : e;
};$jscomp.global = $jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};$jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};$jscomp.symbolCounter_ = 0;$jscomp.Symbol = function (e) {
  return $jscomp.SYMBOL_PREFIX + (e || "") + $jscomp.symbolCounter_++;
};
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();var e = $jscomp.global.Symbol.iterator;e || (e = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));"function" != typeof Array.prototype[e] && $jscomp.defineProperty(Array.prototype, e, { configurable: !0, writable: !0, value: function () {
      return $jscomp.arrayIterator(this);
    } });$jscomp.initSymbolIterator = function () {};
};$jscomp.arrayIterator = function (e) {
  var r = 0;return $jscomp.iteratorPrototype(function () {
    return r < e.length ? { done: !1, value: e[r++] } : { done: !0 };
  });
};
$jscomp.iteratorPrototype = function (e) {
  $jscomp.initSymbolIterator();e = { next: e };e[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };return e;
};$jscomp.array = $jscomp.array || {};$jscomp.iteratorFromArray = function (e, r) {
  $jscomp.initSymbolIterator();e instanceof String && (e += "");var p = 0,
      m = { next: function () {
      if (p < e.length) {
        var u = p++;return { value: r(u, e[u]), done: !1 };
      }m.next = function () {
        return { done: !0, value: void 0 };
      };return m.next();
    } };m[Symbol.iterator] = function () {
    return m;
  };return m;
};
$jscomp.polyfill = function (e, r, p, m) {
  if (r) {
    p = $jscomp.global;e = e.split(".");for (m = 0; m < e.length - 1; m++) {
      var u = e[m];u in p || (p[u] = {});p = p[u];
    }e = e[e.length - 1];m = p[e];r = r(m);r != m && null != r && $jscomp.defineProperty(p, e, { configurable: !0, writable: !0, value: r });
  }
};$jscomp.polyfill("Array.prototype.keys", function (e) {
  return e ? e : function () {
    return $jscomp.iteratorFromArray(this, function (e) {
      return e;
    });
  };
}, "es6-impl", "es3");var $jscomp$this = this;
(function (r) {
  M.anime = r();
})(function () {
  function e(a) {
    if (!h.col(a)) try {
      return document.querySelectorAll(a);
    } catch (c) {}
  }function r(a, c) {
    for (var d = a.length, b = 2 <= arguments.length ? arguments[1] : void 0, f = [], n = 0; n < d; n++) {
      if (n in a) {
        var k = a[n];c.call(b, k, n, a) && f.push(k);
      }
    }return f;
  }function p(a) {
    return a.reduce(function (a, d) {
      return a.concat(h.arr(d) ? p(d) : d);
    }, []);
  }function m(a) {
    if (h.arr(a)) return a;
    h.str(a) && (a = e(a) || a);return a instanceof NodeList || a instanceof HTMLCollection ? [].slice.call(a) : [a];
  }function u(a, c) {
    return a.some(function (a) {
      return a === c;
    });
  }function C(a) {
    var c = {},
        d;for (d in a) {
      c[d] = a[d];
    }return c;
  }function D(a, c) {
    var d = C(a),
        b;for (b in a) {
      d[b] = c.hasOwnProperty(b) ? c[b] : a[b];
    }return d;
  }function z(a, c) {
    var d = C(a),
        b;for (b in c) {
      d[b] = h.und(a[b]) ? c[b] : a[b];
    }return d;
  }function T(a) {
    a = a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (a, c, d, k) {
      return c + c + d + d + k + k;
    });var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
    a = parseInt(c[1], 16);var d = parseInt(c[2], 16),
        c = parseInt(c[3], 16);return "rgba(" + a + "," + d + "," + c + ",1)";
  }function U(a) {
    function c(a, c, b) {
      0 > b && (b += 1);1 < b && --b;return b < 1 / 6 ? a + 6 * (c - a) * b : .5 > b ? c : b < 2 / 3 ? a + (c - a) * (2 / 3 - b) * 6 : a;
    }var d = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a = parseInt(d[1]) / 360;var b = parseInt(d[2]) / 100,
        f = parseInt(d[3]) / 100,
        d = d[4] || 1;if (0 == b) f = b = a = f;else {
      var n = .5 > f ? f * (1 + b) : f + b - f * b,
          k = 2 * f - n,
          f = c(k, n, a + 1 / 3),
          b = c(k, n, a);a = c(k, n, a - 1 / 3);
    }return "rgba(" + 255 * f + "," + 255 * b + "," + 255 * a + "," + d + ")";
  }function y(a) {
    if (a = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a)) return a[2];
  }function V(a) {
    if (-1 < a.indexOf("translate") || "perspective" === a) return "px";if (-1 < a.indexOf("rotate") || -1 < a.indexOf("skew")) return "deg";
  }function I(a, c) {
    return h.fnc(a) ? a(c.target, c.id, c.total) : a;
  }function E(a, c) {
    if (c in a.style) return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()) || "0";
  }function J(a, c) {
    if (h.dom(a) && u(W, c)) return "transform";if (h.dom(a) && (a.getAttribute(c) || h.svg(a) && a[c])) return "attribute";if (h.dom(a) && "transform" !== c && E(a, c)) return "css";if (null != a[c]) return "object";
  }function X(a, c) {
    var d = V(c),
        d = -1 < c.indexOf("scale") ? 1 : 0 + d;a = a.style.transform;if (!a) return d;for (var b = [], f = [], n = [], k = /(\w+)\((.+?)\)/g; b = k.exec(a);) {
      f.push(b[1]), n.push(b[2]);
    }a = r(n, function (a, b) {
      return f[b] === c;
    });return a.length ? a[0] : d;
  }function K(a, c) {
    switch (J(a, c)) {case "transform":
        return X(a, c);case "css":
        return E(a, c);case "attribute":
        return a.getAttribute(c);}return a[c] || 0;
  }function L(a, c) {
    var d = /^(\*=|\+=|-=)/.exec(a);if (!d) return a;var b = y(a) || 0;c = parseFloat(c);a = parseFloat(a.replace(d[0], ""));switch (d[0][0]) {case "+":
        return c + a + b;case "-":
        return c - a + b;case "*":
        return c * a + b;}
  }function F(a, c) {
    return Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
  }function M(a) {
    a = a.points;for (var c = 0, d, b = 0; b < a.numberOfItems; b++) {
      var f = a.getItem(b);0 < b && (c += F(d, f));d = f;
    }return c;
  }function N(a) {
    if (a.getTotalLength) return a.getTotalLength();switch (a.tagName.toLowerCase()) {case "circle":
        return 2 * Math.PI * a.getAttribute("r");case "rect":
        return 2 * a.getAttribute("width") + 2 * a.getAttribute("height");case "line":
        return F({ x: a.getAttribute("x1"), y: a.getAttribute("y1") }, { x: a.getAttribute("x2"), y: a.getAttribute("y2") });case "polyline":
        return M(a);case "polygon":
        var c = a.points;return M(a) + F(c.getItem(c.numberOfItems - 1), c.getItem(0));}
  }function Y(a, c) {
    function d(b) {
      b = void 0 === b ? 0 : b;return a.el.getPointAtLength(1 <= c + b ? c + b : 0);
    }var b = d(),
        f = d(-1),
        n = d(1);switch (a.property) {case "x":
        return b.x;case "y":
        return b.y;
      case "angle":
        return 180 * Math.atan2(n.y - f.y, n.x - f.x) / Math.PI;}
  }function O(a, c) {
    var d = /-?\d*\.?\d+/g,
        b;b = h.pth(a) ? a.totalLength : a;if (h.col(b)) {
      if (h.rgb(b)) {
        var f = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b = f ? "rgba(" + f[1] + ",1)" : b;
      } else b = h.hex(b) ? T(b) : h.hsl(b) ? U(b) : void 0;
    } else f = (f = y(b)) ? b.substr(0, b.length - f.length) : b, b = c && !/\s/g.test(b) ? f + c : f;b += "";return { original: b, numbers: b.match(d) ? b.match(d).map(Number) : [0], strings: h.str(a) || c ? b.split(d) : [] };
  }function P(a) {
    a = a ? p(h.arr(a) ? a.map(m) : m(a)) : [];return r(a, function (a, d, b) {
      return b.indexOf(a) === d;
    });
  }function Z(a) {
    var c = P(a);return c.map(function (a, b) {
      return { target: a, id: b, total: c.length };
    });
  }function aa(a, c) {
    var d = C(c);if (h.arr(a)) {
      var b = a.length;2 !== b || h.obj(a[0]) ? h.fnc(c.duration) || (d.duration = c.duration / b) : a = { value: a };
    }return m(a).map(function (a, b) {
      b = b ? 0 : c.delay;a = h.obj(a) && !h.pth(a) ? a : { value: a };h.und(a.delay) && (a.delay = b);return a;
    }).map(function (a) {
      return z(a, d);
    });
  }function ba(a, c) {
    var d = {},
        b;for (b in a) {
      var f = I(a[b], c);h.arr(f) && (f = f.map(function (a) {
        return I(a, c);
      }), 1 === f.length && (f = f[0]));d[b] = f;
    }d.duration = parseFloat(d.duration);d.delay = parseFloat(d.delay);return d;
  }function ca(a) {
    return h.arr(a) ? A.apply(this, a) : Q[a];
  }function da(a, c) {
    var d;return a.tweens.map(function (b) {
      b = ba(b, c);var f = b.value,
          e = K(c.target, a.name),
          k = d ? d.to.original : e,
          k = h.arr(f) ? f[0] : k,
          w = L(h.arr(f) ? f[1] : f, k),
          e = y(w) || y(k) || y(e);b.from = O(k, e);b.to = O(w, e);b.start = d ? d.end : a.offset;b.end = b.start + b.delay + b.duration;b.easing = ca(b.easing);b.elasticity = (1E3 - Math.min(Math.max(b.elasticity, 1), 999)) / 1E3;b.isPath = h.pth(f);b.isColor = h.col(b.from.original);b.isColor && (b.round = 1);return d = b;
    });
  }function ea(a, c) {
    return r(p(a.map(function (a) {
      return c.map(function (b) {
        var c = J(a.target, b.name);if (c) {
          var d = da(b, a);b = { type: c, property: b.name, animatable: a, tweens: d, duration: d[d.length - 1].end, delay: d[0].delay };
        } else b = void 0;return b;
      });
    })), function (a) {
      return !h.und(a);
    });
  }function R(a, c, d, b) {
    var f = "delay" === a;return c.length ? (f ? Math.min : Math.max).apply(Math, c.map(function (b) {
      return b[a];
    })) : f ? b.delay : d.offset + b.delay + b.duration;
  }function fa(a) {
    var c = D(ga, a),
        d = D(S, a),
        b = Z(a.targets),
        f = [],
        e = z(c, d),
        k;for (k in a) {
      e.hasOwnProperty(k) || "targets" === k || f.push({ name: k, offset: e.offset, tweens: aa(a[k], d) });
    }a = ea(b, f);return z(c, { children: [], animatables: b, animations: a, duration: R("duration", a, c, d), delay: R("delay", a, c, d) });
  }function q(a) {
    function c() {
      return window.Promise && new Promise(function (a) {
        return p = a;
      });
    }function d(a) {
      return g.reversed ? g.duration - a : a;
    }function b(a) {
      for (var b = 0, c = {}, d = g.animations, f = d.length; b < f;) {
        var e = d[b],
            k = e.animatable,
            h = e.tweens,
            n = h.length - 1,
            l = h[n];n && (l = r(h, function (b) {
          return a < b.end;
        })[0] || l);for (var h = Math.min(Math.max(a - l.start - l.delay, 0), l.duration) / l.duration, w = isNaN(h) ? 1 : l.easing(h, l.elasticity), h = l.to.strings, p = l.round, n = [], m = void 0, m = l.to.numbers.length, t = 0; t < m; t++) {
          var x = void 0,
              x = l.to.numbers[t],
              q = l.from.numbers[t],
              x = l.isPath ? Y(l.value, w * x) : q + w * (x - q);p && (l.isColor && 2 < t || (x = Math.round(x * p) / p));n.push(x);
        }if (l = h.length) for (m = h[0], w = 0; w < l; w++) {
          p = h[w + 1], t = n[w], isNaN(t) || (m = p ? m + (t + p) : m + (t + " "));
        } else m = n[0];ha[e.type](k.target, e.property, m, c, k.id);e.currentValue = m;b++;
      }if (b = Object.keys(c).length) for (d = 0; d < b; d++) {
        H || (H = E(document.body, "transform") ? "transform" : "-webkit-transform"), g.animatables[d].target.style[H] = c[d].join(" ");
      }g.currentTime = a;g.progress = a / g.duration * 100;
    }function f(a) {
      if (g[a]) g[a](g);
    }function e() {
      g.remaining && !0 !== g.remaining && g.remaining--;
    }function k(a) {
      var k = g.duration,
          n = g.offset,
          w = n + g.delay,
          r = g.currentTime,
          x = g.reversed,
          q = d(a);if (g.children.length) {
        var u = g.children,
            v = u.length;
        if (q >= g.currentTime) for (var G = 0; G < v; G++) {
          u[G].seek(q);
        } else for (; v--;) {
          u[v].seek(q);
        }
      }if (q >= w || !k) g.began || (g.began = !0, f("begin")), f("run");if (q > n && q < k) b(q);else if (q <= n && 0 !== r && (b(0), x && e()), q >= k && r !== k || !k) b(k), x || e();f("update");a >= k && (g.remaining ? (t = h, "alternate" === g.direction && (g.reversed = !g.reversed)) : (g.pause(), g.completed || (g.completed = !0, f("complete"), "Promise" in window && (p(), m = c()))), l = 0);
    }a = void 0 === a ? {} : a;var h,
        t,
        l = 0,
        p = null,
        m = c(),
        g = fa(a);g.reset = function () {
      var a = g.direction,
          c = g.loop;g.currentTime = 0;g.progress = 0;g.paused = !0;g.began = !1;g.completed = !1;g.reversed = "reverse" === a;g.remaining = "alternate" === a && 1 === c ? 2 : c;b(0);for (a = g.children.length; a--;) {
        g.children[a].reset();
      }
    };g.tick = function (a) {
      h = a;t || (t = h);k((l + h - t) * q.speed);
    };g.seek = function (a) {
      k(d(a));
    };g.pause = function () {
      var a = v.indexOf(g);-1 < a && v.splice(a, 1);g.paused = !0;
    };g.play = function () {
      g.paused && (g.paused = !1, t = 0, l = d(g.currentTime), v.push(g), B || ia());
    };g.reverse = function () {
      g.reversed = !g.reversed;t = 0;l = d(g.currentTime);
    };g.restart = function () {
      g.pause();
      g.reset();g.play();
    };g.finished = m;g.reset();g.autoplay && g.play();return g;
  }var ga = { update: void 0, begin: void 0, run: void 0, complete: void 0, loop: 1, direction: "normal", autoplay: !0, offset: 0 },
      S = { duration: 1E3, delay: 0, easing: "easeOutElastic", elasticity: 500, round: 0 },
      W = "translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),
      H,
      h = { arr: function (a) {
      return Array.isArray(a);
    }, obj: function (a) {
      return -1 < Object.prototype.toString.call(a).indexOf("Object");
    },
    pth: function (a) {
      return h.obj(a) && a.hasOwnProperty("totalLength");
    }, svg: function (a) {
      return a instanceof SVGElement;
    }, dom: function (a) {
      return a.nodeType || h.svg(a);
    }, str: function (a) {
      return "string" === typeof a;
    }, fnc: function (a) {
      return "function" === typeof a;
    }, und: function (a) {
      return "undefined" === typeof a;
    }, hex: function (a) {
      return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
      );
    }, rgb: function (a) {
      return (/^rgb/.test(a)
      );
    }, hsl: function (a) {
      return (/^hsl/.test(a)
      );
    }, col: function (a) {
      return h.hex(a) || h.rgb(a) || h.hsl(a);
    } },
      A = function () {
    function a(a, d, b) {
      return (((1 - 3 * b + 3 * d) * a + (3 * b - 6 * d)) * a + 3 * d) * a;
    }return function (c, d, b, f) {
      if (0 <= c && 1 >= c && 0 <= b && 1 >= b) {
        var e = new Float32Array(11);if (c !== d || b !== f) for (var k = 0; 11 > k; ++k) {
          e[k] = a(.1 * k, c, b);
        }return function (k) {
          if (c === d && b === f) return k;if (0 === k) return 0;if (1 === k) return 1;for (var h = 0, l = 1; 10 !== l && e[l] <= k; ++l) {
            h += .1;
          }--l;var l = h + (k - e[l]) / (e[l + 1] - e[l]) * .1,
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (.001 <= n) {
            for (h = 0; 4 > h; ++h) {
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (0 === n) break;var m = a(l, c, b) - k,
                  l = l - m / n;
            }k = l;
          } else if (0 === n) k = l;else {
            var l = h,
                h = h + .1,
                g = 0;do {
              m = l + (h - l) / 2, n = a(m, c, b) - k, 0 < n ? h = m : l = m;
            } while (1e-7 < Math.abs(n) && 10 > ++g);k = m;
          }return a(k, d, f);
        };
      }
    };
  }(),
      Q = function () {
    function a(a, b) {
      return 0 === a || 1 === a ? a : -Math.pow(2, 10 * (a - 1)) * Math.sin(2 * (a - 1 - b / (2 * Math.PI) * Math.asin(1)) * Math.PI / b);
    }var c = "Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),
        d = { In: [[.55, .085, .68, .53], [.55, .055, .675, .19], [.895, .03, .685, .22], [.755, .05, .855, .06], [.47, 0, .745, .715], [.95, .05, .795, .035], [.6, .04, .98, .335], [.6, -.28, .735, .045], a], Out: [[.25, .46, .45, .94], [.215, .61, .355, 1], [.165, .84, .44, 1], [.23, 1, .32, 1], [.39, .575, .565, 1], [.19, 1, .22, 1], [.075, .82, .165, 1], [.175, .885, .32, 1.275], function (b, c) {
        return 1 - a(1 - b, c);
      }], InOut: [[.455, .03, .515, .955], [.645, .045, .355, 1], [.77, 0, .175, 1], [.86, 0, .07, 1], [.445, .05, .55, .95], [1, 0, 0, 1], [.785, .135, .15, .86], [.68, -.55, .265, 1.55], function (b, c) {
        return .5 > b ? a(2 * b, c) / 2 : 1 - a(-2 * b + 2, c) / 2;
      }] },
        b = { linear: A(.25, .25, .75, .75) },
        f = {},
        e;for (e in d) {
      f.type = e, d[f.type].forEach(function (a) {
        return function (d, f) {
          b["ease" + a.type + c[f]] = h.fnc(d) ? d : A.apply($jscomp$this, d);
        };
      }(f)), f = { type: f.type };
    }return b;
  }(),
      ha = { css: function (a, c, d) {
      return a.style[c] = d;
    }, attribute: function (a, c, d) {
      return a.setAttribute(c, d);
    }, object: function (a, c, d) {
      return a[c] = d;
    }, transform: function (a, c, d, b, f) {
      b[f] || (b[f] = []);b[f].push(c + "(" + d + ")");
    } },
      v = [],
      B = 0,
      ia = function () {
    function a() {
      B = requestAnimationFrame(c);
    }function c(c) {
      var b = v.length;if (b) {
        for (var d = 0; d < b;) {
          v[d] && v[d].tick(c), d++;
        }a();
      } else cancelAnimationFrame(B), B = 0;
    }return a;
  }();q.version = "2.2.0";q.speed = 1;q.running = v;q.remove = function (a) {
    a = P(a);for (var c = v.length; c--;) {
      for (var d = v[c], b = d.animations, f = b.length; f--;) {
        u(a, b[f].animatable.target) && (b.splice(f, 1), b.length || d.pause());
      }
    }
  };q.getValue = K;q.path = function (a, c) {
    var d = h.str(a) ? e(a)[0] : a,
        b = c || 100;return function (a) {
      return { el: d, property: a, totalLength: N(d) * (b / 100) };
    };
  };q.setDashoffset = function (a) {
    var c = N(a);a.setAttribute("stroke-dasharray", c);return c;
  };q.bezier = A;q.easings = Q;q.timeline = function (a) {
    var c = q(a);c.pause();c.duration = 0;c.add = function (d) {
      c.children.forEach(function (a) {
        a.began = !0;a.completed = !0;
      });m(d).forEach(function (b) {
        var d = z(b, D(S, a || {}));d.targets = d.targets || a.targets;b = c.duration;var e = d.offset;d.autoplay = !1;d.direction = c.direction;d.offset = h.und(e) ? b : L(e, b);c.began = !0;c.completed = !0;c.seek(d.offset);d = q(d);d.began = !0;d.completed = !0;d.duration > b && (c.duration = d.duration);c.children.push(d);
      });c.seek(0);c.reset();c.autoplay && c.restart();return c;
    };return c;
  };q.random = function (a, c) {
    return Math.floor(Math.random() * (c - a + 1)) + a;
  };return q;
});
;(function ($, anim) {
  'use strict';

  var _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300
  };

  /**
   * @class
   *
   */

  var Collapsible = function (_Component) {
    _inherits(Collapsible, _Component);

    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Collapsible(el, options) {
      _classCallCheck(this, Collapsible);

      var _this3 = _possibleConstructorReturn(this, (Collapsible.__proto__ || Object.getPrototypeOf(Collapsible)).call(this, Collapsible, el, options));

      _this3.el.M_Collapsible = _this3;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      _this3.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      _this3.$headers = _this3.$el.children('li').children('.collapsible-header');
      _this3.$headers.attr('tabindex', 0);

      _this3._setupEventHandlers();

      // Open first active
      var $activeBodies = _this3.$el.children('li.active').children('.collapsible-body');
      if (_this3.options.accordion) {
        // Handle Accordion
        $activeBodies.first().css('display', 'block');
      } else {
        // Handle Expandables
        $activeBodies.css('display', 'block');
      }
      return _this3;
    }

    _createClass(Collapsible, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Collapsible = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this4 = this;

        this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
        this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
        this.el.addEventListener('click', this._handleCollapsibleClickBound);
        this.$headers.each(function (header) {
          header.addEventListener('keydown', _this4._handleCollapsibleKeydownBound);
        });
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this5 = this;

        this.el.removeEventListener('click', this._handleCollapsibleClickBound);
        this.$headers.each(function (header) {
          header.removeEventListener('keydown', _this5._handleCollapsibleKeydownBound);
        });
      }

      /**
       * Handle Collapsible Click
       * @param {Event} e
       */

    }, {
      key: "_handleCollapsibleClick",
      value: function _handleCollapsibleClick(e) {
        var $header = $(e.target).closest('.collapsible-header');
        if (e.target && $header.length) {
          var $collapsible = $header.closest('.collapsible');
          if ($collapsible[0] === this.el) {
            var $collapsibleLi = $header.closest('li');
            var $collapsibleLis = $collapsible.children('li');
            var isActive = $collapsibleLi[0].classList.contains('active');
            var index = $collapsibleLis.index($collapsibleLi);

            if (isActive) {
              this.close(index);
            } else {
              this.open(index);
            }
          }
        }
      }

      /**
       * Handle Collapsible Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleCollapsibleKeydown",
      value: function _handleCollapsibleKeydown(e) {
        if (e.keyCode === 13) {
          this._handleCollapsibleClickBound(e);
        }
      }

      /**
       * Animate in collapsible slide
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "_animateIn",
      value: function _animateIn(index) {
        var _this6 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length) {
          var $body = $collapsibleLi.children('.collapsible-body');

          anim.remove($body[0]);
          $body.css({
            display: 'block',
            overflow: 'hidden',
            height: 0,
            paddingTop: '',
            paddingBottom: ''
          });

          var pTop = $body.css('padding-top');
          var pBottom = $body.css('padding-bottom');
          var finalHeight = $body[0].scrollHeight;
          $body.css({
            paddingTop: 0,
            paddingBottom: 0
          });

          anim({
            targets: $body[0],
            height: finalHeight,
            paddingTop: pTop,
            paddingBottom: pBottom,
            duration: this.options.inDuration,
            easing: 'easeInOutCubic',
            complete: function (anim) {
              $body.css({
                overflow: '',
                paddingTop: '',
                paddingBottom: '',
                height: ''
              });

              // onOpenEnd callback
              if (typeof _this6.options.onOpenEnd === 'function') {
                _this6.options.onOpenEnd.call(_this6, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Animate out collapsible slide
       * @param {Number} index - 0th index of slide to open
       */

    }, {
      key: "_animateOut",
      value: function _animateOut(index) {
        var _this7 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length) {
          var $body = $collapsibleLi.children('.collapsible-body');
          anim.remove($body[0]);
          $body.css('overflow', 'hidden');
          anim({
            targets: $body[0],
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: this.options.outDuration,
            easing: 'easeInOutCubic',
            complete: function () {
              $body.css({
                height: '',
                overflow: '',
                padding: '',
                display: ''
              });

              // onCloseEnd callback
              if (typeof _this7.options.onCloseEnd === 'function') {
                _this7.options.onCloseEnd.call(_this7, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Open Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "open",
      value: function open(index) {
        var _this8 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {
          // onOpenStart callback
          if (typeof this.options.onOpenStart === 'function') {
            this.options.onOpenStart.call(this, $collapsibleLi[0]);
          }

          // Handle accordion behavior
          if (this.options.accordion) {
            var $collapsibleLis = this.$el.children('li');
            var $activeLis = this.$el.children('li.active');
            $activeLis.each(function (el) {
              var index = $collapsibleLis.index($(el));
              _this8.close(index);
            });
          }

          // Animate in
          $collapsibleLi[0].classList.add('active');
          this._animateIn(index);
        }
      }

      /**
       * Close Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "close",
      value: function close(index) {
        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {
          // onCloseStart callback
          if (typeof this.options.onCloseStart === 'function') {
            this.options.onCloseStart.call(this, $collapsibleLi[0]);
          }

          // Animate out
          $collapsibleLi[0].classList.remove('active');
          this._animateOut(index);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Collapsible.__proto__ || Object.getPrototypeOf(Collapsible), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Collapsible;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Collapsible;
  }(Component);

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
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

  var Dropdown = function (_Component2) {
    _inherits(Dropdown, _Component2);

    function Dropdown(el, options) {
      _classCallCheck(this, Dropdown);

      var _this9 = _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call(this, Dropdown, el, options));

      _this9.el.M_Dropdown = _this9;
      Dropdown._dropdowns.push(_this9);

      _this9.id = M.getIdFromTrigger(el);
      _this9.dropdownEl = document.getElementById(_this9.id);
      _this9.$dropdownEl = $(_this9.dropdownEl);

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
      _this9.options = $.extend({}, Dropdown.defaults, options);

      /**
       * Describes open/close state of dropdown
       * @type {Boolean}
       */
      _this9.isOpen = false;

      /**
       * Describes if dropdown content is scrollable
       * @type {Boolean}
       */
      _this9.isScrollable = false;

      /**
       * Describes if touch moving on dropdown content
       * @type {Boolean}
       */
      _this9.isTouchMoving = false;

      _this9.focusedIndex = -1;
      _this9.filterQuery = [];

      // Move dropdown-content after dropdown-trigger
      if (!!_this9.options.container) {
        $(_this9.options.container).append(_this9.dropdownEl);
      } else {
        _this9.$el.after(_this9.dropdownEl);
      }

      _this9._makeDropdownFocusable();
      _this9._resetFilterQueryBound = _this9._resetFilterQuery.bind(_this9);
      _this9._handleDocumentClickBound = _this9._handleDocumentClick.bind(_this9);
      _this9._handleDocumentTouchmoveBound = _this9._handleDocumentTouchmove.bind(_this9);
      _this9._handleDropdownClickBound = _this9._handleDropdownClick.bind(_this9);
      _this9._handleDropdownKeydownBound = _this9._handleDropdownKeydown.bind(_this9);
      _this9._handleTriggerKeydownBound = _this9._handleTriggerKeydown.bind(_this9);
      _this9._setupEventHandlers();
      return _this9;
    }

    _createClass(Dropdown, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._resetDropdownStyles();
        this._removeEventHandlers();
        Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
        this.el.M_Dropdown = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
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

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
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
    }, {
      key: "_setupTemporaryEventHandlers",
      value: function _setupTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
        document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_removeTemporaryEventHandlers",
      value: function _removeTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
        document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(e) {
        e.preventDefault();
        this.open();
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.open();
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave(e) {
        var toEl = e.toElement || e.relatedTarget;
        var leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
        var leaveToActiveDropdownTrigger = false;

        var $closestTrigger = $(toEl).closest('.dropdown-trigger');
        if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown && $closestTrigger[0].M_Dropdown.isOpen) {
          leaveToActiveDropdownTrigger = true;
        }

        // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
        if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
          this.close();
        }
      }
    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        var _this10 = this;

        var $target = $(e.target);
        if (this.options.closeOnClick && $target.closest('.dropdown-content').length && !this.isTouchMoving) {
          // isTouchMoving to check if scrolling on mobile.
          setTimeout(function () {
            _this10.close();
          }, 0);
        } else if ($target.closest('.dropdown-trigger').length || !$target.closest('.dropdown-content').length) {
          setTimeout(function () {
            _this10.close();
          }, 0);
        }
        this.isTouchMoving = false;
      }
    }, {
      key: "_handleTriggerKeydown",
      value: function _handleTriggerKeydown(e) {
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

    }, {
      key: "_handleDocumentTouchmove",
      value: function _handleDocumentTouchmove(e) {
        var $target = $(e.target);
        if ($target.closest('.dropdown-content').length) {
          this.isTouchMoving = true;
        }
      }

      /**
       * Handle Dropdown Click
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownClick",
      value: function _handleDropdownClick(e) {
        // onItemClick callback
        if (typeof this.options.onItemClick === 'function') {
          var itemEl = $(e.target).closest('li')[0];
          this.options.onItemClick.call(this, itemEl);
        }
      }

      /**
       * Handle Dropdown Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownKeydown",
      value: function _handleDropdownKeydown(e) {
        if (e.which === M.keys.TAB) {
          e.preventDefault();
          this.close();

          // Navigate down dropdown list
        } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) && this.isOpen) {
          e.preventDefault();
          var direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
          var newFocusedIndex = this.focusedIndex;
          var foundNewIndex = false;
          do {
            newFocusedIndex = newFocusedIndex + direction;

            if (!!this.dropdownEl.children[newFocusedIndex] && this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
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
          var focusedElement = this.dropdownEl.children[this.focusedIndex];
          var $activatableElement = $(focusedElement).find('a, button').first();

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
        var letter = String.fromCharCode(e.which).toLowerCase(),
            nonLetters = [9, 13, 27, 38, 40];
        if (letter && nonLetters.indexOf(e.which) === -1) {
          this.filterQuery.push(letter);

          var string = this.filterQuery.join(''),
              newOptionEl = $(this.dropdownEl).find('li').filter(function (el) {
            return $(el).text().toLowerCase().indexOf(string) === 0;
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

    }, {
      key: "_resetFilterQuery",
      value: function _resetFilterQuery() {
        this.filterQuery = [];
      }
    }, {
      key: "_resetDropdownStyles",
      value: function _resetDropdownStyles() {
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
    }, {
      key: "_makeDropdownFocusable",
      value: function _makeDropdownFocusable() {
        // Needed for arrow key navigation
        this.dropdownEl.tabIndex = 0;

        // Only set tabindex if it hasn't been set by user
        $(this.dropdownEl).children().each(function (el) {
          if (!el.getAttribute('tabindex')) {
            el.setAttribute('tabindex', 0);
          }
        });
      }
    }, {
      key: "_focusFocusedItem",
      value: function _focusFocusedItem() {
        if (this.focusedIndex >= 0 && this.focusedIndex < this.dropdownEl.children.length && this.options.autoFocus) {
          this.dropdownEl.children[this.focusedIndex].focus();
        }
      }
    }, {
      key: "_getDropdownPosition",
      value: function _getDropdownPosition() {
        var offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
        var triggerBRect = this.el.getBoundingClientRect();
        var dropdownBRect = this.dropdownEl.getBoundingClientRect();

        var idealHeight = dropdownBRect.height;
        var idealWidth = dropdownBRect.width;
        var idealXPos = triggerBRect.left - dropdownBRect.left;
        var idealYPos = triggerBRect.top - dropdownBRect.top;

        var dropdownBounds = {
          left: idealXPos,
          top: idealYPos,
          height: idealHeight,
          width: idealWidth
        };

        // Countainer here will be closest ancestor with overflow: hidden
        var closestOverflowParent = !!this.dropdownEl.offsetParent ? this.dropdownEl.offsetParent : this.dropdownEl.parentNode;

        var alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

        var verticalAlignment = 'top';
        var horizontalAlignment = this.options.alignment;
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
          var oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
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
          idealYPos = idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
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

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this11 = this;

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
          complete: function (anim) {
            if (_this11.options.autoFocus) {
              _this11.dropdownEl.focus();
            }

            // onOpenEnd callback
            if (typeof _this11.options.onOpenEnd === 'function') {
              _this11.options.onOpenEnd.call(_this11, _this11.el);
            }
          }
        });
      }

      /**
       * Animate out dropdown
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this12 = this;

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
          complete: function (anim) {
            _this12._resetDropdownStyles();

            // onCloseEnd callback
            if (typeof _this12.options.onCloseEnd === 'function') {
              _this12.options.onCloseEnd.call(_this12, _this12.el);
            }
          }
        });
      }

      /**
       * Place dropdown
       */

    }, {
      key: "_placeDropdown",
      value: function _placeDropdown() {
        // Set width before calculating positionInfo
        var idealWidth = this.options.constrainWidth ? this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
        this.dropdownEl.style.width = idealWidth + 'px';

        var positionInfo = this._getDropdownPosition();
        this.dropdownEl.style.left = positionInfo.x + 'px';
        this.dropdownEl.style.top = positionInfo.y + 'px';
        this.dropdownEl.style.height = positionInfo.height + 'px';
        this.dropdownEl.style.width = positionInfo.width + 'px';
        this.dropdownEl.style.transformOrigin = (positionInfo.horizontalAlignment === 'left' ? '0' : '100%') + " " + (positionInfo.verticalAlignment === 'top' ? '0' : '100%');
      }

      /**
       * Open Dropdown
       */

    }, {
      key: "open",
      value: function open() {
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

    }, {
      key: "close",
      value: function close() {
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

    }, {
      key: "recalculateDimensions",
      value: function recalculateDimensions() {
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
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Dropdown.__proto__ || Object.getPrototypeOf(Dropdown), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Dropdown;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Dropdown;
  }(Component);

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
;(function ($, anim) {
  'use strict';

  var _defaults = {
    opacity: 0.5,
    inDuration: 250,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true,
    dismissible: true,
    startingTop: '4%',
    endingTop: '10%'
  };

  /**
   * @class
   *
   */

  var Modal = function (_Component3) {
    _inherits(Modal, _Component3);

    /**
     * Construct Modal instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Modal(el, options) {
      _classCallCheck(this, Modal);

      var _this13 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, Modal, el, options));

      _this13.el.M_Modal = _this13;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=250] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before modal is opened
       * @prop {Function} onOpenEnd - Callback function called after modal is opened
       * @prop {Function} onCloseStart - Callback function called before modal is closed
       * @prop {Function} onCloseEnd - Callback function called after modal is closed
       * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
       * @prop {String} [startingTop='4%'] - startingTop
       * @prop {String} [endingTop='10%'] - endingTop
       */
      _this13.options = $.extend({}, Modal.defaults, options);

      /**
       * Describes open/close state of modal
       * @type {Boolean}
       */
      _this13.isOpen = false;

      _this13.id = _this13.$el.attr('id');
      _this13._openingTrigger = undefined;
      _this13.$overlay = $('<div class="modal-overlay"></div>');
      _this13.el.tabIndex = 0;
      _this13._nthModalOpened = 0;

      Modal._count++;
      _this13._setupEventHandlers();
      return _this13;
    }

    _createClass(Modal, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Modal._count--;
        this._removeEventHandlers();
        this.el.removeAttribute('style');
        this.$overlay.remove();
        this.el.M_Modal = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
        this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

        if (Modal._count === 1) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
        this.el.addEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Modal._count === 0) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
        this.el.removeEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.modal-trigger');
        if ($trigger.length) {
          var modalId = M.getIdFromTrigger($trigger[0]);
          var modalInstance = document.getElementById(modalId).M_Modal;
          if (modalInstance) {
            modalInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Handle Overlay Click
       */

    }, {
      key: "_handleOverlayClick",
      value: function _handleOverlayClick() {
        if (this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Modal Close Click
       * @param {Event} e
       */

    }, {
      key: "_handleModalCloseClick",
      value: function _handleModalCloseClick(e) {
        var $closeTrigger = $(e.target).closest('.modal-close');
        if ($closeTrigger.length) {
          this.close();
        }
      }

      /**
       * Handle Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleKeydown",
      value: function _handleKeydown(e) {
        // ESC key
        if (e.keyCode === 27 && this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Focus
       * @param {Event} e
       */

    }, {
      key: "_handleFocus",
      value: function _handleFocus(e) {
        // Only trap focus if this modal is the last model opened (prevents loops in nested modals).
        if (!this.el.contains(e.target) && this._nthModalOpened === Modal._modalsOpen) {
          this.el.focus();
        }
      }

      /**
       * Animate in modal
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this14 = this;

        // Set initial styles
        $.extend(this.el.style, {
          display: 'block',
          opacity: 0
        });
        $.extend(this.$overlay[0].style, {
          display: 'block',
          opacity: 0
        });

        // Animate overlay
        anim({
          targets: this.$overlay[0],
          opacity: this.options.opacity,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });

        // Define modal animation options
        var enterAnimOptions = {
          targets: this.el,
          duration: this.options.inDuration,
          easing: 'easeOutCubic',
          // Handle modal onOpenEnd callback
          complete: function () {
            if (typeof _this14.options.onOpenEnd === 'function') {
              _this14.options.onOpenEnd.call(_this14, _this14.el, _this14._openingTrigger);
            }
          }
        };

        // Bottom sheet animation
        if (this.el.classList.contains('bottom-sheet')) {
          $.extend(enterAnimOptions, {
            bottom: 0,
            opacity: 1
          });
          anim(enterAnimOptions);

          // Normal modal animation
        } else {
          $.extend(enterAnimOptions, {
            top: [this.options.startingTop, this.options.endingTop],
            opacity: 1,
            scaleX: [0.8, 1],
            scaleY: [0.8, 1]
          });
          anim(enterAnimOptions);
        }
      }

      /**
       * Animate out modal
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this15 = this;

        // Animate overlay
        anim({
          targets: this.$overlay[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuart'
        });

        // Define modal animation options
        var exitAnimOptions = {
          targets: this.el,
          duration: this.options.outDuration,
          easing: 'easeOutCubic',
          // Handle modal ready callback
          complete: function () {
            _this15.el.style.display = 'none';
            _this15.$overlay.remove();

            // Call onCloseEnd callback
            if (typeof _this15.options.onCloseEnd === 'function') {
              _this15.options.onCloseEnd.call(_this15, _this15.el);
            }
          }
        };

        // Bottom sheet animation
        if (this.el.classList.contains('bottom-sheet')) {
          $.extend(exitAnimOptions, {
            bottom: '-100%',
            opacity: 0
          });
          anim(exitAnimOptions);

          // Normal modal animation
        } else {
          $.extend(exitAnimOptions, {
            top: [this.options.endingTop, this.options.startingTop],
            opacity: 0,
            scaleX: 0.8,
            scaleY: 0.8
          });
          anim(exitAnimOptions);
        }
      }

      /**
       * Open Modal
       * @param {cash} [$trigger]
       */

    }, {
      key: "open",
      value: function open($trigger) {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        Modal._modalsOpen++;
        this._nthModalOpened = Modal._modalsOpen;

        // Set Z-Index based on number of currently open modals
        this.$overlay[0].style.zIndex = 1000 + Modal._modalsOpen * 2;
        this.el.style.zIndex = 1000 + Modal._modalsOpen * 2 + 1;

        // Set opening trigger, undefined indicates modal was opened by javascript
        this._openingTrigger = !!$trigger ? $trigger[0] : undefined;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el, this._openingTrigger);
        }

        if (this.options.preventScrolling) {
          document.body.style.overflow = 'hidden';
        }

        this.el.classList.add('open');
        this.el.insertAdjacentElement('afterend', this.$overlay[0]);

        if (this.options.dismissible) {
          this._handleKeydownBound = this._handleKeydown.bind(this);
          this._handleFocusBound = this._handleFocus.bind(this);
          document.addEventListener('keydown', this._handleKeydownBound);
          document.addEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateIn();

        // Focus modal
        this.el.focus();

        return this;
      }

      /**
       * Close Modal
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        Modal._modalsOpen--;
        this._nthModalOpened = 0;

        // Call onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this.el.classList.remove('open');

        // Enable body scrolling only if there are no more modals open.
        if (Modal._modalsOpen === 0) {
          document.body.style.overflow = '';
        }

        if (this.options.dismissible) {
          document.removeEventListener('keydown', this._handleKeydownBound);
          document.removeEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateOut();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Modal.__proto__ || Object.getPrototypeOf(Modal), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Modal;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Modal;
  }(Component);

  /**
   * @static
   * @memberof Modal
   */


  Modal._modalsOpen = 0;

  /**
   * @static
   * @memberof Modal
   */
  Modal._count = 0;

  M.Modal = Modal;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    inDuration: 275,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   *
   */

  var Materialbox = function (_Component4) {
    _inherits(Materialbox, _Component4);

    /**
     * Construct Materialbox instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Materialbox(el, options) {
      _classCallCheck(this, Materialbox);

      var _this16 = _possibleConstructorReturn(this, (Materialbox.__proto__ || Object.getPrototypeOf(Materialbox)).call(this, Materialbox, el, options));

      _this16.el.M_Materialbox = _this16;

      /**
       * Options for the modal
       * @member Materialbox#options
       * @prop {Number} [inDuration=275] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before materialbox is opened
       * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
       * @prop {Function} onCloseStart - Callback function called before materialbox is closed
       * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
       */
      _this16.options = $.extend({}, Materialbox.defaults, options);

      _this16.overlayActive = false;
      _this16.doneAnimating = true;
      _this16.placeholder = $('<div></div>').addClass('material-placeholder');
      _this16.originalWidth = 0;
      _this16.originalHeight = 0;
      _this16.originInlineStyles = _this16.$el.attr('style');
      _this16.caption = _this16.el.getAttribute('data-caption') || '';

      // Wrap
      _this16.$el.before(_this16.placeholder);
      _this16.placeholder.append(_this16.$el);

      _this16._setupEventHandlers();
      return _this16;
    }

    _createClass(Materialbox, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Materialbox = undefined;

        // Unwrap image
        $(this.placeholder).after(this.el).remove();

        this.$el.removeAttr('style');
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
        this.el.addEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Handle Materialbox Click
       * @param {Event} e
       */

    }, {
      key: "_handleMaterialboxClick",
      value: function _handleMaterialboxClick(e) {
        // If already modal, return to original
        if (this.doneAnimating === false || this.overlayActive && this.doneAnimating) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       * @param {Event} e
       */

    }, {
      key: "_handleWindowEscape",
      value: function _handleWindowEscape(e) {
        // ESC key
        if (e.keyCode === 27 && this.doneAnimating && this.overlayActive) {
          this.close();
        }
      }

      /**
       * Find ancestors with overflow: hidden; and make visible
       */

    }, {
      key: "_makeAncestorsOverflowVisible",
      value: function _makeAncestorsOverflowVisible() {
        this.ancestorsChanged = $();
        var ancestor = this.placeholder[0].parentNode;
        while (ancestor !== null && !$(ancestor).is(document)) {
          var curr = $(ancestor);
          if (curr.css('overflow') !== 'visible') {
            curr.css('overflow', 'visible');
            if (this.ancestorsChanged === undefined) {
              this.ancestorsChanged = curr;
            } else {
              this.ancestorsChanged = this.ancestorsChanged.add(curr);
            }
          }
          ancestor = ancestor.parentNode;
        }
      }

      /**
       * Animate image in
       */

    }, {
      key: "_animateImageIn",
      value: function _animateImageIn() {
        var _this17 = this;

        var animOptions = {
          targets: this.el,
          height: [this.originalHeight, this.newHeight],
          width: [this.originalWidth, this.newWidth],
          left: M.getDocumentScrollLeft() + this.windowWidth / 2 - this.placeholder.offset().left - this.newWidth / 2,
          top: M.getDocumentScrollTop() + this.windowHeight / 2 - this.placeholder.offset().top - this.newHeight / 2,
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this17.doneAnimating = true;

            // onOpenEnd callback
            if (typeof _this17.options.onOpenEnd === 'function') {
              _this17.options.onOpenEnd.call(_this17, _this17.el);
            }
          }
        };

        // Override max-width or max-height if needed
        this.maxWidth = this.$el.css('max-width');
        this.maxHeight = this.$el.css('max-height');
        if (this.maxWidth !== 'none') {
          animOptions.maxWidth = this.newWidth;
        }
        if (this.maxHeight !== 'none') {
          animOptions.maxHeight = this.newHeight;
        }

        anim(animOptions);
      }

      /**
       * Animate image out
       */

    }, {
      key: "_animateImageOut",
      value: function _animateImageOut() {
        var _this18 = this;

        var animOptions = {
          targets: this.el,
          width: this.originalWidth,
          height: this.originalHeight,
          left: 0,
          top: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this18.placeholder.css({
              height: '',
              width: '',
              position: '',
              top: '',
              left: ''
            });

            // Revert to width or height attribute
            if (_this18.attrWidth) {
              _this18.$el.attr('width', _this18.attrWidth);
            }
            if (_this18.attrHeight) {
              _this18.$el.attr('height', _this18.attrHeight);
            }

            _this18.$el.removeAttr('style');
            _this18.originInlineStyles && _this18.$el.attr('style', _this18.originInlineStyles);

            // Remove class
            _this18.$el.removeClass('active');
            _this18.doneAnimating = true;

            // Remove overflow overrides on ancestors
            if (_this18.ancestorsChanged.length) {
              _this18.ancestorsChanged.css('overflow', '');
            }

            // onCloseEnd callback
            if (typeof _this18.options.onCloseEnd === 'function') {
              _this18.options.onCloseEnd.call(_this18, _this18.el);
            }
          }
        };

        anim(animOptions);
      }

      /**
       * Update open and close vars
       */

    }, {
      key: "_updateVars",
      value: function _updateVars() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.caption = this.el.getAttribute('data-caption') || '';
      }

      /**
       * Open Materialbox
       */

    }, {
      key: "open",
      value: function open() {
        var _this19 = this;

        this._updateVars();
        this.originalWidth = this.el.getBoundingClientRect().width;
        this.originalHeight = this.el.getBoundingClientRect().height;

        // Set states
        this.doneAnimating = false;
        this.$el.addClass('active');
        this.overlayActive = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Set positioning for placeholder
        this.placeholder.css({
          width: this.placeholder[0].getBoundingClientRect().width + 'px',
          height: this.placeholder[0].getBoundingClientRect().height + 'px',
          position: 'relative',
          top: 0,
          left: 0
        });

        this._makeAncestorsOverflowVisible();

        // Set css on origin
        this.$el.css({
          position: 'absolute',
          'z-index': 1000,
          'will-change': 'left, top, width, height'
        });

        // Change from width or height attribute to css
        this.attrWidth = this.$el.attr('width');
        this.attrHeight = this.$el.attr('height');
        if (this.attrWidth) {
          this.$el.css('width', this.attrWidth + 'px');
          this.$el.removeAttr('width');
        }
        if (this.attrHeight) {
          this.$el.css('width', this.attrHeight + 'px');
          this.$el.removeAttr('height');
        }

        // Add overlay
        this.$overlay = $('<div id="materialbox-overlay"></div>').css({
          opacity: 0
        }).one('click', function () {
          if (_this19.doneAnimating) {
            _this19.close();
          }
        });

        // Put before in origin image to preserve z-index layering.
        this.$el.before(this.$overlay);

        // Set dimensions if needed
        var overlayOffset = this.$overlay[0].getBoundingClientRect();
        this.$overlay.css({
          width: this.windowWidth + 'px',
          height: this.windowHeight + 'px',
          left: -1 * overlayOffset.left + 'px',
          top: -1 * overlayOffset.top + 'px'
        });

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);

        // Animate Overlay
        anim({
          targets: this.$overlay[0],
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutQuad'
        });

        // Add and animate caption if it exists
        if (this.caption !== '') {
          if (this.$photocaption) {
            anim.remove(this.$photoCaption[0]);
          }
          this.$photoCaption = $('<div class="materialbox-caption"></div>');
          this.$photoCaption.text(this.caption);
          $('body').append(this.$photoCaption);
          this.$photoCaption.css({ display: 'inline' });

          anim({
            targets: this.$photoCaption[0],
            opacity: 1,
            duration: this.options.inDuration,
            easing: 'easeOutQuad'
          });
        }

        // Resize Image
        var ratio = 0;
        var widthPercent = this.originalWidth / this.windowWidth;
        var heightPercent = this.originalHeight / this.windowHeight;
        this.newWidth = 0;
        this.newHeight = 0;

        if (widthPercent > heightPercent) {
          ratio = this.originalHeight / this.originalWidth;
          this.newWidth = this.windowWidth * 0.9;
          this.newHeight = this.windowWidth * 0.9 * ratio;
        } else {
          ratio = this.originalWidth / this.originalHeight;
          this.newWidth = this.windowHeight * 0.9 * ratio;
          this.newHeight = this.windowHeight * 0.9;
        }

        this._animateImageIn();

        // Handle Exit triggers
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);

        window.addEventListener('scroll', this._handleWindowScrollBound);
        window.addEventListener('resize', this._handleWindowResizeBound);
        window.addEventListener('keyup', this._handleWindowEscapeBound);
      }

      /**
       * Close Materialbox
       */

    }, {
      key: "close",
      value: function close() {
        var _this20 = this;

        this._updateVars();
        this.doneAnimating = false;

        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);

        if (this.caption !== '') {
          anim.remove(this.$photoCaption[0]);
        }

        // disable exit handlers
        window.removeEventListener('scroll', this._handleWindowScrollBound);
        window.removeEventListener('resize', this._handleWindowResizeBound);
        window.removeEventListener('keyup', this._handleWindowEscapeBound);

        anim({
          targets: this.$overlay[0],
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this20.overlayActive = false;
            _this20.$overlay.remove();
          }
        });

        this._animateImageOut();

        // Remove Caption + reset css settings on image
        if (this.caption !== '') {
          anim({
            targets: this.$photoCaption[0],
            opacity: 0,
            duration: this.options.outDuration,
            easing: 'easeOutQuad',
            complete: function () {
              _this20.$photoCaption.remove();
            }
          });
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Materialbox.__proto__ || Object.getPrototypeOf(Materialbox), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Materialbox;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Materialbox;
  }(Component);

  M.Materialbox = Materialbox;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    responsiveThreshold: 0 // breakpoint for swipeable
  };

  var Parallax = function (_Component5) {
    _inherits(Parallax, _Component5);

    function Parallax(el, options) {
      _classCallCheck(this, Parallax);

      var _this21 = _possibleConstructorReturn(this, (Parallax.__proto__ || Object.getPrototypeOf(Parallax)).call(this, Parallax, el, options));

      _this21.el.M_Parallax = _this21;

      /**
       * Options for the Parallax
       * @member Parallax#options
       * @prop {Number} responsiveThreshold
       */
      _this21.options = $.extend({}, Parallax.defaults, options);
      _this21._enabled = window.innerWidth > _this21.options.responsiveThreshold;

      _this21.$img = _this21.$el.find('img').first();
      _this21.$img.each(function () {
        var el = this;
        if (el.complete) $(el).trigger('load');
      });

      _this21._updateParallax();
      _this21._setupEventHandlers();
      _this21._setupStyles();

      Parallax._parallaxes.push(_this21);
      return _this21;
    }

    _createClass(Parallax, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
        this.$img[0].style.transform = '';
        this._removeEventHandlers();

        this.$el[0].M_Parallax = undefined;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleImageLoadBound = this._handleImageLoad.bind(this);
        this.$img[0].addEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
          window.addEventListener('scroll', Parallax._handleScrollThrottled);

          Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
          window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.$img[0].removeEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          window.removeEventListener('scroll', Parallax._handleScrollThrottled);
          window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_setupStyles",
      value: function _setupStyles() {
        this.$img[0].style.opacity = 1;
      }
    }, {
      key: "_handleImageLoad",
      value: function _handleImageLoad() {
        this._updateParallax();
      }
    }, {
      key: "_updateParallax",
      value: function _updateParallax() {
        var containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
        var imgHeight = this.$img[0].offsetHeight;
        var parallaxDist = imgHeight - containerHeight;
        var bottom = this.$el.offset().top + containerHeight;
        var top = this.$el.offset().top;
        var scrollTop = M.getDocumentScrollTop();
        var windowHeight = window.innerHeight;
        var windowBottom = scrollTop + windowHeight;
        var percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
        var parallax = parallaxDist * percentScrolled;

        if (!this._enabled) {
          this.$img[0].style.transform = '';
        } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
          this.$img[0].style.transform = "translate3D(-50%, " + parallax + "px, 0)";
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Parallax.__proto__ || Object.getPrototypeOf(Parallax), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Parallax;
      }
    }, {
      key: "_handleScroll",
      value: function _handleScroll() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._updateParallax.call(parallaxInstance);
        }
      }
    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._enabled = window.innerWidth > parallaxInstance.options.responsiveThreshold;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Parallax;
  }(Component);

  /**
   * @static
   * @memberof Parallax
   */


  Parallax._parallaxes = [];

  M.Parallax = Parallax;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity // breakpoint for swipeable
  };

  /**
   * @class
   *
   */

  var Tabs = function (_Component6) {
    _inherits(Tabs, _Component6);

    /**
     * Construct Tabs instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tabs(el, options) {
      _classCallCheck(this, Tabs);

      var _this22 = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, Tabs, el, options));

      _this22.el.M_Tabs = _this22;

      /**
       * Options for the Tabs
       * @member Tabs#options
       * @prop {Number} duration
       * @prop {Function} onShow
       * @prop {Boolean} swipeable
       * @prop {Number} responsiveThreshold
       */
      _this22.options = $.extend({}, Tabs.defaults, options);

      // Setup
      _this22.$tabLinks = _this22.$el.children('li.tab').children('a');
      _this22.index = 0;
      _this22._setupActiveTabLink();

      // Setup tabs content
      if (_this22.options.swipeable) {
        _this22._setupSwipeableTabs();
      } else {
        _this22._setupNormalTabs();
      }

      // Setup tabs indicator after content to ensure accurate widths
      _this22._setTabsAndTabWidth();
      _this22._createIndicator();

      _this22._setupEventHandlers();
      return _this22;
    }

    _createClass(Tabs, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._indicator.parentNode.removeChild(this._indicator);

        if (this.options.swipeable) {
          this._teardownSwipeableTabs();
        } else {
          this._teardownNormalTabs();
        }

        this.$el[0].M_Tabs = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        window.addEventListener('resize', this._handleWindowResizeBound);

        this._handleTabClickBound = this._handleTabClick.bind(this);
        this.el.addEventListener('click', this._handleTabClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        window.removeEventListener('resize', this._handleWindowResizeBound);
        this.el.removeEventListener('click', this._handleTabClickBound);
      }

      /**
       * Handle window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        this._setTabsAndTabWidth();

        if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
          this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
          this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
        }
      }

      /**
       * Handle tab click
       * @param {Event} e
       */

    }, {
      key: "_handleTabClick",
      value: function _handleTabClick(e) {
        var _this23 = this;

        var tab = $(e.target).closest('li.tab');
        var tabLink = $(e.target).closest('a');

        // Handle click on tab link only
        if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
          return;
        }

        if (tab.hasClass('disabled')) {
          e.preventDefault();
          return;
        }

        // Act as regular link if target attribute is specified.
        if (!!tabLink.attr('target')) {
          return;
        }

        // Make the old tab inactive.
        this.$activeTabLink.removeClass('active');
        var $oldContent = this.$content;

        // Update the variables with the new link and content
        this.$activeTabLink = tabLink;
        this.$content = $(M.escapeHash(tabLink[0].hash));
        this.$tabLinks = this.$el.children('li.tab').children('a');

        // Make the tab active.
        this.$activeTabLink.addClass('active');
        var prevIndex = this.index;
        this.index = Math.max(this.$tabLinks.index(tabLink), 0);

        // Swap content
        if (this.options.swipeable) {
          if (this._tabsCarousel) {
            this._tabsCarousel.set(this.index, function () {
              if (typeof _this23.options.onShow === 'function') {
                _this23.options.onShow.call(_this23, _this23.$content[0]);
              }
            });
          }
        } else {
          if (this.$content.length) {
            this.$content[0].style.display = 'block';
            this.$content.addClass('active');
            if (typeof this.options.onShow === 'function') {
              this.options.onShow.call(this, this.$content[0]);
            }

            if ($oldContent.length && !$oldContent.is(this.$content)) {
              $oldContent[0].style.display = 'none';
              $oldContent.removeClass('active');
            }
          }
        }

        // Update widths after content is swapped (scrollbar bugfix)
        this._setTabsAndTabWidth();

        // Update indicator
        this._animateIndicator(prevIndex);

        // Prevent the anchor's default click action
        e.preventDefault();
      }

      /**
       * Generate elements for tab indicator.
       */

    }, {
      key: "_createIndicator",
      value: function _createIndicator() {
        var _this24 = this;

        var indicator = document.createElement('li');
        indicator.classList.add('indicator');

        this.el.appendChild(indicator);
        this._indicator = indicator;

        setTimeout(function () {
          _this24._indicator.style.left = _this24._calcLeftPos(_this24.$activeTabLink) + 'px';
          _this24._indicator.style.right = _this24._calcRightPos(_this24.$activeTabLink) + 'px';
        }, 0);
      }

      /**
       * Setup first active tab link.
       */

    }, {
      key: "_setupActiveTabLink",
      value: function _setupActiveTabLink() {
        // If the location.hash matches one of the links, use that as the active tab.
        this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));

        // If no match is found, use the first link or any with class 'active' as the initial active tab.
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a.active').first();
        }
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a').first();
        }

        this.$tabLinks.removeClass('active');
        this.$activeTabLink[0].classList.add('active');

        this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);

        if (this.$activeTabLink.length) {
          this.$content = $(M.escapeHash(this.$activeTabLink[0].hash));
          this.$content.addClass('active');
        }
      }

      /**
       * Setup swipeable tabs
       */

    }, {
      key: "_setupSwipeableTabs",
      value: function _setupSwipeableTabs() {
        var _this25 = this;

        // Change swipeable according to responsive threshold
        if (window.innerWidth > this.options.responsiveThreshold) {
          this.options.swipeable = false;
        }

        var $tabsContent = $();
        this.$tabLinks.each(function (link) {
          var $currContent = $(M.escapeHash(link.hash));
          $currContent.addClass('carousel-item');
          $tabsContent = $tabsContent.add($currContent);
        });

        var $tabsWrapper = $('<div class="tabs-content carousel carousel-slider"></div>');
        $tabsContent.first().before($tabsWrapper);
        $tabsWrapper.append($tabsContent);
        $tabsContent[0].style.display = '';

        // Keep active tab index to set initial carousel slide
        var activeTabIndex = this.$activeTabLink.closest('.tab').index();

        this._tabsCarousel = M.Carousel.init($tabsWrapper[0], {
          fullWidth: true,
          noWrap: true,
          onCycleTo: function (item) {
            var prevIndex = _this25.index;
            _this25.index = $(item).index();
            _this25.$activeTabLink.removeClass('active');
            _this25.$activeTabLink = _this25.$tabLinks.eq(_this25.index);
            _this25.$activeTabLink.addClass('active');
            _this25._animateIndicator(prevIndex);
            if (typeof _this25.options.onShow === 'function') {
              _this25.options.onShow.call(_this25, _this25.$content[0]);
            }
          }
        });

        // Set initial carousel slide to active tab
        this._tabsCarousel.set(activeTabIndex);
      }

      /**
       * Teardown normal tabs.
       */

    }, {
      key: "_teardownSwipeableTabs",
      value: function _teardownSwipeableTabs() {
        var $tabsWrapper = this._tabsCarousel.$el;
        this._tabsCarousel.destroy();

        // Unwrap
        $tabsWrapper.after($tabsWrapper.children());
        $tabsWrapper.remove();
      }

      /**
       * Setup normal tabs.
       */

    }, {
      key: "_setupNormalTabs",
      value: function _setupNormalTabs() {
        // Hide Tabs Content
        this.$tabLinks.not(this.$activeTabLink).each(function (link) {
          if (!!link.hash) {
            var $currContent = $(M.escapeHash(link.hash));
            if ($currContent.length) {
              $currContent[0].style.display = 'none';
            }
          }
        });
      }

      /**
       * Teardown normal tabs.
       */

    }, {
      key: "_teardownNormalTabs",
      value: function _teardownNormalTabs() {
        // show Tabs Content
        this.$tabLinks.each(function (link) {
          if (!!link.hash) {
            var $currContent = $(M.escapeHash(link.hash));
            if ($currContent.length) {
              $currContent[0].style.display = '';
            }
          }
        });
      }

      /**
       * set tabs and tab width
       */

    }, {
      key: "_setTabsAndTabWidth",
      value: function _setTabsAndTabWidth() {
        this.tabsWidth = this.$el.width();
        this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
      }

      /**
       * Finds right attribute for indicator based on active tab.
       * @param {cash} el
       */

    }, {
      key: "_calcRightPos",
      value: function _calcRightPos(el) {
        return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
      }

      /**
       * Finds left attribute for indicator based on active tab.
       * @param {cash} el
       */

    }, {
      key: "_calcLeftPos",
      value: function _calcLeftPos(el) {
        return Math.floor(el.position().left);
      }
    }, {
      key: "updateTabIndicator",
      value: function updateTabIndicator() {
        this._setTabsAndTabWidth();
        this._animateIndicator(this.index);
      }

      /**
       * Animates Indicator to active tab.
       * @param {Number} prevIndex
       */

    }, {
      key: "_animateIndicator",
      value: function _animateIndicator(prevIndex) {
        var leftDelay = 0,
            rightDelay = 0;

        if (this.index - prevIndex >= 0) {
          leftDelay = 90;
        } else {
          rightDelay = 90;
        }

        // Animate
        var animOptions = {
          targets: this._indicator,
          left: {
            value: this._calcLeftPos(this.$activeTabLink),
            delay: leftDelay
          },
          right: {
            value: this._calcRightPos(this.$activeTabLink),
            delay: rightDelay
          },
          duration: this.options.duration,
          easing: 'easeOutQuad'
        };
        anim.remove(this._indicator);
        anim(animOptions);
      }

      /**
       * Select tab.
       * @param {String} tabId
       */

    }, {
      key: "select",
      value: function select(tabId) {
        var tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
        if (tab.length) {
          tab.trigger('click');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tabs.__proto__ || Object.getPrototypeOf(Tabs), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tabs;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tabs;
  }(Component);

  M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    exitDelay: 200,
    enterDelay: 0,
    html: null,
    margin: 5,
    inDuration: 250,
    outDuration: 200,
    position: 'bottom',
    transitionMovement: 10
  };

  /**
   * @class
   *
   */

  var Tooltip = function (_Component7) {
    _inherits(Tooltip, _Component7);

    /**
     * Construct Tooltip instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tooltip(el, options) {
      _classCallCheck(this, Tooltip);

      var _this26 = _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this, Tooltip, el, options));

      _this26.el.M_Tooltip = _this26;
      _this26.options = $.extend({}, Tooltip.defaults, options);

      _this26.isOpen = false;
      _this26.isHovered = false;
      _this26.isFocused = false;
      _this26._appendTooltipEl();
      _this26._setupEventHandlers();
      return _this26;
    }

    _createClass(Tooltip, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        $(this.tooltipEl).remove();
        this._removeEventHandlers();
        this.el.M_Tooltip = undefined;
      }
    }, {
      key: "_appendTooltipEl",
      value: function _appendTooltipEl() {
        var tooltipEl = document.createElement('div');
        tooltipEl.classList.add('material-tooltip');
        this.tooltipEl = tooltipEl;

        var tooltipContentEl = document.createElement('div');
        tooltipContentEl.classList.add('tooltip-content');
        tooltipContentEl.innerHTML = this.options.html;
        tooltipEl.appendChild(tooltipContentEl);
        document.body.appendChild(tooltipEl);
      }
    }, {
      key: "_updateTooltipContent",
      value: function _updateTooltipContent() {
        this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this._handleFocusBound = this._handleFocus.bind(this);
        this._handleBlurBound = this._handleBlur.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.addEventListener('focus', this._handleFocusBound, true);
        this.el.addEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.removeEventListener('focus', this._handleFocusBound, true);
        this.el.removeEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "open",
      value: function open(isManual) {
        if (this.isOpen) {
          return;
        }
        isManual = isManual === undefined ? true : undefined; // Default value true
        this.isOpen = true;
        // Update tooltip content with HTML attribute options
        this.options = $.extend({}, this.options, this._getAttributeOptions());
        this._updateTooltipContent();
        this._setEnterDelayTimeout(isManual);
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isHovered = false;
        this.isFocused = false;
        this.isOpen = false;
        this._setExitDelayTimeout();
      }

      /**
       * Create timeout which delays when the tooltip closes
       */

    }, {
      key: "_setExitDelayTimeout",
      value: function _setExitDelayTimeout() {
        var _this27 = this;

        clearTimeout(this._exitDelayTimeout);

        this._exitDelayTimeout = setTimeout(function () {
          if (_this27.isHovered || _this27.isFocused) {
            return;
          }

          _this27._animateOut();
        }, this.options.exitDelay);
      }

      /**
       * Create timeout which delays when the toast closes
       */

    }, {
      key: "_setEnterDelayTimeout",
      value: function _setEnterDelayTimeout(isManual) {
        var _this28 = this;

        clearTimeout(this._enterDelayTimeout);

        this._enterDelayTimeout = setTimeout(function () {
          if (!_this28.isHovered && !_this28.isFocused && !isManual) {
            return;
          }

          _this28._animateIn();
        }, this.options.enterDelay);
      }
    }, {
      key: "_positionTooltip",
      value: function _positionTooltip() {
        var origin = this.el,
            tooltip = this.tooltipEl,
            originHeight = origin.offsetHeight,
            originWidth = origin.offsetWidth,
            tooltipHeight = tooltip.offsetHeight,
            tooltipWidth = tooltip.offsetWidth,
            newCoordinates = void 0,
            margin = this.options.margin,
            targetTop = void 0,
            targetLeft = void 0;

        this.xMovement = 0, this.yMovement = 0;

        targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
        targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

        if (this.options.position === 'top') {
          targetTop += -tooltipHeight - margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = -this.options.transitionMovement;
        } else if (this.options.position === 'right') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += originWidth + margin;
          this.xMovement = this.options.transitionMovement;
        } else if (this.options.position === 'left') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += -tooltipWidth - margin;
          this.xMovement = -this.options.transitionMovement;
        } else {
          targetTop += originHeight + margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = this.options.transitionMovement;
        }

        newCoordinates = this._repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);
        $(tooltip).css({
          top: newCoordinates.y + 'px',
          left: newCoordinates.x + 'px'
        });
      }
    }, {
      key: "_repositionWithinScreen",
      value: function _repositionWithinScreen(x, y, width, height) {
        var scrollLeft = M.getDocumentScrollLeft();
        var scrollTop = M.getDocumentScrollTop();
        var newX = x - scrollLeft;
        var newY = y - scrollTop;

        var bounding = {
          left: newX,
          top: newY,
          width: width,
          height: height
        };

        var offset = this.options.margin + this.options.transitionMovement;
        var edges = M.checkWithinContainer(document.body, bounding, offset);

        if (edges.left) {
          newX = offset;
        } else if (edges.right) {
          newX -= newX + width - window.innerWidth;
        }

        if (edges.top) {
          newY = offset;
        } else if (edges.bottom) {
          newY -= newY + height - window.innerHeight;
        }

        return {
          x: newX + scrollLeft,
          y: newY + scrollTop
        };
      }
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._positionTooltip();
        this.tooltipEl.style.visibility = 'visible';
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 1,
          translateX: this.xMovement,
          translateY: this.yMovement,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 0,
          translateX: 0,
          translateY: 0,
          duration: this.options.outDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.isHovered = true;
        this.isFocused = false; // Allows close of tooltip when opened by focus.
        this.open(false);
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave() {
        this.isHovered = false;
        this.isFocused = false; // Allows close of tooltip when opened by focus.
        this.close();
      }
    }, {
      key: "_handleFocus",
      value: function _handleFocus() {
        if (M.tabPressed) {
          this.isFocused = true;
          this.open(false);
        }
      }
    }, {
      key: "_handleBlur",
      value: function _handleBlur() {
        this.isFocused = false;
        this.close();
      }
    }, {
      key: "_getAttributeOptions",
      value: function _getAttributeOptions() {
        var attributeOptions = {};
        var tooltipTextOption = this.el.getAttribute('data-tooltip');
        var positionOption = this.el.getAttribute('data-position');

        if (tooltipTextOption) {
          attributeOptions.html = tooltipTextOption;
        }

        if (positionOption) {
          attributeOptions.position = positionOption;
        }
        return attributeOptions;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tooltip.__proto__ || Object.getPrototypeOf(Tooltip), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tooltip;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tooltip;
  }(Component);

  M.Tooltip = Tooltip;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
  }
})(cash, M.anime);
; /*!
  * Waves v0.6.4
  * http://fian.my.id/Waves
  *
  * Copyright 2014 Alfiana E. Sibuea and other contributors
  * Released under the MIT license
  * https://github.com/fians/Waves/blob/master/LICENSE
  */

;(function (window) {
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
    var docElem,
        win,
        box = { top: 0, left: 0 },
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
        style += a + ':' + obj[a] + ';';
      }
    }

    return style;
  }

  var Effect = {

    // Effect delay
    duration: 750,

    show: function (e, element) {

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
      var pos = offset(el);
      var relativeY = e.pageY - pos.top;
      var relativeX = e.pageX - pos.left;
      var scale = 'scale(' + el.clientWidth / 100 * 10 + ')';

      // Support for touch devices
      if ('touches' in e) {
        relativeY = e.touches[0].pageY - pos.top;
        relativeX = e.touches[0].pageX - pos.left;
      }

      // Attach data to element
      ripple.setAttribute('data-hold', Date.now());
      ripple.setAttribute('data-scale', scale);
      ripple.setAttribute('data-x', relativeX);
      ripple.setAttribute('data-y', relativeY);

      // Set ripple position
      var rippleStyle = {
        'top': relativeY + 'px',
        'left': relativeX + 'px'
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
      rippleStyle.opacity = '1';

      rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['-moz-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['-o-transition-duration'] = Effect.duration + 'ms';
      rippleStyle['transition-duration'] = Effect.duration + 'ms';

      rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['-moz-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['-o-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
      rippleStyle['transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

      ripple.setAttribute('style', convertStyle(rippleStyle));
    },

    hide: function (e) {
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

      var relativeX = ripple.getAttribute('data-x');
      var relativeY = ripple.getAttribute('data-y');
      var scale = ripple.getAttribute('data-scale');

      // Get delay beetween mousedown and mouse leave
      var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
      var delay = 350 - diff;

      if (delay < 0) {
        delay = 0;
      }

      // Fade out ripple after delay
      setTimeout(function () {
        var style = {
          'top': relativeY + 'px',
          'left': relativeX + 'px',
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
          'transform': scale
        };

        ripple.setAttribute('style', convertStyle(style));

        setTimeout(function () {
          try {
            el.removeChild(ripple);
          } catch (e) {
            return false;
          }
        }, Effect.duration);
      }, delay);
    },

    // Little hack to make <input> can perform waves effect
    wrapInput: function (elements) {
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
    allowEvent: function (e) {
      var allow = true;

      if (e.type === 'touchstart') {
        TouchHandler.touches += 1; //push
      } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        setTimeout(function () {
          if (TouchHandler.touches > 0) {
            TouchHandler.touches -= 1; //pop after 500ms
          }
        }, 500);
      } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
        allow = false;
      }

      return allow;
    },
    touchup: function (e) {
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

  Waves.displayEffect = function (options) {
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
  Waves.attach = function (element) {
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

  document.addEventListener('DOMContentLoaded', function () {
    Waves.displayEffect();
  }, false);
})(window);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    html: '',
    displayLength: 4000,
    inDuration: 300,
    outDuration: 375,
    classes: '',
    completeCallback: null,
    activationPercent: 0.8
  };

  var Toast = function () {
    function Toast(options) {
      _classCallCheck(this, Toast);

      /**
       * Options for the toast
       * @member Toast#options
       */
      this.options = $.extend({}, Toast.defaults, options);
      this.message = this.options.html;

      /**
       * Describes current pan state toast
       * @type {Boolean}
       */
      this.panning = false;

      /**
       * Time remaining until toast is removed
       */
      this.timeRemaining = this.options.displayLength;

      if (Toast._toasts.length === 0) {
        Toast._createContainer();
      }

      // Create new toast
      Toast._toasts.push(this);
      var toastElement = this._createToast();
      toastElement.M_Toast = this;
      this.el = toastElement;
      this.$el = $(toastElement);
      this._animateIn();
      this._setTimer();
    }

    _createClass(Toast, [{
      key: "_createToast",


      /**
       * Create toast and append it to toast container
       */
      value: function _createToast() {
        var toast = document.createElement('div');
        toast.classList.add('toast');

        // Add custom classes onto toast
        if (!!this.options.classes.length) {
          $(toast).addClass(this.options.classes);
        }

        // Set content
        if (typeof HTMLElement === 'object' ? this.message instanceof HTMLElement : this.message && typeof this.message === 'object' && this.message !== null && this.message.nodeType === 1 && typeof this.message.nodeName === 'string') {
          toast.appendChild(this.message);

          // Check if it is jQuery object
        } else if (!!this.message.jquery) {
          $(toast).append(this.message[0]);

          // Insert as html;
        } else {
          toast.innerHTML = this.message;
        }

        // Append toasft
        Toast._container.appendChild(toast);
        return toast;
      }

      /**
       * Animate in toast
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        // Animate toast in
        anim({
          targets: this.el,
          top: 0,
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }

      /**
       * Create setInterval which automatically removes toast when timeRemaining >= 0
       * has been reached
       */

    }, {
      key: "_setTimer",
      value: function _setTimer() {
        var _this29 = this;

        if (this.timeRemaining !== Infinity) {
          this.counterInterval = setInterval(function () {
            // If toast is not being dragged, decrease its time remaining
            if (!_this29.panning) {
              _this29.timeRemaining -= 20;
            }

            // Animate toast out
            if (_this29.timeRemaining <= 0) {
              _this29.dismiss();
            }
          }, 20);
        }
      }

      /**
       * Dismiss toast with animation
       */

    }, {
      key: "dismiss",
      value: function dismiss() {
        var _this30 = this;

        window.clearInterval(this.counterInterval);
        var activationDistance = this.el.offsetWidth * this.options.activationPercent;

        if (this.wasSwiped) {
          this.el.style.transition = 'transform .05s, opacity .05s';
          this.el.style.transform = "translateX(" + activationDistance + "px)";
          this.el.style.opacity = 0;
        }

        anim({
          targets: this.el,
          opacity: 0,
          marginTop: -40,
          duration: this.options.outDuration,
          easing: 'easeOutExpo',
          complete: function () {
            // Call the optional callback
            if (typeof _this30.options.completeCallback === 'function') {
              _this30.options.completeCallback();
            }
            // Remove toast from DOM
            _this30.$el.remove();
            Toast._toasts.splice(Toast._toasts.indexOf(_this30), 1);
            if (Toast._toasts.length === 0) {
              Toast._removeContainer();
            }
          }
        });
      }
    }], [{
      key: "getInstance",


      /**
       * Get Instance
       */
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Toast;
      }

      /**
       * Append toast container and add event handlers
       */

    }, {
      key: "_createContainer",
      value: function _createContainer() {
        var container = document.createElement('div');
        container.setAttribute('id', 'toast-container');

        // Add event handler
        container.addEventListener('touchstart', Toast._onDragStart);
        container.addEventListener('touchmove', Toast._onDragMove);
        container.addEventListener('touchend', Toast._onDragEnd);

        container.addEventListener('mousedown', Toast._onDragStart);
        document.addEventListener('mousemove', Toast._onDragMove);
        document.addEventListener('mouseup', Toast._onDragEnd);

        document.body.appendChild(container);
        Toast._container = container;
      }

      /**
       * Remove toast container and event handlers
       */

    }, {
      key: "_removeContainer",
      value: function _removeContainer() {
        // Add event handler
        document.removeEventListener('mousemove', Toast._onDragMove);
        document.removeEventListener('mouseup', Toast._onDragEnd);

        $(Toast._container).remove();
        Toast._container = null;
      }

      /**
       * Begin drag handler
       * @param {Event} e
       */

    }, {
      key: "_onDragStart",
      value: function _onDragStart(e) {
        if (e.target && $(e.target).closest('.toast').length) {
          var $toast = $(e.target).closest('.toast');
          var toast = $toast[0].M_Toast;
          toast.panning = true;
          Toast._draggedToast = toast;
          toast.el.classList.add('panning');
          toast.el.style.transition = '';
          toast.startingXPos = Toast._xPos(e);
          toast.time = Date.now();
          toast.xPos = Toast._xPos(e);
        }
      }

      /**
       * Drag move handler
       * @param {Event} e
       */

    }, {
      key: "_onDragMove",
      value: function _onDragMove(e) {
        if (!!Toast._draggedToast) {
          e.preventDefault();
          var toast = Toast._draggedToast;
          toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
          toast.xPos = Toast._xPos(e);
          toast.velocityX = toast.deltaX / (Date.now() - toast.time);
          toast.time = Date.now();

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          toast.el.style.transform = "translateX(" + totalDeltaX + "px)";
          toast.el.style.opacity = 1 - Math.abs(totalDeltaX / activationDistance);
        }
      }

      /**
       * End drag handler
       */

    }, {
      key: "_onDragEnd",
      value: function _onDragEnd() {
        if (!!Toast._draggedToast) {
          var toast = Toast._draggedToast;
          toast.panning = false;
          toast.el.classList.remove('panning');

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          var shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance || toast.velocityX > 1;

          // Remove toast
          if (shouldBeDismissed) {
            toast.wasSwiped = true;
            toast.dismiss();

            // Animate toast back to original position
          } else {
            toast.el.style.transition = 'transform .2s, opacity .2s';
            toast.el.style.transform = '';
            toast.el.style.opacity = '';
          }
          Toast._draggedToast = null;
        }
      }

      /**
       * Get x position of mouse or touch event
       * @param {Event} e
       */

    }, {
      key: "_xPos",
      value: function _xPos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }
        // mouse event
        return e.clientX;
      }

      /**
       * Remove all toasts
       */

    }, {
      key: "dismissAll",
      value: function dismissAll() {
        for (var toastIndex in Toast._toasts) {
          Toast._toasts[toastIndex].dismiss();
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Toast;
  }();

  /**
   * @static
   * @memberof Toast
   * @type {Array.<Toast>}
   */


  Toast._toasts = [];

  /**
   * @static
   * @memberof Toast
   */
  Toast._container = null;

  /**
   * @static
   * @memberof Toast
   * @type {Toast}
   */
  Toast._draggedToast = null;

  M.Toast = Toast;
  M.toast = function (options) {
    return new Toast(options);
  };
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
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

  var Sidenav = function (_Component8) {
    _inherits(Sidenav, _Component8);

    /**
     * Construct Sidenav instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Sidenav(el, options) {
      _classCallCheck(this, Sidenav);

      var _this31 = _possibleConstructorReturn(this, (Sidenav.__proto__ || Object.getPrototypeOf(Sidenav)).call(this, Sidenav, el, options));

      _this31.el.M_Sidenav = _this31;
      _this31.id = _this31.$el.attr('id');

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
      _this31.options = $.extend({}, Sidenav.defaults, options);

      /**
       * Describes open/close state of Sidenav
       * @type {Boolean}
       */
      _this31.isOpen = false;

      /**
       * Describes if Sidenav is fixed
       * @type {Boolean}
       */
      _this31.isFixed = _this31.el.classList.contains('sidenav-fixed');

      /**
       * Describes if Sidenav is being draggeed
       * @type {Boolean}
       */
      _this31.isDragged = false;

      // Window size variables for window resize checks
      _this31.lastWindowWidth = window.innerWidth;
      _this31.lastWindowHeight = window.innerHeight;

      _this31._createOverlay();
      _this31._createDragTarget();
      _this31._setupEventHandlers();
      _this31._setupClasses();
      _this31._setupFixed();

      Sidenav._sidenavs.push(_this31);
      return _this31;
    }

    _createClass(Sidenav, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._enableBodyScrolling();
        this._overlay.parentNode.removeChild(this._overlay);
        this.dragTarget.parentNode.removeChild(this.dragTarget);
        this.el.M_Sidenav = undefined;
        this.el.style.transform = '';

        var index = Sidenav._sidenavs.indexOf(this);
        if (index >= 0) {
          Sidenav._sidenavs.splice(index, 1);
        }
      }
    }, {
      key: "_createOverlay",
      value: function _createOverlay() {
        var overlay = document.createElement('div');
        this._closeBound = this.close.bind(this);
        overlay.classList.add('sidenav-overlay');

        overlay.addEventListener('click', this._closeBound);

        document.body.appendChild(overlay);
        this._overlay = overlay;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
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
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
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

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.sidenav-trigger');
        if (e.target && $trigger.length) {
          var sidenavId = M.getIdFromTrigger($trigger[0]);

          var sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
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

    }, {
      key: "_startDrag",
      value: function _startDrag(e) {
        var clientX = e.targetTouches[0].clientX;
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

    }, {
      key: "_dragMoveUpdate",
      value: function _dragMoveUpdate(e) {
        var clientX = e.targetTouches[0].clientX;
        var currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
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

    }, {
      key: "_handleDragTargetDrag",
      value: function _handleDragTargetDrag(e) {
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
        var totalDeltaX = this._xPos - this._startingXpos;

        // dragDirection is the attempted user drag direction
        var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

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
        var transformX = totalDeltaX;
        var transformPrefix = 'translateX(-100%)';
        if (this.options.edge === 'right') {
          transformPrefix = 'translateX(100%)';
          transformX = -transformX;
        }

        // Calculate open/close percentage of sidenav, with open = 1 and close = 0
        this.percentOpen = Math.min(1, totalDeltaX / this._width);

        // Set transform and opacity styles
        this.el.style.transform = transformPrefix + " translateX(" + transformX + "px)";
        this._overlay.style.opacity = this.percentOpen;
      }

      /**
       * Handle Drag Target Release
       */

    }, {
      key: "_handleDragTargetRelease",
      value: function _handleDragTargetRelease() {
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

    }, {
      key: "_handleCloseDrag",
      value: function _handleCloseDrag(e) {
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
          var totalDeltaX = this._xPos - this._startingXpos;

          // dragDirection is the attempted user drag direction
          var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

          // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
          totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
          if (this.options.edge !== dragDirection) {
            totalDeltaX = 0;
          }

          var transformX = -totalDeltaX;
          if (this.options.edge === 'right') {
            transformX = -transformX;
          }

          // Calculate open/close percentage of sidenav, with open = 1 and close = 0
          this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

          // Set transform and opacity styles
          this.el.style.transform = "translateX(" + transformX + "px)";
          this._overlay.style.opacity = this.percentOpen;
        }
      }

      /**
       * Handle Close Release
       */

    }, {
      key: "_handleCloseRelease",
      value: function _handleCloseRelease() {
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

    }, {
      key: "_handleCloseTriggerClick",
      value: function _handleCloseTriggerClick(e) {
        var $closeTrigger = $(e.target).closest('.sidenav-close');
        if ($closeTrigger.length && !this._isCurrentlyFixed()) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
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
    }, {
      key: "_setupClasses",
      value: function _setupClasses() {
        if (this.options.edge === 'right') {
          this.el.classList.add('right-aligned');
          this.dragTarget.classList.add('right-aligned');
        }
      }
    }, {
      key: "_removeClasses",
      value: function _removeClasses() {
        this.el.classList.remove('right-aligned');
        this.dragTarget.classList.remove('right-aligned');
      }
    }, {
      key: "_setupFixed",
      value: function _setupFixed() {
        if (this._isCurrentlyFixed()) {
          this.open();
        }
      }
    }, {
      key: "_isCurrentlyFixed",
      value: function _isCurrentlyFixed() {
        return this.isFixed && window.innerWidth > 992;
      }
    }, {
      key: "_createDragTarget",
      value: function _createDragTarget() {
        var dragTarget = document.createElement('div');
        dragTarget.classList.add('drag-target');
        document.body.appendChild(dragTarget);
        this.dragTarget = dragTarget;
      }
    }, {
      key: "_preventBodyScrolling",
      value: function _preventBodyScrolling() {
        var body = document.body;
        body.style.overflow = 'hidden';
      }
    }, {
      key: "_enableBodyScrolling",
      value: function _enableBodyScrolling() {
        var body = document.body;
        body.style.overflow = '';
      }
    }, {
      key: "open",
      value: function open() {
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
    }, {
      key: "close",
      value: function close() {
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
          var transformX = this.options.edge === 'left' ? '-105%' : '105%';
          this.el.style.transform = "translateX(" + transformX + ")";

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
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._animateSidenavIn();
        this._animateOverlayIn();
      }
    }, {
      key: "_animateSidenavIn",
      value: function _animateSidenavIn() {
        var _this32 = this;

        var slideOutPercent = this.options.edge === 'left' ? -1 : 1;
        if (this.isDragged) {
          slideOutPercent = this.options.edge === 'left' ? slideOutPercent + this.percentOpen : slideOutPercent - this.percentOpen;
        }

        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: [slideOutPercent * 100 + "%", 0],
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            // Run onOpenEnd callback
            if (typeof _this32.options.onOpenEnd === 'function') {
              _this32.options.onOpenEnd.call(_this32, _this32.el);
            }
          }
        });
      }
    }, {
      key: "_animateOverlayIn",
      value: function _animateOverlayIn() {
        var start = 0;
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
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        this._animateSidenavOut();
        this._animateOverlayOut();
      }
    }, {
      key: "_animateSidenavOut",
      value: function _animateSidenavOut() {
        var _this33 = this;

        var endPercent = this.options.edge === 'left' ? -1 : 1;
        var slideOutPercent = 0;
        if (this.isDragged) {
          slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
        }

        anim.remove(this.el);
        anim({
          targets: this.el,
          translateX: [slideOutPercent * 100 + "%", endPercent * 105 + "%"],
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            // Run onOpenEnd callback
            if (typeof _this33.options.onCloseEnd === 'function') {
              _this33.options.onCloseEnd.call(_this33, _this33.el);
            }
          }
        });
      }
    }, {
      key: "_animateOverlayOut",
      value: function _animateOverlayOut() {
        var _this34 = this;

        anim.remove(this._overlay);
        anim({
          targets: this._overlay,
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            $(_this34._overlay).css('display', 'none');
          }
        });
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Sidenav.__proto__ || Object.getPrototypeOf(Sidenav), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Sidenav;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Sidenav;
  }(Component);

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
;(function ($, anim) {
  'use strict';

  var _defaults = {
    throttle: 100,
    scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
    activeClass: 'active',
    getActiveElement: function (id) {
      return 'a[href="#' + id + '"]';
    }
  };

  /**
   * @class
   *
   */

  var ScrollSpy = function (_Component9) {
    _inherits(ScrollSpy, _Component9);

    /**
     * Construct ScrollSpy instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function ScrollSpy(el, options) {
      _classCallCheck(this, ScrollSpy);

      var _this35 = _possibleConstructorReturn(this, (ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy)).call(this, ScrollSpy, el, options));

      _this35.el.M_ScrollSpy = _this35;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [throttle=100] - Throttle of scroll handler
       * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
       * @prop {String} [activeClass='active'] - Class applied to active elements
       * @prop {Function} [getActiveElement] - Used to find active element
       */
      _this35.options = $.extend({}, ScrollSpy.defaults, options);

      // setup
      ScrollSpy._elements.push(_this35);
      ScrollSpy._count++;
      ScrollSpy._increment++;
      _this35.tickId = -1;
      _this35.id = ScrollSpy._increment;
      _this35._setupEventHandlers();
      _this35._handleWindowScroll();
      return _this35;
    }

    _createClass(ScrollSpy, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
        ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
        ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
        ScrollSpy._count--;
        this._removeEventHandlers();
        $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
        this.el.M_ScrollSpy = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var throttledResize = M.throttle(this._handleWindowScroll, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        if (ScrollSpy._count === 1) {
          window.addEventListener('scroll', this._handleWindowScrollBound);
          window.addEventListener('resize', this._handleThrottledResizeBound);
          document.body.addEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (ScrollSpy._count === 0) {
          window.removeEventListener('scroll', this._handleWindowScrollBound);
          window.removeEventListener('resize', this._handleThrottledResizeBound);
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target);
        for (var i = ScrollSpy._elements.length - 1; i >= 0; i--) {
          var scrollspy = ScrollSpy._elements[i];
          if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
            e.preventDefault();
            var offset = scrollspy.$el.offset().top + 1;

            anim({
              targets: [document.documentElement, document.body],
              scrollTop: offset - scrollspy.options.scrollOffset,
              duration: 400,
              easing: 'easeOutCubic'
            });
            break;
          }
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        // unique tick id
        ScrollSpy._ticks++;

        // viewport rectangle
        var top = M.getDocumentScrollTop(),
            left = M.getDocumentScrollLeft(),
            right = left + window.innerWidth,
            bottom = top + window.innerHeight;

        // determine which elements are in view
        var intersections = ScrollSpy._findElements(top, right, bottom, left);
        for (var i = 0; i < intersections.length; i++) {
          var scrollspy = intersections[i];
          var lastTick = scrollspy.tickId;
          if (lastTick < 0) {
            // entered into view
            scrollspy._enter();
          }

          // update tick id
          scrollspy.tickId = ScrollSpy._ticks;
        }

        for (var _i = 0; _i < ScrollSpy._elementsInView.length; _i++) {
          var _scrollspy = ScrollSpy._elementsInView[_i];
          var _lastTick = _scrollspy.tickId;
          if (_lastTick >= 0 && _lastTick !== ScrollSpy._ticks) {
            // exited from view
            _scrollspy._exit();
            _scrollspy.tickId = -1;
          }
        }

        // remember elements in view for next tick
        ScrollSpy._elementsInView = intersections;
      }

      /**
       * Find elements that are within the boundary
       * @param {number} top
       * @param {number} right
       * @param {number} bottom
       * @param {number} left
       * @return {Array.<ScrollSpy>}   A collection of elements
       */

    }, {
      key: "_enter",
      value: function _enter() {
        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);
          if (ScrollSpy._visibleElements[0][0].M_ScrollSpy && this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id) {
            ScrollSpy._visibleElements.unshift(this.$el);
          } else {
            ScrollSpy._visibleElements.push(this.$el);
          }
        } else {
          ScrollSpy._visibleElements.push(this.$el);
        }

        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
      }
    }, {
      key: "_exit",
      value: function _exit() {
        var _this36 = this;

        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);

          ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (el) {
            return el.attr('id') != _this36.$el.attr('id');
          });
          if (ScrollSpy._visibleElements[0]) {
            // Check if empty
            $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
          }
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_ScrollSpy;
      }
    }, {
      key: "_findElements",
      value: function _findElements(top, right, bottom, left) {
        var hits = [];
        for (var i = 0; i < ScrollSpy._elements.length; i++) {
          var scrollspy = ScrollSpy._elements[i];
          var currTop = top + scrollspy.options.scrollOffset || 200;

          if (scrollspy.$el.height() > 0) {
            var elTop = scrollspy.$el.offset().top,
                elLeft = scrollspy.$el.offset().left,
                elRight = elLeft + scrollspy.$el.width(),
                elBottom = elTop + scrollspy.$el.height();

            var isIntersect = !(elLeft > right || elRight < left || elTop > bottom || elBottom < currTop);

            if (isIntersect) {
              hits.push(scrollspy);
            }
          }
        }
        return hits;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return ScrollSpy;
  }(Component);

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */


  ScrollSpy._elements = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elementsInView = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<cash>}
   */
  ScrollSpy._visibleElements = [];

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._count = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._increment = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._ticks = 0;

  M.ScrollSpy = ScrollSpy;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: {}, // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function (a, b, inputString) {
      // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    }
  };

  /**
   * @class
   *
   */

  var Autocomplete = function (_Component10) {
    _inherits(Autocomplete, _Component10);

    /**
     * Construct Autocomplete instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Autocomplete(el, options) {
      _classCallCheck(this, Autocomplete);

      var _this37 = _possibleConstructorReturn(this, (Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete)).call(this, Autocomplete, el, options));

      _this37.el.M_Autocomplete = _this37;

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
      _this37.options = $.extend({}, Autocomplete.defaults, options);

      // Setup
      _this37.isOpen = false;
      _this37.count = 0;
      _this37.activeIndex = -1;
      _this37.oldVal;
      _this37.$inputField = _this37.$el.closest('.input-field');
      _this37.$active = $();
      _this37._mousedown = false;
      _this37._setupDropdown();

      _this37._setupEventHandlers();
      return _this37;
    }

    _createClass(Autocomplete, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_Autocomplete = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputBlurBound = this._handleInputBlur.bind(this);
        this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(this);
        this._handleContainerMouseupAndTouchendBound = this._handleContainerMouseupAndTouchend.bind(this);

        this.el.addEventListener('blur', this._handleInputBlurBound);
        this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
        this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.el.addEventListener('click', this._handleInputClickBound);
        this.container.addEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);
        this.container.addEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

        if (typeof window.ontouchstart !== 'undefined') {
          this.container.addEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
          this.container.addEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('blur', this._handleInputBlurBound);
        this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
        this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.container.removeEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);
        this.container.removeEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

        if (typeof window.ontouchstart !== 'undefined') {
          this.container.removeEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
          this.container.removeEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        var _this38 = this;

        this.container = document.createElement('ul');
        this.container.id = "autocomplete-options-" + M.guid();
        $(this.container).addClass('autocomplete-content dropdown-content');
        this.$inputField.append(this.container);
        this.el.setAttribute('data-target', this.container.id);

        this.dropdown = M.Dropdown.init(this.el, {
          autoFocus: false,
          closeOnClick: false,
          coverTrigger: false,
          onItemClick: function (itemEl) {
            _this38.selectOption($(itemEl));
          }
        });

        // Sketchy removal of dropdown click handler
        this.el.removeEventListener('click', this.dropdown._handleClickBound);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeDropdown",
      value: function _removeDropdown() {
        this.container.parentNode.removeChild(this.container);
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        if (!this._mousedown) {
          this.close();
          this._resetAutocomplete();
        }
      }

      /**
       * Handle Input Keyup and Focus
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeyupAndFocus",
      value: function _handleInputKeyupAndFocus(e) {
        if (e.type === 'keyup') {
          Autocomplete._keydown = false;
        }

        this.count = 0;
        var val = this.el.value.toLowerCase();

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

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Autocomplete._keydown = true;

        // Arrow keys and enter key usage
        var keyCode = e.keyCode,
            liElement = void 0,
            numItems = $(this.container).children('li').length;

        // select element on Enter
        if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
          liElement = $(this.container).children('li').eq(this.activeIndex);
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
            this.$active = $(this.container).children('li').eq(this.activeIndex);
            this.$active.addClass('active');
          }
        }
      }

      /**
       * Handle Input Click
       * @param {Event} e
       */

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick(e) {
        this.open();
      }

      /**
       * Handle Container Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMousedownAndTouchstart",
      value: function _handleContainerMousedownAndTouchstart(e) {
        this._mousedown = true;
      }

      /**
       * Handle Container Mouseup and Touchend
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMouseupAndTouchend",
      value: function _handleContainerMouseupAndTouchend(e) {
        this._mousedown = false;
      }

      /**
       * Highlight partial match
       */

    }, {
      key: "_highlight",
      value: function _highlight(string, $el) {
        var img = $el.find('img');
        var matchStart = $el.text().toLowerCase().indexOf('' + string.toLowerCase() + ''),
            matchEnd = matchStart + string.length - 1,
            beforeMatch = $el.text().slice(0, matchStart),
            matchText = $el.text().slice(matchStart, matchEnd + 1),
            afterMatch = $el.text().slice(matchEnd + 1);
        $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
        if (img.length) {
          $el.prepend(img);
        }
      }

      /**
       * Reset current element position
       */

    }, {
      key: "_resetCurrentElement",
      value: function _resetCurrentElement() {
        this.activeIndex = -1;
        this.$active.removeClass('active');
      }

      /**
       * Reset autocomplete elements
       */

    }, {
      key: "_resetAutocomplete",
      value: function _resetAutocomplete() {
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

    }, {
      key: "selectOption",
      value: function selectOption(el) {
        var text = el.text().trim();
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

    }, {
      key: "_renderDropdown",
      value: function _renderDropdown(data, val) {
        var _this39 = this;

        this._resetAutocomplete();

        var matchingData = [];

        // Gather all matching data
        for (var key in data) {
          if (data.hasOwnProperty(key) && key.toLowerCase().indexOf(val) !== -1) {
            // Break if past limit
            if (this.count >= this.options.limit) {
              break;
            }

            var entry = {
              data: data[key],
              key: key
            };
            matchingData.push(entry);

            this.count++;
          }
        }

        // Sort
        if (this.options.sortFunction) {
          var sortFunctionBound = function (a, b) {
            return _this39.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), val.toLowerCase());
          };
          matchingData.sort(sortFunctionBound);
        }

        // Render
        for (var i = 0; i < matchingData.length; i++) {
          var _entry = matchingData[i];
          var $autocompleteOption = $('<li></li>');
          if (!!_entry.data) {
            $autocompleteOption.append("<img src=\"" + _entry.data + "\" class=\"right circle\"><span>" + _entry.key + "</span>");
          } else {
            $autocompleteOption.append('<span>' + _entry.key + '</span>');
          }

          $(this.container).append($autocompleteOption);
          this._highlight(val, $autocompleteOption);
        }
      }

      /**
       * Open Autocomplete Dropdown
       */

    }, {
      key: "open",
      value: function open() {
        var val = this.el.value.toLowerCase();

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

    }, {
      key: "close",
      value: function close() {
        this.dropdown.close();
      }

      /**
       * Update Data
       * @param {Object} data
       */

    }, {
      key: "updateData",
      value: function updateData(data) {
        var val = this.el.value.toLowerCase();
        this.options.data = data;

        if (this.isOpen) {
          this._renderDropdown(data, val);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Autocomplete;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Autocomplete;
  }(Component);

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
;(function ($) {
  // Function to update labels of text fields
  M.updateTextFields = function () {
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
    $(input_selector).each(function (element, index) {
      var $this = $(this);
      if (element.value.length > 0 || $(element).is(':focus') || element.autofocus || $this.attr('placeholder') !== null) {
        $this.siblings('label').addClass('active');
      } else if (element.validity) {
        $this.siblings('label').toggleClass('active', element.validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  M.validate_field = function (object) {
    var hasLength = object.attr('data-length') !== null;
    var lenAttr = parseInt(object.attr('data-length'));
    var len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }
    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if (object.is(':valid') && hasLength && len <= lenAttr || object.is(':valid') && !hasLength) {
          object.removeClass('invalid');
          object.addClass('valid');
        } else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };

  M.textareaAutoResize = function ($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error('No textarea element found');
      return;
    }

    // Textarea Auto Resize
    var hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    var fontFamily = $textarea.css('font-family');
    var fontSize = $textarea.css('font-size');
    var lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    var paddingTop = $textarea.css('padding-top');
    var paddingRight = $textarea.css('padding-right');
    var paddingBottom = $textarea.css('padding-bottom');
    var paddingLeft = $textarea.css('padding-left');

    if (fontSize) {
      hiddenDiv.css('font-size', fontSize);
    }
    if (fontFamily) {
      hiddenDiv.css('font-family', fontFamily);
    }
    if (lineHeight) {
      hiddenDiv.css('line-height', lineHeight);
    }
    if (paddingTop) {
      hiddenDiv.css('padding-top', paddingTop);
    }
    if (paddingRight) {
      hiddenDiv.css('padding-right', paddingRight);
    }
    if (paddingBottom) {
      hiddenDiv.css('padding-bottom', paddingBottom);
    }
    if (paddingLeft) {
      hiddenDiv.css('padding-left', paddingLeft);
    }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    var content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };

  $(document).ready(function () {
    // Text based inputs
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';

    // Add active if form auto complete
    $(document).on('change', input_selector, function () {
      if (this.value.length !== 0 || $(this).attr('placeholder') !== null) {
        $(this).siblings('label').addClass('active');
      }
      M.validate_field($(this));
    });

    // Add active if input element has been pre-populated on document ready
    $(document).ready(function () {
      M.updateTextFields();
    });

    // HTML DOM FORM RESET handling
    $(document).on('reset', function (e) {
      var formReset = $(e.target);
      if (formReset.is('form')) {
        formReset.find(input_selector).removeClass('valid').removeClass('invalid');
        formReset.find(input_selector).each(function (e) {
          if (this.value.length) {
            $(this).siblings('label').removeClass('active');
          }
        });

        // Reset select (after native reset)
        setTimeout(function () {
          formReset.find('select').each(function () {
            // check if initialized
            if (this.M_FormSelect) {
              $(this).trigger('change');
            }
          });
        }, 0);
      }
    });

    /**
     * Add active when element has focus
     * @param {Event} e
     */
    document.addEventListener('focus', function (e) {
      if ($(e.target).is(input_selector)) {
        $(e.target).siblings('label, .prefix').addClass('active');
      }
    }, true);

    /**
     * Remove active when element is blurred
     * @param {Event} e
     */
    document.addEventListener('blur', function (e) {
      var $inputElement = $(e.target);
      if ($inputElement.is(input_selector)) {
        var selector = '.prefix';

        if ($inputElement[0].value.length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === null) {
          selector += ', label';
        }
        $inputElement.siblings(selector).removeClass('active');
        M.validate_field($inputElement);
      }
    }, true);

    // Radio and Checkbox focus class
    var radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup', radio_checkbox, function (e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === M.keys.TAB) {
        $(this).addClass('tabbed');
        var $this = $(this);
        $this.one('blur', function (e) {
          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    var text_area_selector = '.materialize-textarea';
    $(text_area_selector).each(function () {
      var $textarea = $(this);
      /**
       * Resize textarea on document load after storing
       * the original height and the original length
       */
      $textarea.data('original-height', $textarea.height());
      $textarea.data('previous-length', this.value.length);
      M.textareaAutoResize($textarea);
    });

    $(document).on('keyup', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });
    $(document).on('keydown', text_area_selector, function () {
      M.textareaAutoResize($(this));
    });

    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function () {
      var file_field = $(this).closest('.file-field');
      var path_input = file_field.find('input.file-path');
      var files = $(this)[0].files;
      var file_names = [];
      for (var i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input[0].value = file_names.join(', ');
      path_input.trigger('change');
    });
  }); // End of $(document).ready
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };

  /**
   * @class
   *
   */

  var Slider = function (_Component11) {
    _inherits(Slider, _Component11);

    /**
     * Construct Slider instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Slider(el, options) {
      _classCallCheck(this, Slider);

      var _this40 = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, Slider, el, options));

      _this40.el.M_Slider = _this40;

      /**
       * Options for the modal
       * @member Slider#options
       * @prop {Boolean} [indicators=true] - Show indicators
       * @prop {Number} [height=400] - height of slider
       * @prop {Number} [duration=500] - Length in ms of slide transition
       * @prop {Number} [interval=6000] - Length in ms of slide interval
       */
      _this40.options = $.extend({}, Slider.defaults, options);

      // setup
      _this40.$slider = _this40.$el.find('.slides');
      _this40.$slides = _this40.$slider.children('li');
      _this40.activeIndex = _this40.$slides.filter(function (item) {
        return $(item).hasClass('active');
      }).first().index();
      if (_this40.activeIndex != -1) {
        _this40.$active = _this40.$slides.eq(_this40.activeIndex);
      }

      _this40._setSliderHeight();

      // Set initial positions of captions
      _this40.$slides.find('.caption').each(function (el) {
        _this40._animateCaptionIn(el, 0);
      });

      // Move img src into background-image
      _this40.$slides.find('img').each(function (el) {
        var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if ($(el).attr('src') !== placeholderBase64) {
          $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
          $(el).attr('src', placeholderBase64);
        }
      });

      _this40._setupIndicators();

      // Show active slide
      if (_this40.$active) {
        _this40.$active.css('display', 'block');
      } else {
        _this40.$slides.first().addClass('active');
        anim({
          targets: _this40.$slides.first()[0],
          opacity: 1,
          duration: _this40.options.duration,
          easing: 'easeOutQuad'
        });

        _this40.activeIndex = 0;
        _this40.$active = _this40.$slides.eq(_this40.activeIndex);

        // Update indicators
        if (_this40.options.indicators) {
          _this40.$indicators.eq(_this40.activeIndex).addClass('active');
        }
      }

      // Adjust height to current slide
      _this40.$active.find('img').each(function (el) {
        anim({
          targets: _this40.$active.find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: _this40.options.duration,
          easing: 'easeOutQuad'
        });
      });

      _this40._setupEventHandlers();

      // auto scroll
      _this40.start();
      return _this40;
    }

    _createClass(Slider, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.pause();
        this._removeIndicators();
        this._removeEventHandlers();
        this.el.M_Slider = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this41 = this;

        this._handleIntervalBound = this._handleInterval.bind(this);
        this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.addEventListener('click', _this41._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this42 = this;

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.removeEventListener('click', _this42._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Handle indicator click
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        var currIndex = $(e.target).index();
        this.set(currIndex);
      }

      /**
       * Handle Interval
       */

    }, {
      key: "_handleInterval",
      value: function _handleInterval() {
        var newActiveIndex = this.$slider.find('.active').index();
        if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0;
        // loop to start
        else newActiveIndex += 1;

        this.set(newActiveIndex);
      }

      /**
       * Animate in caption
       * @param {Element} caption
       * @param {Number} duration
       */

    }, {
      key: "_animateCaptionIn",
      value: function _animateCaptionIn(caption, duration) {
        var animOptions = {
          targets: caption,
          opacity: 0,
          duration: duration,
          easing: 'easeOutQuad'
        };

        if ($(caption).hasClass('center-align')) {
          animOptions.translateY = -100;
        } else if ($(caption).hasClass('right-align')) {
          animOptions.translateX = 100;
        } else if ($(caption).hasClass('left-align')) {
          animOptions.translateX = -100;
        }

        anim(animOptions);
      }

      /**
       * Set height of slider
       */

    }, {
      key: "_setSliderHeight",
      value: function _setSliderHeight() {
        // If fullscreen, do nothing
        if (!this.$el.hasClass('fullscreen')) {
          if (this.options.indicators) {
            // Add height if indicators are present
            this.$el.css('height', this.options.height + 40 + 'px');
          } else {
            this.$el.css('height', this.options.height + 'px');
          }
          this.$slider.css('height', this.options.height + 'px');
        }
      }

      /**
       * Setup indicators
       */

    }, {
      key: "_setupIndicators",
      value: function _setupIndicators() {
        var _this43 = this;

        if (this.options.indicators) {
          this.$indicators = $('<ul class="indicators"></ul>');
          this.$slides.each(function (el, index) {
            var $indicator = $('<li class="indicator-item"></li>');
            _this43.$indicators.append($indicator[0]);
          });
          this.$el.append(this.$indicators[0]);
          this.$indicators = this.$indicators.children('li.indicator-item');
        }
      }

      /**
       * Remove indicators
       */

    }, {
      key: "_removeIndicators",
      value: function _removeIndicators() {
        this.$el.find('ul.indicators').remove();
      }

      /**
       * Cycle to nth item
       * @param {Number} index
       */

    }, {
      key: "set",
      value: function set(index) {
        var _this44 = this;

        // Wrap around indices.
        if (index >= this.$slides.length) index = 0;else if (index < 0) index = this.$slides.length - 1;

        // Only do if index changes
        if (this.activeIndex != index) {
          this.$active = this.$slides.eq(this.activeIndex);
          var $caption = this.$active.find('.caption');
          this.$active.removeClass('active');

          anim({
            targets: this.$active[0],
            opacity: 0,
            duration: this.options.duration,
            easing: 'easeOutQuad',
            complete: function () {
              _this44.$slides.not('.active').each(function (el) {
                anim({
                  targets: el,
                  opacity: 0,
                  translateX: 0,
                  translateY: 0,
                  duration: 0,
                  easing: 'easeOutQuad'
                });
              });
            }
          });

          this._animateCaptionIn($caption[0], this.options.duration);

          // Update indicators
          if (this.options.indicators) {
            this.$indicators.eq(this.activeIndex).removeClass('active');
            this.$indicators.eq(index).addClass('active');
          }

          anim({
            targets: this.$slides.eq(index)[0],
            opacity: 1,
            duration: this.options.duration,
            easing: 'easeOutQuad'
          });

          anim({
            targets: this.$slides.eq(index).find('.caption')[0],
            opacity: 1,
            translateX: 0,
            translateY: 0,
            duration: this.options.duration,
            delay: this.options.duration,
            easing: 'easeOutQuad'
          });

          this.$slides.eq(index).addClass('active');
          this.activeIndex = index;

          // Reset interval
          this.start();
        }
      }

      /**
       * Pause slider interval
       */

    }, {
      key: "pause",
      value: function pause() {
        clearInterval(this.interval);
      }

      /**
       * Start slider interval
       */

    }, {
      key: "start",
      value: function start() {
        clearInterval(this.interval);
        this.interval = setInterval(this._handleIntervalBound, this.options.duration + this.options.interval);
      }

      /**
       * Move to next slide
       */

    }, {
      key: "next",
      value: function next() {
        var newIndex = this.activeIndex + 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }

      /**
       * Move to previous slide
       */

    }, {
      key: "prev",
      value: function prev() {
        var newIndex = this.activeIndex - 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Slider.__proto__ || Object.getPrototypeOf(Slider), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Slider;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Slider;
  }(Component);

  M.Slider = Slider;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
  }
})(cash, M.anime);
;(function ($, anim) {
  $(document).on('click', '.card', function (e) {
    if ($(this).children('.card-reveal').length) {
      var $card = $(e.target).closest('.card');
      if ($card.data('initialOverflow') === undefined) {
        $card.data('initialOverflow', $card.css('overflow') === undefined ? '' : $card.css('overflow'));
      }
      var $cardReveal = $(this).find('.card-reveal');
      if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
        // Make Reveal animate down and display none
        anim({
          targets: $cardReveal[0],
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: function (anim) {
            var el = anim.animatables[0].target;
            $(el).css({ display: 'none' });
            $card.css('overflow', $card.data('initialOverflow'));
          }
        });
      } else if ($(e.target).is($('.card .activator')) || $(e.target).is($('.card .activator i'))) {
        $card.css('overflow', 'hidden');
        $cardReveal.css({ display: 'block' });
        anim({
          targets: $cardReveal[0],
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  });
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
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

  var Chips = function (_Component12) {
    _inherits(Chips, _Component12);

    /**
     * Construct Chips instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Chips(el, options) {
      _classCallCheck(this, Chips);

      var _this45 = _possibleConstructorReturn(this, (Chips.__proto__ || Object.getPrototypeOf(Chips)).call(this, Chips, el, options));

      _this45.el.M_Chips = _this45;

      /**
       * Options for the modal
       * @member Chips#options
       * @prop {Array} data
       * @prop {String} placeholder
       * @prop {String} secondaryPlaceholder
       * @prop {Object} autocompleteOptions
       */
      _this45.options = $.extend({}, Chips.defaults, options);

      _this45.$el.addClass('chips input-field');
      _this45.chipsData = [];
      _this45.$chips = $();
      _this45._setupInput();
      _this45.hasAutocomplete = Object.keys(_this45.options.autocompleteOptions).length > 0;

      // Set input id
      if (!_this45.$input.attr('id')) {
        _this45.$input.attr('id', M.guid());
      }

      // Render initial chips
      if (_this45.options.data.length) {
        _this45.chipsData = _this45.options.data;
        _this45._renderChips(_this45.chipsData);
      }

      // Setup autocomplete if needed
      if (_this45.hasAutocomplete) {
        _this45._setupAutocomplete();
      }

      _this45._setPlaceholder();
      _this45._setupLabel();
      _this45._setupEventHandlers();
      return _this45;
    }

    _createClass(Chips, [{
      key: "getData",


      /**
       * Get Chips Data
       */
      value: function getData() {
        return this.chipsData;
      }

      /**
       * Teardown component
       */

    }, {
      key: "destroy",
      value: function destroy() {
        this._removeEventHandlers();
        this.$chips.remove();
        this.el.M_Chips = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
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

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
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

    }, {
      key: "_handleChipClick",
      value: function _handleChipClick(e) {
        var $chip = $(e.target).closest('.chip');
        var clickedClose = $(e.target).is('.close');
        if ($chip.length) {
          var index = $chip.index();
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

    }, {
      key: "_handleInputFocus",


      /**
       * Handle Input Focus
       */
      value: function _handleInputFocus() {
        this.$el.addClass('focus');
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        this.$el.removeClass('focus');
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
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
        } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
          e.preventDefault();
          this.selectChip(this.chipsData.length - 1);
        }
      }

      /**
       * Render Chip
       * @param {chip} chip
       * @return {Element}
       */

    }, {
      key: "_renderChip",
      value: function _renderChip(chip) {
        if (!chip.tag) {
          return;
        }

        var renderedChip = document.createElement('div');
        var closeIcon = document.createElement('i');
        renderedChip.classList.add('chip');
        renderedChip.textContent = chip.tag;
        renderedChip.setAttribute('tabindex', 0);
        $(closeIcon).addClass('material-icons close');
        closeIcon.textContent = 'close';

        // attach image if needed
        if (chip.image) {
          var img = document.createElement('img');
          img.setAttribute('src', chip.image);
          renderedChip.insertBefore(img, renderedChip.firstChild);
        }

        renderedChip.appendChild(closeIcon);
        return renderedChip;
      }

      /**
       * Render Chips
       */

    }, {
      key: "_renderChips",
      value: function _renderChips() {
        this.$chips.remove();
        for (var i = 0; i < this.chipsData.length; i++) {
          var chipEl = this._renderChip(this.chipsData[i]);
          this.$el.append(chipEl);
          this.$chips.add(chipEl);
        }

        // move input to end
        this.$el.append(this.$input[0]);
      }

      /**
       * Setup Autocomplete
       */

    }, {
      key: "_setupAutocomplete",
      value: function _setupAutocomplete() {
        var _this46 = this;

        this.options.autocompleteOptions.onAutocomplete = function (val) {
          _this46.addChip({
            tag: val
          });
          _this46.$input[0].value = '';
          _this46.$input[0].focus();
        };

        this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
      }

      /**
       * Setup Input
       */

    }, {
      key: "_setupInput",
      value: function _setupInput() {
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

    }, {
      key: "_setupLabel",
      value: function _setupLabel() {
        this.$label = this.$el.find('label');
        if (this.$label.length) {
          this.$label.setAttribute('for', this.$input.attr('id'));
        }
      }

      /**
       * Set placeholder
       */

    }, {
      key: "_setPlaceholder",
      value: function _setPlaceholder() {
        if (this.chipsData !== undefined && !this.chipsData.length && this.options.placeholder) {
          $(this.$input).prop('placeholder', this.options.placeholder);
        } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
          $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
        }
      }

      /**
       * Check if chip is valid
       * @param {chip} chip
       */

    }, {
      key: "_isValid",
      value: function _isValid(chip) {
        if (chip.hasOwnProperty('tag') && chip.tag !== '') {
          var exists = false;
          for (var i = 0; i < this.chipsData.length; i++) {
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

    }, {
      key: "addChip",
      value: function addChip(chip) {
        if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) {
          return;
        }

        var renderedChip = this._renderChip(chip);
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

    }, {
      key: "deleteChip",
      value: function deleteChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this.$chips.eq(chipIndex).remove();
        this.$chips = this.$chips.filter(function (el) {
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

    }, {
      key: "selectChip",
      value: function selectChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this._selectedChip = $chip;
        $chip[0].focus();

        // fire chipSelect callback
        if (typeof this.options.onChipSelect === 'function') {
          this.options.onChipSelect.call(this, this.$el, $chip[0]);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Chips.__proto__ || Object.getPrototypeOf(Chips), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Chips;
      }
    }, {
      key: "_handleChipsKeydown",
      value: function _handleChipsKeydown(e) {
        Chips._keydown = true;

        var $chips = $(e.target).closest('.chips');
        var chipsKeydown = e.target && $chips.length;

        // Don't handle keydown inputs on input and textarea
        if ($(e.target).is('input, textarea') || !chipsKeydown) {
          return;
        }

        var currChips = $chips[0].M_Chips;

        // backspace and delete
        if (e.keyCode === 8 || e.keyCode === 46) {
          e.preventDefault();

          var selectIndex = currChips.chipsData.length;
          if (currChips._selectedChip) {
            var index = currChips._selectedChip.index();
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
            var _selectIndex = currChips._selectedChip.index() - 1;
            if (_selectIndex < 0) {
              return;
            }
            currChips.selectChip(_selectIndex);
          }

          // right arrow key
        } else if (e.keyCode === 39) {
          if (currChips._selectedChip) {
            var _selectIndex2 = currChips._selectedChip.index() + 1;

            if (_selectIndex2 >= currChips.chipsData.length) {
              currChips.$input[0].focus();
            } else {
              currChips.selectChip(_selectIndex2);
            }
          }
        }
      }

      /**
       * Handle Chips Keyup
       * @param {Event} e
       */

    }, {
      key: "_handleChipsKeyup",
      value: function _handleChipsKeyup(e) {
        Chips._keydown = false;
      }

      /**
       * Handle Chips Blur
       * @param {Event} e
       */

    }, {
      key: "_handleChipsBlur",
      value: function _handleChipsBlur(e) {
        if (!Chips._keydown) {
          var $chips = $(e.target).closest('.chips');
          var currChips = $chips[0].M_Chips;

          currChips._selectedChip = null;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Chips;
  }(Component);

  /**
   * @static
   * @memberof Chips
   */


  Chips._keydown = false;

  M.Chips = Chips;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
  }

  $(document).ready(function () {
    // Handle removal of static chips.
    $(document.body).on('click', '.chip .close', function () {
      var $chips = $(this).closest('.chips');
      if ($chips.length && $chips[0].M_Chips) {
        return;
      }
      $(this).closest('.chip').remove();
    });
  });
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    top: 0,
    bottom: Infinity,
    offset: 0,
    onPositionChange: null
  };

  /**
   * @class
   *
   */

  var Pushpin = function (_Component13) {
    _inherits(Pushpin, _Component13);

    /**
     * Construct Pushpin instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Pushpin(el, options) {
      _classCallCheck(this, Pushpin);

      var _this47 = _possibleConstructorReturn(this, (Pushpin.__proto__ || Object.getPrototypeOf(Pushpin)).call(this, Pushpin, el, options));

      _this47.el.M_Pushpin = _this47;

      /**
       * Options for the modal
       * @member Pushpin#options
       */
      _this47.options = $.extend({}, Pushpin.defaults, options);

      _this47.originalOffset = _this47.el.offsetTop;
      Pushpin._pushpins.push(_this47);
      _this47._setupEventHandlers();
      _this47._updatePosition();
      return _this47;
    }

    _createClass(Pushpin, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.el.style.top = null;
        this._removePinClasses();
        this._removeEventHandlers();

        // Remove pushpin Inst
        var index = Pushpin._pushpins.indexOf(this);
        Pushpin._pushpins.splice(index, 1);
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        document.addEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        document.removeEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_updatePosition",
      value: function _updatePosition() {
        var scrolled = M.getDocumentScrollTop() + this.options.offset;

        if (this.options.top <= scrolled && this.options.bottom >= scrolled && !this.el.classList.contains('pinned')) {
          this._removePinClasses();
          this.el.style.top = this.options.offset + "px";
          this.el.classList.add('pinned');

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pinned');
          }
        }

        // Add pin-top (when scrolled position is above top)
        if (scrolled < this.options.top && !this.el.classList.contains('pin-top')) {
          this._removePinClasses();
          this.el.style.top = 0;
          this.el.classList.add('pin-top');

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pin-top');
          }
        }

        // Add pin-bottom (when scrolled position is below bottom)
        if (scrolled > this.options.bottom && !this.el.classList.contains('pin-bottom')) {
          this._removePinClasses();
          this.el.classList.add('pin-bottom');
          this.el.style.top = this.options.bottom - this.originalOffset + "px";

          // onPositionChange callback
          if (typeof this.options.onPositionChange === 'function') {
            this.options.onPositionChange.call(this, 'pin-bottom');
          }
        }
      }
    }, {
      key: "_removePinClasses",
      value: function _removePinClasses() {
        // IE 11 bug (can't remove multiple classes in one line)
        this.el.classList.remove('pin-top');
        this.el.classList.remove('pinned');
        this.el.classList.remove('pin-bottom');
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Pushpin.__proto__ || Object.getPrototypeOf(Pushpin), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Pushpin;
      }
    }, {
      key: "_updateElements",
      value: function _updateElements() {
        for (var elIndex in Pushpin._pushpins) {
          var pInstance = Pushpin._pushpins[elIndex];
          pInstance._updatePosition();
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Pushpin;
  }(Component);

  /**
   * @static
   * @memberof Pushpin
   */


  Pushpin._pushpins = [];

  M.Pushpin = Pushpin;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    direction: 'top',
    hoverEnabled: true,
    toolbarEnabled: false
  };

  $.fn.reverse = [].reverse;

  /**
   * @class
   *
   */

  var FloatingActionButton = function (_Component14) {
    _inherits(FloatingActionButton, _Component14);

    /**
     * Construct FloatingActionButton instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FloatingActionButton(el, options) {
      _classCallCheck(this, FloatingActionButton);

      var _this48 = _possibleConstructorReturn(this, (FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton)).call(this, FloatingActionButton, el, options));

      _this48.el.M_FloatingActionButton = _this48;

      /**
       * Options for the fab
       * @member FloatingActionButton#options
       * @prop {Boolean} [direction] - Direction fab menu opens
       * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
       * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
       */
      _this48.options = $.extend({}, FloatingActionButton.defaults, options);

      _this48.isOpen = false;
      _this48.$anchor = _this48.$el.children('a').first();
      _this48.$menu = _this48.$el.children('ul').first();
      _this48.$floatingBtns = _this48.$el.find('ul .btn-floating');
      _this48.$floatingBtnsReverse = _this48.$el.find('ul .btn-floating').reverse();
      _this48.offsetY = 0;
      _this48.offsetX = 0;

      _this48.$el.addClass("direction-" + _this48.options.direction);
      if (_this48.options.direction === 'top') {
        _this48.offsetY = 40;
      } else if (_this48.options.direction === 'right') {
        _this48.offsetX = -40;
      } else if (_this48.options.direction === 'bottom') {
        _this48.offsetY = -40;
      } else {
        _this48.offsetX = 40;
      }
      _this48._setupEventHandlers();
      return _this48;
    }

    _createClass(FloatingActionButton, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_FloatingActionButton = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleFABClickBound = this._handleFABClick.bind(this);
        this._handleOpenBound = this.open.bind(this);
        this._handleCloseBound = this.close.bind(this);

        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.addEventListener('mouseenter', this._handleOpenBound);
          this.el.addEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.addEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.removeEventListener('mouseenter', this._handleOpenBound);
          this.el.removeEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.removeEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Handle FAB Click
       */

    }, {
      key: "_handleFABClick",
      value: function _handleFABClick() {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Document Click
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest(this.$menu).length) {
          this.close();
        }
      }

      /**
       * Open FAB
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          this._animateInToolbar();
        } else {
          this._animateInFAB();
        }
        this.isOpen = true;
      }

      /**
       * Close FAB
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          window.removeEventListener('scroll', this._handleCloseBound, true);
          document.body.removeEventListener('click', this._handleDocumentClickBound, true);
          this._animateOutToolbar();
        } else {
          this._animateOutFAB();
        }
        this.isOpen = false;
      }

      /**
       * Classic FAB Menu open
       */

    }, {
      key: "_animateInFAB",
      value: function _animateInFAB() {
        var _this49 = this;

        this.$el.addClass('active');

        var time = 0;
        this.$floatingBtnsReverse.each(function (el) {
          anim({
            targets: el,
            opacity: 1,
            scale: [0.4, 1],
            translateY: [_this49.offsetY, 0],
            translateX: [_this49.offsetX, 0],
            duration: 275,
            delay: time,
            easing: 'easeInOutQuad'
          });
          time += 40;
        });
      }

      /**
       * Classic FAB Menu close
       */

    }, {
      key: "_animateOutFAB",
      value: function _animateOutFAB() {
        var _this50 = this;

        this.$floatingBtnsReverse.each(function (el) {
          anim.remove(el);
          anim({
            targets: el,
            opacity: 0,
            scale: 0.4,
            translateY: _this50.offsetY,
            translateX: _this50.offsetX,
            duration: 175,
            easing: 'easeOutQuad',
            complete: function () {
              _this50.$el.removeClass('active');
            }
          });
        });
      }

      /**
       * Toolbar transition Menu open
       */

    }, {
      key: "_animateInToolbar",
      value: function _animateInToolbar() {
        var _this51 = this;

        var scaleFactor = void 0;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var btnRect = this.el.getBoundingClientRect();
        var backdrop = $('<div class="fab-backdrop"></div>');
        var fabColor = this.$anchor.css('background-color');
        this.$anchor.append(backdrop);

        this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
        this.offsetY = windowHeight - btnRect.bottom;
        scaleFactor = windowWidth / backdrop[0].clientWidth;
        this.btnBottom = btnRect.bottom;
        this.btnLeft = btnRect.left;
        this.btnWidth = btnRect.width;

        // Set initial state
        this.$el.addClass('active');
        this.$el.css({
          'text-align': 'center',
          width: '100%',
          bottom: 0,
          left: 0,
          transform: 'translateX(' + this.offsetX + 'px)',
          transition: 'none'
        });
        this.$anchor.css({
          transform: 'translateY(' + -this.offsetY + 'px)',
          transition: 'none'
        });
        backdrop.css({
          'background-color': fabColor
        });

        setTimeout(function () {
          _this51.$el.css({
            transform: '',
            transition: 'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
          });
          _this51.$anchor.css({
            overflow: 'visible',
            transform: '',
            transition: 'transform .2s'
          });

          setTimeout(function () {
            _this51.$el.css({
              overflow: 'hidden',
              'background-color': fabColor
            });
            backdrop.css({
              transform: 'scale(' + scaleFactor + ')',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
            _this51.$menu.children('li').children('a').css({
              opacity: 1
            });

            // Scroll to close.
            _this51._handleDocumentClickBound = _this51._handleDocumentClick.bind(_this51);
            window.addEventListener('scroll', _this51._handleCloseBound, true);
            document.body.addEventListener('click', _this51._handleDocumentClickBound, true);
          }, 100);
        }, 0);
      }

      /**
       * Toolbar transition Menu close
       */

    }, {
      key: "_animateOutToolbar",
      value: function _animateOutToolbar() {
        var _this52 = this;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var backdrop = this.$el.find('.fab-backdrop');
        var fabColor = this.$anchor.css('background-color');

        this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
        this.offsetY = windowHeight - this.btnBottom;

        // Hide backdrop
        this.$el.removeClass('active');
        this.$el.css({
          'background-color': 'transparent',
          transition: 'none'
        });
        this.$anchor.css({
          transition: 'none'
        });
        backdrop.css({
          transform: 'scale(0)',
          'background-color': fabColor
        });
        this.$menu.children('li').children('a').css({
          opacity: ''
        });

        setTimeout(function () {
          backdrop.remove();

          // Set initial state.
          _this52.$el.css({
            'text-align': '',
            width: '',
            bottom: '',
            left: '',
            overflow: '',
            'background-color': '',
            transform: 'translate3d(' + -_this52.offsetX + 'px,0,0)'
          });
          _this52.$anchor.css({
            overflow: '',
            transform: 'translate3d(0,' + _this52.offsetY + 'px,0)'
          });

          setTimeout(function () {
            _this52.$el.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s'
            });
            _this52.$anchor.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
          }, 20);
        }, 200);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FloatingActionButton;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FloatingActionButton;
  }(Component);

  M.FloatingActionButton = FloatingActionButton;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
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
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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

  var Datepicker = function (_Component15) {
    _inherits(Datepicker, _Component15);

    /**
     * Construct Datepicker instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Datepicker(el, options) {
      _classCallCheck(this, Datepicker);

      var _this53 = _possibleConstructorReturn(this, (Datepicker.__proto__ || Object.getPrototypeOf(Datepicker)).call(this, Datepicker, el, options));

      _this53.el.M_Datepicker = _this53;

      _this53.options = $.extend({}, Datepicker.defaults, options);

      // make sure i18n defaults are not lost when only few i18n option properties are passed
      if (!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
        _this53.options.i18n = $.extend({}, Datepicker.defaults.i18n, options.i18n);
      }

      // Remove time component from minDate and maxDate options
      if (_this53.options.minDate) _this53.options.minDate.setHours(0, 0, 0, 0);
      if (_this53.options.maxDate) _this53.options.maxDate.setHours(0, 0, 0, 0);

      _this53.id = M.guid();

      _this53._setupVariables();
      _this53._insertHTMLIntoDOM();
      _this53._setupModal();

      _this53._setupEventHandlers();

      if (!_this53.options.defaultDate) {
        _this53.options.defaultDate = new Date(Date.parse(_this53.el.value));
      }

      var defDate = _this53.options.defaultDate;
      if (Datepicker._isDate(defDate)) {
        if (_this53.options.setDefaultDate) {
          _this53.setDate(defDate, true);
          _this53.setInputValue();
        } else {
          _this53.gotoDate(defDate);
        }
      } else {
        _this53.gotoDate(new Date());
      }

      /**
       * Describes open/close state of datepicker
       * @type {Boolean}
       */
      _this53.isOpen = false;
      return _this53;
    }

    _createClass(Datepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.destroySelects();
        this.el.M_Datepicker = undefined;
      }
    }, {
      key: "destroySelects",
      value: function destroySelects() {
        var oldYearSelect = this.calendarEl.querySelector('.orig-select-year');
        if (oldYearSelect) {
          M.FormSelect.getInstance(oldYearSelect).destroy();
        }
        var oldMonthSelect = this.calendarEl.querySelector('.orig-select-month');
        if (oldMonthSelect) {
          M.FormSelect.getInstance(oldMonthSelect).destroy();
        }
      }
    }, {
      key: "_insertHTMLIntoDOM",
      value: function _insertHTMLIntoDOM() {
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
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        var _this54 = this;

        this.modalEl.id = 'modal-' + this.id;
        this.modal = M.Modal.init(this.modalEl, {
          onCloseEnd: function () {
            _this54.isOpen = false;
          }
        });
      }
    }, {
      key: "toString",
      value: function toString(format) {
        var _this55 = this;

        format = format || this.options.format;
        if (!Datepicker._isDate(this.date)) {
          return '';
        }

        var formatArray = format.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g);
        var formattedDate = formatArray.map(function (label) {
          if (_this55.formats[label]) {
            return _this55.formats[label]();
          }

          return label;
        }).join('');
        return formattedDate;
      }
    }, {
      key: "setDate",
      value: function setDate(date, preventOnSelect) {
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

        var min = this.options.minDate,
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
    }, {
      key: "setInputValue",
      value: function setInputValue() {
        this.el.value = this.toString();
        this.$el.trigger('change', { firedBy: this });
      }
    }, {
      key: "_renderDateDisplay",
      value: function _renderDateDisplay() {
        var displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
        var i18n = this.options.i18n;
        var day = i18n.weekdaysShort[displayDate.getDay()];
        var month = i18n.monthsShort[displayDate.getMonth()];
        var date = displayDate.getDate();
        this.yearTextEl.innerHTML = displayDate.getFullYear();
        this.dateTextEl.innerHTML = day + ", " + month + " " + date;
      }

      /**
       * change view to a specific date
       */

    }, {
      key: "gotoDate",
      value: function gotoDate(date) {
        var newCalendar = true;

        if (!Datepicker._isDate(date)) {
          return;
        }

        if (this.calendars) {
          var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
              lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1),
              visibleDate = date.getTime();
          // get the end of the month
          lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
          lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
          newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
        }

        if (newCalendar) {
          this.calendars = [{
            month: date.getMonth(),
            year: date.getFullYear()
          }];
        }

        this.adjustCalendars();
      }
    }, {
      key: "adjustCalendars",
      value: function adjustCalendars() {
        this.calendars[0] = this.adjustCalendar(this.calendars[0]);
        this.draw();
      }
    }, {
      key: "adjustCalendar",
      value: function adjustCalendar(calendar) {
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
    }, {
      key: "nextMonth",
      value: function nextMonth() {
        this.calendars[0].month++;
        this.adjustCalendars();
      }
    }, {
      key: "prevMonth",
      value: function prevMonth() {
        this.calendars[0].month--;
        this.adjustCalendars();
      }
    }, {
      key: "render",
      value: function render(year, month, randId) {
        var opts = this.options,
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
        var previousMonth = month === 0 ? 11 : month - 1,
            nextMonth = month === 11 ? 0 : month + 1,
            yearOfPreviousMonth = month === 0 ? year - 1 : year,
            yearOfNextMonth = month === 11 ? year + 1 : year,
            daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
        var cells = days + before,
            after = cells;
        while (after > 7) {
          after -= 7;
        }
        cells += 7 - after;
        var isWeekSelected = false;
        for (var i = 0, r = 0; i < cells; i++) {
          var day = new Date(year, month, 1 + (i - before)),
              isSelected = Datepicker._isDate(this.date) ? Datepicker._compareDates(day, this.date) : false,
              isToday = Datepicker._compareDates(day, now),
              hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
              isEmpty = i < before || i >= days + before,
              dayNumber = 1 + (i - before),
              monthNumber = month,
              yearNumber = year,
              isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
              isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
              isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
              isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && Datepicker._isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);

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

          var dayConfig = {
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
    }, {
      key: "renderDay",
      value: function renderDay(opts) {
        var arr = [];
        var ariaSelected = 'false';
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
        return "<td data-day=\"" + opts.day + "\" class=\"" + arr.join(' ') + "\" aria-selected=\"" + ariaSelected + "\">" + ("<button class=\"datepicker-day-button\" type=\"button\" data-year=\"" + opts.year + "\" data-month=\"" + opts.month + "\" data-day=\"" + opts.day + "\">" + opts.day + "</button>") + '</td>';
      }
    }, {
      key: "renderRow",
      value: function renderRow(days, isRTL, isRowSelected) {
        return '<tr class="datepicker-row' + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
      }
    }, {
      key: "renderTable",
      value: function renderTable(opts, data, randId) {
        return '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' + randId + '">' + this.renderHead(opts) + this.renderBody(data) + '</table></div>';
      }
    }, {
      key: "renderHead",
      value: function renderHead(opts) {
        var i = void 0,
            arr = [];
        for (i = 0; i < 7; i++) {
          arr.push("<th scope=\"col\"><abbr title=\"" + this.renderDayName(opts, i) + "\">" + this.renderDayName(opts, i, true) + "</abbr></th>");
        }
        return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
      }
    }, {
      key: "renderBody",
      value: function renderBody(rows) {
        return '<tbody>' + rows.join('') + '</tbody>';
      }
    }, {
      key: "renderTitle",
      value: function renderTitle(instance, c, year, month, refYear, randId) {
        var i = void 0,
            j = void 0,
            arr = void 0,
            opts = this.options,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div id="' + randId + '" class="datepicker-controls" role="heading" aria-live="assertive">',
            monthHtml = void 0,
            yearHtml = void 0,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
          arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
        }

        monthHtml = '<select class="datepicker-select orig-select-month" tabindex="-1">' + arr.join('') + '</select>';

        if ($.isArray(opts.yearRange)) {
          i = opts.yearRange[0];
          j = opts.yearRange[1] + 1;
        } else {
          i = year - opts.yearRange;
          j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
          if (i >= opts.minYear) {
            arr.push("<option value=\"" + i + "\" " + (i === year ? 'selected="selected"' : '') + ">" + i + "</option>");
          }
        }

        yearHtml = "<select class=\"datepicker-select orig-select-year\" tabindex=\"-1\">" + arr.join('') + "</select>";

        var leftArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
        html += "<button class=\"month-prev" + (prev ? '' : ' is-disabled') + "\" type=\"button\">" + leftArrow + "</button>";

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

        var rightArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
        html += "<button class=\"month-next" + (next ? '' : ' is-disabled') + "\" type=\"button\">" + rightArrow + "</button>";

        return html += '</div>';
      }

      /**
       * refresh the HTML
       */

    }, {
      key: "draw",
      value: function draw(force) {
        if (!this.isOpen && !force) {
          return;
        }
        var opts = this.options,
            minYear = opts.minYear,
            maxYear = opts.maxYear,
            minMonth = opts.minMonth,
            maxMonth = opts.maxMonth,
            html = '',
            randId = void 0;

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

        randId = 'datepicker-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

        for (var c = 0; c < 1; c++) {
          this._renderDateDisplay();
          html += this.renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId);
        }

        this.destroySelects();

        this.calendarEl.innerHTML = html;

        // Init Materialize Select
        var yearSelect = this.calendarEl.querySelector('.orig-select-year');
        var monthSelect = this.calendarEl.querySelector('.orig-select-month');
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

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
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
    }, {
      key: "_setupVariables",
      value: function _setupVariables() {
        var _this56 = this;

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
          d: function () {
            return _this56.date.getDate();
          },
          dd: function () {
            var d = _this56.date.getDate();
            return (d < 10 ? '0' : '') + d;
          },
          ddd: function () {
            return _this56.options.i18n.weekdaysShort[_this56.date.getDay()];
          },
          dddd: function () {
            return _this56.options.i18n.weekdays[_this56.date.getDay()];
          },
          m: function () {
            return _this56.date.getMonth() + 1;
          },
          mm: function () {
            var m = _this56.date.getMonth() + 1;
            return (m < 10 ? '0' : '') + m;
          },
          mmm: function () {
            return _this56.options.i18n.monthsShort[_this56.date.getMonth()];
          },
          mmmm: function () {
            return _this56.options.i18n.months[_this56.date.getMonth()];
          },
          yy: function () {
            return ('' + _this56.date.getFullYear()).slice(2);
          },
          yyyy: function () {
            return _this56.date.getFullYear();
          }
        };
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.el.removeEventListener('change', this._handleInputChangeBound);
        this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleCalendarClick",
      value: function _handleCalendarClick(e) {
        if (!this.isOpen) {
          return;
        }

        var $target = $(e.target);
        if (!$target.hasClass('is-disabled')) {
          if ($target.hasClass('datepicker-day-button') && !$target.hasClass('is-empty') && !$target.parent().hasClass('is-disabled')) {
            this.setDate(new Date(e.target.getAttribute('data-year'), e.target.getAttribute('data-month'), e.target.getAttribute('data-day')));
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
    }, {
      key: "_handleClearClick",
      value: function _handleClearClick() {
        this.date = null;
        this.setInputValue();
        this.close();
      }
    }, {
      key: "_handleMonthChange",
      value: function _handleMonthChange(e) {
        this.gotoMonth(e.target.value);
      }
    }, {
      key: "_handleYearChange",
      value: function _handleYearChange(e) {
        this.gotoYear(e.target.value);
      }

      /**
       * change view to a specific month (zero-index, e.g. 0: January)
       */

    }, {
      key: "gotoMonth",
      value: function gotoMonth(month) {
        if (!isNaN(month)) {
          this.calendars[0].month = parseInt(month, 10);
          this.adjustCalendars();
        }
      }

      /**
       * change view to a specific full year (e.g. "2012")
       */

    }, {
      key: "gotoYear",
      value: function gotoYear(year) {
        if (!isNaN(year)) {
          this.calendars[0].year = parseInt(year, 10);
          this.adjustCalendars();
        }
      }
    }, {
      key: "_handleInputChange",
      value: function _handleInputChange(e) {
        var date = void 0;

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
    }, {
      key: "renderDayName",
      value: function renderDayName(opts, day, abbr) {
        day += opts.firstDay;
        while (day >= 7) {
          day -= 7;
        }
        return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
      }

      /**
       * Set input value to the selected date and close Datepicker
       */

    }, {
      key: "_finishSelection",
      value: function _finishSelection() {
        this.setInputValue();
        this.close();
      }

      /**
       * Open Datepicker
       */

    }, {
      key: "open",
      value: function open() {
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

    }, {
      key: "close",
      value: function close() {
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
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Datepicker.__proto__ || Object.getPrototypeOf(Datepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_isDate",
      value: function _isDate(obj) {
        return (/Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
        );
      }
    }, {
      key: "_isWeekend",
      value: function _isWeekend(date) {
        var day = date.getDay();
        return day === 0 || day === 6;
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }
    }, {
      key: "_getDaysInMonth",
      value: function _getDaysInMonth(year, month) {
        return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
      }
    }, {
      key: "_isLeapYear",
      value: function _isLeapYear(year) {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
    }, {
      key: "_compareDates",
      value: function _compareDates(a, b) {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Datepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Datepicker;
  }(Component);

  Datepicker._template = ['<div class= "modal datepicker-modal">', '<div class="modal-content datepicker-container">', '<div class="datepicker-date-display">', '<span class="year-text"></span>', '<span class="date-text"></span>', '</div>', '<div class="datepicker-calendar-container">', '<div class="datepicker-calendar"></div>', '<div class="datepicker-footer">', '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>', '<div class="confirmation-btns">', '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>', '<button class="btn-flat datepicker-done waves-effect" type="button"></button>', '</div>', '</div>', '</div>', '</div>', '</div>'].join('');

  M.Datepicker = Datepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
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

  var Timepicker = function (_Component16) {
    _inherits(Timepicker, _Component16);

    function Timepicker(el, options) {
      _classCallCheck(this, Timepicker);

      var _this57 = _possibleConstructorReturn(this, (Timepicker.__proto__ || Object.getPrototypeOf(Timepicker)).call(this, Timepicker, el, options));

      _this57.el.M_Timepicker = _this57;

      _this57.options = $.extend({}, Timepicker.defaults, options);

      _this57.id = M.guid();
      _this57._insertHTMLIntoDOM();
      _this57._setupModal();
      _this57._setupVariables();
      _this57._setupEventHandlers();

      _this57._clockSetup();
      _this57._pickerSetup();
      return _this57;
    }

    _createClass(Timepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.el.M_Timepicker = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
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
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleClockClickStart",
      value: function _handleClockClickStart(e) {
        e.preventDefault();
        var clockPlateBR = this.plate.getBoundingClientRect();
        var offset = { x: clockPlateBR.left, y: clockPlateBR.top };

        this.x0 = offset.x + this.options.dialRadius;
        this.y0 = offset.y + this.options.dialRadius;
        this.moved = false;
        var clickPos = Timepicker._Pos(e);
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
    }, {
      key: "_handleDocumentClickMove",
      value: function _handleDocumentClickMove(e) {
        e.preventDefault();
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        this.moved = true;
        this.setHand(x, y, false, true);
      }
    }, {
      key: "_handleDocumentClickEnd",
      value: function _handleDocumentClickEnd(e) {
        var _this58 = this;

        e.preventDefault();
        document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
        document.removeEventListener('touchend', this._handleDocumentClickEndBound);
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        if (this.moved && x === this.dx && y === this.dy) {
          this.setHand(x, y);
        }

        if (this.currentView === 'hours') {
          this.showView('minutes', this.options.duration / 2);
        } else if (this.options.autoClose) {
          $(this.minutesView).addClass('timepicker-dial-out');
          setTimeout(function () {
            _this58.done();
          }, this.options.duration / 2);
        }

        if (typeof this.options.onSelect === 'function') {
          this.options.onSelect.call(this, this.hours, this.minutes);
        }

        // Unbind mousemove event
        document.removeEventListener('mousemove', this._handleDocumentClickMoveBound);
        document.removeEventListener('touchmove', this._handleDocumentClickMoveBound);
      }
    }, {
      key: "_insertHTMLIntoDOM",
      value: function _insertHTMLIntoDOM() {
        this.$modalEl = $(Timepicker._template);
        this.modalEl = this.$modalEl[0];
        this.modalEl.id = 'modal-' + this.id;

        // Append popover to input by default
        var containerEl = document.querySelector(this.options.container);
        if (this.options.container && !!containerEl) {
          this.$modalEl.appendTo(containerEl);
        } else {
          this.$modalEl.insertBefore(this.el);
        }
      }
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        var _this59 = this;

        this.modal = M.Modal.init(this.modalEl, {
          onOpenStart: this.options.onOpenStart,
          onOpenEnd: this.options.onOpenEnd,
          onCloseStart: this.options.onCloseStart,
          onCloseEnd: function () {
            if (typeof _this59.options.onCloseEnd === 'function') {
              _this59.options.onCloseEnd.call(_this59);
            }
            _this59.isOpen = false;
          }
        });
      }
    }, {
      key: "_setupVariables",
      value: function _setupVariables() {
        this.currentView = 'hours';
        this.vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

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
    }, {
      key: "_pickerSetup",
      value: function _pickerSetup() {
        var $clearBtn = $("<button class=\"btn-flat timepicker-clear waves-effect\" style=\"visibility: hidden;\" type=\"button\" tabindex=\"" + (this.options.twelveHour ? '3' : '1') + "\">" + this.options.i18n.clear + "</button>").appendTo(this.footer).on('click', this.clear.bind(this));
        if (this.options.showClearBtn) {
          $clearBtn.css({ visibility: '' });
        }

        var confirmationBtnsContainer = $('<div class="confirmation-btns"></div>');
        $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.cancel + '</button>').appendTo(confirmationBtnsContainer).on('click', this.close.bind(this));
        $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.done + '</button>').appendTo(confirmationBtnsContainer).on('click', this.done.bind(this));
        confirmationBtnsContainer.appendTo(this.footer);
      }
    }, {
      key: "_clockSetup",
      value: function _clockSetup() {
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
    }, {
      key: "_buildSVGClock",
      value: function _buildSVGClock() {
        // Draw clock hands and others
        var dialRadius = this.options.dialRadius;
        var tickRadius = this.options.tickRadius;
        var diameter = dialRadius * 2;

        var svg = Timepicker._createSVGEl('svg');
        svg.setAttribute('class', 'timepicker-svg');
        svg.setAttribute('width', diameter);
        svg.setAttribute('height', diameter);
        var g = Timepicker._createSVGEl('g');
        g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
        var bearing = Timepicker._createSVGEl('circle');
        bearing.setAttribute('class', 'timepicker-canvas-bearing');
        bearing.setAttribute('cx', 0);
        bearing.setAttribute('cy', 0);
        bearing.setAttribute('r', 4);
        var hand = Timepicker._createSVGEl('line');
        hand.setAttribute('x1', 0);
        hand.setAttribute('y1', 0);
        var bg = Timepicker._createSVGEl('circle');
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
    }, {
      key: "_buildHoursView",
      value: function _buildHoursView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Hours view
        if (this.options.twelveHour) {
          for (var i = 1; i < 13; i += 1) {
            var tick = $tick.clone();
            var radian = i / 6 * Math.PI;
            var radius = this.options.outerRadius;
            tick.css({
              left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
            });
            tick.html(i === 0 ? '00' : i);
            this.hoursView.appendChild(tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        } else {
          for (var _i2 = 0; _i2 < 24; _i2 += 1) {
            var _tick = $tick.clone();
            var _radian = _i2 / 6 * Math.PI;
            var inner = _i2 > 0 && _i2 < 13;
            var _radius = inner ? this.options.innerRadius : this.options.outerRadius;
            _tick.css({
              left: this.options.dialRadius + Math.sin(_radian) * _radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(_radian) * _radius - this.options.tickRadius + 'px'
            });
            _tick.html(_i2 === 0 ? '00' : _i2);
            this.hoursView.appendChild(_tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        }
      }
    }, {
      key: "_buildMinutesView",
      value: function _buildMinutesView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Minutes view
        for (var i = 0; i < 60; i += 5) {
          var tick = $tick.clone();
          var radian = i / 30 * Math.PI;
          tick.css({
            left: this.options.dialRadius + Math.sin(radian) * this.options.outerRadius - this.options.tickRadius + 'px',
            top: this.options.dialRadius - Math.cos(radian) * this.options.outerRadius - this.options.tickRadius + 'px'
          });
          tick.html(Timepicker._addLeadingZero(i));
          this.minutesView.appendChild(tick[0]);
        }
      }
    }, {
      key: "_handleAmPmClick",
      value: function _handleAmPmClick(e) {
        var $btnClicked = $(e.target);
        this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
        this._updateAmPmView();
      }
    }, {
      key: "_updateAmPmView",
      value: function _updateAmPmView() {
        if (this.options.twelveHour) {
          this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
          this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
        }
      }
    }, {
      key: "_updateTimeFromInput",
      value: function _updateTimeFromInput() {
        // Get the time
        var value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
        if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
          if (value[1].toUpperCase().indexOf('AM') > 0) {
            this.amOrPm = 'AM';
          } else {
            this.amOrPm = 'PM';
          }
          value[1] = value[1].replace('AM', '').replace('PM', '');
        }
        if (value[0] === 'now') {
          var now = new Date(+new Date() + this.options.fromNow);
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
    }, {
      key: "showView",
      value: function showView(view, delay) {
        if (view === 'minutes' && $(this.hoursView).css('visibility') === 'visible') {
          // raiseCallback(this.options.beforeHourSelect);
        }
        var isHours = view === 'hours',
            nextView = isHours ? this.hoursView : this.minutesView,
            hideView = isHours ? this.minutesView : this.hoursView;
        this.currentView = view;

        $(this.spanHours).toggleClass('text-primary', isHours);
        $(this.spanMinutes).toggleClass('text-primary', !isHours);

        // Transition view
        hideView.classList.add('timepicker-dial-out');
        $(nextView).css('visibility', 'visible').removeClass('timepicker-dial-out');

        // Reset clock hand
        this.resetClock(delay);

        // After transitions ended
        clearTimeout(this.toggleViewTimer);
        this.toggleViewTimer = setTimeout(function () {
          $(hideView).css('visibility', 'hidden');
        }, this.options.duration);
      }
    }, {
      key: "resetClock",
      value: function resetClock(delay) {
        var view = this.currentView,
            value = this[view],
            isHours = view === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
            x = Math.sin(radian) * radius,
            y = -Math.cos(radian) * radius,
            self = this;

        if (delay) {
          $(this.canvas).addClass('timepicker-canvas-out');
          setTimeout(function () {
            $(self.canvas).removeClass('timepicker-canvas-out');
            self.setHand(x, y);
          }, delay);
        } else {
          this.setHand(x, y);
        }
      }
    }, {
      key: "setHand",
      value: function setHand(x, y, roundBy5) {
        var _this60 = this;

        var radian = Math.atan2(x, -y),
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
        var value = Math.round(radian / unit);

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
            value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
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
              this.vibrateTimer = setTimeout(function () {
                _this60.vibrateTimer = null;
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
        var cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
            cy1 = -Math.cos(radian) * (radius - this.options.tickRadius),
            cx2 = Math.sin(radian) * radius,
            cy2 = -Math.cos(radian) * radius;
        this.hand.setAttribute('x2', cx1);
        this.hand.setAttribute('y2', cy1);
        this.bg.setAttribute('cx', cx2);
        this.bg.setAttribute('cy', cy2);
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        this._updateTimeFromInput();
        this.showView('hours');

        this.modal.open();
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        this.modal.close();
      }

      /**
       * Finish timepicker selection.
       */

    }, {
      key: "done",
      value: function done(e, clearValue) {
        // Set input value
        var last = this.el.value;
        var value = clearValue ? '' : Timepicker._addLeadingZero(this.hours) + ':' + Timepicker._addLeadingZero(this.minutes);
        this.time = value;
        if (!clearValue && this.options.twelveHour) {
          value = value + " " + this.amOrPm;
        }
        this.el.value = value;

        // Trigger change event
        if (value !== last) {
          this.$el.trigger('change');
        }

        this.close();
        this.el.focus();
      }
    }, {
      key: "clear",
      value: function clear() {
        this.done(null, true);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Timepicker.__proto__ || Object.getPrototypeOf(Timepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_addLeadingZero",
      value: function _addLeadingZero(num) {
        return (num < 10 ? '0' : '') + num;
      }
    }, {
      key: "_createSVGEl",
      value: function _createSVGEl(name) {
        var svgNS = 'http://www.w3.org/2000/svg';
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

    }, {
      key: "_Pos",
      value: function _Pos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        }
        // mouse event
        return { x: e.clientX, y: e.clientY };
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Timepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Timepicker;
  }(Component);

  Timepicker._template = ['<div class= "modal timepicker-modal">', '<div class="modal-content timepicker-container">', '<div class="timepicker-digital-display">', '<div class="timepicker-text-container">', '<div class="timepicker-display-column">', '<span class="timepicker-span-hours text-primary"></span>', ':', '<span class="timepicker-span-minutes"></span>', '</div>', '<div class="timepicker-display-column timepicker-display-am-pm">', '<div class="timepicker-span-am-pm"></div>', '</div>', '</div>', '</div>', '<div class="timepicker-analog-display">', '<div class="timepicker-plate">', '<div class="timepicker-canvas"></div>', '<div class="timepicker-dial timepicker-hours"></div>', '<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>', '</div>', '<div class="timepicker-footer"></div>', '</div>', '</div>', '</div>'].join('');

  M.Timepicker = Timepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var CharacterCounter = function (_Component17) {
    _inherits(CharacterCounter, _Component17);

    /**
     * Construct CharacterCounter instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function CharacterCounter(el, options) {
      _classCallCheck(this, CharacterCounter);

      var _this61 = _possibleConstructorReturn(this, (CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter)).call(this, CharacterCounter, el, options));

      _this61.el.M_CharacterCounter = _this61;

      /**
       * Options for the character counter
       */
      _this61.options = $.extend({}, CharacterCounter.defaults, options);

      _this61.isInvalid = false;
      _this61.isValidLength = false;
      _this61._setupCounter();
      _this61._setupEventHandlers();
      return _this61;
    }

    _createClass(CharacterCounter, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.CharacterCounter = undefined;
        this._removeCounter();
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleUpdateCounterBound = this.updateCounter.bind(this);

        this.el.addEventListener('focus', this._handleUpdateCounterBound, true);
        this.el.addEventListener('input', this._handleUpdateCounterBound, true);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('focus', this._handleUpdateCounterBound, true);
        this.el.removeEventListener('input', this._handleUpdateCounterBound, true);
      }

      /**
       * Setup counter element
       */

    }, {
      key: "_setupCounter",
      value: function _setupCounter() {
        this.counterEl = document.createElement('span');
        $(this.counterEl).addClass('character-counter').css({
          float: 'right',
          'font-size': '12px',
          height: 1
        });

        this.$el.parent().append(this.counterEl);
      }

      /**
       * Remove counter element
       */

    }, {
      key: "_removeCounter",
      value: function _removeCounter() {
        $(this.counterEl).remove();
      }

      /**
       * Update counter
       */

    }, {
      key: "updateCounter",
      value: function updateCounter() {
        var maxLength = +this.$el.attr('data-length'),
            actualLength = this.el.value.length;
        this.isValidLength = actualLength <= maxLength;
        var counterString = actualLength;

        if (maxLength) {
          counterString += '/' + maxLength;
          this._validateInput();
        }

        $(this.counterEl).html(counterString);
      }

      /**
       * Add validation classes
       */

    }, {
      key: "_validateInput",
      value: function _validateInput() {
        if (this.isValidLength && this.isInvalid) {
          this.isInvalid = false;
          this.$el.removeClass('invalid');
        } else if (!this.isValidLength && !this.isInvalid) {
          this.isInvalid = true;
          this.$el.removeClass('valid');
          this.$el.addClass('invalid');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_CharacterCounter;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return CharacterCounter;
  }(Component);

  M.CharacterCounter = CharacterCounter;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    duration: 200, // ms
    dist: -100, // zoom scale TODO: make this more intuitive as an option
    shift: 0, // spacing for center image
    padding: 0, // Padding between non center items
    numVisible: 5, // Number of visible items in carousel
    fullWidth: false, // Change to full width styles
    indicators: false, // Toggle indicators
    noWrap: false, // Don't wrap around and cycle through items.
    onCycleTo: null // Callback for when a new slide is cycled to.
  };

  /**
   * @class
   *
   */

  var Carousel = function (_Component18) {
    _inherits(Carousel, _Component18);

    /**
     * Construct Carousel instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Carousel(el, options) {
      _classCallCheck(this, Carousel);

      var _this62 = _possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this, Carousel, el, options));

      _this62.el.M_Carousel = _this62;

      /**
       * Options for the carousel
       * @member Carousel#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {Number} shift
       * @prop {Number} padding
       * @prop {Number} numVisible
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this62.options = $.extend({}, Carousel.defaults, options);

      // Setup
      _this62.hasMultipleSlides = _this62.$el.find('.carousel-item').length > 1;
      _this62.showIndicators = _this62.options.indicators && _this62.hasMultipleSlides;
      _this62.noWrap = _this62.options.noWrap || !_this62.hasMultipleSlides;
      _this62.pressed = false;
      _this62.dragged = false;
      _this62.offset = _this62.target = 0;
      _this62.images = [];
      _this62.itemWidth = _this62.$el.find('.carousel-item').first().innerWidth();
      _this62.itemHeight = _this62.$el.find('.carousel-item').first().innerHeight();
      _this62.dim = _this62.itemWidth * 2 + _this62.options.padding || 1; // Make sure dim is non zero for divisions.
      _this62._autoScrollBound = _this62._autoScroll.bind(_this62);
      _this62._trackBound = _this62._track.bind(_this62);

      // Full Width carousel setup
      if (_this62.options.fullWidth) {
        _this62.options.dist = 0;
        _this62._setCarouselHeight();

        // Offset fixed items when indicators.
        if (_this62.showIndicators) {
          _this62.$el.find('.carousel-fixed-item').addClass('with-indicators');
        }
      }

      // Iterate through slides
      _this62.$indicators = $('<ul class="indicators"></ul>');
      _this62.$el.find('.carousel-item').each(function (el, i) {
        _this62.images.push(el);
        if (_this62.showIndicators) {
          var $indicator = $('<li class="indicator-item"></li>');

          // Add active to first by default.
          if (i === 0) {
            $indicator[0].classList.add('active');
          }

          _this62.$indicators.append($indicator);
        }
      });
      if (_this62.showIndicators) {
        _this62.$el.append(_this62.$indicators);
      }
      _this62.count = _this62.images.length;

      // Cap numVisible at count
      _this62.options.numVisible = Math.min(_this62.count, _this62.options.numVisible);

      // Setup cross browser string
      _this62.xform = 'transform';
      ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
          _this62.xform = e;
          return false;
        }
        return true;
      });

      _this62._setupEventHandlers();
      _this62._scroll(_this62.offset);
      return _this62;
    }

    _createClass(Carousel, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Carousel = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this63 = this;

        this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
        this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
        this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
        this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.addEventListener('touchstart', this._handleCarouselTapBound);
          this.el.addEventListener('touchmove', this._handleCarouselDragBound);
          this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
        }

        this.el.addEventListener('mousedown', this._handleCarouselTapBound);
        this.el.addEventListener('mousemove', this._handleCarouselDragBound);
        this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.addEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.addEventListener('click', _this63._handleIndicatorClickBound);
          });
        }

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this64 = this;

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
          this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
          this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
        }
        this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
        this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
        this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.removeEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.removeEventListener('click', _this64._handleIndicatorClickBound);
          });
        }

        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Carousel Tap
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselTap",
      value: function _handleCarouselTap(e) {
        // Fixes firefox draggable image bug
        if (e.type === 'mousedown' && $(e.target).is('img')) {
          e.preventDefault();
        }
        this.pressed = true;
        this.dragged = false;
        this.verticalDragged = false;
        this.reference = this._xpos(e);
        this.referenceY = this._ypos(e);

        this.velocity = this.amplitude = 0;
        this.frame = this.offset;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(this._trackBound, 100);
      }

      /**
       * Handle Carousel Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselDrag",
      value: function _handleCarouselDrag(e) {
        var x = void 0,
            y = void 0,
            delta = void 0,
            deltaY = void 0;
        if (this.pressed) {
          x = this._xpos(e);
          y = this._ypos(e);
          delta = this.reference - x;
          deltaY = Math.abs(this.referenceY - y);
          if (deltaY < 30 && !this.verticalDragged) {
            // If vertical scrolling don't allow dragging.
            if (delta > 2 || delta < -2) {
              this.dragged = true;
              this.reference = x;
              this._scroll(this.offset + delta);
            }
          } else if (this.dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          } else {
            // Vertical scrolling.
            this.verticalDragged = true;
          }
        }

        if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      /**
       * Handle Carousel Release
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselRelease",
      value: function _handleCarouselRelease(e) {
        if (this.pressed) {
          this.pressed = false;
        } else {
          return;
        }

        clearInterval(this.ticker);
        this.target = this.offset;
        if (this.velocity > 10 || this.velocity < -10) {
          this.amplitude = 0.9 * this.velocity;
          this.target = this.offset + this.amplitude;
        }
        this.target = Math.round(this.target / this.dim) * this.dim;

        // No wrap of items.
        if (this.noWrap) {
          if (this.target >= this.dim * (this.count - 1)) {
            this.target = this.dim * (this.count - 1);
          } else if (this.target < 0) {
            this.target = 0;
          }
        }
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);

        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }

      /**
       * Handle Carousel CLick
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselClick",
      value: function _handleCarouselClick(e) {
        // Disable clicks if carousel was dragged.
        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        } else if (!this.options.fullWidth) {
          var clickedIndex = $(e.target).closest('.carousel-item').index();
          var diff = this._wrap(this.center) - clickedIndex;

          // Disable clicks if carousel was shifted by click
          if (diff !== 0) {
            e.preventDefault();
            e.stopPropagation();
          }
          this._cycleTo(clickedIndex);
        }
      }

      /**
       * Handle Indicator CLick
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        e.stopPropagation();

        var indicator = $(e.target).closest('.indicator-item');
        if (indicator.length) {
          this._cycleTo(indicator.index());
        }
      }

      /**
       * Handle Throttle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        if (this.options.fullWidth) {
          this.itemWidth = this.$el.find('.carousel-item').first().innerWidth();
          this.imageHeight = this.$el.find('.carousel-item.active').height();
          this.dim = this.itemWidth * 2 + this.options.padding;
          this.offset = this.center * 2 * this.itemWidth;
          this.target = this.offset;
          this._setCarouselHeight(true);
        } else {
          this._scroll();
        }
      }

      /**
       * Set carousel height based on first slide
       * @param {Booleam} imageOnly - true for image slides
       */

    }, {
      key: "_setCarouselHeight",
      value: function _setCarouselHeight(imageOnly) {
        var _this65 = this;

        var firstSlide = this.$el.find('.carousel-item.active').length ? this.$el.find('.carousel-item.active').first() : this.$el.find('.carousel-item').first();
        var firstImage = firstSlide.find('img').first();
        if (firstImage.length) {
          if (firstImage[0].complete) {
            // If image won't trigger the load event
            var imageHeight = firstImage.height();
            if (imageHeight > 0) {
              this.$el.css('height', imageHeight + 'px');
            } else {
              // If image still has no height, use the natural dimensions to calculate
              var naturalWidth = firstImage[0].naturalWidth;
              var naturalHeight = firstImage[0].naturalHeight;
              var adjustedHeight = this.$el.width() / naturalWidth * naturalHeight;
              this.$el.css('height', adjustedHeight + 'px');
            }
          } else {
            // Get height when image is loaded normally
            firstImage.one('load', function (el, i) {
              _this65.$el.css('height', el.offsetHeight + 'px');
            });
          }
        } else if (!imageOnly) {
          var slideHeight = firstSlide.height();
          this.$el.css('height', slideHeight + 'px');
        }
      }

      /**
       * Get x position from event
       * @param {Event} e
       */

    }, {
      key: "_xpos",
      value: function _xpos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientX;
        }

        // mouse event
        return e.clientX;
      }

      /**
       * Get y position from event
       * @param {Event} e
       */

    }, {
      key: "_ypos",
      value: function _ypos(e) {
        // touch event
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return e.targetTouches[0].clientY;
        }

        // mouse event
        return e.clientY;
      }

      /**
       * Wrap index
       * @param {Number} x
       */

    }, {
      key: "_wrap",
      value: function _wrap(x) {
        return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + x % this.count) : x;
      }

      /**
       * Tracks scrolling information
       */

    }, {
      key: "_track",
      value: function _track() {
        var now = void 0,
            elapsed = void 0,
            delta = void 0,
            v = void 0;

        now = Date.now();
        elapsed = now - this.timestamp;
        this.timestamp = now;
        delta = this.offset - this.frame;
        this.frame = this.offset;

        v = 1000 * delta / (1 + elapsed);
        this.velocity = 0.8 * v + 0.2 * this.velocity;
      }

      /**
       * Auto scrolls to nearest carousel item.
       */

    }, {
      key: "_autoScroll",
      value: function _autoScroll() {
        var elapsed = void 0,
            delta = void 0;

        if (this.amplitude) {
          elapsed = Date.now() - this.timestamp;
          delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
          if (delta > 2 || delta < -2) {
            this._scroll(this.target - delta);
            requestAnimationFrame(this._autoScrollBound);
          } else {
            this._scroll(this.target);
          }
        }
      }

      /**
       * Scroll to target
       * @param {Number} x
       */

    }, {
      key: "_scroll",
      value: function _scroll(x) {
        var _this66 = this;

        // Track scrolling state
        if (!this.$el.hasClass('scrolling')) {
          this.el.classList.add('scrolling');
        }
        if (this.scrollingTimeout != null) {
          window.clearTimeout(this.scrollingTimeout);
        }
        this.scrollingTimeout = window.setTimeout(function () {
          _this66.$el.removeClass('scrolling');
        }, this.options.duration);

        // Start actual scroll
        var i = void 0,
            half = void 0,
            delta = void 0,
            dir = void 0,
            tween = void 0,
            el = void 0,
            alignment = void 0,
            zTranslation = void 0,
            tweenedOpacity = void 0,
            centerTweenedOpacity = void 0;
        var lastCenter = this.center;
        var numVisibleOffset = 1 / this.options.numVisible;

        this.offset = typeof x === 'number' ? x : this.offset;
        this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
        delta = this.offset - this.center * this.dim;
        dir = delta < 0 ? 1 : -1;
        tween = -dir * delta * 2 / this.dim;
        half = this.count >> 1;

        if (this.options.fullWidth) {
          alignment = 'translateX(0)';
          centerTweenedOpacity = 1;
        } else {
          alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
          alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
          centerTweenedOpacity = 1 - numVisibleOffset * tween;
        }

        // Set indicator active
        if (this.showIndicators) {
          var diff = this.center % this.count;
          var activeIndicator = this.$indicators.find('.indicator-item.active');
          if (activeIndicator.index() !== diff) {
            activeIndicator.removeClass('active');
            this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];

          // Add active class to center item.
          if (!$(el).hasClass('active')) {
            this.$el.find('.carousel-item').removeClass('active');
            el.classList.add('active');
          }
          var transformString = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween * i + "px) translateZ(" + this.options.dist * tween + "px)";
          this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
        }

        for (i = 1; i <= half; ++i) {
          // right side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 + tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center + i < this.count) {
            el = this.images[this._wrap(this.center + i)];
            var _transformString = alignment + " translateX(" + (this.options.shift + (this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString);
          }

          // left side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 - tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center - i >= 0) {
            el = this.images[this._wrap(this.center - i)];
            var _transformString2 = alignment + " translateX(" + (-this.options.shift + (-this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString2);
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];
          var _transformString3 = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween + "px) translateZ(" + this.options.dist * tween + "px)";
          this._updateItemStyle(el, centerTweenedOpacity, 0, _transformString3);
        }

        // onCycleTo callback
        var $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
        if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
          this.options.onCycleTo.call(this, $currItem[0], this.dragged);
        }

        // One time callback
        if (typeof this.oneTimeCallback === 'function') {
          this.oneTimeCallback.call(this, $currItem[0], this.dragged);
          this.oneTimeCallback = null;
        }
      }

      /**
       * Cycle to target
       * @param {Element} el
       * @param {Number} opacity
       * @param {Number} zIndex
       * @param {String} transform
       */

    }, {
      key: "_updateItemStyle",
      value: function _updateItemStyle(el, opacity, zIndex, transform) {
        el.style[this.xform] = transform;
        el.style.zIndex = zIndex;
        el.style.opacity = opacity;
        el.style.visibility = 'visible';
      }

      /**
       * Cycle to target
       * @param {Number} n
       * @param {Function} callback
       */

    }, {
      key: "_cycleTo",
      value: function _cycleTo(n, callback) {
        var diff = this.center % this.count - n;

        // Account for wraparound.
        if (!this.noWrap) {
          if (diff < 0) {
            if (Math.abs(diff + this.count) < Math.abs(diff)) {
              diff += this.count;
            }
          } else if (diff > 0) {
            if (Math.abs(diff - this.count) < diff) {
              diff -= this.count;
            }
          }
        }

        this.target = this.dim * Math.round(this.offset / this.dim);
        // Next
        if (diff < 0) {
          this.target += this.dim * Math.abs(diff);

          // Prev
        } else if (diff > 0) {
          this.target -= this.dim * diff;
        }

        // Set one time callback
        if (typeof callback === 'function') {
          this.oneTimeCallback = callback;
        }

        // Scroll
        if (this.offset !== this.target) {
          this.amplitude = this.target - this.offset;
          this.timestamp = Date.now();
          requestAnimationFrame(this._autoScrollBound);
        }
      }

      /**
       * Cycle to next item
       * @param {Number} [n]
       */

    }, {
      key: "next",
      value: function next(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center + n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }
        this._cycleTo(index);
      }

      /**
       * Cycle to previous item
       * @param {Number} [n]
       */

    }, {
      key: "prev",
      value: function prev(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center - n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }

        this._cycleTo(index);
      }

      /**
       * Cycle to nth item
       * @param {Number} [n]
       * @param {Function} callback
       */

    }, {
      key: "set",
      value: function set(n, callback) {
        if (n === undefined || isNaN(n)) {
          n = 0;
        }

        if (n > this.count || n < 0) {
          if (this.noWrap) {
            return;
          }

          n = this._wrap(n);
        }

        this._cycleTo(n, callback);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Carousel.__proto__ || Object.getPrototypeOf(Carousel), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Carousel;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Carousel;
  }(Component);

  M.Carousel = Carousel;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    onOpen: undefined,
    onClose: undefined
  };

  /**
   * @class
   *
   */

  var TapTarget = function (_Component19) {
    _inherits(TapTarget, _Component19);

    /**
     * Construct TapTarget instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function TapTarget(el, options) {
      _classCallCheck(this, TapTarget);

      var _this67 = _possibleConstructorReturn(this, (TapTarget.__proto__ || Object.getPrototypeOf(TapTarget)).call(this, TapTarget, el, options));

      _this67.el.M_TapTarget = _this67;

      /**
       * Options for the select
       * @member TapTarget#options
       * @prop {Function} onOpen - Callback function called when feature discovery is opened
       * @prop {Function} onClose - Callback function called when feature discovery is closed
       */
      _this67.options = $.extend({}, TapTarget.defaults, options);

      _this67.isOpen = false;

      // setup
      _this67.$origin = $('#' + _this67.$el.attr('data-target'));
      _this67._setup();

      _this67._calculatePositioning();
      _this67._setupEventHandlers();
      return _this67;
    }

    _createClass(TapTarget, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.TapTarget = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
        this._handleTargetClickBound = this._handleTargetClick.bind(this);
        this._handleOriginClickBound = this._handleOriginClick.bind(this);

        this.el.addEventListener('click', this._handleTargetClickBound);
        this.originEl.addEventListener('click', this._handleOriginClickBound);

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleTargetClickBound);
        this.originEl.removeEventListener('click', this._handleOriginClickBound);
        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Target Click
       * @param {Event} e
       */

    }, {
      key: "_handleTargetClick",
      value: function _handleTargetClick(e) {
        this.open();
      }

      /**
       * Handle Origin Click
       * @param {Event} e
       */

    }, {
      key: "_handleOriginClick",
      value: function _handleOriginClick(e) {
        this.close();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        this._calculatePositioning();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest('.tap-target-wrapper').length) {
          this.close();
          e.preventDefault();
          e.stopPropagation();
        }
      }

      /**
       * Setup Tap Target
       */

    }, {
      key: "_setup",
      value: function _setup() {
        // Creating tap target
        this.wrapper = this.$el.parent()[0];
        this.waveEl = $(this.wrapper).find('.tap-target-wave')[0];
        this.originEl = $(this.wrapper).find('.tap-target-origin')[0];
        this.contentEl = this.$el.find('.tap-target-content')[0];

        // Creating wrapper
        if (!$(this.wrapper).hasClass('.tap-target-wrapper')) {
          this.wrapper = document.createElement('div');
          this.wrapper.classList.add('tap-target-wrapper');
          this.$el.before($(this.wrapper));
          this.wrapper.append(this.el);
        }

        // Creating content
        if (!this.contentEl) {
          this.contentEl = document.createElement('div');
          this.contentEl.classList.add('tap-target-content');
          this.$el.append(this.contentEl);
        }

        // Creating foreground wave
        if (!this.waveEl) {
          this.waveEl = document.createElement('div');
          this.waveEl.classList.add('tap-target-wave');

          // Creating origin
          if (!this.originEl) {
            this.originEl = this.$origin.clone(true, true);
            this.originEl.addClass('tap-target-origin');
            this.originEl.removeAttr('id');
            this.originEl.removeAttr('style');
            this.originEl = this.originEl[0];
            this.waveEl.append(this.originEl);
          }

          this.wrapper.append(this.waveEl);
        }
      }

      /**
       * Calculate positioning
       */

    }, {
      key: "_calculatePositioning",
      value: function _calculatePositioning() {
        // Element or parent is fixed position?
        var isFixed = this.$origin.css('position') === 'fixed';
        if (!isFixed) {
          var parents = this.$origin.parents();
          for (var i = 0; i < parents.length; i++) {
            isFixed = $(parents[i]).css('position') == 'fixed';
            if (isFixed) {
              break;
            }
          }
        }

        // Calculating origin
        var originWidth = this.$origin.outerWidth();
        var originHeight = this.$origin.outerHeight();
        var originTop = isFixed ? this.$origin.offset().top - M.getDocumentScrollTop() : this.$origin.offset().top;
        var originLeft = isFixed ? this.$origin.offset().left - M.getDocumentScrollLeft() : this.$origin.offset().left;

        // Calculating screen
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var centerX = windowWidth / 2;
        var centerY = windowHeight / 2;
        var isLeft = originLeft <= centerX;
        var isRight = originLeft > centerX;
        var isTop = originTop <= centerY;
        var isBottom = originTop > centerY;
        var isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

        // Calculating tap target
        var tapTargetWidth = this.$el.outerWidth();
        var tapTargetHeight = this.$el.outerHeight();
        var tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
        var tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
        var tapTargetPosition = isFixed ? 'fixed' : 'absolute';

        // Calculating content
        var tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
        var tapTargetTextHeight = tapTargetHeight / 2;
        var tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
        var tapTargetTextBottom = 0;
        var tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
        var tapTargetTextRight = 0;
        var tapTargetTextPadding = originWidth;
        var tapTargetTextAlign = isBottom ? 'bottom' : 'top';

        // Calculating wave
        var tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
        var tapTargetWaveHeight = tapTargetWaveWidth;
        var tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
        var tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

        // Setting tap target
        var tapTargetWrapperCssObj = {};
        tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
        tapTargetWrapperCssObj.right = isRight ? windowWidth - tapTargetLeft - tapTargetWidth + 'px' : '';
        tapTargetWrapperCssObj.bottom = isBottom ? windowHeight - tapTargetTop - tapTargetHeight + 'px' : '';
        tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
        tapTargetWrapperCssObj.position = tapTargetPosition;
        $(this.wrapper).css(tapTargetWrapperCssObj);

        // Setting content
        $(this.contentEl).css({
          width: tapTargetTextWidth + 'px',
          height: tapTargetTextHeight + 'px',
          top: tapTargetTextTop + 'px',
          right: tapTargetTextRight + 'px',
          bottom: tapTargetTextBottom + 'px',
          left: tapTargetTextLeft + 'px',
          padding: tapTargetTextPadding + 'px',
          verticalAlign: tapTargetTextAlign
        });

        // Setting wave
        $(this.waveEl).css({
          top: tapTargetWaveTop + 'px',
          left: tapTargetWaveLeft + 'px',
          width: tapTargetWaveWidth + 'px',
          height: tapTargetWaveHeight + 'px'
        });
      }

      /**
       * Open TapTarget
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        // onOpen callback
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this, this.$origin[0]);
        }

        this.isOpen = true;
        this.wrapper.classList.add('open');

        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
      }

      /**
       * Close Tap Target
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        // onClose callback
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this, this.$origin[0]);
        }

        this.isOpen = false;
        this.wrapper.classList.remove('open');

        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(TapTarget.__proto__ || Object.getPrototypeOf(TapTarget), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_TapTarget;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return TapTarget;
  }(Component);

  M.TapTarget = TapTarget;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    classes: '',
    dropdownOptions: {}
  };

  /**
   * @class
   *
   */

  var FormSelect = function (_Component20) {
    _inherits(FormSelect, _Component20);

    /**
     * Construct FormSelect instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FormSelect(el, options) {
      _classCallCheck(this, FormSelect);

      // Don't init if browser default version
      var _this68 = _possibleConstructorReturn(this, (FormSelect.__proto__ || Object.getPrototypeOf(FormSelect)).call(this, FormSelect, el, options));

      if (_this68.$el.hasClass('browser-default')) {
        return _possibleConstructorReturn(_this68);
      }

      _this68.el.M_FormSelect = _this68;

      /**
       * Options for the select
       * @member FormSelect#options
       */
      _this68.options = $.extend({}, FormSelect.defaults, options);

      _this68.isMultiple = _this68.$el.prop('multiple');

      // Setup
      _this68.el.tabIndex = -1;
      _this68._keysSelected = {};
      _this68._valueDict = {}; // Maps key to original and generated option element.
      _this68._setupDropdown();

      _this68._setupEventHandlers();
      return _this68;
    }

    _createClass(FormSelect, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_FormSelect = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this69 = this;

        this._handleSelectChangeBound = this._handleSelectChange.bind(this);
        this._handleOptionClickBound = this._handleOptionClick.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.addEventListener('click', _this69._handleOptionClickBound);
        });
        this.el.addEventListener('change', this._handleSelectChangeBound);
        this.input.addEventListener('click', this._handleInputClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this70 = this;

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.removeEventListener('click', _this70._handleOptionClickBound);
        });
        this.el.removeEventListener('change', this._handleSelectChangeBound);
        this.input.removeEventListener('click', this._handleInputClickBound);
      }

      /**
       * Handle Select Change
       * @param {Event} e
       */

    }, {
      key: "_handleSelectChange",
      value: function _handleSelectChange(e) {
        this._setValueToInput();
      }

      /**
       * Handle Option Click
       * @param {Event} e
       */

    }, {
      key: "_handleOptionClick",
      value: function _handleOptionClick(e) {
        e.preventDefault();
        var option = $(e.target).closest('li')[0];
        var key = option.id;
        if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
          var selected = true;

          if (this.isMultiple) {
            // Deselect placeholder option if still selected.
            var placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
            if (placeholderOption.length) {
              placeholderOption.removeClass('selected');
              placeholderOption.find('input[type="checkbox"]').prop('checked', false);
              this._toggleEntryFromArray(placeholderOption[0].id);
            }
            selected = this._toggleEntryFromArray(key);
          } else {
            $(this.dropdownOptions).find('li').removeClass('selected');
            $(option).toggleClass('selected', selected);
          }

          // Set selected on original select option
          // Only trigger if selected state changed
          var prevSelected = $(this._valueDict[key].el).prop('selected');
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

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        if (this.dropdown && this.dropdown.isOpen) {
          this._setValueToInput();
          this._setSelectedStates();
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        var _this71 = this;

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
        this.dropdownOptions.id = "select-options-" + M.guid();
        $(this.dropdownOptions).addClass('dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : ''));

        // Create dropdown structure.
        if (this.$selectOptions.length) {
          this.$selectOptions.each(function (el) {
            if ($(el).is('option')) {
              // Direct descendant option.
              var optionEl = void 0;
              if (_this71.isMultiple) {
                optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'multiple');
              } else {
                optionEl = _this71._appendOptionWithIcon(_this71.$el, el);
              }

              _this71._addOptionToValueDict(el, optionEl);
            } else if ($(el).is('optgroup')) {
              // Optgroup.
              var selectOptions = $(el).children('option');
              $(_this71.dropdownOptions).append($('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]);

              selectOptions.each(function (el) {
                var optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'optgroup-option');
                _this71._addOptionToValueDict(el, optionEl);
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
        var dropdownIcon = $('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
        this.$el.before(dropdownIcon[0]);

        // Initialize dropdown
        if (!this.el.disabled) {
          var dropdownOptions = $.extend({}, this.options.dropdownOptions);

          // Add callback for centering selected option when dropdown content is scrollable
          dropdownOptions.onOpenEnd = function (el) {
            var selectedOption = $(_this71.dropdownOptions).find('.selected').first();

            if (selectedOption.length) {
              // Focus selected option in dropdown
              M.keyDown = true;
              _this71.dropdown.focusedIndex = selectedOption.index();
              _this71.dropdown._focusFocusedItem();
              M.keyDown = false;

              // Handle scrolling to selected option
              if (_this71.dropdown.isScrollable) {
                var scrollOffset = selectedOption[0].getBoundingClientRect().top - _this71.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
                scrollOffset -= _this71.dropdownOptions.clientHeight / 2; // center in dropdown
                _this71.dropdownOptions.scrollTop = scrollOffset;
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

    }, {
      key: "_addOptionToValueDict",
      value: function _addOptionToValueDict(el, optionEl) {
        var index = Object.keys(this._valueDict).length;
        var key = this.dropdownOptions.id + index;
        var obj = {};
        optionEl.id = key;

        obj.el = el;
        obj.optionEl = optionEl;
        this._valueDict[key] = obj;
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeDropdown",
      value: function _removeDropdown() {
        $(this.wrapper).find('.caret').remove();
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

    }, {
      key: "_appendOptionWithIcon",
      value: function _appendOptionWithIcon(select, option, type) {
        // Add disabled attr if disabled
        var disabledClass = option.disabled ? 'disabled ' : '';
        var optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';
        var multipleCheckbox = this.isMultiple ? "<label><input type=\"checkbox\"" + disabledClass + "\"/><span>" + option.innerHTML + "</span></label>" : option.innerHTML;
        var liEl = $('<li></li>');
        var spanEl = $('<span></span>');
        spanEl.html(multipleCheckbox);
        liEl.addClass(disabledClass + " " + optgroupClass);
        liEl.append(spanEl);

        // add icons
        var iconUrl = option.getAttribute('data-icon');
        if (!!iconUrl) {
          var imgEl = $("<img alt=\"\" src=\"" + iconUrl + "\">");
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

    }, {
      key: "_toggleEntryFromArray",
      value: function _toggleEntryFromArray(key) {
        var notAdded = !this._keysSelected.hasOwnProperty(key);
        var $optionLi = $(this._valueDict[key].optionEl);

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

    }, {
      key: "_setValueToInput",
      value: function _setValueToInput() {
        var values = [];
        var options = this.$el.find('option');

        options.each(function (el) {
          if ($(el).prop('selected')) {
            var text = $(el).text();
            values.push(text);
          }
        });

        if (!values.length) {
          var firstDisabled = this.$el.find('option:disabled').eq(0);
          if (firstDisabled.length && firstDisabled[0].value === '') {
            values.push(firstDisabled.text());
          }
        }

        this.input.value = values.join(', ');
      }

      /**
       * Set selected state of dropdown to match actual select element
       */

    }, {
      key: "_setSelectedStates",
      value: function _setSelectedStates() {
        this._keysSelected = {};

        for (var key in this._valueDict) {
          var option = this._valueDict[key];
          var optionIsSelected = $(option.el).prop('selected');
          $(option.optionEl).find('input[type="checkbox"]').prop('checked', optionIsSelected);
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

    }, {
      key: "_activateOption",
      value: function _activateOption(collection, newOption) {
        if (newOption) {
          if (!this.isMultiple) {
            collection.find('li.selected').removeClass('selected');
          }
          var option = $(newOption);
          option.addClass('selected');
        }
      }

      /**
       * Get Selected Values
       * @return {Array}  Array of selected values
       */

    }, {
      key: "getSelectedValues",
      value: function getSelectedValues() {
        var selectedValues = [];
        for (var key in this._keysSelected) {
          selectedValues.push(this._valueDict[key].el.value);
        }
        return selectedValues;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FormSelect.__proto__ || Object.getPrototypeOf(FormSelect), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FormSelect;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FormSelect;
  }(Component);

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var Range = function (_Component21) {
    _inherits(Range, _Component21);

    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Range(el, options) {
      _classCallCheck(this, Range);

      var _this72 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, Range, el, options));

      _this72.el.M_Range = _this72;

      /**
       * Options for the range
       * @member Range#options
       */
      _this72.options = $.extend({}, Range.defaults, options);

      _this72._mousedown = false;

      // Setup
      _this72._setupThumb();

      _this72._setupEventHandlers();
      return _this72;
    }

    _createClass(Range, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeThumb();
        this.el.M_Range = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleRangeChangeBound = this._handleRangeChange.bind(this);
        this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
        this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
        this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
        this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);

        this.el.addEventListener('change', this._handleRangeChangeBound);

        this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('change', this._handleRangeChangeBound);

        this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Handle Range Change
       * @param {Event} e
       */

    }, {
      key: "_handleRangeChange",
      value: function _handleRangeChange() {
        $(this.value).html(this.$el.val());

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        var offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
      }

      /**
       * Handle Range Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleRangeMousedownTouchstart",
      value: function _handleRangeMousedownTouchstart(e) {
        // Set indicator value
        $(this.value).html(this.$el.val());

        this._mousedown = true;
        this.$el.addClass('active');

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        if (e.type !== 'input') {
          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
        }
      }

      /**
       * Handle Range Input, Mousemove and Touchmove
       */

    }, {
      key: "_handleRangeInputMousemoveTouchmove",
      value: function _handleRangeInputMousemoveTouchmove() {
        if (this._mousedown) {
          if (!$(this.thumb).hasClass('active')) {
            this._showRangeBubble();
          }

          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
          $(this.value).html(this.$el.val());
        }
      }

      /**
       * Handle Range Mouseup and Touchend
       */

    }, {
      key: "_handleRangeMouseupTouchend",
      value: function _handleRangeMouseupTouchend() {
        this._mousedown = false;
        this.$el.removeClass('active');
      }

      /**
       * Handle Range Blur, Mouseout and Touchleave
       */

    }, {
      key: "_handleRangeBlurMouseoutTouchleave",
      value: function _handleRangeBlurMouseoutTouchleave() {
        if (!this._mousedown) {
          var paddingLeft = parseInt(this.$el.css('padding-left'));
          var marginLeft = 7 + paddingLeft + 'px';

          if ($(this.thumb).hasClass('active')) {
            anim.remove(this.thumb);
            anim({
              targets: this.thumb,
              height: 0,
              width: 0,
              top: 10,
              easing: 'easeOutQuad',
              marginLeft: marginLeft,
              duration: 100
            });
          }
          $(this.thumb).removeClass('active');
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupThumb",
      value: function _setupThumb() {
        this.thumb = document.createElement('span');
        this.value = document.createElement('span');
        $(this.thumb).addClass('thumb');
        $(this.value).addClass('value');
        $(this.thumb).append(this.value);
        this.$el.after(this.thumb);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeThumb",
      value: function _removeThumb() {
        $(this.thumb).remove();
      }

      /**
       * morph thumb into bubble
       */

    }, {
      key: "_showRangeBubble",
      value: function _showRangeBubble() {
        var paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
        var marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
        anim.remove(this.thumb);
        anim({
          targets: this.thumb,
          height: 30,
          width: 30,
          top: -30,
          marginLeft: marginLeft,
          duration: 300,
          easing: 'easeOutQuint'
        });
      }

      /**
       * Calculate the offset of the thumb
       * @return {Number}  offset in pixels
       */

    }, {
      key: "_calcRangeOffset",
      value: function _calcRangeOffset() {
        var width = this.$el.width() - 15;
        var max = parseFloat(this.$el.attr('max')) || 100; // Range default max
        var min = parseFloat(this.$el.attr('min')) || 0; // Range default min
        var percent = (parseFloat(this.$el.val()) - min) / (max - min);
        return percent * width;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Range.__proto__ || Object.getPrototypeOf(Range), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Range;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Range;
  }(Component);

  M.Range = Range;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range]'));
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXRlcmlhbGl6ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogTWF0ZXJpYWxpemUgdjEuMC4wIChodHRwOi8vbWF0ZXJpYWxpemVjc3MuY29tKVxyXG4gKiBDb3B5cmlnaHQgMjAxNC0yMDE3IE1hdGVyaWFsaXplXHJcbiAqIE1JVCBMaWNlbnNlIChodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vRG9nZmFsby9tYXRlcmlhbGl6ZS9tYXN0ZXIvTElDRU5TRSlcclxuICovXHJcbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTsgfSB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfTtcclxuXHJcbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XHJcblxyXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cclxuXHJcbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxyXG5cclxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cclxuXHJcbi8qISBjYXNoLWRvbSAxLjMuNSwgaHR0cHM6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvY2FzaCBAbGljZW5zZSBNSVQgKi9cclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgd2luZG93LmNhc2ggPSBmYWN0b3J5KCk7XHJcbn0pKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZG9jID0gZG9jdW1lbnQsXHJcbiAgICAgIHdpbiA9IHdpbmRvdyxcclxuICAgICAgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSxcclxuICAgICAgc2xpY2UgPSBBcnJheVByb3RvLnNsaWNlLFxyXG4gICAgICBmaWx0ZXIgPSBBcnJheVByb3RvLmZpbHRlcixcclxuICAgICAgcHVzaCA9IEFycmF5UHJvdG8ucHVzaDtcclxuXHJcbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fSxcclxuICAgICAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAvLyBAc2VlIGh0dHBzOi8vY3JidWcuY29tLzU2ODQ0OFxyXG4gICAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSB0eXBlb2Ygbm9vcCAmJiBpdGVtLmNhbGw7XHJcbiAgfSxcclxuICAgICAgaXNTdHJpbmcgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSB0eXBlb2YgXCJcIjtcclxuICB9O1xyXG5cclxuICB2YXIgaWRNYXRjaCA9IC9eI1tcXHctXSokLyxcclxuICAgICAgY2xhc3NNYXRjaCA9IC9eXFwuW1xcdy1dKiQvLFxyXG4gICAgICBodG1sTWF0Y2ggPSAvPC4rPi8sXHJcbiAgICAgIHNpbmdsZXQgPSAvXlxcdyskLztcclxuXHJcbiAgZnVuY3Rpb24gZmluZChzZWxlY3RvciwgY29udGV4dCkge1xyXG4gICAgY29udGV4dCA9IGNvbnRleHQgfHwgZG9jO1xyXG4gICAgdmFyIGVsZW1zID0gY2xhc3NNYXRjaC50ZXN0KHNlbGVjdG9yKSA/IGNvbnRleHQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWxlY3Rvci5zbGljZSgxKSkgOiBzaW5nbGV0LnRlc3Qoc2VsZWN0b3IpID8gY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWxlY3RvcikgOiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgcmV0dXJuIGVsZW1zO1xyXG4gIH1cclxuXHJcbiAgdmFyIGZyYWc7XHJcbiAgZnVuY3Rpb24gcGFyc2VIVE1MKHN0cikge1xyXG4gICAgaWYgKCFmcmFnKSB7XHJcbiAgICAgIGZyYWcgPSBkb2MuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KG51bGwpO1xyXG4gICAgICB2YXIgYmFzZSA9IGZyYWcuY3JlYXRlRWxlbWVudChcImJhc2VcIik7XHJcbiAgICAgIGJhc2UuaHJlZiA9IGRvYy5sb2NhdGlvbi5ocmVmO1xyXG4gICAgICBmcmFnLmhlYWQuYXBwZW5kQ2hpbGQoYmFzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnJhZy5ib2R5LmlubmVySFRNTCA9IHN0cjtcclxuXHJcbiAgICByZXR1cm4gZnJhZy5ib2R5LmNoaWxkTm9kZXM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblJlYWR5KGZuKSB7XHJcbiAgICBpZiAoZG9jLnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiKSB7XHJcbiAgICAgIGZuKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZm4pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gSW5pdChzZWxlY3RvciwgY29udGV4dCkge1xyXG4gICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBhbHJlYWR5IGEgY2FzaCBjb2xsZWN0aW9uLCBkb24ndCBkbyBhbnkgZnVydGhlciBwcm9jZXNzaW5nXHJcbiAgICBpZiAoc2VsZWN0b3IuY2FzaCAmJiBzZWxlY3RvciAhPT0gd2luKSB7XHJcbiAgICAgIHJldHVybiBzZWxlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZWxlbXMgPSBzZWxlY3RvcixcclxuICAgICAgICBpID0gMCxcclxuICAgICAgICBsZW5ndGg7XHJcblxyXG4gICAgaWYgKGlzU3RyaW5nKHNlbGVjdG9yKSkge1xyXG4gICAgICBlbGVtcyA9IGlkTWF0Y2gudGVzdChzZWxlY3RvcikgP1xyXG4gICAgICAvLyBJZiBhbiBJRCB1c2UgdGhlIGZhc3RlciBnZXRFbGVtZW50QnlJZCBjaGVja1xyXG4gICAgICBkb2MuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3Iuc2xpY2UoMSkpIDogaHRtbE1hdGNoLnRlc3Qoc2VsZWN0b3IpID9cclxuICAgICAgLy8gSWYgSFRNTCwgcGFyc2UgaXQgaW50byByZWFsIGVsZW1lbnRzXHJcbiAgICAgIHBhcnNlSFRNTChzZWxlY3RvcikgOlxyXG4gICAgICAvLyBlbHNlIHVzZSBgZmluZGBcclxuICAgICAgZmluZChzZWxlY3RvciwgY29udGV4dCk7XHJcblxyXG4gICAgICAvLyBJZiBmdW5jdGlvbiwgdXNlIGFzIHNob3J0Y3V0IGZvciBET00gcmVhZHlcclxuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihzZWxlY3RvcikpIHtcclxuICAgICAgb25SZWFkeShzZWxlY3Rvcik7cmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFlbGVtcykge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBhIHNpbmdsZSBET00gZWxlbWVudCBpcyBwYXNzZWQgaW4gb3IgcmVjZWl2ZWQgdmlhIElELCByZXR1cm4gdGhlIHNpbmdsZSBlbGVtZW50XHJcbiAgICBpZiAoZWxlbXMubm9kZVR5cGUgfHwgZWxlbXMgPT09IHdpbikge1xyXG4gICAgICB0aGlzWzBdID0gZWxlbXM7XHJcbiAgICAgIHRoaXMubGVuZ3RoID0gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyZWF0IGxpa2UgYW4gYXJyYXkgYW5kIGxvb3AgdGhyb3VnaCBlYWNoIGl0ZW0uXHJcbiAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoID0gZWxlbXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpc1tpXSA9IGVsZW1zW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjYXNoKHNlbGVjdG9yLCBjb250ZXh0KSB7XHJcbiAgICByZXR1cm4gbmV3IEluaXQoc2VsZWN0b3IsIGNvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGZuID0gY2FzaC5mbiA9IGNhc2gucHJvdG90eXBlID0gSW5pdC5wcm90b3R5cGUgPSB7IC8vIGpzaGludCBpZ25vcmU6bGluZVxyXG4gICAgY2FzaDogdHJ1ZSxcclxuICAgIGxlbmd0aDogMCxcclxuICAgIHB1c2g6IHB1c2gsXHJcbiAgICBzcGxpY2U6IEFycmF5UHJvdG8uc3BsaWNlLFxyXG4gICAgbWFwOiBBcnJheVByb3RvLm1hcCxcclxuICAgIGluaXQ6IEluaXRcclxuICB9O1xyXG5cclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwiY29uc3RydWN0b3JcIiwgeyB2YWx1ZTogY2FzaCB9KTtcclxuXHJcbiAgY2FzaC5wYXJzZUhUTUwgPSBwYXJzZUhUTUw7XHJcbiAgY2FzaC5ub29wID0gbm9vcDtcclxuICBjYXNoLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xyXG4gIGNhc2guaXNTdHJpbmcgPSBpc1N0cmluZztcclxuXHJcbiAgY2FzaC5leHRlbmQgPSBmbi5leHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XHJcblxyXG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyksXHJcbiAgICAgICAgbGVuZ3RoID0gYXJncy5sZW5ndGgsXHJcbiAgICAgICAgaSA9IDE7XHJcblxyXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHRhcmdldCA9IHRoaXM7XHJcbiAgICAgIGkgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKCFhcmdzW2ldKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIga2V5IGluIGFyZ3NbaV0pIHtcclxuICAgICAgICBpZiAoYXJnc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICB0YXJnZXRba2V5XSA9IGFyZ3NbaV1ba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFyZ2V0O1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGVhY2goY29sbGVjdGlvbiwgY2FsbGJhY2spIHtcclxuICAgIHZhciBsID0gY29sbGVjdGlvbi5sZW5ndGgsXHJcbiAgICAgICAgaSA9IDA7XHJcblxyXG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29sbGVjdGlvbltpXSwgY29sbGVjdGlvbltpXSwgaSwgY29sbGVjdGlvbikgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1hdGNoZXMoZWwsIHNlbGVjdG9yKSB7XHJcbiAgICB2YXIgbSA9IGVsICYmIChlbC5tYXRjaGVzIHx8IGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBlbC5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgZWwubXNNYXRjaGVzU2VsZWN0b3IgfHwgZWwub01hdGNoZXNTZWxlY3Rvcik7XHJcbiAgICByZXR1cm4gISFtICYmIG0uY2FsbChlbCwgc2VsZWN0b3IpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0Q29tcGFyZUZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAvKiBVc2UgYnJvd3NlcidzIGBtYXRjaGVzYCBmdW5jdGlvbiBpZiBzdHJpbmcgKi9cclxuICAgICAgaXNTdHJpbmcoc2VsZWN0b3IpID8gbWF0Y2hlcyA6XHJcbiAgICAgIC8qIE1hdGNoIGEgY2FzaCBlbGVtZW50ICovXHJcbiAgICAgIHNlbGVjdG9yLmNhc2ggPyBmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICByZXR1cm4gc2VsZWN0b3IuaXMoZWwpO1xyXG4gICAgICB9IDpcclxuICAgICAgLyogRGlyZWN0IGNvbXBhcmlzb24gKi9cclxuICAgICAgZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiBlbCA9PT0gc2VsZWN0b3I7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1bmlxdWUoY29sbGVjdGlvbikge1xyXG4gICAgcmV0dXJuIGNhc2goc2xpY2UuY2FsbChjb2xsZWN0aW9uKS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0sIGluZGV4LCBzZWxmKSB7XHJcbiAgICAgIHJldHVybiBzZWxmLmluZGV4T2YoaXRlbSkgPT09IGluZGV4O1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgY2FzaC5leHRlbmQoe1xyXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIChmaXJzdCwgc2Vjb25kKSB7XHJcbiAgICAgIHZhciBsZW4gPSArc2Vjb25kLmxlbmd0aCxcclxuICAgICAgICAgIGkgPSBmaXJzdC5sZW5ndGgsXHJcbiAgICAgICAgICBqID0gMDtcclxuXHJcbiAgICAgIGZvciAoOyBqIDwgbGVuOyBpKyssIGorKykge1xyXG4gICAgICAgIGZpcnN0W2ldID0gc2Vjb25kW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmaXJzdC5sZW5ndGggPSBpO1xyXG4gICAgICByZXR1cm4gZmlyc3Q7XHJcbiAgICB9LFxyXG5cclxuICAgIGVhY2g6IGVhY2gsXHJcbiAgICBtYXRjaGVzOiBtYXRjaGVzLFxyXG4gICAgdW5pcXVlOiB1bmlxdWUsXHJcbiAgICBpc0FycmF5OiBBcnJheS5pc0FycmF5LFxyXG4gICAgaXNOdW1lcmljOiBmdW5jdGlvbiAobikge1xyXG4gICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgdmFyIHVpZCA9IGNhc2gudWlkID0gXCJfY2FzaFwiICsgRGF0ZS5ub3coKTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGF0YUNhY2hlKG5vZGUpIHtcclxuICAgIHJldHVybiBub2RlW3VpZF0gPSBub2RlW3VpZF0gfHwge307XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXREYXRhKG5vZGUsIGtleSwgdmFsdWUpIHtcclxuICAgIHJldHVybiBnZXREYXRhQ2FjaGUobm9kZSlba2V5XSA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGF0YShub2RlLCBrZXkpIHtcclxuICAgIHZhciBjID0gZ2V0RGF0YUNhY2hlKG5vZGUpO1xyXG4gICAgaWYgKGNba2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNba2V5XSA9IG5vZGUuZGF0YXNldCA/IG5vZGUuZGF0YXNldFtrZXldIDogY2FzaChub2RlKS5hdHRyKFwiZGF0YS1cIiArIGtleSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY1trZXldO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlRGF0YShub2RlLCBrZXkpIHtcclxuICAgIHZhciBjID0gZ2V0RGF0YUNhY2hlKG5vZGUpO1xyXG4gICAgaWYgKGMpIHtcclxuICAgICAgZGVsZXRlIGNba2V5XTtcclxuICAgIH0gZWxzZSBpZiAobm9kZS5kYXRhc2V0KSB7XHJcbiAgICAgIGRlbGV0ZSBub2RlLmRhdGFzZXRba2V5XTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNhc2gobm9kZSkucmVtb3ZlQXR0cihcImRhdGEtXCIgKyBuYW1lKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZuLmV4dGVuZCh7XHJcbiAgICBkYXRhOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcclxuICAgICAgaWYgKGlzU3RyaW5nKG5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyBnZXREYXRhKHRoaXNbMF0sIG5hbWUpIDogdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICByZXR1cm4gc2V0RGF0YSh2LCBuYW1lLCB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhKGtleSwgbmFtZVtrZXldKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZURhdGE6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiByZW1vdmVEYXRhKHYsIGtleSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgdmFyIG5vdFdoaXRlTWF0Y2ggPSAvXFxTKy9nO1xyXG5cclxuICBmdW5jdGlvbiBnZXRDbGFzc2VzKGMpIHtcclxuICAgIHJldHVybiBpc1N0cmluZyhjKSAmJiBjLm1hdGNoKG5vdFdoaXRlTWF0Y2gpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFzQ2xhc3ModiwgYykge1xyXG4gICAgcmV0dXJuIHYuY2xhc3NMaXN0ID8gdi5jbGFzc0xpc3QuY29udGFpbnMoYykgOiBuZXcgUmVnRXhwKFwiKF58IClcIiArIGMgKyBcIiggfCQpXCIsIFwiZ2lcIikudGVzdCh2LmNsYXNzTmFtZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRDbGFzcyh2LCBjLCBzcGFjZWROYW1lKSB7XHJcbiAgICBpZiAodi5jbGFzc0xpc3QpIHtcclxuICAgICAgdi5jbGFzc0xpc3QuYWRkKGMpO1xyXG4gICAgfSBlbHNlIGlmIChzcGFjZWROYW1lLmluZGV4T2YoXCIgXCIgKyBjICsgXCIgXCIpKSB7XHJcbiAgICAgIHYuY2xhc3NOYW1lICs9IFwiIFwiICsgYztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKHYsIGMpIHtcclxuICAgIGlmICh2LmNsYXNzTGlzdCkge1xyXG4gICAgICB2LmNsYXNzTGlzdC5yZW1vdmUoYyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2LmNsYXNzTmFtZSA9IHYuY2xhc3NOYW1lLnJlcGxhY2UoYywgXCJcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgIHZhciBjbGFzc2VzID0gZ2V0Q2xhc3NlcyhjKTtcclxuXHJcbiAgICAgIHJldHVybiBjbGFzc2VzID8gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIHNwYWNlZE5hbWUgPSBcIiBcIiArIHYuY2xhc3NOYW1lICsgXCIgXCI7XHJcbiAgICAgICAgZWFjaChjbGFzc2VzLCBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgYWRkQ2xhc3ModiwgYywgc3BhY2VkTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pIDogdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgYXR0cjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XHJcbiAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc1N0cmluZyhuYW1lKSkge1xyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpc1swXSA/IHRoaXNbMF0uZ2V0QXR0cmlidXRlID8gdGhpc1swXS5nZXRBdHRyaWJ1dGUobmFtZSkgOiB0aGlzWzBdW25hbWVdIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgaWYgKHYuc2V0QXR0cmlidXRlKSB7XHJcbiAgICAgICAgICAgIHYuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZbbmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcclxuICAgICAgICB0aGlzLmF0dHIoa2V5LCBuYW1lW2tleV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgaGFzQ2xhc3M6IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgIHZhciBjaGVjayA9IGZhbHNlLFxyXG4gICAgICAgICAgY2xhc3NlcyA9IGdldENsYXNzZXMoYyk7XHJcbiAgICAgIGlmIChjbGFzc2VzICYmIGNsYXNzZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICBjaGVjayA9IGhhc0NsYXNzKHYsIGNsYXNzZXNbMF0pO1xyXG4gICAgICAgICAgcmV0dXJuICFjaGVjaztcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2hlY2s7XHJcbiAgICB9LFxyXG5cclxuICAgIHByb3A6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xyXG4gICAgICBpZiAoaXNTdHJpbmcobmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHRoaXNbMF1bbmFtZV0gOiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgIHZbbmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcclxuICAgICAgICB0aGlzLnByb3Aoa2V5LCBuYW1lW2tleV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlQXR0cjogZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGlmICh2LnJlbW92ZUF0dHJpYnV0ZSkge1xyXG4gICAgICAgICAgdi5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRlbGV0ZSB2W25hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoYykge1xyXG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKFwiY2xhc3NcIiwgXCJcIik7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGNsYXNzZXMgPSBnZXRDbGFzc2VzKGMpO1xyXG4gICAgICByZXR1cm4gY2xhc3NlcyA/IHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGVhY2goY2xhc3NlcywgZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgIHJlbW92ZUNsYXNzKHYsIGMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KSA6IHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZVByb3A6IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICBkZWxldGUgdltuYW1lXTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbiAoYywgc3RhdGUpIHtcclxuICAgICAgaWYgKHN0YXRlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpc1tzdGF0ZSA/IFwiYWRkQ2xhc3NcIiA6IFwicmVtb3ZlQ2xhc3NcIl0oYyk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGNsYXNzZXMgPSBnZXRDbGFzc2VzKGMpO1xyXG4gICAgICByZXR1cm4gY2xhc3NlcyA/IHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBzcGFjZWROYW1lID0gXCIgXCIgKyB2LmNsYXNzTmFtZSArIFwiIFwiO1xyXG4gICAgICAgIGVhY2goY2xhc3NlcywgZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgIGlmIChoYXNDbGFzcyh2LCBjKSkge1xyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyh2LCBjKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHYsIGMsIHNwYWNlZE5hbWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KSA6IHRoaXM7XHJcbiAgICB9IH0pO1xyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgYWRkOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcclxuICAgICAgcmV0dXJuIHVuaXF1ZShjYXNoLm1lcmdlKHRoaXMsIGNhc2goc2VsZWN0b3IsIGNvbnRleHQpKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGVhY2g6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICBlYWNoKHRoaXMsIGNhbGxiYWNrKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGVxOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgcmV0dXJuIGNhc2godGhpcy5nZXQoaW5kZXgpKTtcclxuICAgIH0sXHJcblxyXG4gICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgY29tcGFyYXRvciA9IGlzRnVuY3Rpb24oc2VsZWN0b3IpID8gc2VsZWN0b3IgOiBnZXRDb21wYXJlRnVuY3Rpb24oc2VsZWN0b3IpO1xyXG5cclxuICAgICAgcmV0dXJuIGNhc2goZmlsdGVyLmNhbGwodGhpcywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICByZXR1cm4gY29tcGFyYXRvcihlLCBzZWxlY3Rvcik7XHJcbiAgICAgIH0pKTtcclxuICAgIH0sXHJcblxyXG4gICAgZmlyc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZXEoMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldDogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGluZGV4IDwgMCA/IHRoaXNbaW5kZXggKyB0aGlzLmxlbmd0aF0gOiB0aGlzW2luZGV4XTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5kZXg6IGZ1bmN0aW9uIChlbGVtKSB7XHJcbiAgICAgIHZhciBjaGlsZCA9IGVsZW0gPyBjYXNoKGVsZW0pWzBdIDogdGhpc1swXSxcclxuICAgICAgICAgIGNvbGxlY3Rpb24gPSBlbGVtID8gdGhpcyA6IGNhc2goY2hpbGQpLnBhcmVudCgpLmNoaWxkcmVuKCk7XHJcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGNvbGxlY3Rpb24pLmluZGV4T2YoY2hpbGQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsYXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmVxKC0xKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIHZhciBjYW1lbENhc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY2FtZWxSZWdleCA9IC8oPzpeXFx3fFtBLVpdfFxcYlxcdykvZyxcclxuICAgICAgICB3aGl0ZVNwYWNlID0gL1tcXHMtX10rL2c7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxSZWdleCwgZnVuY3Rpb24gKGxldHRlciwgaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gbGV0dGVyW2luZGV4ID09PSAwID8gXCJ0b0xvd2VyQ2FzZVwiIDogXCJ0b1VwcGVyQ2FzZVwiXSgpO1xyXG4gICAgICB9KS5yZXBsYWNlKHdoaXRlU3BhY2UsIFwiXCIpO1xyXG4gICAgfTtcclxuICB9KCk7XHJcblxyXG4gIHZhciBnZXRQcmVmaXhlZFByb3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY2FjaGUgPSB7fSxcclxuICAgICAgICBkb2MgPSBkb2N1bWVudCxcclxuICAgICAgICBkaXYgPSBkb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcclxuICAgICAgICBzdHlsZSA9IGRpdi5zdHlsZTtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHByb3ApIHtcclxuICAgICAgcHJvcCA9IGNhbWVsQ2FzZShwcm9wKTtcclxuICAgICAgaWYgKGNhY2hlW3Byb3BdKSB7XHJcbiAgICAgICAgcmV0dXJuIGNhY2hlW3Byb3BdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgdWNQcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSksXHJcbiAgICAgICAgICBwcmVmaXhlcyA9IFtcIndlYmtpdFwiLCBcIm1velwiLCBcIm1zXCIsIFwib1wiXSxcclxuICAgICAgICAgIHByb3BzID0gKHByb3AgKyBcIiBcIiArIHByZWZpeGVzLmpvaW4odWNQcm9wICsgXCIgXCIpICsgdWNQcm9wKS5zcGxpdChcIiBcIik7XHJcblxyXG4gICAgICBlYWNoKHByb3BzLCBmdW5jdGlvbiAocCkge1xyXG4gICAgICAgIGlmIChwIGluIHN0eWxlKSB7XHJcbiAgICAgICAgICBjYWNoZVtwXSA9IHByb3AgPSBjYWNoZVtwcm9wXSA9IHA7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBjYWNoZVtwcm9wXTtcclxuICAgIH07XHJcbiAgfSgpO1xyXG5cclxuICBjYXNoLnByZWZpeGVkUHJvcCA9IGdldFByZWZpeGVkUHJvcDtcclxuICBjYXNoLmNhbWVsQ2FzZSA9IGNhbWVsQ2FzZTtcclxuXHJcbiAgZm4uZXh0ZW5kKHtcclxuICAgIGNzczogZnVuY3Rpb24gKHByb3AsIHZhbHVlKSB7XHJcbiAgICAgIGlmIChpc1N0cmluZyhwcm9wKSkge1xyXG4gICAgICAgIHByb3AgPSBnZXRQcmVmaXhlZFByb3AocHJvcCk7XHJcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICByZXR1cm4gdi5zdHlsZVtwcm9wXSA9IHZhbHVlO1xyXG4gICAgICAgIH0pIDogd2luLmdldENvbXB1dGVkU3R5bGUodGhpc1swXSlbcHJvcF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGtleSBpbiBwcm9wKSB7XHJcbiAgICAgICAgdGhpcy5jc3Moa2V5LCBwcm9wW2tleV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNvbXB1dGUoZWwsIHByb3ApIHtcclxuICAgIHJldHVybiBwYXJzZUludCh3aW4uZ2V0Q29tcHV0ZWRTdHlsZShlbFswXSwgbnVsbClbcHJvcF0sIDEwKSB8fCAwO1xyXG4gIH1cclxuXHJcbiAgZWFjaChbXCJXaWR0aFwiLCBcIkhlaWdodFwiXSwgZnVuY3Rpb24gKHYpIHtcclxuICAgIHZhciBsb3dlciA9IHYudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICBmbltsb3dlcl0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW2xvd2VyXTtcclxuICAgIH07XHJcblxyXG4gICAgZm5bXCJpbm5lclwiICsgdl0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzWzBdW1wiY2xpZW50XCIgKyB2XTtcclxuICAgIH07XHJcblxyXG4gICAgZm5bXCJvdXRlclwiICsgdl0gPSBmdW5jdGlvbiAobWFyZ2lucykge1xyXG4gICAgICByZXR1cm4gdGhpc1swXVtcIm9mZnNldFwiICsgdl0gKyAobWFyZ2lucyA/IGNvbXB1dGUodGhpcywgXCJtYXJnaW5cIiArICh2ID09PSBcIldpZHRoXCIgPyBcIkxlZnRcIiA6IFwiVG9wXCIpKSArIGNvbXB1dGUodGhpcywgXCJtYXJnaW5cIiArICh2ID09PSBcIldpZHRoXCIgPyBcIlJpZ2h0XCIgOiBcIkJvdHRvbVwiKSkgOiAwKTtcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnQobm9kZSwgZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgdmFyIGV2ZW50Q2FjaGUgPSBnZXREYXRhKG5vZGUsIFwiX2Nhc2hFdmVudHNcIikgfHwgc2V0RGF0YShub2RlLCBcIl9jYXNoRXZlbnRzXCIsIHt9KTtcclxuICAgIGV2ZW50Q2FjaGVbZXZlbnROYW1lXSA9IGV2ZW50Q2FjaGVbZXZlbnROYW1lXSB8fCBbXTtcclxuICAgIGV2ZW50Q2FjaGVbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgIHZhciBldmVudHMgPSBnZXREYXRhKG5vZGUsIFwiX2Nhc2hFdmVudHNcIiksXHJcbiAgICAgICAgZXZlbnRDYWNoZSA9IGV2ZW50cyAmJiBldmVudHNbZXZlbnROYW1lXSxcclxuICAgICAgICBpbmRleDtcclxuXHJcbiAgICBpZiAoIWV2ZW50Q2FjaGUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XHJcbiAgICAgIGluZGV4ID0gZXZlbnRDYWNoZS5pbmRleE9mKGNhbGxiYWNrKTtcclxuICAgICAgaWYgKGluZGV4ID49IDApIHtcclxuICAgICAgICBldmVudENhY2hlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVhY2goZXZlbnRDYWNoZSwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnQpO1xyXG4gICAgICB9KTtcclxuICAgICAgZXZlbnRDYWNoZSA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm4uZXh0ZW5kKHtcclxuICAgIG9mZjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiByZW1vdmVFdmVudCh2LCBldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkZWxlZ2F0ZSwgY2FsbGJhY2ssIHJ1bk9uY2UpIHtcclxuICAgICAgLy8ganNoaW50IGlnbm9yZTpsaW5lXHJcbiAgICAgIHZhciBvcmlnaW5hbENhbGxiYWNrO1xyXG4gICAgICBpZiAoIWlzU3RyaW5nKGV2ZW50TmFtZSkpIHtcclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZXZlbnROYW1lKSB7XHJcbiAgICAgICAgICB0aGlzLm9uKGtleSwgZGVsZWdhdGUsIGV2ZW50TmFtZVtrZXldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc0Z1bmN0aW9uKGRlbGVnYXRlKSkge1xyXG4gICAgICAgIGNhbGxiYWNrID0gZGVsZWdhdGU7XHJcbiAgICAgICAgZGVsZWdhdGUgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXZlbnROYW1lID09PSBcInJlYWR5XCIpIHtcclxuICAgICAgICBvblJlYWR5KGNhbGxiYWNrKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGRlbGVnYXRlKSB7XHJcbiAgICAgICAgb3JpZ2luYWxDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgIHZhciB0ID0gZS50YXJnZXQ7XHJcbiAgICAgICAgICB3aGlsZSAoIW1hdGNoZXModCwgZGVsZWdhdGUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0ID09PSB0aGlzIHx8IHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0ID0gdC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsQ2FsbGJhY2suY2FsbCh0LCBlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIGZpbmFsQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICBpZiAocnVuT25jZSkge1xyXG4gICAgICAgICAgZmluYWxDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgcmVtb3ZlRXZlbnQodiwgZXZlbnROYW1lLCBmaW5hbENhbGxiYWNrKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlZ2lzdGVyRXZlbnQodiwgZXZlbnROYW1lLCBmaW5hbENhbGxiYWNrKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uZTogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGVsZWdhdGUsIGNhbGxiYWNrKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm9uKGV2ZW50TmFtZSwgZGVsZWdhdGUsIGNhbGxiYWNrLCB0cnVlKTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVhZHk6IG9uUmVhZHksXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNb2RpZmllZFxyXG4gICAgICogVHJpZ2dlcnMgYnJvd3NlciBldmVudFxyXG4gICAgICogQHBhcmFtIFN0cmluZyBldmVudE5hbWVcclxuICAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIEFkZCBwcm9wZXJ0aWVzIHRvIGV2ZW50IG9iamVjdFxyXG4gICAgICovXHJcbiAgICB0cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCkge1xyXG4gICAgICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgICAgIGV2dC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgZXZ0ID0gdGhpcy5leHRlbmQoZXZ0LCBkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICByZXR1cm4gdi5kaXNwYXRjaEV2ZW50KGV2dCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGVuY29kZShuYW1lLCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIFwiJlwiICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpLnJlcGxhY2UoLyUyMC9nLCBcIitcIik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWxlY3RNdWx0aXBsZV8oZWwpIHtcclxuICAgIHZhciB2YWx1ZXMgPSBbXTtcclxuICAgIGVhY2goZWwub3B0aW9ucywgZnVuY3Rpb24gKG8pIHtcclxuICAgICAgaWYgKG8uc2VsZWN0ZWQpIHtcclxuICAgICAgICB2YWx1ZXMucHVzaChvLnZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdmFsdWVzLmxlbmd0aCA/IHZhbHVlcyA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWxlY3RTaW5nbGVfKGVsKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWRJbmRleCA9IGVsLnNlbGVjdGVkSW5kZXg7XHJcbiAgICByZXR1cm4gc2VsZWN0ZWRJbmRleCA+PSAwID8gZWwub3B0aW9uc1tzZWxlY3RlZEluZGV4XS52YWx1ZSA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRWYWx1ZShlbCkge1xyXG4gICAgdmFyIHR5cGUgPSBlbC50eXBlO1xyXG4gICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0eXBlLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY2FzZSBcInNlbGVjdC1vbmVcIjpcclxuICAgICAgICByZXR1cm4gZ2V0U2VsZWN0U2luZ2xlXyhlbCk7XHJcbiAgICAgIGNhc2UgXCJzZWxlY3QtbXVsdGlwbGVcIjpcclxuICAgICAgICByZXR1cm4gZ2V0U2VsZWN0TXVsdGlwbGVfKGVsKTtcclxuICAgICAgY2FzZSBcInJhZGlvXCI6XHJcbiAgICAgICAgcmV0dXJuIGVsLmNoZWNrZWQgPyBlbC52YWx1ZSA6IG51bGw7XHJcbiAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxyXG4gICAgICAgIHJldHVybiBlbC5jaGVja2VkID8gZWwudmFsdWUgOiBudWxsO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBlbC52YWx1ZSA/IGVsLnZhbHVlIDogbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZuLmV4dGVuZCh7XHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHF1ZXJ5ID0gXCJcIjtcclxuXHJcbiAgICAgIGVhY2godGhpc1swXS5lbGVtZW50cyB8fCB0aGlzLCBmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICBpZiAoZWwuZGlzYWJsZWQgfHwgZWwudGFnTmFtZSA9PT0gXCJGSUVMRFNFVFwiKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuYW1lID0gZWwubmFtZTtcclxuICAgICAgICBzd2l0Y2ggKGVsLnR5cGUudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgY2FzZSBcImZpbGVcIjpcclxuICAgICAgICAgIGNhc2UgXCJyZXNldFwiOlxyXG4gICAgICAgICAgY2FzZSBcInN1Ym1pdFwiOlxyXG4gICAgICAgICAgY2FzZSBcImJ1dHRvblwiOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJzZWxlY3QtbXVsdGlwbGVcIjpcclxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IGdldFZhbHVlKGVsKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlcyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIGVhY2godmFsdWVzLCBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHF1ZXJ5ICs9IGVuY29kZShuYW1lLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShlbCk7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIHF1ZXJ5ICs9IGVuY29kZShuYW1lLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHF1ZXJ5LnN1YnN0cigxKTtcclxuICAgIH0sXHJcblxyXG4gICAgdmFsOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gZ2V0VmFsdWUodGhpc1swXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gdi52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGluc2VydEVsZW1lbnQoZWwsIGNoaWxkLCBwcmVwZW5kKSB7XHJcbiAgICBpZiAocHJlcGVuZCkge1xyXG4gICAgICB2YXIgZmlyc3QgPSBlbC5jaGlsZE5vZGVzWzBdO1xyXG4gICAgICBlbC5pbnNlcnRCZWZvcmUoY2hpbGQsIGZpcnN0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluc2VydENvbnRlbnQocGFyZW50LCBjaGlsZCwgcHJlcGVuZCkge1xyXG4gICAgdmFyIHN0ciA9IGlzU3RyaW5nKGNoaWxkKTtcclxuXHJcbiAgICBpZiAoIXN0ciAmJiBjaGlsZC5sZW5ndGgpIHtcclxuICAgICAgZWFjaChjaGlsZCwgZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gaW5zZXJ0Q29udGVudChwYXJlbnQsIHYsIHByZXBlbmQpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGVhY2gocGFyZW50LCBzdHIgPyBmdW5jdGlvbiAodikge1xyXG4gICAgICByZXR1cm4gdi5pbnNlcnRBZGphY2VudEhUTUwocHJlcGVuZCA/IFwiYWZ0ZXJiZWdpblwiIDogXCJiZWZvcmVlbmRcIiwgY2hpbGQpO1xyXG4gICAgfSA6IGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgIHJldHVybiBpbnNlcnRFbGVtZW50KHYsIGkgPT09IDAgPyBjaGlsZCA6IGNoaWxkLmNsb25lTm9kZSh0cnVlKSwgcHJlcGVuZCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZuLmV4dGVuZCh7XHJcbiAgICBhZnRlcjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIGNhc2goc2VsZWN0b3IpLmluc2VydEFmdGVyKHRoaXMpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgYXBwZW5kOiBmdW5jdGlvbiAoY29udGVudCkge1xyXG4gICAgICBpbnNlcnRDb250ZW50KHRoaXMsIGNvbnRlbnQpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgYXBwZW5kVG86IGZ1bmN0aW9uIChwYXJlbnQpIHtcclxuICAgICAgaW5zZXJ0Q29udGVudChjYXNoKHBhcmVudCksIHRoaXMpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgYmVmb3JlOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgY2FzaChzZWxlY3RvcikuaW5zZXJ0QmVmb3JlKHRoaXMpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIGNhc2godGhpcy5tYXAoZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gdi5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgIH0pKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5odG1sKFwiXCIpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgaHRtbDogZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuICAgICAgaWYgKGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzWzBdLmlubmVySFRNTDtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc291cmNlID0gY29udGVudC5ub2RlVHlwZSA/IGNvbnRlbnRbMF0ub3V0ZXJIVE1MIDogY29udGVudDtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiB2LmlubmVySFRNTCA9IHNvdXJjZTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAgIGNhc2goc2VsZWN0b3IpLmVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGUsXHJcbiAgICAgICAgICAgIHNpYmxpbmcgPSBlbC5uZXh0U2libGluZztcclxuICAgICAgICBfdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGkgPT09IDAgPyB2IDogdi5jbG9uZU5vZGUodHJ1ZSksIHNpYmxpbmcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcclxuICAgICAgY2FzaChzZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcclxuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcclxuICAgICAgICBfdGhpczIuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpID09PSAwID8gdiA6IHYuY2xvbmVOb2RlKHRydWUpLCBlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGVuZDogZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuICAgICAgaW5zZXJ0Q29udGVudCh0aGlzLCBjb250ZW50LCB0cnVlKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXBlbmRUbzogZnVuY3Rpb24gKHBhcmVudCkge1xyXG4gICAgICBpbnNlcnRDb250ZW50KGNhc2gocGFyZW50KSwgdGhpcywgdHJ1ZSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGlmICghIXYucGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHYucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh2KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0OiBmdW5jdGlvbiAoY29udGVudCkge1xyXG4gICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0udGV4dENvbnRlbnQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiB2LnRleHRDb250ZW50ID0gY29udGVudDtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICB2YXIgZG9jRWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgcG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGVsID0gdGhpc1swXTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBsZWZ0OiBlbC5vZmZzZXRMZWZ0LFxyXG4gICAgICAgIHRvcDogZWwub2Zmc2V0VG9wXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIG9mZnNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcmVjdCA9IHRoaXNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHdpbi5wYWdlWU9mZnNldCAtIGRvY0VsLmNsaWVudFRvcCxcclxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW4ucGFnZVhPZmZzZXQgLSBkb2NFbC5jbGllbnRMZWZ0XHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIG9mZnNldFBhcmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gY2FzaCh0aGlzWzBdLm9mZnNldFBhcmVudCk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmbi5leHRlbmQoe1xyXG4gICAgY2hpbGRyZW46IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICB2YXIgZWxlbXMgPSBbXTtcclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHB1c2guYXBwbHkoZWxlbXMsIGVsLmNoaWxkcmVuKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGVsZW1zID0gdW5pcXVlKGVsZW1zKTtcclxuXHJcbiAgICAgIHJldHVybiAhc2VsZWN0b3IgPyBlbGVtcyA6IGVsZW1zLmZpbHRlcihmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiBtYXRjaGVzKHYsIHNlbGVjdG9yKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICBpZiAoIXNlbGVjdG9yIHx8IHRoaXMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgIHJldHVybiBjYXNoKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuaXMoc2VsZWN0b3IpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKHNlbGVjdG9yKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQoKS5jbG9zZXN0KHNlbGVjdG9yKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXM6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbWF0Y2ggPSBmYWxzZSxcclxuICAgICAgICAgIGNvbXBhcmF0b3IgPSBnZXRDb21wYXJlRnVuY3Rpb24oc2VsZWN0b3IpO1xyXG5cclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIG1hdGNoID0gY29tcGFyYXRvcihlbCwgc2VsZWN0b3IpO1xyXG4gICAgICAgIHJldHVybiAhbWF0Y2g7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfSxcclxuXHJcbiAgICBmaW5kOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3RvciB8fCBzZWxlY3Rvci5ub2RlVHlwZSkge1xyXG4gICAgICAgIHJldHVybiBjYXNoKHNlbGVjdG9yICYmIHRoaXMuaGFzKHNlbGVjdG9yKS5sZW5ndGggPyBzZWxlY3RvciA6IG51bGwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZWxlbXMgPSBbXTtcclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHB1c2guYXBwbHkoZWxlbXMsIGZpbmQoc2VsZWN0b3IsIGVsKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHVuaXF1ZShlbGVtcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhhczogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIHZhciBjb21wYXJhdG9yID0gaXNTdHJpbmcoc2VsZWN0b3IpID8gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGZpbmQoc2VsZWN0b3IsIGVsKS5sZW5ndGggIT09IDA7XHJcbiAgICAgIH0gOiBmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICByZXR1cm4gZWwuY29udGFpbnMoc2VsZWN0b3IpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKGNvbXBhcmF0b3IpO1xyXG4gICAgfSxcclxuXHJcbiAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBjYXNoKHRoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nKTtcclxuICAgIH0sXHJcblxyXG4gICAgbm90OiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgY29tcGFyYXRvciA9IGdldENvbXBhcmVGdW5jdGlvbihzZWxlY3Rvcik7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5maWx0ZXIoZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuICFjb21wYXJhdG9yKGVsLCBzZWxlY3Rvcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICByZXN1bHQucHVzaChpdGVtLnBhcmVudE5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdW5pcXVlKHJlc3VsdCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcmVudHM6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICB2YXIgbGFzdCxcclxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgbGFzdCA9IGl0ZW07XHJcblxyXG4gICAgICAgIHdoaWxlIChsYXN0ICYmIGxhc3QucGFyZW50Tm9kZSAmJiBsYXN0ICE9PSBkb2MuYm9keS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICBsYXN0ID0gbGFzdC5wYXJlbnROb2RlO1xyXG5cclxuICAgICAgICAgIGlmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgJiYgbWF0Y2hlcyhsYXN0LCBzZWxlY3RvcikpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobGFzdCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB1bmlxdWUocmVzdWx0KTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJldjogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gY2FzaCh0aGlzWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaWJsaW5nczogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gdGhpcy5wYXJlbnQoKS5jaGlsZHJlbihzZWxlY3RvciksXHJcbiAgICAgICAgICBlbCA9IHRoaXNbMF07XHJcblxyXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICByZXR1cm4gaSAhPT0gZWw7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGNhc2g7XHJcbn0pO1xyXG47XHJcbnZhciBDb21wb25lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgLyoqXHJcbiAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgYWxsIGNvbXBvbmVudHNcclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgKi9cclxuICBmdW5jdGlvbiBDb21wb25lbnQoY2xhc3NEZWYsIGVsLCBvcHRpb25zKSB7XHJcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9uZW50KTtcclxuXHJcbiAgICAvLyBEaXNwbGF5IGVycm9yIGlmIGVsIGlzIHZhbGlkIEhUTUwgRWxlbWVudFxyXG4gICAgaWYgKCEoZWwgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKEVycm9yKGVsICsgJyBpcyBub3QgYW4gSFRNTCBFbGVtZW50JykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGV4aXN0cywgZGVzdHJveSBhbmQgcmVpbml0aWFsaXplIGluIGNoaWxkXHJcbiAgICB2YXIgaW5zID0gY2xhc3NEZWYuZ2V0SW5zdGFuY2UoZWwpO1xyXG4gICAgaWYgKCEhaW5zKSB7XHJcbiAgICAgIGlucy5kZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy4kZWwgPSBjYXNoKGVsKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIGNvbXBvbmVudHNcclxuICAgKiBAcGFyYW0ge2NsYXNzfSBjbGFzc0RlZlxyXG4gICAqIEBwYXJhbSB7RWxlbWVudCB8IE5vZGVMaXN0IHwgalF1ZXJ5fSBlbHNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAqL1xyXG5cclxuXHJcbiAgX2NyZWF0ZUNsYXNzKENvbXBvbmVudCwgbnVsbCwgW3tcclxuICAgIGtleTogXCJpbml0XCIsXHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChjbGFzc0RlZiwgZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHZhciBpbnN0YW5jZXMgPSBudWxsO1xyXG4gICAgICBpZiAoZWxzIGluc3RhbmNlb2YgRWxlbWVudCkge1xyXG4gICAgICAgIGluc3RhbmNlcyA9IG5ldyBjbGFzc0RlZihlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2UgaWYgKCEhZWxzICYmIChlbHMuanF1ZXJ5IHx8IGVscy5jYXNoIHx8IGVscyBpbnN0YW5jZW9mIE5vZGVMaXN0KSkge1xyXG4gICAgICAgIHZhciBpbnN0YW5jZXNBcnIgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW5zdGFuY2VzQXJyLnB1c2gobmV3IGNsYXNzRGVmKGVsc1tpXSwgb3B0aW9ucykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnN0YW5jZXMgPSBpbnN0YW5jZXNBcnI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBpbnN0YW5jZXM7XHJcbiAgICB9XHJcbiAgfV0pO1xyXG5cclxuICByZXR1cm4gQ29tcG9uZW50O1xyXG59KCk7XHJcblxyXG47IC8vIFJlcXVpcmVkIGZvciBNZXRlb3IgcGFja2FnZSwgdGhlIHVzZSBvZiB3aW5kb3cgcHJldmVudHMgZXhwb3J0IGJ5IE1ldGVvclxyXG4oZnVuY3Rpb24gKHdpbmRvdykge1xyXG4gIGlmICh3aW5kb3cuUGFja2FnZSkge1xyXG4gICAgTSA9IHt9O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB3aW5kb3cuTSA9IHt9O1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgZm9yIGpRdWVyeVxyXG4gIE0ualF1ZXJ5TG9hZGVkID0gISF3aW5kb3cualF1ZXJ5O1xyXG59KSh3aW5kb3cpO1xyXG5cclxuLy8gQU1EXHJcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICBkZWZpbmUoJ00nLCBbXSwgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIE07XHJcbiAgfSk7XHJcblxyXG4gIC8vIENvbW1vbiBKU1xyXG59IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiAhZXhwb3J0cy5ub2RlVHlwZSkge1xyXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBNO1xyXG4gIH1cclxuICBleHBvcnRzLmRlZmF1bHQgPSBNO1xyXG59XHJcblxyXG5NLnZlcnNpb24gPSAnMS4wLjAnO1xyXG5cclxuTS5rZXlzID0ge1xyXG4gIFRBQjogOSxcclxuICBFTlRFUjogMTMsXHJcbiAgRVNDOiAyNyxcclxuICBBUlJPV19VUDogMzgsXHJcbiAgQVJST1dfRE9XTjogNDBcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUYWJQcmVzcyBLZXlkb3duIGhhbmRsZXJcclxuICovXHJcbk0udGFiUHJlc3NlZCA9IGZhbHNlO1xyXG5NLmtleURvd24gPSBmYWxzZTtcclxudmFyIGRvY0hhbmRsZUtleWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG4gIE0ua2V5RG93biA9IHRydWU7XHJcbiAgaWYgKGUud2hpY2ggPT09IE0ua2V5cy5UQUIgfHwgZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX0RPV04gfHwgZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX1VQKSB7XHJcbiAgICBNLnRhYlByZXNzZWQgPSB0cnVlO1xyXG4gIH1cclxufTtcclxudmFyIGRvY0hhbmRsZUtleXVwID0gZnVuY3Rpb24gKGUpIHtcclxuICBNLmtleURvd24gPSBmYWxzZTtcclxuICBpZiAoZS53aGljaCA9PT0gTS5rZXlzLlRBQiB8fCBlLndoaWNoID09PSBNLmtleXMuQVJST1dfRE9XTiB8fCBlLndoaWNoID09PSBNLmtleXMuQVJST1dfVVApIHtcclxuICAgIE0udGFiUHJlc3NlZCA9IGZhbHNlO1xyXG4gIH1cclxufTtcclxudmFyIGRvY0hhbmRsZUZvY3VzID0gZnVuY3Rpb24gKGUpIHtcclxuICBpZiAoTS5rZXlEb3duKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2tleWJvYXJkLWZvY3VzZWQnKTtcclxuICB9XHJcbn07XHJcbnZhciBkb2NIYW5kbGVCbHVyID0gZnVuY3Rpb24gKGUpIHtcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2tleWJvYXJkLWZvY3VzZWQnKTtcclxufTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvY0hhbmRsZUtleWRvd24sIHRydWUpO1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGRvY0hhbmRsZUtleXVwLCB0cnVlKTtcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBkb2NIYW5kbGVGb2N1cywgdHJ1ZSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBkb2NIYW5kbGVCbHVyLCB0cnVlKTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIGpRdWVyeSB3cmFwcGVyIGZvciBwbHVnaW5cclxuICogQHBhcmFtIHtDbGFzc30gcGx1Z2luICBqYXZhc2NyaXB0IGNsYXNzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbHVnaW5OYW1lICBqUXVlcnkgcGx1Z2luIG5hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzUmVmICBDbGFzcyByZWZlcmVuY2UgbmFtZVxyXG4gKi9cclxuTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlciA9IGZ1bmN0aW9uIChwbHVnaW4sIHBsdWdpbk5hbWUsIGNsYXNzUmVmKSB7XHJcbiAgalF1ZXJ5LmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24gKG1ldGhvZE9yT3B0aW9ucykge1xyXG4gICAgLy8gQ2FsbCBwbHVnaW4gbWV0aG9kIGlmIHZhbGlkIG1ldGhvZCBuYW1lIGlzIHBhc3NlZCBpblxyXG4gICAgaWYgKHBsdWdpbi5wcm90b3R5cGVbbWV0aG9kT3JPcHRpb25zXSkge1xyXG4gICAgICB2YXIgcGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuXHJcbiAgICAgIC8vIEdldHRlciBtZXRob2RzXHJcbiAgICAgIGlmIChtZXRob2RPck9wdGlvbnMuc2xpY2UoMCwgMykgPT09ICdnZXQnKSB7XHJcbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpcy5maXJzdCgpWzBdW2NsYXNzUmVmXTtcclxuICAgICAgICByZXR1cm4gaW5zdGFuY2VbbWV0aG9kT3JPcHRpb25zXS5hcHBseShpbnN0YW5jZSwgcGFyYW1zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVm9pZCBtZXRob2RzXHJcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXNbY2xhc3NSZWZdO1xyXG4gICAgICAgIGluc3RhbmNlW21ldGhvZE9yT3B0aW9uc10uYXBwbHkoaW5zdGFuY2UsIHBhcmFtcyk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSBwbHVnaW4gaWYgb3B0aW9ucyBvciBubyBhcmd1bWVudCBpcyBwYXNzZWQgaW5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZE9yT3B0aW9ucyA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZE9yT3B0aW9ucykge1xyXG4gICAgICBwbHVnaW4uaW5pdCh0aGlzLCBhcmd1bWVudHNbMF0pO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gZXJyb3IgaWYgYW4gdW5yZWNvZ25pemVkICBtZXRob2QgbmFtZSBpcyBwYXNzZWQgaW5cclxuICAgIGpRdWVyeS5lcnJvcihcIk1ldGhvZCBcIiArIG1ldGhvZE9yT3B0aW9ucyArIFwiIGRvZXMgbm90IGV4aXN0IG9uIGpRdWVyeS5cIiArIHBsdWdpbk5hbWUpO1xyXG4gIH07XHJcbn07XHJcblxyXG4vKipcclxuICogQXV0b21hdGljYWxseSBpbml0aWFsaXplIGNvbXBvbmVudHNcclxuICogQHBhcmFtIHtFbGVtZW50fSBjb250ZXh0ICBET00gRWxlbWVudCB0byBzZWFyY2ggd2l0aGluIGZvciBjb21wb25lbnRzXHJcbiAqL1xyXG5NLkF1dG9Jbml0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAvLyBVc2UgZG9jdW1lbnQuYm9keSBpZiBubyBjb250ZXh0IGlzIGdpdmVuXHJcbiAgdmFyIHJvb3QgPSAhIWNvbnRleHQgPyBjb250ZXh0IDogZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgdmFyIHJlZ2lzdHJ5ID0ge1xyXG4gICAgQXV0b2NvbXBsZXRlOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGU6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIENhcm91c2VsOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbDpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgQ2hpcHM6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmNoaXBzOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBDb2xsYXBzaWJsZTogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuY29sbGFwc2libGU6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIERhdGVwaWNrZXI6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLmRhdGVwaWNrZXI6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIERyb3Bkb3duOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kcm9wZG93bi10cmlnZ2VyOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBNYXRlcmlhbGJveDogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcubWF0ZXJpYWxib3hlZDpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgTW9kYWw6IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLm1vZGFsOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBQYXJhbGxheDogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcucGFyYWxsYXg6bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIFB1c2hwaW46IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLnB1c2hwaW46bm90KC5uby1hdXRvaW5pdCknKSxcclxuICAgIFNjcm9sbFNweTogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuc2Nyb2xsc3B5Om5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBGb3JtU2VsZWN0OiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NlbGVjdDpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgU2lkZW5hdjogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuc2lkZW5hdjpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgVGFiczogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcudGFiczpub3QoLm5vLWF1dG9pbml0KScpLFxyXG4gICAgVGFwVGFyZ2V0OiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YXAtdGFyZ2V0Om5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBUaW1lcGlja2VyOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy50aW1lcGlja2VyOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBUb29sdGlwOiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b29sdGlwcGVkOm5vdCgubm8tYXV0b2luaXQpJyksXHJcbiAgICBGbG9hdGluZ0FjdGlvbkJ1dHRvbjogcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZml4ZWQtYWN0aW9uLWJ0bjpub3QoLm5vLWF1dG9pbml0KScpXHJcbiAgfTtcclxuXHJcbiAgZm9yICh2YXIgcGx1Z2luTmFtZSBpbiByZWdpc3RyeSkge1xyXG4gICAgdmFyIHBsdWdpbiA9IE1bcGx1Z2luTmFtZV07XHJcbiAgICBwbHVnaW4uaW5pdChyZWdpc3RyeVtwbHVnaW5OYW1lXSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGFwcHJveGltYXRlZCBzZWxlY3RvciBzdHJpbmcgZm9yIGEgalF1ZXJ5IG9iamVjdFxyXG4gKiBAcGFyYW0ge2pRdWVyeX0gb2JqICBqUXVlcnkgb2JqZWN0IHRvIGJlIHBhcnNlZFxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuTS5vYmplY3RTZWxlY3RvclN0cmluZyA9IGZ1bmN0aW9uIChvYmopIHtcclxuICB2YXIgdGFnU3RyID0gb2JqLnByb3AoJ3RhZ05hbWUnKSB8fCAnJztcclxuICB2YXIgaWRTdHIgPSBvYmouYXR0cignaWQnKSB8fCAnJztcclxuICB2YXIgY2xhc3NTdHIgPSBvYmouYXR0cignY2xhc3MnKSB8fCAnJztcclxuICByZXR1cm4gKHRhZ1N0ciArIGlkU3RyICsgY2xhc3NTdHIpLnJlcGxhY2UoL1xccy9nLCAnJyk7XHJcbn07XHJcblxyXG4vLyBVbmlxdWUgUmFuZG9tIElEXHJcbk0uZ3VpZCA9IGZ1bmN0aW9uICgpIHtcclxuICBmdW5jdGlvbiBzNCgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG4gIH1cclxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xyXG4gIH07XHJcbn0oKTtcclxuXHJcbi8qKlxyXG4gKiBFc2NhcGVzIGhhc2ggZnJvbSBzcGVjaWFsIGNoYXJhY3RlcnNcclxuICogQHBhcmFtIHtzdHJpbmd9IGhhc2ggIFN0cmluZyByZXR1cm5lZCBmcm9tIHRoaXMuaGFzaFxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuTS5lc2NhcGVIYXNoID0gZnVuY3Rpb24gKGhhc2gpIHtcclxuICByZXR1cm4gaGFzaC5yZXBsYWNlKC8oOnxcXC58XFxbfFxcXXwsfD18XFwvKS9nLCAnXFxcXCQxJyk7XHJcbn07XHJcblxyXG5NLmVsZW1lbnRPclBhcmVudElzRml4ZWQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgdmFyICRjaGVja0VsZW1lbnRzID0gJGVsZW1lbnQuYWRkKCRlbGVtZW50LnBhcmVudHMoKSk7XHJcbiAgdmFyIGlzRml4ZWQgPSBmYWxzZTtcclxuICAkY2hlY2tFbGVtZW50cy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICgkKHRoaXMpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICBpc0ZpeGVkID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHJldHVybiBpc0ZpeGVkO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEVkZ2VzXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gdG9wICBJZiB0aGUgdG9wIGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gcmlnaHQgIElmIHRoZSByaWdodCBlZGdlIHdhcyBleGNlZWRlZFxyXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IGJvdHRvbSAgSWYgdGhlIGJvdHRvbSBlZGdlIHdhcyBleGNlZWRlZFxyXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IGxlZnQgIElmIHRoZSBsZWZ0IGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEJvdW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZWZ0ICBsZWZ0IG9mZnNldCBjb29yZGluYXRlXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSB0b3AgIHRvcCBvZmZzZXQgY29vcmRpbmF0ZVxyXG4gKiBAcHJvcGVydHkge051bWJlcn0gd2lkdGhcclxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGhlaWdodFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBFc2NhcGVzIGhhc2ggZnJvbSBzcGVjaWFsIGNoYXJhY3RlcnNcclxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgIENvbnRhaW5lciBlbGVtZW50IHRoYXQgYWN0cyBhcyB0aGUgYm91bmRhcnlcclxuICogQHBhcmFtIHtCb3VuZGluZ30gYm91bmRpbmcgIGVsZW1lbnQgYm91bmRpbmcgdGhhdCBpcyBiZWluZyBjaGVja2VkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgIG9mZnNldCBmcm9tIGVkZ2UgdGhhdCBjb3VudHMgYXMgZXhjZWVkaW5nXHJcbiAqIEByZXR1cm5zIHtFZGdlc31cclxuICovXHJcbk0uY2hlY2tXaXRoaW5Db250YWluZXIgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBib3VuZGluZywgb2Zmc2V0KSB7XHJcbiAgdmFyIGVkZ2VzID0ge1xyXG4gICAgdG9wOiBmYWxzZSxcclxuICAgIHJpZ2h0OiBmYWxzZSxcclxuICAgIGJvdHRvbTogZmFsc2UsXHJcbiAgICBsZWZ0OiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIHZhciBjb250YWluZXJSZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIC8vIElmIGJvZHkgZWxlbWVudCBpcyBzbWFsbGVyIHRoYW4gdmlld3BvcnQsIHVzZSB2aWV3cG9ydCBoZWlnaHQgaW5zdGVhZC5cclxuICB2YXIgY29udGFpbmVyQm90dG9tID0gY29udGFpbmVyID09PSBkb2N1bWVudC5ib2R5ID8gTWF0aC5tYXgoY29udGFpbmVyUmVjdC5ib3R0b20sIHdpbmRvdy5pbm5lckhlaWdodCkgOiBjb250YWluZXJSZWN0LmJvdHRvbTtcclxuXHJcbiAgdmFyIHNjcm9sbExlZnQgPSBjb250YWluZXIuc2Nyb2xsTGVmdDtcclxuICB2YXIgc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbFRvcDtcclxuXHJcbiAgdmFyIHNjcm9sbGVkWCA9IGJvdW5kaW5nLmxlZnQgLSBzY3JvbGxMZWZ0O1xyXG4gIHZhciBzY3JvbGxlZFkgPSBib3VuZGluZy50b3AgLSBzY3JvbGxUb3A7XHJcblxyXG4gIC8vIENoZWNrIGZvciBjb250YWluZXIgYW5kIHZpZXdwb3J0IGZvciBlYWNoIGVkZ2VcclxuICBpZiAoc2Nyb2xsZWRYIDwgY29udGFpbmVyUmVjdC5sZWZ0ICsgb2Zmc2V0IHx8IHNjcm9sbGVkWCA8IG9mZnNldCkge1xyXG4gICAgZWRnZXMubGVmdCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBpZiAoc2Nyb2xsZWRYICsgYm91bmRpbmcud2lkdGggPiBjb250YWluZXJSZWN0LnJpZ2h0IC0gb2Zmc2V0IHx8IHNjcm9sbGVkWCArIGJvdW5kaW5nLndpZHRoID4gd2luZG93LmlubmVyV2lkdGggLSBvZmZzZXQpIHtcclxuICAgIGVkZ2VzLnJpZ2h0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGlmIChzY3JvbGxlZFkgPCBjb250YWluZXJSZWN0LnRvcCArIG9mZnNldCB8fCBzY3JvbGxlZFkgPCBvZmZzZXQpIHtcclxuICAgIGVkZ2VzLnRvcCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBpZiAoc2Nyb2xsZWRZICsgYm91bmRpbmcuaGVpZ2h0ID4gY29udGFpbmVyQm90dG9tIC0gb2Zmc2V0IHx8IHNjcm9sbGVkWSArIGJvdW5kaW5nLmhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCAtIG9mZnNldCkge1xyXG4gICAgZWRnZXMuYm90dG9tID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBlZGdlcztcclxufTtcclxuXHJcbk0uY2hlY2tQb3NzaWJsZUFsaWdubWVudHMgPSBmdW5jdGlvbiAoZWwsIGNvbnRhaW5lciwgYm91bmRpbmcsIG9mZnNldCkge1xyXG4gIHZhciBjYW5BbGlnbiA9IHtcclxuICAgIHRvcDogdHJ1ZSxcclxuICAgIHJpZ2h0OiB0cnVlLFxyXG4gICAgYm90dG9tOiB0cnVlLFxyXG4gICAgbGVmdDogdHJ1ZSxcclxuICAgIHNwYWNlT25Ub3A6IG51bGwsXHJcbiAgICBzcGFjZU9uUmlnaHQ6IG51bGwsXHJcbiAgICBzcGFjZU9uQm90dG9tOiBudWxsLFxyXG4gICAgc3BhY2VPbkxlZnQ6IG51bGxcclxuICB9O1xyXG5cclxuICB2YXIgY29udGFpbmVyQWxsb3dzT3ZlcmZsb3cgPSBnZXRDb21wdXRlZFN0eWxlKGNvbnRhaW5lcikub3ZlcmZsb3cgPT09ICd2aXNpYmxlJztcclxuICB2YXIgY29udGFpbmVyUmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICB2YXIgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5taW4oY29udGFpbmVyUmVjdC5oZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgdmFyIGNvbnRhaW5lcldpZHRoID0gTWF0aC5taW4oY29udGFpbmVyUmVjdC53aWR0aCwgd2luZG93LmlubmVyV2lkdGgpO1xyXG4gIHZhciBlbE9mZnNldFJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgdmFyIHNjcm9sbExlZnQgPSBjb250YWluZXIuc2Nyb2xsTGVmdDtcclxuICB2YXIgc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbFRvcDtcclxuXHJcbiAgdmFyIHNjcm9sbGVkWCA9IGJvdW5kaW5nLmxlZnQgLSBzY3JvbGxMZWZ0O1xyXG4gIHZhciBzY3JvbGxlZFlUb3BFZGdlID0gYm91bmRpbmcudG9wIC0gc2Nyb2xsVG9wO1xyXG4gIHZhciBzY3JvbGxlZFlCb3R0b21FZGdlID0gYm91bmRpbmcudG9wICsgZWxPZmZzZXRSZWN0LmhlaWdodCAtIHNjcm9sbFRvcDtcclxuXHJcbiAgLy8gQ2hlY2sgZm9yIGNvbnRhaW5lciBhbmQgdmlld3BvcnQgZm9yIGxlZnRcclxuICBjYW5BbGlnbi5zcGFjZU9uUmlnaHQgPSAhY29udGFpbmVyQWxsb3dzT3ZlcmZsb3cgPyBjb250YWluZXJXaWR0aCAtIChzY3JvbGxlZFggKyBib3VuZGluZy53aWR0aCkgOiB3aW5kb3cuaW5uZXJXaWR0aCAtIChlbE9mZnNldFJlY3QubGVmdCArIGJvdW5kaW5nLndpZHRoKTtcclxuICBpZiAoY2FuQWxpZ24uc3BhY2VPblJpZ2h0IDwgMCkge1xyXG4gICAgY2FuQWxpZ24ubGVmdCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgZm9yIGNvbnRhaW5lciBhbmQgdmlld3BvcnQgZm9yIFJpZ2h0XHJcbiAgY2FuQWxpZ24uc3BhY2VPbkxlZnQgPSAhY29udGFpbmVyQWxsb3dzT3ZlcmZsb3cgPyBzY3JvbGxlZFggLSBib3VuZGluZy53aWR0aCArIGVsT2Zmc2V0UmVjdC53aWR0aCA6IGVsT2Zmc2V0UmVjdC5yaWdodCAtIGJvdW5kaW5nLndpZHRoO1xyXG4gIGlmIChjYW5BbGlnbi5zcGFjZU9uTGVmdCA8IDApIHtcclxuICAgIGNhbkFsaWduLnJpZ2h0ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBmb3IgY29udGFpbmVyIGFuZCB2aWV3cG9ydCBmb3IgVG9wXHJcbiAgY2FuQWxpZ24uc3BhY2VPbkJvdHRvbSA9ICFjb250YWluZXJBbGxvd3NPdmVyZmxvdyA/IGNvbnRhaW5lckhlaWdodCAtIChzY3JvbGxlZFlUb3BFZGdlICsgYm91bmRpbmcuaGVpZ2h0ICsgb2Zmc2V0KSA6IHdpbmRvdy5pbm5lckhlaWdodCAtIChlbE9mZnNldFJlY3QudG9wICsgYm91bmRpbmcuaGVpZ2h0ICsgb2Zmc2V0KTtcclxuICBpZiAoY2FuQWxpZ24uc3BhY2VPbkJvdHRvbSA8IDApIHtcclxuICAgIGNhbkFsaWduLnRvcCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgZm9yIGNvbnRhaW5lciBhbmQgdmlld3BvcnQgZm9yIEJvdHRvbVxyXG4gIGNhbkFsaWduLnNwYWNlT25Ub3AgPSAhY29udGFpbmVyQWxsb3dzT3ZlcmZsb3cgPyBzY3JvbGxlZFlCb3R0b21FZGdlIC0gKGJvdW5kaW5nLmhlaWdodCAtIG9mZnNldCkgOiBlbE9mZnNldFJlY3QuYm90dG9tIC0gKGJvdW5kaW5nLmhlaWdodCArIG9mZnNldCk7XHJcbiAgaWYgKGNhbkFsaWduLnNwYWNlT25Ub3AgPCAwKSB7XHJcbiAgICBjYW5BbGlnbi5ib3R0b20gPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjYW5BbGlnbjtcclxufTtcclxuXHJcbk0uZ2V0T3ZlcmZsb3dQYXJlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gIGlmIChlbGVtZW50ID09IG51bGwpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkgfHwgZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5vdmVyZmxvdyAhPT0gJ3Zpc2libGUnKSB7XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxuICB9XHJcblxyXG4gIHJldHVybiBNLmdldE92ZXJmbG93UGFyZW50KGVsZW1lbnQucGFyZW50RWxlbWVudCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0cyBpZCBvZiBjb21wb25lbnQgZnJvbSBhIHRyaWdnZXJcclxuICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyICB0cmlnZ2VyXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5NLmdldElkRnJvbVRyaWdnZXIgPSBmdW5jdGlvbiAodHJpZ2dlcikge1xyXG4gIHZhciBpZCA9IHRyaWdnZXIuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpO1xyXG4gIGlmICghaWQpIHtcclxuICAgIGlkID0gdHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgIGlmIChpZCkge1xyXG4gICAgICBpZCA9IGlkLnNsaWNlKDEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWQgPSAnJztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGlkO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE11bHRpIGJyb3dzZXIgc3VwcG9ydCBmb3IgZG9jdW1lbnQgc2Nyb2xsIHRvcFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxyXG4gKi9cclxuTS5nZXREb2N1bWVudFNjcm9sbFRvcCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNdWx0aSBicm93c2VyIHN1cHBvcnQgZm9yIGRvY3VtZW50IHNjcm9sbCBsZWZ0XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XHJcbiAqL1xyXG5NLmdldERvY3VtZW50U2Nyb2xsTGVmdCA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCB8fCAwO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEVkZ2VzXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gdG9wICBJZiB0aGUgdG9wIGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gcmlnaHQgIElmIHRoZSByaWdodCBlZGdlIHdhcyBleGNlZWRlZFxyXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IGJvdHRvbSAgSWYgdGhlIGJvdHRvbSBlZGdlIHdhcyBleGNlZWRlZFxyXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IGxlZnQgIElmIHRoZSBsZWZ0IGVkZ2Ugd2FzIGV4Y2VlZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEJvdW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZWZ0ICBsZWZ0IG9mZnNldCBjb29yZGluYXRlXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSB0b3AgIHRvcCBvZmZzZXQgY29vcmRpbmF0ZVxyXG4gKiBAcHJvcGVydHkge051bWJlcn0gd2lkdGhcclxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGhlaWdodFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGltZSBpbiBtc1xyXG4gKiBAbGljZW5zZSBodHRwczovL3Jhdy5naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL21hc3Rlci9MSUNFTlNFXHJcbiAqIEB0eXBlIHtmdW5jdGlvbn1cclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxudmFyIGdldFRpbWUgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxyXG4gKiBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cclxuICogYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xyXG4gKiBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xyXG4gKiBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cclxuICogQGxpY2Vuc2UgaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9tYXN0ZXIvTElDRU5TRVxyXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0XHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9uc1xyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAqL1xyXG5NLnRocm90dGxlID0gZnVuY3Rpb24gKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcclxuICB2YXIgY29udGV4dCA9IHZvaWQgMCxcclxuICAgICAgYXJncyA9IHZvaWQgMCxcclxuICAgICAgcmVzdWx0ID0gdm9pZCAwO1xyXG4gIHZhciB0aW1lb3V0ID0gbnVsbDtcclxuICB2YXIgcHJldmlvdXMgPSAwO1xyXG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XHJcbiAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IGdldFRpbWUoKTtcclxuICAgIHRpbWVvdXQgPSBudWxsO1xyXG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcclxuICB9O1xyXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbm93ID0gZ2V0VGltZSgpO1xyXG4gICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcclxuICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcclxuICAgIGNvbnRleHQgPSB0aGlzO1xyXG4gICAgYXJncyA9IGFyZ3VtZW50cztcclxuICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xyXG4gICAgICBwcmV2aW91cyA9IG5vdztcclxuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xyXG4gICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xyXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxufTtcclxuOyAvKlxyXG4gIHYyLjIuMFxyXG4gIDIwMTcgSnVsaWFuIEdhcm5pZXJcclxuICBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICAqL1xyXG52YXIgJGpzY29tcCA9IHsgc2NvcGU6IHt9IH07JGpzY29tcC5kZWZpbmVQcm9wZXJ0eSA9IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiAoZSwgciwgcCkge1xyXG4gIGlmIChwLmdldCB8fCBwLnNldCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkVTMyBkb2VzIG5vdCBzdXBwb3J0IGdldHRlcnMgYW5kIHNldHRlcnMuXCIpO2UgIT0gQXJyYXkucHJvdG90eXBlICYmIGUgIT0gT2JqZWN0LnByb3RvdHlwZSAmJiAoZVtyXSA9IHAudmFsdWUpO1xyXG59OyRqc2NvbXAuZ2V0R2xvYmFsID0gZnVuY3Rpb24gKGUpIHtcclxuICByZXR1cm4gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygd2luZG93ICYmIHdpbmRvdyA9PT0gZSA/IGUgOiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBnbG9iYWwgJiYgbnVsbCAhPSBnbG9iYWwgPyBnbG9iYWwgOiBlO1xyXG59OyRqc2NvbXAuZ2xvYmFsID0gJGpzY29tcC5nZXRHbG9iYWwodGhpcyk7JGpzY29tcC5TWU1CT0xfUFJFRklYID0gXCJqc2NvbXBfc3ltYm9sX1wiO1xyXG4kanNjb21wLmluaXRTeW1ib2wgPSBmdW5jdGlvbiAoKSB7XHJcbiAgJGpzY29tcC5pbml0U3ltYm9sID0gZnVuY3Rpb24gKCkge307JGpzY29tcC5nbG9iYWwuU3ltYm9sIHx8ICgkanNjb21wLmdsb2JhbC5TeW1ib2wgPSAkanNjb21wLlN5bWJvbCk7XHJcbn07JGpzY29tcC5zeW1ib2xDb3VudGVyXyA9IDA7JGpzY29tcC5TeW1ib2wgPSBmdW5jdGlvbiAoZSkge1xyXG4gIHJldHVybiAkanNjb21wLlNZTUJPTF9QUkVGSVggKyAoZSB8fCBcIlwiKSArICRqc2NvbXAuc3ltYm9sQ291bnRlcl8rKztcclxufTtcclxuJGpzY29tcC5pbml0U3ltYm9sSXRlcmF0b3IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgJGpzY29tcC5pbml0U3ltYm9sKCk7dmFyIGUgPSAkanNjb21wLmdsb2JhbC5TeW1ib2wuaXRlcmF0b3I7ZSB8fCAoZSA9ICRqc2NvbXAuZ2xvYmFsLlN5bWJvbC5pdGVyYXRvciA9ICRqc2NvbXAuZ2xvYmFsLlN5bWJvbChcIml0ZXJhdG9yXCIpKTtcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIEFycmF5LnByb3RvdHlwZVtlXSAmJiAkanNjb21wLmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgZSwgeyBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAsIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiAkanNjb21wLmFycmF5SXRlcmF0b3IodGhpcyk7XHJcbiAgICB9IH0pOyRqc2NvbXAuaW5pdFN5bWJvbEl0ZXJhdG9yID0gZnVuY3Rpb24gKCkge307XHJcbn07JGpzY29tcC5hcnJheUl0ZXJhdG9yID0gZnVuY3Rpb24gKGUpIHtcclxuICB2YXIgciA9IDA7cmV0dXJuICRqc2NvbXAuaXRlcmF0b3JQcm90b3R5cGUoZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHIgPCBlLmxlbmd0aCA/IHsgZG9uZTogITEsIHZhbHVlOiBlW3IrK10gfSA6IHsgZG9uZTogITAgfTtcclxuICB9KTtcclxufTtcclxuJGpzY29tcC5pdGVyYXRvclByb3RvdHlwZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgJGpzY29tcC5pbml0U3ltYm9sSXRlcmF0b3IoKTtlID0geyBuZXh0OiBlIH07ZVskanNjb21wLmdsb2JhbC5TeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtyZXR1cm4gZTtcclxufTskanNjb21wLmFycmF5ID0gJGpzY29tcC5hcnJheSB8fCB7fTskanNjb21wLml0ZXJhdG9yRnJvbUFycmF5ID0gZnVuY3Rpb24gKGUsIHIpIHtcclxuICAkanNjb21wLmluaXRTeW1ib2xJdGVyYXRvcigpO2UgaW5zdGFuY2VvZiBTdHJpbmcgJiYgKGUgKz0gXCJcIik7dmFyIHAgPSAwLFxyXG4gICAgICBtID0geyBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChwIDwgZS5sZW5ndGgpIHtcclxuICAgICAgICB2YXIgdSA9IHArKztyZXR1cm4geyB2YWx1ZTogcih1LCBlW3VdKSwgZG9uZTogITEgfTtcclxuICAgICAgfW0ubmV4dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4geyBkb25lOiAhMCwgdmFsdWU6IHZvaWQgMCB9O1xyXG4gICAgICB9O3JldHVybiBtLm5leHQoKTtcclxuICAgIH0gfTttW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gbTtcclxuICB9O3JldHVybiBtO1xyXG59O1xyXG4kanNjb21wLnBvbHlmaWxsID0gZnVuY3Rpb24gKGUsIHIsIHAsIG0pIHtcclxuICBpZiAocikge1xyXG4gICAgcCA9ICRqc2NvbXAuZ2xvYmFsO2UgPSBlLnNwbGl0KFwiLlwiKTtmb3IgKG0gPSAwOyBtIDwgZS5sZW5ndGggLSAxOyBtKyspIHtcclxuICAgICAgdmFyIHUgPSBlW21dO3UgaW4gcCB8fCAocFt1XSA9IHt9KTtwID0gcFt1XTtcclxuICAgIH1lID0gZVtlLmxlbmd0aCAtIDFdO20gPSBwW2VdO3IgPSByKG0pO3IgIT0gbSAmJiBudWxsICE9IHIgJiYgJGpzY29tcC5kZWZpbmVQcm9wZXJ0eShwLCBlLCB7IGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCwgdmFsdWU6IHIgfSk7XHJcbiAgfVxyXG59OyRqc2NvbXAucG9seWZpbGwoXCJBcnJheS5wcm90b3R5cGUua2V5c1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gIHJldHVybiBlID8gZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAkanNjb21wLml0ZXJhdG9yRnJvbUFycmF5KHRoaXMsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHJldHVybiBlO1xyXG4gICAgfSk7XHJcbiAgfTtcclxufSwgXCJlczYtaW1wbFwiLCBcImVzM1wiKTt2YXIgJGpzY29tcCR0aGlzID0gdGhpcztcclxuKGZ1bmN0aW9uIChyKSB7XHJcbiAgTS5hbmltZSA9IHIoKTtcclxufSkoZnVuY3Rpb24gKCkge1xyXG4gIGZ1bmN0aW9uIGUoYSkge1xyXG4gICAgaWYgKCFoLmNvbChhKSkgdHJ5IHtcclxuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYSk7XHJcbiAgICB9IGNhdGNoIChjKSB7fVxyXG4gIH1mdW5jdGlvbiByKGEsIGMpIHtcclxuICAgIGZvciAodmFyIGQgPSBhLmxlbmd0aCwgYiA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMCwgZiA9IFtdLCBuID0gMDsgbiA8IGQ7IG4rKykge1xyXG4gICAgICBpZiAobiBpbiBhKSB7XHJcbiAgICAgICAgdmFyIGsgPSBhW25dO2MuY2FsbChiLCBrLCBuLCBhKSAmJiBmLnB1c2goayk7XHJcbiAgICAgIH1cclxuICAgIH1yZXR1cm4gZjtcclxuICB9ZnVuY3Rpb24gcChhKSB7XHJcbiAgICByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKGEsIGQpIHtcclxuICAgICAgcmV0dXJuIGEuY29uY2F0KGguYXJyKGQpID8gcChkKSA6IGQpO1xyXG4gICAgfSwgW10pO1xyXG4gIH1mdW5jdGlvbiBtKGEpIHtcclxuICAgIGlmIChoLmFycihhKSkgcmV0dXJuIGE7XHJcbiAgICBoLnN0cihhKSAmJiAoYSA9IGUoYSkgfHwgYSk7cmV0dXJuIGEgaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBhIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24gPyBbXS5zbGljZS5jYWxsKGEpIDogW2FdO1xyXG4gIH1mdW5jdGlvbiB1KGEsIGMpIHtcclxuICAgIHJldHVybiBhLnNvbWUoZnVuY3Rpb24gKGEpIHtcclxuICAgICAgcmV0dXJuIGEgPT09IGM7XHJcbiAgICB9KTtcclxuICB9ZnVuY3Rpb24gQyhhKSB7XHJcbiAgICB2YXIgYyA9IHt9LFxyXG4gICAgICAgIGQ7Zm9yIChkIGluIGEpIHtcclxuICAgICAgY1tkXSA9IGFbZF07XHJcbiAgICB9cmV0dXJuIGM7XHJcbiAgfWZ1bmN0aW9uIEQoYSwgYykge1xyXG4gICAgdmFyIGQgPSBDKGEpLFxyXG4gICAgICAgIGI7Zm9yIChiIGluIGEpIHtcclxuICAgICAgZFtiXSA9IGMuaGFzT3duUHJvcGVydHkoYikgPyBjW2JdIDogYVtiXTtcclxuICAgIH1yZXR1cm4gZDtcclxuICB9ZnVuY3Rpb24geihhLCBjKSB7XHJcbiAgICB2YXIgZCA9IEMoYSksXHJcbiAgICAgICAgYjtmb3IgKGIgaW4gYykge1xyXG4gICAgICBkW2JdID0gaC51bmQoYVtiXSkgPyBjW2JdIDogYVtiXTtcclxuICAgIH1yZXR1cm4gZDtcclxuICB9ZnVuY3Rpb24gVChhKSB7XHJcbiAgICBhID0gYS5yZXBsYWNlKC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2ksIGZ1bmN0aW9uIChhLCBjLCBkLCBrKSB7XHJcbiAgICAgIHJldHVybiBjICsgYyArIGQgKyBkICsgayArIGs7XHJcbiAgICB9KTt2YXIgYyA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhhKTtcclxuICAgIGEgPSBwYXJzZUludChjWzFdLCAxNik7dmFyIGQgPSBwYXJzZUludChjWzJdLCAxNiksXHJcbiAgICAgICAgYyA9IHBhcnNlSW50KGNbM10sIDE2KTtyZXR1cm4gXCJyZ2JhKFwiICsgYSArIFwiLFwiICsgZCArIFwiLFwiICsgYyArIFwiLDEpXCI7XHJcbiAgfWZ1bmN0aW9uIFUoYSkge1xyXG4gICAgZnVuY3Rpb24gYyhhLCBjLCBiKSB7XHJcbiAgICAgIDAgPiBiICYmIChiICs9IDEpOzEgPCBiICYmIC0tYjtyZXR1cm4gYiA8IDEgLyA2ID8gYSArIDYgKiAoYyAtIGEpICogYiA6IC41ID4gYiA/IGMgOiBiIDwgMiAvIDMgPyBhICsgKGMgLSBhKSAqICgyIC8gMyAtIGIpICogNiA6IGE7XHJcbiAgICB9dmFyIGQgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhhKSB8fCAvaHNsYVxcKChcXGQrKSxcXHMqKFtcXGQuXSspJSxcXHMqKFtcXGQuXSspJSxcXHMqKFtcXGQuXSspXFwpL2cuZXhlYyhhKTthID0gcGFyc2VJbnQoZFsxXSkgLyAzNjA7dmFyIGIgPSBwYXJzZUludChkWzJdKSAvIDEwMCxcclxuICAgICAgICBmID0gcGFyc2VJbnQoZFszXSkgLyAxMDAsXHJcbiAgICAgICAgZCA9IGRbNF0gfHwgMTtpZiAoMCA9PSBiKSBmID0gYiA9IGEgPSBmO2Vsc2Uge1xyXG4gICAgICB2YXIgbiA9IC41ID4gZiA/IGYgKiAoMSArIGIpIDogZiArIGIgLSBmICogYixcclxuICAgICAgICAgIGsgPSAyICogZiAtIG4sXHJcbiAgICAgICAgICBmID0gYyhrLCBuLCBhICsgMSAvIDMpLFxyXG4gICAgICAgICAgYiA9IGMoaywgbiwgYSk7YSA9IGMoaywgbiwgYSAtIDEgLyAzKTtcclxuICAgIH1yZXR1cm4gXCJyZ2JhKFwiICsgMjU1ICogZiArIFwiLFwiICsgMjU1ICogYiArIFwiLFwiICsgMjU1ICogYSArIFwiLFwiICsgZCArIFwiKVwiO1xyXG4gIH1mdW5jdGlvbiB5KGEpIHtcclxuICAgIGlmIChhID0gLyhbXFwrXFwtXT9bMC05I1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxjaHxwY3x2d3x2aHx2bWlufHZtYXh8ZGVnfHJhZHx0dXJuKT8kLy5leGVjKGEpKSByZXR1cm4gYVsyXTtcclxuICB9ZnVuY3Rpb24gVihhKSB7XHJcbiAgICBpZiAoLTEgPCBhLmluZGV4T2YoXCJ0cmFuc2xhdGVcIikgfHwgXCJwZXJzcGVjdGl2ZVwiID09PSBhKSByZXR1cm4gXCJweFwiO2lmICgtMSA8IGEuaW5kZXhPZihcInJvdGF0ZVwiKSB8fCAtMSA8IGEuaW5kZXhPZihcInNrZXdcIikpIHJldHVybiBcImRlZ1wiO1xyXG4gIH1mdW5jdGlvbiBJKGEsIGMpIHtcclxuICAgIHJldHVybiBoLmZuYyhhKSA/IGEoYy50YXJnZXQsIGMuaWQsIGMudG90YWwpIDogYTtcclxuICB9ZnVuY3Rpb24gRShhLCBjKSB7XHJcbiAgICBpZiAoYyBpbiBhLnN0eWxlKSByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZShhKS5nZXRQcm9wZXJ0eVZhbHVlKGMucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgXCIkMS0kMlwiKS50b0xvd2VyQ2FzZSgpKSB8fCBcIjBcIjtcclxuICB9ZnVuY3Rpb24gSihhLCBjKSB7XHJcbiAgICBpZiAoaC5kb20oYSkgJiYgdShXLCBjKSkgcmV0dXJuIFwidHJhbnNmb3JtXCI7aWYgKGguZG9tKGEpICYmIChhLmdldEF0dHJpYnV0ZShjKSB8fCBoLnN2ZyhhKSAmJiBhW2NdKSkgcmV0dXJuIFwiYXR0cmlidXRlXCI7aWYgKGguZG9tKGEpICYmIFwidHJhbnNmb3JtXCIgIT09IGMgJiYgRShhLCBjKSkgcmV0dXJuIFwiY3NzXCI7aWYgKG51bGwgIT0gYVtjXSkgcmV0dXJuIFwib2JqZWN0XCI7XHJcbiAgfWZ1bmN0aW9uIFgoYSwgYykge1xyXG4gICAgdmFyIGQgPSBWKGMpLFxyXG4gICAgICAgIGQgPSAtMSA8IGMuaW5kZXhPZihcInNjYWxlXCIpID8gMSA6IDAgKyBkO2EgPSBhLnN0eWxlLnRyYW5zZm9ybTtpZiAoIWEpIHJldHVybiBkO2ZvciAodmFyIGIgPSBbXSwgZiA9IFtdLCBuID0gW10sIGsgPSAvKFxcdyspXFwoKC4rPylcXCkvZzsgYiA9IGsuZXhlYyhhKTspIHtcclxuICAgICAgZi5wdXNoKGJbMV0pLCBuLnB1c2goYlsyXSk7XHJcbiAgICB9YSA9IHIobiwgZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgcmV0dXJuIGZbYl0gPT09IGM7XHJcbiAgICB9KTtyZXR1cm4gYS5sZW5ndGggPyBhWzBdIDogZDtcclxuICB9ZnVuY3Rpb24gSyhhLCBjKSB7XHJcbiAgICBzd2l0Y2ggKEooYSwgYykpIHtjYXNlIFwidHJhbnNmb3JtXCI6XHJcbiAgICAgICAgcmV0dXJuIFgoYSwgYyk7Y2FzZSBcImNzc1wiOlxyXG4gICAgICAgIHJldHVybiBFKGEsIGMpO2Nhc2UgXCJhdHRyaWJ1dGVcIjpcclxuICAgICAgICByZXR1cm4gYS5nZXRBdHRyaWJ1dGUoYyk7fXJldHVybiBhW2NdIHx8IDA7XHJcbiAgfWZ1bmN0aW9uIEwoYSwgYykge1xyXG4gICAgdmFyIGQgPSAvXihcXCo9fFxcKz18LT0pLy5leGVjKGEpO2lmICghZCkgcmV0dXJuIGE7dmFyIGIgPSB5KGEpIHx8IDA7YyA9IHBhcnNlRmxvYXQoYyk7YSA9IHBhcnNlRmxvYXQoYS5yZXBsYWNlKGRbMF0sIFwiXCIpKTtzd2l0Y2ggKGRbMF1bMF0pIHtjYXNlIFwiK1wiOlxyXG4gICAgICAgIHJldHVybiBjICsgYSArIGI7Y2FzZSBcIi1cIjpcclxuICAgICAgICByZXR1cm4gYyAtIGEgKyBiO2Nhc2UgXCIqXCI6XHJcbiAgICAgICAgcmV0dXJuIGMgKiBhICsgYjt9XHJcbiAgfWZ1bmN0aW9uIEYoYSwgYykge1xyXG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhjLnggLSBhLngsIDIpICsgTWF0aC5wb3coYy55IC0gYS55LCAyKSk7XHJcbiAgfWZ1bmN0aW9uIE0oYSkge1xyXG4gICAgYSA9IGEucG9pbnRzO2ZvciAodmFyIGMgPSAwLCBkLCBiID0gMDsgYiA8IGEubnVtYmVyT2ZJdGVtczsgYisrKSB7XHJcbiAgICAgIHZhciBmID0gYS5nZXRJdGVtKGIpOzAgPCBiICYmIChjICs9IEYoZCwgZikpO2QgPSBmO1xyXG4gICAgfXJldHVybiBjO1xyXG4gIH1mdW5jdGlvbiBOKGEpIHtcclxuICAgIGlmIChhLmdldFRvdGFsTGVuZ3RoKSByZXR1cm4gYS5nZXRUb3RhbExlbmd0aCgpO3N3aXRjaCAoYS50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtjYXNlIFwiY2lyY2xlXCI6XHJcbiAgICAgICAgcmV0dXJuIDIgKiBNYXRoLlBJICogYS5nZXRBdHRyaWJ1dGUoXCJyXCIpO2Nhc2UgXCJyZWN0XCI6XHJcbiAgICAgICAgcmV0dXJuIDIgKiBhLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpICsgMiAqIGEuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpO2Nhc2UgXCJsaW5lXCI6XHJcbiAgICAgICAgcmV0dXJuIEYoeyB4OiBhLmdldEF0dHJpYnV0ZShcIngxXCIpLCB5OiBhLmdldEF0dHJpYnV0ZShcInkxXCIpIH0sIHsgeDogYS5nZXRBdHRyaWJ1dGUoXCJ4MlwiKSwgeTogYS5nZXRBdHRyaWJ1dGUoXCJ5MlwiKSB9KTtjYXNlIFwicG9seWxpbmVcIjpcclxuICAgICAgICByZXR1cm4gTShhKTtjYXNlIFwicG9seWdvblwiOlxyXG4gICAgICAgIHZhciBjID0gYS5wb2ludHM7cmV0dXJuIE0oYSkgKyBGKGMuZ2V0SXRlbShjLm51bWJlck9mSXRlbXMgLSAxKSwgYy5nZXRJdGVtKDApKTt9XHJcbiAgfWZ1bmN0aW9uIFkoYSwgYykge1xyXG4gICAgZnVuY3Rpb24gZChiKSB7XHJcbiAgICAgIGIgPSB2b2lkIDAgPT09IGIgPyAwIDogYjtyZXR1cm4gYS5lbC5nZXRQb2ludEF0TGVuZ3RoKDEgPD0gYyArIGIgPyBjICsgYiA6IDApO1xyXG4gICAgfXZhciBiID0gZCgpLFxyXG4gICAgICAgIGYgPSBkKC0xKSxcclxuICAgICAgICBuID0gZCgxKTtzd2l0Y2ggKGEucHJvcGVydHkpIHtjYXNlIFwieFwiOlxyXG4gICAgICAgIHJldHVybiBiLng7Y2FzZSBcInlcIjpcclxuICAgICAgICByZXR1cm4gYi55O1xyXG4gICAgICBjYXNlIFwiYW5nbGVcIjpcclxuICAgICAgICByZXR1cm4gMTgwICogTWF0aC5hdGFuMihuLnkgLSBmLnksIG4ueCAtIGYueCkgLyBNYXRoLlBJO31cclxuICB9ZnVuY3Rpb24gTyhhLCBjKSB7XHJcbiAgICB2YXIgZCA9IC8tP1xcZCpcXC4/XFxkKy9nLFxyXG4gICAgICAgIGI7YiA9IGgucHRoKGEpID8gYS50b3RhbExlbmd0aCA6IGE7aWYgKGguY29sKGIpKSB7XHJcbiAgICAgIGlmIChoLnJnYihiKSkge1xyXG4gICAgICAgIHZhciBmID0gL3JnYlxcKChcXGQrLFxccypbXFxkXSssXFxzKltcXGRdKylcXCkvZy5leGVjKGIpO2IgPSBmID8gXCJyZ2JhKFwiICsgZlsxXSArIFwiLDEpXCIgOiBiO1xyXG4gICAgICB9IGVsc2UgYiA9IGguaGV4KGIpID8gVChiKSA6IGguaHNsKGIpID8gVShiKSA6IHZvaWQgMDtcclxuICAgIH0gZWxzZSBmID0gKGYgPSB5KGIpKSA/IGIuc3Vic3RyKDAsIGIubGVuZ3RoIC0gZi5sZW5ndGgpIDogYiwgYiA9IGMgJiYgIS9cXHMvZy50ZXN0KGIpID8gZiArIGMgOiBmO2IgKz0gXCJcIjtyZXR1cm4geyBvcmlnaW5hbDogYiwgbnVtYmVyczogYi5tYXRjaChkKSA/IGIubWF0Y2goZCkubWFwKE51bWJlcikgOiBbMF0sIHN0cmluZ3M6IGguc3RyKGEpIHx8IGMgPyBiLnNwbGl0KGQpIDogW10gfTtcclxuICB9ZnVuY3Rpb24gUChhKSB7XHJcbiAgICBhID0gYSA/IHAoaC5hcnIoYSkgPyBhLm1hcChtKSA6IG0oYSkpIDogW107cmV0dXJuIHIoYSwgZnVuY3Rpb24gKGEsIGQsIGIpIHtcclxuICAgICAgcmV0dXJuIGIuaW5kZXhPZihhKSA9PT0gZDtcclxuICAgIH0pO1xyXG4gIH1mdW5jdGlvbiBaKGEpIHtcclxuICAgIHZhciBjID0gUChhKTtyZXR1cm4gYy5tYXAoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgcmV0dXJuIHsgdGFyZ2V0OiBhLCBpZDogYiwgdG90YWw6IGMubGVuZ3RoIH07XHJcbiAgICB9KTtcclxuICB9ZnVuY3Rpb24gYWEoYSwgYykge1xyXG4gICAgdmFyIGQgPSBDKGMpO2lmIChoLmFycihhKSkge1xyXG4gICAgICB2YXIgYiA9IGEubGVuZ3RoOzIgIT09IGIgfHwgaC5vYmooYVswXSkgPyBoLmZuYyhjLmR1cmF0aW9uKSB8fCAoZC5kdXJhdGlvbiA9IGMuZHVyYXRpb24gLyBiKSA6IGEgPSB7IHZhbHVlOiBhIH07XHJcbiAgICB9cmV0dXJuIG0oYSkubWFwKGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgIGIgPSBiID8gMCA6IGMuZGVsYXk7YSA9IGgub2JqKGEpICYmICFoLnB0aChhKSA/IGEgOiB7IHZhbHVlOiBhIH07aC51bmQoYS5kZWxheSkgJiYgKGEuZGVsYXkgPSBiKTtyZXR1cm4gYTtcclxuICAgIH0pLm1hcChmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4geihhLCBkKTtcclxuICAgIH0pO1xyXG4gIH1mdW5jdGlvbiBiYShhLCBjKSB7XHJcbiAgICB2YXIgZCA9IHt9LFxyXG4gICAgICAgIGI7Zm9yIChiIGluIGEpIHtcclxuICAgICAgdmFyIGYgPSBJKGFbYl0sIGMpO2guYXJyKGYpICYmIChmID0gZi5tYXAoZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICByZXR1cm4gSShhLCBjKTtcclxuICAgICAgfSksIDEgPT09IGYubGVuZ3RoICYmIChmID0gZlswXSkpO2RbYl0gPSBmO1xyXG4gICAgfWQuZHVyYXRpb24gPSBwYXJzZUZsb2F0KGQuZHVyYXRpb24pO2QuZGVsYXkgPSBwYXJzZUZsb2F0KGQuZGVsYXkpO3JldHVybiBkO1xyXG4gIH1mdW5jdGlvbiBjYShhKSB7XHJcbiAgICByZXR1cm4gaC5hcnIoYSkgPyBBLmFwcGx5KHRoaXMsIGEpIDogUVthXTtcclxuICB9ZnVuY3Rpb24gZGEoYSwgYykge1xyXG4gICAgdmFyIGQ7cmV0dXJuIGEudHdlZW5zLm1hcChmdW5jdGlvbiAoYikge1xyXG4gICAgICBiID0gYmEoYiwgYyk7dmFyIGYgPSBiLnZhbHVlLFxyXG4gICAgICAgICAgZSA9IEsoYy50YXJnZXQsIGEubmFtZSksXHJcbiAgICAgICAgICBrID0gZCA/IGQudG8ub3JpZ2luYWwgOiBlLFxyXG4gICAgICAgICAgayA9IGguYXJyKGYpID8gZlswXSA6IGssXHJcbiAgICAgICAgICB3ID0gTChoLmFycihmKSA/IGZbMV0gOiBmLCBrKSxcclxuICAgICAgICAgIGUgPSB5KHcpIHx8IHkoaykgfHwgeShlKTtiLmZyb20gPSBPKGssIGUpO2IudG8gPSBPKHcsIGUpO2Iuc3RhcnQgPSBkID8gZC5lbmQgOiBhLm9mZnNldDtiLmVuZCA9IGIuc3RhcnQgKyBiLmRlbGF5ICsgYi5kdXJhdGlvbjtiLmVhc2luZyA9IGNhKGIuZWFzaW5nKTtiLmVsYXN0aWNpdHkgPSAoMUUzIC0gTWF0aC5taW4oTWF0aC5tYXgoYi5lbGFzdGljaXR5LCAxKSwgOTk5KSkgLyAxRTM7Yi5pc1BhdGggPSBoLnB0aChmKTtiLmlzQ29sb3IgPSBoLmNvbChiLmZyb20ub3JpZ2luYWwpO2IuaXNDb2xvciAmJiAoYi5yb3VuZCA9IDEpO3JldHVybiBkID0gYjtcclxuICAgIH0pO1xyXG4gIH1mdW5jdGlvbiBlYShhLCBjKSB7XHJcbiAgICByZXR1cm4gcihwKGEubWFwKGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgIHJldHVybiBjLm1hcChmdW5jdGlvbiAoYikge1xyXG4gICAgICAgIHZhciBjID0gSihhLnRhcmdldCwgYi5uYW1lKTtpZiAoYykge1xyXG4gICAgICAgICAgdmFyIGQgPSBkYShiLCBhKTtiID0geyB0eXBlOiBjLCBwcm9wZXJ0eTogYi5uYW1lLCBhbmltYXRhYmxlOiBhLCB0d2VlbnM6IGQsIGR1cmF0aW9uOiBkW2QubGVuZ3RoIC0gMV0uZW5kLCBkZWxheTogZFswXS5kZWxheSB9O1xyXG4gICAgICAgIH0gZWxzZSBiID0gdm9pZCAwO3JldHVybiBiO1xyXG4gICAgICB9KTtcclxuICAgIH0pKSwgZnVuY3Rpb24gKGEpIHtcclxuICAgICAgcmV0dXJuICFoLnVuZChhKTtcclxuICAgIH0pO1xyXG4gIH1mdW5jdGlvbiBSKGEsIGMsIGQsIGIpIHtcclxuICAgIHZhciBmID0gXCJkZWxheVwiID09PSBhO3JldHVybiBjLmxlbmd0aCA/IChmID8gTWF0aC5taW4gOiBNYXRoLm1heCkuYXBwbHkoTWF0aCwgYy5tYXAoZnVuY3Rpb24gKGIpIHtcclxuICAgICAgcmV0dXJuIGJbYV07XHJcbiAgICB9KSkgOiBmID8gYi5kZWxheSA6IGQub2Zmc2V0ICsgYi5kZWxheSArIGIuZHVyYXRpb247XHJcbiAgfWZ1bmN0aW9uIGZhKGEpIHtcclxuICAgIHZhciBjID0gRChnYSwgYSksXHJcbiAgICAgICAgZCA9IEQoUywgYSksXHJcbiAgICAgICAgYiA9IFooYS50YXJnZXRzKSxcclxuICAgICAgICBmID0gW10sXHJcbiAgICAgICAgZSA9IHooYywgZCksXHJcbiAgICAgICAgaztmb3IgKGsgaW4gYSkge1xyXG4gICAgICBlLmhhc093blByb3BlcnR5KGspIHx8IFwidGFyZ2V0c1wiID09PSBrIHx8IGYucHVzaCh7IG5hbWU6IGssIG9mZnNldDogZS5vZmZzZXQsIHR3ZWVuczogYWEoYVtrXSwgZCkgfSk7XHJcbiAgICB9YSA9IGVhKGIsIGYpO3JldHVybiB6KGMsIHsgY2hpbGRyZW46IFtdLCBhbmltYXRhYmxlczogYiwgYW5pbWF0aW9uczogYSwgZHVyYXRpb246IFIoXCJkdXJhdGlvblwiLCBhLCBjLCBkKSwgZGVsYXk6IFIoXCJkZWxheVwiLCBhLCBjLCBkKSB9KTtcclxuICB9ZnVuY3Rpb24gcShhKSB7XHJcbiAgICBmdW5jdGlvbiBjKCkge1xyXG4gICAgICByZXR1cm4gd2luZG93LlByb21pc2UgJiYgbmV3IFByb21pc2UoZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICByZXR1cm4gcCA9IGE7XHJcbiAgICAgIH0pO1xyXG4gICAgfWZ1bmN0aW9uIGQoYSkge1xyXG4gICAgICByZXR1cm4gZy5yZXZlcnNlZCA/IGcuZHVyYXRpb24gLSBhIDogYTtcclxuICAgIH1mdW5jdGlvbiBiKGEpIHtcclxuICAgICAgZm9yICh2YXIgYiA9IDAsIGMgPSB7fSwgZCA9IGcuYW5pbWF0aW9ucywgZiA9IGQubGVuZ3RoOyBiIDwgZjspIHtcclxuICAgICAgICB2YXIgZSA9IGRbYl0sXHJcbiAgICAgICAgICAgIGsgPSBlLmFuaW1hdGFibGUsXHJcbiAgICAgICAgICAgIGggPSBlLnR3ZWVucyxcclxuICAgICAgICAgICAgbiA9IGgubGVuZ3RoIC0gMSxcclxuICAgICAgICAgICAgbCA9IGhbbl07biAmJiAobCA9IHIoaCwgZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICAgIHJldHVybiBhIDwgYi5lbmQ7XHJcbiAgICAgICAgfSlbMF0gfHwgbCk7Zm9yICh2YXIgaCA9IE1hdGgubWluKE1hdGgubWF4KGEgLSBsLnN0YXJ0IC0gbC5kZWxheSwgMCksIGwuZHVyYXRpb24pIC8gbC5kdXJhdGlvbiwgdyA9IGlzTmFOKGgpID8gMSA6IGwuZWFzaW5nKGgsIGwuZWxhc3RpY2l0eSksIGggPSBsLnRvLnN0cmluZ3MsIHAgPSBsLnJvdW5kLCBuID0gW10sIG0gPSB2b2lkIDAsIG0gPSBsLnRvLm51bWJlcnMubGVuZ3RoLCB0ID0gMDsgdCA8IG07IHQrKykge1xyXG4gICAgICAgICAgdmFyIHggPSB2b2lkIDAsXHJcbiAgICAgICAgICAgICAgeCA9IGwudG8ubnVtYmVyc1t0XSxcclxuICAgICAgICAgICAgICBxID0gbC5mcm9tLm51bWJlcnNbdF0sXHJcbiAgICAgICAgICAgICAgeCA9IGwuaXNQYXRoID8gWShsLnZhbHVlLCB3ICogeCkgOiBxICsgdyAqICh4IC0gcSk7cCAmJiAobC5pc0NvbG9yICYmIDIgPCB0IHx8ICh4ID0gTWF0aC5yb3VuZCh4ICogcCkgLyBwKSk7bi5wdXNoKHgpO1xyXG4gICAgICAgIH1pZiAobCA9IGgubGVuZ3RoKSBmb3IgKG0gPSBoWzBdLCB3ID0gMDsgdyA8IGw7IHcrKykge1xyXG4gICAgICAgICAgcCA9IGhbdyArIDFdLCB0ID0gblt3XSwgaXNOYU4odCkgfHwgKG0gPSBwID8gbSArICh0ICsgcCkgOiBtICsgKHQgKyBcIiBcIikpO1xyXG4gICAgICAgIH0gZWxzZSBtID0gblswXTtoYVtlLnR5cGVdKGsudGFyZ2V0LCBlLnByb3BlcnR5LCBtLCBjLCBrLmlkKTtlLmN1cnJlbnRWYWx1ZSA9IG07YisrO1xyXG4gICAgICB9aWYgKGIgPSBPYmplY3Qua2V5cyhjKS5sZW5ndGgpIGZvciAoZCA9IDA7IGQgPCBiOyBkKyspIHtcclxuICAgICAgICBIIHx8IChIID0gRShkb2N1bWVudC5ib2R5LCBcInRyYW5zZm9ybVwiKSA/IFwidHJhbnNmb3JtXCIgOiBcIi13ZWJraXQtdHJhbnNmb3JtXCIpLCBnLmFuaW1hdGFibGVzW2RdLnRhcmdldC5zdHlsZVtIXSA9IGNbZF0uam9pbihcIiBcIik7XHJcbiAgICAgIH1nLmN1cnJlbnRUaW1lID0gYTtnLnByb2dyZXNzID0gYSAvIGcuZHVyYXRpb24gKiAxMDA7XHJcbiAgICB9ZnVuY3Rpb24gZihhKSB7XHJcbiAgICAgIGlmIChnW2FdKSBnW2FdKGcpO1xyXG4gICAgfWZ1bmN0aW9uIGUoKSB7XHJcbiAgICAgIGcucmVtYWluaW5nICYmICEwICE9PSBnLnJlbWFpbmluZyAmJiBnLnJlbWFpbmluZy0tO1xyXG4gICAgfWZ1bmN0aW9uIGsoYSkge1xyXG4gICAgICB2YXIgayA9IGcuZHVyYXRpb24sXHJcbiAgICAgICAgICBuID0gZy5vZmZzZXQsXHJcbiAgICAgICAgICB3ID0gbiArIGcuZGVsYXksXHJcbiAgICAgICAgICByID0gZy5jdXJyZW50VGltZSxcclxuICAgICAgICAgIHggPSBnLnJldmVyc2VkLFxyXG4gICAgICAgICAgcSA9IGQoYSk7aWYgKGcuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIHUgPSBnLmNoaWxkcmVuLFxyXG4gICAgICAgICAgICB2ID0gdS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKHEgPj0gZy5jdXJyZW50VGltZSkgZm9yICh2YXIgRyA9IDA7IEcgPCB2OyBHKyspIHtcclxuICAgICAgICAgIHVbR10uc2VlayhxKTtcclxuICAgICAgICB9IGVsc2UgZm9yICg7IHYtLTspIHtcclxuICAgICAgICAgIHVbdl0uc2VlayhxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1pZiAocSA+PSB3IHx8ICFrKSBnLmJlZ2FuIHx8IChnLmJlZ2FuID0gITAsIGYoXCJiZWdpblwiKSksIGYoXCJydW5cIik7aWYgKHEgPiBuICYmIHEgPCBrKSBiKHEpO2Vsc2UgaWYgKHEgPD0gbiAmJiAwICE9PSByICYmIChiKDApLCB4ICYmIGUoKSksIHEgPj0gayAmJiByICE9PSBrIHx8ICFrKSBiKGspLCB4IHx8IGUoKTtmKFwidXBkYXRlXCIpO2EgPj0gayAmJiAoZy5yZW1haW5pbmcgPyAodCA9IGgsIFwiYWx0ZXJuYXRlXCIgPT09IGcuZGlyZWN0aW9uICYmIChnLnJldmVyc2VkID0gIWcucmV2ZXJzZWQpKSA6IChnLnBhdXNlKCksIGcuY29tcGxldGVkIHx8IChnLmNvbXBsZXRlZCA9ICEwLCBmKFwiY29tcGxldGVcIiksIFwiUHJvbWlzZVwiIGluIHdpbmRvdyAmJiAocCgpLCBtID0gYygpKSkpLCBsID0gMCk7XHJcbiAgICB9YSA9IHZvaWQgMCA9PT0gYSA/IHt9IDogYTt2YXIgaCxcclxuICAgICAgICB0LFxyXG4gICAgICAgIGwgPSAwLFxyXG4gICAgICAgIHAgPSBudWxsLFxyXG4gICAgICAgIG0gPSBjKCksXHJcbiAgICAgICAgZyA9IGZhKGEpO2cucmVzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBhID0gZy5kaXJlY3Rpb24sXHJcbiAgICAgICAgICBjID0gZy5sb29wO2cuY3VycmVudFRpbWUgPSAwO2cucHJvZ3Jlc3MgPSAwO2cucGF1c2VkID0gITA7Zy5iZWdhbiA9ICExO2cuY29tcGxldGVkID0gITE7Zy5yZXZlcnNlZCA9IFwicmV2ZXJzZVwiID09PSBhO2cucmVtYWluaW5nID0gXCJhbHRlcm5hdGVcIiA9PT0gYSAmJiAxID09PSBjID8gMiA6IGM7YigwKTtmb3IgKGEgPSBnLmNoaWxkcmVuLmxlbmd0aDsgYS0tOykge1xyXG4gICAgICAgIGcuY2hpbGRyZW5bYV0ucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfTtnLnRpY2sgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgICBoID0gYTt0IHx8ICh0ID0gaCk7aygobCArIGggLSB0KSAqIHEuc3BlZWQpO1xyXG4gICAgfTtnLnNlZWsgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgICBrKGQoYSkpO1xyXG4gICAgfTtnLnBhdXNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgYSA9IHYuaW5kZXhPZihnKTstMSA8IGEgJiYgdi5zcGxpY2UoYSwgMSk7Zy5wYXVzZWQgPSAhMDtcclxuICAgIH07Zy5wbGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBnLnBhdXNlZCAmJiAoZy5wYXVzZWQgPSAhMSwgdCA9IDAsIGwgPSBkKGcuY3VycmVudFRpbWUpLCB2LnB1c2goZyksIEIgfHwgaWEoKSk7XHJcbiAgICB9O2cucmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgZy5yZXZlcnNlZCA9ICFnLnJldmVyc2VkO3QgPSAwO2wgPSBkKGcuY3VycmVudFRpbWUpO1xyXG4gICAgfTtnLnJlc3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGcucGF1c2UoKTtcclxuICAgICAgZy5yZXNldCgpO2cucGxheSgpO1xyXG4gICAgfTtnLmZpbmlzaGVkID0gbTtnLnJlc2V0KCk7Zy5hdXRvcGxheSAmJiBnLnBsYXkoKTtyZXR1cm4gZztcclxuICB9dmFyIGdhID0geyB1cGRhdGU6IHZvaWQgMCwgYmVnaW46IHZvaWQgMCwgcnVuOiB2b2lkIDAsIGNvbXBsZXRlOiB2b2lkIDAsIGxvb3A6IDEsIGRpcmVjdGlvbjogXCJub3JtYWxcIiwgYXV0b3BsYXk6ICEwLCBvZmZzZXQ6IDAgfSxcclxuICAgICAgUyA9IHsgZHVyYXRpb246IDFFMywgZGVsYXk6IDAsIGVhc2luZzogXCJlYXNlT3V0RWxhc3RpY1wiLCBlbGFzdGljaXR5OiA1MDAsIHJvdW5kOiAwIH0sXHJcbiAgICAgIFcgPSBcInRyYW5zbGF0ZVggdHJhbnNsYXRlWSB0cmFuc2xhdGVaIHJvdGF0ZSByb3RhdGVYIHJvdGF0ZVkgcm90YXRlWiBzY2FsZSBzY2FsZVggc2NhbGVZIHNjYWxlWiBza2V3WCBza2V3WSBwZXJzcGVjdGl2ZVwiLnNwbGl0KFwiIFwiKSxcclxuICAgICAgSCxcclxuICAgICAgaCA9IHsgYXJyOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhKTtcclxuICAgIH0sIG9iajogZnVuY3Rpb24gKGEpIHtcclxuICAgICAgcmV0dXJuIC0xIDwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoXCJPYmplY3RcIik7XHJcbiAgICB9LFxyXG4gICAgcHRoOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4gaC5vYmooYSkgJiYgYS5oYXNPd25Qcm9wZXJ0eShcInRvdGFsTGVuZ3RoXCIpO1xyXG4gICAgfSwgc3ZnOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4gYSBpbnN0YW5jZW9mIFNWR0VsZW1lbnQ7XHJcbiAgICB9LCBkb206IGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgIHJldHVybiBhLm5vZGVUeXBlIHx8IGguc3ZnKGEpO1xyXG4gICAgfSwgc3RyOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4gXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGE7XHJcbiAgICB9LCBmbmM6IGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgIHJldHVybiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBhO1xyXG4gICAgfSwgdW5kOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4gXCJ1bmRlZmluZWRcIiA9PT0gdHlwZW9mIGE7XHJcbiAgICB9LCBoZXg6IGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgIHJldHVybiAoLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSlcclxuICAgICAgKTtcclxuICAgIH0sIHJnYjogZnVuY3Rpb24gKGEpIHtcclxuICAgICAgcmV0dXJuICgvXnJnYi8udGVzdChhKVxyXG4gICAgICApO1xyXG4gICAgfSwgaHNsOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICByZXR1cm4gKC9eaHNsLy50ZXN0KGEpXHJcbiAgICAgICk7XHJcbiAgICB9LCBjb2w6IGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgIHJldHVybiBoLmhleChhKSB8fCBoLnJnYihhKSB8fCBoLmhzbChhKTtcclxuICAgIH0gfSxcclxuICAgICAgQSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIGEoYSwgZCwgYikge1xyXG4gICAgICByZXR1cm4gKCgoMSAtIDMgKiBiICsgMyAqIGQpICogYSArICgzICogYiAtIDYgKiBkKSkgKiBhICsgMyAqIGQpICogYTtcclxuICAgIH1yZXR1cm4gZnVuY3Rpb24gKGMsIGQsIGIsIGYpIHtcclxuICAgICAgaWYgKDAgPD0gYyAmJiAxID49IGMgJiYgMCA8PSBiICYmIDEgPj0gYikge1xyXG4gICAgICAgIHZhciBlID0gbmV3IEZsb2F0MzJBcnJheSgxMSk7aWYgKGMgIT09IGQgfHwgYiAhPT0gZikgZm9yICh2YXIgayA9IDA7IDExID4gazsgKytrKSB7XHJcbiAgICAgICAgICBlW2tdID0gYSguMSAqIGssIGMsIGIpO1xyXG4gICAgICAgIH1yZXR1cm4gZnVuY3Rpb24gKGspIHtcclxuICAgICAgICAgIGlmIChjID09PSBkICYmIGIgPT09IGYpIHJldHVybiBrO2lmICgwID09PSBrKSByZXR1cm4gMDtpZiAoMSA9PT0gaykgcmV0dXJuIDE7Zm9yICh2YXIgaCA9IDAsIGwgPSAxOyAxMCAhPT0gbCAmJiBlW2xdIDw9IGs7ICsrbCkge1xyXG4gICAgICAgICAgICBoICs9IC4xO1xyXG4gICAgICAgICAgfS0tbDt2YXIgbCA9IGggKyAoayAtIGVbbF0pIC8gKGVbbCArIDFdIC0gZVtsXSkgKiAuMSxcclxuICAgICAgICAgICAgICBuID0gMyAqICgxIC0gMyAqIGIgKyAzICogYykgKiBsICogbCArIDIgKiAoMyAqIGIgLSA2ICogYykgKiBsICsgMyAqIGM7aWYgKC4wMDEgPD0gbikge1xyXG4gICAgICAgICAgICBmb3IgKGggPSAwOyA0ID4gaDsgKytoKSB7XHJcbiAgICAgICAgICAgICAgbiA9IDMgKiAoMSAtIDMgKiBiICsgMyAqIGMpICogbCAqIGwgKyAyICogKDMgKiBiIC0gNiAqIGMpICogbCArIDMgKiBjO2lmICgwID09PSBuKSBicmVhazt2YXIgbSA9IGEobCwgYywgYikgLSBrLFxyXG4gICAgICAgICAgICAgICAgICBsID0gbCAtIG0gLyBuO1xyXG4gICAgICAgICAgICB9ayA9IGw7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKDAgPT09IG4pIGsgPSBsO2Vsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbCA9IGgsXHJcbiAgICAgICAgICAgICAgICBoID0gaCArIC4xLFxyXG4gICAgICAgICAgICAgICAgZyA9IDA7ZG8ge1xyXG4gICAgICAgICAgICAgIG0gPSBsICsgKGggLSBsKSAvIDIsIG4gPSBhKG0sIGMsIGIpIC0gaywgMCA8IG4gPyBoID0gbSA6IGwgPSBtO1xyXG4gICAgICAgICAgICB9IHdoaWxlICgxZS03IDwgTWF0aC5hYnMobikgJiYgMTAgPiArK2cpO2sgPSBtO1xyXG4gICAgICAgICAgfXJldHVybiBhKGssIGQsIGYpO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSgpLFxyXG4gICAgICBRID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gYShhLCBiKSB7XHJcbiAgICAgIHJldHVybiAwID09PSBhIHx8IDEgPT09IGEgPyBhIDogLU1hdGgucG93KDIsIDEwICogKGEgLSAxKSkgKiBNYXRoLnNpbigyICogKGEgLSAxIC0gYiAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSkpICogTWF0aC5QSSAvIGIpO1xyXG4gICAgfXZhciBjID0gXCJRdWFkIEN1YmljIFF1YXJ0IFF1aW50IFNpbmUgRXhwbyBDaXJjIEJhY2sgRWxhc3RpY1wiLnNwbGl0KFwiIFwiKSxcclxuICAgICAgICBkID0geyBJbjogW1suNTUsIC4wODUsIC42OCwgLjUzXSwgWy41NSwgLjA1NSwgLjY3NSwgLjE5XSwgWy44OTUsIC4wMywgLjY4NSwgLjIyXSwgWy43NTUsIC4wNSwgLjg1NSwgLjA2XSwgWy40NywgMCwgLjc0NSwgLjcxNV0sIFsuOTUsIC4wNSwgLjc5NSwgLjAzNV0sIFsuNiwgLjA0LCAuOTgsIC4zMzVdLCBbLjYsIC0uMjgsIC43MzUsIC4wNDVdLCBhXSwgT3V0OiBbWy4yNSwgLjQ2LCAuNDUsIC45NF0sIFsuMjE1LCAuNjEsIC4zNTUsIDFdLCBbLjE2NSwgLjg0LCAuNDQsIDFdLCBbLjIzLCAxLCAuMzIsIDFdLCBbLjM5LCAuNTc1LCAuNTY1LCAxXSwgWy4xOSwgMSwgLjIyLCAxXSwgWy4wNzUsIC44MiwgLjE2NSwgMV0sIFsuMTc1LCAuODg1LCAuMzIsIDEuMjc1XSwgZnVuY3Rpb24gKGIsIGMpIHtcclxuICAgICAgICByZXR1cm4gMSAtIGEoMSAtIGIsIGMpO1xyXG4gICAgICB9XSwgSW5PdXQ6IFtbLjQ1NSwgLjAzLCAuNTE1LCAuOTU1XSwgWy42NDUsIC4wNDUsIC4zNTUsIDFdLCBbLjc3LCAwLCAuMTc1LCAxXSwgWy44NiwgMCwgLjA3LCAxXSwgWy40NDUsIC4wNSwgLjU1LCAuOTVdLCBbMSwgMCwgMCwgMV0sIFsuNzg1LCAuMTM1LCAuMTUsIC44Nl0sIFsuNjgsIC0uNTUsIC4yNjUsIDEuNTVdLCBmdW5jdGlvbiAoYiwgYykge1xyXG4gICAgICAgIHJldHVybiAuNSA+IGIgPyBhKDIgKiBiLCBjKSAvIDIgOiAxIC0gYSgtMiAqIGIgKyAyLCBjKSAvIDI7XHJcbiAgICAgIH1dIH0sXHJcbiAgICAgICAgYiA9IHsgbGluZWFyOiBBKC4yNSwgLjI1LCAuNzUsIC43NSkgfSxcclxuICAgICAgICBmID0ge30sXHJcbiAgICAgICAgZTtmb3IgKGUgaW4gZCkge1xyXG4gICAgICBmLnR5cGUgPSBlLCBkW2YudHlwZV0uZm9yRWFjaChmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZCwgZikge1xyXG4gICAgICAgICAgYltcImVhc2VcIiArIGEudHlwZSArIGNbZl1dID0gaC5mbmMoZCkgPyBkIDogQS5hcHBseSgkanNjb21wJHRoaXMsIGQpO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0oZikpLCBmID0geyB0eXBlOiBmLnR5cGUgfTtcclxuICAgIH1yZXR1cm4gYjtcclxuICB9KCksXHJcbiAgICAgIGhhID0geyBjc3M6IGZ1bmN0aW9uIChhLCBjLCBkKSB7XHJcbiAgICAgIHJldHVybiBhLnN0eWxlW2NdID0gZDtcclxuICAgIH0sIGF0dHJpYnV0ZTogZnVuY3Rpb24gKGEsIGMsIGQpIHtcclxuICAgICAgcmV0dXJuIGEuc2V0QXR0cmlidXRlKGMsIGQpO1xyXG4gICAgfSwgb2JqZWN0OiBmdW5jdGlvbiAoYSwgYywgZCkge1xyXG4gICAgICByZXR1cm4gYVtjXSA9IGQ7XHJcbiAgICB9LCB0cmFuc2Zvcm06IGZ1bmN0aW9uIChhLCBjLCBkLCBiLCBmKSB7XHJcbiAgICAgIGJbZl0gfHwgKGJbZl0gPSBbXSk7YltmXS5wdXNoKGMgKyBcIihcIiArIGQgKyBcIilcIik7XHJcbiAgICB9IH0sXHJcbiAgICAgIHYgPSBbXSxcclxuICAgICAgQiA9IDAsXHJcbiAgICAgIGlhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gYSgpIHtcclxuICAgICAgQiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShjKTtcclxuICAgIH1mdW5jdGlvbiBjKGMpIHtcclxuICAgICAgdmFyIGIgPSB2Lmxlbmd0aDtpZiAoYikge1xyXG4gICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgYjspIHtcclxuICAgICAgICAgIHZbZF0gJiYgdltkXS50aWNrKGMpLCBkKys7XHJcbiAgICAgICAgfWEoKTtcclxuICAgICAgfSBlbHNlIGNhbmNlbEFuaW1hdGlvbkZyYW1lKEIpLCBCID0gMDtcclxuICAgIH1yZXR1cm4gYTtcclxuICB9KCk7cS52ZXJzaW9uID0gXCIyLjIuMFwiO3Euc3BlZWQgPSAxO3EucnVubmluZyA9IHY7cS5yZW1vdmUgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgYSA9IFAoYSk7Zm9yICh2YXIgYyA9IHYubGVuZ3RoOyBjLS07KSB7XHJcbiAgICAgIGZvciAodmFyIGQgPSB2W2NdLCBiID0gZC5hbmltYXRpb25zLCBmID0gYi5sZW5ndGg7IGYtLTspIHtcclxuICAgICAgICB1KGEsIGJbZl0uYW5pbWF0YWJsZS50YXJnZXQpICYmIChiLnNwbGljZShmLCAxKSwgYi5sZW5ndGggfHwgZC5wYXVzZSgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07cS5nZXRWYWx1ZSA9IEs7cS5wYXRoID0gZnVuY3Rpb24gKGEsIGMpIHtcclxuICAgIHZhciBkID0gaC5zdHIoYSkgPyBlKGEpWzBdIDogYSxcclxuICAgICAgICBiID0gYyB8fCAxMDA7cmV0dXJuIGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgIHJldHVybiB7IGVsOiBkLCBwcm9wZXJ0eTogYSwgdG90YWxMZW5ndGg6IE4oZCkgKiAoYiAvIDEwMCkgfTtcclxuICAgIH07XHJcbiAgfTtxLnNldERhc2hvZmZzZXQgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgdmFyIGMgPSBOKGEpO2Euc2V0QXR0cmlidXRlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBjKTtyZXR1cm4gYztcclxuICB9O3EuYmV6aWVyID0gQTtxLmVhc2luZ3MgPSBRO3EudGltZWxpbmUgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgdmFyIGMgPSBxKGEpO2MucGF1c2UoKTtjLmR1cmF0aW9uID0gMDtjLmFkZCA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIGEuYmVnYW4gPSAhMDthLmNvbXBsZXRlZCA9ICEwO1xyXG4gICAgICB9KTttKGQpLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICB2YXIgZCA9IHooYiwgRChTLCBhIHx8IHt9KSk7ZC50YXJnZXRzID0gZC50YXJnZXRzIHx8IGEudGFyZ2V0cztiID0gYy5kdXJhdGlvbjt2YXIgZSA9IGQub2Zmc2V0O2QuYXV0b3BsYXkgPSAhMTtkLmRpcmVjdGlvbiA9IGMuZGlyZWN0aW9uO2Qub2Zmc2V0ID0gaC51bmQoZSkgPyBiIDogTChlLCBiKTtjLmJlZ2FuID0gITA7Yy5jb21wbGV0ZWQgPSAhMDtjLnNlZWsoZC5vZmZzZXQpO2QgPSBxKGQpO2QuYmVnYW4gPSAhMDtkLmNvbXBsZXRlZCA9ICEwO2QuZHVyYXRpb24gPiBiICYmIChjLmR1cmF0aW9uID0gZC5kdXJhdGlvbik7Yy5jaGlsZHJlbi5wdXNoKGQpO1xyXG4gICAgICB9KTtjLnNlZWsoMCk7Yy5yZXNldCgpO2MuYXV0b3BsYXkgJiYgYy5yZXN0YXJ0KCk7cmV0dXJuIGM7XHJcbiAgICB9O3JldHVybiBjO1xyXG4gIH07cS5yYW5kb20gPSBmdW5jdGlvbiAoYSwgYykge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChjIC0gYSArIDEpKSArIGE7XHJcbiAgfTtyZXR1cm4gcTtcclxufSk7XHJcbjsoZnVuY3Rpb24gKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBhY2NvcmRpb246IHRydWUsXHJcbiAgICBvbk9wZW5TdGFydDogdW5kZWZpbmVkLFxyXG4gICAgb25PcGVuRW5kOiB1bmRlZmluZWQsXHJcbiAgICBvbkNsb3NlU3RhcnQ6IHVuZGVmaW5lZCxcclxuICAgIG9uQ2xvc2VFbmQ6IHVuZGVmaW5lZCxcclxuICAgIGluRHVyYXRpb246IDMwMCxcclxuICAgIG91dER1cmF0aW9uOiAzMDBcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG5cclxuICB2YXIgQ29sbGFwc2libGUgPSBmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xyXG4gICAgX2luaGVyaXRzKENvbGxhcHNpYmxlLCBfQ29tcG9uZW50KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBDb2xsYXBzaWJsZSBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBDb2xsYXBzaWJsZShlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29sbGFwc2libGUpO1xyXG5cclxuICAgICAgdmFyIF90aGlzMyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDb2xsYXBzaWJsZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbGxhcHNpYmxlKSkuY2FsbCh0aGlzLCBDb2xsYXBzaWJsZSwgZWwsIG9wdGlvbnMpKTtcclxuXHJcbiAgICAgIF90aGlzMy5lbC5NX0NvbGxhcHNpYmxlID0gX3RoaXMzO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBjb2xsYXBzaWJsZVxyXG4gICAgICAgKiBAbWVtYmVyIENvbGxhcHNpYmxlI29wdGlvbnNcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFthY2NvcmRpb249ZmFsc2VdIC0gVHlwZSBvZiB0aGUgY29sbGFwc2libGVcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5TdGFydCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBiZWZvcmUgY29sbGFwc2libGUgaXMgb3BlbmVkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25PcGVuRW5kIC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGFmdGVyIGNvbGxhcHNpYmxlIGlzIG9wZW5lZFxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2VTdGFydCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBiZWZvcmUgY29sbGFwc2libGUgaXMgY2xvc2VkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZUVuZCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBjb2xsYXBzaWJsZSBpcyBjbG9zZWRcclxuICAgICAgICogQHByb3Age051bWJlcn0gaW5EdXJhdGlvbiAtIFRyYW5zaXRpb24gaW4gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzLlxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBvdXREdXJhdGlvbiAtIFRyYW5zaXRpb24gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzLlxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXMzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2libGUuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gU2V0dXAgdGFiIGluZGljZXNcclxuICAgICAgX3RoaXMzLiRoZWFkZXJzID0gX3RoaXMzLiRlbC5jaGlsZHJlbignbGknKS5jaGlsZHJlbignLmNvbGxhcHNpYmxlLWhlYWRlcicpO1xyXG4gICAgICBfdGhpczMuJGhlYWRlcnMuYXR0cigndGFiaW5kZXgnLCAwKTtcclxuXHJcbiAgICAgIF90aGlzMy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcblxyXG4gICAgICAvLyBPcGVuIGZpcnN0IGFjdGl2ZVxyXG4gICAgICB2YXIgJGFjdGl2ZUJvZGllcyA9IF90aGlzMy4kZWwuY2hpbGRyZW4oJ2xpLmFjdGl2ZScpLmNoaWxkcmVuKCcuY29sbGFwc2libGUtYm9keScpO1xyXG4gICAgICBpZiAoX3RoaXMzLm9wdGlvbnMuYWNjb3JkaW9uKSB7XHJcbiAgICAgICAgLy8gSGFuZGxlIEFjY29yZGlvblxyXG4gICAgICAgICRhY3RpdmVCb2RpZXMuZmlyc3QoKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBIYW5kbGUgRXhwYW5kYWJsZXNcclxuICAgICAgICAkYWN0aXZlQm9kaWVzLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBfdGhpczM7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKENvbGxhcHNpYmxlLCBbe1xyXG4gICAgICBrZXk6IFwiZGVzdHJveVwiLFxyXG5cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAgICovXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLmVsLk1fQ29sbGFwc2libGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ29sbGFwc2libGVLZXlkb3duQm91bmQgPSB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUtleWRvd24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlQ29sbGFwc2libGVDbGlja0JvdW5kKTtcclxuICAgICAgICB0aGlzLiRoZWFkZXJzLmVhY2goZnVuY3Rpb24gKGhlYWRlcikge1xyXG4gICAgICAgICAgaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBfdGhpczQuX2hhbmRsZUNvbGxhcHNpYmxlS2V5ZG93bkJvdW5kKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrQm91bmQpO1xyXG4gICAgICAgIHRoaXMuJGhlYWRlcnMuZWFjaChmdW5jdGlvbiAoaGVhZGVyKSB7XHJcbiAgICAgICAgICBoZWFkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIF90aGlzNS5faGFuZGxlQ29sbGFwc2libGVLZXlkb3duQm91bmQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIENvbGxhcHNpYmxlIENsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUNvbGxhcHNpYmxlQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVDb2xsYXBzaWJsZUNsaWNrKGUpIHtcclxuICAgICAgICB2YXIgJGhlYWRlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5jb2xsYXBzaWJsZS1oZWFkZXInKTtcclxuICAgICAgICBpZiAoZS50YXJnZXQgJiYgJGhlYWRlci5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciAkY29sbGFwc2libGUgPSAkaGVhZGVyLmNsb3Nlc3QoJy5jb2xsYXBzaWJsZScpO1xyXG4gICAgICAgICAgaWYgKCRjb2xsYXBzaWJsZVswXSA9PT0gdGhpcy5lbCkge1xyXG4gICAgICAgICAgICB2YXIgJGNvbGxhcHNpYmxlTGkgPSAkaGVhZGVyLmNsb3Nlc3QoJ2xpJyk7XHJcbiAgICAgICAgICAgIHZhciAkY29sbGFwc2libGVMaXMgPSAkY29sbGFwc2libGUuY2hpbGRyZW4oJ2xpJyk7XHJcbiAgICAgICAgICAgIHZhciBpc0FjdGl2ZSA9ICRjb2xsYXBzaWJsZUxpWzBdLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9ICRjb2xsYXBzaWJsZUxpcy5pbmRleCgkY29sbGFwc2libGVMaSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgICB0aGlzLmNsb3NlKGluZGV4KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLm9wZW4oaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIENvbGxhcHNpYmxlIEtleWRvd25cclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ29sbGFwc2libGVLZXlkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ29sbGFwc2libGVLZXlkb3duKGUpIHtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgdGhpcy5faGFuZGxlQ29sbGFwc2libGVDbGlja0JvdW5kKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFuaW1hdGUgaW4gY29sbGFwc2libGUgc2xpZGVcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gMHRoIGluZGV4IG9mIHNsaWRlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hbmltYXRlSW5cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlSW4oaW5kZXgpIHtcclxuICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyICRjb2xsYXBzaWJsZUxpID0gdGhpcy4kZWwuY2hpbGRyZW4oJ2xpJykuZXEoaW5kZXgpO1xyXG4gICAgICAgIGlmICgkY29sbGFwc2libGVMaS5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciAkYm9keSA9ICRjb2xsYXBzaWJsZUxpLmNoaWxkcmVuKCcuY29sbGFwc2libGUtYm9keScpO1xyXG5cclxuICAgICAgICAgIGFuaW0ucmVtb3ZlKCRib2R5WzBdKTtcclxuICAgICAgICAgICRib2R5LmNzcyh7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgICAgICAgICAgaGVpZ2h0OiAwLFxyXG4gICAgICAgICAgICBwYWRkaW5nVG9wOiAnJyxcclxuICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJydcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHZhciBwVG9wID0gJGJvZHkuY3NzKCdwYWRkaW5nLXRvcCcpO1xyXG4gICAgICAgICAgdmFyIHBCb3R0b20gPSAkYm9keS5jc3MoJ3BhZGRpbmctYm90dG9tJyk7XHJcbiAgICAgICAgICB2YXIgZmluYWxIZWlnaHQgPSAkYm9keVswXS5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAkYm9keS5jc3Moe1xyXG4gICAgICAgICAgICBwYWRkaW5nVG9wOiAwLFxyXG4gICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAwXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgdGFyZ2V0czogJGJvZHlbMF0sXHJcbiAgICAgICAgICAgIGhlaWdodDogZmluYWxIZWlnaHQsXHJcbiAgICAgICAgICAgIHBhZGRpbmdUb3A6IHBUb3AsXHJcbiAgICAgICAgICAgIHBhZGRpbmdCb3R0b206IHBCb3R0b20sXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICAgICAgZWFzaW5nOiAnZWFzZUluT3V0Q3ViaWMnLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKGFuaW0pIHtcclxuICAgICAgICAgICAgICAkYm9keS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICcnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJycsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnJyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJydcclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczYub3B0aW9ucy5vbk9wZW5FbmQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzNi5vcHRpb25zLm9uT3BlbkVuZC5jYWxsKF90aGlzNiwgJGNvbGxhcHNpYmxlTGlbMF0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQW5pbWF0ZSBvdXQgY29sbGFwc2libGUgc2xpZGVcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gMHRoIGluZGV4IG9mIHNsaWRlIHRvIG9wZW5cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVPdXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlT3V0KGluZGV4KSB7XHJcbiAgICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZhciAkY29sbGFwc2libGVMaSA9IHRoaXMuJGVsLmNoaWxkcmVuKCdsaScpLmVxKGluZGV4KTtcclxuICAgICAgICBpZiAoJGNvbGxhcHNpYmxlTGkubGVuZ3RoKSB7XHJcbiAgICAgICAgICB2YXIgJGJvZHkgPSAkY29sbGFwc2libGVMaS5jaGlsZHJlbignLmNvbGxhcHNpYmxlLWJvZHknKTtcclxuICAgICAgICAgIGFuaW0ucmVtb3ZlKCRib2R5WzBdKTtcclxuICAgICAgICAgICRib2R5LmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XHJcbiAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgdGFyZ2V0czogJGJvZHlbMF0sXHJcbiAgICAgICAgICAgIGhlaWdodDogMCxcclxuICAgICAgICAgICAgcGFkZGluZ1RvcDogMCxcclxuICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogMCxcclxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5vdXREdXJhdGlvbixcclxuICAgICAgICAgICAgZWFzaW5nOiAnZWFzZUluT3V0Q3ViaWMnLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICRib2R5LmNzcyh7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICcnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJycsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnJ1xyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAvLyBvbkNsb3NlRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczcub3B0aW9ucy5vbkNsb3NlRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpczcub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwoX3RoaXM3LCAkY29sbGFwc2libGVMaVswXSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcGVuIENvbGxhcHNpYmxlXHJcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIDB0aCBpbmRleCBvZiBzbGlkZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJvcGVuXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKGluZGV4KSB7XHJcbiAgICAgICAgdmFyIF90aGlzOCA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZhciAkY29sbGFwc2libGVMaSA9IHRoaXMuJGVsLmNoaWxkcmVuKCdsaScpLmVxKGluZGV4KTtcclxuICAgICAgICBpZiAoJGNvbGxhcHNpYmxlTGkubGVuZ3RoICYmICEkY29sbGFwc2libGVMaVswXS5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XHJcbiAgICAgICAgICAvLyBvbk9wZW5TdGFydCBjYWxsYmFja1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0LmNhbGwodGhpcywgJGNvbGxhcHNpYmxlTGlbMF0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEhhbmRsZSBhY2NvcmRpb24gYmVoYXZpb3JcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjb3JkaW9uKSB7XHJcbiAgICAgICAgICAgIHZhciAkY29sbGFwc2libGVMaXMgPSB0aGlzLiRlbC5jaGlsZHJlbignbGknKTtcclxuICAgICAgICAgICAgdmFyICRhY3RpdmVMaXMgPSB0aGlzLiRlbC5jaGlsZHJlbignbGkuYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICRhY3RpdmVMaXMuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkY29sbGFwc2libGVMaXMuaW5kZXgoJChlbCkpO1xyXG4gICAgICAgICAgICAgIF90aGlzOC5jbG9zZShpbmRleCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEFuaW1hdGUgaW5cclxuICAgICAgICAgICRjb2xsYXBzaWJsZUxpWzBdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZUluKGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDbG9zZSBDb2xsYXBzaWJsZVxyXG4gICAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSAwdGggaW5kZXggb2Ygc2xpZGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiY2xvc2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKGluZGV4KSB7XHJcbiAgICAgICAgdmFyICRjb2xsYXBzaWJsZUxpID0gdGhpcy4kZWwuY2hpbGRyZW4oJ2xpJykuZXEoaW5kZXgpO1xyXG4gICAgICAgIGlmICgkY29sbGFwc2libGVMaS5sZW5ndGggJiYgJGNvbGxhcHNpYmxlTGlbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xyXG4gICAgICAgICAgLy8gb25DbG9zZVN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydC5jYWxsKHRoaXMsICRjb2xsYXBzaWJsZUxpWzBdKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBbmltYXRlIG91dFxyXG4gICAgICAgICAgJGNvbGxhcHNpYmxlTGlbMF0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XHJcbiAgICAgICAgICB0aGlzLl9hbmltYXRlT3V0KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChDb2xsYXBzaWJsZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbGxhcHNpYmxlKSwgXCJpbml0XCIsIHRoaXMpLmNhbGwodGhpcywgdGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnZXRJbnN0YW5jZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgICB2YXIgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgICByZXR1cm4gZG9tRWxlbS5NX0NvbGxhcHNpYmxlO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIENvbGxhcHNpYmxlO1xyXG4gIH0oQ29tcG9uZW50KTtcclxuXHJcbiAgTS5Db2xsYXBzaWJsZSA9IENvbGxhcHNpYmxlO1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoQ29sbGFwc2libGUsICdjb2xsYXBzaWJsZScsICdNX0NvbGxhcHNpYmxlJyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuOyhmdW5jdGlvbiAoJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIGFsaWdubWVudDogJ2xlZnQnLFxyXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxyXG4gICAgY29uc3RyYWluV2lkdGg6IHRydWUsXHJcbiAgICBjb250YWluZXI6IG51bGwsXHJcbiAgICBjb3ZlclRyaWdnZXI6IHRydWUsXHJcbiAgICBjbG9zZU9uQ2xpY2s6IHRydWUsXHJcbiAgICBob3ZlcjogZmFsc2UsXHJcbiAgICBpbkR1cmF0aW9uOiAxNTAsXHJcbiAgICBvdXREdXJhdGlvbjogMjUwLFxyXG4gICAgb25PcGVuU3RhcnQ6IG51bGwsXHJcbiAgICBvbk9wZW5FbmQ6IG51bGwsXHJcbiAgICBvbkNsb3NlU3RhcnQ6IG51bGwsXHJcbiAgICBvbkNsb3NlRW5kOiBudWxsLFxyXG4gICAgb25JdGVtQ2xpY2s6IG51bGxcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKi9cclxuXHJcbiAgdmFyIERyb3Bkb3duID0gZnVuY3Rpb24gKF9Db21wb25lbnQyKSB7XHJcbiAgICBfaW5oZXJpdHMoRHJvcGRvd24sIF9Db21wb25lbnQyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBEcm9wZG93bihlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcGRvd24pO1xyXG5cclxuICAgICAgdmFyIF90aGlzOSA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChEcm9wZG93bi5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKERyb3Bkb3duKSkuY2FsbCh0aGlzLCBEcm9wZG93biwgZWwsIG9wdGlvbnMpKTtcclxuXHJcbiAgICAgIF90aGlzOS5lbC5NX0Ryb3Bkb3duID0gX3RoaXM5O1xyXG4gICAgICBEcm9wZG93bi5fZHJvcGRvd25zLnB1c2goX3RoaXM5KTtcclxuXHJcbiAgICAgIF90aGlzOS5pZCA9IE0uZ2V0SWRGcm9tVHJpZ2dlcihlbCk7XHJcbiAgICAgIF90aGlzOS5kcm9wZG93bkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoX3RoaXM5LmlkKTtcclxuICAgICAgX3RoaXM5LiRkcm9wZG93bkVsID0gJChfdGhpczkuZHJvcGRvd25FbCk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIGRyb3Bkb3duXHJcbiAgICAgICAqIEBtZW1iZXIgRHJvcGRvd24jb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7U3RyaW5nfSBbYWxpZ25tZW50PSdsZWZ0J10gLSBFZGdlIHdoaWNoIHRoZSBkcm9wZG93biBpcyBhbGlnbmVkIHRvXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBbYXV0b0ZvY3VzPXRydWVdIC0gQXV0b21hdGljYWxseSBmb2N1cyBkcm9wZG93biBlbCBmb3Iga2V5Ym9hcmRcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtjb25zdHJhaW5XaWR0aD10cnVlXSAtIENvbnN0cmFpbiB3aWR0aCB0byB3aWR0aCBvZiB0aGUgYnV0dG9uXHJcbiAgICAgICAqIEBwcm9wIHtFbGVtZW50fSBjb250YWluZXIgLSBDb250YWluZXIgZWxlbWVudCB0byBhdHRhY2ggZHJvcGRvd24gdG8gKG9wdGlvbmFsKVxyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW2NvdmVyVHJpZ2dlcj10cnVlXSAtIFBsYWNlIGRyb3Bkb3duIG92ZXIgdHJpZ2dlclxyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW2Nsb3NlT25DbGljaz10cnVlXSAtIENsb3NlIG9uIGNsaWNrIG9mIGRyb3Bkb3duIGl0ZW1cclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtob3Zlcj1mYWxzZV0gLSBPcGVuIGRyb3Bkb3duIG9uIGhvdmVyXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtpbkR1cmF0aW9uPTE1MF0gLSBEdXJhdGlvbiBvZiBvcGVuIGFuaW1hdGlvbiBpbiBtc1xyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbb3V0RHVyYXRpb249MjUwXSAtIER1cmF0aW9uIG9mIGNsb3NlIGFuaW1hdGlvbiBpbiBtc1xyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlblN0YXJ0IC0gRnVuY3Rpb24gY2FsbGVkIHdoZW4gZHJvcGRvd24gc3RhcnRzIG9wZW5pbmdcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5FbmQgLSBGdW5jdGlvbiBjYWxsZWQgd2hlbiBkcm9wZG93biBmaW5pc2hlcyBvcGVuaW5nXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZVN0YXJ0IC0gRnVuY3Rpb24gY2FsbGVkIHdoZW4gZHJvcGRvd24gc3RhcnRzIGNsb3NpbmdcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkNsb3NlRW5kIC0gRnVuY3Rpb24gY2FsbGVkIHdoZW4gZHJvcGRvd24gZmluaXNoZXMgY2xvc2luZ1xyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXM5Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd24uZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBvcGVuL2Nsb3NlIHN0YXRlIG9mIGRyb3Bkb3duXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXM5LmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBpZiBkcm9wZG93biBjb250ZW50IGlzIHNjcm9sbGFibGVcclxuICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAqL1xyXG4gICAgICBfdGhpczkuaXNTY3JvbGxhYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGVzY3JpYmVzIGlmIHRvdWNoIG1vdmluZyBvbiBkcm9wZG93biBjb250ZW50XHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXM5LmlzVG91Y2hNb3ZpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgIF90aGlzOS5mb2N1c2VkSW5kZXggPSAtMTtcclxuICAgICAgX3RoaXM5LmZpbHRlclF1ZXJ5ID0gW107XHJcblxyXG4gICAgICAvLyBNb3ZlIGRyb3Bkb3duLWNvbnRlbnQgYWZ0ZXIgZHJvcGRvd24tdHJpZ2dlclxyXG4gICAgICBpZiAoISFfdGhpczkub3B0aW9ucy5jb250YWluZXIpIHtcclxuICAgICAgICAkKF90aGlzOS5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKF90aGlzOS5kcm9wZG93bkVsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfdGhpczkuJGVsLmFmdGVyKF90aGlzOS5kcm9wZG93bkVsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgX3RoaXM5Ll9tYWtlRHJvcGRvd25Gb2N1c2FibGUoKTtcclxuICAgICAgX3RoaXM5Ll9yZXNldEZpbHRlclF1ZXJ5Qm91bmQgPSBfdGhpczkuX3Jlc2V0RmlsdGVyUXVlcnkuYmluZChfdGhpczkpO1xyXG4gICAgICBfdGhpczkuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCA9IF90aGlzOS5faGFuZGxlRG9jdW1lbnRDbGljay5iaW5kKF90aGlzOSk7XHJcbiAgICAgIF90aGlzOS5faGFuZGxlRG9jdW1lbnRUb3VjaG1vdmVCb3VuZCA9IF90aGlzOS5faGFuZGxlRG9jdW1lbnRUb3VjaG1vdmUuYmluZChfdGhpczkpO1xyXG4gICAgICBfdGhpczkuX2hhbmRsZURyb3Bkb3duQ2xpY2tCb3VuZCA9IF90aGlzOS5faGFuZGxlRHJvcGRvd25DbGljay5iaW5kKF90aGlzOSk7XHJcbiAgICAgIF90aGlzOS5faGFuZGxlRHJvcGRvd25LZXlkb3duQm91bmQgPSBfdGhpczkuX2hhbmRsZURyb3Bkb3duS2V5ZG93bi5iaW5kKF90aGlzOSk7XHJcbiAgICAgIF90aGlzOS5faGFuZGxlVHJpZ2dlcktleWRvd25Cb3VuZCA9IF90aGlzOS5faGFuZGxlVHJpZ2dlcktleWRvd24uYmluZChfdGhpczkpO1xyXG4gICAgICBfdGhpczkuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICByZXR1cm4gX3RoaXM5O1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhEcm9wZG93biwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZXNldERyb3Bkb3duU3R5bGVzKCk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIERyb3Bkb3duLl9kcm9wZG93bnMuc3BsaWNlKERyb3Bkb3duLl9kcm9wZG93bnMuaW5kZXhPZih0aGlzKSwgMSk7XHJcbiAgICAgICAgdGhpcy5lbC5NX0Ryb3Bkb3duID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICAvLyBUcmlnZ2VyIGtleWRvd24gaGFuZGxlclxyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZVRyaWdnZXJLZXlkb3duQm91bmQpO1xyXG5cclxuICAgICAgICAvLyBJdGVtIGNsaWNrIGhhbmRsZXJcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVEcm9wZG93bkNsaWNrQm91bmQpO1xyXG5cclxuICAgICAgICAvLyBIb3ZlciBldmVudCBoYW5kbGVyc1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaG92ZXIpIHtcclxuICAgICAgICAgIHRoaXMuX2hhbmRsZU1vdXNlRW50ZXJCb3VuZCA9IHRoaXMuX2hhbmRsZU1vdXNlRW50ZXIuYmluZCh0aGlzKTtcclxuICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2hhbmRsZU1vdXNlRW50ZXJCb3VuZCk7XHJcbiAgICAgICAgICB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQgPSB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQpO1xyXG4gICAgICAgICAgdGhpcy5kcm9wZG93bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQpO1xyXG5cclxuICAgICAgICAgIC8vIENsaWNrIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuX2hhbmRsZUNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUNsaWNrQm91bmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlVHJpZ2dlcktleWRvd25Cb3VuZCk7XHJcbiAgICAgICAgdGhpcy5kcm9wZG93bkVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRHJvcGRvd25DbGlja0JvdW5kKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ob3Zlcikge1xyXG4gICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kKTtcclxuICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZU1vdXNlTGVhdmVCb3VuZCk7XHJcbiAgICAgICAgICB0aGlzLmRyb3Bkb3duRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZU1vdXNlTGVhdmVCb3VuZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDbGlja0JvdW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cFRlbXBvcmFyeUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cFRlbXBvcmFyeUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgLy8gVXNlIGNhcHR1cmUgcGhhc2UgZXZlbnQgaGFuZGxlciB0byBwcmV2ZW50IGNsaWNrXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVEb2N1bWVudFRvdWNobW92ZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZURyb3Bkb3duS2V5ZG93bkJvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZVRlbXBvcmFyeUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVUZW1wb3JhcnlFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIC8vIFVzZSBjYXB0dXJlIHBoYXNlIGV2ZW50IGhhbmRsZXIgdG8gcHJldmVudCBjbGlja1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQsIHRydWUpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlRG9jdW1lbnRUb3VjaG1vdmVCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5kcm9wZG93bkVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVEcm9wZG93bktleWRvd25Cb3VuZCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDbGlja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUNsaWNrKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVNb3VzZUVudGVyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlTW91c2VFbnRlcigpIHtcclxuICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZU1vdXNlTGVhdmVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVNb3VzZUxlYXZlKGUpIHtcclxuICAgICAgICB2YXIgdG9FbCA9IGUudG9FbGVtZW50IHx8IGUucmVsYXRlZFRhcmdldDtcclxuICAgICAgICB2YXIgbGVhdmVUb0Ryb3Bkb3duQ29udGVudCA9ICEhJCh0b0VsKS5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aDtcclxuICAgICAgICB2YXIgbGVhdmVUb0FjdGl2ZURyb3Bkb3duVHJpZ2dlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgJGNsb3Nlc3RUcmlnZ2VyID0gJCh0b0VsKS5jbG9zZXN0KCcuZHJvcGRvd24tdHJpZ2dlcicpO1xyXG4gICAgICAgIGlmICgkY2xvc2VzdFRyaWdnZXIubGVuZ3RoICYmICEhJGNsb3Nlc3RUcmlnZ2VyWzBdLk1fRHJvcGRvd24gJiYgJGNsb3Nlc3RUcmlnZ2VyWzBdLk1fRHJvcGRvd24uaXNPcGVuKSB7XHJcbiAgICAgICAgICBsZWF2ZVRvQWN0aXZlRHJvcGRvd25UcmlnZ2VyID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsb3NlIGhvdmVyIGRyb3Bkb3duIGlmIG1vdXNlIGRpZCBub3QgbGVhdmUgdG8gZWl0aGVyIGFjdGl2ZSBkcm9wZG93bi10cmlnZ2VyIG9yIGRyb3Bkb3duLWNvbnRlbnRcclxuICAgICAgICBpZiAoIWxlYXZlVG9BY3RpdmVEcm9wZG93blRyaWdnZXIgJiYgIWxlYXZlVG9Ecm9wZG93bkNvbnRlbnQpIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVEb2N1bWVudENsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlRG9jdW1lbnRDbGljayhlKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMTAgPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrICYmICR0YXJnZXQuY2xvc2VzdCgnLmRyb3Bkb3duLWNvbnRlbnQnKS5sZW5ndGggJiYgIXRoaXMuaXNUb3VjaE1vdmluZykge1xyXG4gICAgICAgICAgLy8gaXNUb3VjaE1vdmluZyB0byBjaGVjayBpZiBzY3JvbGxpbmcgb24gbW9iaWxlLlxyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzMTAuY2xvc2UoKTtcclxuICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tdHJpZ2dlcicpLmxlbmd0aCB8fCAhJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aCkge1xyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzMTAuY2xvc2UoKTtcclxuICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmlzVG91Y2hNb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVRyaWdnZXJLZXlkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlVHJpZ2dlcktleWRvd24oZSkge1xyXG4gICAgICAgIC8vIEFSUk9XIERPV04gT1IgRU5URVIgV0hFTiBTRUxFQ1QgSVMgQ0xPU0VEIC0gb3BlbiBEcm9wZG93blxyXG4gICAgICAgIGlmICgoZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX0RPV04gfHwgZS53aGljaCA9PT0gTS5rZXlzLkVOVEVSKSAmJiAhdGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBEb2N1bWVudCBUb3VjaG1vdmVcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlRG9jdW1lbnRUb3VjaG1vdmVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVEb2N1bWVudFRvdWNobW92ZShlKSB7XHJcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICBpZiAoJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5pc1RvdWNoTW92aW5nID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgRHJvcGRvd24gQ2xpY2tcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlRHJvcGRvd25DbGlja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZURyb3Bkb3duQ2xpY2soZSkge1xyXG4gICAgICAgIC8vIG9uSXRlbUNsaWNrIGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25JdGVtQ2xpY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHZhciBpdGVtRWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaScpWzBdO1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uSXRlbUNsaWNrLmNhbGwodGhpcywgaXRlbUVsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgRHJvcGRvd24gS2V5ZG93blxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVEcm9wZG93bktleWRvd25cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVEcm9wZG93bktleWRvd24oZSkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSBNLmtleXMuVEFCKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgICAgLy8gTmF2aWdhdGUgZG93biBkcm9wZG93biBsaXN0XHJcbiAgICAgICAgfSBlbHNlIGlmICgoZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX0RPV04gfHwgZS53aGljaCA9PT0gTS5rZXlzLkFSUk9XX1VQKSAmJiB0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGUud2hpY2ggPT09IE0ua2V5cy5BUlJPV19ET1dOID8gMSA6IC0xO1xyXG4gICAgICAgICAgdmFyIG5ld0ZvY3VzZWRJbmRleCA9IHRoaXMuZm9jdXNlZEluZGV4O1xyXG4gICAgICAgICAgdmFyIGZvdW5kTmV3SW5kZXggPSBmYWxzZTtcclxuICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbmV3Rm9jdXNlZEluZGV4ID0gbmV3Rm9jdXNlZEluZGV4ICsgZGlyZWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEhdGhpcy5kcm9wZG93bkVsLmNoaWxkcmVuW25ld0ZvY3VzZWRJbmRleF0gJiYgdGhpcy5kcm9wZG93bkVsLmNoaWxkcmVuW25ld0ZvY3VzZWRJbmRleF0udGFiSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZm91bmROZXdJbmRleCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gd2hpbGUgKG5ld0ZvY3VzZWRJbmRleCA8IHRoaXMuZHJvcGRvd25FbC5jaGlsZHJlbi5sZW5ndGggJiYgbmV3Rm9jdXNlZEluZGV4ID49IDApO1xyXG5cclxuICAgICAgICAgIGlmIChmb3VuZE5ld0luZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZEluZGV4ID0gbmV3Rm9jdXNlZEluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLl9mb2N1c0ZvY3VzZWRJdGVtKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRU5URVIgc2VsZWN0cyBjaG9pY2Ugb24gZm9jdXNlZCBpdGVtXHJcbiAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSBNLmtleXMuRU5URVIgJiYgdGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIC8vIFNlYXJjaCBmb3IgPGE+IGFuZCA8YnV0dG9uPlxyXG4gICAgICAgICAgdmFyIGZvY3VzZWRFbGVtZW50ID0gdGhpcy5kcm9wZG93bkVsLmNoaWxkcmVuW3RoaXMuZm9jdXNlZEluZGV4XTtcclxuICAgICAgICAgIHZhciAkYWN0aXZhdGFibGVFbGVtZW50ID0gJChmb2N1c2VkRWxlbWVudCkuZmluZCgnYSwgYnV0dG9uJykuZmlyc3QoKTtcclxuXHJcbiAgICAgICAgICAvLyBDbGljayBhIG9yIGJ1dHRvbiB0YWcgaWYgZXhpc3RzLCBvdGhlcndpc2UgY2xpY2sgbGkgdGFnXHJcbiAgICAgICAgICBpZiAoISEkYWN0aXZhdGFibGVFbGVtZW50Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkYWN0aXZhdGFibGVFbGVtZW50WzBdLmNsaWNrKCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCEhZm9jdXNlZEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZm9jdXNlZEVsZW1lbnQuY2xpY2soKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBDbG9zZSBkcm9wZG93biBvbiBFU0NcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IE0ua2V5cy5FU0MgJiYgdGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENBU0UgV0hFTiBVU0VSIFRZUEUgTEVUVEVSU1xyXG4gICAgICAgIHZhciBsZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGUud2hpY2gpLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgIG5vbkxldHRlcnMgPSBbOSwgMTMsIDI3LCAzOCwgNDBdO1xyXG4gICAgICAgIGlmIChsZXR0ZXIgJiYgbm9uTGV0dGVycy5pbmRleE9mKGUud2hpY2gpID09PSAtMSkge1xyXG4gICAgICAgICAgdGhpcy5maWx0ZXJRdWVyeS5wdXNoKGxldHRlcik7XHJcblxyXG4gICAgICAgICAgdmFyIHN0cmluZyA9IHRoaXMuZmlsdGVyUXVlcnkuam9pbignJyksXHJcbiAgICAgICAgICAgICAgbmV3T3B0aW9uRWwgPSAkKHRoaXMuZHJvcGRvd25FbCkuZmluZCgnbGknKS5maWx0ZXIoZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKGVsKS50ZXh0KCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHN0cmluZykgPT09IDA7XHJcbiAgICAgICAgICB9KVswXTtcclxuXHJcbiAgICAgICAgICBpZiAobmV3T3B0aW9uRWwpIHtcclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkSW5kZXggPSAkKG5ld09wdGlvbkVsKS5pbmRleCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mb2N1c0ZvY3VzZWRJdGVtKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZpbHRlclRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuX3Jlc2V0RmlsdGVyUXVlcnlCb3VuZCwgMTAwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBkcm9wZG93blxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVzZXRGaWx0ZXJRdWVyeVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3Jlc2V0RmlsdGVyUXVlcnkoKSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJRdWVyeSA9IFtdO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVzZXREcm9wZG93blN0eWxlc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3Jlc2V0RHJvcGRvd25TdHlsZXMoKSB7XHJcbiAgICAgICAgdGhpcy4kZHJvcGRvd25FbC5jc3Moe1xyXG4gICAgICAgICAgZGlzcGxheTogJycsXHJcbiAgICAgICAgICB3aWR0aDogJycsXHJcbiAgICAgICAgICBoZWlnaHQ6ICcnLFxyXG4gICAgICAgICAgbGVmdDogJycsXHJcbiAgICAgICAgICB0b3A6ICcnLFxyXG4gICAgICAgICAgJ3RyYW5zZm9ybS1vcmlnaW4nOiAnJyxcclxuICAgICAgICAgIHRyYW5zZm9ybTogJycsXHJcbiAgICAgICAgICBvcGFjaXR5OiAnJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfbWFrZURyb3Bkb3duRm9jdXNhYmxlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfbWFrZURyb3Bkb3duRm9jdXNhYmxlKCkge1xyXG4gICAgICAgIC8vIE5lZWRlZCBmb3IgYXJyb3cga2V5IG5hdmlnYXRpb25cclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwudGFiSW5kZXggPSAwO1xyXG5cclxuICAgICAgICAvLyBPbmx5IHNldCB0YWJpbmRleCBpZiBpdCBoYXNuJ3QgYmVlbiBzZXQgYnkgdXNlclxyXG4gICAgICAgICQodGhpcy5kcm9wZG93bkVsKS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICBpZiAoIWVsLmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKSkge1xyXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgMCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9mb2N1c0ZvY3VzZWRJdGVtXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZm9jdXNGb2N1c2VkSXRlbSgpIHtcclxuICAgICAgICBpZiAodGhpcy5mb2N1c2VkSW5kZXggPj0gMCAmJiB0aGlzLmZvY3VzZWRJbmRleCA8IHRoaXMuZHJvcGRvd25FbC5jaGlsZHJlbi5sZW5ndGggJiYgdGhpcy5vcHRpb25zLmF1dG9Gb2N1cykge1xyXG4gICAgICAgICAgdGhpcy5kcm9wZG93bkVsLmNoaWxkcmVuW3RoaXMuZm9jdXNlZEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2dldERyb3Bkb3duUG9zaXRpb25cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9nZXREcm9wZG93blBvc2l0aW9uKCkge1xyXG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnRCUmVjdCA9IHRoaXMuZWwub2Zmc2V0UGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHZhciB0cmlnZ2VyQlJlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHZhciBkcm9wZG93bkJSZWN0ID0gdGhpcy5kcm9wZG93bkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICB2YXIgaWRlYWxIZWlnaHQgPSBkcm9wZG93bkJSZWN0LmhlaWdodDtcclxuICAgICAgICB2YXIgaWRlYWxXaWR0aCA9IGRyb3Bkb3duQlJlY3Qud2lkdGg7XHJcbiAgICAgICAgdmFyIGlkZWFsWFBvcyA9IHRyaWdnZXJCUmVjdC5sZWZ0IC0gZHJvcGRvd25CUmVjdC5sZWZ0O1xyXG4gICAgICAgIHZhciBpZGVhbFlQb3MgPSB0cmlnZ2VyQlJlY3QudG9wIC0gZHJvcGRvd25CUmVjdC50b3A7XHJcblxyXG4gICAgICAgIHZhciBkcm9wZG93bkJvdW5kcyA9IHtcclxuICAgICAgICAgIGxlZnQ6IGlkZWFsWFBvcyxcclxuICAgICAgICAgIHRvcDogaWRlYWxZUG9zLFxyXG4gICAgICAgICAgaGVpZ2h0OiBpZGVhbEhlaWdodCxcclxuICAgICAgICAgIHdpZHRoOiBpZGVhbFdpZHRoXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ291bnRhaW5lciBoZXJlIHdpbGwgYmUgY2xvc2VzdCBhbmNlc3RvciB3aXRoIG92ZXJmbG93OiBoaWRkZW5cclxuICAgICAgICB2YXIgY2xvc2VzdE92ZXJmbG93UGFyZW50ID0gISF0aGlzLmRyb3Bkb3duRWwub2Zmc2V0UGFyZW50ID8gdGhpcy5kcm9wZG93bkVsLm9mZnNldFBhcmVudCA6IHRoaXMuZHJvcGRvd25FbC5wYXJlbnROb2RlO1xyXG5cclxuICAgICAgICB2YXIgYWxpZ25tZW50cyA9IE0uY2hlY2tQb3NzaWJsZUFsaWdubWVudHModGhpcy5lbCwgY2xvc2VzdE92ZXJmbG93UGFyZW50LCBkcm9wZG93bkJvdW5kcywgdGhpcy5vcHRpb25zLmNvdmVyVHJpZ2dlciA/IDAgOiB0cmlnZ2VyQlJlY3QuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgdmFyIHZlcnRpY2FsQWxpZ25tZW50ID0gJ3RvcCc7XHJcbiAgICAgICAgdmFyIGhvcml6b250YWxBbGlnbm1lbnQgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50O1xyXG4gICAgICAgIGlkZWFsWVBvcyArPSB0aGlzLm9wdGlvbnMuY292ZXJUcmlnZ2VyID8gMCA6IHRyaWdnZXJCUmVjdC5oZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGlzU2Nyb2xsYWJsZVxyXG4gICAgICAgIHRoaXMuaXNTY3JvbGxhYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghYWxpZ25tZW50cy50b3ApIHtcclxuICAgICAgICAgIGlmIChhbGlnbm1lbnRzLmJvdHRvbSkge1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbEFsaWdubWVudCA9ICdib3R0b20nO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pc1Njcm9sbGFibGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpZGUgaGFzIG1vc3Qgc3BhY2UgYW5kIGN1dG9mZiBhdCBjb3JyZWN0IGhlaWdodFxyXG4gICAgICAgICAgICBpZiAoYWxpZ25tZW50cy5zcGFjZU9uVG9wID4gYWxpZ25tZW50cy5zcGFjZU9uQm90dG9tKSB7XHJcbiAgICAgICAgICAgICAgdmVydGljYWxBbGlnbm1lbnQgPSAnYm90dG9tJztcclxuICAgICAgICAgICAgICBpZGVhbEhlaWdodCArPSBhbGlnbm1lbnRzLnNwYWNlT25Ub3A7XHJcbiAgICAgICAgICAgICAgaWRlYWxZUG9zIC09IGFsaWdubWVudHMuc3BhY2VPblRvcDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZGVhbEhlaWdodCArPSBhbGlnbm1lbnRzLnNwYWNlT25Cb3R0b207XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHByZWZlcnJlZCBob3Jpem9udGFsIGFsaWdubWVudCBpcyBwb3NzaWJsZVxyXG4gICAgICAgIGlmICghYWxpZ25tZW50c1tob3Jpem9udGFsQWxpZ25tZW50XSkge1xyXG4gICAgICAgICAgdmFyIG9wcG9zaXRlQWxpZ25tZW50ID0gaG9yaXpvbnRhbEFsaWdubWVudCA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcclxuICAgICAgICAgIGlmIChhbGlnbm1lbnRzW29wcG9zaXRlQWxpZ25tZW50XSkge1xyXG4gICAgICAgICAgICBob3Jpem9udGFsQWxpZ25tZW50ID0gb3Bwb3NpdGVBbGlnbm1lbnQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2lkZSBoYXMgbW9zdCBzcGFjZSBhbmQgY3V0b2ZmIGF0IGNvcnJlY3QgaGVpZ2h0XHJcbiAgICAgICAgICAgIGlmIChhbGlnbm1lbnRzLnNwYWNlT25MZWZ0ID4gYWxpZ25tZW50cy5zcGFjZU9uUmlnaHQpIHtcclxuICAgICAgICAgICAgICBob3Jpem9udGFsQWxpZ25tZW50ID0gJ3JpZ2h0JztcclxuICAgICAgICAgICAgICBpZGVhbFdpZHRoICs9IGFsaWdubWVudHMuc3BhY2VPbkxlZnQ7XHJcbiAgICAgICAgICAgICAgaWRlYWxYUG9zIC09IGFsaWdubWVudHMuc3BhY2VPbkxlZnQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaG9yaXpvbnRhbEFsaWdubWVudCA9ICdsZWZ0JztcclxuICAgICAgICAgICAgICBpZGVhbFdpZHRoICs9IGFsaWdubWVudHMuc3BhY2VPblJpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmVydGljYWxBbGlnbm1lbnQgPT09ICdib3R0b20nKSB7XHJcbiAgICAgICAgICBpZGVhbFlQb3MgPSBpZGVhbFlQb3MgLSBkcm9wZG93bkJSZWN0LmhlaWdodCArICh0aGlzLm9wdGlvbnMuY292ZXJUcmlnZ2VyID8gdHJpZ2dlckJSZWN0LmhlaWdodCA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaG9yaXpvbnRhbEFsaWdubWVudCA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgaWRlYWxYUG9zID0gaWRlYWxYUG9zIC0gZHJvcGRvd25CUmVjdC53aWR0aCArIHRyaWdnZXJCUmVjdC53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHg6IGlkZWFsWFBvcyxcclxuICAgICAgICAgIHk6IGlkZWFsWVBvcyxcclxuICAgICAgICAgIHZlcnRpY2FsQWxpZ25tZW50OiB2ZXJ0aWNhbEFsaWdubWVudCxcclxuICAgICAgICAgIGhvcml6b250YWxBbGlnbm1lbnQ6IGhvcml6b250YWxBbGlnbm1lbnQsXHJcbiAgICAgICAgICBoZWlnaHQ6IGlkZWFsSGVpZ2h0LFxyXG4gICAgICAgICAgd2lkdGg6IGlkZWFsV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQW5pbWF0ZSBpbiBkcm9wZG93blxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZUluXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYW5pbWF0ZUluKCkge1xyXG4gICAgICAgIHZhciBfdGhpczExID0gdGhpcztcclxuXHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5kcm9wZG93bkVsKTtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IHRoaXMuZHJvcGRvd25FbCxcclxuICAgICAgICAgIG9wYWNpdHk6IHtcclxuICAgICAgICAgICAgdmFsdWU6IFswLCAxXSxcclxuICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NhbGVYOiBbMC4zLCAxXSxcclxuICAgICAgICAgIHNjYWxlWTogWzAuMywgMV0sXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVpbnQnLFxyXG4gICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uIChhbmltKSB7XHJcbiAgICAgICAgICAgIGlmIChfdGhpczExLm9wdGlvbnMuYXV0b0ZvY3VzKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMxMS5kcm9wZG93bkVsLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG9uT3BlbkVuZCBjYWxsYmFja1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIF90aGlzMTEub3B0aW9ucy5vbk9wZW5FbmQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICBfdGhpczExLm9wdGlvbnMub25PcGVuRW5kLmNhbGwoX3RoaXMxMSwgX3RoaXMxMS5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFuaW1hdGUgb3V0IGRyb3Bkb3duXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hbmltYXRlT3V0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYW5pbWF0ZU91dCgpIHtcclxuICAgICAgICB2YXIgX3RoaXMxMiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZHJvcGRvd25FbCk7XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLmRyb3Bkb3duRWwsXHJcbiAgICAgICAgICBvcGFjaXR5OiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVpbnQnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NhbGVYOiAwLjMsXHJcbiAgICAgICAgICBzY2FsZVk6IDAuMyxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVpbnQnLFxyXG4gICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uIChhbmltKSB7XHJcbiAgICAgICAgICAgIF90aGlzMTIuX3Jlc2V0RHJvcGRvd25TdHlsZXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG9uQ2xvc2VFbmQgY2FsbGJhY2tcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczEyLm9wdGlvbnMub25DbG9zZUVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMTIub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwoX3RoaXMxMiwgX3RoaXMxMi5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFBsYWNlIGRyb3Bkb3duXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9wbGFjZURyb3Bkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcGxhY2VEcm9wZG93bigpIHtcclxuICAgICAgICAvLyBTZXQgd2lkdGggYmVmb3JlIGNhbGN1bGF0aW5nIHBvc2l0aW9uSW5mb1xyXG4gICAgICAgIHZhciBpZGVhbFdpZHRoID0gdGhpcy5vcHRpb25zLmNvbnN0cmFpbldpZHRoID8gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCA6IHRoaXMuZHJvcGRvd25FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUud2lkdGggPSBpZGVhbFdpZHRoICsgJ3B4JztcclxuXHJcbiAgICAgICAgdmFyIHBvc2l0aW9uSW5mbyA9IHRoaXMuX2dldERyb3Bkb3duUG9zaXRpb24oKTtcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUubGVmdCA9IHBvc2l0aW9uSW5mby54ICsgJ3B4JztcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUudG9wID0gcG9zaXRpb25JbmZvLnkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuZHJvcGRvd25FbC5zdHlsZS5oZWlnaHQgPSBwb3NpdGlvbkluZm8uaGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUud2lkdGggPSBwb3NpdGlvbkluZm8ud2lkdGggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuZHJvcGRvd25FbC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAocG9zaXRpb25JbmZvLmhvcml6b250YWxBbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICcwJyA6ICcxMDAlJykgKyBcIiBcIiArIChwb3NpdGlvbkluZm8udmVydGljYWxBbGlnbm1lbnQgPT09ICd0b3AnID8gJzAnIDogJzEwMCUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wZW4gRHJvcGRvd25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwib3BlblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBvbk9wZW5TdGFydCBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuU3RhcnQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHN0eWxlc1xyXG4gICAgICAgIHRoaXMuX3Jlc2V0RHJvcGRvd25TdHlsZXMoKTtcclxuICAgICAgICB0aGlzLmRyb3Bkb3duRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgIHRoaXMuX3BsYWNlRHJvcGRvd24oKTtcclxuICAgICAgICB0aGlzLl9hbmltYXRlSW4oKTtcclxuICAgICAgICB0aGlzLl9zZXR1cFRlbXBvcmFyeUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENsb3NlIERyb3Bkb3duXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImNsb3NlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5mb2N1c2VkSW5kZXggPSAtMTtcclxuXHJcbiAgICAgICAgLy8gb25DbG9zZVN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0LmNhbGwodGhpcywgdGhpcy5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hbmltYXRlT3V0KCk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlVGVtcG9yYXJ5RXZlbnRIYW5kbGVycygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cykge1xyXG4gICAgICAgICAgdGhpcy5lbC5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlY2FsY3VsYXRlIGRpbWVuc2lvbnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwicmVjYWxjdWxhdGVEaW1lbnNpb25zXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWNhbGN1bGF0ZURpbWVuc2lvbnMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICB0aGlzLiRkcm9wZG93bkVsLmNzcyh7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnJyxcclxuICAgICAgICAgICAgaGVpZ2h0OiAnJyxcclxuICAgICAgICAgICAgbGVmdDogJycsXHJcbiAgICAgICAgICAgIHRvcDogJycsXHJcbiAgICAgICAgICAgICd0cmFuc2Zvcm0tb3JpZ2luJzogJydcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5fcGxhY2VEcm9wZG93bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfV0sIFt7XHJcbiAgICAgIGtleTogXCJpbml0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfZ2V0KERyb3Bkb3duLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRHJvcGRvd24pLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fRHJvcGRvd247XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImRlZmF1bHRzXCIsXHJcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbiAgICByZXR1cm4gRHJvcGRvd247XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIERyb3Bkb3duXHJcbiAgICovXHJcblxyXG5cclxuICBEcm9wZG93bi5fZHJvcGRvd25zID0gW107XHJcblxyXG4gIE0uRHJvcGRvd24gPSBEcm9wZG93bjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKERyb3Bkb3duLCAnZHJvcGRvd24nLCAnTV9Ecm9wZG93bicpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbjsoZnVuY3Rpb24gKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBvcGFjaXR5OiAwLjUsXHJcbiAgICBpbkR1cmF0aW9uOiAyNTAsXHJcbiAgICBvdXREdXJhdGlvbjogMjUwLFxyXG4gICAgb25PcGVuU3RhcnQ6IG51bGwsXHJcbiAgICBvbk9wZW5FbmQ6IG51bGwsXHJcbiAgICBvbkNsb3NlU3RhcnQ6IG51bGwsXHJcbiAgICBvbkNsb3NlRW5kOiBudWxsLFxyXG4gICAgcHJldmVudFNjcm9sbGluZzogdHJ1ZSxcclxuICAgIGRpc21pc3NpYmxlOiB0cnVlLFxyXG4gICAgc3RhcnRpbmdUb3A6ICc0JScsXHJcbiAgICBlbmRpbmdUb3A6ICcxMCUnXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIE1vZGFsID0gZnVuY3Rpb24gKF9Db21wb25lbnQzKSB7XHJcbiAgICBfaW5oZXJpdHMoTW9kYWwsIF9Db21wb25lbnQzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBNb2RhbCBpbnN0YW5jZSBhbmQgc2V0IHVwIG92ZXJsYXlcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gTW9kYWwoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1vZGFsKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczEzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKE1vZGFsLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTW9kYWwpKS5jYWxsKHRoaXMsIE1vZGFsLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXMxMy5lbC5NX01vZGFsID0gX3RoaXMxMztcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcHRpb25zIGZvciB0aGUgbW9kYWxcclxuICAgICAgICogQG1lbWJlciBNb2RhbCNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtvcGFjaXR5PTAuNV0gLSBPcGFjaXR5IG9mIHRoZSBtb2RhbCBvdmVybGF5XHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtpbkR1cmF0aW9uPTI1MF0gLSBMZW5ndGggaW4gbXMgb2YgZW50ZXIgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbb3V0RHVyYXRpb249MjUwXSAtIExlbmd0aCBpbiBtcyBvZiBleGl0IHRyYW5zaXRpb25cclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5TdGFydCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBiZWZvcmUgbW9kYWwgaXMgb3BlbmVkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25PcGVuRW5kIC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1vZGFsIGlzIG9wZW5lZFxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2VTdGFydCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBiZWZvcmUgbW9kYWwgaXMgY2xvc2VkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZUVuZCAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBtb2RhbCBpcyBjbG9zZWRcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtkaXNtaXNzaWJsZT10cnVlXSAtIEFsbG93IG1vZGFsIHRvIGJlIGRpc21pc3NlZCBieSBrZXlib2FyZCBvciBvdmVybGF5IGNsaWNrXHJcbiAgICAgICAqIEBwcm9wIHtTdHJpbmd9IFtzdGFydGluZ1RvcD0nNCUnXSAtIHN0YXJ0aW5nVG9wXHJcbiAgICAgICAqIEBwcm9wIHtTdHJpbmd9IFtlbmRpbmdUb3A9JzEwJSddIC0gZW5kaW5nVG9wXHJcbiAgICAgICAqL1xyXG4gICAgICBfdGhpczEzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTW9kYWwuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBvcGVuL2Nsb3NlIHN0YXRlIG9mIG1vZGFsXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXMxMy5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgIF90aGlzMTMuaWQgPSBfdGhpczEzLiRlbC5hdHRyKCdpZCcpO1xyXG4gICAgICBfdGhpczEzLl9vcGVuaW5nVHJpZ2dlciA9IHVuZGVmaW5lZDtcclxuICAgICAgX3RoaXMxMy4kb3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJtb2RhbC1vdmVybGF5XCI+PC9kaXY+Jyk7XHJcbiAgICAgIF90aGlzMTMuZWwudGFiSW5kZXggPSAwO1xyXG4gICAgICBfdGhpczEzLl9udGhNb2RhbE9wZW5lZCA9IDA7XHJcblxyXG4gICAgICBNb2RhbC5fY291bnQrKztcclxuICAgICAgX3RoaXMxMy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIHJldHVybiBfdGhpczEzO1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhNb2RhbCwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICBNb2RhbC5fY291bnQtLTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XHJcbiAgICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmVsLk1fTW9kYWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZU92ZXJsYXlDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlT3ZlcmxheUNsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlTW9kYWxDbG9zZUNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVNb2RhbENsb3NlQ2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgaWYgKE1vZGFsLl9jb3VudCA9PT0gMSkge1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRyaWdnZXJDbGljayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuJG92ZXJsYXlbMF0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVPdmVybGF5Q2xpY2tCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZU1vZGFsQ2xvc2VDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgaWYgKE1vZGFsLl9jb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRyaWdnZXJDbGljayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuJG92ZXJsYXlbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVPdmVybGF5Q2xpY2tCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZU1vZGFsQ2xvc2VDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBUcmlnZ2VyIENsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVRyaWdnZXJDbGlja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVRyaWdnZXJDbGljayhlKSB7XHJcbiAgICAgICAgdmFyICR0cmlnZ2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsLXRyaWdnZXInKTtcclxuICAgICAgICBpZiAoJHRyaWdnZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWxJZCA9IE0uZ2V0SWRGcm9tVHJpZ2dlcigkdHJpZ2dlclswXSk7XHJcbiAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vZGFsSWQpLk1fTW9kYWw7XHJcbiAgICAgICAgICBpZiAobW9kYWxJbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLm9wZW4oJHRyaWdnZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBPdmVybGF5IENsaWNrXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVPdmVybGF5Q2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVPdmVybGF5Q2xpY2soKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXNtaXNzaWJsZSkge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBNb2RhbCBDbG9zZSBDbGlja1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVNb2RhbENsb3NlQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVNb2RhbENsb3NlQ2xpY2soZSkge1xyXG4gICAgICAgIHZhciAkY2xvc2VUcmlnZ2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsLWNsb3NlJyk7XHJcbiAgICAgICAgaWYgKCRjbG9zZVRyaWdnZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIEtleWRvd25cclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlS2V5ZG93blwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUtleWRvd24oZSkge1xyXG4gICAgICAgIC8vIEVTQyBrZXlcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLm9wdGlvbnMuZGlzbWlzc2libGUpIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgRm9jdXNcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlRm9jdXNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVGb2N1cyhlKSB7XHJcbiAgICAgICAgLy8gT25seSB0cmFwIGZvY3VzIGlmIHRoaXMgbW9kYWwgaXMgdGhlIGxhc3QgbW9kZWwgb3BlbmVkIChwcmV2ZW50cyBsb29wcyBpbiBuZXN0ZWQgbW9kYWxzKS5cclxuICAgICAgICBpZiAoIXRoaXMuZWwuY29udGFpbnMoZS50YXJnZXQpICYmIHRoaXMuX250aE1vZGFsT3BlbmVkID09PSBNb2RhbC5fbW9kYWxzT3Blbikge1xyXG4gICAgICAgICAgdGhpcy5lbC5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFuaW1hdGUgaW4gbW9kYWxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVJblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVJbigpIHtcclxuICAgICAgICB2YXIgX3RoaXMxNCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIFNldCBpbml0aWFsIHN0eWxlc1xyXG4gICAgICAgICQuZXh0ZW5kKHRoaXMuZWwuc3R5bGUsIHtcclxuICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJC5leHRlbmQodGhpcy4kb3ZlcmxheVswXS5zdHlsZSwge1xyXG4gICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcclxuICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBvdmVybGF5XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRvdmVybGF5WzBdLFxyXG4gICAgICAgICAgb3BhY2l0eTogdGhpcy5vcHRpb25zLm9wYWNpdHksXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGVmaW5lIG1vZGFsIGFuaW1hdGlvbiBvcHRpb25zXHJcbiAgICAgICAgdmFyIGVudGVyQW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLmVsLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5pbkR1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dEN1YmljJyxcclxuICAgICAgICAgIC8vIEhhbmRsZSBtb2RhbCBvbk9wZW5FbmQgY2FsbGJhY2tcclxuICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMxNC5vcHRpb25zLm9uT3BlbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMTQub3B0aW9ucy5vbk9wZW5FbmQuY2FsbChfdGhpczE0LCBfdGhpczE0LmVsLCBfdGhpczE0Ll9vcGVuaW5nVHJpZ2dlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBCb3R0b20gc2hlZXQgYW5pbWF0aW9uXHJcbiAgICAgICAgaWYgKHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdib3R0b20tc2hlZXQnKSkge1xyXG4gICAgICAgICAgJC5leHRlbmQoZW50ZXJBbmltT3B0aW9ucywge1xyXG4gICAgICAgICAgICBib3R0b206IDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYW5pbShlbnRlckFuaW1PcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbW9kYWwgYW5pbWF0aW9uXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICQuZXh0ZW5kKGVudGVyQW5pbU9wdGlvbnMsIHtcclxuICAgICAgICAgICAgdG9wOiBbdGhpcy5vcHRpb25zLnN0YXJ0aW5nVG9wLCB0aGlzLm9wdGlvbnMuZW5kaW5nVG9wXSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgICAgc2NhbGVYOiBbMC44LCAxXSxcclxuICAgICAgICAgICAgc2NhbGVZOiBbMC44LCAxXVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBhbmltKGVudGVyQW5pbU9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFuaW1hdGUgb3V0IG1vZGFsXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hbmltYXRlT3V0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYW5pbWF0ZU91dCgpIHtcclxuICAgICAgICB2YXIgX3RoaXMxNSA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgb3ZlcmxheVxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy4kb3ZlcmxheVswXSxcclxuICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBEZWZpbmUgbW9kYWwgYW5pbWF0aW9uIG9wdGlvbnNcclxuICAgICAgICB2YXIgZXhpdEFuaW1PcHRpb25zID0ge1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0Q3ViaWMnLFxyXG4gICAgICAgICAgLy8gSGFuZGxlIG1vZGFsIHJlYWR5IGNhbGxiYWNrXHJcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpczE1LmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIF90aGlzMTUuJG92ZXJsYXkucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxsIG9uQ2xvc2VFbmQgY2FsbGJhY2tcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczE1Lm9wdGlvbnMub25DbG9zZUVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMTUub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwoX3RoaXMxNSwgX3RoaXMxNS5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBCb3R0b20gc2hlZXQgYW5pbWF0aW9uXHJcbiAgICAgICAgaWYgKHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdib3R0b20tc2hlZXQnKSkge1xyXG4gICAgICAgICAgJC5leHRlbmQoZXhpdEFuaW1PcHRpb25zLCB7XHJcbiAgICAgICAgICAgIGJvdHRvbTogJy0xMDAlJyxcclxuICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBhbmltKGV4aXRBbmltT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG1vZGFsIGFuaW1hdGlvblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkLmV4dGVuZChleGl0QW5pbU9wdGlvbnMsIHtcclxuICAgICAgICAgICAgdG9wOiBbdGhpcy5vcHRpb25zLmVuZGluZ1RvcCwgdGhpcy5vcHRpb25zLnN0YXJ0aW5nVG9wXSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgc2NhbGVYOiAwLjgsXHJcbiAgICAgICAgICAgIHNjYWxlWTogMC44XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGFuaW0oZXhpdEFuaW1PcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcGVuIE1vZGFsXHJcbiAgICAgICAqIEBwYXJhbSB7Y2FzaH0gWyR0cmlnZ2VyXVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJvcGVuXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCR0cmlnZ2VyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgTW9kYWwuX21vZGFsc09wZW4rKztcclxuICAgICAgICB0aGlzLl9udGhNb2RhbE9wZW5lZCA9IE1vZGFsLl9tb2RhbHNPcGVuO1xyXG5cclxuICAgICAgICAvLyBTZXQgWi1JbmRleCBiYXNlZCBvbiBudW1iZXIgb2YgY3VycmVudGx5IG9wZW4gbW9kYWxzXHJcbiAgICAgICAgdGhpcy4kb3ZlcmxheVswXS5zdHlsZS56SW5kZXggPSAxMDAwICsgTW9kYWwuX21vZGFsc09wZW4gKiAyO1xyXG4gICAgICAgIHRoaXMuZWwuc3R5bGUuekluZGV4ID0gMTAwMCArIE1vZGFsLl9tb2RhbHNPcGVuICogMiArIDE7XHJcblxyXG4gICAgICAgIC8vIFNldCBvcGVuaW5nIHRyaWdnZXIsIHVuZGVmaW5lZCBpbmRpY2F0ZXMgbW9kYWwgd2FzIG9wZW5lZCBieSBqYXZhc2NyaXB0XHJcbiAgICAgICAgdGhpcy5fb3BlbmluZ1RyaWdnZXIgPSAhISR0cmlnZ2VyID8gJHRyaWdnZXJbMF0gOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIC8vIG9uT3BlblN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydC5jYWxsKHRoaXMsIHRoaXMuZWwsIHRoaXMuX29wZW5pbmdUcmlnZ2VyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJldmVudFNjcm9sbGluZykge1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XHJcbiAgICAgICAgdGhpcy5lbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgdGhpcy4kb3ZlcmxheVswXSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzbWlzc2libGUpIHtcclxuICAgICAgICAgIHRoaXMuX2hhbmRsZUtleWRvd25Cb3VuZCA9IHRoaXMuX2hhbmRsZUtleWRvd24uYmluZCh0aGlzKTtcclxuICAgICAgICAgIHRoaXMuX2hhbmRsZUZvY3VzQm91bmQgPSB0aGlzLl9oYW5kbGVGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUtleWRvd25Cb3VuZCk7XHJcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2hhbmRsZUZvY3VzQm91bmQsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5lbCk7XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy4kb3ZlcmxheVswXSk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZUluKCk7XHJcblxyXG4gICAgICAgIC8vIEZvY3VzIG1vZGFsXHJcbiAgICAgICAgdGhpcy5lbC5mb2N1cygpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENsb3NlIE1vZGFsXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImNsb3NlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIE1vZGFsLl9tb2RhbHNPcGVuLS07XHJcbiAgICAgICAgdGhpcy5fbnRoTW9kYWxPcGVuZWQgPSAwO1xyXG5cclxuICAgICAgICAvLyBDYWxsIG9uQ2xvc2VTdGFydCBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2xvc2VTdGFydC5jYWxsKHRoaXMsIHRoaXMuZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XHJcblxyXG4gICAgICAgIC8vIEVuYWJsZSBib2R5IHNjcm9sbGluZyBvbmx5IGlmIHRoZXJlIGFyZSBubyBtb3JlIG1vZGFscyBvcGVuLlxyXG4gICAgICAgIGlmIChNb2RhbC5fbW9kYWxzT3BlbiA9PT0gMCkge1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXNtaXNzaWJsZSkge1xyXG4gICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUtleWRvd25Cb3VuZCk7XHJcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2hhbmRsZUZvY3VzQm91bmQsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5lbCk7XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy4kb3ZlcmxheVswXSk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU91dCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoTW9kYWwuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihNb2RhbCksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9Nb2RhbDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBNb2RhbDtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgTW9kYWxcclxuICAgKi9cclxuXHJcblxyXG4gIE1vZGFsLl9tb2RhbHNPcGVuID0gMDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBNb2RhbFxyXG4gICAqL1xyXG4gIE1vZGFsLl9jb3VudCA9IDA7XHJcblxyXG4gIE0uTW9kYWwgPSBNb2RhbDtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKE1vZGFsLCAnbW9kYWwnLCAnTV9Nb2RhbCcpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbjsoZnVuY3Rpb24gKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBpbkR1cmF0aW9uOiAyNzUsXHJcbiAgICBvdXREdXJhdGlvbjogMjAwLFxyXG4gICAgb25PcGVuU3RhcnQ6IG51bGwsXHJcbiAgICBvbk9wZW5FbmQ6IG51bGwsXHJcbiAgICBvbkNsb3NlU3RhcnQ6IG51bGwsXHJcbiAgICBvbkNsb3NlRW5kOiBudWxsXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIE1hdGVyaWFsYm94ID0gZnVuY3Rpb24gKF9Db21wb25lbnQ0KSB7XHJcbiAgICBfaW5oZXJpdHMoTWF0ZXJpYWxib3gsIF9Db21wb25lbnQ0KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBNYXRlcmlhbGJveCBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBNYXRlcmlhbGJveChlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWF0ZXJpYWxib3gpO1xyXG5cclxuICAgICAgdmFyIF90aGlzMTYgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoTWF0ZXJpYWxib3guX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihNYXRlcmlhbGJveCkpLmNhbGwodGhpcywgTWF0ZXJpYWxib3gsIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczE2LmVsLk1fTWF0ZXJpYWxib3ggPSBfdGhpczE2O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBtb2RhbFxyXG4gICAgICAgKiBAbWVtYmVyIE1hdGVyaWFsYm94I29wdGlvbnNcclxuICAgICAgICogQHByb3Age051bWJlcn0gW2luRHVyYXRpb249Mjc1XSAtIExlbmd0aCBpbiBtcyBvZiBlbnRlciB0cmFuc2l0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtvdXREdXJhdGlvbj0yMDBdIC0gTGVuZ3RoIGluIG1zIG9mIGV4aXQgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlblN0YXJ0IC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBtYXRlcmlhbGJveCBpcyBvcGVuZWRcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5FbmQgLSBDYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbWF0ZXJpYWxib3ggaXMgb3BlbmVkXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZVN0YXJ0IC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBtYXRlcmlhbGJveCBpcyBjbG9zZWRcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkNsb3NlRW5kIC0gQ2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1hdGVyaWFsYm94IGlzIGNsb3NlZFxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXMxNi5vcHRpb25zID0gJC5leHRlbmQoe30sIE1hdGVyaWFsYm94LmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIF90aGlzMTYub3ZlcmxheUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICBfdGhpczE2LmRvbmVBbmltYXRpbmcgPSB0cnVlO1xyXG4gICAgICBfdGhpczE2LnBsYWNlaG9sZGVyID0gJCgnPGRpdj48L2Rpdj4nKS5hZGRDbGFzcygnbWF0ZXJpYWwtcGxhY2Vob2xkZXInKTtcclxuICAgICAgX3RoaXMxNi5vcmlnaW5hbFdpZHRoID0gMDtcclxuICAgICAgX3RoaXMxNi5vcmlnaW5hbEhlaWdodCA9IDA7XHJcbiAgICAgIF90aGlzMTYub3JpZ2luSW5saW5lU3R5bGVzID0gX3RoaXMxNi4kZWwuYXR0cignc3R5bGUnKTtcclxuICAgICAgX3RoaXMxNi5jYXB0aW9uID0gX3RoaXMxNi5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FwdGlvbicpIHx8ICcnO1xyXG5cclxuICAgICAgLy8gV3JhcFxyXG4gICAgICBfdGhpczE2LiRlbC5iZWZvcmUoX3RoaXMxNi5wbGFjZWhvbGRlcik7XHJcbiAgICAgIF90aGlzMTYucGxhY2Vob2xkZXIuYXBwZW5kKF90aGlzMTYuJGVsKTtcclxuXHJcbiAgICAgIF90aGlzMTYuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICByZXR1cm4gX3RoaXMxNjtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoTWF0ZXJpYWxib3gsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuZWwuTV9NYXRlcmlhbGJveCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgLy8gVW53cmFwIGltYWdlXHJcbiAgICAgICAgJCh0aGlzLnBsYWNlaG9sZGVyKS5hZnRlcih0aGlzLmVsKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQXR0cignc3R5bGUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cEV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlTWF0ZXJpYWxib3hDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlTWF0ZXJpYWxib3hDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVNYXRlcmlhbGJveENsaWNrQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlTWF0ZXJpYWxib3hDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBNYXRlcmlhbGJveCBDbGlja1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVNYXRlcmlhbGJveENsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlTWF0ZXJpYWxib3hDbGljayhlKSB7XHJcbiAgICAgICAgLy8gSWYgYWxyZWFkeSBtb2RhbCwgcmV0dXJuIHRvIG9yaWdpbmFsXHJcbiAgICAgICAgaWYgKHRoaXMuZG9uZUFuaW1hdGluZyA9PT0gZmFsc2UgfHwgdGhpcy5vdmVybGF5QWN0aXZlICYmIHRoaXMuZG9uZUFuaW1hdGluZykge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgV2luZG93IFNjcm9sbFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlV2luZG93U2Nyb2xsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlV2luZG93U2Nyb2xsKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXlBY3RpdmUpIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgV2luZG93IFJlc2l6ZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlV2luZG93UmVzaXplXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlV2luZG93UmVzaXplKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXlBY3RpdmUpIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgV2luZG93IFJlc2l6ZVxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVXaW5kb3dFc2NhcGVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVXaW5kb3dFc2NhcGUoZSkge1xyXG4gICAgICAgIC8vIEVTQyBrZXlcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLmRvbmVBbmltYXRpbmcgJiYgdGhpcy5vdmVybGF5QWN0aXZlKSB7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRmluZCBhbmNlc3RvcnMgd2l0aCBvdmVyZmxvdzogaGlkZGVuOyBhbmQgbWFrZSB2aXNpYmxlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9tYWtlQW5jZXN0b3JzT3ZlcmZsb3dWaXNpYmxlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfbWFrZUFuY2VzdG9yc092ZXJmbG93VmlzaWJsZSgpIHtcclxuICAgICAgICB0aGlzLmFuY2VzdG9yc0NoYW5nZWQgPSAkKCk7XHJcbiAgICAgICAgdmFyIGFuY2VzdG9yID0gdGhpcy5wbGFjZWhvbGRlclswXS5wYXJlbnROb2RlO1xyXG4gICAgICAgIHdoaWxlIChhbmNlc3RvciAhPT0gbnVsbCAmJiAhJChhbmNlc3RvcikuaXMoZG9jdW1lbnQpKSB7XHJcbiAgICAgICAgICB2YXIgY3VyciA9ICQoYW5jZXN0b3IpO1xyXG4gICAgICAgICAgaWYgKGN1cnIuY3NzKCdvdmVyZmxvdycpICE9PSAndmlzaWJsZScpIHtcclxuICAgICAgICAgICAgY3Vyci5jc3MoJ292ZXJmbG93JywgJ3Zpc2libGUnKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYW5jZXN0b3JzQ2hhbmdlZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5hbmNlc3RvcnNDaGFuZ2VkID0gY3VycjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLmFuY2VzdG9yc0NoYW5nZWQgPSB0aGlzLmFuY2VzdG9yc0NoYW5nZWQuYWRkKGN1cnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQW5pbWF0ZSBpbWFnZSBpblxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZUltYWdlSW5cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlSW1hZ2VJbigpIHtcclxuICAgICAgICB2YXIgX3RoaXMxNyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBhbmltT3B0aW9ucyA9IHtcclxuICAgICAgICAgIHRhcmdldHM6IHRoaXMuZWwsXHJcbiAgICAgICAgICBoZWlnaHQ6IFt0aGlzLm9yaWdpbmFsSGVpZ2h0LCB0aGlzLm5ld0hlaWdodF0sXHJcbiAgICAgICAgICB3aWR0aDogW3RoaXMub3JpZ2luYWxXaWR0aCwgdGhpcy5uZXdXaWR0aF0sXHJcbiAgICAgICAgICBsZWZ0OiBNLmdldERvY3VtZW50U2Nyb2xsTGVmdCgpICsgdGhpcy53aW5kb3dXaWR0aCAvIDIgLSB0aGlzLnBsYWNlaG9sZGVyLm9mZnNldCgpLmxlZnQgLSB0aGlzLm5ld1dpZHRoIC8gMixcclxuICAgICAgICAgIHRvcDogTS5nZXREb2N1bWVudFNjcm9sbFRvcCgpICsgdGhpcy53aW5kb3dIZWlnaHQgLyAyIC0gdGhpcy5wbGFjZWhvbGRlci5vZmZzZXQoKS50b3AgLSB0aGlzLm5ld0hlaWdodCAvIDIsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpczE3LmRvbmVBbmltYXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMxNy5vcHRpb25zLm9uT3BlbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMTcub3B0aW9ucy5vbk9wZW5FbmQuY2FsbChfdGhpczE3LCBfdGhpczE3LmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIE92ZXJyaWRlIG1heC13aWR0aCBvciBtYXgtaGVpZ2h0IGlmIG5lZWRlZFxyXG4gICAgICAgIHRoaXMubWF4V2lkdGggPSB0aGlzLiRlbC5jc3MoJ21heC13aWR0aCcpO1xyXG4gICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gdGhpcy4kZWwuY3NzKCdtYXgtaGVpZ2h0Jyk7XHJcbiAgICAgICAgaWYgKHRoaXMubWF4V2lkdGggIT09ICdub25lJykge1xyXG4gICAgICAgICAgYW5pbU9wdGlvbnMubWF4V2lkdGggPSB0aGlzLm5ld1dpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tYXhIZWlnaHQgIT09ICdub25lJykge1xyXG4gICAgICAgICAgYW5pbU9wdGlvbnMubWF4SGVpZ2h0ID0gdGhpcy5uZXdIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhbmltKGFuaW1PcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFuaW1hdGUgaW1hZ2Ugb3V0XHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hbmltYXRlSW1hZ2VPdXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlSW1hZ2VPdXQoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMTggPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgYW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLmVsLFxyXG4gICAgICAgICAgd2lkdGg6IHRoaXMub3JpZ2luYWxXaWR0aCxcclxuICAgICAgICAgIGhlaWdodDogdGhpcy5vcmlnaW5hbEhlaWdodCxcclxuICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnLFxyXG4gICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMxOC5wbGFjZWhvbGRlci5jc3Moe1xyXG4gICAgICAgICAgICAgIGhlaWdodDogJycsXHJcbiAgICAgICAgICAgICAgd2lkdGg6ICcnLFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAnJyxcclxuICAgICAgICAgICAgICB0b3A6ICcnLFxyXG4gICAgICAgICAgICAgIGxlZnQ6ICcnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmV2ZXJ0IHRvIHdpZHRoIG9yIGhlaWdodCBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgaWYgKF90aGlzMTguYXR0cldpZHRoKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMxOC4kZWwuYXR0cignd2lkdGgnLCBfdGhpczE4LmF0dHJXaWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKF90aGlzMTguYXR0ckhlaWdodCkge1xyXG4gICAgICAgICAgICAgIF90aGlzMTguJGVsLmF0dHIoJ2hlaWdodCcsIF90aGlzMTguYXR0ckhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF90aGlzMTguJGVsLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIF90aGlzMTgub3JpZ2luSW5saW5lU3R5bGVzICYmIF90aGlzMTguJGVsLmF0dHIoJ3N0eWxlJywgX3RoaXMxOC5vcmlnaW5JbmxpbmVTdHlsZXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGNsYXNzXHJcbiAgICAgICAgICAgIF90aGlzMTguJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgX3RoaXMxOC5kb25lQW5pbWF0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBvdmVyZmxvdyBvdmVycmlkZXMgb24gYW5jZXN0b3JzXHJcbiAgICAgICAgICAgIGlmIChfdGhpczE4LmFuY2VzdG9yc0NoYW5nZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMxOC5hbmNlc3RvcnNDaGFuZ2VkLmNzcygnb3ZlcmZsb3cnLCAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG9uQ2xvc2VFbmQgY2FsbGJhY2tcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczE4Lm9wdGlvbnMub25DbG9zZUVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMTgub3B0aW9ucy5vbkNsb3NlRW5kLmNhbGwoX3RoaXMxOCwgX3RoaXMxOC5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhbmltKGFuaW1PcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFVwZGF0ZSBvcGVuIGFuZCBjbG9zZSB2YXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl91cGRhdGVWYXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlVmFycygpIHtcclxuICAgICAgICB0aGlzLndpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy53aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jYXB0aW9uID0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FwdGlvbicpIHx8ICcnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3BlbiBNYXRlcmlhbGJveFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJvcGVuXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xyXG4gICAgICAgIHZhciBfdGhpczE5ID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlVmFycygpO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxXaWR0aCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbEhlaWdodCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBTZXQgc3RhdGVzXHJcbiAgICAgICAgdGhpcy5kb25lQW5pbWF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMub3ZlcmxheUFjdGl2ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIG9uT3BlblN0YXJ0IGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW5TdGFydC5jYWxsKHRoaXMsIHRoaXMuZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IHBvc2l0aW9uaW5nIGZvciBwbGFjZWhvbGRlclxyXG4gICAgICAgIHRoaXMucGxhY2Vob2xkZXIuY3NzKHtcclxuICAgICAgICAgIHdpZHRoOiB0aGlzLnBsYWNlaG9sZGVyWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoICsgJ3B4JyxcclxuICAgICAgICAgIGhlaWdodDogdGhpcy5wbGFjZWhvbGRlclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgKyAncHgnLFxyXG4gICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgICBsZWZ0OiAwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX21ha2VBbmNlc3RvcnNPdmVyZmxvd1Zpc2libGUoKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGNzcyBvbiBvcmlnaW5cclxuICAgICAgICB0aGlzLiRlbC5jc3Moe1xyXG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAnei1pbmRleCc6IDEwMDAsXHJcbiAgICAgICAgICAnd2lsbC1jaGFuZ2UnOiAnbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDaGFuZ2UgZnJvbSB3aWR0aCBvciBoZWlnaHQgYXR0cmlidXRlIHRvIGNzc1xyXG4gICAgICAgIHRoaXMuYXR0cldpZHRoID0gdGhpcy4kZWwuYXR0cignd2lkdGgnKTtcclxuICAgICAgICB0aGlzLmF0dHJIZWlnaHQgPSB0aGlzLiRlbC5hdHRyKCdoZWlnaHQnKTtcclxuICAgICAgICBpZiAodGhpcy5hdHRyV2lkdGgpIHtcclxuICAgICAgICAgIHRoaXMuJGVsLmNzcygnd2lkdGgnLCB0aGlzLmF0dHJXaWR0aCArICdweCcpO1xyXG4gICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQXR0cignd2lkdGgnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYXR0ckhlaWdodCkge1xyXG4gICAgICAgICAgdGhpcy4kZWwuY3NzKCd3aWR0aCcsIHRoaXMuYXR0ckhlaWdodCArICdweCcpO1xyXG4gICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQXR0cignaGVpZ2h0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgb3ZlcmxheVxyXG4gICAgICAgIHRoaXMuJG92ZXJsYXkgPSAkKCc8ZGl2IGlkPVwibWF0ZXJpYWxib3gtb3ZlcmxheVwiPjwvZGl2PicpLmNzcyh7XHJcbiAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgfSkub25lKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGlmIChfdGhpczE5LmRvbmVBbmltYXRpbmcpIHtcclxuICAgICAgICAgICAgX3RoaXMxOS5jbG9zZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBQdXQgYmVmb3JlIGluIG9yaWdpbiBpbWFnZSB0byBwcmVzZXJ2ZSB6LWluZGV4IGxheWVyaW5nLlxyXG4gICAgICAgIHRoaXMuJGVsLmJlZm9yZSh0aGlzLiRvdmVybGF5KTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGRpbWVuc2lvbnMgaWYgbmVlZGVkXHJcbiAgICAgICAgdmFyIG92ZXJsYXlPZmZzZXQgPSB0aGlzLiRvdmVybGF5WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHRoaXMuJG92ZXJsYXkuY3NzKHtcclxuICAgICAgICAgIHdpZHRoOiB0aGlzLndpbmRvd1dpZHRoICsgJ3B4JyxcclxuICAgICAgICAgIGhlaWdodDogdGhpcy53aW5kb3dIZWlnaHQgKyAncHgnLFxyXG4gICAgICAgICAgbGVmdDogLTEgKiBvdmVybGF5T2Zmc2V0LmxlZnQgKyAncHgnLFxyXG4gICAgICAgICAgdG9wOiAtMSAqIG92ZXJsYXlPZmZzZXQudG9wICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBhbmltLnJlbW92ZSh0aGlzLmVsKTtcclxuICAgICAgICBhbmltLnJlbW92ZSh0aGlzLiRvdmVybGF5WzBdKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBPdmVybGF5XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRvdmVybGF5WzBdLFxyXG4gICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgYW5kIGFuaW1hdGUgY2FwdGlvbiBpZiBpdCBleGlzdHNcclxuICAgICAgICBpZiAodGhpcy5jYXB0aW9uICE9PSAnJykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuJHBob3RvY2FwdGlvbikge1xyXG4gICAgICAgICAgICBhbmltLnJlbW92ZSh0aGlzLiRwaG90b0NhcHRpb25bMF0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy4kcGhvdG9DYXB0aW9uID0gJCgnPGRpdiBjbGFzcz1cIm1hdGVyaWFsYm94LWNhcHRpb25cIj48L2Rpdj4nKTtcclxuICAgICAgICAgIHRoaXMuJHBob3RvQ2FwdGlvbi50ZXh0KHRoaXMuY2FwdGlvbik7XHJcbiAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJHBob3RvQ2FwdGlvbik7XHJcbiAgICAgICAgICB0aGlzLiRwaG90b0NhcHRpb24uY3NzKHsgZGlzcGxheTogJ2lubGluZScgfSk7XHJcblxyXG4gICAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICAgIHRhcmdldHM6IHRoaXMuJHBob3RvQ2FwdGlvblswXSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5pbkR1cmF0aW9uLFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzaXplIEltYWdlXHJcbiAgICAgICAgdmFyIHJhdGlvID0gMDtcclxuICAgICAgICB2YXIgd2lkdGhQZXJjZW50ID0gdGhpcy5vcmlnaW5hbFdpZHRoIC8gdGhpcy53aW5kb3dXaWR0aDtcclxuICAgICAgICB2YXIgaGVpZ2h0UGVyY2VudCA9IHRoaXMub3JpZ2luYWxIZWlnaHQgLyB0aGlzLndpbmRvd0hlaWdodDtcclxuICAgICAgICB0aGlzLm5ld1dpZHRoID0gMDtcclxuICAgICAgICB0aGlzLm5ld0hlaWdodCA9IDA7XHJcblxyXG4gICAgICAgIGlmICh3aWR0aFBlcmNlbnQgPiBoZWlnaHRQZXJjZW50KSB7XHJcbiAgICAgICAgICByYXRpbyA9IHRoaXMub3JpZ2luYWxIZWlnaHQgLyB0aGlzLm9yaWdpbmFsV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLm5ld1dpZHRoID0gdGhpcy53aW5kb3dXaWR0aCAqIDAuOTtcclxuICAgICAgICAgIHRoaXMubmV3SGVpZ2h0ID0gdGhpcy53aW5kb3dXaWR0aCAqIDAuOSAqIHJhdGlvO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByYXRpbyA9IHRoaXMub3JpZ2luYWxXaWR0aCAvIHRoaXMub3JpZ2luYWxIZWlnaHQ7XHJcbiAgICAgICAgICB0aGlzLm5ld1dpZHRoID0gdGhpcy53aW5kb3dIZWlnaHQgKiAwLjkgKiByYXRpbztcclxuICAgICAgICAgIHRoaXMubmV3SGVpZ2h0ID0gdGhpcy53aW5kb3dIZWlnaHQgKiAwLjk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hbmltYXRlSW1hZ2VJbigpO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgRXhpdCB0cmlnZ2Vyc1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVdpbmRvd1Njcm9sbEJvdW5kID0gdGhpcy5faGFuZGxlV2luZG93U2Nyb2xsLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQgPSB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVXaW5kb3dFc2NhcGVCb3VuZCA9IHRoaXMuX2hhbmRsZVdpbmRvd0VzY2FwZS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5faGFuZGxlV2luZG93U2Nyb2xsQm91bmQpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemVCb3VuZCk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5faGFuZGxlV2luZG93RXNjYXBlQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2xvc2UgTWF0ZXJpYWxib3hcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiY2xvc2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgICAgIHZhciBfdGhpczIwID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlVmFycygpO1xyXG4gICAgICAgIHRoaXMuZG9uZUFuaW1hdGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBvbkNsb3NlU3RhcnQgY2FsbGJhY2tcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuJG92ZXJsYXlbMF0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jYXB0aW9uICE9PSAnJykge1xyXG4gICAgICAgICAgYW5pbS5yZW1vdmUodGhpcy4kcGhvdG9DYXB0aW9uWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGRpc2FibGUgZXhpdCBoYW5kbGVyc1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGxCb3VuZCk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVdpbmRvd1Jlc2l6ZUJvdW5kKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLl9oYW5kbGVXaW5kb3dFc2NhcGVCb3VuZCk7XHJcblxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy4kb3ZlcmxheVswXSxcclxuICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnLFxyXG4gICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXMyMC5vdmVybGF5QWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIF90aGlzMjAuJG92ZXJsYXkucmVtb3ZlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FuaW1hdGVJbWFnZU91dCgpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgQ2FwdGlvbiArIHJlc2V0IGNzcyBzZXR0aW5ncyBvbiBpbWFnZVxyXG4gICAgICAgIGlmICh0aGlzLmNhcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgdGFyZ2V0czogdGhpcy4kcGhvdG9DYXB0aW9uWzBdLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMyMC4kcGhvdG9DYXB0aW9uLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChNYXRlcmlhbGJveC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKE1hdGVyaWFsYm94KSwgXCJpbml0XCIsIHRoaXMpLmNhbGwodGhpcywgdGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnZXRJbnN0YW5jZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgICB2YXIgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgICByZXR1cm4gZG9tRWxlbS5NX01hdGVyaWFsYm94O1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIE1hdGVyaWFsYm94O1xyXG4gIH0oQ29tcG9uZW50KTtcclxuXHJcbiAgTS5NYXRlcmlhbGJveCA9IE1hdGVyaWFsYm94O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoTWF0ZXJpYWxib3gsICdtYXRlcmlhbGJveCcsICdNX01hdGVyaWFsYm94Jyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuOyhmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIHJlc3BvbnNpdmVUaHJlc2hvbGQ6IDAgLy8gYnJlYWtwb2ludCBmb3Igc3dpcGVhYmxlXHJcbiAgfTtcclxuXHJcbiAgdmFyIFBhcmFsbGF4ID0gZnVuY3Rpb24gKF9Db21wb25lbnQ1KSB7XHJcbiAgICBfaW5oZXJpdHMoUGFyYWxsYXgsIF9Db21wb25lbnQ1KTtcclxuXHJcbiAgICBmdW5jdGlvbiBQYXJhbGxheChlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFyYWxsYXgpO1xyXG5cclxuICAgICAgdmFyIF90aGlzMjEgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoUGFyYWxsYXguX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihQYXJhbGxheCkpLmNhbGwodGhpcywgUGFyYWxsYXgsIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczIxLmVsLk1fUGFyYWxsYXggPSBfdGhpczIxO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBQYXJhbGxheFxyXG4gICAgICAgKiBAbWVtYmVyIFBhcmFsbGF4I29wdGlvbnNcclxuICAgICAgICogQHByb3Age051bWJlcn0gcmVzcG9uc2l2ZVRocmVzaG9sZFxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXMyMS5vcHRpb25zID0gJC5leHRlbmQoe30sIFBhcmFsbGF4LmRlZmF1bHRzLCBvcHRpb25zKTtcclxuICAgICAgX3RoaXMyMS5fZW5hYmxlZCA9IHdpbmRvdy5pbm5lcldpZHRoID4gX3RoaXMyMS5vcHRpb25zLnJlc3BvbnNpdmVUaHJlc2hvbGQ7XHJcblxyXG4gICAgICBfdGhpczIxLiRpbWcgPSBfdGhpczIxLiRlbC5maW5kKCdpbWcnKS5maXJzdCgpO1xyXG4gICAgICBfdGhpczIxLiRpbWcuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVsID0gdGhpcztcclxuICAgICAgICBpZiAoZWwuY29tcGxldGUpICQoZWwpLnRyaWdnZXIoJ2xvYWQnKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBfdGhpczIxLl91cGRhdGVQYXJhbGxheCgpO1xyXG4gICAgICBfdGhpczIxLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgX3RoaXMyMS5fc2V0dXBTdHlsZXMoKTtcclxuXHJcbiAgICAgIFBhcmFsbGF4Ll9wYXJhbGxheGVzLnB1c2goX3RoaXMyMSk7XHJcbiAgICAgIHJldHVybiBfdGhpczIxO1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhQYXJhbGxheCwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICBQYXJhbGxheC5fcGFyYWxsYXhlcy5zcGxpY2UoUGFyYWxsYXguX3BhcmFsbGF4ZXMuaW5kZXhPZih0aGlzKSwgMSk7XHJcbiAgICAgICAgdGhpcy4kaW1nWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWxbMF0uTV9QYXJhbGxheCA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVJbWFnZUxvYWRCb3VuZCA9IHRoaXMuX2hhbmRsZUltYWdlTG9hZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuJGltZ1swXS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5faGFuZGxlSW1hZ2VMb2FkQm91bmQpO1xyXG5cclxuICAgICAgICBpZiAoUGFyYWxsYXguX3BhcmFsbGF4ZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICBQYXJhbGxheC5faGFuZGxlU2Nyb2xsVGhyb3R0bGVkID0gTS50aHJvdHRsZShQYXJhbGxheC5faGFuZGxlU2Nyb2xsLCA1KTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBQYXJhbGxheC5faGFuZGxlU2Nyb2xsVGhyb3R0bGVkKTtcclxuXHJcbiAgICAgICAgICBQYXJhbGxheC5faGFuZGxlV2luZG93UmVzaXplVGhyb3R0bGVkID0gTS50aHJvdHRsZShQYXJhbGxheC5faGFuZGxlV2luZG93UmVzaXplLCA1KTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBQYXJhbGxheC5faGFuZGxlV2luZG93UmVzaXplVGhyb3R0bGVkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLiRpbWdbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2hhbmRsZUltYWdlTG9hZEJvdW5kKTtcclxuXHJcbiAgICAgICAgaWYgKFBhcmFsbGF4Ll9wYXJhbGxheGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIFBhcmFsbGF4Ll9oYW5kbGVTY3JvbGxUaHJvdHRsZWQpO1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIFBhcmFsbGF4Ll9oYW5kbGVXaW5kb3dSZXNpemVUaHJvdHRsZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwU3R5bGVzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBTdHlsZXMoKSB7XHJcbiAgICAgICAgdGhpcy4kaW1nWzBdLnN0eWxlLm9wYWNpdHkgPSAxO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlSW1hZ2VMb2FkXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW1hZ2VMb2FkKCkge1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVBhcmFsbGF4KCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl91cGRhdGVQYXJhbGxheFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZVBhcmFsbGF4KCkge1xyXG4gICAgICAgIHZhciBjb250YWluZXJIZWlnaHQgPSB0aGlzLiRlbC5oZWlnaHQoKSA+IDAgPyB0aGlzLmVsLnBhcmVudE5vZGUub2Zmc2V0SGVpZ2h0IDogNTAwO1xyXG4gICAgICAgIHZhciBpbWdIZWlnaHQgPSB0aGlzLiRpbWdbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHZhciBwYXJhbGxheERpc3QgPSBpbWdIZWlnaHQgLSBjb250YWluZXJIZWlnaHQ7XHJcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRoaXMuJGVsLm9mZnNldCgpLnRvcCArIGNvbnRhaW5lckhlaWdodDtcclxuICAgICAgICB2YXIgdG9wID0gdGhpcy4kZWwub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSBNLmdldERvY3VtZW50U2Nyb2xsVG9wKCk7XHJcbiAgICAgICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICB2YXIgd2luZG93Qm90dG9tID0gc2Nyb2xsVG9wICsgd2luZG93SGVpZ2h0O1xyXG4gICAgICAgIHZhciBwZXJjZW50U2Nyb2xsZWQgPSAod2luZG93Qm90dG9tIC0gdG9wKSAvIChjb250YWluZXJIZWlnaHQgKyB3aW5kb3dIZWlnaHQpO1xyXG4gICAgICAgIHZhciBwYXJhbGxheCA9IHBhcmFsbGF4RGlzdCAqIHBlcmNlbnRTY3JvbGxlZDtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVkKSB7XHJcbiAgICAgICAgICB0aGlzLiRpbWdbMF0uc3R5bGUudHJhbnNmb3JtID0gJyc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChib3R0b20gPiBzY3JvbGxUb3AgJiYgdG9wIDwgc2Nyb2xsVG9wICsgd2luZG93SGVpZ2h0KSB7XHJcbiAgICAgICAgICB0aGlzLiRpbWdbMF0uc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUzRCgtNTAlLCBcIiArIHBhcmFsbGF4ICsgXCJweCwgMClcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChQYXJhbGxheC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFBhcmFsbGF4KSwgXCJpbml0XCIsIHRoaXMpLmNhbGwodGhpcywgdGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnZXRJbnN0YW5jZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgICB2YXIgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgICByZXR1cm4gZG9tRWxlbS5NX1BhcmFsbGF4O1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlU2Nyb2xsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlU2Nyb2xsKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgUGFyYWxsYXguX3BhcmFsbGF4ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciBwYXJhbGxheEluc3RhbmNlID0gUGFyYWxsYXguX3BhcmFsbGF4ZXNbaV07XHJcbiAgICAgICAgICBwYXJhbGxheEluc3RhbmNlLl91cGRhdGVQYXJhbGxheC5jYWxsKHBhcmFsbGF4SW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVdpbmRvd1Jlc2l6ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVdpbmRvd1Jlc2l6ZSgpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IFBhcmFsbGF4Ll9wYXJhbGxheGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgcGFyYWxsYXhJbnN0YW5jZSA9IFBhcmFsbGF4Ll9wYXJhbGxheGVzW2ldO1xyXG4gICAgICAgICAgcGFyYWxsYXhJbnN0YW5jZS5fZW5hYmxlZCA9IHdpbmRvdy5pbm5lcldpZHRoID4gcGFyYWxsYXhJbnN0YW5jZS5vcHRpb25zLnJlc3BvbnNpdmVUaHJlc2hvbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIFBhcmFsbGF4O1xyXG4gIH0oQ29tcG9uZW50KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBQYXJhbGxheFxyXG4gICAqL1xyXG5cclxuXHJcbiAgUGFyYWxsYXguX3BhcmFsbGF4ZXMgPSBbXTtcclxuXHJcbiAgTS5QYXJhbGxheCA9IFBhcmFsbGF4O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoUGFyYWxsYXgsICdwYXJhbGxheCcsICdNX1BhcmFsbGF4Jyk7XHJcbiAgfVxyXG59KShjYXNoKTtcclxuOyhmdW5jdGlvbiAoJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIGR1cmF0aW9uOiAzMDAsXHJcbiAgICBvblNob3c6IG51bGwsXHJcbiAgICBzd2lwZWFibGU6IGZhbHNlLFxyXG4gICAgcmVzcG9uc2l2ZVRocmVzaG9sZDogSW5maW5pdHkgLy8gYnJlYWtwb2ludCBmb3Igc3dpcGVhYmxlXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIFRhYnMgPSBmdW5jdGlvbiAoX0NvbXBvbmVudDYpIHtcclxuICAgIF9pbmhlcml0cyhUYWJzLCBfQ29tcG9uZW50Nik7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgVGFicyBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUYWJzKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUYWJzKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczIyID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRhYnMuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUYWJzKSkuY2FsbCh0aGlzLCBUYWJzLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXMyMi5lbC5NX1RhYnMgPSBfdGhpczIyO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBUYWJzXHJcbiAgICAgICAqIEBtZW1iZXIgVGFicyNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IGR1cmF0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25TaG93XHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBzd2lwZWFibGVcclxuICAgICAgICogQHByb3Age051bWJlcn0gcmVzcG9uc2l2ZVRocmVzaG9sZFxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXMyMi5vcHRpb25zID0gJC5leHRlbmQoe30sIFRhYnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gU2V0dXBcclxuICAgICAgX3RoaXMyMi4kdGFiTGlua3MgPSBfdGhpczIyLiRlbC5jaGlsZHJlbignbGkudGFiJykuY2hpbGRyZW4oJ2EnKTtcclxuICAgICAgX3RoaXMyMi5pbmRleCA9IDA7XHJcbiAgICAgIF90aGlzMjIuX3NldHVwQWN0aXZlVGFiTGluaygpO1xyXG5cclxuICAgICAgLy8gU2V0dXAgdGFicyBjb250ZW50XHJcbiAgICAgIGlmIChfdGhpczIyLm9wdGlvbnMuc3dpcGVhYmxlKSB7XHJcbiAgICAgICAgX3RoaXMyMi5fc2V0dXBTd2lwZWFibGVUYWJzKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgX3RoaXMyMi5fc2V0dXBOb3JtYWxUYWJzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNldHVwIHRhYnMgaW5kaWNhdG9yIGFmdGVyIGNvbnRlbnQgdG8gZW5zdXJlIGFjY3VyYXRlIHdpZHRoc1xyXG4gICAgICBfdGhpczIyLl9zZXRUYWJzQW5kVGFiV2lkdGgoKTtcclxuICAgICAgX3RoaXMyMi5fY3JlYXRlSW5kaWNhdG9yKCk7XHJcblxyXG4gICAgICBfdGhpczIyLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgcmV0dXJuIF90aGlzMjI7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKFRhYnMsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuX2luZGljYXRvci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2luZGljYXRvcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3dpcGVhYmxlKSB7XHJcbiAgICAgICAgICB0aGlzLl90ZWFyZG93blN3aXBlYWJsZVRhYnMoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fdGVhcmRvd25Ob3JtYWxUYWJzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiRlbFswXS5NX1RhYnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVdpbmRvd1Jlc2l6ZUJvdW5kID0gdGhpcy5faGFuZGxlV2luZG93UmVzaXplLmJpbmQodGhpcyk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVdpbmRvd1Jlc2l6ZUJvdW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5faGFuZGxlVGFiQ2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZVRhYkNsaWNrLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRhYkNsaWNrQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUYWJDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSB3aW5kb3cgUmVzaXplXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVXaW5kb3dSZXNpemVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVXaW5kb3dSZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0VGFic0FuZFRhYldpZHRoKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRhYldpZHRoICE9PSAwICYmIHRoaXMudGFic1dpZHRoICE9PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLl9pbmRpY2F0b3Iuc3R5bGUubGVmdCA9IHRoaXMuX2NhbGNMZWZ0UG9zKHRoaXMuJGFjdGl2ZVRhYkxpbmspICsgJ3B4JztcclxuICAgICAgICAgIHRoaXMuX2luZGljYXRvci5zdHlsZS5yaWdodCA9IHRoaXMuX2NhbGNSaWdodFBvcyh0aGlzLiRhY3RpdmVUYWJMaW5rKSArICdweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIHRhYiBjbGlja1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVUYWJDbGlja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVRhYkNsaWNrKGUpIHtcclxuICAgICAgICB2YXIgX3RoaXMyMyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZhciB0YWIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaS50YWInKTtcclxuICAgICAgICB2YXIgdGFiTGluayA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2EnKTtcclxuXHJcbiAgICAgICAgLy8gSGFuZGxlIGNsaWNrIG9uIHRhYiBsaW5rIG9ubHlcclxuICAgICAgICBpZiAoIXRhYkxpbmsubGVuZ3RoIHx8ICF0YWJMaW5rLnBhcmVudCgpLmhhc0NsYXNzKCd0YWInKSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRhYi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWN0IGFzIHJlZ3VsYXIgbGluayBpZiB0YXJnZXQgYXR0cmlidXRlIGlzIHNwZWNpZmllZC5cclxuICAgICAgICBpZiAoISF0YWJMaW5rLmF0dHIoJ3RhcmdldCcpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNYWtlIHRoZSBvbGQgdGFiIGluYWN0aXZlLlxyXG4gICAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIHZhciAkb2xkQ29udGVudCA9IHRoaXMuJGNvbnRlbnQ7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdmFyaWFibGVzIHdpdGggdGhlIG5ldyBsaW5rIGFuZCBjb250ZW50XHJcbiAgICAgICAgdGhpcy4kYWN0aXZlVGFiTGluayA9IHRhYkxpbms7XHJcbiAgICAgICAgdGhpcy4kY29udGVudCA9ICQoTS5lc2NhcGVIYXNoKHRhYkxpbmtbMF0uaGFzaCkpO1xyXG4gICAgICAgIHRoaXMuJHRhYkxpbmtzID0gdGhpcy4kZWwuY2hpbGRyZW4oJ2xpLnRhYicpLmNoaWxkcmVuKCdhJyk7XHJcblxyXG4gICAgICAgIC8vIE1ha2UgdGhlIHRhYiBhY3RpdmUuXHJcbiAgICAgICAgdGhpcy4kYWN0aXZlVGFiTGluay5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgdmFyIHByZXZJbmRleCA9IHRoaXMuaW5kZXg7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IE1hdGgubWF4KHRoaXMuJHRhYkxpbmtzLmluZGV4KHRhYkxpbmspLCAwKTtcclxuXHJcbiAgICAgICAgLy8gU3dhcCBjb250ZW50XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zd2lwZWFibGUpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl90YWJzQ2Fyb3VzZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGFic0Nhcm91c2VsLnNldCh0aGlzLmluZGV4LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczIzLm9wdGlvbnMub25TaG93ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpczIzLm9wdGlvbnMub25TaG93LmNhbGwoX3RoaXMyMywgX3RoaXMyMy4kY29udGVudFswXSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMuJGNvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnRbMF0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vblNob3cgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25TaG93LmNhbGwodGhpcywgdGhpcy4kY29udGVudFswXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICgkb2xkQ29udGVudC5sZW5ndGggJiYgISRvbGRDb250ZW50LmlzKHRoaXMuJGNvbnRlbnQpKSB7XHJcbiAgICAgICAgICAgICAgJG9sZENvbnRlbnRbMF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAkb2xkQ29udGVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB3aWR0aHMgYWZ0ZXIgY29udGVudCBpcyBzd2FwcGVkIChzY3JvbGxiYXIgYnVnZml4KVxyXG4gICAgICAgIHRoaXMuX3NldFRhYnNBbmRUYWJXaWR0aCgpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW5kaWNhdG9yXHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZUluZGljYXRvcihwcmV2SW5kZXgpO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBhbmNob3IncyBkZWZhdWx0IGNsaWNrIGFjdGlvblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdlbmVyYXRlIGVsZW1lbnRzIGZvciB0YWIgaW5kaWNhdG9yLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfY3JlYXRlSW5kaWNhdG9yXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY3JlYXRlSW5kaWNhdG9yKCkge1xyXG4gICAgICAgIHZhciBfdGhpczI0ID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgaW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ2luZGljYXRvcicpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmFwcGVuZENoaWxkKGluZGljYXRvcik7XHJcbiAgICAgICAgdGhpcy5faW5kaWNhdG9yID0gaW5kaWNhdG9yO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIF90aGlzMjQuX2luZGljYXRvci5zdHlsZS5sZWZ0ID0gX3RoaXMyNC5fY2FsY0xlZnRQb3MoX3RoaXMyNC4kYWN0aXZlVGFiTGluaykgKyAncHgnO1xyXG4gICAgICAgICAgX3RoaXMyNC5faW5kaWNhdG9yLnN0eWxlLnJpZ2h0ID0gX3RoaXMyNC5fY2FsY1JpZ2h0UG9zKF90aGlzMjQuJGFjdGl2ZVRhYkxpbmspICsgJ3B4JztcclxuICAgICAgICB9LCAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIGZpcnN0IGFjdGl2ZSB0YWIgbGluay5cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwQWN0aXZlVGFiTGlua1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwQWN0aXZlVGFiTGluaygpIHtcclxuICAgICAgICAvLyBJZiB0aGUgbG9jYXRpb24uaGFzaCBtYXRjaGVzIG9uZSBvZiB0aGUgbGlua3MsIHVzZSB0aGF0IGFzIHRoZSBhY3RpdmUgdGFiLlxyXG4gICAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsgPSAkKHRoaXMuJHRhYkxpbmtzLmZpbHRlcignW2hyZWY9XCInICsgbG9jYXRpb24uaGFzaCArICdcIl0nKSk7XHJcblxyXG4gICAgICAgIC8vIElmIG5vIG1hdGNoIGlzIGZvdW5kLCB1c2UgdGhlIGZpcnN0IGxpbmsgb3IgYW55IHdpdGggY2xhc3MgJ2FjdGl2ZScgYXMgdGhlIGluaXRpYWwgYWN0aXZlIHRhYi5cclxuICAgICAgICBpZiAodGhpcy4kYWN0aXZlVGFiTGluay5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsgPSB0aGlzLiRlbC5jaGlsZHJlbignbGkudGFiJykuY2hpbGRyZW4oJ2EuYWN0aXZlJykuZmlyc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuJGFjdGl2ZVRhYkxpbmsubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLiRhY3RpdmVUYWJMaW5rID0gdGhpcy4kZWwuY2hpbGRyZW4oJ2xpLnRhYicpLmNoaWxkcmVuKCdhJykuZmlyc3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJHRhYkxpbmtzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICB0aGlzLiRhY3RpdmVUYWJMaW5rWzBdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICB0aGlzLmluZGV4ID0gTWF0aC5tYXgodGhpcy4kdGFiTGlua3MuaW5kZXgodGhpcy4kYWN0aXZlVGFiTGluayksIDApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy4kYWN0aXZlVGFiTGluay5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKE0uZXNjYXBlSGFzaCh0aGlzLiRhY3RpdmVUYWJMaW5rWzBdLmhhc2gpKTtcclxuICAgICAgICAgIHRoaXMuJGNvbnRlbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIHN3aXBlYWJsZSB0YWJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cFN3aXBlYWJsZVRhYnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cFN3aXBlYWJsZVRhYnMoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMjUgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBDaGFuZ2Ugc3dpcGVhYmxlIGFjY29yZGluZyB0byByZXNwb25zaXZlIHRocmVzaG9sZFxyXG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IHRoaXMub3B0aW9ucy5yZXNwb25zaXZlVGhyZXNob2xkKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc3dpcGVhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgJHRhYnNDb250ZW50ID0gJCgpO1xyXG4gICAgICAgIHRoaXMuJHRhYkxpbmtzLmVhY2goZnVuY3Rpb24gKGxpbmspIHtcclxuICAgICAgICAgIHZhciAkY3VyckNvbnRlbnQgPSAkKE0uZXNjYXBlSGFzaChsaW5rLmhhc2gpKTtcclxuICAgICAgICAgICRjdXJyQ29udGVudC5hZGRDbGFzcygnY2Fyb3VzZWwtaXRlbScpO1xyXG4gICAgICAgICAgJHRhYnNDb250ZW50ID0gJHRhYnNDb250ZW50LmFkZCgkY3VyckNvbnRlbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgJHRhYnNXcmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cInRhYnMtY29udGVudCBjYXJvdXNlbCBjYXJvdXNlbC1zbGlkZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICAkdGFic0NvbnRlbnQuZmlyc3QoKS5iZWZvcmUoJHRhYnNXcmFwcGVyKTtcclxuICAgICAgICAkdGFic1dyYXBwZXIuYXBwZW5kKCR0YWJzQ29udGVudCk7XHJcbiAgICAgICAgJHRhYnNDb250ZW50WzBdLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuXHJcbiAgICAgICAgLy8gS2VlcCBhY3RpdmUgdGFiIGluZGV4IHRvIHNldCBpbml0aWFsIGNhcm91c2VsIHNsaWRlXHJcbiAgICAgICAgdmFyIGFjdGl2ZVRhYkluZGV4ID0gdGhpcy4kYWN0aXZlVGFiTGluay5jbG9zZXN0KCcudGFiJykuaW5kZXgoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGFic0Nhcm91c2VsID0gTS5DYXJvdXNlbC5pbml0KCR0YWJzV3JhcHBlclswXSwge1xyXG4gICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxyXG4gICAgICAgICAgbm9XcmFwOiB0cnVlLFxyXG4gICAgICAgICAgb25DeWNsZVRvOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgcHJldkluZGV4ID0gX3RoaXMyNS5pbmRleDtcclxuICAgICAgICAgICAgX3RoaXMyNS5pbmRleCA9ICQoaXRlbSkuaW5kZXgoKTtcclxuICAgICAgICAgICAgX3RoaXMyNS4kYWN0aXZlVGFiTGluay5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIF90aGlzMjUuJGFjdGl2ZVRhYkxpbmsgPSBfdGhpczI1LiR0YWJMaW5rcy5lcShfdGhpczI1LmluZGV4KTtcclxuICAgICAgICAgICAgX3RoaXMyNS4kYWN0aXZlVGFiTGluay5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIF90aGlzMjUuX2FuaW1hdGVJbmRpY2F0b3IocHJldkluZGV4KTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczI1Lm9wdGlvbnMub25TaG93ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXMyNS5vcHRpb25zLm9uU2hvdy5jYWxsKF90aGlzMjUsIF90aGlzMjUuJGNvbnRlbnRbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFNldCBpbml0aWFsIGNhcm91c2VsIHNsaWRlIHRvIGFjdGl2ZSB0YWJcclxuICAgICAgICB0aGlzLl90YWJzQ2Fyb3VzZWwuc2V0KGFjdGl2ZVRhYkluZGV4KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIG5vcm1hbCB0YWJzLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfdGVhcmRvd25Td2lwZWFibGVUYWJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfdGVhcmRvd25Td2lwZWFibGVUYWJzKCkge1xyXG4gICAgICAgIHZhciAkdGFic1dyYXBwZXIgPSB0aGlzLl90YWJzQ2Fyb3VzZWwuJGVsO1xyXG4gICAgICAgIHRoaXMuX3RhYnNDYXJvdXNlbC5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIC8vIFVud3JhcFxyXG4gICAgICAgICR0YWJzV3JhcHBlci5hZnRlcigkdGFic1dyYXBwZXIuY2hpbGRyZW4oKSk7XHJcbiAgICAgICAgJHRhYnNXcmFwcGVyLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgbm9ybWFsIHRhYnMuXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cE5vcm1hbFRhYnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cE5vcm1hbFRhYnMoKSB7XHJcbiAgICAgICAgLy8gSGlkZSBUYWJzIENvbnRlbnRcclxuICAgICAgICB0aGlzLiR0YWJMaW5rcy5ub3QodGhpcy4kYWN0aXZlVGFiTGluaykuZWFjaChmdW5jdGlvbiAobGluaykge1xyXG4gICAgICAgICAgaWYgKCEhbGluay5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY3VyckNvbnRlbnQgPSAkKE0uZXNjYXBlSGFzaChsaW5rLmhhc2gpKTtcclxuICAgICAgICAgICAgaWYgKCRjdXJyQ29udGVudC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAkY3VyckNvbnRlbnRbMF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gbm9ybWFsIHRhYnMuXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl90ZWFyZG93bk5vcm1hbFRhYnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF90ZWFyZG93bk5vcm1hbFRhYnMoKSB7XHJcbiAgICAgICAgLy8gc2hvdyBUYWJzIENvbnRlbnRcclxuICAgICAgICB0aGlzLiR0YWJMaW5rcy5lYWNoKGZ1bmN0aW9uIChsaW5rKSB7XHJcbiAgICAgICAgICBpZiAoISFsaW5rLmhhc2gpIHtcclxuICAgICAgICAgICAgdmFyICRjdXJyQ29udGVudCA9ICQoTS5lc2NhcGVIYXNoKGxpbmsuaGFzaCkpO1xyXG4gICAgICAgICAgICBpZiAoJGN1cnJDb250ZW50Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICRjdXJyQ29udGVudFswXS5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIHNldCB0YWJzIGFuZCB0YWIgd2lkdGhcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldFRhYnNBbmRUYWJXaWR0aFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFRhYnNBbmRUYWJXaWR0aCgpIHtcclxuICAgICAgICB0aGlzLnRhYnNXaWR0aCA9IHRoaXMuJGVsLndpZHRoKCk7XHJcbiAgICAgICAgdGhpcy50YWJXaWR0aCA9IE1hdGgubWF4KHRoaXMudGFic1dpZHRoLCB0aGlzLmVsLnNjcm9sbFdpZHRoKSAvIHRoaXMuJHRhYkxpbmtzLmxlbmd0aDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEZpbmRzIHJpZ2h0IGF0dHJpYnV0ZSBmb3IgaW5kaWNhdG9yIGJhc2VkIG9uIGFjdGl2ZSB0YWIuXHJcbiAgICAgICAqIEBwYXJhbSB7Y2FzaH0gZWxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NhbGNSaWdodFBvc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NhbGNSaWdodFBvcyhlbCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YWJzV2lkdGggLSBlbC5wb3NpdGlvbigpLmxlZnQgLSBlbFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBGaW5kcyBsZWZ0IGF0dHJpYnV0ZSBmb3IgaW5kaWNhdG9yIGJhc2VkIG9uIGFjdGl2ZSB0YWIuXHJcbiAgICAgICAqIEBwYXJhbSB7Y2FzaH0gZWxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NhbGNMZWZ0UG9zXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY2FsY0xlZnRQb3MoZWwpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihlbC5wb3NpdGlvbigpLmxlZnQpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJ1cGRhdGVUYWJJbmRpY2F0b3JcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVRhYkluZGljYXRvcigpIHtcclxuICAgICAgICB0aGlzLl9zZXRUYWJzQW5kVGFiV2lkdGgoKTtcclxuICAgICAgICB0aGlzLl9hbmltYXRlSW5kaWNhdG9yKHRoaXMuaW5kZXgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQW5pbWF0ZXMgSW5kaWNhdG9yIHRvIGFjdGl2ZSB0YWIuXHJcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwcmV2SW5kZXhcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVJbmRpY2F0b3JcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlSW5kaWNhdG9yKHByZXZJbmRleCkge1xyXG4gICAgICAgIHZhciBsZWZ0RGVsYXkgPSAwLFxyXG4gICAgICAgICAgICByaWdodERlbGF5ID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggLSBwcmV2SW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgbGVmdERlbGF5ID0gOTA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJpZ2h0RGVsYXkgPSA5MDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGVcclxuICAgICAgICB2YXIgYW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLl9pbmRpY2F0b3IsXHJcbiAgICAgICAgICBsZWZ0OiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLl9jYWxjTGVmdFBvcyh0aGlzLiRhY3RpdmVUYWJMaW5rKSxcclxuICAgICAgICAgICAgZGVsYXk6IGxlZnREZWxheVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJpZ2h0OiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLl9jYWxjUmlnaHRQb3ModGhpcy4kYWN0aXZlVGFiTGluayksXHJcbiAgICAgICAgICAgIGRlbGF5OiByaWdodERlbGF5XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5kdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5faW5kaWNhdG9yKTtcclxuICAgICAgICBhbmltKGFuaW1PcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNlbGVjdCB0YWIuXHJcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWJJZFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJzZWxlY3RcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdCh0YWJJZCkge1xyXG4gICAgICAgIHZhciB0YWIgPSB0aGlzLiR0YWJMaW5rcy5maWx0ZXIoJ1tocmVmPVwiIycgKyB0YWJJZCArICdcIl0nKTtcclxuICAgICAgICBpZiAodGFiLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGFiLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoVGFicy5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFRhYnMpLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fVGFicztcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBUYWJzO1xyXG4gIH0oQ29tcG9uZW50KTtcclxuXHJcbiAgTS5UYWJzID0gVGFicztcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFRhYnMsICd0YWJzJywgJ01fVGFicycpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbjsoZnVuY3Rpb24gKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBleGl0RGVsYXk6IDIwMCxcclxuICAgIGVudGVyRGVsYXk6IDAsXHJcbiAgICBodG1sOiBudWxsLFxyXG4gICAgbWFyZ2luOiA1LFxyXG4gICAgaW5EdXJhdGlvbjogMjUwLFxyXG4gICAgb3V0RHVyYXRpb246IDIwMCxcclxuICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcclxuICAgIHRyYW5zaXRpb25Nb3ZlbWVudDogMTBcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG5cclxuICB2YXIgVG9vbHRpcCA9IGZ1bmN0aW9uIChfQ29tcG9uZW50Nykge1xyXG4gICAgX2luaGVyaXRzKFRvb2x0aXAsIF9Db21wb25lbnQ3KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBUb29sdGlwIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRvb2x0aXAoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRvb2x0aXApO1xyXG5cclxuICAgICAgdmFyIF90aGlzMjYgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoVG9vbHRpcC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFRvb2x0aXApKS5jYWxsKHRoaXMsIFRvb2x0aXAsIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczI2LmVsLk1fVG9vbHRpcCA9IF90aGlzMjY7XHJcbiAgICAgIF90aGlzMjYub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUb29sdGlwLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIF90aGlzMjYuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIF90aGlzMjYuaXNIb3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgIF90aGlzMjYuaXNGb2N1c2VkID0gZmFsc2U7XHJcbiAgICAgIF90aGlzMjYuX2FwcGVuZFRvb2x0aXBFbCgpO1xyXG4gICAgICBfdGhpczI2Ll9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgcmV0dXJuIF90aGlzMjY7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKFRvb2x0aXAsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgJCh0aGlzLnRvb2x0aXBFbCkucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuZWwuTV9Ub29sdGlwID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYXBwZW5kVG9vbHRpcEVsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kVG9vbHRpcEVsKCkge1xyXG4gICAgICAgIHZhciB0b29sdGlwRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0b29sdGlwRWwuY2xhc3NMaXN0LmFkZCgnbWF0ZXJpYWwtdG9vbHRpcCcpO1xyXG4gICAgICAgIHRoaXMudG9vbHRpcEVsID0gdG9vbHRpcEVsO1xyXG5cclxuICAgICAgICB2YXIgdG9vbHRpcENvbnRlbnRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHRvb2x0aXBDb250ZW50RWwuY2xhc3NMaXN0LmFkZCgndG9vbHRpcC1jb250ZW50Jyk7XHJcbiAgICAgICAgdG9vbHRpcENvbnRlbnRFbC5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuaHRtbDtcclxuICAgICAgICB0b29sdGlwRWwuYXBwZW5kQ2hpbGQodG9vbHRpcENvbnRlbnRFbCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b29sdGlwRWwpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfdXBkYXRlVG9vbHRpcENvbnRlbnRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF91cGRhdGVUb29sdGlwQ29udGVudCgpIHtcclxuICAgICAgICB0aGlzLnRvb2x0aXBFbC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcC1jb250ZW50JykuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLmh0bWw7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cEV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kID0gdGhpcy5faGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZU1vdXNlTGVhdmVCb3VuZCA9IHRoaXMuX2hhbmRsZU1vdXNlTGVhdmUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVGb2N1c0JvdW5kID0gdGhpcy5faGFuZGxlRm9jdXMuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVCbHVyQm91bmQgPSB0aGlzLl9oYW5kbGVCbHVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9oYW5kbGVGb2N1c0JvdW5kLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVCbHVyQm91bmQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5faGFuZGxlTW91c2VFbnRlckJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVNb3VzZUxlYXZlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9oYW5kbGVGb2N1c0JvdW5kLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVCbHVyQm91bmQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJvcGVuXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKGlzTWFudWFsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlzTWFudWFsID0gaXNNYW51YWwgPT09IHVuZGVmaW5lZCA/IHRydWUgOiB1bmRlZmluZWQ7IC8vIERlZmF1bHQgdmFsdWUgdHJ1ZVxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICAvLyBVcGRhdGUgdG9vbHRpcCBjb250ZW50IHdpdGggSFRNTCBhdHRyaWJ1dGUgb3B0aW9uc1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHRoaXMuX2dldEF0dHJpYnV0ZU9wdGlvbnMoKSk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlVG9vbHRpcENvbnRlbnQoKTtcclxuICAgICAgICB0aGlzLl9zZXRFbnRlckRlbGF5VGltZW91dChpc01hbnVhbCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImNsb3NlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzSG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNGb2N1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9zZXRFeGl0RGVsYXlUaW1lb3V0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDcmVhdGUgdGltZW91dCB3aGljaCBkZWxheXMgd2hlbiB0aGUgdG9vbHRpcCBjbG9zZXNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldEV4aXREZWxheVRpbWVvdXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRFeGl0RGVsYXlUaW1lb3V0KCkge1xyXG4gICAgICAgIHZhciBfdGhpczI3ID0gdGhpcztcclxuXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2V4aXREZWxheVRpbWVvdXQpO1xyXG5cclxuICAgICAgICB0aGlzLl9leGl0RGVsYXlUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBpZiAoX3RoaXMyNy5pc0hvdmVyZWQgfHwgX3RoaXMyNy5pc0ZvY3VzZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIF90aGlzMjcuX2FuaW1hdGVPdXQoKTtcclxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMuZXhpdERlbGF5KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENyZWF0ZSB0aW1lb3V0IHdoaWNoIGRlbGF5cyB3aGVuIHRoZSB0b2FzdCBjbG9zZXNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldEVudGVyRGVsYXlUaW1lb3V0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0RW50ZXJEZWxheVRpbWVvdXQoaXNNYW51YWwpIHtcclxuICAgICAgICB2YXIgX3RoaXMyOCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9lbnRlckRlbGF5VGltZW91dCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2VudGVyRGVsYXlUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBpZiAoIV90aGlzMjguaXNIb3ZlcmVkICYmICFfdGhpczI4LmlzRm9jdXNlZCAmJiAhaXNNYW51YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIF90aGlzMjguX2FuaW1hdGVJbigpO1xyXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5lbnRlckRlbGF5KTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3Bvc2l0aW9uVG9vbHRpcFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3Bvc2l0aW9uVG9vbHRpcCgpIHtcclxuICAgICAgICB2YXIgb3JpZ2luID0gdGhpcy5lbCxcclxuICAgICAgICAgICAgdG9vbHRpcCA9IHRoaXMudG9vbHRpcEVsLFxyXG4gICAgICAgICAgICBvcmlnaW5IZWlnaHQgPSBvcmlnaW4ub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgICAgICBvcmlnaW5XaWR0aCA9IG9yaWdpbi5vZmZzZXRXaWR0aCxcclxuICAgICAgICAgICAgdG9vbHRpcEhlaWdodCA9IHRvb2x0aXAub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgICAgICB0b29sdGlwV2lkdGggPSB0b29sdGlwLm9mZnNldFdpZHRoLFxyXG4gICAgICAgICAgICBuZXdDb29yZGluYXRlcyA9IHZvaWQgMCxcclxuICAgICAgICAgICAgbWFyZ2luID0gdGhpcy5vcHRpb25zLm1hcmdpbixcclxuICAgICAgICAgICAgdGFyZ2V0VG9wID0gdm9pZCAwLFxyXG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gdm9pZCAwO1xyXG5cclxuICAgICAgICB0aGlzLnhNb3ZlbWVudCA9IDAsIHRoaXMueU1vdmVtZW50ID0gMDtcclxuXHJcbiAgICAgICAgdGFyZ2V0VG9wID0gb3JpZ2luLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIE0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AoKTtcclxuICAgICAgICB0YXJnZXRMZWZ0ID0gb3JpZ2luLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyBNLmdldERvY3VtZW50U2Nyb2xsTGVmdCgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBvc2l0aW9uID09PSAndG9wJykge1xyXG4gICAgICAgICAgdGFyZ2V0VG9wICs9IC10b29sdGlwSGVpZ2h0IC0gbWFyZ2luO1xyXG4gICAgICAgICAgdGFyZ2V0TGVmdCArPSBvcmlnaW5XaWR0aCAvIDIgLSB0b29sdGlwV2lkdGggLyAyO1xyXG4gICAgICAgICAgdGhpcy55TW92ZW1lbnQgPSAtdGhpcy5vcHRpb25zLnRyYW5zaXRpb25Nb3ZlbWVudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgdGFyZ2V0VG9wICs9IG9yaWdpbkhlaWdodCAvIDIgLSB0b29sdGlwSGVpZ2h0IC8gMjtcclxuICAgICAgICAgIHRhcmdldExlZnQgKz0gb3JpZ2luV2lkdGggKyBtYXJnaW47XHJcbiAgICAgICAgICB0aGlzLnhNb3ZlbWVudCA9IHRoaXMub3B0aW9ucy50cmFuc2l0aW9uTW92ZW1lbnQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucG9zaXRpb24gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgICAgdGFyZ2V0VG9wICs9IG9yaWdpbkhlaWdodCAvIDIgLSB0b29sdGlwSGVpZ2h0IC8gMjtcclxuICAgICAgICAgIHRhcmdldExlZnQgKz0gLXRvb2x0aXBXaWR0aCAtIG1hcmdpbjtcclxuICAgICAgICAgIHRoaXMueE1vdmVtZW50ID0gLXRoaXMub3B0aW9ucy50cmFuc2l0aW9uTW92ZW1lbnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRhcmdldFRvcCArPSBvcmlnaW5IZWlnaHQgKyBtYXJnaW47XHJcbiAgICAgICAgICB0YXJnZXRMZWZ0ICs9IG9yaWdpbldpZHRoIC8gMiAtIHRvb2x0aXBXaWR0aCAvIDI7XHJcbiAgICAgICAgICB0aGlzLnlNb3ZlbWVudCA9IHRoaXMub3B0aW9ucy50cmFuc2l0aW9uTW92ZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXdDb29yZGluYXRlcyA9IHRoaXMuX3JlcG9zaXRpb25XaXRoaW5TY3JlZW4odGFyZ2V0TGVmdCwgdGFyZ2V0VG9wLCB0b29sdGlwV2lkdGgsIHRvb2x0aXBIZWlnaHQpO1xyXG4gICAgICAgICQodG9vbHRpcCkuY3NzKHtcclxuICAgICAgICAgIHRvcDogbmV3Q29vcmRpbmF0ZXMueSArICdweCcsXHJcbiAgICAgICAgICBsZWZ0OiBuZXdDb29yZGluYXRlcy54ICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVwb3NpdGlvbldpdGhpblNjcmVlblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlcG9zaXRpb25XaXRoaW5TY3JlZW4oeCwgeSwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHZhciBzY3JvbGxMZWZ0ID0gTS5nZXREb2N1bWVudFNjcm9sbExlZnQoKTtcclxuICAgICAgICB2YXIgc2Nyb2xsVG9wID0gTS5nZXREb2N1bWVudFNjcm9sbFRvcCgpO1xyXG4gICAgICAgIHZhciBuZXdYID0geCAtIHNjcm9sbExlZnQ7XHJcbiAgICAgICAgdmFyIG5ld1kgPSB5IC0gc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICB2YXIgYm91bmRpbmcgPSB7XHJcbiAgICAgICAgICBsZWZ0OiBuZXdYLFxyXG4gICAgICAgICAgdG9wOiBuZXdZLFxyXG4gICAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5vcHRpb25zLm1hcmdpbiArIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uTW92ZW1lbnQ7XHJcbiAgICAgICAgdmFyIGVkZ2VzID0gTS5jaGVja1dpdGhpbkNvbnRhaW5lcihkb2N1bWVudC5ib2R5LCBib3VuZGluZywgb2Zmc2V0KTtcclxuXHJcbiAgICAgICAgaWYgKGVkZ2VzLmxlZnQpIHtcclxuICAgICAgICAgIG5ld1ggPSBvZmZzZXQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlZGdlcy5yaWdodCkge1xyXG4gICAgICAgICAgbmV3WCAtPSBuZXdYICsgd2lkdGggLSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlZGdlcy50b3ApIHtcclxuICAgICAgICAgIG5ld1kgPSBvZmZzZXQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlZGdlcy5ib3R0b20pIHtcclxuICAgICAgICAgIG5ld1kgLT0gbmV3WSArIGhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB4OiBuZXdYICsgc2Nyb2xsTGVmdCxcclxuICAgICAgICAgIHk6IG5ld1kgKyBzY3JvbGxUb3BcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZUluXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYW5pbWF0ZUluKCkge1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgIHRoaXMudG9vbHRpcEVsLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy50b29sdGlwRWwpO1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy50b29sdGlwRWwsXHJcbiAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgdHJhbnNsYXRlWDogdGhpcy54TW92ZW1lbnQsXHJcbiAgICAgICAgICB0cmFuc2xhdGVZOiB0aGlzLnlNb3ZlbWVudCxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuaW5EdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRDdWJpYydcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVPdXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlT3V0KCkge1xyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMudG9vbHRpcEVsKTtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IHRoaXMudG9vbHRpcEVsLFxyXG4gICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgIHRyYW5zbGF0ZVg6IDAsXHJcbiAgICAgICAgICB0cmFuc2xhdGVZOiAwLFxyXG4gICAgICAgICAgZHVyYXRpb246IHRoaXMub3B0aW9ucy5vdXREdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRDdWJpYydcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZU1vdXNlRW50ZXJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVNb3VzZUVudGVyKCkge1xyXG4gICAgICAgIHRoaXMuaXNIb3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzRm9jdXNlZCA9IGZhbHNlOyAvLyBBbGxvd3MgY2xvc2Ugb2YgdG9vbHRpcCB3aGVuIG9wZW5lZCBieSBmb2N1cy5cclxuICAgICAgICB0aGlzLm9wZW4oZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlTW91c2VMZWF2ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZU1vdXNlTGVhdmUoKSB7XHJcbiAgICAgICAgdGhpcy5pc0hvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRm9jdXNlZCA9IGZhbHNlOyAvLyBBbGxvd3MgY2xvc2Ugb2YgdG9vbHRpcCB3aGVuIG9wZW5lZCBieSBmb2N1cy5cclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVGb2N1c1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUZvY3VzKCkge1xyXG4gICAgICAgIGlmIChNLnRhYlByZXNzZWQpIHtcclxuICAgICAgICAgIHRoaXMuaXNGb2N1c2VkID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMub3BlbihmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQmx1clwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUJsdXIoKSB7XHJcbiAgICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9nZXRBdHRyaWJ1dGVPcHRpb25zXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0QXR0cmlidXRlT3B0aW9ucygpIHtcclxuICAgICAgICB2YXIgYXR0cmlidXRlT3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIHZhciB0b29sdGlwVGV4dE9wdGlvbiA9IHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRvb2x0aXAnKTtcclxuICAgICAgICB2YXIgcG9zaXRpb25PcHRpb24gPSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wb3NpdGlvbicpO1xyXG5cclxuICAgICAgICBpZiAodG9vbHRpcFRleHRPcHRpb24pIHtcclxuICAgICAgICAgIGF0dHJpYnV0ZU9wdGlvbnMuaHRtbCA9IHRvb2x0aXBUZXh0T3B0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uT3B0aW9uKSB7XHJcbiAgICAgICAgICBhdHRyaWJ1dGVPcHRpb25zLnBvc2l0aW9uID0gcG9zaXRpb25PcHRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhdHRyaWJ1dGVPcHRpb25zO1xyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoVG9vbHRpcC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFRvb2x0aXApLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fVG9vbHRpcDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBUb29sdGlwO1xyXG4gIH0oQ29tcG9uZW50KTtcclxuXHJcbiAgTS5Ub29sdGlwID0gVG9vbHRpcDtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFRvb2x0aXAsICd0b29sdGlwJywgJ01fVG9vbHRpcCcpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbjsgLyohXHJcbiAgKiBXYXZlcyB2MC42LjRcclxuICAqIGh0dHA6Ly9maWFuLm15LmlkL1dhdmVzXHJcbiAgKlxyXG4gICogQ29weXJpZ2h0IDIwMTQgQWxmaWFuYSBFLiBTaWJ1ZWEgYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xyXG4gICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAgKiBodHRwczovL2dpdGh1Yi5jb20vZmlhbnMvV2F2ZXMvYmxvYi9tYXN0ZXIvTElDRU5TRVxyXG4gICovXHJcblxyXG47KGZ1bmN0aW9uICh3aW5kb3cpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBXYXZlcyA9IFdhdmVzIHx8IHt9O1xyXG4gIHZhciAkJCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwuYmluZChkb2N1bWVudCk7XHJcblxyXG4gIC8vIEZpbmQgZXhhY3QgcG9zaXRpb24gb2YgZWxlbWVudFxyXG4gIGZ1bmN0aW9uIGlzV2luZG93KG9iaikge1xyXG4gICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiBvYmogPT09IG9iai53aW5kb3c7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRXaW5kb3coZWxlbSkge1xyXG4gICAgcmV0dXJuIGlzV2luZG93KGVsZW0pID8gZWxlbSA6IGVsZW0ubm9kZVR5cGUgPT09IDkgJiYgZWxlbS5kZWZhdWx0VmlldztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9mZnNldChlbGVtKSB7XHJcbiAgICB2YXIgZG9jRWxlbSxcclxuICAgICAgICB3aW4sXHJcbiAgICAgICAgYm94ID0geyB0b3A6IDAsIGxlZnQ6IDAgfSxcclxuICAgICAgICBkb2MgPSBlbGVtICYmIGVsZW0ub3duZXJEb2N1bWVudDtcclxuXHJcbiAgICBkb2NFbGVtID0gZG9jLmRvY3VtZW50RWxlbWVudDtcclxuXHJcbiAgICBpZiAodHlwZW9mIGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0ICE9PSB0eXBlb2YgdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJveCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICB9XHJcbiAgICB3aW4gPSBnZXRXaW5kb3coZG9jKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRvcDogYm94LnRvcCArIHdpbi5wYWdlWU9mZnNldCAtIGRvY0VsZW0uY2xpZW50VG9wLFxyXG4gICAgICBsZWZ0OiBib3gubGVmdCArIHdpbi5wYWdlWE9mZnNldCAtIGRvY0VsZW0uY2xpZW50TGVmdFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRTdHlsZShvYmopIHtcclxuICAgIHZhciBzdHlsZSA9ICcnO1xyXG5cclxuICAgIGZvciAodmFyIGEgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoYSkpIHtcclxuICAgICAgICBzdHlsZSArPSBhICsgJzonICsgb2JqW2FdICsgJzsnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN0eWxlO1xyXG4gIH1cclxuXHJcbiAgdmFyIEVmZmVjdCA9IHtcclxuXHJcbiAgICAvLyBFZmZlY3QgZGVsYXlcclxuICAgIGR1cmF0aW9uOiA3NTAsXHJcblxyXG4gICAgc2hvdzogZnVuY3Rpb24gKGUsIGVsZW1lbnQpIHtcclxuXHJcbiAgICAgIC8vIERpc2FibGUgcmlnaHQgY2xpY2tcclxuICAgICAgaWYgKGUuYnV0dG9uID09PSAyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZWwgPSBlbGVtZW50IHx8IHRoaXM7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgcmlwcGxlXHJcbiAgICAgIHZhciByaXBwbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgcmlwcGxlLmNsYXNzTmFtZSA9ICd3YXZlcy1yaXBwbGUnO1xyXG4gICAgICBlbC5hcHBlbmRDaGlsZChyaXBwbGUpO1xyXG5cclxuICAgICAgLy8gR2V0IGNsaWNrIGNvb3JkaW5hdGUgYW5kIGVsZW1lbnQgd2l0ZGhcclxuICAgICAgdmFyIHBvcyA9IG9mZnNldChlbCk7XHJcbiAgICAgIHZhciByZWxhdGl2ZVkgPSBlLnBhZ2VZIC0gcG9zLnRvcDtcclxuICAgICAgdmFyIHJlbGF0aXZlWCA9IGUucGFnZVggLSBwb3MubGVmdDtcclxuICAgICAgdmFyIHNjYWxlID0gJ3NjYWxlKCcgKyBlbC5jbGllbnRXaWR0aCAvIDEwMCAqIDEwICsgJyknO1xyXG5cclxuICAgICAgLy8gU3VwcG9ydCBmb3IgdG91Y2ggZGV2aWNlc1xyXG4gICAgICBpZiAoJ3RvdWNoZXMnIGluIGUpIHtcclxuICAgICAgICByZWxhdGl2ZVkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBwb3MudG9wO1xyXG4gICAgICAgIHJlbGF0aXZlWCA9IGUudG91Y2hlc1swXS5wYWdlWCAtIHBvcy5sZWZ0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBdHRhY2ggZGF0YSB0byBlbGVtZW50XHJcbiAgICAgIHJpcHBsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaG9sZCcsIERhdGUubm93KCkpO1xyXG4gICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdkYXRhLXNjYWxlJywgc2NhbGUpO1xyXG4gICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCByZWxhdGl2ZVgpO1xyXG4gICAgICByaXBwbGUuc2V0QXR0cmlidXRlKCdkYXRhLXknLCByZWxhdGl2ZVkpO1xyXG5cclxuICAgICAgLy8gU2V0IHJpcHBsZSBwb3NpdGlvblxyXG4gICAgICB2YXIgcmlwcGxlU3R5bGUgPSB7XHJcbiAgICAgICAgJ3RvcCc6IHJlbGF0aXZlWSArICdweCcsXHJcbiAgICAgICAgJ2xlZnQnOiByZWxhdGl2ZVggKyAncHgnXHJcbiAgICAgIH07XHJcblxyXG4gICAgICByaXBwbGUuY2xhc3NOYW1lID0gcmlwcGxlLmNsYXNzTmFtZSArICcgd2F2ZXMtbm90cmFuc2l0aW9uJztcclxuICAgICAgcmlwcGxlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBjb252ZXJ0U3R5bGUocmlwcGxlU3R5bGUpKTtcclxuICAgICAgcmlwcGxlLmNsYXNzTmFtZSA9IHJpcHBsZS5jbGFzc05hbWUucmVwbGFjZSgnd2F2ZXMtbm90cmFuc2l0aW9uJywgJycpO1xyXG5cclxuICAgICAgLy8gU2NhbGUgdGhlIHJpcHBsZVxyXG4gICAgICByaXBwbGVTdHlsZVsnLXdlYmtpdC10cmFuc2Zvcm0nXSA9IHNjYWxlO1xyXG4gICAgICByaXBwbGVTdHlsZVsnLW1vei10cmFuc2Zvcm0nXSA9IHNjYWxlO1xyXG4gICAgICByaXBwbGVTdHlsZVsnLW1zLXRyYW5zZm9ybSddID0gc2NhbGU7XHJcbiAgICAgIHJpcHBsZVN0eWxlWyctby10cmFuc2Zvcm0nXSA9IHNjYWxlO1xyXG4gICAgICByaXBwbGVTdHlsZS50cmFuc2Zvcm0gPSBzY2FsZTtcclxuICAgICAgcmlwcGxlU3R5bGUub3BhY2l0eSA9ICcxJztcclxuXHJcbiAgICAgIHJpcHBsZVN0eWxlWyctd2Via2l0LXRyYW5zaXRpb24tZHVyYXRpb24nXSA9IEVmZmVjdC5kdXJhdGlvbiArICdtcyc7XHJcbiAgICAgIHJpcHBsZVN0eWxlWyctbW96LXRyYW5zaXRpb24tZHVyYXRpb24nXSA9IEVmZmVjdC5kdXJhdGlvbiArICdtcyc7XHJcbiAgICAgIHJpcHBsZVN0eWxlWyctby10cmFuc2l0aW9uLWR1cmF0aW9uJ10gPSBFZmZlY3QuZHVyYXRpb24gKyAnbXMnO1xyXG4gICAgICByaXBwbGVTdHlsZVsndHJhbnNpdGlvbi1kdXJhdGlvbiddID0gRWZmZWN0LmR1cmF0aW9uICsgJ21zJztcclxuXHJcbiAgICAgIHJpcHBsZVN0eWxlWyctd2Via2l0LXRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJ10gPSAnY3ViaWMtYmV6aWVyKDAuMjUwLCAwLjQ2MCwgMC40NTAsIDAuOTQwKSc7XHJcbiAgICAgIHJpcHBsZVN0eWxlWyctbW96LXRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJ10gPSAnY3ViaWMtYmV6aWVyKDAuMjUwLCAwLjQ2MCwgMC40NTAsIDAuOTQwKSc7XHJcbiAgICAgIHJpcHBsZVN0eWxlWyctby10cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbiddID0gJ2N1YmljLWJlemllcigwLjI1MCwgMC40NjAsIDAuNDUwLCAwLjk0MCknO1xyXG4gICAgICByaXBwbGVTdHlsZVsndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nXSA9ICdjdWJpYy1iZXppZXIoMC4yNTAsIDAuNDYwLCAwLjQ1MCwgMC45NDApJztcclxuXHJcbiAgICAgIHJpcHBsZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgY29udmVydFN0eWxlKHJpcHBsZVN0eWxlKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGU6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIFRvdWNoSGFuZGxlci50b3VjaHVwKGUpO1xyXG5cclxuICAgICAgdmFyIGVsID0gdGhpcztcclxuICAgICAgdmFyIHdpZHRoID0gZWwuY2xpZW50V2lkdGggKiAxLjQ7XHJcblxyXG4gICAgICAvLyBHZXQgZmlyc3QgcmlwcGxlXHJcbiAgICAgIHZhciByaXBwbGUgPSBudWxsO1xyXG4gICAgICB2YXIgcmlwcGxlcyA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dhdmVzLXJpcHBsZScpO1xyXG4gICAgICBpZiAocmlwcGxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmlwcGxlID0gcmlwcGxlc1tyaXBwbGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHJlbGF0aXZlWCA9IHJpcHBsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpO1xyXG4gICAgICB2YXIgcmVsYXRpdmVZID0gcmlwcGxlLmdldEF0dHJpYnV0ZSgnZGF0YS15Jyk7XHJcbiAgICAgIHZhciBzY2FsZSA9IHJpcHBsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2NhbGUnKTtcclxuXHJcbiAgICAgIC8vIEdldCBkZWxheSBiZWV0d2VlbiBtb3VzZWRvd24gYW5kIG1vdXNlIGxlYXZlXHJcbiAgICAgIHZhciBkaWZmID0gRGF0ZS5ub3coKSAtIE51bWJlcihyaXBwbGUuZ2V0QXR0cmlidXRlKCdkYXRhLWhvbGQnKSk7XHJcbiAgICAgIHZhciBkZWxheSA9IDM1MCAtIGRpZmY7XHJcblxyXG4gICAgICBpZiAoZGVsYXkgPCAwKSB7XHJcbiAgICAgICAgZGVsYXkgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGYWRlIG91dCByaXBwbGUgYWZ0ZXIgZGVsYXlcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHN0eWxlID0ge1xyXG4gICAgICAgICAgJ3RvcCc6IHJlbGF0aXZlWSArICdweCcsXHJcbiAgICAgICAgICAnbGVmdCc6IHJlbGF0aXZlWCArICdweCcsXHJcbiAgICAgICAgICAnb3BhY2l0eSc6ICcwJyxcclxuXHJcbiAgICAgICAgICAvLyBEdXJhdGlvblxyXG4gICAgICAgICAgJy13ZWJraXQtdHJhbnNpdGlvbi1kdXJhdGlvbic6IEVmZmVjdC5kdXJhdGlvbiArICdtcycsXHJcbiAgICAgICAgICAnLW1vei10cmFuc2l0aW9uLWR1cmF0aW9uJzogRWZmZWN0LmR1cmF0aW9uICsgJ21zJyxcclxuICAgICAgICAgICctby10cmFuc2l0aW9uLWR1cmF0aW9uJzogRWZmZWN0LmR1cmF0aW9uICsgJ21zJyxcclxuICAgICAgICAgICd0cmFuc2l0aW9uLWR1cmF0aW9uJzogRWZmZWN0LmR1cmF0aW9uICsgJ21zJyxcclxuICAgICAgICAgICctd2Via2l0LXRyYW5zZm9ybSc6IHNjYWxlLFxyXG4gICAgICAgICAgJy1tb3otdHJhbnNmb3JtJzogc2NhbGUsXHJcbiAgICAgICAgICAnLW1zLXRyYW5zZm9ybSc6IHNjYWxlLFxyXG4gICAgICAgICAgJy1vLXRyYW5zZm9ybSc6IHNjYWxlLFxyXG4gICAgICAgICAgJ3RyYW5zZm9ybSc6IHNjYWxlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmlwcGxlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBjb252ZXJ0U3R5bGUoc3R5bGUpKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBlbC5yZW1vdmVDaGlsZChyaXBwbGUpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgRWZmZWN0LmR1cmF0aW9uKTtcclxuICAgICAgfSwgZGVsYXkpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBMaXR0bGUgaGFjayB0byBtYWtlIDxpbnB1dD4gY2FuIHBlcmZvcm0gd2F2ZXMgZWZmZWN0XHJcbiAgICB3cmFwSW5wdXQ6IGZ1bmN0aW9uIChlbGVtZW50cykge1xyXG4gICAgICBmb3IgKHZhciBhID0gMDsgYSA8IGVsZW1lbnRzLmxlbmd0aDsgYSsrKSB7XHJcbiAgICAgICAgdmFyIGVsID0gZWxlbWVudHNbYV07XHJcblxyXG4gICAgICAgIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xyXG5cclxuICAgICAgICAgIC8vIElmIGlucHV0IGFscmVhZHkgaGF2ZSBwYXJlbnQganVzdCBwYXNzIHRocm91Z2hcclxuICAgICAgICAgIGlmIChwYXJlbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaScgJiYgcGFyZW50LmNsYXNzTmFtZS5pbmRleE9mKCd3YXZlcy1lZmZlY3QnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUHV0IGVsZW1lbnQgY2xhc3MgYW5kIHN0eWxlIHRvIHRoZSBzcGVjaWZpZWQgcGFyZW50XHJcbiAgICAgICAgICB2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcclxuICAgICAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lICsgJyB3YXZlcy1pbnB1dC13cmFwcGVyJztcclxuXHJcbiAgICAgICAgICB2YXIgZWxlbWVudFN0eWxlID0gZWwuZ2V0QXR0cmlidXRlKCdzdHlsZScpO1xyXG5cclxuICAgICAgICAgIGlmICghZWxlbWVudFN0eWxlKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnRTdHlsZSA9ICcnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHdyYXBwZXIuc2V0QXR0cmlidXRlKCdzdHlsZScsIGVsZW1lbnRTdHlsZSk7XHJcblxyXG4gICAgICAgICAgZWwuY2xhc3NOYW1lID0gJ3dhdmVzLWJ1dHRvbi1pbnB1dCc7XHJcbiAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XHJcblxyXG4gICAgICAgICAgLy8gUHV0IGVsZW1lbnQgYXMgY2hpbGRcclxuICAgICAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQod3JhcHBlciwgZWwpO1xyXG4gICAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGlzYWJsZSBtb3VzZWRvd24gZXZlbnQgZm9yIDUwMG1zIGR1cmluZyBhbmQgYWZ0ZXIgdG91Y2hcclxuICAgKi9cclxuICB2YXIgVG91Y2hIYW5kbGVyID0ge1xyXG4gICAgLyogdXNlcyBhbiBpbnRlZ2VyIHJhdGhlciB0aGFuIGJvb2wgc28gdGhlcmUncyBubyBpc3N1ZXMgd2l0aFxyXG4gICAgICogbmVlZGluZyB0byBjbGVhciB0aW1lb3V0cyBpZiBhbm90aGVyIHRvdWNoIGV2ZW50IG9jY3VycmVkXHJcbiAgICAgKiB3aXRoaW4gdGhlIDUwMG1zLiBDYW5ub3QgbW91c2V1cCBiZXR3ZWVuIHRvdWNoc3RhcnQgYW5kXHJcbiAgICAgKiB0b3VjaGVuZCwgbm9yIGluIHRoZSA1MDBtcyBhZnRlciB0b3VjaGVuZC4gKi9cclxuICAgIHRvdWNoZXM6IDAsXHJcbiAgICBhbGxvd0V2ZW50OiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgYWxsb3cgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XHJcbiAgICAgICAgVG91Y2hIYW5kbGVyLnRvdWNoZXMgKz0gMTsgLy9wdXNoXHJcbiAgICAgIH0gZWxzZSBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnIHx8IGUudHlwZSA9PT0gJ3RvdWNoY2FuY2VsJykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKFRvdWNoSGFuZGxlci50b3VjaGVzID4gMCkge1xyXG4gICAgICAgICAgICBUb3VjaEhhbmRsZXIudG91Y2hlcyAtPSAxOyAvL3BvcCBhZnRlciA1MDBtc1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJyAmJiBUb3VjaEhhbmRsZXIudG91Y2hlcyA+IDApIHtcclxuICAgICAgICBhbGxvdyA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYWxsb3c7XHJcbiAgICB9LFxyXG4gICAgdG91Y2h1cDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgVG91Y2hIYW5kbGVyLmFsbG93RXZlbnQoZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVsZWdhdGVkIGNsaWNrIGhhbmRsZXIgZm9yIC53YXZlcy1lZmZlY3QgZWxlbWVudC5cclxuICAgKiByZXR1cm5zIG51bGwgd2hlbiAud2F2ZXMtZWZmZWN0IGVsZW1lbnQgbm90IGluIFwiY2xpY2sgdHJlZVwiXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0V2F2ZXNFZmZlY3RFbGVtZW50KGUpIHtcclxuICAgIGlmIChUb3VjaEhhbmRsZXIuYWxsb3dFdmVudChlKSA9PT0gZmFsc2UpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBudWxsO1xyXG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuXHJcbiAgICB3aGlsZSAodGFyZ2V0LnBhcmVudE5vZGUgIT09IG51bGwpIHtcclxuICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkgJiYgdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCd3YXZlcy1lZmZlY3QnKSAhPT0gLTEpIHtcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWJibGUgdGhlIGNsaWNrIGFuZCBzaG93IGVmZmVjdCBpZiAud2F2ZXMtZWZmZWN0IGVsZW0gd2FzIGZvdW5kXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2hvd0VmZmVjdChlKSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGdldFdhdmVzRWZmZWN0RWxlbWVudChlKTtcclxuXHJcbiAgICBpZiAoZWxlbWVudCAhPT0gbnVsbCkge1xyXG4gICAgICBFZmZlY3Quc2hvdyhlLCBlbGVtZW50KTtcclxuXHJcbiAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgRWZmZWN0LmhpZGUsIGZhbHNlKTtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgRWZmZWN0LmhpZGUsIGZhbHNlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgRWZmZWN0LmhpZGUsIGZhbHNlKTtcclxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgRWZmZWN0LmhpZGUsIGZhbHNlKTtcclxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgRWZmZWN0LmhpZGUsIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFdhdmVzLmRpc3BsYXlFZmZlY3QgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG4gICAgaWYgKCdkdXJhdGlvbicgaW4gb3B0aW9ucykge1xyXG4gICAgICBFZmZlY3QuZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vV3JhcCBpbnB1dCBpbnNpZGUgPGk+IHRhZ1xyXG4gICAgRWZmZWN0LndyYXBJbnB1dCgkJCgnLndhdmVzLWVmZmVjdCcpKTtcclxuXHJcbiAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHNob3dFZmZlY3QsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHNob3dFZmZlY3QsIGZhbHNlKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBdHRhY2ggV2F2ZXMgdG8gYW4gaW5wdXQgZWxlbWVudCAob3IgYW55IGVsZW1lbnQgd2hpY2ggZG9lc24ndFxyXG4gICAqIGJ1YmJsZSBtb3VzZXVwL21vdXNlZG93biBldmVudHMpLlxyXG4gICAqICAgSW50ZW5kZWQgdG8gYmUgdXNlZCB3aXRoIGR5bmFtaWNhbGx5IGxvYWRlZCBmb3Jtcy9pbnB1dHMsIG9yXHJcbiAgICogd2hlcmUgdGhlIHVzZXIgZG9lc24ndCB3YW50IGEgZGVsZWdhdGVkIGNsaWNrIGhhbmRsZXIuXHJcbiAgICovXHJcbiAgV2F2ZXMuYXR0YWNoID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgIC8vRlVUVVJFOiBhdXRvbWF0aWNhbGx5IGFkZCB3YXZlcyBjbGFzc2VzIGFuZCBhbGxvdyB1c2Vyc1xyXG4gICAgLy8gdG8gc3BlY2lmeSB0aGVtIHdpdGggYW4gb3B0aW9ucyBwYXJhbT8gRWcuIGxpZ2h0L2NsYXNzaWMvYnV0dG9uXHJcbiAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCcpIHtcclxuICAgICAgRWZmZWN0LndyYXBJbnB1dChbZWxlbWVudF0pO1xyXG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcclxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc2hvd0VmZmVjdCwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc2hvd0VmZmVjdCwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIHdpbmRvdy5XYXZlcyA9IFdhdmVzO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgV2F2ZXMuZGlzcGxheUVmZmVjdCgpO1xyXG4gIH0sIGZhbHNlKTtcclxufSkod2luZG93KTtcclxuOyhmdW5jdGlvbiAoJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIGh0bWw6ICcnLFxyXG4gICAgZGlzcGxheUxlbmd0aDogNDAwMCxcclxuICAgIGluRHVyYXRpb246IDMwMCxcclxuICAgIG91dER1cmF0aW9uOiAzNzUsXHJcbiAgICBjbGFzc2VzOiAnJyxcclxuICAgIGNvbXBsZXRlQ2FsbGJhY2s6IG51bGwsXHJcbiAgICBhY3RpdmF0aW9uUGVyY2VudDogMC44XHJcbiAgfTtcclxuXHJcbiAgdmFyIFRvYXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVG9hc3Qob3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVG9hc3QpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSB0b2FzdFxyXG4gICAgICAgKiBAbWVtYmVyIFRvYXN0I29wdGlvbnNcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUb2FzdC5kZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgIHRoaXMubWVzc2FnZSA9IHRoaXMub3B0aW9ucy5odG1sO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlc2NyaWJlcyBjdXJyZW50IHBhbiBzdGF0ZSB0b2FzdFxyXG4gICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMucGFubmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRpbWUgcmVtYWluaW5nIHVudGlsIHRvYXN0IGlzIHJlbW92ZWRcclxuICAgICAgICovXHJcbiAgICAgIHRoaXMudGltZVJlbWFpbmluZyA9IHRoaXMub3B0aW9ucy5kaXNwbGF5TGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKFRvYXN0Ll90b2FzdHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgVG9hc3QuX2NyZWF0ZUNvbnRhaW5lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDcmVhdGUgbmV3IHRvYXN0XHJcbiAgICAgIFRvYXN0Ll90b2FzdHMucHVzaCh0aGlzKTtcclxuICAgICAgdmFyIHRvYXN0RWxlbWVudCA9IHRoaXMuX2NyZWF0ZVRvYXN0KCk7XHJcbiAgICAgIHRvYXN0RWxlbWVudC5NX1RvYXN0ID0gdGhpcztcclxuICAgICAgdGhpcy5lbCA9IHRvYXN0RWxlbWVudDtcclxuICAgICAgdGhpcy4kZWwgPSAkKHRvYXN0RWxlbWVudCk7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVJbigpO1xyXG4gICAgICB0aGlzLl9zZXRUaW1lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhUb2FzdCwgW3tcclxuICAgICAga2V5OiBcIl9jcmVhdGVUb2FzdFwiLFxyXG5cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDcmVhdGUgdG9hc3QgYW5kIGFwcGVuZCBpdCB0byB0b2FzdCBjb250YWluZXJcclxuICAgICAgICovXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY3JlYXRlVG9hc3QoKSB7XHJcbiAgICAgICAgdmFyIHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdG9hc3QuY2xhc3NMaXN0LmFkZCgndG9hc3QnKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGN1c3RvbSBjbGFzc2VzIG9udG8gdG9hc3RcclxuICAgICAgICBpZiAoISF0aGlzLm9wdGlvbnMuY2xhc3Nlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICQodG9hc3QpLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCBjb250ZW50XHJcbiAgICAgICAgaWYgKHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gJ29iamVjdCcgPyB0aGlzLm1lc3NhZ2UgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IHRoaXMubWVzc2FnZSAmJiB0eXBlb2YgdGhpcy5tZXNzYWdlID09PSAnb2JqZWN0JyAmJiB0aGlzLm1lc3NhZ2UgIT09IG51bGwgJiYgdGhpcy5tZXNzYWdlLm5vZGVUeXBlID09PSAxICYmIHR5cGVvZiB0aGlzLm1lc3NhZ2Uubm9kZU5hbWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICB0b2FzdC5hcHBlbmRDaGlsZCh0aGlzLm1lc3NhZ2UpO1xyXG5cclxuICAgICAgICAgIC8vIENoZWNrIGlmIGl0IGlzIGpRdWVyeSBvYmplY3RcclxuICAgICAgICB9IGVsc2UgaWYgKCEhdGhpcy5tZXNzYWdlLmpxdWVyeSkge1xyXG4gICAgICAgICAgJCh0b2FzdCkuYXBwZW5kKHRoaXMubWVzc2FnZVswXSk7XHJcblxyXG4gICAgICAgICAgLy8gSW5zZXJ0IGFzIGh0bWw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRvYXN0LmlubmVySFRNTCA9IHRoaXMubWVzc2FnZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB0b2FzZnRcclxuICAgICAgICBUb2FzdC5fY29udGFpbmVyLmFwcGVuZENoaWxkKHRvYXN0KTtcclxuICAgICAgICByZXR1cm4gdG9hc3Q7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBbmltYXRlIGluIHRvYXN0XHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hbmltYXRlSW5cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlSW4oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0b2FzdCBpblxyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICAgIHRvcDogMCxcclxuICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0Q3ViaWMnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDcmVhdGUgc2V0SW50ZXJ2YWwgd2hpY2ggYXV0b21hdGljYWxseSByZW1vdmVzIHRvYXN0IHdoZW4gdGltZVJlbWFpbmluZyA+PSAwXHJcbiAgICAgICAqIGhhcyBiZWVuIHJlYWNoZWRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldFRpbWVyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0VGltZXIoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMjkgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodGhpcy50aW1lUmVtYWluaW5nICE9PSBJbmZpbml0eSkge1xyXG4gICAgICAgICAgdGhpcy5jb3VudGVySW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRvYXN0IGlzIG5vdCBiZWluZyBkcmFnZ2VkLCBkZWNyZWFzZSBpdHMgdGltZSByZW1haW5pbmdcclxuICAgICAgICAgICAgaWYgKCFfdGhpczI5LnBhbm5pbmcpIHtcclxuICAgICAgICAgICAgICBfdGhpczI5LnRpbWVSZW1haW5pbmcgLT0gMjA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFuaW1hdGUgdG9hc3Qgb3V0XHJcbiAgICAgICAgICAgIGlmIChfdGhpczI5LnRpbWVSZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICAgICAgICAgIF90aGlzMjkuZGlzbWlzcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCAyMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGlzbWlzcyB0b2FzdCB3aXRoIGFuaW1hdGlvblxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkaXNtaXNzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNtaXNzKCkge1xyXG4gICAgICAgIHZhciBfdGhpczMwID0gdGhpcztcclxuXHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5jb3VudGVySW50ZXJ2YWwpO1xyXG4gICAgICAgIHZhciBhY3RpdmF0aW9uRGlzdGFuY2UgPSB0aGlzLmVsLm9mZnNldFdpZHRoICogdGhpcy5vcHRpb25zLmFjdGl2YXRpb25QZXJjZW50O1xyXG5cclxuICAgICAgICBpZiAodGhpcy53YXNTd2lwZWQpIHtcclxuICAgICAgICAgIHRoaXMuZWwuc3R5bGUudHJhbnNpdGlvbiA9ICd0cmFuc2Zvcm0gLjA1cywgb3BhY2l0eSAuMDVzJztcclxuICAgICAgICAgIHRoaXMuZWwuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVYKFwiICsgYWN0aXZhdGlvbkRpc3RhbmNlICsgXCJweClcIjtcclxuICAgICAgICAgIHRoaXMuZWwuc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6IHRoaXMuZWwsXHJcbiAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgbWFyZ2luVG9wOiAtNDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLm91dER1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dEV4cG8nLFxyXG4gICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gQ2FsbCB0aGUgb3B0aW9uYWwgY2FsbGJhY2tcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpczMwLm9wdGlvbnMuY29tcGxldGVDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMzAub3B0aW9ucy5jb21wbGV0ZUNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRvYXN0IGZyb20gRE9NXHJcbiAgICAgICAgICAgIF90aGlzMzAuJGVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBUb2FzdC5fdG9hc3RzLnNwbGljZShUb2FzdC5fdG9hc3RzLmluZGV4T2YoX3RoaXMzMCksIDEpO1xyXG4gICAgICAgICAgICBpZiAoVG9hc3QuX3RvYXN0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICBUb2FzdC5fcmVtb3ZlQ29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfV0sIFt7XHJcbiAgICAgIGtleTogXCJnZXRJbnN0YW5jZVwiLFxyXG5cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fVG9hc3Q7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBcHBlbmQgdG9hc3QgY29udGFpbmVyIGFuZCBhZGQgZXZlbnQgaGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NyZWF0ZUNvbnRhaW5lclwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NyZWF0ZUNvbnRhaW5lcigpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaWQnLCAndG9hc3QtY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBldmVudCBoYW5kbGVyXHJcbiAgICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBUb2FzdC5fb25EcmFnU3RhcnQpO1xyXG4gICAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBUb2FzdC5fb25EcmFnTW92ZSk7XHJcbiAgICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgVG9hc3QuX29uRHJhZ0VuZCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBUb2FzdC5fb25EcmFnU3RhcnQpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIFRvYXN0Ll9vbkRyYWdNb3ZlKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgVG9hc3QuX29uRHJhZ0VuZCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcclxuICAgICAgICBUb2FzdC5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVtb3ZlIHRvYXN0IGNvbnRhaW5lciBhbmQgZXZlbnQgaGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUNvbnRhaW5lclwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUNvbnRhaW5lcigpIHtcclxuICAgICAgICAvLyBBZGQgZXZlbnQgaGFuZGxlclxyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIFRvYXN0Ll9vbkRyYWdNb3ZlKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgVG9hc3QuX29uRHJhZ0VuZCk7XHJcblxyXG4gICAgICAgICQoVG9hc3QuX2NvbnRhaW5lcikucmVtb3ZlKCk7XHJcbiAgICAgICAgVG9hc3QuX2NvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBCZWdpbiBkcmFnIGhhbmRsZXJcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfb25EcmFnU3RhcnRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9vbkRyYWdTdGFydChlKSB7XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0ICYmICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50b2FzdCcpLmxlbmd0aCkge1xyXG4gICAgICAgICAgdmFyICR0b2FzdCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50b2FzdCcpO1xyXG4gICAgICAgICAgdmFyIHRvYXN0ID0gJHRvYXN0WzBdLk1fVG9hc3Q7XHJcbiAgICAgICAgICB0b2FzdC5wYW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIFRvYXN0Ll9kcmFnZ2VkVG9hc3QgPSB0b2FzdDtcclxuICAgICAgICAgIHRvYXN0LmVsLmNsYXNzTGlzdC5hZGQoJ3Bhbm5pbmcnKTtcclxuICAgICAgICAgIHRvYXN0LmVsLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcclxuICAgICAgICAgIHRvYXN0LnN0YXJ0aW5nWFBvcyA9IFRvYXN0Ll94UG9zKGUpO1xyXG4gICAgICAgICAgdG9hc3QudGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICB0b2FzdC54UG9zID0gVG9hc3QuX3hQb3MoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRHJhZyBtb3ZlIGhhbmRsZXJcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfb25EcmFnTW92ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX29uRHJhZ01vdmUoZSkge1xyXG4gICAgICAgIGlmICghIVRvYXN0Ll9kcmFnZ2VkVG9hc3QpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHZhciB0b2FzdCA9IFRvYXN0Ll9kcmFnZ2VkVG9hc3Q7XHJcbiAgICAgICAgICB0b2FzdC5kZWx0YVggPSBNYXRoLmFicyh0b2FzdC54UG9zIC0gVG9hc3QuX3hQb3MoZSkpO1xyXG4gICAgICAgICAgdG9hc3QueFBvcyA9IFRvYXN0Ll94UG9zKGUpO1xyXG4gICAgICAgICAgdG9hc3QudmVsb2NpdHlYID0gdG9hc3QuZGVsdGFYIC8gKERhdGUubm93KCkgLSB0b2FzdC50aW1lKTtcclxuICAgICAgICAgIHRvYXN0LnRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgICAgIHZhciB0b3RhbERlbHRhWCA9IHRvYXN0LnhQb3MgLSB0b2FzdC5zdGFydGluZ1hQb3M7XHJcbiAgICAgICAgICB2YXIgYWN0aXZhdGlvbkRpc3RhbmNlID0gdG9hc3QuZWwub2Zmc2V0V2lkdGggKiB0b2FzdC5vcHRpb25zLmFjdGl2YXRpb25QZXJjZW50O1xyXG4gICAgICAgICAgdG9hc3QuZWwuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVYKFwiICsgdG90YWxEZWx0YVggKyBcInB4KVwiO1xyXG4gICAgICAgICAgdG9hc3QuZWwuc3R5bGUub3BhY2l0eSA9IDEgLSBNYXRoLmFicyh0b3RhbERlbHRhWCAvIGFjdGl2YXRpb25EaXN0YW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRW5kIGRyYWcgaGFuZGxlclxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfb25EcmFnRW5kXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfb25EcmFnRW5kKCkge1xyXG4gICAgICAgIGlmICghIVRvYXN0Ll9kcmFnZ2VkVG9hc3QpIHtcclxuICAgICAgICAgIHZhciB0b2FzdCA9IFRvYXN0Ll9kcmFnZ2VkVG9hc3Q7XHJcbiAgICAgICAgICB0b2FzdC5wYW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB0b2FzdC5lbC5jbGFzc0xpc3QucmVtb3ZlKCdwYW5uaW5nJyk7XHJcblxyXG4gICAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gdG9hc3QueFBvcyAtIHRvYXN0LnN0YXJ0aW5nWFBvcztcclxuICAgICAgICAgIHZhciBhY3RpdmF0aW9uRGlzdGFuY2UgPSB0b2FzdC5lbC5vZmZzZXRXaWR0aCAqIHRvYXN0Lm9wdGlvbnMuYWN0aXZhdGlvblBlcmNlbnQ7XHJcbiAgICAgICAgICB2YXIgc2hvdWxkQmVEaXNtaXNzZWQgPSBNYXRoLmFicyh0b3RhbERlbHRhWCkgPiBhY3RpdmF0aW9uRGlzdGFuY2UgfHwgdG9hc3QudmVsb2NpdHlYID4gMTtcclxuXHJcbiAgICAgICAgICAvLyBSZW1vdmUgdG9hc3RcclxuICAgICAgICAgIGlmIChzaG91bGRCZURpc21pc3NlZCkge1xyXG4gICAgICAgICAgICB0b2FzdC53YXNTd2lwZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0b2FzdC5kaXNtaXNzKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBbmltYXRlIHRvYXN0IGJhY2sgdG8gb3JpZ2luYWwgcG9zaXRpb25cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvYXN0LmVsLnN0eWxlLnRyYW5zaXRpb24gPSAndHJhbnNmb3JtIC4ycywgb3BhY2l0eSAuMnMnO1xyXG4gICAgICAgICAgICB0b2FzdC5lbC5zdHlsZS50cmFuc2Zvcm0gPSAnJztcclxuICAgICAgICAgICAgdG9hc3QuZWwuc3R5bGUub3BhY2l0eSA9ICcnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgVG9hc3QuX2RyYWdnZWRUb2FzdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IHggcG9zaXRpb24gb2YgbW91c2Ugb3IgdG91Y2ggZXZlbnRcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfeFBvc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3hQb3MoZSkge1xyXG4gICAgICAgIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA+PSAxKSB7XHJcbiAgICAgICAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1vdXNlIGV2ZW50XHJcbiAgICAgICAgcmV0dXJuIGUuY2xpZW50WDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBhbGwgdG9hc3RzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImRpc21pc3NBbGxcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpc21pc3NBbGwoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgdG9hc3RJbmRleCBpbiBUb2FzdC5fdG9hc3RzKSB7XHJcbiAgICAgICAgICBUb2FzdC5fdG9hc3RzW3RvYXN0SW5kZXhdLmRpc21pc3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImRlZmF1bHRzXCIsXHJcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbiAgICByZXR1cm4gVG9hc3Q7XHJcbiAgfSgpO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFRvYXN0XHJcbiAgICogQHR5cGUge0FycmF5LjxUb2FzdD59XHJcbiAgICovXHJcblxyXG5cclxuICBUb2FzdC5fdG9hc3RzID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgVG9hc3RcclxuICAgKi9cclxuICBUb2FzdC5fY29udGFpbmVyID0gbnVsbDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBUb2FzdFxyXG4gICAqIEB0eXBlIHtUb2FzdH1cclxuICAgKi9cclxuICBUb2FzdC5fZHJhZ2dlZFRvYXN0ID0gbnVsbDtcclxuXHJcbiAgTS5Ub2FzdCA9IFRvYXN0O1xyXG4gIE0udG9hc3QgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgcmV0dXJuIG5ldyBUb2FzdChvcHRpb25zKTtcclxuICB9O1xyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuOyhmdW5jdGlvbiAoJCwgYW5pbSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIGVkZ2U6ICdsZWZ0JyxcclxuICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgIGluRHVyYXRpb246IDI1MCxcclxuICAgIG91dER1cmF0aW9uOiAyMDAsXHJcbiAgICBvbk9wZW5TdGFydDogbnVsbCxcclxuICAgIG9uT3BlbkVuZDogbnVsbCxcclxuICAgIG9uQ2xvc2VTdGFydDogbnVsbCxcclxuICAgIG9uQ2xvc2VFbmQ6IG51bGwsXHJcbiAgICBwcmV2ZW50U2Nyb2xsaW5nOiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICovXHJcblxyXG4gIHZhciBTaWRlbmF2ID0gZnVuY3Rpb24gKF9Db21wb25lbnQ4KSB7XHJcbiAgICBfaW5oZXJpdHMoU2lkZW5hdiwgX0NvbXBvbmVudDgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFNpZGVuYXYgaW5zdGFuY2UgYW5kIHNldCB1cCBvdmVybGF5XHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFNpZGVuYXYoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNpZGVuYXYpO1xyXG5cclxuICAgICAgdmFyIF90aGlzMzEgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoU2lkZW5hdi5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNpZGVuYXYpKS5jYWxsKHRoaXMsIFNpZGVuYXYsIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczMxLmVsLk1fU2lkZW5hdiA9IF90aGlzMzE7XHJcbiAgICAgIF90aGlzMzEuaWQgPSBfdGhpczMxLiRlbC5hdHRyKCdpZCcpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBTaWRlbmF2XHJcbiAgICAgICAqIEBtZW1iZXIgU2lkZW5hdiNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtTdHJpbmd9IFtlZGdlPSdsZWZ0J10gLSBTaWRlIG9mIHNjcmVlbiBvbiB3aGljaCBTaWRlbmF2IGFwcGVhcnNcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtkcmFnZ2FibGU9dHJ1ZV0gLSBBbGxvdyBzd2lwZSBnZXN0dXJlcyB0byBvcGVuL2Nsb3NlIFNpZGVuYXZcclxuICAgICAgICogQHByb3Age051bWJlcn0gW2luRHVyYXRpb249MjUwXSAtIExlbmd0aCBpbiBtcyBvZiBlbnRlciB0cmFuc2l0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtvdXREdXJhdGlvbj0yMDBdIC0gTGVuZ3RoIGluIG1zIG9mIGV4aXQgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlblN0YXJ0IC0gRnVuY3Rpb24gY2FsbGVkIHdoZW4gc2lkZW5hdiBzdGFydHMgZW50ZXJpbmdcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbk9wZW5FbmQgLSBGdW5jdGlvbiBjYWxsZWQgd2hlbiBzaWRlbmF2IGZpbmlzaGVzIGVudGVyaW5nXHJcbiAgICAgICAqIEBwcm9wIHtGdW5jdGlvbn0gb25DbG9zZVN0YXJ0IC0gRnVuY3Rpb24gY2FsbGVkIHdoZW4gc2lkZW5hdiBzdGFydHMgZXhpdGluZ1xyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2VFbmQgLSBGdW5jdGlvbiBjYWxsZWQgd2hlbiBzaWRlbmF2IGZpbmlzaGVzIGV4aXRpbmdcclxuICAgICAgICovXHJcbiAgICAgIF90aGlzMzEub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTaWRlbmF2LmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBEZXNjcmliZXMgb3Blbi9jbG9zZSBzdGF0ZSBvZiBTaWRlbmF2XHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXMzMS5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBEZXNjcmliZXMgaWYgU2lkZW5hdiBpcyBmaXhlZFxyXG4gICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgICovXHJcbiAgICAgIF90aGlzMzEuaXNGaXhlZCA9IF90aGlzMzEuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaWRlbmF2LWZpeGVkJyk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGVzY3JpYmVzIGlmIFNpZGVuYXYgaXMgYmVpbmcgZHJhZ2dlZWRcclxuICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAqL1xyXG4gICAgICBfdGhpczMxLmlzRHJhZ2dlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gV2luZG93IHNpemUgdmFyaWFibGVzIGZvciB3aW5kb3cgcmVzaXplIGNoZWNrc1xyXG4gICAgICBfdGhpczMxLmxhc3RXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICBfdGhpczMxLmxhc3RXaW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICBfdGhpczMxLl9jcmVhdGVPdmVybGF5KCk7XHJcbiAgICAgIF90aGlzMzEuX2NyZWF0ZURyYWdUYXJnZXQoKTtcclxuICAgICAgX3RoaXMzMS5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIF90aGlzMzEuX3NldHVwQ2xhc3NlcygpO1xyXG4gICAgICBfdGhpczMxLl9zZXR1cEZpeGVkKCk7XHJcblxyXG4gICAgICBTaWRlbmF2Ll9zaWRlbmF2cy5wdXNoKF90aGlzMzEpO1xyXG4gICAgICByZXR1cm4gX3RoaXMzMTtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoU2lkZW5hdiwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5fZW5hYmxlQm9keVNjcm9sbGluZygpO1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9vdmVybGF5KTtcclxuICAgICAgICB0aGlzLmRyYWdUYXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmRyYWdUYXJnZXQpO1xyXG4gICAgICAgIHRoaXMuZWwuTV9TaWRlbmF2ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuZWwuc3R5bGUudHJhbnNmb3JtID0gJyc7XHJcblxyXG4gICAgICAgIHZhciBpbmRleCA9IFNpZGVuYXYuX3NpZGVuYXZzLmluZGV4T2YodGhpcyk7XHJcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcclxuICAgICAgICAgIFNpZGVuYXYuX3NpZGVuYXZzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfY3JlYXRlT3ZlcmxheVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NyZWF0ZU92ZXJsYXkoKSB7XHJcbiAgICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0aGlzLl9jbG9zZUJvdW5kID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZCgnc2lkZW5hdi1vdmVybGF5Jyk7XHJcblxyXG4gICAgICAgIG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZUJvdW5kKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuICAgICAgICB0aGlzLl9vdmVybGF5ID0gb3ZlcmxheTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICBpZiAoU2lkZW5hdi5fc2lkZW5hdnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlVHJpZ2dlckNsaWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2hhbmRsZURyYWdUYXJnZXREcmFnQm91bmQgPSB0aGlzLl9oYW5kbGVEcmFnVGFyZ2V0RHJhZy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZURyYWdUYXJnZXRSZWxlYXNlQm91bmQgPSB0aGlzLl9oYW5kbGVEcmFnVGFyZ2V0UmVsZWFzZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNsb3NlRHJhZ0JvdW5kID0gdGhpcy5faGFuZGxlQ2xvc2VEcmFnLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ2xvc2VSZWxlYXNlQm91bmQgPSB0aGlzLl9oYW5kbGVDbG9zZVJlbGVhc2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVDbG9zZVRyaWdnZXJDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlQ2xvc2VUcmlnZ2VyQ2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmFnVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZURyYWdUYXJnZXREcmFnQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZHJhZ1RhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZURyYWdUYXJnZXRSZWxlYXNlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlQ2xvc2VEcmFnQm91bmQpO1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDbG9zZVJlbGVhc2VCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVDbG9zZURyYWdCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZUNsb3NlUmVsZWFzZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlQ2xvc2VUcmlnZ2VyQ2xpY2tCb3VuZCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCByZXNpemUgZm9yIHNpZGUgbmF2IGZpeGVkXHJcbiAgICAgICAgaWYgKHRoaXMuaXNGaXhlZCkge1xyXG4gICAgICAgICAgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQgPSB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemVCb3VuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgaWYgKFNpZGVuYXYuX3NpZGVuYXZzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRyaWdnZXJDbGljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRyYWdUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5faGFuZGxlRHJhZ1RhcmdldERyYWdCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5kcmFnVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlRHJhZ1RhcmdldFJlbGVhc2VCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVDbG9zZURyYWdCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZUNsb3NlUmVsZWFzZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZUNsb3NlRHJhZ0JvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlQ2xvc2VSZWxlYXNlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDbG9zZVRyaWdnZXJDbGlja0JvdW5kKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHJlc2l6ZSBmb3Igc2lkZSBuYXYgZml4ZWRcclxuICAgICAgICBpZiAodGhpcy5pc0ZpeGVkKSB7XHJcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBUcmlnZ2VyIENsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVRyaWdnZXJDbGlja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVRyaWdnZXJDbGljayhlKSB7XHJcbiAgICAgICAgdmFyICR0cmlnZ2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnNpZGVuYXYtdHJpZ2dlcicpO1xyXG4gICAgICAgIGlmIChlLnRhcmdldCAmJiAkdHJpZ2dlci5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciBzaWRlbmF2SWQgPSBNLmdldElkRnJvbVRyaWdnZXIoJHRyaWdnZXJbMF0pO1xyXG5cclxuICAgICAgICAgIHZhciBzaWRlbmF2SW5zdGFuY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzaWRlbmF2SWQpLk1fU2lkZW5hdjtcclxuICAgICAgICAgIGlmIChzaWRlbmF2SW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgc2lkZW5hdkluc3RhbmNlLm9wZW4oJHRyaWdnZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldCB2YXJpYWJsZXMgbmVlZGVkIGF0IHRoZSBiZWdnaW5pbmcgb2YgZHJhZ1xyXG4gICAgICAgKiBhbmQgc3RvcCBhbnkgY3VycmVudCB0cmFuc2l0aW9uLlxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zdGFydERyYWdcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zdGFydERyYWcoZSkge1xyXG4gICAgICAgIHZhciBjbGllbnRYID0gZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgdGhpcy5pc0RyYWdnZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3N0YXJ0aW5nWHBvcyA9IGNsaWVudFg7XHJcbiAgICAgICAgdGhpcy5feFBvcyA9IHRoaXMuX3N0YXJ0aW5nWHBvcztcclxuICAgICAgICB0aGlzLl90aW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB0aGlzLl93aWR0aCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wID0gdGhpcy5pc09wZW4gPyB0aGlzLmVsLnNjcm9sbFRvcCA6IE0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AoKTtcclxuICAgICAgICB0aGlzLl92ZXJ0aWNhbGx5U2Nyb2xsaW5nID0gZmFsc2U7XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5lbCk7XHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5fb3ZlcmxheSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXQgdmFyaWFibGVzIG5lZWRlZCBhdCBlYWNoIGRyYWcgbW92ZSB1cGRhdGUgdGlja1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9kcmFnTW92ZVVwZGF0ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2RyYWdNb3ZlVXBkYXRlKGUpIHtcclxuICAgICAgICB2YXIgY2xpZW50WCA9IGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgIHZhciBjdXJyZW50U2Nyb2xsVG9wID0gdGhpcy5pc09wZW4gPyB0aGlzLmVsLnNjcm9sbFRvcCA6IE0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AoKTtcclxuICAgICAgICB0aGlzLmRlbHRhWCA9IE1hdGguYWJzKHRoaXMuX3hQb3MgLSBjbGllbnRYKTtcclxuICAgICAgICB0aGlzLl94UG9zID0gY2xpZW50WDtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5WCA9IHRoaXMuZGVsdGFYIC8gKERhdGUubm93KCkgLSB0aGlzLl90aW1lKTtcclxuICAgICAgICB0aGlzLl90aW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICBpZiAodGhpcy5faW5pdGlhbFNjcm9sbFRvcCAhPT0gY3VycmVudFNjcm9sbFRvcCkge1xyXG4gICAgICAgICAgdGhpcy5fdmVydGljYWxseVNjcm9sbGluZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlcyBEcmFnZ2luZyBvZiBTaWRlbmF2XHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZURyYWdUYXJnZXREcmFnXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlRHJhZ1RhcmdldERyYWcoZSkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGRyYWdnYWJsZVxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdnYWJsZSB8fCB0aGlzLl9pc0N1cnJlbnRseUZpeGVkKCkgfHwgdGhpcy5fdmVydGljYWxseVNjcm9sbGluZykge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbm90IGJlaW5nIGRyYWdnZWQsIHNldCBpbml0aWFsIGRyYWcgc3RhcnQgdmFyaWFibGVzXHJcbiAgICAgICAgaWYgKCF0aGlzLmlzRHJhZ2dlZCkge1xyXG4gICAgICAgICAgdGhpcy5fc3RhcnREcmFnKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUnVuIHRvdWNobW92ZSB1cGRhdGVzXHJcbiAgICAgICAgdGhpcy5fZHJhZ01vdmVVcGRhdGUoZSk7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSByYXcgZGVsdGFYXHJcbiAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gdGhpcy5feFBvcyAtIHRoaXMuX3N0YXJ0aW5nWHBvcztcclxuXHJcbiAgICAgICAgLy8gZHJhZ0RpcmVjdGlvbiBpcyB0aGUgYXR0ZW1wdGVkIHVzZXIgZHJhZyBkaXJlY3Rpb25cclxuICAgICAgICB2YXIgZHJhZ0RpcmVjdGlvbiA9IHRvdGFsRGVsdGFYID4gMCA/ICdyaWdodCcgOiAnbGVmdCc7XHJcblxyXG4gICAgICAgIC8vIERvbid0IGFsbG93IHRvdGFsRGVsdGFYIHRvIGV4Y2VlZCBTaWRlbmF2IHdpZHRoIG9yIGJlIGRyYWdnZWQgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvblxyXG4gICAgICAgIHRvdGFsRGVsdGFYID0gTWF0aC5taW4odGhpcy5fd2lkdGgsIE1hdGguYWJzKHRvdGFsRGVsdGFYKSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lZGdlID09PSBkcmFnRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICB0b3RhbERlbHRhWCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB0cmFuc2Zvcm1YIGlzIHRoZSBkcmFnIGRpc3BsYWNlbWVudFxyXG4gICAgICAgICAqIHRyYW5zZm9ybVByZWZpeCBpcyB0aGUgaW5pdGlhbCB0cmFuc2Zvcm0gcGxhY2VtZW50XHJcbiAgICAgICAgICogSW52ZXJ0IHZhbHVlcyBpZiBTaWRlbmF2IGlzIHJpZ2h0IGVkZ2VcclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgdHJhbnNmb3JtWCA9IHRvdGFsRGVsdGFYO1xyXG4gICAgICAgIHZhciB0cmFuc2Zvcm1QcmVmaXggPSAndHJhbnNsYXRlWCgtMTAwJSknO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWRnZSA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgdHJhbnNmb3JtUHJlZml4ID0gJ3RyYW5zbGF0ZVgoMTAwJSknO1xyXG4gICAgICAgICAgdHJhbnNmb3JtWCA9IC10cmFuc2Zvcm1YO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIG9wZW4vY2xvc2UgcGVyY2VudGFnZSBvZiBzaWRlbmF2LCB3aXRoIG9wZW4gPSAxIGFuZCBjbG9zZSA9IDBcclxuICAgICAgICB0aGlzLnBlcmNlbnRPcGVuID0gTWF0aC5taW4oMSwgdG90YWxEZWx0YVggLyB0aGlzLl93aWR0aCk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0cmFuc2Zvcm0gYW5kIG9wYWNpdHkgc3R5bGVzXHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1QcmVmaXggKyBcIiB0cmFuc2xhdGVYKFwiICsgdHJhbnNmb3JtWCArIFwicHgpXCI7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5vcGFjaXR5ID0gdGhpcy5wZXJjZW50T3BlbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBEcmFnIFRhcmdldCBSZWxlYXNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVEcmFnVGFyZ2V0UmVsZWFzZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZURyYWdUYXJnZXRSZWxlYXNlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dlZCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucGVyY2VudE9wZW4gPiAwLjIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9hbmltYXRlT3V0KCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5pc0RyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuX3ZlcnRpY2FsbHlTY3JvbGxpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgQ2xvc2UgRHJhZ1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDbG9zZURyYWdcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVDbG9zZURyYWcoZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZHJhZ2dhYmxlXHJcbiAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnZ2FibGUgfHwgdGhpcy5faXNDdXJyZW50bHlGaXhlZCgpIHx8IHRoaXMuX3ZlcnRpY2FsbHlTY3JvbGxpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIElmIG5vdCBiZWluZyBkcmFnZ2VkLCBzZXQgaW5pdGlhbCBkcmFnIHN0YXJ0IHZhcmlhYmxlc1xyXG4gICAgICAgICAgaWYgKCF0aGlzLmlzRHJhZ2dlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGFydERyYWcoZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUnVuIHRvdWNobW92ZSB1cGRhdGVzXHJcbiAgICAgICAgICB0aGlzLl9kcmFnTW92ZVVwZGF0ZShlKTtcclxuXHJcbiAgICAgICAgICAvLyBDYWxjdWxhdGUgcmF3IGRlbHRhWFxyXG4gICAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gdGhpcy5feFBvcyAtIHRoaXMuX3N0YXJ0aW5nWHBvcztcclxuXHJcbiAgICAgICAgICAvLyBkcmFnRGlyZWN0aW9uIGlzIHRoZSBhdHRlbXB0ZWQgdXNlciBkcmFnIGRpcmVjdGlvblxyXG4gICAgICAgICAgdmFyIGRyYWdEaXJlY3Rpb24gPSB0b3RhbERlbHRhWCA+IDAgPyAncmlnaHQnIDogJ2xlZnQnO1xyXG5cclxuICAgICAgICAgIC8vIERvbid0IGFsbG93IHRvdGFsRGVsdGFYIHRvIGV4Y2VlZCBTaWRlbmF2IHdpZHRoIG9yIGJlIGRyYWdnZWQgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvblxyXG4gICAgICAgICAgdG90YWxEZWx0YVggPSBNYXRoLm1pbih0aGlzLl93aWR0aCwgTWF0aC5hYnModG90YWxEZWx0YVgpKTtcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWRnZSAhPT0gZHJhZ0RpcmVjdGlvbikge1xyXG4gICAgICAgICAgICB0b3RhbERlbHRhWCA9IDA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdmFyIHRyYW5zZm9ybVggPSAtdG90YWxEZWx0YVg7XHJcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVkZ2UgPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgICAgdHJhbnNmb3JtWCA9IC10cmFuc2Zvcm1YO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBvcGVuL2Nsb3NlIHBlcmNlbnRhZ2Ugb2Ygc2lkZW5hdiwgd2l0aCBvcGVuID0gMSBhbmQgY2xvc2UgPSAwXHJcbiAgICAgICAgICB0aGlzLnBlcmNlbnRPcGVuID0gTWF0aC5taW4oMSwgMSAtIHRvdGFsRGVsdGFYIC8gdGhpcy5fd2lkdGgpO1xyXG5cclxuICAgICAgICAgIC8vIFNldCB0cmFuc2Zvcm0gYW5kIG9wYWNpdHkgc3R5bGVzXHJcbiAgICAgICAgICB0aGlzLmVsLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWChcIiArIHRyYW5zZm9ybVggKyBcInB4KVwiO1xyXG4gICAgICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5vcGFjaXR5ID0gdGhpcy5wZXJjZW50T3BlbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgQ2xvc2UgUmVsZWFzZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ2xvc2VSZWxlYXNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ2xvc2VSZWxlYXNlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT3BlbiAmJiB0aGlzLmlzRHJhZ2dlZCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucGVyY2VudE9wZW4gPiAwLjgpIHtcclxuICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZUluKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5pc0RyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuX3ZlcnRpY2FsbHlTY3JvbGxpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGVzIGNsb3Npbmcgb2YgU2lkZW5hdiB3aGVuIGVsZW1lbnQgd2l0aCBjbGFzcyAuc2lkZW5hdi1jbG9zZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ2xvc2VUcmlnZ2VyQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVDbG9zZVRyaWdnZXJDbGljayhlKSB7XHJcbiAgICAgICAgdmFyICRjbG9zZVRyaWdnZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuc2lkZW5hdi1jbG9zZScpO1xyXG4gICAgICAgIGlmICgkY2xvc2VUcmlnZ2VyLmxlbmd0aCAmJiAhdGhpcy5faXNDdXJyZW50bHlGaXhlZCgpKSB7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFdpbmRvdyBSZXNpemVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVdpbmRvd1Jlc2l6ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVdpbmRvd1Jlc2l6ZSgpIHtcclxuICAgICAgICAvLyBPbmx5IGhhbmRsZSBob3Jpem9udGFsIHJlc2l6ZXNcclxuICAgICAgICBpZiAodGhpcy5sYXN0V2luZG93V2lkdGggIT09IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiA5OTIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxhc3RXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgIHRoaXMubGFzdFdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwQ2xhc3Nlc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwQ2xhc3NlcygpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVkZ2UgPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgncmlnaHQtYWxpZ25lZCcpO1xyXG4gICAgICAgICAgdGhpcy5kcmFnVGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ3JpZ2h0LWFsaWduZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVDbGFzc2VzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlQ2xhc3NlcygpIHtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3JpZ2h0LWFsaWduZWQnKTtcclxuICAgICAgICB0aGlzLmRyYWdUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgncmlnaHQtYWxpZ25lZCcpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBGaXhlZFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRml4ZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3VycmVudGx5Rml4ZWQoKSkge1xyXG4gICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaXNDdXJyZW50bHlGaXhlZFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2lzQ3VycmVudGx5Rml4ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGaXhlZCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA+IDk5MjtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NyZWF0ZURyYWdUYXJnZXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9jcmVhdGVEcmFnVGFyZ2V0KCkge1xyXG4gICAgICAgIHZhciBkcmFnVGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZHJhZ1RhcmdldC5jbGFzc0xpc3QuYWRkKCdkcmFnLXRhcmdldCcpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZHJhZ1RhcmdldCk7XHJcbiAgICAgICAgdGhpcy5kcmFnVGFyZ2V0ID0gZHJhZ1RhcmdldDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3ByZXZlbnRCb2R5U2Nyb2xsaW5nXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcHJldmVudEJvZHlTY3JvbGxpbmcoKSB7XHJcbiAgICAgICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG4gICAgICAgIGJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2VuYWJsZUJvZHlTY3JvbGxpbmdcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9lbmFibGVCb2R5U2Nyb2xsaW5nKCkge1xyXG4gICAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuICAgICAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIm9wZW5cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuID09PSB0cnVlKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIFJ1biBvbk9wZW5TdGFydCBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuU3RhcnQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBmaXhlZCBTaWRlbmF2XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3VycmVudGx5Rml4ZWQoKSkge1xyXG4gICAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5lbCk7XHJcbiAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICAgICAgdHJhbnNsYXRlWDogMCxcclxuICAgICAgICAgICAgZHVyYXRpb246IDAsXHJcbiAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLl9lbmFibGVCb2R5U2Nyb2xsaW5nKCk7XHJcbiAgICAgICAgICB0aGlzLl9vdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgLy8gSGFuZGxlIG5vbi1maXhlZCBTaWRlbmF2XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJldmVudFNjcm9sbGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmV2ZW50Qm9keVNjcm9sbGluZygpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghdGhpcy5pc0RyYWdnZWQgfHwgdGhpcy5wZXJjZW50T3BlbiAhPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FuaW1hdGVJbigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiY2xvc2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT3BlbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFJ1biBvbkNsb3NlU3RhcnQgY2FsbGJhY2tcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlU3RhcnQuY2FsbCh0aGlzLCB0aGlzLmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBmaXhlZCBTaWRlbmF2XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3VycmVudGx5Rml4ZWQoKSkge1xyXG4gICAgICAgICAgdmFyIHRyYW5zZm9ybVggPSB0aGlzLm9wdGlvbnMuZWRnZSA9PT0gJ2xlZnQnID8gJy0xMDUlJyA6ICcxMDUlJztcclxuICAgICAgICAgIHRoaXMuZWwuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVYKFwiICsgdHJhbnNmb3JtWCArIFwiKVwiO1xyXG5cclxuICAgICAgICAgIC8vIEhhbmRsZSBub24tZml4ZWQgU2lkZW5hdlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9lbmFibGVCb2R5U2Nyb2xsaW5nKCk7XHJcblxyXG4gICAgICAgICAgaWYgKCF0aGlzLmlzRHJhZ2dlZCB8fCB0aGlzLnBlcmNlbnRPcGVuICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZU91dCgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVJblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVJbigpIHtcclxuICAgICAgICB0aGlzLl9hbmltYXRlU2lkZW5hdkluKCk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU92ZXJsYXlJbigpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZVNpZGVuYXZJblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVTaWRlbmF2SW4oKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMzIgPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgc2xpZGVPdXRQZXJjZW50ID0gdGhpcy5vcHRpb25zLmVkZ2UgPT09ICdsZWZ0JyA/IC0xIDogMTtcclxuICAgICAgICBpZiAodGhpcy5pc0RyYWdnZWQpIHtcclxuICAgICAgICAgIHNsaWRlT3V0UGVyY2VudCA9IHRoaXMub3B0aW9ucy5lZGdlID09PSAnbGVmdCcgPyBzbGlkZU91dFBlcmNlbnQgKyB0aGlzLnBlcmNlbnRPcGVuIDogc2xpZGVPdXRQZXJjZW50IC0gdGhpcy5wZXJjZW50T3BlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICAgIHRyYW5zbGF0ZVg6IFtzbGlkZU91dFBlcmNlbnQgKiAxMDAgKyBcIiVcIiwgMF0sXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBSdW4gb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMzMi5vcHRpb25zLm9uT3BlbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIF90aGlzMzIub3B0aW9ucy5vbk9wZW5FbmQuY2FsbChfdGhpczMyLCBfdGhpczMyLmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZU92ZXJsYXlJblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVPdmVybGF5SW4oKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5pc0RyYWdnZWQpIHtcclxuICAgICAgICAgIHN0YXJ0ID0gdGhpcy5wZXJjZW50T3BlbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJCh0aGlzLl9vdmVybGF5KS5jc3Moe1xyXG4gICAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuX292ZXJsYXkpO1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy5fb3ZlcmxheSxcclxuICAgICAgICAgIG9wYWNpdHk6IFtzdGFydCwgMV0sXHJcbiAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmluRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVPdXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlT3V0KCkge1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGVTaWRlbmF2T3V0KCk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU92ZXJsYXlPdXQoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVTaWRlbmF2T3V0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYW5pbWF0ZVNpZGVuYXZPdXQoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMzMgPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgZW5kUGVyY2VudCA9IHRoaXMub3B0aW9ucy5lZGdlID09PSAnbGVmdCcgPyAtMSA6IDE7XHJcbiAgICAgICAgdmFyIHNsaWRlT3V0UGVyY2VudCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEcmFnZ2VkKSB7XHJcbiAgICAgICAgICBzbGlkZU91dFBlcmNlbnQgPSB0aGlzLm9wdGlvbnMuZWRnZSA9PT0gJ2xlZnQnID8gZW5kUGVyY2VudCArIHRoaXMucGVyY2VudE9wZW4gOiBlbmRQZXJjZW50IC0gdGhpcy5wZXJjZW50T3BlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuZWwpO1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy5lbCxcclxuICAgICAgICAgIHRyYW5zbGF0ZVg6IFtzbGlkZU91dFBlcmNlbnQgKiAxMDAgKyBcIiVcIiwgZW5kUGVyY2VudCAqIDEwNSArIFwiJVwiXSxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBSdW4gb25PcGVuRW5kIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMzMy5vcHRpb25zLm9uQ2xvc2VFbmQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICBfdGhpczMzLm9wdGlvbnMub25DbG9zZUVuZC5jYWxsKF90aGlzMzMsIF90aGlzMzMuZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hbmltYXRlT3ZlcmxheU91dFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVPdmVybGF5T3V0KCkge1xyXG4gICAgICAgIHZhciBfdGhpczM0ID0gdGhpcztcclxuXHJcbiAgICAgICAgYW5pbS5yZW1vdmUodGhpcy5fb3ZlcmxheSk7XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiB0aGlzLl9vdmVybGF5LFxyXG4gICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMub3V0RHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKF90aGlzMzQuX292ZXJsYXkpLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChTaWRlbmF2Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2lkZW5hdiksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9TaWRlbmF2O1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIFNpZGVuYXY7XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFNpZGVuYXZcclxuICAgKiBAdHlwZSB7QXJyYXkuPFNpZGVuYXY+fVxyXG4gICAqL1xyXG5cclxuXHJcbiAgU2lkZW5hdi5fc2lkZW5hdnMgPSBbXTtcclxuXHJcbiAgTS5TaWRlbmF2ID0gU2lkZW5hdjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFNpZGVuYXYsICdzaWRlbmF2JywgJ01fU2lkZW5hdicpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbjsoZnVuY3Rpb24gKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICB0aHJvdHRsZTogMTAwLFxyXG4gICAgc2Nyb2xsT2Zmc2V0OiAyMDAsIC8vIG9mZnNldCAtIDIwMCBhbGxvd3MgZWxlbWVudHMgbmVhciBib3R0b20gb2YgcGFnZSB0byBzY3JvbGxcclxuICAgIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcclxuICAgIGdldEFjdGl2ZUVsZW1lbnQ6IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICByZXR1cm4gJ2FbaHJlZj1cIiMnICsgaWQgKyAnXCJdJztcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG5cclxuICB2YXIgU2Nyb2xsU3B5ID0gZnVuY3Rpb24gKF9Db21wb25lbnQ5KSB7XHJcbiAgICBfaW5oZXJpdHMoU2Nyb2xsU3B5LCBfQ29tcG9uZW50OSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgU2Nyb2xsU3B5IGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFNjcm9sbFNweShlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2Nyb2xsU3B5KTtcclxuXHJcbiAgICAgIHZhciBfdGhpczM1ID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFNjcm9sbFNweS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNjcm9sbFNweSkpLmNhbGwodGhpcywgU2Nyb2xsU3B5LCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXMzNS5lbC5NX1Njcm9sbFNweSA9IF90aGlzMzU7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIG1vZGFsXHJcbiAgICAgICAqIEBtZW1iZXIgTW9kYWwjb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbdGhyb3R0bGU9MTAwXSAtIFRocm90dGxlIG9mIHNjcm9sbCBoYW5kbGVyXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtzY3JvbGxPZmZzZXQ9MjAwXSAtIE9mZnNldCBmb3IgY2VudGVyaW5nIGVsZW1lbnQgd2hlbiBzY3JvbGxlZCB0b1xyXG4gICAgICAgKiBAcHJvcCB7U3RyaW5nfSBbYWN0aXZlQ2xhc3M9J2FjdGl2ZSddIC0gQ2xhc3MgYXBwbGllZCB0byBhY3RpdmUgZWxlbWVudHNcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBbZ2V0QWN0aXZlRWxlbWVudF0gLSBVc2VkIHRvIGZpbmQgYWN0aXZlIGVsZW1lbnRcclxuICAgICAgICovXHJcbiAgICAgIF90aGlzMzUub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTY3JvbGxTcHkuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gc2V0dXBcclxuICAgICAgU2Nyb2xsU3B5Ll9lbGVtZW50cy5wdXNoKF90aGlzMzUpO1xyXG4gICAgICBTY3JvbGxTcHkuX2NvdW50Kys7XHJcbiAgICAgIFNjcm9sbFNweS5faW5jcmVtZW50Kys7XHJcbiAgICAgIF90aGlzMzUudGlja0lkID0gLTE7XHJcbiAgICAgIF90aGlzMzUuaWQgPSBTY3JvbGxTcHkuX2luY3JlbWVudDtcclxuICAgICAgX3RoaXMzNS5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIF90aGlzMzUuX2hhbmRsZVdpbmRvd1Njcm9sbCgpO1xyXG4gICAgICByZXR1cm4gX3RoaXMzNTtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoU2Nyb2xsU3B5LCBbe1xyXG4gICAgICBrZXk6IFwiZGVzdHJveVwiLFxyXG5cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAgICovXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xyXG4gICAgICAgIFNjcm9sbFNweS5fZWxlbWVudHMuc3BsaWNlKFNjcm9sbFNweS5fZWxlbWVudHMuaW5kZXhPZih0aGlzKSwgMSk7XHJcbiAgICAgICAgU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldy5zcGxpY2UoU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldy5pbmRleE9mKHRoaXMpLCAxKTtcclxuICAgICAgICBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50cy5zcGxpY2UoU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMuaW5kZXhPZih0aGlzLiRlbCksIDEpO1xyXG4gICAgICAgIFNjcm9sbFNweS5fY291bnQtLTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgJCh0aGlzLm9wdGlvbnMuZ2V0QWN0aXZlRWxlbWVudCh0aGlzLiRlbC5hdHRyKCdpZCcpKSkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcclxuICAgICAgICB0aGlzLmVsLk1fU2Nyb2xsU3B5ID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB2YXIgdGhyb3R0bGVkUmVzaXplID0gTS50aHJvdHRsZSh0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGwsIDIwMCk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlVGhyb3R0bGVkUmVzaXplQm91bmQgPSB0aHJvdHRsZWRSZXNpemUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGxCb3VuZCA9IHRoaXMuX2hhbmRsZVdpbmRvd1Njcm9sbC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGlmIChTY3JvbGxTcHkuX2NvdW50ID09PSAxKSB7XHJcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5faGFuZGxlV2luZG93U2Nyb2xsQm91bmQpO1xyXG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kKTtcclxuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUcmlnZ2VyQ2xpY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgaWYgKFNjcm9sbFNweS5fY291bnQgPT09IDApIHtcclxuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9oYW5kbGVXaW5kb3dTY3JvbGxCb3VuZCk7XHJcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlVGhyb3R0bGVkUmVzaXplQm91bmQpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRyaWdnZXJDbGljayk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFRyaWdnZXIgQ2xpY2tcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlVHJpZ2dlckNsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlVHJpZ2dlckNsaWNrKGUpIHtcclxuICAgICAgICB2YXIgJHRyaWdnZXIgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gU2Nyb2xsU3B5Ll9lbGVtZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgdmFyIHNjcm9sbHNweSA9IFNjcm9sbFNweS5fZWxlbWVudHNbaV07XHJcbiAgICAgICAgICBpZiAoJHRyaWdnZXIuaXMoJ2FbaHJlZj1cIiMnICsgc2Nyb2xsc3B5LiRlbC5hdHRyKCdpZCcpICsgJ1wiXScpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHNjcm9sbHNweS4kZWwub2Zmc2V0KCkudG9wICsgMTtcclxuXHJcbiAgICAgICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgICAgIHRhcmdldHM6IFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGRvY3VtZW50LmJvZHldLFxyXG4gICAgICAgICAgICAgIHNjcm9sbFRvcDogb2Zmc2V0IC0gc2Nyb2xsc3B5Lm9wdGlvbnMuc2Nyb2xsT2Zmc2V0LFxyXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiA0MDAsXHJcbiAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dEN1YmljJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFdpbmRvdyBTY3JvbGxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVdpbmRvd1Njcm9sbFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVdpbmRvd1Njcm9sbCgpIHtcclxuICAgICAgICAvLyB1bmlxdWUgdGljayBpZFxyXG4gICAgICAgIFNjcm9sbFNweS5fdGlja3MrKztcclxuXHJcbiAgICAgICAgLy8gdmlld3BvcnQgcmVjdGFuZ2xlXHJcbiAgICAgICAgdmFyIHRvcCA9IE0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AoKSxcclxuICAgICAgICAgICAgbGVmdCA9IE0uZ2V0RG9jdW1lbnRTY3JvbGxMZWZ0KCksXHJcbiAgICAgICAgICAgIHJpZ2h0ID0gbGVmdCArIHdpbmRvdy5pbm5lcldpZHRoLFxyXG4gICAgICAgICAgICBib3R0b20gPSB0b3AgKyB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIGRldGVybWluZSB3aGljaCBlbGVtZW50cyBhcmUgaW4gdmlld1xyXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25zID0gU2Nyb2xsU3B5Ll9maW5kRWxlbWVudHModG9wLCByaWdodCwgYm90dG9tLCBsZWZ0KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGludGVyc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciBzY3JvbGxzcHkgPSBpbnRlcnNlY3Rpb25zW2ldO1xyXG4gICAgICAgICAgdmFyIGxhc3RUaWNrID0gc2Nyb2xsc3B5LnRpY2tJZDtcclxuICAgICAgICAgIGlmIChsYXN0VGljayA8IDApIHtcclxuICAgICAgICAgICAgLy8gZW50ZXJlZCBpbnRvIHZpZXdcclxuICAgICAgICAgICAgc2Nyb2xsc3B5Ll9lbnRlcigpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIHVwZGF0ZSB0aWNrIGlkXHJcbiAgICAgICAgICBzY3JvbGxzcHkudGlja0lkID0gU2Nyb2xsU3B5Ll90aWNrcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBTY3JvbGxTcHkuX2VsZW1lbnRzSW5WaWV3Lmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgdmFyIF9zY3JvbGxzcHkgPSBTY3JvbGxTcHkuX2VsZW1lbnRzSW5WaWV3W19pXTtcclxuICAgICAgICAgIHZhciBfbGFzdFRpY2sgPSBfc2Nyb2xsc3B5LnRpY2tJZDtcclxuICAgICAgICAgIGlmIChfbGFzdFRpY2sgPj0gMCAmJiBfbGFzdFRpY2sgIT09IFNjcm9sbFNweS5fdGlja3MpIHtcclxuICAgICAgICAgICAgLy8gZXhpdGVkIGZyb20gdmlld1xyXG4gICAgICAgICAgICBfc2Nyb2xsc3B5Ll9leGl0KCk7XHJcbiAgICAgICAgICAgIF9zY3JvbGxzcHkudGlja0lkID0gLTE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZW1lbWJlciBlbGVtZW50cyBpbiB2aWV3IGZvciBuZXh0IHRpY2tcclxuICAgICAgICBTY3JvbGxTcHkuX2VsZW1lbnRzSW5WaWV3ID0gaW50ZXJzZWN0aW9ucztcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEZpbmQgZWxlbWVudHMgdGhhdCBhcmUgd2l0aGluIHRoZSBib3VuZGFyeVxyXG4gICAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wXHJcbiAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodFxyXG4gICAgICAgKiBAcGFyYW0ge251bWJlcn0gYm90dG9tXHJcbiAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0XHJcbiAgICAgICAqIEByZXR1cm4ge0FycmF5LjxTY3JvbGxTcHk+fSAgIEEgY29sbGVjdGlvbiBvZiBlbGVtZW50c1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfZW50ZXJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9lbnRlcigpIHtcclxuICAgICAgICBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50cyA9IFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgIHJldHVybiB2YWx1ZS5oZWlnaHQoKSAhPSAwO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHNbMF0pIHtcclxuICAgICAgICAgICQodGhpcy5vcHRpb25zLmdldEFjdGl2ZUVsZW1lbnQoU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHNbMF0uYXR0cignaWQnKSkpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XHJcbiAgICAgICAgICBpZiAoU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHNbMF1bMF0uTV9TY3JvbGxTcHkgJiYgdGhpcy5pZCA8IFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzWzBdWzBdLk1fU2Nyb2xsU3B5LmlkKSB7XHJcbiAgICAgICAgICAgIFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzLnVuc2hpZnQodGhpcy4kZWwpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMucHVzaCh0aGlzLiRlbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzLnB1c2godGhpcy4kZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh0aGlzLm9wdGlvbnMuZ2V0QWN0aXZlRWxlbWVudChTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50c1swXS5hdHRyKCdpZCcpKSkuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2V4aXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9leGl0KCkge1xyXG4gICAgICAgIHZhciBfdGhpczM2ID0gdGhpcztcclxuXHJcbiAgICAgICAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMgPSBTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICByZXR1cm4gdmFsdWUuaGVpZ2h0KCkgIT0gMDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzWzBdKSB7XHJcbiAgICAgICAgICAkKHRoaXMub3B0aW9ucy5nZXRBY3RpdmVFbGVtZW50KFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzWzBdLmF0dHIoJ2lkJykpKS5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xyXG5cclxuICAgICAgICAgIFNjcm9sbFNweS5fdmlzaWJsZUVsZW1lbnRzID0gU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWwuYXR0cignaWQnKSAhPSBfdGhpczM2LiRlbC5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAoU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHNbMF0pIHtcclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZW1wdHlcclxuICAgICAgICAgICAgJCh0aGlzLm9wdGlvbnMuZ2V0QWN0aXZlRWxlbWVudChTY3JvbGxTcHkuX3Zpc2libGVFbGVtZW50c1swXS5hdHRyKCdpZCcpKSkuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChTY3JvbGxTcHkuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTY3JvbGxTcHkpLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fU2Nyb2xsU3B5O1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfZmluZEVsZW1lbnRzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZmluZEVsZW1lbnRzKHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xyXG4gICAgICAgIHZhciBoaXRzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBTY3JvbGxTcHkuX2VsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgc2Nyb2xsc3B5ID0gU2Nyb2xsU3B5Ll9lbGVtZW50c1tpXTtcclxuICAgICAgICAgIHZhciBjdXJyVG9wID0gdG9wICsgc2Nyb2xsc3B5Lm9wdGlvbnMuc2Nyb2xsT2Zmc2V0IHx8IDIwMDtcclxuXHJcbiAgICAgICAgICBpZiAoc2Nyb2xsc3B5LiRlbC5oZWlnaHQoKSA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGVsVG9wID0gc2Nyb2xsc3B5LiRlbC5vZmZzZXQoKS50b3AsXHJcbiAgICAgICAgICAgICAgICBlbExlZnQgPSBzY3JvbGxzcHkuJGVsLm9mZnNldCgpLmxlZnQsXHJcbiAgICAgICAgICAgICAgICBlbFJpZ2h0ID0gZWxMZWZ0ICsgc2Nyb2xsc3B5LiRlbC53aWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgZWxCb3R0b20gPSBlbFRvcCArIHNjcm9sbHNweS4kZWwuaGVpZ2h0KCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXNJbnRlcnNlY3QgPSAhKGVsTGVmdCA+IHJpZ2h0IHx8IGVsUmlnaHQgPCBsZWZ0IHx8IGVsVG9wID4gYm90dG9tIHx8IGVsQm90dG9tIDwgY3VyclRvcCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNJbnRlcnNlY3QpIHtcclxuICAgICAgICAgICAgICBoaXRzLnB1c2goc2Nyb2xsc3B5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGl0cztcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBTY3JvbGxTcHk7XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFNjcm9sbFNweVxyXG4gICAqIEB0eXBlIHtBcnJheS48U2Nyb2xsU3B5Pn1cclxuICAgKi9cclxuXHJcblxyXG4gIFNjcm9sbFNweS5fZWxlbWVudHMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTY3JvbGxTcHlcclxuICAgKiBAdHlwZSB7QXJyYXkuPFNjcm9sbFNweT59XHJcbiAgICovXHJcbiAgU2Nyb2xsU3B5Ll9lbGVtZW50c0luVmlldyA9IFtdO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFNjcm9sbFNweVxyXG4gICAqIEB0eXBlIHtBcnJheS48Y2FzaD59XHJcbiAgICovXHJcbiAgU2Nyb2xsU3B5Ll92aXNpYmxlRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTY3JvbGxTcHlcclxuICAgKi9cclxuICBTY3JvbGxTcHkuX2NvdW50ID0gMDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBtZW1iZXJvZiBTY3JvbGxTcHlcclxuICAgKi9cclxuICBTY3JvbGxTcHkuX2luY3JlbWVudCA9IDA7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgU2Nyb2xsU3B5XHJcbiAgICovXHJcbiAgU2Nyb2xsU3B5Ll90aWNrcyA9IDA7XHJcblxyXG4gIE0uU2Nyb2xsU3B5ID0gU2Nyb2xsU3B5O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoU2Nyb2xsU3B5LCAnc2Nyb2xsU3B5JywgJ01fU2Nyb2xsU3B5Jyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuOyhmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIGRhdGE6IHt9LCAvLyBBdXRvY29tcGxldGUgZGF0YSBzZXRcclxuICAgIGxpbWl0OiBJbmZpbml0eSwgLy8gTGltaXQgb2YgcmVzdWx0cyB0aGUgYXV0b2NvbXBsZXRlIHNob3dzXHJcbiAgICBvbkF1dG9jb21wbGV0ZTogbnVsbCwgLy8gQ2FsbGJhY2sgZm9yIHdoZW4gYXV0b2NvbXBsZXRlZFxyXG4gICAgbWluTGVuZ3RoOiAxLCAvLyBNaW4gY2hhcmFjdGVycyBiZWZvcmUgYXV0b2NvbXBsZXRlIHN0YXJ0c1xyXG4gICAgc29ydEZ1bmN0aW9uOiBmdW5jdGlvbiAoYSwgYiwgaW5wdXRTdHJpbmcpIHtcclxuICAgICAgLy8gU29ydCBmdW5jdGlvbiBmb3Igc29ydGluZyBhdXRvY29tcGxldGUgcmVzdWx0c1xyXG4gICAgICByZXR1cm4gYS5pbmRleE9mKGlucHV0U3RyaW5nKSAtIGIuaW5kZXhPZihpbnB1dFN0cmluZyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIEF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChfQ29tcG9uZW50MTApIHtcclxuICAgIF9pbmhlcml0cyhBdXRvY29tcGxldGUsIF9Db21wb25lbnQxMCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgQXV0b2NvbXBsZXRlIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQXV0b2NvbXBsZXRlKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczM3ID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKEF1dG9jb21wbGV0ZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEF1dG9jb21wbGV0ZSkpLmNhbGwodGhpcywgQXV0b2NvbXBsZXRlLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXMzNy5lbC5NX0F1dG9jb21wbGV0ZSA9IF90aGlzMzc7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIGF1dG9jb21wbGV0ZVxyXG4gICAgICAgKiBAbWVtYmVyIEF1dG9jb21wbGV0ZSNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IGR1cmF0aW9uXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IGRpc3RcclxuICAgICAgICogQHByb3Age251bWJlcn0gc2hpZnRcclxuICAgICAgICogQHByb3Age251bWJlcn0gcGFkZGluZ1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gZnVsbFdpZHRoXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBpbmRpY2F0b3JzXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBub1dyYXBcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkN5Y2xlVG9cclxuICAgICAgICovXHJcbiAgICAgIF90aGlzMzcub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBdXRvY29tcGxldGUuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gU2V0dXBcclxuICAgICAgX3RoaXMzNy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgX3RoaXMzNy5jb3VudCA9IDA7XHJcbiAgICAgIF90aGlzMzcuYWN0aXZlSW5kZXggPSAtMTtcclxuICAgICAgX3RoaXMzNy5vbGRWYWw7XHJcbiAgICAgIF90aGlzMzcuJGlucHV0RmllbGQgPSBfdGhpczM3LiRlbC5jbG9zZXN0KCcuaW5wdXQtZmllbGQnKTtcclxuICAgICAgX3RoaXMzNy4kYWN0aXZlID0gJCgpO1xyXG4gICAgICBfdGhpczM3Ll9tb3VzZWRvd24gPSBmYWxzZTtcclxuICAgICAgX3RoaXMzNy5fc2V0dXBEcm9wZG93bigpO1xyXG5cclxuICAgICAgX3RoaXMzNy5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIHJldHVybiBfdGhpczM3O1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhBdXRvY29tcGxldGUsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZURyb3Bkb3duKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX0F1dG9jb21wbGV0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cEV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlSW5wdXRCbHVyQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dEJsdXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVJbnB1dEtleXVwQW5kRm9jdXNCb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0S2V5dXBBbmRGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNvbnRhaW5lck1vdXNlZG93bkFuZFRvdWNoc3RhcnRCb3VuZCA9IHRoaXMuX2hhbmRsZUNvbnRhaW5lck1vdXNlZG93bkFuZFRvdWNoc3RhcnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCA9IHRoaXMuX2hhbmRsZUNvbnRhaW5lck1vdXNldXBBbmRUb3VjaGVuZC5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVJbnB1dEJsdXJCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuX2hhbmRsZUlucHV0S2V5dXBBbmRGb2N1c0JvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlSW5wdXRLZXl1cEFuZEZvY3VzQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0Qm91bmQpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0Qm91bmQpO1xyXG4gICAgICAgICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVJbnB1dEJsdXJCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuX2hhbmRsZUlucHV0S2V5dXBBbmRGb2N1c0JvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlSW5wdXRLZXl1cEFuZEZvY3VzQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0Qm91bmQpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0Qm91bmQpO1xyXG4gICAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDb250YWluZXJNb3VzZXVwQW5kVG91Y2hlbmRCb3VuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgZHJvcGRvd25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRHJvcGRvd25cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cERyb3Bkb3duKCkge1xyXG4gICAgICAgIHZhciBfdGhpczM4ID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmlkID0gXCJhdXRvY29tcGxldGUtb3B0aW9ucy1cIiArIE0uZ3VpZCgpO1xyXG4gICAgICAgICQodGhpcy5jb250YWluZXIpLmFkZENsYXNzKCdhdXRvY29tcGxldGUtY29udGVudCBkcm9wZG93bi1jb250ZW50Jyk7XHJcbiAgICAgICAgdGhpcy4kaW5wdXRGaWVsZC5hcHBlbmQodGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcsIHRoaXMuY29udGFpbmVyLmlkKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcm9wZG93biA9IE0uRHJvcGRvd24uaW5pdCh0aGlzLmVsLCB7XHJcbiAgICAgICAgICBhdXRvRm9jdXM6IGZhbHNlLFxyXG4gICAgICAgICAgY2xvc2VPbkNsaWNrOiBmYWxzZSxcclxuICAgICAgICAgIGNvdmVyVHJpZ2dlcjogZmFsc2UsXHJcbiAgICAgICAgICBvbkl0ZW1DbGljazogZnVuY3Rpb24gKGl0ZW1FbCkge1xyXG4gICAgICAgICAgICBfdGhpczM4LnNlbGVjdE9wdGlvbigkKGl0ZW1FbCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTa2V0Y2h5IHJlbW92YWwgb2YgZHJvcGRvd24gY2xpY2sgaGFuZGxlclxyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRyb3Bkb3duLl9oYW5kbGVDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBkcm9wZG93blxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRHJvcGRvd25cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVEcm9wZG93bigpIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBJbnB1dCBCbHVyXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVJbnB1dEJsdXJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVJbnB1dEJsdXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9tb3VzZWRvd24pIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgIHRoaXMuX3Jlc2V0QXV0b2NvbXBsZXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIElucHV0IEtleXVwIGFuZCBGb2N1c1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVJbnB1dEtleXVwQW5kRm9jdXNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVJbnB1dEtleXVwQW5kRm9jdXMoZSkge1xyXG4gICAgICAgIGlmIChlLnR5cGUgPT09ICdrZXl1cCcpIHtcclxuICAgICAgICAgIEF1dG9jb21wbGV0ZS5fa2V5ZG93biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMuZWwudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgLy8gRG9uJ3QgY2FwdHVyZSBlbnRlciBvciBhcnJvdyBrZXkgdXNhZ2UuXHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMgfHwgZS5rZXlDb2RlID09PSAzOCB8fCBlLmtleUNvZGUgPT09IDQwKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgaW5wdXQgaXNuJ3QgZW1wdHlcclxuICAgICAgICAvLyBDaGVjayBpZiBmb2N1cyB0cmlnZ2VyZWQgYnkgdGFiXHJcbiAgICAgICAgaWYgKHRoaXMub2xkVmFsICE9PSB2YWwgJiYgKE0udGFiUHJlc3NlZCB8fCBlLnR5cGUgIT09ICdmb2N1cycpKSB7XHJcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBvbGRWYWxcclxuICAgICAgICB0aGlzLm9sZFZhbCA9IHZhbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBJbnB1dCBLZXlkb3duXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUlucHV0S2V5ZG93blwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUlucHV0S2V5ZG93bihlKSB7XHJcbiAgICAgICAgQXV0b2NvbXBsZXRlLl9rZXlkb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gQXJyb3cga2V5cyBhbmQgZW50ZXIga2V5IHVzYWdlXHJcbiAgICAgICAgdmFyIGtleUNvZGUgPSBlLmtleUNvZGUsXHJcbiAgICAgICAgICAgIGxpRWxlbWVudCA9IHZvaWQgMCxcclxuICAgICAgICAgICAgbnVtSXRlbXMgPSAkKHRoaXMuY29udGFpbmVyKS5jaGlsZHJlbignbGknKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIHNlbGVjdCBlbGVtZW50IG9uIEVudGVyXHJcbiAgICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5FTlRFUiAmJiB0aGlzLmFjdGl2ZUluZGV4ID49IDApIHtcclxuICAgICAgICAgIGxpRWxlbWVudCA9ICQodGhpcy5jb250YWluZXIpLmNoaWxkcmVuKCdsaScpLmVxKHRoaXMuYWN0aXZlSW5kZXgpO1xyXG4gICAgICAgICAgaWYgKGxpRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24obGlFbGVtZW50KTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2FwdHVyZSB1cCBhbmQgZG93biBrZXlcclxuICAgICAgICBpZiAoa2V5Q29kZSA9PT0gTS5rZXlzLkFSUk9XX1VQIHx8IGtleUNvZGUgPT09IE0ua2V5cy5BUlJPV19ET1dOKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5BUlJPV19VUCAmJiB0aGlzLmFjdGl2ZUluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4LS07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGtleUNvZGUgPT09IE0ua2V5cy5BUlJPV19ET1dOICYmIHRoaXMuYWN0aXZlSW5kZXggPCBudW1JdGVtcyAtIDEpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVJbmRleCsrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuJGFjdGl2ZS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmVJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGFjdGl2ZSA9ICQodGhpcy5jb250YWluZXIpLmNoaWxkcmVuKCdsaScpLmVxKHRoaXMuYWN0aXZlSW5kZXgpO1xyXG4gICAgICAgICAgICB0aGlzLiRhY3RpdmUuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBJbnB1dCBDbGlja1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVJbnB1dENsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5wdXRDbGljayhlKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgQ29udGFpbmVyIE1vdXNlZG93biBhbmQgVG91Y2hzdGFydFxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDb250YWluZXJNb3VzZWRvd25BbmRUb3VjaHN0YXJ0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ29udGFpbmVyTW91c2Vkb3duQW5kVG91Y2hzdGFydChlKSB7XHJcbiAgICAgICAgdGhpcy5fbW91c2Vkb3duID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBDb250YWluZXIgTW91c2V1cCBhbmQgVG91Y2hlbmRcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ29udGFpbmVyTW91c2V1cEFuZFRvdWNoZW5kXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ29udGFpbmVyTW91c2V1cEFuZFRvdWNoZW5kKGUpIHtcclxuICAgICAgICB0aGlzLl9tb3VzZWRvd24gPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhpZ2hsaWdodCBwYXJ0aWFsIG1hdGNoXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oaWdobGlnaHRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oaWdobGlnaHQoc3RyaW5nLCAkZWwpIHtcclxuICAgICAgICB2YXIgaW1nID0gJGVsLmZpbmQoJ2ltZycpO1xyXG4gICAgICAgIHZhciBtYXRjaFN0YXJ0ID0gJGVsLnRleHQoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJycgKyBzdHJpbmcudG9Mb3dlckNhc2UoKSArICcnKSxcclxuICAgICAgICAgICAgbWF0Y2hFbmQgPSBtYXRjaFN0YXJ0ICsgc3RyaW5nLmxlbmd0aCAtIDEsXHJcbiAgICAgICAgICAgIGJlZm9yZU1hdGNoID0gJGVsLnRleHQoKS5zbGljZSgwLCBtYXRjaFN0YXJ0KSxcclxuICAgICAgICAgICAgbWF0Y2hUZXh0ID0gJGVsLnRleHQoKS5zbGljZShtYXRjaFN0YXJ0LCBtYXRjaEVuZCArIDEpLFxyXG4gICAgICAgICAgICBhZnRlck1hdGNoID0gJGVsLnRleHQoKS5zbGljZShtYXRjaEVuZCArIDEpO1xyXG4gICAgICAgICRlbC5odG1sKFwiPHNwYW4+XCIgKyBiZWZvcmVNYXRjaCArIFwiPHNwYW4gY2xhc3M9J2hpZ2hsaWdodCc+XCIgKyBtYXRjaFRleHQgKyBcIjwvc3Bhbj5cIiArIGFmdGVyTWF0Y2ggKyBcIjwvc3Bhbj5cIik7XHJcbiAgICAgICAgaWYgKGltZy5sZW5ndGgpIHtcclxuICAgICAgICAgICRlbC5wcmVwZW5kKGltZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVzZXQgY3VycmVudCBlbGVtZW50IHBvc2l0aW9uXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZXNldEN1cnJlbnRFbGVtZW50XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVzZXRDdXJyZW50RWxlbWVudCgpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy4kYWN0aXZlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlc2V0IGF1dG9jb21wbGV0ZSBlbGVtZW50c1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVzZXRBdXRvY29tcGxldGVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZXNldEF1dG9jb21wbGV0ZSgpIHtcclxuICAgICAgICAkKHRoaXMuY29udGFpbmVyKS5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuX3Jlc2V0Q3VycmVudEVsZW1lbnQoKTtcclxuICAgICAgICB0aGlzLm9sZFZhbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9tb3VzZWRvd24gPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNlbGVjdCBhdXRvY29tcGxldGUgb3B0aW9uXHJcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWwgIEF1dG9jb21wbGV0ZSBvcHRpb24gbGlzdCBpdGVtIGVsZW1lbnRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic2VsZWN0T3B0aW9uXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RPcHRpb24oZWwpIHtcclxuICAgICAgICB2YXIgdGV4dCA9IGVsLnRleHQoKS50cmltKCk7XHJcbiAgICAgICAgdGhpcy5lbC52YWx1ZSA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgdGhpcy5fcmVzZXRBdXRvY29tcGxldGUoKTtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBvbkF1dG9jb21wbGV0ZSBjYWxsYmFjay5cclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkF1dG9jb21wbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uQXV0b2NvbXBsZXRlLmNhbGwodGhpcywgdGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVuZGVyIGRyb3Bkb3duIGNvbnRlbnRcclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgIGRhdGEgc2V0XHJcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWwgIGN1cnJlbnQgaW5wdXQgdmFsdWVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbmRlckRyb3Bkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVuZGVyRHJvcGRvd24oZGF0YSwgdmFsKSB7XHJcbiAgICAgICAgdmFyIF90aGlzMzkgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLl9yZXNldEF1dG9jb21wbGV0ZSgpO1xyXG5cclxuICAgICAgICB2YXIgbWF0Y2hpbmdEYXRhID0gW107XHJcblxyXG4gICAgICAgIC8vIEdhdGhlciBhbGwgbWF0Y2hpbmcgZGF0YVxyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gQnJlYWsgaWYgcGFzdCBsaW1pdFxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb3VudCA+PSB0aGlzLm9wdGlvbnMubGltaXQpIHtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGVudHJ5ID0ge1xyXG4gICAgICAgICAgICAgIGRhdGE6IGRhdGFba2V5XSxcclxuICAgICAgICAgICAgICBrZXk6IGtleVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBtYXRjaGluZ0RhdGEucHVzaChlbnRyeSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvdW50Kys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTb3J0XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0RnVuY3Rpb24pIHtcclxuICAgICAgICAgIHZhciBzb3J0RnVuY3Rpb25Cb3VuZCA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpczM5Lm9wdGlvbnMuc29ydEZ1bmN0aW9uKGEua2V5LnRvTG93ZXJDYXNlKCksIGIua2V5LnRvTG93ZXJDYXNlKCksIHZhbC50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBtYXRjaGluZ0RhdGEuc29ydChzb3J0RnVuY3Rpb25Cb3VuZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW5kZXJcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoaW5nRGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgdmFyIF9lbnRyeSA9IG1hdGNoaW5nRGF0YVtpXTtcclxuICAgICAgICAgIHZhciAkYXV0b2NvbXBsZXRlT3B0aW9uID0gJCgnPGxpPjwvbGk+Jyk7XHJcbiAgICAgICAgICBpZiAoISFfZW50cnkuZGF0YSkge1xyXG4gICAgICAgICAgICAkYXV0b2NvbXBsZXRlT3B0aW9uLmFwcGVuZChcIjxpbWcgc3JjPVxcXCJcIiArIF9lbnRyeS5kYXRhICsgXCJcXFwiIGNsYXNzPVxcXCJyaWdodCBjaXJjbGVcXFwiPjxzcGFuPlwiICsgX2VudHJ5LmtleSArIFwiPC9zcGFuPlwiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRhdXRvY29tcGxldGVPcHRpb24uYXBwZW5kKCc8c3Bhbj4nICsgX2VudHJ5LmtleSArICc8L3NwYW4+Jyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJCh0aGlzLmNvbnRhaW5lcikuYXBwZW5kKCRhdXRvY29tcGxldGVPcHRpb24pO1xyXG4gICAgICAgICAgdGhpcy5faGlnaGxpZ2h0KHZhbCwgJGF1dG9jb21wbGV0ZU9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3BlbiBBdXRvY29tcGxldGUgRHJvcGRvd25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwib3BlblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbigpIHtcclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5lbC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICB0aGlzLl9yZXNldEF1dG9jb21wbGV0ZSgpO1xyXG5cclxuICAgICAgICBpZiAodmFsLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMubWluTGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLl9yZW5kZXJEcm9wZG93bih0aGlzLm9wdGlvbnMuZGF0YSwgdmFsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9wZW4gZHJvcGRvd25cclxuICAgICAgICBpZiAoIXRoaXMuZHJvcGRvd24uaXNPcGVuKSB7XHJcbiAgICAgICAgICB0aGlzLmRyb3Bkb3duLm9wZW4oKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gUmVjYWxjdWxhdGUgZHJvcGRvd24gd2hlbiBpdHMgYWxyZWFkeSBvcGVuXHJcbiAgICAgICAgICB0aGlzLmRyb3Bkb3duLnJlY2FsY3VsYXRlRGltZW5zaW9ucygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENsb3NlIEF1dG9jb21wbGV0ZSBEcm9wZG93blxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJjbG9zZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5kcm9wZG93bi5jbG9zZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVXBkYXRlIERhdGFcclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwidXBkYXRlRGF0YVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlRGF0YShkYXRhKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMuZWwudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZGF0YSA9IGRhdGE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgdGhpcy5fcmVuZGVyRHJvcGRvd24oZGF0YSwgdmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChBdXRvY29tcGxldGUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihBdXRvY29tcGxldGUpLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fQXV0b2NvbXBsZXRlO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIEF1dG9jb21wbGV0ZTtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBzdGF0aWNcclxuICAgKiBAbWVtYmVyb2YgQXV0b2NvbXBsZXRlXHJcbiAgICovXHJcblxyXG5cclxuICBBdXRvY29tcGxldGUuX2tleWRvd24gPSBmYWxzZTtcclxuXHJcbiAgTS5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihBdXRvY29tcGxldGUsICdhdXRvY29tcGxldGUnLCAnTV9BdXRvY29tcGxldGUnKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG47KGZ1bmN0aW9uICgkKSB7XHJcbiAgLy8gRnVuY3Rpb24gdG8gdXBkYXRlIGxhYmVscyBvZiB0ZXh0IGZpZWxkc1xyXG4gIE0udXBkYXRlVGV4dEZpZWxkcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBpbnB1dF9zZWxlY3RvciA9ICdpbnB1dFt0eXBlPXRleHRdLCBpbnB1dFt0eXBlPXBhc3N3b3JkXSwgaW5wdXRbdHlwZT1lbWFpbF0sIGlucHV0W3R5cGU9dXJsXSwgaW5wdXRbdHlwZT10ZWxdLCBpbnB1dFt0eXBlPW51bWJlcl0sIGlucHV0W3R5cGU9c2VhcmNoXSwgaW5wdXRbdHlwZT1kYXRlXSwgaW5wdXRbdHlwZT10aW1lXSwgdGV4dGFyZWEnO1xyXG4gICAgJChpbnB1dF9zZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgaWYgKGVsZW1lbnQudmFsdWUubGVuZ3RoID4gMCB8fCAkKGVsZW1lbnQpLmlzKCc6Zm9jdXMnKSB8fCBlbGVtZW50LmF1dG9mb2N1cyB8fCAkdGhpcy5hdHRyKCdwbGFjZWhvbGRlcicpICE9PSBudWxsKSB7XHJcbiAgICAgICAgJHRoaXMuc2libGluZ3MoJ2xhYmVsJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQudmFsaWRpdHkpIHtcclxuICAgICAgICAkdGhpcy5zaWJsaW5ncygnbGFiZWwnKS50b2dnbGVDbGFzcygnYWN0aXZlJywgZWxlbWVudC52YWxpZGl0eS5iYWRJbnB1dCA9PT0gdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHRoaXMuc2libGluZ3MoJ2xhYmVsJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBNLnZhbGlkYXRlX2ZpZWxkID0gZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgdmFyIGhhc0xlbmd0aCA9IG9iamVjdC5hdHRyKCdkYXRhLWxlbmd0aCcpICE9PSBudWxsO1xyXG4gICAgdmFyIGxlbkF0dHIgPSBwYXJzZUludChvYmplY3QuYXR0cignZGF0YS1sZW5ndGgnKSk7XHJcbiAgICB2YXIgbGVuID0gb2JqZWN0WzBdLnZhbHVlLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobGVuID09PSAwICYmIG9iamVjdFswXS52YWxpZGl0eS5iYWRJbnB1dCA9PT0gZmFsc2UgJiYgIW9iamVjdC5pcygnOnJlcXVpcmVkJykpIHtcclxuICAgICAgaWYgKG9iamVjdC5oYXNDbGFzcygndmFsaWRhdGUnKSkge1xyXG4gICAgICAgIG9iamVjdC5yZW1vdmVDbGFzcygndmFsaWQnKTtcclxuICAgICAgICBvYmplY3QucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKG9iamVjdC5oYXNDbGFzcygndmFsaWRhdGUnKSkge1xyXG4gICAgICAgIC8vIENoZWNrIGZvciBjaGFyYWN0ZXIgY291bnRlciBhdHRyaWJ1dGVzXHJcbiAgICAgICAgaWYgKG9iamVjdC5pcygnOnZhbGlkJykgJiYgaGFzTGVuZ3RoICYmIGxlbiA8PSBsZW5BdHRyIHx8IG9iamVjdC5pcygnOnZhbGlkJykgJiYgIWhhc0xlbmd0aCkge1xyXG4gICAgICAgICAgb2JqZWN0LnJlbW92ZUNsYXNzKCdpbnZhbGlkJyk7XHJcbiAgICAgICAgICBvYmplY3QuYWRkQ2xhc3MoJ3ZhbGlkJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG9iamVjdC5yZW1vdmVDbGFzcygndmFsaWQnKTtcclxuICAgICAgICAgIG9iamVjdC5hZGRDbGFzcygnaW52YWxpZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIE0udGV4dGFyZWFBdXRvUmVzaXplID0gZnVuY3Rpb24gKCR0ZXh0YXJlYSkge1xyXG4gICAgLy8gV3JhcCBpZiBuYXRpdmUgZWxlbWVudFxyXG4gICAgaWYgKCR0ZXh0YXJlYSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcclxuICAgICAgJHRleHRhcmVhID0gJCgkdGV4dGFyZWEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghJHRleHRhcmVhLmxlbmd0aCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdObyB0ZXh0YXJlYSBlbGVtZW50IGZvdW5kJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUZXh0YXJlYSBBdXRvIFJlc2l6ZVxyXG4gICAgdmFyIGhpZGRlbkRpdiA9ICQoJy5oaWRkZW5kaXYnKS5maXJzdCgpO1xyXG4gICAgaWYgKCFoaWRkZW5EaXYubGVuZ3RoKSB7XHJcbiAgICAgIGhpZGRlbkRpdiA9ICQoJzxkaXYgY2xhc3M9XCJoaWRkZW5kaXYgY29tbW9uXCI+PC9kaXY+Jyk7XHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoaGlkZGVuRGl2KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgZm9udCBwcm9wZXJ0aWVzIG9mIGhpZGRlbkRpdlxyXG4gICAgdmFyIGZvbnRGYW1pbHkgPSAkdGV4dGFyZWEuY3NzKCdmb250LWZhbWlseScpO1xyXG4gICAgdmFyIGZvbnRTaXplID0gJHRleHRhcmVhLmNzcygnZm9udC1zaXplJyk7XHJcbiAgICB2YXIgbGluZUhlaWdodCA9ICR0ZXh0YXJlYS5jc3MoJ2xpbmUtaGVpZ2h0Jyk7XHJcblxyXG4gICAgLy8gRmlyZWZveCBjYW4ndCBoYW5kbGUgcGFkZGluZyBzaG9ydGhhbmQuXHJcbiAgICB2YXIgcGFkZGluZ1RvcCA9ICR0ZXh0YXJlYS5jc3MoJ3BhZGRpbmctdG9wJyk7XHJcbiAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gJHRleHRhcmVhLmNzcygncGFkZGluZy1yaWdodCcpO1xyXG4gICAgdmFyIHBhZGRpbmdCb3R0b20gPSAkdGV4dGFyZWEuY3NzKCdwYWRkaW5nLWJvdHRvbScpO1xyXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gJHRleHRhcmVhLmNzcygncGFkZGluZy1sZWZ0Jyk7XHJcblxyXG4gICAgaWYgKGZvbnRTaXplKSB7XHJcbiAgICAgIGhpZGRlbkRpdi5jc3MoJ2ZvbnQtc2l6ZScsIGZvbnRTaXplKTtcclxuICAgIH1cclxuICAgIGlmIChmb250RmFtaWx5KSB7XHJcbiAgICAgIGhpZGRlbkRpdi5jc3MoJ2ZvbnQtZmFtaWx5JywgZm9udEZhbWlseSk7XHJcbiAgICB9XHJcbiAgICBpZiAobGluZUhlaWdodCkge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCdsaW5lLWhlaWdodCcsIGxpbmVIZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhZGRpbmdUb3ApIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygncGFkZGluZy10b3AnLCBwYWRkaW5nVG9wKTtcclxuICAgIH1cclxuICAgIGlmIChwYWRkaW5nUmlnaHQpIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygncGFkZGluZy1yaWdodCcsIHBhZGRpbmdSaWdodCk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFkZGluZ0JvdHRvbSkge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdCb3R0b20pO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhZGRpbmdMZWZ0KSB7XHJcbiAgICAgIGhpZGRlbkRpdi5jc3MoJ3BhZGRpbmctbGVmdCcsIHBhZGRpbmdMZWZ0KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgb3JpZ2luYWwtaGVpZ2h0LCBpZiBub25lXHJcbiAgICBpZiAoISR0ZXh0YXJlYS5kYXRhKCdvcmlnaW5hbC1oZWlnaHQnKSkge1xyXG4gICAgICAkdGV4dGFyZWEuZGF0YSgnb3JpZ2luYWwtaGVpZ2h0JywgJHRleHRhcmVhLmhlaWdodCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoJHRleHRhcmVhLmF0dHIoJ3dyYXAnKSA9PT0gJ29mZicpIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygnb3ZlcmZsb3ctd3JhcCcsICdub3JtYWwnKS5jc3MoJ3doaXRlLXNwYWNlJywgJ3ByZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGRlbkRpdi50ZXh0KCR0ZXh0YXJlYVswXS52YWx1ZSArICdcXG4nKTtcclxuICAgIHZhciBjb250ZW50ID0gaGlkZGVuRGl2Lmh0bWwoKS5yZXBsYWNlKC9cXG4vZywgJzxicj4nKTtcclxuICAgIGhpZGRlbkRpdi5odG1sKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vIFdoZW4gdGV4dGFyZWEgaXMgaGlkZGVuLCB3aWR0aCBnb2VzIGNyYXp5LlxyXG4gICAgLy8gQXBwcm94aW1hdGUgd2l0aCBoYWxmIG9mIHdpbmRvdyBzaXplXHJcblxyXG4gICAgaWYgKCR0ZXh0YXJlYVswXS5vZmZzZXRXaWR0aCA+IDAgJiYgJHRleHRhcmVhWzBdLm9mZnNldEhlaWdodCA+IDApIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygnd2lkdGgnLCAkdGV4dGFyZWEud2lkdGgoKSArICdweCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygnd2lkdGgnLCB3aW5kb3cuaW5uZXJXaWR0aCAvIDIgKyAncHgnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc2l6ZSBpZiB0aGUgbmV3IGhlaWdodCBpcyBncmVhdGVyIHRoYW4gdGhlXHJcbiAgICAgKiBvcmlnaW5hbCBoZWlnaHQgb2YgdGhlIHRleHRhcmVhXHJcbiAgICAgKi9cclxuICAgIGlmICgkdGV4dGFyZWEuZGF0YSgnb3JpZ2luYWwtaGVpZ2h0JykgPD0gaGlkZGVuRGl2LmlubmVySGVpZ2h0KCkpIHtcclxuICAgICAgJHRleHRhcmVhLmNzcygnaGVpZ2h0JywgaGlkZGVuRGl2LmlubmVySGVpZ2h0KCkgKyAncHgnKTtcclxuICAgIH0gZWxzZSBpZiAoJHRleHRhcmVhWzBdLnZhbHVlLmxlbmd0aCA8ICR0ZXh0YXJlYS5kYXRhKCdwcmV2aW91cy1sZW5ndGgnKSkge1xyXG4gICAgICAvKipcclxuICAgICAgICogSW4gY2FzZSB0aGUgbmV3IGhlaWdodCBpcyBsZXNzIHRoYW4gb3JpZ2luYWwgaGVpZ2h0LCBpdFxyXG4gICAgICAgKiBtZWFucyB0aGUgdGV4dGFyZWEgaGFzIGxlc3MgdGV4dCB0aGFuIGJlZm9yZVxyXG4gICAgICAgKiBTbyB3ZSBzZXQgdGhlIGhlaWdodCB0byB0aGUgb3JpZ2luYWwgb25lXHJcbiAgICAgICAqL1xyXG4gICAgICAkdGV4dGFyZWEuY3NzKCdoZWlnaHQnLCAkdGV4dGFyZWEuZGF0YSgnb3JpZ2luYWwtaGVpZ2h0JykgKyAncHgnKTtcclxuICAgIH1cclxuICAgICR0ZXh0YXJlYS5kYXRhKCdwcmV2aW91cy1sZW5ndGgnLCAkdGV4dGFyZWFbMF0udmFsdWUubGVuZ3RoKTtcclxuICB9O1xyXG5cclxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBUZXh0IGJhc2VkIGlucHV0c1xyXG4gICAgdmFyIGlucHV0X3NlbGVjdG9yID0gJ2lucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9cGFzc3dvcmRdLCBpbnB1dFt0eXBlPWVtYWlsXSwgaW5wdXRbdHlwZT11cmxdLCBpbnB1dFt0eXBlPXRlbF0sIGlucHV0W3R5cGU9bnVtYmVyXSwgaW5wdXRbdHlwZT1zZWFyY2hdLCBpbnB1dFt0eXBlPWRhdGVdLCBpbnB1dFt0eXBlPXRpbWVdLCB0ZXh0YXJlYSc7XHJcblxyXG4gICAgLy8gQWRkIGFjdGl2ZSBpZiBmb3JtIGF1dG8gY29tcGxldGVcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCBpbnB1dF9zZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodGhpcy52YWx1ZS5sZW5ndGggIT09IDAgfHwgJCh0aGlzKS5hdHRyKCdwbGFjZWhvbGRlcicpICE9PSBudWxsKSB7XHJcbiAgICAgICAgJCh0aGlzKS5zaWJsaW5ncygnbGFiZWwnKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuICAgICAgTS52YWxpZGF0ZV9maWVsZCgkKHRoaXMpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCBhY3RpdmUgaWYgaW5wdXQgZWxlbWVudCBoYXMgYmVlbiBwcmUtcG9wdWxhdGVkIG9uIGRvY3VtZW50IHJlYWR5XHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIE0udXBkYXRlVGV4dEZpZWxkcygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSFRNTCBET00gRk9STSBSRVNFVCBoYW5kbGluZ1xyXG4gICAgJChkb2N1bWVudCkub24oJ3Jlc2V0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgdmFyIGZvcm1SZXNldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICBpZiAoZm9ybVJlc2V0LmlzKCdmb3JtJykpIHtcclxuICAgICAgICBmb3JtUmVzZXQuZmluZChpbnB1dF9zZWxlY3RvcikucmVtb3ZlQ2xhc3MoJ3ZhbGlkJykucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcclxuICAgICAgICBmb3JtUmVzZXQuZmluZChpbnB1dF9zZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykuc2libGluZ3MoJ2xhYmVsJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBzZWxlY3QgKGFmdGVyIG5hdGl2ZSByZXNldClcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGZvcm1SZXNldC5maW5kKCdzZWxlY3QnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMuTV9Gb3JtU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGFjdGl2ZSB3aGVuIGVsZW1lbnQgaGFzIGZvY3VzXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKGlucHV0X3NlbGVjdG9yKSkge1xyXG4gICAgICAgICQoZS50YXJnZXQpLnNpYmxpbmdzKCdsYWJlbCwgLnByZWZpeCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG4gICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgYWN0aXZlIHdoZW4gZWxlbWVudCBpcyBibHVycmVkXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgJGlucHV0RWxlbWVudCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICBpZiAoJGlucHV0RWxlbWVudC5pcyhpbnB1dF9zZWxlY3RvcikpIHtcclxuICAgICAgICB2YXIgc2VsZWN0b3IgPSAnLnByZWZpeCc7XHJcblxyXG4gICAgICAgIGlmICgkaW5wdXRFbGVtZW50WzBdLnZhbHVlLmxlbmd0aCA9PT0gMCAmJiAkaW5wdXRFbGVtZW50WzBdLnZhbGlkaXR5LmJhZElucHV0ICE9PSB0cnVlICYmICRpbnB1dEVsZW1lbnQuYXR0cigncGxhY2Vob2xkZXInKSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgc2VsZWN0b3IgKz0gJywgbGFiZWwnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkaW5wdXRFbGVtZW50LnNpYmxpbmdzKHNlbGVjdG9yKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgTS52YWxpZGF0ZV9maWVsZCgkaW5wdXRFbGVtZW50KTtcclxuICAgICAgfVxyXG4gICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gUmFkaW8gYW5kIENoZWNrYm94IGZvY3VzIGNsYXNzXHJcbiAgICB2YXIgcmFkaW9fY2hlY2tib3ggPSAnaW5wdXRbdHlwZT1yYWRpb10sIGlucHV0W3R5cGU9Y2hlY2tib3hdJztcclxuICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHJhZGlvX2NoZWNrYm94LCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAvLyBUQUIsIGNoZWNrIGlmIHRhYmJpbmcgdG8gcmFkaW8gb3IgY2hlY2tib3guXHJcbiAgICAgIGlmIChlLndoaWNoID09PSBNLmtleXMuVEFCKSB7XHJcbiAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygndGFiYmVkJyk7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAkdGhpcy5vbmUoJ2JsdXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygndGFiYmVkJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgdGV4dF9hcmVhX3NlbGVjdG9yID0gJy5tYXRlcmlhbGl6ZS10ZXh0YXJlYSc7XHJcbiAgICAkKHRleHRfYXJlYV9zZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGV4dGFyZWEgPSAkKHRoaXMpO1xyXG4gICAgICAvKipcclxuICAgICAgICogUmVzaXplIHRleHRhcmVhIG9uIGRvY3VtZW50IGxvYWQgYWZ0ZXIgc3RvcmluZ1xyXG4gICAgICAgKiB0aGUgb3JpZ2luYWwgaGVpZ2h0IGFuZCB0aGUgb3JpZ2luYWwgbGVuZ3RoXHJcbiAgICAgICAqL1xyXG4gICAgICAkdGV4dGFyZWEuZGF0YSgnb3JpZ2luYWwtaGVpZ2h0JywgJHRleHRhcmVhLmhlaWdodCgpKTtcclxuICAgICAgJHRleHRhcmVhLmRhdGEoJ3ByZXZpb3VzLWxlbmd0aCcsIHRoaXMudmFsdWUubGVuZ3RoKTtcclxuICAgICAgTS50ZXh0YXJlYUF1dG9SZXNpemUoJHRleHRhcmVhKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHRleHRfYXJlYV9zZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBNLnRleHRhcmVhQXV0b1Jlc2l6ZSgkKHRoaXMpKTtcclxuICAgIH0pO1xyXG4gICAgJChkb2N1bWVudCkub24oJ2tleWRvd24nLCB0ZXh0X2FyZWFfc2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgTS50ZXh0YXJlYUF1dG9SZXNpemUoJCh0aGlzKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBGaWxlIElucHV0IFBhdGhcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmZpbGUtZmllbGQgaW5wdXRbdHlwZT1cImZpbGVcIl0nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBmaWxlX2ZpZWxkID0gJCh0aGlzKS5jbG9zZXN0KCcuZmlsZS1maWVsZCcpO1xyXG4gICAgICB2YXIgcGF0aF9pbnB1dCA9IGZpbGVfZmllbGQuZmluZCgnaW5wdXQuZmlsZS1wYXRoJyk7XHJcbiAgICAgIHZhciBmaWxlcyA9ICQodGhpcylbMF0uZmlsZXM7XHJcbiAgICAgIHZhciBmaWxlX25hbWVzID0gW107XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBmaWxlX25hbWVzLnB1c2goZmlsZXNbaV0ubmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgcGF0aF9pbnB1dFswXS52YWx1ZSA9IGZpbGVfbmFtZXMuam9pbignLCAnKTtcclxuICAgICAgcGF0aF9pbnB1dC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgIH0pO1xyXG4gIH0pOyAvLyBFbmQgb2YgJChkb2N1bWVudCkucmVhZHlcclxufSkoY2FzaCk7XHJcbjsoZnVuY3Rpb24gKCQsIGFuaW0pIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBpbmRpY2F0b3JzOiB0cnVlLFxyXG4gICAgaGVpZ2h0OiA0MDAsXHJcbiAgICBkdXJhdGlvbjogNTAwLFxyXG4gICAgaW50ZXJ2YWw6IDYwMDBcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG5cclxuICB2YXIgU2xpZGVyID0gZnVuY3Rpb24gKF9Db21wb25lbnQxMSkge1xyXG4gICAgX2luaGVyaXRzKFNsaWRlciwgX0NvbXBvbmVudDExKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBTbGlkZXIgaW5zdGFuY2UgYW5kIHNldCB1cCBvdmVybGF5XHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFNsaWRlcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2xpZGVyKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczQwID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFNsaWRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNsaWRlcikpLmNhbGwodGhpcywgU2xpZGVyLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXM0MC5lbC5NX1NsaWRlciA9IF90aGlzNDA7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIG1vZGFsXHJcbiAgICAgICAqIEBtZW1iZXIgU2xpZGVyI29wdGlvbnNcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IFtpbmRpY2F0b3JzPXRydWVdIC0gU2hvdyBpbmRpY2F0b3JzXHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IFtoZWlnaHQ9NDAwXSAtIGhlaWdodCBvZiBzbGlkZXJcclxuICAgICAgICogQHByb3Age051bWJlcn0gW2R1cmF0aW9uPTUwMF0gLSBMZW5ndGggaW4gbXMgb2Ygc2xpZGUgdHJhbnNpdGlvblxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBbaW50ZXJ2YWw9NjAwMF0gLSBMZW5ndGggaW4gbXMgb2Ygc2xpZGUgaW50ZXJ2YWxcclxuICAgICAgICovXHJcbiAgICAgIF90aGlzNDAub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTbGlkZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gc2V0dXBcclxuICAgICAgX3RoaXM0MC4kc2xpZGVyID0gX3RoaXM0MC4kZWwuZmluZCgnLnNsaWRlcycpO1xyXG4gICAgICBfdGhpczQwLiRzbGlkZXMgPSBfdGhpczQwLiRzbGlkZXIuY2hpbGRyZW4oJ2xpJyk7XHJcbiAgICAgIF90aGlzNDAuYWN0aXZlSW5kZXggPSBfdGhpczQwLiRzbGlkZXMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuICQoaXRlbSkuaGFzQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9KS5maXJzdCgpLmluZGV4KCk7XHJcbiAgICAgIGlmIChfdGhpczQwLmFjdGl2ZUluZGV4ICE9IC0xKSB7XHJcbiAgICAgICAgX3RoaXM0MC4kYWN0aXZlID0gX3RoaXM0MC4kc2xpZGVzLmVxKF90aGlzNDAuYWN0aXZlSW5kZXgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBfdGhpczQwLl9zZXRTbGlkZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgIC8vIFNldCBpbml0aWFsIHBvc2l0aW9ucyBvZiBjYXB0aW9uc1xyXG4gICAgICBfdGhpczQwLiRzbGlkZXMuZmluZCgnLmNhcHRpb24nKS5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIF90aGlzNDAuX2FuaW1hdGVDYXB0aW9uSW4oZWwsIDApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIE1vdmUgaW1nIHNyYyBpbnRvIGJhY2tncm91bmQtaW1hZ2VcclxuICAgICAgX3RoaXM0MC4kc2xpZGVzLmZpbmQoJ2ltZycpLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgdmFyIHBsYWNlaG9sZGVyQmFzZTY0ID0gJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFCQVAvLy93QUFBQ0g1QkFFS0FBRUFMQUFBQUFBQkFBRUFBQUlDVEFFQU93PT0nO1xyXG4gICAgICAgIGlmICgkKGVsKS5hdHRyKCdzcmMnKSAhPT0gcGxhY2Vob2xkZXJCYXNlNjQpIHtcclxuICAgICAgICAgICQoZWwpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoXCInICsgJChlbCkuYXR0cignc3JjJykgKyAnXCIpJyk7XHJcbiAgICAgICAgICAkKGVsKS5hdHRyKCdzcmMnLCBwbGFjZWhvbGRlckJhc2U2NCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIF90aGlzNDAuX3NldHVwSW5kaWNhdG9ycygpO1xyXG5cclxuICAgICAgLy8gU2hvdyBhY3RpdmUgc2xpZGVcclxuICAgICAgaWYgKF90aGlzNDAuJGFjdGl2ZSkge1xyXG4gICAgICAgIF90aGlzNDAuJGFjdGl2ZS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfdGhpczQwLiRzbGlkZXMuZmlyc3QoKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiBfdGhpczQwLiRzbGlkZXMuZmlyc3QoKVswXSxcclxuICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICBkdXJhdGlvbjogX3RoaXM0MC5vcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIF90aGlzNDAuYWN0aXZlSW5kZXggPSAwO1xyXG4gICAgICAgIF90aGlzNDAuJGFjdGl2ZSA9IF90aGlzNDAuJHNsaWRlcy5lcShfdGhpczQwLmFjdGl2ZUluZGV4KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGluZGljYXRvcnNcclxuICAgICAgICBpZiAoX3RoaXM0MC5vcHRpb25zLmluZGljYXRvcnMpIHtcclxuICAgICAgICAgIF90aGlzNDAuJGluZGljYXRvcnMuZXEoX3RoaXM0MC5hY3RpdmVJbmRleCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQWRqdXN0IGhlaWdodCB0byBjdXJyZW50IHNsaWRlXHJcbiAgICAgIF90aGlzNDAuJGFjdGl2ZS5maW5kKCdpbWcnKS5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogX3RoaXM0MC4kYWN0aXZlLmZpbmQoJy5jYXB0aW9uJylbMF0sXHJcbiAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgdHJhbnNsYXRlWDogMCxcclxuICAgICAgICAgIHRyYW5zbGF0ZVk6IDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogX3RoaXM0MC5vcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgX3RoaXM0MC5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcblxyXG4gICAgICAvLyBhdXRvIHNjcm9sbFxyXG4gICAgICBfdGhpczQwLnN0YXJ0KCk7XHJcbiAgICAgIHJldHVybiBfdGhpczQwO1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhTbGlkZXIsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZUluZGljYXRvcnMoKTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX1NsaWRlciA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cEV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cEV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzNDEgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLl9oYW5kbGVJbnRlcnZhbEJvdW5kID0gdGhpcy5faGFuZGxlSW50ZXJ2YWwuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVJbmRpY2F0b3JDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlSW5kaWNhdG9yQ2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgX3RoaXM0MS5faGFuZGxlSW5kaWNhdG9yQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHZhciBfdGhpczQyID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgX3RoaXM0Mi5faGFuZGxlSW5kaWNhdG9yQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgaW5kaWNhdG9yIGNsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUluZGljYXRvckNsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5kaWNhdG9yQ2xpY2soZSkge1xyXG4gICAgICAgIHZhciBjdXJySW5kZXggPSAkKGUudGFyZ2V0KS5pbmRleCgpO1xyXG4gICAgICAgIHRoaXMuc2V0KGN1cnJJbmRleCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgSW50ZXJ2YWxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUludGVydmFsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgdmFyIG5ld0FjdGl2ZUluZGV4ID0gdGhpcy4kc2xpZGVyLmZpbmQoJy5hY3RpdmUnKS5pbmRleCgpO1xyXG4gICAgICAgIGlmICh0aGlzLiRzbGlkZXMubGVuZ3RoID09PSBuZXdBY3RpdmVJbmRleCArIDEpIG5ld0FjdGl2ZUluZGV4ID0gMDtcclxuICAgICAgICAvLyBsb29wIHRvIHN0YXJ0XHJcbiAgICAgICAgZWxzZSBuZXdBY3RpdmVJbmRleCArPSAxO1xyXG5cclxuICAgICAgICB0aGlzLnNldChuZXdBY3RpdmVJbmRleCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBbmltYXRlIGluIGNhcHRpb25cclxuICAgICAgICogQHBhcmFtIHtFbGVtZW50fSBjYXB0aW9uXHJcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvblxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZUNhcHRpb25JblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVDYXB0aW9uSW4oY2FwdGlvbiwgZHVyYXRpb24pIHtcclxuICAgICAgICB2YXIgYW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICB0YXJnZXRzOiBjYXB0aW9uLFxyXG4gICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcclxuICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICgkKGNhcHRpb24pLmhhc0NsYXNzKCdjZW50ZXItYWxpZ24nKSkge1xyXG4gICAgICAgICAgYW5pbU9wdGlvbnMudHJhbnNsYXRlWSA9IC0xMDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgkKGNhcHRpb24pLmhhc0NsYXNzKCdyaWdodC1hbGlnbicpKSB7XHJcbiAgICAgICAgICBhbmltT3B0aW9ucy50cmFuc2xhdGVYID0gMTAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJChjYXB0aW9uKS5oYXNDbGFzcygnbGVmdC1hbGlnbicpKSB7XHJcbiAgICAgICAgICBhbmltT3B0aW9ucy50cmFuc2xhdGVYID0gLTEwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuaW0oYW5pbU9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0IGhlaWdodCBvZiBzbGlkZXJcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldFNsaWRlckhlaWdodFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFNsaWRlckhlaWdodCgpIHtcclxuICAgICAgICAvLyBJZiBmdWxsc2NyZWVuLCBkbyBub3RoaW5nXHJcbiAgICAgICAgaWYgKCF0aGlzLiRlbC5oYXNDbGFzcygnZnVsbHNjcmVlbicpKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmluZGljYXRvcnMpIHtcclxuICAgICAgICAgICAgLy8gQWRkIGhlaWdodCBpZiBpbmRpY2F0b3JzIGFyZSBwcmVzZW50XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0JywgdGhpcy5vcHRpb25zLmhlaWdodCArIDQwICsgJ3B4Jyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5jc3MoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5oZWlnaHQgKyAncHgnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuJHNsaWRlci5jc3MoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5oZWlnaHQgKyAncHgnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBpbmRpY2F0b3JzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cEluZGljYXRvcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cEluZGljYXRvcnMoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzNDMgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmluZGljYXRvcnMpIHtcclxuICAgICAgICAgIHRoaXMuJGluZGljYXRvcnMgPSAkKCc8dWwgY2xhc3M9XCJpbmRpY2F0b3JzXCI+PC91bD4nKTtcclxuICAgICAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uIChlbCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyICRpbmRpY2F0b3IgPSAkKCc8bGkgY2xhc3M9XCJpbmRpY2F0b3ItaXRlbVwiPjwvbGk+Jyk7XHJcbiAgICAgICAgICAgIF90aGlzNDMuJGluZGljYXRvcnMuYXBwZW5kKCRpbmRpY2F0b3JbMF0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5kaWNhdG9yc1swXSk7XHJcbiAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzID0gdGhpcy4kaW5kaWNhdG9ycy5jaGlsZHJlbignbGkuaW5kaWNhdG9yLWl0ZW0nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgaW5kaWNhdG9yc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlSW5kaWNhdG9yc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUluZGljYXRvcnMoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgndWwuaW5kaWNhdG9ycycpLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ3ljbGUgdG8gbnRoIGl0ZW1cclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInNldFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0KGluZGV4KSB7XHJcbiAgICAgICAgdmFyIF90aGlzNDQgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBXcmFwIGFyb3VuZCBpbmRpY2VzLlxyXG4gICAgICAgIGlmIChpbmRleCA+PSB0aGlzLiRzbGlkZXMubGVuZ3RoKSBpbmRleCA9IDA7ZWxzZSBpZiAoaW5kZXggPCAwKSBpbmRleCA9IHRoaXMuJHNsaWRlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICAvLyBPbmx5IGRvIGlmIGluZGV4IGNoYW5nZXNcclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJbmRleCAhPSBpbmRleCkge1xyXG4gICAgICAgICAgdGhpcy4kYWN0aXZlID0gdGhpcy4kc2xpZGVzLmVxKHRoaXMuYWN0aXZlSW5kZXgpO1xyXG4gICAgICAgICAgdmFyICRjYXB0aW9uID0gdGhpcy4kYWN0aXZlLmZpbmQoJy5jYXB0aW9uJyk7XHJcbiAgICAgICAgICB0aGlzLiRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRhY3RpdmVbMF0sXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuZHVyYXRpb24sXHJcbiAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJyxcclxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBfdGhpczQ0LiRzbGlkZXMubm90KCcuYWN0aXZlJykuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgICAgICAgICB0YXJnZXRzOiBlbCxcclxuICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWDogMCxcclxuICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWTogMCxcclxuICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDAsXHJcbiAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHRoaXMuX2FuaW1hdGVDYXB0aW9uSW4oJGNhcHRpb25bMF0sIHRoaXMub3B0aW9ucy5kdXJhdGlvbik7XHJcblxyXG4gICAgICAgICAgLy8gVXBkYXRlIGluZGljYXRvcnNcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5kaWNhdG9ycykge1xyXG4gICAgICAgICAgICB0aGlzLiRpbmRpY2F0b3JzLmVxKHRoaXMuYWN0aXZlSW5kZXgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy4kaW5kaWNhdG9ycy5lcShpbmRleCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRzbGlkZXMuZXEoaW5kZXgpWzBdLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5vcHRpb25zLmR1cmF0aW9uLFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCdcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgICB0YXJnZXRzOiB0aGlzLiRzbGlkZXMuZXEoaW5kZXgpLmZpbmQoJy5jYXB0aW9uJylbMF0sXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZVg6IDAsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZVk6IDAsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuZHVyYXRpb24sXHJcbiAgICAgICAgICAgIGRlbGF5OiB0aGlzLm9wdGlvbnMuZHVyYXRpb24sXHJcbiAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFkJ1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgdGhpcy4kc2xpZGVzLmVxKGluZGV4KS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgICAgICAgLy8gUmVzZXQgaW50ZXJ2YWxcclxuICAgICAgICAgIHRoaXMuc3RhcnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQYXVzZSBzbGlkZXIgaW50ZXJ2YWxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwicGF1c2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKCkge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTdGFydCBzbGlkZXIgaW50ZXJ2YWxcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic3RhcnRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMuX2hhbmRsZUludGVydmFsQm91bmQsIHRoaXMub3B0aW9ucy5kdXJhdGlvbiArIHRoaXMub3B0aW9ucy5pbnRlcnZhbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBNb3ZlIHRvIG5leHQgc2xpZGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwibmV4dFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbmV4dCgpIHtcclxuICAgICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4ICsgMTtcclxuXHJcbiAgICAgICAgLy8gV3JhcCBhcm91bmQgaW5kaWNlcy5cclxuICAgICAgICBpZiAobmV3SW5kZXggPj0gdGhpcy4kc2xpZGVzLmxlbmd0aCkgbmV3SW5kZXggPSAwO2Vsc2UgaWYgKG5ld0luZGV4IDwgMCkgbmV3SW5kZXggPSB0aGlzLiRzbGlkZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXQobmV3SW5kZXgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogTW92ZSB0byBwcmV2aW91cyBzbGlkZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJwcmV2XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwcmV2KCkge1xyXG4gICAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXggLSAxO1xyXG5cclxuICAgICAgICAvLyBXcmFwIGFyb3VuZCBpbmRpY2VzLlxyXG4gICAgICAgIGlmIChuZXdJbmRleCA+PSB0aGlzLiRzbGlkZXMubGVuZ3RoKSBuZXdJbmRleCA9IDA7ZWxzZSBpZiAobmV3SW5kZXggPCAwKSBuZXdJbmRleCA9IHRoaXMuJHNsaWRlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICB0aGlzLnNldChuZXdJbmRleCk7XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChTbGlkZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTbGlkZXIpLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fU2xpZGVyO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIFNsaWRlcjtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIE0uU2xpZGVyID0gU2xpZGVyO1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoU2xpZGVyLCAnc2xpZGVyJywgJ01fU2xpZGVyJyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuOyhmdW5jdGlvbiAoJCwgYW5pbSkge1xyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2FyZCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoJCh0aGlzKS5jaGlsZHJlbignLmNhcmQtcmV2ZWFsJykubGVuZ3RoKSB7XHJcbiAgICAgIHZhciAkY2FyZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5jYXJkJyk7XHJcbiAgICAgIGlmICgkY2FyZC5kYXRhKCdpbml0aWFsT3ZlcmZsb3cnKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgJGNhcmQuZGF0YSgnaW5pdGlhbE92ZXJmbG93JywgJGNhcmQuY3NzKCdvdmVyZmxvdycpID09PSB1bmRlZmluZWQgPyAnJyA6ICRjYXJkLmNzcygnb3ZlcmZsb3cnKSk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyICRjYXJkUmV2ZWFsID0gJCh0aGlzKS5maW5kKCcuY2FyZC1yZXZlYWwnKTtcclxuICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKCQoJy5jYXJkLXJldmVhbCAuY2FyZC10aXRsZScpKSB8fCAkKGUudGFyZ2V0KS5pcygkKCcuY2FyZC1yZXZlYWwgLmNhcmQtdGl0bGUgaScpKSkge1xyXG4gICAgICAgIC8vIE1ha2UgUmV2ZWFsIGFuaW1hdGUgZG93biBhbmQgZGlzcGxheSBub25lXHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiAkY2FyZFJldmVhbFswXSxcclxuICAgICAgICAgIHRyYW5zbGF0ZVk6IDAsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMjI1LFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZUluT3V0UXVhZCcsXHJcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKGFuaW0pIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gYW5pbS5hbmltYXRhYmxlc1swXS50YXJnZXQ7XHJcbiAgICAgICAgICAgICQoZWwpLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcclxuICAgICAgICAgICAgJGNhcmQuY3NzKCdvdmVyZmxvdycsICRjYXJkLmRhdGEoJ2luaXRpYWxPdmVyZmxvdycpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmICgkKGUudGFyZ2V0KS5pcygkKCcuY2FyZCAuYWN0aXZhdG9yJykpIHx8ICQoZS50YXJnZXQpLmlzKCQoJy5jYXJkIC5hY3RpdmF0b3IgaScpKSkge1xyXG4gICAgICAgICRjYXJkLmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XHJcbiAgICAgICAgJGNhcmRSZXZlYWwuY3NzKHsgZGlzcGxheTogJ2Jsb2NrJyB9KTtcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6ICRjYXJkUmV2ZWFsWzBdLFxyXG4gICAgICAgICAgdHJhbnNsYXRlWTogJy0xMDAlJyxcclxuICAgICAgICAgIGR1cmF0aW9uOiAzMDAsXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlSW5PdXRRdWFkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pKGNhc2gsIE0uYW5pbWUpO1xyXG47KGZ1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgX2RlZmF1bHRzID0ge1xyXG4gICAgZGF0YTogW10sXHJcbiAgICBwbGFjZWhvbGRlcjogJycsXHJcbiAgICBzZWNvbmRhcnlQbGFjZWhvbGRlcjogJycsXHJcbiAgICBhdXRvY29tcGxldGVPcHRpb25zOiB7fSxcclxuICAgIGxpbWl0OiBJbmZpbml0eSxcclxuICAgIG9uQ2hpcEFkZDogbnVsbCxcclxuICAgIG9uQ2hpcFNlbGVjdDogbnVsbCxcclxuICAgIG9uQ2hpcERlbGV0ZTogbnVsbFxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IGNoaXBcclxuICAgKiBAcHJvcGVydHkge1N0cmluZ30gdGFnICBjaGlwIHRhZyBzdHJpbmdcclxuICAgKiBAcHJvcGVydHkge1N0cmluZ30gW2ltYWdlXSAgY2hpcCBhdmF0YXIgaW1hZ2Ugc3RyaW5nXHJcbiAgICovXHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBDaGlwcyA9IGZ1bmN0aW9uIChfQ29tcG9uZW50MTIpIHtcclxuICAgIF9pbmhlcml0cyhDaGlwcywgX0NvbXBvbmVudDEyKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBDaGlwcyBpbnN0YW5jZSBhbmQgc2V0IHVwIG92ZXJsYXlcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gQ2hpcHMoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENoaXBzKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczQ1ID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKENoaXBzLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2hpcHMpKS5jYWxsKHRoaXMsIENoaXBzLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXM0NS5lbC5NX0NoaXBzID0gX3RoaXM0NTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBPcHRpb25zIGZvciB0aGUgbW9kYWxcclxuICAgICAgICogQG1lbWJlciBDaGlwcyNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtBcnJheX0gZGF0YVxyXG4gICAgICAgKiBAcHJvcCB7U3RyaW5nfSBwbGFjZWhvbGRlclxyXG4gICAgICAgKiBAcHJvcCB7U3RyaW5nfSBzZWNvbmRhcnlQbGFjZWhvbGRlclxyXG4gICAgICAgKiBAcHJvcCB7T2JqZWN0fSBhdXRvY29tcGxldGVPcHRpb25zXHJcbiAgICAgICAqL1xyXG4gICAgICBfdGhpczQ1Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ2hpcHMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgX3RoaXM0NS4kZWwuYWRkQ2xhc3MoJ2NoaXBzIGlucHV0LWZpZWxkJyk7XHJcbiAgICAgIF90aGlzNDUuY2hpcHNEYXRhID0gW107XHJcbiAgICAgIF90aGlzNDUuJGNoaXBzID0gJCgpO1xyXG4gICAgICBfdGhpczQ1Ll9zZXR1cElucHV0KCk7XHJcbiAgICAgIF90aGlzNDUuaGFzQXV0b2NvbXBsZXRlID0gT2JqZWN0LmtleXMoX3RoaXM0NS5vcHRpb25zLmF1dG9jb21wbGV0ZU9wdGlvbnMpLmxlbmd0aCA+IDA7XHJcblxyXG4gICAgICAvLyBTZXQgaW5wdXQgaWRcclxuICAgICAgaWYgKCFfdGhpczQ1LiRpbnB1dC5hdHRyKCdpZCcpKSB7XHJcbiAgICAgICAgX3RoaXM0NS4kaW5wdXQuYXR0cignaWQnLCBNLmd1aWQoKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbmRlciBpbml0aWFsIGNoaXBzXHJcbiAgICAgIGlmIChfdGhpczQ1Lm9wdGlvbnMuZGF0YS5sZW5ndGgpIHtcclxuICAgICAgICBfdGhpczQ1LmNoaXBzRGF0YSA9IF90aGlzNDUub3B0aW9ucy5kYXRhO1xyXG4gICAgICAgIF90aGlzNDUuX3JlbmRlckNoaXBzKF90aGlzNDUuY2hpcHNEYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0dXAgYXV0b2NvbXBsZXRlIGlmIG5lZWRlZFxyXG4gICAgICBpZiAoX3RoaXM0NS5oYXNBdXRvY29tcGxldGUpIHtcclxuICAgICAgICBfdGhpczQ1Ll9zZXR1cEF1dG9jb21wbGV0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBfdGhpczQ1Ll9zZXRQbGFjZWhvbGRlcigpO1xyXG4gICAgICBfdGhpczQ1Ll9zZXR1cExhYmVsKCk7XHJcbiAgICAgIF90aGlzNDUuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICByZXR1cm4gX3RoaXM0NTtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoQ2hpcHMsIFt7XHJcbiAgICAgIGtleTogXCJnZXREYXRhXCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCBDaGlwcyBEYXRhXHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RGF0YSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGlwc0RhdGE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVzdHJveVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy4kY2hpcHMucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX0NoaXBzID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVDaGlwQ2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZUNoaXBDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlSW5wdXRGb2N1c0JvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUlucHV0Qmx1ckJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRCbHVyLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDaGlwQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIENoaXBzLl9oYW5kbGVDaGlwc0tleWRvd24pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgQ2hpcHMuX2hhbmRsZUNoaXBzS2V5dXApO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIENoaXBzLl9oYW5kbGVDaGlwc0JsdXIsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuJGlucHV0WzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlSW5wdXRGb2N1c0JvdW5kKTtcclxuICAgICAgICB0aGlzLiRpbnB1dFswXS5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5faGFuZGxlSW5wdXRCbHVyQm91bmQpO1xyXG4gICAgICAgIHRoaXMuJGlucHV0WzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDaGlwQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIENoaXBzLl9oYW5kbGVDaGlwc0tleWRvd24pO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgQ2hpcHMuX2hhbmRsZUNoaXBzS2V5dXApO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIENoaXBzLl9oYW5kbGVDaGlwc0JsdXIsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuJGlucHV0WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlSW5wdXRGb2N1c0JvdW5kKTtcclxuICAgICAgICB0aGlzLiRpbnB1dFswXS5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5faGFuZGxlSW5wdXRCbHVyQm91bmQpO1xyXG4gICAgICAgIHRoaXMuJGlucHV0WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgQ2hpcCBDbGlja1xyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDaGlwQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVDaGlwQ2xpY2soZSkge1xyXG4gICAgICAgIHZhciAkY2hpcCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5jaGlwJyk7XHJcbiAgICAgICAgdmFyIGNsaWNrZWRDbG9zZSA9ICQoZS50YXJnZXQpLmlzKCcuY2xvc2UnKTtcclxuICAgICAgICBpZiAoJGNoaXAubGVuZ3RoKSB7XHJcbiAgICAgICAgICB2YXIgaW5kZXggPSAkY2hpcC5pbmRleCgpO1xyXG4gICAgICAgICAgaWYgKGNsaWNrZWRDbG9zZSkge1xyXG4gICAgICAgICAgICAvLyBkZWxldGUgY2hpcFxyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUNoaXAoaW5kZXgpO1xyXG4gICAgICAgICAgICB0aGlzLiRpbnB1dFswXS5mb2N1cygpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gc2VsZWN0IGNoaXBcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RDaGlwKGluZGV4KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBEZWZhdWx0IGhhbmRsZSBjbGljayB0byBmb2N1cyBvbiBpbnB1dFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLiRpbnB1dFswXS5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBDaGlwcyBLZXlkb3duXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUlucHV0Rm9jdXNcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIElucHV0IEZvY3VzXHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUlucHV0Rm9jdXMoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2ZvY3VzJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgSW5wdXQgQmx1clxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlSW5wdXRCbHVyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5wdXRCbHVyKCkge1xyXG4gICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdmb2N1cycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIElucHV0IEtleWRvd25cclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlSW5wdXRLZXlkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5wdXRLZXlkb3duKGUpIHtcclxuICAgICAgICBDaGlwcy5fa2V5ZG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIGVudGVyXHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgIC8vIE92ZXJyaWRlIGVudGVyIGlmIGF1dG9jb21wbGV0aW5nLlxyXG4gICAgICAgICAgaWYgKHRoaXMuaGFzQXV0b2NvbXBsZXRlICYmIHRoaXMuYXV0b2NvbXBsZXRlICYmIHRoaXMuYXV0b2NvbXBsZXRlLmlzT3Blbikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgdGhpcy5hZGRDaGlwKHtcclxuICAgICAgICAgICAgdGFnOiB0aGlzLiRpbnB1dFswXS52YWx1ZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLiRpbnB1dFswXS52YWx1ZSA9ICcnO1xyXG5cclxuICAgICAgICAgIC8vIGRlbGV0ZSBvciBsZWZ0XHJcbiAgICAgICAgfSBlbHNlIGlmICgoZS5rZXlDb2RlID09PSA4IHx8IGUua2V5Q29kZSA9PT0gMzcpICYmIHRoaXMuJGlucHV0WzBdLnZhbHVlID09PSAnJyAmJiB0aGlzLmNoaXBzRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0Q2hpcCh0aGlzLmNoaXBzRGF0YS5sZW5ndGggLSAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW5kZXIgQ2hpcFxyXG4gICAgICAgKiBAcGFyYW0ge2NoaXB9IGNoaXBcclxuICAgICAgICogQHJldHVybiB7RWxlbWVudH1cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbmRlckNoaXBcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW5kZXJDaGlwKGNoaXApIHtcclxuICAgICAgICBpZiAoIWNoaXAudGFnKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcmVuZGVyZWRDaGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdmFyIGNsb3NlSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcclxuICAgICAgICByZW5kZXJlZENoaXAuY2xhc3NMaXN0LmFkZCgnY2hpcCcpO1xyXG4gICAgICAgIHJlbmRlcmVkQ2hpcC50ZXh0Q29udGVudCA9IGNoaXAudGFnO1xyXG4gICAgICAgIHJlbmRlcmVkQ2hpcC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgMCk7XHJcbiAgICAgICAgJChjbG9zZUljb24pLmFkZENsYXNzKCdtYXRlcmlhbC1pY29ucyBjbG9zZScpO1xyXG4gICAgICAgIGNsb3NlSWNvbi50ZXh0Q29udGVudCA9ICdjbG9zZSc7XHJcblxyXG4gICAgICAgIC8vIGF0dGFjaCBpbWFnZSBpZiBuZWVkZWRcclxuICAgICAgICBpZiAoY2hpcC5pbWFnZSkge1xyXG4gICAgICAgICAgdmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgY2hpcC5pbWFnZSk7XHJcbiAgICAgICAgICByZW5kZXJlZENoaXAuaW5zZXJ0QmVmb3JlKGltZywgcmVuZGVyZWRDaGlwLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyZWRDaGlwLmFwcGVuZENoaWxkKGNsb3NlSWNvbik7XHJcbiAgICAgICAgcmV0dXJuIHJlbmRlcmVkQ2hpcDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbmRlciBDaGlwc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVuZGVyQ2hpcHNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW5kZXJDaGlwcygpIHtcclxuICAgICAgICB0aGlzLiRjaGlwcy5yZW1vdmUoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpcHNEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpcEVsID0gdGhpcy5fcmVuZGVyQ2hpcCh0aGlzLmNoaXBzRGF0YVtpXSk7XHJcbiAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQoY2hpcEVsKTtcclxuICAgICAgICAgIHRoaXMuJGNoaXBzLmFkZChjaGlwRWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbW92ZSBpbnB1dCB0byBlbmRcclxuICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5wdXRbMF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgQXV0b2NvbXBsZXRlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cEF1dG9jb21wbGV0ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwQXV0b2NvbXBsZXRlKCkge1xyXG4gICAgICAgIHZhciBfdGhpczQ2ID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmF1dG9jb21wbGV0ZU9wdGlvbnMub25BdXRvY29tcGxldGUgPSBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICBfdGhpczQ2LmFkZENoaXAoe1xyXG4gICAgICAgICAgICB0YWc6IHZhbFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBfdGhpczQ2LiRpbnB1dFswXS52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgX3RoaXM0Ni4kaW5wdXRbMF0uZm9jdXMoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZSA9IE0uQXV0b2NvbXBsZXRlLmluaXQodGhpcy4kaW5wdXRbMF0sIHRoaXMub3B0aW9ucy5hdXRvY29tcGxldGVPcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIElucHV0XHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cElucHV0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBJbnB1dCgpIHtcclxuICAgICAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgICAgaWYgKCF0aGlzLiRpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuJGlucHV0ID0gJCgnPGlucHV0PjwvaW5wdXQ+Jyk7XHJcbiAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy4kaW5wdXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4kaW5wdXQuYWRkQ2xhc3MoJ2lucHV0Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBMYWJlbFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBMYWJlbFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwTGFiZWwoKSB7XHJcbiAgICAgICAgdGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5maW5kKCdsYWJlbCcpO1xyXG4gICAgICAgIGlmICh0aGlzLiRsYWJlbC5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuJGxhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgdGhpcy4kaW5wdXQuYXR0cignaWQnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0IHBsYWNlaG9sZGVyXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXRQbGFjZWhvbGRlclwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFBsYWNlaG9sZGVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaXBzRGF0YSAhPT0gdW5kZWZpbmVkICYmICF0aGlzLmNoaXBzRGF0YS5sZW5ndGggJiYgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyKSB7XHJcbiAgICAgICAgICAkKHRoaXMuJGlucHV0KS5wcm9wKCdwbGFjZWhvbGRlcicsIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcik7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5jaGlwc0RhdGEgPT09IHVuZGVmaW5lZCB8fCAhIXRoaXMuY2hpcHNEYXRhLmxlbmd0aCkgJiYgdGhpcy5vcHRpb25zLnNlY29uZGFyeVBsYWNlaG9sZGVyKSB7XHJcbiAgICAgICAgICAkKHRoaXMuJGlucHV0KS5wcm9wKCdwbGFjZWhvbGRlcicsIHRoaXMub3B0aW9ucy5zZWNvbmRhcnlQbGFjZWhvbGRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2hlY2sgaWYgY2hpcCBpcyB2YWxpZFxyXG4gICAgICAgKiBAcGFyYW0ge2NoaXB9IGNoaXBcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2lzVmFsaWRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pc1ZhbGlkKGNoaXApIHtcclxuICAgICAgICBpZiAoY2hpcC5oYXNPd25Qcm9wZXJ0eSgndGFnJykgJiYgY2hpcC50YWcgIT09ICcnKSB7XHJcbiAgICAgICAgICB2YXIgZXhpc3RzID0gZmFsc2U7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpcHNEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoaXBzRGF0YVtpXS50YWcgPT09IGNoaXAudGFnKSB7XHJcbiAgICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuICFleGlzdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBZGQgY2hpcFxyXG4gICAgICAgKiBAcGFyYW0ge2NoaXB9IGNoaXBcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiYWRkQ2hpcFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkQ2hpcChjaGlwKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkKGNoaXApIHx8IHRoaXMuY2hpcHNEYXRhLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMubGltaXQpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByZW5kZXJlZENoaXAgPSB0aGlzLl9yZW5kZXJDaGlwKGNoaXApO1xyXG4gICAgICAgIHRoaXMuJGNoaXBzLmFkZChyZW5kZXJlZENoaXApO1xyXG4gICAgICAgIHRoaXMuY2hpcHNEYXRhLnB1c2goY2hpcCk7XHJcbiAgICAgICAgJCh0aGlzLiRpbnB1dCkuYmVmb3JlKHJlbmRlcmVkQ2hpcCk7XHJcbiAgICAgICAgdGhpcy5fc2V0UGxhY2Vob2xkZXIoKTtcclxuXHJcbiAgICAgICAgLy8gZmlyZSBjaGlwQWRkIGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DaGlwQWRkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGlwQWRkLmNhbGwodGhpcywgdGhpcy4kZWwsIHJlbmRlcmVkQ2hpcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGVsZXRlIGNoaXBcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGNoaXBcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVsZXRlQ2hpcFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlQ2hpcChjaGlwSW5kZXgpIHtcclxuICAgICAgICB2YXIgJGNoaXAgPSB0aGlzLiRjaGlwcy5lcShjaGlwSW5kZXgpO1xyXG4gICAgICAgIHRoaXMuJGNoaXBzLmVxKGNoaXBJbmRleCkucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy4kY2hpcHMgPSB0aGlzLiRjaGlwcy5maWx0ZXIoZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICByZXR1cm4gJChlbCkuaW5kZXgoKSA+PSAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2hpcHNEYXRhLnNwbGljZShjaGlwSW5kZXgsIDEpO1xyXG4gICAgICAgIHRoaXMuX3NldFBsYWNlaG9sZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIGZpcmUgY2hpcERlbGV0ZSBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2hpcERlbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hpcERlbGV0ZS5jYWxsKHRoaXMsIHRoaXMuJGVsLCAkY2hpcFswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2VsZWN0IGNoaXBcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGNoaXBcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic2VsZWN0Q2hpcFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2VsZWN0Q2hpcChjaGlwSW5kZXgpIHtcclxuICAgICAgICB2YXIgJGNoaXAgPSB0aGlzLiRjaGlwcy5lcShjaGlwSW5kZXgpO1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkQ2hpcCA9ICRjaGlwO1xyXG4gICAgICAgICRjaGlwWzBdLmZvY3VzKCk7XHJcblxyXG4gICAgICAgIC8vIGZpcmUgY2hpcFNlbGVjdCBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2hpcFNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2hpcFNlbGVjdC5jYWxsKHRoaXMsIHRoaXMuJGVsLCAkY2hpcFswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoQ2hpcHMuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDaGlwcyksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9DaGlwcztcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUNoaXBzS2V5ZG93blwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUNoaXBzS2V5ZG93bihlKSB7XHJcbiAgICAgICAgQ2hpcHMuX2tleWRvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB2YXIgJGNoaXBzID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmNoaXBzJyk7XHJcbiAgICAgICAgdmFyIGNoaXBzS2V5ZG93biA9IGUudGFyZ2V0ICYmICRjaGlwcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIERvbid0IGhhbmRsZSBrZXlkb3duIGlucHV0cyBvbiBpbnB1dCBhbmQgdGV4dGFyZWFcclxuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXMoJ2lucHV0LCB0ZXh0YXJlYScpIHx8ICFjaGlwc0tleWRvd24pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjdXJyQ2hpcHMgPSAkY2hpcHNbMF0uTV9DaGlwcztcclxuXHJcbiAgICAgICAgLy8gYmFja3NwYWNlIGFuZCBkZWxldGVcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA4IHx8IGUua2V5Q29kZSA9PT0gNDYpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICB2YXIgc2VsZWN0SW5kZXggPSBjdXJyQ2hpcHMuY2hpcHNEYXRhLmxlbmd0aDtcclxuICAgICAgICAgIGlmIChjdXJyQ2hpcHMuX3NlbGVjdGVkQ2hpcCkge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBjdXJyQ2hpcHMuX3NlbGVjdGVkQ2hpcC5pbmRleCgpO1xyXG4gICAgICAgICAgICBjdXJyQ2hpcHMuZGVsZXRlQ2hpcChpbmRleCk7XHJcbiAgICAgICAgICAgIGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSBzZWxlY3RJbmRleCBkb2Vzbid0IGdvIG5lZ2F0aXZlXHJcbiAgICAgICAgICAgIHNlbGVjdEluZGV4ID0gTWF0aC5tYXgoaW5kZXggLSAxLCAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoY3VyckNoaXBzLmNoaXBzRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY3VyckNoaXBzLnNlbGVjdENoaXAoc2VsZWN0SW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGxlZnQgYXJyb3cga2V5XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDM3KSB7XHJcbiAgICAgICAgICBpZiAoY3VyckNoaXBzLl9zZWxlY3RlZENoaXApIHtcclxuICAgICAgICAgICAgdmFyIF9zZWxlY3RJbmRleCA9IGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwLmluZGV4KCkgLSAxO1xyXG4gICAgICAgICAgICBpZiAoX3NlbGVjdEluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdXJyQ2hpcHMuc2VsZWN0Q2hpcChfc2VsZWN0SW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIHJpZ2h0IGFycm93IGtleVxyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzOSkge1xyXG4gICAgICAgICAgaWYgKGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwKSB7XHJcbiAgICAgICAgICAgIHZhciBfc2VsZWN0SW5kZXgyID0gY3VyckNoaXBzLl9zZWxlY3RlZENoaXAuaW5kZXgoKSArIDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoX3NlbGVjdEluZGV4MiA+PSBjdXJyQ2hpcHMuY2hpcHNEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGN1cnJDaGlwcy4kaW5wdXRbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjdXJyQ2hpcHMuc2VsZWN0Q2hpcChfc2VsZWN0SW5kZXgyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBDaGlwcyBLZXl1cFxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDaGlwc0tleXVwXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ2hpcHNLZXl1cChlKSB7XHJcbiAgICAgICAgQ2hpcHMuX2tleWRvd24gPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBDaGlwcyBCbHVyXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUNoaXBzQmx1clwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUNoaXBzQmx1cihlKSB7XHJcbiAgICAgICAgaWYgKCFDaGlwcy5fa2V5ZG93bikge1xyXG4gICAgICAgICAgdmFyICRjaGlwcyA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5jaGlwcycpO1xyXG4gICAgICAgICAgdmFyIGN1cnJDaGlwcyA9ICRjaGlwc1swXS5NX0NoaXBzO1xyXG5cclxuICAgICAgICAgIGN1cnJDaGlwcy5fc2VsZWN0ZWRDaGlwID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImRlZmF1bHRzXCIsXHJcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbiAgICByZXR1cm4gQ2hpcHM7XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIENoaXBzXHJcbiAgICovXHJcblxyXG5cclxuICBDaGlwcy5fa2V5ZG93biA9IGZhbHNlO1xyXG5cclxuICBNLkNoaXBzID0gQ2hpcHM7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihDaGlwcywgJ2NoaXBzJywgJ01fQ2hpcHMnKTtcclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIEhhbmRsZSByZW1vdmFsIG9mIHN0YXRpYyBjaGlwcy5cclxuICAgICQoZG9jdW1lbnQuYm9keSkub24oJ2NsaWNrJywgJy5jaGlwIC5jbG9zZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICRjaGlwcyA9ICQodGhpcykuY2xvc2VzdCgnLmNoaXBzJyk7XHJcbiAgICAgIGlmICgkY2hpcHMubGVuZ3RoICYmICRjaGlwc1swXS5NX0NoaXBzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgICQodGhpcykuY2xvc2VzdCgnLmNoaXAnKS5yZW1vdmUoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59KShjYXNoKTtcclxuOyhmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIHRvcDogMCxcclxuICAgIGJvdHRvbTogSW5maW5pdHksXHJcbiAgICBvZmZzZXQ6IDAsXHJcbiAgICBvblBvc2l0aW9uQ2hhbmdlOiBudWxsXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIFB1c2hwaW4gPSBmdW5jdGlvbiAoX0NvbXBvbmVudDEzKSB7XHJcbiAgICBfaW5oZXJpdHMoUHVzaHBpbiwgX0NvbXBvbmVudDEzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBQdXNocGluIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFB1c2hwaW4oZWwsIG9wdGlvbnMpIHtcclxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB1c2hwaW4pO1xyXG5cclxuICAgICAgdmFyIF90aGlzNDcgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoUHVzaHBpbi5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFB1c2hwaW4pKS5jYWxsKHRoaXMsIFB1c2hwaW4sIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczQ3LmVsLk1fUHVzaHBpbiA9IF90aGlzNDc7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIG1vZGFsXHJcbiAgICAgICAqIEBtZW1iZXIgUHVzaHBpbiNvcHRpb25zXHJcbiAgICAgICAqL1xyXG4gICAgICBfdGhpczQ3Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUHVzaHBpbi5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICBfdGhpczQ3Lm9yaWdpbmFsT2Zmc2V0ID0gX3RoaXM0Ny5lbC5vZmZzZXRUb3A7XHJcbiAgICAgIFB1c2hwaW4uX3B1c2hwaW5zLnB1c2goX3RoaXM0Nyk7XHJcbiAgICAgIF90aGlzNDcuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICBfdGhpczQ3Ll91cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICByZXR1cm4gX3RoaXM0NztcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoUHVzaHBpbiwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLmVsLnN0eWxlLnRvcCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlUGluQ2xhc3NlcygpO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHB1c2hwaW4gSW5zdFxyXG4gICAgICAgIHZhciBpbmRleCA9IFB1c2hwaW4uX3B1c2hwaW5zLmluZGV4T2YodGhpcyk7XHJcbiAgICAgICAgUHVzaHBpbi5fcHVzaHBpbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBQdXNocGluLl91cGRhdGVFbGVtZW50cyk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBQdXNocGluLl91cGRhdGVFbGVtZW50cyk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl91cGRhdGVQb3NpdGlvblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZVBvc2l0aW9uKCkge1xyXG4gICAgICAgIHZhciBzY3JvbGxlZCA9IE0uZ2V0RG9jdW1lbnRTY3JvbGxUb3AoKSArIHRoaXMub3B0aW9ucy5vZmZzZXQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudG9wIDw9IHNjcm9sbGVkICYmIHRoaXMub3B0aW9ucy5ib3R0b20gPj0gc2Nyb2xsZWQgJiYgIXRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdwaW5uZWQnKSkge1xyXG4gICAgICAgICAgdGhpcy5fcmVtb3ZlUGluQ2xhc3NlcygpO1xyXG4gICAgICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSB0aGlzLm9wdGlvbnMub2Zmc2V0ICsgXCJweFwiO1xyXG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdwaW5uZWQnKTtcclxuXHJcbiAgICAgICAgICAvLyBvblBvc2l0aW9uQ2hhbmdlIGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlLmNhbGwodGhpcywgJ3Bpbm5lZCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIHBpbi10b3AgKHdoZW4gc2Nyb2xsZWQgcG9zaXRpb24gaXMgYWJvdmUgdG9wKVxyXG4gICAgICAgIGlmIChzY3JvbGxlZCA8IHRoaXMub3B0aW9ucy50b3AgJiYgIXRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdwaW4tdG9wJykpIHtcclxuICAgICAgICAgIHRoaXMuX3JlbW92ZVBpbkNsYXNzZXMoKTtcclxuICAgICAgICAgIHRoaXMuZWwuc3R5bGUudG9wID0gMDtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgncGluLXRvcCcpO1xyXG5cclxuICAgICAgICAgIC8vIG9uUG9zaXRpb25DaGFuZ2UgY2FsbGJhY2tcclxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUG9zaXRpb25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uUG9zaXRpb25DaGFuZ2UuY2FsbCh0aGlzLCAncGluLXRvcCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIHBpbi1ib3R0b20gKHdoZW4gc2Nyb2xsZWQgcG9zaXRpb24gaXMgYmVsb3cgYm90dG9tKVxyXG4gICAgICAgIGlmIChzY3JvbGxlZCA+IHRoaXMub3B0aW9ucy5ib3R0b20gJiYgIXRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdwaW4tYm90dG9tJykpIHtcclxuICAgICAgICAgIHRoaXMuX3JlbW92ZVBpbkNsYXNzZXMoKTtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgncGluLWJvdHRvbScpO1xyXG4gICAgICAgICAgdGhpcy5lbC5zdHlsZS50b3AgPSB0aGlzLm9wdGlvbnMuYm90dG9tIC0gdGhpcy5vcmlnaW5hbE9mZnNldCArIFwicHhcIjtcclxuXHJcbiAgICAgICAgICAvLyBvblBvc2l0aW9uQ2hhbmdlIGNhbGxiYWNrXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblBvc2l0aW9uQ2hhbmdlLmNhbGwodGhpcywgJ3Bpbi1ib3R0b20nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVQaW5DbGFzc2VzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlUGluQ2xhc3NlcygpIHtcclxuICAgICAgICAvLyBJRSAxMSBidWcgKGNhbid0IHJlbW92ZSBtdWx0aXBsZSBjbGFzc2VzIGluIG9uZSBsaW5lKVxyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgncGluLXRvcCcpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgncGlubmVkJyk7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdwaW4tYm90dG9tJyk7XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChQdXNocGluLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHVzaHBpbiksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9QdXNocGluO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfdXBkYXRlRWxlbWVudHNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF91cGRhdGVFbGVtZW50cygpIHtcclxuICAgICAgICBmb3IgKHZhciBlbEluZGV4IGluIFB1c2hwaW4uX3B1c2hwaW5zKSB7XHJcbiAgICAgICAgICB2YXIgcEluc3RhbmNlID0gUHVzaHBpbi5fcHVzaHBpbnNbZWxJbmRleF07XHJcbiAgICAgICAgICBwSW5zdGFuY2UuX3VwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIFB1c2hwaW47XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICAvKipcclxuICAgKiBAc3RhdGljXHJcbiAgICogQG1lbWJlcm9mIFB1c2hwaW5cclxuICAgKi9cclxuXHJcblxyXG4gIFB1c2hwaW4uX3B1c2hwaW5zID0gW107XHJcblxyXG4gIE0uUHVzaHBpbiA9IFB1c2hwaW47XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihQdXNocGluLCAncHVzaHBpbicsICdNX1B1c2hwaW4nKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG47KGZ1bmN0aW9uICgkLCBhbmltKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgX2RlZmF1bHRzID0ge1xyXG4gICAgZGlyZWN0aW9uOiAndG9wJyxcclxuICAgIGhvdmVyRW5hYmxlZDogdHJ1ZSxcclxuICAgIHRvb2xiYXJFbmFibGVkOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gICQuZm4ucmV2ZXJzZSA9IFtdLnJldmVyc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBGbG9hdGluZ0FjdGlvbkJ1dHRvbiA9IGZ1bmN0aW9uIChfQ29tcG9uZW50MTQpIHtcclxuICAgIF9pbmhlcml0cyhGbG9hdGluZ0FjdGlvbkJ1dHRvbiwgX0NvbXBvbmVudDE0KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBGbG9hdGluZ0FjdGlvbkJ1dHRvbiBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBGbG9hdGluZ0FjdGlvbkJ1dHRvbihlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRmxvYXRpbmdBY3Rpb25CdXR0b24pO1xyXG5cclxuICAgICAgdmFyIF90aGlzNDggPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRmxvYXRpbmdBY3Rpb25CdXR0b24uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihGbG9hdGluZ0FjdGlvbkJ1dHRvbikpLmNhbGwodGhpcywgRmxvYXRpbmdBY3Rpb25CdXR0b24sIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczQ4LmVsLk1fRmxvYXRpbmdBY3Rpb25CdXR0b24gPSBfdGhpczQ4O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBmYWJcclxuICAgICAgICogQG1lbWJlciBGbG9hdGluZ0FjdGlvbkJ1dHRvbiNvcHRpb25zXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBbZGlyZWN0aW9uXSAtIERpcmVjdGlvbiBmYWIgbWVudSBvcGVuc1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW2hvdmVyRW5hYmxlZD10cnVlXSAtIEVuYWJsZSBob3ZlciB2cyBjbGlja1xyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gW3Rvb2xiYXJFbmFibGVkPWZhbHNlXSAtIEVuYWJsZSB0b29sYmFyIHRyYW5zaXRpb25cclxuICAgICAgICovXHJcbiAgICAgIF90aGlzNDgub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBGbG9hdGluZ0FjdGlvbkJ1dHRvbi5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICBfdGhpczQ4LmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICBfdGhpczQ4LiRhbmNob3IgPSBfdGhpczQ4LiRlbC5jaGlsZHJlbignYScpLmZpcnN0KCk7XHJcbiAgICAgIF90aGlzNDguJG1lbnUgPSBfdGhpczQ4LiRlbC5jaGlsZHJlbigndWwnKS5maXJzdCgpO1xyXG4gICAgICBfdGhpczQ4LiRmbG9hdGluZ0J0bnMgPSBfdGhpczQ4LiRlbC5maW5kKCd1bCAuYnRuLWZsb2F0aW5nJyk7XHJcbiAgICAgIF90aGlzNDguJGZsb2F0aW5nQnRuc1JldmVyc2UgPSBfdGhpczQ4LiRlbC5maW5kKCd1bCAuYnRuLWZsb2F0aW5nJykucmV2ZXJzZSgpO1xyXG4gICAgICBfdGhpczQ4Lm9mZnNldFkgPSAwO1xyXG4gICAgICBfdGhpczQ4Lm9mZnNldFggPSAwO1xyXG5cclxuICAgICAgX3RoaXM0OC4kZWwuYWRkQ2xhc3MoXCJkaXJlY3Rpb24tXCIgKyBfdGhpczQ4Lm9wdGlvbnMuZGlyZWN0aW9uKTtcclxuICAgICAgaWYgKF90aGlzNDgub3B0aW9ucy5kaXJlY3Rpb24gPT09ICd0b3AnKSB7XHJcbiAgICAgICAgX3RoaXM0OC5vZmZzZXRZID0gNDA7XHJcbiAgICAgIH0gZWxzZSBpZiAoX3RoaXM0OC5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgIF90aGlzNDgub2Zmc2V0WCA9IC00MDtcclxuICAgICAgfSBlbHNlIGlmIChfdGhpczQ4Lm9wdGlvbnMuZGlyZWN0aW9uID09PSAnYm90dG9tJykge1xyXG4gICAgICAgIF90aGlzNDgub2Zmc2V0WSA9IC00MDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfdGhpczQ4Lm9mZnNldFggPSA0MDtcclxuICAgICAgfVxyXG4gICAgICBfdGhpczQ4Ll9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgcmV0dXJuIF90aGlzNDg7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKEZsb2F0aW5nQWN0aW9uQnV0dG9uLCBbe1xyXG4gICAgICBrZXk6IFwiZGVzdHJveVwiLFxyXG5cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAgICovXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgICB0aGlzLmVsLk1fRmxvYXRpbmdBY3Rpb25CdXR0b24gPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUZBQkNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVGQUJDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZU9wZW5Cb3VuZCA9IHRoaXMub3Blbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNsb3NlQm91bmQgPSB0aGlzLmNsb3NlLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaG92ZXJFbmFibGVkICYmICF0aGlzLm9wdGlvbnMudG9vbGJhckVuYWJsZWQpIHtcclxuICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2hhbmRsZU9wZW5Cb3VuZCk7XHJcbiAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oYW5kbGVDbG9zZUJvdW5kKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUZBQkNsaWNrQm91bmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ob3ZlckVuYWJsZWQgJiYgIXRoaXMub3B0aW9ucy50b29sYmFyRW5hYmxlZCkge1xyXG4gICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5faGFuZGxlT3BlbkJvdW5kKTtcclxuICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZUNsb3NlQm91bmQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRkFCQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIEZBQiBDbGlja1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlRkFCQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVGQUJDbGljaygpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIERvY3VtZW50IENsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZURvY3VtZW50Q2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVEb2N1bWVudENsaWNrKGUpIHtcclxuICAgICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy4kbWVudSkubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3BlbiBGQUJcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwib3BlblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudG9vbGJhckVuYWJsZWQpIHtcclxuICAgICAgICAgIHRoaXMuX2FuaW1hdGVJblRvb2xiYXIoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZUluRkFCKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENsb3NlIEZBQlxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJjbG9zZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50b29sYmFyRW5hYmxlZCkge1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX2hhbmRsZUNsb3NlQm91bmQsIHRydWUpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLl9hbmltYXRlT3V0VG9vbGJhcigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9hbmltYXRlT3V0RkFCKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDbGFzc2ljIEZBQiBNZW51IG9wZW5cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVJbkZBQlwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVJbkZBQigpIHtcclxuICAgICAgICB2YXIgX3RoaXM0OSA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgdmFyIHRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMuJGZsb2F0aW5nQnRuc1JldmVyc2UuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgICB0YXJnZXRzOiBlbCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgICAgc2NhbGU6IFswLjQsIDFdLFxyXG4gICAgICAgICAgICB0cmFuc2xhdGVZOiBbX3RoaXM0OS5vZmZzZXRZLCAwXSxcclxuICAgICAgICAgICAgdHJhbnNsYXRlWDogW190aGlzNDkub2Zmc2V0WCwgMF0sXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAyNzUsXHJcbiAgICAgICAgICAgIGRlbGF5OiB0aW1lLFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlSW5PdXRRdWFkJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aW1lICs9IDQwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2xhc3NpYyBGQUIgTWVudSBjbG9zZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYW5pbWF0ZU91dEZBQlwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FuaW1hdGVPdXRGQUIoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzNTAgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLiRmbG9hdGluZ0J0bnNSZXZlcnNlLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICBhbmltLnJlbW92ZShlbCk7XHJcbiAgICAgICAgICBhbmltKHtcclxuICAgICAgICAgICAgdGFyZ2V0czogZWwsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjQsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZVk6IF90aGlzNTAub2Zmc2V0WSxcclxuICAgICAgICAgICAgdHJhbnNsYXRlWDogX3RoaXM1MC5vZmZzZXRYLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMTc1LFxyXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXM1MC4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRvb2xiYXIgdHJhbnNpdGlvbiBNZW51IG9wZW5cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVJblRvb2xiYXJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hbmltYXRlSW5Ub29sYmFyKCkge1xyXG4gICAgICAgIHZhciBfdGhpczUxID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIHNjYWxlRmFjdG9yID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdmFyIGJ0blJlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHZhciBiYWNrZHJvcCA9ICQoJzxkaXYgY2xhc3M9XCJmYWItYmFja2Ryb3BcIj48L2Rpdj4nKTtcclxuICAgICAgICB2YXIgZmFiQ29sb3IgPSB0aGlzLiRhbmNob3IuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJyk7XHJcbiAgICAgICAgdGhpcy4kYW5jaG9yLmFwcGVuZChiYWNrZHJvcCk7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0WCA9IGJ0blJlY3QubGVmdCAtIHdpbmRvd1dpZHRoIC8gMiArIGJ0blJlY3Qud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0WSA9IHdpbmRvd0hlaWdodCAtIGJ0blJlY3QuYm90dG9tO1xyXG4gICAgICAgIHNjYWxlRmFjdG9yID0gd2luZG93V2lkdGggLyBiYWNrZHJvcFswXS5jbGllbnRXaWR0aDtcclxuICAgICAgICB0aGlzLmJ0bkJvdHRvbSA9IGJ0blJlY3QuYm90dG9tO1xyXG4gICAgICAgIHRoaXMuYnRuTGVmdCA9IGJ0blJlY3QubGVmdDtcclxuICAgICAgICB0aGlzLmJ0bldpZHRoID0gYnRuUmVjdC53aWR0aDtcclxuXHJcbiAgICAgICAgLy8gU2V0IGluaXRpYWwgc3RhdGVcclxuICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy4kZWwuY3NzKHtcclxuICAgICAgICAgICd0ZXh0LWFsaWduJzogJ2NlbnRlcicsXHJcbiAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgYm90dG9tOiAwLFxyXG4gICAgICAgICAgbGVmdDogMCxcclxuICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoJyArIHRoaXMub2Zmc2V0WCArICdweCknLFxyXG4gICAgICAgICAgdHJhbnNpdGlvbjogJ25vbmUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kYW5jaG9yLmNzcyh7XHJcbiAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKCcgKyAtdGhpcy5vZmZzZXRZICsgJ3B4KScsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uOiAnbm9uZSdcclxuICAgICAgICB9KTtcclxuICAgICAgICBiYWNrZHJvcC5jc3Moe1xyXG4gICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiBmYWJDb2xvclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIF90aGlzNTEuJGVsLmNzcyh7XHJcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJycsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gLjJzIGN1YmljLWJlemllcigwLjU1MCwgMC4wODUsIDAuNjgwLCAwLjUzMCksIGJhY2tncm91bmQtY29sb3IgMHMgbGluZWFyIC4ycydcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgX3RoaXM1MS4kYW5jaG9yLmNzcyh7XHJcbiAgICAgICAgICAgIG92ZXJmbG93OiAndmlzaWJsZScsXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJycsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gLjJzJ1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzNTEuJGVsLmNzcyh7XHJcbiAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxyXG4gICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogZmFiQ29sb3JcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJhY2tkcm9wLmNzcyh7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoJyArIHNjYWxlRmFjdG9yICsgJyknLFxyXG4gICAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gLjJzIGN1YmljLWJlemllcigwLjU1MCwgMC4wNTUsIDAuNjc1LCAwLjE5MCknXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBfdGhpczUxLiRtZW51LmNoaWxkcmVuKCdsaScpLmNoaWxkcmVuKCdhJykuY3NzKHtcclxuICAgICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gU2Nyb2xsIHRvIGNsb3NlLlxyXG4gICAgICAgICAgICBfdGhpczUxLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQgPSBfdGhpczUxLl9oYW5kbGVEb2N1bWVudENsaWNrLmJpbmQoX3RoaXM1MSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBfdGhpczUxLl9oYW5kbGVDbG9zZUJvdW5kLCB0cnVlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF90aGlzNTEuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVG9vbGJhciB0cmFuc2l0aW9uIE1lbnUgY2xvc2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2FuaW1hdGVPdXRUb29sYmFyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYW5pbWF0ZU91dFRvb2xiYXIoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzNTIgPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIHZhciBiYWNrZHJvcCA9IHRoaXMuJGVsLmZpbmQoJy5mYWItYmFja2Ryb3AnKTtcclxuICAgICAgICB2YXIgZmFiQ29sb3IgPSB0aGlzLiRhbmNob3IuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJyk7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0WCA9IHRoaXMuYnRuTGVmdCAtIHdpbmRvd1dpZHRoIC8gMiArIHRoaXMuYnRuV2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0WSA9IHdpbmRvd0hlaWdodCAtIHRoaXMuYnRuQm90dG9tO1xyXG5cclxuICAgICAgICAvLyBIaWRlIGJhY2tkcm9wXHJcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMuJGVsLmNzcyh7XHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uOiAnbm9uZSdcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLiRhbmNob3IuY3NzKHtcclxuICAgICAgICAgIHRyYW5zaXRpb246ICdub25lJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJhY2tkcm9wLmNzcyh7XHJcbiAgICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZSgwKScsXHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IGZhYkNvbG9yXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy4kbWVudS5jaGlsZHJlbignbGknKS5jaGlsZHJlbignYScpLmNzcyh7XHJcbiAgICAgICAgICBvcGFjaXR5OiAnJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGJhY2tkcm9wLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFNldCBpbml0aWFsIHN0YXRlLlxyXG4gICAgICAgICAgX3RoaXM1Mi4kZWwuY3NzKHtcclxuICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnJyxcclxuICAgICAgICAgICAgd2lkdGg6ICcnLFxyXG4gICAgICAgICAgICBib3R0b206ICcnLFxyXG4gICAgICAgICAgICBsZWZ0OiAnJyxcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICcnLFxyXG4gICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcnLFxyXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgnICsgLV90aGlzNTIub2Zmc2V0WCArICdweCwwLDApJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBfdGhpczUyLiRhbmNob3IuY3NzKHtcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICcnLFxyXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCcgKyBfdGhpczUyLm9mZnNldFkgKyAncHgsMCknXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXM1Mi4kZWwuY3NzKHtcclxuICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLDAsMCknLFxyXG4gICAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gLjJzJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgX3RoaXM1Mi4kYW5jaG9yLmNzcyh7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwwLDApJyxcclxuICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAndHJhbnNmb3JtIC4ycyBjdWJpYy1iZXppZXIoMC41NTAsIDAuMDU1LCAwLjY3NSwgMC4xOTApJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sIDIwKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoRmxvYXRpbmdBY3Rpb25CdXR0b24uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihGbG9hdGluZ0FjdGlvbkJ1dHRvbiksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9GbG9hdGluZ0FjdGlvbkJ1dHRvbjtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBGbG9hdGluZ0FjdGlvbkJ1dHRvbjtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIE0uRmxvYXRpbmdBY3Rpb25CdXR0b24gPSBGbG9hdGluZ0FjdGlvbkJ1dHRvbjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKEZsb2F0aW5nQWN0aW9uQnV0dG9uLCAnZmxvYXRpbmdBY3Rpb25CdXR0b24nLCAnTV9GbG9hdGluZ0FjdGlvbkJ1dHRvbicpO1xyXG4gIH1cclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbjsoZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICAvLyBDbG9zZSB3aGVuIGRhdGUgaXMgc2VsZWN0ZWRcclxuICAgIGF1dG9DbG9zZTogZmFsc2UsXHJcblxyXG4gICAgLy8gdGhlIGRlZmF1bHQgb3V0cHV0IGZvcm1hdCBmb3IgdGhlIGlucHV0IGZpZWxkIHZhbHVlXHJcbiAgICBmb3JtYXQ6ICdtbW0gZGQsIHl5eXknLFxyXG5cclxuICAgIC8vIFVzZWQgdG8gY3JlYXRlIGRhdGUgb2JqZWN0IGZyb20gY3VycmVudCBpbnB1dCBzdHJpbmdcclxuICAgIHBhcnNlOiBudWxsLFxyXG5cclxuICAgIC8vIFRoZSBpbml0aWFsIGRhdGUgdG8gdmlldyB3aGVuIGZpcnN0IG9wZW5lZFxyXG4gICAgZGVmYXVsdERhdGU6IG51bGwsXHJcblxyXG4gICAgLy8gTWFrZSB0aGUgYGRlZmF1bHREYXRlYCB0aGUgaW5pdGlhbCBzZWxlY3RlZCB2YWx1ZVxyXG4gICAgc2V0RGVmYXVsdERhdGU6IGZhbHNlLFxyXG5cclxuICAgIGRpc2FibGVXZWVrZW5kczogZmFsc2UsXHJcblxyXG4gICAgZGlzYWJsZURheUZuOiBudWxsLFxyXG5cclxuICAgIC8vIEZpcnN0IGRheSBvZiB3ZWVrICgwOiBTdW5kYXksIDE6IE1vbmRheSBldGMpXHJcbiAgICBmaXJzdERheTogMCxcclxuXHJcbiAgICAvLyBUaGUgZWFybGllc3QgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxyXG4gICAgbWluRGF0ZTogbnVsbCxcclxuICAgIC8vIFRoZWxhdGVzdCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXHJcbiAgICBtYXhEYXRlOiBudWxsLFxyXG5cclxuICAgIC8vIE51bWJlciBvZiB5ZWFycyBlaXRoZXIgc2lkZSwgb3IgYXJyYXkgb2YgdXBwZXIvbG93ZXIgcmFuZ2VcclxuICAgIHllYXJSYW5nZTogMTAsXHJcblxyXG4gICAgLy8gdXNlZCBpbnRlcm5hbGx5IChkb24ndCBjb25maWcgb3V0c2lkZSlcclxuICAgIG1pblllYXI6IDAsXHJcbiAgICBtYXhZZWFyOiA5OTk5LFxyXG4gICAgbWluTW9udGg6IHVuZGVmaW5lZCxcclxuICAgIG1heE1vbnRoOiB1bmRlZmluZWQsXHJcblxyXG4gICAgc3RhcnRSYW5nZTogbnVsbCxcclxuICAgIGVuZFJhbmdlOiBudWxsLFxyXG5cclxuICAgIGlzUlRMOiBmYWxzZSxcclxuXHJcbiAgICAvLyBSZW5kZXIgdGhlIG1vbnRoIGFmdGVyIHllYXIgaW4gdGhlIGNhbGVuZGFyIHRpdGxlXHJcbiAgICBzaG93TW9udGhBZnRlclllYXI6IGZhbHNlLFxyXG5cclxuICAgIC8vIFJlbmRlciBkYXlzIG9mIHRoZSBjYWxlbmRhciBncmlkIHRoYXQgZmFsbCBpbiB0aGUgbmV4dCBvciBwcmV2aW91cyBtb250aFxyXG4gICAgc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRoczogZmFsc2UsXHJcblxyXG4gICAgLy8gU3BlY2lmeSBhIERPTSBlbGVtZW50IHRvIHJlbmRlciB0aGUgY2FsZW5kYXIgaW5cclxuICAgIGNvbnRhaW5lcjogbnVsbCxcclxuXHJcbiAgICAvLyBTaG93IGNsZWFyIGJ1dHRvblxyXG4gICAgc2hvd0NsZWFyQnRuOiBmYWxzZSxcclxuXHJcbiAgICAvLyBpbnRlcm5hdGlvbmFsaXphdGlvblxyXG4gICAgaTE4bjoge1xyXG4gICAgICBjYW5jZWw6ICdDYW5jZWwnLFxyXG4gICAgICBjbGVhcjogJ0NsZWFyJyxcclxuICAgICAgZG9uZTogJ09rJyxcclxuICAgICAgcHJldmlvdXNNb250aDogJ+KAuScsXHJcbiAgICAgIG5leHRNb250aDogJ+KAuicsXHJcbiAgICAgIG1vbnRoczogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10sXHJcbiAgICAgIG1vbnRoc1Nob3J0OiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXHJcbiAgICAgIHdlZWtkYXlzOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J10sXHJcbiAgICAgIHdlZWtkYXlzU2hvcnQ6IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J10sXHJcbiAgICAgIHdlZWtkYXlzQWJicmV2OiBbJ1MnLCAnTScsICdUJywgJ1cnLCAnVCcsICdGJywgJ1MnXVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBldmVudHMgYXJyYXlcclxuICAgIGV2ZW50czogW10sXHJcblxyXG4gICAgLy8gY2FsbGJhY2sgZnVuY3Rpb25cclxuICAgIG9uU2VsZWN0OiBudWxsLFxyXG4gICAgb25PcGVuOiBudWxsLFxyXG4gICAgb25DbG9zZTogbnVsbCxcclxuICAgIG9uRHJhdzogbnVsbFxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBEYXRlcGlja2VyID0gZnVuY3Rpb24gKF9Db21wb25lbnQxNSkge1xyXG4gICAgX2luaGVyaXRzKERhdGVwaWNrZXIsIF9Db21wb25lbnQxNSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgRGF0ZXBpY2tlciBpbnN0YW5jZSBhbmQgc2V0IHVwIG92ZXJsYXlcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRGF0ZXBpY2tlcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGF0ZXBpY2tlcik7XHJcblxyXG4gICAgICB2YXIgX3RoaXM1MyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChEYXRlcGlja2VyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGF0ZXBpY2tlcikpLmNhbGwodGhpcywgRGF0ZXBpY2tlciwgZWwsIG9wdGlvbnMpKTtcclxuXHJcbiAgICAgIF90aGlzNTMuZWwuTV9EYXRlcGlja2VyID0gX3RoaXM1MztcclxuXHJcbiAgICAgIF90aGlzNTMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEYXRlcGlja2VyLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBpMThuIGRlZmF1bHRzIGFyZSBub3QgbG9zdCB3aGVuIG9ubHkgZmV3IGkxOG4gb3B0aW9uIHByb3BlcnRpZXMgYXJlIHBhc3NlZFxyXG4gICAgICBpZiAoISFvcHRpb25zICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2kxOG4nKSAmJiB0eXBlb2Ygb3B0aW9ucy5pMThuID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIF90aGlzNTMub3B0aW9ucy5pMThuID0gJC5leHRlbmQoe30sIERhdGVwaWNrZXIuZGVmYXVsdHMuaTE4biwgb3B0aW9ucy5pMThuKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRpbWUgY29tcG9uZW50IGZyb20gbWluRGF0ZSBhbmQgbWF4RGF0ZSBvcHRpb25zXHJcbiAgICAgIGlmIChfdGhpczUzLm9wdGlvbnMubWluRGF0ZSkgX3RoaXM1My5vcHRpb25zLm1pbkRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgIGlmIChfdGhpczUzLm9wdGlvbnMubWF4RGF0ZSkgX3RoaXM1My5vcHRpb25zLm1heERhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcblxyXG4gICAgICBfdGhpczUzLmlkID0gTS5ndWlkKCk7XHJcblxyXG4gICAgICBfdGhpczUzLl9zZXR1cFZhcmlhYmxlcygpO1xyXG4gICAgICBfdGhpczUzLl9pbnNlcnRIVE1MSW50b0RPTSgpO1xyXG4gICAgICBfdGhpczUzLl9zZXR1cE1vZGFsKCk7XHJcblxyXG4gICAgICBfdGhpczUzLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuXHJcbiAgICAgIGlmICghX3RoaXM1My5vcHRpb25zLmRlZmF1bHREYXRlKSB7XHJcbiAgICAgICAgX3RoaXM1My5vcHRpb25zLmRlZmF1bHREYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShfdGhpczUzLmVsLnZhbHVlKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkZWZEYXRlID0gX3RoaXM1My5vcHRpb25zLmRlZmF1bHREYXRlO1xyXG4gICAgICBpZiAoRGF0ZXBpY2tlci5faXNEYXRlKGRlZkRhdGUpKSB7XHJcbiAgICAgICAgaWYgKF90aGlzNTMub3B0aW9ucy5zZXREZWZhdWx0RGF0ZSkge1xyXG4gICAgICAgICAgX3RoaXM1My5zZXREYXRlKGRlZkRhdGUsIHRydWUpO1xyXG4gICAgICAgICAgX3RoaXM1My5zZXRJbnB1dFZhbHVlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIF90aGlzNTMuZ290b0RhdGUoZGVmRGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIF90aGlzNTMuZ290b0RhdGUobmV3IERhdGUoKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBEZXNjcmliZXMgb3Blbi9jbG9zZSBzdGF0ZSBvZiBkYXRlcGlja2VyXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXM1My5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIF90aGlzNTM7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKERhdGVwaWNrZXIsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMubW9kYWwuZGVzdHJveSgpO1xyXG4gICAgICAgICQodGhpcy5tb2RhbEVsKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmRlc3Ryb3lTZWxlY3RzKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX0RhdGVwaWNrZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImRlc3Ryb3lTZWxlY3RzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95U2VsZWN0cygpIHtcclxuICAgICAgICB2YXIgb2xkWWVhclNlbGVjdCA9IHRoaXMuY2FsZW5kYXJFbC5xdWVyeVNlbGVjdG9yKCcub3JpZy1zZWxlY3QteWVhcicpO1xyXG4gICAgICAgIGlmIChvbGRZZWFyU2VsZWN0KSB7XHJcbiAgICAgICAgICBNLkZvcm1TZWxlY3QuZ2V0SW5zdGFuY2Uob2xkWWVhclNlbGVjdCkuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb2xkTW9udGhTZWxlY3QgPSB0aGlzLmNhbGVuZGFyRWwucXVlcnlTZWxlY3RvcignLm9yaWctc2VsZWN0LW1vbnRoJyk7XHJcbiAgICAgICAgaWYgKG9sZE1vbnRoU2VsZWN0KSB7XHJcbiAgICAgICAgICBNLkZvcm1TZWxlY3QuZ2V0SW5zdGFuY2Uob2xkTW9udGhTZWxlY3QpLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9pbnNlcnRIVE1MSW50b0RPTVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2luc2VydEhUTUxJbnRvRE9NKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd0NsZWFyQnRuKSB7XHJcbiAgICAgICAgICAkKHRoaXMuY2xlYXJCdG4pLmNzcyh7IHZpc2liaWxpdHk6ICcnIH0pO1xyXG4gICAgICAgICAgdGhpcy5jbGVhckJ0bi5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuaTE4bi5jbGVhcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZG9uZUJ0bi5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuaTE4bi5kb25lO1xyXG4gICAgICAgIHRoaXMuY2FuY2VsQnRuLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5pMThuLmNhbmNlbDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcclxuICAgICAgICAgIHRoaXMuJG1vZGFsRWwuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuJG1vZGFsRWwuaW5zZXJ0QmVmb3JlKHRoaXMuZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwTW9kYWxcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cE1vZGFsKCkge1xyXG4gICAgICAgIHZhciBfdGhpczU0ID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5tb2RhbEVsLmlkID0gJ21vZGFsLScgKyB0aGlzLmlkO1xyXG4gICAgICAgIHRoaXMubW9kYWwgPSBNLk1vZGFsLmluaXQodGhpcy5tb2RhbEVsLCB7XHJcbiAgICAgICAgICBvbkNsb3NlRW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzNTQuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInRvU3RyaW5nXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b1N0cmluZyhmb3JtYXQpIHtcclxuICAgICAgICB2YXIgX3RoaXM1NSA9IHRoaXM7XHJcblxyXG4gICAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCB0aGlzLm9wdGlvbnMuZm9ybWF0O1xyXG4gICAgICAgIGlmICghRGF0ZXBpY2tlci5faXNEYXRlKHRoaXMuZGF0ZSkpIHtcclxuICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBmb3JtYXRBcnJheSA9IGZvcm1hdC5zcGxpdCgvKGR7MSw0fXxtezEsNH18eXs0fXx5eXwhLikvZyk7XHJcbiAgICAgICAgdmFyIGZvcm1hdHRlZERhdGUgPSBmb3JtYXRBcnJheS5tYXAoZnVuY3Rpb24gKGxhYmVsKSB7XHJcbiAgICAgICAgICBpZiAoX3RoaXM1NS5mb3JtYXRzW2xhYmVsXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM1NS5mb3JtYXRzW2xhYmVsXSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBsYWJlbDtcclxuICAgICAgICB9KS5qb2luKCcnKTtcclxuICAgICAgICByZXR1cm4gZm9ybWF0dGVkRGF0ZTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic2V0RGF0ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0RGF0ZShkYXRlLCBwcmV2ZW50T25TZWxlY3QpIHtcclxuICAgICAgICBpZiAoIWRhdGUpIHtcclxuICAgICAgICAgIHRoaXMuZGF0ZSA9IG51bGw7XHJcbiAgICAgICAgICB0aGlzLl9yZW5kZXJEYXRlRGlzcGxheSgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZHJhdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGRhdGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghRGF0ZXBpY2tlci5faXNEYXRlKGRhdGUpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbWluID0gdGhpcy5vcHRpb25zLm1pbkRhdGUsXHJcbiAgICAgICAgICAgIG1heCA9IHRoaXMub3B0aW9ucy5tYXhEYXRlO1xyXG5cclxuICAgICAgICBpZiAoRGF0ZXBpY2tlci5faXNEYXRlKG1pbikgJiYgZGF0ZSA8IG1pbikge1xyXG4gICAgICAgICAgZGF0ZSA9IG1pbjtcclxuICAgICAgICB9IGVsc2UgaWYgKERhdGVwaWNrZXIuX2lzRGF0ZShtYXgpICYmIGRhdGUgPiBtYXgpIHtcclxuICAgICAgICAgIGRhdGUgPSBtYXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbmRlckRhdGVEaXNwbGF5KCk7XHJcblxyXG4gICAgICAgIERhdGVwaWNrZXIuX3NldFRvU3RhcnRPZkRheSh0aGlzLmRhdGUpO1xyXG4gICAgICAgIHRoaXMuZ290b0RhdGUodGhpcy5kYXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFwcmV2ZW50T25TZWxlY3QgJiYgdHlwZW9mIHRoaXMub3B0aW9ucy5vblNlbGVjdCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uU2VsZWN0LmNhbGwodGhpcywgdGhpcy5kYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInNldElucHV0VmFsdWVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldElucHV0VmFsdWUoKSB7XHJcbiAgICAgICAgdGhpcy5lbC52YWx1ZSA9IHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnLCB7IGZpcmVkQnk6IHRoaXMgfSk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW5kZXJEYXRlRGlzcGxheVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbmRlckRhdGVEaXNwbGF5KCkge1xyXG4gICAgICAgIHZhciBkaXNwbGF5RGF0ZSA9IERhdGVwaWNrZXIuX2lzRGF0ZSh0aGlzLmRhdGUpID8gdGhpcy5kYXRlIDogbmV3IERhdGUoKTtcclxuICAgICAgICB2YXIgaTE4biA9IHRoaXMub3B0aW9ucy5pMThuO1xyXG4gICAgICAgIHZhciBkYXkgPSBpMThuLndlZWtkYXlzU2hvcnRbZGlzcGxheURhdGUuZ2V0RGF5KCldO1xyXG4gICAgICAgIHZhciBtb250aCA9IGkxOG4ubW9udGhzU2hvcnRbZGlzcGxheURhdGUuZ2V0TW9udGgoKV07XHJcbiAgICAgICAgdmFyIGRhdGUgPSBkaXNwbGF5RGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgdGhpcy55ZWFyVGV4dEVsLmlubmVySFRNTCA9IGRpc3BsYXlEYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgdGhpcy5kYXRlVGV4dEVsLmlubmVySFRNTCA9IGRheSArIFwiLCBcIiArIG1vbnRoICsgXCIgXCIgKyBkYXRlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBkYXRlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdvdG9EYXRlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnb3RvRGF0ZShkYXRlKSB7XHJcbiAgICAgICAgdmFyIG5ld0NhbGVuZGFyID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKCFEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNhbGVuZGFycykge1xyXG4gICAgICAgICAgdmFyIGZpcnN0VmlzaWJsZURhdGUgPSBuZXcgRGF0ZSh0aGlzLmNhbGVuZGFyc1swXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1swXS5tb250aCwgMSksXHJcbiAgICAgICAgICAgICAgbGFzdFZpc2libGVEYXRlID0gbmV3IERhdGUodGhpcy5jYWxlbmRhcnNbdGhpcy5jYWxlbmRhcnMubGVuZ3RoIC0gMV0ueWVhciwgdGhpcy5jYWxlbmRhcnNbdGhpcy5jYWxlbmRhcnMubGVuZ3RoIC0gMV0ubW9udGgsIDEpLFxyXG4gICAgICAgICAgICAgIHZpc2libGVEYXRlID0gZGF0ZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAvLyBnZXQgdGhlIGVuZCBvZiB0aGUgbW9udGhcclxuICAgICAgICAgIGxhc3RWaXNpYmxlRGF0ZS5zZXRNb250aChsYXN0VmlzaWJsZURhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgICAgbGFzdFZpc2libGVEYXRlLnNldERhdGUobGFzdFZpc2libGVEYXRlLmdldERhdGUoKSAtIDEpO1xyXG4gICAgICAgICAgbmV3Q2FsZW5kYXIgPSB2aXNpYmxlRGF0ZSA8IGZpcnN0VmlzaWJsZURhdGUuZ2V0VGltZSgpIHx8IGxhc3RWaXNpYmxlRGF0ZS5nZXRUaW1lKCkgPCB2aXNpYmxlRGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdDYWxlbmRhcikge1xyXG4gICAgICAgICAgdGhpcy5jYWxlbmRhcnMgPSBbe1xyXG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKClcclxuICAgICAgICAgIH1dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hZGp1c3RDYWxlbmRhcnMoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiYWRqdXN0Q2FsZW5kYXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGp1c3RDYWxlbmRhcnMoKSB7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0gPSB0aGlzLmFkanVzdENhbGVuZGFyKHRoaXMuY2FsZW5kYXJzWzBdKTtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiYWRqdXN0Q2FsZW5kYXJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkanVzdENhbGVuZGFyKGNhbGVuZGFyKSB7XHJcbiAgICAgICAgaWYgKGNhbGVuZGFyLm1vbnRoIDwgMCkge1xyXG4gICAgICAgICAgY2FsZW5kYXIueWVhciAtPSBNYXRoLmNlaWwoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpO1xyXG4gICAgICAgICAgY2FsZW5kYXIubW9udGggKz0gMTI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjYWxlbmRhci5tb250aCA+IDExKSB7XHJcbiAgICAgICAgICBjYWxlbmRhci55ZWFyICs9IE1hdGguZmxvb3IoTWF0aC5hYnMoY2FsZW5kYXIubW9udGgpIC8gMTIpO1xyXG4gICAgICAgICAgY2FsZW5kYXIubW9udGggLT0gMTI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjYWxlbmRhcjtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwibmV4dE1vbnRoXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBuZXh0TW9udGgoKSB7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhcnNbMF0ubW9udGgrKztcclxuICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJwcmV2TW9udGhcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByZXZNb250aCgpIHtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aC0tO1xyXG4gICAgICAgIHRoaXMuYWRqdXN0Q2FsZW5kYXJzKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlbmRlclwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKHllYXIsIG1vbnRoLCByYW5kSWQpIHtcclxuICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICAgICAgbm93ID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZGF5cyA9IERhdGVwaWNrZXIuX2dldERheXNJbk1vbnRoKHllYXIsIG1vbnRoKSxcclxuICAgICAgICAgICAgYmVmb3JlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpLmdldERheSgpLFxyXG4gICAgICAgICAgICBkYXRhID0gW10sXHJcbiAgICAgICAgICAgIHJvdyA9IFtdO1xyXG4gICAgICAgIERhdGVwaWNrZXIuX3NldFRvU3RhcnRPZkRheShub3cpO1xyXG4gICAgICAgIGlmIChvcHRzLmZpcnN0RGF5ID4gMCkge1xyXG4gICAgICAgICAgYmVmb3JlIC09IG9wdHMuZmlyc3REYXk7XHJcbiAgICAgICAgICBpZiAoYmVmb3JlIDwgMCkge1xyXG4gICAgICAgICAgICBiZWZvcmUgKz0gNztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHByZXZpb3VzTW9udGggPSBtb250aCA9PT0gMCA/IDExIDogbW9udGggLSAxLFxyXG4gICAgICAgICAgICBuZXh0TW9udGggPSBtb250aCA9PT0gMTEgPyAwIDogbW9udGggKyAxLFxyXG4gICAgICAgICAgICB5ZWFyT2ZQcmV2aW91c01vbnRoID0gbW9udGggPT09IDAgPyB5ZWFyIC0gMSA6IHllYXIsXHJcbiAgICAgICAgICAgIHllYXJPZk5leHRNb250aCA9IG1vbnRoID09PSAxMSA/IHllYXIgKyAxIDogeWVhcixcclxuICAgICAgICAgICAgZGF5c0luUHJldmlvdXNNb250aCA9IERhdGVwaWNrZXIuX2dldERheXNJbk1vbnRoKHllYXJPZlByZXZpb3VzTW9udGgsIHByZXZpb3VzTW9udGgpO1xyXG4gICAgICAgIHZhciBjZWxscyA9IGRheXMgKyBiZWZvcmUsXHJcbiAgICAgICAgICAgIGFmdGVyID0gY2VsbHM7XHJcbiAgICAgICAgd2hpbGUgKGFmdGVyID4gNykge1xyXG4gICAgICAgICAgYWZ0ZXIgLT0gNztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2VsbHMgKz0gNyAtIGFmdGVyO1xyXG4gICAgICAgIHZhciBpc1dlZWtTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCByID0gMDsgaSA8IGNlbGxzOyBpKyspIHtcclxuICAgICAgICAgIHZhciBkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSArIChpIC0gYmVmb3JlKSksXHJcbiAgICAgICAgICAgICAgaXNTZWxlY3RlZCA9IERhdGVwaWNrZXIuX2lzRGF0ZSh0aGlzLmRhdGUpID8gRGF0ZXBpY2tlci5fY29tcGFyZURhdGVzKGRheSwgdGhpcy5kYXRlKSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIGlzVG9kYXkgPSBEYXRlcGlja2VyLl9jb21wYXJlRGF0ZXMoZGF5LCBub3cpLFxyXG4gICAgICAgICAgICAgIGhhc0V2ZW50ID0gb3B0cy5ldmVudHMuaW5kZXhPZihkYXkudG9EYXRlU3RyaW5nKCkpICE9PSAtMSA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgICAgICAgICBpc0VtcHR5ID0gaSA8IGJlZm9yZSB8fCBpID49IGRheXMgKyBiZWZvcmUsXHJcbiAgICAgICAgICAgICAgZGF5TnVtYmVyID0gMSArIChpIC0gYmVmb3JlKSxcclxuICAgICAgICAgICAgICBtb250aE51bWJlciA9IG1vbnRoLFxyXG4gICAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyLFxyXG4gICAgICAgICAgICAgIGlzU3RhcnRSYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBEYXRlcGlja2VyLl9jb21wYXJlRGF0ZXMob3B0cy5zdGFydFJhbmdlLCBkYXkpLFxyXG4gICAgICAgICAgICAgIGlzRW5kUmFuZ2UgPSBvcHRzLmVuZFJhbmdlICYmIERhdGVwaWNrZXIuX2NvbXBhcmVEYXRlcyhvcHRzLmVuZFJhbmdlLCBkYXkpLFxyXG4gICAgICAgICAgICAgIGlzSW5SYW5nZSA9IG9wdHMuc3RhcnRSYW5nZSAmJiBvcHRzLmVuZFJhbmdlICYmIG9wdHMuc3RhcnRSYW5nZSA8IGRheSAmJiBkYXkgPCBvcHRzLmVuZFJhbmdlLFxyXG4gICAgICAgICAgICAgIGlzRGlzYWJsZWQgPSBvcHRzLm1pbkRhdGUgJiYgZGF5IDwgb3B0cy5taW5EYXRlIHx8IG9wdHMubWF4RGF0ZSAmJiBkYXkgPiBvcHRzLm1heERhdGUgfHwgb3B0cy5kaXNhYmxlV2Vla2VuZHMgJiYgRGF0ZXBpY2tlci5faXNXZWVrZW5kKGRheSkgfHwgb3B0cy5kaXNhYmxlRGF5Rm4gJiYgb3B0cy5kaXNhYmxlRGF5Rm4oZGF5KTtcclxuXHJcbiAgICAgICAgICBpZiAoaXNFbXB0eSkge1xyXG4gICAgICAgICAgICBpZiAoaSA8IGJlZm9yZSkge1xyXG4gICAgICAgICAgICAgIGRheU51bWJlciA9IGRheXNJblByZXZpb3VzTW9udGggKyBkYXlOdW1iZXI7XHJcbiAgICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBwcmV2aW91c01vbnRoO1xyXG4gICAgICAgICAgICAgIHllYXJOdW1iZXIgPSB5ZWFyT2ZQcmV2aW91c01vbnRoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGRheU51bWJlciA9IGRheU51bWJlciAtIGRheXM7XHJcbiAgICAgICAgICAgICAgbW9udGhOdW1iZXIgPSBuZXh0TW9udGg7XHJcbiAgICAgICAgICAgICAgeWVhck51bWJlciA9IHllYXJPZk5leHRNb250aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHZhciBkYXlDb25maWcgPSB7XHJcbiAgICAgICAgICAgIGRheTogZGF5TnVtYmVyLFxyXG4gICAgICAgICAgICBtb250aDogbW9udGhOdW1iZXIsXHJcbiAgICAgICAgICAgIHllYXI6IHllYXJOdW1iZXIsXHJcbiAgICAgICAgICAgIGhhc0V2ZW50OiBoYXNFdmVudCxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZDogaXNTZWxlY3RlZCxcclxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSxcclxuICAgICAgICAgICAgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCxcclxuICAgICAgICAgICAgaXNFbXB0eTogaXNFbXB0eSxcclxuICAgICAgICAgICAgaXNTdGFydFJhbmdlOiBpc1N0YXJ0UmFuZ2UsXHJcbiAgICAgICAgICAgIGlzRW5kUmFuZ2U6IGlzRW5kUmFuZ2UsXHJcbiAgICAgICAgICAgIGlzSW5SYW5nZTogaXNJblJhbmdlLFxyXG4gICAgICAgICAgICBzaG93RGF5c0luTmV4dEFuZFByZXZpb3VzTW9udGhzOiBvcHRzLnNob3dEYXlzSW5OZXh0QW5kUHJldmlvdXNNb250aHNcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcm93LnB1c2godGhpcy5yZW5kZXJEYXkoZGF5Q29uZmlnKSk7XHJcblxyXG4gICAgICAgICAgaWYgKCsrciA9PT0gNykge1xyXG4gICAgICAgICAgICBkYXRhLnB1c2godGhpcy5yZW5kZXJSb3cocm93LCBvcHRzLmlzUlRMLCBpc1dlZWtTZWxlY3RlZCkpO1xyXG4gICAgICAgICAgICByb3cgPSBbXTtcclxuICAgICAgICAgICAgciA9IDA7XHJcbiAgICAgICAgICAgIGlzV2Vla1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclRhYmxlKG9wdHMsIGRhdGEsIHJhbmRJZCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlbmRlckRheVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyRGF5KG9wdHMpIHtcclxuICAgICAgICB2YXIgYXJyID0gW107XHJcbiAgICAgICAgdmFyIGFyaWFTZWxlY3RlZCA9ICdmYWxzZSc7XHJcbiAgICAgICAgaWYgKG9wdHMuaXNFbXB0eSkge1xyXG4gICAgICAgICAgaWYgKG9wdHMuc2hvd0RheXNJbk5leHRBbmRQcmV2aW91c01vbnRocykge1xyXG4gICAgICAgICAgICBhcnIucHVzaCgnaXMtb3V0c2lkZS1jdXJyZW50LW1vbnRoJyk7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKCdpcy1zZWxlY3Rpb24tZGlzYWJsZWQnKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnPHRkIGNsYXNzPVwiaXMtZW1wdHlcIj48L3RkPic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRzLmlzRGlzYWJsZWQpIHtcclxuICAgICAgICAgIGFyci5wdXNoKCdpcy1kaXNhYmxlZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdHMuaXNUb2RheSkge1xyXG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXRvZGF5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRzLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgIGFyci5wdXNoKCdpcy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgYXJpYVNlbGVjdGVkID0gJ3RydWUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0cy5oYXNFdmVudCkge1xyXG4gICAgICAgICAgYXJyLnB1c2goJ2hhcy1ldmVudCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0cy5pc0luUmFuZ2UpIHtcclxuICAgICAgICAgIGFyci5wdXNoKCdpcy1pbnJhbmdlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRzLmlzU3RhcnRSYW5nZSkge1xyXG4gICAgICAgICAgYXJyLnB1c2goJ2lzLXN0YXJ0cmFuZ2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdHMuaXNFbmRSYW5nZSkge1xyXG4gICAgICAgICAgYXJyLnB1c2goJ2lzLWVuZHJhbmdlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBcIjx0ZCBkYXRhLWRheT1cXFwiXCIgKyBvcHRzLmRheSArIFwiXFxcIiBjbGFzcz1cXFwiXCIgKyBhcnIuam9pbignICcpICsgXCJcXFwiIGFyaWEtc2VsZWN0ZWQ9XFxcIlwiICsgYXJpYVNlbGVjdGVkICsgXCJcXFwiPlwiICsgKFwiPGJ1dHRvbiBjbGFzcz1cXFwiZGF0ZXBpY2tlci1kYXktYnV0dG9uXFxcIiB0eXBlPVxcXCJidXR0b25cXFwiIGRhdGEteWVhcj1cXFwiXCIgKyBvcHRzLnllYXIgKyBcIlxcXCIgZGF0YS1tb250aD1cXFwiXCIgKyBvcHRzLm1vbnRoICsgXCJcXFwiIGRhdGEtZGF5PVxcXCJcIiArIG9wdHMuZGF5ICsgXCJcXFwiPlwiICsgb3B0cy5kYXkgKyBcIjwvYnV0dG9uPlwiKSArICc8L3RkPic7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlbmRlclJvd1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyUm93KGRheXMsIGlzUlRMLCBpc1Jvd1NlbGVjdGVkKSB7XHJcbiAgICAgICAgcmV0dXJuICc8dHIgY2xhc3M9XCJkYXRlcGlja2VyLXJvdycgKyAoaXNSb3dTZWxlY3RlZCA/ICcgaXMtc2VsZWN0ZWQnIDogJycpICsgJ1wiPicgKyAoaXNSVEwgPyBkYXlzLnJldmVyc2UoKSA6IGRheXMpLmpvaW4oJycpICsgJzwvdHI+JztcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwicmVuZGVyVGFibGVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclRhYmxlKG9wdHMsIGRhdGEsIHJhbmRJZCkge1xyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItdGFibGUtd3JhcHBlclwiPjx0YWJsZSBjZWxscGFkZGluZz1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIiBjbGFzcz1cImRhdGVwaWNrZXItdGFibGVcIiByb2xlPVwiZ3JpZFwiIGFyaWEtbGFiZWxsZWRieT1cIicgKyByYW5kSWQgKyAnXCI+JyArIHRoaXMucmVuZGVySGVhZChvcHRzKSArIHRoaXMucmVuZGVyQm9keShkYXRhKSArICc8L3RhYmxlPjwvZGl2Pic7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlbmRlckhlYWRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlckhlYWQob3B0cykge1xyXG4gICAgICAgIHZhciBpID0gdm9pZCAwLFxyXG4gICAgICAgICAgICBhcnIgPSBbXTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICBhcnIucHVzaChcIjx0aCBzY29wZT1cXFwiY29sXFxcIj48YWJiciB0aXRsZT1cXFwiXCIgKyB0aGlzLnJlbmRlckRheU5hbWUob3B0cywgaSkgKyBcIlxcXCI+XCIgKyB0aGlzLnJlbmRlckRheU5hbWUob3B0cywgaSwgdHJ1ZSkgKyBcIjwvYWJicj48L3RoPlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8dGhlYWQ+PHRyPicgKyAob3B0cy5pc1JUTCA/IGFyci5yZXZlcnNlKCkgOiBhcnIpLmpvaW4oJycpICsgJzwvdHI+PC90aGVhZD4nO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJyZW5kZXJCb2R5XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJCb2R5KHJvd3MpIHtcclxuICAgICAgICByZXR1cm4gJzx0Ym9keT4nICsgcm93cy5qb2luKCcnKSArICc8L3Rib2R5Pic7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlbmRlclRpdGxlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJUaXRsZShpbnN0YW5jZSwgYywgeWVhciwgbW9udGgsIHJlZlllYXIsIHJhbmRJZCkge1xyXG4gICAgICAgIHZhciBpID0gdm9pZCAwLFxyXG4gICAgICAgICAgICBqID0gdm9pZCAwLFxyXG4gICAgICAgICAgICBhcnIgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGlzTWluWWVhciA9IHllYXIgPT09IG9wdHMubWluWWVhcixcclxuICAgICAgICAgICAgaXNNYXhZZWFyID0geWVhciA9PT0gb3B0cy5tYXhZZWFyLFxyXG4gICAgICAgICAgICBodG1sID0gJzxkaXYgaWQ9XCInICsgcmFuZElkICsgJ1wiIGNsYXNzPVwiZGF0ZXBpY2tlci1jb250cm9sc1wiIHJvbGU9XCJoZWFkaW5nXCIgYXJpYS1saXZlPVwiYXNzZXJ0aXZlXCI+JyxcclxuICAgICAgICAgICAgbW9udGhIdG1sID0gdm9pZCAwLFxyXG4gICAgICAgICAgICB5ZWFySHRtbCA9IHZvaWQgMCxcclxuICAgICAgICAgICAgcHJldiA9IHRydWUsXHJcbiAgICAgICAgICAgIG5leHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGFyciA9IFtdLCBpID0gMDsgaSA8IDEyOyBpKyspIHtcclxuICAgICAgICAgIGFyci5wdXNoKCc8b3B0aW9uIHZhbHVlPVwiJyArICh5ZWFyID09PSByZWZZZWFyID8gaSAtIGMgOiAxMiArIGkgLSBjKSArICdcIicgKyAoaSA9PT0gbW9udGggPyAnIHNlbGVjdGVkPVwic2VsZWN0ZWRcIicgOiAnJykgKyAoaXNNaW5ZZWFyICYmIGkgPCBvcHRzLm1pbk1vbnRoIHx8IGlzTWF4WWVhciAmJiBpID4gb3B0cy5tYXhNb250aCA/ICdkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycpICsgJz4nICsgb3B0cy5pMThuLm1vbnRoc1tpXSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vbnRoSHRtbCA9ICc8c2VsZWN0IGNsYXNzPVwiZGF0ZXBpY2tlci1zZWxlY3Qgb3JpZy1zZWxlY3QtbW9udGhcIiB0YWJpbmRleD1cIi0xXCI+JyArIGFyci5qb2luKCcnKSArICc8L3NlbGVjdD4nO1xyXG5cclxuICAgICAgICBpZiAoJC5pc0FycmF5KG9wdHMueWVhclJhbmdlKSkge1xyXG4gICAgICAgICAgaSA9IG9wdHMueWVhclJhbmdlWzBdO1xyXG4gICAgICAgICAgaiA9IG9wdHMueWVhclJhbmdlWzFdICsgMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaSA9IHllYXIgLSBvcHRzLnllYXJSYW5nZTtcclxuICAgICAgICAgIGogPSAxICsgeWVhciArIG9wdHMueWVhclJhbmdlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChhcnIgPSBbXTsgaSA8IGogJiYgaSA8PSBvcHRzLm1heFllYXI7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGkgPj0gb3B0cy5taW5ZZWFyKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKFwiPG9wdGlvbiB2YWx1ZT1cXFwiXCIgKyBpICsgXCJcXFwiIFwiICsgKGkgPT09IHllYXIgPyAnc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArIFwiPlwiICsgaSArIFwiPC9vcHRpb24+XCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeWVhckh0bWwgPSBcIjxzZWxlY3QgY2xhc3M9XFxcImRhdGVwaWNrZXItc2VsZWN0IG9yaWctc2VsZWN0LXllYXJcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+XCIgKyBhcnIuam9pbignJykgKyBcIjwvc2VsZWN0PlwiO1xyXG5cclxuICAgICAgICB2YXIgbGVmdEFycm93ID0gJzxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIyNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNMTUuNDEgMTYuMDlsLTQuNTgtNC41OSA0LjU4LTQuNTlMMTQgNS41bC02IDYgNiA2elwiLz48cGF0aCBkPVwiTTAtLjVoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiLz48L3N2Zz4nO1xyXG4gICAgICAgIGh0bWwgKz0gXCI8YnV0dG9uIGNsYXNzPVxcXCJtb250aC1wcmV2XCIgKyAocHJldiA/ICcnIDogJyBpcy1kaXNhYmxlZCcpICsgXCJcXFwiIHR5cGU9XFxcImJ1dHRvblxcXCI+XCIgKyBsZWZ0QXJyb3cgKyBcIjwvYnV0dG9uPlwiO1xyXG5cclxuICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic2VsZWN0cy1jb250YWluZXJcIj4nO1xyXG4gICAgICAgIGlmIChvcHRzLnNob3dNb250aEFmdGVyWWVhcikge1xyXG4gICAgICAgICAgaHRtbCArPSB5ZWFySHRtbCArIG1vbnRoSHRtbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaHRtbCArPSBtb250aEh0bWwgKyB5ZWFySHRtbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgaWYgKGlzTWluWWVhciAmJiAobW9udGggPT09IDAgfHwgb3B0cy5taW5Nb250aCA+PSBtb250aCkpIHtcclxuICAgICAgICAgIHByZXYgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc01heFllYXIgJiYgKG1vbnRoID09PSAxMSB8fCBvcHRzLm1heE1vbnRoIDw9IG1vbnRoKSkge1xyXG4gICAgICAgICAgbmV4dCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHJpZ2h0QXJyb3cgPSAnPHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIk04LjU5IDE2LjM0bDQuNTgtNC41OS00LjU4LTQuNTlMMTAgNS43NWw2IDYtNiA2elwiLz48cGF0aCBkPVwiTTAtLjI1aDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+PC9zdmc+JztcclxuICAgICAgICBodG1sICs9IFwiPGJ1dHRvbiBjbGFzcz1cXFwibW9udGgtbmV4dFwiICsgKG5leHQgPyAnJyA6ICcgaXMtZGlzYWJsZWQnKSArIFwiXFxcIiB0eXBlPVxcXCJidXR0b25cXFwiPlwiICsgcmlnaHRBcnJvdyArIFwiPC9idXR0b24+XCI7XHJcblxyXG4gICAgICAgIHJldHVybiBodG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogcmVmcmVzaCB0aGUgSFRNTFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkcmF3XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkcmF3KGZvcmNlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzT3BlbiAmJiAhZm9yY2UpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIG1pblllYXIgPSBvcHRzLm1pblllYXIsXHJcbiAgICAgICAgICAgIG1heFllYXIgPSBvcHRzLm1heFllYXIsXHJcbiAgICAgICAgICAgIG1pbk1vbnRoID0gb3B0cy5taW5Nb250aCxcclxuICAgICAgICAgICAgbWF4TW9udGggPSBvcHRzLm1heE1vbnRoLFxyXG4gICAgICAgICAgICBodG1sID0gJycsXHJcbiAgICAgICAgICAgIHJhbmRJZCA9IHZvaWQgMDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3kgPD0gbWluWWVhcikge1xyXG4gICAgICAgICAgdGhpcy5feSA9IG1pblllYXI7XHJcbiAgICAgICAgICBpZiAoIWlzTmFOKG1pbk1vbnRoKSAmJiB0aGlzLl9tIDwgbWluTW9udGgpIHtcclxuICAgICAgICAgICAgdGhpcy5fbSA9IG1pbk1vbnRoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5feSA+PSBtYXhZZWFyKSB7XHJcbiAgICAgICAgICB0aGlzLl95ID0gbWF4WWVhcjtcclxuICAgICAgICAgIGlmICghaXNOYU4obWF4TW9udGgpICYmIHRoaXMuX20gPiBtYXhNb250aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tID0gbWF4TW9udGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByYW5kSWQgPSAnZGF0ZXBpY2tlci10aXRsZS0nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikucmVwbGFjZSgvW15hLXpdKy9nLCAnJykuc3Vic3RyKDAsIDIpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IDE7IGMrKykge1xyXG4gICAgICAgICAgdGhpcy5fcmVuZGVyRGF0ZURpc3BsYXkoKTtcclxuICAgICAgICAgIGh0bWwgKz0gdGhpcy5yZW5kZXJUaXRsZSh0aGlzLCBjLCB0aGlzLmNhbGVuZGFyc1tjXS55ZWFyLCB0aGlzLmNhbGVuZGFyc1tjXS5tb250aCwgdGhpcy5jYWxlbmRhcnNbMF0ueWVhciwgcmFuZElkKSArIHRoaXMucmVuZGVyKHRoaXMuY2FsZW5kYXJzW2NdLnllYXIsIHRoaXMuY2FsZW5kYXJzW2NdLm1vbnRoLCByYW5kSWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kZXN0cm95U2VsZWN0cygpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGVuZGFyRWwuaW5uZXJIVE1MID0gaHRtbDtcclxuXHJcbiAgICAgICAgLy8gSW5pdCBNYXRlcmlhbGl6ZSBTZWxlY3RcclxuICAgICAgICB2YXIgeWVhclNlbGVjdCA9IHRoaXMuY2FsZW5kYXJFbC5xdWVyeVNlbGVjdG9yKCcub3JpZy1zZWxlY3QteWVhcicpO1xyXG4gICAgICAgIHZhciBtb250aFNlbGVjdCA9IHRoaXMuY2FsZW5kYXJFbC5xdWVyeVNlbGVjdG9yKCcub3JpZy1zZWxlY3QtbW9udGgnKTtcclxuICAgICAgICBNLkZvcm1TZWxlY3QuaW5pdCh5ZWFyU2VsZWN0LCB7XHJcbiAgICAgICAgICBjbGFzc2VzOiAnc2VsZWN0LXllYXInLFxyXG4gICAgICAgICAgZHJvcGRvd25PcHRpb25zOiB7IGNvbnRhaW5lcjogZG9jdW1lbnQuYm9keSwgY29uc3RyYWluV2lkdGg6IGZhbHNlIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNLkZvcm1TZWxlY3QuaW5pdChtb250aFNlbGVjdCwge1xyXG4gICAgICAgICAgY2xhc3NlczogJ3NlbGVjdC1tb250aCcsXHJcbiAgICAgICAgICBkcm9wZG93bk9wdGlvbnM6IHsgY29udGFpbmVyOiBkb2N1bWVudC5ib2R5LCBjb25zdHJhaW5XaWR0aDogZmFsc2UgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgY2hhbmdlIGhhbmRsZXJzIGZvciBzZWxlY3RcclxuICAgICAgICB5ZWFyU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZVllYXJDaGFuZ2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgbW9udGhTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlTW9udGhDaGFuZ2UuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uRHJhdyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uRHJhdyh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlSW5wdXRDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUlucHV0Q2hhbmdlQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dENoYW5nZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNhbGVuZGFyQ2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZUNhbGVuZGFyQ2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9maW5pc2hTZWxlY3Rpb25Cb3VuZCA9IHRoaXMuX2ZpbmlzaFNlbGVjdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZU1vbnRoQ2hhbmdlID0gdGhpcy5faGFuZGxlTW9udGhDaGFuZ2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9jbG9zZUJvdW5kID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9oYW5kbGVJbnB1dENoYW5nZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDYWxlbmRhckNsaWNrQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZG9uZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2ZpbmlzaFNlbGVjdGlvbkJvdW5kKTtcclxuICAgICAgICB0aGlzLmNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2Nsb3NlQm91bmQpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dDbGVhckJ0bikge1xyXG4gICAgICAgICAgdGhpcy5faGFuZGxlQ2xlYXJDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlQ2xlYXJDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgdGhpcy5jbGVhckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUNsZWFyQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBWYXJpYWJsZXNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cFZhcmlhYmxlcygpIHtcclxuICAgICAgICB2YXIgX3RoaXM1NiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuJG1vZGFsRWwgPSAkKERhdGVwaWNrZXIuX3RlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLm1vZGFsRWwgPSB0aGlzLiRtb2RhbEVsWzBdO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGVuZGFyRWwgPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLmRhdGVwaWNrZXItY2FsZW5kYXInKTtcclxuXHJcbiAgICAgICAgdGhpcy55ZWFyVGV4dEVsID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy55ZWFyLXRleHQnKTtcclxuICAgICAgICB0aGlzLmRhdGVUZXh0RWwgPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLmRhdGUtdGV4dCcpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd0NsZWFyQnRuKSB7XHJcbiAgICAgICAgICB0aGlzLmNsZWFyQnRuID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy5kYXRlcGlja2VyLWNsZWFyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZG9uZUJ0biA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcuZGF0ZXBpY2tlci1kb25lJyk7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxCdG4gPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLmRhdGVwaWNrZXItY2FuY2VsJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZm9ybWF0cyA9IHtcclxuICAgICAgICAgIGQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF90aGlzNTYuZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGQgPSBfdGhpczU2LmRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gKGQgPCAxMCA/ICcwJyA6ICcnKSArIGQ7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGRkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpczU2Lm9wdGlvbnMuaTE4bi53ZWVrZGF5c1Nob3J0W190aGlzNTYuZGF0ZS5nZXREYXkoKV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGRkZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM1Ni5vcHRpb25zLmkxOG4ud2Vla2RheXNbX3RoaXM1Ni5kYXRlLmdldERheSgpXTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBtOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpczU2LmRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbW06IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG0gPSBfdGhpczU2LmRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgICAgIHJldHVybiAobSA8IDEwID8gJzAnIDogJycpICsgbTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBtbW06IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF90aGlzNTYub3B0aW9ucy5pMThuLm1vbnRoc1Nob3J0W190aGlzNTYuZGF0ZS5nZXRNb250aCgpXTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBtbW1tOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpczU2Lm9wdGlvbnMuaTE4bi5tb250aHNbX3RoaXM1Ni5kYXRlLmdldE1vbnRoKCldO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHl5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoJycgKyBfdGhpczU2LmRhdGUuZ2V0RnVsbFllYXIoKSkuc2xpY2UoMik7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeXl5eTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM1Ni5kYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5faGFuZGxlSW5wdXRDaGFuZ2VCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhckVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlQ2FsZW5kYXJDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUlucHV0Q2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVJbnB1dENsaWNrKCkge1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlSW5wdXRLZXlkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5wdXRLZXlkb3duKGUpIHtcclxuICAgICAgICBpZiAoZS53aGljaCA9PT0gTS5rZXlzLkVOVEVSKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDYWxlbmRhckNsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ2FsZW5kYXJDbGljayhlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICBpZiAoISR0YXJnZXQuaGFzQ2xhc3MoJ2lzLWRpc2FibGVkJykpIHtcclxuICAgICAgICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKCdkYXRlcGlja2VyLWRheS1idXR0b24nKSAmJiAhJHRhcmdldC5oYXNDbGFzcygnaXMtZW1wdHknKSAmJiAhJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldERhdGUobmV3IERhdGUoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXllYXInKSwgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vbnRoJyksIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kYXknKSkpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9DbG9zZSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2ZpbmlzaFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCR0YXJnZXQuY2xvc2VzdCgnLm1vbnRoLXByZXYnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2TW9udGgoKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoJHRhcmdldC5jbG9zZXN0KCcubW9udGgtbmV4dCcpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRNb250aCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUNsZWFyQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVDbGVhckNsaWNrKCkge1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKCk7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlTW9udGhDaGFuZ2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVNb250aENoYW5nZShlKSB7XHJcbiAgICAgICAgdGhpcy5nb3RvTW9udGgoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlWWVhckNoYW5nZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVllYXJDaGFuZ2UoZSkge1xyXG4gICAgICAgIHRoaXMuZ290b1llYXIoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogY2hhbmdlIHZpZXcgdG8gYSBzcGVjaWZpYyBtb250aCAoemVyby1pbmRleCwgZS5nLiAwOiBKYW51YXJ5KVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnb3RvTW9udGhcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdvdG9Nb250aChtb250aCkge1xyXG4gICAgICAgIGlmICghaXNOYU4obW9udGgpKSB7XHJcbiAgICAgICAgICB0aGlzLmNhbGVuZGFyc1swXS5tb250aCA9IHBhcnNlSW50KG1vbnRoLCAxMCk7XHJcbiAgICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGNoYW5nZSB2aWV3IHRvIGEgc3BlY2lmaWMgZnVsbCB5ZWFyIChlLmcuIFwiMjAxMlwiKVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnb3RvWWVhclwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ290b1llYXIoeWVhcikge1xyXG4gICAgICAgIGlmICghaXNOYU4oeWVhcikpIHtcclxuICAgICAgICAgIHRoaXMuY2FsZW5kYXJzWzBdLnllYXIgPSBwYXJzZUludCh5ZWFyLCAxMCk7XHJcbiAgICAgICAgICB0aGlzLmFkanVzdENhbGVuZGFycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUlucHV0Q2hhbmdlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5wdXRDaGFuZ2UoZSkge1xyXG4gICAgICAgIHZhciBkYXRlID0gdm9pZCAwO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IGNoYW5nZSBldmVudCBmcm9tIGJlaW5nIGZpcmVkIHdoZW4gdHJpZ2dlcmVkIGJ5IHRoZSBwbHVnaW5cclxuICAgICAgICBpZiAoZS5maXJlZEJ5ID09PSB0aGlzKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyc2UpIHtcclxuICAgICAgICAgIGRhdGUgPSB0aGlzLm9wdGlvbnMucGFyc2UodGhpcy5lbC52YWx1ZSwgdGhpcy5vcHRpb25zLmZvcm1hdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHRoaXMuZWwudmFsdWUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICAgIHRoaXMuc2V0RGF0ZShkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlbmRlckRheU5hbWVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlckRheU5hbWUob3B0cywgZGF5LCBhYmJyKSB7XHJcbiAgICAgICAgZGF5ICs9IG9wdHMuZmlyc3REYXk7XHJcbiAgICAgICAgd2hpbGUgKGRheSA+PSA3KSB7XHJcbiAgICAgICAgICBkYXkgLT0gNztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFiYnIgPyBvcHRzLmkxOG4ud2Vla2RheXNBYmJyZXZbZGF5XSA6IG9wdHMuaTE4bi53ZWVrZGF5c1tkYXldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0IGlucHV0IHZhbHVlIHRvIHRoZSBzZWxlY3RlZCBkYXRlIGFuZCBjbG9zZSBEYXRlcGlja2VyXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9maW5pc2hTZWxlY3Rpb25cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9maW5pc2hTZWxlY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXRJbnB1dFZhbHVlKCk7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3BlbiBEYXRlcGlja2VyXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIm9wZW5cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25PcGVuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25PcGVuLmNhbGwodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgICAgIHRoaXMubW9kYWwub3BlbigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2xvc2UgRGF0ZXBpY2tlclxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJjbG9zZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNsb3NlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25DbG9zZS5jYWxsKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1vZGFsLmNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChEYXRlcGlja2VyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGF0ZXBpY2tlciksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9pc0RhdGVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pc0RhdGUob2JqKSB7XHJcbiAgICAgICAgcmV0dXJuICgvRGF0ZS8udGVzdChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgJiYgIWlzTmFOKG9iai5nZXRUaW1lKCkpXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2lzV2Vla2VuZFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2lzV2Vla2VuZChkYXRlKSB7XHJcbiAgICAgICAgdmFyIGRheSA9IGRhdGUuZ2V0RGF5KCk7XHJcbiAgICAgICAgcmV0dXJuIGRheSA9PT0gMCB8fCBkYXkgPT09IDY7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXRUb1N0YXJ0T2ZEYXlcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRUb1N0YXJ0T2ZEYXkoZGF0ZSkge1xyXG4gICAgICAgIGlmIChEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9nZXREYXlzSW5Nb250aFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2dldERheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XHJcbiAgICAgICAgcmV0dXJuIFszMSwgRGF0ZXBpY2tlci5faXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXVttb250aF07XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9pc0xlYXBZZWFyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaXNMZWFwWWVhcih5ZWFyKSB7XHJcbiAgICAgICAgLy8gc29sdXRpb24gYnkgTWF0dGkgVmlya2t1bmVuOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS80ODgxOTUxXHJcbiAgICAgICAgcmV0dXJuIHllYXIgJSA0ID09PSAwICYmIHllYXIgJSAxMDAgIT09IDAgfHwgeWVhciAlIDQwMCA9PT0gMDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NvbXBhcmVEYXRlc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NvbXBhcmVEYXRlcyhhLCBiKSB7XHJcbiAgICAgICAgLy8gd2VhayBkYXRlIGNvbXBhcmlzb24gKHVzZSBzZXRUb1N0YXJ0T2ZEYXkoZGF0ZSkgdG8gZW5zdXJlIGNvcnJlY3QgcmVzdWx0KVxyXG4gICAgICAgIHJldHVybiBhLmdldFRpbWUoKSA9PT0gYi5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXRUb1N0YXJ0T2ZEYXlcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRUb1N0YXJ0T2ZEYXkoZGF0ZSkge1xyXG4gICAgICAgIGlmIChEYXRlcGlja2VyLl9pc0RhdGUoZGF0ZSkpIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9EYXRlcGlja2VyO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIERhdGVwaWNrZXI7XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICBEYXRlcGlja2VyLl90ZW1wbGF0ZSA9IFsnPGRpdiBjbGFzcz0gXCJtb2RhbCBkYXRlcGlja2VyLW1vZGFsXCI+JywgJzxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50IGRhdGVwaWNrZXItY29udGFpbmVyXCI+JywgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLWRhdGUtZGlzcGxheVwiPicsICc8c3BhbiBjbGFzcz1cInllYXItdGV4dFwiPjwvc3Bhbj4nLCAnPHNwYW4gY2xhc3M9XCJkYXRlLXRleHRcIj48L3NwYW4+JywgJzwvZGl2PicsICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1jYWxlbmRhci1jb250YWluZXJcIj4nLCAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItY2FsZW5kYXJcIj48L2Rpdj4nLCAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItZm9vdGVyXCI+JywgJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCBkYXRlcGlja2VyLWNsZWFyIHdhdmVzLWVmZmVjdFwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj4nLCAnPGRpdiBjbGFzcz1cImNvbmZpcm1hdGlvbi1idG5zXCI+JywgJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCBkYXRlcGlja2VyLWNhbmNlbCB3YXZlcy1lZmZlY3RcIiB0eXBlPVwiYnV0dG9uXCI+PC9idXR0b24+JywgJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCBkYXRlcGlja2VyLWRvbmUgd2F2ZXMtZWZmZWN0XCIgdHlwZT1cImJ1dHRvblwiPjwvYnV0dG9uPicsICc8L2Rpdj4nLCAnPC9kaXY+JywgJzwvZGl2PicsICc8L2Rpdj4nLCAnPC9kaXY+J10uam9pbignJyk7XHJcblxyXG4gIE0uRGF0ZXBpY2tlciA9IERhdGVwaWNrZXI7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihEYXRlcGlja2VyLCAnZGF0ZXBpY2tlcicsICdNX0RhdGVwaWNrZXInKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG47KGZ1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgX2RlZmF1bHRzID0ge1xyXG4gICAgZGlhbFJhZGl1czogMTM1LFxyXG4gICAgb3V0ZXJSYWRpdXM6IDEwNSxcclxuICAgIGlubmVyUmFkaXVzOiA3MCxcclxuICAgIHRpY2tSYWRpdXM6IDIwLFxyXG4gICAgZHVyYXRpb246IDM1MCxcclxuICAgIGNvbnRhaW5lcjogbnVsbCxcclxuICAgIGRlZmF1bHRUaW1lOiAnbm93JywgLy8gZGVmYXVsdCB0aW1lLCAnbm93JyBvciAnMTM6MTQnIGUuZy5cclxuICAgIGZyb21Ob3c6IDAsIC8vIE1pbGxpc2Vjb25kIG9mZnNldCBmcm9tIHRoZSBkZWZhdWx0VGltZVxyXG4gICAgc2hvd0NsZWFyQnRuOiBmYWxzZSxcclxuXHJcbiAgICAvLyBpbnRlcm5hdGlvbmFsaXphdGlvblxyXG4gICAgaTE4bjoge1xyXG4gICAgICBjYW5jZWw6ICdDYW5jZWwnLFxyXG4gICAgICBjbGVhcjogJ0NsZWFyJyxcclxuICAgICAgZG9uZTogJ09rJ1xyXG4gICAgfSxcclxuXHJcbiAgICBhdXRvQ2xvc2U6IGZhbHNlLCAvLyBhdXRvIGNsb3NlIHdoZW4gbWludXRlIGlzIHNlbGVjdGVkXHJcbiAgICB0d2VsdmVIb3VyOiB0cnVlLCAvLyBjaGFuZ2UgdG8gMTIgaG91ciBBTS9QTSBjbG9jayBmcm9tIDI0IGhvdXJcclxuICAgIHZpYnJhdGU6IHRydWUsIC8vIHZpYnJhdGUgdGhlIGRldmljZSB3aGVuIGRyYWdnaW5nIGNsb2NrIGhhbmRcclxuXHJcbiAgICAvLyBDYWxsYmFja3NcclxuICAgIG9uT3BlblN0YXJ0OiBudWxsLFxyXG4gICAgb25PcGVuRW5kOiBudWxsLFxyXG4gICAgb25DbG9zZVN0YXJ0OiBudWxsLFxyXG4gICAgb25DbG9zZUVuZDogbnVsbCxcclxuICAgIG9uU2VsZWN0OiBudWxsXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIFRpbWVwaWNrZXIgPSBmdW5jdGlvbiAoX0NvbXBvbmVudDE2KSB7XHJcbiAgICBfaW5oZXJpdHMoVGltZXBpY2tlciwgX0NvbXBvbmVudDE2KTtcclxuXHJcbiAgICBmdW5jdGlvbiBUaW1lcGlja2VyKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUaW1lcGlja2VyKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczU3ID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRpbWVwaWNrZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUaW1lcGlja2VyKSkuY2FsbCh0aGlzLCBUaW1lcGlja2VyLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXM1Ny5lbC5NX1RpbWVwaWNrZXIgPSBfdGhpczU3O1xyXG5cclxuICAgICAgX3RoaXM1Ny5vcHRpb25zID0gJC5leHRlbmQoe30sIFRpbWVwaWNrZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgX3RoaXM1Ny5pZCA9IE0uZ3VpZCgpO1xyXG4gICAgICBfdGhpczU3Ll9pbnNlcnRIVE1MSW50b0RPTSgpO1xyXG4gICAgICBfdGhpczU3Ll9zZXR1cE1vZGFsKCk7XHJcbiAgICAgIF90aGlzNTcuX3NldHVwVmFyaWFibGVzKCk7XHJcbiAgICAgIF90aGlzNTcuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG5cclxuICAgICAgX3RoaXM1Ny5fY2xvY2tTZXR1cCgpO1xyXG4gICAgICBfdGhpczU3Ll9waWNrZXJTZXR1cCgpO1xyXG4gICAgICByZXR1cm4gX3RoaXM1NztcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoVGltZXBpY2tlciwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5tb2RhbC5kZXN0cm95KCk7XHJcbiAgICAgICAgJCh0aGlzLm1vZGFsRWwpLnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuTV9UaW1lcGlja2VyID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVJbnB1dEtleWRvd25Cb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZUlucHV0Q2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVDbG9ja0NsaWNrU3RhcnRCb3VuZCA9IHRoaXMuX2hhbmRsZUNsb2NrQ2xpY2tTdGFydC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQgPSB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tFbmRCb3VuZCA9IHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tFbmQuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlSW5wdXRLZXlkb3duQm91bmQpO1xyXG4gICAgICAgIHRoaXMucGxhdGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5faGFuZGxlQ2xvY2tDbGlja1N0YXJ0Qm91bmQpO1xyXG4gICAgICAgIHRoaXMucGxhdGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX2hhbmRsZUNsb2NrQ2xpY2tTdGFydEJvdW5kKTtcclxuXHJcbiAgICAgICAgJCh0aGlzLnNwYW5Ib3Vycykub24oJ2NsaWNrJywgdGhpcy5zaG93Vmlldy5iaW5kKHRoaXMsICdob3VycycpKTtcclxuICAgICAgICAkKHRoaXMuc3Bhbk1pbnV0ZXMpLm9uKCdjbGljaycsIHRoaXMuc2hvd1ZpZXcuYmluZCh0aGlzLCAnbWludXRlcycpKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUlucHV0S2V5ZG93bkJvdW5kKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUlucHV0Q2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVJbnB1dENsaWNrKCkge1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlSW5wdXRLZXlkb3duXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5wdXRLZXlkb3duKGUpIHtcclxuICAgICAgICBpZiAoZS53aGljaCA9PT0gTS5rZXlzLkVOVEVSKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDbG9ja0NsaWNrU3RhcnRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVDbG9ja0NsaWNrU3RhcnQoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgY2xvY2tQbGF0ZUJSID0gdGhpcy5wbGF0ZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0geyB4OiBjbG9ja1BsYXRlQlIubGVmdCwgeTogY2xvY2tQbGF0ZUJSLnRvcCB9O1xyXG5cclxuICAgICAgICB0aGlzLngwID0gb2Zmc2V0LnggKyB0aGlzLm9wdGlvbnMuZGlhbFJhZGl1cztcclxuICAgICAgICB0aGlzLnkwID0gb2Zmc2V0LnkgKyB0aGlzLm9wdGlvbnMuZGlhbFJhZGl1cztcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGNsaWNrUG9zID0gVGltZXBpY2tlci5fUG9zKGUpO1xyXG4gICAgICAgIHRoaXMuZHggPSBjbGlja1Bvcy54IC0gdGhpcy54MDtcclxuICAgICAgICB0aGlzLmR5ID0gY2xpY2tQb3MueSAtIHRoaXMueTA7XHJcblxyXG4gICAgICAgIC8vIFNldCBjbG9jayBoYW5kc1xyXG4gICAgICAgIHRoaXMuc2V0SGFuZCh0aGlzLmR4LCB0aGlzLmR5LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIC8vIE1vdXNlbW92ZSBvbiBkb2N1bWVudFxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQpO1xyXG5cclxuICAgICAgICAvLyBNb3VzZXVwIG9uIGRvY3VtZW50XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tFbmRCb3VuZCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrRW5kQm91bmQpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlRG9jdW1lbnRDbGlja01vdmVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVEb2N1bWVudENsaWNrTW92ZShlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBjbGlja1BvcyA9IFRpbWVwaWNrZXIuX1BvcyhlKTtcclxuICAgICAgICB2YXIgeCA9IGNsaWNrUG9zLnggLSB0aGlzLngwO1xyXG4gICAgICAgIHZhciB5ID0gY2xpY2tQb3MueSAtIHRoaXMueTA7XHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zZXRIYW5kKHgsIHksIGZhbHNlLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZURvY3VtZW50Q2xpY2tFbmRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVEb2N1bWVudENsaWNrRW5kKGUpIHtcclxuICAgICAgICB2YXIgX3RoaXM1OCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGlja0VuZEJvdW5kKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tFbmRCb3VuZCk7XHJcbiAgICAgICAgdmFyIGNsaWNrUG9zID0gVGltZXBpY2tlci5fUG9zKGUpO1xyXG4gICAgICAgIHZhciB4ID0gY2xpY2tQb3MueCAtIHRoaXMueDA7XHJcbiAgICAgICAgdmFyIHkgPSBjbGlja1Bvcy55IC0gdGhpcy55MDtcclxuICAgICAgICBpZiAodGhpcy5tb3ZlZCAmJiB4ID09PSB0aGlzLmR4ICYmIHkgPT09IHRoaXMuZHkpIHtcclxuICAgICAgICAgIHRoaXMuc2V0SGFuZCh4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3ID09PSAnaG91cnMnKSB7XHJcbiAgICAgICAgICB0aGlzLnNob3dWaWV3KCdtaW51dGVzJywgdGhpcy5vcHRpb25zLmR1cmF0aW9uIC8gMik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuYXV0b0Nsb3NlKSB7XHJcbiAgICAgICAgICAkKHRoaXMubWludXRlc1ZpZXcpLmFkZENsYXNzKCd0aW1lcGlja2VyLWRpYWwtb3V0Jyk7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX3RoaXM1OC5kb25lKCk7XHJcbiAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMuZHVyYXRpb24gLyAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uU2VsZWN0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25TZWxlY3QuY2FsbCh0aGlzLCB0aGlzLmhvdXJzLCB0aGlzLm1pbnV0ZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVW5iaW5kIG1vdXNlbW92ZSBldmVudFxyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQpO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tNb3ZlQm91bmQpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaW5zZXJ0SFRNTEludG9ET01cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9pbnNlcnRIVE1MSW50b0RPTSgpIHtcclxuICAgICAgICB0aGlzLiRtb2RhbEVsID0gJChUaW1lcGlja2VyLl90ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5tb2RhbEVsID0gdGhpcy4kbW9kYWxFbFswXTtcclxuICAgICAgICB0aGlzLm1vZGFsRWwuaWQgPSAnbW9kYWwtJyArIHRoaXMuaWQ7XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCBwb3BvdmVyIHRvIGlucHV0IGJ5IGRlZmF1bHRcclxuICAgICAgICB2YXIgY29udGFpbmVyRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0aW9ucy5jb250YWluZXIpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGFpbmVyICYmICEhY29udGFpbmVyRWwpIHtcclxuICAgICAgICAgIHRoaXMuJG1vZGFsRWwuYXBwZW5kVG8oY29udGFpbmVyRWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLiRtb2RhbEVsLmluc2VydEJlZm9yZSh0aGlzLmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zZXR1cE1vZGFsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBNb2RhbCgpIHtcclxuICAgICAgICB2YXIgX3RoaXM1OSA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMubW9kYWwgPSBNLk1vZGFsLmluaXQodGhpcy5tb2RhbEVsLCB7XHJcbiAgICAgICAgICBvbk9wZW5TdGFydDogdGhpcy5vcHRpb25zLm9uT3BlblN0YXJ0LFxyXG4gICAgICAgICAgb25PcGVuRW5kOiB0aGlzLm9wdGlvbnMub25PcGVuRW5kLFxyXG4gICAgICAgICAgb25DbG9zZVN0YXJ0OiB0aGlzLm9wdGlvbnMub25DbG9zZVN0YXJ0LFxyXG4gICAgICAgICAgb25DbG9zZUVuZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIF90aGlzNTkub3B0aW9ucy5vbkNsb3NlRW5kID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXM1OS5vcHRpb25zLm9uQ2xvc2VFbmQuY2FsbChfdGhpczU5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpczU5LmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBWYXJpYWJsZXNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cFZhcmlhYmxlcygpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gJ2hvdXJzJztcclxuICAgICAgICB0aGlzLnZpYnJhdGUgPSBuYXZpZ2F0b3IudmlicmF0ZSA/ICd2aWJyYXRlJyA6IG5hdmlnYXRvci53ZWJraXRWaWJyYXRlID8gJ3dlYmtpdFZpYnJhdGUnIDogbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5fY2FudmFzID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy50aW1lcGlja2VyLWNhbnZhcycpO1xyXG4gICAgICAgIHRoaXMucGxhdGUgPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLnRpbWVwaWNrZXItcGxhdGUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5ob3Vyc1ZpZXcgPSB0aGlzLm1vZGFsRWwucXVlcnlTZWxlY3RvcignLnRpbWVwaWNrZXItaG91cnMnKTtcclxuICAgICAgICB0aGlzLm1pbnV0ZXNWaWV3ID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy50aW1lcGlja2VyLW1pbnV0ZXMnKTtcclxuICAgICAgICB0aGlzLnNwYW5Ib3VycyA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1zcGFuLWhvdXJzJyk7XHJcbiAgICAgICAgdGhpcy5zcGFuTWludXRlcyA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1zcGFuLW1pbnV0ZXMnKTtcclxuICAgICAgICB0aGlzLnNwYW5BbVBtID0gdGhpcy5tb2RhbEVsLnF1ZXJ5U2VsZWN0b3IoJy50aW1lcGlja2VyLXNwYW4tYW0tcG0nKTtcclxuICAgICAgICB0aGlzLmZvb3RlciA9IHRoaXMubW9kYWxFbC5xdWVyeVNlbGVjdG9yKCcudGltZXBpY2tlci1mb290ZXInKTtcclxuICAgICAgICB0aGlzLmFtT3JQbSA9ICdQTSc7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9waWNrZXJTZXR1cFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3BpY2tlclNldHVwKCkge1xyXG4gICAgICAgIHZhciAkY2xlYXJCdG4gPSAkKFwiPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWZsYXQgdGltZXBpY2tlci1jbGVhciB3YXZlcy1lZmZlY3RcXFwiIHN0eWxlPVxcXCJ2aXNpYmlsaXR5OiBoaWRkZW47XFxcIiB0eXBlPVxcXCJidXR0b25cXFwiIHRhYmluZGV4PVxcXCJcIiArICh0aGlzLm9wdGlvbnMudHdlbHZlSG91ciA/ICczJyA6ICcxJykgKyBcIlxcXCI+XCIgKyB0aGlzLm9wdGlvbnMuaTE4bi5jbGVhciArIFwiPC9idXR0b24+XCIpLmFwcGVuZFRvKHRoaXMuZm9vdGVyKS5vbignY2xpY2snLCB0aGlzLmNsZWFyLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd0NsZWFyQnRuKSB7XHJcbiAgICAgICAgICAkY2xlYXJCdG4uY3NzKHsgdmlzaWJpbGl0eTogJycgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY29uZmlybWF0aW9uQnRuc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJjb25maXJtYXRpb24tYnRuc1wiPjwvZGl2PicpO1xyXG4gICAgICAgICQoJzxidXR0b24gY2xhc3M9XCJidG4tZmxhdCB0aW1lcGlja2VyLWNsb3NlIHdhdmVzLWVmZmVjdFwiIHR5cGU9XCJidXR0b25cIiB0YWJpbmRleD1cIicgKyAodGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIgPyAnMycgOiAnMScpICsgJ1wiPicgKyB0aGlzLm9wdGlvbnMuaTE4bi5jYW5jZWwgKyAnPC9idXR0b24+JykuYXBwZW5kVG8oY29uZmlybWF0aW9uQnRuc0NvbnRhaW5lcikub24oJ2NsaWNrJywgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAkKCc8YnV0dG9uIGNsYXNzPVwiYnRuLWZsYXQgdGltZXBpY2tlci1jbG9zZSB3YXZlcy1lZmZlY3RcIiB0eXBlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCInICsgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyID8gJzMnIDogJzEnKSArICdcIj4nICsgdGhpcy5vcHRpb25zLmkxOG4uZG9uZSArICc8L2J1dHRvbj4nKS5hcHBlbmRUbyhjb25maXJtYXRpb25CdG5zQ29udGFpbmVyKS5vbignY2xpY2snLCB0aGlzLmRvbmUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgY29uZmlybWF0aW9uQnRuc0NvbnRhaW5lci5hcHBlbmRUbyh0aGlzLmZvb3Rlcik7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9jbG9ja1NldHVwXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY2xvY2tTZXR1cCgpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIpIHtcclxuICAgICAgICAgIHRoaXMuJGFtQnRuID0gJCgnPGRpdiBjbGFzcz1cImFtLWJ0blwiPkFNPC9kaXY+Jyk7XHJcbiAgICAgICAgICB0aGlzLiRwbUJ0biA9ICQoJzxkaXYgY2xhc3M9XCJwbS1idG5cIj5QTTwvZGl2PicpO1xyXG4gICAgICAgICAgdGhpcy4kYW1CdG4ub24oJ2NsaWNrJywgdGhpcy5faGFuZGxlQW1QbUNsaWNrLmJpbmQodGhpcykpLmFwcGVuZFRvKHRoaXMuc3BhbkFtUG0pO1xyXG4gICAgICAgICAgdGhpcy4kcG1CdG4ub24oJ2NsaWNrJywgdGhpcy5faGFuZGxlQW1QbUNsaWNrLmJpbmQodGhpcykpLmFwcGVuZFRvKHRoaXMuc3BhbkFtUG0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYnVpbGRIb3Vyc1ZpZXcoKTtcclxuICAgICAgICB0aGlzLl9idWlsZE1pbnV0ZXNWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5fYnVpbGRTVkdDbG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYnVpbGRTVkdDbG9ja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2J1aWxkU1ZHQ2xvY2soKSB7XHJcbiAgICAgICAgLy8gRHJhdyBjbG9jayBoYW5kcyBhbmQgb3RoZXJzXHJcbiAgICAgICAgdmFyIGRpYWxSYWRpdXMgPSB0aGlzLm9wdGlvbnMuZGlhbFJhZGl1cztcclxuICAgICAgICB2YXIgdGlja1JhZGl1cyA9IHRoaXMub3B0aW9ucy50aWNrUmFkaXVzO1xyXG4gICAgICAgIHZhciBkaWFtZXRlciA9IGRpYWxSYWRpdXMgKiAyO1xyXG5cclxuICAgICAgICB2YXIgc3ZnID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ3N2ZycpO1xyXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3RpbWVwaWNrZXItc3ZnJyk7XHJcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBkaWFtZXRlcik7XHJcbiAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgZGlhbWV0ZXIpO1xyXG4gICAgICAgIHZhciBnID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ2cnKTtcclxuICAgICAgICBnLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgZGlhbFJhZGl1cyArICcsJyArIGRpYWxSYWRpdXMgKyAnKScpO1xyXG4gICAgICAgIHZhciBiZWFyaW5nID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ2NpcmNsZScpO1xyXG4gICAgICAgIGJlYXJpbmcuc2V0QXR0cmlidXRlKCdjbGFzcycsICd0aW1lcGlja2VyLWNhbnZhcy1iZWFyaW5nJyk7XHJcbiAgICAgICAgYmVhcmluZy5zZXRBdHRyaWJ1dGUoJ2N4JywgMCk7XHJcbiAgICAgICAgYmVhcmluZy5zZXRBdHRyaWJ1dGUoJ2N5JywgMCk7XHJcbiAgICAgICAgYmVhcmluZy5zZXRBdHRyaWJ1dGUoJ3InLCA0KTtcclxuICAgICAgICB2YXIgaGFuZCA9IFRpbWVwaWNrZXIuX2NyZWF0ZVNWR0VsKCdsaW5lJyk7XHJcbiAgICAgICAgaGFuZC5zZXRBdHRyaWJ1dGUoJ3gxJywgMCk7XHJcbiAgICAgICAgaGFuZC5zZXRBdHRyaWJ1dGUoJ3kxJywgMCk7XHJcbiAgICAgICAgdmFyIGJnID0gVGltZXBpY2tlci5fY3JlYXRlU1ZHRWwoJ2NpcmNsZScpO1xyXG4gICAgICAgIGJnLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAndGltZXBpY2tlci1jYW52YXMtYmcnKTtcclxuICAgICAgICBiZy5zZXRBdHRyaWJ1dGUoJ3InLCB0aWNrUmFkaXVzKTtcclxuICAgICAgICBnLmFwcGVuZENoaWxkKGhhbmQpO1xyXG4gICAgICAgIGcuYXBwZW5kQ2hpbGQoYmcpO1xyXG4gICAgICAgIGcuYXBwZW5kQ2hpbGQoYmVhcmluZyk7XHJcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKGcpO1xyXG4gICAgICAgIHRoaXMuX2NhbnZhcy5hcHBlbmRDaGlsZChzdmcpO1xyXG5cclxuICAgICAgICB0aGlzLmhhbmQgPSBoYW5kO1xyXG4gICAgICAgIHRoaXMuYmcgPSBiZztcclxuICAgICAgICB0aGlzLmJlYXJpbmcgPSBiZWFyaW5nO1xyXG4gICAgICAgIHRoaXMuZyA9IGc7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9idWlsZEhvdXJzVmlld1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2J1aWxkSG91cnNWaWV3KCkge1xyXG4gICAgICAgIHZhciAkdGljayA9ICQoJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLXRpY2tcIj48L2Rpdj4nKTtcclxuICAgICAgICAvLyBIb3VycyB2aWV3XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyKSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IDEzOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIHRpY2sgPSAkdGljay5jbG9uZSgpO1xyXG4gICAgICAgICAgICB2YXIgcmFkaWFuID0gaSAvIDYgKiBNYXRoLlBJO1xyXG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gdGhpcy5vcHRpb25zLm91dGVyUmFkaXVzO1xyXG4gICAgICAgICAgICB0aWNrLmNzcyh7XHJcbiAgICAgICAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgKyBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnLFxyXG4gICAgICAgICAgICAgIHRvcDogdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgLSBNYXRoLmNvcyhyYWRpYW4pICogcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aWNrLmh0bWwoaSA9PT0gMCA/ICcwMCcgOiBpKTtcclxuICAgICAgICAgICAgdGhpcy5ob3Vyc1ZpZXcuYXBwZW5kQ2hpbGQodGlja1swXSk7XHJcbiAgICAgICAgICAgIC8vIHRpY2sub24obW91c2Vkb3duRXZlbnQsIG1vdXNlZG93bik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IDI0OyBfaTIgKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgX3RpY2sgPSAkdGljay5jbG9uZSgpO1xyXG4gICAgICAgICAgICB2YXIgX3JhZGlhbiA9IF9pMiAvIDYgKiBNYXRoLlBJO1xyXG4gICAgICAgICAgICB2YXIgaW5uZXIgPSBfaTIgPiAwICYmIF9pMiA8IDEzO1xyXG4gICAgICAgICAgICB2YXIgX3JhZGl1cyA9IGlubmVyID8gdGhpcy5vcHRpb25zLmlubmVyUmFkaXVzIDogdGhpcy5vcHRpb25zLm91dGVyUmFkaXVzO1xyXG4gICAgICAgICAgICBfdGljay5jc3Moe1xyXG4gICAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy5kaWFsUmFkaXVzICsgTWF0aC5zaW4oX3JhZGlhbikgKiBfcmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnLFxyXG4gICAgICAgICAgICAgIHRvcDogdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgLSBNYXRoLmNvcyhfcmFkaWFuKSAqIF9yYWRpdXMgLSB0aGlzLm9wdGlvbnMudGlja1JhZGl1cyArICdweCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIF90aWNrLmh0bWwoX2kyID09PSAwID8gJzAwJyA6IF9pMik7XHJcbiAgICAgICAgICAgIHRoaXMuaG91cnNWaWV3LmFwcGVuZENoaWxkKF90aWNrWzBdKTtcclxuICAgICAgICAgICAgLy8gdGljay5vbihtb3VzZWRvd25FdmVudCwgbW91c2Vkb3duKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9idWlsZE1pbnV0ZXNWaWV3XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYnVpbGRNaW51dGVzVmlldygpIHtcclxuICAgICAgICB2YXIgJHRpY2sgPSAkKCc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci10aWNrXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgLy8gTWludXRlcyB2aWV3XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2MDsgaSArPSA1KSB7XHJcbiAgICAgICAgICB2YXIgdGljayA9ICR0aWNrLmNsb25lKCk7XHJcbiAgICAgICAgICB2YXIgcmFkaWFuID0gaSAvIDMwICogTWF0aC5QSTtcclxuICAgICAgICAgIHRpY2suY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLmRpYWxSYWRpdXMgKyBNYXRoLnNpbihyYWRpYW4pICogdGhpcy5vcHRpb25zLm91dGVyUmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMgKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6IHRoaXMub3B0aW9ucy5kaWFsUmFkaXVzIC0gTWF0aC5jb3MocmFkaWFuKSAqIHRoaXMub3B0aW9ucy5vdXRlclJhZGl1cyAtIHRoaXMub3B0aW9ucy50aWNrUmFkaXVzICsgJ3B4J1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aWNrLmh0bWwoVGltZXBpY2tlci5fYWRkTGVhZGluZ1plcm8oaSkpO1xyXG4gICAgICAgICAgdGhpcy5taW51dGVzVmlldy5hcHBlbmRDaGlsZCh0aWNrWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVBbVBtQ2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVBbVBtQ2xpY2soZSkge1xyXG4gICAgICAgIHZhciAkYnRuQ2xpY2tlZCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgIHRoaXMuYW1PclBtID0gJGJ0bkNsaWNrZWQuaGFzQ2xhc3MoJ2FtLWJ0bicpID8gJ0FNJyA6ICdQTSc7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlQW1QbVZpZXcoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3VwZGF0ZUFtUG1WaWV3XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlQW1QbVZpZXcoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyKSB7XHJcbiAgICAgICAgICB0aGlzLiRhbUJ0bi50b2dnbGVDbGFzcygndGV4dC1wcmltYXJ5JywgdGhpcy5hbU9yUG0gPT09ICdBTScpO1xyXG4gICAgICAgICAgdGhpcy4kcG1CdG4udG9nZ2xlQ2xhc3MoJ3RleHQtcHJpbWFyeScsIHRoaXMuYW1PclBtID09PSAnUE0nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl91cGRhdGVUaW1lRnJvbUlucHV0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlVGltZUZyb21JbnB1dCgpIHtcclxuICAgICAgICAvLyBHZXQgdGhlIHRpbWVcclxuICAgICAgICB2YXIgdmFsdWUgPSAoKHRoaXMuZWwudmFsdWUgfHwgdGhpcy5vcHRpb25zLmRlZmF1bHRUaW1lIHx8ICcnKSArICcnKS5zcGxpdCgnOicpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudHdlbHZlSG91ciAmJiAhKHR5cGVvZiB2YWx1ZVsxXSA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICBpZiAodmFsdWVbMV0udG9VcHBlckNhc2UoKS5pbmRleE9mKCdBTScpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFtT3JQbSA9ICdBTSc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFtT3JQbSA9ICdQTSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YWx1ZVsxXSA9IHZhbHVlWzFdLnJlcGxhY2UoJ0FNJywgJycpLnJlcGxhY2UoJ1BNJywgJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWVbMF0gPT09ICdub3cnKSB7XHJcbiAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoK25ldyBEYXRlKCkgKyB0aGlzLm9wdGlvbnMuZnJvbU5vdyk7XHJcbiAgICAgICAgICB2YWx1ZSA9IFtub3cuZ2V0SG91cnMoKSwgbm93LmdldE1pbnV0ZXMoKV07XHJcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIpIHtcclxuICAgICAgICAgICAgdGhpcy5hbU9yUG0gPSB2YWx1ZVswXSA+PSAxMiAmJiB2YWx1ZVswXSA8IDI0ID8gJ1BNJyA6ICdBTSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaG91cnMgPSArdmFsdWVbMF0gfHwgMDtcclxuICAgICAgICB0aGlzLm1pbnV0ZXMgPSArdmFsdWVbMV0gfHwgMDtcclxuICAgICAgICB0aGlzLnNwYW5Ib3Vycy5pbm5lckhUTUwgPSB0aGlzLmhvdXJzO1xyXG4gICAgICAgIHRoaXMuc3Bhbk1pbnV0ZXMuaW5uZXJIVE1MID0gVGltZXBpY2tlci5fYWRkTGVhZGluZ1plcm8odGhpcy5taW51dGVzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlQW1QbVZpZXcoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic2hvd1ZpZXdcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3dWaWV3KHZpZXcsIGRlbGF5KSB7XHJcbiAgICAgICAgaWYgKHZpZXcgPT09ICdtaW51dGVzJyAmJiAkKHRoaXMuaG91cnNWaWV3KS5jc3MoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnKSB7XHJcbiAgICAgICAgICAvLyByYWlzZUNhbGxiYWNrKHRoaXMub3B0aW9ucy5iZWZvcmVIb3VyU2VsZWN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlzSG91cnMgPSB2aWV3ID09PSAnaG91cnMnLFxyXG4gICAgICAgICAgICBuZXh0VmlldyA9IGlzSG91cnMgPyB0aGlzLmhvdXJzVmlldyA6IHRoaXMubWludXRlc1ZpZXcsXHJcbiAgICAgICAgICAgIGhpZGVWaWV3ID0gaXNIb3VycyA/IHRoaXMubWludXRlc1ZpZXcgOiB0aGlzLmhvdXJzVmlldztcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlldztcclxuXHJcbiAgICAgICAgJCh0aGlzLnNwYW5Ib3VycykudG9nZ2xlQ2xhc3MoJ3RleHQtcHJpbWFyeScsIGlzSG91cnMpO1xyXG4gICAgICAgICQodGhpcy5zcGFuTWludXRlcykudG9nZ2xlQ2xhc3MoJ3RleHQtcHJpbWFyeScsICFpc0hvdXJzKTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNpdGlvbiB2aWV3XHJcbiAgICAgICAgaGlkZVZpZXcuY2xhc3NMaXN0LmFkZCgndGltZXBpY2tlci1kaWFsLW91dCcpO1xyXG4gICAgICAgICQobmV4dFZpZXcpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJykucmVtb3ZlQ2xhc3MoJ3RpbWVwaWNrZXItZGlhbC1vdXQnKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgY2xvY2sgaGFuZFxyXG4gICAgICAgIHRoaXMucmVzZXRDbG9jayhkZWxheSk7XHJcblxyXG4gICAgICAgIC8vIEFmdGVyIHRyYW5zaXRpb25zIGVuZGVkXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG9nZ2xlVmlld1RpbWVyKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZVZpZXdUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgJChoaWRlVmlldykuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xyXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5kdXJhdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInJlc2V0Q2xvY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0Q2xvY2soZGVsYXkpIHtcclxuICAgICAgICB2YXIgdmlldyA9IHRoaXMuY3VycmVudFZpZXcsXHJcbiAgICAgICAgICAgIHZhbHVlID0gdGhpc1t2aWV3XSxcclxuICAgICAgICAgICAgaXNIb3VycyA9IHZpZXcgPT09ICdob3VycycsXHJcbiAgICAgICAgICAgIHVuaXQgPSBNYXRoLlBJIC8gKGlzSG91cnMgPyA2IDogMzApLFxyXG4gICAgICAgICAgICByYWRpYW4gPSB2YWx1ZSAqIHVuaXQsXHJcbiAgICAgICAgICAgIHJhZGl1cyA9IGlzSG91cnMgJiYgdmFsdWUgPiAwICYmIHZhbHVlIDwgMTMgPyB0aGlzLm9wdGlvbnMuaW5uZXJSYWRpdXMgOiB0aGlzLm9wdGlvbnMub3V0ZXJSYWRpdXMsXHJcbiAgICAgICAgICAgIHggPSBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzLFxyXG4gICAgICAgICAgICB5ID0gLU1hdGguY29zKHJhZGlhbikgKiByYWRpdXMsXHJcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoZGVsYXkpIHtcclxuICAgICAgICAgICQodGhpcy5jYW52YXMpLmFkZENsYXNzKCd0aW1lcGlja2VyLWNhbnZhcy1vdXQnKTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHNlbGYuY2FudmFzKS5yZW1vdmVDbGFzcygndGltZXBpY2tlci1jYW52YXMtb3V0Jyk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0SGFuZCh4LCB5KTtcclxuICAgICAgICAgIH0sIGRlbGF5KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5zZXRIYW5kKHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic2V0SGFuZFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SGFuZCh4LCB5LCByb3VuZEJ5NSkge1xyXG4gICAgICAgIHZhciBfdGhpczYwID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIHJhZGlhbiA9IE1hdGguYXRhbjIoeCwgLXkpLFxyXG4gICAgICAgICAgICBpc0hvdXJzID0gdGhpcy5jdXJyZW50VmlldyA9PT0gJ2hvdXJzJyxcclxuICAgICAgICAgICAgdW5pdCA9IE1hdGguUEkgLyAoaXNIb3VycyB8fCByb3VuZEJ5NSA/IDYgOiAzMCksXHJcbiAgICAgICAgICAgIHogPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSksXHJcbiAgICAgICAgICAgIGlubmVyID0gaXNIb3VycyAmJiB6IDwgKHRoaXMub3B0aW9ucy5vdXRlclJhZGl1cyArIHRoaXMub3B0aW9ucy5pbm5lclJhZGl1cykgLyAyLFxyXG4gICAgICAgICAgICByYWRpdXMgPSBpbm5lciA/IHRoaXMub3B0aW9ucy5pbm5lclJhZGl1cyA6IHRoaXMub3B0aW9ucy5vdXRlclJhZGl1cztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyKSB7XHJcbiAgICAgICAgICByYWRpdXMgPSB0aGlzLm9wdGlvbnMub3V0ZXJSYWRpdXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSYWRpYW4gc2hvdWxkIGluIHJhbmdlIFswLCAyUEldXHJcbiAgICAgICAgaWYgKHJhZGlhbiA8IDApIHtcclxuICAgICAgICAgIHJhZGlhbiA9IE1hdGguUEkgKiAyICsgcmFkaWFuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSByb3VuZCB2YWx1ZVxyXG4gICAgICAgIHZhciB2YWx1ZSA9IE1hdGgucm91bmQocmFkaWFuIC8gdW5pdCk7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcm91bmQgcmFkaWFuXHJcbiAgICAgICAgcmFkaWFuID0gdmFsdWUgKiB1bml0O1xyXG5cclxuICAgICAgICAvLyBDb3JyZWN0IHRoZSBob3VycyBvciBtaW51dGVzXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50d2VsdmVIb3VyKSB7XHJcbiAgICAgICAgICBpZiAoaXNIb3Vycykge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDApIHZhbHVlID0gMTI7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocm91bmRCeTUpIHZhbHVlICo9IDU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gNjApIHZhbHVlID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGlzSG91cnMpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAxMikge1xyXG4gICAgICAgICAgICAgIHZhbHVlID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWx1ZSA9IGlubmVyID8gdmFsdWUgPT09IDAgPyAxMiA6IHZhbHVlIDogdmFsdWUgPT09IDAgPyAwIDogdmFsdWUgKyAxMjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChyb3VuZEJ5NSkge1xyXG4gICAgICAgICAgICAgIHZhbHVlICo9IDU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSA2MCkge1xyXG4gICAgICAgICAgICAgIHZhbHVlID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT25jZSBob3VycyBvciBtaW51dGVzIGNoYW5nZWQsIHZpYnJhdGUgdGhlIGRldmljZVxyXG4gICAgICAgIGlmICh0aGlzW3RoaXMuY3VycmVudFZpZXddICE9PSB2YWx1ZSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMudmlicmF0ZSAmJiB0aGlzLm9wdGlvbnMudmlicmF0ZSkge1xyXG4gICAgICAgICAgICAvLyBEbyBub3QgdmlicmF0ZSB0b28gZnJlcXVlbnRseVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMudmlicmF0ZVRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgbmF2aWdhdG9yW3RoaXMudmlicmF0ZV0oMTApO1xyXG4gICAgICAgICAgICAgIHRoaXMudmlicmF0ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpczYwLnZpYnJhdGVUaW1lciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpc1t0aGlzLmN1cnJlbnRWaWV3XSA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChpc0hvdXJzKSB7XHJcbiAgICAgICAgICB0aGlzWydzcGFuSG91cnMnXS5pbm5lckhUTUwgPSB2YWx1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpc1snc3Bhbk1pbnV0ZXMnXS5pbm5lckhUTUwgPSBUaW1lcGlja2VyLl9hZGRMZWFkaW5nWmVybyh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTZXQgY2xvY2sgaGFuZCBhbmQgb3RoZXJzJyBwb3NpdGlvblxyXG4gICAgICAgIHZhciBjeDEgPSBNYXRoLnNpbihyYWRpYW4pICogKHJhZGl1cyAtIHRoaXMub3B0aW9ucy50aWNrUmFkaXVzKSxcclxuICAgICAgICAgICAgY3kxID0gLU1hdGguY29zKHJhZGlhbikgKiAocmFkaXVzIC0gdGhpcy5vcHRpb25zLnRpY2tSYWRpdXMpLFxyXG4gICAgICAgICAgICBjeDIgPSBNYXRoLnNpbihyYWRpYW4pICogcmFkaXVzLFxyXG4gICAgICAgICAgICBjeTIgPSAtTWF0aC5jb3MocmFkaWFuKSAqIHJhZGl1cztcclxuICAgICAgICB0aGlzLmhhbmQuc2V0QXR0cmlidXRlKCd4MicsIGN4MSk7XHJcbiAgICAgICAgdGhpcy5oYW5kLnNldEF0dHJpYnV0ZSgneTInLCBjeTEpO1xyXG4gICAgICAgIHRoaXMuYmcuc2V0QXR0cmlidXRlKCdjeCcsIGN4Mik7XHJcbiAgICAgICAgdGhpcy5iZy5zZXRBdHRyaWJ1dGUoJ2N5JywgY3kyKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwib3BlblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09wZW4pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl91cGRhdGVUaW1lRnJvbUlucHV0KCk7XHJcbiAgICAgICAgdGhpcy5zaG93VmlldygnaG91cnMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RhbC5vcGVuKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImNsb3NlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9kYWwuY2xvc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEZpbmlzaCB0aW1lcGlja2VyIHNlbGVjdGlvbi5cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZG9uZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZG9uZShlLCBjbGVhclZhbHVlKSB7XHJcbiAgICAgICAgLy8gU2V0IGlucHV0IHZhbHVlXHJcbiAgICAgICAgdmFyIGxhc3QgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IGNsZWFyVmFsdWUgPyAnJyA6IFRpbWVwaWNrZXIuX2FkZExlYWRpbmdaZXJvKHRoaXMuaG91cnMpICsgJzonICsgVGltZXBpY2tlci5fYWRkTGVhZGluZ1plcm8odGhpcy5taW51dGVzKTtcclxuICAgICAgICB0aGlzLnRpbWUgPSB2YWx1ZTtcclxuICAgICAgICBpZiAoIWNsZWFyVmFsdWUgJiYgdGhpcy5vcHRpb25zLnR3ZWx2ZUhvdXIpIHtcclxuICAgICAgICAgIHZhbHVlID0gdmFsdWUgKyBcIiBcIiArIHRoaXMuYW1PclBtO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIC8vIFRyaWdnZXIgY2hhbmdlIGV2ZW50XHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSBsYXN0KSB7XHJcbiAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB0aGlzLmVsLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImNsZWFyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLmRvbmUobnVsbCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChUaW1lcGlja2VyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVGltZXBpY2tlciksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hZGRMZWFkaW5nWmVyb1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FkZExlYWRpbmdaZXJvKG51bSkge1xyXG4gICAgICAgIHJldHVybiAobnVtIDwgMTAgPyAnMCcgOiAnJykgKyBudW07XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9jcmVhdGVTVkdFbFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NyZWF0ZVNWR0VsKG5hbWUpIHtcclxuICAgICAgICB2YXIgc3ZnTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTlMsIG5hbWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQHR5cGVkZWYge09iamVjdH0gUG9pbnRcclxuICAgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHggVGhlIFggQ29vcmRpbmF0ZVxyXG4gICAgICAgKiBAcHJvcGVydHkge251bWJlcn0geSBUaGUgWSBDb29yZGluYXRlXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCB4IHBvc2l0aW9uIG9mIG1vdXNlIG9yIHRvdWNoIGV2ZW50XHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICogQHJldHVybiB7UG9pbnR9IHggYW5kIHkgbG9jYXRpb25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX1Bvc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX1BvcyhlKSB7XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgIHJldHVybiB7IHg6IGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCB5OiBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBtb3VzZSBldmVudFxyXG4gICAgICAgIHJldHVybiB7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9UaW1lcGlja2VyO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIFRpbWVwaWNrZXI7XHJcbiAgfShDb21wb25lbnQpO1xyXG5cclxuICBUaW1lcGlja2VyLl90ZW1wbGF0ZSA9IFsnPGRpdiBjbGFzcz0gXCJtb2RhbCB0aW1lcGlja2VyLW1vZGFsXCI+JywgJzxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50IHRpbWVwaWNrZXItY29udGFpbmVyXCI+JywgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLWRpZ2l0YWwtZGlzcGxheVwiPicsICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci10ZXh0LWNvbnRhaW5lclwiPicsICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1kaXNwbGF5LWNvbHVtblwiPicsICc8c3BhbiBjbGFzcz1cInRpbWVwaWNrZXItc3Bhbi1ob3VycyB0ZXh0LXByaW1hcnlcIj48L3NwYW4+JywgJzonLCAnPHNwYW4gY2xhc3M9XCJ0aW1lcGlja2VyLXNwYW4tbWludXRlc1wiPjwvc3Bhbj4nLCAnPC9kaXY+JywgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLWRpc3BsYXktY29sdW1uIHRpbWVwaWNrZXItZGlzcGxheS1hbS1wbVwiPicsICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1zcGFuLWFtLXBtXCI+PC9kaXY+JywgJzwvZGl2PicsICc8L2Rpdj4nLCAnPC9kaXY+JywgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLWFuYWxvZy1kaXNwbGF5XCI+JywgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLXBsYXRlXCI+JywgJzxkaXYgY2xhc3M9XCJ0aW1lcGlja2VyLWNhbnZhc1wiPjwvZGl2PicsICc8ZGl2IGNsYXNzPVwidGltZXBpY2tlci1kaWFsIHRpbWVwaWNrZXItaG91cnNcIj48L2Rpdj4nLCAnPGRpdiBjbGFzcz1cInRpbWVwaWNrZXItZGlhbCB0aW1lcGlja2VyLW1pbnV0ZXMgdGltZXBpY2tlci1kaWFsLW91dFwiPjwvZGl2PicsICc8L2Rpdj4nLCAnPGRpdiBjbGFzcz1cInRpbWVwaWNrZXItZm9vdGVyXCI+PC9kaXY+JywgJzwvZGl2PicsICc8L2Rpdj4nLCAnPC9kaXY+J10uam9pbignJyk7XHJcblxyXG4gIE0uVGltZXBpY2tlciA9IFRpbWVwaWNrZXI7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihUaW1lcGlja2VyLCAndGltZXBpY2tlcicsICdNX1RpbWVwaWNrZXInKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG47KGZ1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgX2RlZmF1bHRzID0ge307XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBDaGFyYWN0ZXJDb3VudGVyID0gZnVuY3Rpb24gKF9Db21wb25lbnQxNykge1xyXG4gICAgX2luaGVyaXRzKENoYXJhY3RlckNvdW50ZXIsIF9Db21wb25lbnQxNyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgQ2hhcmFjdGVyQ291bnRlciBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBDaGFyYWN0ZXJDb3VudGVyKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDaGFyYWN0ZXJDb3VudGVyKTtcclxuXHJcbiAgICAgIHZhciBfdGhpczYxID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKENoYXJhY3RlckNvdW50ZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDaGFyYWN0ZXJDb3VudGVyKSkuY2FsbCh0aGlzLCBDaGFyYWN0ZXJDb3VudGVyLCBlbCwgb3B0aW9ucykpO1xyXG5cclxuICAgICAgX3RoaXM2MS5lbC5NX0NoYXJhY3RlckNvdW50ZXIgPSBfdGhpczYxO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBjaGFyYWN0ZXIgY291bnRlclxyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXM2MS5vcHRpb25zID0gJC5leHRlbmQoe30sIENoYXJhY3RlckNvdW50ZXIuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgX3RoaXM2MS5pc0ludmFsaWQgPSBmYWxzZTtcclxuICAgICAgX3RoaXM2MS5pc1ZhbGlkTGVuZ3RoID0gZmFsc2U7XHJcbiAgICAgIF90aGlzNjEuX3NldHVwQ291bnRlcigpO1xyXG4gICAgICBfdGhpczYxLl9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgcmV0dXJuIF90aGlzNjE7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKENoYXJhY3RlckNvdW50ZXIsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuZWwuQ2hhcmFjdGVyQ291bnRlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9yZW1vdmVDb3VudGVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVVwZGF0ZUNvdW50ZXJCb3VuZCA9IHRoaXMudXBkYXRlQ291bnRlci5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5faGFuZGxlVXBkYXRlQ291bnRlckJvdW5kLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5faGFuZGxlVXBkYXRlQ291bnRlckJvdW5kLCB0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfcmVtb3ZlRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2hhbmRsZVVwZGF0ZUNvdW50ZXJCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX2hhbmRsZVVwZGF0ZUNvdW50ZXJCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBjb3VudGVyIGVsZW1lbnRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwQ291bnRlclwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwQ291bnRlcigpIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAkKHRoaXMuY291bnRlckVsKS5hZGRDbGFzcygnY2hhcmFjdGVyLWNvdW50ZXInKS5jc3Moe1xyXG4gICAgICAgICAgZmxvYXQ6ICdyaWdodCcsXHJcbiAgICAgICAgICAnZm9udC1zaXplJzogJzEycHgnLFxyXG4gICAgICAgICAgaGVpZ2h0OiAxXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLnBhcmVudCgpLmFwcGVuZCh0aGlzLmNvdW50ZXJFbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgY291bnRlciBlbGVtZW50XHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVDb3VudGVyXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlQ291bnRlcigpIHtcclxuICAgICAgICAkKHRoaXMuY291bnRlckVsKS5yZW1vdmUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcInVwZGF0ZUNvdW50ZXJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUNvdW50ZXIoKSB7XHJcbiAgICAgICAgdmFyIG1heExlbmd0aCA9ICt0aGlzLiRlbC5hdHRyKCdkYXRhLWxlbmd0aCcpLFxyXG4gICAgICAgICAgICBhY3R1YWxMZW5ndGggPSB0aGlzLmVsLnZhbHVlLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmlzVmFsaWRMZW5ndGggPSBhY3R1YWxMZW5ndGggPD0gbWF4TGVuZ3RoO1xyXG4gICAgICAgIHZhciBjb3VudGVyU3RyaW5nID0gYWN0dWFsTGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAobWF4TGVuZ3RoKSB7XHJcbiAgICAgICAgICBjb3VudGVyU3RyaW5nICs9ICcvJyArIG1heExlbmd0aDtcclxuICAgICAgICAgIHRoaXMuX3ZhbGlkYXRlSW5wdXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQodGhpcy5jb3VudGVyRWwpLmh0bWwoY291bnRlclN0cmluZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBZGQgdmFsaWRhdGlvbiBjbGFzc2VzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl92YWxpZGF0ZUlucHV0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfdmFsaWRhdGVJbnB1dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkTGVuZ3RoICYmIHRoaXMuaXNJbnZhbGlkKSB7XHJcbiAgICAgICAgICB0aGlzLmlzSW52YWxpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzVmFsaWRMZW5ndGggJiYgIXRoaXMuaXNJbnZhbGlkKSB7XHJcbiAgICAgICAgICB0aGlzLmlzSW52YWxpZCA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygndmFsaWQnKTtcclxuICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdpbnZhbGlkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoQ2hhcmFjdGVyQ291bnRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENoYXJhY3RlckNvdW50ZXIpLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fQ2hhcmFjdGVyQ291bnRlcjtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBDaGFyYWN0ZXJDb3VudGVyO1xyXG4gIH0oQ29tcG9uZW50KTtcclxuXHJcbiAgTS5DaGFyYWN0ZXJDb3VudGVyID0gQ2hhcmFjdGVyQ291bnRlcjtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKENoYXJhY3RlckNvdW50ZXIsICdjaGFyYWN0ZXJDb3VudGVyJywgJ01fQ2hhcmFjdGVyQ291bnRlcicpO1xyXG4gIH1cclxufSkoY2FzaCk7XHJcbjsoZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBkdXJhdGlvbjogMjAwLCAvLyBtc1xyXG4gICAgZGlzdDogLTEwMCwgLy8gem9vbSBzY2FsZSBUT0RPOiBtYWtlIHRoaXMgbW9yZSBpbnR1aXRpdmUgYXMgYW4gb3B0aW9uXHJcbiAgICBzaGlmdDogMCwgLy8gc3BhY2luZyBmb3IgY2VudGVyIGltYWdlXHJcbiAgICBwYWRkaW5nOiAwLCAvLyBQYWRkaW5nIGJldHdlZW4gbm9uIGNlbnRlciBpdGVtc1xyXG4gICAgbnVtVmlzaWJsZTogNSwgLy8gTnVtYmVyIG9mIHZpc2libGUgaXRlbXMgaW4gY2Fyb3VzZWxcclxuICAgIGZ1bGxXaWR0aDogZmFsc2UsIC8vIENoYW5nZSB0byBmdWxsIHdpZHRoIHN0eWxlc1xyXG4gICAgaW5kaWNhdG9yczogZmFsc2UsIC8vIFRvZ2dsZSBpbmRpY2F0b3JzXHJcbiAgICBub1dyYXA6IGZhbHNlLCAvLyBEb24ndCB3cmFwIGFyb3VuZCBhbmQgY3ljbGUgdGhyb3VnaCBpdGVtcy5cclxuICAgIG9uQ3ljbGVUbzogbnVsbCAvLyBDYWxsYmFjayBmb3Igd2hlbiBhIG5ldyBzbGlkZSBpcyBjeWNsZWQgdG8uXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGNsYXNzXHJcbiAgICpcclxuICAgKi9cclxuXHJcbiAgdmFyIENhcm91c2VsID0gZnVuY3Rpb24gKF9Db21wb25lbnQxOCkge1xyXG4gICAgX2luaGVyaXRzKENhcm91c2VsLCBfQ29tcG9uZW50MTgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IENhcm91c2VsIGluc3RhbmNlXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIENhcm91c2VsKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYXJvdXNlbCk7XHJcblxyXG4gICAgICB2YXIgX3RoaXM2MiA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDYXJvdXNlbC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENhcm91c2VsKSkuY2FsbCh0aGlzLCBDYXJvdXNlbCwgZWwsIG9wdGlvbnMpKTtcclxuXHJcbiAgICAgIF90aGlzNjIuZWwuTV9DYXJvdXNlbCA9IF90aGlzNjI7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIGNhcm91c2VsXHJcbiAgICAgICAqIEBtZW1iZXIgQ2Fyb3VzZWwjb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBkdXJhdGlvblxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSBkaXN0XHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IHNoaWZ0XHJcbiAgICAgICAqIEBwcm9wIHtOdW1iZXJ9IHBhZGRpbmdcclxuICAgICAgICogQHByb3Age051bWJlcn0gbnVtVmlzaWJsZVxyXG4gICAgICAgKiBAcHJvcCB7Qm9vbGVhbn0gZnVsbFdpZHRoXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBpbmRpY2F0b3JzXHJcbiAgICAgICAqIEBwcm9wIHtCb29sZWFufSBub1dyYXBcclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvbkN5Y2xlVG9cclxuICAgICAgICovXHJcbiAgICAgIF90aGlzNjIub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDYXJvdXNlbC5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBTZXR1cFxyXG4gICAgICBfdGhpczYyLmhhc011bHRpcGxlU2xpZGVzID0gX3RoaXM2Mi4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0nKS5sZW5ndGggPiAxO1xyXG4gICAgICBfdGhpczYyLnNob3dJbmRpY2F0b3JzID0gX3RoaXM2Mi5vcHRpb25zLmluZGljYXRvcnMgJiYgX3RoaXM2Mi5oYXNNdWx0aXBsZVNsaWRlcztcclxuICAgICAgX3RoaXM2Mi5ub1dyYXAgPSBfdGhpczYyLm9wdGlvbnMubm9XcmFwIHx8ICFfdGhpczYyLmhhc011bHRpcGxlU2xpZGVzO1xyXG4gICAgICBfdGhpczYyLnByZXNzZWQgPSBmYWxzZTtcclxuICAgICAgX3RoaXM2Mi5kcmFnZ2VkID0gZmFsc2U7XHJcbiAgICAgIF90aGlzNjIub2Zmc2V0ID0gX3RoaXM2Mi50YXJnZXQgPSAwO1xyXG4gICAgICBfdGhpczYyLmltYWdlcyA9IFtdO1xyXG4gICAgICBfdGhpczYyLml0ZW1XaWR0aCA9IF90aGlzNjIuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykuZmlyc3QoKS5pbm5lcldpZHRoKCk7XHJcbiAgICAgIF90aGlzNjIuaXRlbUhlaWdodCA9IF90aGlzNjIuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykuZmlyc3QoKS5pbm5lckhlaWdodCgpO1xyXG4gICAgICBfdGhpczYyLmRpbSA9IF90aGlzNjIuaXRlbVdpZHRoICogMiArIF90aGlzNjIub3B0aW9ucy5wYWRkaW5nIHx8IDE7IC8vIE1ha2Ugc3VyZSBkaW0gaXMgbm9uIHplcm8gZm9yIGRpdmlzaW9ucy5cclxuICAgICAgX3RoaXM2Mi5fYXV0b1Njcm9sbEJvdW5kID0gX3RoaXM2Mi5fYXV0b1Njcm9sbC5iaW5kKF90aGlzNjIpO1xyXG4gICAgICBfdGhpczYyLl90cmFja0JvdW5kID0gX3RoaXM2Mi5fdHJhY2suYmluZChfdGhpczYyKTtcclxuXHJcbiAgICAgIC8vIEZ1bGwgV2lkdGggY2Fyb3VzZWwgc2V0dXBcclxuICAgICAgaWYgKF90aGlzNjIub3B0aW9ucy5mdWxsV2lkdGgpIHtcclxuICAgICAgICBfdGhpczYyLm9wdGlvbnMuZGlzdCA9IDA7XHJcbiAgICAgICAgX3RoaXM2Mi5fc2V0Q2Fyb3VzZWxIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgLy8gT2Zmc2V0IGZpeGVkIGl0ZW1zIHdoZW4gaW5kaWNhdG9ycy5cclxuICAgICAgICBpZiAoX3RoaXM2Mi5zaG93SW5kaWNhdG9ycykge1xyXG4gICAgICAgICAgX3RoaXM2Mi4kZWwuZmluZCgnLmNhcm91c2VsLWZpeGVkLWl0ZW0nKS5hZGRDbGFzcygnd2l0aC1pbmRpY2F0b3JzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggc2xpZGVzXHJcbiAgICAgIF90aGlzNjIuJGluZGljYXRvcnMgPSAkKCc8dWwgY2xhc3M9XCJpbmRpY2F0b3JzXCI+PC91bD4nKTtcclxuICAgICAgX3RoaXM2Mi4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0nKS5lYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xyXG4gICAgICAgIF90aGlzNjIuaW1hZ2VzLnB1c2goZWwpO1xyXG4gICAgICAgIGlmIChfdGhpczYyLnNob3dJbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICB2YXIgJGluZGljYXRvciA9ICQoJzxsaSBjbGFzcz1cImluZGljYXRvci1pdGVtXCI+PC9saT4nKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgYWN0aXZlIHRvIGZpcnN0IGJ5IGRlZmF1bHQuXHJcbiAgICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAkaW5kaWNhdG9yWzBdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIF90aGlzNjIuJGluZGljYXRvcnMuYXBwZW5kKCRpbmRpY2F0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChfdGhpczYyLnNob3dJbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgX3RoaXM2Mi4kZWwuYXBwZW5kKF90aGlzNjIuJGluZGljYXRvcnMpO1xyXG4gICAgICB9XHJcbiAgICAgIF90aGlzNjIuY291bnQgPSBfdGhpczYyLmltYWdlcy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBDYXAgbnVtVmlzaWJsZSBhdCBjb3VudFxyXG4gICAgICBfdGhpczYyLm9wdGlvbnMubnVtVmlzaWJsZSA9IE1hdGgubWluKF90aGlzNjIuY291bnQsIF90aGlzNjIub3B0aW9ucy5udW1WaXNpYmxlKTtcclxuXHJcbiAgICAgIC8vIFNldHVwIGNyb3NzIGJyb3dzZXIgc3RyaW5nXHJcbiAgICAgIF90aGlzNjIueGZvcm0gPSAndHJhbnNmb3JtJztcclxuICAgICAgWyd3ZWJraXQnLCAnTW96JywgJ08nLCAnbXMnXS5ldmVyeShmdW5jdGlvbiAocHJlZml4KSB7XHJcbiAgICAgICAgdmFyIGUgPSBwcmVmaXggKyAnVHJhbnNmb3JtJztcclxuICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50LmJvZHkuc3R5bGVbZV0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfdGhpczYyLnhmb3JtID0gZTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgX3RoaXM2Mi5fc2V0dXBFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgIF90aGlzNjIuX3Njcm9sbChfdGhpczYyLm9mZnNldCk7XHJcbiAgICAgIHJldHVybiBfdGhpczYyO1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVDbGFzcyhDYXJvdXNlbCwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX0Nhcm91c2VsID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB2YXIgX3RoaXM2MyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNhcm91c2VsVGFwQm91bmQgPSB0aGlzLl9oYW5kbGVDYXJvdXNlbFRhcC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kID0gdGhpcy5faGFuZGxlQ2Fyb3VzZWxEcmFnLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQgPSB0aGlzLl9oYW5kbGVDYXJvdXNlbFJlbGVhc2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVDYXJvdXNlbENsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVDYXJvdXNlbENsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX2hhbmRsZUNhcm91c2VsVGFwQm91bmQpO1xyXG4gICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbERyYWdCb3VuZCk7XHJcbiAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVDYXJvdXNlbFRhcEJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbFJlbGVhc2VCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVDYXJvdXNlbENsaWNrQm91bmQpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG93SW5kaWNhdG9ycyAmJiB0aGlzLiRpbmRpY2F0b3JzKSB7XHJcbiAgICAgICAgICB0aGlzLl9oYW5kbGVJbmRpY2F0b3JDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlSW5kaWNhdG9yQ2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgICAgIHRoaXMuJGluZGljYXRvcnMuZmluZCgnLmluZGljYXRvci1pdGVtJykuZWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcclxuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfdGhpczYzLl9oYW5kbGVJbmRpY2F0b3JDbGlja0JvdW5kKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzaXplXHJcbiAgICAgICAgdmFyIHRocm90dGxlZFJlc2l6ZSA9IE0udGhyb3R0bGUodGhpcy5faGFuZGxlUmVzaXplLCAyMDApO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kID0gdGhyb3R0bGVkUmVzaXplLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVUaHJvdHRsZWRSZXNpemVCb3VuZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHZhciBfdGhpczY0ID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxUYXBCb3VuZCk7XHJcbiAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZUNhcm91c2VsRHJhZ0JvdW5kKTtcclxuICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbFJlbGVhc2VCb3VuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxUYXBCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVDYXJvdXNlbERyYWdCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxSZWxlYXNlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hhbmRsZUNhcm91c2VsUmVsZWFzZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlQ2Fyb3VzZWxDbGlja0JvdW5kKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd0luZGljYXRvcnMgJiYgdGhpcy4kaW5kaWNhdG9ycykge1xyXG4gICAgICAgICAgdGhpcy4kaW5kaWNhdG9ycy5maW5kKCcuaW5kaWNhdG9yLWl0ZW0nKS5lYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xyXG4gICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIF90aGlzNjQuX2hhbmRsZUluZGljYXRvckNsaWNrQm91bmQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlVGhyb3R0bGVkUmVzaXplQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIENhcm91c2VsIFRhcFxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVDYXJvdXNlbFRhcFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUNhcm91c2VsVGFwKGUpIHtcclxuICAgICAgICAvLyBGaXhlcyBmaXJlZm94IGRyYWdnYWJsZSBpbWFnZSBidWdcclxuICAgICAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJyAmJiAkKGUudGFyZ2V0KS5pcygnaW1nJykpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmVzc2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmRyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZlcnRpY2FsRHJhZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmVmZXJlbmNlID0gdGhpcy5feHBvcyhlKTtcclxuICAgICAgICB0aGlzLnJlZmVyZW5jZVkgPSB0aGlzLl95cG9zKGUpO1xyXG5cclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5hbXBsaXR1ZGUgPSAwO1xyXG4gICAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLm9mZnNldDtcclxuICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpY2tlcik7XHJcbiAgICAgICAgdGhpcy50aWNrZXIgPSBzZXRJbnRlcnZhbCh0aGlzLl90cmFja0JvdW5kLCAxMDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIENhcm91c2VsIERyYWdcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ2Fyb3VzZWxEcmFnXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ2Fyb3VzZWxEcmFnKGUpIHtcclxuICAgICAgICB2YXIgeCA9IHZvaWQgMCxcclxuICAgICAgICAgICAgeSA9IHZvaWQgMCxcclxuICAgICAgICAgICAgZGVsdGEgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIGRlbHRhWSA9IHZvaWQgMDtcclxuICAgICAgICBpZiAodGhpcy5wcmVzc2VkKSB7XHJcbiAgICAgICAgICB4ID0gdGhpcy5feHBvcyhlKTtcclxuICAgICAgICAgIHkgPSB0aGlzLl95cG9zKGUpO1xyXG4gICAgICAgICAgZGVsdGEgPSB0aGlzLnJlZmVyZW5jZSAtIHg7XHJcbiAgICAgICAgICBkZWx0YVkgPSBNYXRoLmFicyh0aGlzLnJlZmVyZW5jZVkgLSB5KTtcclxuICAgICAgICAgIGlmIChkZWx0YVkgPCAzMCAmJiAhdGhpcy52ZXJ0aWNhbERyYWdnZWQpIHtcclxuICAgICAgICAgICAgLy8gSWYgdmVydGljYWwgc2Nyb2xsaW5nIGRvbid0IGFsbG93IGRyYWdnaW5nLlxyXG4gICAgICAgICAgICBpZiAoZGVsdGEgPiAyIHx8IGRlbHRhIDwgLTIpIHtcclxuICAgICAgICAgICAgICB0aGlzLmRyYWdnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlID0geDtcclxuICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwodGhpcy5vZmZzZXQgKyBkZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kcmFnZ2VkKSB7XHJcbiAgICAgICAgICAgIC8vIElmIGRyYWdnaW5nIGRvbid0IGFsbG93IHZlcnRpY2FsIHNjcm9sbC5cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBWZXJ0aWNhbCBzY3JvbGxpbmcuXHJcbiAgICAgICAgICAgIHRoaXMudmVydGljYWxEcmFnZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWQpIHtcclxuICAgICAgICAgIC8vIElmIGRyYWdnaW5nIGRvbid0IGFsbG93IHZlcnRpY2FsIHNjcm9sbC5cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIENhcm91c2VsIFJlbGVhc2VcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ2Fyb3VzZWxSZWxlYXNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQ2Fyb3VzZWxSZWxlYXNlKGUpIHtcclxuICAgICAgICBpZiAodGhpcy5wcmVzc2VkKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpY2tlcik7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLm9mZnNldDtcclxuICAgICAgICBpZiAodGhpcy52ZWxvY2l0eSA+IDEwIHx8IHRoaXMudmVsb2NpdHkgPCAtMTApIHtcclxuICAgICAgICAgIHRoaXMuYW1wbGl0dWRlID0gMC45ICogdGhpcy52ZWxvY2l0eTtcclxuICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5vZmZzZXQgKyB0aGlzLmFtcGxpdHVkZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBNYXRoLnJvdW5kKHRoaXMudGFyZ2V0IC8gdGhpcy5kaW0pICogdGhpcy5kaW07XHJcblxyXG4gICAgICAgIC8vIE5vIHdyYXAgb2YgaXRlbXMuXHJcbiAgICAgICAgaWYgKHRoaXMubm9XcmFwKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy50YXJnZXQgPj0gdGhpcy5kaW0gKiAodGhpcy5jb3VudCAtIDEpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5kaW0gKiAodGhpcy5jb3VudCAtIDEpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRhcmdldCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFtcGxpdHVkZSA9IHRoaXMudGFyZ2V0IC0gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgdGhpcy50aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hdXRvU2Nyb2xsQm91bmQpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2VkKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgQ2Fyb3VzZWwgQ0xpY2tcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlQ2Fyb3VzZWxDbGlja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZUNhcm91c2VsQ2xpY2soZSkge1xyXG4gICAgICAgIC8vIERpc2FibGUgY2xpY2tzIGlmIGNhcm91c2VsIHdhcyBkcmFnZ2VkLlxyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWQpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmZ1bGxXaWR0aCkge1xyXG4gICAgICAgICAgdmFyIGNsaWNrZWRJbmRleCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5jYXJvdXNlbC1pdGVtJykuaW5kZXgoKTtcclxuICAgICAgICAgIHZhciBkaWZmID0gdGhpcy5fd3JhcCh0aGlzLmNlbnRlcikgLSBjbGlja2VkSW5kZXg7XHJcblxyXG4gICAgICAgICAgLy8gRGlzYWJsZSBjbGlja3MgaWYgY2Fyb3VzZWwgd2FzIHNoaWZ0ZWQgYnkgY2xpY2tcclxuICAgICAgICAgIGlmIChkaWZmICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuX2N5Y2xlVG8oY2xpY2tlZEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgSW5kaWNhdG9yIENMaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUluZGljYXRvckNsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlSW5kaWNhdG9yQ2xpY2soZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIHZhciBpbmRpY2F0b3IgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuaW5kaWNhdG9yLWl0ZW0nKTtcclxuICAgICAgICBpZiAoaW5kaWNhdG9yLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5fY3ljbGVUbyhpbmRpY2F0b3IuaW5kZXgoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFRocm90dGxlIFJlc2l6ZVxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVSZXNpemVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVSZXNpemUoZSkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZnVsbFdpZHRoKSB7XHJcbiAgICAgICAgICB0aGlzLml0ZW1XaWR0aCA9IHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykuZmlyc3QoKS5pbm5lcldpZHRoKCk7XHJcbiAgICAgICAgICB0aGlzLmltYWdlSGVpZ2h0ID0gdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0uYWN0aXZlJykuaGVpZ2h0KCk7XHJcbiAgICAgICAgICB0aGlzLmRpbSA9IHRoaXMuaXRlbVdpZHRoICogMiArIHRoaXMub3B0aW9ucy5wYWRkaW5nO1xyXG4gICAgICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLmNlbnRlciAqIDIgKiB0aGlzLml0ZW1XaWR0aDtcclxuICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgICB0aGlzLl9zZXRDYXJvdXNlbEhlaWdodCh0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fc2Nyb2xsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0IGNhcm91c2VsIGhlaWdodCBiYXNlZCBvbiBmaXJzdCBzbGlkZVxyXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW19IGltYWdlT25seSAtIHRydWUgZm9yIGltYWdlIHNsaWRlc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0Q2Fyb3VzZWxIZWlnaHRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRDYXJvdXNlbEhlaWdodChpbWFnZU9ubHkpIHtcclxuICAgICAgICB2YXIgX3RoaXM2NSA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBmaXJzdFNsaWRlID0gdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0uYWN0aXZlJykubGVuZ3RoID8gdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0uYWN0aXZlJykuZmlyc3QoKSA6IHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykuZmlyc3QoKTtcclxuICAgICAgICB2YXIgZmlyc3RJbWFnZSA9IGZpcnN0U2xpZGUuZmluZCgnaW1nJykuZmlyc3QoKTtcclxuICAgICAgICBpZiAoZmlyc3RJbWFnZS5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmIChmaXJzdEltYWdlWzBdLmNvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgIC8vIElmIGltYWdlIHdvbid0IHRyaWdnZXIgdGhlIGxvYWQgZXZlbnRcclxuICAgICAgICAgICAgdmFyIGltYWdlSGVpZ2h0ID0gZmlyc3RJbWFnZS5oZWlnaHQoKTtcclxuICAgICAgICAgICAgaWYgKGltYWdlSGVpZ2h0ID4gMCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnaGVpZ2h0JywgaW1hZ2VIZWlnaHQgKyAncHgnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBJZiBpbWFnZSBzdGlsbCBoYXMgbm8gaGVpZ2h0LCB1c2UgdGhlIG5hdHVyYWwgZGltZW5zaW9ucyB0byBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICB2YXIgbmF0dXJhbFdpZHRoID0gZmlyc3RJbWFnZVswXS5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgICAgICAgdmFyIG5hdHVyYWxIZWlnaHQgPSBmaXJzdEltYWdlWzBdLm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgdmFyIGFkanVzdGVkSGVpZ2h0ID0gdGhpcy4kZWwud2lkdGgoKSAvIG5hdHVyYWxXaWR0aCAqIG5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgdGhpcy4kZWwuY3NzKCdoZWlnaHQnLCBhZGp1c3RlZEhlaWdodCArICdweCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBHZXQgaGVpZ2h0IHdoZW4gaW1hZ2UgaXMgbG9hZGVkIG5vcm1hbGx5XHJcbiAgICAgICAgICAgIGZpcnN0SW1hZ2Uub25lKCdsb2FkJywgZnVuY3Rpb24gKGVsLCBpKSB7XHJcbiAgICAgICAgICAgICAgX3RoaXM2NS4kZWwuY3NzKCdoZWlnaHQnLCBlbC5vZmZzZXRIZWlnaHQgKyAncHgnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICghaW1hZ2VPbmx5KSB7XHJcbiAgICAgICAgICB2YXIgc2xpZGVIZWlnaHQgPSBmaXJzdFNsaWRlLmhlaWdodCgpO1xyXG4gICAgICAgICAgdGhpcy4kZWwuY3NzKCdoZWlnaHQnLCBzbGlkZUhlaWdodCArICdweCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCB4IHBvc2l0aW9uIGZyb20gZXZlbnRcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfeHBvc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3hwb3MoZSkge1xyXG4gICAgICAgIC8vIHRvdWNoIGV2ZW50XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgIHJldHVybiBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vdXNlIGV2ZW50XHJcbiAgICAgICAgcmV0dXJuIGUuY2xpZW50WDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCB5IHBvc2l0aW9uIGZyb20gZXZlbnRcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfeXBvc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3lwb3MoZSkge1xyXG4gICAgICAgIC8vIHRvdWNoIGV2ZW50XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgIHJldHVybiBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vdXNlIGV2ZW50XHJcbiAgICAgICAgcmV0dXJuIGUuY2xpZW50WTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFdyYXAgaW5kZXhcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3dyYXBcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF93cmFwKHgpIHtcclxuICAgICAgICByZXR1cm4geCA+PSB0aGlzLmNvdW50ID8geCAlIHRoaXMuY291bnQgOiB4IDwgMCA/IHRoaXMuX3dyYXAodGhpcy5jb3VudCArIHggJSB0aGlzLmNvdW50KSA6IHg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUcmFja3Mgc2Nyb2xsaW5nIGluZm9ybWF0aW9uXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl90cmFja1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3RyYWNrKCkge1xyXG4gICAgICAgIHZhciBub3cgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIGVsYXBzZWQgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIGRlbHRhID0gdm9pZCAwLFxyXG4gICAgICAgICAgICB2ID0gdm9pZCAwO1xyXG5cclxuICAgICAgICBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGVsYXBzZWQgPSBub3cgLSB0aGlzLnRpbWVzdGFtcDtcclxuICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IG5vdztcclxuICAgICAgICBkZWx0YSA9IHRoaXMub2Zmc2V0IC0gdGhpcy5mcmFtZTtcclxuICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gICAgICAgIHYgPSAxMDAwICogZGVsdGEgLyAoMSArIGVsYXBzZWQpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSAwLjggKiB2ICsgMC4yICogdGhpcy52ZWxvY2l0eTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEF1dG8gc2Nyb2xscyB0byBuZWFyZXN0IGNhcm91c2VsIGl0ZW0uXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hdXRvU2Nyb2xsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYXV0b1Njcm9sbCgpIHtcclxuICAgICAgICB2YXIgZWxhcHNlZCA9IHZvaWQgMCxcclxuICAgICAgICAgICAgZGVsdGEgPSB2b2lkIDA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFtcGxpdHVkZSkge1xyXG4gICAgICAgICAgZWxhcHNlZCA9IERhdGUubm93KCkgLSB0aGlzLnRpbWVzdGFtcDtcclxuICAgICAgICAgIGRlbHRhID0gdGhpcy5hbXBsaXR1ZGUgKiBNYXRoLmV4cCgtZWxhcHNlZCAvIHRoaXMub3B0aW9ucy5kdXJhdGlvbik7XHJcbiAgICAgICAgICBpZiAoZGVsdGEgPiAyIHx8IGRlbHRhIDwgLTIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsKHRoaXMudGFyZ2V0IC0gZGVsdGEpO1xyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYXV0b1Njcm9sbEJvdW5kKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2Nyb2xsIHRvIHRhcmdldFxyXG4gICAgICAgKiBAcGFyYW0ge051bWJlcn0geFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2Nyb2xsXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2Nyb2xsKHgpIHtcclxuICAgICAgICB2YXIgX3RoaXM2NiA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIFRyYWNrIHNjcm9sbGluZyBzdGF0ZVxyXG4gICAgICAgIGlmICghdGhpcy4kZWwuaGFzQ2xhc3MoJ3Njcm9sbGluZycpKSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGluZycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zY3JvbGxpbmdUaW1lb3V0ICE9IG51bGwpIHtcclxuICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5zY3JvbGxpbmdUaW1lb3V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY3JvbGxpbmdUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgX3RoaXM2Ni4kZWwucmVtb3ZlQ2xhc3MoJ3Njcm9sbGluZycpO1xyXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5kdXJhdGlvbik7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IGFjdHVhbCBzY3JvbGxcclxuICAgICAgICB2YXIgaSA9IHZvaWQgMCxcclxuICAgICAgICAgICAgaGFsZiA9IHZvaWQgMCxcclxuICAgICAgICAgICAgZGVsdGEgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIGRpciA9IHZvaWQgMCxcclxuICAgICAgICAgICAgdHdlZW4gPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIGVsID0gdm9pZCAwLFxyXG4gICAgICAgICAgICBhbGlnbm1lbnQgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIHpUcmFuc2xhdGlvbiA9IHZvaWQgMCxcclxuICAgICAgICAgICAgdHdlZW5lZE9wYWNpdHkgPSB2b2lkIDAsXHJcbiAgICAgICAgICAgIGNlbnRlclR3ZWVuZWRPcGFjaXR5ID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBsYXN0Q2VudGVyID0gdGhpcy5jZW50ZXI7XHJcbiAgICAgICAgdmFyIG51bVZpc2libGVPZmZzZXQgPSAxIC8gdGhpcy5vcHRpb25zLm51bVZpc2libGU7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gdHlwZW9mIHggPT09ICdudW1iZXInID8geCA6IHRoaXMub2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuY2VudGVyID0gTWF0aC5mbG9vcigodGhpcy5vZmZzZXQgKyB0aGlzLmRpbSAvIDIpIC8gdGhpcy5kaW0pO1xyXG4gICAgICAgIGRlbHRhID0gdGhpcy5vZmZzZXQgLSB0aGlzLmNlbnRlciAqIHRoaXMuZGltO1xyXG4gICAgICAgIGRpciA9IGRlbHRhIDwgMCA/IDEgOiAtMTtcclxuICAgICAgICB0d2VlbiA9IC1kaXIgKiBkZWx0YSAqIDIgLyB0aGlzLmRpbTtcclxuICAgICAgICBoYWxmID0gdGhpcy5jb3VudCA+PiAxO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZ1bGxXaWR0aCkge1xyXG4gICAgICAgICAgYWxpZ25tZW50ID0gJ3RyYW5zbGF0ZVgoMCknO1xyXG4gICAgICAgICAgY2VudGVyVHdlZW5lZE9wYWNpdHkgPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhbGlnbm1lbnQgPSAndHJhbnNsYXRlWCgnICsgKHRoaXMuZWwuY2xpZW50V2lkdGggLSB0aGlzLml0ZW1XaWR0aCkgLyAyICsgJ3B4KSAnO1xyXG4gICAgICAgICAgYWxpZ25tZW50ICs9ICd0cmFuc2xhdGVZKCcgKyAodGhpcy5lbC5jbGllbnRIZWlnaHQgLSB0aGlzLml0ZW1IZWlnaHQpIC8gMiArICdweCknO1xyXG4gICAgICAgICAgY2VudGVyVHdlZW5lZE9wYWNpdHkgPSAxIC0gbnVtVmlzaWJsZU9mZnNldCAqIHR3ZWVuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IGluZGljYXRvciBhY3RpdmVcclxuICAgICAgICBpZiAodGhpcy5zaG93SW5kaWNhdG9ycykge1xyXG4gICAgICAgICAgdmFyIGRpZmYgPSB0aGlzLmNlbnRlciAlIHRoaXMuY291bnQ7XHJcbiAgICAgICAgICB2YXIgYWN0aXZlSW5kaWNhdG9yID0gdGhpcy4kaW5kaWNhdG9ycy5maW5kKCcuaW5kaWNhdG9yLWl0ZW0uYWN0aXZlJyk7XHJcbiAgICAgICAgICBpZiAoYWN0aXZlSW5kaWNhdG9yLmluZGV4KCkgIT09IGRpZmYpIHtcclxuICAgICAgICAgICAgYWN0aXZlSW5kaWNhdG9yLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy4kaW5kaWNhdG9ycy5maW5kKCcuaW5kaWNhdG9yLWl0ZW0nKS5lcShkaWZmKVswXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNlbnRlclxyXG4gICAgICAgIC8vIERvbid0IHNob3cgd3JhcHBlZCBpdGVtcy5cclxuICAgICAgICBpZiAoIXRoaXMubm9XcmFwIHx8IHRoaXMuY2VudGVyID49IDAgJiYgdGhpcy5jZW50ZXIgPCB0aGlzLmNvdW50KSB7XHJcbiAgICAgICAgICBlbCA9IHRoaXMuaW1hZ2VzW3RoaXMuX3dyYXAodGhpcy5jZW50ZXIpXTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgYWN0aXZlIGNsYXNzIHRvIGNlbnRlciBpdGVtLlxyXG4gICAgICAgICAgaWYgKCEkKGVsKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnLmNhcm91c2VsLWl0ZW0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFyIHRyYW5zZm9ybVN0cmluZyA9IGFsaWdubWVudCArIFwiIHRyYW5zbGF0ZVgoXCIgKyAtZGVsdGEgLyAyICsgXCJweCkgdHJhbnNsYXRlWChcIiArIGRpciAqIHRoaXMub3B0aW9ucy5zaGlmdCAqIHR3ZWVuICogaSArIFwicHgpIHRyYW5zbGF0ZVooXCIgKyB0aGlzLm9wdGlvbnMuZGlzdCAqIHR3ZWVuICsgXCJweClcIjtcclxuICAgICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1TdHlsZShlbCwgY2VudGVyVHdlZW5lZE9wYWNpdHksIDAsIHRyYW5zZm9ybVN0cmluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IGhhbGY7ICsraSkge1xyXG4gICAgICAgICAgLy8gcmlnaHQgc2lkZVxyXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mdWxsV2lkdGgpIHtcclxuICAgICAgICAgICAgelRyYW5zbGF0aW9uID0gdGhpcy5vcHRpb25zLmRpc3Q7XHJcbiAgICAgICAgICAgIHR3ZWVuZWRPcGFjaXR5ID0gaSA9PT0gaGFsZiAmJiBkZWx0YSA8IDAgPyAxIC0gdHdlZW4gOiAxO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgelRyYW5zbGF0aW9uID0gdGhpcy5vcHRpb25zLmRpc3QgKiAoaSAqIDIgKyB0d2VlbiAqIGRpcik7XHJcbiAgICAgICAgICAgIHR3ZWVuZWRPcGFjaXR5ID0gMSAtIG51bVZpc2libGVPZmZzZXQgKiAoaSAqIDIgKyB0d2VlbiAqIGRpcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBEb24ndCBzaG93IHdyYXBwZWQgaXRlbXMuXHJcbiAgICAgICAgICBpZiAoIXRoaXMubm9XcmFwIHx8IHRoaXMuY2VudGVyICsgaSA8IHRoaXMuY291bnQpIHtcclxuICAgICAgICAgICAgZWwgPSB0aGlzLmltYWdlc1t0aGlzLl93cmFwKHRoaXMuY2VudGVyICsgaSldO1xyXG4gICAgICAgICAgICB2YXIgX3RyYW5zZm9ybVN0cmluZyA9IGFsaWdubWVudCArIFwiIHRyYW5zbGF0ZVgoXCIgKyAodGhpcy5vcHRpb25zLnNoaWZ0ICsgKHRoaXMuZGltICogaSAtIGRlbHRhKSAvIDIpICsgXCJweCkgdHJhbnNsYXRlWihcIiArIHpUcmFuc2xhdGlvbiArIFwicHgpXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1TdHlsZShlbCwgdHdlZW5lZE9wYWNpdHksIC1pLCBfdHJhbnNmb3JtU3RyaW5nKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBsZWZ0IHNpZGVcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZnVsbFdpZHRoKSB7XHJcbiAgICAgICAgICAgIHpUcmFuc2xhdGlvbiA9IHRoaXMub3B0aW9ucy5kaXN0O1xyXG4gICAgICAgICAgICB0d2VlbmVkT3BhY2l0eSA9IGkgPT09IGhhbGYgJiYgZGVsdGEgPiAwID8gMSAtIHR3ZWVuIDogMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHpUcmFuc2xhdGlvbiA9IHRoaXMub3B0aW9ucy5kaXN0ICogKGkgKiAyIC0gdHdlZW4gKiBkaXIpO1xyXG4gICAgICAgICAgICB0d2VlbmVkT3BhY2l0eSA9IDEgLSBudW1WaXNpYmxlT2Zmc2V0ICogKGkgKiAyIC0gdHdlZW4gKiBkaXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gRG9uJ3Qgc2hvdyB3cmFwcGVkIGl0ZW1zLlxyXG4gICAgICAgICAgaWYgKCF0aGlzLm5vV3JhcCB8fCB0aGlzLmNlbnRlciAtIGkgPj0gMCkge1xyXG4gICAgICAgICAgICBlbCA9IHRoaXMuaW1hZ2VzW3RoaXMuX3dyYXAodGhpcy5jZW50ZXIgLSBpKV07XHJcbiAgICAgICAgICAgIHZhciBfdHJhbnNmb3JtU3RyaW5nMiA9IGFsaWdubWVudCArIFwiIHRyYW5zbGF0ZVgoXCIgKyAoLXRoaXMub3B0aW9ucy5zaGlmdCArICgtdGhpcy5kaW0gKiBpIC0gZGVsdGEpIC8gMikgKyBcInB4KSB0cmFuc2xhdGVaKFwiICsgelRyYW5zbGF0aW9uICsgXCJweClcIjtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlSXRlbVN0eWxlKGVsLCB0d2VlbmVkT3BhY2l0eSwgLWksIF90cmFuc2Zvcm1TdHJpbmcyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNlbnRlclxyXG4gICAgICAgIC8vIERvbid0IHNob3cgd3JhcHBlZCBpdGVtcy5cclxuICAgICAgICBpZiAoIXRoaXMubm9XcmFwIHx8IHRoaXMuY2VudGVyID49IDAgJiYgdGhpcy5jZW50ZXIgPCB0aGlzLmNvdW50KSB7XHJcbiAgICAgICAgICBlbCA9IHRoaXMuaW1hZ2VzW3RoaXMuX3dyYXAodGhpcy5jZW50ZXIpXTtcclxuICAgICAgICAgIHZhciBfdHJhbnNmb3JtU3RyaW5nMyA9IGFsaWdubWVudCArIFwiIHRyYW5zbGF0ZVgoXCIgKyAtZGVsdGEgLyAyICsgXCJweCkgdHJhbnNsYXRlWChcIiArIGRpciAqIHRoaXMub3B0aW9ucy5zaGlmdCAqIHR3ZWVuICsgXCJweCkgdHJhbnNsYXRlWihcIiArIHRoaXMub3B0aW9ucy5kaXN0ICogdHdlZW4gKyBcInB4KVwiO1xyXG4gICAgICAgICAgdGhpcy5fdXBkYXRlSXRlbVN0eWxlKGVsLCBjZW50ZXJUd2VlbmVkT3BhY2l0eSwgMCwgX3RyYW5zZm9ybVN0cmluZzMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25DeWNsZVRvIGNhbGxiYWNrXHJcbiAgICAgICAgdmFyICRjdXJySXRlbSA9IHRoaXMuJGVsLmZpbmQoJy5jYXJvdXNlbC1pdGVtJykuZXEodGhpcy5fd3JhcCh0aGlzLmNlbnRlcikpO1xyXG4gICAgICAgIGlmIChsYXN0Q2VudGVyICE9PSB0aGlzLmNlbnRlciAmJiB0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ3ljbGVUbyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uQ3ljbGVUby5jYWxsKHRoaXMsICRjdXJySXRlbVswXSwgdGhpcy5kcmFnZ2VkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9uZSB0aW1lIGNhbGxiYWNrXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9uZVRpbWVDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhpcy5vbmVUaW1lQ2FsbGJhY2suY2FsbCh0aGlzLCAkY3Vyckl0ZW1bMF0sIHRoaXMuZHJhZ2dlZCk7XHJcbiAgICAgICAgICB0aGlzLm9uZVRpbWVDYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ3ljbGUgdG8gdGFyZ2V0XHJcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wYWNpdHlcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHpJbmRleFxyXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNmb3JtXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl91cGRhdGVJdGVtU3R5bGVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF91cGRhdGVJdGVtU3R5bGUoZWwsIG9wYWNpdHksIHpJbmRleCwgdHJhbnNmb3JtKSB7XHJcbiAgICAgICAgZWwuc3R5bGVbdGhpcy54Zm9ybV0gPSB0cmFuc2Zvcm07XHJcbiAgICAgICAgZWwuc3R5bGUuekluZGV4ID0gekluZGV4O1xyXG4gICAgICAgIGVsLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgIGVsLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDeWNsZSB0byB0YXJnZXRcclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG5cclxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2N5Y2xlVG9cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9jeWNsZVRvKG4sIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIGRpZmYgPSB0aGlzLmNlbnRlciAlIHRoaXMuY291bnQgLSBuO1xyXG5cclxuICAgICAgICAvLyBBY2NvdW50IGZvciB3cmFwYXJvdW5kLlxyXG4gICAgICAgIGlmICghdGhpcy5ub1dyYXApIHtcclxuICAgICAgICAgIGlmIChkaWZmIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZiArIHRoaXMuY291bnQpIDwgTWF0aC5hYnMoZGlmZikpIHtcclxuICAgICAgICAgICAgICBkaWZmICs9IHRoaXMuY291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRpZmYgLSB0aGlzLmNvdW50KSA8IGRpZmYpIHtcclxuICAgICAgICAgICAgICBkaWZmIC09IHRoaXMuY291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5kaW0gKiBNYXRoLnJvdW5kKHRoaXMub2Zmc2V0IC8gdGhpcy5kaW0pO1xyXG4gICAgICAgIC8vIE5leHRcclxuICAgICAgICBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICAgIHRoaXMudGFyZ2V0ICs9IHRoaXMuZGltICogTWF0aC5hYnMoZGlmZik7XHJcblxyXG4gICAgICAgICAgLy8gUHJldlxyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICAgIHRoaXMudGFyZ2V0IC09IHRoaXMuZGltICogZGlmZjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCBvbmUgdGltZSBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub25lVGltZUNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTY3JvbGxcclxuICAgICAgICBpZiAodGhpcy5vZmZzZXQgIT09IHRoaXMudGFyZ2V0KSB7XHJcbiAgICAgICAgICB0aGlzLmFtcGxpdHVkZSA9IHRoaXMudGFyZ2V0IC0gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYXV0b1Njcm9sbEJvdW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDeWNsZSB0byBuZXh0IGl0ZW1cclxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IFtuXVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJuZXh0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBuZXh0KG4pIHtcclxuICAgICAgICBpZiAobiA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKG4pKSB7XHJcbiAgICAgICAgICBuID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuY2VudGVyICsgbjtcclxuICAgICAgICBpZiAoaW5kZXggPj0gdGhpcy5jb3VudCB8fCBpbmRleCA8IDApIHtcclxuICAgICAgICAgIGlmICh0aGlzLm5vV3JhcCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaW5kZXggPSB0aGlzLl93cmFwKGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY3ljbGVUbyhpbmRleCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDeWNsZSB0byBwcmV2aW91cyBpdGVtXHJcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbl1cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwicHJldlwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcHJldihuKSB7XHJcbiAgICAgICAgaWYgKG4gPT09IHVuZGVmaW5lZCB8fCBpc05hTihuKSkge1xyXG4gICAgICAgICAgbiA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmNlbnRlciAtIG47XHJcbiAgICAgICAgaWYgKGluZGV4ID49IHRoaXMuY291bnQgfHwgaW5kZXggPCAwKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5ub1dyYXApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGluZGV4ID0gdGhpcy5fd3JhcChpbmRleCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jeWNsZVRvKGluZGV4KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEN5Y2xlIHRvIG50aCBpdGVtXHJcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbl1cclxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwic2V0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXQobiwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAobiA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKG4pKSB7XHJcbiAgICAgICAgICBuID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuID4gdGhpcy5jb3VudCB8fCBuIDwgMCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMubm9XcmFwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBuID0gdGhpcy5fd3JhcChuKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2N5Y2xlVG8obiwgY2FsbGJhY2spO1xyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoQ2Fyb3VzZWwuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDYXJvdXNlbCksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9DYXJvdXNlbDtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBDYXJvdXNlbDtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIE0uQ2Fyb3VzZWwgPSBDYXJvdXNlbDtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKENhcm91c2VsLCAnY2Fyb3VzZWwnLCAnTV9DYXJvdXNlbCcpO1xyXG4gIH1cclxufSkoY2FzaCk7XHJcbjsoZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBfZGVmYXVsdHMgPSB7XHJcbiAgICBvbk9wZW46IHVuZGVmaW5lZCxcclxuICAgIG9uQ2xvc2U6IHVuZGVmaW5lZFxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBUYXBUYXJnZXQgPSBmdW5jdGlvbiAoX0NvbXBvbmVudDE5KSB7XHJcbiAgICBfaW5oZXJpdHMoVGFwVGFyZ2V0LCBfQ29tcG9uZW50MTkpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IFRhcFRhcmdldCBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUYXBUYXJnZXQoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRhcFRhcmdldCk7XHJcblxyXG4gICAgICB2YXIgX3RoaXM2NyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChUYXBUYXJnZXQuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUYXBUYXJnZXQpKS5jYWxsKHRoaXMsIFRhcFRhcmdldCwgZWwsIG9wdGlvbnMpKTtcclxuXHJcbiAgICAgIF90aGlzNjcuZWwuTV9UYXBUYXJnZXQgPSBfdGhpczY3O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSBzZWxlY3RcclxuICAgICAgICogQG1lbWJlciBUYXBUYXJnZXQjb3B0aW9uc1xyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uT3BlbiAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIGZlYXR1cmUgZGlzY292ZXJ5IGlzIG9wZW5lZFxyXG4gICAgICAgKiBAcHJvcCB7RnVuY3Rpb259IG9uQ2xvc2UgLSBDYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2hlbiBmZWF0dXJlIGRpc2NvdmVyeSBpcyBjbG9zZWRcclxuICAgICAgICovXHJcbiAgICAgIF90aGlzNjcub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYXBUYXJnZXQuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgX3RoaXM2Ny5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIHNldHVwXHJcbiAgICAgIF90aGlzNjcuJG9yaWdpbiA9ICQoJyMnICsgX3RoaXM2Ny4kZWwuYXR0cignZGF0YS10YXJnZXQnKSk7XHJcbiAgICAgIF90aGlzNjcuX3NldHVwKCk7XHJcblxyXG4gICAgICBfdGhpczY3Ll9jYWxjdWxhdGVQb3NpdGlvbmluZygpO1xyXG4gICAgICBfdGhpczY3Ll9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgcmV0dXJuIF90aGlzNjc7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKFRhcFRhcmdldCwgW3tcclxuICAgICAga2V5OiBcImRlc3Ryb3lcIixcclxuXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogVGVhcmRvd24gY29tcG9uZW50XHJcbiAgICAgICAqL1xyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5lbC5UYXBUYXJnZXQgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCA9IHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVUYXJnZXRDbGlja0JvdW5kID0gdGhpcy5faGFuZGxlVGFyZ2V0Q2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVPcmlnaW5DbGlja0JvdW5kID0gdGhpcy5faGFuZGxlT3JpZ2luQ2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZVRhcmdldENsaWNrQm91bmQpO1xyXG4gICAgICAgIHRoaXMub3JpZ2luRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVPcmlnaW5DbGlja0JvdW5kKTtcclxuXHJcbiAgICAgICAgLy8gUmVzaXplXHJcbiAgICAgICAgdmFyIHRocm90dGxlZFJlc2l6ZSA9IE0udGhyb3R0bGUodGhpcy5faGFuZGxlUmVzaXplLCAyMDApO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kID0gdGhyb3R0bGVkUmVzaXplLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVUaHJvdHRsZWRSZXNpemVCb3VuZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUYXJnZXRDbGlja0JvdW5kKTtcclxuICAgICAgICB0aGlzLm9yaWdpbkVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlT3JpZ2luQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVRocm90dGxlZFJlc2l6ZUJvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBUYXJnZXQgQ2xpY2tcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlVGFyZ2V0Q2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVUYXJnZXRDbGljayhlKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgT3JpZ2luIENsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZU9yaWdpbkNsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlT3JpZ2luQ2xpY2soZSkge1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBSZXNpemVcclxuICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlUmVzaXplXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlUmVzaXplKGUpIHtcclxuICAgICAgICB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbmluZygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFJlc2l6ZVxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVEb2N1bWVudENsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlRG9jdW1lbnRDbGljayhlKSB7XHJcbiAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFwLXRhcmdldC13cmFwcGVyJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIFRhcCBUYXJnZXRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXAoKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRpbmcgdGFwIHRhcmdldFxyXG4gICAgICAgIHRoaXMud3JhcHBlciA9IHRoaXMuJGVsLnBhcmVudCgpWzBdO1xyXG4gICAgICAgIHRoaXMud2F2ZUVsID0gJCh0aGlzLndyYXBwZXIpLmZpbmQoJy50YXAtdGFyZ2V0LXdhdmUnKVswXTtcclxuICAgICAgICB0aGlzLm9yaWdpbkVsID0gJCh0aGlzLndyYXBwZXIpLmZpbmQoJy50YXAtdGFyZ2V0LW9yaWdpbicpWzBdO1xyXG4gICAgICAgIHRoaXMuY29udGVudEVsID0gdGhpcy4kZWwuZmluZCgnLnRhcC10YXJnZXQtY29udGVudCcpWzBdO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGluZyB3cmFwcGVyXHJcbiAgICAgICAgaWYgKCEkKHRoaXMud3JhcHBlcikuaGFzQ2xhc3MoJy50YXAtdGFyZ2V0LXdyYXBwZXInKSkge1xyXG4gICAgICAgICAgdGhpcy53cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICB0aGlzLndyYXBwZXIuY2xhc3NMaXN0LmFkZCgndGFwLXRhcmdldC13cmFwcGVyJyk7XHJcbiAgICAgICAgICB0aGlzLiRlbC5iZWZvcmUoJCh0aGlzLndyYXBwZXIpKTtcclxuICAgICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmQodGhpcy5lbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGluZyBjb250ZW50XHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRlbnRFbCkge1xyXG4gICAgICAgICAgdGhpcy5jb250ZW50RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgIHRoaXMuY29udGVudEVsLmNsYXNzTGlzdC5hZGQoJ3RhcC10YXJnZXQtY29udGVudCcpO1xyXG4gICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKHRoaXMuY29udGVudEVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0aW5nIGZvcmVncm91bmQgd2F2ZVxyXG4gICAgICAgIGlmICghdGhpcy53YXZlRWwpIHtcclxuICAgICAgICAgIHRoaXMud2F2ZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICB0aGlzLndhdmVFbC5jbGFzc0xpc3QuYWRkKCd0YXAtdGFyZ2V0LXdhdmUnKTtcclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGluZyBvcmlnaW5cclxuICAgICAgICAgIGlmICghdGhpcy5vcmlnaW5FbCkge1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbkVsID0gdGhpcy4kb3JpZ2luLmNsb25lKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbkVsLmFkZENsYXNzKCd0YXAtdGFyZ2V0LW9yaWdpbicpO1xyXG4gICAgICAgICAgICB0aGlzLm9yaWdpbkVsLnJlbW92ZUF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luRWwucmVtb3ZlQXR0cignc3R5bGUnKTtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5FbCA9IHRoaXMub3JpZ2luRWxbMF07XHJcbiAgICAgICAgICAgIHRoaXMud2F2ZUVsLmFwcGVuZCh0aGlzLm9yaWdpbkVsKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLndyYXBwZXIuYXBwZW5kKHRoaXMud2F2ZUVsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDYWxjdWxhdGUgcG9zaXRpb25pbmdcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NhbGN1bGF0ZVBvc2l0aW9uaW5nXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfY2FsY3VsYXRlUG9zaXRpb25pbmcoKSB7XHJcbiAgICAgICAgLy8gRWxlbWVudCBvciBwYXJlbnQgaXMgZml4ZWQgcG9zaXRpb24/XHJcbiAgICAgICAgdmFyIGlzRml4ZWQgPSB0aGlzLiRvcmlnaW4uY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnO1xyXG4gICAgICAgIGlmICghaXNGaXhlZCkge1xyXG4gICAgICAgICAgdmFyIHBhcmVudHMgPSB0aGlzLiRvcmlnaW4ucGFyZW50cygpO1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlzRml4ZWQgPSAkKHBhcmVudHNbaV0pLmNzcygncG9zaXRpb24nKSA9PSAnZml4ZWQnO1xyXG4gICAgICAgICAgICBpZiAoaXNGaXhlZCkge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGluZyBvcmlnaW5cclxuICAgICAgICB2YXIgb3JpZ2luV2lkdGggPSB0aGlzLiRvcmlnaW4ub3V0ZXJXaWR0aCgpO1xyXG4gICAgICAgIHZhciBvcmlnaW5IZWlnaHQgPSB0aGlzLiRvcmlnaW4ub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgICB2YXIgb3JpZ2luVG9wID0gaXNGaXhlZCA/IHRoaXMuJG9yaWdpbi5vZmZzZXQoKS50b3AgLSBNLmdldERvY3VtZW50U2Nyb2xsVG9wKCkgOiB0aGlzLiRvcmlnaW4ub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgIHZhciBvcmlnaW5MZWZ0ID0gaXNGaXhlZCA/IHRoaXMuJG9yaWdpbi5vZmZzZXQoKS5sZWZ0IC0gTS5nZXREb2N1bWVudFNjcm9sbExlZnQoKSA6IHRoaXMuJG9yaWdpbi5vZmZzZXQoKS5sZWZ0O1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGluZyBzY3JlZW5cclxuICAgICAgICB2YXIgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIHZhciBjZW50ZXJYID0gd2luZG93V2lkdGggLyAyO1xyXG4gICAgICAgIHZhciBjZW50ZXJZID0gd2luZG93SGVpZ2h0IC8gMjtcclxuICAgICAgICB2YXIgaXNMZWZ0ID0gb3JpZ2luTGVmdCA8PSBjZW50ZXJYO1xyXG4gICAgICAgIHZhciBpc1JpZ2h0ID0gb3JpZ2luTGVmdCA+IGNlbnRlclg7XHJcbiAgICAgICAgdmFyIGlzVG9wID0gb3JpZ2luVG9wIDw9IGNlbnRlclk7XHJcbiAgICAgICAgdmFyIGlzQm90dG9tID0gb3JpZ2luVG9wID4gY2VudGVyWTtcclxuICAgICAgICB2YXIgaXNDZW50ZXJYID0gb3JpZ2luTGVmdCA+PSB3aW5kb3dXaWR0aCAqIDAuMjUgJiYgb3JpZ2luTGVmdCA8PSB3aW5kb3dXaWR0aCAqIDAuNzU7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0aW5nIHRhcCB0YXJnZXRcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0V2lkdGggPSB0aGlzLiRlbC5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgdmFyIHRhcFRhcmdldEhlaWdodCA9IHRoaXMuJGVsLm91dGVySGVpZ2h0KCk7XHJcbiAgICAgICAgdmFyIHRhcFRhcmdldFRvcCA9IG9yaWdpblRvcCArIG9yaWdpbkhlaWdodCAvIDIgLSB0YXBUYXJnZXRIZWlnaHQgLyAyO1xyXG4gICAgICAgIHZhciB0YXBUYXJnZXRMZWZ0ID0gb3JpZ2luTGVmdCArIG9yaWdpbldpZHRoIC8gMiAtIHRhcFRhcmdldFdpZHRoIC8gMjtcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0UG9zaXRpb24gPSBpc0ZpeGVkID8gJ2ZpeGVkJyA6ICdhYnNvbHV0ZSc7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0aW5nIGNvbnRlbnRcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0VGV4dFdpZHRoID0gaXNDZW50ZXJYID8gdGFwVGFyZ2V0V2lkdGggOiB0YXBUYXJnZXRXaWR0aCAvIDIgKyBvcmlnaW5XaWR0aDtcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0VGV4dEhlaWdodCA9IHRhcFRhcmdldEhlaWdodCAvIDI7XHJcbiAgICAgICAgdmFyIHRhcFRhcmdldFRleHRUb3AgPSBpc1RvcCA/IHRhcFRhcmdldEhlaWdodCAvIDIgOiAwO1xyXG4gICAgICAgIHZhciB0YXBUYXJnZXRUZXh0Qm90dG9tID0gMDtcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0VGV4dExlZnQgPSBpc0xlZnQgJiYgIWlzQ2VudGVyWCA/IHRhcFRhcmdldFdpZHRoIC8gMiAtIG9yaWdpbldpZHRoIDogMDtcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0VGV4dFJpZ2h0ID0gMDtcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0VGV4dFBhZGRpbmcgPSBvcmlnaW5XaWR0aDtcclxuICAgICAgICB2YXIgdGFwVGFyZ2V0VGV4dEFsaWduID0gaXNCb3R0b20gPyAnYm90dG9tJyA6ICd0b3AnO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGluZyB3YXZlXHJcbiAgICAgICAgdmFyIHRhcFRhcmdldFdhdmVXaWR0aCA9IG9yaWdpbldpZHRoID4gb3JpZ2luSGVpZ2h0ID8gb3JpZ2luV2lkdGggKiAyIDogb3JpZ2luV2lkdGggKiAyO1xyXG4gICAgICAgIHZhciB0YXBUYXJnZXRXYXZlSGVpZ2h0ID0gdGFwVGFyZ2V0V2F2ZVdpZHRoO1xyXG4gICAgICAgIHZhciB0YXBUYXJnZXRXYXZlVG9wID0gdGFwVGFyZ2V0SGVpZ2h0IC8gMiAtIHRhcFRhcmdldFdhdmVIZWlnaHQgLyAyO1xyXG4gICAgICAgIHZhciB0YXBUYXJnZXRXYXZlTGVmdCA9IHRhcFRhcmdldFdpZHRoIC8gMiAtIHRhcFRhcmdldFdhdmVXaWR0aCAvIDI7XHJcblxyXG4gICAgICAgIC8vIFNldHRpbmcgdGFwIHRhcmdldFxyXG4gICAgICAgIHZhciB0YXBUYXJnZXRXcmFwcGVyQ3NzT2JqID0ge307XHJcbiAgICAgICAgdGFwVGFyZ2V0V3JhcHBlckNzc09iai50b3AgPSBpc1RvcCA/IHRhcFRhcmdldFRvcCArICdweCcgOiAnJztcclxuICAgICAgICB0YXBUYXJnZXRXcmFwcGVyQ3NzT2JqLnJpZ2h0ID0gaXNSaWdodCA/IHdpbmRvd1dpZHRoIC0gdGFwVGFyZ2V0TGVmdCAtIHRhcFRhcmdldFdpZHRoICsgJ3B4JyA6ICcnO1xyXG4gICAgICAgIHRhcFRhcmdldFdyYXBwZXJDc3NPYmouYm90dG9tID0gaXNCb3R0b20gPyB3aW5kb3dIZWlnaHQgLSB0YXBUYXJnZXRUb3AgLSB0YXBUYXJnZXRIZWlnaHQgKyAncHgnIDogJyc7XHJcbiAgICAgICAgdGFwVGFyZ2V0V3JhcHBlckNzc09iai5sZWZ0ID0gaXNMZWZ0ID8gdGFwVGFyZ2V0TGVmdCArICdweCcgOiAnJztcclxuICAgICAgICB0YXBUYXJnZXRXcmFwcGVyQ3NzT2JqLnBvc2l0aW9uID0gdGFwVGFyZ2V0UG9zaXRpb247XHJcbiAgICAgICAgJCh0aGlzLndyYXBwZXIpLmNzcyh0YXBUYXJnZXRXcmFwcGVyQ3NzT2JqKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dGluZyBjb250ZW50XHJcbiAgICAgICAgJCh0aGlzLmNvbnRlbnRFbCkuY3NzKHtcclxuICAgICAgICAgIHdpZHRoOiB0YXBUYXJnZXRUZXh0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgaGVpZ2h0OiB0YXBUYXJnZXRUZXh0SGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICAgIHRvcDogdGFwVGFyZ2V0VGV4dFRvcCArICdweCcsXHJcbiAgICAgICAgICByaWdodDogdGFwVGFyZ2V0VGV4dFJpZ2h0ICsgJ3B4JyxcclxuICAgICAgICAgIGJvdHRvbTogdGFwVGFyZ2V0VGV4dEJvdHRvbSArICdweCcsXHJcbiAgICAgICAgICBsZWZ0OiB0YXBUYXJnZXRUZXh0TGVmdCArICdweCcsXHJcbiAgICAgICAgICBwYWRkaW5nOiB0YXBUYXJnZXRUZXh0UGFkZGluZyArICdweCcsXHJcbiAgICAgICAgICB2ZXJ0aWNhbEFsaWduOiB0YXBUYXJnZXRUZXh0QWxpZ25cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2V0dGluZyB3YXZlXHJcbiAgICAgICAgJCh0aGlzLndhdmVFbCkuY3NzKHtcclxuICAgICAgICAgIHRvcDogdGFwVGFyZ2V0V2F2ZVRvcCArICdweCcsXHJcbiAgICAgICAgICBsZWZ0OiB0YXBUYXJnZXRXYXZlTGVmdCArICdweCcsXHJcbiAgICAgICAgICB3aWR0aDogdGFwVGFyZ2V0V2F2ZVdpZHRoICsgJ3B4JyxcclxuICAgICAgICAgIGhlaWdodDogdGFwVGFyZ2V0V2F2ZUhlaWdodCArICdweCdcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wZW4gVGFwVGFyZ2V0XHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIm9wZW5cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbk9wZW4gY2FsbGJhY2tcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbk9wZW4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbk9wZW4uY2FsbCh0aGlzLCB0aGlzLiRvcmlnaW5bMF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQsIHRydWUpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2xvc2UgVGFwIFRhcmdldFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJjbG9zZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzT3Blbikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25DbG9zZSBjYWxsYmFja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2xvc2UgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlLmNhbGwodGhpcywgdGhpcy4kb3JpZ2luWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCwgdHJ1ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2tCb3VuZCk7XHJcbiAgICAgIH1cclxuICAgIH1dLCBbe1xyXG4gICAgICBrZXk6IFwiaW5pdFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChlbHMsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX2dldChUYXBUYXJnZXQuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUYXBUYXJnZXQpLCBcImluaXRcIiwgdGhpcykuY2FsbCh0aGlzLCB0aGlzLCBlbHMsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IEluc3RhbmNlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImdldEluc3RhbmNlXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZShlbCkge1xyXG4gICAgICAgIHZhciBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICAgIHJldHVybiBkb21FbGVtLk1fVGFwVGFyZ2V0O1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJkZWZhdWx0c1wiLFxyXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gX2RlZmF1bHRzO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4gICAgcmV0dXJuIFRhcFRhcmdldDtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIE0uVGFwVGFyZ2V0ID0gVGFwVGFyZ2V0O1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoVGFwVGFyZ2V0LCAndGFwVGFyZ2V0JywgJ01fVGFwVGFyZ2V0Jyk7XHJcbiAgfVxyXG59KShjYXNoKTtcclxuOyhmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIF9kZWZhdWx0cyA9IHtcclxuICAgIGNsYXNzZXM6ICcnLFxyXG4gICAgZHJvcGRvd25PcHRpb25zOiB7fVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBGb3JtU2VsZWN0ID0gZnVuY3Rpb24gKF9Db21wb25lbnQyMCkge1xyXG4gICAgX2luaGVyaXRzKEZvcm1TZWxlY3QsIF9Db21wb25lbnQyMCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgRm9ybVNlbGVjdCBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBGb3JtU2VsZWN0KGVsLCBvcHRpb25zKSB7XHJcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGb3JtU2VsZWN0KTtcclxuXHJcbiAgICAgIC8vIERvbid0IGluaXQgaWYgYnJvd3NlciBkZWZhdWx0IHZlcnNpb25cclxuICAgICAgdmFyIF90aGlzNjggPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRm9ybVNlbGVjdC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEZvcm1TZWxlY3QpKS5jYWxsKHRoaXMsIEZvcm1TZWxlY3QsIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBpZiAoX3RoaXM2OC4kZWwuaGFzQ2xhc3MoJ2Jyb3dzZXItZGVmYXVsdCcpKSB7XHJcbiAgICAgICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKF90aGlzNjgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBfdGhpczY4LmVsLk1fRm9ybVNlbGVjdCA9IF90aGlzNjg7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIHNlbGVjdFxyXG4gICAgICAgKiBAbWVtYmVyIEZvcm1TZWxlY3Qjb3B0aW9uc1xyXG4gICAgICAgKi9cclxuICAgICAgX3RoaXM2OC5vcHRpb25zID0gJC5leHRlbmQoe30sIEZvcm1TZWxlY3QuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgX3RoaXM2OC5pc011bHRpcGxlID0gX3RoaXM2OC4kZWwucHJvcCgnbXVsdGlwbGUnKTtcclxuXHJcbiAgICAgIC8vIFNldHVwXHJcbiAgICAgIF90aGlzNjguZWwudGFiSW5kZXggPSAtMTtcclxuICAgICAgX3RoaXM2OC5fa2V5c1NlbGVjdGVkID0ge307XHJcbiAgICAgIF90aGlzNjguX3ZhbHVlRGljdCA9IHt9OyAvLyBNYXBzIGtleSB0byBvcmlnaW5hbCBhbmQgZ2VuZXJhdGVkIG9wdGlvbiBlbGVtZW50LlxyXG4gICAgICBfdGhpczY4Ll9zZXR1cERyb3Bkb3duKCk7XHJcblxyXG4gICAgICBfdGhpczY4Ll9zZXR1cEV2ZW50SGFuZGxlcnMoKTtcclxuICAgICAgcmV0dXJuIF90aGlzNjg7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZUNsYXNzKEZvcm1TZWxlY3QsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZURyb3Bkb3duKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX0Zvcm1TZWxlY3QgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXR1cCBFdmVudCBIYW5kbGVyc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0dXBFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXBFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHZhciBfdGhpczY5ID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5faGFuZGxlU2VsZWN0Q2hhbmdlQm91bmQgPSB0aGlzLl9oYW5kbGVTZWxlY3RDaGFuZ2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVPcHRpb25DbGlja0JvdW5kID0gdGhpcy5faGFuZGxlT3B0aW9uQ2xpY2suYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVJbnB1dENsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVJbnB1dENsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpLmZpbmQoJ2xpOm5vdCgub3B0Z3JvdXApJykuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgX3RoaXM2OS5faGFuZGxlT3B0aW9uQ2xpY2tCb3VuZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9oYW5kbGVTZWxlY3RDaGFuZ2VCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZUlucHV0Q2xpY2tCb3VuZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZUV2ZW50SGFuZGxlcnNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVFdmVudEhhbmRsZXJzKCkge1xyXG4gICAgICAgIHZhciBfdGhpczcwID0gdGhpcztcclxuXHJcbiAgICAgICAgJCh0aGlzLmRyb3Bkb3duT3B0aW9ucykuZmluZCgnbGk6bm90KC5vcHRncm91cCknKS5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfdGhpczcwLl9oYW5kbGVPcHRpb25DbGlja0JvdW5kKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZVNlbGVjdENoYW5nZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlSW5wdXRDbGlja0JvdW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhhbmRsZSBTZWxlY3QgQ2hhbmdlXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVNlbGVjdENoYW5nZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVNlbGVjdENoYW5nZShlKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgT3B0aW9uIENsaWNrXHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZU9wdGlvbkNsaWNrXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlT3B0aW9uQ2xpY2soZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgb3B0aW9uID0gJChlLnRhcmdldCkuY2xvc2VzdCgnbGknKVswXTtcclxuICAgICAgICB2YXIga2V5ID0gb3B0aW9uLmlkO1xyXG4gICAgICAgIGlmICghJChvcHRpb24pLmhhc0NsYXNzKCdkaXNhYmxlZCcpICYmICEkKG9wdGlvbikuaGFzQ2xhc3MoJ29wdGdyb3VwJykgJiYga2V5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgdmFyIHNlbGVjdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICBpZiAodGhpcy5pc011bHRpcGxlKSB7XHJcbiAgICAgICAgICAgIC8vIERlc2VsZWN0IHBsYWNlaG9sZGVyIG9wdGlvbiBpZiBzdGlsbCBzZWxlY3RlZC5cclxuICAgICAgICAgICAgdmFyIHBsYWNlaG9sZGVyT3B0aW9uID0gJCh0aGlzLmRyb3Bkb3duT3B0aW9ucykuZmluZCgnbGkuZGlzYWJsZWQuc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgaWYgKHBsYWNlaG9sZGVyT3B0aW9uLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyT3B0aW9uLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyT3B0aW9uLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgdGhpcy5fdG9nZ2xlRW50cnlGcm9tQXJyYXkocGxhY2Vob2xkZXJPcHRpb25bMF0uaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlbGVjdGVkID0gdGhpcy5fdG9nZ2xlRW50cnlGcm9tQXJyYXkoa2V5KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICQob3B0aW9uKS50b2dnbGVDbGFzcygnc2VsZWN0ZWQnLCBzZWxlY3RlZCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gU2V0IHNlbGVjdGVkIG9uIG9yaWdpbmFsIHNlbGVjdCBvcHRpb25cclxuICAgICAgICAgIC8vIE9ubHkgdHJpZ2dlciBpZiBzZWxlY3RlZCBzdGF0ZSBjaGFuZ2VkXHJcbiAgICAgICAgICB2YXIgcHJldlNlbGVjdGVkID0gJCh0aGlzLl92YWx1ZURpY3Rba2V5XS5lbCkucHJvcCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgIGlmIChwcmV2U2VsZWN0ZWQgIT09IHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICQodGhpcy5fdmFsdWVEaWN0W2tleV0uZWwpLnByb3AoJ3NlbGVjdGVkJywgc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgSW5wdXQgQ2xpY2tcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZUlucHV0Q2xpY2tcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVJbnB1dENsaWNrKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyb3Bkb3duICYmIHRoaXMuZHJvcGRvd24uaXNPcGVuKSB7XHJcbiAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRvSW5wdXQoKTtcclxuICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkU3RhdGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgZHJvcGRvd25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRHJvcGRvd25cIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cERyb3Bkb3duKCkge1xyXG4gICAgICAgIHZhciBfdGhpczcxID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy53cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgJCh0aGlzLndyYXBwZXIpLmFkZENsYXNzKCdzZWxlY3Qtd3JhcHBlciAnICsgdGhpcy5vcHRpb25zLmNsYXNzZXMpO1xyXG4gICAgICAgIHRoaXMuJGVsLmJlZm9yZSgkKHRoaXMud3JhcHBlcikpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZCh0aGlzLmVsKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZWwuZGlzYWJsZWQpIHtcclxuICAgICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGRyb3Bkb3duXHJcbiAgICAgICAgdGhpcy4kc2VsZWN0T3B0aW9ucyA9IHRoaXMuJGVsLmNoaWxkcmVuKCdvcHRpb24sIG9wdGdyb3VwJyk7XHJcbiAgICAgICAgdGhpcy5kcm9wZG93bk9wdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgIHRoaXMuZHJvcGRvd25PcHRpb25zLmlkID0gXCJzZWxlY3Qtb3B0aW9ucy1cIiArIE0uZ3VpZCgpO1xyXG4gICAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpLmFkZENsYXNzKCdkcm9wZG93bi1jb250ZW50IHNlbGVjdC1kcm9wZG93biAnICsgKHRoaXMuaXNNdWx0aXBsZSA/ICdtdWx0aXBsZS1zZWxlY3QtZHJvcGRvd24nIDogJycpKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGRyb3Bkb3duIHN0cnVjdHVyZS5cclxuICAgICAgICBpZiAodGhpcy4kc2VsZWN0T3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuJHNlbGVjdE9wdGlvbnMuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgaWYgKCQoZWwpLmlzKCdvcHRpb24nKSkge1xyXG4gICAgICAgICAgICAgIC8vIERpcmVjdCBkZXNjZW5kYW50IG9wdGlvbi5cclxuICAgICAgICAgICAgICB2YXIgb3B0aW9uRWwgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgaWYgKF90aGlzNzEuaXNNdWx0aXBsZSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uRWwgPSBfdGhpczcxLl9hcHBlbmRPcHRpb25XaXRoSWNvbihfdGhpczcxLiRlbCwgZWwsICdtdWx0aXBsZScpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25FbCA9IF90aGlzNzEuX2FwcGVuZE9wdGlvbldpdGhJY29uKF90aGlzNzEuJGVsLCBlbCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBfdGhpczcxLl9hZGRPcHRpb25Ub1ZhbHVlRGljdChlbCwgb3B0aW9uRWwpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCQoZWwpLmlzKCdvcHRncm91cCcpKSB7XHJcbiAgICAgICAgICAgICAgLy8gT3B0Z3JvdXAuXHJcbiAgICAgICAgICAgICAgdmFyIHNlbGVjdE9wdGlvbnMgPSAkKGVsKS5jaGlsZHJlbignb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgJChfdGhpczcxLmRyb3Bkb3duT3B0aW9ucykuYXBwZW5kKCQoJzxsaSBjbGFzcz1cIm9wdGdyb3VwXCI+PHNwYW4+JyArIGVsLmdldEF0dHJpYnV0ZSgnbGFiZWwnKSArICc8L3NwYW4+PC9saT4nKVswXSk7XHJcblxyXG4gICAgICAgICAgICAgIHNlbGVjdE9wdGlvbnMuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25FbCA9IF90aGlzNzEuX2FwcGVuZE9wdGlvbldpdGhJY29uKF90aGlzNzEuJGVsLCBlbCwgJ29wdGdyb3VwLW9wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXM3MS5fYWRkT3B0aW9uVG9WYWx1ZURpY3QoZWwsIG9wdGlvbkVsKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiRlbC5hZnRlcih0aGlzLmRyb3Bkb3duT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBpbnB1dCBkcm9wZG93blxyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICQodGhpcy5pbnB1dCkuYWRkQ2xhc3MoJ3NlbGVjdC1kcm9wZG93biBkcm9wZG93bi10cmlnZ2VyJyk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dCcpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICd0cnVlJyk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JywgdGhpcy5kcm9wZG93bk9wdGlvbnMuaWQpO1xyXG4gICAgICAgIGlmICh0aGlzLmVsLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAkKHRoaXMuaW5wdXQpLnByb3AoJ2Rpc2FibGVkJywgJ3RydWUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmJlZm9yZSh0aGlzLmlucHV0KTtcclxuICAgICAgICB0aGlzLl9zZXRWYWx1ZVRvSW5wdXQoKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGNhcmV0XHJcbiAgICAgICAgdmFyIGRyb3Bkb3duSWNvbiA9ICQoJzxzdmcgY2xhc3M9XCJjYXJldFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIk03IDEwbDUgNSA1LTV6XCIvPjxwYXRoIGQ9XCJNMCAwaDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+PC9zdmc+Jyk7XHJcbiAgICAgICAgdGhpcy4kZWwuYmVmb3JlKGRyb3Bkb3duSWNvblswXSk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgZHJvcGRvd25cclxuICAgICAgICBpZiAoIXRoaXMuZWwuZGlzYWJsZWQpIHtcclxuICAgICAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLmRyb3Bkb3duT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgLy8gQWRkIGNhbGxiYWNrIGZvciBjZW50ZXJpbmcgc2VsZWN0ZWQgb3B0aW9uIHdoZW4gZHJvcGRvd24gY29udGVudCBpcyBzY3JvbGxhYmxlXHJcbiAgICAgICAgICBkcm9wZG93bk9wdGlvbnMub25PcGVuRW5kID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZE9wdGlvbiA9ICQoX3RoaXM3MS5kcm9wZG93bk9wdGlvbnMpLmZpbmQoJy5zZWxlY3RlZCcpLmZpcnN0KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgLy8gRm9jdXMgc2VsZWN0ZWQgb3B0aW9uIGluIGRyb3Bkb3duXHJcbiAgICAgICAgICAgICAgTS5rZXlEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBfdGhpczcxLmRyb3Bkb3duLmZvY3VzZWRJbmRleCA9IHNlbGVjdGVkT3B0aW9uLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgX3RoaXM3MS5kcm9wZG93bi5fZm9jdXNGb2N1c2VkSXRlbSgpO1xyXG4gICAgICAgICAgICAgIE0ua2V5RG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAvLyBIYW5kbGUgc2Nyb2xsaW5nIHRvIHNlbGVjdGVkIG9wdGlvblxyXG4gICAgICAgICAgICAgIGlmIChfdGhpczcxLmRyb3Bkb3duLmlzU2Nyb2xsYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjcm9sbE9mZnNldCA9IHNlbGVjdGVkT3B0aW9uWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIF90aGlzNzEuZHJvcGRvd25PcHRpb25zLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDsgLy8gc2Nyb2xsIHRvIHNlbGVjdGVkIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0IC09IF90aGlzNzEuZHJvcGRvd25PcHRpb25zLmNsaWVudEhlaWdodCAvIDI7IC8vIGNlbnRlciBpbiBkcm9wZG93blxyXG4gICAgICAgICAgICAgICAgX3RoaXM3MS5kcm9wZG93bk9wdGlvbnMuc2Nyb2xsVG9wID0gc2Nyb2xsT2Zmc2V0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBpZiAodGhpcy5pc011bHRpcGxlKSB7XHJcbiAgICAgICAgICAgIGRyb3Bkb3duT3B0aW9ucy5jbG9zZU9uQ2xpY2sgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZHJvcGRvd24gPSBNLkRyb3Bkb3duLmluaXQodGhpcy5pbnB1dCwgZHJvcGRvd25PcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCBpbml0aWFsIHNlbGVjdGlvbnNcclxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZFN0YXRlcygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQWRkIG9wdGlvbiB0byB2YWx1ZSBkaWN0XHJcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWwgIG9yaWdpbmFsIG9wdGlvbiBlbGVtZW50XHJcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gb3B0aW9uRWwgIGdlbmVyYXRlZCBvcHRpb24gZWxlbWVudFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfYWRkT3B0aW9uVG9WYWx1ZURpY3RcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRPcHRpb25Ub1ZhbHVlRGljdChlbCwgb3B0aW9uRWwpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSBPYmplY3Qua2V5cyh0aGlzLl92YWx1ZURpY3QpLmxlbmd0aDtcclxuICAgICAgICB2YXIga2V5ID0gdGhpcy5kcm9wZG93bk9wdGlvbnMuaWQgKyBpbmRleDtcclxuICAgICAgICB2YXIgb2JqID0ge307XHJcbiAgICAgICAgb3B0aW9uRWwuaWQgPSBrZXk7XHJcblxyXG4gICAgICAgIG9iai5lbCA9IGVsO1xyXG4gICAgICAgIG9iai5vcHRpb25FbCA9IG9wdGlvbkVsO1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlRGljdFtrZXldID0gb2JqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVtb3ZlIGRyb3Bkb3duXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVEcm9wZG93blwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3JlbW92ZURyb3Bkb3duKCkge1xyXG4gICAgICAgICQodGhpcy53cmFwcGVyKS5maW5kKCcuY2FyZXQnKS5yZW1vdmUoKTtcclxuICAgICAgICAkKHRoaXMuaW5wdXQpLnJlbW92ZSgpO1xyXG4gICAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpLnJlbW92ZSgpO1xyXG4gICAgICAgICQodGhpcy53cmFwcGVyKS5iZWZvcmUodGhpcy4kZWwpO1xyXG4gICAgICAgICQodGhpcy53cmFwcGVyKS5yZW1vdmUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldHVwIGRyb3Bkb3duXHJcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gc2VsZWN0ICBzZWxlY3QgZWxlbWVudFxyXG4gICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IG9wdGlvbiAgb3B0aW9uIGVsZW1lbnQgZnJvbSBzZWxlY3RcclxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcclxuICAgICAgICogQHJldHVybiB7RWxlbWVudH0gIG9wdGlvbiBlbGVtZW50IGFkZGVkXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hcHBlbmRPcHRpb25XaXRoSWNvblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FwcGVuZE9wdGlvbldpdGhJY29uKHNlbGVjdCwgb3B0aW9uLCB0eXBlKSB7XHJcbiAgICAgICAgLy8gQWRkIGRpc2FibGVkIGF0dHIgaWYgZGlzYWJsZWRcclxuICAgICAgICB2YXIgZGlzYWJsZWRDbGFzcyA9IG9wdGlvbi5kaXNhYmxlZCA/ICdkaXNhYmxlZCAnIDogJyc7XHJcbiAgICAgICAgdmFyIG9wdGdyb3VwQ2xhc3MgPSB0eXBlID09PSAnb3B0Z3JvdXAtb3B0aW9uJyA/ICdvcHRncm91cC1vcHRpb24gJyA6ICcnO1xyXG4gICAgICAgIHZhciBtdWx0aXBsZUNoZWNrYm94ID0gdGhpcy5pc011bHRpcGxlID8gXCI8bGFiZWw+PGlucHV0IHR5cGU9XFxcImNoZWNrYm94XFxcIlwiICsgZGlzYWJsZWRDbGFzcyArIFwiXFxcIi8+PHNwYW4+XCIgKyBvcHRpb24uaW5uZXJIVE1MICsgXCI8L3NwYW4+PC9sYWJlbD5cIiA6IG9wdGlvbi5pbm5lckhUTUw7XHJcbiAgICAgICAgdmFyIGxpRWwgPSAkKCc8bGk+PC9saT4nKTtcclxuICAgICAgICB2YXIgc3BhbkVsID0gJCgnPHNwYW4+PC9zcGFuPicpO1xyXG4gICAgICAgIHNwYW5FbC5odG1sKG11bHRpcGxlQ2hlY2tib3gpO1xyXG4gICAgICAgIGxpRWwuYWRkQ2xhc3MoZGlzYWJsZWRDbGFzcyArIFwiIFwiICsgb3B0Z3JvdXBDbGFzcyk7XHJcbiAgICAgICAgbGlFbC5hcHBlbmQoc3BhbkVsKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGljb25zXHJcbiAgICAgICAgdmFyIGljb25VcmwgPSBvcHRpb24uZ2V0QXR0cmlidXRlKCdkYXRhLWljb24nKTtcclxuICAgICAgICBpZiAoISFpY29uVXJsKSB7XHJcbiAgICAgICAgICB2YXIgaW1nRWwgPSAkKFwiPGltZyBhbHQ9XFxcIlxcXCIgc3JjPVxcXCJcIiArIGljb25VcmwgKyBcIlxcXCI+XCIpO1xyXG4gICAgICAgICAgbGlFbC5wcmVwZW5kKGltZ0VsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciBtdWx0aXBsZSB0eXBlLlxyXG4gICAgICAgICQodGhpcy5kcm9wZG93bk9wdGlvbnMpLmFwcGVuZChsaUVsWzBdKTtcclxuICAgICAgICByZXR1cm4gbGlFbFswXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRvZ2dsZSBlbnRyeSBmcm9tIG9wdGlvblxyXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5ICBPcHRpb24ga2V5XHJcbiAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59ICBpZiBlbnRyeSB3YXMgYWRkZWQgb3IgcmVtb3ZlZFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfdG9nZ2xlRW50cnlGcm9tQXJyYXlcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF90b2dnbGVFbnRyeUZyb21BcnJheShrZXkpIHtcclxuICAgICAgICB2YXIgbm90QWRkZWQgPSAhdGhpcy5fa2V5c1NlbGVjdGVkLmhhc093blByb3BlcnR5KGtleSk7XHJcbiAgICAgICAgdmFyICRvcHRpb25MaSA9ICQodGhpcy5fdmFsdWVEaWN0W2tleV0ub3B0aW9uRWwpO1xyXG5cclxuICAgICAgICBpZiAobm90QWRkZWQpIHtcclxuICAgICAgICAgIHRoaXMuX2tleXNTZWxlY3RlZFtrZXldID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2tleXNTZWxlY3RlZFtrZXldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9wdGlvbkxpLnRvZ2dsZUNsYXNzKCdzZWxlY3RlZCcsIG5vdEFkZGVkKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGNoZWNrYm94IGNoZWNrZWQgdmFsdWVcclxuICAgICAgICAkb3B0aW9uTGkuZmluZCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIG5vdEFkZGVkKTtcclxuXHJcbiAgICAgICAgLy8gdXNlIG5vdEFkZGVkIGluc3RlYWQgb2YgdHJ1ZSAodG8gZGV0ZWN0IGlmIHRoZSBvcHRpb24gaXMgc2VsZWN0ZWQgb3Igbm90KVxyXG4gICAgICAgICRvcHRpb25MaS5wcm9wKCdzZWxlY3RlZCcsIG5vdEFkZGVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5vdEFkZGVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0IHRleHQgdmFsdWUgdG8gaW5wdXRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldFZhbHVlVG9JbnB1dFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFZhbHVlVG9JbnB1dCgpIHtcclxuICAgICAgICB2YXIgdmFsdWVzID0gW107XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLiRlbC5maW5kKCdvcHRpb24nKTtcclxuXHJcbiAgICAgICAgb3B0aW9ucy5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgaWYgKCQoZWwpLnByb3AoJ3NlbGVjdGVkJykpIHtcclxuICAgICAgICAgICAgdmFyIHRleHQgPSAkKGVsKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKHRleHQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXZhbHVlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciBmaXJzdERpc2FibGVkID0gdGhpcy4kZWwuZmluZCgnb3B0aW9uOmRpc2FibGVkJykuZXEoMCk7XHJcbiAgICAgICAgICBpZiAoZmlyc3REaXNhYmxlZC5sZW5ndGggJiYgZmlyc3REaXNhYmxlZFswXS52YWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgICAgdmFsdWVzLnB1c2goZmlyc3REaXNhYmxlZC50ZXh0KCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IHZhbHVlcy5qb2luKCcsICcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0IHNlbGVjdGVkIHN0YXRlIG9mIGRyb3Bkb3duIHRvIG1hdGNoIGFjdHVhbCBzZWxlY3QgZWxlbWVudFxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfc2V0U2VsZWN0ZWRTdGF0ZXNcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRTZWxlY3RlZFN0YXRlcygpIHtcclxuICAgICAgICB0aGlzLl9rZXlzU2VsZWN0ZWQgPSB7fTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX3ZhbHVlRGljdCkge1xyXG4gICAgICAgICAgdmFyIG9wdGlvbiA9IHRoaXMuX3ZhbHVlRGljdFtrZXldO1xyXG4gICAgICAgICAgdmFyIG9wdGlvbklzU2VsZWN0ZWQgPSAkKG9wdGlvbi5lbCkucHJvcCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICQob3B0aW9uLm9wdGlvbkVsKS5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgb3B0aW9uSXNTZWxlY3RlZCk7XHJcbiAgICAgICAgICBpZiAob3B0aW9uSXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmF0ZU9wdGlvbigkKHRoaXMuZHJvcGRvd25PcHRpb25zKSwgJChvcHRpb24ub3B0aW9uRWwpKTtcclxuICAgICAgICAgICAgdGhpcy5fa2V5c1NlbGVjdGVkW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJChvcHRpb24ub3B0aW9uRWwpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE1ha2Ugb3B0aW9uIGFzIHNlbGVjdGVkIGFuZCBzY3JvbGwgdG8gc2VsZWN0ZWQgcG9zaXRpb25cclxuICAgICAgICogQHBhcmFtIHtqUXVlcnl9IGNvbGxlY3Rpb24gIFNlbGVjdCBvcHRpb25zIGpRdWVyeSBlbGVtZW50XHJcbiAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gbmV3T3B0aW9uICBlbGVtZW50IG9mIHRoZSBuZXcgb3B0aW9uXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9hY3RpdmF0ZU9wdGlvblwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2FjdGl2YXRlT3B0aW9uKGNvbGxlY3Rpb24sIG5ld09wdGlvbikge1xyXG4gICAgICAgIGlmIChuZXdPcHRpb24pIHtcclxuICAgICAgICAgIGlmICghdGhpcy5pc011bHRpcGxlKSB7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZmluZCgnbGkuc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciBvcHRpb24gPSAkKG5ld09wdGlvbik7XHJcbiAgICAgICAgICBvcHRpb24uYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0IFNlbGVjdGVkIFZhbHVlc1xyXG4gICAgICAgKiBAcmV0dXJuIHtBcnJheX0gIEFycmF5IG9mIHNlbGVjdGVkIHZhbHVlc1xyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnZXRTZWxlY3RlZFZhbHVlc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U2VsZWN0ZWRWYWx1ZXMoKSB7XHJcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsdWVzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX2tleXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgc2VsZWN0ZWRWYWx1ZXMucHVzaCh0aGlzLl92YWx1ZURpY3Rba2V5XS5lbC52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzZWxlY3RlZFZhbHVlcztcclxuICAgICAgfVxyXG4gICAgfV0sIFt7XHJcbiAgICAgIGtleTogXCJpbml0XCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KGVscywgb3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfZ2V0KEZvcm1TZWxlY3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihGb3JtU2VsZWN0KSwgXCJpbml0XCIsIHRoaXMpLmNhbGwodGhpcywgdGhpcywgZWxzLCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldCBJbnN0YW5jZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJnZXRJbnN0YW5jZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdGFuY2UoZWwpIHtcclxuICAgICAgICB2YXIgZG9tRWxlbSA9ICEhZWwuanF1ZXJ5ID8gZWxbMF0gOiBlbDtcclxuICAgICAgICByZXR1cm4gZG9tRWxlbS5NX0Zvcm1TZWxlY3Q7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcImRlZmF1bHRzXCIsXHJcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbiAgICByZXR1cm4gRm9ybVNlbGVjdDtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIE0uRm9ybVNlbGVjdCA9IEZvcm1TZWxlY3Q7XHJcblxyXG4gIGlmIChNLmpRdWVyeUxvYWRlZCkge1xyXG4gICAgTS5pbml0aWFsaXplSnF1ZXJ5V3JhcHBlcihGb3JtU2VsZWN0LCAnZm9ybVNlbGVjdCcsICdNX0Zvcm1TZWxlY3QnKTtcclxuICB9XHJcbn0pKGNhc2gpO1xyXG47KGZ1bmN0aW9uICgkLCBhbmltKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgX2RlZmF1bHRzID0ge307XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcblxyXG4gIHZhciBSYW5nZSA9IGZ1bmN0aW9uIChfQ29tcG9uZW50MjEpIHtcclxuICAgIF9pbmhlcml0cyhSYW5nZSwgX0NvbXBvbmVudDIxKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBSYW5nZSBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBSYW5nZShlbCwgb3B0aW9ucykge1xyXG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmFuZ2UpO1xyXG5cclxuICAgICAgdmFyIF90aGlzNzIgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoUmFuZ2UuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihSYW5nZSkpLmNhbGwodGhpcywgUmFuZ2UsIGVsLCBvcHRpb25zKSk7XHJcblxyXG4gICAgICBfdGhpczcyLmVsLk1fUmFuZ2UgPSBfdGhpczcyO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE9wdGlvbnMgZm9yIHRoZSByYW5nZVxyXG4gICAgICAgKiBAbWVtYmVyIFJhbmdlI29wdGlvbnNcclxuICAgICAgICovXHJcbiAgICAgIF90aGlzNzIub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSYW5nZS5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICBfdGhpczcyLl9tb3VzZWRvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFNldHVwXHJcbiAgICAgIF90aGlzNzIuX3NldHVwVGh1bWIoKTtcclxuXHJcbiAgICAgIF90aGlzNzIuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICByZXR1cm4gX3RoaXM3MjtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlQ2xhc3MoUmFuZ2UsIFt7XHJcbiAgICAgIGtleTogXCJkZXN0cm95XCIsXHJcblxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRlYXJkb3duIGNvbXBvbmVudFxyXG4gICAgICAgKi9cclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVRodW1iKCk7XHJcbiAgICAgICAgdGhpcy5lbC5NX1JhbmdlID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwRXZlbnRIYW5kbGVyc1wiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVSYW5nZUNoYW5nZUJvdW5kID0gdGhpcy5faGFuZGxlUmFuZ2VDaGFuZ2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVSYW5nZU1vdXNlZG93blRvdWNoc3RhcnRCb3VuZCA9IHRoaXMuX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmVCb3VuZCA9IHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVSYW5nZU1vdXNldXBUb3VjaGVuZEJvdW5kID0gdGhpcy5faGFuZGxlUmFuZ2VNb3VzZXVwVG91Y2hlbmQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVCb3VuZCA9IHRoaXMuX2hhbmRsZVJhbmdlQmx1ck1vdXNlb3V0VG91Y2hsZWF2ZS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZVJhbmdlQ2hhbmdlQm91bmQpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydEJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVSYW5nZU1vdXNlZG93blRvdWNoc3RhcnRCb3VuZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9oYW5kbGVSYW5nZUlucHV0TW91c2Vtb3ZlVG91Y2htb3ZlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlUmFuZ2VJbnB1dE1vdXNlbW92ZVRvdWNobW92ZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmVCb3VuZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2V1cFRvdWNoZW5kQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVSYW5nZU1vdXNldXBUb3VjaGVuZEJvdW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5faGFuZGxlUmFuZ2VCbHVyTW91c2VvdXRUb3VjaGxlYXZlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB0aGlzLl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGxlYXZlJywgdGhpcy5faGFuZGxlUmFuZ2VCbHVyTW91c2VvdXRUb3VjaGxlYXZlQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmVtb3ZlIEV2ZW50IEhhbmRsZXJzXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9yZW1vdmVFdmVudEhhbmRsZXJzXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZVJhbmdlQ2hhbmdlQm91bmQpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydEJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9oYW5kbGVSYW5nZU1vdXNlZG93blRvdWNoc3RhcnRCb3VuZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9oYW5kbGVSYW5nZUlucHV0TW91c2Vtb3ZlVG91Y2htb3ZlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlUmFuZ2VJbnB1dE1vdXNlbW92ZVRvdWNobW92ZUJvdW5kKTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmVCb3VuZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZVJhbmdlTW91c2V1cFRvdWNoZW5kQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVSYW5nZU1vdXNldXBUb3VjaGVuZEJvdW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5faGFuZGxlUmFuZ2VCbHVyTW91c2VvdXRUb3VjaGxlYXZlQm91bmQpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB0aGlzLl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVCb3VuZCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGxlYXZlJywgdGhpcy5faGFuZGxlUmFuZ2VCbHVyTW91c2VvdXRUb3VjaGxlYXZlQm91bmQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFJhbmdlIENoYW5nZVxyXG4gICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVSYW5nZUNoYW5nZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVJhbmdlQ2hhbmdlKCkge1xyXG4gICAgICAgICQodGhpcy52YWx1ZSkuaHRtbCh0aGlzLiRlbC52YWwoKSk7XHJcblxyXG4gICAgICAgIGlmICghJCh0aGlzLnRodW1iKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgICAgIHRoaXMuX3Nob3dSYW5nZUJ1YmJsZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG9mZnNldExlZnQgPSB0aGlzLl9jYWxjUmFuZ2VPZmZzZXQoKTtcclxuICAgICAgICAkKHRoaXMudGh1bWIpLmFkZENsYXNzKCdhY3RpdmUnKS5jc3MoJ2xlZnQnLCBvZmZzZXRMZWZ0ICsgJ3B4Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgUmFuZ2UgTW91c2Vkb3duIGFuZCBUb3VjaHN0YXJ0XHJcbiAgICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVJhbmdlTW91c2Vkb3duVG91Y2hzdGFydChlKSB7XHJcbiAgICAgICAgLy8gU2V0IGluZGljYXRvciB2YWx1ZVxyXG4gICAgICAgICQodGhpcy52YWx1ZSkuaHRtbCh0aGlzLiRlbC52YWwoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX21vdXNlZG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICBpZiAoISQodGhpcy50aHVtYikuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XHJcbiAgICAgICAgICB0aGlzLl9zaG93UmFuZ2VCdWJibGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLnR5cGUgIT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgIHZhciBvZmZzZXRMZWZ0ID0gdGhpcy5fY2FsY1JhbmdlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAkKHRoaXMudGh1bWIpLmFkZENsYXNzKCdhY3RpdmUnKS5jc3MoJ2xlZnQnLCBvZmZzZXRMZWZ0ICsgJ3B4Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFJhbmdlIElucHV0LCBNb3VzZW1vdmUgYW5kIFRvdWNobW92ZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGtleTogXCJfaGFuZGxlUmFuZ2VJbnB1dE1vdXNlbW92ZVRvdWNobW92ZVwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2hhbmRsZVJhbmdlSW5wdXRNb3VzZW1vdmVUb3VjaG1vdmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX21vdXNlZG93bikge1xyXG4gICAgICAgICAgaWYgKCEkKHRoaXMudGh1bWIpLmhhc0NsYXNzKCdhY3RpdmUnKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93UmFuZ2VCdWJibGUoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB2YXIgb2Zmc2V0TGVmdCA9IHRoaXMuX2NhbGNSYW5nZU9mZnNldCgpO1xyXG4gICAgICAgICAgJCh0aGlzLnRodW1iKS5hZGRDbGFzcygnYWN0aXZlJykuY3NzKCdsZWZ0Jywgb2Zmc2V0TGVmdCArICdweCcpO1xyXG4gICAgICAgICAgJCh0aGlzLnZhbHVlKS5odG1sKHRoaXMuJGVsLnZhbCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIYW5kbGUgUmFuZ2UgTW91c2V1cCBhbmQgVG91Y2hlbmRcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2hhbmRsZVJhbmdlTW91c2V1cFRvdWNoZW5kXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlUmFuZ2VNb3VzZXVwVG91Y2hlbmQoKSB7XHJcbiAgICAgICAgdGhpcy5fbW91c2Vkb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGFuZGxlIFJhbmdlIEJsdXIsIE1vdXNlb3V0IGFuZCBUb3VjaGxlYXZlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVSYW5nZUJsdXJNb3VzZW91dFRvdWNobGVhdmUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9tb3VzZWRvd24pIHtcclxuICAgICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KHRoaXMuJGVsLmNzcygncGFkZGluZy1sZWZ0JykpO1xyXG4gICAgICAgICAgdmFyIG1hcmdpbkxlZnQgPSA3ICsgcGFkZGluZ0xlZnQgKyAncHgnO1xyXG5cclxuICAgICAgICAgIGlmICgkKHRoaXMudGh1bWIpLmhhc0NsYXNzKCdhY3RpdmUnKSkge1xyXG4gICAgICAgICAgICBhbmltLnJlbW92ZSh0aGlzLnRodW1iKTtcclxuICAgICAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICAgICAgdGFyZ2V0czogdGhpcy50aHVtYixcclxuICAgICAgICAgICAgICBoZWlnaHQ6IDAsXHJcbiAgICAgICAgICAgICAgd2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgdG9wOiAxMCxcclxuICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luTGVmdDogbWFyZ2luTGVmdCxcclxuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJCh0aGlzLnRodW1iKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU2V0dXAgZHJvcGRvd25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3NldHVwVGh1bWJcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cFRodW1iKCkge1xyXG4gICAgICAgIHRoaXMudGh1bWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAkKHRoaXMudGh1bWIpLmFkZENsYXNzKCd0aHVtYicpO1xyXG4gICAgICAgICQodGhpcy52YWx1ZSkuYWRkQ2xhc3MoJ3ZhbHVlJyk7XHJcbiAgICAgICAgJCh0aGlzLnRodW1iKS5hcHBlbmQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy4kZWwuYWZ0ZXIodGhpcy50aHVtYik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZW1vdmUgZHJvcGRvd25cclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX3JlbW92ZVRodW1iXCIsXHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVtb3ZlVGh1bWIoKSB7XHJcbiAgICAgICAgJCh0aGlzLnRodW1iKS5yZW1vdmUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIG1vcnBoIHRodW1iIGludG8gYnViYmxlXHJcbiAgICAgICAqL1xyXG5cclxuICAgIH0sIHtcclxuICAgICAga2V5OiBcIl9zaG93UmFuZ2VCdWJibGVcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zaG93UmFuZ2VCdWJibGUoKSB7XHJcbiAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoJCh0aGlzLnRodW1iKS5wYXJlbnQoKS5jc3MoJ3BhZGRpbmctbGVmdCcpKTtcclxuICAgICAgICB2YXIgbWFyZ2luTGVmdCA9IC03ICsgcGFkZGluZ0xlZnQgKyAncHgnOyAvLyBUT0RPOiBmaXggbWFnaWMgbnVtYmVyP1xyXG4gICAgICAgIGFuaW0ucmVtb3ZlKHRoaXMudGh1bWIpO1xyXG4gICAgICAgIGFuaW0oe1xyXG4gICAgICAgICAgdGFyZ2V0czogdGhpcy50aHVtYixcclxuICAgICAgICAgIGhlaWdodDogMzAsXHJcbiAgICAgICAgICB3aWR0aDogMzAsXHJcbiAgICAgICAgICB0b3A6IC0zMCxcclxuICAgICAgICAgIG1hcmdpbkxlZnQ6IG1hcmdpbkxlZnQsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMzAwLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1aW50J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2FsY3VsYXRlIHRoZSBvZmZzZXQgb2YgdGhlIHRodW1iXHJcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn0gIG9mZnNldCBpbiBwaXhlbHNcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiX2NhbGNSYW5nZU9mZnNldFwiLFxyXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gX2NhbGNSYW5nZU9mZnNldCgpIHtcclxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLiRlbC53aWR0aCgpIC0gMTU7XHJcbiAgICAgICAgdmFyIG1heCA9IHBhcnNlRmxvYXQodGhpcy4kZWwuYXR0cignbWF4JykpIHx8IDEwMDsgLy8gUmFuZ2UgZGVmYXVsdCBtYXhcclxuICAgICAgICB2YXIgbWluID0gcGFyc2VGbG9hdCh0aGlzLiRlbC5hdHRyKCdtaW4nKSkgfHwgMDsgLy8gUmFuZ2UgZGVmYXVsdCBtaW5cclxuICAgICAgICB2YXIgcGVyY2VudCA9IChwYXJzZUZsb2F0KHRoaXMuJGVsLnZhbCgpKSAtIG1pbikgLyAobWF4IC0gbWluKTtcclxuICAgICAgICByZXR1cm4gcGVyY2VudCAqIHdpZHRoO1xyXG4gICAgICB9XHJcbiAgICB9XSwgW3tcclxuICAgICAga2V5OiBcImluaXRcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9nZXQoUmFuZ2UuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihSYW5nZSksIFwiaW5pdFwiLCB0aGlzKS5jYWxsKHRoaXMsIHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAgICovXHJcblxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZ2V0SW5zdGFuY2VcIixcclxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgICAgdmFyIGRvbUVsZW0gPSAhIWVsLmpxdWVyeSA/IGVsWzBdIDogZWw7XHJcbiAgICAgICAgcmV0dXJuIGRvbUVsZW0uTV9SYW5nZTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBrZXk6IFwiZGVmYXVsdHNcIixcclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9kZWZhdWx0cztcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuICAgIHJldHVybiBSYW5nZTtcclxuICB9KENvbXBvbmVudCk7XHJcblxyXG4gIE0uUmFuZ2UgPSBSYW5nZTtcclxuXHJcbiAgaWYgKE0ualF1ZXJ5TG9hZGVkKSB7XHJcbiAgICBNLmluaXRpYWxpemVKcXVlcnlXcmFwcGVyKFJhbmdlLCAncmFuZ2UnLCAnTV9SYW5nZScpO1xyXG4gIH1cclxuXHJcbiAgUmFuZ2UuaW5pdCgkKCdpbnB1dFt0eXBlPXJhbmdlXScpKTtcclxufSkoY2FzaCwgTS5hbmltZSk7XHJcbiJdLCJmaWxlIjoibWF0ZXJpYWxpemUuanMifQ==
