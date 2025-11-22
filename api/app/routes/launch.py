from flask import Blueprint, request, jsonify
import threading
from app.services.launcher import launcher_service

launch_bp = Blueprint('launch', __name__)

@launch_bp.route('/launch', methods=['POST'])
def api_launch():
    data = request.json
    # El frontend envía 'instanceName' como ID (legacy)
    instance_id = data.get('instanceName') 
    username = data.get('username')

    if not instance_id or not username:
        return jsonify({"status": "error", "message": "Faltan datos (instanceName, username)"}), 400

    # Iniciamos el proceso en segundo plano
    threading.Thread(
        target=launcher_service.launch_thread,
        args=(instance_id, username),
        daemon=True
    ).start()
    
    return jsonify({"status": "launching", "message": "Lanzamiento iniciado"})