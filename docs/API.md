# Backend API Documentation

El backend Python corre en `http://localhost:5000/api`. El frontend se comunica con él mediante HTTP requests estándar y Server-Sent Events (SSE) para actualizaciones en tiempo real.

## Base URL
`http://localhost:5000/api`

---

## Endpoints

### Health Check

#### `GET /health`
Verifica que el servidor esté funcionando correctamente.

**Response:**
```json
{
  "status": "ok",
  "server": "MineLauncher API"
}
```

---

### Instances (`/instances`)

#### `GET /instances`
Lista todas las instancias creadas.

**Response:**
```json
[
  {
    "id": "Mi_Instancia",
    "name": "Mi Instancia",
    "version": "1.20.1",
    "modLoader": "Fabric",
    "loaderVersion": "0.15.7",
    "image": "http://localhost:5000/api/instances/image/Mi_Instancia/instance_image.jpg",
    "created": 1700000000.0,
    "state": "ready"
  }
]
```

**States:**
- `created` - Instancia creada pero no instalada
- `installing` - Instalación en progreso
- `ready` - Lista para jugar
- `running` - Juego ejecutándose
- `error` - Error en instalación o ejecución

---

#### `POST /instances/create`
Crea una nueva instancia.

**Request Body:**
```json
{
  "name": "Mi Nueva Instancia",
  "version": "1.20.1",
  "modLoader": "Fabric",
  "loaderVersion": "0.15.7",
  "image": "data:image/png;base64,iVBORw0KG..." // Opcional: URL, base64, o preset
}
```

**Response:**
```json
{
  "id": "Mi_Nueva_Instancia",
  "message": "Instancia creada correctamente"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Nombre requerido"
}
```

---

#### `PUT /instances/<id>`
Actualiza la configuración de una instancia existente.

**Request Body:**
```json
{
  "name": "Nombre Actualizado",
  "version": "1.20.4",
  "modLoader": "NeoForge",
  "loaderVersion": "20.4.109",
  "image": "http://example.com/image.jpg"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Instancia actualizada"
}
```

---

#### `POST /instances/<id>/install`
Instala o repara una instancia (descarga Minecraft, loader, librerías, assets).

**Response:**
```json
{
  "status": "started",
  "message": "Instalación iniciada"
}
```

**Note:** El progreso se envía vía SSE events (`installing`, `progress`).

---

#### `DELETE /instances/<id>`
Elimina una instancia completamente (incluye todos los archivos).

**Response:**
```json
{
  "status": "success",
  "message": "Instancia eliminada"
}
```

---

#### `GET /instances/image/<instance_id>/<filename>`
Sirve la imagen de una instancia.

**Response:** Archivo de imagen (JPEG/PNG)

---

#### `POST /instances/import-modpack`
Importa un modpack de CurseForge desde un archivo ZIP.

**Request:** `multipart/form-data`
- `file`: Archivo ZIP del modpack

**Response:**
```json
{
  "status": "success",
  "id": "My_Modpack",
  "message": "Modpack importado. Los mods se descargarán en el primer lanzamiento."
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "No se encontró archivo"
}
```

---

#### `POST /instances/<id>/open-folder`
Abre la carpeta de la instancia en el explorador de archivos del sistema operativo.

**Response:**
```json
{
  "status": "success"
}
```

---

#### `GET /instances/<id>/resourcepacks`
Lista los resource packs instalados en una instancia.

**Response:**
```json
[
  {
    "name": "FaithfulX32.zip",
    "size": 5242880,
    "type": "file"
  }
]
```

---

#### `GET /instances/<id>/shaderpacks`
Lista los shader packs instalados en una instancia.

**Response:**
```json
[
  {
    "name": "BSL_Shaders.zip",
    "size": 1048576,
    "type": "file"
  }
]
```

---

#### `GET /instances/<id>/datapacks`
Lista los data packs instalados en una instancia.

**Response:**
```json
[
  {
    "name": "Terralith.zip",
    "size": 2097152,
    "type": "file"
  }
]
```

---

#### `GET /instances/<id>/worlds`
Lista los mundos guardados en una instancia.

**Response:**
```json
[
  {
    "name": "My World",
    "folder": "My_World",
    "lastPlayed": 1700000000
  }
]
```

---

### Launcher (`/launcher`)

#### `POST /launcher/launch`
Lanza una instancia de Minecraft.

**Request Body:**
```json
{
  "instanceName": "Mi_Instancia",  // ID de la instancia
  "username": "Player123"
}
```

**Response:**
```json
{
  "status": "launching",
  "message": "Lanzamiento iniciado"
}
```

