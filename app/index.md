---
layout: index
language: zh_CN
---
<div class="app-container">
  <h1>App下载</h1>

  <div class="app-section">
    <h2>心辅之声交流平台</h2>
    <p>心辅之声交流平台现已发布，致力于为大家提供独特的渠道寻求帮助。无论是心理方面的困扰，又或是在校园里有疑难杂症，都可以在平台上寻求帮助。</p>
    <p class="note">(平台依旧属于测试阶段，如存在问题尽请谅解。)</p>
    <a href="https://coco.codemao.cn/editor/player/287912452?channel=h5" class="app-link" target="_blank">进入Web端</a>
  </div>

  <!-- <div class="app-section">
    <h2>KCISEC终端</h2>
    <p>KCISEC终端为我们最新研发的App，现阶段包括聊天和公报。未来会有更多功能接入。推荐所有受众下载！</p>
    <p class="note">(目前只支持A-Level G11学生注册。)</p>
    <a href="https://coco.codemao.cn/editor/player/254319992?channel=h5" class="app-link" target="_blank">进入Web端</a>
    <p class="ios-note">注：由于版权及代码不互通原因，iOS版本无本地App可下载。但是可以使用"Web端体验"链接复制进入Safari，打开菜单，点击"添加至主页面"使用。</p>
  </div> -->
</div>

<style>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-section {
  background: linear-gradient(180deg, rgba(20, 30, 53, 0.96), rgba(23, 37, 66, 0.92));
  border: 1px solid rgba(136, 214, 255, 0.18);
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.26);
  color: #c4d0ea;
}

.app-section h2 {
  color: #ecf2ff;
  border-bottom: 2px solid rgba(136, 214, 255, 0.45);
  padding-bottom: 10px;
  margin-top: 0;
}

.app-section .app-link,
.app-section .app-link:visited {
  display: inline-block;
  background: linear-gradient(135deg, #1b8fcc 0%, #6b44d4 100%);
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin: 15px 0;
}

.app-section .app-link:hover,
.app-section .app-link:focus-visible {
  background: linear-gradient(135deg, #2aa5e8 0%, #7d5ce0 100%);
  color: #ffffff;
  transform: translateY(-1px);
}

.note {
  color: #b9c9e8;
  font-style: italic;
}

.ios-note {
  background: rgba(255, 211, 76, 0.12);
  border: 1px solid rgba(255, 211, 76, 0.35);
  border-radius: 5px;
  padding: 10px;
  color: #ffe8a6;
  font-size: 0.9em;
}

html[data-bs-theme="light"] .app-section {
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  border: 1px solid rgba(24, 34, 51, 0.12);
  box-shadow: 0 4px 14px rgba(19, 32, 57, 0.08);
  color: #3f4d63;
}

html[data-bs-theme="light"] .app-section h2 {
  color: #1d2d45;
  border-bottom-color: rgba(31, 92, 182, 0.45);
}

html[data-bs-theme="light"] .app-section .app-link,
html[data-bs-theme="light"] .app-section .app-link:visited {
  background: linear-gradient(135deg, #1f5cb6 0%, #5a2fa3 100%);
  color: #ffffff;
}

html[data-bs-theme="light"] .app-section .app-link:hover,
html[data-bs-theme="light"] .app-section .app-link:focus-visible {
  background: linear-gradient(135deg, #2468cc 0%, #6b39bf 100%);
  color: #ffffff;
}

html[data-bs-theme="light"] .note {
  color: #5b6c84;
}

html[data-bs-theme="light"] .ios-note {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}
</style>