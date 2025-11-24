# Developer Setup Guide

Sigue estas instrucciones para configurar el entorno de desarrollo de Zenith Launcher.

---

## Prerequisites

1. **Node.js**: v18 o superior (LTS recomendado)
   - Verificar: `node --version`
   - Descargar: https://nodejs.org/

2. **Python**: v3.10 o superior
   - Verificar: `python --version` o `python3 --version`
   - Descargar: https://www.python.org/downloads/

3. **Rust**: Última versión stable (requerido para Tauri)
   - Verificar: `rustc --version`
   - Instalar: https://rustup.rs/

4. **Java**: Java 17 o 21 (recomendado para versiones modernas de Minecraft)
   - Verificar: `java -version`
   - Descargar: https://adoptium.net/

### Windows Additional Requirements

- **Visual Studio Build Tools 2019 o superior**
  - Descargar: https://visualstudio.microsoft.com/downloads/
  - Componentes requeridos:
    - C++ build tools
    - Windows 10 SDK

### Linux Additional Requirements

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.0-devel \
    openssl-devel \
    curl \
    wget \
    gcc \
    gcc-c++ \
    gtk3-devel \
    libappindicator-gtk3 \
    librsvg2-devel

# Arch
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    openssl \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zenith-launcher
```

### 2. Frontend Dependencies

```bash
cd web
npm install
cd ..
```

**Tiempo estimado:** 1-2 minutos

### 3. Backend Dependencies

Crea un ambiente virtual en el directorio raíz:

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Instala los paquetes Python:

```bash
pip install -r api/requirements.txt
```

**Dependencias instaladas:**
- `flask` - Web framework
- `flask-cors` - CORS support
- `minecraft-launcher-lib` - Minecraft API wrapper
- `requests` - HTTP client

### 4. Root Dependencies (Opcional)

Si quieres usar el comando `npm run dev` desde la raíz:

```bash
npm install
```

Esto instala `concurrently` para correr múltiples procesos.

---

## Running in Development Mode

### Option 1: All-in-One Command (Recommended)

Desde el directorio raíz:

```bash
npm run dev
```

Esto inicia simultáneamente:
- ✅ Vite dev server (Frontend) en `http://localhost:5173`
- ✅ Flask backend (Python) en `http://localhost:5000`
- ✅ Tauri application window

### Option 2: Individual Processes

Para debugging más granular, puedes iniciar cada componente por separado:

**Terminal 1 - Backend:**
```bash
# Activar venv primero
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

python api/main.py --dev
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
```

**Terminal 3 - Tauri:**
```bash
npm run tauri dev
```

---

## Development Mode Features

### Backend Hot Reload

Cuando inicias el backend con el flag `--dev`:

```python
python api/main.py --dev
```

**Características habilitadas:**
- ✅ Hot reload automático al guardar archivos Python
- ✅ Debug mode activo
- ✅ Logs detallados en consola
- ✅ Cache deshabilitado para algunas APIs (e.g., NeoForge)

**Logs esperados:**
```
[00:43:28] [API] Iniciando servidor...
[00:43:28] [API] [DEV] MODO DESARROLLO: Hot Reload ACTIVADO
[CONFIG] Directorio de datos: D:\Zenith\desktop\data
* Running on http://127.0.0.1:5000
```

### Frontend Hot Module Replacement (HMR)

Vite proporciona HMR automático:
- Cambios en React components se reflejan instantáneamente
- Estado de la aplicación se preserva cuando es posible
- Console limpia de errores

---

## IDE Setup Recommendations

### Visual Studio Code

**Extensiones recomendadas:**
- Python (Microsoft)
- Pylance (Microsoft)
- ESLint (Microsoft)
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- rust-analyzer
- Tauri

**Settings (`.vscode/settings.json`):**
```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### PyCharm

1. **Configurar intérprete:**
   - Settings → Project → Python Interpreter
   - Seleccionar `.venv/bin/python`

2. **Marcar directorios:**
   - `api/` → Mark Directory as → Sources Root

3. **Run Configurations:**
   - Script path: `api/main.py`
   - Parameters: `--dev`
   - Working directory: Project root

---

## Debugging

### Backend Debugging (Python)

**VSCode Launch Config (`.vscode/launch.json`):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask Backend",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/api/main.py",
      "args": ["--dev"],
      "console": "integratedTerminal",
      "justMyCode": false,
      "env": {
        "FLASK_APP": "api/main.py",
        "FLASK_ENV": "development"
      }
    }
  ]
}
```

