# Contributing to Zenith Launcher

¡Agradecemos las contribuciones! Sigue estas guías para mantener la calidad del código.

---

## Code Style

### Frontend (React/TypeScript)

#### Components

- **Formato**: Functional Components con Hooks
- **Naming**: 
  - PascalCase para componentes: `InstanceCard.tsx`
  - camelCase para funciones/variables: `getUserData()`
- **Exports**: Preferir named exports sobre default exports

```typescript
// ✅ Correcto
export function InstanceCard({ instance }: Props) {
  return <div>...</div>;
}

// ❌Evitar
export default function InstanceCard({ instance }: Props) {
  return <div>...</div>;
}
```

#### Structure

- **Vista-específicos**: `src/modules/views/<ViewName>/`
- **Reutilizables**: `src/ui/`
- **Barrel files**: Usar `index.ts` para exports limpios

```typescript
// src/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Dialog } from './dialog';
```

#### Styling

- **Tailwind CSS**: Usar utility classes
- **Evitar**: Inline styles (excepto dinámicos)
- **Variantes**: Usar `class-variance-authority` para componentes con variantes

```typescript
// ✅ Correcto
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">

// ❌ Evitar
<div style={{ display: 'flex', padding: '16px' }}>
```

#### State Management

- **Global**: `useLauncher` (Zustand) en `src/core/state/`
- **Local UI**: `useState`, `useReducer`
- **Server state**: React Query (si se agrega en el futuro)

```typescript
// Global state
const { instances, addInstance } = useLauncher();

// Local state
const [isOpen, setIsOpen] = useState(false);
```

#### Type Safety

- Definir interfaces para props
- Evitar `any`, usar `unknown` si es necesario
- Usar type assertions con cuidado

```typescript
// ✅ Bueno
interface InstanceCardProps {
  instance: Instance;
  onEdit: (id: string) => void;
}

// ❌ Evitar
function InstanceCard(props: any) { ... }
```

---

### Backend (Python)

#### Style Guide

Seguir **PEP 8**:
- 4 espacios de indentación
- Max 100 caracteres por línea (flexible)
- 2 líneas en blanco entre funciones top-level
- Imports agrupados: stdlib → third-party → local

```python
# ✅ Correcto
import json
import os
from pathlib import Path

from flask import Blueprint, request, jsonify

from app.core.sse import announce
from app.services.instances.instance_service import instance_service
```

#### Naming Conventions

- **Funciones/Variables**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: `_leading_underscore`

```python
# Variables y funciones
instance_count = 10
def get_instance_by_id(instance_id: str):
    pass

# Clases
class InstanceService:
    pass

# Constantes
MAX_RETRIES = 3
DEFAULT_RAM_GB = 4

# Privado
def _internal_helper():
    pass
```

#### Type Hinting

Usar type hints donde sea posible:

```python
from typing import List, Dict, Optional

def create_instance(
    name: str,
    version: str,
    loader: str,
    loader_version: Optional[str] = None
) -> Dict[str, str]:
    """
    Create a new instance.
    
    Args:
        name: Instance name
        version: Minecraft version
        loader: Mod loader type
        loader_version: Loader version (optional)
        
    Returns:
        dict with 'id' and 'message' keys
    """
    pass
```

#### Docstrings

Usar formato Google style:

```python
def install_mods(manifest: Dict, instance_path: Path) -> None:
    """
    Download and install mods from manifest.
    
    Args:
        manifest: Parsed modpack manifest
        instance_path: Path to instance directory
        
    Raises:
        FileNotFoundError: If instance path doesn't exist
        RequestException: If mod download fails
    """
    pass
```

---

## Backend Architecture Patterns

### Service Layer

Cada servicio debe:
- Ser una clase con métodos bien definidos
- Exportarse como singleton
- Tener responsabilidades claras (Single Responsibility Principle)

```python
# Definición
class MyService:
    """Service for handling X functionality."""
    
    def do_something(self, param: str) -> Dict:
        """Do something with param."""
        pass

# Singleton export
my_service = MyService()

# Uso en routes
from app.services.my_service import my_service

@bp.route('/endpoint')
def my_route():
    result = my_service.do_something("value")
    return jsonify(result)
```

### Error Handling

**Pattern estándar:**

