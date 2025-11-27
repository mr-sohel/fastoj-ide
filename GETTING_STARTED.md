# Getting Started: Run FastOJ IDE Locally

This guide helps anyone clone and run FastOJ IDE on their own Windows machine using PowerShell.

## Prerequisites
- Git (https://git-scm.com/downloads)
- Node.js 20+ and npm 10+ (https://nodejs.org)
- Docker Desktop (running) (https://www.docker.com/products/docker-desktop)
- Windows 10/11 with PowerShell

Verify installations:
```powershell
node -v
npm -v
docker --version
```

## 1) Clone the Repository
```powershell
git clone <your-repo-url>
cd fastoj-ide
```

## 2) Install Dependencies
```powershell
npm install
```

## 3) Build the Docker Image (C++ runtime)
```powershell
docker build -t fastoj-gcc .
```

## 4) Start Redis (first time only)
```powershell
docker run -d --name fastoj-redis -p 6379:6379 redis:7-alpine
```
For later runs:
```powershell
docker start fastoj-redis
```

## 5) Run the App (One Command)
```powershell
npm run go
```
This will:
- Start Redis (if needed)
- Start the background worker (silent)
- Start Next.js dev server at `http://localhost:3000`

Open your browser at `http://localhost:3000` and click Run.

## Manual Start (Alternative)
Use two terminals if you prefer manual control.

Terminal 1 – Worker:
```powershell
set REDIS_URL=redis://localhost:6379
npm run worker
```

Terminal 2 – Server:
```powershell
set REDIS_URL=redis://localhost:6379
npm run dev
```

## Basic Test
Paste this code and click Run:
```cpp
#include <iostream>
using namespace std;
int main(){ cout << "Hello, FastOJ!"; }
```
You should see stdout "Hello, FastOJ!" with time and memory in the status bar.

## Troubleshooting
- Docker not running:
  ```powershell
  docker info
  ```
  Start Docker Desktop and retry.

- Redis connection error (ECONNREFUSED):
  ```powershell
  docker ps -a | Select-String fastoj-redis
  docker start fastoj-redis
  ```

- Job timed out waiting for result (worker not running):
  - Ensure `npm run go` is used, or start worker manually:
    ```powershell
    set REDIS_URL=redis://localhost:6379
    npm run worker
    ```

- Port 3000 in use:
  ```powershell
  netstat -ano | Select-String ":3000"
  taskkill /F /PID <PID>
  ```

## Notes
- Requires Docker to execute C++ securely with resource limits.
- Worker runs silently in the background via `start.bat`.
- For production, build with `npm run build` and run `npm start`; keep worker running.
