function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

class SectionId {
  static #separator = '__';

  // for a qualified section id (e.g. 'template--22224696705326__main'), return just the section id (e.g. 'template--22224696705326')
  static parseId(qualifiedSectionId) {
    return qualifiedSectionId.split(SectionId.#separator)[0];
  }

  // for a qualified section id (e.g. 'template--22224696705326__main'), return just the section name (e.g. 'main')
  static parseSectionName(qualifiedSectionId) {
    return qualifiedSectionId.split(SectionId.#separator)[1];
  }

  // for a section id (e.g. 'template--22224696705326') and a section name (e.g. 'recommended-products'), return a qualified section id (e.g. 'template--22224696705326__recommended-products')
  static getIdForSection(sectionId, sectionName) {
    return `${sectionId}${SectionId.#separator}${sectionName}`;
  }
}

class HTMLUpdateUtility {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   *
   * The function currently uses a double buffer approach, but this should be replaced by a view transition once it is more widely supported https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));

    const newNodeWrapper = document.createElement('div');
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    // dedupe IDs
    const uniqueKey = Date.now();
    oldNode.querySelectorAll('[id], [form]').forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form && element.setAttribute('form', `${element.form.getAttribute('id')}-${uniqueKey}`);
    });

    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = 'none';

    postProcessCallbacks?.forEach((callback) => callback(newNode));

    setTimeout(() => oldNode.remove(), 500);
  }

  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  static setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer, menu-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (event.target !== container && event.target !== last && event.target !== first) return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible');
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add('focused');
    },
    true
  );
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    if (event.target.name === 'plus') {
      if (parseInt(this.input.dataset.min) > parseInt(this.input.step) && this.input.value == 0) {
        this.input.value = this.input.dataset.min;
      } else {
        this.input.stepUp();
      }
    } else {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);

    if (this.input.dataset.min === previousValue && event.target.name === 'minus') {
      this.input.value = parseInt(this.input.min);
    }
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', parseInt(value) <= parseInt(this.input.min));
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}


function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = '';
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    );
    this.querySelectorAll(
      'button:not(.localization-selector):not(.country-selector__close-button):not(.country-filter__reset-button)'
    ).forEach((button) => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary'))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);

      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches
          ? addTrapFocus()
          : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach((submenu) => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);

    if (event instanceof KeyboardEvent) elementToFocus?.setAttribute('aria-expanded', false);
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement))
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset =
      this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
    );
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
      );
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener('click', this.hide.bind(this, false));
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    this.dataset.section = this.closest('.shopify-section').id.replace('shopify-section-', '');
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class BulkModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      if (this.innerHTML.trim() === '') {
        const productUrl = this.dataset.url.split('?')[0];
        fetch(`${productUrl}?section_id=bulk-quick-order-list`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            const sourceQty = html.querySelector('.quick-order-list-container').parentNode;
            this.innerHTML = sourceQty.innerHTML;
          })
          .catch((e) => {
            console.error(e);
          });
      }
    };

    new IntersectionObserver(handleIntersection.bind(this)).observe(
      document.querySelector(`#QuickBulk-${this.dataset.productId}-${this.dataset.sectionId}`)
    );
  }
}

