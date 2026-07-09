# Info Site with Geolocation Dashboard

An extended version of **The Odin Project's Basic Informational Site** assignment, enhanced with real-world features like concurrent API fetching, geolocation, and reverse geocoding.

## 🎓 Original Assignment

This project builds upon the Node.js lesson:
[The Odin Project - Basic Informational Site](https://www.theodinproject.com/lessons/nodejs-basic-informational-site)

## ✨ Features

### Core (Odin Project Requirements)
- 4 static HTML pages: Home, About, Contact Me, 404
- Raw Node.js server (no frameworks)
- Dynamic routing based on URL path
- Proper HTTP status codes (200, 404, 500)

### Extended Features
- **Server-side Header/Footer Injection**: DRY principle with shared navigation across all pages
- **Geolocation API**: Browser captures user's latitude & longitude
- **5 Concurrent API Calls** (with timeouts):
  - **Open-Meteo**: Current weather by coordinates
  - **OpenTriviaDB**: Random trivia questions with multiple choice
  - **Useless Facts**: Random fun facts
  - **Cat Facts**: Random cat facts
  - **Nominatim**: Reverse geocoding (lat/lon → city/country)
- **Partial Success Pattern**: If one API fails, others still display
- **Error Handling**: Graceful fallbacks for all edge cases

## 🏗️ Architecture

```
info_site/
├── index.js              (Main server - routing + API orchestration)
├── package.json          (Project metadata + npm scripts)
├── README.md             (This file)
├── .gitignore            (Exclude node_modules, secrets)
├── public/
│   ├── header.html       (Shared navigation, injected server-side)
│   ├── footer.html       (Shared footer, injected server-side)
│   ├── index.html        (Home page with dashboard)
│   ├── about.html
│   ├── contact-me.html
│   ├── 404.html
│   ├── dashboard.js      (Front-end: geolocation + fetch logic)
│   └── styles.css        (Styling)
└── .vscode/
    └── launch.json       (VS Code debugging config)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (with `node:fs/promises` support)

### Installation

```bash
# Clone the repo
git clone <repository-url>
cd info_site

# No dependencies needed (uses Node.js built-ins only!)
```

### Running the Server

```bash
# Development mode (auto-restart on file changes)
npm run dev

# Production mode
npm start

# Debug mode (breakpoint debugging in VS Code)
npm run debug
```

Then open: `http://localhost:8080/`

## 💡 Key Learning Concepts

### Backend Patterns
- **Routing Map**: Object lookup pattern instead of if/else chains
- **Async/Await**: Modern promise handling with try/catch
- **Promise.allSettled()**: Concurrent API calls with partial success handling
- **Timeouts**: Prevent hanging requests (5 second limit per API)
- **Error Handling**: Graceful degradation, never crash

### Frontend Patterns
- **Geolocation API**: Browser's native location service
- **Fetch API**: Modern HTTP client with async/await
- **DOM Manipulation**: Conditional rendering based on API status
- **Error Boundaries**: User-friendly error messages

### Production Practices
- **npm Scripts**: Reproducible startup commands
- **VS Code Debugging**: Breakpoint debugging configuration
- **Git Workflow**: `.gitignore` excludes secrets and dependencies
- **Code Organization**: Separation of concerns (public/ for browser, backend in root)
- **User-Agent Headers**: Respect API rate limits and requirements

## 🧪 Testing

### Manual Testing
```bash
# Test home page
curl http://localhost:8080/

# Test dashboard API
curl "http://localhost:8080/api/dashboard?lat=40.7128&lon=-74.0060"

# Test 404
curl http://localhost:8080/invalid
```

### Browser Testing
1. Open `http://localhost:8080/`
2. Allow geolocation permission
3. Watch dashboard load with real weather + fun facts
4. Try denying geolocation to see error handling
5. Navigate to /about, /contact-me to test routing

## 🎯 Project Decisions

| Decision | Why |
|----------|-----|
| **Raw Node.js** | Learning focused; no framework abstractions |
| **async/await** | Modern, readable async patterns |
| **Promise.allSettled()** | Partial success resilience |
| **5-second timeouts** | Balance speed with reliability |
| **Server-side injection** | DRY principle for headers/footers |
| **No frameworks** | Understand HTTP fundamentals |

## 🐛 Known Edge Cases Handled

- ✅ User denies geolocation → fallback message
- ✅ Geolocation timeout (slow GPS) → 10s timeout with error
- ✅ API down or slow → shows partial results, not full failure
- ✅ Missing/malformed API response → graceful error per section
- ✅ File not found → 404 with proper HTML page
- ✅ API requires User-Agent → included in fetch headers

## 📚 What I Learned

This project taught me:
1. How HTTP servers work at a low level
2. Concurrent async operations with `Promise.allSettled()`
3. Real-world API integration patterns
4. Error handling strategies (fail-safe, timeouts, partial success)
5. Browser APIs: Geolocation, Fetch
6. Server-side templating without a framework
7. Production-grade patterns: debugging, git workflows, npm scripts

## 🔗 Resources Used

- [The Odin Project - Basic Informational Site](https://www.theodinproject.com/lessons/nodejs-basic-informational-site)
- [Open-Meteo Weather API](https://open-meteo.com)
- [OpenTriviaDB](https://opentdb.com)
- [Useless Facts API](https://uselessfacts.jsph.pl)
- [Cat Facts API](https://catfact.ninja)
- [Nominatim Reverse Geocoding](https://nominatim.openstreetmap.org)
- [MDN: Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 📝 License

Educational project. Free to use and modify.

---

**Built with** ❤️ while learning Node.js fundamentals
