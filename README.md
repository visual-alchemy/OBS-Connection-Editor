# OBS Connection Editor

A user-friendly tool to manage OBS connections through a web interface. This tool allows you to view, edit, and manage your OBS connections easily.

## 🚀 Getting Started

These instructions will help you set up the project on your local machine. Don't worry if you're new to this - we'll guide you through each step!

### 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Samba share with OBS configuration files

### 🔧 Installation Steps

1. **Download the Project**
   ```bash
   # Clone this repository or download and extract the ZIP file
   git clone [repository-url]
   # Go into the project folder
   cd OBSConnectionEditor-main
   ```

2. **Install Dependencies**
   ```bash
   # Install all required packages
   # We use --legacy-peer-deps to ensure compatibility
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

### 🛠️ Configuration

The application expects a Samba share with OBS configuration files. By default, it connects to:
- Share: `//192.168.40.145/OBS Multi`
- Username: `guest`
- No password required

If you need to use different Samba share settings, you'll need to modify the connection details in:
- `app/api/read-file/route.ts`
- `app/api/save-file/route.ts`

### 💡 Usage

1. The main page shows all your OBS connections
2. Click "Edit" on any connection to modify its settings
3. Update the connection details in the form
4. Click "Update" to save your changes
5. The changes will be automatically saved to your OBS configuration

### ⚠️ Troubleshooting

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

### 🤝 Need Help?

If you run into any issues or need help, please:
1. Check the troubleshooting section above
2. Create an issue in the GitHub repository
3. Provide details about your problem and any error messages you see

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. 