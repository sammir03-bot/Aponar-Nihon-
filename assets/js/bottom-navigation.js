(() => {
  'use strict';

  const selector = 'nav.app-dock, nav.bottom, nav.bottom-nav, nav.app-bottom-nav, nav.study-dock, div.bottom-nav';
  const locales = new Set(['bn', 'en', 'ja', 'vi', 'ne', 'hi', 'ur', 'my', 'zh', 'si', 'fil']);
  const hashRoutes = { home: '/', n5: '/n5', n4: '/n4', n3: '/n3', quiz: '/quiz', guide: '/study-guide', interviews: '/interview', 'essential-phrases': '/essential-phrases' };

  function path(url) {
    const parts = decodeURIComponent(url.pathname).replace(/\/index\.html$/, '/').replace(/\.html$/, '').split('/').filter(Boolean);
    if (locales.has(parts[0])) parts.shift();
    return '/' + parts.join('/');
  }

  function markCurrent(nav) {
    const current = path(new URL(location.href));
    const links = [...nav.querySelectorAll(':scope > a')];
    let best = null;
    let bestScore = 0;
    for (const link of links) {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) continue;
      const target = path(url) === '/' && hashRoutes[url.hash.slice(1)] ? hashRoutes[url.hash.slice(1)] : path(url);
      // A local hash is a page action, e.g. the current mock level, not Home.
      const localAction = (link.getAttribute('href') || '').startsWith('#');
      let score = localAction ? (link.classList.contains('active') ? 4 : 0) : current === target ? 3 : 0;
      if (!score && target !== '/' && current.startsWith(target + '-')) score = 2;
      if (!score && url.hash === '#n5' && /^\/n[345](?:$|-)/.test(current)) score = 1;
      if (!score && target === '/mock-test' && (/^\/n[345]-mock-tests$/.test(current) || current === '/jlpt-exam')) score = 1;
      if (score > bestScore) { best = link; bestScore = score; }
    }
    // Older lesson pages identify their parent section with an active link.
    // Preserve that section hint, but never infer Home on an unrelated route.
    if (!best) best = links.find(link => {
      if (!link.classList.contains('active')) return false;
      const url = new URL(link.href, location.href);
      const target = path(url) === '/' ? hashRoutes[url.hash.slice(1)] || '/' : path(url);
      return url.origin === location.origin && target !== '/';
    }) || null;
    links.forEach(link => {
      link.classList.toggle('active', link === best);
      if (link === best) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function setup() {
    const navs = [...document.querySelectorAll(selector)];
    if (!navs.length) return;
    document.body.classList.add('an-has-bottom-nav');
    navs.forEach(nav => {
      nav.classList.add('an-bottom-nav');
      nav.dataset.anBottomNav = 'true';
      if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', document.documentElement.lang === 'bn' ? 'মূল নেভিগেশন' : 'Main navigation');
      if (nav.tagName !== 'NAV') nav.setAttribute('role', 'navigation');
      markCurrent(nav);
    });

    function measure() {
      let clearance = 0;
      navs.forEach(nav => {
        // A reading bar may be translated below the viewport. Its untransformed
        // height still needs to be reserved at the end of the document.
        const height = nav.offsetHeight;
        const bottom = Number.parseFloat(getComputedStyle(nav).bottom) || 0;
        if (height) clearance = Math.max(clearance, height + bottom + 16);
      });
      if (clearance) document.documentElement.style.setProperty('--an-bottom-nav-clearance', Math.ceil(clearance) + 'px');
    }
    measure();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      navs.forEach(nav => observer.observe(nav));
    }
    setupPhoneReading(navs, measure);
    window.addEventListener('hashchange', () => navs.forEach(markCurrent));
    window.addEventListener('aponar:languagechange', () => { navs.forEach(markCurrent); measure(); });
  }

  function setupPhoneReading(navs, measure) {
    const phone = matchMedia('(max-width: 800px)');
    const viewport = window.visualViewport;
    let viewportWidth = innerWidth;
    let fullHeight = Math.max(innerHeight, viewport?.height || 0);
    let lastTarget = document.scrollingElement;
    let lastTop = Math.max(0, window.scrollY);
    let direction = 0, distance = 0, frame = 0, scrollFrame = 0;
    let latestScroll = null;

    const typing = () => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return false;
      if (element.isContentEditable) return true;
      if (element.matches('textarea:not([readonly]):not(:disabled)')) return true;
      return element.matches('input:not([readonly]):not(:disabled)') &&
        !/^(button|checkbox|color|file|hidden|image|radio|range|reset|submit)$/.test(element.type);
    };
    const show = () => {
      document.body.classList.remove('an-nav-reading');
      direction = 0;
      distance = 0;
    };

    function updateViewport() {
      frame = 0;
      const height = Math.max(innerHeight, viewport?.height || 0);
      if (Math.abs(viewportWidth - innerWidth) > 80) {
        viewportWidth = innerWidth;
        fullHeight = height;
      }
      // Browser chrome changes the visible area slightly; a software keyboard
      // takes substantially more space and has a text field focused.
      if (!typing()) fullHeight = Math.max(fullHeight, height);
      const visibleHeight = viewport?.height || innerHeight;
      const zoomed = viewport && Math.abs(viewport.scale - 1) > .05;
      const keyboard = phone.matches && typing() && !zoomed &&
        Math.max(innerHeight - visibleHeight, fullHeight - visibleHeight) > 140;
      const wasKeyboard = document.body.classList.contains('an-nav-keyboard-open');
      document.body.classList.toggle('an-nav-keyboard-open', Boolean(keyboard));
      if (keyboard || wasKeyboard || !phone.matches) show();
      if (Boolean(keyboard) !== wasKeyboard) {
        lastTarget = document.scrollingElement;
        lastTop = Math.max(0, window.scrollY);
      }
      measure();
    }
    const scheduleViewport = () => {
      if (!frame) frame = requestAnimationFrame(updateViewport);
    };

    function readScroll() {
      scrollFrame = 0;
      if (!latestScroll) return;
      const { target, top, remaining } = latestScroll;
      latestScroll = null;
      if (target !== lastTarget) {
        lastTarget = target;
        lastTop = top;
        direction = 0;
        distance = 0;
        return;
      }
      const delta = top - lastTop;
      lastTop = top;
      if (!phone.matches || top < 64 || remaining < 12 ||
          document.body.classList.contains('an-nav-keyboard-open') ||
          navs.some(nav => nav.contains(document.activeElement))) {
        show();
        return;
      }
      if (Math.abs(delta) < 1) return;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      if (direction > 0 && distance >= 24) document.body.classList.add('an-nav-reading');
      if (direction < 0 && distance >= 8) show();
    }

    document.addEventListener('scroll', event => {
      let target = event.target;
      let top, remaining;
      if (target === document || target === document.scrollingElement) {
        target = document.scrollingElement;
        top = Math.max(0, window.scrollY);
        remaining = target.scrollHeight - innerHeight - top;
      } else {
        // Support full-height workspaces without responding to small menus,
        // lesson indexes, textareas or horizontal shortcut scrolling.
        if (!(target instanceof HTMLElement) || target.clientHeight < innerHeight * .6 ||
            target.scrollHeight <= target.clientHeight + 40 ||
            target.closest('nav, [role="navigation"], dialog, input, textarea, select')) return;
        top = Math.max(0, target.scrollTop);
        remaining = target.scrollHeight - target.clientHeight - top;
      }
      latestScroll = { target, top, remaining };
      if (!scrollFrame) scrollFrame = requestAnimationFrame(readScroll);
    }, { passive: true, capture: true });

    document.addEventListener('focusin', event => {
      if (navs.some(nav => nav.contains(event.target))) show();
      scheduleViewport();
    });
    document.addEventListener('focusout', scheduleViewport);
    document.addEventListener('keydown', event => { if (event.key === 'Tab') show(); });
    window.addEventListener('resize', scheduleViewport, { passive: true });
    viewport?.addEventListener('resize', scheduleViewport, { passive: true });
    phone.addEventListener('change', () => { show(); scheduleViewport(); });
    window.addEventListener('hashchange', show);
    window.addEventListener('pageshow', () => {
      lastTop = Math.max(0, window.scrollY);
      lastTarget = document.scrollingElement;
      show();
      scheduleViewport();
    });
    updateViewport();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
