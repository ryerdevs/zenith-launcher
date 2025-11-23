# Backend API Documentation

The Python backend runs on `http://localhost:5000/api`. The frontend communicates with it using standard HTTP requests and Server-Sent Events (SSE) for real-time updates.

## Base URL
`http://localhost:5000/api`

## Endpoints

### Instances (`/instances`)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all instances. | - |
| `POST` | `/create` | Create a new instance. | `{ name, version, loader, loaderVersion }` |
| `POST` | `/import-modpack` | Import from CurseForge ZIP. | `FormData: { file: zipFile }` |
| `POST` | `/<id>/install` | Install/Repair instance. | - |
| `DELETE` | `/<id>` | Delete an instance. | - |
| `POST` | `/<id>/open-folder` | Open instance folder in OS. | - |

### Launcher (`/launcher`)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/launch` | Launch an instance. | `{ instanceName, username }` |
| `POST` | `/kill` | Kill the running game process. | - |

### Authentication (`/auth`)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/login_offline` | Login in offline mode. | `{ username }` |
| `POST` | `/microsoft` | Start Microsoft OAuth flow. | - |

### Information (`/info`)

| Method | Endpoint | Description | Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/vanilla` | List vanilla MC versions. | - |
| `GET` | `/loaders` | List mod loaders (Forge/Fabric and others). | `?mc_version=1.20.1&loader=forge` |

### Settings (`/settings`)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get current settings. | - |
| `POST` | `/update` | Update settings. | `{ java_path, ram_gb, ... }` |

## Real-Time Events (SSE)

The backend pushes events to `/api/events`.

- **`log`**: Console log output from the game.
- **`status`**: Game status changes (`idle`, `running`, etc.).
- **`progress`**: Download/Install progress updates.
