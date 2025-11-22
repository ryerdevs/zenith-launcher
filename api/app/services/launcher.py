import subprocess
import uuid
import json
import sys
import threading
import time  # <--- IMPORTANTE: Asegúrate de que esto esté aquí
import traceback
import minecraft_launcher_lib as mclib

from app.config import GLOBAL_DIR, INSTANCES_DIR, SETTINGS_FILE
from app.sse import announce
from app.services.instance_manager import instance_manager
from app.services.installer import install_task

class LauncherService:
    def launch_thread(self, instance_id, username):
        instance_path = INSTANCES_DIR / instance_id
        json_path = instance_path / "instance.json"
        
        announce('launching', f"Preparando {instance_id}...", 0)

        try:
            # 1. Cargar Configuración
            if not json_path.exists():
                raise FileNotFoundError("Configuración no encontrada")
            
            with open(json_path, "r", encoding='utf-8') as f:
                config = json.load(f)

            # 2. Verificar instalación
            if config.get('state') != 'ready':
                announce('installing', "Verificando archivos...")
                install_task(
                    config.get('version'),
                    config.get('modLoader'),
                    config.get('loaderVersion'),
                    instance_id
                )
                with open(json_path, "r", encoding='utf-8') as f:
                    config = json.load(f)

            # 3. Preparar Argumentos
            announce('launching', "Configurando Java...", 50)
            instance_manager.update_state(instance_id, "running")

            settings = {"ram_gb": 4, "java_path": "", "extra_jvm_args": ""}
            if SETTINGS_FILE.exists():
                try:
                    with open(SETTINGS_FILE, "r") as f:
                        settings.update(json.load(f))
                except: pass

            # Identificar versión
            mc_ver = config["version"]
            loader_type = config.get("modLoader", "Vanilla")
            loader_ver = config.get("loaderVersion")
            
            installed_versions = mclib.utils.get_installed_versions(str(GLOBAL_DIR))
            target_id = None
            
            if loader_type == "Vanilla":
                target_id = mc_ver
            else:
                for v in installed_versions:
                    vid = v["id"]
                    if loader_type.lower() in vid.lower() and (loader_ver and loader_ver in vid):
                        target_id = vid
                        break
            
            if not target_id: target_id = loader_ver if loader_ver else mc_ver

            # Argumentos JVM
            options = {
                "username": username,
                "uuid": str(uuid.uuid3(uuid.NAMESPACE_DNS, username)),
                "token": "",
                "launcherName": "MineLauncher",
                "gameDirectory": str(instance_path),
                "jvmArguments": [f"-Xmx{settings['ram_gb']}G", "-XX:+UnlockExperimentalVMOptions"] + settings['extra_jvm_args'].split()
            }
            
            if settings['java_path']:
                options["javaPath"] = settings['java_path']

            cmd = mclib.command.get_minecraft_command(target_id, str(GLOBAL_DIR), options)

            # --- PAUSA DE SEGURIDAD Y LOGS ---
            # Esperamos medio segundo para asegurar que el frontend reciba el mensaje
            time.sleep(0.5) 
            
            announce("log", " " )
            announce("log", "🟩 " + "="*40)
            announce("log", f"🟩 [SYSTEM] Lanzando Instancia: {instance_id}")
            announce("log", f"🟩 [CONFIG] RAM Asignada: {settings['ram_gb']} GB")
            announce("log", f"🟩 [CONFIG] Java: {options.get('javaPath', 'Auto')}")
            announce("log", "🟩 " + "="*40)
            announce("log", " " )
            # -----------------------------------

            # 4. Ejecutar
            announce('launching', "Iniciando proceso...", 100)
            
            creationflags = 0
            if sys.platform.startswith("win"):
                creationflags = subprocess.CREATE_NO_WINDOW

            process = subprocess.Popen(
                cmd,
                cwd=str(instance_path),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                creationflags=creationflags
            )

            # 5. Leer Logs
            game_visible = False
            while True:
                line = process.stdout.readline()
                if not line and process.poll() is not None:
                    break
                if line:
                    clean = line.strip()
                    announce("log", clean)
                    
                    if not game_visible:
                        if any(x in clean for x in ["LWJGL", "OpenAL", "Sound engine", "OpenGL", "Setting user:", "Backend library"]):
                            game_visible = True
                            announce("running", "Minecraft ejecutándose.")

            # 6. Cierre
            rc = process.poll()
            if rc == 0:
                announce("closed", "Juego cerrado correctamente.")
            else:
                announce("error", f"El juego se cerró (Código {rc})")
            
            instance_manager.update_state(instance_id, "ready")

        except Exception as e:
            print(f"[FATAL] {e}")
            traceback.print_exc()
            announce("error", f"Error fatal: {str(e)}")
            instance_manager.update_state(instance_id, "error")

launcher_service = LauncherService()