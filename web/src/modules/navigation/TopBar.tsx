import { useEffect, useState } from 'react'
import { Button } from '@/ui/button'
import { Square, X, Minus, Copy } from 'lucide-react'

export function TopBar() {
  const [appWindow, setAppWindow] = useState<any>(null)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const loadTauri = async () => {
      try {
        // Importamos dinámicamente para evitar errores en navegador
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        setAppWindow(win)

        // Chequear estado inicial
        const max = await win.isMaximized()
        setIsMaximized(max)

        // Escuchar evento de cambio de tamaño para actualizar el icono
        // si el usuario arrastra la ventana a los bordes (Snap Layouts)
        await win.listen('tauri://resize', async () => {
            const max = await win.isMaximized()
            setIsMaximized(max)
        })

      } catch (e) {
        console.warn("Entorno Tauri no detectado")
      }
    }
    loadTauri()
  }, [])

  const handleMinimize = () => appWindow?.minimize()

  const handleMaximize = async () => {
    if (!appWindow) return
    const max = await appWindow.isMaximized()
    
    if (max) {
        await appWindow.unmaximize()
        setIsMaximized(false)
    } else {
        await appWindow.maximize()
        setIsMaximized(true)
    }
  }

  const handleClose = () => appWindow?.close()

  return (
    <div 
        className="relative flex h-9 items-center justify-between bg-background/95 backdrop-blur-xl px-3 select-none z-[500] border-b border-white/5"
        // IMPORTANTE: Esto permite arrastrar la ventana
        data-tauri-drag-region
    >
      {/* Título y Versión */}
      <div className="flex items-center gap-2 pointer-events-none">
        <span className="text-xs font-bold text-primary tracking-wider uppercase opacity-80">MineLauncher</span>
        <span className="text-[10px] text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded">BETA</span>
      </div>

      {/* Botones de Control */}
      <div className="flex items-center gap-1 z-50">
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-8 rounded-sm hover:bg-white/10 text-muted-foreground hover:text-white"
            onClick={handleMinimize}
            title="Minimizar"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-8 rounded-sm hover:bg-white/10 text-muted-foreground hover:text-white"
            onClick={handleMaximize}
            title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          {/* Cambiamos el icono: Cuadrado (Max) o Dos Cuadrados (Restaurar/Copy) */}
          {isMaximized ? <Copy className="h-3 w-3 rotate-90" /> : <Square className="h-3 w-3" />}
        </Button>
        
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-8 rounded-sm hover:bg-red-500 hover:text-white text-muted-foreground transition-colors"
            onClick={handleClose}
            title="Cerrar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
