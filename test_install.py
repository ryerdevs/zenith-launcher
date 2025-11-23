"""
Test manual de instalación para identificar el error
"""
import sys
sys.path.insert(0, 'D:/Zenith/desktop/api')

from app.services.installer import install_task

# Intentar instalar NeoForge 21.6.20-beta para Minecraft 1.21.6
print("="*60)
print("Iniciando instalación de prueba...")
print("MC Version: 1.21.6")
print("Loader: NeoForge")
print("Loader Version: 21.6.20-beta")
print("="*60)
print()

try:
    install_task(
        mc_version="1.21.6",
        loader="NeoForge",
        loader_version="21.6.20-beta",
        instance_id="1216"
    )
    print("\n✅ Instalación completada sin errores")
except Exception as e:
    print(f"\n❌ ERROR CAPTURADO:")
    print(f"Tipo: {type(e).__name__}")
    print(f"Mensaje: {str(e)}")
    import traceback
    print("\nTraceback completo:")
    traceback.print_exc()