customElements.define('bulk-modal', BulkModal);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
      if (deferredElement.nodeName == 'VIDEO' && deferredElement.getAttribute('autoplay')) {
        // force autoplay for safari
        deferredElement.play();
      }

      // Workaround for safari iframe bug
      const formerStyle = deferredElement.getAttribute('style');
      deferredElement.setAttribute('style', 'display: block;');
      window.setTimeout(() => {
        deferredElement.setAttribute('style', formerStyle);
      }, 0);
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver((entries) => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor(
      (this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset
    );
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return;

    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent('slideChanged', {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.sliderItemsToShow[this.currentPage - 1],
          },
        })
      );
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition =
      event.currentTarget.name === 'next'
        ? this.slider.scrollLeft + step * this.sliderItemOffset
        : this.slider.scrollLeft - step * this.sliderItemOffset;
    this.setSlidePosition(this.slideScrollPosition);
  }

  setSlidePosition(position) {
    this.slider.scrollTo({
      left: position,
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.announcementBarSlider = this.querySelector('.announcement-bar-slider');
    // Value below should match --duration-announcement-bar CSS value
    this.announcerBarAnimationDelay = this.announcementBarSlider ? 250 : 0;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach((link) => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.announcementBarSlider) {
      this.announcementBarArrowButtonWasClicked = false;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion.addEventListener('change', () => {
        if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
      });

      [this.prevButton, this.nextButton].forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            this.announcementBarArrowButtonWasClicked = true;
          },
          { once: true }
        );
      });
    }

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.autoplaySpeed = this.slider.dataset.speed * 1000;
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    if (this.querySelector('.slideshow__autoplay')) {
      this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
      this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
      this.autoplayButtonIsSetToPlay = true;
      this.play();
    } else {
      this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked ? this.pause() : this.play();
    }
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    this.wasClicked = true;

    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) {
      this.applyAnimationToAnnouncementBar(event.currentTarget.name);
      return;
    }

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition =
        this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }

    this.setSlidePosition(this.slideScrollPosition);

    this.applyAnimationToAnnouncementBar(event.currentTarget.name);
  }

  setSlidePosition(position) {
    if (this.setPositionTimeout) clearTimeout(this.setPositionTimeout);
    this.setPositionTimeout = setTimeout(() => {
      this.slider.scrollTo({
        left: position,
      });
    }, this.announcerBarAnimationDelay);
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach((link) => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    if (this.sliderAutoplayButton) {
      const focusedOnAutoplayButton =
        event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
      this.play();
    } else if (!this.reducedMotion.matches && !this.announcementBarArrowButtonWasClicked) {
      this.play();
    }
  }

  focusInHandling(event) {
    if (this.sliderAutoplayButton) {
      const focusedOnAutoplayButton =
        event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
        this.play();
      } else if (this.autoplayButtonIsSetToPlay) {
        this.pause();
      }
    } else if (this.announcementBarSlider.contains(event.target)) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition =
      this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.sliderItemOffset;

    this.setSlidePosition(slideScrollPosition);
    this.applyAnimationToAnnouncementBar();
  }

  setSlideVisibility(event) {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.removeAttribute('tabindex');
          });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.setAttribute('tabindex', '-1');
          });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
    this.wasClicked = false;
  }

  applyAnimationToAnnouncementBar(button = 'next') {
    if (!this.announcementBarSlider) return;

    const itemsCount = this.sliderItems.length;
    const increment = button === 'next' ? 1 : -1;

    const currentIndex = this.currentPage - 1;
    let nextIndex = (currentIndex + increment) % itemsCount;
    nextIndex = nextIndex === -1 ? itemsCount - 1 : nextIndex;

    const nextSlide = this.sliderItems[nextIndex];
    const currentSlide = this.sliderItems[currentIndex];

    const animationClassIn = 'announcement-bar-slider--fade-in';
    const animationClassOut = 'announcement-bar-slider--fade-out';

    const isFirstSlide = currentIndex === 0;
    const isLastSlide = currentIndex === itemsCount - 1;

    const shouldMoveNext = (button === 'next' && !isLastSlide) || (button === 'previous' && isFirstSlide);
    const direction = shouldMoveNext ? 'next' : 'previous';

    currentSlide.classList.add(`${animationClassOut}-${direction}`);
    nextSlide.classList.add(`${animationClassIn}-${direction}`);

    setTimeout(() => {
      currentSlide.classList.remove(`${animationClassOut}-${direction}`);
      nextSlide.classList.remove(`${animationClassIn}-${direction}`);
    }, this.announcerBarAnimationDelay * 2);
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition =
      this.slider.scrollLeft +
      this.sliderFirstItemNode.clientWidth *
        (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target);
      this.updateSelectionMetadata(event);

      publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event,
          target,
          selectedOptionValues: this.selectedOptionValues,
        },
      });
    });
  }

  updateSelectionMetadata({ target }) {
    const { value, tagName } = target;

    if (tagName === 'SELECT' && target.selectedOptions.length) {
      Array.from(target.options)
        .find((option) => option.getAttribute('selected'))
        .removeAttribute('selected');
      target.selectedOptions[0].setAttribute('selected', 'selected');

      const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
      const selectedDropdownSwatchValue = target
        .closest('.product-form__input')
        .querySelector('[data-selected-value] > .swatch');
      if (!selectedDropdownSwatchValue) return;
      if (swatchValue) {
        selectedDropdownSwatchValue.style.setProperty('--swatch--background', swatchValue);
        selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
      } else {
        selectedDropdownSwatchValue.style.setProperty('--swatch--background', 'unset');
        selectedDropdownSwatchValue.classList.add('swatch--unavailable');
      }

      selectedDropdownSwatchValue.style.setProperty(
        '--swatch-focal-point',
        target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset'
      );
    } else if (tagName === 'INPUT' && target.type === 'radio') {
      const selectedSwatchValue = target.closest(`.product-form__input`).querySelector('[data-selected-value]');
      if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
    }
  }

  getInputForEventTarget(target) {
    return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
  }

  get selectedOptionValues() {
    return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(
      ({ dataset }) => dataset.optionValueId
    );
  }
}

customElements.define('variant-selects', VariantSelects);

