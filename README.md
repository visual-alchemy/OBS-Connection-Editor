# OBS Connection Editor

A web-based tool for managing OBS connections, built with Next.js.

## Features

- **SMB Integration**: Directly loads and saves files from `smb://192.168.40.145/OBS Multi/src/App.svelte`
- **Real-time Updates**: Webhook system that shows real-time changes to Svelte files
- **Connection Management**: Add, edit, delete, and toggle visibility of OBS connections
- **Filtering & Search**: Filter connections by category and search by name or address

## Technical Details

- **Server Port**: Runs on port 3112 (Docker) or 3001 (local development)
- **Real-time Updates**: Combines Server-Sent Events (SSE) for push notifications with regular polling
- **Secure Context**: Supports both HTTP (Docker) and HTTPS modes for browser compatibility
- **Docker Support**: Full containerization with SMB client integration

## Installation & Deployment

### 🐳 Docker Deployment (Recommended)

Docker is the **easiest and most reliable** way to run this application. All dependencies including SMB client are pre-installed.

**Quick Start:**
```bash
git clone https://github.com/your-username/OBS-Connection-Editor.git
cd OBS-Connection-Editor
cp .env.example .env  # Configure your SMB settings
docker-compose -f docker-compose.simple.yml up -d
```
**→ Access at: http://localhost:3112**

### 💻 Local Development Setup

For development or if you prefer running directly on your system:

**Prerequisites:** Node.js 18+, `smbclient` installed on your system

```bash
# Clone the repository
git clone https://github.com/your-username/OBS-Connection-Editor.git
cd OBS-Connection-Editor

# Install dependencies (use --legacy-peer-deps for compatibility)
npm install --legacy-peer-deps
```

#### System Requirements for Local Development

**macOS:**
```bash
# Install smbclient
brew install samba
```

**Ubuntu/Debian:**
```bash
# Install smbclient
sudo apt-get update && sudo apt-get install smbclient
```

**Windows:**
- Install WSL2 and follow Ubuntu instructions, or
- Use Docker deployment (recommended for Windows)

#### Potential Installation Issues

If you encounter dependency installation errors, try installing problematic packages individually:

```bash
# For SMB file access
npm install @marsaud/smb2 --legacy-peer-deps

# For WebSocket support
npm install ws --legacy-peer-deps

# For HTTPS local development
npm install https-localhost --legacy-peer-deps
```

## Running the Application

### 🐳 Docker (Production Ready)

**Recommended method** - includes all dependencies and SMB client:

```bash
# Quick start (HTTP)
docker-compose -f docker-compose.simple.yml up -d

# With HTTPS support
docker-compose up -d

# View logs
docker logs obs-connection-editor -f
```

**→ Access at: http://localhost:3112**

### 💻 Local Development

**For local development and testing:**

#### Development Mode
```bash
# Run the development server on port 3112
npm run dev

# Or with HTTPS support
npm run dev:https
```

#### Production Mode

```bash
# Build the application
npm run build

# Start the production server on port 3112
npm run start

# Or start with HTTPS
npm run start:https
```

### 🆚 Docker vs Local Development Comparison

| Feature | 🐳 Docker | 💻 Local |
|---------|----------|----------|
| **Setup Time** | ⚡ 2 minutes | 🕐 5-10 minutes |
| **Dependencies** | ✅ Pre-installed | ❌ Manual install |
| **SMB Client** | ✅ Included | ❌ System dependent |
| **Cross-platform** | ✅ Works everywhere | ❌ OS-specific setup |
| **Isolation** | ✅ Containerized | ❌ System-wide |
| **Port** | 3112 | 3112 |
| **Best For** | Production, Quick start | Development, Debugging |

**💡 Recommendation: Use Docker for production and quick testing, local setup for active development.**

## Running with Docker (Recommended)

Docker provides the easiest way to run this application with all dependencies included.

### Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/OBS-Connection-Editor.git
   cd OBS-Connection-Editor
   ```

2. **Configure SMB settings:**
   ```bash
   cp .env.example .env
   # Edit .env with your SMB server details
   nano .env
   ```

3. **Run with Docker Compose:**
   ```bash
   # Build and run (recommended - stable HTTP version)
   docker-compose -f docker-compose.simple.yml up -d
   
   # OR with HTTPS support (may have certificate issues in some environments)
   docker-compose up -d
   ```

4. **Access the application:**
   - Open your browser to: **http://localhost:3112**

### Docker Configuration Options

#### Option 1: Simple HTTP Deployment (Recommended)
```bash
# Uses Dockerfile.simple - most reliable
docker-compose -f docker-compose.simple.yml up -d
```

#### Option 2: HTTPS Deployment
```bash
# Uses original Dockerfile with HTTPS certificates
docker-compose up -d
```

#### Option 3: Manual Docker Build
```bash
# Build manually
docker build -t obs-connection-editor .
docker run -d -p 3112:3112 --env-file .env obs-connection-editor
```

### Environment Variables (.env file)

Create a `.env` file with your SMB server configuration:

```env
# SMB Server Configuration
SMB_ADDRESS=192.168.40.145
SMB_SHARE_NAME=OBS Multi
SMB_USERNAME=guest
SMB_PASSWORD=
SMB_FILE_PATH=src/App.svelte

# Application Configuration
NODE_ENV=production
PORT=3112
```

### Docker Management Commands

```bash
# Check container status
docker ps | grep obs

# View application logs
docker logs obs-connection-editor -f

# Restart the container
docker-compose -f docker-compose.simple.yml restart

# Stop and remove
docker-compose -f docker-compose.simple.yml down

# Rebuild after code changes
docker-compose -f docker-compose.simple.yml up --build
```

### Troubleshooting Docker Issues

**Container won't start:**
```bash
docker logs obs-connection-editor
```

**SMB connection issues:**
```bash
# Test SMB connectivity from container
docker exec -it obs-connection-editor smbclient -L 192.168.40.145 -U guest%

# Check API endpoint
curl http://localhost:3112/api/check-smb
```

**Port already in use:**
```bash
# Check what's using port 3112
lsof -i :3112

# Or modify docker-compose.simple.yml to use different port:
ports:
  - "3113:3112"  # Use port 3113 instead
```

## Key Dependencies

The application requires these dependencies (all installed automatically with npm install):

- **Next.js 15.1.0**: Framework for server-rendered React applications
- **React 19**: UI library
- **@marsaud/smb2**: For SMB file system integration
- **next-themes**: For theme management
- **https-localhost**: For HTTPS support in local development

## Implementation Notes

### SMB Integration

The application connects to an SMB share at `//192.168.40.145/OBS Multi` to read and write the `src/App.svelte` file.

### Real-time Updates

The system uses two mechanisms for real-time updates:

1. **Webhook System**: A Server-Sent Events (SSE) endpoint at `/api/webhook` that clients connect to for receiving push notifications
2. **Regular Polling**: A polling mechanism checks for file changes every 5 seconds by fetching `/api/poll-updates`

### Security

For the File System Access API to work properly, the application runs in HTTPS mode using a local certificate.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
