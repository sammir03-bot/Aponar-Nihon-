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
        const rect = nav.getBoundingClientRect();
        if (rect.height) clearance = Math.max(clearance, innerHeight - rect.top + 16);
      });
      if (clearance) document.documentElement.style.setProperty('--an-bottom-nav-clearance', Math.ceil(clearance) + 'px');
    }
    measure();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      navs.forEach(nav => observer.observe(nav));
    }
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('hashchange', () => navs.forEach(markCurrent));
    window.addEventListener('aponar:languagechange', () => { navs.forEach(markCurrent); measure(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
