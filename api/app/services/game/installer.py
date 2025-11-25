import minecraft_launcher_lib as mclib
import traceback
import subprocess
import os
import requests
import time
import json
from app.config import GLOBAL_DIR, INSTANCES_DIR
from app.core.sse import announce
from app.services.instances.instance_service import instance_service
from app.services.game.custom_loaders import install_neoforge
from app.services.external.curseforge import curseforge_client

def install_neoforge_custom(loader_version, minecraft_directory, callback=None):
    """
    Instalador personalizado para NeoForge ya que mclib no lo soporta nativamente aún.
    Descarga el installer.jar y lo ejecuta.
    """
    if callback:
        callback.get("setStatus")("Preparando instalador de NeoForge...")
    pass

def install_task(mc_version, loader, loader_version, instance_id):
    """
    Descarga e instala Minecraft + Loader.
    Esta función es bloqueante, debe llamarse desde un hilo.
    """
    global_path_str = str(GLOBAL_DIR)
    
    # --- SMART MONOTONIC PROGRESS SYSTEM ---
    # Detectamos la fase basada en el texto de estado y asignamos rangos.
    # Evitamos que la barra retroceda.

    def create_smart_callback():
        state = {
            "current_range": (0, 10), # Rango inicial
            "local_max": 1,
            "last_global_percent": 0,
            "last_update_time": 0
        }

        def set_status(text):
            # Detección de Fases por Texto
            t = text.lower()
            if "download libraries" in t or "descargando librerías" in t:
                state["current_range"] = (10, 40)
            elif "download assets" in t or "descargando recursos" in t:
                state["current_range"] = (40, 55)
            elif "java runtime" in t or "java" in t:
                state["current_range"] = (55, 60)
            elif "processor" in t or "installer" in t or "fabric" in t or "forge" in t:
                state["current_range"] = (60, 70)
            elif "mod" in t or "resolviendo" in t:
                state["current_range"] = (70, 100)
            elif "complete" in t:
                pass

            # FIX: Enviar el último progreso conocido para evitar que la barra salte a 0
            current_p = max(0, state["last_global_percent"])
            announce('installing', text, current_p)

        def set_max(val):
            state["local_max"] = max(1, val) # Evitar división por cero

        def set_progress(val):
            start, end = state["current_range"]
            local_percent = val / state["local_max"]
            
            # Mapear al rango global
            global_percent = int(start + (local_percent * (end - start)))
            
            # MONOTONICIDAD: Nunca bajar del último porcentaje reportado
            if global_percent < state["last_global_percent"]:
                global_percent = state["last_global_percent"]
            
            state["last_global_percent"] = global_percent

            # Throttling
            now = time.time()
            if global_percent != state["last_global_percent"] or (now - state["last_update_time"] > 0.1):
                announce('downloading', f"Instalando... {global_percent}%", global_percent)
                state["last_update_time"] = now

        return {
            "setStatus": set_status,
            "setProgress": set_progress,
            "setMax": set_max
        }

    try:
        instance_service.update_state(instance_id, "installing")
        callback = create_smart_callback()
        
        # 1. Instalar Vanilla (Detectará fases internamente)
        announce('downloading', f"Verificando Vanilla {mc_version}...", 0)
        mclib.install.install_minecraft_version(mc_version, global_path_str, callback=callback)

        # 2. Instalar Loader
        if loader == 'Fabric' and loader_version:
            announce('installing', f"Instalando Fabric...")
            mclib.fabric.install_fabric(mc_version, global_path_str, loader_version, callback=callback)
        
        elif loader == 'Forge' and loader_version:
            announce('installing', f"Instalando Forge (puede tardar)...")
            if '-' not in loader_version:
                full_version = f"{mc_version}-{loader_version}"
            else:
                full_version = loader_version
            mclib.forge.install_forge_version(full_version, global_path_str, callback=callback)
        
        elif loader == 'NeoForge' and loader_version:
            announce('installing', f"Instalando NeoForge {loader_version}...")
            
            def simple_status_callback(msg):
                callback["setStatus"](str(msg))
                
            install_neoforge(
                mc_version=mc_version,
                loader_version=loader_version,
                minecraft_directory=global_path_str,
                status_callback=simple_status_callback
            )
            announce('downloading', "NeoForge instalado.", 70)
        
        elif loader == 'Quilt' and loader_version:
            announce('installing', f"Instalando Quilt...")
            mclib.quilt.install_quilt(mc_version, global_path_str, loader_version, callback=callback)

        # 3. Descargar mods si es un modpack
        announce('downloading', f"Verificando Mods...", 70)
        
        from app.services.instances.modpack_installer import modpack_installer_service
        modpack_installer_service.install_mods(instance_id, callback)

        # Finalizar
        instance_service.update_state(instance_id, "ready")
        announce('ready', "Instalación completada.", 100)

    except Exception as e:
        print(f"[INSTALL ERROR] {e}")
        traceback.print_exc()
        instance_service.update_state(instance_id, "error")
        announce('error', f"Error en instalación: {str(e)}")
        raise e