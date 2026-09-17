// Run with Node 18+ and the Ruby used by Jekyll:
//   node --test tests/werewolf.test.cjs
// Set RUBY to an alternative Ruby executable when it is not on PATH.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const parsed = spawnSync(process.env.RUBY || 'ruby', [
  '-rjson', '-ryaml', '-e', 'puts JSON.generate(YAML.load_file(ARGV.fetch(0)))',
  path.join(root, '_data/werewolf.yml'),
], { encoding: 'utf8' });
assert.equal(parsed.status, 0, `Cannot read game data with Ruby: ${parsed.error || parsed.stderr}`);
const data = JSON.parse(parsed.stdout);

// Expose the existing closure only inside the test VM; the browser script keeps
// its private state and does not need a production-only testing interface.
const script = readFileSync(path.join(root, 'assets/js/werewolf.js'), 'utf8');
assert.match(script, /\}\)\(\);\s*$/);
const source = script.replace(/\}\)\(\);\s*$/, `
  window.testGame = { state, checkWin, newGame, endNight, handleAction, exile, renderGame };
})();`);

function setup(roles) {
  const view = {
    innerHTML: '',
    querySelector(selector) {
      return selector === '.wf-overlay' && this.innerHTML.includes('class="wf-overlay"') ? {} : null;
    },
    addEventListener() {},
    insertAdjacentHTML(position, html) { this.innerHTML += html; },
  };
  const context = {
    window: { WEREWOLF_DATA: structuredClone(data) },
    document: { readyState: 'complete', getElementById: (id) => id === 'wolf-view' ? view : null },
    setInterval: () => 1,
    clearInterval() {},
  };
  vm.runInNewContext(source, context, { filename: 'werewolf.js' });
  const api = context.window.testGame;
  if (roles) {
    api.state.players = roles.map((role, idx) => ({
      idx, name: `玩家${idx + 1}`, role, camp: data.roles[role].camp, alive: true,
    }));
    api.state.step = 'game';
    api.state.game = api.newGame();
  }
  return {
    ...api,
    view,
    act(action, attrs = {}) {
      if (typeof attrs === 'number') attrs = { idx: attrs };
      const values = { 'data-action': action };
      for (const [name, value] of Object.entries(attrs)) values[`data-${name}`] = String(value);
      api.handleAction(action, {
        disabled: false,
        getAttribute: (name) => values[name] ?? null,
        hasAttribute: (name) => name in values,
      });
    },
  };
}

const standardRoles = ['狼人', '狼人', '女巫', '预言家', '猎人', '平民', '平民', '平民'];
const kingRoles = ['白狼王', ...standardRoles.slice(1)];

function witchTurn(rule = 'allow_double') {
  const game = setup(standardRoles);
  game.state.ruleSettings.witch_double_use = rule;
  game.state.game.night.idx = game.state.game.night.order.indexOf('女巫');
  game.state.game.night.wolfTarget = 5;
  return game;
}

function actor(game) {
  const night = game.state.game.night;
  return night.order[night.idx];
}

function assertNoWinner(game) {
  assert.equal(game.state.game.winner, null);
  assert.doesNotMatch(game.view.innerHTML, /class="wf-overlay"/);
}

test('every recommended configuration and advanced board can start without declaring a winner', () => {
  for (const [count, options] of Object.entries(data.recommend)) {
    options.forEach((option, idx) => {
      const game = setup();
      game.act('count', { count });
      game.act('option', idx);
      game.act('deal');
      game.act('start');
      assert.equal(game.state.players.length, Number(count), `${count} / ${option.name}`);
      assert.equal(game.checkWin(), null, `${count} / ${option.name}`);
      assertNoWinner(game);
    });
  }
  for (const board of data.boards) {
    const game = setup();
    game.act('count', { count: board.players });
    game.act('board', { board: board.id });
    game.act('deal');
    game.act('start');
    assert.equal(game.state.players.length, board.players, board.id);
    assert.equal(game.checkWin(), null, board.id);
    assertNoWinner(game);
  }
});

test('victory follows elimination of all wolves, all gods, or all villagers, not parity', () => {
  assert.equal(setup(['狼人', '狼人', '女巫', '平民']).checkWin(), null);
  assert.equal(setup(['狼人', '平民', '平民', '平民']).checkWin(), 'wolf');
  assert.equal(setup(['狼人', '女巫', '预言家', '猎人']).checkWin(), 'wolf');
  assert.equal(setup(['女巫', '平民']).checkWin(), 'good');
});

