(function($, anim) {
  'use strict';

  let _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity // breakpoint for swipeable
  };

  /**
   * @class
   *
   */
  class Tabs extends Component {
    /**
     * Construct Tabs instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(Tabs, el, options);

      this.el.M_Tabs = this;

      /**
       * Options for the Tabs
       * @member Tabs#options
       * @prop {Number} duration
       * @prop {Function} onShow
       * @prop {Boolean} swipeable
       * @prop {Number} responsiveThreshold
       */
      this.options = $.extend({}, Tabs.defaults, options);

      // Setup
      this.$tabLinks = this.$el.children('li.tab').children('a');
      this.index = 0;
      this._setupActiveTabLink();

      // Setup tabs content
      if (this.options.swipeable) {
        this._setupSwipeableTabs();
      } else {
        this._setupNormalTabs();
      }

      // Setup tabs indicator after content to ensure accurate widths
      this._setTabsAndTabWidth();
      this._createIndicator();

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
      return domElem.M_Tabs;
    }

    /**
     * Teardown component
     */
    destroy() {
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
    _setupEventHandlers() {
      this._handleWindowResizeBound = this._handleWindowResize.bind(this);
      window.addEventListener('resize', this._handleWindowResizeBound);

      this._handleTabClickBound = this._handleTabClick.bind(this);
      this.el.addEventListener('click', this._handleTabClickBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      window.removeEventListener('resize', this._handleWindowResizeBound);
      this.el.removeEventListener('click', this._handleTabClickBound);
    }

    /**
     * Handle window Resize
     */
    _handleWindowResize() {
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
    _handleTabClick(e) {
      let tab = $(e.target).closest('li.tab');
      let tabLink = $(e.target).closest('a');

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
      let $oldContent = this.$content;

      // Update the variables with the new link and content
      this.$activeTabLink = tabLink;
      this.$content = $(M.escapeHash(tabLink[0].hash));
      this.$tabLinks = this.$el.children('li.tab').children('a');

      // Make the tab active.
      this.$activeTabLink.addClass('active');
      let prevIndex = this.index;
      this.index = Math.max(this.$tabLinks.index(tabLink), 0);

      // Swap content
      if (this.options.swipeable) {
        if (this._tabsCarousel) {
          this._tabsCarousel.set(this.index, () => {
            if (typeof this.options.onShow === 'function') {
              this.options.onShow.call(this, this.$content[0]);
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
    _createIndicator() {
      let indicator = document.createElement('li');
      indicator.classList.add('indicator');

      this.el.appendChild(indicator);
      this._indicator = indicator;

      setTimeout(() => {
        this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
        this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
      }, 0);
    }

    /**
     * Setup first active tab link.
     */
    _setupActiveTabLink() {
      // If the location.hash matches one of the links, use that as the active tab.
      this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));

      // If no match is found, use the first link or any with class 'active' as the initial active tab.
      if (this.$activeTabLink.length === 0) {
        this.$activeTabLink = this.$el
          .children('li.tab')
          .children('a.active')
          .first();
      }
      if (this.$activeTabLink.length === 0) {
        this.$activeTabLink = this.$el
          .children('li.tab')
          .children('a')
          .first();
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
    _setupSwipeableTabs() {
      // Change swipeable according to responsive threshold
      if (window.innerWidth > this.options.responsiveThreshold) {
        this.options.swipeable = false;
      }

      let $tabsContent = $();
      this.$tabLinks.each((link) => {
        let $currContent = $(M.escapeHash(link.hash));
        $currContent.addClass('carousel-item');
        $tabsContent = $tabsContent.add($currContent);
      });

      let $tabsWrapper = $('<div class="tabs-content carousel carousel-slider"></div>');
      $tabsContent.first().before($tabsWrapper);
      $tabsWrapper.append($tabsContent);
      $tabsContent[0].style.display = '';

      // Keep active tab index to set initial carousel slide
      let activeTabIndex = this.$activeTabLink.closest('.tab').index();

      this._tabsCarousel = M.Carousel.init($tabsWrapper[0], {
        fullWidth: true,
        noWrap: true,
        onCycleTo: (item) => {
          let prevIndex = this.index;
          this.index = $(item).index();
          this.$activeTabLink.removeClass('active');
          this.$activeTabLink = this.$tabLinks.eq(this.index);
          this.$activeTabLink.addClass('active');
          this._animateIndicator(prevIndex);
          if (typeof this.options.onShow === 'function') {
            this.options.onShow.call(this, this.$content[0]);
          }
        }
      });

      // Set initial carousel slide to active tab
      this._tabsCarousel.set(activeTabIndex);
    }

    /**
     * Teardown normal tabs.
     */
    _teardownSwipeableTabs() {
      let $tabsWrapper = this._tabsCarousel.$el;
      this._tabsCarousel.destroy();

      // Unwrap
      $tabsWrapper.after($tabsWrapper.children());
      $tabsWrapper.remove();
    }

    /**
     * Setup normal tabs.
     */
    _setupNormalTabs() {
      // Hide Tabs Content
      this.$tabLinks.not(this.$activeTabLink).each((link) => {
        if (!!link.hash) {
          let $currContent = $(M.escapeHash(link.hash));
          if ($currContent.length) {
            $currContent[0].style.display = 'none';
          }
        }
      });
    }

    /**
     * Teardown normal tabs.
     */
    _teardownNormalTabs() {
      // show Tabs Content
      this.$tabLinks.each((link) => {
        if (!!link.hash) {
          let $currContent = $(M.escapeHash(link.hash));
          if ($currContent.length) {
            $currContent[0].style.display = '';
          }
        }
      });
    }

    /**
     * set tabs and tab width
     */
    _setTabsAndTabWidth() {
      this.tabsWidth = this.$el.width();
      this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
    }

    /**
     * Finds right attribute for indicator based on active tab.
     * @param {cash} el
     */
    _calcRightPos(el) {
      return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
    }

    /**
     * Finds left attribute for indicator based on active tab.
     * @param {cash} el
     */
    _calcLeftPos(el) {
      return Math.floor(el.position().left);
    }

    updateTabIndicator() {
      this._setTabsAndTabWidth();
      this._animateIndicator(this.index);
    }

    /**
     * Animates Indicator to active tab.
     * @param {Number} prevIndex
     */
    _animateIndicator(prevIndex) {
      let leftDelay = 0,
        rightDelay = 0;

      if (this.index - prevIndex >= 0) {
        leftDelay = 90;
      } else {
        rightDelay = 90;
      }

      // Animate
      let animOptions = {
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
    select(tabId) {
      let tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
      if (tab.length) {
        tab.trigger('click');
      }
    }
  }

  M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0YWJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBhbmltKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBsZXQgX2RlZmF1bHRzID0ge1xyXG4gICAgZHVyYXRpb246IDMwMCxcclxuICAgIG9uU2hvdzogbnVsbCxcclxuICAgIHN3aXBlYWJsZTogZmFsc2UsXHJcbiAgICByZXNwb25zaXZlVGhyZXNob2xkOiBJbmZpbml0eSAvLyBicmVha3BvaW50IGZvciBzd2lwZWFibGVcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAY2xhc3NcclxuICAgKlxyXG4gICAqL1xyXG4gIGNsYXNzIFRhYnMgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3QgVGFicyBpbnN0YW5jZVxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9ucykge1xyXG4gICAgICBzdXBlcihUYWJzLCBlbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmVsLk1fVGFicyA9IHRoaXM7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogT3B0aW9ucyBmb3IgdGhlIFRhYnNcclxuICAgICAgICogQG1lbWJlciBUYWJzI29wdGlvbnNcclxuICAgICAgICogQHByb3Age051bWJlcn0gZHVyYXRpb25cclxuICAgICAgICogQHByb3Age0Z1bmN0aW9ufSBvblNob3dcclxuICAgICAgICogQHByb3Age0Jvb2xlYW59IHN3aXBlYWJsZVxyXG4gICAgICAgKiBAcHJvcCB7TnVtYmVyfSByZXNwb25zaXZlVGhyZXNob2xkXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVGFicy5kZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBTZXR1cFxyXG4gICAgICB0aGlzLiR0YWJMaW5rcyA9IHRoaXMuJGVsLmNoaWxkcmVuKCdsaS50YWInKS5jaGlsZHJlbignYScpO1xyXG4gICAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgICAgdGhpcy5fc2V0dXBBY3RpdmVUYWJMaW5rKCk7XHJcblxyXG4gICAgICAvLyBTZXR1cCB0YWJzIGNvbnRlbnRcclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zd2lwZWFibGUpIHtcclxuICAgICAgICB0aGlzLl9zZXR1cFN3aXBlYWJsZVRhYnMoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9zZXR1cE5vcm1hbFRhYnMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0dXAgdGFicyBpbmRpY2F0b3IgYWZ0ZXIgY29udGVudCB0byBlbnN1cmUgYWNjdXJhdGUgd2lkdGhzXHJcbiAgICAgIHRoaXMuX3NldFRhYnNBbmRUYWJXaWR0aCgpO1xyXG4gICAgICB0aGlzLl9jcmVhdGVJbmRpY2F0b3IoKTtcclxuXHJcbiAgICAgIHRoaXMuX3NldHVwRXZlbnRIYW5kbGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XHJcbiAgICAgIHJldHVybiBfZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGluaXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5pbml0KHRoaXMsIGVscywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgSW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKGVsKSB7XHJcbiAgICAgIGxldCBkb21FbGVtID0gISFlbC5qcXVlcnkgPyBlbFswXSA6IGVsO1xyXG4gICAgICByZXR1cm4gZG9tRWxlbS5NX1RhYnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVycygpO1xyXG4gICAgICB0aGlzLl9pbmRpY2F0b3IucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9pbmRpY2F0b3IpO1xyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zd2lwZWFibGUpIHtcclxuICAgICAgICB0aGlzLl90ZWFyZG93blN3aXBlYWJsZVRhYnMoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl90ZWFyZG93bk5vcm1hbFRhYnMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy4kZWxbMF0uTV9UYWJzID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwRXZlbnRIYW5kbGVycygpIHtcclxuICAgICAgdGhpcy5faGFuZGxlV2luZG93UmVzaXplQm91bmQgPSB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2hhbmRsZVdpbmRvd1Jlc2l6ZUJvdW5kKTtcclxuXHJcbiAgICAgIHRoaXMuX2hhbmRsZVRhYkNsaWNrQm91bmQgPSB0aGlzLl9oYW5kbGVUYWJDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlVGFiQ2xpY2tCb3VuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgRXZlbnQgSGFuZGxlcnNcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZUV2ZW50SGFuZGxlcnMoKSB7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9oYW5kbGVXaW5kb3dSZXNpemVCb3VuZCk7XHJcbiAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVUYWJDbGlja0JvdW5kKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSB3aW5kb3cgUmVzaXplXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVXaW5kb3dSZXNpemUoKSB7XHJcbiAgICAgIHRoaXMuX3NldFRhYnNBbmRUYWJXaWR0aCgpO1xyXG5cclxuICAgICAgaWYgKHRoaXMudGFiV2lkdGggIT09IDAgJiYgdGhpcy50YWJzV2lkdGggIT09IDApIHtcclxuICAgICAgICB0aGlzLl9pbmRpY2F0b3Iuc3R5bGUubGVmdCA9IHRoaXMuX2NhbGNMZWZ0UG9zKHRoaXMuJGFjdGl2ZVRhYkxpbmspICsgJ3B4JztcclxuICAgICAgICB0aGlzLl9pbmRpY2F0b3Iuc3R5bGUucmlnaHQgPSB0aGlzLl9jYWxjUmlnaHRQb3ModGhpcy4kYWN0aXZlVGFiTGluaykgKyAncHgnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgdGFiIGNsaWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXHJcbiAgICAgKi9cclxuICAgIF9oYW5kbGVUYWJDbGljayhlKSB7XHJcbiAgICAgIGxldCB0YWIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaS50YWInKTtcclxuICAgICAgbGV0IHRhYkxpbmsgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdhJyk7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgY2xpY2sgb24gdGFiIGxpbmsgb25seVxyXG4gICAgICBpZiAoIXRhYkxpbmsubGVuZ3RoIHx8ICF0YWJMaW5rLnBhcmVudCgpLmhhc0NsYXNzKCd0YWInKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRhYi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFjdCBhcyByZWd1bGFyIGxpbmsgaWYgdGFyZ2V0IGF0dHJpYnV0ZSBpcyBzcGVjaWZpZWQuXHJcbiAgICAgIGlmICghIXRhYkxpbmsuYXR0cigndGFyZ2V0JykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1ha2UgdGhlIG9sZCB0YWIgaW5hY3RpdmUuXHJcbiAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICBsZXQgJG9sZENvbnRlbnQgPSB0aGlzLiRjb250ZW50O1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSB2YXJpYWJsZXMgd2l0aCB0aGUgbmV3IGxpbmsgYW5kIGNvbnRlbnRcclxuICAgICAgdGhpcy4kYWN0aXZlVGFiTGluayA9IHRhYkxpbms7XHJcbiAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKE0uZXNjYXBlSGFzaCh0YWJMaW5rWzBdLmhhc2gpKTtcclxuICAgICAgdGhpcy4kdGFiTGlua3MgPSB0aGlzLiRlbC5jaGlsZHJlbignbGkudGFiJykuY2hpbGRyZW4oJ2EnKTtcclxuXHJcbiAgICAgIC8vIE1ha2UgdGhlIHRhYiBhY3RpdmUuXHJcbiAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICBsZXQgcHJldkluZGV4ID0gdGhpcy5pbmRleDtcclxuICAgICAgdGhpcy5pbmRleCA9IE1hdGgubWF4KHRoaXMuJHRhYkxpbmtzLmluZGV4KHRhYkxpbmspLCAwKTtcclxuXHJcbiAgICAgIC8vIFN3YXAgY29udGVudFxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnN3aXBlYWJsZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl90YWJzQ2Fyb3VzZWwpIHtcclxuICAgICAgICAgIHRoaXMuX3RhYnNDYXJvdXNlbC5zZXQodGhpcy5pbmRleCwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vblNob3cgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25TaG93LmNhbGwodGhpcywgdGhpcy4kY29udGVudFswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy4kY29udGVudC5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuJGNvbnRlbnRbMF0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICB0aGlzLiRjb250ZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uU2hvdyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25TaG93LmNhbGwodGhpcywgdGhpcy4kY29udGVudFswXSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCRvbGRDb250ZW50Lmxlbmd0aCAmJiAhJG9sZENvbnRlbnQuaXModGhpcy4kY29udGVudCkpIHtcclxuICAgICAgICAgICAgJG9sZENvbnRlbnRbMF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgJG9sZENvbnRlbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXBkYXRlIHdpZHRocyBhZnRlciBjb250ZW50IGlzIHN3YXBwZWQgKHNjcm9sbGJhciBidWdmaXgpXHJcbiAgICAgIHRoaXMuX3NldFRhYnNBbmRUYWJXaWR0aCgpO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIGluZGljYXRvclxyXG4gICAgICB0aGlzLl9hbmltYXRlSW5kaWNhdG9yKHByZXZJbmRleCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IHRoZSBhbmNob3IncyBkZWZhdWx0IGNsaWNrIGFjdGlvblxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBlbGVtZW50cyBmb3IgdGFiIGluZGljYXRvci5cclxuICAgICAqL1xyXG4gICAgX2NyZWF0ZUluZGljYXRvcigpIHtcclxuICAgICAgbGV0IGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgIGluZGljYXRvci5jbGFzc0xpc3QuYWRkKCdpbmRpY2F0b3InKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yKTtcclxuICAgICAgdGhpcy5faW5kaWNhdG9yID0gaW5kaWNhdG9yO1xyXG5cclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5faW5kaWNhdG9yLnN0eWxlLmxlZnQgPSB0aGlzLl9jYWxjTGVmdFBvcyh0aGlzLiRhY3RpdmVUYWJMaW5rKSArICdweCc7XHJcbiAgICAgICAgdGhpcy5faW5kaWNhdG9yLnN0eWxlLnJpZ2h0ID0gdGhpcy5fY2FsY1JpZ2h0UG9zKHRoaXMuJGFjdGl2ZVRhYkxpbmspICsgJ3B4JztcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBmaXJzdCBhY3RpdmUgdGFiIGxpbmsuXHJcbiAgICAgKi9cclxuICAgIF9zZXR1cEFjdGl2ZVRhYkxpbmsoKSB7XHJcbiAgICAgIC8vIElmIHRoZSBsb2NhdGlvbi5oYXNoIG1hdGNoZXMgb25lIG9mIHRoZSBsaW5rcywgdXNlIHRoYXQgYXMgdGhlIGFjdGl2ZSB0YWIuXHJcbiAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsgPSAkKHRoaXMuJHRhYkxpbmtzLmZpbHRlcignW2hyZWY9XCInICsgbG9jYXRpb24uaGFzaCArICdcIl0nKSk7XHJcblxyXG4gICAgICAvLyBJZiBubyBtYXRjaCBpcyBmb3VuZCwgdXNlIHRoZSBmaXJzdCBsaW5rIG9yIGFueSB3aXRoIGNsYXNzICdhY3RpdmUnIGFzIHRoZSBpbml0aWFsIGFjdGl2ZSB0YWIuXHJcbiAgICAgIGlmICh0aGlzLiRhY3RpdmVUYWJMaW5rLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsgPSB0aGlzLiRlbFxyXG4gICAgICAgICAgLmNoaWxkcmVuKCdsaS50YWInKVxyXG4gICAgICAgICAgLmNoaWxkcmVuKCdhLmFjdGl2ZScpXHJcbiAgICAgICAgICAuZmlyc3QoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy4kYWN0aXZlVGFiTGluay5sZW5ndGggPT09IDApIHtcclxuICAgICAgICB0aGlzLiRhY3RpdmVUYWJMaW5rID0gdGhpcy4kZWxcclxuICAgICAgICAgIC5jaGlsZHJlbignbGkudGFiJylcclxuICAgICAgICAgIC5jaGlsZHJlbignYScpXHJcbiAgICAgICAgICAuZmlyc3QoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy4kdGFiTGlua3MucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB0aGlzLiRhY3RpdmVUYWJMaW5rWzBdLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgdGhpcy5pbmRleCA9IE1hdGgubWF4KHRoaXMuJHRhYkxpbmtzLmluZGV4KHRoaXMuJGFjdGl2ZVRhYkxpbmspLCAwKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLiRhY3RpdmVUYWJMaW5rLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKE0uZXNjYXBlSGFzaCh0aGlzLiRhY3RpdmVUYWJMaW5rWzBdLmhhc2gpKTtcclxuICAgICAgICB0aGlzLiRjb250ZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgc3dpcGVhYmxlIHRhYnNcclxuICAgICAqL1xyXG4gICAgX3NldHVwU3dpcGVhYmxlVGFicygpIHtcclxuICAgICAgLy8gQ2hhbmdlIHN3aXBlYWJsZSBhY2NvcmRpbmcgdG8gcmVzcG9uc2l2ZSB0aHJlc2hvbGRcclxuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gdGhpcy5vcHRpb25zLnJlc3BvbnNpdmVUaHJlc2hvbGQpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuc3dpcGVhYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCAkdGFic0NvbnRlbnQgPSAkKCk7XHJcbiAgICAgIHRoaXMuJHRhYkxpbmtzLmVhY2goKGxpbmspID0+IHtcclxuICAgICAgICBsZXQgJGN1cnJDb250ZW50ID0gJChNLmVzY2FwZUhhc2gobGluay5oYXNoKSk7XHJcbiAgICAgICAgJGN1cnJDb250ZW50LmFkZENsYXNzKCdjYXJvdXNlbC1pdGVtJyk7XHJcbiAgICAgICAgJHRhYnNDb250ZW50ID0gJHRhYnNDb250ZW50LmFkZCgkY3VyckNvbnRlbnQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCAkdGFic1dyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwidGFicy1jb250ZW50IGNhcm91c2VsIGNhcm91c2VsLXNsaWRlclwiPjwvZGl2PicpO1xyXG4gICAgICAkdGFic0NvbnRlbnQuZmlyc3QoKS5iZWZvcmUoJHRhYnNXcmFwcGVyKTtcclxuICAgICAgJHRhYnNXcmFwcGVyLmFwcGVuZCgkdGFic0NvbnRlbnQpO1xyXG4gICAgICAkdGFic0NvbnRlbnRbMF0uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG5cclxuICAgICAgLy8gS2VlcCBhY3RpdmUgdGFiIGluZGV4IHRvIHNldCBpbml0aWFsIGNhcm91c2VsIHNsaWRlXHJcbiAgICAgIGxldCBhY3RpdmVUYWJJbmRleCA9IHRoaXMuJGFjdGl2ZVRhYkxpbmsuY2xvc2VzdCgnLnRhYicpLmluZGV4KCk7XHJcblxyXG4gICAgICB0aGlzLl90YWJzQ2Fyb3VzZWwgPSBNLkNhcm91c2VsLmluaXQoJHRhYnNXcmFwcGVyWzBdLCB7XHJcbiAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxyXG4gICAgICAgIG5vV3JhcDogdHJ1ZSxcclxuICAgICAgICBvbkN5Y2xlVG86IChpdGVtKSA9PiB7XHJcbiAgICAgICAgICBsZXQgcHJldkluZGV4ID0gdGhpcy5pbmRleDtcclxuICAgICAgICAgIHRoaXMuaW5kZXggPSAkKGl0ZW0pLmluZGV4KCk7XHJcbiAgICAgICAgICB0aGlzLiRhY3RpdmVUYWJMaW5rLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsgPSB0aGlzLiR0YWJMaW5rcy5lcSh0aGlzLmluZGV4KTtcclxuICAgICAgICAgIHRoaXMuJGFjdGl2ZVRhYkxpbmsuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgdGhpcy5fYW5pbWF0ZUluZGljYXRvcihwcmV2SW5kZXgpO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25TaG93ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblNob3cuY2FsbCh0aGlzLCB0aGlzLiRjb250ZW50WzBdKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gU2V0IGluaXRpYWwgY2Fyb3VzZWwgc2xpZGUgdG8gYWN0aXZlIHRhYlxyXG4gICAgICB0aGlzLl90YWJzQ2Fyb3VzZWwuc2V0KGFjdGl2ZVRhYkluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlYXJkb3duIG5vcm1hbCB0YWJzLlxyXG4gICAgICovXHJcbiAgICBfdGVhcmRvd25Td2lwZWFibGVUYWJzKCkge1xyXG4gICAgICBsZXQgJHRhYnNXcmFwcGVyID0gdGhpcy5fdGFic0Nhcm91c2VsLiRlbDtcclxuICAgICAgdGhpcy5fdGFic0Nhcm91c2VsLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgIC8vIFVud3JhcFxyXG4gICAgICAkdGFic1dyYXBwZXIuYWZ0ZXIoJHRhYnNXcmFwcGVyLmNoaWxkcmVuKCkpO1xyXG4gICAgICAkdGFic1dyYXBwZXIucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBub3JtYWwgdGFicy5cclxuICAgICAqL1xyXG4gICAgX3NldHVwTm9ybWFsVGFicygpIHtcclxuICAgICAgLy8gSGlkZSBUYWJzIENvbnRlbnRcclxuICAgICAgdGhpcy4kdGFiTGlua3Mubm90KHRoaXMuJGFjdGl2ZVRhYkxpbmspLmVhY2goKGxpbmspID0+IHtcclxuICAgICAgICBpZiAoISFsaW5rLmhhc2gpIHtcclxuICAgICAgICAgIGxldCAkY3VyckNvbnRlbnQgPSAkKE0uZXNjYXBlSGFzaChsaW5rLmhhc2gpKTtcclxuICAgICAgICAgIGlmICgkY3VyckNvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICRjdXJyQ29udGVudFswXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZWFyZG93biBub3JtYWwgdGFicy5cclxuICAgICAqL1xyXG4gICAgX3RlYXJkb3duTm9ybWFsVGFicygpIHtcclxuICAgICAgLy8gc2hvdyBUYWJzIENvbnRlbnRcclxuICAgICAgdGhpcy4kdGFiTGlua3MuZWFjaCgobGluaykgPT4ge1xyXG4gICAgICAgIGlmICghIWxpbmsuaGFzaCkge1xyXG4gICAgICAgICAgbGV0ICRjdXJyQ29udGVudCA9ICQoTS5lc2NhcGVIYXNoKGxpbmsuaGFzaCkpO1xyXG4gICAgICAgICAgaWYgKCRjdXJyQ29udGVudC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJGN1cnJDb250ZW50WzBdLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IHRhYnMgYW5kIHRhYiB3aWR0aFxyXG4gICAgICovXHJcbiAgICBfc2V0VGFic0FuZFRhYldpZHRoKCkge1xyXG4gICAgICB0aGlzLnRhYnNXaWR0aCA9IHRoaXMuJGVsLndpZHRoKCk7XHJcbiAgICAgIHRoaXMudGFiV2lkdGggPSBNYXRoLm1heCh0aGlzLnRhYnNXaWR0aCwgdGhpcy5lbC5zY3JvbGxXaWR0aCkgLyB0aGlzLiR0YWJMaW5rcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kcyByaWdodCBhdHRyaWJ1dGUgZm9yIGluZGljYXRvciBiYXNlZCBvbiBhY3RpdmUgdGFiLlxyXG4gICAgICogQHBhcmFtIHtjYXNofSBlbFxyXG4gICAgICovXHJcbiAgICBfY2FsY1JpZ2h0UG9zKGVsKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YWJzV2lkdGggLSBlbC5wb3NpdGlvbigpLmxlZnQgLSBlbFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kcyBsZWZ0IGF0dHJpYnV0ZSBmb3IgaW5kaWNhdG9yIGJhc2VkIG9uIGFjdGl2ZSB0YWIuXHJcbiAgICAgKiBAcGFyYW0ge2Nhc2h9IGVsXHJcbiAgICAgKi9cclxuICAgIF9jYWxjTGVmdFBvcyhlbCkge1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihlbC5wb3NpdGlvbigpLmxlZnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVRhYkluZGljYXRvcigpIHtcclxuICAgICAgdGhpcy5fc2V0VGFic0FuZFRhYldpZHRoKCk7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVJbmRpY2F0b3IodGhpcy5pbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRlcyBJbmRpY2F0b3IgdG8gYWN0aXZlIHRhYi5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwcmV2SW5kZXhcclxuICAgICAqL1xyXG4gICAgX2FuaW1hdGVJbmRpY2F0b3IocHJldkluZGV4KSB7XHJcbiAgICAgIGxldCBsZWZ0RGVsYXkgPSAwLFxyXG4gICAgICAgIHJpZ2h0RGVsYXkgPSAwO1xyXG5cclxuICAgICAgaWYgKHRoaXMuaW5kZXggLSBwcmV2SW5kZXggPj0gMCkge1xyXG4gICAgICAgIGxlZnREZWxheSA9IDkwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJpZ2h0RGVsYXkgPSA5MDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQW5pbWF0ZVxyXG4gICAgICBsZXQgYW5pbU9wdGlvbnMgPSB7XHJcbiAgICAgICAgdGFyZ2V0czogdGhpcy5faW5kaWNhdG9yLFxyXG4gICAgICAgIGxlZnQ6IHtcclxuICAgICAgICAgIHZhbHVlOiB0aGlzLl9jYWxjTGVmdFBvcyh0aGlzLiRhY3RpdmVUYWJMaW5rKSxcclxuICAgICAgICAgIGRlbGF5OiBsZWZ0RGVsYXlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJpZ2h0OiB7XHJcbiAgICAgICAgICB2YWx1ZTogdGhpcy5fY2FsY1JpZ2h0UG9zKHRoaXMuJGFjdGl2ZVRhYkxpbmspLFxyXG4gICAgICAgICAgZGVsYXk6IHJpZ2h0RGVsYXlcclxuICAgICAgICB9LFxyXG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMuZHVyYXRpb24sXHJcbiAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YWQnXHJcbiAgICAgIH07XHJcbiAgICAgIGFuaW0ucmVtb3ZlKHRoaXMuX2luZGljYXRvcik7XHJcbiAgICAgIGFuaW0oYW5pbU9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VsZWN0IHRhYi5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWJJZFxyXG4gICAgICovXHJcbiAgICBzZWxlY3QodGFiSWQpIHtcclxuICAgICAgbGV0IHRhYiA9IHRoaXMuJHRhYkxpbmtzLmZpbHRlcignW2hyZWY9XCIjJyArIHRhYklkICsgJ1wiXScpO1xyXG4gICAgICBpZiAodGFiLmxlbmd0aCkge1xyXG4gICAgICAgIHRhYi50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNLlRhYnMgPSBUYWJzO1xyXG5cclxuICBpZiAoTS5qUXVlcnlMb2FkZWQpIHtcclxuICAgIE0uaW5pdGlhbGl6ZUpxdWVyeVdyYXBwZXIoVGFicywgJ3RhYnMnLCAnTV9UYWJzJyk7XHJcbiAgfVxyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuIl0sImZpbGUiOiJ0YWJzLmpzIn0=