class ProductRecommendations extends HTMLElement {
  observer = undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    this.initializeRecommendations(this.dataset.productId);
  }

  initializeRecommendations(productId) {
    this.observer?.unobserve(this);
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        this.loadRecommendations(productId);
      },
      { rootMargin: '0px 0px 400px 0px' }
    );
    this.observer.observe(this);
  }

  loadRecommendations(productId) {
    fetch(`${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('product-recommendations');

        if (recommendations?.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
        }

        if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
          this.remove();
        }

        if (html.querySelector('.grid__item')) {
          this.classList.add('product-recommendations--loaded');
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define('product-recommendations', ProductRecommendations);

class AccountIcon extends HTMLElement {
  constructor() {
    super();

    this.icon = this.querySelector('.icon');
  }

  connectedCallback() {
    document.addEventListener('storefront:signincompleted', this.handleStorefrontSignInCompleted.bind(this));
  }

  handleStorefrontSignInCompleted(event) {
    if (event?.detail?.avatar) {
      this.icon?.replaceWith(event.detail.avatar.cloneNode());
    }
  }
}

customElements.define('account-icon', AccountIcon);

class BulkAdd extends HTMLElement {
  static ASYNC_REQUEST_DELAY = 250;

  constructor() {
    super();
    this.queue = [];
    this.setRequestStarted(false);
    this.ids = [];
  }

  startQueue(id, quantity) {
    this.queue.push({ id, quantity });

    const interval = setInterval(() => {
      if (this.queue.length > 0) {
        if (!this.requestStarted) {
          this.sendRequest(this.queue);
        }
      } else {
        clearInterval(interval);
      }
    }, BulkAdd.ASYNC_REQUEST_DELAY);
  }

  sendRequest(queue) {
    this.setRequestStarted(true);
    const items = {};

    queue.forEach((queueItem) => {
      items[parseInt(queueItem.id)] = queueItem.quantity;
    });
    this.queue = this.queue.filter((queueElement) => !queue.includes(queueElement));

    this.updateMultipleQty(items);
  }

  setRequestStarted(requestStarted) {
    this._requestStarted = requestStarted;
  }

  get requestStarted() {
    return this._requestStarted;
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;

    if (inputValue < event.target.dataset.min) {
      this.setValidity(event, index, window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min));
    } else if (inputValue > parseInt(event.target.max)) {
      this.setValidity(event, index, window.quickOrderListStrings.max_error.replace('[max]', event.target.max));
    } else if (inputValue % parseInt(event.target.step) != 0) {
      this.setValidity(event, index, window.quickOrderListStrings.step_error.replace('[step]', event.target.step));
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      event.target.setAttribute('value', inputValue);
      this.startQueue(index, inputValue);
    }
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
}

if (!customElements.get('bulk-add')) {
  customElements.define('bulk-add', BulkAdd);
}

class CartPerformance {
  static #metric_prefix = "cart-performance"

  static createStartingMarker(benchmarkName) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    return performance.mark(`${metricName}:start`);
  }

  static measureFromEvent(benchmarkName, event) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    const startMarker = performance.mark(`${metricName}:start`, {
      startTime: event.timeStamp
    });

    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(
      metricName,
      `${metricName}:start`,
      `${metricName}:end`
    );
  }

  static measureFromMarker(benchmarkName, startMarker) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(
      metricName,
      startMarker.name,
      `${metricName}:end`
    );
  }

  static measure(benchmarkName, callback) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    const startMarker = performance.mark(`${metricName}:start`);

    callback();

    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(
      metricName,
      `${metricName}:start`,
      `${metricName}:end`
    );
  }
}




// Testimonial Slider 
var reviewSwiper = new Swiper(".review_slider", {
  slidesPerView: 3,
  spaceBetween: 32,
  loop: true,
  navigation: {
    nextEl: ".review_swiper-button-next",
    prevEl: ".review_swiper-button-prev",
  },
  pagination: {
    el: ".review-swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
      spaceBetween: 16,
    },
    681: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    992: {
      slidesPerView: 3,
      spaceBetween: 32,
    }
  }
});

function equalizeCardInfoHeight() {
  const cards = document.querySelectorAll('.swiper.featured-collection-slider .card__information');
  if (cards.length > 0) {
    cards.forEach(card => card.style.height = 'auto');

    let maxHeight = 0;

    cards.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });

    cards.forEach(card => {
      card.style.height = maxHeight + 'px';
    });
  }

  let maxHeadingHeight = 0;
  const cardHeading = document.querySelectorAll('.card__information .card__heading');
  if (cardHeading.length > 0) {
    cardHeading.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxHeadingHeight) maxHeadingHeight = h;
    });

    cardHeading.forEach(card => {
      card.style.height = maxHeadingHeight + 'px';
    });
  }

  let maxCardDescHeight = 0;
  const cardDesc = document.querySelectorAll('.card__information .card-custom-description');
  if (cardDesc.length > 0) {
    cardDesc.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxCardDescHeight) maxCardDescHeight = h;
    });

    cardDesc.forEach(card => {
      card.style.height = maxCardDescHeight + 'px';
    });
  }

  let maxVehDescHeight = 0;
  const vehDesc = document.querySelectorAll('.car_detail .card__details');
  if (vehDesc.length > 0) {
    vehDesc.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxVehDescHeight) maxVehDescHeight = h;
    });

    vehDesc.forEach(card => {
      card.style.height = maxVehDescHeight + 'px';
    });
  }
}
function equalizeCardInfoHeightproduct() {
  const cards = document.querySelectorAll('.collection custom-api-feature  .card__information');
  if (cards.length > 0) {
    cards.forEach(card => card.style.height = 'auto');

    let maxHeight = 0;

    cards.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });

    cards.forEach(card => {
      card.style.height = maxHeight + 'px';
    });
  }

  let maxHeadingHeight = 0;
  const cardHeading = document.querySelectorAll('.card__information .card__heading');
  if (cardHeading.length > 0) {
    cardHeading.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxHeadingHeight) maxHeadingHeight = h;
    });

    cardHeading.forEach(card => {
      card.style.height = maxHeadingHeight + 'px';
    });
  }

  let maxCardDescHeight = 0;
  const cardDesc = document.querySelectorAll('.card__information .card-custom-description');
  if (cardDesc.length > 0) {
    cardDesc.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxCardDescHeight) maxCardDescHeight = h;
    });

    cardDesc.forEach(card => {
      card.style.height = maxCardDescHeight + 'px';
    });
  }

  let maxVehDescHeight = 0;
  const vehDesc = document.querySelectorAll('.car_detail .card__details');
  if (vehDesc.length > 0) {
    vehDesc.forEach(card => {
      const h = card.offsetHeight;
      if (h > maxVehDescHeight) maxVehDescHeight = h;
    });

    vehDesc.forEach(card => {
      card.style.height = maxVehDescHeight + 'px';
    });
  }
}
// run on load
window.addEventListener('load', equalizeCardInfoHeight);
window.addEventListener('load', equalizeCardInfoHeightproduct);

// run on resize
window.addEventListener('resize', () => {
  clearTimeout(window.__cardResizeTimer);
  window.__cardResizeTimer = setTimeout(equalizeCardInfoHeight, 150);
});

// Featured Collection Slider 
const featuredCollectionSwiper = new Swiper(".featured-collection-slider", {
  slidesPerView: 3,
  spaceBetween: 32,
  navigation: {
    nextEl: ".collection-swiper-button-next",
    prevEl: ".collection-swiper-button-prev",
  },
  pagination: {
    el: ".featured-collection-slider .swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    480: {
      slidesPerView: 1,
    },
    750: {
      slidesPerView: 2,
    },
    990: {
      slidesPerView: 3,
    }
  }
});


// Car Gellary Slider
document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".gallery-tabs .tabs-slider", {
    slidesPerView: 1,
    speed: 500,
    loop: true,
    autoHeight: false,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".tabs-slider-next",
      prevEl: ".tabs-slider-prev",
    },

    on: {
      slideChange: function () {
        const realIndex = this.realIndex;
        document.querySelectorAll(".gallery-tabs .tab-btn.active")
          .forEach(btn => btn.classList.remove("active"));

        const activeBtn = document.querySelector(
          `.gallery-tabs .tab-btn[data-index="${realIndex}"]`
        );
        if (activeBtn) activeBtn.classList.add("active");
      }
    }
  });

  document.querySelectorAll(".gallery-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const index = Number(this.dataset.index);

      document.querySelectorAll(".gallery-tabs .tab-btn.active")
        .forEach(b => b.classList.remove("active"));

      this.classList.add("active");

      swiper.slideToLoop(index);
    });
  });
});

// Car Collection Slider 
const carCollectionSwiper = new Swiper(".product-card-list__slider .car_detail_list", {
  slidesPerView: 3.02,
  spaceBetween: 32,
  navigation: {
    nextEl: ".car-slider-next",
    prevEl: ".car-slider-prev",
  },
  pagination: {
      el: '.swiper-pagination',
      clickable: true,         
  },
  breakpoints: {
    0: {
      slidesPerView: 1.01,
    },
    480: {
      slidesPerView: 1.01,
    },
    750: {
      slidesPerView: 2.01,
    },
    990: {
      slidesPerView: 3.01,
    }
  }
});


function cleanURL() {
  const url = new URL(window.location.href);
  url.searchParams.delete('customer_posted'); // remove ?customer_posted=true
  url.hash = ''; // remove #contact_form

  window.history.replaceState({}, document.title, url.pathname + url.search);
}
// Popup Js
$(document).on('click', '.section-car-estimate a.first_btn, #HeaderMenu-sell-my-car, #HeaderDrawer-sell-my-car', function(e){
  e.preventDefault();
  $('#get_estimate__popup').addClass('is-active');
  $('.theme-overlay').addClass('is-active');
  $('body').addClass('overflow-hidden');
});
$(document).on('click', '.product-detail__popup .close_btn', function() {
  $('.product-detail__popup').removeClass('is-active');
  $('.theme-overlay').removeClass('is-active');
  $('body').removeClass('overflow-hidden');
  cleanURL()
  $(this).parents('.product-detail__popup').removeClass('this_is_sold_out_product');
});

$(document).on('click', '.theme-overlay', function() {
  $('.product-detail__popup').removeClass('is-active');
  $(this).removeClass('is-active');
  $('body').removeClass('overflow-hidden');
  $('.thank-you__popup').removeClass('is-active');
  cleanURL()
  $(this).parents('.product-detail__popup').removeClass('this_is_sold_out_product');
});

$(document).on('click', '.custom-offer-btn a', function(){
  $(this).parents('product-info,.empty-search-wrapper').siblings('.product-detail__popup').addClass('is-active');
  $('.theme-overlay').addClass('is-active');
  $('body').addClass('overflow-hidden');
  if ($(this).closest('.custom-offer-btn').hasClass("custom-get_a_quote-btn")) {
    $(this).parents('product-info').siblings('.product-detail__popup').addClass('this_is_sold_out_product');
  }
});
$(document).on('click', '.shopify-section .onst-registration-form,.shopify-section .onst-registration-form-container-box form.Submitting button.btn.close_btn', function () {
  $('.onst-registration-form.SureCust-App').removeClass('active');
  $('body').removeClass('overflow-hidden');
});

// inner container par click thase to close nai thase
$(document).on(
  'click',
  '.shopify-section .onst-registration-form .onst-registration-form-container',
  function (e) {
    e.stopPropagation();
  }
);
setInterval(function () {
  const $form = $('.onst-registration-form-container-box form');

  if ($form.hasClass('Submitting')) {
    $form
      .closest('.onst-registration-form.SureCust-App')
      .addClass('is-submited');
  }
}, 300);
$(document).on('click', '.link[href="#returns"]', function(){
  $('#product-return__popup').addClass('is-active');
  $('.theme-overlay').addClass('is-active');
  $('body').addClass('overflow-hidden');
   $('.return-main-popup').removeClass('return-success-form');
  if ($(this).closest('.custom-offer-btn').hasClass("custom-get_a_quote-btn")) {
    $(this).parents('product-info').siblings('.product-detail__popup').addClass('this_is_sold_out_product');
     
  }
});
$(document).on('click', '.request_quote', function() {
  var $cardWrapperpopup = $(this).data('product-popup');
  $(`#${$cardWrapperpopup}`).addClass('is-active');
  $('.theme-overlay').addClass('is-active');
  $('body').addClass('overflow-hidden');
});

