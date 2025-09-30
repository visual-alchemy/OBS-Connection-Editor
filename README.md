# OBS Connection Editor

A web-based tool for managing OBS connections, built with Next.js and Docker support.

## ✨ Features

- **SMB Integration**: Direct file management on SMB shares (`//192.168.40.145/OBS Multi/src/App.svelte`)
- **Real-time Updates**: Live file change notifications via Server-Sent Events
- **Connection Management**: Add, edit, delete, and toggle OBS connections
- **Filtering & Search**: Find connections by category, name, or address
- **Docker Ready**: Full containerization with SMB client included

---

## 🚀 Quick Start

### 🐳 Docker Installation (Recommended)

**One-command setup with all dependencies included:**

```bash
git clone https://github.com/visual-alchemy/OBS-Connection-Editor.git
cd OBS-Connection-Editor
cp .env.example .env  # Edit SMB settings
docker-compose -f docker-compose.simple.yml up -d
```

**→ Access at: http://localhost:3112**

### 💻 Manual Installation

**Prerequisites:** Node.js 18+, SMB client installed

```bash
git clone https://github.com/visual-alchemy/OBS-Connection-Editor.git
cd OBS-Connection-Editor
npm install --legacy-peer-deps
npm run dev
```

**→ Access at: http://localhost:3112**

---

## 📦 Installation Options

### Option 1: Docker (Recommended)

**Why Docker?** ✅ Pre-configured ✅ Cross-platform ✅ No dependencies

```bash
# Simple HTTP deployment (most reliable)
docker-compose -f docker-compose.simple.yml up -d

# HTTPS deployment (with certificates)
docker-compose up -d

# Manual Docker build
docker build -t obs-connection-editor . && docker run -d -p 3112:3112 obs-connection-editor
```

### Option 2: Manual Setup

**System Requirements:**

| OS | Install SMB Client |
|----|-------------------|
| **macOS** | `brew install samba` |
| **Ubuntu/Debian** | `sudo apt install smbclient` |
| **Windows** | Use WSL2 or Docker (recommended) |

**Installation:**
```bash
npm install --legacy-peer-deps
npm run build  # Production
npm run dev    # Development
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

```env
# SMB Server Configuration
SMB_ADDRESS=192.168.40.145
SMB_SHARE_NAME=OBS Multi
SMB_USERNAME=guest
SMB_PASSWORD=
SMB_FILE_PATH=src/App.svelte
```

### Port Configuration

- **Docker**: Always uses port 3112
- **Local**: Configurable via `package.json` scripts (default 3112)

---

## 🔧 Management Commands

### Docker Commands

```bash
# Container management
docker ps | grep obs                                    # Check status
docker logs obs-connection-editor -f                   # View logs
docker-compose -f docker-compose.simple.yml restart    # Restart
docker-compose -f docker-compose.simple.yml down       # Stop

# Rebuild after changes
docker-compose -f docker-compose.simple.yml up --build
```

### Local Development

```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Production server
npm run dev:https   # HTTPS development
npm run start:https # HTTPS production
```

---

## 🆚 Deployment Comparison

| Feature | 🐳 Docker | 💻 Manual |
|---------|-----------|-----------|
| **Setup Time** | ⚡ 2 minutes | 🕐 5-10 minutes |
| **Dependencies** | ✅ Included | ❌ Manual install |
| **Cross-platform** | ✅ Universal | ❌ OS-dependent |
| **SMB Client** | ✅ Pre-installed | ❌ System setup |
| **Isolation** | ✅ Containerized | ❌ System-wide |
| **Best For** | Production, Testing | Development |

**💡 Recommendation: Docker for production, manual for active development**

---

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**
```bash
docker logs obs-connection-editor
```

**SMB connection failed:**
```bash
# Test from container
docker exec -it obs-connection-editor smbclient -L 192.168.40.145 -U guest%

# Test API endpoint
curl http://localhost:3112/api/check-smb
```

**Port 3112 already in use:**
```bash
lsof -i :3112  # Find what's using the port

# Or use different port in docker-compose:
ports:
  - "3113:3112"  # Use 3113 instead
```

**Dependency issues (manual install):**
```bash
npm install @marsaud/smb2 --legacy-peer-deps
npm install https-localhost --legacy-peer-deps
```

---

## 🏗️ Architecture

### Technical Stack
- **Framework**: Next.js 15.1.0 + React 19
- **Styling**: Tailwind CSS + Radix UI
- **File System**: SMB client integration
- **Real-time**: Server-Sent Events + Polling
- **Container**: Docker + Alpine Linux

### API Endpoints
- `/api/check-smb` - SMB connectivity test
- `/api/read-file` - Read SMB file content
- `/api/save-file` - Save file to SMB share
- `/api/poll-updates` - File change detection
- `/api/webhook` - Real-time notifications

### SMB Integration
- **Target**: `//192.168.40.145/OBS Multi/src/App.svelte`
- **Method**: `smbclient` command-line tool
- **Auth**: Guest access (configurable via .env)
- **Updates**: Real-time via SSE + 5-second polling

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🔗 Links

- **Repository**: https://github.com/visual-alchemy/OBS-Connection-Editor
- **Docker Hub**: _(Coming soon)_
- **Documentation**: See `DOCKER_DEPLOYMENT.md` for advanced Docker configuration
