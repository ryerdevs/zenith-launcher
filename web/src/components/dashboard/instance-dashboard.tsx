import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Play, Settings, FolderOpen, Box, HardDrive, Download, RefreshCw } from 'lucide-react'
import { Instance } from '@/lib/api'
import { ModsManager } from './mods-manager'
import { ResourcePacksManager } from './resource-packs-manager'
import { ShadersManager } from './shaders-manager'
import { WorldsManager } from './worlds-manager'
import { DataPacksManager } from './data-packs-manager'
import { InstanceDetailsDialog } from './dialogs/instance-details-dialog'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface InstanceDashboardProps {
    instance: Instance
    onBack: () => void
}

export function InstanceDashboard({ instance, onBack }: InstanceDashboardProps) {
    const [showSettings, setShowSettings] = useState(false)
    const [activeTab, setActiveTab] = useState("mods")

    // Placeholder for "Open Folder" - backend needs an endpoint or we just tell user
    const handleOpenFolder = async () => {
        try {
            await fetch(`http://localhost:5000/api/instances/${instance.id}/open-folder`, { method: 'POST' })
        } catch (e) {
            console.error("Error opening folder:", e)
        }
    }

    const handlePlay = async () => {
        try {
            await api.instances.launch({
                instanceName: instance.name, 
                username: "Player" 
            })
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* HEADER */}
            <div className="flex items-start gap-6 mb-6 pb-6 border-b border-border/40">
                <Button variant="ghost" size="icon" onClick={onBack} className="mt-1">
                    <ArrowLeft className="h-6 w-6" />
                </Button>

                <div className="h-32 w-32 rounded-xl overflow-hidden shadow-2xl ring-4 ring-background shrink-0">
                    <img 
                        src={instance.image} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>

                <div className="flex-1 pt-1">
                    <h1 className="text-4xl font-black tracking-tight mb-2">{instance.name}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded">
                            <Box className="w-4 h-4" />
                            <span>{instance.version}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded">
                            <HardDrive className="w-4 h-4" />
                            <span>{instance.modLoader} {instance.loaderVersion}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {instance.state === 'created' || instance.state === 'installing' ? (
                            <Button 
                                size="lg" 
                                className={cn(
                                    "gap-2 px-8 font-bold text-md shadow-lg transition-all duration-300",
                                    instance.state === 'installing' 
                                        ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-900/20" 
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
                                )}
                                onClick={handlePlay}
                                disabled={instance.state === 'installing'}
                            >
                                {instance.state === 'installing' ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" /> Instalando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" /> Instalar
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button 
                                size="lg" 
                                className={cn(
                                    "gap-2 px-8 font-bold text-md shadow-lg transition-all duration-300",
                                    instance.state === 'running'
                                        ? "bg-slate-700 hover:bg-slate-800 text-slate-300 shadow-slate-900/20"
                                        : "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20"
                                )} 
                                onClick={handlePlay}
                                disabled={instance.state === 'running'}
                            >
                                {instance.state === 'running' ? (
                                    <>
                                        <Box className="w-5 h-5 animate-pulse" /> Ejecutando...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" /> Jugar
                                    </>
                                )}
                            </Button>
                        )}

                        <Button variant="outline" size="lg" className="gap-2" onClick={() => setShowSettings(true)}>
                            <Settings className="w-4 h-4" /> Configurar
                        </Button>
                        <Button variant="ghost" size="lg" className="gap-2" onClick={handleOpenFolder}>
                            <FolderOpen className="w-4 h-4" /> Carpeta
                        </Button>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6">
                        {["Mods", "Data Packs", "Resource Packs", "Shaders", "Mundos"].map(tab => {
                            const value = tab.toLowerCase().replace(" ", "-")
                            return (
                                <TabsTrigger 
                                    key={value} 
                                    value={value}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
                                >
                                    {tab}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </div>

                <div className="flex-1 bg-background/50 rounded-lg border border-border/50 p-1">
                    
                    <TabsContent value="mods" className="h-full m-0">
                        <ModsManager instanceId={instance.id} />
                    </TabsContent>

                    <TabsContent value="data-packs" className="h-full m-0">
                        <DataPacksManager instanceId={instance.id} />
                    </TabsContent>

                    <TabsContent value="resource-packs" className="h-full m-0">
                        <ResourcePacksManager instanceId={instance.id} />
                    </TabsContent>

                    <TabsContent value="shaders" className="h-full m-0">
                        <ShadersManager instanceId={instance.id} />
                    </TabsContent>

                    <TabsContent value="mundos" className="h-full m-0">
                        <WorldsManager instanceId={instance.id} />
                    </TabsContent>
                </div>
            </Tabs>

            {/* SETTINGS DIALOG (Reusing existing one for now) */}
            <InstanceDetailsDialog 
                isOpen={showSettings} 
                instanceId={instance.id} 
                onClose={() => setShowSettings(false)} 
                onSuccess={() => {}} // Maybe reload instance data?
            />
        </div>
    )
}
