# Codebase Analysis: OBS-Connection-Editor

## 1. Introduction
This document provides an analysis of the `OBS-Connection-Editor` codebase, outlining its structure, key technologies, and the functionality of its backend services. The application appears to be a Next.js project designed to interact with SMB (Server Message Block) shares, likely for managing OBS (Open Broadcaster Software) related files or configurations. It includes features for checking SMB connectivity, polling for file updates, reading and saving files, and broadcasting updates via webhooks.

## 2. Project Structure
The project follows a typical Next.js application structure with additional directories for components, hooks, and utility functions.

*   `.gitignore`: Specifies intentionally untracked files to ignore.
*   `Dockerfile`: Defines the Docker image for the application.
*   `README.md`: Project README file.
*   `app/`: Contains the main Next.js application logic.
    *   `api/`: Houses the backend API routes.
        *   `check-smb/`: API for checking SMB connectivity.
        *   `poll-updates/`: API for polling SMB file for updates.
        *   `read-file/`: API for reading content from an SMB file.
        *   `save-file/`: API for saving content to an SMB file.
        *   `webhook/`: API for handling Server-Sent Events (SSE) and broadcasting updates.
    *   `globals.css`: Global CSS styles.
    *   `layout.tsx`: Root layout for the Next.js application.
    *   `page.tsx`: Main application page.
*   `components/`: Reusable UI components.
    *   `theme-provider.tsx`: Context provider for theme management.
    *   `ui/`: Contains various UI components built with Radix UI and Tailwind CSS.
*   `hooks/`: Custom React hooks.
*   `lib/`: Utility functions (e.g., `utils.ts`).
*   `next.config.mjs`: Next.js configuration file.
*   `package.json`: Project metadata, dependencies, and scripts.
*   `postcss.config.mjs`: PostCSS configuration.
*   `public/`: Static assets.
*   `server.js`: Custom Node.js server for HTTPS.
*   `styles/`: Additional stylesheets.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `tsconfig.json`: TypeScript configuration.

## 3. Technologies Used
The project leverages a modern web development stack:

*   **Next.js**: React framework for building server-rendered React applications.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Radix UI**: Open-source UI component library for building high-quality, accessible design systems.
*   **`@marsaud/smb2`**: Likely used for SMB file sharing capabilities (though `child_process` and `smbclient` are directly used in API routes).
*   **`https-localhost`**: Used in `server.js` to enable HTTPS development.
*   **`child_process`**: Node.js module for spawning child processes, used here to execute `smbclient` commands.
*   **`zod`**: TypeScript-first schema declaration and validation library.
*   **`react-hook-form`**: Forms library for React.

## 4. Backend Services (API Routes)

The `app/api` directory contains several API routes, each serving a specific purpose related to SMB interaction and real-time updates.

### 4.1. `/api/check-smb`
*   **Method**: `GET`
*   **Purpose**: Verifies connectivity to an SMB share and checks for file readability.
*   **Functionality**:
    1.  Attempts to list SMB shares on the configured address.
    2.  Attempts to connect to the specific SMB share (`SMB_ADDRESS`/`SMB_SHARE_NAME`).
    3.  Attempts to read a specific file (`SMB_FILE_PATH`) from the share.
    4.  Returns `success: true` if all tests pass, otherwise returns `success: false` with error details.
*   **Dependencies**: `child_process` (for `smbclient` commands), `NextResponse`, `NextRequest`.
*   **Environment Variables**: `SMB_ADDRESS`, `SMB_SHARE_NAME`, `SMB_USERNAME`, `SMB_PASSWORD`, `SMB_FILE_PATH`.

### 4.2. `/api/poll-updates`
*   **Method**: `GET`
*   **Purpose**: Periodically checks a specific SMB file for content changes and triggers a webhook if changes are detected.
*   **Functionality**:
    1.  Reads the content of `SMB_FILE_PATH` from the SMB share.
    2.  Generates an MD5 hash of the file content.
    3.  Compares the current hash with a `lastContentHash` stored in memory.
    4.  If the content has changed, it updates `lastContentHash` and sends a `POST` request to `/api/webhook`.
    5.  Returns `hasChanged` status and a timestamp.
