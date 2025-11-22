import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface World {
    name: string
    folder: string
    size: number
}

interface WorldsManagerProps {
    instanceId: string
}

export function WorldsManager({ instanceId }: WorldsManagerProps) {
    const [worlds, setWorlds] = useState<World[]>([])
    const [loading, setLoading] = useState(true)

    const loadWorlds = async () => {
        setLoading(true)
        try {
            const res = await fetch(`http://localhost:5000/api/instances/${instanceId}/worlds`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setWorlds(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadWorlds() }, [instanceId])

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Mundos ({worlds.length})</h3>
                <Button variant="ghost" size="icon" onClick={loadWorlds} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="flex-1 border rounded-md bg-muted/10 overflow-hidden">
                <ScrollArea className="h-full p-2">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : worlds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-8">
                            <Globe className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No hay mundos guardados</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {worlds.map((world, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/20 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Globe className="h-4 w-4 text-green-500 shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate">{world.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{formatSize(world.size)}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-5">
                                        Guardado
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
