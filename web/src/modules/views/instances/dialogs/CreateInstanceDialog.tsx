import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Loader2, Check, Gamepad2, Ban, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react'
import { api } from '@/core/api'
import { cn } from '@/utils/cn'

// LISTA COMPLETA DE IMÁGENES
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

interface CreateInstanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateInstanceDialog({ open, onOpenChange, onSuccess }: CreateInstanceDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados
  const [name, setName] = useState('')
  const [version, setVersion] = useState('')
  const [loader, setLoader] = useState('Vanilla')
  const [loaderVersion, setLoaderVersion] = useState('')
  // Aseguramos valor inicial válido
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0] || '')
  
  // Listas
  const [versions, setVersions] = useState<string[]>([])
  const [loaders, setLoaders] = useState<string[]>([])
  
  // Loading
  const [loadingVer, setLoadingVer] = useState(false)
  const [loadingLoader, setLoadingLoader] = useState(false)
  const [creating, setCreating] = useState(false)
  const [loaderError, setLoaderError] = useState<string | null>(null)

  // 1. Cargar versiones de Minecraft al abrir
  useEffect(() => {
    if (open && versions.length === 0) {
        setLoadingVer(true)
        api.info.getVersions().then(data => {
            setVersions(data)
            if(data.length > 0) setVersion(data[0])
        }).finally(() => setLoadingVer(false))
    }
    // Resetear imagen y form al abrir
    if (open) {
        setSelectedImage(PRESET_IMAGES[0] || '')
        setName('')
        setLoader('Vanilla')
    }
  }, [open])

  // 2. Cargar versiones del Loader
  useEffect(() => {
    if (loader === 'Vanilla') {
        setLoaders([])
        setLoaderVersion('')
        setLoaderError(null)
        return
    }

    if (!version) return

    setLoadingLoader(true)
    setLoaderVersion('') 
    setLoaders([])
    setLoaderError(null)

    api.info.getLoaders(version, loader)
        .then(data => {
            if (Array.isArray(data)) {
                setLoaders(data)
                if(data.length > 0) {
                    setLoaderVersion(data[0])
                } else {
                    setLoaderError(`No se encontraron versiones de ${loader} para ${version}.`)
                }
            }
        })
        .catch(() => setLoaderError('Error de conexión.'))
        .finally(() => setLoadingLoader(false))

  }, [version, loader])

  // 3. Manejar subida de imagen
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

  const handleCreate = async () => {
    if (!name) return
    setCreating(true)
    try {
        await api.instances.create({
            name,
            version,
            loader,
            loader_version: loader === 'Vanilla' ? null : loaderVersion,
            image: selectedImage
        })
        onSuccess()
        onOpenChange(false)
        setName('')
    } catch (e) {
        console.error(e)
    } finally {
        setCreating(false)
    }
  }

  const isVanilla = loader === 'Vanilla'
  const hasError = !isVanilla && !loadingLoader && (loaders.length === 0 || loaderError);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Nueva Instancia
                </DialogTitle>
                <DialogDescription>
                    Configura la versión y el motor de tu nueva aventura.
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-5 py-4">
                
                {/* --- SECCIÓN IMAGEN EXPANDIDA (Fixed) --- */}
                <div className="space-y-2">
                    <Label>Portada</Label>
                    <div className="flex gap-4 h-48"> 
                        
                        {/* Preview Grande */}
                        <div 
                            className="w-40 shrink-0 rounded-lg border border-border overflow-hidden bg-zinc-950 relative group cursor-pointer shadow-md flex items-center justify-center transition-all hover:ring-2 ring-primary/50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {/* KEY AÑADIDA AQUÍ PARA FORZAR RE-RENDER */}
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
                            <ImageIcon className="text-zinc-800 w-10 h-10 absolute -z-10" />
                        </div>

                        {/* Grid con Scroll */}
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

                {/* --- NOMBRE --- */}
                <div className="grid gap-2">
                    <Label htmlFor="name">Nombre de la Instancia</Label>
                    <Input 
                        id="name"
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ej: Survival 1.21" 
                        className="h-9 bg-background"
                    />
                </div>
                
                {/* --- VERSIONES (Grid de 3) --- */}
                <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50">
                    
                    {/* 1. Versión MC */}
                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">Versión Juego</Label>
                        <Select value={version} onValueChange={setVersion} disabled={loadingVer}>
                            <SelectTrigger className="h-8 text-xs bg-background">
                                {loadingVer ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue placeholder="Versión" />}
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {versions.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 2. Loader Type */}
                    <div className="grid gap-1.5">
                        <Label className="text-xs font-medium">Motor</Label>
                        <Select value={loader} onValueChange={setLoader}>
                            <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Vanilla">Vanilla</SelectItem>
                                <SelectItem value="Fabric">Fabric</SelectItem>
                                <SelectItem value="Forge">Forge</SelectItem>
                                <SelectItem value="NeoForge">NeoForge</SelectItem>
                                <SelectItem value="Quilt">Quilt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. Loader Version */}
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

                {/* Error */}
                {hasError && (
                    <div className="flex items-center gap-3 p-3 text-sm bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-600 dark:text-amber-400 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium">No se encontraron versiones</p>
                            <p className="text-xs opacity-90">{loaderError}</p>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating} size="sm">Cancelar</Button>
                <Button onClick={handleCreate} disabled={creating || !name || (!isVanilla && !loaderVersion)} size="sm">
                    {creating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" /> Crear Instancia
                        </>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
