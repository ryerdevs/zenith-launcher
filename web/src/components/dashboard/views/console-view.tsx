import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Terminal, Trash2, Copy, ArrowDown, Pause, Play, Cpu, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useLauncher } from '@/lib/state'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function ConsoleView() {
    const { logs, clearLogs, gameStatus } = useLauncher()
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
                        java_path: data.java_path || 'Automático'
                    })
                }
            } catch (e) {
                console.error("Error config consola", e)
            }
        }
        loadConfig()
    }, [])

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [logs, autoScroll])

    const handleCopy = () => {
        const text = logs.map(l => `[${l.time}] ${l.message}`).join('\n')
        navigator.clipboard.writeText(text)
        toast({ description: "Logs copiados al portapapeles" })
    }

    const getLineStyle = (msg: string, type: string) => {
        const lower = msg.toLowerCase()
        
        // ERROR
        if (type === 'error' || lower.includes('error') || lower.includes('exception') || lower.includes('fatal')) 
            return "text-red-600 dark:text-red-400 font-bold bg-red-100/50 dark:bg-red-950/30 px-1 rounded"
        
        // WARNING
        if (type === 'warning' || lower.includes('warn')) 
            return "text-amber-600 dark:text-yellow-400"
        
        // SUCCESS (Nuevo)
        if (type === 'success' || lower.includes('success') || lower.includes('completado')) 
            return "text-emerald-600 dark:text-emerald-400 font-bold"
        
        // SYSTEM
        if (msg.includes('[SYSTEM]') || msg.includes('[CONFIG]')) 
            return "text-cyan-700 dark:text-cyan-400 font-bold"
            
        // DEBUG
        if (msg.includes('[DEBUG]')) 
            return "text-blue-600 dark:text-blue-400 italic opacity-70"

        return "text-zinc-700 dark:text-zinc-300"
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground font-mono text-xs shadow-inner transition-colors">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-2 border-b border-border bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground px-2">
                        <Terminal className="h-4 w-4" />
                        <span className="font-bold tracking-wide hidden sm:inline">TERMINAL</span>
                    </div>
                    
                    <Badge variant={gameStatus === 'running' ? "default" : "secondary"} className="gap-1.5 transition-all">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                            gameStatus === 'running' ? "bg-green-400" : "bg-zinc-400"
                        )} />
                        {gameStatus === 'running' ? 'EN VIVO' : 'OFFLINE'}
                    </Badge>
                </div>

                <div className="flex gap-1">
                    <Button 
                        variant="ghost" size="icon" 
                        className={cn("h-7 w-7", !autoScroll && "text-yellow-500 animate-pulse")}
                        onClick={() => setAutoScroll(!autoScroll)}
                        title={autoScroll ? "Pausar Scroll" : "Reanudar Scroll"}
                    >
                        {autoScroll ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5"/>} 
                    </Button>
                    
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title="Copiar Logs">
                        <Copy className="w-3.5 h-3.5"/>
                    </Button>
                    
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive hover:bg-destructive/10" onClick={clearLogs} title="Limpiar">
                        <Trash2 className="w-3.5 h-3.5"/>
                    </Button>
                </div>
            </div>

            {/* LOGS AREA */}
            <ScrollArea className="flex-1 p-4 bg-zinc-50/50 dark:bg-[#0a0a0a]">
                <div className="flex flex-col font-mono leading-5 space-y-0.5">
                    
                    {/* SYSTEM INFO WIDGET */}
                    <div className="mb-6 p-3 bg-card/50 border border-border/50 rounded-md flex flex-wrap gap-4 select-text opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-primary" />
                            <div>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase">RAM Asignada</p>
                                <p className="text-xs font-bold">{sysConfig.ram_gb} GB</p>
                            </div>
                        </div>
                        <div className="w-px bg-border h-8 hidden sm:block" />
                        <div className="flex items-center gap-2 min-w-[150px]">
                            <Cpu className="h-4 w-4 text-blue-500" />
                            <div className="overflow-hidden">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase">Java Path</p>
                                <p className="text-xs font-medium truncate max-w-[200px]" title={sysConfig.java_path}>
                                    {sysConfig.java_path === 'Auto' || !sysConfig.java_path ? 'Automático' : sysConfig.java_path}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* EMPTY STATE */}
                    {logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                            <Terminal className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-[10px] italic">Esperando logs...</p>
                        </div>
                    )}
                    
                    {/* LOG LINES */}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2 hover:bg-white/5 rounded px-1 transition-colors group">
                            <span className="text-muted-foreground/50 select-none min-w-[65px] text-[10px] pt-[2px]">
                                {log.time}
                            </span>
                            <div className="flex items-start gap-2 flex-1">
                                {log.type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />}
                                {log.type === 'error' && <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />}
                                <span className={cn("break-all whitespace-pre-wrap text-[11px]", getLineStyle(log.message, log.type))}>
                                    {log.message}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} className="pb-2" />
                </div>
            </ScrollArea>

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