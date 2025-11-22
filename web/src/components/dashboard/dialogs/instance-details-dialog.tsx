import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from '@/lib/api'
import { useLauncher } from '@/lib/state'
import { Loader2, Save, Upload, Image as ImageIcon, Settings2, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModsManager } from '../mods-manager'

// LISTA DE IMÁGENES
const PRESET_IMAGES = [
    '/minecraft-landscape-dark.jpg',
    '/minecraft-1-21-trial-chambers-with-shaders-realist.jpg',
    '/minecraft-caves-cliffs-lush-caves-dripstone-shade.jpg',
    '/minecraft-cherry-blossom-biome.png',
    '/minecraft-cherry-blossom-grove-biome-with-shaders-.jpg',
    '/minecraft-cinematic-landscape.jpg',
    '/minecraft-deep-dark-ancient-city-warden-sculk-with.jpg',
    '/minecraft-epic-medieval-castle-build-with-shaders-.jpg',
    '/minecraft-mangrove-swamp-biome-shaders-realistic.jpg',
    '/minecraft-nether-bastion-remnant-piglins-with-shad.jpg',
    '/minecraft-ocean-monument-underwater-shaders-realis.jpg',
    '/minecraft-rtx-ray-tracing-realistic-lighting-shade.jpg',
    '/minecraft-tricky-trials-update.jpg',
    '/minecraft-village-and-mansion-dark-forest-shaders.jpg'
]