**Breakpoints:**
```python
# En cualquier archivo de routes o services
def my_function():
    import pdb; pdb.set_trace()  # Python debugger
    # O simplemente coloca un breakpoint en VSCode
```

### Frontend Debugging (React)

**Browser DevTools:**
1. Abre Chrome/Edge DevTools (F12)
2. Sources tab → encuentra tu componente en `src/`
3. Coloca breakpoints

**VSCode Debugger:**
```json
{
  "name": "Chrome: Frontend",
  "type": "chrome",
  "request": "launch",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/web"
}
```

### SSE Debugging

**Monitorear eventos en vivo:**

```javascript
// En browser console
const eventSource = new EventSource('http://localhost:5000/api/events');
eventSource.onmessage = (event) => {
  console.log('[SSE]', JSON.parse(event.data));
};
```

**Backend logging:**
```python
from app.core.sse import announce

# Log detallado
announce('log', f'[DEBUG] Variable value: {my_var}')
```

---

## Testing Individual Components

### Test Backend API

**Health Check:**
```bash
curl http://localhost:5000/api/health
# {"status":"ok","server":"MineLauncher API"}
```

**List Instances:**
```bash
curl http://localhost:5000/api/instances
```

**Test SSE:**
```bash
curl -N http://localhost:5000/api/events
# Stream de eventos
```

### Test Frontend Isolated

```bash
cd web
npm run dev
```

Accede a `http://localhost:5173` en el navegador.

---

## Building for Production

Para construir el ejecutable final:

```bash
npm run build
```

Esto ejecuta:
1. `npm run build:frontend` - Build de React
2. `npm run build:backend` - PyInstaller bundle
3. `npm run tauri build` - Tauri packaging

**Output:**
- Windows: `src-tauri/target/release/bundle/msi/`
- Linux: `src-tauri/target/release/bundle/appimage/`
- macOS: `src-tauri/target/release/bundle/dmg/`

Ver [`DEPLOYMENT.md`](./DEPLOYMENT.md) para detalles completos.

---

## Troubleshooting

### "Backend not connected"

**Síntomas:**
- Frontend muestra error de conexión
- No responses de API

**Soluciones:**

1. **Verificar que el backend está corriendo:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verificar logs del backend:**
   - ¿Apareció el mensaje `Running on http://127.0.0.1:5000`?
   - ¿Hay errores de import?

3. **Puerto ocupado:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```
   
   Si el puerto está ocupado, mata el proceso o cambia el puerto en `api/app/config.py`.

4. **Verificar venv activado:**
   ```bash
   # Debería mostrar la ruta del venv
   which python  # Linux/Mac
   where python  # Windows
   ```

---

### Import Errors (Python)

**Síntomas:**
```
ModuleNotFoundError: No module named 'flask'
ImportError: cannot import name 'announce'
```

**Soluciones:**

1. **Reinstalar dependencias:**
   ```bash
   pip install -r api/requirements.txt
   ```

2. **Verificar estructura de imports:**
   ```python
   # Correcto
   from app.core.sse import announce
   from app.services.instances.instance_service import instance_service
   
   # Incorrecto
   from core.sse import announce  # Falta 'app.'
   ```

3. **Verificar PYTHONPATH:**
   El archivo `api/main.py` agrega el path automáticamente:
   ```python
   sys.path.append(os.path.dirname(os.path.abspath(__file__)))
   ```

---

### Tauri Build Errors

**Síntoma:**
```
error: failed to run custom build command for `tauri`
```

**Soluciones:**

1. **Verificar Rust instalado:**
   ```bash
   rustc --version
   cargo --version
   ```

2. **Actualizar Rust:**
   ```bash
   rustup update
   ```

3. **Windows: Instalar Visual Studio Build Tools**
   - Descargar e instalar desde Microsoft
   - Seleccionar "Desktop development with C++"

4. **Limpiar cache:**
   ```bash
   cd src-tauri
   cargo clean
   cd ..
   npm run tauri build
   ```

---

### Java Path Issues

**Síntomas:**
- Error al lanzar Minecraft: "Java not found"
- Versión incorrecta de Java

**Soluciones:**

1. **Configurar Java path manualmente:**
   - Abre Settings en el launcher
   - Set Java Path: `C:\Program Files\Java\jdk-17\bin\java.exe` (Windows)
   - O: `/usr/lib/jvm/java-17-openjdk/bin/java` (Linux)

2. **Verificar Java en PATH:**
   ```bash
   java -version
   ```

3. **Descargar Java correcto:**
   - Minecraft 1.17+: Java 17 o 21
   - Minecraft 1.16 o anterior: Java 8

---

### Cache Issues

**Síntomas:**
- Versiones de loaders no se actualizan
- Información obsoleta persistente

**Solución:**

Eliminar el cache:
```bash
# Windows
del data\libraries\cache.json

