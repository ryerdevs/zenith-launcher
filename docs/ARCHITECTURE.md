# Architecture Overview

Zenith Launcher utiliza una arquitectura híbrida que combina una shell de escritorio de alto rendimiento basada en Rust (Tauri), un frontend moderno en React (Vite + React + TypeScript), y un backend robusto en Python (Flask) para la lógica del launcher.

## High-Level Diagram

```mermaid
graph TD
    User[User] -->|Interacts| Frontend[React Frontend]
    Frontend -->|Tauri Commands| Tauri[Tauri Core - Rust]
    Frontend -->|HTTP / SSE| Backend[Python Backend - Flask]
    
    subgraph Desktop App
        Frontend
        Tauri
        Backend
    end
    
    Backend -->|File System| Minecraft[Minecraft Files]
    Backend -->|Network| Mojang[Mojang/Microsoft API]
    Backend -->|Network| CurseForge[CurseForge API]
    Backend -->|Network| FabricMC[Fabric/Quilt APIs]
    Backend -->|Network| Maven[Maven Repositories]
```

---

## Components

### 1. Frontend (`web/src`)

Construido con React, TypeScript, y Vite. Maneja todas las interacciones de usuario y renderizado de UI.

**Estructura:**
- **`core/`**: Lógica central independiente de la UI
  - `api/`: Cliente TypeScript para el backend Python
  - `state/`: Zustand store (`useLauncher`) para estado global
  
- **`modules/`**: Módulos basados en features
  - `auth/`: Lógica y UI de autenticación
  - `navigation/`: Bottombar, Sidebar, Topbar, PlayButton
  - `views/`: Vistas principales (`Home`, `Instances`, `Console`, `Settings`)
  
- **`ui/`**: Componentes de UI reutilizables (basados en Shadcn/UI)
  - Buttons, Inputs, Dialogs, Cards, etc.

---

### 2. Backend (`api/app`)

Construido con Python y Flask. Corre como un proceso sidecar administrado por Tauri.

#### Backend Architecture - Three-Tier Design

```mermaid
graph TB
    subgraph "Routes Layer - API Endpoints"
        auth_bp[auth.py<br/>Authentication]
        info_bp[info.py<br/>MC Versions & Loaders]
        instances_bp[instances.py<br/>Instance CRUD]
        launch_bp[launch.py<br/>Game Launch]
        settings_bp[settings.py<br/>Settings Management]
    end
    
    subgraph "Services Layer - Business Logic"
        subgraph "Instance Services"
            instance_svc[instance_service<br/>CRUD Operations]
            modpack_svc[modpack_service<br/>Modpack Parsing]
            modpack_inst[modpack_installer<br/>Mod Downloads]
            image_svc[image_service<br/>Image Processing]
            content_svc[content_service<br/>Resource/Shader Packs]
            fs_svc[file_system_service<br/>Directory Structure]
            state_svc[instance_state_service<br/>State Tracking]
        end
        
        subgraph "Game Services"
            launcher_svc[launcher<br/>Process Management]
            installer_svc[installer<br/>MC/Loader Installation]
            custom_svc[custom_loaders<br/>NeoForge/Forge Logic]
        end
        
        subgraph "External Services"
            cf_svc[curseforge<br/>API Integration]
        end
    end
    
    subgraph "Core Layer - Utilities"
        sse[sse.py<br/>Event Streaming]
        config[config.py<br/>Configuration]
    end
    
    auth_bp --> instance_svc
    info_bp --> config
    instances_bp --> instance_svc
    instances_bp --> modpack_svc
    instances_bp --> modpack_inst
    instances_bp --> image_svc
    instances_bp --> content_svc
    instances_bp --> fs_svc
    launch_bp --> launcher_svc
    settings_bp --> config
    
    launcher_svc --> installer_svc
    launcher_svc --> instance_svc
    launcher_svc --> sse
    installer_svc --> custom_svc
    installer_svc --> sse
    modpack_inst --> cf_svc
    modpack_inst --> sse
```

#### Directory Structure

