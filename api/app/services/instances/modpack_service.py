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
            name, version, loader_name, loader_version = self._extract_info(manifest, original_filename)
            
            # Create instance
            create_result = instance_service.create_instance(name, version, loader_name, loader_version)
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
            if 'forge' in lid:
                loader_name = "Forge"
                loader_version = lid.replace('forge-', '')
            elif 'fabric' in lid:
                loader_name = "Fabric"
                loader_version = lid.replace('fabric-', '')
            elif 'neoforge' in lid:
                loader_name = "NeoForge"
                loader_version = lid.replace('neoforge-', '')
        
        return name, version, loader_name, loader_version
    
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


# Singleton instance
modpack_service = ModpackService()
