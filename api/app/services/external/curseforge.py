import requests
import json
from typing import List, Dict, Optional

class CurseForgeClient:
    BASE_URL = "https://api.curseforge.com/v1"
    API_KEY = "$2a$10$6aoCGEUPlbBkUdV7aVkzpe3/MhvS.l2RHbT3EkC3zpmO6TKFbEWcS"

    def __init__(self):
        self.headers = {
            "x-api-key": self.API_KEY,
            "Accept": "application/json"
        }

    def get_modpack_info(self, project_id: int) -> Optional[Dict]:
        """Get information about a modpack (project)."""
        try:
            response = requests.get(f"{self.BASE_URL}/mods/{project_id}", headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data.get('data')
        except Exception as e:
            print(f"[CF API ERROR] get_modpack_info: {e}")
            return None

    def get_files(self, file_ids: List[int]) -> List[Dict]:
        """Get information (including download URL) for a list of file IDs."""
        if not file_ids:
            return []
            
        try:
            # The API accepts a JSON body with 'fileIds'
            response = requests.post(
                f"{self.BASE_URL}/mods/files", 
                headers={**self.headers, "Content-Type": "application/json"},
                json={"fileIds": file_ids}
            )
            response.raise_for_status()
            data = response.json()
            return data.get('data', [])
        except Exception as e:
            print(f"[CF API ERROR] get_files: {e}")
            return []

curseforge_client = CurseForgeClient()
