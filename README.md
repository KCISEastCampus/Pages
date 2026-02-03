# KCISEC Navigator | 昆山康桥学校学生校园导航

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://kcisec.site)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.3.4-red?logo=jekyll)](https://jekyllrb.com/)

> 🎓 **A comprehensive student website for Kang Chiao School Kunshan Campus Middle School Department**
>
> **为昆山康桥学校初中部打造的综合学生网站**

[🌐 Visit Website / 访问网站](https://kcisec.site)

---

## 📖 About | 关于

**English:**

KCISEC Navigator is a student-focused website designed for the Middle School Department of Kang Chiao School Kunshan Campus. This website serves as a central hub for students to access essential school resources, links, and tools. It's optimized for morning homeroom announcements and student self-service access.

**中文:**

KCISEC Navigator 是为昆山康桥学校初中部设计的学生网站。本网站作为学生访问重要校园资源、链接和工具的中心平台，适合班主任在早自习向学生宣导，也方便学生自主查看。

---

## ✨ Features | 功能特点

- **📱 App Download Center** - Campus mobile application downloads
  - 校园移动应用下载中心
  
- **🔗 Quick Links** - Organized access to essential school services
  - 快速访问重要校园服务的链接
  
- **♟️ KC Gaming Chess** - International chess platform for students
  - 面向学生的国际象棋对战平台
  
- **🌐 A-Level Platform** - Dedicated A-Level curriculum platform
  - A-Level 课程专属平台
  
- **📧 Resource Hub** - Direct links to:
  - ManageBac
  - PowerSchool
  - School Email System
  - Meal Ordering System
  - Cloud Printing Services
  - And more...

---

## 🛠️ Technology Stack | 技术栈

- **Static Site Generator:** Jekyll 4.3.4
- **Hosting:** GitHub Pages
- **Theme:** Custom layout with responsive design
- **Languages:** HTML, CSS, JavaScript, Liquid templating
- **Plugins:** 
  - jekyll-redirect-from

---

## 🚀 Getting Started | 快速开始

### Prerequisites | 前置要求

- Ruby (version 2.5.0 or higher)
- RubyGems
- GCC and Make

### Local Development | 本地开发

1. **Clone the repository | 克隆仓库**
   ```bash
   git clone https://github.com/KCISEastCampus/Pages.git
   cd Pages
   ```

2. **Install dependencies | 安装依赖**
   ```bash
   bundle install
   ```

3. **Run the development server | 运行开发服务器**
   ```bash
   bundle exec jekyll serve
   ```

4. **Open your browser | 打开浏览器**
   
   Navigate to `http://localhost:4000`
   
   访问 `http://localhost:4000`

### Building for Production | 生产构建

```bash
bundle exec jekyll build
```

The site will be generated in the `_site` directory.

---

## 📁 Project Structure | 项目结构

```
Pages/
├── _data/              # Data files (links, chess config, etc.)
│   ├── links.yml       # Quick links configuration
│   ├── chess.yml       # Chess platform settings
│   └── lang/           # Language translations
├── _includes/          # Reusable components
├── _layouts/           # Page templates
│   ├── index.html      # Main layout
│   ├── chess.html      # Chess platform layout
│   └── 404.html        # Error page
├── assets/             # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Image files
├── app/                # App download pages
├── en/                 # English version pages
├── _config.yml         # Jekyll configuration
├── index.md            # Homepage (Chinese)
└── README.md           # This file
```

---

## 🌐 Deployment | 部署

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

**Live Site:** [https://kcisec.site](https://kcisec.site)

The deployment is configured through:
- GitHub Pages settings in the repository
- Custom domain: `kcisec.site` (configured via `CNAME` file)

---

## 🔧 Configuration | 配置

### Adding New Links | 添加新链接

Edit `_data/links.yml` to add or modify quick links:

```yaml
- title: Section Title
  description: Optional description
  buttons:
    - name: Link Name
      url: "https://example.com"
      icon: "fas fa-icon-name"
```

### Customizing the Homepage | 自定义首页

Edit `index.md` to modify the homepage content and featured resources.

---

## 👥 Contributing | 贡献

Contributions are welcome! This project is maintained by students and staff of Kang Chiao School Kunshan Campus.

### How to Contribute | 如何贡献

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License | 许可证

This project is maintained by Kang Chiao School Kunshan Campus. Please contact the school administration for usage permissions.

---

## 📧 Contact | 联系方式

For questions or support, please contact the Kang Chiao School Kunshan Campus IT department or open an issue in this repository.

**Website:** [https://kcisec.site](https://kcisec.site)

---

<div align="center">
  <p>Made with ❤️ by KCISEC Students</p>
  <p>由昆山康桥学生用心打造</p>
</div>
