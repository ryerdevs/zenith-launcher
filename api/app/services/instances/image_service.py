"""
Image Service - Handles image processing for instances.

Responsibilities:
- Process base64 encoded images
- Validate preset image URLs
- Save images to instance folders
"""

import base64
from pathlib import Path
from typing import Optional


class ImageService:
    """Service for processing and managing instance images."""
    
    def process_image(self, image_data: str, instance_folder: Path) -> str:
        """
        Process an image for an instance.
        
        Args:
            image_data: Either a preset URL (starting with /) or base64 encoded image
            instance_folder: Path to the instance folder
            
        Returns:
            str: Image path/URL to store in instance config
        """
        if not image_data:
            return "/minecraft-landscape-dark.jpg"
        
        # Check if it's a preset URL
        if self.is_preset_url(image_data):
            return image_data
        
        # Check if it's base64 data
        if self.is_base64(image_data):
            return self._save_base64_image(image_data, instance_folder)
        
        # Default fallback
        return "/minecraft-landscape-dark.jpg"
    
    def is_preset_url(self, url: str) -> bool:
        """Check if the URL is a preset image (starts with /)."""
        return url.startswith('/')
    
    def is_base64(self, data: str) -> bool:
        """Check if the data is base64 encoded (starts with data:)."""
        return data.startswith('data:')
    
    def _save_base64_image(self, base64_data: str, instance_folder: Path) -> str:
        """
        Save a base64 encoded image to the instance folder.
        
        Args:
            base64_data: Base64 encoded image string
            instance_folder: Path to instance folder
            
        Returns:
            str: Filename of the saved image (icon.png)
        """
        try:
            # Split header and encoded data
            header, encoded = base64_data.split(",", 1)
            data = base64.b64decode(encoded)
            
            # Save to instance folder
            image_path = instance_folder / "icon.png"
            with open(image_path, "wb") as f:
                f.write(data)
            
            return "icon.png"
        except Exception as e:
            print(f"Error processing image: {e}")
            return "/minecraft-landscape-dark.jpg"
    
    def cleanup_old_images(self, instance_folder: Path) -> None:
        """
        Remove old custom images from instance folder.
        
        Args:
            instance_folder: Path to instance folder
        """
        image_path = instance_folder / "icon.png"
        if image_path.exists():
            try:
                image_path.unlink()
            except Exception as e:
                print(f"Error cleaning up image: {e}")


# Singleton instance
image_service = ImageService()
