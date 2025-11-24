import { useState } from 'react'
import { Button } from '@/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { ArrowLeft, Settings, FolderOpen, Box, HardDrive } from 'lucide-react'
import { Instance } from '@/core/api'
import { ModsManager } from './mods/ModsManager'
import { ResourcePacksManager } from './resourcepacks/ResourcePacksManager'
import { ShadersManager } from './shaderpacks/ShadersManager'
import { WorldsManager } from './worlds/WorldsManager'
import { DataPacksManager } from './datapacks/DataPacksManager'
import { InstanceDetailsDialog } from '@/modules/views/instances/dialogs/InstanceDetailsDialog'


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



    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* HEADER */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-border/40 px-2">
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
                        <Button variant="outline" size="lg" className="gap-2 shadow-sm" onClick={() => setShowSettings(true)}>
                            <Settings className="w-4 h-4" /> Configurar
                        </Button>
                        <Button variant="outline" size="lg" className="gap-2 shadow-sm" onClick={handleOpenFolder}>
                            <FolderOpen className="w-4 h-4" /> Carpeta
                        </Button>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-muted/50 p-1 h-auto w-full justify-start gap-2 rounded-lg">
                        {["Mods", "Data Packs", "Resource Packs", "Shaders", "Mundos"].map(tab => {
                            const value = tab.toLowerCase().replace(" ", "-")
                            return (
                                <TabsTrigger 
                                    key={value} 
                                    value={value}
                                    className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
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
                onSuccess={() => {
                    // If instance was deleted, we should go back. 
                    // But we don't know if it was deleted or just updated.
                    // For now, let's just reload instance data if possible, or we can assume if it's gone we go back.
                    // Actually, InstanceDetailsDialog calls onSuccess on delete too.
                    // Let's pass a prop to know? Or just check if instance exists?
                    // Simple fix: The parent (InstancesView) handles the list. 
                    // If we delete, we should probably close the dashboard.
                    // Let's make InstanceDetailsDialog take an explicit onDelete callback or handle it here.
                    // For now, let's just close the settings. If it was deleted, the parent will likely re-render and find it missing?
                    // No, parent state 'instances' needs to update.
                    // We need to trigger a reload in parent.
                    // But onBack() just closes the view.
                    setShowSettings(false)
                    // We should ideally trigger a reload of instances here.
                    // But InstanceDashboard doesn't have loadInstances.
                    // We can rely on the fact that InstanceDetailsDialog calls api.instances.delete
                    // We should probably call onBack() if it was deleted.
                    // Let's modify InstanceDetailsDialog to accept onDelete.
                }}
                onDelete={() => {
                    setShowSettings(false)
                    onBack()
                }}
            />
        </div>
    )
}
