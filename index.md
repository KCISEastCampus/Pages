---
layout: index
language: zh_CN
---

# 便民链接

{% for section in site.data.links %}
<section aria-labelledby="section-{{ forloop.index }}">
## {{ section.title }}
{: #section-{{ forloop.index }} }
{% if section.description %}
<p>{{ section.description }}</p>
{% endif %}
<nav aria-label="{{ section.title }}">
<div class="button-grid">
{% for button in section.buttons %}
<a href="{{ button.url }}" class="button-link" aria-label="{{ button.name }}">
  <i class="{{ button.icon }}" aria-hidden="true"></i>
  <span>{{ button.name }}</span>
</a>
{% endfor %}
</div>
</nav>
</section>
{% endfor %}

# 网站默认密码

<table>
  <caption>校园服务账号默认用户名和密码</caption>
  <thead>
    <tr>
      {% for header in site.data.passwords.headers %}
      <th>{{ header }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    {% for row in site.data.passwords.rows %}
    <tr>
      {% for cell in row %}
      <td>{{ cell }}</td>
      {% endfor %}
    </tr>
    {% endfor %}
  </tbody>
</table>

# 关于

## 这是什么？

这个网站是昆山康桥学校的一个便民链接站，旨在为学校师生提供方便快捷的链接导航。

## 我们是谁？

[我们的GitHub官网](https://www.github.com/KCISEastCampus)

<!-- 
网站维护：
- EricStoneChina [查看他的GitHub主页](https://github.com/EricStoneChina)

网站协作记录：
[点击查询](https://github.com/KCISEastCampus/Pages/commits/main/)

你也可以试着[反馈](mailto:EricStone2009@163.com)一些问题，我们会尽快回复。

校徽版权归昆山康桥学校所有，并授权昆山康桥学校使用OxfordAQA授权中心Logo。除另外声明外，其余内容版权均归本组织所有。
-->
<!-- [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fkcisec.site&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=%E7%BD%91%E7%AB%99%E8%AE%BF%E9%97%AE%E8%80%85%28%E4%BB%8A%E6%97%A5%2F%E6%80%BB%E5%85%B1%29&edge_flat=false)](javascript:void(0)) -->