```python
from flask import jsonify
from app.core.sse import announce

@bp.route('/instances/<instance_id>/install', methods=['POST'])
def install_instance(instance_id):
    try:
        # Operación
        result = installer.install(instance_id)
        return jsonify({"status": "success", "data": result})
    
    except FileNotFoundError:
        return jsonify({
            "status": "error",
            "message": "Instancia no encontrada"
        }), 404
    
    except Exception as e:
        # Log error y notificar vía SSE
        announce('error', str(e))
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
```

### SSE Event Naming

**Convenciones para event types:**

- `downloading` - Descarga en progreso
- `installing` - Instalación en progreso
- `launching` - Preparando lanzamiento
- `running` - Juego ejecutándose
- `closed` - Juego cerrado exitosamente
- `log` - Línea de log del juego
- `error` - Error ocurrido
- `progress` - Actualización de progreso genérica

**Uso:**

```python
from app.core.sse import announce

# Inicio de operación
announce('installing', 'Iniciando instalación...', progress=0)

# Progreso intermedio
announce('installing', 'Descargando librerías...', progress=45)

# Log del juego
announce('log', '[INFO] Game starting...')

# Error
announce('error', 'Falló la descarga: timeout')

# Finalización
announce('installing', 'Instalación completa', progress=100)
```

### Threading

Para operaciones largas, usar threads:

```python
import threading

@bp.route('/launcher/launch', methods=['POST'])
def launch():
    data = request.json
    
    # Lanzar en background thread
    threading.Thread(
        target=launcher_service.launch_thread,
        args=(data['instanceName'], data['username']),
        daemon=True  # Thread muere con el proceso principal
    ).start()
    
    return jsonify({"status": "launching"})
```

---

## API Design Guidelines

### Endpoint Naming

- RESTful cuando sea posible
- Plural para recursos: `/instances`, `/settings`
- Verbos HTTP apropiados:
  - `GET` - Leer
  - `POST` - Crear o acciones
  - `PUT` - Actualizar completo
  - `PATCH` - Actualizar parcial
  - `DELETE` - Eliminar

```python
# ✅ Correcto
@instances_bp.route('/', methods=['GET'])
def list_instances(): ...

@instances_bp.route('/create', methods=['POST'])
def create_instance(): ...

@instances_bp.route('/<id>', methods=['PUT'])
def update_instance(id): ...

@instances_bp.route('/<id>', methods=['DELETE'])
def delete_instance(id): ...
```

### Request/Response Format

**Request:**
```python
@bp.route('/create', methods=['POST'])
def create():
    data = request.json  # Assume JSON body
    
    # Validar campos requeridos
    required = ['name', 'version']
    if not all(k in data for k in required):
        return jsonify({
            "status": "error",
            "message": "Faltan campos requeridos"
        }), 400
    
    # Procesar...
```

**Response Success:**
```python
return jsonify({
    "status": "success",
    "data": result_data,
    "message": "Operación completada"  # Opcional
}), 200
```

**Response Error:**
```python
return jsonify({
    "status": "error",
    "message": "Descripción del error"
}), 400  # O 404, 500, etc.
```

---

## Git Workflow

### Branching Strategy

```
main (production-ready)
  ├── develop (integration)
  │   ├── feature/add-neoforge-support
  │   ├── feature/improve-ui
  │   └── bugfix/fix-launch-error
  └── hotfix/critical-bug
```

**Branch Naming:**
- `feature/descripcion-corta`
- `bugfix/descripcion-del-bug`
- `hotfix/arreglo-critico`
- `docs/actualizacion-readme`

### Commit Messages

Seguir convención **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Formato, no afecta lógica
- `refactor`: Refactorización de código
- `test`: Tests
- `chore`: Maintenance tasks

**Ejemplos:**

```bash
feat(instances): add NeoForge installation support

Implements custom NeoForge installer for legacy and modern versions.
Uses dual Maven repository strategy.

Closes #42
```

```bash
fix(launcher): resolve Java path detection on Windows

The launcher now correctly detects Java installation from registry.

Fixes #38
```

```bash
docs(api): update endpoint documentation

Added missing /instances/{id}/worlds endpoint.
```

### Pull Request Template

**Title:** `[Type] Brief description`

**Description Template:**
```markdown
## Changes
- Lista de cambios principales
- Otro cambio importante

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All instances work correctly
- [ ] Game launches successfully

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #XX
```

---

## Testing Guidelines

### Manual Testing Checklist

Antes de crear PR, verificar:

**Backend:**
- [ ] Servidor inicia sin errores
- [ ] Todos los endpoints responden
- [ ] SSE events se transmiten correctamente
- [ ] No hay import errors

