---
layout: index
language: zh_CN
---

## 校园精选资源

<div class="featured-resources">
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

### 密码说明

目前大部分校内网站已改成使用学生本人证件号（如身份证、护照、台胞证）登录，仍有少数网站默认密码采用你入学时通用的密码。其中 ManageBac 可能为 `学号_kcis`，其他系统可能是 `Ks@生日` 或 `Kskq%生日`。如果使用证件号无法登录，建议试试上述密码。
