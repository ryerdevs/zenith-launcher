import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs" // Asegúrate de tener estos componentes o usa botones simples

import { api } from '@/core/api'
import { Loader2, Upload, FileArchive, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/ui/use-toast'

interface ImportModpackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function ImportModpackDialog({ open, onOpenChange, onSuccess }: ImportModpackDialogProps) {
    const [mode, setMode] = useState<'file' | 'url'>('file')
    const [file, setFile] = useState<File | null>(null)
    const [url, setUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleImport = async () => {
        if (mode === 'file' && !file) return
        if (mode === 'url' && !url) return

        setUploading(true)
        
        try {
            if (mode === 'file' && file) {
                const formData = new FormData()
                formData.append('file', file)
                await api.instances.importModpack(formData)
            } else if (mode === 'url' && url) {
                await api.instances.importModpack({ url })
            }

            toast({
                title: "Modpack importado",
                description: "La instancia se ha creado correctamente.",
            })
            onSuccess()
            onOpenChange(false)
            setFile(null)
            setUrl('')
        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error al importar",
                description: error.message || "No se pudo procesar el modpack.",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileArchive className="h-5 w-5 text-primary" />
                        Importar Modpack
                    </DialogTitle>
                    <DialogDescription>
                        Crea una instancia desde un archivo ZIP o una URL de descarga.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="file" value={mode} onValueChange={(v) => setMode(v as 'file' | 'url')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="file">Subir Archivo</TabsTrigger>
                        <TabsTrigger value="url">Desde URL</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="mt-0">
                        <div 
                            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all min-h-[150px]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <div className="text-sm font-medium text-center">
                                {file ? (
                                    <span className="text-primary break-all font-bold">{file.name}</span>
                                ) : (
                                    <span className="text-muted-foreground">Click para seleccionar ZIP</span>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".zip" 
                                onChange={handleFileChange} 
                            />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="url" className="mt-0">
                        <div className="flex flex-col gap-4 py-4 min-h-[150px] justify-center">
                            <div className="space-y-2">
                                <Label htmlFor="url">URL de Descarga Directa</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="url" 
                                        placeholder="https://example.com/modpack.zip" 
                                        className="pl-9"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Asegúrate de que el enlace termine en .zip o sea una descarga directa.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleImport} disabled={(mode === 'file' && !file) || (mode === 'url' && !url) || uploading}>
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Importar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
