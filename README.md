# KCISEC Navigator | 昆山康桥学校导航站

## 包括了什么功能？
班级公报和Homeroom United，未来会有更多功能。

## Accessibility 可访问性

This website follows WCAG 2.1 Level AA accessibility standards. For details, see:
- [Accessibility Audit Report](ACCESSIBILITY.md) - Comprehensive audit findings and compliance details
- [Developer Guide](docs/accessibility-guide.md) - Quick reference for maintaining accessibility

本网站遵循 WCAG 2.1 AA 级可访问性标准。详情请参阅：
- [可访问性审计报告](ACCESSIBILITY.md) - 全面的审计结果和合规性详情
- [开发者指南](docs/accessibility-guide.md) - 维护可访问性的快速参考
[English](#english) | [中文](#中文)

---

## English

### About

KCISEC Navigator is a convenient link station and information hub for Kunshan Kang Chiao International School (KCISEC). This website provides students and teachers with quick access to frequently used school services, including meal ordering, student dashboard, ManageBac, PowerSchool, and more.

### Features

- **Quick Links**: Easy access to frequently used school services
  - Student Dashboard
  - Meal Ordering and Querying
  - ManageBac
  - PowerSchool
  - School Email
  - Printing Services (on-campus only)
- **Default Passwords Reference**: Common login credentials for school services
- **Bilingual Support**: Available in both English and Chinese
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and intuitive interface with smooth animations

### Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby** (version 3.0 or higher)
  - Check version: `ruby --version`
  - Install from: https://www.ruby-lang.org/en/downloads/
- **Bundler**
  - Install: `gem install bundler`
- **Git** (for cloning and version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KCISEastCampus/Pages.git
   cd Pages
   ```

2. **Install dependencies**
   ```bash
   bundle config set --local path 'vendor/bundle'
   bundle install
   ```

### Usage

#### Running the Development Server

To run the website locally:

```bash
bundle exec jekyll serve
```

Or with live reload:

```bash
bundle exec jekyll serve --livereload
```

The website will be available at `http://localhost:4000`

**Note**: If you get a "command not found" error, you may need to add the bundler bin directory to your PATH:
```bash
export PATH="$HOME/.local/share/gem/ruby/$(ruby -e 'puts RUBY_VERSION')/bin:$PATH"
```

#### Building for Production

To build the static site:

```bash
bundle exec jekyll build
```

The built site will be in the `_site` directory.

### Project Structure

```
.
├── _config.yml          # Jekyll configuration
├── _data/               # Data files (links, passwords)
├── _includes/           # Reusable HTML components
├── _layouts/            # Page layouts
├── assets/              # Static assets (CSS, JS, images)
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Image assets
├── en/                  # English pages
├── index.md             # Chinese homepage
└── README.md           # This file
```

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

#### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test locally: `bundle exec jekyll serve`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Technology Stack

- **Jekyll 4.3.4**: Static site generator
- **Liquid**: Templating language
- **Markdown**: Content authoring
- **HTML/CSS/JavaScript**: Front-end
- **GitHub Pages**: Hosting (optional)

### License

Unless otherwise stated, the copyright of the school emblem belongs to Kunshan Kang Chiao School. All other assets belong to the KCISEastCampus organization.

### Contributors

- [EricStoneChina](https://github.com/EricStoneChina)
- [Idad Wind](https://github.com/idadwind1)

### Feedback

If you have any questions or suggestions, please:
- Open an issue on GitHub
- Contact us via email: EricStone2009@163.com

---

## 中文

### 关于

KCISEC Navigator（昆山康桥学校导航站）是为昆山康桥学校（KCISEC）师生打造的便民链接站和信息中心。该网站为学生和教师提供常用学校服务的快速访问入口，包括订餐系统、学生仪表板、ManageBac、PowerSchool等。

### 功能特色

- **便捷链接**：快速访问常用学校服务
  - 学生仪表板
  - 订餐与查餐系统
  - ManageBac
  - PowerSchool
  - 学校邮箱
  - 打印服务（仅校园网可用）
- **默认密码参考**：学校服务的常用登录凭据
- **双语支持**：提供中英文双语界面
- **响应式设计**：支持桌面和移动设备
- **现代化界面**：简洁直观的用户界面，带有流畅动画

### 前置要求

开始之前，请确保已安装以下软件：

- **Ruby**（3.0或更高版本）
  - 检查版本：`ruby --version`
  - 下载地址：https://www.ruby-lang.org/zh_cn/downloads/
- **Bundler**
  - 安装命令：`gem install bundler`
- **Git**（用于克隆和版本控制）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/KCISEastCampus/Pages.git
   cd Pages
   ```

2. **安装依赖**
   ```bash
   bundle config set --local path 'vendor/bundle'
   bundle install
   ```

### 使用方法

#### 运行开发服务器

本地运行网站：

```bash
bundle exec jekyll serve
```

或启用实时重载：

```bash
bundle exec jekyll serve --livereload
```

网站将在 `http://localhost:4000` 上运行

**注意**：如果遇到 "command not found" 错误，您可能需要将bundler的bin目录添加到PATH：
```bash
export PATH="$HOME/.local/share/gem/ruby/$(ruby -e 'puts RUBY_VERSION')/bin:$PATH"
```

#### 构建生产版本

构建静态网站：

```bash
bundle exec jekyll build
```

构建的网站将位于 `_site` 目录中。

### 项目结构

```
.
├── _config.yml          # Jekyll配置文件
├── _data/               # 数据文件（链接、密码等）
├── _includes/           # 可复用HTML组件
├── _layouts/            # 页面布局
├── assets/              # 静态资源（CSS、JS、图片）
│   ├── css/            # 样式表
│   ├── js/             # JavaScript文件
│   └── images/         # 图片资源
├── en/                  # 英文页面
├── index.md             # 中文首页
└── README.md           # 本文件
```

### 贡献指南

我们欢迎贡献！详细信息请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

#### 贡献者快速开始

1. Fork本仓库
2. 创建功能分支：`git checkout -b feature/你的功能名称`
3. 进行更改
4. 本地测试：`bundle exec jekyll serve`
5. 提交更改：`git commit -m "添加你的功能"`
6. 推送到你的Fork：`git push origin feature/你的功能名称`
7. 创建Pull Request

### 技术栈

- **Jekyll 4.3.4**：静态网站生成器
- **Liquid**：模板语言
- **Markdown**：内容编写
- **HTML/CSS/JavaScript**：前端技术
- **GitHub Pages**：托管（可选）

### 版权声明

除另有声明外，校徽版权归昆山康桥学校所有。其他所有资源归KCISEastCampus组织所有。

### 贡献者

- [EricStoneChina](https://github.com/EricStoneChina)
- [Idad Wind](https://github.com/idadwind1)

### 反馈

如有任何问题或建议，请：
- 在GitHub上提交Issue
- 通过邮件联系我们：EricStone2009@163.com
