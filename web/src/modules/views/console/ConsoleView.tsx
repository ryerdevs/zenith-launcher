import { useState, useEffect, useRef } from 'react'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import { Badge } from '@/ui/badge'
import { useLauncher } from '@/core/state'
import { api } from '@/core/api'
import { useToast } from '@/ui/use-toast'
import { cn } from '@/utils/cn'
import { Terminal, Square, Trash2, ArrowDown } from 'lucide-react'

export function ConsoleView() {
    const { logs, gameStatus, setGameStatus, addLog } = useLauncher()
    const { toast } = useToast()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [autoScroll, setAutoScroll] = useState(true)
    const [sysConfig, setSysConfig] = useState({ ram_gb: 4, java_path: 'Auto' })

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await api.settings.get()
                if (data) {
                    setSysConfig({
                        ram_gb: data.ram_gb ?? 4,
                        java_path: data.java_path || 'Auto'
                    })
                }
            } catch (e) {
                console.error("Error loading config for console info:", e)
            }
        }
        loadConfig()
    }, [])

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [logs, autoScroll])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        const isAtBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50
        setAutoScroll(isAtBottom)
    }

    const handleKill = async () => {
        try {
            await api.instances.kill()
            setGameStatus('ready', 'Detenido por usuario')
            addLog("Proceso terminado forzosamente por el usuario.")
            toast({ description: "Proceso terminado." })
        } catch (e) {
            toast({ variant: "destructive", description: "Error al detener el proceso." })
        }
    }

    const handleClearLogs = () => {
        // En una implementación real, limpiaríamos el estado de logs en zustand
        // useLauncher.setState({ logs: [] }) 
        // Por ahora simulamos:
        addLog("--- Logs limpiados visualmente ---")
    }

    return (
        <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Terminal className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Consola</h2>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            Estado: 
                            <Badge variant={gameStatus === 'running' ? 'default' : 'secondary'} className={cn("capitalize", gameStatus === 'running' && "animate-pulse")}>
                                {gameStatus === 'running' ? 'Ejecutando' : 'Listo'}
                            </Badge>
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleClearLogs} title="Limpiar consola">
                        <Trash2 className="w-4 h-4 mr-2" /> Limpiar
                    </Button>
                    {gameStatus === 'running' && (
                        <Button variant="destructive" size="sm" onClick={handleKill}>
                            <Square className="w-4 h-4 mr-2 fill-current" /> Detener
                        </Button>
                    )}
                </div>
            </div>

            {/* INFO BAR */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Java: {sysConfig.java_path === 'Auto' ? 'Detectado Automáticamente' : 'Custom'}</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Memoria: {sysConfig.ram_gb} GB</span>
                </div>
            </div>

            {/* CONSOLE OUTPUT */}
            <div className="flex-1 relative min-h-0 rounded-xl border border-border/50 bg-black/90 shadow-inner overflow-hidden font-mono text-sm">
                <ScrollArea className="h-full w-full p-4" ref={scrollRef} onScrollCapture={handleScroll}>
                    <div className="flex flex-col gap-0.5">
                        {logs.length === 0 && (
                            <div className="text-zinc-500 italic text-center mt-10">
                                Esperando logs del juego...
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="break-words whitespace-pre-wrap text-zinc-300 leading-relaxed hover:bg-white/5 px-1 rounded transition-colors">
                                <span className="text-zinc-600 select-none mr-2">[{log.time}]</span>
                                {log.message}
                            </div>
                        ))}
                        {/* Dummy element for auto-scroll */}
                        <div className="h-2" />
                    </div>
                </ScrollArea>
            </div>

            {/* AUTO SCROLL INDICATOR */}
            {!autoScroll && (
                <Button 
                    size="sm" 
                    className="absolute bottom-4 right-6 rounded-full shadow-xl z-20 h-8 text-xs animate-bounce" 
                    onClick={() => setAutoScroll(true)}
                >
                    <ArrowDown className="w-3 h-3 mr-2" /> Resume
                </Button>
            )}
        </div>
    )
}
