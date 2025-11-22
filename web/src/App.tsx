import { useEffect, useState } from 'react'
import { useTheme } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useLauncher } from "@/lib/state"
import { api } from '@/lib/api' // <--- IMPORTANTE: Necesario para cargar instancias

// Importaciones de Tauri
import { invoke } from '@tauri-apps/api/core'

// COMPONENTES
import { TopBar } from "@/components/layout/top-bar"
import { LoginModal } from "@/components/auth/login-modal"
import { SideBar } from "@/components/dashboard/side-bar"
import { BottomBar } from "@/components/dashboard/bottom-bar"
import { HomeView } from "@/components/dashboard/views/home-view"
import { InstancesView } from "@/components/dashboard/views/instances-view"
import { ConsoleView } from "@/components/dashboard/views/console-view"
import { SettingsView } from "@/components/dashboard/views/settings-view"

function App() {
  // Añadimos 'setInstances' para guardar la lista al iniciar
  const { username, setGameStatus, setIsPlaying, addLog, setInstances } = useLauncher()
  const { theme } = useTheme()
  const [activeView, setActiveView] = useState('home')
  
  // 1. Lógica de Inicio (Splash Screen)
  useEffect(() => {
    const initTauri = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        await invoke('close_splashscreen');
      } catch (e) {
        console.warn("Modo navegador (sin Tauri)", e);
      }
    };
    initTauri();
  }, [])

  // 2. Lógica SSE (Eventos en Tiempo Real del Backend)
  useEffect(() => {
    if (!username) return; 

    console.log("🔌 Conectando a eventos del servidor...");
    const eventSource = new EventSource('http://localhost:5000/api/events');

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // A. Logs de consola
            if (data.status === 'log') {
                addLog(data.message);
                return;
            }

            // B. Cambios de Estado (Download, Install, Running)
            console.log(`Estado recibido: ${data.status} - ${data.message}`);
            setGameStatus(data.status, data.message, data.progress);

            // Bloqueo de UI
            if (['downloading', 'installing', 'launching', 'running'].includes(data.status)) {
                setIsPlaying(true);
            }

            // C. Finalización
            if (data.status === 'closed' || data.status === 'error') {
                setIsPlaying(false);
                if (data.status === 'closed') {
                    setGameStatus('idle', 'Listo para jugar', 0);
                }
            }
            
            // D. Actualización tras instalación exitosa (Nuevo)
            if (data.status === 'ready') {
                // Recargar la lista de instancias para actualizar el botón de azul a verde
                api.instances.list().then(setInstances);
            }

        } catch (e) {
            console.error("Error procesando evento SSE:", e);
        }
    };

    return () => {
        eventSource.close();
    };
  }, [username]);

  // 3. Carga Automática de Instancias al Loguearse
  useEffect(() => {
    if (username) {
        console.log("Usuario detectado, cargando lista de instancias...")
        api.instances.list()
            .then(data => setInstances(data))
            .catch(err => console.error("Error cargando instancias:", err))
    }
  }, [username])

  return (
      <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden select-none">
        <TopBar />
        <div className="flex-1 relative flex overflow-hidden">
          {!username ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
               <div 
                 className={`absolute inset-0 bg-cover bg-center opacity-50 animate-in fade-in duration-1000 ${
                   theme === 'dark' 
                     ? "bg-[url('/minecraft-cinematic-landscape.jpg')]" 
                     : "bg-[url('/minecraft-multiplayer-server-minigames-players-sh.jpg')]"
                 }`} 
               />
               <div className="z-10 animate-in zoom-in-95 duration-500"> <LoginModal /> </div>
               <div className="absolute bottom-4 right-6 text-xs text-muted-foreground font-mono z-10 opacity-50">MineLauncher v0.1</div>
            </div>
          ) : (
            <div className="flex w-full h-full animate-in fade-in duration-500">
                <SideBar activeView={activeView} setActiveView={setActiveView} />
                <main className="flex-1 overflow-hidden bg-muted/5 relative flex flex-col">
                    <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
                        {activeView === 'home' && <HomeView />}
                        {activeView === 'instances' && <InstancesView />}
                        {activeView === 'console' && <ConsoleView />}
                        {activeView === 'settings' && <SettingsView />}
                    </div>
                </main>
            </div>
          )}
        </div>
        {username && (
            <BottomBar onOpenSettings={() => setActiveView('settings')} />
        )}
        <Toaster />
      </div>
  )
}

export default App