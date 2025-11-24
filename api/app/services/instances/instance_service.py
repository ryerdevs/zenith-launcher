"""
Instance Service - Core CRUD operations for instances.

Responsibilities:
- List instances
- Create instances
- Update instances
- Delete instances
- Coordinate with other services
"""

import json
import os
import shutil
import time
from pathlib import Path
from typing import List, Dict, Optional
from app.config import INSTANCES_DIR

from .image_service import image_service
from .file_system_service import file_system_service


class InstanceService:
    """Service for core instance CRUD operations."""
    
    def list_instances(self) -> List[Dict]:
        """
        List all instances.
        
        Returns:
            List of instance dictionaries
        """
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
                            # Ensure ID
                            data['id'] = folder.name
                            # Ensure absolute image path for frontend
                            if 'image' in data and not data['image'].startswith('http') and not data['image'].startswith('/'):
                                data['image'] = f"http://localhost:5000/api/instances/image/{folder.name}/{os.path.basename(data['image'])}"
                            instances.append(data)
                    except Exception as e:
                        print(f"Error loading {folder}: {e}")
        return instances
    
    def get_instance(self, instance_id: str) -> Optional[Dict]:
        """
        Get a single instance by ID.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            Instance dictionary or None
        """
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            return None
        
        try:
            with open(config_path, "r", encoding='utf-8') as f:
                data = json.load(f)
                data['id'] = instance_id
                return data
        except Exception as e:
            print(f"Error loading instance {instance_id}: {e}")
            return None
    
    def create_instance(self, name: str, version: str, loader: str, loader_version: Optional[str], image_data: Optional[str] = None) -> Dict:
        """
        Create a new instance.
        
        Args:
            name: Instance name
            version: Minecraft version
            loader: Mod loader type
            loader_version: Mod loader version
            image_data: Image URL or base64 data
            
        Returns:
            dict: Result with id and message
        """
        # Create safe folder name
        safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '_', '-')).strip() or "unnamed"
        instance_folder = INSTANCES_DIR / safe_name
        
        # Handle duplicates
        counter = 1
        while instance_folder.exists():
            instance_folder = INSTANCES_DIR / f"{safe_name}_{counter}"
            counter += 1
        
        # Create directory structure
        file_system_service.create_instance_structure(instance_folder)
        
        # Process image
        final_image = "/minecraft-landscape-dark.jpg"
        if image_data:
            final_image = image_service.process_image(image_data, instance_folder)
        
        # Create config
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
    
    def update_instance(self, instance_id: str, data: Dict) -> None:
        """
        Update an existing instance.
        
        Args:
            instance_id: ID of the instance
            data: Dictionary with fields to update
        """
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            raise Exception("Instancia no encontrada")
        
        with open(config_path, "r", encoding='utf-8') as f:
            config = json.load(f)
        
        # Update allowed fields
        if 'name' in data:
            config['name'] = data['name']
        if 'version' in data:
            config['version'] = data['version']
        if 'modLoader' in data:
            config['modLoader'] = data['modLoader']
        if 'loaderVersion' in data:
            config['loaderVersion'] = data['loaderVersion']
        
        # Process new image if exists
        if 'image' in data and data['image']:
            config['image'] = image_service.process_image(data['image'], instance_folder)
        
        self._save_json(config_path, config)
    
    def delete_instance(self, instance_id: str) -> None:
        """
        Delete an instance.
        
        Args:
            instance_id: ID of the instance to delete
        """
        instance_folder = INSTANCES_DIR / instance_id
        if instance_folder.exists():
            shutil.rmtree(instance_folder)
    
    def _save_json(self, path: Path, data: Dict) -> None:
        """Save JSON data to file."""
        with open(path, "w", encoding='utf-8') as f:
            json.dump(data, f, indent=4)

    def update_state(self, instance_id: str, new_state: str) -> None:
        """
        Update the state of an instance.
        
        Args:
            instance_id: ID of the instance
            new_state: New state string
        """
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            return
            
        try:
            with open(config_path, "r", encoding='utf-8') as f:
                config = json.load(f)
                
            config['state'] = new_state
            self._save_json(config_path, config)
        except Exception as e:
            print(f"Error updating state for {instance_id}: {e}")


# Singleton instance
instance_service = InstanceService()
