import { useEffect, useState } from 'react'
import { ScrollArea } from '@/ui/scroll-area'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Package, RefreshCw, Trash2, Search, Filter } from 'lucide-react'
import { Skeleton } from '@/ui/skeleton'
import { cn } from '@/utils/cn'

interface Mod {
    name: string
    size: number
    enabled: boolean
}

interface ModsManagerProps {
    instanceId: string
    className?: string
}

export function ModsManager({ instanceId, className }: ModsManagerProps) {
    const [mods, setMods] = useState<Mod[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const loadMods = async () => {
        setLoading(true)
        try {
            const res = await fetch(`http://localhost:5000/api/instances/${instanceId}/mods`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setMods(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadMods() }, [instanceId])

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const filteredMods = mods.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* TOOLBAR */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar mods..." 
                            className="pl-8 bg-muted/20 border-border/50" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={loadMods} disabled={loading} className="text-muted-foreground">
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Actualizar
                    </Button>
                    <Button size="sm" className="font-semibold shadow-sm">
                        Actualizar todo
                    </Button>
                </div>
            </div>

            {/* HEADER ROW */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/50 uppercase tracking-wider">
                <div className="col-span-6">Complemento</div>
                <div className="col-span-2 text-center">Acción</div>
                <div className="col-span-2">Autor</div>
                <div className="col-span-2 text-right">Activo</div>
            </div>

            {/* LIST */}
            <div className="flex-1 bg-muted/5 rounded-md border border-border/30 overflow-hidden">
                <ScrollArea className="h-full">
                    {loading ? (
                        <div className="p-4 space-y-2">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full bg-muted/20" />)}
                        </div>
                    ) : filteredMods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-12">
                            <Package className="h-12 w-12 opacity-10" />
                            <p>No se encontraron mods</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/10">
                            {filteredMods.map((mod, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-muted/10 transition-colors group">
                                    
                                    {/* NAME & ICON */}
                                    <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                                        <div className="h-10 w-10 rounded bg-muted/30 flex items-center justify-center shrink-0">
                                            <Package className="h-6 w-6 text-primary/70" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold truncate text-foreground">{mod.name}</span>
                                            <span className="text-xs text-muted-foreground">{formatSize(mod.size)}</span>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTON */}
                                    <div className="col-span-2 flex justify-center">
                                        <Button variant="outline" size="sm" className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            Actualizar...
                                        </Button>
                                    </div>

                                    {/* AUTHOR (Placeholder) */}
                                    <div className="col-span-2 text-sm text-muted-foreground truncate">
                                        Unknown
                                    </div>

                                    {/* ACTIVE TOGGLE & DELETE */}
                                    <div className="col-span-2 flex items-center justify-end gap-3">
                                        {/* Toggle Switch Simulation */}
                                        <div 
                                            className={cn(
                                                "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                                                mod.enabled ? "bg-primary" : "bg-muted"
                                            )}
                                            title={mod.enabled ? "Desactivar" : "Activar"}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                                mod.enabled ? "left-6" : "left-1"
                                            )} />
                                        </div>

                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
