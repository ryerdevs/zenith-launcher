from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/offline', methods=['POST'])
def api_login_offline():
    data = request.json
    username = data.get('username')
    
    if not username or len(username) < 3:
        return jsonify({"status": "error", "message": "Nombre muy corto"}), 400
        
    # En el futuro, aquí podrías guardar el perfil en un json
    return jsonify({
        "status": "success", 
        "username": username, 
        "uuid": "offline-uuid",
        "type": "offline",
        "message": "Login Offline correcto"
    })