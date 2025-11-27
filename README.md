# FastOJ IDE

A fast, modern, and lightweight C++ IDE built with Next.js, featuring Monaco editor, real-time compilation, and an intuitive split-panel interface. Designed for competitive programming and quick C++ prototyping with ICPC-style input/output testing.

## 🚀 Quick Start

```bash
git clone <your-repo-url>
cd fastoj-ide
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start coding!

> **Note:** Requires g++ compiler (MinGW-w64 on Windows, g++ on Linux/Mac)

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.4-black)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![C++20](https://img.shields.io/badge/C++-20-00599c)

## ✨ Features

### 🎨 Editor
- **Monaco Editor** - Full-featured code editor with C++ syntax highlighting
- **Multiple Themes** - Built-in and custom themes:
  - Built-in: VS Dark, VS Light
  - Custom: Monokai, Solarized (Light/Dark), Gruvbox (Light/Dark), Dracula, Nord
- **Theme Consistency** - Entire UI (navbar, panels, status bar) adapts to selected editor theme
- **Customizable Fonts** - Choose font family and size (persisted in localStorage)
- **Inline Error Markers** - Compilation errors displayed directly in the editor with red squiggly underlines at exact line/column positions
- **Auto-save** - Code automatically saved to localStorage

### 📊 I/O Panel
- **Input Tab** - Provide stdin for your program
- **Output Tabs**:
  - **stdout** - Program output
  - **Expected Output** - Manual input for test case verification
  - **stderr** - Debug output (e.g., `cerr` statements) and runtime errors
- **Line Numbers** - All text areas and outputs display line numbers synced with content scrolling
- **Resizable Panels** - Drag horizontal separator between editor and I/O panel; drag vertical separator between Input and Output sections
- **Verdict Indicators** - Green/red dots on stdout and expected output tabs show Accepted/Wrong Answer status

### 🚀 Compilation & Execution
- **Local Compilation** - Uses `g++ -std=c++20 -O2` on your machine (requires MinGW-w64 on Windows or g++ on Linux/Mac)
- **Keyboard Shortcuts**:
  - `Ctrl+B` / `⌘+B` - Compile and run code
  - `Ctrl+S` / `⌘+S` - Save code manually to localStorage
- **Real-time Feedback**:
  - Compilation status (Idle → Compiling → Success/Error)
  - Execution time and memory usage (when available)
  - Test verdict: Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded, Compilation Error
- **Output Comparison** - Automatically compares stdout with expected output (normalized whitespace)
- **Status Bar** - Shows compilation info, current theme, and test result at the bottom

### 💾 File Management
- **Download** - Export code as `.cpp` file
- **Reset** - Restore default template (`bits/stdc++.h` boilerplate)
- **Persistence** - Code and settings saved across sessions

### ⚙️ Settings
- **Font Size** - Adjustable from 10px to 24px with slider control
- **Font Family** - Choose from: Monaco, JetBrains Mono, Fira Code
- **Theme Selection** - Dropdown with all available themes
- **Tab Size** - Hardcoded to 3 spaces for consistent indentation
- **Minimal UI** - Compact settings modal near the gear button

## ⚡ Performance Optimizations

FastOJ IDE is built with performance in mind:

- **React.memo** - Components wrapped with memo to prevent unnecessary re-renders
- **useCallback** - Event handlers memoized to maintain referential equality
- **useMemo** - Theme colors and expensive computations cached
- **Code Splitting** - Next.js automatic code splitting for faster initial loads
- **LocalStorage Caching** - Code and settings persisted locally for instant restoration
- **Lazy Mounting** - Editor and components mount only after hydration
- **Optimized Monaco** - Minimal editor options, disabled minimap, efficient marker updates
- **Debounced Storage** - LocalStorage writes optimized to avoid excessive I/O
- **Efficient Subprocess Management** - Temporary directories, proper cleanup, timeout handling
- **Fast Compilation** - C++20 with -O2 optimization flag for faster executables

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 16.0.4** (App Router)
  - Server-side rendering and static generation
  - API routes for backend logic
  - File-based routing
  - Hot module replacement for fast development

### Language & Type Safety
- **TypeScript 5.x**
  - Static typing for all components
  - IntelliSense and autocomplete
  - Type-safe props and state management

### UI & Styling
- **TailwindCSS 4.x**
  - Utility-first CSS framework
  - Custom theming via inline styles for dynamic color adaptation
  - Minimal, monospaced design
- **React 19.2.0**
  - Component-based architecture
  - Hooks for state and side effects
  - Ref management for editor instances

### Editor
- **@monaco-editor/react 4.7.0**
  - VS Code's Monaco editor wrapped for React
  - Language support for C++ with syntax highlighting
  - Custom theme registration and switching
  - Programmatic marker API for error highlighting
  - OnMount hook for editor instance access
  - Tab size hardcoded to 3 spaces

### Layout
- **react-resizable-panels 3.0.6**
  - Horizontal split: Editor (left) vs I/O Panel (right)
  - Vertical split: Input (top) vs Output (bottom)
  - Smooth drag handles with hover effects
  - Panel size persistence (optional, not yet wired)

### Backend Execution
- **Next.js API Routes** (`/api/run`)
  - Node.js runtime with `child_process` spawn
  - Creates temporary directory in OS tmpdir for each run
  - Compiles with `g++ -std=c++20 -O2 main.cpp -o a.out` (C++20 standard)
  - Executes binary with stdin piping and timeouts
  - Returns structured JSON: `{ stdout, stderr, compile_output, status: { id, description } }`
- **Security Measures** (for local development):
  - 4-second execution timeout (configurable up to 20s)
  - Process isolation via temporary directories
  - Automatic cleanup after run
### State Management
- **React useState & useEffect**
  - Local state for code, I/O, settings, compile status
  - LocalStorage persistence for code and editor settings
  - useRef for editor instance and timer references

### Utilities
- **Custom Theme System** (`lib/editorThemes.ts`)
  - `customThemes` - Monaco theme definitions with tokenColors and colors
  - `getThemeColors(themeName)` - Maps theme to UI colors (background, foreground, borders, hover states)
  - Consistent palette across editor, navbar, panels, modal, status bar

### Error Parsing
- **g++ Error Regex**
  - Pattern: `main.cpp:(\d+):(\d+):\s+(error|warning):\s+(.+)`
  - Extracts line, column, severity, and message
  - Converts to Monaco `IMarkerData` for inline display

## 📁 Project Structure

```
fastoj-ide/
├── app/
│   ├── api/
│   │   └── run/
│   │       └── route.ts          # Backend API for local g++ compilation/execution
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main app: orchestrates editor, I/O, navbar, status bar
├── components/
│   ├── CodeEditor.tsx            # Monaco editor wrapper with theme registration and error markers
│   ├── IOPanel.tsx               # Split I/O panel with tabs (stdout, expected, stderr)
│   ├── LineNumberedTextarea.tsx  # Editable textarea with synced line number gutter
│   ├── LineNumberedPre.tsx       # Read-only pre block with synced line number gutter
│   ├── Navbar.tsx                # Top bar with File menu, Run button, Settings button
│   ├── SettingsModal.tsx         # Compact settings popover for font/theme customization
│   └── StatusBar.tsx             # Bottom bar with compile status, theme, and verdict
├── lib/
│   ├── editorThemes.ts           # Custom Monaco themes and getThemeColors helper
│   └── runCode.ts                # Client-side API callers: runCppLocal, runCppWithJudge0
├── public/                       # Static assets
├── .gitignore
├── biome.json                    # Biome config (linter/formatter)
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS for Tailwind
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🔄 How It Works

