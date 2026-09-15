(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('[data-study-chapter]')];
  const select = document.getElementById('study-chapter-select');
  const toolbar = document.getElementById('study-toolbar');
  const status = document.getElementById('study-status');
  if (!chapters.length || !select || !toolbar || !status) return;
  const storageKey = 'quartetStudyLastV1';
  const resolve = hash => {
    const match = /^#guide-([0-7])(?:-part-\d+)?$/.exec(hash);
    const target = match && document.getElementById(hash.slice(1));
    return target ? { target, chapter: chapters[Number(match[1])] } : null;
  };
  let saved = '';
  try { saved = localStorage.getItem(storageKey) || ''; } catch (_) { /* Reading works without storage. */ }
  let current = null;
  const show = (hash, scroll = false) => {
    const destination = resolve(hash) || resolve('#guide-0');
    chapters.forEach(chapter => { chapter.hidden = chapter !== destination.chapter; });
    select.value = destination.chapter.dataset.studyChapter;
    status.textContent = select.selectedOptions[0].textContent;
    current = destination;
    try { localStorage.setItem(storageKey, '#' + destination.target.id); } catch (_) { /* Optional preference. */ }
    if (scroll) {
      destination.target.scrollIntoView({ block: 'start' });
      const heading = destination.target.matches('h3') ? destination.target : destination.chapter.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  };
  const initial = resolve(location.hash) ? location.hash : (!location.hash && resolve(saved) ? saved : '#guide-0');
  show(initial, Boolean(resolve(location.hash)));
  toolbar.hidden = false;
  select.addEventListener('change', () => { location.hash = '#guide-' + select.value; });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#study-content') {
      document.getElementById('study-content').scrollIntoView();
      current.chapter.querySelector('h2')?.focus({ preventScroll: true });
      return;
    }
    show(location.hash, true);
  });
})();
