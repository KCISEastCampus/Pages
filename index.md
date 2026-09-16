---
layout: index
language: zh_CN
---

## 校园精选资源

<div class="featured-resources">
  <a href="/pingpong/" class="featured-card">
    <div class="featured-icon"><i class="fas fa-table-tennis-paddle-ball"></i></div>
    <div class="featured-title">ALPL 乒乓球联赛</div>
    <div class="featured-desc">Ping-Pong A-level Pro League</div>
  </a>
  <a href="/app/" class="featured-card" target="_blank" rel="noopener noreferrer">
    <div class="featured-icon"><i class="fas fa-download"></i></div>
    <div class="featured-title">APP下载</div>
    <div class="featured-desc">校园移动应用中心</div>
  </a>
  <a href="https://academic.kcisec.site/" class="featured-card" target="_blank" rel="noopener noreferrer">
    <div class="featured-icon"><i class="fas fa-school"></i></div>
    <div class="featured-title">A-Level主页</div>
    <div class="featured-desc">A-Level课程平台</div>
  </a>
  <a href="/chess" class="featured-card">
    <div class="featured-icon"><i class="fas fa-chess"></i></div>
    <div class="featured-title">KC Gaming Chess</div>
    <div class="featured-desc">国际象棋对战平台</div>
  </a>
  <a href="/werewolf" class="featured-card">
    <div class="featured-icon"><i class="fas fa-user-secret"></i></div>
    <div class="featured-title">狼人杀中控台</div>
    <div class="featured-desc">主持人对局助手</div>
  </a>
</div>

---

## 常用链接

{% for section in site.data.links %}
### {{ section.title }}
{% if section.description %}
<p>{{ section.description }}</p>
{% endif %}
<div class="button-grid">
{% for button in section.buttons %}
<a href="{{ button.url }}" class="button-link" target="_blank" rel="noopener noreferrer">
  <i class="{{ button.icon }}"></i>
  <span>{{ button.name }}</span>
</a>
{% endfor %}
</div>
{% endfor %}
