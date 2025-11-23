import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog'
import { Button } from '@/ui/button'

import { api } from '@/core/api'
import { Loader2, Upload, FileArchive } from 'lucide-react'
import { useToast } from '@/ui/use-toast'

interface ImportModpackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function ImportModpackDialog({ open, onOpenChange, onSuccess }: ImportModpackDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleImport = async () => {
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            await api.instances.importModpack(formData)
            toast({
                title: "Modpack importado",
                description: "La instancia se ha creado correctamente.",
            })
            onSuccess()
            onOpenChange(false)
            setFile(null)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error al importar",
                description: "No se pudo procesar el archivo ZIP.",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileArchive className="h-5 w-5 text-primary" />
                        Importar Modpack
                    </DialogTitle>
                    <DialogDescription>
                        Sube un archivo .zip de CurseForge para crear una nueva instancia.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <div className="text-sm font-medium text-center">
                            {file ? (
                                <span className="text-primary break-all">{file.name}</span>
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleImport} disabled={!file || uploading}>
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Importar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