```
api/app/
├── config.py              # Configuration & paths
├── __init__.py            # App factory
├── core/                  # Core utilities
│   ├── __init__.py
│   └── sse.py             # Server-Sent Events system
├── routes/                # API Endpoints (Blueprints)
│   ├── __init__.py
│   ├── auth.py            # /api/auth/* - Authentication
│   ├── info.py            # /api/info/* - Versions & loaders
│   ├── instances.py       # /api/instances/* - Instance CRUD
│   ├── launch.py          # /api/launcher/* - Game launch
│   └── settings.py        # /api/settings/* - Settings management
└── services/              # Business Logic
    ├── __init__.py
    ├── external/          # External API integrations
    │   ├── __init__.py
    │   └── curseforge.py  # CurseForge API client
    ├── game/              # Game execution & installation
    │   ├── __init__.py
    │   ├── installer.py   # Minecraft/Loader installer
    │   ├── launcher.py    # Game process manager
    │   └── custom_loaders.py  # Custom NeoForge/Forge logic
    └── instances/         # Instance management
        ├── __init__.py
        ├── instance_service.py        # Core CRUD
        ├── modpack_service.py         # Modpack parsing
        ├── modpack_installer.py       # Mod downloads
        ├── image_service.py           # Image processing
        ├── content_service.py         # Resource packs, etc.
        ├── file_system_service.py     # Directory creation
        └── instance_state_service.py  # State tracking
```

#### Key Backend Patterns

**Singleton Services:**
Todos los servicios se exportan como singletons para compartir estado:
```python
# En instance_service.py
instance_service = InstanceService()

# Uso en routes
from app.services.instances.instance_service import instance_service
instances = instance_service.list_instances()
```

**SSE Event System:**
Sistema centralizado de eventos para comunicación en tiempo real:
```python
from app.core.sse import announce

announce('installing', 'Descargando librerías...', progress=45)
announce('log', '[INFO] Game started')
announce('error', 'Java not found')
```

**Threading para operaciones largas:**
```python
threading.Thread(
    target=launcher_service.launch_thread,
    args=(instance_id, username),
    daemon=True
).start()
```

---

### 3. Desktop Shell (`src-tauri`)

Administra la ventana de la aplicación y spawns el proceso backend de Python como sidecar.

**Responsabilidades:**
- Window management (size, decorations, etc.)
- Python backend lifecycle (spawn, monitor, terminate)
- Native OS integrations (file dialogs, etc.)
- Production bundling (PyInstaller + Tauri)

---

## Data Flow Examples

### Example 1: Instance Creation

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant instances_bp as instances.py
    participant instance_svc as instance_service
    participant fs_svc as file_system_service
    participant image_svc as image_service
    participant FileSystem
    
    User->>Frontend: Click "Create Instance"
    Frontend->>instances_bp: POST /instances/create
    instances_bp->>instance_svc: create_instance(...)
    instance_svc->>fs_svc: create_instance_structure()
    fs_svc->>FileSystem: Create dirs (mods, saves, etc.)
    instance_svc->>image_svc: process_image(image_data)
    image_svc->>FileSystem: Save image file
    image_svc-->>instance_svc: image_path
    instance_svc->>FileSystem: Save instance.json
    instance_svc-->>instances_bp: {id, message}
    instances_bp-->>Frontend: 200 OK
    Frontend->>User: Show success message
```

---

### Example 2: Game Launch with SSE

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant SSE as /api/events
    participant launch_bp as launch.py
    participant launcher_svc as launcher_service
    participant installer_svc as installer
    participant Minecraft
    
    Frontend->>SSE: Connect EventSource
    User->>Frontend: Click "Play"
    Frontend->>launch_bp: POST /launcher/launch
    launch_bp->>launcher_svc: launch_thread() [async]
    launch_bp-->>Frontend: 200 {status: "launching"}
    
    launcher_svc->>launcher_svc: Check instance state
    
    alt Instance not ready
        launcher_svc->>installer_svc: install_task()
        installer_svc->>SSE: announce('installing', ...)
        SSE-->>Frontend: Event: installing
        Frontend->>User: Update progress bar
        installer_svc->>installer_svc: Download files
        installer_svc->>SSE: announce('progress', ..., 45)
        SSE-->>Frontend: Event: progress
    end
    
    launcher_svc->>Minecraft: spawn subprocess
    launcher_svc->>SSE: announce('launching', 'Iniciando...')
    SSE-->>Frontend: Event: launching
    
    loop Read stdout
        Minecraft->>launcher_svc: Log line
        launcher_svc->>SSE: announce('log', line)
        SSE-->>Frontend: Event: log
        Frontend->>User: Append to console
    end
    
    launcher_svc->>SSE: announce('running', 'Minecraft ejecutándose')
    SSE-->>Frontend: Event: running
    Frontend->>User: Update status badge
    
    Minecraft->>launcher_svc: Process exits
    launcher_svc->>SSE: announce('closed', 'Juego cerrado')
    SSE-->>Frontend: Event: closed
    Frontend->>User: Reset UI
```

