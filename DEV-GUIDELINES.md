# Addition Game - Development Guidelines

## 🎯 Project Overview

- **Purpose**: Educational addition game for elementary aged kids
- **Architecture**: Simple web app (no PWA complexity during development)
- **Target**: Clean, maintainable code with reliable development workflow

## 🚫 What to AVOID

- **Service Workers** during development (causes cache issues)
- **Complex cache busting** strategies
- **Dynamic script loading** with path detection
- **PWA features** until production ready
- **Live Server conflicts** with custom service workers

## ✅ What to USE

- **Direct script tags** (`<script src="js/file.js"></script>`)
- **Inline CSS** or simple external stylesheets
- **Standard HTML5** approaches
- **Simple file structure**
- **Clear, readable code**

## 📁 File Structure

```text
frontend/
├── index-dev.html          # Development version (SIMPLE)
├── index.html              # Production version (with PWA features)
├── css/
│   └── main.css
├── js/
│   ├── simple-storage.js   # Game data persistence
│   ├── api.js              # API abstraction layer
│   └── main.js             # Core game logic (AdditionGame class)
└── images/
```

## 🔧 Development Workflow

1. **Use**: `index-dev.html` for all development
2. **Standard F5 reload** should work (no complex cache busting)
3. **Keep it simple** - traditional web development approaches
4. **Test frequently** with simple reloads

## 🎮 Game Features

- **Level 0**: Number recognition with text-to-speech
- **Level 1**: Single digit addition
- **Storage**: localStorage-based (AdditionGameStorage class)
- **Audio**: Text-to-speech for accessibility
- **UI**: Kid-friendly with large buttons and clear feedback

## 💾 Code Patterns

- **AdditionGame class** must be globally exposed: `window.AdditionGame = AdditionGame`
- **Initialize on window.load**: Standard event listener approach
- **Error handling**: Console logging for debugging
- **Responsive design**: Kid-friendly on tablets and desktops

## 🚨 Lessons Learned

- **Browser caching** can be extremely aggressive with HTML files
- **Simple solutions** often work better than complex ones
- **Fresh file approach** (new filename) bypasses cache issues
- **DevTools "Disable cache"** doesn't always work for HTML
- **Service workers** and development don't mix well

## 🔄 When Making Changes

1. **Edit files directly** in VS Code
2. **Use simple F5 reload** for testing
3. **If cache issues arise**: Create fresh file with new name
4. **Keep complexity minimal** during development
5. **Add PWA features only when ready for production**

## 📝 Future Enhancements

- **Python backend** for more advanced features
- **PWA capabilities** for offline use
- **Additional math levels** (subtraction, multiplication)
- **Progress tracking** and achievements
- **Sound effects** and animations

---

**Last Updated**: October 14, 2025
**Version**: Simple Web App (Post Cache Wars)

## 🎨 Frontend Guidelines

- **All displayed elements must be statically defined in HTML**
  - No `document.createElement()` or dynamic element generation
  - All UI elements exist in HTML from page load
  - Use show/hide, enable/disable, and content updates only
  - This ensures better control over what gets rendered
- **Update elements using element IDs or classes only**
  - Change `textContent`, `innerHTML`, `style.display`, `disabled`, etc.
  - Modify existing elements rather than creating new ones
- **No inline styles or scripts in HTML except for loading external files**
  - Use `<link rel="stylesheet" href="css/main.css">` for CSS
  - Use `<script src="js/main.js"></script>` for JavaScript
  - No `<style>` tags or `style=""` attributes in HTML
  - No `<script>` tags with inline code (except simple initialization)
- **Keep CSS and JS in single files** unless there is a good reason to separate, but explain to me before creating additional files.
- **In style.css** keep similar selectors together and preferably only appearing once to make things easier to find.
- **Do not use media queries for element sizing**. Achieve responsiveness by using responsive font-size and em sizing.
- **Semantic HTML** - use appropriate tags (button, input, section, etc.)
- **Accessibility first** - proper labels, ARIA attributes, keyboard navigation
- **Keep rendered screens to a single use** - each screen should serve one primary purpose
  - Welcome screen: game selection and optional settings (quiet mode, etc.)
  - Game screens: self-contained with all necessary controls and feedback
  - Settings screen: configuration options only
  - Avoid multi-purpose screens that try to do too many things
- **Use display: grid rather than flex unless there is a compelling reason for flex**
  - Grid is better for 2D layouts (rows AND columns)
  - Grid handles responsive design more predictably
  - Use flex only for: 1D layouts (single row/column), centering single items, navigation bars, button groups, or when you need flex-grow/shrink behavior
  - Flex is appropriate for: header/footer layouts, horizontal button groups, centering content within a container, or when items need to grow/shrink proportionally
- **No clamps that reference screen size for padding, margins, or grid sizing**
  - Avoid `clamp()` functions with `vw`, `vh`, `vmin`, `vmax` for spacing
  - Use simple `em` or `ch` units instead for predictable scaling
  - Clamps with viewport units make sizing unpredictable and hard to maintain
  - Exception: `clamp()` with `rem` units for font-size is acceptable

## 🐍 Backend Guidelines

### Architecture

- **Python with NumPy** for efficient numerical operations
- **2D Matrix tracking** for adaptive problem selection
- **RESTful API** design for frontend/backend communication
- **Stateless operations** where possible for scalability

### Progress Tracking System

- **2D Matrix Structure**: `progress[level][difficulty]` using NumPy arrays
- **Level Dimensions**:
  - Level 0 (Number Recognition): 10 difficulty levels
  - Level 1 (Single Addition): 20 difficulty levels
  - Level 2 (Double Addition): 30 difficulty levels
- **Difficulty Progression**: Each level has increasing complexity ranges
- **Adaptive Selection**: Algorithm selects problems based on performance matrix

### Scoring Rules

- **Correct Answer**: +2 points to difficulty level
- **Incorrect Answer**: -1 point to difficulty level (minimum 0)
- **Level Advancement**: Requires consistent high scores (≥75% correct) across difficulty range
- **Problem Selection**: Weighted toward difficulty levels with lower scores

### Data Management

- **User Profiles**: Unique identifiers with persistent progress tracking
- **Session Management**: Track continuous play sessions for adaptive adjustment
- **Performance Analytics**: Store timing, accuracy, and progression metrics
- **Backup Strategy**: Regular progress saves to prevent data loss

### API Endpoints

- **GET /user/{id}/progress**: Retrieve current progress matrix
- **POST /user/{id}/answer**: Submit answer and get next problem
- **GET /user/{id}/stats**: Get performance analytics
- **PUT /user/{id}/level**: Manual level adjustment (admin/debug)

### Error Handling

- **Graceful Degradation**: Fallback to frontend-only mode if backend unavailable
- **Input Validation**: Sanitize all user inputs and API parameters
- **Logging**: Comprehensive error logging with user context
- **Rate Limiting**: Prevent abuse while allowing natural learning pace

### Performance Requirements

- **Response Time**: API calls < 100ms for real-time feel
- **Concurrent Users**: Support multiple simultaneous learners
- **Memory Efficiency**: Use NumPy arrays for optimal performance
- **Database Design**: Efficient queries for progress retrieval/updates
