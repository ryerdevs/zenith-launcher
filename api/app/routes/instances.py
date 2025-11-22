from flask import Blueprint, request, jsonify, send_from_directory, abort
import threading
import json
from app.config import INSTANCES_DIR
from app.services.instance_manager import instance_manager
from app.services.installer import install_task

instances_bp = Blueprint('instances', __name__)

@instances_bp.route('/list', methods=['GET'])
def list_instances():
    return jsonify(instance_manager.list_instances())

@instances_bp.route('/create', methods=['POST'])
def create_instance():
    try:
        data = request.json
        result = instance_manager.create_instance(
            data.get('name'),
            data.get('version'),
            data.get('loader', 'Vanilla'),
            data.get('loader_version'),
            data.get('image')
        )
        return jsonify({"status": "success", **result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/update', methods=['POST'])
def update_instance():
    try:
        data = request.json
        if not data.get('id'):
            return jsonify({"status": "error", "message": "Falta ID"}), 400
        
        instance_manager.update_instance(data['id'], data)
        return jsonify({"status": "success", "message": "Instancia actualizada"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- RUTA DE INSTALACIÓN (Faltaba esta) ---
@instances_bp.route('/install', methods=['POST'])
def install_instance_only():
    try:
        data = request.json
        instance_id = data.get('id')
        
        if not instance_id:
            return jsonify({"status": "error", "message": "Falta ID"}), 400

        json_path = INSTANCES_DIR / instance_id / "instance.json"
        
        if not json_path.exists():
            return jsonify({"status": "error", "message": "Instancia no encontrada"}), 404

        # Leer configuración para saber qué descargar
        with open(json_path, "r", encoding='utf-8') as f:
            config = json.load(f)

        # Ejecutar instalación en segundo plano (Daemon Thread)
        threading.Thread(
            target=install_task,
            args=(
                config.get('version'),
                config.get('modLoader'),
                config.get('loaderVersion'),
                instance_id
            ),
            daemon=True
        ).start()

        return jsonify({"status": "installing", "message": "Instalación iniciada"})

    except Exception as e:
        print(f"[ERROR INSTALL] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/image/<instance_id>/<filename>')
def get_instance_image(instance_id, filename):
    """Sirve la imagen local de la instancia"""
    try:
        return send_from_directory(INSTANCES_DIR / instance_id, filename)
    except:
        abort(404)

@instances_bp.route('/delete', methods=['POST'])
def delete_instance_endpoint():
    try:
        data = request.json
        instance_id = data.get('id')
        if not instance_id:
            return jsonify({"status": "error", "message": "Falta ID"}), 400
            
        instance_manager.delete_instance(instance_id)
        return jsonify({"status": "success", "message": "Instancia eliminada"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500