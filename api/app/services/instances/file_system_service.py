"""
File System Service - Handles file system operations for instances.

Responsibilities:
- Open instance folders
- Create instance directory structure
- Safe file operations
"""

import os
from pathlib import Path
from app.config import INSTANCES_DIR


class FileSystemService:
    """Service for file system operations."""
    
    def open_folder(self, instance_id: str) -> bool:
        """
        Open the instance folder in file explorer.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            bool: True if successful
        """
        instance_folder = INSTANCES_DIR / instance_id
        if instance_folder.exists():
            try:
                os.startfile(instance_folder)
                return True
            except Exception as e:
                print(f"Error opening folder: {e}")
                return False
        return False
    
    def create_instance_structure(self, instance_folder: Path) -> None:
        """
        Create the standard directory structure for an instance.
        
        Args:
            instance_folder: Path to the instance folder
        """
        instance_folder.mkdir(parents=True, exist_ok=True)
        (instance_folder / "mods").mkdir(exist_ok=True)
        (instance_folder / "config").mkdir(exist_ok=True)
        (instance_folder / "saves").mkdir(exist_ok=True)
        (instance_folder / "resourcepacks").mkdir(exist_ok=True)
        (instance_folder / "shaderpacks").mkdir(exist_ok=True)
        (instance_folder / "datapacks").mkdir(exist_ok=True)


# Singleton instance
file_system_service = FileSystemService()
