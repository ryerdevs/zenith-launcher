from flask import Blueprint, request, jsonify, send_from_directory, abort
import threading
import json
from app.config import INSTANCES_DIR
from app.services.instances import (
    instance_service,
    content_service,
    modpack_service,
    file_system_service
)
from app.services.installer import install_task

instances_bp = Blueprint('instances', __name__)

@instances_bp.route('/list', methods=['GET'])
def list_instances():
    return jsonify(instance_service.list_instances())

@instances_bp.route('/create', methods=['POST'])
def create_instance():
    try:
        data = request.json
        result = instance_service.create_instance(
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
        
        instance_service.update_instance(data['id'], data)
        return jsonify({"status": "success", "message": "Instancia actualizada"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

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

        with open(json_path, "r", encoding='utf-8') as f:
            config = json.load(f)

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
            
        instance_service.delete_instance(instance_id)
        return jsonify({"status": "success", "message": "Instancia eliminada"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/import-modpack', methods=['POST'])
def import_modpack():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No se envió ningún archivo"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "Nombre de archivo vacío"}), 400

        if not file.filename.endswith('.zip'):
            return jsonify({"status": "error", "message": "El archivo debe ser un ZIP"}), 400

        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as temp_zip:
            file.save(temp_zip.name)
            temp_zip_path = temp_zip.name
            
        try:
            result = modpack_service.import_modpack(temp_zip_path, file.filename)
            return jsonify({"status": "success", **result})
        finally:
            if os.path.exists(temp_zip_path):
                os.remove(temp_zip_path)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/<instance_id>/mods', methods=['GET'])
def get_instance_mods(instance_id):
    try:
        mods = content_service.get_mods(instance_id)
        return jsonify(mods)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/<instance_id>/resourcepacks', methods=['GET'])
def get_instance_resourcepacks(instance_id):
    try:
        packs = content_service.get_resourcepacks(instance_id)
        return jsonify(packs)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/<instance_id>/shaderpacks', methods=['GET'])
def get_instance_shaderpacks(instance_id):
    try:
        packs = content_service.get_shaderpacks(instance_id)
        return jsonify(packs)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/<instance_id>/datapacks', methods=['GET'])
def get_instance_datapacks(instance_id):
    try:
        packs = content_service.get_datapacks(instance_id)
        return jsonify(packs)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/<instance_id>/worlds', methods=['GET'])
def get_instance_worlds(instance_id):
    try:
        worlds = content_service.get_worlds(instance_id)
        return jsonify(worlds)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@instances_bp.route('/<instance_id>/open-folder', methods=['POST'])
def open_instance_folder(instance_id):
    try:
        if file_system_service.open_folder(instance_id):
            return jsonify({"status": "success", "message": "Carpeta abierta"})
        else:
            return jsonify({"status": "error", "message": "Carpeta no encontrada"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500