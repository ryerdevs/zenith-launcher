import sys
import os
from pathlib import Path
import json

# Adjust path to find app module
sys.path.append(os.path.abspath("api"))

from app.services.instances.instance_service import instance_service

print("Calling list_instances()...")
instances = instance_service.list_instances()
print("Done.")
