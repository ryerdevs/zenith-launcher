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
    
    announce('downloading', f"Validando versión {mc_version}...", 0)

    # Callbacks para reportar progreso al frontend
    # THROTTLING: Evitar saturar el frontend con miles de eventos por segundo
    current_max = [0]
    last_update_time = [0]
    last_percent = [-1]

    def set_max(val):
        current_max[0] = val 
        
    def set_progress(val):
        if current_max[0] > 0:
            percent = int((val / current_max[0]) * 100)
            now = time.time()
            
            # Solo enviar si cambió el porcentaje Y (pasó tiempo suficiente O es inicio/fin)
            if percent != last_percent[0]:
                if (now - last_update_time[0] > 0.1) or percent == 100 or percent == 0:
                    announce('downloading', f"Descargando archivos...", percent)
                    last_update_time[0] = now
                    last_percent[0] = percent

    def set_status(text):
        announce('installing', text)

    callback = {
        "setStatus": set_status,
        "setProgress": set_progress,
        "setMax": set_max
    }

    try:
        instance_service.update_state(instance_id, "installing")
        
        # 1. Instalar Vanilla (Assets, Libraries, Client jar)
        mclib.install.install_minecraft_version(mc_version, global_path_str, callback=callback)

        # 2. Instalar Loader (Fabric, Forge, etc)
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
                announce('installing', str(msg))
                
            install_neoforge(
                mc_version=mc_version,
                loader_version=loader_version,
                minecraft_directory=global_path_str,
                status_callback=simple_status_callback
            )
        
        elif loader == 'Quilt' and loader_version:
            announce('installing', f"Instalando Quilt...")
            mclib.quilt.install_quilt(mc_version, global_path_str, loader_version, callback=callback)

        # 3. Descargar mods si es un modpack
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