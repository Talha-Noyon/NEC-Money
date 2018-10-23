class Component {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  constructor(classDef, el, options) {
    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + ' is not an HTML Element'));
    }

    // If exists, destroy and reinitialize in child
    let ins = classDef.getInstance(el);
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
  static init(classDef, els, options) {
    let instances = null;
    if (els instanceof Element) {
      instances = new classDef(els, options);
    } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
      let instancesArr = [];
      for (let i = 0; i < els.length; i++) {
        instancesArr.push(new classDef(els[i], options));
      }
      instances = instancesArr;
    }

    return instances;
  }
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29tcG9uZW50IHtcclxuICAvKipcclxuICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciBhbGwgY29tcG9uZW50c1xyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKGNsYXNzRGVmLCBlbCwgb3B0aW9ucykge1xyXG4gICAgLy8gRGlzcGxheSBlcnJvciBpZiBlbCBpcyB2YWxpZCBIVE1MIEVsZW1lbnRcclxuICAgIGlmICghKGVsIGluc3RhbmNlb2YgRWxlbWVudCkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihFcnJvcihlbCArICcgaXMgbm90IGFuIEhUTUwgRWxlbWVudCcpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBleGlzdHMsIGRlc3Ryb3kgYW5kIHJlaW5pdGlhbGl6ZSBpbiBjaGlsZFxyXG4gICAgbGV0IGlucyA9IGNsYXNzRGVmLmdldEluc3RhbmNlKGVsKTtcclxuICAgIGlmICghIWlucykge1xyXG4gICAgICBpbnMuZGVzdHJveSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWwgPSBlbDtcclxuICAgIHRoaXMuJGVsID0gY2FzaChlbCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyBjb21wb25lbnRzXHJcbiAgICogQHBhcmFtIHtjbGFzc30gY2xhc3NEZWZcclxuICAgKiBAcGFyYW0ge0VsZW1lbnQgfCBOb2RlTGlzdCB8IGpRdWVyeX0gZWxzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgKi9cclxuICBzdGF0aWMgaW5pdChjbGFzc0RlZiwgZWxzLCBvcHRpb25zKSB7XHJcbiAgICBsZXQgaW5zdGFuY2VzID0gbnVsbDtcclxuICAgIGlmIChlbHMgaW5zdGFuY2VvZiBFbGVtZW50KSB7XHJcbiAgICAgIGluc3RhbmNlcyA9IG5ldyBjbGFzc0RlZihlbHMsIG9wdGlvbnMpO1xyXG4gICAgfSBlbHNlIGlmICghIWVscyAmJiAoZWxzLmpxdWVyeSB8fCBlbHMuY2FzaCB8fCBlbHMgaW5zdGFuY2VvZiBOb2RlTGlzdCkpIHtcclxuICAgICAgbGV0IGluc3RhbmNlc0FyciA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGluc3RhbmNlc0Fyci5wdXNoKG5ldyBjbGFzc0RlZihlbHNbaV0sIG9wdGlvbnMpKTtcclxuICAgICAgfVxyXG4gICAgICBpbnN0YW5jZXMgPSBpbnN0YW5jZXNBcnI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGluc3RhbmNlcztcclxuICB9XHJcbn1cclxuIl0sImZpbGUiOiJjb21wb25lbnQuanMifQ==
