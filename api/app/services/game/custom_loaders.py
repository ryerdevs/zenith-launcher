"""
Custom Mod Loader Installers
Instaladores personalizados para Forge y NeoForge
Basado en minecraft-launcher-lib pero con mejor manejo de errores y logging
"""

import requests
import subprocess
import tempfile
import os
import sys
from pathlib import Path
from typing import Callable, Optional
from app.core.sse import announce

def empty(*args, **kwargs):
    """Función vacía para callbacks opcionales"""
    pass


def download_file(url: str, destination: str, progress_callback: Optional[Callable] = None):
    """
    Descarga un archivo con reporte de progreso
    """
    print(f"[DOWNLOAD] Descargando desde: {url}")
    
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    downloaded = 0
    
    with open(destination, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                
                if progress_callback and total_size > 0:
                    progress = int((downloaded / total_size) * 100)
                    progress_callback(progress)
    
    print(f"[DOWNLOAD] Completado: {destination}")


def get_neoforge_versions() -> list[str]:
    """
    Obtiene la lista de versiones disponibles de NeoForge
    """
    api_url = "https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge"
    
    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        return response.json()["versions"]
    except Exception as e:
        print(f"[NEOFORGE API ERROR] {e}")
        return []


def install_neoforge(mc_version: str, loader_version: str, minecraft_directory: str, 
                     java_path: str = "java", status_callback: Optional[Callable] = None):
    """
    Instala NeoForge usando el instalador oficial
    
    Args:
        mc_version: Versión de Minecraft (ej: "1.21.6")
        loader_version: Versión completa de NeoForge (ej: "21.6.20-beta")  
        minecraft_directory: Directorio de Minecraft
        java_path: Ruta al ejecutable de Java
        status_callback: Función para reportar el estado
    """
    status_callback = status_callback or empty
    
    print(f"[NEOFORGE] Instalando NeoForge {loader_version} para Minecraft {mc_version}")
    status_callback(f"Descargando instalador de NeoForge {loader_version}...")
    
    # URL del instalador
    installer_url = f"https://maven.neoforged.net/releases/net/neoforged/neoforge/{loader_version}/neoforge-{loader_version}-installer.jar"
    
    with tempfile.TemporaryDirectory(prefix="neoforge-install-") as tempdir:
        installer_path = os.path.join(tempdir, "neoforge-installer.jar")
        
        try:
            # Descargar el instalador
            download_file(installer_url, installer_path)
            
            # Ejecutar el instalador
            status_callback("Ejecutando instalador de NeoForge...")
            print(f"[NEOFORGE] Ejecutando instalador...")
            print(f"[NEOFORGE] Java: {java_path}")
            print(f"[NEOFORGE] Minecraft Dir: {minecraft_directory}")
            
            # Crear el archivo launcher_profiles.json si no existe
            profiles_path = os.path.join(minecraft_directory, "launcher_profiles.json")
            if not os.path.exists(profiles_path):
                print("[NEOFORGE] Creando launcher_profiles.json...")
                with open(profiles_path, 'w') as f:
                    f.write('{"profiles": {}, "version": 3}')
            
            # Construir comando
            cmd = [
                java_path, 
                "-jar", installer_path,
                "--install-client", minecraft_directory
            ]
            
            print(f"[NEOFORGE] Comando: {' '.join(cmd)}")
            
            # Ejecutar instalador
            result = subprocess.run(
                cmd,
                cwd=tempdir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos máximo
            )
            
            # Mostrar output
            if result.stdout:
                print(f"[NEOFORGE OUTPUT]\n{result.stdout}")
            
            if result.stderr:
                print(f"[NEOFORGE STDERR]\n{result.stderr}")
            
            if result.returncode != 0:
                raise Exception(f"El instalador de NeoForge fallo con codigo {result.returncode}")
            
            print(f"[NEOFORGE] Instalacion completada exitosamente")
            status_callback("NeoForge instalado correctamente")
            
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"[NEOFORGE ERROR] Error descargando: {e}")
            raise Exception(f"No se pudo descargar el instalador de NeoForge: {e}")
        
        except subprocess.TimeoutExpired:
            print(f"[NEOFORGE ERROR] Tiempo de espera agotado")
            raise Exception("La instalacion de NeoForge tardo demasiado")
        
        except Exception as e:
            print(f"[NEOFORGE ERROR] Error general: {e}")
            raise


def get_forge_versions(mc_version: str) -> list[str]:
    """
    Obtiene las versiones de Forge disponibles para una versión de Minecraft
    """
    try:
        # Usar API de Maven
        url = "https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Parsear XML simple (buscar versiones que empiecen con mc_version)
        import re
        versions = []
        for match in re.finditer(r'<version>([^<]+)</version>', response.text):
            version = match.group(1)
            if version.startswith(mc_version):
                versions.append(version)
        
        return versions
    except Exception as e:
        print(f"[FORGE API ERROR] {e}")
        return []


# Exportar funciones principales
__all__ = [
    'install_neoforge',
    'get_neoforge_versions',
    'get_forge_versions',
    'download_file'
]
