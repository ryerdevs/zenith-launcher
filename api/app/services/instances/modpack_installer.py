import json
import requests
from pathlib import Path
from app.config import INSTANCES_DIR
from app.services.external.curseforge import curseforge_client
from app.core.sse import announce

class ModpackInstallerService:
    """
    Service responsible for installing modpack contents (mods, etc.)
    after the base game and loader have been installed.
    """

    def install_mods(self, instance_id: str, callback=None):
        """
        Reads modpack_files.json and downloads the mods.
        """
        instance_dir = INSTANCES_DIR / instance_id
        modpack_files_path = instance_dir / "modpack_files.json"
        
        print(f"[MODPACK INSTALL] Checking for modpack files at {modpack_files_path}")
        
        if not modpack_files_path.exists():
            print("[MODPACK INSTALL] No modpack_files.json found. Skipping mod download.")
            return

        announce('downloading', "Resolviendo mods...", 0)
        
        try:
            with open(modpack_files_path, 'r') as f:
                files = json.load(f)
            
            print(f"[MODPACK INSTALL] Found {len(files)} files in modpack manifest")
            
            if not files:
                return

            # Group IDs for batch query
            file_ids = [f['fileID'] for f in files]
            
            # Fetch download URLs
            announce('downloading', f"Obteniendo info de {len(file_ids)} mods...", 10)
            print(f"[MODPACK INSTALL] Fetching info for {len(file_ids)} mods from CurseForge")
            
            mod_files_info = curseforge_client.get_files(file_ids)
            print(f"[MODPACK INSTALL] Got info for {len(mod_files_info)} mods")
            
            # Create mods directory
            mods_dir = instance_dir / "mods"
            mods_dir.mkdir(exist_ok=True)
            
            total_mods = len(mod_files_info)
            downloaded = 0
            if callback:
                callback.get("setMax")(100)
            
            for mod in mod_files_info:
                download_url = mod.get('downloadUrl')
                if not download_url:
                    print(f"Skipping mod {mod.get('displayName')} (no URL)")
                    continue
                    
                filename = mod.get('fileName')
                mod_path = mods_dir / filename
                
                # Download if not exists
                if not mod_path.exists():
                    # Calculate progress: 0% to 100% relative to this stage
                    progress = int((downloaded / total_mods) * 100)
                    if callback:
                        callback.get("setStatus")(f"Descargando mod: {filename}")
                        callback.get("setProgress")(progress)
                    else:
                        announce('downloading', f"Descargando: {filename}", progress)
                    
                    try:
                        resp = requests.get(download_url, stream=True)
                        resp.raise_for_status()
                        with open(mod_path, 'wb') as f:
                            for chunk in resp.iter_content(chunk_size=8192):
                                f.write(chunk)
                    except Exception as e:
                        print(f"Error downloading {filename}: {e}")
                
                downloaded += 1
                
            print("[MODPACK INSTALL] Mod download completed.")

        except Exception as e:
            print(f"Error installing mods: {e}")
            announce('error', f"Error instalando mods: {e}")
            # We don't raise here to avoid failing the entire installation if just mods fail
            # But in a strict mode we might want to.

modpack_installer_service = ModpackInstallerService()
