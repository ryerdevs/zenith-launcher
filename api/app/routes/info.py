from flask import Blueprint, request, jsonify
import requests
import json
import time
import xml.etree.ElementTree as ET
import minecraft_launcher_lib as mclib
from app.config import GLOBAL_DIR, CACHE_FILE
import sys

info_bp = Blueprint('info', __name__)

CACHE_TTL = 3600 
IS_DEV = '--dev' in sys.argv

def get_cached_data(key):
    if IS_DEV and "neoforge" in key: return None # Sin caché en dev para probar
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, 'r') as f:
                data = json.load(f)
                if key in data and time.time() - data[key]['timestamp'] < CACHE_TTL:
                    return data[key]['payload']
        except: pass
    return None

def save_cache(key, payload):
    current = {}
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, 'r') as f: current = json.load(f)
        except: pass
    current[key] = {"timestamp": time.time(), "payload": payload}
    try:
        with open(CACHE_FILE, 'w') as f: json.dump(current, f)
    except: pass

def fetch_maven(url):
    """Descarga cruda del XML sin lógica extra"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            root = ET.fromstring(resp.content)
            # Devuelve la lista tal cual está en el XML
            return [v.text.strip() for v in root.findall("./versioning/versions/version") if v.text]
    except: pass
    return []

@info_bp.route('/versions', methods=['GET'])
def api_get_versions():
    cached = get_cached_data("mc_releases")
    if cached: return jsonify(cached)
    try:
        versions_data = mclib.utils.get_available_versions(str(GLOBAL_DIR))
        releases = [v['id'] for v in versions_data if v['type'] == 'release']
        save_cache("mc_releases", releases)
        return jsonify(releases)
    except Exception as e:
        return jsonify([]), 500

@info_bp.route('/loaders', methods=['POST'])
def api_get_loaders():
    data = request.json
    mc_version = data.get('mc_version')
    loader_type = data.get('loader_type')
    
    if not mc_version or loader_type == 'Vanilla':
        return jsonify([])

    cache_key = f"{loader_type}_{mc_version}"
    cached = get_cached_data(cache_key)
    if cached: return jsonify(cached)

    loaders = []
    try:
        if loader_type == 'Fabric':
            url = f"https://meta.fabricmc.net/v2/versions/loader/{mc_version}"
            r = requests.get(url, timeout=5).json()
            loaders = [v["loader"]["version"] for v in r]
        
        elif loader_type == 'Forge':
            fv = mclib.forge.find_forge_version(mc_version)
            if fv: loaders = [fv.split("-")[-1]]

        elif loader_type == 'NeoForge':
            # 1. Descargar de los dos repositorios (Nuevo y Viejo)
            v1 = fetch_maven("https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml")
            v2 = fetch_maven("https://maven.neoforged.net/releases/net/neoforged/forge/maven-metadata.xml")
            
            all_raw = v1 + v2

            # 2. Prefijo simple para saber qué pertenece a esta versión de MC
            prefix = ""
            if mc_version == "1.20.1":
                prefix = "1.20.1-"
            else:
                # Lógica simple: 1.21 -> 21. | 1.20.6 -> 20.6.
                parts = mc_version.split('.')
                if len(parts) >= 2:
                    prefix = f"{parts[1]}." 
                    if len(parts) > 2: prefix += f"{parts[2]}."

            # 3. Filtrar
            for v in all_raw:
                if v.startswith(prefix):
                    loaders.append(v)

            # 4. SIN ORDENAMIENTO COMPLEJO. Solo invertimos la lista.
            # (Maven suele poner las versiones nuevas al final del XML, así que invertir funciona)
            loaders.reverse()

        elif loader_type == 'Quilt':
            url = f"https://meta.quiltmc.org/v3/versions/loader/{mc_version}"
            r = requests.get(url, timeout=5).json()
            loaders = [v["loader"]["version"] for v in r]

        save_cache(cache_key, loaders)
        return jsonify(loaders)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify([])