---

### Example 3: Modpack Import

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant instances_bp as instances.py
    participant modpack_svc as modpack_service
    participant modpack_inst as modpack_installer
    participant cf_svc as curseforge
    participant SSE
    
    User->>Frontend: Select modpack.zip
    Frontend->>instances_bp: POST /instances/import-modpack
    instances_bp->>modpack_svc: parse_modpack(zip_file)
    modpack_svc->>modpack_svc: Extract manifest.json
    modpack_svc-->>instances_bp: manifest_data
    instances_bp->>instances_bp: Create instance structure
    instances_bp->>modpack_inst: install_mods_deferred()
    modpack_inst->>SSE: announce('downloading', 'Mod: JEI', 10)
    SSE-->>Frontend: Event: downloading
    modpack_inst->>cf_svc: download_mod(mod_id)
    cf_svc-->>modpack_inst: mod_file
    modpack_inst->>SSE: announce('downloading', 'Mod: REI', 50)
    modpack_inst->>modpack_inst: Save to mods/
    instances_bp-->>Frontend: 200 {status: "success", id: ...}
```

---

## File System Structure

### Development Mode
```
desktop/
├── api/                   # Python backend
├── web/                   # React frontend
├── src-tauri/             # Tauri shell
└── data/                  # Runtime data
    ├── libraries/         # Minecraft assets, versions
    │   ├── assets/
    │   ├── libraries/
    │   ├── versions/
    │   ├── cache.json
    │   └── settings.json
    └── instances/         # Game instances
        └── My_Instance/
            ├── instance.json
            ├── instance_image.jpg
            ├── mods/
            ├── resourcepacks/
            ├── shaderpacks/
            ├── saves/
            └── ...
```

### Production Mode
```
ZenithLauncher/          # Installation directory
├── Zenith.exe           # Tauri app
├── data/                # Same structure as dev
│   ├── libraries/
│   └── instances/
└── ...                  # Tauri resources
```

**Path Detection:**
```python
# config.py
def get_base_path():
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent  # Production
    else:
        return Path(__file__).resolve().parents[3]  # Development
```

---

## Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library

### Backend
- **Flask** - Web framework
- **minecraft-launcher-lib** - Minecraft API wrapper
- **requests** - HTTP client
- **threading** - Async operations

### Desktop Shell
- **Tauri 1.x** - Desktop framework (Rust)
- **PyInstaller** - Python bundler for production

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Backend Start | `python api/main.py --dev` | Spawned by Tauri as sidecar |
| Frontend | Vite dev server (port 5173) | Static build served by Tauri |
| Hot Reload | ✅ Enabled (`--dev` flag) | ❌ Disabled |
| File Paths | Relative to `desktop/` | Relative to `.exe` location |
| Cache | Disabled for some APIs | Fully enabled |
| Bundling | Separate processes | Single executable |

---

## Security Considerations

- CORS enabled for `localhost` only during development
- File system operations sandboxed to `data/` directory
- Offline authentication uses UUID v3 (deterministic)
- No sensitive data persisted (tokens, passwords)
- Subprocess spawning with `CREATE_NO_WINDOW` on Windows

---

## Performance Optimizations

1. **Caching:** Version lists cached for 1 hour
2. **Threading:** Long operations (install, launch) run in background threads
3. **SSE Buffering:** Messages queued for efficient delivery
4. **Lazy Loading:** Mods downloaded on first launch (modpacks)
5. **Singleton Pattern:** Services reuse instances

---

## Error Handling

**Backend Pattern:**
```python
try:
    # Operation
    return jsonify({"status": "success", ...})
except Exception as e:
    announce('error', str(e))
    return jsonify({"status": "error", "message": str(e)}), 500
```

**Frontend Pattern:**
```typescript
try {
    const result = await api.instances.create(data);
    // Success
} catch (error) {
    showToast("Error", error.message);
}
```

**SSE Error Propagation:**
```python
# Backend sends error
announce('error', 'Java not found')

# Frontend listens
eventSource.onmessage = (event) => {
    if (data.status === 'error') {
        showErrorToast(data.message);
    }
}
```