if(window.location.search.includes("?customer_posted=true") || window.location.hash.includes('#product-form-offer-')){
  $(`${window.location.hash}-thank`).addClass('is-active');
  $('.theme-overlay').addClass('is-active');
  $('body').addClass('overflow-hidden');
}

$(document).ready(function () {
  if (window.location.href.includes('customer_posted=true#contact_form')) {
    $('#product-return__popup').addClass('is-active');
    $('.return-main-popup').addClass('return-success-form');
    $('#product-return__popup').find(".product-popup-header .title-line").css("opacity", 0)
    $('#product-return__popup').find(".product-popup-header .title-line + p").css("opacity", 0)
    $('.theme-overlay').addClass('is-active');
    $('body').addClass('overflow-hidden');
    cleanURL()
  }
});
var hashname = window.location.hash;
var searchname = window.location.search.includes("contact");
var pathname = window.location.pathname;

var split_path = pathname.split('/');  
if (pathname != "/challenge") {
if(split_path[1] == 'products' && hashname == '#contact_form'){
    $('#thank-you__popup').addClass('is-active');
    $('.theme-overlay').addClass('is-active');
    $('body').addClass('overflow-hidden');
}

if(searchname){
    $('#thank-you__popup').addClass('is-active');
    $('.theme-overlay').addClass('is-active');
    $('body').addClass('overflow-hidden');
}
}

