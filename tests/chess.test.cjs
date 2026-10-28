const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = readFileSync(path.join(__dirname, '..', 'assets/js/chess.js'), 'utf8');
const source = script.replace(/\}\)\(\);\s*$/, `
  window.testChess = { normalizeMatch, formatDate, renderQuickInfo, renderTimeline, renderLeaderboard, initScheduleLinks, renderPassword, init };
})();`);
const historical = { ssn: 1, series: 'ec', date: '2025-11-25', winners: [{ rank: 1, name: 'Past player' }] };
const scheduled = { ssn: 2, series: 'ec', date: '2026-12-01' };
const now = new Date(2026, 9, 20);
const container = () => ({ innerHTML: '', querySelectorAll: () => [], querySelector: () => null });

test('copy password reports success, permission rejection and unavailable clipboard', async () => {
  for (const outcome of ['success', 'rejected', 'unavailable']) {
    let click;
    let copied;
    let reset;
    const status = { textContent: '' };
    const code = { textContent: '' };
    const button = {
      textContent: '复制', disabled: false,
      classList: { add() {}, remove() {} },
      addEventListener(type, callback) { click = callback; },
    };
    const window = { CHESS_DATA: { config: { password: 'test-only-password' } } };
    const document = {
      readyState: 'loading', addEventListener() {},
      querySelector: (selector) => ({ '[data-copy-password]': button, '[data-copy-status]': status, '[data-password-code]': code })[selector],
    };
    const navigator = outcome === 'unavailable' ? {} : { clipboard: { async writeText(value) {
      if (outcome === 'rejected') throw new Error('Permission denied');
      copied = value;
    } } };
    vm.runInNewContext(source, { window, document, navigator, setTimeout(callback) { reset = callback; } });
    window.testChess.renderPassword();
    await click();
    assert.equal(code.textContent, 'test-only-password');
    if (outcome === 'success') {
      assert.equal(copied, 'test-only-password');
      assert.match(status.textContent, /已复制/);
      assert.equal(button.disabled, true);
      reset();
      assert.equal(button.disabled, false);
      assert.equal(button.textContent, '复制');
    } else {
      assert.match(status.textContent, /复制失败.*手动复制/);
      assert.equal(button.disabled, false);
    }
  }
});

function load(matches) {
  const window = { CHESS_DATA: {
    config: { current_season: 2, season_label: 'S2' },
    seasons: [{ id: 1, label: 'S1 · 2025-2026' }, { id: 2, label: 'S2 · 当前赛季' }],
    series: [{ id: 'ec', full_name: 'E.C. {season}' }], matches,
  } };
  const document = { readyState: 'loading', addEventListener() {}, querySelector: () => null };
  vm.runInNewContext(source, { window, document });
  return window.testChess;
}

test('history cards and current match dates keep their year', () => {
  const chess = load([historical]);
  const matches = [historical].map(chess.normalizeMatch);
  const timeline = container();
  chess.renderTimeline(timeline, matches, now, 1);
  assert.match(timeline.innerHTML, /2025年11月25日/);
  assert.match(chess.formatDate(new Date(2026, 11, 1)), /2026年12月1日/);
});

test('unpublished current season explains empty overview, schedule and rankings', () => {
  const chess = load([historical]);
  const matches = [historical].map(chess.normalizeMatch);
  const quick = container(), timeline = container(), rankings = container();
  chess.renderQuickInfo(quick, matches, now);
  chess.renderTimeline(timeline, matches, now, 2);
  chess.renderLeaderboard(rankings, matches, now, 2);
  assert.match(quick.innerHTML, /S2 尚无已发布赛程/);
  assert.match(timeline.innerHTML, /赛程尚未发布/);
  assert.match(rankings.innerHTML, /赛果录入后显示/);
  for (const output of [quick, timeline, rankings]) {
    assert.match(output.innerHTML, /data-show-season="1"/);
    assert.match(output.innerHTML, /查看历史赛程/);
  }
  assert.doesNotMatch(rankings.innerHTML, /Past player/);
});

test('a site without history does not offer a broken history button', () => {
  const chess = load([]), quick = container(), rankings = container();
  chess.renderQuickInfo(quick, [], now);
  chess.renderLeaderboard(rankings, [], now, 2);
  assert.match(quick.innerHTML, /尚无已发布赛程/);
  assert.doesNotMatch(quick.innerHTML + rankings.innerHTML, /data-show-season/);
});

