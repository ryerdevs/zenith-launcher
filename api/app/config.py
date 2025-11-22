import sys
import os
from pathlib import Path
import platform

# Puerto donde correrá Flask
API_PORT = 5000

def get_base_path():
    """
    Define la ruta raíz.
    - Si es .exe (PROD): Usa la carpeta donde está el ejecutable.
    - Si es script (DEV): Sube niveles hasta encontrar la raíz 'desktop/'.
    """
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    else:
        # Estamos en desktop/api/app/config.py
        # parents[0]=app, parents[1]=api, parents[2]=desktop, parents[3]=RAÍZ PROYECTO
        return Path(__file__).resolve().parents[3]

# Definimos la carpeta 'data'
BASE_PATH = get_base_path()
BASE_DATA_DIR = BASE_PATH / "data"

# Subcarpetas
GLOBAL_DIR = BASE_DATA_DIR / "libraries"       # Para mclib, assets, versiones
INSTANCES_DIR = BASE_DATA_DIR / "instances"    # Para tus mundos
CACHE_FILE = GLOBAL_DIR / "cache.json"
SETTINGS_FILE = GLOBAL_DIR / "settings.json"

# Crear carpetas si no existen
try:
    if not GLOBAL_DIR.exists(): GLOBAL_DIR.mkdir(parents=True)
    if not INSTANCES_DIR.exists(): INSTANCES_DIR.mkdir(parents=True)
    print(f"[CONFIG] Directorio de datos: {BASE_DATA_DIR}")
except Exception as e:
    print(f"[CONFIG ERROR] No se pudieron crear carpetas: {e}")