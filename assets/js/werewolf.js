/* ============================================
   狼人杀中控台 — 核心逻辑
   配合 assets/css/werewolf.css 与 _layouts/werewolf.html
   数据来源：window.WEREWOLF_DATA（由 Jekyll 从 _data/werewolf.yml 注入）
   ============================================ */
(function () {
  'use strict';

  const DATA = window.WEREWOLF_DATA || {};
  const CONFIG = DATA.config || {};
  const RECOMMEND = DATA.recommend || {};
  const ROLES = DATA.roles || {};
  const NIGHT_ORDERS = DATA.night_orders || {};
  const BOARDS = DATA.boards || [];
  const RULE_VARIANTS = DATA.rule_variants || [];

  // 从规则变体中提取默认选项
  function getDefaultRuleSettings() {
    const settings = {};
    RULE_VARIANTS.forEach((rv) => {
      const def = rv.options.find((o) => o.default) || rv.options[0];
      settings[rv.id] = def ? def.id : null;
    });
    return settings;
  }

  const view = document.getElementById('wolf-view');
  if (!view) return;

  /* ---------- 工具 ---------- */
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function campOf(role) {
    return (ROLES[role] && ROLES[role].camp) || '民';
  }
  function nightOf(role) {
    return !!(ROLES[role] && ROLES[role].night);
  }
  function roleText(role) {
    return (ROLES[role] && ROLES[role].text) || '';
  }
  function campBadge(camp) {
    const cls = camp === '狼' ? 'wolf' : camp === '神' ? 'god' : 'villager';
    const label = camp === '狼' ? '狼人阵营' : camp === '神' ? '神职' : '平民';
    return `<span class="wf-badge ${cls}">${label}</span>`;
  }
  function roleAbbr(role) {
    const map = { '狼人': '狼', '白狼王': '王', '预言家': '预', '女巫': '女', '猎人': '猎', '守卫': '守', '白痴': '白', '平民': '民', '丘比特': '丘' };
    return map[role] || role.charAt(0);
  }
  function roleOf(idx) { return state.players[idx]; }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- 全局状态 ---------- */
  const state = {
    step: 'setup',        // setup | deal | game
    count: 12,
    board: null,          // { id, name, wolf, gods, villager, nightOrder }
    options: [],          // 当前人数的可选配置方案（平衡方向）
    optionIdx: 0,
    roles: [],            // 角色池
    players: [],          // [{ idx, name, role, camp, alive }]
    dealIdx: 0,
    game: null,
    ruleSettings: getDefaultRuleSettings(),  // 规则变体选项
  };

  /* ---------- 配置 / 板子 ---------- */
  function buildRoles(rec) {
    const roles = [];
    // 狼方构成：优先用 wolves 列表（如白狼王板），否则按 wolf 数量生成普通狼人
    const wolves = rec.wolves || Array.from({ length: rec.wolf || 0 }, () => '狼人');
    wolves.forEach((w) => roles.push(w));
    (rec.gods || []).forEach((g) => roles.push(g));
    for (let i = 0; i < (rec.villager || 0); i++) roles.push('平民');
    return roles;
  }

  // 获取某个规则变体的当前选项 ID
  function ruleOption(variantId) {
    return state.ruleSettings[variantId] || null;
  }

  function nightOrderFor(gods) {
    const key = gods.includes('守卫') ? 'with_guard' : 'standard';
    return NIGHT_ORDERS[key] || ['狼人', '女巫', '预言家'];
  }

  function buildBoard(count) {
    state.options = RECOMMEND[count] || [];
    if (!state.options.length) return null;
    applyOption(0);
    return state.board;
  }

  // 应用当前人数的某个配置方案（平衡方向：标准 / 新手友好 / 狼人强势）
  function applyOption(i) {
    const opt = state.options[i];
    if (!opt) return;
    state.optionIdx = i;
    state.board = {
      id: 'auto',
      name: `${state.count}人 · ${opt.name || '自动推荐'}`,
      wolf: opt.wolf,
      wolves: opt.wolves,
      gods: opt.gods || [],
      villager: opt.villager,
      nightOrder: nightOrderFor(opt.gods || []),
    };
    state.roles = buildRoles(state.board);
  }

  function applyBoard(board) {
    state.board = board;
    state.roles = buildRoles(board);
  }

  /* ---------- 发牌 ---------- */
  function deal() {
    const roles = shuffle([...state.roles]);
    state.players = roles.map((role, idx) => ({
      idx,
      name: '玩家' + (idx + 1),
      role,
      camp: campOf(role),
      alive: true,
    }));
    state.dealIdx = 0;
  }

  /* ---------- 游戏状态机 ---------- */
  function newGame() {
    return {
      round: 1,
      phase: 'night',
      night: {
        order: [...state.board.nightOrder],
        idx: 0,
        wolfTarget: null,
        guardTarget: null,
        witchPhase: 'choose',
        witch: { saveTarget: null, poisonTarget: null, saveUsed: false },
        seer: { target: null, result: null },
        seerConfirmed: false,
      },
      witchGlobal: { healUsed: false, poisonUsed: false },  // 整局药水状态（只有一救一毒）
      lastGuardTarget: null,  // 上轮守卫守护目标（不可连续守同一人）
      deaths: [],
      pending: null,
      pendingIdx: null,
      lastExiled: null,
      log: [],
    };
  }

  function addLog(msg) {
    const g = state.game;
    if (g) g.log.push({ t: msg, stage: g.phase });
  }

  function checkWin() {
    const alive = state.players.filter((p) => p.alive);
    const wolves = alive.filter((p) => p.camp === '狼');
    const good = alive.filter((p) => p.camp !== '狼');
    if (wolves.length === 0) return 'good';
    if (good.length <= wolves.length) return 'wolf';
    return null;
  }

  function enterNight() {
    const g = state.game;
    g.phase = 'night';
    const n = g.night;
    // 保存上轮守卫目标（不可连续守同一人）
    if (n.guardTarget !== null) {
      g.lastGuardTarget = n.guardTarget;
    }
    n.idx = 0;
    n.wolfTarget = null;
    n.guardTarget = null;
    n.witchPhase = 'choose';
    n.witch = { saveTarget: null, poisonTarget: null, saveUsed: false };
    n.seer = { target: null, result: null };
    n.seerConfirmed = false;
    g.deaths = [];
    // 跳过已死角色的夜间阶段
    while (n.idx < n.order.length) {
      const actor = n.order[n.idx];
      const hasAlive = actor === '狼人'
        ? state.players.some((p) => p.alive && p.camp === '狼')
        : state.players.some((p) => p.alive && p.role === actor);
      if (hasAlive) break;
      n.idx++;
    }
    if (n.idx >= n.order.length) { endNight(); return; }
    renderGame();
    startTimer(60);
  }

  function nextNight() {
    const g = state.game;
    g.night.idx++;
    g.night.witchPhase = 'choose';
    // 跳过已死角色的夜间阶段（如守卫/女巫/预言家已死）
    while (g.night.idx < g.night.order.length) {
      const actor = g.night.order[g.night.idx];
      const hasAlive = actor === '狼人'
        ? state.players.some((p) => p.alive && p.camp === '狼')
        : state.players.some((p) => p.alive && p.role === actor);
      if (hasAlive) break;
      g.night.idx++;
    }
    if (g.night.idx >= g.night.order.length) {
      endNight();
      return;
    }
    renderGame();
    startTimer(60);
  }

  function endNight() {
    const g = state.game;
    const n = g.night;
    const deaths = [];
    if (n.wolfTarget !== null) {
      const saved = n.witch.saveUsed && n.witch.saveTarget === n.wolfTarget;
      const guarded = n.guardTarget === n.wolfTarget;
      const guardWitchConflict = ruleOption('guard_witch_conflict') === 'conflict_death';
      if (saved && guarded && guardWitchConflict) {
        // 守救同体：守卫和女巫同时救同一人 → 该玩家死亡，解药消耗
        deaths.push(n.wolfTarget);
        addLog('💀 守救同体！守卫与女巫同时作用于同一人，该玩家死亡');
      } else if (!saved && !guarded) {
        deaths.push(n.wolfTarget);
      }
      // 其他情况：saved XOR guarded → 玩家存活（被救或被守）
    }
    if (g.witchGlobal.poisonUsed && n.witch.poisonTarget !== null) deaths.push(n.witch.poisonTarget);
    // LOGIC-1: 猎人被毒杀提示
    if (g.witchGlobal.poisonUsed && n.witch.poisonTarget !== null) {
      const poisoned = state.players[n.witch.poisonTarget];
      if (poisoned && poisoned.role === '猎人') {
        const canShoot = ruleOption('hunter_poisoned') === 'can_shoot';
        addLog(canShoot ? '🔫 猎人被毒杀，但仍可开枪' : '🔫 猎人被毒杀，不能开枪');
      }
    }
    const uniq = Array.from(new Set(deaths));
    uniq.forEach((i) => { state.players[i].alive = false; });
    g.deaths = uniq;
    g.phase = 'day';
    if (uniq.length) {
      addLog(`天亮了，昨夜倒下：${uniq.map((i) => state.players[i].name).join('、')}`);
    } else {
      addLog('天亮了，昨夜平安夜');
    }
    renderGame();
    startTimer(120);
  }

  function exile(idx) {
    const g = state.game;
    const p = state.players[idx];
    addLog(`白天放逐了 ${p.name}（${p.role}）`);
    g.lastExiled = idx;
    if (p.role === '猎人') {
      p.alive = false;
      g.pending = 'hunter';
      renderGame();
      return;
    }
    if (p.role === '白痴') {
      g.pending = 'idiot';
      g.pendingIdx = idx;
      renderGame();
      return;
    }
    // LOGIC-4: 白狼王被放逐时可选择自爆带人
    if (p.role === '白狼王' && ruleOption('langwang_exile') === 'exile_explode') {
      g.pending = 'langwang_exile';
      g.pendingIdx = idx;
      renderGame();
      return;
    }
    p.alive = false;
    afterExile();
  }

  function resolvePending(choice, idx2) {
    const g = state.game;
    if (g.pending === 'hunter') {
      const t = state.players[idx2];
      if (t.alive) { t.alive = false; addLog(`猎人开枪带走了 ${t.name}`); }
      g.pending = null;
    } else if (g.pending === 'idiot') {
      const p = state.players[g.pendingIdx];
      if (choice === 'spare') { p.alive = true; addLog(`${p.name}（白痴）翻牌免死，留在场但不能投票`); }
      else { p.alive = false; addLog(`${p.name}（白痴）未翻牌，出局`); }
      g.pending = null;
    }
    afterExile();
  }

  function afterExile() {
    const win = checkWin();
    if (win) { showWinner(win); return; }
    state.game.round++;
    enterNight();
  }

  /* ---------- 渲染 ---------- */
  function render() {
    if (state.step === 'setup') renderSetup();
    else if (state.step === 'deal') renderDeal();
    else renderGame();
  }

  /* --- 配置视图 --- */
  function renderSetup() {
    // 保存规则变体卡片的展开状态（避免点击选项后自动收起）
    const prevDetails = view.querySelector('.wf-collapsible');
    const wasOpen = prevDetails ? prevDetails.open : false;

    const counts = Object.keys(RECOMMEND).map(Number).sort((a, b) => a - b);
    const parts = [];
    parts.push(`<div class="wf-steps">`);
    parts.push(`<div class="wf-step active"><span class="num">1</span> 配置</div>`);
    parts.push(`<div class="wf-step"><span class="num">2</span> 发牌</div>`);
    parts.push(`<div class="wf-step"><span class="num">3</span> 对局</div>`);
    parts.push(`</div>`);

    parts.push(`<div class="wf-panel">`);
    parts.push(`<h2 class="wf-panel-title">🎯 选择本局人数</h2>`);
    parts.push(`<div class="wf-num-grid">`);
    counts.forEach((c) => {
      parts.push(`<button class="wf-num-pill ${c === state.count ? 'active' : ''}" data-action="count" data-count="${c}">${c} 人</button>`);
    });
    parts.push(`</div>`);
    parts.push(`</div>`);

    // 推荐板子卡
    parts.push(`<div class="wf-panel">`);
    parts.push(`<h2 class="wf-panel-title">🗂 本轮配置</h2>`);
    const roles = state.roles;
    const byCamp = { 狼: 0, 神: 0, 民: 0 };
    roles.forEach((r) => { byCamp[campOf(r)]++; });
    parts.push(`<div class="wf-board-card">`);
    parts.push(`<div><div class="wf-board-name">${escapeHtml(state.board.name)}</div><div class="wf-board-meta">第 1 步 · 自动推荐 · 可手动切换</div></div>`);
    parts.push(`<div class="wf-board-count">`);
    parts.push(`<span class="wf-count-chip">🐺 狼 ${byCamp['狼']}</span>`);
    parts.push(`<span class="wf-count-chip">🛡 神 ${byCamp['神']}</span>`);
    parts.push(`<span class="wf-count-chip">👤 民 ${byCamp['民']}</span>`);
    parts.push(`</div></div>`);

    // 配置方案（平衡方向可选：标准 / 新手友好 / 狼人强势）
    if (state.options.length > 1 && state.board.id === 'auto') {
      parts.push(`<div class="wf-panel-title" style="font-size:0.95rem;color:var(--text-muted);">配置方案 · 可切换</div>`);
      parts.push(`<div class="wf-role-row">`);
      state.options.forEach((opt, i) => {
        const active = state.board.id === 'auto' && i === state.optionIdx;
        parts.push(`<button class="wf-role-chip ${active ? 'wf-num-pill active' : ''}" data-action="option" data-idx="${i}" style="cursor:pointer;">${escapeHtml(opt.name || ('方案' + (i + 1)))}</button>`);
      });
      parts.push(`</div><div class="wf-divider"></div>`);
    }

    // 进阶板子切换
    const validBoards = BOARDS.filter((b) => b.players === state.count);
    if (validBoards.length) {
      parts.push(`<div class="wf-panel-title" style="font-size:0.95rem;color:var(--text-muted);">进阶板子</div>`);
      parts.push(`<div class="wf-role-row">`);
      validBoards.forEach((b) => {
        const active = state.board.id === b.id;
        parts.push(`<button class="wf-role-chip ${active ? 'wf-num-pill active' : ''}" data-action="board" data-board="${b.id}" style="cursor:pointer;">${escapeHtml(b.name)}</button>`);
      });
      parts.push(`</div><div class="wf-divider"></div>`);
    }

    // 规则变体选项（可伸缩卡片，默认收起）
    if (RULE_VARIANTS.length) {
      parts.push(`<details class="wf-collapsible">`);
      parts.push(`<summary>⚙️ 规则变体 <span style="font-weight:400;font-size:0.82rem;">点击展开修改</span></summary>`);
      RULE_VARIANTS.forEach((rv) => {
        const current = state.ruleSettings[rv.id];
        parts.push(`<div style="margin-bottom:0.8rem;">`);
        parts.push(`<div style="font-weight:700;font-size:0.92rem;color:var(--text-soft);margin-bottom:0.35rem;">${escapeHtml(rv.name)} <span style="font-weight:400;color:var(--text-muted);font-size:0.82rem;">— ${escapeHtml(rv.description)}</span></div>`);
        parts.push(`<div class="wf-role-row">`);
        rv.options.forEach((opt) => {
          const active = current === opt.id;
          parts.push(`<button class="wf-num-pill ${active ? 'active' : ''}" data-action="rule" data-variant="${rv.id}" data-option="${opt.id}" style="font-size:0.82rem;padding:0.35rem 0.8rem;">${escapeHtml(opt.name)}</button>`);
        });
        parts.push(`</div></div>`);
      });
      parts.push(`</details>`);
      parts.push(`<div class="wf-divider"></div>`);
    }

    // 规则宣读面板（主持人给玩家朗读）
    parts.push(`<div class="wf-panel" style="background:var(--surface);border:1px dashed var(--line-strong);margin-top:0.6rem;">`);
    parts.push(`<h2 class="wf-panel-title" style="font-size:1rem;">📢 本局规则（主持人宣读）</h2>`);
    parts.push(`<div style="color:var(--text-soft);font-size:0.88rem;line-height:1.7;">`);
    parts.push(`<div style="margin-bottom:0.5rem;"><b>本局人数：</b>${state.count} 人 · ${escapeHtml(state.board.name)}</div>`);
    const byCampR = { 狼: [], 神: [], 民: [] };
    roles.forEach((r) => { byCampR[campOf(r)].push(r); });
    parts.push(`<div style="margin-bottom:0.5rem;"><b>阵营构成：</b>狼人 ${byCampR['狼'].length} 名（${byCampR['狼'].map(escapeHtml).join('、')}）· 神职 ${byCampR['神'].length} 名（${byCampR['神'].map(escapeHtml).join('、')}）· 平民 ${byCampR['民'].length} 名</div>`);
    parts.push(`<div style="margin-bottom:0.5rem;"><b>夜间顺序：</b>${(state.board.nightOrder || []).map(escapeHtml).join(' → ')}</div>`);
    parts.push(`<div style="margin-bottom:0.5rem;"><b>胜负条件：</b>好人阵营放逐全部狼人获胜 · 狼人阵营屠尽全部神职或全部平民获胜</div>`);
    RULE_VARIANTS.forEach((rv) => {
      const optId = state.ruleSettings[rv.id];
      const opt = rv.options.find((o) => o.id === optId);
      if (opt) {
        parts.push(`<div style="margin-bottom:0.3rem;">• ${escapeHtml(opt.rule)}</div>`);
      }
    });
    parts.push(`</div></div>`);

    // 角色构成
    parts.push(`<div class="wf-role-row">`);
    roles.forEach((r, i) => {
      const camp = campOf(r);
      parts.push(`<span class="wf-role-chip">${escapeHtml(r)} ${campBadge(camp)}</span>`);
    });
    parts.push(`</div>`);

    parts.push(`<div class="wf-actions">`);
    parts.push(`<button class="wolf-btn primary" data-action="deal">🎴 开始发牌</button>`);
    parts.push(`<button class="wolf-btn ghost" data-action="reset-config">♻️ 重置</button>`);
    parts.push(`</div>`);
    parts.push(`</div>`);

    view.innerHTML = parts.join('');

    // 恢复规则变体卡片的展开状态
    if (wasOpen) {
      const newDetails = view.querySelector('.wf-collapsible');
      if (newDetails) newDetails.open = true;
    }
  }

  /* --- 发牌视图 --- */
  function renderDeal() {
    const parts = [];
    parts.push(`<div class="wf-steps">`);
    parts.push(`<div class="wf-step done"><span class="num">1</span> 配置</div>`);
    parts.push(`<div class="wf-step active"><span class="num">2</span> 发牌</div>`);
    parts.push(`<div class="wf-step"><span class="num">3</span> 对局</div>`);
    parts.push(`</div>`);

    const p = state.players[state.dealIdx];
    const total = state.players.length;
    parts.push(`<div class="wf-deal-stage">`);
    parts.push(`<div class="wf-deal-counter">${state.dealIdx + 1} / ${total} · 逐人翻牌给玩家</div>`);
    if (p) {
      const camp = p.camp;
      parts.push(`<div class="wf-deal-card">`);
      parts.push(`<div class="wf-deal-player">${escapeHtml(p.name)}</div>`);
      parts.push(`<div class="wf-deal-camp">${campBadge(camp)}</div>`);
      parts.push(`<div class="wf-deal-role">${escapeHtml(p.role)}</div>`);
      parts.push(`<div class="wf-deal-text">${escapeHtml(roleText(p.role))}</div>`);
      parts.push(`</div>`);
      parts.push(`<div class="wf-deal-progress"><i style="width:${((state.dealIdx) / total) * 100}%"></i></div>`);
    }
    parts.push(`<div class="wf-deal-actions">`);
    if (state.dealIdx > 0) {
      parts.push(`<button class="wolf-btn ghost" data-action="deal-prev">⬅ 上一位</button>`);
    }
    if (state.dealIdx + 1 < total) {
      parts.push(`<button class="wolf-btn primary" data-action="deal-next">下一位 ➡</button>`);
    } else {
      parts.push(`<button class="wolf-btn primary" data-action="start">▶ 开始对局</button>`);
    }
    parts.push(`<button class="wolf-btn ghost" data-action="deal">♻️ 重新发牌</button>`);
    parts.push(`</div>`);
    parts.push(`</div>`);

    view.innerHTML = parts.join('');
  }

  /* --- 对局视图 --- */
  function renderGame() {
    const g = state.game;
    const parts = [];
    const win = state.game.pending ? null : checkWin();

    // 步骤条
    parts.push(`<div class="wf-steps">`);
    parts.push(`<div class="wf-step done"><span class="num">1</span> 配置</div>`);
    parts.push(`<div class="wf-step done"><span class="num">2</span> 发牌</div>`);
    parts.push(`<div class="wf-step active"><span class="num">3</span> 对局</div>`);
    parts.push(`</div>`);

    // 状态行：阶段 + 倒计时 + 回合
    const isNight = g.phase === 'night';
    const phaseLabel = isNight ? `🌙 第 ${g.round} 夜 · 天黑请闭眼` : `☀️ 第 ${g.round} 天 · 天亮了`;
    parts.push(`<div class="wf-phase-row">`);
    parts.push(`<div class="wf-phase-name"><span class="${isNight ? 'night' : 'day'}">${phaseLabel}</span></div>`);
    parts.push(`<div class="wf-phase-name" style="font-size:0.95rem;color:var(--text-muted)">${escapeHtml(state.board.name)}</div>`);
    parts.push(`</div>`);

    // ===== 夜间行动卡 =====
    if (isNight && g.phase === 'night') {
      const actor = g.night.order[g.night.idx];
      if (actor) {
        parts.push(renderNightAction(actor));
      }
    }

    // ===== 白天 =====
    if (g.phase === 'day') {
      if (g.explodePick) parts.push(renderExplode());
      else parts.push(renderDay());
    }

    // ===== 待决（猎人/白痴/白狼王放逐） =====
    if (g.pending === 'hunter') parts.push(renderHunter());
    if (g.pending === 'idiot') parts.push(renderIdiot());
    if (g.pending === 'langwang_exile') parts.push(renderLangwangExile());

    // ===== 下层：玩家面板 + 记录 =====
    parts.push(`<div class="wf-grid-2">`);
    parts.push(`<div class="wf-panel"><h2 class="wf-panel-title" style="font-size:1rem;">👥 玩家 · 身份</h2><div class="wf-players">`);
    state.players.forEach((p) => {
      parts.push(`<div class="wf-player ${p.alive ? '' : 'dead'}"><span class="dot"></span>${p.alive ? '' : '✕ '}${escapeHtml(p.name)} <b class="wf-player-role ${p.camp === '狼' ? 'wolf' : p.camp === '神' ? 'god' : 'villager'}">${roleAbbr(p.role)}</b></div>`);
    });
    parts.push(`</div></div>`);
    parts.push(`<div class="wf-panel"><h2 class="wf-panel-title" style="font-size:1rem;">📜 行动记录</h2><ul class="wf-log">`);
    const logs = g.log.slice(-20);
    if (!logs.length) parts.push(`<li>对局开始…</li>`);
    logs.forEach((l) => parts.push(`<li>${escapeHtml(l.t)}</li>`));
    parts.push(`</ul></div>`);
    parts.push(`</div>`);

    parts.push(`<div class="wf-actions" style="margin-top:0.4rem;">`);
    parts.push(`<button class="wolf-btn ghost" data-action="timer" data-op="toggle">⏯ 暂停/继续</button>`);
    parts.push(`<button class="wolf-btn ghost" data-action="timer" data-op="restart">↻ 重置计时</button>`);
    parts.push(`<button class="wolf-btn danger" data-action="reset" style="margin-left:auto;">🗑 结束并重置</button>`);
    parts.push(`</div>`);

    view.innerHTML = parts.join('');
    updateTimerUI();

    // 胜负弹层
    if (win) showWinner(win);
  }

  function renderNightAction(actor) {
    const g = state.game;
    const n = g.night;
    const alivePlayers = state.players.filter((p) => p.alive);
    let body = '';

    if (actor === '狼人') {
      const targets = alivePlayers;
      body = `
        <div class="wf-action-role">🐺 ${escapeHtml(roleText('狼人'))}</div>
        <div class="wf-action-text">选择今晚要袭击的目标</div>
        <div class="wf-target-grid">${targets.map((p) => `<button class="wf-target" data-action="night-target" data-idx="${p.idx}">${escapeHtml(p.name)}</button>`).join('')}</div>`;
    } else if (actor === '守卫') {
      const forbidden = g.lastGuardTarget;
      const targets = alivePlayers;
      body = `
        <div class="wf-action-role">🛡 ${escapeHtml(roleText('守卫'))}</div>
        <div class="wf-action-text">选择要守护的玩家（不可连续守同一人${forbidden !== null ? '，' + escapeHtml(state.players[forbidden].name) + ' 上轮已守' : ''}）</div>
        <div class="wf-target-grid">${targets.map((p) => `<button class="wf-target" data-action="night-target" data-idx="${p.idx}" ${p.idx === forbidden ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : ''}>${escapeHtml(p.name)}${p.idx === forbidden ? ' (已守)' : ''}</button>`).join('')}</div>`;
    } else if (actor === '女巫') {
      const wg = g.witchGlobal || {};
      const wolfName = n.wolfTarget !== null ? state.players[n.wolfTarget].name : '无人';
      const witchPlayerIdx = state.players.findIndex((p) => p.alive && p.role === '女巫');
      const isSelfSave = n.wolfTarget !== null && n.wolfTarget === witchPlayerIdx;
      // 女巫自救规则：no_self_save / first_night_only / always_self_save
      const selfSaveRule = ruleOption('witch_self_save') || 'no_self_save';
      const selfSaveBlocked = isSelfSave && (
        selfSaveRule === 'no_self_save' ||
        (selfSaveRule === 'first_night_only' && g.round > 1)
      );
      const selfSaveLabel = isSelfSave ? (selfSaveRule === 'first_night_only' && g.round === 1 ? '首夜自救' : '不能自救') : '';
      const noDouble = ruleOption('witch_double_use') === 'no_double';
      const saveDisabled = wg.healUsed || n.wolfTarget === null || selfSaveBlocked || (noDouble && n.witch.saveUsed);
      const poisonDisabled = wg.poisonUsed || (noDouble && n.witch.saveUsed);
      if (n.witchPhase === 'choose') {
        body = `
          <div class="wf-action-role">🧪 ${escapeHtml(roleText('女巫'))}</div>
          <div class="wf-action-text">${wg.healUsed ? '解药已用' : selfSaveBlocked ? '女巫' + selfSaveLabel : '如狼刀见血，可用解药'} · 当前狼刀：<b>${escapeHtml(wolfName)}</b></div>
          <div class="wf-target-grid two-col">
            <button class="wolf-btn primary small" data-action="witch" data-opt="save" ${saveDisabled ? 'disabled' : ''}>💊 救人（${wg.healUsed ? '已用' : isSelfSave ? selfSaveLabel : '解药'}）</button>
            <button class="wolf-btn danger small" data-action="witch" data-opt="poison" ${poisonDisabled ? 'disabled' : ''}>☠️ 毒人（${wg.poisonUsed ? '已用' : '毒药'}）</button>
            <button class="wolf-btn ghost small" data-action="witch" data-opt="none">不用药</button>
          </div>`;
      } else if (n.witchPhase === 'poison') {
        body = `
          <div class="wf-action-role">☠️ 女巫 · 选择毒人</div>
          <div class="wf-action-text">选择要毒杀的玩家</div>
          <div class="wf-target-grid">${alivePlayers.map((p) => `<button class="wf-target" data-action="witch-poison" data-idx="${p.idx}">${escapeHtml(p.name)}</button>`).join('')}</div>`;
      }
    } else if (actor === '预言家') {
      const seer = n.seer;
      if (seer.result) {
        const isWolf = seer.result === 'wolf';
        body = `
          <div class="wf-action-role">🔮 ${escapeHtml(roleText('预言家'))}</div>
          <div class="wf-action-text">查验玩家 <b>${escapeHtml(state.players[seer.target].name)}</b> 的身份</div>
          <div style="font-size:1.6rem;font-weight:800;margin:0.5rem 0;color:${isWolf ? '#ef4444' : 'var(--brand)'};">${isWolf ? '🟥 查杀（狼人）' : '🟩 金水（好人）'}</div>
          <button class="wolf-btn primary" data-action="night-next">确认，进入下一阶段 ➡</button>`;
      } else {
        body = `
          <div class="wf-action-role">🔮 ${escapeHtml(roleText('预言家'))}</div>
          <div class="wf-action-text">选择要查验身份的目标</div>
          <div class="wf-target-grid">${alivePlayers.map((p) => `<button class="wf-target" data-action="night-seer" data-idx="${p.idx}">${escapeHtml(p.name)}</button>`).join('')}</div>`;
      }
    } else {
      body = `<div class="wf-action-text">${escapeHtml(actor)} 行动</div><div class="wf-target-grid"></div>`;
    }

    return `
      <div class="wf-action-card">
        <div class="wf-phase-name" style="margin-bottom:0.3rem;"><span class="${actor === '狼人' ? 'night' : ''}">${escapeHtml(actor)} · 行动（${g.night.idx + 1}/${g.night.order.length}）</span></div>
        ${body}
        <div class="wf-timer" id="wolf-timer">60</div>
      </div>`;
  }

  function renderDay() {
    const g = state.game;
    const deaths = g.deaths;
    const alivePlayers = state.players.filter((p) => p.alive);
    const hasLangwang = state.players.some((p) => p.alive && p.role === '白狼王');
    let deathHtml;
    if (deaths.length) {
      deathHtml = deaths.map((i) => `<span class="wf-role-chip" style="border-color:rgba(239,68,68,0.4);color:#f87171;">🗑 ${escapeHtml(state.players[i].name)}（${escapeHtml(state.players[i].role)}）</span>`).join(' ');
    } else {
      deathHtml = `<span class="wf-role-chip">🌤 平安夜，无人离场</span>`;
    }
    return `
      <div class="wf-action-card">
        <div class="wf-action-role">☀️ 天亮了 · 昨夜死讯</div>
        <div class="wf-role-row">${deathHtml}</div>
        <div class="wf-divider"></div>
        <div class="wf-action-role">🗳 白天 · 投票放逐</div>
        <div class="wf-action-text">选择要放逐的玩家</div>
        <div class="wf-target-grid">${alivePlayers.map((p) => `<button class="wf-target" data-action="day-exile" data-idx="${p.idx}">${escapeHtml(p.name)}</button>`).join('')}</div>
        <div class="wf-actions" style="margin-top:1rem;">
          <button class="wolf-btn small" data-action="day-skip">🙅 无人被放逐（直接进入夜晚）</button>
          ${hasLangwang ? `<button class="wolf-btn small" data-action="wolf-explode">💥 白狼王自爆</button>` : ''}
          <span style="align-self:center;color:var(--text-muted);font-size:0.85rem;">放逐后如有猎人/白痴将触发结算</span>
        </div>
      </div>`;
  }

  function renderExplode() {
    const aliveGood = state.players.filter((p) => p.alive && p.camp !== '狼');
    return `
      <div class="wf-action-card" style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.06);">
        <div class="wf-action-role">💥 白狼王自爆</div>
        <div class="wf-action-text">带走一名好人</div>
        <div class="wf-target-grid">${aliveGood.map((p) => `<button class="wf-target" data-action="explode-target" data-idx="${p.idx}">${escapeHtml(p.name)}</button>`).join('')}</div>
      </div>`;
  }

  function renderHunter() {
    const alivePlayers = state.players.filter((p) => p.alive);
    return `
      <div class="wf-action-card" style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.06);">
        <div class="wf-action-role">🔫 猎人开枪</div>
        <div class="wf-action-text">猎人被放逐，开枪带走一名玩家</div>
        <div class="wf-target-grid">${alivePlayers.map((p) => `<button class="wf-target" data-action="hunter-shot" data-idx="${p.idx}">${escapeHtml(p.name)}</button>`).join('')}</div>
      </div>`;
  }

  function renderIdiot() {
    const p = state.players[state.game.pendingIdx];
    return `
      <div class="wf-action-card">
        <div class="wf-action-role">🎭 白痴翻牌</div>
        <div class="wf-action-text">${escapeHtml(p.name)}（白痴）被放逐，是否翻牌免死？</div>
        <div class="wf-target-grid two-col">
          <button class="wolf-btn primary small" data-action="idiot" data-opt="spare">🙌 翻牌免死（留在场，不能投票）</button>
          <button class="wolf-btn ghost small" data-action="idiot" data-opt="pass">不出牌，出局</button>
        </div>
      </div>`;
  }

  function renderLangwangExile() {
    const p = state.players[state.game.pendingIdx];
    const aliveGood = state.players.filter((q) => q.alive && q.camp !== '狼' && q.idx !== p.idx);
    return `
      <div class="wf-action-card" style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.06);">
        <div class="wf-action-role">🐺 白狼王被放逐</div>
        <div class="wf-action-text">${escapeHtml(p.name)}（白狼王）被投票放逐，是否自爆带走一名好人？</div>
        <div class="wf-target-grid two-col">
          <button class="wolf-btn danger small" data-action="langwang_exile_explode">💥 自爆带人</button>
          <button class="wolf-btn ghost small" data-action="langwang_exile_pass">不出牌，直接出局</button>
        </div>
        ${state.game.explodePick ? `<div style="margin-top:0.8rem;"><div class="wf-action-text" style="font-size:0.95rem;">选择要带走的玩家：</div><div class="wf-target-grid">${aliveGood.map((q) => `<button class="wf-target" data-action="langwang_exile_target" data-idx="${q.idx}">${escapeHtml(q.name)}</button>`).join('')}</div></div>` : ''}
      </div>`;
  }

  /* ---------- 胜负弹层 ---------- */
  function showWinner(win) {
    if (view.querySelector('.wf-overlay')) return;
    const good = win === 'good';
    clearTimer();
    const alive = state.players.filter((p) => p.alive);
    const aliveGood = alive.filter((p) => p.camp !== '狼').length;
    const aliveWolf = alive.filter((p) => p.camp === '狼').length;
    const logs = state.game.log;
    const logHtml = logs.map((l) => `<li>${escapeHtml(l.t)}</li>`).join('');
    view.insertAdjacentHTML('beforeend', `
      <div class="wf-overlay">
        <div class="wf-winner-card">
          <div class="wf-winner-icon">${good ? '🎉' : '🐺'}</div>
          <div class="wf-winner-title">${good ? '好人阵营胜利' : '狼人阵营胜利'}</div>
          <div class="wf-winner-sub">${good ? '所有狼人已被淘汰' : '屠边成功 · 好人再无还手之力'}</div>
          <div class="wf-winner-stats">好人 ${aliveGood} 存活 · 狼人 ${aliveWolf} 存活</div>
          <div class="wf-divider"></div>
          <div class="wf-winner-log-title">📜 行动记录</div>
          <ul class="wf-log" style="max-height:220px;overflow-y:auto;">${logHtml}</ul>
          <div class="wf-divider"></div>
          <div class="wf-actions" style="justify-content:center;">
            <button class="wolf-btn primary" data-action="reset">🔄 再来一局</button>
          </div>
        </div>
      </div>`);
  }

  /* ---------- 定时器 ---------- */
  let timerId = null;
  let timerRemain = 0;
  let timerPaused = false;

  function startTimer(sec) {
    clearTimer();
    timerRemain = sec;
    timerPaused = false;
    updateTimerUI();
    timerId = setInterval(() => {
      if (timerPaused) return;
      if (timerRemain > 0) { timerRemain--; updateTimerUI(); }
    }, 1000);
  }
  function clearTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }
  function updateTimerUI() {
    const el = document.getElementById('wolf-timer');
    if (!el) return;
    el.textContent = timerRemain;
    el.classList.toggle('warn', timerRemain <= 10 && timerRemain > 0);
    el.classList.toggle('danger', timerRemain <= 5 && timerRemain > 0);
  }
  function resetTimer() {
    const g = state.game;
    if (g && g.phase === 'night') startTimer(60);
    else startTimer(120);
  }

  /* ---------- 事件分发 ---------- */
  view.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');
    handleAction(action, el);
  });

  function handleAction(action, el) {
    const idx = Number(el.getAttribute('data-idx'));

    switch (action) {
      case 'count': {
        state.count = Number(el.getAttribute('data-count'));
        buildBoard(state.count);
        renderSetup();
        break;
      }
      case 'option': {
        applyOption(Number(el.getAttribute('data-idx')));
        renderSetup();
        break;
      }
      case 'board': {
        const b = BOARDS.find((x) => x.id === el.getAttribute('data-board'));
        if (b) applyBoard({ id: b.id, name: b.name, wolf: b.wolf, wolves: b.wolves, gods: b.gods, villager: b.villager, nightOrder: nightOrderFor(b.gods) });
        renderSetup();
        break;
      }
      case 'rule': {
        const variantId = el.getAttribute('data-variant');
        const optionId = el.getAttribute('data-option');
        if (variantId && optionId) {
          state.ruleSettings[variantId] = optionId;
          renderSetup();
        }
        break;
      }
      case 'reset-config': { state.count = 12; state.ruleSettings = getDefaultRuleSettings(); buildBoard(12); renderSetup(); break; }
      case 'deal': { deal(); state.step = 'deal'; renderDeal(); break; }
      case 'deal-prev': { if (state.dealIdx > 0) state.dealIdx--; renderDeal(); break; }
      case 'deal-next': { if (state.dealIdx + 1 < state.players.length) state.dealIdx++; renderDeal(); break; }
      case 'start': {
        state.step = 'game';
        state.game = newGame();
        enterNight();
        break;
      }
      case 'night-target': { // wolf / guard
        const actor = state.game.night.order[state.game.night.idx];
        if (actor === '狼人') { state.game.night.wolfTarget = idx; addLog(`🌙 狼人袭击了 ${state.players[idx].name}`); }
        else if (actor === '守卫') {
          if (idx === state.game.lastGuardTarget) break; // 不可连续守同一人
          state.game.night.guardTarget = idx;
          addLog(`🛡 守卫守护了 ${state.players[idx].name}`);
        }
        nextNight();
        break;
      }
      case 'night-seer': {
        const g = state.game;
        g.night.seer = { target: idx, result: state.players[idx].camp === '狼' ? 'wolf' : 'good' };
        addLog(`🔮 预言家查验了 ${state.players[idx].name}（${g.night.seer.result === 'wolf' ? '查杀' : '金水'}）`);
        renderGame();
        break;
      }
      case 'night-next': { nextNight(); break; }
      case 'witch': {
        const g = state.game;
        const opt = el.getAttribute('data-opt');
        if (opt === 'save') {
          // 防御性检查：女巫自救规则
          const witchIdx = state.players.findIndex((p) => p.alive && p.role === '女巫');
          const isSelf = witchIdx === g.night.wolfTarget;
          if (isSelf) {
            const selfRule = ruleOption('witch_self_save') || 'no_self_save';
            const blocked = selfRule === 'no_self_save' || (selfRule === 'first_night_only' && g.round > 1);
            if (blocked) {
              addLog('🧪 女巫不能自救！');
              break;
            }
          }
          g.witchGlobal.healUsed = true;
          g.night.witch.saveUsed = true;
          g.night.witch.saveTarget = g.night.wolfTarget;
          addLog(`🧪 女巫使用解药救了 ${state.players[g.night.wolfTarget].name}`);
          nextNight();
        } else if (opt === 'poison') {
          g.night.witchPhase = 'poison';
          renderGame();
        } else {
          addLog('🧪 女巫没有使用药水');
          nextNight();
        }
        break;
      }
      case 'witch-poison': {
        const g = state.game;
        g.witchGlobal.poisonUsed = true;
        g.night.witch.poisonTarget = idx;
        addLog(`☠️ 女巫毒杀了 ${state.players[idx].name}`);
        nextNight();
        break;
      }
      case 'day-exile': { exile(idx); break; }
      case 'day-skip': { addLog('🧑‍⚖️ 白天无人被放逐，直接进入夜晚'); afterExile(); break; }
      case 'wolf-explode': { state.game.explodePick = true; renderGame(); break; }
      case 'explode-target': {
        const p = state.players[idx];
        p.alive = false;
        addLog(`💥 白狼王自爆带走了 ${p.name}（${p.role}）`);
        state.game.explodePick = false;
        afterExile();
        break;
      }
      case 'hunter-shot': { resolvePending(null, idx); break; }
      case 'idiot': { resolvePending(el.getAttribute('data-opt'), idx); break; }
      case 'langwang_exile_explode': {
        state.game.explodePick = true;
        renderGame();
        break;
      }
      case 'langwang_exile_target': {
        const target = state.players[idx];
        const wolfKing = state.players[state.game.pendingIdx];
        wolfKing.alive = false;
        target.alive = false;
        addLog(`💥 白狼王被放逐时自爆，带走了 ${target.name}（${target.role}）`);
        state.game.pending = null;
        state.game.explodePick = false;
        afterExile();
        break;
      }
      case 'langwang_exile_pass': {
        const wolfKing = state.players[state.game.pendingIdx];
        wolfKing.alive = false;
        addLog(`🐺 白狼王（${wolfKing.name}）被放逐，未自爆`);
        state.game.pending = null;
        afterExile();
        break;
      }
      case 'timer': {
        const op = el.getAttribute('data-op');
        if (op === 'toggle') { timerPaused = !timerPaused; updateTimerUI(); }
        else if (op === 'restart') { timerPaused = false; resetTimer(); }
        break;
      }
      case 'reset': { state.step = 'setup'; state.count = 12; state.ruleSettings = getDefaultRuleSettings(); applyBoard(buildBoard(12)); clearTimer(); renderSetup(); break; }
    }
  }

  /* ---------- 主题切换（页头独立按钮） ---------- */
  const themeBtn = document.getElementById('wolf-theme');
  if (themeBtn) {
    const sync = () => {
      const dark = document.documentElement.getAttribute('data-bs-theme') !== 'light';
      themeBtn.textContent = dark ? '🌙 深色' : '☀️ 浅色';
    };
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-bs-theme') !== 'light';
      document.documentElement.setAttribute('data-bs-theme', cur ? 'light' : 'dark');
      try { localStorage.setItem('site-theme', cur ? 'light' : 'dark'); } catch (e) {}
      sync();
    });
    sync();
  }

  /* ---------- 初始化 ---------- */
  function init() {
    state.count = 12;
    applyBoard(buildBoard(12));
    renderSetup();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
