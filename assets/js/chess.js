/**
 * KC Gaming Chess - Main JavaScript
 * Author: KCISEC Team
 * Description: Chess tournament page functionality
 */

// Global variables
let globalMatches = [];
let updateInterval = null;

/**
 * Parse date string (supports multiple formats)
 * @param {string} dateStr - Date string to parse
 * @returns {Date} Parsed date object
 */
function parseMatchDate(dateStr) {
  // Try standard format: 2025-10-28 18:00
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try format: 10/28 6:00 PM
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    const month = parseInt(match[1]) - 1;
    const day = parseInt(match[2]);
    let hour = parseInt(match[3]);
    const minute = parseInt(match[4]);
    const meridiem = match[5];
    
    // Handle 12-hour format
    if (meridiem) {
      if (meridiem.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
      } else if (meridiem.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
    }
    
    const year = new Date().getFullYear();
    return new Date(year, month, day, hour, minute);
  }
  
  return new Date(dateStr);
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${months[date.getMonth()]}${date.getDate()}日 ${days[date.getDay()]}`;
}

/**
 * Format time range for display
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {string} Formatted time range string
 */
function formatTime(start, end) {
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

/**
 * Format quick time display (with weekday)
 * @param {Date} date - Date to format
 * @returns {string} Formatted time string
 */
function formatQuickTime(date) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const pad = n => n.toString().padStart(2, '0');
  return `${months[date.getMonth()]}${date.getDate()}日 ${days[date.getDay()]} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Get countdown text for upcoming match
 * @param {Date} targetDate - Target date
 * @returns {string|null} Countdown text or null if past
 */
function getCountdown(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff < 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}天后`;
  } else if (hours > 0) {
    return `${hours}小时后`;
  } else if (minutes > 0) {
    return `${minutes}分钟后`;
  } else {
    return '即将开始';
  }
}

/**
 * Populate quick info card with upcoming/ongoing matches
 */
function populateQuickInfo() {
  const quickInfoContent = document.getElementById('quickInfoContent');
  const quickInfoTitle = document.getElementById('quickInfoTitle');
  
  if (!quickInfoContent) {
    console.log('Quick info content element not found');
    return;
  }
  
  console.log('Populating quick info, globalMatches length:', globalMatches.length);
  
  try {
    const now = new Date();
    const relevantMatches = [];
    
    console.log('Current time:', now.toLocaleString('zh-CN'));
    
    // Filter matches
    if (globalMatches && globalMatches.length > 0) {
      globalMatches.forEach(match => {
        const startTime = parseMatchDate(match.startTime);
        const endTime = parseMatchDate(match.endTime);
        
        console.log(`Match: ${match.name}, Start: ${startTime.toLocaleString('zh-CN')}, End: ${endTime.toLocaleString('zh-CN')}`);
        
        const isOngoing = startTime <= now && now < endTime;
        const isUpcoming = startTime > now && (startTime - now) < (7 * 24 * 60 * 60 * 1000);
        
        console.log(`  isOngoing: ${isOngoing}, isUpcoming: ${isUpcoming}`);
        
        if (isOngoing || isUpcoming) {
          relevantMatches.push({
            name: match.name,
            startTime: startTime,
            endTime: endTime,
            match: match,
            isOngoing: isOngoing
          });
        }
      });
    } else {
      console.log('No matches available');
    }
    
    console.log('Relevant matches found:', relevantMatches.length);
    
    // Sort: ongoing first, then by start time
    relevantMatches.sort((a, b) => {
      if (a.isOngoing && !b.isOngoing) return -1;
      if (!a.isOngoing && b.isOngoing) return 1;
      return a.startTime - b.startTime;
    });
    
    const topMatches = relevantMatches.slice(0, 3);
    
    if (topMatches.length === 0) {
      quickInfoContent.innerHTML = '<div class="quick-no-matches">暂无即将开始的比赛</div>';
      if (quickInfoTitle) quickInfoTitle.textContent = '近期比赛';
      return;
    }
    
    // Group: ongoing vs upcoming
    const ongoingMatches = topMatches.filter(m => m.isOngoing);
    const upcomingMatches = topMatches.filter(m => !m.isOngoing);
    
    // Update title and icon
    const hasOngoing = ongoingMatches.length > 0;
    const quickInfoIcon = document.querySelector('.quick-info-icon');
    
    if (quickInfoTitle) {
      if (hasOngoing && upcomingMatches.length > 0) {
        quickInfoTitle.textContent = '近期比赛';
        if (quickInfoIcon) quickInfoIcon.textContent = '📅';
      } else if (hasOngoing) {
        quickInfoTitle.textContent = '正在进行';
        if (quickInfoIcon) quickInfoIcon.textContent = '🔴';
      } else {
        quickInfoTitle.textContent = '即将开始';
        if (quickInfoIcon) quickInfoIcon.textContent = '⚡';
      }
    }
    
    // Generate HTML
    let html = '';
    
    // Show ongoing matches first
    if (ongoingMatches.length > 0) {
      ongoingMatches.forEach((item) => {
        const timeStr = formatQuickTime(item.startTime);
        const link = item.match.link || '#';
        
        html += `
          <a href="${escapeHtml(link)}" target="_blank" class="quick-match-item ongoing" title="点击查看比赛详情" rel="noopener">
            <div class="quick-match-name">${escapeHtml(item.name)}</div>
            <div class="quick-match-time">
              ${escapeHtml(timeStr)}
              <span class="quick-match-badge" style="background: rgba(16, 185, 129, 0.25); color: #10b981; font-weight: 600;">● 进行中</span>
            </div>
          </a>
        `;
      });
      
      // Add divider if both types exist
      if (upcomingMatches.length > 0) {
        html += '<div class="quick-info-divider" data-label="即将开始"></div>';
      }
    }
    
    // Show upcoming matches
    upcomingMatches.forEach((item) => {
      const timeStr = formatQuickTime(item.startTime);
      const countdown = getCountdown(item.startTime);
      const link = item.match.link || '#';
      
      console.log(`Upcoming match: ${item.name}, countdown: ${countdown}, startTime: ${item.startTime}`);
      
      html += `
        <a href="${escapeHtml(link)}" target="_blank" class="quick-match-item upcoming" title="点击查看比赛详情" rel="noopener">
          <div class="quick-match-name">${escapeHtml(item.name)}</div>
          <div class="quick-match-time">
            ${escapeHtml(timeStr)}
            ${countdown ? `<span class="quick-match-badge">${escapeHtml(countdown)}</span>` : ''}
          </div>
        </a>
      `;
    });
    
    quickInfoContent.innerHTML = html;
    console.log('Quick info populated successfully');
  } catch (error) {
    console.error('Error populating quick info:', error);
    quickInfoContent.innerHTML = '<div class="quick-no-matches">加载失败</div>';
  }
}

/**
 * Copy password to clipboard
 */
function copyPassword() {
  const password = document.getElementById('passwordCode').textContent;
  const btn = document.querySelector('.copy-btn');
  
  if (!btn) return;
  
  navigator.clipboard.writeText(password).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '✓ 已复制';
    btn.classList.add('copied');
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
      btn.disabled = false;
    }, 3000);
  }).catch(err => {
    console.error('复制失败:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = password;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      const originalText = btn.textContent;
      btn.textContent = '✓ 已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 3000);
    } catch (e) {
      console.error('Fallback copy failed:', e);
    }
    document.body.removeChild(textArea);
  });
}

/**
 * Toggle rules section
 */
function toggleRules() {
  const content = document.getElementById('rulesContent');
  const icon = document.getElementById('rulesIcon');
  if (content && icon) {
    content.classList.toggle('expanded');
    icon.classList.toggle('expanded');
  }
}

/**
 * Create match card HTML
 * @param {Object} match - Match data
 * @param {boolean} isPast - Whether match is in the past
 * @param {Object} options - Additional options
 * @returns {string} HTML string
 */
function createMatchCard(match, isPast, options = {}) {
  const startDate = parseMatchDate(match.startTime);
  const endDate = parseMatchDate(match.endTime);
  const dateStr = formatDate(startDate);
  const timeStr = formatTime(startDate, endDate);
  const prizes = Array.isArray(match.prizes) ? match.prizes : [];
  const winners = Array.isArray(match.winners) ? match.winners : [];
  const { hasExtras = false, toggleId = '', seriesLabel = '', extrasCount = 0, seriesIcon = '' } = options;
  
  // Determine match type
  let matchType = 'type-ec';
  
  if (match.seriesId) {
    if (match.seriesId === 'champions') {
      matchType = 'type-champions';
    } else if (match.seriesId === 'pro') {
      matchType = 'type-pro';
    } else if (match.seriesId === 'ec') {
      matchType = 'type-ec';
    }
  } else {
    if (match.name.includes('Champions')) {
      matchType = 'type-champions';
    } else if (match.name.includes('PRO LEAGUE')) {
      matchType = 'type-pro';
    } else if (match.name.includes('E.C.')) {
      matchType = 'type-ec';
    }
  }
  
  if (match.special_type) {
    matchType = `type-${match.special_type}`;
  }
  
  let prizesHTML = '';
  if (prizes.length > 0) {
    const totalPrize = prizes.reduce((sum, p) => {
      const amount = parseInt(p.amount.replace(/[^0-9]/g, '')) || 0;
      return sum + amount;
    }, 0);
    
    prizesHTML = `
      <div class="prize-info">
        <div class="prize-badge">💰 总奖金: ￥${totalPrize}</div>
        ${prizes.map(p => `<div class="prize-badge">${escapeHtml(p.position)} ${escapeHtml(p.amount)}</div>`).join('')}
      </div>
    `;
  }

  let winnersHTML = '';
  if (winners.length > 0 && isPast) {
    winnersHTML = `
      <div class="winners">
        <div class="winners-title">🎯 获奖名单</div>
        ${winners.map(w => {
          let prizeAmount = '';
          const prize = prizes.find(p => p.position === w.position);
          if (prize) {
            prizeAmount = ` <span style="color: #ffd700;">(${escapeHtml(prize.amount)})</span>`;
          }
          return `<div class="winner-item">${escapeHtml(w.position)}: ${escapeHtml(w.name)}${prizeAmount}</div>`;
        }).join('')}
      </div>
    `;
  }

  let extrasHTML = '';
  if (hasExtras && toggleId) {
    extrasHTML = `
      <div class="card-extras-footer">
        <button class="card-toggle-link" data-target="${escapeHtml(toggleId)}" data-expanded="false" data-series-label="${escapeHtml(seriesLabel)}" data-extras-count="${extrasCount}">
          展开更多「${escapeHtml(seriesLabel)}」系列比赛 (${extrasCount})
        </button>
      </div>
    `;
  }

  let descriptionHTML = '';
  if (match.description) {
    let desc = match.description;
    desc = desc.split(' | ').join('</p><p>');
    desc = desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    desc = desc.replace(/\*(.*?)\*/g, '<em>$1</em>');
    desc = desc.replace(/^### (.*?)$/gm, '<h4 style="color: #ffd700; margin: 12px 0 8px 0; font-size: 1em;">$1</h4>');
    desc = desc.replace(/^- (.*?)$/gm, '<li>$1</li>');
    desc = desc.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    
    descriptionHTML = `<div class="match-description"><p>${desc}</p></div>`;
  }

  const buttonHTML = isPast 
    ? `<a href="${escapeHtml(match.link)}" target="_blank" rel="noopener" class="match-btn secondary">查看结果</a>`
    : `<a href="${escapeHtml(match.link)}" target="_blank" rel="noopener" class="match-btn primary">立即报名</a>`;

  return `
    <div class="match-item">
      <div class="match-marker"></div>
      <div class="match-card ${matchType}">
        ${seriesIcon ? `<div class="card-icon">${escapeHtml(seriesIcon)}</div>` : ''}
        <div class="match-header">
          <div class="match-title">
            <h3>${escapeHtml(match.name)}</h3>
            <div class="match-time">${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</div>
          </div>
          <div class="match-action">
            ${buttonHTML}
          </div>
        </div>
        ${descriptionHTML}
        ${prizesHTML}
        ${winnersHTML}
        ${extrasHTML}
      </div>
    </div>
  `;
}

/**
 * Create past match card HTML
 * @param {Object} match - Match data
 * @returns {string} HTML string
 */
function createPastCard(match) {
  const startDate = parseMatchDate(match.startTime);
  const endDate = parseMatchDate(match.endTime);
  const dateStr = formatDate(startDate);
  const timeStr = formatTime(startDate, endDate);
  const winners = Array.isArray(match.winners) ? match.winners : [];
  const w1 = winners.find(w => /🥇|第一/.test(w.position || ''));
  const w2 = winners.find(w => /🥈|第二/.test(w.position || ''));
  const w3 = winners.find(w => /🥉|第三/.test(w.position || ''));
  const link = match.link || '#';
  
  return `
    <div class="past-card">
      <div class="pc-title">${escapeHtml(match.name)}</div>
      <div class="pc-time">${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</div>
      <div class="pc-winners">
        ${w1 ? `<span class="badge-win">🥇 ${escapeHtml(w1.name)}</span>` : `<span class="badge-3">暂无获奖信息</span>`}
        ${w2 ? `<span class="badge-2">🥈 ${escapeHtml(w2.name)}</span>` : ''}
        ${w3 ? `<span class="badge-3">🥉 ${escapeHtml(w3.name)}</span>` : ''}
      </div>
      <a class="pc-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">查看结果 →</a>
    </div>
  `;
}

/**
 * Get series key from match data
 * @param {Object} match - Match data
 * @returns {string} Series key
 */
function getSeriesKey(match) {
  if (match.seriesId) return match.seriesId;
  if (match.special_type) {
    if (match.special_type === 'champions') return 'champions';
  }
  const name = match.name || '';
  if (/E\.C\./i.test(name)) return 'ec';
  if (/PRO LEAGUE/i.test(name)) return 'pro';
  if (/Champions/i.test(name)) return 'champions';
  return 'other';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Initialize page
 */
function initializePage() {
  console.log('Initializing chess page...');
  
  // Ensure rules start collapsed
  const rulesContent = document.getElementById('rulesContent');
  const rulesIcon = document.getElementById('rulesIcon');
  
  if (rulesContent) rulesContent.classList.remove('expanded');
  if (rulesIcon) rulesIcon.classList.remove('expanded');
  
  // Populate quick info
  populateQuickInfo();
  
  // Update quick info every minute
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    populateQuickInfo();
  }, 60000);
  
  console.log('Page initialization complete');
}

/**
 * Setup event delegation for toggle buttons
 */
function setupEventDelegation() {
  // Event delegation for series toggle buttons
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Handle series toggle buttons
    if (target.classList.contains('series-toggle') || target.classList.contains('card-toggle-link')) {
      e.preventDefault();
      const targetId = target.getAttribute('data-target');
      const container = document.getElementById(targetId);
      
      if (!container) return;
      
      const expanded = target.getAttribute('data-expanded') === 'true';
      
      if (expanded) {
        container.classList.add('hidden');
      } else {
        container.classList.remove('hidden');
      }
      
      target.setAttribute('data-expanded', expanded ? 'false' : 'true');
      
      const seriesLabel = target.getAttribute('data-series-label') || '';
      const extrasCount = target.getAttribute('data-extras-count') || '';
      
      if (expanded) {
        target.textContent = `展开更多「${seriesLabel}」系列比赛 (${extrasCount})`;
      } else {
        target.textContent = `收起「${seriesLabel}」比赛`;
      }
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventDelegation();
  });
} else {
  initializePage();
  setupEventDelegation();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

// Export functions for external use
if (typeof window !== 'undefined') {
  window.chessApp = {
    parseMatchDate,
    formatDate,
    formatTime,
    populateQuickInfo,
    copyPassword,
    toggleRules,
    createMatchCard,
    createPastCard,
    getSeriesKey,
    globalMatches
  };
}
