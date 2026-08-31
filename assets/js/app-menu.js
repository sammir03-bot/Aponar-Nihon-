(function () {
  'use strict';

  const openers = Array.from(document.querySelectorAll('[data-app-menu-open]'));
  if (!openers.length || document.getElementById('appMenu')) return;

  const groups = [
    {
      title: 'মূল পাতা', titleKey: 'menu.main',
      items: [
        { key: 'home', href: '/', icon: 'fa-house', label: 'হোম', labelKey: 'menu.home', note: 'সব গুরুত্বপূর্ণ সেকশন', noteKey: 'menu.home.note' },
      ],
    },
    {
      title: 'JLPT শেখা', titleKey: 'menu.jlpt',
      items: [
        { key: 'n5', href: '/n5.html', icon: 'fa-layer-group', label: 'JLPT N5', note: 'Beginner learning center', noteKey: 'menu.n5.note' },
        { key: 'n4', href: '/n4.html', icon: 'fa-book-open', label: 'JLPT N4', note: 'Elementary learning center', noteKey: 'menu.n4.note' },
        { key: 'n3', href: '/n3.html', icon: 'fa-graduation-cap', label: 'JLPT N3', note: 'Intermediate learning center', noteKey: 'menu.n3.note' },
      ],
    },
    {
      title: 'Practice & প্রস্তুতি', titleKey: 'menu.practice',
      items: [
        { key: 'quiz', href: '/quiz.html', icon: 'fa-bolt', label: 'কুইজ Arena', labelKey: 'menu.quiz', note: 'Level ও category practice', noteKey: 'menu.quiz.note' },
        { key: 'tutor', href: '/tutor-section.html', icon: 'fa-robot', label: 'AI Tutor', note: 'বাংলায় ব্যক্তিগত Japanese coach', noteKey: 'menu.tutor.note' },
        { key: 'mock', href: '/mock-test.html', icon: 'fa-clipboard-check', label: 'Mock Test', note: 'Exam simulation ও review', noteKey: 'menu.mock.note' },
        { key: 'interview', href: '/interview.html', icon: 'fa-user-tie', label: 'ইন্টারভিউ', labelKey: 'menu.interview', note: 'Job, school, embassy ও SSW', noteKey: 'menu.interview.note' },
      ],
    },
    {
      title: 'Japan & দরকারি Tools', titleKey: 'menu.japan',
      items: [
        { key: 'japan-life', href: '/japan-life.html', icon: 'fa-train-subway', label: 'জাপান লাইফ', labelKey: 'menu.japanlife', note: 'নতুনদের practical guide', noteKey: 'menu.japanlife.note' },
        { key: 'cv', href: '/cv-builder.html', icon: 'fa-file-signature', label: 'Japan CV Builder', note: '履歴書 তৈরি করুন', noteKey: 'menu.cv.note' },
        { key: 'toolkit', href: '/student-tools.html', icon: 'fa-toolbox', label: 'Student Toolkit', note: 'জীবন ও পড়াশোনার tools', noteKey: 'menu.toolkit.note' },
        { key: 'profile', href: '/profile.html', icon: 'fa-circle-user', label: 'Profile', note: 'Progress ও account', noteKey: 'menu.profile.note' },
      ],
    },
  ];

  const path = window.location.pathname.toLowerCase();

  function currentKey() {
    if (path === '/' || path.endsWith('/index.html')) return 'home';
    if (path.includes('tutor-section')) return 'tutor';
    if (path.includes('interview')) return 'interview';
    if (path.includes('jlpt-quiz') || path.endsWith('/quiz.html')) return 'quiz';
    if (/\/n5(?:[._-]|$)/.test(path)) return 'n5';
    if (/\/n4(?:[._-]|$)/.test(path)) return 'n4';
    if (/\/n3(?:[._-]|$)/.test(path)) return 'n3';
    if (path.includes('mock-test')) return 'mock';
    if (path.includes('cv-builder')) return 'cv';
    if (path.includes('student-tools')) return 'toolkit';
    if (path.includes('japan-life')) return 'japan-life';
    if (path.includes('profile')) return 'profile';
    return '';
  }

  function i18nAttr(key) {
    return key ? ` data-i18n="${key}"` : '';
  }

  const activeKey = currentKey();
  const links = groups.map((group, groupIndex) => {
    const items = group.items.map((item) => {
      const active = item.key === activeKey;
      return `<a class="app-menu-link${active ? ' active' : ''}" href="${item.href}"${active ? ' aria-current="page"' : ''}>
        <span class="app-menu-link-icon"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
        <span class="app-menu-link-copy"><strong${i18nAttr(item.labelKey)}>${item.label}</strong><small${i18nAttr(item.noteKey)}>${item.note}</small></span>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </a>`;
    }).join('');
    return `<section class="app-menu-group" aria-labelledby="appMenuGroup-${groupIndex}">
      <span class="app-menu-group-title" id="appMenuGroup-${groupIndex}" data-i18n="${group.titleKey}">${group.title}</span>
      <div class="app-menu-links">${items}</div>
    </section>`;
  }).join('');

  const layer = document.createElement('div');
  layer.className = 'app-menu-layer';
  layer.id = 'appMenu';
  layer.hidden = true;
  layer.innerHTML = `
    <button class="app-menu-backdrop" type="button" data-app-menu-close tabindex="-1" aria-label="মেনু বন্ধ করুন" data-i18n-aria-label="menu.close"></button>
    <aside class="app-menu-drawer" role="dialog" aria-modal="true" aria-labelledby="appMenuTitle">
      <header class="app-menu-head">
        <div class="app-menu-brand">
          <img src="/logo.png" alt="" width="46" height="46">
          <span class="app-menu-brand-copy"><strong id="appMenuTitle" data-i18n="menu.title">আপনার নিহোন</strong><span data-i18n="menu.subtitle">এক menu-তে পুরো learning app</span></span>
        </div>
        <button class="app-menu-close" type="button" data-app-menu-close aria-label="মেনু বন্ধ করুন" data-i18n-aria-label="menu.close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </header>
      <div class="app-menu-scroll">
        <p class="app-menu-intro"><i class="fa-solid fa-compass" aria-hidden="true"></i><span data-i18n="menu.intro">যে সেকশন দরকার, এখান থেকে সরাসরি খুলুন</span></p>
        <nav aria-label="সব সেকশন">${links}</nav>
      </div>
      <footer class="app-menu-foot" data-i18n="menu.footer">বাংলায় জাপানি শেখার পূর্ণাঙ্গ app · あなたの日本</footer>
    </aside>`;
  document.body.appendChild(layer);
  if (window.AponarI18n) window.AponarI18n.translate(layer);

  const drawer = layer.querySelector('.app-menu-drawer');
  const closeButton = layer.querySelector('.app-menu-close');
  let lastOpener = null;
  let closeTimer = 0;

  openers.forEach((opener) => {
    opener.setAttribute('aria-controls', 'appMenu');
    opener.setAttribute('aria-expanded', 'false');
  });

  function openMenu(opener) {
    window.clearTimeout(closeTimer);
    lastOpener = opener;
    layer.hidden = false;
    document.body.classList.add('app-menu-open');
    openers.forEach((button) => button.setAttribute('aria-expanded', 'true'));
    if (window.AponarI18n) window.AponarI18n.translate(layer);
    window.requestAnimationFrame(() => {
      layer.classList.add('is-open');
      closeButton.focus({ preventScroll: true });
    });
  }

  function closeMenu(options = {}) {
    if (layer.hidden) return;
    layer.classList.remove('is-open');
    document.body.classList.remove('app-menu-open');
    openers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
    closeTimer = window.setTimeout(() => {
      layer.hidden = true;
      if (options.restoreFocus !== false && lastOpener?.isConnected) {
        lastOpener.focus({ preventScroll: true });
      }
    }, delay);
  }

  openers.forEach((opener) => opener.addEventListener('click', () => openMenu(opener)));
  layer.addEventListener('click', (event) => {
    if (event.target.closest('[data-app-menu-close]')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (layer.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  layer.querySelectorAll('.app-menu-link').forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });
})();