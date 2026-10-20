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
    count.textContent = bn(visible) + 'টি রিসোর্স' + (filter === 'quartet' ? ' · QUARTET I ও II' : ' · আপনার শেখার লাইব্রেরি');
    empty.hidden = visible > 0;
  }
  search.addEventListener('input', render);
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.libraryFilter;
    render();
  }));
  if (location.hash === '#quartet') filter = 'quartet';
  render();
  document.querySelector('[data-library-controls]').hidden = false;
})();
