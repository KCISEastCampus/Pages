# Accessibility Quick Reference Guide

## For Developers Working on KCISEC Website

This guide provides quick reference for maintaining accessibility standards when adding or modifying features.

## Key Principles

### 1. Keyboard Navigation
**Rule:** Every interactive element must be keyboard accessible.

✅ **Good:**
```html
<button onclick="doSomething()">Click Me</button>
<a href="/page">Link</a>
```

❌ **Bad:**
```html
<div onclick="doSomething()">Click Me</div>  <!-- Not keyboard accessible -->
```

### 2. ARIA Labels
**Rule:** All interactive elements need accessible names.

✅ **Good:**
```html
<button aria-label="Close dialog">×</button>
<nav aria-label="Main navigation">...</nav>
```

❌ **Bad:**
```html
<button>×</button>  <!-- Screen readers will just say "button" -->
<nav>...</nav>  <!-- No label to distinguish from other navs -->
```

### 3. Images
**Rule:** All images must have alt text.

✅ **Good:**
```html
<img src="logo.svg" alt="KCISEC Campus Logo">
<img src="decorative.png" alt="">  <!-- Empty alt for decorative images -->
```

❌ **Bad:**
```html
<img src="logo.svg">  <!-- No alt text -->
```

### 4. Color Contrast
**Rule:** Maintain 4.5:1 contrast ratio for normal text, 3:1 for large text.

✅ **Good:**
```css
.text { color: #333; background: #fff; }  /* 12.63:1 ratio */
```

❌ **Bad:**
```css
.text { color: #999; background: #fff; }  /* 2.85:1 ratio - FAILS */
```

**Test your colors:** Use online contrast checkers or browser DevTools

### 5. Headings
**Rule:** Use semantic heading hierarchy (h1 → h2 → h3).

✅ **Good:**
```html
<h1>Main Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
```

❌ **Bad:**
```html
<h1>Main Title</h1>
  <h3>Section</h3>  <!-- Skipped h2 -->
```

### 6. Forms
**Rule:** All form inputs need labels.

✅ **Good:**
```html
<label for="email">Email:</label>
<input type="email" id="email" name="email">
```

❌ **Bad:**
```html
<input type="email" name="email" placeholder="Email">  <!-- Placeholder is not a label -->
```

### 7. Tables
**Rule:** Data tables need captions and proper structure.

✅ **Good:**
```html
<table>
  <caption>Student Services Login Information</caption>
  <thead>
    <tr><th>Service</th><th>Username</th></tr>
  </thead>
  <tbody>
    <tr><td>Email</td><td>student@kcisg.com</td></tr>
  </tbody>
</table>
```

## Custom Components

### Using `<buttonlink>` Elements

When adding `<buttonlink>` elements, they automatically get keyboard support. Just add descriptive text:

```html
<buttonlink href="https://example.com">Descriptive Link Text</buttonlink>
```

The JavaScript automatically adds:
- `role="button"`
- `tabindex="0"`
- Keyboard event handlers (Enter/Space)

### Adding New Sections

Always wrap content sections with proper landmarks:

```html
<section aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
  <nav aria-label="Section navigation">
    <!-- Navigation links -->
  </nav>
</section>
```

### Adding New Navigation

```html
<nav role="navigation" aria-label="Descriptive Label">
  <!-- Navigation content -->
</nav>
```

## Language Support

### Adding New Translatable Text

1. Add to both `_data/lang/en.yml` and `_data/lang/zh_CN.yml`:

```yaml
# en.yml
new_feature:
  title: "Feature Title"
  description: "Feature description"

# zh_CN.yml
new_feature:
  title: "功能标题"
  description: "功能描述"
```

2. Use in templates:

```liquid
{{ lang.new_feature.title }}
```

## Common ARIA Patterns

### Toggle Button (Show/Hide)
```html
<button 
  aria-expanded="false" 
  aria-controls="content-id"
  onclick="toggleContent()">
  Toggle
</button>
<div id="content-id" hidden>Content</div>
```

### Modal Dialog
```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
  <!-- Dialog content -->
</div>
```

### Navigation Menu
```html
<nav role="navigation" aria-label="Main">
  <ul role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

## Testing Checklist

Before submitting changes, verify:

- [ ] Tab through page - all interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] All images have alt text
- [ ] Color contrast meets requirements
- [ ] Heading hierarchy is logical
- [ ] ARIA labels are descriptive
- [ ] Forms have labels
- [ ] Tables have captions
- [ ] Page has a descriptive title
- [ ] Language is correctly specified

## Tools

### Browser DevTools
1. Chrome DevTools > Lighthouse > Accessibility audit
2. Firefox DevTools > Accessibility Inspector
3. Safari DevTools > Accessibility audit

### Online Tools
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE:** https://wave.webaim.org/
- **axe DevTools:** Browser extension

## Resources

- **WCAG Quick Reference:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN ARIA Guide:** https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- **W3C ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/

## Questions?

Contact: EricStone2009@163.com
