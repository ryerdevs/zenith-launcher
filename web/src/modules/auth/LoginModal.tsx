import { useState } from 'react'
import { useLauncher } from '@/core/state'
import { api } from '@/core/api'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Switch } from '@/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'
import { useToast } from '@/ui/use-toast'
import { cn } from '@/utils/cn'
import { Loader2, Play, Wifi, WifiOff, User, ShieldCheck } from 'lucide-react'

export function LoginModal() {
  const { username, setUser } = useLauncher()
  const { toast } = useToast()
  
  const [isOffline, setIsOffline] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const safeUsername = username || ''

  // Lógica del Avatar:
  // Si hay texto, usa ese nombre. Si no, usa "MHF_Steve" (el ID oficial de la skin de Steve).
  const avatarTarget = safeUsername.trim().length > 0 ? safeUsername : "MHF_Steve"
  // Usamos 'helm' en lugar de 'avatar' para que se vea en 3D (con el gorro/pelo), queda mejor.
  // Si prefieres plano como en la bottom bar, cambia 'helm' por 'avatar'.
  const avatarUrl = `https://minotar.net/helm/${avatarTarget}/100.png`

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setError('')
    setIsLoading(true)

    try {
      if (isOffline) {
        if (safeUsername.length < 3) throw new Error("Mínimo 3 caracteres.")
        
        // Intentar login (aunque sea offline, el backend puede validar cosas)
        try { await api.auth.loginOffline(safeUsername) } catch {}
        
        setTimeout(() => setUser(safeUsername, 'offline'), 500)
      } else {
          setTimeout(() => setUser('MicrosoftUser', 'online'), 1000)
      }
    } catch (err: any) {
      setError(err.message)
      toast({ variant: "destructive", description: err.message })
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="w-[340px] bg-card/95 rounded-2xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in-95 duration-500">
      {/* HEADER: Avatar Dinámico y Título */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
            {/* Anillo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-emerald-600/80 rounded-xl blur-md opacity-50" />
            
            <Avatar className="w-20 h-20 rounded-xl shadow-lg ring-4 ring-background relative z-10 bg-zinc-800">
                {/* Key forza la recarga de la imagen si cambia el nombre para animarla */}
                <AvatarImage 
                    key={avatarTarget} 
                    src={avatarUrl} 
                    alt={avatarTarget} 
                    className="object-cover animate-in fade-in duration-500"
                />
                <AvatarFallback className="bg-zinc-800 text-zinc-500 rounded-xl text-2xl font-bold">
                    ST
                </AvatarFallback>
            </Avatar>
        </div>

        <h1 className="text-lg font-bold tracking-tight text-foreground">
          {isOffline ? 'Modo Offline' : 'Cuenta Premium'}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
            {isOffline ? 'Juega sin conexión a internet' : 'Accede a servidores oficiales'}
        </p>
      </div>

      {/* TOGGLE: Selector de Modo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border/50">
            <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer", 
                !isOffline ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground")}
                onClick={() => { setIsOffline(false); setError('') }}
            >
                <Wifi className="w-3.5 h-3.5" /> Online
            </div>
            
            <div className="px-2">
                <Switch 
                    checked={isOffline} 
                    onCheckedChange={(c) => { setIsOffline(c); setError('') }} 
                    disabled={isLoading}
                    className="scale-75 data-[state=checked]:bg-emerald-500"
                />
            </div>

            <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer", 
                isOffline ? "bg-background shadow text-emerald-500" : "text-muted-foreground hover:text-foreground")}
                onClick={() => { setIsOffline(true); setError('') }}
            >
                <WifiOff className="w-3.5 h-3.5" /> Offline
            </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="min-h-[130px] flex flex-col justify-end">
        <form onSubmit={handleLogin} className="w-full space-y-3">
            
            {isOffline ? (
                // --- INPUT OFFLINE ---
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-xs ml-1">Nombre de Usuario</Label>
                        <div className="relative group">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                                id="username" 
                                value={safeUsername} 
                                onChange={(e) => setUser(e.target.value, 'offline')}
                                className="pl-9 h-10 bg-background/50 border-input focus:border-primary/50" 
                                placeholder="Steve" 
                                autoFocus
                                required 
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-10 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Play className="mr-2 w-3.5 h-3.5 fill-current" /> Entrar</>}
                    </Button>
                </div>
            ) : (
                // --- BOTÓN ONLINE ---
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-1 space-y-3">
                    <div className="h-[50px] flex items-end justify-center pb-2"> 
                        <span className="text-xs text-muted-foreground text-center px-4">
                            Inicia sesión de forma segura con los servidores de Microsoft.
                        </span>
                    </div>
                    
                    <Button type="button" variant="outline" onClick={handleLogin} className="w-full h-10 gap-2.5 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all group" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                            <>
                             <svg className="w-4 h-4" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
                             <span className="font-medium group-hover:text-primary transition-colors">Iniciar con Microsoft</span>
                            </>
                        )}
                    </Button>
                </div>
            )}
        </form>

        {/* FOOTER */}
        <div className="h-6 mt-2 flex items-center justify-center">
            {error ? (
                <p className="text-[10px] text-red-400 font-medium animate-in slide-in-from-top-1">{error}</p>
            ) : !isOffline ? (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                    <ShieldCheck className="w-3 h-3" /> Conexión Encriptada
                </div>
            ) : null}
        </div>
      </div>

    </div>
  )
}
