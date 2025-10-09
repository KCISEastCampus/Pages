# Accessibility Testing Checklist

Use this checklist to verify accessibility features are working correctly after deployment.

## Automated Testing

### Browser DevTools
- [ ] Run Chrome Lighthouse accessibility audit (should score 95+)
- [ ] Run Firefox Accessibility Inspector
- [ ] Check for any console errors related to ARIA

### Online Tools
- [ ] WAVE: https://wave.webaim.org/
  - Test homepage: https://kcisec.site
  - Test English page: https://kcisec.site/en/
- [ ] axe DevTools browser extension
- [ ] W3C HTML Validator: https://validator.w3.org/

## Manual Keyboard Testing

### Navigation
- [ ] Tab through entire homepage
  - Should focus on: Skip link → Logo → Hamburger → UI Toggle → Language Switch → Hero Cards → Service Links → Footer Links
- [ ] Press Tab on first element - skip link should appear
- [ ] Press Enter on skip link - should jump to main content
- [ ] Verify focus indicators are visible on all elements

### Hero Section
- [ ] Tab to hero toggle button
- [ ] Press Enter or Space - hero should collapse
- [ ] Press Enter or Space again - hero should expand
- [ ] Verify aria-expanded updates ("true" when expanded, "false" when collapsed)

### Hamburger Menu (Mobile/Narrow Screen)
- [ ] Resize browser to < 850px width
- [ ] Tab to hamburger menu button
- [ ] Press Enter or Space - menu should open
- [ ] Verify aria-expanded="true" when open
- [ ] Press Enter or Space again - menu should close
- [ ] Verify aria-expanded="false" when closed

### Button Links
- [ ] Tab to any `<buttonlink>` element
- [ ] Press Enter - link should open in new tab
- [ ] Press Space - link should open in new tab
- [ ] Verify role="button" is present

### Language Switch
- [ ] Tab to language switch button
- [ ] Press Enter - should switch language
- [ ] Verify page reloads with correct language

## Screen Reader Testing

### NVDA (Windows - Free)
1. Download from https://www.nvaccess.org/download/
2. Install and start NVDA
3. Navigate to homepage
4. Test:
   - [ ] Page title announced correctly
   - [ ] Skip link announced and functional
   - [ ] All landmarks announced (navigation, main, contentinfo)
   - [ ] Hero cards navigation announced
   - [ ] Button links announce as buttons
   - [ ] Table caption read before table content
   - [ ] All images have alt text announced
   - [ ] Language switch button announced correctly

### VoiceOver (macOS/iOS - Built-in)
**macOS:** Cmd + F5 to enable
**iOS:** Settings > Accessibility > VoiceOver

1. Enable VoiceOver
2. Navigate to homepage
3. Test:
   - [ ] Use rotor (Cmd+U on Mac) to navigate by headings
   - [ ] Navigate by landmarks (Ctrl+Option+U → Landmarks on Mac)
   - [ ] Verify all interactive elements announce correctly
   - [ ] Test with Safari and Chrome

### JAWS (Windows - Commercial)
If available, test with JAWS:
- [ ] Navigate by headings (H key)
- [ ] Navigate by landmarks (R key for regions)
- [ ] Navigate by buttons (B key)
- [ ] Navigate by links (K key)

## Visual Testing

### Color Contrast
- [ ] Footer links visible against dark background
- [ ] Language switch button text visible (black on gold)
- [ ] All text meets 4.5:1 ratio (use browser DevTools)

### Focus Indicators
- [ ] All interactive elements show blue outline when focused
- [ ] Focus outline is 3px thick
- [ ] Focus outline is visible on all background colors

### Zoom Testing
- [ ] Zoom to 200% (Ctrl/Cmd + "+")
- [ ] Verify all content remains readable
- [ ] No horizontal scrolling required (vertical OK)
- [ ] Interactive elements remain accessible

### High Contrast Mode
**Windows:** Settings > Ease of Access > High Contrast
**macOS:** System Preferences > Accessibility > Display > Increase Contrast

- [ ] Enable high contrast mode
- [ ] Verify all content remains visible
- [ ] Focus indicators still visible

## Content Testing

### Tables
- [ ] Chinese page table has caption
- [ ] English page table has caption
- [ ] Screen reader reads caption before content
- [ ] Table headers announced correctly

### Headings
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skips)
- [ ] Screen reader can navigate by headings
- [ ] Each page has exactly one h1

### Links
- [ ] All links have descriptive text (not just "click here")
- [ ] External links announce they open in new window
- [ ] Link purpose clear from link text alone

### Images
- [ ] School logo has descriptive alt text
- [ ] Visitor counter has alt text
- [ ] Decorative icons marked with aria-hidden="true"

## Mobile Testing

### Touch Navigation
- [ ] All interactive elements have touch targets ≥ 44×44 pixels
- [ ] No elements too close together
- [ ] Pinch to zoom works

### Mobile Screen Readers
**iOS VoiceOver:**
- [ ] Two-finger scroll to read content
- [ ] Single tap to hear element
- [ ] Double tap to activate

**Android TalkBack:**
- [ ] Swipe right to move forward
- [ ] Swipe left to move backward
- [ ] Double tap to activate

## Browser Testing

Test in multiple browsers:
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

## Issues to Report

If you find any issues, report them at:
https://github.com/KCISEastCampus/Pages/issues

Include:
1. What you were testing
2. What you expected to happen
3. What actually happened
4. Browser and assistive technology used
5. Screenshots if applicable

## Expected Results

### Lighthouse Accessibility Score
**Target:** 95-100

Common deductions (acceptable):
- Background and foreground colors have sufficient contrast (if false positive)
- HTML has valid lang attribute (should pass)
- Links have discernible text (should pass)

### WAVE Summary
**Target:** 0 errors

Acceptable warnings:
- Suspicious link text (if context makes it clear)
- Redundant link (if intentional for UX)

### axe DevTools
**Target:** 0 violations

All critical, serious, and moderate issues should be resolved.

## Sign-Off

Once all tests pass, sign off here:

**Tester Name:** _________________  
**Date:** _________________  
**Browser Tested:** _________________  
**Screen Reader Tested:** _________________  
**Result:** ☐ Pass ☐ Fail  

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Note:** This is a comprehensive checklist. Not all tests may be applicable depending on your testing environment. Focus on keyboard navigation and at least one screen reader test as minimum requirements.
