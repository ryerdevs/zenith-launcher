from flask import Blueprint, request, jsonify, send_from_directory, abort
import threading
import json
from app.config import INSTANCES_DIR
from app.services.instances.instance_service import instance_service
from app.services.instances.modpack_service import modpack_service
from app.services.game.installer import install_task
from app.services.instances.image_service import image_service
from app.services.instances.content_service import content_service
from app.services.instances.file_system_service import file_system_service

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
        
        # DEBUG: Check if modpack_files.json exists
        modpack_files = INSTANCES_DIR / instance_id / "modpack_files.json"
        print(f"[DEBUG ROUTE] Checking modpack files: {modpack_files} -> Exists: {modpack_files.exists()}")

        if not json_path.exists():
            # FALLBACK: Try to find by name (if frontend sent name instead of ID)
            found = False
            print(f"[DEBUG] ID not found, searching by name: '{instance_id}'")
            for folder in INSTANCES_DIR.iterdir():
                if folder.is_dir():
                    cfg = folder / "instance.json"
                    if cfg.exists():
                        try:
                            with open(cfg, "r", encoding='utf-8') as f:
                                c = json.load(f)
                                if c.get('name') == instance_id:
                                    print(f"[DEBUG] Found instance by name: {folder.name}")
                                    instance_id = folder.name
                                    json_path = cfg
                                    found = True
                                    break
                        except:
                            pass
            
            if not found:
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

@instances_bp.route('/import-modpack', methods=['POST'])
def import_modpack_endpoint():
    try:
        # Check if it's a file upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"status": "error", "message": "No se seleccionó ningún archivo"}), 400
            
            if file:
                # Save to temp file
                temp_dir = INSTANCES_DIR / "temp_upload"
                if not temp_dir.exists():
                    temp_dir.mkdir()
                
                zip_path = temp_dir / file.filename
                file.save(zip_path)
                
                try:
                    result = modpack_service.import_modpack(str(zip_path), file.filename)
                    return jsonify({"status": "success", **result})
                finally:
                    # Cleanup upload
                    if zip_path.exists():
                        try:
                            import os
                            os.remove(zip_path)
                            # Try to remove dir if empty
                            os.rmdir(temp_dir)
                        except:
                            pass

        # Check if it's a JSON request (URL)
        elif request.is_json:
            data = request.json
            url = data.get('url')
            if not url:
                return jsonify({"status": "error", "message": "Falta la URL"}), 400
            
            result = modpack_service.import_modpack_from_url(url)
            
            # AUTO-INSTALL: Trigger installation immediately
            if result.get('id'):
                instance_id = result['id']
                print(f"[AUTO-INSTALL] Triggering install for {instance_id}")
                
                # Get instance config
                json_path = INSTANCES_DIR / instance_id / "instance.json"
                if json_path.exists():
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
                    result['message'] += " La instalación ha comenzado automáticamente."

            return jsonify({"status": "success", **result})
            
        else:
            return jsonify({"status": "error", "message": "Solicitud inválida. Se requiere archivo o URL."}), 400

    except Exception as e:
        print(f"[IMPORT ERROR] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500