interface InstanceDetailsDialogProps {
    instanceId: string | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function InstanceDetailsDialog({ instanceId, isOpen, onClose, onSuccess }: InstanceDetailsDialogProps) {
    const { instances } = useLauncher()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [name, setName] = useState('')
    const [jvmArgs, setJvmArgs] = useState('')
    const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0] ?? '')
    
    const [version, setVersion] = useState('')
    const [loader, setLoader] = useState('Vanilla')
    const [loaderVersion, setLoaderVersion] = useState('')
    
    const [versions, setVersions] = useState<string[]>([])
    const [loaders, setLoaders] = useState<string[]>([])
    
    const [loadingVer, setLoadingVer] = useState(false)
    const [loadingLoader, setLoadingLoader] = useState(false)
    const [saving, setSaving] = useState(false)

    // 1. CARGAR DATOS AL ABRIR
    useEffect(() => {
        if (isOpen && instanceId) {
            const target = instances.find(i => i.id === instanceId)
            if (target) {
                setName(target.name ?? '')
                
                // CORRECCIÓN: Aseguramos que selectedImage tenga un valor válido
                const initialImage = target.image || PRESET_IMAGES[0] || ''
                setSelectedImage(initialImage)
                
                setVersion(target.version)
                setLoader(target.modLoader)
                setLoaderVersion(target.loaderVersion ?? '')
                
                if (versions.length === 0) {
                    setLoadingVer(true)
                    api.info.getVersions()
                        .then(setVersions)
                        .finally(() => setLoadingVer(false))
                }
            }
        }
    }, [isOpen, instanceId, instances])

    // 2. CARGAR LOADERS
    useEffect(() => {
        if (!isOpen) return
        if (loader === 'Vanilla') {
            setLoaders([])
            return
        }
        if (!version) return

        setLoadingLoader(true)
        
        api.info.getLoaders(version, loader)
            .then(data => {
                if (Array.isArray(data)) {
                    setLoaders(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoadingLoader(false))

    }, [version, loader, isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (typeof reader.result === 'string') setSelectedImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        if (!instanceId) return
        setSaving(true)
        try {
            const currentInstance = instances.find(i => i.id === instanceId)
            const originalImage = currentInstance?.image
            
            const hasImageChanged = selectedImage !== originalImage
            
            await api.instances.update({
                id: instanceId,
                name: name,
                version: version,
                modLoader: loader,
                loaderVersion: loader === 'Vanilla' ? null : loaderVersion,
                jvm_args: jvmArgs,
                image: hasImageChanged ? selectedImage : undefined
            })
            onSuccess()
            onClose()
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const isVanilla = loader === 'Vanilla'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        Detalles de la Instancia
                    </DialogTitle>
                    <DialogDescription>Administra la configuración y los mods de tu instancia.</DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="settings" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="settings">Ajustes</TabsTrigger>
                        <TabsTrigger value="mods">Mods</TabsTrigger>
                    </TabsList>
                    
                    {/* --- TAB AJUSTES --- */}
                    <TabsContent value="settings" className="space-y-4 py-4">
                        {/* --- SECCIÓN IMAGEN EXPANDIDA --- */}
                        <div className="space-y-2">
                            <Label>Portada</Label>
                            <div className="flex gap-4 h-48"> 
                                <div 
                                    className="w-40 shrink-0 rounded-lg border border-border overflow-hidden bg-zinc-950 relative group cursor-pointer shadow-md flex items-center justify-center transition-all hover:ring-2 ring-primary/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <img 
                                        key={selectedImage} 
                                        src={selectedImage} 
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-40"
                                        onError={(e) => e.currentTarget.style.display = 'none'} 
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Upload className="text-white w-8 h-8 drop-shadow-md mb-2" />
                                        <span className="text-[10px] text-white font-bold uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Cambiar</span>
                                    </div>
                                    <ImageIcon className="text-zinc-800 w-12 h-12 absolute -z-10" />
                                </div>

                                <div className="flex-1 rounded-lg border border-border bg-muted/10 p-2 pr-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div 
                                            className="aspect-video rounded-md border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary group"
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Subir imagen propia"
                                        >
                                            <Upload className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-bold uppercase">Subir</span>
                                        </div>
                                        {PRESET_IMAGES.map((img, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={cn(
                                                    "aspect-video rounded-md border overflow-hidden cursor-pointer hover:opacity-90 transition-all shadow-sm bg-zinc-900 relative",
                                                    selectedImage === img ? "ring-2 ring-primary border-primary shadow-md shadow-primary/10" : "border-border opacity-70 hover:opacity-100"
                                                )}
                                            >
                                                <img 
                                                    src={img} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="h-9 bg-background" />
                        </div>

                        <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50">
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-medium">Versión Juego</Label>
                                <Select value={version} onValueChange={setVersion} disabled={loadingVer}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        {loadingVer ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {versions.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-medium">Motor</Label>
                                <Select value={loader} onValueChange={setLoader}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Vanilla', 'Fabric', 'Forge', 'NeoForge', 'Quilt'].map(l => (
                                            <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className={`text-xs font-medium ${isVanilla ? "text-muted-foreground" : ""}`}>Versión Loader</Label>
                                <Select 
                                    value={loaderVersion} 
                                    onValueChange={setLoaderVersion} 
                                    disabled={isVanilla || loadingLoader || loaders.length === 0}
                                >
                                    <SelectTrigger className={`h-8 text-xs bg-background ${isVanilla ? "opacity-50" : ""}`}>
                                        {isVanilla ? <span className="text-xs flex items-center text-muted-foreground"><Ban className="w-3 h-3 mr-1"/> No aplica</span> : 
                                         loadingLoader ? <Loader2 className="h-3 w-3 animate-spin" /> : 
                                         <SelectValue placeholder="Seleccionar" />}
                                    </SelectTrigger>
                                    {!isVanilla && (
                                        <SelectContent className="max-h-[200px]">
                                            {loaders.map(l => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
                                        </SelectContent>
                                    )}
                                </Select>
                            </div>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Argumentos JVM (Opcional)</Label>
                            <Input 
                                value={jvmArgs} 
                                onChange={e => setJvmArgs(e.target.value)} 
                                placeholder="-XX:+UseG1GC" 
                                className="font-mono text-xs h-8 bg-background"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                             <Button onClick={handleSave} disabled={saving} size="sm">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                                Guardar Cambios
                            </Button>
                        </div>
                    </TabsContent>

                    {/* --- TAB MODS --- */}
                    <TabsContent value="mods" className="py-4">
                        {instanceId ? (
                            <ModsManager instanceId={instanceId} />
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                Guarda la instancia primero para gestionar mods.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving} size="sm">Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}