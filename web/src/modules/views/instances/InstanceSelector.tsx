import { useState } from 'react'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/ui/dropdown-menu'
import { RefreshCw, Plus } from 'lucide-react'
import { PlayButton } from '@/modules/navigation/PlayButton'


interface InstanceSelectorProps {
    instances: any[] // Usar el tipo correcto si está disponible
    selectedInstanceName: string | null
    handlePlay: () => void
    handleInstall: () => void
    refreshInstances: () => void
    setSelectedInstanceName: (id: string) => void
    onOpenCreateDialog: () => void
}

export function InstanceSelector({
    instances,
    selectedInstanceName,
    handlePlay,
    handleInstall,
    refreshInstances,
    setSelectedInstanceName,
    onOpenCreateDialog
}: InstanceSelectorProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const currentInstance = instances.find(i => i.id === selectedInstanceName)

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            
            <PlayButton 
                handlePlay={handlePlay} 
                handleInstall={handleInstall} 
                isDropdownOpen={isDropdownOpen}
                selectedInstanceImage={currentInstance?.image}
                instanceState={currentInstance?.state}
                displayName={currentInstance?.name}
            />

            <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-[320px] p-2">
                <DropdownMenuLabel className="text-xs text-muted-foreground ml-2 flex justify-between items-center">
                    <span>SELECCIONAR INSTANCIA</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-muted" onClick={refreshInstances}>
                        <RefreshCw className="h-3 w-3"/>
                    </Button>
                </DropdownMenuLabel>
                
                <div className="max-h-[300px] overflow-y-auto space-y-1 my-2 pr-1">
                    {instances.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm bg-muted/20 rounded-md border border-dashed">
                            No hay instancias
                        </div>
                    )}
                    {instances.map((inst) => (
                        <DropdownMenuItem 
                            key={inst.id} 
                            onClick={() => { setSelectedInstanceName(inst.id); setIsDropdownOpen(false) }} 
                            className="cursor-pointer gap-3 p-2 focus:bg-accent"
                        >
                            <img src={inst.image} className="w-8 h-8 rounded object-cover bg-zinc-800 border border-white/10" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold truncate">{inst.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate">{inst.modLoader} {inst.version}</span>
                            </div>
                            {inst.state === 'ready' 
                                ? <Badge variant="outline" className="ml-auto h-5 text-[10px] border-green-500/30 text-green-500 bg-green-500/5">Listo</Badge>
                                : <Badge variant="outline" className="ml-auto h-5 text-[10px] border-blue-500/30 text-blue-500 bg-blue-500/5">Nuevo</Badge>
                            }
                        </DropdownMenuItem>
                    ))}
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                    className="justify-center py-3 cursor-pointer bg-muted/30 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors font-medium"
                    onSelect={onOpenCreateDialog}
                >
                    <Plus className="w-4 h-4 mr-2" /> Crear Nueva Instancia
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
