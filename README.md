# OBS Connection Editor

A web-based tool for managing OBS connections, built with Next.js.

## Features

- **SMB Integration**: Directly loads and saves files from `smb://192.168.40.145/OBS Multi/src/App.svelte`
- **Real-time Updates**: Webhook system that shows real-time changes to Svelte files
- **Connection Management**: Add, edit, delete, and toggle visibility of OBS connections
- **Filtering & Search**: Filter connections by category and search by name or address

## Technical Details

- **Server Port**: Runs on port 3001 by default
- **Real-time Updates**: Combines Server-Sent Events (SSE) for push notifications with regular polling
- **Secure Context**: Runs in HTTPS mode for better browser compatibility

## Installation

This repository has been optimized for GitHub upload by excluding npm dependencies. You'll need to install them after cloning:

```bash
# Clone the repository
git clone https://github.com/your-username/OBS-Connection-Editor.git
cd OBS-Connection-Editor

# Install all dependencies (use --legacy-peer-deps to handle peer dependency conflicts)
npm install --legacy-peer-deps
```

### Potential Installation Issues

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

### Development Mode

```bash
# Run the standard development server on port 3001
npm run dev

# Or run the development server with HTTPS support
npm run dev:https
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm run start

# Or start the production server with HTTPS
npm run start:https
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