**Note:** Los logs del juego y eventos de estado se envían vía SSE.

---

### Authentication (`/auth`)

#### `POST /auth/offline`
Login en modo offline (sin Microsoft).

**Request Body:**
```json
{
  "username": "Player123"
}
```

**Response:**
```json
{
  "status": "success",
  "username": "Player123",
  "uuid": "offline-uuid",
  "type": "offline",
  "message": "Login Offline correcto"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Nombre muy corto"
}
```

---

### Information (`/info`)

#### `GET /info/versions`
Lista las versiones de Minecraft vanilla disponibles.

**Response:**
```json
[
  "1.21",
  "1.20.6",
  "1.20.4",
  "1.20.1",
  "1.19.4",
  ...
]
```

---

#### `POST /info/loaders`
Lista las versiones de mod loaders disponibles para una versión de Minecraft.

**Request Body:**
```json
{
  "mc_version": "1.20.1",
  "loader_type": "Fabric"  // "Vanilla", "Fabric", "Forge", "NeoForge", "Quilt"
}
```

**Response:**
```json
[
  "0.15.7",
  "0.15.6",
  "0.15.5",
  ...
]
```

**Note:** Si `loader_type` es "Vanilla", retorna array vacío.

---

### Settings (`/settings`)

#### `GET /settings`
Obtiene la configuración actual del launcher.

**Response:**
```json
{
  "java_path": "C:/Program Files/Java/jdk-17/bin/java.exe",
  "ram_gb": 4,
  "extra_jvm_args": "-XX:+UseG1GC"
}
```

**Default Values:**
- `java_path`: `""` (auto-detect)
- `ram_gb`: `4`
- `extra_jvm_args`: `""`

---

#### `POST /settings`
Actualiza la configuración del launcher.

**Request Body:**
```json
{
  "java_path": "C:/Program Files/Java/jdk-21/bin/java.exe",
  "ram_gb": 8,
  "extra_jvm_args": "-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions"
}
```

**Response:**
```json
{
  "status": "success",
  "settings": {
    "java_path": "C:/Program Files/Java/jdk-21/bin/java.exe",
    "ram_gb": 8,
    "extra_jvm_args": "-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions"
  }
}
```

---

## Real-Time Events (SSE)

El backend envía eventos en tiempo real a través de Server-Sent Events en el endpoint `/api/events`.

### Conectarse a SSE

```javascript
const eventSource = new EventSource('http://localhost:5000/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

### Tipos de Eventos

#### Event: `log`
Línea de log del proceso de Minecraft.

```json
{
  "status": "log",
  "message": "[14:23:45] [Render thread/INFO]: Setting user: Player123",
  "progress": null
}
```

---

#### Event: `launching`
El juego se está preparando para lanzar.

```json
{
  "status": "launching",
  "message": "Iniciando proceso...",
  "progress": 100
}
```

---

#### Event: `installing`
Instalación/descarga en progreso.

```json
{
  "status": "installing",
  "message": "Descargando librerías...",
  "progress": 45
}
```

---

#### Event: `downloading`
Descarga en progreso (usado durante instalación de modpacks).

```json
{
  "status": "downloading",
  "message": "Descargando mod: JEI...",
  "progress": 23
}
```

---

#### Event: `running`
El juego está ejecutándose activamente.

```json
{
  "status": "running",
  "message": "Minecraft ejecutándose.",
  "progress": null
}
```

---

#### Event: `closed`
El juego se cerró correctamente.

```json
{
  "status": "closed",
  "message": "Juego cerrado correctamente.",
  "progress": null
}
```

---

#### Event: `error`
Ocurrió un error.

```json
{
  "status": "error",
  "message": "Error fatal: Java no encontrado",
  "progress": null
}
```

---

## Error Handling

Todos los endpoints pueden retornar errores con el siguiente formato:

**Error Response (4xx/5xx):**
```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

### Códigos de Estado Comunes

- `200 OK` - Solicitud exitosa
- `400 Bad Request` - Datos de solicitud inválidos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Notas de Implementación

### Caché
El servicio `/info` utiliza caché para las versiones de Minecraft y loaders:
- **TTL:** 3600 segundos (1 hora)
- **Ubicación:** `data/libraries/cache.json`
- **Modo Dev:** Caché deshabilitado para NeoForge

### Threading
Las operaciones de larga duración se ejecutan en threads separados:
- Instalación de instancias
- Lanzamiento del juego
- Descarga de modpacks

Esto permite que el servidor responda inmediatamente mientras envía actualizaciones vía SSE.

### CORS
CORS está habilitado para todos los endpoints de `/api/*` durante el desarrollo.
