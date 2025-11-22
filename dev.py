import subprocess
import sys
import os
import threading
import time
import platform

# Configurar codificación para emojis en Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    os.system('cls') # Limpiar consola

# Colores ANSI
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header():
    print(f"{Colors.HEADER}{Colors.BOLD}")
    print("╔════════════════════════════════════════════╗")
    print("║         MINELAUNCHER DEV ENVIRONMENT       ║")
    print("╚════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

def run_api():
    """Ejecuta el servidor Flask"""
    print(f"{Colors.GREEN}[SISTEMA] Iniciando Backend (Python)...{Colors.ENDC}")
    # -u hace que el output no tenga buffer (se ve al instante)
    cmd = [sys.executable, "-u", "api/main.py", "--dev"]
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8', 
        errors='replace',
        cwd=os.path.join(os.getcwd())
    )

    # Leer logs línea por línea y ponerles prefijo
    for line in process.stdout:
        print(f"{Colors.GREEN}[API] {line.strip()}{Colors.ENDC}")

def run_tauri():
    """Ejecuta Tauri"""
    # Esperamos un poquito para que la API arranque primero
    time.sleep(2)
    print(f"{Colors.CYAN}[SISTEMA] Iniciando Frontend (Tauri)...{Colors.ENDC}")
    
    # En Windows es 'npm.cmd', en Mac/Linux es 'npm'
    npm_cmd = 'npm.cmd' if sys.platform == "win32" else 'npm'
    
    # Ejecutamos directamente tauri dev (sin concurrently)
    cmd = [npm_cmd, "run", "dev:tauri"] 
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='replace',
        cwd=os.path.join(os.getcwd())
    )

    for line in process.stdout:
        # Filtramos logs ruidosos de Vite
        if "VITE" in line or "ready in" in line:
            print(f"{Colors.BLUE}[WEB] {line.strip()}{Colors.ENDC}")
        else:
            print(f"{Colors.CYAN}[TAURI] {line.strip()}{Colors.ENDC}")

if __name__ == "__main__":
    print_header()
    
    # Hilo para la API
    t_api = threading.Thread(target=run_api, daemon=True)
    t_api.start()

    # Hilo para Tauri (lo corremos en el principal o hilo aparte)
    # Lo corremos aquí para que si cerramos Tauri, se acabe el script
    try:
        run_tauri()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}👋 Cerrando entorno de desarrollo...{Colors.ENDC}")
        sys.exit(0)