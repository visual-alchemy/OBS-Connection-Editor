# OBS Connection Editor

A modern, user-friendly web application for managing OBS connection files. Built with Next.js and TypeScript, featuring a clean, intuitive interface and real-time updates.

## Features

| Feature | Description |
|---------|-------------|
| Visual Editing | Edit OBS connection files through a user-friendly interface |
| Auto-Refresh | Automatically loads and refreshes connection data |
| Secure Data Handling | Local file system operations with HTTPS support |
| Responsive Design | Works on desktop and mobile devices |
| Modern UI | Built with Shadcn UI Components and Lucide Icons |
| Real-time Updates | Changes are saved automatically to the connection file |

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- smbclient (for SMB share access)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/OBS-Connection-Editor.git
cd OBS-Connection-Editor
```

2. Install dependencies:
```bash
npm install
```

If you encounter dependency conflicts, try using legacy peer dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm run dev
```

4. For production with HTTPS:
```bash
npm run build
npm run start:https
```

The application will be available at `https://localhost:3001` or your local IP address.

## Usage

1. The application automatically loads the connection file on startup
2. Use the search and filter functionality to find specific connections
3. Click on a connection to edit its properties
4. Use the "X" button to close the edit panel
5. Changes are saved automatically when you modify a connection

## SMB Configuration

By default, the application connects to an SMB share to read and write the OBS connection file:

- SMB Share: `//192.168.40.145/OBS Multi`
- Path: `src/App.svelte`
- Username: `guest` (no password)

### Changing SMB Settings

If you need to use a different SMB share, IP address, or folder path, you must modify the following files:

1. `app/api/read-file/route.ts` - For reading the connection file
2. `app/api/save-file/route.ts` - For saving changes to the connection file

Example of what to change in both files:
```typescript
// Change this line in read-file/route.ts
const { stdout } = await execAsync(
  `smbclient "//YOUR-IP-ADDRESS/YOUR-SHARE-NAME" -U YOUR-USERNAME%YOUR-PASSWORD -c "get YOUR-PATH/App.svelte -"`
)

// Change this line in save-file/route.ts
await execAsync(
  `smbclient "//YOUR-IP-ADDRESS/YOUR-SHARE-NAME" -U YOUR-USERNAME%YOUR-PASSWORD -c "put ${tempFile} YOUR-PATH/App.svelte"`
)
```

## Technology Stack

- **Framework**: Next.js 15.1.0
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Icons**: Lucide Icons
- **Styling**: Tailwind CSS

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run start:https` - Start production server with HTTPS
- `npm run lint` - Run ESLint

### File Structure

- `/app` - Next.js app router pages and API routes
- `/components` - React components
- `/lib` - Utility functions and types
- `/public` - Static assets including the Vidio logo

## Troubleshooting

- **Installation Issues**: If you encounter errors during installation, try using `npm install --legacy-peer-deps`
- **Cannot Access Application**: Ensure you're using `https://` not `http://` in your browser
- **SMB Connection Errors**: Verify that your SMB share is accessible and that you have the correct credentials

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