*   **Dependencies**: `child_process` (for `smbclient`), `crypto`, `NextResponse`, `NextRequest`.
*   **Environment Variables**: Hardcoded SMB path and credentials in the `execAsync` call, which should ideally use the same environment variables as `check-smb`.

### 4.3. `/api/read-file`
*   **Method**: `GET`
*   **Purpose**: Reads and returns the content of a specified file from the SMB share.
*   **Functionality**:
    1.  Constructs an `smbclient` command to get the content of `SMB_FILE_PATH`.
    2.  Executes the command and captures the standard output as the file content.
    3.  Includes error handling and an alternative command execution if the initial attempt fails.
    4.  Returns the file content in the response.
*   **Dependencies**: `child_process` (for `smbclient`), `NextResponse`, `NextRequest`.
*   **Environment Variables**: `SMB_ADDRESS`, `SMB_SHARE_NAME`, `SMB_USERNAME`, `SMB_PASSWORD`, `SMB_FILE_PATH`.

### 4.4. `/api/save-file`
*   **Method**: `POST`
*   **Purpose**: Saves provided content to a specified file on the SMB share.
*   **Functionality**:
    1.  Receives file content from the request body.
    2.  Creates a temporary file on the local filesystem with the provided content.
    3.  Uses `smbclient` to "put" (upload) the temporary file to the `SMB_FILE_PATH` on the SMB share.
    4.  Includes error handling and an alternative command execution if the initial attempt fails.
    5.  Deletes the temporary file after the upload attempt.
    6.  Returns `success: true` upon successful save.
*   **Dependencies**: `child_process` (for `smbclient`), `fs`, `path`, `os`, `NextResponse`, `NextRequest`.
*   **Environment Variables**: `SMB_ADDRESS`, `SMB_SHARE_NAME`, `SMB_USERNAME`, `SMB_PASSWORD`, `SMB_FILE_PATH`.

### 4.5. `/api/webhook`
*   **Methods**: `GET`, `POST`
*   **Purpose**:
    *   `GET`: Establishes a Server-Sent Events (SSE) connection for real-time updates.
    *   `POST`: Triggers an update broadcast to all connected SSE clients.
*   **Functionality**:
    *   **`GET`**:
        1.  Creates a `ReadableStream` to handle SSE.
        2.  Assigns a unique client ID and sends an initial "connected" message.
        3.  Adds the client's controller to a global `clients` array.
        4.  Removes the client from the array when the connection is aborted.
    *   **`POST`**:
        1.  Reads the content of `SMB_FILE_PATH` from the SMB server.
        2.  Calls `broadcastUpdate` to send the new content and a timestamp to all active SSE clients.
        3.  Returns the success status and the count of connected clients.
*   **Dependencies**: `child_process` (for `smbclient`), `NextResponse`, `NextRequest`.
*   **Environment Variables**: Hardcoded SMB path and credentials in the `execAsync` call, similar to `poll-updates`.

## 5. HTTPS Setup
The `server.js` file sets up a custom Node.js server to enable HTTPS for the Next.js application during development.
*   It uses the `https-localhost` package to create an HTTPS server.
*   It dynamically retrieves local IP addresses to generate SSL certificates for `localhost` and all local IPs, allowing access via HTTPS from various network interfaces.
*   It proxies all requests to the Next.js application handler.
*   The server listens on port `3112` (or `process.env.PORT` if set).

## 6. Frontend Components and Hooks
The `components/` and `hooks/` directories contain reusable UI elements and logic:

*   **`components/ui/`**: A comprehensive collection of UI components (e.g., `button.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `table.tsx`) built using Radix UI primitives and styled with Tailwind CSS. These form the building blocks of the application's user interface.
*   **`components/theme-provider.tsx`**: Manages the application's theme (e.g., dark mode) using `next-themes`.
*   **`hooks/use-mobile.tsx`**: A custom hook likely for detecting mobile screen sizes or states.
*   **`hooks/use-toast.ts`**: A custom hook for displaying toast notifications, possibly integrating with `sonner` or `@radix-ui/react-toast`.

## 7. Utility Functions
*   **`lib/utils.ts`**: Contains general utility functions, likely including `cn` for conditionally joining Tailwind CSS classes.

This analysis provides a foundational understanding of the `OBS-Connection-Editor` project, highlighting its architecture, dependencies, and core functionalities.