$(document).on('click', '.thank-you__popup .thankyou__ok', function(){
  $(this).parents('.thank-you__popup').removeClass('is-active');
  $('.theme-overlay').removeClass('is-active');
  $('body').removeClass('overflow-hidden');

  var searchParam = window.location.search.includes("contact_posted=true") ? window.location.search.replace("contact_posted=true", "") : window.location.search;
  var pathname = window.location.pathname + searchParam;
  window.location.href = pathname;
});



$(document).on('click', '.feild-input_wrapper .input-group-btn button', function (e) {
    e.stopPropagation();
    $(this).parents('.input-group-btn').toggleClass('open');
});

$(document).on('click', function (e) {
  if (!$(e.target).closest('.feild-input_wrapper .input-group-btn').length) {
    $('.feild-input_wrapper .input-group-btn.open').removeClass("open");
  }
});

$(document).on('click', '.feild-input_wrapper .dropdown-menu li a', function (evt) {
  evt.preventDefault();

  var inputGroup = $(this).closest('.feild-input_wrapper');
  var inputGroupBtn = inputGroup.find('.input-group-btn .btn');
  var inputGroupAddon = inputGroup.find('.input-group-addon');
  var inputGroupInput = inputGroup.find('.phone__input');

  var selectedCountry = $(this).closest('li');
  var selectedEmoji = selectedCountry.find('.country-code').html();
  var selectedDialCode = selectedCountry.find('.dial-code').html();
  var selectedExampleNumber = selectedCountry.find('.example-number').html();
  var selectedCountryCode = selectedCountry.find('.country-code').html();

  inputGroupBtn.find('.emoji').html(selectedEmoji);
  inputGroupAddon.html(selectedCountryCode);
  inputGroupInput.attr("placeholder", selectedDialCode + " " + selectedExampleNumber);
  $('.feild-input_wrapper .input-group-btn').removeClass("open");
});

