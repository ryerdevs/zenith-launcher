import os
import subprocess
import shutil

def run_command(command):
    print(f"Running: {command}")
    subprocess.check_call(command, shell=True)

def main():
    print("=== Rebuilding Backend Binary Only ===")
    
    # Define temp directories
    temp_build_dir = os.path.join("src-tauri", "binaries", "temp_build")
    dist_dir = os.path.join(temp_build_dir, "dist")
    work_dir = os.path.join(temp_build_dir, "build")
    
    # Clean previous builds
    if os.path.exists(temp_build_dir): shutil.rmtree(temp_build_dir)
    
    # Build command
    print("Building with PyInstaller...")
    run_command(f"pyinstaller --noconsole --onefile --name api --distpath \"{dist_dir}\" --workpath \"{work_dir}\" --specpath \"{temp_build_dir}\" api/main.py")
    
    # Move Binary
    target_triple = "x86_64-pc-windows-msvc"
    bin_dir = os.path.join("src-tauri", "binaries")
    if not os.path.exists(bin_dir):
        os.makedirs(bin_dir)
        
    src_bin = os.path.join(dist_dir, "api.exe")
    dst_bin = os.path.join(bin_dir, f"api-{target_triple}.exe")
    
    if os.path.exists(src_bin):
        shutil.copy2(src_bin, dst_bin)
        print(f"SUCCESS: Moved {src_bin} to {dst_bin}")
        shutil.rmtree(temp_build_dir)
    else:
        print("ERROR: PyInstaller failed to create api.exe")
        exit(1)

if __name__ == "__main__":
    main()
