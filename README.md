# OBS Connection Editor

A specialized tool for managing OBS WebSocket connections with enhanced features for safer editing and better user experience.

## Features

| Feature | Description |
|---------|-------------|
| **Visual Editing** | Purpose-built UI for connection management |
| **Auto-Refresh** | Built-in Grafana-style auto-refresh (5s to 1h intervals) that only updates changed data |
| **Preventing Syntax Errors** | Guards against accidental deletion of important syntax elements in Svelte files |
| **Connection Sorting** | Native filtering and sorting by category, name, and address |
| **Multi-Client Support** | All connected clients stay in sync |
| **Connection Visibility Control** | Toggle connections on/off with a single click |
| **Clean Interface** | Modern, responsive UI with straightforward controls |
| **Secure Data Handling** | Built-in secure context for data integrity |

## 🚀 Getting Started

These instructions will help you set up the project on your local machine.

### 📋 Prerequisites

Before you begin, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Samba share with OBS configuration files

### 🔧 Installation Steps

1. **Download the Project**
   ```bash
   # Clone this repository
   git clone https://github.com/yourusername/obs-connection-editor.git
   # Go into the project folder
   cd obs-connection-editor
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the Development Server**
   ```bash
   # Run the development server with HTTPS (required for file access)
   npm run dev:https
   ```

4. **Access the Application**
   - Open your web browser
   - Go to `https://localhost:3001`
   - If you see a security warning, this is normal because we're using a self-signed certificate for development
   - Click "Advanced" and then "Proceed to localhost (unsafe)" to continue

### 🏗️ Build for Production

```bash
# Create a production build
npm run build

# Start the production server
npm run start:https
```

### 🛠️ Configuration

The application expects a Samba share with OBS configuration files. By default, it connects to:
- Share: `//192.168.40.145/OBS Multi`
- Username: `guest`
- No password required

If you need to use different Samba share settings, you'll need to modify the connection details in:
- `app/api/read-file/route.ts`
- `app/api/save-file/route.ts`

## 💡 Usage

1. Access the application at `https://localhost:3001` or your local IP with the same port
2. The application automatically loads your OBS connection file on startup
3. Manage connections using the intuitive interface:
   - Search for connections using the search box
   - Filter connections by category
   - Click "Edit" on any connection to modify its settings
   - Use the X button to close the edit panel when done
   - Toggle visibility with one click
   - Click "Update" to save your changes
4. Use the auto-refresh feature to keep multiple clients in sync (adjustable from 5s to 1h)
5. Changes are automatically saved to your OBS configuration

## ⚠️ Troubleshooting

1. **Installation Errors**
   - If you see any errors during `npm install`, try using:
     ```bash
     npm install --legacy-peer-deps
     ```

2. **Cannot Access the Website**
   - Make sure you're using `https://` not `http://`
   - Try accessing through `https://localhost:3001`

3. **Cannot Save Changes**
   - Verify that your Samba share is accessible
   - Check that you have write permissions on the share

## 🔧 Technologies

- Next.js 15
- React 19
- Tailwind CSS
- Shadcn UI Components
- Lucide Icons

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
