import os
import subprocess
import shutil
import platform

def run_command(command, cwd=None):
    print(f"Running: {command}")
    subprocess.check_call(command, shell=True, cwd=cwd)

def main():
    print("=== Zenith Launcher Build Script ===")
    
    # 1. Install Python Dependencies
    print("\n[1/5] Installing Python Dependencies...")
    run_command("pip install -r api/requirements.txt")
    
    # 2. Build Python Backend (PyInstaller)
    print("\n[2/5] Building Backend (PyInstaller)...")
    
    # Define temp directories for build artifacts
    temp_build_dir = os.path.join("src-tauri", "binaries", "temp_build")
    dist_dir = os.path.join(temp_build_dir, "dist")
    work_dir = os.path.join(temp_build_dir, "build")
    
    # Clean previous builds
    if os.path.exists(temp_build_dir): shutil.rmtree(temp_build_dir)
    
    # Build command
    # --noconsole: Hide terminal
    # --onefile: Single executable
    # --name: api
    # --distpath: Where to put the final exe
    # --workpath: Where to put intermediate build files
    # --specpath: Where to put the .spec file
    run_command(f"pyinstaller --noconsole --onefile --name api --distpath \"{dist_dir}\" --workpath \"{work_dir}\" --specpath \"{temp_build_dir}\" api/main.py")
    
    # 3. Move Binary to Sidecar Location
    print("\n[3/5] Configuring Sidecar...")
    target_triple = "x86_64-pc-windows-msvc" # Assuming Windows x64
    bin_dir = os.path.join("src-tauri", "binaries")
    if not os.path.exists(bin_dir):
        os.makedirs(bin_dir)
        
    src_bin = os.path.join(dist_dir, "api.exe")
    dst_bin = os.path.join(bin_dir, f"api-{target_triple}.exe")
    
    if os.path.exists(src_bin):
        shutil.copy2(src_bin, dst_bin)
        print(f"Moved {src_bin} to {dst_bin}")
        # Clean up temp build directory
        shutil.rmtree(temp_build_dir)
        print("Cleaned up temporary build artifacts.")
    else:
        print("Error: PyInstaller failed to create api.exe")
        exit(1)

    # 4. Build Frontend
    print("\n[4/5] Building Frontend...")
    run_command("npm install", cwd="web")
    run_command("npm run build", cwd="web")
    
    # 5. Build Tauri App
    print("\n[5/5] Building Tauri App...")
    run_command("npm install", cwd="src-tauri") # Ensure tauri cli is available if needed, or just run cargo
    # Using cargo tauri build via npm script in root if available, or direct tauri command
    # Assuming 'tauri' is in path or npx tauri
    run_command("npx tauri build")
    
    print("\n=== Build Complete! ===")
    print(f"Installer should be in src-tauri/target/release/bundle/nsis/")

if __name__ == "__main__":
    main()
