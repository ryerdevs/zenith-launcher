# Developer Setup Guide

Follow these instructions to set up the Zenith Launcher development environment.

## Prerequisites

1.  **Node.js**: v18 or higher (LTS recommended).
2.  **Python**: v3.10 or higher.
3.  **Rust**: Latest stable version (required for Tauri).
4.  **Java**: Java 17 or 21 (recommended for modern Minecraft versions).

## Initial Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd zenith-launcher
    ```

2.  **Frontend Dependencies**
    ```bash
    cd web
    npm install
    ```

3.  **Backend Dependencies**
    Create a virtual environment in the root directory:
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # Linux/Mac
    python3 -m venv .venv
    source .venv/bin/activate
    ```
    
    Install Python packages:
    ```bash
    pip install -r api/requirements.txt
    ```

## Running in Development Mode

To start the full application (Frontend + Backend + Tauri Window):

1.  Open a terminal in the root directory.
2.  Run the dev command:
    ```bash
    npm run dev
    ```

This command uses `concurrently` to start:
- The Vite dev server (Frontend).
- The Flask backend (Python).
- The Tauri application window.

## Building for Production

To build the final executable (`.exe` or `.app`):

```bash
npm run build
```

This will:
1.  Build the React frontend (`web/dist`).
2.  Package the Python backend into a standalone executable (using PyInstaller).
3.  Bundle everything into the Tauri installer.

## Troubleshooting

-   **"Backend not connected"**: Ensure the Python process started correctly. Check the terminal logs for Flask errors.
-   **"Tauri error"**: Ensure you have the C++ build tools installed (Visual Studio Build Tools on Windows).
