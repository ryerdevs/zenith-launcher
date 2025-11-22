import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Monitor, Gamepad2, HardDrive, Wifi, Shield, Sun, Moon, Save, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

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
    api.settings.get()
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.settings.update(settings)
      toast({ 
        title: "Configuración guardada", 
        description: "Los cambios se aplicarán en el próximo lanzamiento." 
      })
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No se pudo guardar la configuración." 
      })
    } finally {
      setTimeout(() => setSaving(false), 500)
    }
  }

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia del launcher</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="about">Acerca de</TabsTrigger>
        </TabsList>

        {/* ===== TAB GENERAL ===== */}
        <TabsContent value="general" className="space-y-6">
          {/* Configuración de Java */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Configuración de Java</h3>
            </div>
            <div className="space-y-6">
              {/* Ruta de Java */}
              <div className="space-y-2">
                <Label>Ruta de Java</Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.java_path}
                    onChange={(e) => setSettings({...settings, java_path: e.target.value})}
                    placeholder="Ej: C:\Program Files\Java\jdk-17\bin\java.exe"
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Déjalo vacío para que el launcher detecte Java automáticamente.
                </p>
              </div>

              {/* RAM */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Memoria RAM asignada</Label>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                    {settings.ram_gb} GB
                  </span>
                </div>
                <Slider
                  value={[settings.ram_gb ?? 4]}
                  // AQUÍ ESTÁ LA CORRECCIÓN: v[0] ?? 4
                  onValueChange={(v) => setSettings({...settings, ram_gb: v[0] ?? 4})}
                  max={16}
                  min={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 GB</span>
                  <span>16 GB</span>
                </div>
              </div>

              {/* JVM args extra */}
              <div className="space-y-2">
                <Label>Argumentos JVM adicionales</Label>
                <Input
                  value={settings.extra_jvm_args}
                  onChange={(e) => setSettings({...settings, extra_jvm_args: e.target.value})}
                  placeholder="-XX:+UseG1GC"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Red (Placeholder visual) */}
          <Card className="p-6 opacity-70">
            <div className="mb-4 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Red y Descargas</h3>
            </div>
            <div className="space-y-4 pointer-events-none">
              <div className="space-y-2">
                <Label>Límite de velocidad</Label>
                <Select defaultValue="unlimited" disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Sin límite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ===== TAB APARIENCIA ===== */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Tema y Estilo</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Oscuro / Claro</Label>
                  <p className="text-sm text-muted-foreground">
                    Alternar entre tema claro y oscuro.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Modo Oscuro   
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar transiciones suaves en la interfaz.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Comportamiento</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cerrar al iniciar juego</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimizar el launcher cuando Minecraft se ejecute.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ===== TAB ACERCA DE ===== */}
        <TabsContent value="about">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Acerca de MineLauncher</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Launcher personalizado construido con tecnología moderna para ofrecer el mejor rendimiento.
              </p>
              <div className="grid gap-2 mt-4">
                <div className="flex justify-between py-2 border-b border-border">
                    <span>Versión del Cliente</span>
                    <span className="font-mono text-foreground">v0.1.0 Alpha</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                    <span>Backend API</span>
                    <span className="font-mono text-foreground">Python / Flask</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                    <span>Tecnología</span>
                    <span className="font-mono text-foreground">Tauri + React (Vite)</span>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="w-full">Buscar Actualizaciones</Button>
                <Button variant="outline" className="w-full">Reportar Bug</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}