### 1. User Interaction Flow
```
User writes code in Monaco Editor
         ↓
Clicks "Run" button in Navbar
         ↓
app/page.tsx handleRun() triggered
         ↓
Clear previous outputs, set status to "Compiling"
         ↓
POST request to /api/run with { code, stdin }
```

### 2. Backend Compilation & Execution (API Route)
```
/api/run receives POST request
         ↓
Create temp directory (e.g., /tmp/cpp-run-abc123/)
         ↓
Write code to main.cpp
         ↓
Spawn g++ process: g++ -std=c++20 -O2 main.cpp -o a.out
         ↓
If compile.code !== 0:
    → Return { compile_output: stderr, status: { id: 6 } }
         ↓
Spawn executable: ./a.out
         ↓
Pipe stdin, capture stdout/stderr, apply timeout
         ↓
If timeout: kill process, status.id = 5 (TLE)
If exit code != 0: status.id = 4 (Runtime Error)
If success: status.id = 3 (Accepted)
         ↓
Return { stdout, stderr, compile_output, status }
```

### 3. Result Processing (Frontend)
```
Receive response from /api/run
         ↓
If status.id === 6 (Compilation Error):
    → Set compileErrors (triggers Monaco markers)
    → Show error in stderr tab
    → Status bar: "Compilation error"
         ↓
If status.id === 4 (Runtime Error):
    → Show stderr output
    → Status bar: "Runtime error"
         ↓
If status.id === 3 (Accepted):
    → Display stdout
    → Compare with expectedOutput (if provided)
         ↓
If outputs match (normalized):
    → testResult = 'accepted', green dot on tabs
    → Status bar: "Accepted"
         ↓
If outputs differ:
    → testResult = 'wrong', red dot on tabs
    → Status bar: "Wrong Answer"
```