**Frontend:**
- [ ] App compila sin warnings
- [ ] No errores en console
- [ ] UI se renderiza correctamente
- [ ] Navegación funciona

**Integration:**
- [ ] Crear instancia funciona
- [ ] Instalar instance funciona
- [ ] Lanzar juego funciona
- [ ] Logs aparecen en consola

### Future: Automated Tests

```python
# tests/test_instance_service.py
import pytest
from app.services.instances.instance_service import instance_service

def test_create_instance():
    result = instance_service.create_instance(
        name="Test Instance",
        version="1.20.1",
        loader="Fabric",
        loader_version="0.15.7"
    )
    assert "id" in result
    assert result["message"] == "Instancia creada correctamente"
```

---

## Code Review Guidelines

### As a Reviewer

- ✅ Verificar que el código sigue las guías de estilo
- ✅ Buscar posibles bugs o edge cases
- ✅ Verificar que hay documentación apropiada
- ✅ Probar los cambios localmente si es posible
- ✅ Ser constructivo y respetuoso

### As an Author

- ✅ Hacer commits atómicos (un cambio lógico por commit)
- ✅ Escribir descripciones claras en PR
- ✅ Responder a comentarios de review
- ✅ Hacer cambios solicitados
- ✅ No hacer force push después de review (usa nuevos commits)

---

## Directory Structure Guidelines

### Backend

```
api/app/
├── routes/              # ✅ Endpoints van aquí
│   └── my_feature.py
├── services/            # ✅ Lógica de negocio
│   ├── instances/
│   ├── game/
│   └── external/
└── core/                # ✅ Utilities centrales
    └── my_utility.py
```

**❌ NO hacer:**
- No mezclar lógica de negocio en routes
- No poner routes en services
- No crear archivos en raíz de `app/`

### Frontend

```
web/src/
├── modules/             # ✅ Features agrupadas
│   └── views/
│       └── MyView/
│           ├── MyView.tsx
│           ├── MyViewCard.tsx
│           └── index.ts
├── ui/                  # ✅ Componentes reutilizables
│   └── my-component.tsx
└── core/                # ✅ API clients, state
    └── api/
```

---

## Performance Best Practices

### Backend

**✅ Hacer:**
- Usar threading para operaciones largas
- Cachear resultados de APIs externas
- Usar generators para grandes datasets

**❌ Evitar:**
- Bloquear el main thread de Flask
- Hacer requests síncronos sin timeout
- Cargar archivos grandes en memoria

```python
# ✅ Correcto - Threading
threading.Thread(target=long_task, daemon=True).start()

# ✅ Correcto - Timeout
requests.get(url, timeout=5)

# ❌ Evitar - Bloquear main thread
result = long_synchronous_operation()  # En ruta Flask
```

### Frontend

**✅ Hacer:**
- Lazy load components con `React.lazy()`
- Memoize expensive calculations con `useMemo`
- Debounce user inputs

**❌ Evitar:**
- Re-renders innecesarios
- Operaciones caras en render function
- Falta de keys en listas

```typescript
// ✅ Correcto
const expensiveValue = useMemo(() => calculateValue(data), [data]);

// ❌ Evitar
function Component() {
  const value = expensiveCalculation();  // Runs every render
  return <div>{value}</div>;
}
```

---

## Security Guidelines

1. **No commits de secretos**: API keys, tokens, passwords
2. **Validar inputs**: Sanitizar user input en backend
3. **Path traversal**: Validar que paths estén dentro de `data/`
4. **Dependencies**: Mantener actualizadas y auditar

```python
# ✅ Validar paths
instance_path = INSTANCES_DIR / instance_id
if not instance_path.is_relative_to(INSTANCES_DIR):
    raise ValueError("Invalid path")
```

---

## Documentation Requirements

Al agregar nueva funcionalidad:

- [ ] Actualizar `API.md` si agrega endpoints
- [ ] Documentar servicios en `BACKEND_SERVICES.md`
- [ ] Agregar docstrings a funciones públicas
- [ ] Actualizar `README.md` si cambia setup
- [ ] Agregar comentarios para lógica compleja

---

## Questions?

- 📖 Lee la documentación en `docs/`
- 🔍 Revisa código existente como referencia
- 💬 Abre un issue para discutir cambios grandes
- 🤝 Pregunta en PRs si necesitas feedback temprano

¡Gracias por contribuir a Zenith Launcher! 🚀
