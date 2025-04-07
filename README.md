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

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
