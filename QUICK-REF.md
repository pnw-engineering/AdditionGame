# Addition Game - Quick Reference

## 🚨 CRITICAL RULES

- ❌ NO service workers during development
- ❌ NO complex cache busting
- ❌ NO dynamic script loading
- ✅ USE direct `<script>` tags
- ✅ USE `index-dev.html` for development
- ✅ KEEP IT SIMPLE

## 🎯 Key Patterns

- `window.AdditionGame = AdditionGame` (global exposure)
- `window.addEventListener('load', ...)` (initialization)
- Standard F5 reload workflow
- Fresh file approach for cache issues

## 📁 Main Files

- `index-dev.html` - Development (simple)
- `index.html` - Production (PWA)
- `js/main.js` - AdditionGame class
- `js/simple-storage.js` - Data persistence

## 🔄 If Cache Issues

1. Create new file with different name
2. Copy working content
3. Delete problematic file
4. Rename new file back

_Keep this simple - complex solutions caused the cache wars!_
