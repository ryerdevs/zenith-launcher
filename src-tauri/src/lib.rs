use tauri::Manager;
use tauri_plugin_shell::ShellExt;

// 1. Definimos el comando que React va a llamar
#[tauri::command]
async fn close_splashscreen(app: tauri::AppHandle) {
    // Buscar la ventana de splash y cerrarla
    if let Some(splash_window) = app.get_webview_window("splashscreen") {
        splash_window.close().unwrap();
    }
    
    // Buscar la ventana principal y mostrarla
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.show().unwrap();
        main_window.set_focus().unwrap();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let sidecar_command = app.shell().sidecar("api").unwrap();
            let (mut _rx, _child) = sidecar_command.spawn().unwrap();
            
            Ok(())
        })
        // 2. Registramos el comando para que sea "visible" desde el frontend
        .invoke_handler(tauri::generate_handler![close_splashscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}