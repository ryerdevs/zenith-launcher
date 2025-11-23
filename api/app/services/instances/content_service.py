"""
Content Service - Manages instance content (mods, packs, worlds).

Responsibilities:
- List mods, resource packs, shader packs, data packs, worlds
- Enable/disable content
- Get content metadata
"""

from pathlib import Path
from typing import List, Dict
from app.config import INSTANCES_DIR


class ContentService:
    """Service for managing instance content."""
    
    def get_mods(self, instance_id: str) -> List[Dict]:
        """
        List JAR files in the mods folder.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            List of mod dictionaries with name, size, enabled
        """
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
    
    def get_resourcepacks(self, instance_id: str) -> List[Dict]:
        """
        List ZIP files in the resourcepacks folder.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            List of resource pack dictionaries
        """
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
    
    def get_shaderpacks(self, instance_id: str) -> List[Dict]:
        """
        List ZIP files in the shaderpacks folder.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            List of shader pack dictionaries
        """
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
    
    def get_datapacks(self, instance_id: str) -> List[Dict]:
        """
        List ZIP files or folders in the datapacks folder.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            List of data pack dictionaries
        """
        dp_dir = INSTANCES_DIR / instance_id / "datapacks"
        if not dp_dir.exists():
            return []
        
        packs = []
        for file in dp_dir.iterdir():
            if file.name.startswith('.'):
                continue
            if file.is_file() and not file.name.endswith('.zip'):
                continue
            
            packs.append({
                "name": file.name,
                "size": file.stat().st_size if file.is_file() else 0,
                "enabled": True
            })
        return packs
    
    def get_worlds(self, instance_id: str) -> List[Dict]:
        """
        List folders in the saves directory.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            List of world dictionaries
        """
        saves_dir = INSTANCES_DIR / instance_id / "saves"
        if not saves_dir.exists():
            return []
        
        worlds = []
        for folder in saves_dir.iterdir():
            if folder.is_dir():
                worlds.append({
                    "name": folder.name,
                    "folder": folder.name,
                    "size": 0  # Computing real size would be expensive
                })
        return worlds


# Singleton instance
content_service = ContentService()
