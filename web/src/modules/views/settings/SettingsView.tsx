import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/ui/card'
import { Label } from '@/ui/label'
import { Button } from '@/ui/button'
import { Slider } from '@/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Input } from '@/ui/input'
import { useTheme } from '@/app/providers/ThemeProvider'
import { api } from '@/core/api'
import { useLauncher } from '@/core/state'
import { useToast } from '@/ui/use-toast'
import { Save, RefreshCw, Monitor, Moon, Sun, Laptop, FolderOpen, Database, Cpu, Layout } from 'lucide-react'
import { cn } from '@/utils/cn'

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { sidebarPosition, setSidebarPosition } = useLauncher()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  
  const [settings, setSettings] = useState({
    ram_gb: 4,
    java_path: '',
    extra_jvm_args: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
        const data = await api.settings.get()
        if (data) {
            setSettings({
                ram_gb: data.ram_gb ?? 4,
                java_path: data.java_path || '',
                extra_jvm_args: data.extra_jvm_args || ''
            })
        }
    } catch (e) {
        toast({ variant: "destructive", description: "Error al cargar configuración." })
    } finally {
        setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
        await api.settings.update(settings)
        toast({ description: "Configuración guardada correctamente." })
    } catch (e) {
        toast({ variant: "destructive", description: "Error al guardar." })
    } finally {
        setSaving(false)
    }
  }

  const sections = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'java', label: 'Java & Memoria', icon: Cpu },
    { id: 'advanced', label: 'Avanzado', icon: Database },
  ]

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
            <p className="text-sm text-muted-foreground">Personaliza tu experiencia.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="gap-2 shadow-lg shadow-primary/20">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-64 border-r border-border/40 bg-muted/10 p-4 space-y-2 overflow-y-auto">
            {sections.map(section => (
                <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        activeSection === section.id 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                </button>
            ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* GENERAL SECTION */}
                {activeSection === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-primary" /> Apariencia
                            </h3>
                            <Card>
                                <CardContent className="grid gap-6 p-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex flex-col gap-1">
                                            <span>Tema</span>
                                            <span className="font-normal text-xs text-muted-foreground">Selecciona el tema visual.</span>
                                        </Label>
                                        <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Tema" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="w-4 h-4" /> Claro</div></SelectItem>
                                                <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="w-4 h-4" /> Oscuro</div></SelectItem>
                                                <SelectItem value="system"><div className="flex items-center gap-2"><Laptop className="w-4 h-4" /> Sistema</div></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <Label className="flex flex-col gap-1">
                                            <span>Posición de la Barra Lateral</span>
                                            <span className="font-normal text-xs text-muted-foreground">Elige dónde quieres el menú principal.</span>
                                        </Label>
                                        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
                                            <Button 
                                                variant={sidebarPosition === 'left' ? 'secondary' : 'ghost'} 
                                                size="sm" 
                                                className="h-8 px-3 text-xs gap-2"
                                                onClick={() => setSidebarPosition('left')}
                                            >
                                                <Layout className="w-3 h-3 rotate-180" /> Izquierda
                                            </Button>
                                            <Button 
                                                variant={sidebarPosition === 'right' ? 'secondary' : 'ghost'} 
                                                size="sm" 
                                                className="h-8 px-3 text-xs gap-2"
                                                onClick={() => setSidebarPosition('right')}
                                            >
                                                Derecha <Layout className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* JAVA SECTION */}
                {activeSection === 'java' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-primary" /> Rendimiento
                            </h3>
                            <Card>
                                <CardContent className="grid gap-8 p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Memoria RAM Asignada</Label>
                                            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{settings.ram_gb} GB</span>
                                        </div>
                                        <Slider 
                                            value={[settings.ram_gb]} 
                                            min={2} 
                                            max={16} 
                                            step={1} 
                                            onValueChange={(v) => setSettings({...settings, ram_gb: v[0] ?? 4})}
                                            className="py-4"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Se recomienda asignar al menos 4GB para modpacks modernos.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ruta de Java</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={settings.java_path} 
                                                onChange={(e) => setSettings({...settings, java_path: e.target.value})}
                                                placeholder="Automático (Recomendado)" 
                                                className="font-mono text-xs"
                                            />
                                            <Button variant="secondary" size="icon"><FolderOpen className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ADVANCED SECTION */}
                {activeSection === 'advanced' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-primary" /> Avanzado
                            </h3>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <Label>Argumentos JVM Extra</Label>
                                        <Input 
                                            value={settings.extra_jvm_args} 
                                            onChange={(e) => setSettings({...settings, extra_jvm_args: e.target.value})}
                                            placeholder="-XX:+UseG1GC ..." 
                                            className="font-mono text-xs"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Solo modifica esto si sabes lo que haces.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  )
}