# Linux/Mac
rm data/libraries/cache.json
```

El cache se regenerará automáticamente.

---

### Port Conflicts

**Síntoma:**
```
Address already in use: 5000
```

**Soluciones:**

1. **Cambiar el puerto:**
   
   En `api/app/config.py`:
   ```python
   API_PORT = 5001  # Cambiar a puerto libre
   ```
   
   En `web/src/core/api/client.ts`:
   ```typescript
   const BASE_URL = 'http://localhost:5001/api';
   ```

2. **Matar proceso ocupando el puerto:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   ```

---

### SSE Connection Issues

**Síntomas:**
- Console logs no aparecen
- Progress bars no se actualizan

**Soluciones:**

1. **Verificar EventSource:**
   ```javascript
   // En browser console
   const es = new EventSource('http://localhost:5000/api/events');
   es.onerror = (e) => console.error('SSE Error:', e);
   es.onmessage = (e) => console.log('SSE:', e.data);
   ```

2. **Verificar CORS:**
   - Backend debe tener CORS habilitado para localhost
   - Revisar `api/main.py`:
   ```python
   CORS(app, resources={r"/api/*": {"origins": "*"}})
   ```

3. **Verificar que el backend envía eventos:**
   ```python
   from app.core.sse import announce
   announce('log', 'Test message')
   ```

---

### Frontend Build Errors

**Síntoma:**
```
error during build:
Error: [...] is not exported by [...]
```

**Soluciones:**

1. **Limpiar node_modules:**
   ```bash
   cd web
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verificar imports:**
   ```typescript
   // Correcto
   import { Button } from '@/ui/button';
   
   // Incorrecto
   import Button from '@/ui/button';  // Default export no existe
   ```

3. **Verificar path aliases en `vite.config.ts`:**
   ```typescript
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   }
   ```

---

## File Structure Reference

```
zenith-launcher/
├── api/                       # Python Backend
│   ├── app/
│   │   ├── core/             # Core utilities (SSE, config)
│   │   ├── routes/           # API endpoints
│   │   └── services/         # Business logic
│   ├── main.py               # Entry point
│   └── requirements.txt
├── web/                       # React Frontend
│   ├── src/
│   │   ├── core/             # API clients, state
│   │   ├── modules/          # Feature modules
│   │   └── ui/               # UI components
│   ├── package.json
│   └── vite.config.ts
├── src-tauri/                 # Tauri Desktop Shell
│   ├── src/
│   ├── tauri.conf.json
│   └── Cargo.toml
├── data/                      # Runtime data (auto-created)
│   ├── libraries/            # Minecraft assets
│   └── instances/            # User instances
├── docs/                      # Documentation
├── package.json              # Root package (for npm run dev)
└── .venv/                    # Python virtual environment
```

---

## Next Steps

- 📖 Leer [`ARCHITECTURE.md`](./ARCHITECTURE.md) para entender la estructura del código
- 🔌 Revisar [`API.md`](./API.md) para ver todos los endpoints disponibles
- 🛠️ Consultar [`BACKEND_SERVICES.md`](./BACKEND_SERVICES.md) para detalles de servicios
- 🚀 Ver [`DEPLOYMENT.md`](./DEPLOYMENT.md) para builds de producción
- 🤝 Leer [`CONTRIBUTING.md`](./CONTRIBUTING.md) antes de hacer cambios

---

## Getting Help

Si encuentras problemas no cubiertos aquí:

1. Revisa los logs del backend y frontend
2. Busca errores similares en GitHub Issues
3. Verifica que todas las dependencias estén instaladas
4. Prueba con una instalación limpia (remover `node_modules`, `.venv`, `data/`)
