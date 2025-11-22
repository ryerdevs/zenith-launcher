import json
import time
import base64
import shutil
from pathlib import Path
from app.config import INSTANCES_DIR

class InstanceManager:
    def list_instances(self):
        """Lista todas las instancias encontradas en la carpeta data."""
        if not INSTANCES_DIR.exists():
            return []
        
        instances = []
        for folder in INSTANCES_DIR.iterdir():
            if folder.is_dir():
                config_path = folder / "instance.json"
                if config_path.exists():
                    try:
                        with open(config_path, "r", encoding='utf-8') as f:
                            data = json.load(f)
                            data['id'] = folder.name
                            
                            # Ajustar ruta de imagen para que el frontend la pueda cargar
                            img = data.get('image', '')
                            if img and not img.startswith('http') and not img.startswith('data:') and not img.startswith('/'):
                                # Si es un nombre de archivo local, construimos la URL de la API
                                data['image'] = f"http://localhost:5000/api/instances/image/{folder.name}/{img}"
                            elif not img:
                                data['image'] = "/minecraft-landscape-dark.jpg"

                            instances.append(data)
                    except Exception as e:
                        print(f"[ERROR] Error leyendo instancia {folder.name}: {e}")
        
        # Ordenar por fecha de creación (más reciente primero)
        instances.sort(key=lambda x: x.get('created', 0), reverse=True)
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

        final_image = "/minecraft-landscape-dark.jpg" 
        if image_data:
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
        """Actualiza configuración de una instancia existente."""
        path = INSTANCES_DIR / instance_id / "instance.json"
        if not path.exists():
            raise FileNotFoundError("Instancia no encontrada")
            
        with open(path, "r", encoding='utf-8') as f:
            current = json.load(f)
            
        fields = ['name', 'version', 'modLoader', 'loaderVersion', 'java_path', 'jvm_args']
        for field in fields:
            if field in data:
                current[field] = data[field]

        # --- CORRECCIÓN AQUÍ: Permitir actualizar imagen sea Base64 o Ruta ---
        if 'image' in data:
            image_data = data['image']
            if image_data:
                # Si es base64, se guarda el archivo y obtenemos el nombre
                # Si es ruta texto (preset), se guarda tal cual
                current['image'] = self._process_image(image_data, INSTANCES_DIR / instance_id)

        self._save_json(path, current)
        return current

    def update_state(self, instance_id, new_state):
        try:
            path = INSTANCES_DIR / instance_id / "instance.json"
            if path.exists():
                with open(path, "r", encoding='utf-8') as f:
                    data = json.load(f)
                data['state'] = new_state
                self._save_json(path, data)
        except Exception as e:
            print(f"[ERROR STATE] {e}")

    def _process_image(self, image_data, folder_path):
        """Helper para guardar imagen si es base64 o devolver string si es ruta"""
        if image_data.startswith("data:image"):
            try:
                header, encoded = image_data.split(",", 1)
                ext = "png" if "png" in header else "jpg"
                file_name = f"cover.{ext}"
                with open(folder_path / file_name, "wb") as f:
                    f.write(base64.b64decode(encoded))
                return file_name
            except Exception as e:
                print(f"[ERROR IMG] {e}")
                return image_data # Fallback
        return image_data

    def _save_json(self, path, data):
        with open(path, "w", encoding='utf-8') as f:
            json.dump(data, f, indent=4)

    def delete_instance(self, instance_id):
        """Borra la carpeta de la instancia completa"""
        folder = INSTANCES_DIR / instance_id
        if folder.exists() and folder.is_dir():
            try:
                shutil.rmtree(folder)
                return True
            except Exception as e:
                print(f"[ERROR DELETE] {e}")
                raise e
        return False

instance_manager = InstanceManager()