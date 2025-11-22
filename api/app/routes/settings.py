from flask import Blueprint, request, jsonify
import json
from app.config import SETTINGS_FILE

settings_bp = Blueprint('settings', __name__)

DEFAULT_SETTINGS = {
    "java_path": "",
    "ram_gb": 4,
    "extra_jvm_args": ""
}

def load_settings():
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return {**DEFAULT_SETTINGS, **json.load(f)}
        except: pass
    return DEFAULT_SETTINGS.copy()

@settings_bp.route('/', methods=['GET'])
def get_settings():
    return jsonify(load_settings())

@settings_bp.route('/', methods=['POST'])
def update_settings():
    try:
        data = request.json or {}
        current = load_settings()
        # Actualizamos solo lo que llega
        current.update(data)
        
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=4)
            
        return jsonify({"status": "success", "settings": current})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500