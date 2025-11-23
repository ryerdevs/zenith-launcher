import minecraft_launcher_lib as mclib
import traceback
from app.config import GLOBAL_DIR, INSTANCES_DIR
from app.sse import announce
from app.services.instance_manager import instance_manager

def install_task(mc_version, loader, loader_version, instance_id):
    """
    Descarga e instala Minecraft + Loader.
    Esta función es bloqueante, debe llamarse desde un hilo.
    """
    global_path_str = str(GLOBAL_DIR)
    
    announce('downloading', f"Validando versión {mc_version}...", 0)

    # Callbacks para reportar progreso al frontend
    current_max = [0]
    def set_max(val):
        current_max[0] = val 
    def set_progress(val):
        if current_max[0] > 0:
            percent = int((val / current_max[0]) * 100)
            announce('downloading', f"Descargando archivos...", percent)
    def set_status(text):
        announce('installing', text)

    callback = {
        "setStatus": set_status,
        "setProgress": set_progress,
        "setMax": set_max
    }

    try:
        instance_manager.update_state(instance_id, "installing")
        
        # 1. Instalar Vanilla (Assets, Libraries, Client jar)
        mclib.install.install_minecraft_version(mc_version, global_path_str, callback=callback)

        # 2. Instalar Loader (Fabric, Forge, etc)
        if loader == 'Fabric' and loader_version:
            announce('installing', f"Instalando Fabric...")
            mclib.fabric.install_fabric(mc_version, global_path_str, loader_version, callback=callback)
        
        elif loader == 'Forge' and loader_version:
            announce('installing', f"Instalando Forge (puede tardar)...")
            # Ensure we have the full version format (mc_version-build)
            # If loader_version doesn't contain a hyphen, it's just the build number (old format)
            if '-' not in loader_version:
                full_version = f"{mc_version}-{loader_version}"
                print(f"[FORGE] Reconstructing full version: {full_version}")
            else:
                full_version = loader_version
            mclib.forge.install_forge_version(full_version, global_path_str, callback=callback)
        
        elif loader == 'NeoForge' and loader_version:
            announce('installing', f"Instalando NeoForge...")
            mclib.neoforge.install_neoforge(loader_version, global_path_str, callback=callback)
        
        elif loader == 'Quilt' and loader_version:
            announce('installing', f"Instalando Quilt...")
            mclib.quilt.install_quilt(mc_version, global_path_str, loader_version, callback=callback)

        # Finalizar
        instance_manager.update_state(instance_id, "ready")
        announce('ready', "Instalación completada.", 100)

    except Exception as e:
        print(f"[INSTALL ERROR] {e}")
        traceback.print_exc()
        instance_manager.update_state(instance_id, "error")
        announce('error', f"Error en instalación: {str(e)}")
        raise e