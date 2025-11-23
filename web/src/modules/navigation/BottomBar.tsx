import { useState } from 'react'
import { Button } from '@/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'
import { Settings, User, LogOut, Plus, Bell, ChevronDown, RefreshCw } from 'lucide-react'
import { Badge } from '@/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { useLauncher } from '@/core/state'
import { PlayButton } from './PlayButton'
import { api } from '@/core/api'
import { useToast } from "@/ui/use-toast"
import { CreateInstanceDialog } from '@/modules/views/instances/dialogs/CreateInstanceDialog'

interface BottomBarProps {
    onOpenSettings?: () => void;
}

export function BottomBar({ onOpenSettings }: BottomBarProps) {
  const { username, loginMode, logout, instances, setInstances, selectedInstanceName, setSelectedInstanceName, setIsPlaying, setGameStatus } = useLauncher()
  const { toast } = useToast()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Buscamos la instancia actual
  const currentInstance = instances.find(i => i.id === selectedInstanceName)

  // --- FUNCIÓN JUGAR ---
  const handlePlay = async () => {
    if (!selectedInstanceName || !username) return
    
    setIsPlaying(true)
    setGameStatus('launching', 'Iniciando juego...')
    
    try {
        await api.instances.launch({ instanceName: selectedInstanceName, username })
    } catch (e: any) {
        setIsPlaying(false)
        setGameStatus('error', e.message)
        toast({ variant: "destructive", title: "Error al lanzar", description: e.message })
    }
  }

  // --- FUNCIÓN INSTALAR ---
  const handleInstall = async () => {
      if (!selectedInstanceName) return

      setIsPlaying(true)
      setGameStatus('downloading', 'Iniciando instalación...')

      try {
          await api.instances.install(selectedInstanceName)
      } catch (e: any) {
          setIsPlaying(false)
          setGameStatus('error', "Error al solicitar instalación")
          toast({ variant: "destructive", title: "Error", description: e.message })
      }
  }

  const refreshInstances = async () => {
      try {
          const data = await api.instances.list()
          setInstances(data)
      } catch(e) {
          console.error("Error refrescando instancias", e)
      }
  }

  return (
    <>
        <div className="relative z-50 border-t border-border/50 bg-card/80 p-4 backdrop-blur-xl transition-colors duration-300">
            <div className="grid grid-cols-3 items-center gap-4">

                {/* --- IZQUIERDA: PERFIL --- */}
                <div className="flex justify-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="lg" className="h-14 gap-3 border-primary/20 hover:border-primary/50 hover:bg-primary/5 px-2 md:px-4 transition-all duration-300">
                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                <AvatarImage src={`https://minotar.net/helm/${username}/100.png`} />
                                <AvatarFallback className="bg-primary text-primary-foreground font-bold">{username?.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-bold leading-none truncate max-w-[100px]">{username}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">{loginMode}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer"><User className="mr-2 h-4 w-4"/> Perfil</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer"><Bell className="mr-2 h-4 w-4"/> Notificaciones</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4"/> Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* --- CENTRO: BOTÓN JUGAR --- */}
                <div className="flex items-center justify-center">
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        
                        <PlayButton 
                            handlePlay={handlePlay} 
                            handleInstall={handleInstall} 
                            isDropdownOpen={isDropdownOpen}
                            selectedInstanceImage={currentInstance?.image}
                            instanceState={currentInstance?.state}
                            displayName={currentInstance?.name} // <-- AQUI PASAMOS EL NOMBRE EDITADO
                        />

                        <DropdownMenuContent align="center" side="top" className="w-72 mb-2 p-2">
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
                                onSelect={() => setShowCreateDialog(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Crear Nueva Instancia
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* --- DERECHA: AJUSTES --- */}
                <div className="flex justify-end">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-14 w-14 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                        onClick={onOpenSettings}
                        title="Configuración"
                    >
                        <Settings className="h-6 w-6" />
                    </Button>
                </div>

            </div>
        </div>

        <CreateInstanceDialog 
            open={showCreateDialog} 
            onOpenChange={setShowCreateDialog} 
            onSuccess={() => {
                refreshInstances();
                toast({ title: "Instancia Creada", description: "Selecciónala para instalar y jugar." });
            }} 
        />
    </>
  )
}