### 4. Theme Synchronization
```
User selects theme in Settings
         ↓
editorSettings.editorTheme updated
         ↓
localStorage saves settings
         ↓
CodeEditor registers custom theme via monaco.editor.defineTheme()
         ↓
getThemeColors(editorTheme) called in page.tsx
         ↓
Colors object { background, foreground, border, hoverBackground, secondaryBackground }
         ↓
Passed as inline styles to:
    - Page background
    - Navbar buttons and dropdown
    - IOPanel headers, tabs, textareas
    - SettingsModal background and controls
    - StatusBar background and text
    - PanelResizeHandle separators
```

### 5. Error Marker Flow
```
Compilation fails with g++ output
         ↓
app/page.tsx sets compileErrors state
         ↓
CodeEditor receives compileErrors prop
         ↓
useEffect in CodeEditor parses errors via regex
         ↓
Extract: line number, column, severity, message
         ↓
Create Monaco IMarkerData[] array
         ↓
monaco.editor.setModelMarkers(model, 'cpp', markers)
         ↓
Red squiggles appear in editor at exact positions
         ↓
Hover over squiggle shows error message tooltip
```

### 6. LocalStorage Persistence
```
On mount:
    → Load 'code' from localStorage → setCode()
    → Load 'editorSettings' JSON → setEditorSettings()
         ↓
On code change (useEffect dependency: code):
    → localStorage.setItem('code', code)
         ↓
On settings change (useEffect dependency: editorSettings):
    → localStorage.setItem('editorSettings', JSON.stringify(editorSettings))
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm/yarn/pnpm
- **g++ compiler** (for local execution):
  - **Windows**: Install [MinGW-w64](https://www.mingw-w64.org/) and add `bin` folder to PATH
  - **Linux**: `sudo apt install g++` (or equivalent)
  - **macOS**: `xcode-select --install`

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd fastoj-ide

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server
npm run dev

# Open http://localhost:3000 in your browser
```

### Verify g++ Installation

```bash
g++ --version
# Should output: g++ (GCC) ...
```

If g++ is not found, the UI will show "Compilation failed: g++ not found in PATH" with installation instructions.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📝 Usage

