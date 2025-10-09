# Contributing to KCISEC Navigator | 贡献指南

[English](#english) | [中文](#中文)

---

## English

Thank you for your interest in contributing to KCISEC Navigator! We welcome contributions from everyone.

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

### How Can I Contribute?

#### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)

#### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear and descriptive title**
- **Detailed description** of the suggested enhancement
- **Why this enhancement would be useful** to most users
- **Examples** of how it would work

#### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes locally**
   ```bash
   bundle exec jekyll serve
   ```
   - Check the site works correctly
   - Test on multiple browsers if possible
   - Verify responsive design on mobile

4. **Commit your changes**
   - Use clear and meaningful commit messages
   - Reference issues if applicable
   ```bash
   git commit -m "Add feature: description of feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Link to relevant issues
   - Add screenshots for UI changes

### Development Guidelines

#### Code Style

- **HTML/CSS**: Follow existing formatting and indentation
- **JavaScript**: Use consistent naming conventions
- **Markdown**: Use proper formatting and headings
- **Liquid Templates**: Keep logic simple and readable

#### File Organization

- Place CSS in `assets/css/`
- Place JavaScript in `assets/js/`
- Place images in `assets/images/`
- Use `_includes/` for reusable HTML components
- Use `_layouts/` for page templates
- Use `_data/` for data files (YAML/JSON)

#### Commit Messages

Good commit message examples:
- `Add meal ordering quick link to homepage`
- `Fix responsive menu on mobile devices`
- `Update README with installation instructions`
- `Refactor navigation component for better accessibility`

#### Testing

Before submitting a PR:
1. Build the site successfully: `bundle exec jekyll build`
2. Test locally: `bundle exec jekyll serve`
3. Check console for errors
4. Test on different screen sizes
5. Verify all links work

### Content Updates

#### Adding New Links

1. Edit `_data/links.yml` for Chinese homepage
2. Edit `en/index.md` for English homepage
3. Test that links work correctly
4. Ensure descriptions are clear and helpful

#### Updating Passwords Table

1. Edit `_data/passwords.yml` for Chinese homepage
2. Edit the table in `en/index.md` for English homepage
3. Verify information is accurate

#### Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add front matter with layout and language
3. Add navigation links if needed
4. Update the sitemap if applicable

### Bilingual Content

When adding or updating content:
- Update both Chinese and English versions
- Keep translations accurate and culturally appropriate
- Maintain consistent terminology across languages

### Getting Help

If you need help:
- Check existing documentation
- Search closed issues
- Ask questions in issue comments
- Contact maintainers: EricStone2009@163.com

### Recognition

Contributors will be:
- Listed in the README.md Contributors section
- Mentioned in release notes for significant contributions
- Acknowledged in commit history

Thank you for contributing! 🎉

---

## 中文

感谢您对KCISEC Navigator的贡献兴趣！我们欢迎所有人的贡献。

### 行为准则

- 保持尊重和包容
- 提供建设性反馈
- 关注对社区最有利的事项
- 对其他社区成员表示同理心

### 如何贡献？

#### 报告错误

在创建错误报告之前，请检查现有问题以避免重复。创建错误报告时，请包括：

- **清晰的标题和描述**
- **复现步骤**
- **预期行为**与实际行为
- **截图**（如适用）
- **环境详情**（浏览器、操作系统等）

#### 建议改进

改进建议通过GitHub Issues跟踪。创建改进建议时，请包括：

- **清晰描述性的标题**
- **详细的改进描述**
- **为什么这个改进对大多数用户有用**
- **如何工作的示例**

#### Pull Requests

1. **Fork仓库**并从`main`创建分支
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **进行更改**
   - 遵循现有代码风格
   - 为复杂逻辑添加注释
   - 必要时更新文档

3. **本地测试更改**
   ```bash
   bundle exec jekyll serve
   ```
   - 检查网站正常工作
   - 如可能在多个浏览器测试
   - 验证移动端响应式设计

4. **提交更改**
   - 使用清晰有意义的提交信息
   - 如适用引用相关issue
   ```bash
   git commit -m "添加功能：功能描述"
   ```

5. **推送到你的Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **创建Pull Request**
   - 提供清晰的更改描述
   - 链接到相关issues
   - 为UI更改添加截图

### 开发指南

#### 代码风格

- **HTML/CSS**：遵循现有格式和缩进
- **JavaScript**：使用一致的命名约定
- **Markdown**：使用正确的格式和标题
- **Liquid模板**：保持逻辑简单易读

#### 文件组织

- CSS文件放在 `assets/css/`
- JavaScript文件放在 `assets/js/`
- 图片放在 `assets/images/`
- 可复用HTML组件使用 `_includes/`
- 页面模板使用 `_layouts/`
- 数据文件（YAML/JSON）使用 `_data/`

#### 提交信息

良好的提交信息示例：
- `添加餐饮订购快捷链接到首页`
- `修复移动设备上的响应式菜单`
- `更新README安装说明`
- `重构导航组件以提高可访问性`

#### 测试

提交PR前：
1. 成功构建网站：`bundle exec jekyll build`
2. 本地测试：`bundle exec jekyll serve`
3. 检查控制台错误
4. 在不同屏幕尺寸测试
5. 验证所有链接工作正常

### 内容更新

#### 添加新链接

1. 编辑 `_data/links.yml` 用于中文首页
2. 编辑 `en/index.md` 用于英文首页
3. 测试链接正常工作
4. 确保描述清晰有用

#### 更新密码表

1. 编辑 `_data/passwords.yml` 用于中文首页
2. 编辑 `en/index.md` 中的表格用于英文首页
3. 验证信息准确

#### 添加新页面

1. 在适当目录创建新的 `.md` 文件
2. 添加包含布局和语言的front matter
3. 如需要添加导航链接
4. 如适用更新sitemap

### 双语内容

添加或更新内容时：
- 更新中英文两个版本
- 保持翻译准确且文化适当
- 跨语言保持一致的术语

### 获取帮助

如需帮助：
- 查看现有文档
- 搜索已关闭的issues
- 在issue评论中提问
- 联系维护者：EricStone2009@163.com

### 认可

贡献者将：
- 列在README.md的贡献者部分
- 在重要贡献的发布说明中提及
- 在提交历史中得到认可

感谢您的贡献！🎉