for (const mode of ['active', 'exiled']) {
  test(`white wolf king ${mode} explosion eliminates both players once`, () => {
    const game = setup(kingRoles);
    game.state.game.phase = 'day';
    if (mode === 'active') game.act('wolf-explode');
    else {
      game.act('day-exile', 0);
      game.act('langwang_exile_explode');
    }
    game.act(mode === 'active' ? 'explode-target' : 'langwang_exile_target', 5);
    assert.equal(game.state.players[0].alive, false);
    assert.equal(game.state.players[5].alive, false);
    assert.equal(game.state.game.pending, null);
    assert.equal(game.state.game.phase, 'night');
    assert.equal(game.state.game.round, 2);
    const settled = JSON.stringify(game.state);
    game.act(mode === 'active' ? 'explode-target' : 'langwang_exile_target', 6);
    assert.equal(JSON.stringify(game.state), settled, 'replayed target selection must have no effect');
  });
}

for (const order of ['heal-first', 'poison-first']) {
  test(`allow_double permits both potions in ${order} order`, () => {
    const game = witchTurn();
    const heal = () => game.act('witch', { opt: 'save' });
    const poison = () => {
      game.act('witch', { opt: 'poison' });
      game.act('witch-poison', 0);
    };
    const first = order === 'heal-first' ? heal : poison;
    const second = order === 'heal-first' ? poison : heal;
    first();
    assert.equal(actor(game), '女巫');
    assert.equal(game.state.game.night.witchPhase, 'choose');
    second();
    assert.equal(actor(game), '预言家');
    assert.equal(game.state.game.witchGlobal.healUsed, true);
    assert.equal(game.state.game.witchGlobal.poisonUsed, true);
    game.endNight();
    assert.equal(game.state.players[5].alive, true, 'wolf target was healed');
    assert.equal(game.state.players[0].alive, false, 'poison target died');
  });

  test(`no_double ends the witch turn after ${order === 'heal-first' ? 'healing' : 'poisoning'}`, () => {
    const game = witchTurn('no_double');
    if (order === 'heal-first') game.act('witch', { opt: 'save' });
    else {
      game.act('witch', { opt: 'poison' });
      game.act('witch-poison', 0);
    }
    assert.equal(actor(game), '预言家');
    const settled = JSON.stringify(game.state);
    game.act('witch', { opt: order === 'heal-first' ? 'poison' : 'save' });
    game.act('witch-poison', 1);
    assert.equal(JSON.stringify(game.state), settled, 'witch actions cannot run in the seer turn');
  });
}

test('allow_double can finish after using one potion, and used potions cannot be reused', () => {
  const game = witchTurn();
  game.act('witch', { opt: 'save' });
  const healed = JSON.stringify(game.state);
  game.act('witch', { opt: 'save' });
  assert.equal(JSON.stringify(game.state), healed, 'healing cannot be repeated');
  game.act('witch', { opt: 'none' });
  assert.equal(actor(game), '预言家');
  game.act('night-seer', 0);
  game.act('night-next');
  game.act('day-skip');
  game.act('night-target', 6);
  assert.equal(actor(game), '女巫');
  const nextNight = JSON.stringify(game.state);
  game.act('witch', { opt: 'save' });
  assert.equal(JSON.stringify(game.state), nextNight, 'healing stays spent on later nights');
  game.act('witch', { opt: 'poison' });
  game.act('witch-poison', 0);
  assert.equal(game.state.game.witchGlobal.poisonUsed, true);
  const poisoned = JSON.stringify(game.state);
  game.act('witch-poison', 1);
  assert.equal(JSON.stringify(game.state), poisoned, 'poison cannot be repeated');
});

test('witch self-save rules agree in the controls and action handler during a double-potion turn', () => {
  const scenarios = [
    ['no_self_save', 1, false],
    ['no_self_save', 2, false],
    ['first_night_only', 1, true],
    ['first_night_only', 2, false],
    ['always_self_save', 1, true],
    ['always_self_save', 2, true],
  ];
  for (const [rule, round, allowed] of scenarios) {
    const game = witchTurn();
    game.state.ruleSettings.witch_self_save = rule;
    game.state.game.round = round;
    game.state.game.night.wolfTarget = 2;
    game.renderGame();
    const saveButton = game.view.innerHTML.match(/<button\b[^>]*data-action="witch"[^>]*data-opt="save"[^>]*>/);
    assert.ok(saveButton, `${rule}, round ${round}: save control exists`);
    assert.equal(/\bdisabled\b/.test(saveButton[0]), !allowed, `${rule}, round ${round}: disabled state`);
    game.act('witch', { opt: 'save' });
    assert.equal(game.state.game.witchGlobal.healUsed, allowed, `${rule}, round ${round}: action result`);
    assert.equal(actor(game), '女巫', 'the remaining poison action is still available');
    game.act('witch', { opt: 'poison' });
    game.act('witch-poison', 0);
    if (actor(game) === '女巫') game.act('witch', { opt: 'none' });
    assert.equal(actor(game), '预言家');
    game.endNight();
    assert.equal(game.state.players[2].alive, allowed, `${rule}, round ${round}: survival result`);
    assert.equal(game.state.players[0].alive, false, 'the poison action still resolves');
  }
});

