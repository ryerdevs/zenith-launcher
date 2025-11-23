import { Card } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Sparkles, ArrowRight, Zap, Users, Box, Hammer, Palette, User, ShoppingBag, Globe, Server, Layers } from 'lucide-react'

export function HomeView() {
  return (
    <div className="flex-1 overflow-y-auto h-full bg-background scroll-smooth">
      <div className="w-full pb-24">
        
        {/* --- HERO HEADER (Estático) --- */}
        <div className="px-8 py-10 bg-background border-b border-white/10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-black tracking-tight mb-3 text-foreground">
                Novedades
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl">
                Explora las últimas actualizaciones, biomas exóticos y la tecnología visual de Minecraft.
              </p>
            </div>
            <div className="hidden md:flex gap-3">
                 <Badge variant="secondary" className="text-md px-4 py-1.5">1.21.4 Release</Badge>
            </div>
          </div>
        </div>

        {/* --- BENTO GRID --- */}
        <div className="grid grid-cols-12 gap-[1px] bg-border/20 auto-rows-[minmax(240px,auto)] w-full border-b border-white/10">
          
          {/* 1. FEATURED: Tricky Trials (8x2) */}
          <Card className="col-span-12 md:col-span-8 row-span-2 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-1-21-trial-chambers-with-shaders-realist.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-10">
              <Badge className="w-fit mb-4 bg-primary/90 text-primary-foreground border-0 text-sm px-3 py-1">
                <Sparkles className="w-3 h-3 mr-2" />
                Actualización Principal
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-4 leading-none tracking-tight">
                THE TRICKY <br/> TRIALS
              </h2>
              <p className="text-gray-200 text-lg mb-8 max-w-xl leading-relaxed font-medium drop-shadow-md">
                Enfréntate al Breeze, desbloquea las Trial Chambers y domina el mazo. La aventura más desafiante te espera.
              </p>
              <Button size="lg" className="w-fit h-12 px-8 text-base font-bold shadow-xl hover:scale-105 transition-transform cursor-default">
                Leer Notas <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>

          {/* 2. Cherry Blossom (4x1) */}
          <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-cherry-blossom-grove-biome-with-shaders-.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <Badge variant="secondary" className="w-fit mb-2 bg-pink-500/20 text-pink-200 border-pink-400/30 backdrop-blur-md">
                Nuevo Bioma
              </Badge>
              <h3 className="text-2xl font-bold text-white">Cherry Grove</h3>
            </div>
          </Card>

          {/* 3. RTX Shaders (4x1) */}
          <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-rtx-ray-tracing-realistic-lighting-shade.jpg')" }}
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
            <div className="relative h-full p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full mb-3 ring-1 ring-white/20">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">RTX ON</h3>
              <p className="text-gray-300 text-sm">Iluminación realista</p>
            </div>
          </Card>

          {/* 4. Deep Dark (6x1) */}
          <Card className="col-span-12 md:col-span-6 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-deep-dark-ancient-city-warden-sculk-with.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="relative h-full p-8 flex flex-col justify-center max-w-lg">
              <Badge variant="secondary" className="w-fit mb-3 bg-cyan-500/20 text-cyan-200 border-cyan-400/30">
                <Zap className="w-3 h-3 mr-1" />
                Bioma Peligroso
              </Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Deep Dark</h3>
              <p className="text-gray-300">Ciudades antiguas y el Warden esperan en las profundidades.</p>
            </div>
          </Card>

          {/* 5. STAT: Jugadores (2x1) */}
          <Card className="col-span-6 md:col-span-2 row-span-1 bg-zinc-900 border-0 rounded-none shadow-none p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-800 transition-colors group cursor-default">
             <Users className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
             <div className="text-3xl font-bold text-white tracking-tight">156M</div>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Jugadores</p>
          </Card>

          {/* 6. Mangrove Swamp (4x1) */}
          <Card className="col-span-6 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-mangrove-swamp-biome-shaders-realistic.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-white">Mangrove Swamp</h3>
              <p className="text-sm text-gray-300 mt-1">Naturaleza salvaje</p>
            </div>
          </Card>

          {/* 7. Mobs Update (4x1) */}
          <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
             <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-new-mobs-sniffer-camel-with-shaders-deta.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <Badge variant="secondary" className="w-fit mb-2 bg-purple-500/20 text-purple-200 border-purple-400/30">
                Nuevas Criaturas
              </Badge>
              <h3 className="text-2xl font-bold text-white">Mobs Únicos</h3>
            </div>
          </Card>

          {/* 8. Ocean Monument (4x2) */}
          <Card className="col-span-12 md:col-span-4 row-span-2 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
             <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-ocean-monument-underwater-shaders-realis.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8">
              <div className="mb-auto mt-4 bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <Box className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Ocean Monument</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Explora las profundidades marinas y descubre monumentos antiguos protegidos por guardianes.
              </p>
            </div>
          </Card>

          {/* 9. Castillo Épico (4x2) */}
          <Card className="col-span-12 md:col-span-4 row-span-2 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
             <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-epic-medieval-castle-build-with-shaders-.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8">
              <div className="mb-auto mt-4 bg-orange-500/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <Hammer className="w-6 h-6 text-orange-300" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Comunidad</h3>
              <p className="text-gray-300 text-sm mb-4">
                Obras maestras arquitectónicas creadas por jugadores como tú.
              </p>
            </div>
          </Card>

          {/* 10. Shaders Pack (4x1) */}
          <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-shaders-comparison-before-after-realist.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-white mb-1">Shaders Pack</h3>
              <p className="text-gray-300 text-xs">Visuales Next-Gen</p>
            </div>
          </Card>

          {/* 11. Redstone (4x1) */}
          <Card className="col-span-6 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-complex-redstone-machine-contraption-wit.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
               <div className="flex items-center gap-2 mb-1">
                 <Zap className="w-4 h-4 text-red-400" />
                 <h3 className="text-lg font-bold text-white">Redstone</h3>
               </div>
            </div>
          </Card>

          {/* 12. STAT: FPS (2x1) */}
          <Card className="col-span-6 md:col-span-2 row-span-1 bg-zinc-900 border-0 rounded-none shadow-none p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-800 transition-colors cursor-default">
             <Zap className="w-8 h-8 text-yellow-500 mb-2" />
             <div className="text-3xl font-bold text-white">300+</div>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">FPS Estables</p>
          </Card>

          {/* 13. Caves & Cliffs (6x2) */}
          <Card className="col-span-12 md:col-span-6 row-span-2 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-caves-cliffs-lush-caves-dripstone-shade.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8">
              <h3 className="text-4xl font-bold text-white mb-2">Caves & Cliffs</h3>
              <p className="text-gray-300 text-base max-w-md">
                La actualización que cambió el mundo. Cuevas exuberantes y montañas majestuosas.
              </p>
            </div>
          </Card>

          {/* 14. STAT: Mods (2x1) */}
          <Card className="col-span-6 md:col-span-2 row-span-1 bg-zinc-900 border-0 rounded-none shadow-none p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-800 transition-colors cursor-default">
             <Layers className="w-8 h-8 text-purple-500 mb-2" />
             <div className="text-3xl font-bold text-white">75K</div>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Mods</p>
          </Card>
          
          {/* 15. Woodland (4x1) */}
          <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-woodland-mansion-dark-forest-shaders.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white">Woodland</h3>
              <p className="text-gray-400 text-xs">Bosques Oscuros</p>
            </div>
          </Card>

           {/* 16. Resource Packs (4x1) */}
           <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-hd-resource-pack-textures-comparison-sha.jpg')" }}
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
            <div className="relative h-full p-6 flex flex-col items-center justify-center text-center">
               <Palette className="w-8 h-8 text-emerald-400 mb-2" />
               <h3 className="text-xl font-bold text-white">Texturas HD</h3>
            </div>
          </Card>

          {/* 17. Skins (4x1) */}
          <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-skin-customization-editor-3d.jpg')" }}
            />
             <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
             <div className="relative h-full p-6 flex flex-col items-center justify-center text-center">
                <User className="w-8 h-8 text-yellow-400 mb-2" />
                <h3 className="text-xl font-bold text-white">Skins</h3>
             </div>
          </Card>

           {/* 18. Marketplace (4x1) */}
           <Card className="col-span-12 md:col-span-4 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-marketplace-community-content.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
               <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Marketplace</h3>
               </div>
            </div>
          </Card>

           {/* 19. Realms (6x1) */}
           <Card className="col-span-12 md:col-span-6 row-span-1 group relative overflow-hidden border-0 rounded-none shadow-none p-0 bg-zinc-900">
             <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/minecraft-realms-plus-friends-server.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-transparent" />
            <div className="relative h-full p-6 flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-full backdrop-blur-md">
                    <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Minecraft Realms</h3>
                    <p className="text-purple-200 text-sm">Tu servidor personal.</p>
                </div>
            </div>
          </Card>

           {/* 20. Servers Stat (6x1) */}
           <Card className="col-span-12 md:col-span-6 row-span-1 bg-zinc-900 border-0 rounded-none shadow-none p-6 flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-default">
             <div className="flex items-center gap-4">
                <Server className="w-8 h-8 text-green-500" />
                <div>
                    <h3 className="text-xl font-bold text-white">Servidores</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Estado de la Red</p>
                </div>
             </div>
             <div className="text-right">
                 <div className="text-2xl font-bold text-white">50K+</div>
                 <div className="flex items-center justify-end gap-2 text-emerald-500 text-xs font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    ONLINE
                 </div>
             </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