1. **Write Code**: Type or paste C++ code in the Monaco editor (left panel)
2. **Provide Input**: Enter test input in the Input tab (right panel, top)
3. **Set Expected Output** (optional): Enter expected output in the Expected Output tab for automatic verdict
4. **Save**: Press **Ctrl+S** (⌘+S on Mac) to manually save your code to localStorage
5. **Run**: Click the "Run" button in the navbar or press **Ctrl+B** (⌘+B on Mac)
6. **View Results**:
   - **stdout tab**: Program output
   - **Expected Output tab**: Manual input for comparison (shows green/red dot for match/mismatch)
   - **stderr tab**: Debug output (`cerr`) or runtime errors
   - **Status bar**: Compilation status and test verdict (Accepted/Wrong Answer/Runtime Error/TLE/Compilation Error)
   - **Editor**: Red squiggles for compilation errors (hover for details)
7. **Customize**: Click the gear icon to adjust:
   - Font size (10-24px)
   - Font family (Monaco, JetBrains Mono, Fira Code)
   - Editor theme (10 themes available)
8. **Download**: File → Download to save code as `solution.cpp`
9. **Reset**: File → Reset to Default to restore boilerplate template

## 🎯 Default Template

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
   // your code goes here

   return 0;
}
```

## ⚙️ Configuration

### Environment Variables (Optional)
For future Judge0 integration or remote runner:

```bash
# .env.local
NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY=your_rapidapi_key
NEXT_PUBLIC_JUDGE0_HOST=judge0-ce.p.rapidapi.com
NEXT_PUBLIC_RUN_BACKEND=local  # or 'judge0', 'remote'
NEXT_PUBLIC_RUNNER_URL=https://your-runner-api.com
```

Currently, the app uses local g++ by default.

## 🔐 Security Considerations

### Current (Local Development)
- Temporary directories created per run, cleaned automatically
- Timeouts prevent infinite loops (4s default, max 20s)
- No network access from executed code (OS-level isolation not enforced)

### For Production Hosting
⚠️ **Do NOT run user code directly on the Next.js server in production.**

Recommended architecture:
- **Sandboxed Execution**: Use Docker containers with `--network=none`, CPU/memory limits, seccomp/apparmor profiles
- **Separate Runner Service**: Dedicated microservice with queue (Redis/RabbitMQ) for job management
- **Rate Limiting**: Per-IP or per-user submission limits
- **Input Validation**: Sanitize all user inputs; never execute untrusted binaries outside containers

See "Future Plan" section for ICPC Online Judge architecture.

## 🛣️ Roadmap

### Completed ✅
- Monaco editor with C++ syntax highlighting
- Custom themes with full UI consistency
- Local g++ compilation and execution
- Input/output panels with line numbers
- Resizable split layout (horizontal and vertical)
- Real-time compilation status and verdicts
- Expected output comparison (Accepted/Wrong Answer)
- Inline error markers in editor
- Settings persistence (localStorage)
- Download and reset functionality

### Planned 🚧
- **Multi-language Support**: Python, Java, JavaScript
- **Contest Mode**: ICPC-style problems, submissions, scoreboard
  - User authentication and team management
  - Problem statements with multiple test cases
  - Automated judging with custom checkers/SPJ
  - Scoreboard with freeze/unfreeze and penalty calculation
  - Clarifications system
- **Remote Runner**: Dockerized execution backend with queue
  - Horizontal scaling for high throughput
  - Time/memory limits per language
  - Interactive problem support
- **Advanced Editor Features**:
  - Code templates and snippets
  - Multi-file editing
  - Vim/Emacs keybindings
- **UI Enhancements**:
  - Diff view for expected vs actual output
  - Multiple test case management
  - Execution history
  - Dark/light mode toggle independent of editor theme
- **Deployment**:
  - Docker Compose setup for full stack
  - Kubernetes manifests for production
  - CI/CD pipelines

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) by Microsoft
- [Next.js](https://nextjs.org/) by Vercel
- [TailwindCSS](https://tailwindcss.com/)
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) by Brian Vaughn
- Inspired by USACO and Codeforces IDE interfaces

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

**FastOJ IDE - Built with ❤️ for competitive programmers and C++ enthusiasts**
