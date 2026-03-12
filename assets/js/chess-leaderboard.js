/**
 * KC Gaming Chess - 积分计算系统
 * 自动计算选手积分并生成排行榜
 */

class ChessLeaderboard {
  constructor() {
    this.players = new Map();
    this.tournaments = [];
  }

  /**
   * 根据比赛类型和排名计算积分
   */
  calculatePoints(tournamentType, position) {
    const pointsTable = {
      elite: {
        1: 100,   // 冠军
        2: 70,    // 亚军
        3: 50,    // 季军
        4: 35,    // 第4名
        5: 25,    // 第5名
        'default': 15,  // 第6-10名
        'participation': 5  // 参赛奖
      },
      master: {
        1: 200,
        2: 150,
        3: 100,
        4: 70,
        5: 50,
        'default': 30,
        'participation': 10
      }
    };

    const typePoints = pointsTable[tournamentType] || pointsTable.elite;
    
    if (position <= 5) {
      return typePoints[position];
    } else if (position <= 10) {
      return typePoints['default'];
    } else {
      return typePoints['participation'];
    }
  }

  /**
   * 从比赛结果中提取选手名称
   * 处理格式如 "Jimmy "Hurr1can333333" Yu"
   */
  extractPlayerName(fullName) {
    // 移除位置前缀（如 "🥇 第一名："）
    let name = fullName.replace(/^[🥇🥈🥉]\s*.*?[:：]\s*/, '');
    
    // 提取主要名字（去除昵称）
    const match = name.match(/^([A-Za-z]+)(?:\s+".*?")?\s+([A-Za-z]+)$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    
    return name.trim();
  }

  /**
   * 添加比赛结果
   */
  addTournament(tournament) {
    if (tournament.status !== 'completed' || !tournament.results || tournament.results.length === 0) {
      return;
    }

    this.tournaments.push(tournament);

    tournament.results.forEach((result, index) => {
      const position = index + 1;
      const playerName = this.extractPlayerName(result.name);
      const points = this.calculatePoints(tournament.type, position);

      if (!this.players.has(playerName)) {
        this.players.set(playerName, {
          name: playerName,
          totalPoints: 0,
          tournamentsPlayed: 0,
          eliteWins: 0,
          masterWins: 0,
          firstPlace: 0,
          secondPlace: 0,
          thirdPlace: 0,
          history: []
        });
      }

      const player = this.players.get(playerName);
      player.totalPoints += points;
      player.tournamentsPlayed++;

      // 记录胜场
      if (position === 1) {
        player.firstPlace++;
        if (tournament.type === 'elite') player.eliteWins++;
        if (tournament.type === 'master') player.masterWins++;
      } else if (position === 2) {
        player.secondPlace++;
      } else if (position === 3) {
        player.thirdPlace++;
      }

      // 添加到历史记录
      player.history.push({
        tournament: tournament.name,
        date: tournament.date,
        type: tournament.type,
        position: position,
        points: points
      });
    });
  }

  /**
   * 生成排行榜
   */
  generateLeaderboard() {
    const sortedPlayers = Array.from(this.players.values())
      .sort((a, b) => {
        // 首先按总积分排序
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        // 积分相同时，比较冠军数
        if (b.firstPlace !== a.firstPlace) {
          return b.firstPlace - a.firstPlace;
        }
        // 冠军数相同时，比较亚军数
        if (b.secondPlace !== a.secondPlace) {
          return b.secondPlace - a.secondPlace;
        }
        // 亚军数相同时，比较季军数
        return b.thirdPlace - a.thirdPlace;
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));

    return sortedPlayers;
  }

  /**
   * 检查成就
   */
  checkAchievements(player) {
    const achievements = [];

    // Grand Slam - 赢得所有4场Master赛事
    if (player.masterWins >= 4) {
      achievements.push({
        name: 'Grand Slam',
        description: '赢得所有季度Master赛事',
        icon: '🏆'
      });
    }

    // Elite Master - 赢得6场或以上Elite赛事
    if (player.eliteWins >= 6) {
      achievements.push({
        name: 'Elite Master',
        description: '赢得6场或以上Elite赛事',
        icon: '👑'
      });
    }

    // Consistency Award - 参加全年所有16场比赛
    if (player.tournamentsPlayed >= 16) {
      achievements.push({
        name: 'Consistency Award',
        description: '参加全年所有比赛',
        icon: '🎯'
      });
    }

    // Perfect Score - 所有参赛比赛都是冠军
    if (player.firstPlace === player.tournamentsPlayed && player.tournamentsPlayed >= 5) {
      achievements.push({
        name: 'Perfect Record',
        description: '全胜战绩',
        icon: '⭐'
      });
    }

    return achievements;
  }

  /**
   * 导出为JSON（用于保存到数据文件）
   */
  exportToJSON() {
    const leaderboard = this.generateLeaderboard();
    return JSON.stringify(leaderboard, null, 2);
  }

  /**
   * 渲染排行榜HTML
   */
  renderLeaderboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const leaderboard = this.generateLeaderboard();
    
    if (leaderboard.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <div style="font-size: 4em; margin-bottom: 20px;">🏁</div>
          <div style="font-size: 1.2em;">赛季即将开始</div>
          <div style="margin-top: 10px;">参加比赛后即可在此查看排名</div>
        </div>
      `;
      return;
    }

    let html = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>选手</th>
            <th>参赛次数</th>
            <th>Elite胜场</th>
            <th>Master胜场</th>
            <th>总积分</th>
          </tr>
        </thead>
        <tbody>
    `;

    leaderboard.forEach(player => {
      const rankIcon = player.rank === 1 ? '🥇' : 
                      player.rank === 2 ? '🥈' : 
                      player.rank === 3 ? '🥉' : player.rank;
      
      const rankClass = `rank-${player.rank <= 3 ? player.rank : ''}`;
      
      html += `
        <tr onclick="showPlayerDetails('${player.name}')">
          <td class="rank-cell ${rankClass}">${rankIcon}</td>
          <td class="player-name">${player.name}</td>
          <td>${player.tournamentsPlayed}</td>
          <td>${player.eliteWins}</td>
          <td>${player.masterWins}</td>
          <td class="points">${player.totalPoints}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }
}

// 全局实例
let chessLeaderboard = null;

/**
 * 初始化排行榜系统
 */
function initializeLeaderboard(tournaments) {
  chessLeaderboard = new ChessLeaderboard();
  
  tournaments.forEach(tournament => {
    chessLeaderboard.addTournament(tournament);
  });

  chessLeaderboard.renderLeaderboard('leaderboard-container');
}

/**
 * 显示选手详细信息（弹窗）
 */
function showPlayerDetails(playerName) {
  if (!chessLeaderboard) return;

  const player = chessLeaderboard.players.get(playerName);
  if (!player) return;

  const achievements = chessLeaderboard.checkAchievements(player);
  
  let achievementsHTML = '';
  if (achievements.length > 0) {
    achievementsHTML = `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <div style="font-weight: 600; margin-bottom: 10px; color: var(--primary-gold);">🏅 成就</div>
        ${achievements.map(a => `
          <div style="margin: 10px 0; padding: 10px; background: rgba(255,215,0,0.1); border-radius: 8px;">
            <span style="font-size: 1.5em;">${a.icon}</span>
            <strong style="margin-left: 10px;">${a.name}</strong>
            <div style="color: var(--text-secondary); font-size: 0.9em; margin-left: 40px;">
              ${a.description}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  let historyHTML = player.history
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(h => `
      <div style="margin: 8px 0; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span>${h.tournament}</span>
          <span style="color: var(--primary-gold);">+${h.points}分</span>
        </div>
        <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 5px;">
          ${h.date} · 第${h.position}名
        </div>
      </div>
    `).join('');

  const modalHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); 
                display: flex; align-items: center; justify-content: center; z-index: 1000;"
         onclick="this.remove()">
      <div style="background: var(--card-bg); border-radius: 20px; padding: 40px; max-width: 600px; 
                  width: 90%; max-height: 80vh; overflow-y: auto; border: 2px solid var(--primary-gold);"
           onclick="event.stopPropagation()">
        <h2 style="color: var(--primary-gold); margin-bottom: 20px;">
          ${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : ''}
          ${player.name}
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
          <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
            <div style="font-size: 2em; color: var(--primary-gold);">${player.totalPoints}</div>
            <div style="color: var(--text-secondary); font-size: 0.9em;">总积分</div>
          </div>
          <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
            <div style="font-size: 2em; color: var(--text-primary);">${player.tournamentsPlayed}</div>
            <div style="color: var(--text-secondary); font-size: 0.9em;">参赛次数</div>
          </div>
          <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
            <div style="font-size: 2em; color: #ffd700;">${player.firstPlace}</div>
            <div style="color: var(--text-secondary); font-size: 0.9em;">冠军</div>
          </div>
          <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
            <div style="font-size: 2em; color: #c0c0c0;">${player.secondPlace}</div>
            <div style="color: var(--text-secondary); font-size: 0.9em;">亚军</div>
          </div>
        </div>

        ${achievementsHTML}
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-weight: 600; margin-bottom: 15px; color: var(--primary-gold);">📊 参赛记录</div>
          ${historyHTML}
        </div>
        
        <button onclick="this.closest('[onclick]').remove()" 
                style="margin-top: 20px; padding: 12px 30px; background: var(--primary-gold); 
                       color: #0a0e1a; border: none; border-radius: 10px; font-weight: 600; 
                       cursor: pointer; width: 100%;">
          关闭
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.ChessLeaderboard = ChessLeaderboard;
  window.initializeLeaderboard = initializeLeaderboard;
  window.showPlayerDetails = showPlayerDetails;
}
