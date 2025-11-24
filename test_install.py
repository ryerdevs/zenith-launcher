import sys
import os
import time
import json
from pathlib import Path

# Adjust path to find app module
sys.path.append(os.path.abspath("api"))

from app.services.installer import install_task
from app.services.instances.instance_service import instance_service
from app.config import INSTANCES_DIR

# Mock announce to print to console
import app.sse
def mock_announce(event, data, progress=None):
    print(f"[SSE] {event}: {data} ({progress}%)")
app.sse.announce = mock_announce

instance_id = "Create Chronicles The Endventure"
print(f"Testing installation for: {instance_id}")

instance = instance_service.get_instance(instance_id)
if not instance:
    print("Instance not found!")
    sys.exit(1)

print(f"Original Instance data: {instance}")

# FIX THE INSTANCE DATA
if instance.get('modLoader') == 'Forge' and 'neo' in instance.get('loaderVersion', ''):
    print("Detected corrupted NeoForge instance imported as Forge. Fixing...")
    
    # Fix version: neo21.1.197 -> 21.1.197
    # Or just use the version string if it looks like a version
    # But wait, if it was 'neoforge-21.1.197', replacing 'forge-' gave 'neo21.1.197'.
    # So we should strip 'neo' from the start.
    
    current_ver = instance.get('loaderVersion')
    new_ver = current_ver
    if new_ver.startswith('neo'):
        new_ver = new_ver[3:]
        
    update_data = {
        'modLoader': 'NeoForge',
        'loaderVersion': new_ver
    }
    
    instance_service.update_instance(instance_id, update_data)
    
    # Reload
    instance = instance_service.get_instance(instance_id)
    print(f"Fixed Instance data: {instance}")

try:
    install_task(
        instance.get('version'),
        instance.get('modLoader'),
        instance.get('loaderVersion'),
        instance_id
    )
    print("Installation finished successfully.")
except Exception as e:
    print(f"Installation failed: {e}")
    import traceback
    traceback.print_exc()
