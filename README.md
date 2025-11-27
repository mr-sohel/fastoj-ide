# FastOJ IDE

A modern, fast online judge IDE for C++ competitive programming with Docker-based code execution, BullMQ job queue, and Redis backend.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.4-black)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

---

## 🚀 Quick Start

Run the project with one command:
```bash
npm run go
```

This will automatically:
- ✅ Start Redis container (if not running)
- ✅ Launch worker process in background
- ✅ Start dev server at http://localhost:3000

**First time?** See [Initial Setup](#-initial-setup) below.

---

## 📋 Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20+ | Runtime for Next.js and worker |
| **npm** | 10+ | Package manager |
| **Docker Desktop** | Latest | Container runtime for code execution |
| **Windows** | 10/11 | Operating system (PowerShell/CMD) |

---

## 🔧 Initial Setup

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd fastoj-ide
npm install
```

### 2. Build Docker Image
```bash
docker build -t fastoj-gcc .
```

This creates a GCC container with:
- GCC compiler (latest)
- `/usr/bin/time` utility for memory measurement
- C++20 standard support

### 3. Create Redis Container
```bash
docker run -d --name fastoj-redis -p 6379:6379 redis:7-alpine
```

### 4. Run the Application
```bash
npm run go
```

Open http://localhost:3000 and start coding!

---

## 🎯 Features

### Code Editor
- **Monaco Editor** - Same editor as VS Code
- **Syntax Highlighting** - Full C++ support with IntelliSense
- **Multiple Themes** - Dark, Light, Monokai, Dracula, Nord, Gruvbox, Solarized
- **Customizable** - Font size and family settings
- **Auto-save** - Code persisted to localStorage
- **Error Markers** - Inline compilation errors with line/column precision

### Execution Engine
- **Docker Isolation** - Safe sandboxed execution
- **Resource Limits:**
  - Memory: 256MB
  - CPU: 1.0 core
  - Time: 2 seconds
  - PIDs: 50 max processes
  - Network: Disabled
- **Accurate Metrics** - Real execution time (ms) and memory (MB)
- **BullMQ Queue** - Reliable job processing with Redis

### I/O Management
- **Input Tab** - Provide stdin for your program
- **Output Tabs:**
  - stdout - Program output
  - Expected Output - Test case validation
  - stderr - Debug output and errors
- **Test Validation** - Automatic AC/WA detection
- **Line Numbers** - Synchronized with content

### User Experience
- **Keyboard Shortcuts:**
  - `Ctrl+B` - Compile and run
  - `Ctrl+S` - Manual save to localStorage
- **Status Bar** - Shows verdict, time, and memory
- **Resizable Panels** - Adjust editor and I/O sizes
- **Theme Consistency** - UI adapts to selected editor theme

---

## 📁 Project Structure

```
fastoj-ide/
├── app/                      # Next.js 16 app directory
│   ├── api/
│   │   ├── run/             # POST endpoint - Submit code jobs
│   │   │   └── route.ts     # Creates job in BullMQ queue
│   │   └── result/          # GET endpoint - Poll job results
│   │       └── route.ts     # Returns job status/output
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main IDE interface
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── CodeEditor.tsx      # Monaco editor wrapper
│   ├── IOPanel.tsx         # Input/Output tabs panel
│   ├── Navbar.tsx          # Top navigation bar
│   ├── StatusBar.tsx       # Bottom status with metrics
│   ├── SettingsModal.tsx   # Theme and font settings
│   └── LineNumbered*.tsx   # Line-numbered text areas
│
├── lib/                     # Core utilities
│   ├── bullmq.ts           # BullMQ queue configuration
│   ├── dockerRunner.ts     # Docker execution logic
│   ├── editorThemes.ts     # Monaco theme definitions
│   └── runCode.ts          # Frontend API client
│
├── worker/                  # Background job processor
│   └── runWorker.ts        # BullMQ worker (processes jobs)
│
├── public/                  # Static assets
│
├── Dockerfile              # GCC execution environment
├── start.bat               # Windows startup script
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS config
└── README.md               # This file
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string for BullMQ |
| `BULLMQ_CONCURRENCY` | `1` | Number of jobs worker processes simultaneously |

Set in `start.bat` or manually:
```bash
set REDIS_URL=redis://localhost:6379
set BULLMQ_CONCURRENCY=2
```

### Docker Execution Limits

Configured in `lib/dockerRunner.ts`:
```typescript
--memory=256m              // RAM limit
--cpus=1.0                 // CPU cores
--network=none             // No internet access
--pids-limit=50            // Max processes
timeout: 2000              // 2 second execution limit
```

### Compilation Flags

```bash
g++ -std=c++20 -O2 -o main main.cpp
```
- `-std=c++20` - C++20 standard
- `-O2` - Optimization level 2

---

## 🏗️ Architecture

### System Flow
```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │ Code Editor  │───▶│   IOPanel    │◀──│  Status Bar  │   │
│  │  (Monaco)    │    │ (I/O Tabs)   │   │ (Time/Mem)   │   │
│  └──────────────┘    └──────────────┘   └──────────────┘   │
│           │                    ▲                             │
│           │ POST /api/run      │ GET /api/result (polling)  │
│           ▼                    │                             │
└───────────────────────────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (API Routes)               │
│  ┌──────────────────┐       ┌────────────────────┐         │
│  │   /api/run       │       │   /api/result      │         │
│  │ Create job       │       │ Fetch job status   │         │
│  └────────┬─────────┘       └────────▲───────────┘         │
│           │                          │                       │
└───────────┼──────────────────────────┼───────────────────────┘
            │                          │
            ▼                          │
┌─────────────────────────────────────────────────────────────┐
│                    Redis (Job Queue)                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │  Waiting      │─▶│   Active      │─▶│  Completed    │   │
│  │  Queue        │  │   Jobs        │  │  Results      │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        ▲            │
                        │            ▼
            ┌───────────────────────────────┐
            │    BullMQ Worker Process      │
            │  (runWorker.ts)               │
            │  - Picks up jobs              │
            │  - Executes via Docker        │
            │  - Stores results             │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────────────┐
            │    Docker Container           │
            │  - Compile C++ code           │
            │  - Execute with limits        │
            │  - Measure time/memory        │
            │  - Return output              │
            └───────────────────────────────┘
```

### Request Flow (Step by Step)

1. **User Clicks "Run"**
   - Frontend calls `runCppLocal()` in `lib/runCode.ts`

2. **Submit Job**
   - POST to `/api/run` with code and input
   - Server creates job in BullMQ queue via `getRunQueue().add()`
   - Returns `jobId` to frontend

3. **Worker Processing**
   - Worker (`runWorker.ts`) picks up job from queue
   - Calls `runCppInDocker()` with code and input
   - Docker container created with resource limits

4. **Execution**
   - Code compiled: `g++ -std=c++20 -O2 -o main main.cpp`
   - Binary executed with `/usr/bin/time` for memory tracking
   - Output captured (stdout, stderr, exit code)
   - Execution time measured in milliseconds

5. **Result Storage**
   - Worker stores result back in Redis via BullMQ
   - Job marked as "completed" with return value

6. **Frontend Polling**
   - Browser polls GET `/api/result?jobId=X` every 500ms
   - Max 60 attempts (30 seconds timeout)
   - Receives result when job completes

7. **Display Output**
   - Parse status (AC, CE, TLE, RE)
   - Show stdout, stderr, time, memory
   - Update status bar with verdict

---

## 🧪 Testing

### Basic Test
1. Open http://localhost:3000
2. Enter this code:
   ```cpp
   #include <iostream>
   using namespace std;
   int main() {
       cout << "Hello, FastOJ!";
       return 0;
   }
   ```
3. Click **Run** or press `Ctrl+B`
4. Expected output: `Hello, FastOJ!`
5. Status bar shows: `Accepted, Xms, Y.YMB`

### With Input
**Code:**
```cpp
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}
```
**Input Tab:**
```
5 3
```
**Expected Output:** `8`

### Test Case Validation
1. Enter expected output: `8`
2. Run code
3. Green checkmark if output matches
4. Red X if output differs

---

## 🐛 Troubleshooting

### "Job timed out waiting for result"
**Symptoms:** Frontend shows timeout after 30 seconds  
**Cause:** Worker process not running  
**Solution:**
```bash
# Check if worker is running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Restart with npm run go
npm run go
```

### Docker Build Errors
**Error:** `docker: command not found`  
**Solution:** 
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Verify: `docker --version`

**Error:** `Cannot connect to Docker daemon`  
**Solution:** Start Docker Desktop application

### Redis Connection Errors
**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`  
**Solution:**
```bash
# Check if Redis container exists
docker ps -a | findstr fastoj-redis

# Start if stopped
docker start fastoj-redis

# Create if doesn't exist
docker run -d --name fastoj-redis -p 6379:6379 redis:7-alpine
```

### Compilation Errors Not Showing
**Issue:** Code doesn't compile but no error markers  
**Solution:** Check `/api/run` console logs for actual errors

### Port Already in Use
**Error:** `Port 3000 is already in use`  
**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /F /PID <PID>
```

### Worker Won't Stop
**Solution:**
```bash
# Stop all node processes (warning: kills all)
taskkill /F /IM node.exe

# Or find specific worker PID
Get-Process node
Stop-Process -Id <PID>
```

---

## 📚 Technology Stack

### Frontend
- **Next.js** 16.0.4 - React framework with App Router
- **React** 18.2.0 - UI library
- **TypeScript** 5 - Type-safe JavaScript
- **Monaco Editor** 4.7.0 - VS Code editor component
- **Tailwind CSS** 4 - Utility-first CSS framework
- **react-resizable-panels** 3.0.6 - Draggable panel splits

### Backend
- **BullMQ** 5.65.0 - Redis-backed job queue
- **IORedis** 5.8.2 - Redis client
- **tsx** 4.20.6 - TypeScript execution for worker

### Infrastructure
- **Docker** - Container runtime
  - `gcc:latest` - Base image
  - `redis:7-alpine` - Queue storage
- **Redis** 7 - In-memory data store

### Development
- **Biome** 2.2.0 - Fast linter and formatter
- **TypeScript** - Static type checking

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run go` | **Start everything** (Redis + Worker + Server) |
| `npm run dev` | Start Next.js dev server only |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run worker` | Start BullMQ worker only |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |

---

## 🔒 Security Features

- **Network Isolation** - Docker containers have no internet access
- **Resource Limits** - CPU, memory, and process limits prevent abuse
- **Timeout Protection** - 2-second execution limit
- **Sandboxing** - Code runs in isolated containers
- **No Persistence** - Containers removed after execution

---

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
```bash
# Set Redis URL for production
set REDIS_URL=redis://your-redis-host:6379

# Set worker concurrency (optional)
set BULLMQ_CONCURRENCY=4
```

### Start Production Services

**Terminal 1 - Worker:**
```bash
set REDIS_URL=redis://your-redis-host:6379
npm run worker
```

**Terminal 2 - Server:**
```bash
set REDIS_URL=redis://your-redis-host:6379
npm start
```

### Recommended Production Setup
- Use **PM2** for process management
- Deploy Redis on separate instance
- Use **Nginx** as reverse proxy
- Enable **HTTPS** with SSL certificate
- Set up **monitoring** (logs, metrics)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

- **Issues:** https://github.com/your-repo/issues
- **Discussions:** https://github.com/your-repo/discussions

---

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft
- **Next.js** - Vercel
- **BullMQ** - Taskforcesh
- **Docker** - Docker Inc.

---

**Built with ❤️ for competitive programmers**

Version 1.0.0 | Last Updated: November 2025
