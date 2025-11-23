import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { Button } from '@/ui/button'
import { Slider } from '@/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Input } from '@/ui/input'
import { useTheme } from '@/app/providers/ThemeProvider'
import { api } from '@/core/api'
import { useToast } from '@/ui/use-toast'
import { Save, RefreshCw, Monitor, Moon, Sun, Laptop, FolderOpen, Database, Cpu } from 'lucide-react'

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
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

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
            <p className="text-muted-foreground">Personaliza el comportamiento del launcher.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="gap-2 shadow-lg shadow-primary/20">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="java">Java & Memoria</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5 text-primary" /> Apariencia</CardTitle>
                    <CardDescription>Controla el tema visual de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center justify-between">
                        <Label className="flex flex-col gap-1">
                            <span>Tema</span>
                            <span className="font-normal text-xs text-muted-foreground">Selecciona entre claro, oscuro o sistema.</span>
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
                </CardContent>
            </Card>
        </TabsContent>

        {/* JAVA */}
        <TabsContent value="java" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5 text-primary" /> Rendimiento</CardTitle>
                    <CardDescription>Asignación de recursos para Minecraft.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
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
                            Se recomienda asignar al menos 4GB para modpacks modernos. No asignes más de la mitad de tu RAM total.
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
        </TabsContent>

        {/* ADVANCED */}
        <TabsContent value="advanced" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Argumentos JVM</CardTitle>
                    <CardDescription>Opciones avanzadas de lanzamiento.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Argumentos Extra</Label>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
