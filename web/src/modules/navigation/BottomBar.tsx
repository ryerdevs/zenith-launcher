import { useState } from 'react'
import { Button } from '@/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'
import { Settings, User, LogOut, Bell, ChevronDown } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { useLauncher } from '@/core/state'
import { InstanceSelector } from '@/modules/views/instances/InstanceSelector'
import { api } from '@/core/api'
import { useToast } from "@/ui/use-toast"
import { CreateInstanceDialog } from '@/modules/views/instances/dialogs/CreateInstanceDialog'

interface BottomBarProps {
    onOpenSettings?: () => void;
}

export function BottomBar({ onOpenSettings }: BottomBarProps) {
  const { username, loginMode, logout, instances, setInstances, selectedInstanceName, setSelectedInstanceName, setIsPlaying, setGameStatus } = useLauncher()
  const { toast } = useToast()
  

  const [showCreateDialog, setShowCreateDialog] = useState(false)



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
                    <InstanceSelector 
                        instances={instances}
                        selectedInstanceName={selectedInstanceName}
                        handlePlay={handlePlay}
                        handleInstall={handleInstall}
                        refreshInstances={refreshInstances}
                        setSelectedInstanceName={setSelectedInstanceName}
                        onOpenCreateDialog={() => setShowCreateDialog(true)}
                    />
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
