(() => {
  'use strict';
  const grid = document.querySelector('[data-library-grid]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('[data-track]')];
  const search = document.querySelector('#library-search');
  const filters = [...document.querySelectorAll('[data-library-filter]')];
  const count = document.querySelector('[data-library-count]');
  const empty = document.querySelector('[data-library-empty]');
  let filter = 'all';
  const bn = number => String(number).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]);
function dynT(k,v){if(window.AponarDyn)return window.AponarDyn(k,v);var s=dynT._b[k]||k;if(v)for(var x in v)s=s.split("{"+x+"}").join(v[x]);return s;}dynT._b={"ll.resources": "{n}টি রিসোর্স", "ll.quartetSuffix": " · QUARTET I ও II", "ll.librarySuffix": " · আপনার শেখার লাইব্রেরি"};function dynLang(){return window.AponarDynLang?window.AponarDynLang():'bn';}function num(v){return dynLang()==='bn'?bn(v):String(v);}
  const normalize = value => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  function render() {
    const query = normalize(search.value);
    let visible = 0;
    cards.forEach(card => {
      const category = card.dataset.libraryCategory;
      const matchesFilter = filter === 'all' || category === filter;
      const matchesQuery = normalize(card.textContent + ' ' + (card.dataset.search || '')).includes(query);
      card.hidden = !(matchesFilter && matchesQuery);
      if (!card.hidden) visible++;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.libraryFilter === filter)));
    count.textContent = dynT('ll.resources', {n: num(visible)}) + (filter === 'quartet' ? dynT('ll.quartetSuffix') : dynT('ll.librarySuffix'));
    empty.hidden = visible > 0;
  }
  search.addEventListener('input', render);
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.libraryFilter;
    render();
  }));
  if (location.hash === '#quartet' && filters.some(button => button.dataset.libraryFilter === 'quartet')) filter = 'quartet';
  render();
  document.querySelector('[data-library-controls]').hidden = false;
})();
