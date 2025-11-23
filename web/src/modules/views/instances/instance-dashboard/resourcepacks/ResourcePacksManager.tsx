import { useEffect, useState } from 'react'
import { ScrollArea } from '@/ui/scroll-area'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { FileArchive, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/ui/skeleton'

interface ResourcePack {
    name: string
    size: number
    enabled: boolean
}

interface ResourcePacksManagerProps {
    instanceId: string
}

export function ResourcePacksManager({ instanceId }: ResourcePacksManagerProps) {
    const [packs, setPacks] = useState<ResourcePack[]>([])
    const [loading, setLoading] = useState(true)

    const [search, setSearch] = useState("")

    const loadPacks = async () => {
        setLoading(true)
        try {
            const res = await fetch(`http://localhost:5000/api/instances/${instanceId}/resourcepacks`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setPacks(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadPacks() }, [instanceId])

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const filteredPacks = packs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex flex-col h-full">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <div className="relative flex-1 max-w-md">
                    <FileArchive className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar resource packs..." 
                        className="pl-8 bg-muted/20 border-border/50" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="ghost" size="sm" onClick={loadPacks} disabled={loading} className="text-muted-foreground">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>

            {/* HEADER ROW */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/50 uppercase tracking-wider">
                <div className="col-span-8">Resource Pack</div>
                <div className="col-span-4 text-right">Estado</div>
            </div>

            <div className="flex-1 bg-muted/5 rounded-md border border-border/30 overflow-hidden">
                <ScrollArea className="h-full">
                    {loading ? (
                        <div className="p-4 space-y-2">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full bg-muted/20" />)}
                        </div>
                    ) : filteredPacks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-12">
                            <FileArchive className="h-12 w-12 opacity-10" />
                            <p>No se encontraron resource packs</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/10">
                            {filteredPacks.map((pack, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-muted/10 transition-colors group">
                                    <div className="col-span-8 flex items-center gap-3 overflow-hidden">
                                        <div className="h-10 w-10 rounded bg-muted/30 flex items-center justify-center shrink-0">
                                            <FileArchive className="h-5 w-5 text-primary/70" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold truncate text-foreground">{pack.name}</span>
                                            <span className="text-xs text-muted-foreground">{formatSize(pack.size)}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-4 flex justify-end">
                                        <Badge variant="outline" className="bg-background/50">
                                            Instalado
                                        </Badge>
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