test('published matches beyond seven days link to the current schedule', () => {
  const chess = load([historical, scheduled]), quick = container(), rankings = container();
  const matches = [historical, scheduled].map(chess.normalizeMatch);
  chess.renderQuickInfo(quick, matches, now);
  chess.renderLeaderboard(rankings, matches, now, 2);
  assert.match(quick.innerHTML, /未来 7 天暂无比赛/);
  assert.match(quick.innerHTML, /data-show-season="2"/);
  assert.match(rankings.innerHTML, /暂无已录入赛果/);
  assert.doesNotMatch(rankings.innerHTML, /尚无已发布赛程|Past player/);
});

test('recording current season results replaces the empty ranking message', () => {
  const chess = load([historical, scheduled]), rankings = container();
  const current = { ...scheduled, winners: [{ rank: 1, name: 'Current player' }] };
  const matches = [historical, current].map(chess.normalizeMatch);
  chess.renderLeaderboard(rankings, matches, new Date(2026, 11, 2), 2);
  assert.match(rankings.innerHTML, /Current player/);
  assert.doesNotMatch(rankings.innerHTML, /Past player|尚无已发布赛程|暂无已录入赛果/);
});

test('history navigation selects the season, opens the schedule and moves focus', () => {
  const chess = load([historical]);
  const actions = [];
  let onClick;
  chess.initScheduleLinks({
    addEventListener(type, callback) { assert.equal(type, 'click'); onClick = callback; },
    querySelector(selector) {
      if (selector === '[data-season="1"]') return { click: () => actions.push('season') };
      if (selector === '#tab-schedule') return { click: () => actions.push('tab'), focus: () => actions.push('focus') };
      assert.fail(`Unexpected selector: ${selector}`);
    },
  });
  onClick({ target: { closest: () => null } });
  assert.deepEqual(actions, []);
  onClick({ target: { closest: () => ({ getAttribute: () => '1' }) } });
  assert.deepEqual(actions, ['season', 'tab', 'focus']);
});

test('initialization and history selection keep schedule and rankings on the same season', () => {
  const node = (attrs = {}) => {
    const listeners = {};
    return {
      ...container(), listeners,
      getAttribute: (name) => attrs[name] ?? null,
      setAttribute(name, value) { attrs[name] = value; },
      classList: { toggle() {} },
      addEventListener(type, listener) { listeners[type] = listener; },
      click() { listeners.click?.(); }, focus() {},
    };
  };
  const timeline = node(), rankings = node(), filter = node();
  const seasons = [node({ 'data-season': '2' }), node({ 'data-season': '1' })];
  filter.querySelectorAll = () => seasons;
  const names = ['overview', 'schedule', 'rankings', 'rules'];
  const tabs = names.map((name) => node({ 'data-tab': name }));
  const panels = names.map((name) => ({ ...node(), id: `panel-${name}` }));
  const root = node();
  root.querySelectorAll = (selector) => selector === '.chess-tab' ? tabs : panels;
  root.querySelector = (selector) => ({
    '[data-timeline]': timeline, '[data-leaderboard]': rankings, '[data-season-filter]': filter,
    '[data-season="1"]': seasons[1], '#tab-schedule': tabs[1],
  })[selector] || null;
  const window = { CHESS_DATA: {
    config: { current_season: 2, season_label: 'S2' },
    seasons: [{ id: 1, label: 'S1 · 2025-2026' }, { id: 2, label: 'S2 · 当前赛季' }],
    series: [{ id: 'ec', full_name: 'E.C. {season}' }], matches: [historical],
  } };
  const document = {
    readyState: 'loading', addEventListener() {}, querySelector: () => null,
    getElementById: (id) => id === 'chess-app' ? root : null,
  };
  vm.runInNewContext(source, {
    window, document, setInterval() {},
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [2026, 9, 20])); } },
  });
  window.testChess.init();
  assert.match(filter.innerHTML, /data-season="2" aria-pressed="true"/);
  assert.match(timeline.innerHTML, /赛程尚未发布/);
  assert.match(rankings.innerHTML, /S2.*尚无已发布赛程/);

  root.listeners.click({ target: { closest: () => ({ getAttribute: () => '1' }) } });
  tabs[2].click();
  assert.match(timeline.innerHTML, /2025年11月25日/);
  assert.match(rankings.innerHTML, /S1 · 2025-2026/);
  assert.match(rankings.innerHTML, /Past player/);
  assert.doesNotMatch(rankings.innerHTML, /S2 · 当前赛季/);

  seasons[0].click();
  assert.match(rankings.innerHTML, /S2.*尚无已发布赛程/);
  assert.doesNotMatch(rankings.innerHTML, /Past player/);
});
