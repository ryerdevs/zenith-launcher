import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, HardDrive, RefreshCw, Settings, PlayCircle, Box, Trash2 } from 'lucide-react'
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { useLauncher } from '@/lib/state'
import { api } from '@/lib/api'
import { CreateInstanceDialog } from '../dialogs/create-instance-dialog'
import { EditInstanceDialog } from '../dialogs/edit-instance-dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function InstancesView() {
    const { instances, setInstances, selectedInstanceName, setSelectedInstanceName } = useLauncher()
    const { toast } = useToast()
    
    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null) // ID para confirmar borrado
    const [loading, setLoading] = useState(false)

    const loadInstances = async () => {
        setLoading(true)
        try {
            const data = await api.instances.list()
            setInstances(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            await api.instances.delete(deletingId)
            toast({ 
                title: "Instancia eliminada", 
                description: "Los archivos se han borrado correctamente.",
                variant: "destructive"
            })
            
            // Si la instancia borrada estaba seleccionada, deseleccionar
            if (selectedInstanceName === deletingId) {
                setSelectedInstanceName(null)
            }
            
            loadInstances()
        } catch (e) {
            toast({ title: "Error", description: "No se pudo eliminar la instancia.", variant: "destructive" })
        } finally {
            setDeletingId(null)
        }
    }

    useEffect(() => { loadInstances() }, [])

    return (
        <div className="p-8 pb-24 animate-in fade-in duration-500">
            
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black flex items-center gap-3 mb-1 text-foreground">
                        <HardDrive className="h-8 w-8 text-primary" />
                        Librería
                    </h2>
                    <p className="text-muted-foreground">Tus mundos y modpacks instalados.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={loadInstances} disabled={loading} className="hover:bg-muted">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => setShowCreate(true)} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Crear Instancia
                    </Button>
                </div>
            </div>

            {/* GRID DE TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {instances.map((inst) => {
                    const isSelected = selectedInstanceName === inst.id
                    
                    return (
                        <Card 
                            key={inst.id}
                            onClick={() => setSelectedInstanceName(inst.id)}
                            className={cn(
                                "group relative h-[320px] overflow-hidden border-0 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
                                isSelected ? "ring-4 ring-primary shadow-primary/20" : "ring-1 ring-border hover:ring-primary/50"
                            )}
                        >
                            {/* --- IMAGEN DE FONDO FULL --- */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url('${inst.image}')` }}
                            />
                            <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                            {/* --- CONTROLES SUPERIORES --- */}
                            
                            {/* IZQUIERDA: Configuración */}
                            <div className="absolute top-2 left-2 z-30">
                                <Button 
                                    size="icon" 
                                    variant="secondary" 
                                    className={cn(
                                        "h-8 w-8 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/10 transition-all",
                                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(inst.id);
                                    }}
                                    title="Configurar"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* DERECHA: Eliminar */}
                            <div className="absolute top-2 right-2 z-30">
                                <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    className={cn(
                                        "h-8 w-8 rounded-full bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white backdrop-blur-md border border-red-500/30 transition-all",
                                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingId(inst.id);
                                    }}
                                    title="Eliminar Instancia"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* --- CONTENIDO INFERIOR (TEXTOS) --- */}
                            <div className="absolute bottom-0 left-0 w-full p-5 z-20 flex flex-col gap-1">
                                
                                {/* Fila de Versión y Badge */}
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wider">
                                        <span className="bg-white/10 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                            <Box className="w-3 h-3" /> {inst.version}
                                        </span>
                                        <span className="text-primary">{inst.modLoader}</span>
                                    </div>
                                    
                                    <Badge variant="secondary" className={cn(
                                        "backdrop-blur-md border-white/10 shadow-sm text-[10px] h-5",
                                        inst.state === 'ready' ? "bg-emerald-500/20 text-emerald-200" : "bg-blue-500/20 text-blue-200"
                                    )}>
                                        {inst.state === 'ready' ? 'LISTO' : 'NUEVO'}
                                    </Badge>
                                </div>

                                {/* Nombre Grande */}
                                <h3 className="text-2xl font-black text-white leading-none drop-shadow-md truncate w-full">
                                    {inst.name}
                                </h3>
                                
                                {/* Indicador de selección */}
                                <div className={cn(
                                    "h-1 bg-primary rounded-full mt-3 transition-all duration-500",
                                    isSelected ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-1/3 group-hover:opacity-50"
                                )} />
                            </div>

                            {/* Icono Play gigante decorativo */}
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-in zoom-in fade-in duration-300">
                                    <PlayCircle className="w-20 h-20 text-white/10" />
                                </div>
                            )}
                        </Card>
                    )
                })}
                
                {/* TARJETA "CREAR NUEVA" */}
                <Card 
                    onClick={() => setShowCreate(true)}
                    className="group relative h-[320px] border-2 border-dashed border-muted-foreground/20 bg-transparent hover:bg-muted/5 hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all text-muted-foreground hover:text-primary"
                >
                    <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                        <Plus className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-lg">Crear Nueva</h3>
                        <p className="text-xs opacity-70">Añade otra versión</p>
                    </div>
                </Card>
            </div>

            {/* DIÁLOGOS */}
            <CreateInstanceDialog open={showCreate} onOpenChange={setShowCreate} onSuccess={loadInstances} />
            <EditInstanceDialog isOpen={!!editingId} instanceId={editingId} onClose={() => setEditingId(null)} onSuccess={loadInstances} />

            {/* CONFIRMACIÓN DE BORRADO */}
            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5"/> ¿Eliminar Instancia?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se borrarán todos los mundos, mods y configuraciones de esta instancia permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}