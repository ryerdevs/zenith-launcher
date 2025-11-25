import { useState, useEffect } from 'react'
import { Button } from '@/ui/button'
import { DropdownMenuTrigger } from '@/ui/dropdown-menu'
import { Loader2, ChevronUp, Square, Clock, Play, Download } from 'lucide-react'
import { ProgressBar } from './components/ProgressBar'
import { useLauncher } from '@/core/state'

interface PlayButtonProps {
  handlePlay: () => void
  handleInstall: () => void
  isDropdownOpen: boolean
  selectedInstanceImage?: string
  // NUEVO: Propiedad para recibir el nombre bonito
  displayName?: string
  instanceState?: 'created' | 'installing' | 'ready' | 'running' | 'error'
}

export function PlayButton({ handlePlay, handleInstall, selectedInstanceImage, displayName, isDropdownOpen, instanceState }: PlayButtonProps) {
  const {
    selectedInstanceName, // Esto es el ID (ej: "Instancia_1")
    gameStatus,
    gameStatusMessage,
    downloadProgress
  } = useLauncher()

  const [sessionTime, setSessionTime] = useState(0)

  // --- CRONÓMETRO ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStatus === 'running') {
      const startTime = Date.now() - (sessionTime * 1000);
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        setSessionTime(seconds);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [gameStatus]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // --- ESTADOS ---
  const isDownloading = gameStatus === 'downloading' || gameStatus === 'installing'
  const isLaunching = gameStatus === 'launching'
  const isRunning = gameStatus === 'running'
  const isBusy = isDownloading || isLaunching || isRunning
  
  const needsInstall = instanceState === 'created' || instanceState === 'error' || !instanceState

  // --- ACCIÓN ---
  const handleMainAction = () => {
    if (!selectedInstanceName || isBusy) return;
    if (needsInstall) {
      handleInstall();
    } else {
      handlePlay();
    }
  }

  // --- ESTILOS ---
  let buttonClass = "relative overflow-hidden border-0 "
  
  if (isRunning) {
      buttonClass += "bg-emerald-600 hover:bg-emerald-500 text-white"
  } else if (isBusy) {
      buttonClass += "bg-zinc-900 text-zinc-100 cursor-progress"
  } else if (!selectedInstanceName) {
      buttonClass += "bg-secondary text-muted-foreground cursor-not-allowed"
  } else if (needsInstall) {
      buttonClass += "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
  } else {
      buttonClass += "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
  }

  // Texto a mostrar: Si hay nombre bonito úsalo, si no usa el ID
  const textToShow = displayName || selectedInstanceName;

  return (
    <div className="flex items-stretch rounded-lg overflow-hidden transition-all select-none shadow-xl hover:shadow-2xl h-16 w-[320px]">
      
      {/* BOTÓN GRANDE */}
      <Button
        className={`rounded-r-none h-full px-6 text-xl font-bold flex-1 min-w-0 ${buttonClass} focus-visible:ring-0 focus-visible:ring-offset-0`}
        disabled={isBusy && !isRunning}
        onClick={handleMainAction}
      >
        {/* CONTENEDOR INTERNO */}
        <div className="flex items-center justify-center w-full h-full relative z-10">
          
          {/* CASO 1: DESCARGANDO */}
          {isDownloading && (
            <ProgressBar 
                progress={downloadProgress}
                label={gameStatus === 'installing' ? 'INSTALANDO' : 'DESCARGANDO'}
                sublabel={gameStatusMessage || "Procesando..."}
                color="bg-blue-500 text-blue-500"
            />
          )}

          {/* CASO 2: LANZANDO */}
          {isLaunching && (
            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in">
               <div className="flex items-center gap-2 text-emerald-100">
                 <Loader2 className="h-5 w-5 animate-spin" />
                 <span className="tracking-widest font-bold text-base">INICIANDO</span>
               </div>
               <span className="text-[10px] opacity-70">Cargando Java Virtual Machine...</span>
            </div>
          )}

          {/* CASO 3: JUGANDO */}
          {isRunning && (
            <div className="flex flex-col items-center justify-center animate-in zoom-in">
              <div className="flex items-center gap-2 text-white drop-shadow-md mb-0.5">
                <Square className="h-3 w-3 fill-white animate-pulse" />
                <span className="tracking-widest font-black text-sm">EJECUTANDO</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono bg-black/20 px-3 py-0.5 rounded-full border border-white/10">
                <Clock className="h-3 w-3 opacity-80" /> 
                <span>{formatTime(sessionTime)}</span>
              </div>
            </div>
          )}

          {/* CASO 4: SIN SELECCIÓN */}
          {!selectedInstanceName && !isBusy && (
             <span className="text-sm font-bold tracking-wide opacity-50">SELECCIONAR INSTANCIA</span>
          )}

          {/* CASO 5: LISTO (INSTALAR O JUGAR) */}
          {!isBusy && selectedInstanceName && (
            <div className="flex items-center justify-center gap-4 w-full h-full animate-in fade-in zoom-in-95">
               
               {/* Imagen / Icono */}
               <div className="shrink-0 flex items-center justify-center">
                   {needsInstall ? (
                     <div className="p-2 bg-white/20 rounded-md backdrop-blur-sm animate-pulse shadow-inner">
                       <Download className="w-6 h-6 text-white" />
                     </div>
                   ) : selectedInstanceImage ? (
                       <img src={selectedInstanceImage} className="w-11 h-11 rounded-md bg-zinc-900 object-cover shadow-md border border-white/10" />
                   ) : (
                       <div className="p-2 bg-white/20 rounded-md backdrop-blur-sm">
                         <Play className="w-6 h-6 fill-current ml-0.5 text-white" />
                       </div>
                   )}
               </div>

               {/* Textos Centrados */}
               <div className="flex flex-col items-start justify-center text-left h-full py-1">
                 <span className="text-[10px] font-bold opacity-80 leading-tight tracking-wider uppercase text-white/90 mb-0.5">
                    {needsInstall ? 'NO INSTALADO' : 'LISTO PARA JUGAR'}
                 </span>
                 {/* Aquí usamos textToShow en lugar de selectedInstanceName */}
                 <span className="text-lg font-black leading-none truncate max-w-[170px] tracking-tight drop-shadow-sm text-white">
                    {needsInstall ? 'INSTALAR' : textToShow}
                 </span>
               </div>
            </div>
          )}

        </div>
      </Button>

      {/* CHEVRON */}
      <DropdownMenuTrigger asChild>
        <Button
          className={`rounded-l-none h-full px-3 border-l border-l-white/20 z-20 focus-visible:ring-0 focus-visible:ring-offset-0 ${buttonClass}`}
          disabled={isBusy && !isRunning}
        >
          <ChevronUp className={`h-5 w-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
    </div>
  )
}
