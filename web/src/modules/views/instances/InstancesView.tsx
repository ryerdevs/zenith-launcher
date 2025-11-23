import { useState, useEffect } from 'react'
import { Card } from '@/ui/card'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/ui/alert-dialog'
import { useLauncher } from '@/core/state'
import { api } from '@/core/api'
import { CreateInstanceDialog } from './dialogs/CreateInstanceDialog'
import { InstanceDetailsDialog } from './dialogs/InstanceDetailsDialog'
import { ImportModpackDialog } from './dialogs/ImportModpackDialog'
import { InstanceDashboard } from './instance-dashboard/InstanceDashboard'
import { cn } from '@/utils/cn'
import { useToast } from '@/ui/use-toast'
import { Settings, Plus, Import, FolderOpen, Loader2, AlertCircle, Trash2, Check, Clock } from 'lucide-react'

export function InstancesView() {
    const { instances, setInstances, selectedInstanceName } = useLauncher()
    const { toast } = useToast()
    
    const [showCreate, setShowCreate] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [detailsId, setDetailsId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [viewingInstanceId, setViewingInstanceId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const loadInstances = async () => {
        setLoading(true)
        try {
            const data = await api.instances.list()
            setInstances(data)
        } catch (e) {
            toast({ variant: "destructive", description: "Error al cargar instancias." })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInstances()
    }, [])



    const handleDelete = async () => {
        if (!deletingId) return
        try {
            await api.instances.delete(deletingId)
            toast({ description: "Instancia eliminada correctamente." })
            loadInstances()
        } catch (e) {
            toast({ variant: "destructive", description: "Error al eliminar instancia." })
        } finally {
            setDeletingId(null)
        }
    }



    if (viewingInstanceId) {
        const instance = instances.find(i => i.id === viewingInstanceId)
        if (!instance) {
            setViewingInstanceId(null)
            return null
        }
        return (
            <InstanceDashboard 
                instance={instance} 
                onBack={() => setViewingInstanceId(null)} 
            />
        )
    }

    return (
        <div className="h-full flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        Mis Instancias
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona y juega tus versiones de Minecraft.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2">
                        <Import className="w-4 h-4" /> Importar
                    </Button>
                    <Button onClick={() => setShowCreate(true)} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Crear Nueva
                    </Button>
                </div>
            </div>

            {/* GRID */}
            {loading && instances.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : instances.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                    <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                    <p>No tienes instancias creadas.</p>
                    <Button variant="link" onClick={() => setShowCreate(true)}>Crear una ahora</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                    {instances.map((instance) => (
                        <Card 
                            key={instance.id} 
                            className={cn(
                                "group relative overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer",
                                selectedInstanceName === instance.name ? "ring-2 ring-primary" : "hover:border-primary/50"
                            )}
                            onClick={() => {
                                useLauncher.setState({ selectedInstanceName: instance.name })
                            }}
                        >
                            {/* IMAGE / HEADER */}
                            <div className="relative h-40 bg-muted overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                                {instance.image ? (
                                    <img src={instance.image} alt={instance.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                        <FolderOpen className="w-10 h-10" />
                                    </div>
                                )}
                                
                                {/* SELECTION INDICATOR */}
                                {selectedInstanceName === instance.name && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200">
                                        <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg shadow-primary/20">
                                            <Check className="w-6 h-6" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-3 left-3 z-20">
                                    <h3 className="font-bold text-white text-lg leading-none mb-1">{instance.name}</h3>
                                    <p className="text-zinc-300 text-xs font-medium">
                                        {instance.modLoader} {instance.loaderVersion || ''}
                                    </p>
                                </div>

                                {/* PLAY TIME */}
                                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 text-[10px] text-zinc-400 font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    <Clock className="w-3 h-3" />
                                    <span>{instance.playTime || '0m'}</span>
                                </div>

                                <Badge variant="secondary" className="absolute top-3 left-3 z-20 bg-black/50 backdrop-blur text-white border-white/10">
                                    {instance.version}
                                </Badge>

                                {/* ACTIONS (Top Right) */}
                                <div className="absolute top-2 right-2 z-30 flex gap-1">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="text-white/70 hover:text-white hover:bg-black/40 rounded-full w-8 h-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setViewingInstanceId(instance.id)
                                        }}
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="text-white/70 hover:text-red-400 hover:bg-black/40 rounded-full w-8 h-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeletingId(instance.id)
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* DIALOGS */}
            <CreateInstanceDialog 
                open={showCreate} 
                onOpenChange={setShowCreate} 
                onSuccess={() => { setShowCreate(false); loadInstances(); }} 
            />
            
            <ImportModpackDialog
                open={showImport}
                onOpenChange={setShowImport}
                onSuccess={() => { setShowImport(false); loadInstances(); }}
            />

            {detailsId && (
                <InstanceDetailsDialog 
                    instanceId={detailsId} 
                    isOpen={!!detailsId} 
                    onClose={() => setDetailsId(null)}
                    onSuccess={() => { loadInstances(); setDetailsId(null); }}
                />
            )}

            <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán todos los archivos de la instancia permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
