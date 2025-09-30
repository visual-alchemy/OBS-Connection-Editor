# 🐳 Docker Deployment Guide for OBS Connection Editor

## ✅ **SUCCESS - Container is Running!**

Your OBS Connection Editor is successfully running in Docker with the following configuration:

### 🌐 **Access Information**
- **Primary URL**: http://localhost:3112
- **Container Status**: ✅ Running
- **Port Mapping**: 3112:3112 (Host:Container)
- **Network**: Custom bridge network for isolation

---

## 🚀 **Quick Commands**

### **Current Running Container**
```bash
# Check status
docker ps | grep obs

# View logs
docker logs obs-connection-editor -f

# Stop container
docker-compose -f docker-compose.simple.yml down
```

### **Restart/Rebuild**
```bash
# Restart the container
docker-compose -f docker-compose.simple.yml restart

# Rebuild and restart
docker-compose -f docker-compose.simple.yml up --build -d

# Stop and remove everything
docker-compose -f docker-compose.simple.yml down --volumes
```

---

## 📁 **Available Docker Files**

### 1. **Dockerfile.simple** (✅ Currently Running)
- **Purpose**: HTTP-only deployment (no HTTPS certificate issues)
- **Command**: `docker-compose -f docker-compose.simple.yml up`
- **Best for**: Local development and testing

### 2. **Dockerfile** (Original)
- **Purpose**: Full HTTPS deployment
- **Command**: `docker-compose up`
- **Note**: May have certificate generation issues in some Docker environments

### 3. **Dockerfile.optimized** (Advanced)
- **Purpose**: Multi-stage production build
- **Features**: Smaller image, non-root user, health checks
- **Build**: `docker build -f Dockerfile.optimized -t obs-editor:prod .`

---

## ⚙️ **Environment Configuration**

Your current `.env` file contains:
```env
SMB_ADDRESS=192.168.40.145
SMB_SHARE_NAME=OBS Multi
SMB_USERNAME=guest
SMB_PASSWORD=
SMB_FILE_PATH=src/App.svelte
NODE_ENV=production
PORT=3112
```

### **To modify SMB settings:**
1. Edit `.env` file with your SMB server details
2. Restart container: `docker-compose -f docker-compose.simple.yml restart`

---

## 🔧 **Troubleshooting**

### **Container Won't Start**
```bash
# Check logs
docker logs obs-connection-editor

# Rebuild from scratch
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml up --build
```

### **SMB Connection Issues**
```bash
# Test SMB connectivity from container
docker exec -it obs-connection-editor smbclient -L 192.168.40.145 -U guest%

# Check API endpoint
curl http://localhost:3112/api/check-smb
```

### **Port Already in Use**
```bash
# Find what's using port 3112
lsof -i :3112

# Or use different port in docker-compose.simple.yml:
ports:
  - "3113:3112"  # Use port 3113 instead
```

---

## 📊 **Production Deployment Options**

### **Option 1: Simple HTTP (Current)**
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### **Option 2: With HTTPS (if needed)**
```bash
# Edit server.js to handle Docker environment
docker-compose up -d
```

### **Option 3: Optimized Production**
```bash
docker build -f Dockerfile.optimized -t obs-editor:prod .
docker run -d -p 3112:3112 --env-file .env obs-editor:prod
```

---

## 🎯 **Next Steps**

1. **✅ Application is running**: http://localhost:3112
2. **Configure SMB**: Edit `.env` with your SMB server details
3. **Test Connection**: Use the web interface to test SMB connectivity
4. **Production**: Use `docker-compose.simple.yml` for stable deployment

---

## 📝 **Container Information**

- **Image Size**: ~1GB (includes Node.js + dependencies + samba-client)
- **Runtime**: Node.js 22 Alpine Linux
- **Features**: SMB client, Next.js production build, auto-restart
- **Data Persistence**: `./data` directory mounted to `/app/data`

---

**🎉 Your OBS Connection Editor is ready to use!**