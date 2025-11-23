import os
import json
import shutil
import zipfile
import time
from pathlib import Path
from app.config import INSTANCES_DIR

class InstanceManager:
    def list_instances(self):
        instances = []
        if not INSTANCES_DIR.exists():
            INSTANCES_DIR.mkdir(parents=True)
            
        for folder in INSTANCES_DIR.iterdir():
            if folder.is_dir():
                config_file = folder / "instance.json"
                if config_file.exists():
                    try:
                        with open(config_file, "r", encoding='utf-8') as f:
                            data = json.load(f)
                            # Asegurar ID
                            data['id'] = folder.name
                            # Asegurar ruta de imagen absoluta para el frontend
                            if 'image' in data and not data['image'].startswith('http') and not data['image'].startswith('/'):
                                data['image'] = f"http://localhost:5000/api/instances/image/{folder.name}/{os.path.basename(data['image'])}"
                            instances.append(data)
                    except Exception as e:
                        print(f"Error loading {folder}: {e}")
        return instances

    def create_instance(self, name, version, loader, loader_version, image_data=None):
        """Crea una nueva carpeta de instancia y su json."""
        safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '_', '-')).strip() or "unnamed"
        instance_folder = INSTANCES_DIR / safe_name
        
        counter = 1
        while instance_folder.exists():
            instance_folder = INSTANCES_DIR / f"{safe_name}_{counter}"
            counter += 1
        
        instance_folder.mkdir(parents=True, exist_ok=True)
        (instance_folder / "mods").mkdir(exist_ok=True)
        (instance_folder / "config").mkdir(exist_ok=True)
        (instance_folder / "saves").mkdir(exist_ok=True)
        (instance_folder / "resourcepacks").mkdir(exist_ok=True)
        (instance_folder / "shaderpacks").mkdir(exist_ok=True)
        (instance_folder / "datapacks").mkdir(exist_ok=True) # New folder for data packs

        final_image = "/minecraft-landscape-dark.jpg" 
        if image_data:
            # Check if it is a preset URL (starts with /) or base64 data
            if image_data.startswith('/'):
                final_image = image_data
            else:
                final_image = self._process_image(image_data, instance_folder)

        config = {
            "name": name,
            "version": version,
            "modLoader": loader,
            "loaderVersion": loader_version,
            "image": final_image,
            "created": time.time(),
            "state": "created"
        }
        
        self._save_json(instance_folder / "instance.json", config)
        return {"id": instance_folder.name, "message": "Instancia creada correctamente"}

    def update_instance(self, instance_id, data):
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            raise Exception("Instancia no encontrada")
            
        with open(config_path, "r", encoding='utf-8') as f:
            config = json.load(f)
            
        # Actualizar campos permitidos
        if 'name' in data: config['name'] = data['name']
        if 'version' in data: config['version'] = data['version']
        if 'modLoader' in data: config['modLoader'] = data['modLoader']
        if 'loaderVersion' in data: config['loaderVersion'] = data['loaderVersion']
        
        # Procesar nueva imagen si existe
        if 'image' in data and data['image']:
            image = data['image']
            # Check if it is a preset URL or base64 data
            if image.startswith('/'):
                config['image'] = image
            elif image.startswith('data:'):
                config['image'] = self._process_image(image, instance_folder)
            
        self._save_json(config_path, config)

    def delete_instance(self, instance_id):
        instance_folder = INSTANCES_DIR / instance_id
        if instance_folder.exists():
            shutil.rmtree(instance_folder)

    def _process_image(self, base64_data, folder):
        try:
            import base64
            from io import BytesIO
            
            header, encoded = base64_data.split(",", 1)
            data = base64.b64decode(encoded)
            
            image_path = folder / "icon.png"
            with open(image_path, "wb") as f:
                f.write(data)
                
            return "icon.png"
        except Exception as e:
            print(f"Error procesando imagen: {e}")
            return "/minecraft-landscape-dark.jpg"

    def _save_json(self, path, data):
        with open(path, "w", encoding='utf-8') as f:
            json.dump(data, f, indent=4)

    def update_state(self, instance_id, new_state):
        """Updates only the state field of an instance."""
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            return
            
        with open(config_path, "r", encoding='utf-8') as f:
            config = json.load(f)
            
        config['state'] = new_state
        self._save_json(config_path, config)

    def get_mods(self, instance_id):
        """Lista los archivos .jar en la carpeta mods de la instancia."""
        mods_dir = INSTANCES_DIR / instance_id / "mods"
        if not mods_dir.exists():
            return []
        
        mods = []
        for file in mods_dir.glob("*.jar"):
            mods.append({
                "name": file.name,
                "size": file.stat().st_size,
                "enabled": not file.name.endswith(".disabled")
            })
        return mods

    def get_resourcepacks(self, instance_id):
        """Lista los archivos .zip en la carpeta resourcepacks de la instancia."""
        rp_dir = INSTANCES_DIR / instance_id / "resourcepacks"
        if not rp_dir.exists():
            return []
        
        packs = []
        for file in rp_dir.glob("*.zip"):
            packs.append({
                "name": file.name,
                "size": file.stat().st_size,
                "enabled": True 
            })
        return packs

    def get_shaderpacks(self, instance_id):
        """Lista los archivos .zip en la carpeta shaderpacks de la instancia."""
        sp_dir = INSTANCES_DIR / instance_id / "shaderpacks"
        if not sp_dir.exists():
            return []
        
        packs = []
        for file in sp_dir.glob("*.zip"):
            packs.append({
                "name": file.name,
                "size": file.stat().st_size,
                "enabled": True
            })
        return packs

    def get_datapacks(self, instance_id):
        """Lista los archivos .zip o carpetas en la carpeta datapacks de la instancia."""
        dp_dir = INSTANCES_DIR / instance_id / "datapacks"
        if not dp_dir.exists():
            return []
        
        packs = []
        # Data packs can be folders or zips
        for file in dp_dir.iterdir():
            if file.name.startswith('.'): continue
            if file.is_file() and not file.name.endswith('.zip'): continue
            
            packs.append({
                "name": file.name,
                "size": file.stat().st_size if file.is_file() else 0, # Size for folders is complex, 0 for now
                "enabled": True
            })
        return packs

    def get_worlds(self, instance_id):
        """Lista las carpetas en saves."""
        saves_dir = INSTANCES_DIR / instance_id / "saves"
        if not saves_dir.exists():
            return []
        
        worlds = []
        for folder in saves_dir.iterdir():
            if folder.is_dir():
                worlds.append({
                    "name": folder.name,
                    "folder": folder.name,
                    "size": 0 # Calcular tamaño real sería costoso
                })
        return worlds

    def import_modpack(self, zip_path, original_filename):
        """Importa un modpack desde un ZIP (formato CurseForge)."""
        
        # 1. Crear carpeta temporal para extracción
        temp_dir = INSTANCES_DIR / "temp_import"
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        temp_dir.mkdir()

        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # 2. Buscar manifest.json
            manifest_path = temp_dir / "manifest.json"
            if not manifest_path.exists():
                # Intentar buscar en subcarpetas si el zip tiene una carpeta raíz
                subdirs = [d for d in temp_dir.iterdir() if d.is_dir()]
                if len(subdirs) == 1 and (subdirs[0] / "manifest.json").exists():
                    manifest_path = subdirs[0] / "manifest.json"
                    temp_dir = subdirs[0] # Ajustar raíz
                else:
                    raise Exception("No se encontró manifest.json en el ZIP")

            with open(manifest_path, 'r') as f:
                manifest = json.load(f)

            # 3. Extraer info básica
            name = manifest.get('name', original_filename.replace('.zip', ''))
            version = manifest.get('minecraft', {}).get('version')
            loaders = manifest.get('minecraft', {}).get('modLoaders', [])
            primary_loader = next((l for l in loaders if l.get('primary')), loaders[0] if loaders else None)
            
            if not version:
                raise Exception("El manifest no especifica la versión de Minecraft")

            loader_name = "Vanilla"
            loader_version = None
            
            if primary_loader:
                lid = primary_loader.get('id', '')
                if 'forge' in lid:
                    loader_name = "Forge"
                    loader_version = lid.replace('forge-', '')
                elif 'fabric' in lid:
                    loader_name = "Fabric"
                    loader_version = lid.replace('fabric-', '')
                elif 'neoforge' in lid:
                    loader_name = "NeoForge"
                    loader_version = lid.replace('neoforge-', '')

            # 4. Crear la instancia
            create_result = self.create_instance(name, version, loader_name, loader_version)
            instance_id = create_result['id']
            instance_folder = INSTANCES_DIR / instance_id

            # 5. Copiar overrides (archivos del modpack)
            overrides_dir = temp_dir / manifest.get('overrides', 'overrides')
            if overrides_dir.exists():
                # Copiar todo el contenido de overrides a la instancia
                shutil.copytree(overrides_dir, instance_folder, dirs_exist_ok=True)

            # 6. Guardar lista de mods para descargar (modpack_files.json)
            files = manifest.get('files', [])
            if files:
                with open(instance_folder / "modpack_files.json", "w") as f:
                    json.dump(files, f)

            return {"id": instance_id, "message": f"Modpack '{name}' importado. Los mods se descargarán al iniciar."}

        finally:
            # Limpiar
            if temp_dir.exists():
                shutil.rmtree(temp_dir)

    def open_folder(self, instance_id):
        """Abre la carpeta de la instancia en el explorador de archivos."""
        instance_folder = INSTANCES_DIR / instance_id
        if instance_folder.exists():
            os.startfile(instance_folder)
            return True
        return False

instance_manager = InstanceManager()
