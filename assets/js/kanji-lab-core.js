// Course logic is independent of rendering so level boundaries and recall
// scheduling can be verified without a browser or external account.
export const STORAGE_KEY = 'aponarKanjiLabV2';
export const DAY = 86400000;
export const INTERVALS = [1, 3, 7, 14, 30];
export const LEVELS = ['n5', 'n4'];
export const dayKey = time => {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const normalize = value => String(value).normalize('NFKC').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s/g, '').toLowerCase();
export const blankState = () => ({version: 2, cards: {}, lastLesson: {}, dates: [], migration: false});
export const rowsForLevel = (data, level) => LEVELS.includes(level) ? data.kanji.filter(row => row.level === level) : [];
export const lessonsForLevel = (data, level) => LEVELS.includes(level) ? data.lessons.filter(row => row.level === level) : [];
export const allowedText = (text, level, map) => [...text].every(c => !/[一-鿿]/.test(c) || (map[c] || 0) >= Number(level.slice(1)));
export const studied = record => Boolean(record && (record.legacy || (record.skills?.meaning?.right > 0 && record.skills?.reading?.right > 0)));
export const mastered = record => Boolean(record && record.dates?.length >= 2 && record.streak >= 3 && record.skills?.meaning?.right >= 2 && record.skills?.reading?.right >= 2 && record.lastCorrect > (record.lastWrong || 0));
export const dueRows = (bank, state, now = Date.now()) => bank.filter(row => state.cards[row.k] && (state.cards[row.k].lastCorrect || state.cards[row.k].lastWrong) && state.cards[row.k].due <= now).sort((a, b) => state.cards[a.k].due - state.cards[b.k].due);

export function readState(storage, data) {
  let state = blankState();
  const migrations = data.migrations || data.kanji;
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (value?.version === 2 && value.cards && typeof value.cards === 'object' && !Array.isArray(value.cards)) {
      state = {...state, ...value};
      state.dates = Array.isArray(value.dates) ? value.dates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)) : [];
      state.lastLesson = value.lastLesson && typeof value.lastLesson === 'object' ? value.lastLesson : {};
      // A level-specific download must retain progress earned in other levels.
      const known = new Set([...Object.keys(data.levelMap), ...data.kanji.map(row => row.k)]);
      state.cards = Object.fromEntries(Object.entries(value.cards).filter(([k, r]) => known.has(k) && r && typeof r === 'object'));
      for (const [k, record] of Object.entries(state.cards)) record.level = 'n' + data.levelMap[k];
    }
  } catch (_error) { /* Malformed storage does not prevent learning. */ }
  if (!state.migration) {
    for (const level of ['n5', 'n4']) {
      let ids = new Set();
      try {
        const old = JSON.parse(storage.getItem(`aponarnihon-${level}-kanji-dark-learned`) || '[]');
        if (Array.isArray(old)) ids = new Set(old.map(String));
      } catch (_error) { /* Keep valid progress from the other level. */ }
      for (const row of migrations) {
        if (row.legacy.some(([l, id]) => l === level && ids.has(id)) && !state.cards[row.k]) {
          state.cards[row.k] = {legacy: true, level: row.level, dates: [], skills: {}, due: 0, streak: 0};
        }
      }
    }
    state.migration = true;
  }
  return state;
}

export function saveState(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    storage.setItem('aponarKanjiStudiedV2', JSON.stringify(Object.entries(state.cards).filter(([, r]) => studied(r)).map(([k]) => k)));
    for (const level of LEVELS) storage.setItem('aponarKanjiStudiedV2:' + level, JSON.stringify(Object.entries(state.cards).filter(([, r]) => r.level === level && studied(r)).map(([k]) => k)));
    return true;
  } catch (_error) { return false; }
}

export function grade(record, correct, skill, now = Date.now()) {
  const next = {dates: [], skills: {}, due: 0, stage: 0, streak: 0, ...record};
  next.dates = Array.isArray(next.dates) ? [...next.dates] : [];
  next.skills = {...next.skills};
  const previous = next.skills[skill] || {right: 0, wrong: 0};
  next.skills[skill] = {right: (previous.right || 0) + Number(correct), wrong: (previous.wrong || 0) + Number(!correct)};
  const today = dayKey(now);
  if (correct) {
    const firstToday = !next.dates.includes(today);
    if (firstToday) next.dates.push(today);
    next.stage = Math.min(5, Math.max(1, (next.stage || 0) + Number(firstToday)));
    next.streak = (next.streak || 0) + 1;
    next.lastCorrect = now;
    // A correct reading must not erase a meaning error made moments earlier.
    next.due = next.lastWrong && now - next.lastWrong < 600000 ? next.lastWrong + 600000 : now + INTERVALS[next.stage - 1] * DAY;
  } else {
    next.lastWrong = now;
    next.stage = 0;
    next.streak = 0;
    next.errors = (next.errors || 0) + 1;
    next.due = now + 600000;
  }
  return next;
}

export function streakDays(dates, now = Date.now()) {
  const all = new Set(dates);
  let day = new Date(now);
  if (!all.has(dayKey(day))) day.setDate(day.getDate() - 1);
  let count = 0;
  while (all.has(dayKey(day))) { count++; day.setDate(day.getDate() - 1); }
  return count;
}

export function shuffle(values, random = Math.random) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function question(row, kind, bank, random = Math.random) {
  // Distractors come exclusively from the learner's exact selected level.
  bank = bank.filter(r => r.level === row.level && r.words.length);
  const word = row.words[0];
  const label = r => kind === 'meaning' ? r.bn : kind === 'spelling' ? r.words[0].ja : r.words[0].reading;
  const answer = label(row);
  const choices = [answer];
  const seen = new Set([normalize(answer)]);
  for (const candidate of shuffle(bank.filter(r => r.k !== row.k), random)) {
    const value = label(candidate);
    if (!seen.has(normalize(value))) { choices.push(value); seen.add(normalize(value)); }
    if (choices.length === 4) break;
  }
  return {k: row.k, kind, word, answer, choices: shuffle(choices, random), prompt: kind === 'meaning' ? row.k : kind === 'spelling' ? word.reading : word.ja};
}
