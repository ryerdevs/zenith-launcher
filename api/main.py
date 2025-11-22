import sys
import os
import time
from flask import Flask, Response, jsonify
from flask_cors import CORS

# Configurar path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import API_PORT, INSTANCES_DIR
from app.sse import event_stream
from app.routes.auth import auth_bp
from app.routes.info import info_bp
from app.routes.instances import instances_bp
from app.routes.launch import launch_bp
from app.routes.settings import settings_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(info_bp, url_prefix='/api/info')
app.register_blueprint(instances_bp, url_prefix='/api/instances')
app.register_blueprint(launch_bp, url_prefix='/api/launcher')
app.register_blueprint(settings_bp, url_prefix='/api/settings')

@app.route('/api/events')
def sse_request():
    return Response(event_stream(), mimetype='text/event-stream')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "server": "MineLauncher API"})

def start_server():
    # Detectar modo desarrollo mediante argumento
    is_dev = '--dev' in sys.argv
    
    print(f"[{time.strftime('%H:%M:%S')}] [API] Iniciando servidor...")
    if is_dev:
        # HE QUITADO EL EMOJI AQUÍ PARA EVITAR EL ERROR EN WINDOWS
        print(f"[{time.strftime('%H:%M:%S')}] [API] [DEV] MODO DESARROLLO: Hot Reload ACTIVADO")
    
    app.run(host='127.0.0.1', port=API_PORT, debug=is_dev, use_reloader=is_dev, threaded=True)

if __name__ == '__main__':
    start_server()