for (const death of ['wolf', 'poison-can-shoot', 'poison-no-shoot']) {
  test(`night hunter death resolves ${death} according to the selected rule`, () => {
    const game = setup(standardRoles);
    if (death === 'wolf') game.state.game.night.wolfTarget = 4;
    else {
      game.state.ruleSettings.hunter_poisoned = death === 'poison-can-shoot' ? 'can_shoot' : 'no_shoot';
      game.state.game.night.witch.poisonTarget = 4;
      game.state.game.witchGlobal.poisonUsed = true;
    }
    game.endNight();
    assert.equal(game.state.players[4].alive, false);
    if (death === 'poison-no-shoot') {
      assert.equal(game.state.game.pending, null);
      assert.doesNotMatch(game.view.innerHTML, /data-action="hunter-shot"/);
    } else {
      assert.equal(game.state.game.pending, 'hunter');
      assert.match(game.view.innerHTML, /data-action="hunter-shot"/);
      game.act('hunter-shot', 0);
      assert.equal(game.state.players[0].alive, false);
      assert.equal(game.state.game.pending, null);
    }
    assert.equal(game.state.game.phase, 'day');
    assert.equal(game.state.game.round, 1);
    assert.match(game.view.innerHTML, /data-action="day-exile"/);
  });
}

test('an exiled hunter finishes the skill before the next night starts', () => {
  const game = setup(standardRoles);
  game.state.game.phase = 'day';
  game.act('day-exile', 4);
  assert.equal(game.state.game.pending, 'hunter');
  game.act('hunter-shot', 0);
  assert.equal(game.state.players[0].alive, false);
  assert.equal(game.state.game.pending, null);
  assert.equal(game.state.game.phase, 'night');
  assert.equal(game.state.game.round, 2);
});

for (const pending of ['hunter', 'idiot', 'langwang', 'langwang_exile']) {
  test(`${pending} pending actions hide ordinary day controls and reject forged transitions`, () => {
    const roles = pending === 'idiot' ? [...standardRoles.slice(0, 4), '白痴', ...standardRoles.slice(5)] : kingRoles;
    const game = setup(roles);
    game.state.game.phase = 'day';
    if (pending === 'langwang') game.act('wolf-explode');
    else game.act('day-exile', pending === 'langwang_exile' ? 0 : 4);
    assert.equal(game.state.game.pending, pending);
    assert.doesNotMatch(game.view.innerHTML, /data-action="day-(skip|exile)"/);
    const before = JSON.stringify(game.state);
    for (const action of ['day-skip', 'day-exile', 'night-target', 'night-next', 'night-seer', 'witch-poison', 'wolf-explode']) {
      game.act(action, 6);
      assert.equal(JSON.stringify(game.state), before, action);
    }
  });
}

test('ordinary day actions are rejected at night, and invalid targets never become player zero', () => {
  const game = setup(standardRoles);
  const before = JSON.stringify(game.state);
  game.act('day-exile', 0);
  game.act('day-skip');
  game.act('night-target');
  game.act('night-target', { idx: 'invalid' });
  game.act('night-target', 99);
  assert.equal(JSON.stringify(game.state), before);
});

test('the last god hunter can resolve a shot before victory is decided', () => {
  const game = setup(['狼人', '猎人', '平民', '平民']);
  game.state.game.night.wolfTarget = 1;
  game.endNight();
  assert.equal(game.state.game.pending, 'hunter');
  assertNoWinner(game);
  game.act('hunter-shot', 0);
  assert.equal(game.state.game.pending, null);
  assert.equal(game.state.game.winner, 'good');
  assert.match(game.view.innerHTML, /好人阵营胜利/);
  const finished = JSON.stringify(game.state);
  game.act('day-exile', 2);
  game.act('day-skip');
  assert.equal(JSON.stringify(game.state), finished, 'gameplay stops after victory');
});

test('the last exiled white wolf king resolves the optional explosion before victory', () => {
  const game = setup(['白狼王', '女巫', '平民', '平民']);
  game.state.game.phase = 'day';
  game.act('day-exile', 0);
  assert.equal(game.state.players[0].alive, false);
  assert.equal(game.state.game.pending, 'langwang_exile');
  assertNoWinner(game);
  game.act('langwang_exile_explode');
  game.act('langwang_exile_target', 2);
  assert.equal(game.state.players[2].alive, false);
  assert.equal(game.state.game.pending, null);
  assert.equal(game.state.game.winner, 'good');
});

