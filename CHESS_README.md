# KC Gaming Chess 2026 - 使用指南

## 🎯 快速开始

### 查看页面
- 主页（2026赛季）：访问 `/chess` 或 `/chess.html`
- 2025存档：访问 `/chess/2025`

### 本地测试
```bash
# 启动Jekyll开发服务器
bundle exec jekyll serve

# 访问
http://localhost:4000/chess
```

## 📝 日常维护

### 1. 添加新比赛

编辑 `_data/chess.yml`，在 `tournaments` 数组中添加：

```yaml
- id: "elite_2026_01"
  type: "elite"  # 或 "master"
  name: "Elite Jan. 26"
  date: "2026-01-31"
  time: "15:00"
  status: "upcoming"
  link: "https://lichess.org/tournament/xxxxx"  # 填写LiChess链接
  password: "KangChiaoInternationalSchool2026"
  results: []
```

### 2. 更新比赛结果

比赛结束后，修改对应的比赛条目：

```yaml
- id: "elite_2026_01"
  type: "elite"
  name: "Elite Jan. 26"
  date: "2026-01-31"
  time: "15:00"
  status: "completed"  # 改为completed
  link: "https://lichess.org/tournament/xxxxx"
  password: "KangChiaoInternationalSchool2026"
  results:  # 添加结果
    - position: "🥇 冠军"
      name: "选手姓名"
    - position: "🥈 亚军"
      name: "选手姓名"
    - position: "🥉 季军"
      name: "选手姓名"
```

**注意**：
- 积分会自动计算
- 排行榜会自动更新
- 姓名格式：`FirstName "Nickname" LastName` 或 `FirstName LastName`

### 3. 修改赛制规则

编辑 `_data/chess.yml` 中的 `rules` 部分，支持Markdown格式。

### 4. 调整积分系统

如需修改积分分配，编辑：
1. `_data/chess.yml` 中的 `competition_types` 下的 `prize_distribution`
2. `assets/js/chess-leaderboard.js` 中的 `calculatePoints` 方法

## 🎨 自定义样式

### 修改配色

编辑 `_layouts/chess_2026.html` 中的 CSS 变量：

```css
:root {
  --primary-gold: #ffd700;      /* 主色 */
  --dark-bg: #0a0e1a;           /* 背景色 */
  --card-bg: rgba(20, 25, 45, 0.95);  /* 卡片背景 */
  --elite-color: #ffd700;       /* Elite赛事颜色 */
  --master-color: #00d4ff;      /* Master赛事颜色 */
  --text-primary: #ffffff;      /* 主文本 */
  --text-secondary: #b8c5d1;    /* 次文本 */
}
```

### 修改布局

主要布局文件：
- `_layouts/chess_2026.html` - 2026主页面
- `_layouts/chess_2025.html` - 2025存档页面

### 添加动画

在 `_layouts/chess_2026.html` 的 `<style>` 部分添加新的 `@keyframes` 动画。

## 🔧 高级功能

### 创建新赛季（例如2027）

1. **创建数据文件**：`_data/chess_2027.yml`
```yaml
season:
  year: 2027
  name: "KC Gaming 2027"
  # ... 其他配置
```

2. **创建布局文件**：复制 `_layouts/chess_2026.html` 为 `chess_2027.html`

3. **创建页面入口**：`chess_2027.md`
```markdown
---
layout: chess_2027
title: KC Gaming Chess 2027
language: zh_CN
permalink: /chess/2027
---
```

4. **更新年份切换器**：在所有布局文件的 `switchYear` 函数中添加新年份。

### 导出积分数据

在浏览器控制台执行：

```javascript
// 获取当前排行榜数据
const leaderboard = chessLeaderboard.generateLeaderboard();
console.log(JSON.stringify(leaderboard, null, 2));

// 或导出为JSON文件
const dataStr = chessLeaderboard.exportToJSON();
const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
const exportFileDefaultName = 'leaderboard.json';
const linkElement = document.createElement('a');
linkElement.setAttribute('href', dataUri);
linkElement.setAttribute('download', exportFileDefaultName);
linkElement.click();
```

### 集成外部API

如需从LiChess API获取实时数据，可以修改 `assets/js/chess-leaderboard.js`：

```javascript
async function fetchTournamentResults(tournamentId) {
  const response = await fetch(`https://lichess.org/api/tournament/${tournamentId}/results`);
  const data = await response.json();
  return data;
}
```

## 📊 数据结构说明

### 比赛状态
- `upcoming` - 即将开始（显示报名按钮）
- `ongoing` - 进行中（显示报名按钮，带脉冲动画）
- `completed` - 已结束（显示比赛结果）

### 比赛类型
- `elite` - Elite Championship
- `master` - Master Championship

### 积分计算逻辑
```
Elite: 5, 15, 25, 35, 50, 70, 100 分
Master: 10, 30, 50, 70, 100, 150, 200 分
```

## 🐛 故障排除

### 问题1：排行榜不显示
**原因**：可能是没有已完成的比赛  
**解决**：确保至少有一场 `status: "completed"` 且有 `results` 的比赛

### 问题2：积分计算错误
**原因**：选手名称格式不统一  
**解决**：检查 `results` 中的 `name` 字段格式是否一致

### 问题3：样式显示异常
**原因**：可能是CSS冲突或浏览器缓存  
**解决**：清除浏览器缓存，检查CSS是否正确加载

### 问题4：年份切换不工作
**原因**：链接路径错误  
**解决**：检查 `switchYear` 函数中的路径是否正确

## 🔒 权限管理

### 比赛密码管理
- 所有比赛使用统一密码：`KangChiaoInternationalSchool2026`
- 如需修改，批量替换所有比赛的 `password` 字段

### 访问控制
- 当前系统为公开访问
- 如需添加访问控制，可以使用Jekyll的认证插件或服务器端认证

## 📱 移动端测试

### 测试清单
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)

### Chrome DevTools测试
1. 打开开发者工具 (F12)
2. 点击设备工具栏图标 (Ctrl+Shift+M)
3. 选择不同设备进行测试

## 🚀 性能优化

### 图片优化
如果添加图片，请使用：
- WebP格式（带fallback）
- 适当的压缩
- 懒加载（loading="lazy"）

### JavaScript优化
- 使用事件委托减少监听器数量
- 缓存DOM查询结果
- 避免在滚动事件中进行大量计算

### CSS优化
- 使用CSS变量减少重复
- 避免过深的选择器嵌套
- 使用transform进行动画（GPU加速）

## 📈 统计与分析

### 添加Google Analytics
在 `_includes/head.html` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 追踪事件
在关键操作中添加：

```javascript
// 报名按钮点击
gtag('event', 'tournament_register', {
  'event_category': 'engagement',
  'event_label': tournamentName
});

// 查看选手详情
gtag('event', 'player_detail_view', {
  'event_category': 'engagement',
  'event_label': playerName
});
```

## 📞 支持与反馈

### 技术支持
- 邮箱：info@kcisec.site
- GitHub Issues：[提交问题]

### 功能建议
欢迎提交功能建议和改进意见！

## 📄 许可证

本项目为KC Gaming内部使用，版权所有。

---

**最后更新**：2026-01-15  
**维护者**：KC Gaming Team
