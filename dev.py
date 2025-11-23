import subprocess
import sys
import os
import threading
import time
import signal
import atexit

# Configurar codificación para emojis en Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    os.system('cls')

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

# Lista global para trackear procesos
processes = []
shutdown_event = threading.Event()

def print_header():
    print(f"{Colors.HEADER}{Colors.BOLD}")
    print("╔════════════════════════════════════════════╗")
    print("║         MINELAUNCHER DEV ENVIRONMENT       ║")
    print("╚════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

def cleanup():
    """Limpia todos los procesos al cerrar"""
    if shutdown_event.is_set():
        return
    
    shutdown_event.set()
    print(f"\n{Colors.WARNING}🧹 Limpiando procesos...{Colors.ENDC}")
    
    for proc in processes:
        try:
            if proc.poll() is None:  # Si el proceso sigue vivo
                print(f"{Colors.WARNING}⏹  Terminando proceso PID {proc.pid}...{Colors.ENDC}")
                
                if sys.platform == "win32":
                    # En Windows usamos taskkill para matar el árbol completo
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(proc.pid)], 
                                   stdout=subprocess.DEVNULL, 
                                   stderr=subprocess.DEVNULL)
                else:
                    # En Unix enviamos SIGTERM y luego SIGKILL si no responde
                    proc.terminate()
                    try:
                        proc.wait(timeout=3)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                        proc.wait()
        except Exception as e:
            print(f"{Colors.FAIL}⚠  Error cerrando proceso: {e}{Colors.ENDC}")
    
    # Restaurar el terminal en Unix
    if sys.platform != "win32":
        os.system('stty sane')
    
    print(f"{Colors.GREEN}✅ Entorno cerrado correctamente{Colors.ENDC}")

def signal_handler(signum, frame):
    """Maneja señales de interrupción"""
    cleanup()
    sys.exit(0)

def run_api():
    """Ejecuta el servidor Flask"""
    if shutdown_event.is_set():
        return
    
    print(f"{Colors.GREEN}[SISTEMA] Iniciando Backend (Python)...{Colors.ENDC}")
    cmd = [sys.executable, "-u", "api/main.py", "--dev"]
    
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8', 
            errors='replace',
            bufsize=1,  # Line buffered
            cwd=os.getcwd()
        )
        processes.append(process)

        # Leer logs línea por línea
        for line in process.stdout:
            if shutdown_event.is_set():
                break
            print(f"{Colors.GREEN}[API] {line.strip()}{Colors.ENDC}")
            
    except Exception as e:
        print(f"{Colors.FAIL}[API] Error: {e}{Colors.ENDC}")

def run_tauri():
    """Ejecuta Tauri"""
    if shutdown_event.is_set():
        return
    
    time.sleep(2)
    print(f"{Colors.CYAN}[SISTEMA] Iniciando Frontend (Tauri)...{Colors.ENDC}")
    
    npm_cmd = 'npm.cmd' if sys.platform == "win32" else 'npm'
    cmd = [npm_cmd, "run", "dev:tauri"] 
    
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='replace',
            bufsize=1,
            cwd=os.getcwd(),
            # Crear nuevo grupo de procesos en Unix
            preexec_fn=None if sys.platform == "win32" else os.setpgrp
        )
        processes.append(process)

        for line in process.stdout:
            if shutdown_event.is_set():
                break
            
            # Filtrar logs ruidosos
            if "VITE" in line or "ready in" in line:
                print(f"{Colors.BLUE}[WEB] {line.strip()}{Colors.ENDC}")
            else:
                print(f"{Colors.CYAN}[TAURI] {line.strip()}{Colors.ENDC}")
                
    except Exception as e:
        print(f"{Colors.FAIL}[TAURI] Error: {e}{Colors.ENDC}")

if __name__ == "__main__":
    # Registrar handlers de limpieza
    atexit.register(cleanup)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # En Windows también capturamos CTRL+BREAK
    if sys.platform == "win32":
        signal.signal(signal.SIGBREAK, signal_handler)
    
    print_header()
    print(f"{Colors.CYAN}💡 Presiona CTRL+C para detener todos los servicios{Colors.ENDC}\n")
    
    # Iniciar servicios
    t_api = threading.Thread(target=run_api, daemon=True)
    t_api.start()

    try:
        run_tauri()
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()