function applyDefaultCountryCode(wrapper) {
  var defaultItem = wrapper.querySelector('.dropdown-menu li.is-default');
  if (!defaultItem) {
    defaultItem = Array.from(wrapper.querySelectorAll('.dropdown-menu li')).find(function (item) {
      var code = item.querySelector('.country-code');
      return code && code.textContent.trim() === 'NZ';
    });
  }
  if (!defaultItem) return;

  var emojiEl = defaultItem.querySelector('.country-code');
  var dialEl = defaultItem.querySelector('.dial-code');
  var exampleEl = defaultItem.querySelector('.example-number');
  var selectedEmoji = emojiEl ? emojiEl.textContent.trim() : '';
  var selectedDialCode = dialEl ? dialEl.textContent.trim() : '';
  var selectedExampleNumber = exampleEl ? exampleEl.textContent.trim() : '';

  if (!selectedEmoji) return;

  var inputGroupBtn = wrapper.querySelector('.input-group-btn .btn .emoji');
  var inputGroupAddon = wrapper.querySelector('.input-group-addon');
  var inputGroupInput = wrapper.querySelector('.phone__input');

  if (inputGroupBtn) inputGroupBtn.textContent = selectedEmoji;
  if (inputGroupAddon) inputGroupAddon.textContent = selectedEmoji;
  if (inputGroupInput && selectedDialCode && selectedExampleNumber) {
    inputGroupInput.setAttribute('placeholder', selectedDialCode + ' ' + selectedExampleNumber);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.feild-input_wrapper').forEach(function (wrapper) {
    applyDefaultCountryCode(wrapper);
  });
});


// Main Product Slider
$(".slider-button").click(function () {
  if ($(this).attr("data-name") == "next") {
    var getActiveNumber = Number($(".thumbnail[aria-current='true']").parent("li").attr("data-media-position")) + 1;
  } else if ($(this).attr("data-name") == "previous") {
    var getActiveNumber = Number($(".thumbnail[aria-current='true']").parent("li").attr("data-media-position")) - 1;
  }
  $(`.thumbnail-list__item.slider__slide[data-media-position="${getActiveNumber}"] button`).click();
});

// $(document).on('click', '.header-cart__icon', function(e) {
//   e.preventDefault();
//   const event = new MouseEvent('click', { bubbles: true, cancelable: true });
//   document.querySelector('#cart-icon-bubble')?.dispatchEvent(event);
// });


