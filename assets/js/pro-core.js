(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('an-js');

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  const runIdle = (callback) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: 1500 });
    } else {
      window.setTimeout(callback, 1);
    }
  };

  const protectExternalLinks = () => {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', [...rel].join(' '));
    });
  };

  const optimizeMedia = () => {
    const fold = Math.max(window.innerHeight || 0, 700) * 1.35;

    document.querySelectorAll('img').forEach((img, index) => {
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
      if (
        index > 1 &&
        !img.hasAttribute('loading') &&
        img.getBoundingClientRect().top > fold &&
        img.getAttribute('fetchpriority') !== 'high'
      ) {
        img.loading = 'lazy';
      }
    });

    document.querySelectorAll('iframe').forEach((frame) => {
      if (!frame.hasAttribute('loading')) frame.loading = 'lazy';
    });
  };

  const reflectDevicePreferences = () => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reducedMotion?.matches) root.dataset.reducedMotion = 'true';

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData) root.dataset.saveData = 'true';
  };

  const markReady = () => {
    root.classList.add('an-ready');
  };

  onReady(() => {
    markReady();
    reflectDevicePreferences();
    runIdle(() => {
      protectExternalLinks();
      optimizeMedia();
    });
  });
})();