test('a hunter can decline the shot and resume the interrupted phase', () => {
  for (const death of ['night', 'exile']) {
    const game = setup(standardRoles);
    if (death === 'night') {
      game.state.game.night.wolfTarget = 4;
      game.endNight();
    } else {
      game.state.game.phase = 'day';
      game.act('day-exile', 4);
    }
    game.act('hunter-pass');
    assert.equal(game.state.game.pending, null);
    assert.equal(game.state.game.phase, death === 'night' ? 'day' : 'night');
    assert.equal(game.state.game.round, death === 'night' ? 1 : 2);
  }
});

test('simultaneous last-wolf poisoning and hunter death finish the hunter action before victory', () => {
  const game = setup(['狼人', '女巫', '猎人', '平民', '平民']);
  game.state.game.night.wolfTarget = 2;
  game.state.game.night.witch.poisonTarget = 0;
  game.state.game.witchGlobal.poisonUsed = true;
  game.endNight();
  assert.equal(game.state.players[0].alive, false);
  assert.equal(game.state.players[2].alive, false);
  assert.equal(game.state.game.pending, 'hunter');
  assertNoWinner(game);
  game.act('hunter-shot', 3);
  assert.equal(game.state.players[3].alive, false);
  assert.equal(game.state.game.pending, null);
  assert.equal(game.state.game.winner, 'good');
  assert.match(game.view.innerHTML, /好人阵营胜利/);
});

for (const rule of ['no_shoot', 'can_shoot']) {
  test(`a hunter hit by both wolves and poison dies once and follows ${rule}`, () => {
    const game = setup(standardRoles);
    game.state.ruleSettings.hunter_poisoned = rule;
    game.state.game.night.wolfTarget = 4;
    game.state.game.night.witch.poisonTarget = 4;
    game.state.game.witchGlobal.poisonUsed = true;
    game.endNight();
    assert.equal(game.state.players[4].alive, false);
    assert.equal(game.state.game.deaths.length, 1);
    assert.equal(game.state.game.deaths[0], 4);
    assert.equal(game.state.game.pendingQueue.length, 0, 'there is no duplicate hunter action queued');
    if (rule === 'can_shoot') {
      assert.equal(game.state.game.pending, 'hunter');
      game.act('hunter-shot', 0);
      assert.equal(game.state.players[0].alive, false);
    } else {
      assert.doesNotMatch(game.view.innerHTML, /data-action="hunter-shot"/);
    }
    assert.equal(game.state.game.pending, null);
    assert.equal(game.state.game.phase, 'day');
    assert.equal(game.state.game.round, 1);
    const settled = JSON.stringify(game.state);
    game.act('hunter-shot', 1);
    assert.equal(JSON.stringify(game.state), settled, 'there is no extra shot after settlement');
  });
}

for (const mode of ['active', 'exiled']) {
  test(`a hunter taken by the white wolf king's ${mode} explosion cannot shoot`, () => {
    const game = setup(kingRoles);
    game.state.game.phase = 'day';
    if (mode === 'active') game.act('wolf-explode');
    else {
      game.act('day-exile', 0);
      game.act('langwang_exile_explode');
    }
    game.act(mode === 'active' ? 'explode-target' : 'langwang_exile_target', 4);
    assert.equal(game.state.players[0].alive, false);
    assert.equal(game.state.players[4].alive, false);
    assert.equal(game.state.game.pending, null);
    assert.equal(game.state.game.pendingQueue.length, 0);
    assert.doesNotMatch(game.view.innerHTML, /data-action="hunter-shot"/);
    assert.equal(game.state.game.phase, 'night');
    assert.equal(game.state.game.round, 2);
    const settled = JSON.stringify(game.state);
    game.act('hunter-shot', 1);
    assert.equal(JSON.stringify(game.state), settled);
  });
}

for (const rule of ['exile_explode', 'exile_no_explode']) {
  test(`an exiled white wolf king leaves alone when explosion is declined or disallowed: ${rule}`, () => {
    const game = setup(kingRoles);
    game.state.ruleSettings.langwang_exile = rule;
    game.state.game.phase = 'day';
    game.act('day-exile', 0);
    if (rule === 'exile_explode') {
      assert.equal(game.state.game.pending, 'langwang_exile');
      game.act('langwang_exile_pass');
    }
    assert.equal(game.state.players[0].alive, false);
    assert.ok(game.state.players.slice(1).every((player) => player.alive));
    assert.equal(game.state.game.pending, null);
    assert.equal(game.state.game.phase, 'night');
    assert.equal(game.state.game.round, 2);
    assertNoWinner(game);
  });
}
