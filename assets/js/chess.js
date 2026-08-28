/* ============================================
   KC Gaming Chess — 独立逻辑
   配合 assets/css/chess.css 与 _layouts/chess_v2.html 使用
   数据来源：window.CHESS_DATA（由 Jekyll 从 _data/chess.yml 注入）
   ============================================ */
(function () {
  'use strict';

  const DATA = window.CHESS_DATA || {};
  const CONFIG = DATA.config || {};
  const SERIES = DATA.series || [];
  const SCORING = DATA.scoring || {};
  const MATCHES = DATA.matches || [];
  const SEASONS = DATA.seasons || [];

  // 当前赛季（默认取配置；若无配置则取所有比赛的最大 ssn）
  const CURRENT_SEASON = CONFIG.current_season || Math.max(0, ...MATCHES.map((m) => m.ssn || 0));
  // 可选赛季列表（去重排序）
  const SEASON_IDS = Array.from(new Set(MATCHES.map((m) => m.ssn || 0))).sort((a, b) => b - a);
  // 选中的赛季筛选状态（赛程 tab 用）
  // 默认显示当前赛季；若当前赛季无比赛，则回退到最近的有比赛的赛季（如历史 S1）
  const hasCurrentMatches = MATCHES.some((m) => m.ssn === CURRENT_SEASON);
  let activeSeasonFilter = hasCurrentMatches ? CURRENT_SEASON : (SEASON_IDS[0] !== undefined ? SEASON_IDS[0] : CURRENT_SEASON);

  // 系列索引
  const seriesMap = {};
  SERIES.forEach((s) => {
    seriesMap[s.id] = s;
  });

  /* ---------- 工具函数 ---------- */
  // 解析日期字符串：支持 "YYYY-MM-DD HH:MM" 和 "YYYY-MM-DD"
  function parseDate(str) {
    if (!str) return null;
    // 兼容 "YYYY-MM-DD HH:MM:SS"
    const m = String(str).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2}))?/);
    if (m) {
      const d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDate(date) {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${months[date.getMonth()]}${date.getDate()}日 ${days[date.getDay()]}`;
  }

  function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatRange(start, end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  function getCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    if (diff < 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}天后`;
    if (hours > 0) return `${hours}小时后`;
    if (minutes > 0) return `${minutes}分钟后`;
    return '即将开始';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 简单的 markdown 转 HTML（用于 match.description）
  function miniMarkdown(text) {
    if (!text) return '';
    let t = String(text);
    t = t.split(' | ').join('</p><p>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.*?)\*/g, '<em>$1</em>');
    t = t.replace(/^### (.*?)$/gm, '<h4 style="color: var(--chess-gold); margin: 12px 0 8px; font-size: 1em;">$1</h4>');
    t = t.replace(/^- (.*?)$/gm, '<li>$1</li>');
    t = t.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    return t;
  }

  /* ---------- 数据标准化 ---------- */
  // 将原始 match 标准化：计算 startTime/endTime/name/seriesId/type/prizes
  function normalizeMatch(match) {
    const m = { ...match };
    m.ssn = match.ssn || 0;
    let start = parseDate(match.start_time);
    let end = parseDate(match.end_time);

    // 系列赛：从 series 继承时间和名称
    let series = null;
    if (match.series && seriesMap[match.series]) {
      series = seriesMap[match.series];
      m.seriesId = match.series;

      const dateStr = match.date || '';
      const timeStr = match.time || series.time || '18:00';
      const base = parseDate(`${dateStr} ${timeStr}`);
      if (base) {
        start = base;
        end = new Date(base);
        const durHours = series.duration_hours || 2;
        end.setHours(end.getHours() + Math.floor(durHours));
        end.setMinutes(end.getMinutes() + Math.round((durHours % 1) * 60));
      }

      // 生成名称
      let name = series.full_name || series.name || '';
      name = name.replace('{season}', match.season || '');
      const month = start ? `${start.getMonth() + 1}月` : '';
      name = name.replace('{month}', month);
      m.name = name;
      m.prizes = (series.prize || []).map((p) => ({ ...p }));
    } else {
      m.prizes = (match.prizes || []).map((p) => ({ ...p }));
      // 特殊活动推断系列
      if (match.special_type) {
        m.seriesId = match.special_type;
      } else {
        m.seriesId = 'special';
      }
    }

    m.startTime = start;
    m.endTime = end || (start ? new Date(start.getTime() + 2 * 3600 * 1000) : null);
    m.winners = Array.isArray(match.winners) ? match.winners : [];
    m.link = match.link || '#';
    return m;
  }

  // 判断比赛类型（用于主题色）
  function matchType(m) {
    if (m.seriesId) {
      if (m.seriesId === 'champions') return 'type-champions';
      if (m.seriesId === 'pro') return 'type-pro';
      if (m.seriesId === 'ec') return 'type-ec';
    }
    // 特殊活动
    if (m.special_type) return 'type-special';
    return 'type-ec';
  }

  function seriesIconOf(m) {
    if (m.seriesId && seriesMap[m.seriesId]) return seriesMap[m.seriesId].icon || '';
    return '';
  }

  /* ---------- 状态分类 ---------- */
  function classify(matches, now) {
    const running = [];
    const upcoming = [];
    const past = [];
    matches.forEach((m) => {
      if (!m.startTime) return;
      if (m.endTime && m.endTime < now) {
        past.push(m);
      } else if (m.startTime <= now && (!m.endTime || now < m.endTime)) {
        running.push(m);
      } else {
        upcoming.push(m);
      }
    });
    upcoming.sort((a, b) => a.startTime - b.startTime);
    past.sort((a, b) => b.startTime - a.startTime);
    return { running, upcoming, past };
  }

  /* ---------- 渲染：比赛卡片 ---------- */
  function createMatchCard(m, isPast, opts = {}) {
    const { hasExtras = false, toggleId = '', seriesLabel = '', extrasCount = 0, seriesIcon = '' } = opts;
    const dateStr = m.startTime ? formatDate(m.startTime) : '';
    const timeStr = m.startTime && m.endTime ? formatRange(m.startTime, m.endTime) : '';
    const type = matchType(m);
    const icon = seriesIcon || seriesIconOf(m);

    // 奖金
    let prizesHtml = '';
    if (m.prizes && m.prizes.length > 0) {
      const total = m.prizes.reduce((sum, p) => {
        const amount = parseInt(String(p.amount || '').replace(/[^0-9]/g, ''), 10) || 0;
        return sum + amount;
      }, 0);
      const chips = m.prizes
        .map((p) => `<span class="chess-prize-chip">${escapeHtml(p.label || '')} ${escapeHtml(p.amount || '')}</span>`)
        .join('');
      prizesHtml = `
        <div class="chess-match-prizes">
          <span class="chess-prize-total">💰 总奖金: ￥${total}</span>
          ${chips}
        </div>`;
    }

    // 获奖者
    let winnersHtml = '';
    if (m.winners && m.winners.length > 0 && isPast) {
      const items = m.winners
        .map((w) => {
          const prize = (m.prizes || []).find((p) => p.rank === w.rank || p.label === w.label);
          const amount = prize && prize.amount ? ` <span style="color: var(--chess-gold)">(${escapeHtml(prize.amount)})</span>` : '';
          return `<div class="chess-winner-item">${escapeHtml(w.label || w.position || '')}: ${escapeHtml(w.name)}${amount}</div>`;
        })
        .join('');
      winnersHtml = `
        <div class="chess-match-winners">
          <div class="chess-winners-title">🎯 获奖名单</div>
          ${items}
        </div>`;
    }

    // 描述
    let descHtml = '';
    if (m.description) {
      descHtml = `<div class="chess-match-desc"><p>${miniMarkdown(m.description)}</p></div>`;
    }

    // 折叠链接
    let extrasHtml = '';
    if (hasExtras && toggleId) {
      extrasHtml = `
        <button class="chess-toggle-link" data-target="${toggleId}" data-expanded="false"
                data-series-label="${escapeHtml(seriesLabel)}" data-extras-count="${extrasCount}">
          ▾ 展开更多「${escapeHtml(seriesLabel)}」系列比赛 (${extrasCount})
        </button>`;
    }

    const btn = isPast
      ? `<a href="${escapeHtml(m.link)}" target="_blank" rel="noopener" class="chess-match-btn secondary">查看结果</a>`
      : `<a href="${escapeHtml(m.link)}" target="_blank" rel="noopener" class="chess-match-btn primary">立即报名</a>`;

    return `
      <div class="chess-match-item">
        <div class="chess-match-marker"></div>
        <div class="chess-match-card ${type} ${m._running ? 'ongoing' : ''}">
          ${icon ? `<div class="chess-match-icon">${icon}</div>` : ''}
          <div class="chess-match-header">
            <div>
              <h3 class="chess-match-name">${escapeHtml(m.name || '')}</h3>
              <div class="chess-match-time">🕐 ${dateStr} ${timeStr}</div>
            </div>
            <div class="chess-match-action">${btn}</div>
          </div>
          ${descHtml}
          ${prizesHtml}
          ${winnersHtml}
          ${extrasHtml}
        </div>
      </div>`;
  }

  /* ---------- 渲染：赛季筛选器（赛程 tab） ---------- */
  function renderSeasonFilter(container, onSelect) {
    if (!container) return;
    // 赛季列表 = 配置声明的赛季（含当前 S2 即使暂无比赛）+ 实际有比赛的赛季
    const configured = SEASONS.map((s) => Number(s.id));
    const withMatches = SEASON_IDS;
    const allIds = Array.from(new Set([...configured, ...withMatches])).sort((a, b) => b - a);
    if (allIds.length <= 1) {
      container.innerHTML = '';
      return;
    }
    // 合并"当前赛季"和"历史赛季"为分组
    const groups = allIds.map((id) => {
      const meta = SEASONS.find((s) => Number(s.id) === id);
      const hasMatches = withMatches.includes(id);
      return {
        id,
        label: meta ? meta.label : (id === CURRENT_SEASON ? CONFIG.season_label || `S${id}` : `S${id}`),
        isCurrent: id === CURRENT_SEASON,
        hasMatches,
      };
    });
    // 当前赛季在前
    groups.sort((a, b) => (a.isCurrent ? -1 : b.isCurrent ? 1 : b.id - a.id));

    container.innerHTML = `
      <div class="chess-season-filter">
        <span class="chess-season-filter-label">赛季</span>
        ${groups
          .map(
            (g) => `
          <button class="chess-lb-btn ${g.id === activeSeasonFilter ? 'active' : ''}"
                  data-season="${g.id}">
            ${g.label}${g.isCurrent ? ' <span class="chess-season-current">●</span>' : ''}
            ${!g.hasMatches ? ' <span class="chess-season-empty">(待开赛)</span>' : ''}
          </button>`
          )
          .join('')}
      </div>`;

    container.querySelectorAll('[data-season]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeSeasonFilter = Number(btn.getAttribute('data-season'));
        container.querySelectorAll('[data-season]').forEach((b) => {
          b.classList.toggle('active', Number(b.getAttribute('data-season')) === activeSeasonFilter);
        });
        onSelect(activeSeasonFilter);
      });
    });
  }

  /* ---------- 渲染：时间轴（赛程 tab） ---------- */
  function renderTimeline(container, matches, now, seasonId) {
    if (!container) return;
    const scoped = seasonId === undefined ? matches : matches.filter((m) => m.ssn === seasonId);
    const { running, upcoming, past } = classify(scoped, now);
    let html = '';

    // 进行中
    if (running.length > 0) {
      html += `<div class="chess-time-group chess-time-group-track">
        <div class="chess-time-label running">🔴 正在进行</div>`;
      running.forEach((m) => {
        m._running = true;
        html += createMatchCard(m, false);
      });
      html += '</div>';
    }

    // 即将开始（按系列折叠）
    if (upcoming.length > 0) {
      html += `<div class="chess-time-group chess-time-group-track"><div class="chess-time-label">⚡ 即将开始</div>`;
      const renderedSeries = new Set();
      upcoming.forEach((m) => {
        if (m.seriesId && m.seriesId !== 'special') {
          if (renderedSeries.has(m.seriesId)) return;
          renderedSeries.add(m.seriesId);
          const groupMatches = upcoming.filter((x) => x.seriesId === m.seriesId);
          const extras = groupMatches.slice(1);
          const s = seriesMap[m.seriesId];
          const label = s ? s.name : m.seriesId.toUpperCase();
          const icon = s ? s.icon : '';
          if (extras.length > 0) {
            html += createMatchCard(m, false, {
              hasExtras: true,
              toggleId: `series-extra-${m.seriesId}`,
              seriesLabel: label,
              extrasCount: extras.length,
              seriesIcon: icon,
            });
            html += `<div class="chess-series-extra hidden" id="series-extra-${m.seriesId}">`;
            extras.forEach((x) => {
              html += createMatchCard(x, false);
            });
            html += '</div>';
          } else {
            html += createMatchCard(m, false, { seriesIcon: icon });
          }
        } else {
          html += createMatchCard(m, false, { seriesIcon: seriesIconOf(m) });
        }
      });
      html += '</div>';
    }

    // 已结束（独立全宽网格，不沿时间轴竖线）
    if (past.length > 0) {
      html += `<div class="chess-time-group chess-time-group-grid"><div class="chess-time-label">🏆 已结束</div>`;
      html += `<div class="chess-past-grid">`;
      past.forEach((m) => {
        html += createPastCard(m);
      });
      html += '</div></div>';
    }

    if (!running.length && !upcoming.length && !past.length) {
      const seasonMeta = SEASONS.find((s) => Number(s.id) === seasonId);
      const label = seasonMeta ? seasonMeta.label : `S${seasonId}`;
      html = `
        <div class="chess-empty">
          <div class="chess-empty-icon">🗓️</div>
          <p>${label} 暂无比赛安排</p>
          <p style="font-size: 0.85em; opacity: 0.7;">新比赛发布后将在此显示</p>
        </div>`;
    }

    container.innerHTML = html;

    // 绑定折叠按钮
    container.querySelectorAll('.chess-toggle-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (!target) return;
        const expanded = btn.getAttribute('data-expanded') === 'true';
        target.classList.toggle('hidden', expanded);
        btn.setAttribute('data-expanded', expanded ? 'false' : 'true');
        const label = btn.getAttribute('data-series-label') || '';
        const count = btn.getAttribute('data-extras-count') || '';
        btn.textContent = expanded
          ? `▾ 展开更多「${label}」系列比赛 (${count})`
          : `▴ 收起「${label}」比赛`;
      });
    });
  }

  function createPastCard(m) {
    const dateStr = m.startTime ? formatDate(m.startTime) : '';
    const timeStr = m.startTime && m.endTime ? formatRange(m.startTime, m.endTime) : '';
    const w1 = (m.winners || []).find((w) => w.rank === 1 || /🥇|第一/.test(w.label || w.position || ''));
    const w2 = (m.winners || []).find((w) => w.rank === 2 || /🥈|第二/.test(w.label || w.position || ''));
    const w3 = (m.winners || []).find((w) => w.rank === 3 || /🥉|第三/.test(w.label || w.position || ''));
    return `
      <div class="chess-past-card">
        <div class="chess-past-title">${escapeHtml(m.name || '')}</div>
        <div class="chess-past-time">🕐 ${dateStr} ${timeStr}</div>
        <div class="chess-past-winners">
          ${w1 ? `<span class="chess-badge-win">🥇 ${escapeHtml(w1.name)}</span>` : '<span class="chess-badge-3">暂无获奖信息</span>'}
          ${w2 ? `<span class="chess-badge-2">🥈 ${escapeHtml(w2.name)}</span>` : ''}
          ${w3 ? `<span class="chess-badge-3">🥉 ${escapeHtml(w3.name)}</span>` : ''}
        </div>
        <a class="chess-past-link" href="${escapeHtml(m.link)}" target="_blank" rel="noopener">查看结果 →</a>
      </div>`;
  }

  /* ---------- 渲染：排行榜（自动计算，仅当前赛季） ---------- */
  function computeLeaderboard(matches, now, seasonId) {
    // 排行榜只统计当前赛季（config.current_season 指定）
    const scoped = seasonId === undefined ? matches : matches.filter((m) => m.ssn === seasonId);
    const seriesKeys = (SCORING.enabled === false) ? [] : ['all', 'ec', 'pro', 'champions'];
    const countsWins = {};
    const points = {};
    seriesKeys.forEach((k) => {
      countsWins[k] = new Map();
      points[k] = new Map();
    });

    const base = SCORING.base_points || { first: 10, second: 6, third: 4 };
    const weightMap = SCORING.weight_map || { ec: 1, pro: 2, champions: 4 };
    const norm = (s) => (s || '').trim().replace(/\s+/g, ' ');

    scoped.forEach((m) => {
      const key = m.seriesId;
      if (!['ec', 'pro', 'champions'].includes(key)) return; // 特殊不计分
      const winners = Array.isArray(m.winners) ? m.winners : [];
      const w1 = winners.find((w) => w.rank === 1 || /🥇|第一/.test(w.label || w.position || ''));
      const w2 = winners.find((w) => w.rank === 2 || /🥈|第二/.test(w.label || w.position || ''));
      const w3 = winners.find((w) => w.rank === 3 || /🥉|第三/.test(w.label || w.position || ''));

      if (w1 && w1.name) {
        const name = norm(w1.name);
        countsWins.all.set(name, (countsWins.all.get(name) || 0) + 1);
        countsWins[key].set(name, (countsWins[key].get(name) || 0) + 1);
      }

      const addP = (w, posKey) => {
        if (!w || !w.name) return;
        const name = norm(w.name);
        const add = (base[posKey] || 0) * (weightMap[key] || 1);
        if (add <= 0) return;
        points.all.set(name, (points.all.get(name) || 0) + add);
        points[key].set(name, (points[key].get(name) || 0) + add);
      };
      addP(w1, 'first');
      addP(w2, 'second');
      addP(w3, 'third');
    });

    return { countsWins, points };
  }

  function renderLeaderboard(container, matches, now, seasonId) {
    if (!container) return;
    const { countsWins, points } = computeLeaderboard(matches, now, seasonId);
    const seriesLabelMap = { all: '全部', ec: 'E.C.', pro: 'PRO LEAGUE', champions: 'Champions' };
    const availableSeries = ['all', 'ec', 'pro', 'champions'].filter(
      (k) => k === 'all' || (countsWins[k] && countsWins[k].size > 0) || (points[k] && points[k].size > 0)
    );
    if (availableSeries.length === 0) {
      container.innerHTML = '<div class="chess-empty"><p>暂无排行数据</p></div>';
      return;
    }

    const topN = SCORING.top_n || 10;
    const ruleNote = SCORING.rule_note || '';

    const buildList = (map, unit) => {
      const arr = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN);
      if (arr.length === 0) return '<div class="chess-lb-empty">暂无数据</div>';
      return arr
        .map(([name, c], idx) => {
          const rank = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1;
          const suffix = unit === 'wins' ? ' 胜' : '';
          return `<div class="chess-lb-item">
            <div class="chess-lb-rank">${rank}</div>
            <div class="chess-lb-name">${escapeHtml(name)}</div>
            <div class="chess-lb-count">${c}${suffix}</div>
          </div>`;
        })
        .join('');
    };

    const modeBtns = `
      <div class="chess-lb-modes">
        <button class="chess-lb-btn active" data-mode="points">${SCORING.points_label || '积分'}榜</button>
        <button class="chess-lb-btn" data-mode="wins">${SCORING.wins_label || '胜场'}榜</button>
      </div>`;

    const tabBtns = availableSeries
      .map((k, i) => `<button class="chess-lb-btn ${i === 0 ? 'active' : ''}" data-series="${k}">${seriesLabelMap[k] || k.toUpperCase()}</button>`)
      .join('');

    const pointsLists = availableSeries
      .map((k, i) => `<div class="chess-lb-list ${i === 0 ? 'active' : ''}" data-mode="points" data-series="${k}">${buildList(points[k], 'pts')}</div>`)
      .join('');
    const winsLists = availableSeries
      .map((k) => `<div class="chess-lb-list" data-mode="wins" data-series="${k}">${buildList(countsWins[k], 'wins')}</div>`)
      .join('');

    const seasonMeta = SEASONS.find((s) => Number(s.id) === (seasonId === undefined ? CURRENT_SEASON : seasonId));
    const seasonTag = seasonMeta ? seasonMeta.label : `S${seasonId === undefined ? CURRENT_SEASON : seasonId}`;

    // 标题行：标题 + 赛季标签 + 模式切换，并排更紧凑
    container.innerHTML = `
      <div class="chess-leaderboard">
        <div class="chess-lb-toolbar">
          <div class="chess-lb-title">🏅 排行 <span class="chess-season-tag">${seasonTag}</span></div>
          ${modeBtns}
        </div>
        <div class="chess-lb-tabs">${tabBtns}</div>
        ${pointsLists}
        ${winsLists}
      </div>
      ${ruleNote ? `<div class="chess-lb-rule"><h4>🎯 计分规则</h4>${miniMarkdown(ruleNote)}</div>` : ''}
    `;

    // 绑定切换
    const lb = container.querySelector('.chess-leaderboard');
    if (!lb) return;
    let curMode = 'points';
    let curSeries = availableSeries[0];
    const apply = () => {
      lb.querySelectorAll('.chess-lb-btn').forEach((b) => {
        const isMode = b.hasAttribute('data-mode');
        const isSeries = b.hasAttribute('data-series');
        const active =
          (isMode && b.getAttribute('data-mode') === curMode) ||
          (isSeries && b.getAttribute('data-series') === curSeries);
        b.classList.toggle('active', active);
      });
      lb.querySelectorAll('.chess-lb-list').forEach((l) => {
        l.classList.toggle('active', l.getAttribute('data-mode') === curMode && l.getAttribute('data-series') === curSeries);
      });
    };
    lb.querySelectorAll('[data-mode]').forEach((b) => {
      b.addEventListener('click', () => {
        curMode = b.getAttribute('data-mode');
        apply();
      });
    });
    lb.querySelectorAll('[data-series]').forEach((b) => {
      b.addEventListener('click', () => {
        curSeries = b.getAttribute('data-series');
        apply();
      });
    });
  }

  /* ---------- 渲染：快速信息（概览） ---------- */
  function renderQuickInfo(container, matches, now) {
    if (!container) return;
    const relevant = [];
    matches.forEach((m) => {
      if (!m.startTime) return;
      const isOngoing = m.startTime <= now && (!m.endTime || now < m.endTime);
      const isUpcoming = m.startTime > now && m.startTime - now < 7 * 24 * 3600 * 1000;
      if (isOngoing || isUpcoming) {
        relevant.push({ m, isOngoing });
      }
    });
    relevant.sort((a, b) => (a.isOngoing === b.isOngoing ? a.m.startTime - b.m.startTime : a.isOngoing ? -1 : 1));
    const top = relevant.slice(0, 3);
    const title = document.querySelector('[data-quick-title]');
    const icon = document.querySelector('[data-quick-icon]');

    if (top.length === 0) {
      container.innerHTML = '<div class="chess-quick-empty">暂无即将开始的比赛</div>';
      if (title) title.textContent = '近期比赛';
      if (icon) icon.textContent = '📅';
      return;
    }

    const ongoing = top.filter((x) => x.isOngoing);
    const upcoming = top.filter((x) => !x.isOngoing);
    if (title) {
      title.textContent = ongoing.length > 0 && upcoming.length > 0 ? '近期比赛' : ongoing.length > 0 ? '正在进行' : '即将开始';
    }
    if (icon) icon.textContent = ongoing.length > 0 ? '🔴' : '⚡';

    let html = '';
    ongoing.forEach(({ m }) => {
      html += quickItemHtml(m, true);
    });
    if (ongoing.length > 0 && upcoming.length > 0) {
      html += '<div class="chess-quick-divider"></div>';
    }
    upcoming.forEach(({ m }) => {
      html += quickItemHtml(m, false);
    });
    container.innerHTML = html;
  }

  function quickItemHtml(m, isOngoing) {
    const timeStr = m.startTime ? formatDate(m.startTime) : '';
    const cd = isOngoing ? '' : getCountdown(m.startTime);
    return `
      <a href="${escapeHtml(m.link)}" target="_blank" rel="noopener" class="chess-quick-item ${isOngoing ? 'ongoing' : 'upcoming'}">
        <div class="chess-quick-name">${escapeHtml(m.name || '')}</div>
        <div class="chess-quick-meta">
          <span>🕐 ${timeStr}</span>
          ${isOngoing ? '<span class="chess-quick-badge live">● 进行中</span>' : cd ? `<span class="chess-quick-badge">${cd}</span>` : ''}
        </div>
      </a>`;
  }

  /* ---------- 渲染：概览系列卡 ---------- */
  function renderSeriesCards(container) {
    if (!container || SERIES.length === 0) return;
    container.innerHTML = SERIES.map((s) => {
      const prizeChips = (s.prize || [])
        .map((p) => `<span class="chess-prize-chip">${escapeHtml(p.label || '')} ${escapeHtml(p.amount || '')}</span>`)
        .join('');
      return `
        <div class="chess-series-card theme-${escapeHtml(s.color || 'bronze')}">
          <div class="chess-series-card-header">
            <span class="chess-series-icon">${escapeHtml(s.icon || '')}</span>
            <span class="chess-series-name">${escapeHtml(s.name || '')}</span>
            ${s.badge ? `<span class="chess-series-badge">${escapeHtml(s.badge)}</span>` : ''}
          </div>
          ${s.description ? `<div class="chess-series-desc">${escapeHtml(s.description)}</div>` : ''}
          ${prizeChips ? `<div class="chess-series-prize">${prizeChips}</div>` : ''}
        </div>`;
    }).join('');
  }

  /* ---------- 渲染：密码横幅 ---------- */
  function renderPassword() {
    const codeEl = document.querySelector('[data-password-code]');
    if (codeEl && CONFIG.password) {
      codeEl.textContent = CONFIG.password;
    }
    const copyBtn = document.querySelector('[data-copy-password]');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const password = CONFIG.password || '';
        navigator.clipboard.writeText(password).then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = '✓ 已复制';
          copyBtn.classList.add('copied');
          copyBtn.disabled = true;
          setTimeout(() => {
            copyBtn.textContent = original;
            copyBtn.classList.remove('copied');
            copyBtn.disabled = false;
          }, 3000);
        });
      });
    }
  }

  /* ---------- 渲染：Tab 切换 ---------- */
  function initTabs(root) {
    const tabs = root.querySelectorAll('.chess-tab');
    const panels = root.querySelectorAll('.chess-tab-panel');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        tabs.forEach((t) => t.classList.toggle('active', t === tab));
        panels.forEach((p) => p.classList.toggle('active', p.id === `panel-${target}`));
      });
    });
  }

  /* ---------- 双主题切换 ---------- */
  function initThemeSync(root) {
    const btn = root.querySelector('[data-chess-theme]');
    if (!btn) return;
    const html = document.documentElement;
    const isDark = () => html.getAttribute('data-bs-theme') !== 'light';
    const update = () => {
      btn.textContent = isDark() ? '☀️ 浅色' : '🌙 深色';
    };
    btn.addEventListener('click', () => {
      html.setAttribute('data-bs-theme', isDark() ? 'light' : 'dark');
      try {
        localStorage.setItem('site-theme', isDark() ? 'dark' : 'light');
      } catch (e) {
        /* ignore */
      }
      update();
    });
    update();
    // 监听站点主题变化
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ['data-bs-theme'] });
  }

  /* ---------- LiChess TV：点击加载 ---------- */
  function initLichessTv() {
    const frame = document.querySelector('[data-lichess-tv]');
    if (!frame) return;
    const loadBtn = frame.querySelector('[data-lichess-load]');
    const iframe = frame.querySelector('[data-lichess-frame]');
    if (!loadBtn || !iframe) return;
    loadBtn.addEventListener('click', () => {
      iframe.src = iframe.getAttribute('data-src') || '';
      frame.classList.add('loaded');
    });
  }

  /* ---------- 主入口 ---------- */
  function init() {
    const root = document.getElementById('chess-app');
    if (!root) return;

    const normalized = MATCHES.map(normalizeMatch).filter((m) => m.startTime);
    const now = new Date();

    renderPassword();
    initLichessTv();
    initTabs(root);
    initThemeSync(root);

    // 概览：快速信息 + 系列卡
    const quick = root.querySelector('[data-quick-content]');
    if (quick) renderQuickInfo(quick, normalized, now);

    const seriesCards = root.querySelector('[data-series-cards]');
    if (seriesCards) renderSeriesCards(seriesCards);

    // 赛程：赛季筛选 + 时间轴
    const timeline = root.querySelector('[data-timeline]');
    if (timeline) {
      const filter = root.querySelector('[data-season-filter]');
      if (filter) {
        renderSeasonFilter(filter, () => {
          renderTimeline(timeline, normalized, new Date(), activeSeasonFilter);
        });
      }
      renderTimeline(timeline, normalized, now, activeSeasonFilter);
    }

    // 排行（只统计当前赛季）
    const lb = root.querySelector('[data-leaderboard]');
    if (lb) renderLeaderboard(lb, normalized, now, CURRENT_SEASON);

    // 规则：由 Jekyll 服务端直接渲染，JS 无需处理

    // 快速信息每分钟更新
    setInterval(() => {
      if (quick) renderQuickInfo(quick, normalized, new Date());
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
