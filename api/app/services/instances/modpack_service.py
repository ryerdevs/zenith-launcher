"""
Modpack Service - Handles modpack import functionality.

Responsibilities:
- Import CurseForge modpacks from ZIP
- Parse manifest.json
- Copy overrides
- Manage temporary files
"""

import json
import shutil
import zipfile
from pathlib import Path
from typing import Dict
from app.config import INSTANCES_DIR


class ModpackService:
    """Service for importing modpacks."""
    
    def import_modpack(self, zip_path: str, original_filename: str) -> Dict:
        """
        Import a modpack from a ZIP file (CurseForge format).
        
        Args:
            zip_path: Path to the ZIP file
            original_filename: Original filename
            
        Returns:
            dict: Result with instance_id and message
        """
        # Import here to avoid circular dependency
        from .instance_service import instance_service
        
        # Create temporary directory
        temp_dir = INSTANCES_DIR / "temp_import"
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        temp_dir.mkdir()
        
        try:
            # Extract ZIP
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Find manifest.json
            manifest_path = self._find_manifest(temp_dir)
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            # Extract modpack info
            name, version, loader_name, loader_version, project_id = self._extract_info(manifest, original_filename)
            
            # Fetch metadata from CurseForge if project_id exists
            image_url = None
            if project_id:
                try:
                    from app.services.external.curseforge import curseforge_client
                    info = curseforge_client.get_modpack_info(project_id)
                    if info and info.get('logo'):
                        image_url = info['logo'].get('url')
                except Exception as e:
                    print(f"Error fetching CF info: {e}")

            # Create instance
            create_result = instance_service.create_instance(name, version, loader_name, loader_version, image_url)
            instance_id = create_result['id']
            instance_folder = INSTANCES_DIR / instance_id
            
            # Copy overrides
            self._copy_overrides(temp_dir, manifest, instance_folder)
            
            # Save mod files list
            self._save_mod_files(manifest, instance_folder)
            
            return {
                "id": instance_id,
                "message": f"Modpack '{name}' importado. Los mods se descargarán al iniciar."
            }
        
        finally:
            # Cleanup
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
    
    def _find_manifest(self, temp_dir: Path) -> Path:
        """Find manifest.json in the extracted directory."""
        manifest_path = temp_dir / "manifest.json"
        if not manifest_path.exists():
            # Try subdirectories
            subdirs = [d for d in temp_dir.iterdir() if d.is_dir()]
            if len(subdirs) == 1 and (subdirs[0] / "manifest.json").exists():
                return subdirs[0] / "manifest.json"
            raise Exception("No se encontró manifest.json en el ZIP")
        return manifest_path
    
    def _extract_info(self, manifest: Dict, filename: str) -> tuple:
        """Extract modpack information from manifest."""
        name = manifest.get('name', filename.replace('.zip', ''))
        version = manifest.get('minecraft', {}).get('version')
        
        if not version:
            raise Exception("El manifest no especifica la versión de Minecraft")
        
        loaders = manifest.get('minecraft', {}).get('modLoaders', [])
        primary_loader = next((l for l in loaders if l.get('primary')), loaders[0] if loaders else None)
        
        loader_name = "Vanilla"
        loader_version = None
        
        if primary_loader:
            lid = primary_loader.get('id', '')
            if 'neoforge' in lid:
                loader_name = "NeoForge"
                loader_version = lid.replace('neoforge-', '')
            elif 'forge' in lid:
                loader_name = "Forge"
                loader_version = lid.replace('forge-', '')
            elif 'fabric' in lid:
                loader_name = "Fabric"
                loader_version = lid.replace('fabric-', '')
        
        project_id = manifest.get('projectID')
        
        return name, version, loader_name, loader_version, project_id
    
    def _copy_overrides(self, temp_dir: Path, manifest: Dict, instance_folder: Path) -> None:
        """Copy override files to instance folder."""
        overrides_dir = temp_dir / manifest.get('overrides', 'overrides')
        if overrides_dir.exists():
            shutil.copytree(overrides_dir, instance_folder, dirs_exist_ok=True)
    
    def _save_mod_files(self, manifest: Dict, instance_folder: Path) -> None:
        """Save mod files list for later download."""
        files = manifest.get('files', [])
        if files:
            with open(instance_folder / "modpack_files.json", "w") as f:
                json.dump(files, f)


    def import_modpack_from_url(self, url: str) -> Dict:
        """
        Import a modpack from a direct download URL.
        
        Args:
            url: Direct download URL for the ZIP file
            
        Returns:
            dict: Result with instance_id and message
        """
        import requests
        from urllib.parse import urlparse
        import os
        
        # Create temporary directory
        temp_dir = INSTANCES_DIR / "temp_import_url"
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        temp_dir.mkdir()
        
        try:
            # Download file
            filename = os.path.basename(urlparse(url).path)
            if not filename.endswith('.zip'):
                filename = "modpack.zip"
                
            zip_path = temp_dir / filename
            
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(zip_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Use existing import logic
            # We pass the path as string because import_modpack expects it (based on current signature)
            # But we need to be careful about cleanup. 
            # The import_modpack method cleans up its own temp dir, but not the one we just created.
            
            # Actually, import_modpack takes a zip_path string.
            # It extracts it to a NEW temp dir.
            # So we can just call it.
            
            return self.import_modpack(str(zip_path), filename)
            
        finally:
            # Cleanup our download temp dir
            if temp_dir.exists():
                shutil.rmtree(temp_dir)

# Singleton instance
modpack_service = ModpackService()
