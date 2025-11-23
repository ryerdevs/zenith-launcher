# Architecture Overview

Zenith Launcher uses a hybrid architecture combining a high-performance Rust-based desktop shell (Tauri), a modern React frontend (Vite + React + TypeScript), and a robust Python backend (Flask + Python) for launcher logic.

## High-Level Diagram

```mermaid
graph TD
    User[User] -->|Interacts| Frontend[React Frontend (Web)]
    Frontend -->|Tauri Commands| Tauri[Tauri Core (Rust)]
    Frontend -->|HTTP / SSE| Backend[Python Backend (Flask)]
    
    subgraph Desktop App
        Frontend
        Tauri
        Backend
    end
    
    Backend -->|File System| Minecraft[Minecraft Files]
    Backend -->|Network| Mojang[Mojang/Microsoft API]
    Backend -->|Network| CurseForge[CurseForge API]
```

## Components

### 1. Frontend (`web/src`)
Built with React, TypeScript, and Vite. It handles all user interactions and UI rendering.

- **`core/`**: Core logic independent of UI (API clients, State management).
    - `api/`: TypeScript client for the Python backend.
    - `state/`: Zustand store (`useLauncher`) for global state.
- **`modules/`**: Feature-based modules.
    - `auth/`: Login logic and UI.
    - `navigation/`: Sidebar, Topbar, PlayButton.
    - `views/`: Main page views (`Home`, `Instances`, `Console`, `Settings`).
- **`ui/`**: Reusable UI components (Buttons, Inputs, Dialogs), mostly based on Shadcn/UI.

### 2. Backend (`api/app`)
Built with Python and Flask. It runs as a sidecar process managed by Tauri.

- **`routes/`**: API endpoints definition.
    - `instances.py`: CRUD operations for instances.
    - `auth.py`: Authentication logic.
    - `launcher.py`: Game launching and process management.
- **`services/`**: Business logic.
    - `instance_manager.py`: File system operations for instances.
    - `installer.py`: Downloads and installs Minecraft/Loaders.
    - `auth_service.py`: Microsoft authentication flow.

### 3. Desktop Shell (`src-tauri`)
Manages the application window and spawns the Python backend process.

## Data Flow

1. **User Action**: User clicks "Play".
2. **Frontend**: `InstancesView` calls `api.instances.launch()`.
3. **API Client**: Sends POST request to `http://localhost:5000/api/launcher/launch`.
4. **Backend**: 
    - Validates request.
    - `LauncherService` prepares the launch command.
    - Spawns the Minecraft process.
5. **Feedback**: Backend sends status updates (logs, progress) via Server-Sent Events (SSE) to the Frontend.
6. **UI Update**: `useLauncher` store updates `gameStatus`, reflecting changes in the UI.