function applyCustomApiPartSearch(input) {
  if (!input || !input.classList.contains('part-search__field')) return;

  const query = input.value.toLowerCase().trim();

  const parent = input.closest('.custom-api-feature');
  if (!parent) return;

  const productsItems = parent.querySelectorAll(
    '.product-grid .grid__item.parts__item'
  );

  let visibleCount = 0;
  productsItems.forEach(item => {
    const searchableText = (
      item.getAttribute('data-search') ||
      item.getAttribute('data-title') ||
      item.textContent ||
      ''
    ).toLowerCase();

    if (searchableText.includes(query)) {
      item.style.display = '';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });

  // Handle "No results found"
  let noResultEl = parent.querySelector('.no-results-message');

  if (visibleCount === 0 && query !== '') {
    if (!noResultEl) {
      noResultEl = document.createElement('div');
      noResultEl.className = 'no-results-message';
      noResultEl.innerHTML = `
        <div class="empty-search-wrapper">
          <div>
            <svg width="108" height="109" viewBox="0 0 108 109" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 54.5C0 24.6766 24.1766 0 54 0C83.8234 0 108 24.6766 108 54.5C108 84.3234 83.8234 109 54 109C24.1766 109 0 84.3234 0 54.5Z" fill="#ECECF0" fill-opacity="0.5"/>
              <path d="M6 54.5C6 27.9903 27.4903 6.5 54 6.5C80.5097 6.5 102 27.9903 102 54.5C102 81.0097 80.5097 102.5 54 102.5C27.4903 102.5 6 81.0097 6 54.5Z" fill="#ECECF0"/>
              <path d="M52 68.5C60.8366 68.5 68 61.3366 68 52.5C68 43.6634 60.8366 36.5 52 36.5C43.1634 36.5 36 43.6634 36 52.5C36 61.3366 43.1634 68.5 52 68.5Z" stroke="#717182" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M72.0004 72.5004L63.4004 63.9004" stroke="#717182" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="empty-text-wrapper rte">
            <h3 data-no-results-title></h3>
            <p>We couldn't find any matching parts in our catalog.</p>
          </div>
        </div>
      `;
      parent.appendChild(noResultEl);
    }
    const title = noResultEl.querySelector('[data-no-results-title]');
    if (title) title.textContent = `No results for "${input.value.trim()}"`;
  } else {
    if (noResultEl) {
      noResultEl.remove();
    }
  }
}

window.applyCustomApiPartSearch = applyCustomApiPartSearch;

function normalizeDropdownText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getCustomSearchPartsCache(stockId) {
  const partsCache = window.findAPartPartsByStockId || {};
  return Array.isArray(partsCache[stockId]) ? partsCache[stockId] : null;
}

function setCustomSearchPartsCache(stockId, parts) {
  if (!stockId) return;
  window.findAPartPartsByStockId = window.findAPartPartsByStockId || {};
  window.findAPartPartsByStockId[stockId] = Array.isArray(parts) ? parts : [];
}

function getDropdownElements(wrapper) {
  return {
    trigger: wrapper.querySelector('.search_parts'),
    dropdown: wrapper.querySelector('.custom-search-dropdown'),
    input: wrapper.querySelector('.custom-search-dropdown__input'),
    status: wrapper.querySelector('[data-dropdown-status]'),
    list: wrapper.querySelector('[data-dropdown-list]')
  };
}

function collectPartsFromRenderedCards() {
  const links = document.querySelectorAll('.custom-api-feature .parts__item .card__heading a.full-unstyled-link');
  return Array.from(links).map(link => {
    const title = link.textContent.replace(/\s+/g, ' ').trim();
    const card = link.closest('.parts__item');
    const searchText = card ? card.getAttribute('data-search') : '';
    return {
      title,
      url: link.getAttribute('href') || '#',
      description: '',
      search_text: searchText || title
    };
  }).filter(item => item.title);
}

function renderCustomSearchDropdownList(wrapper, parts, query) {
  const { list, status } = getDropdownElements(wrapper);
  if (!list || !status) return;

  const normalizedQuery = normalizeDropdownText(query);
  const filtered = normalizedQuery
    ? parts.filter(part => {
      const searchable = normalizeDropdownText([
        part.title,
        part.description,
        part.search_text,
        part.stock_id
      ].filter(Boolean).join(' '));
      return searchable.includes(normalizedQuery);
    })
    : parts;

  list.innerHTML = '';

  if (!parts.length) {
    status.hidden = false;
    status.textContent = 'No parts found for this vehicle.';
    return;
  }

  if (!filtered.length) {
    status.hidden = false;
    status.textContent = `No matches for "${query.trim()}"`;
    return;
  }

  status.hidden = true;
  filtered.forEach(part => {
    const listItem = document.createElement('li');
    listItem.className = 'custom-search-dropdown__item';

    const link = document.createElement('a');
    link.className = 'custom-search-dropdown__link';
    link.href = part.url || '#';
    link.setAttribute('role', 'option');

    const title = document.createElement('span');
    title.className = 'custom-search-dropdown__title';
    title.textContent = part.title || 'Untitled part';
    link.appendChild(title);

    if (part.description) {
      const meta = document.createElement('span');
      meta.className = 'custom-search-dropdown__meta';
      meta.textContent = String(part.description).replace(/<[^>]*>/g, '').trim();
      link.appendChild(meta);
    }

    listItem.appendChild(link);
    list.appendChild(listItem);
  });
}

function closeAllCustomSearchDropdowns() {
  document.querySelectorAll('.custom-search-btn.is-open').forEach(wrapper => {
    const { trigger, dropdown } = getDropdownElements(wrapper);
    wrapper.classList.remove('is-open');
    if (dropdown) dropdown.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

function openCustomSearchDropdown(wrapper) {
  const stockId = (wrapper.dataset.stockId || '').trim();
  if (!stockId) return;

  const { trigger, dropdown, input, status } = getDropdownElements(wrapper);
  if (!dropdown || !trigger) return;

  closeAllCustomSearchDropdowns();

  wrapper.classList.add('is-open');
  dropdown.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');

  let cachedParts = getCustomSearchPartsCache(stockId);
  if (!cachedParts) {
    const cardParts = collectPartsFromRenderedCards();
    if (cardParts.length) {
      setCustomSearchPartsCache(stockId, cardParts);
      cachedParts = cardParts;
    }
  }

  if (!cachedParts) {
    if (status) {
      status.hidden = false;
      status.textContent = 'Loading available parts…';
    }
    cachedParts = [];
  }

  renderCustomSearchDropdownList(wrapper, cachedParts, input ? input.value : '');
  if (input) input.focus();
}

document.addEventListener('findapart:parts-loaded', function (event) {
  const detail = event.detail || {};
  const stockId = String(detail.stockId || '').trim();
  const parts = Array.isArray(detail.parts) ? detail.parts : [];
  if (!stockId) return;

  setCustomSearchPartsCache(stockId, parts);

  const openDropdown = Array.from(document.querySelectorAll('.custom-search-btn.is-open')).find(buttonWrapper => {
    return (buttonWrapper.dataset.stockId || '').trim() === stockId;
  });
  if (!openDropdown) return;

  const { input } = getDropdownElements(openDropdown);
  renderCustomSearchDropdownList(openDropdown, parts, input ? input.value : '');
});

document.addEventListener('click', function (event) {
  const trigger = event.target.closest('.custom-search-btn .search_parts');
  if (trigger) {
    event.preventDefault();
    const wrapper = trigger.closest('.custom-search-btn');
    if (!wrapper) return;

    if (wrapper.classList.contains('is-open')) {
      closeAllCustomSearchDropdowns();
      return;
    }

    openCustomSearchDropdown(wrapper);
    return;
  }

  if (!event.target.closest('.custom-search-btn')) {
    closeAllCustomSearchDropdowns();
  }
});

document.addEventListener('input', function (event) {
  if (!event.target.classList.contains('custom-search-dropdown__input')) return;
  const wrapper = event.target.closest('.custom-search-btn');
  if (!wrapper) return;

  const stockId = (wrapper.dataset.stockId || '').trim();
  const parts = getCustomSearchPartsCache(stockId) || [];
  renderCustomSearchDropdownList(wrapper, parts, event.target.value);
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeAllCustomSearchDropdowns();
    return;
  }

  if (event.key === 'Enter' && event.target.classList.contains('custom-search-dropdown__input')) {
    event.preventDefault();
    const wrapper = event.target.closest('.custom-search-btn');
    if (!wrapper) return;

    const firstResult = wrapper.querySelector('.custom-search-dropdown__link');
    if (firstResult) window.location.href = firstResult.href;
  }
});

document.addEventListener('input', function (e) {
  if (!e.target.classList.contains('part-search__field')) return;
  applyCustomApiPartSearch(e.target);
});

document.addEventListener('click', function (e) {
  const button = e.target.closest('.custom-api-feature .search__button');
  if (!button) return;
  if (button.closest('form.part-search-form')) return;

  const input = button.closest('.field')?.querySelector('.part-search__field');
  if (!input) return;

  e.preventDefault();
  applyCustomApiPartSearch(input);
  input.focus();
});

// Breadcrumb js
document.addEventListener('click', function (e) {
  const productLink = e.target.closest('a[href*="/products/"]');
  if (!productLink) return;

  if (location.pathname.includes('/search')) { 
    var params = new URLSearchParams(window.location.search);
  } else {
    var params = "";
  }
  console.log(params,"paramsparams")
  const term = params;

  sessionStorage.setItem('lastSearchTerm', term);
});
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('template__product')) return;

  const term = sessionStorage.getItem('lastSearchTerm');
  console.log(term);
  if (!term) return;

  const crumb = document.querySelector('.search-breadcrumb');
  const link = document.getElementById('search-breadcrumb-link');

  if (crumb && link) {
    crumb.style.display = 'list-item';
    crumb.previousElementSibling.style.display = "none";
    link.href = `/search?${term}`;
    const params = new URLSearchParams(term);
    if (term.includes("VEHICLE")) {
      var qValue = "Vehicle";
    } else {
      var qValue = "Part";
    }
    link.textContent = `${qValue}`;
  }
});
