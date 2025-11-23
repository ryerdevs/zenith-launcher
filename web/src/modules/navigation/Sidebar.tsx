import { Home, LayoutGrid, Terminal } from 'lucide-react'
import { Button } from '@/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/tooltip'
import { cn } from '@/utils/cn'

interface SideBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({ activeView, setActiveView }: SideBarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'instances', icon: LayoutGrid, label: 'Mis Instancias' },
    { id: 'console', icon: Terminal, label: 'Consola' },
  ]

  return (
    <aside className="flex w-[72px] flex-col items-center gap-4 border-r border-border/50 bg-card/50 py-4 backdrop-blur-xl z-20 h-full">
      <div className="flex flex-col gap-3 w-full px-2">
        {navItems.map((item) => (
          <TooltipProvider key={item.id} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === item.id ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    "h-12 w-12 transition-all",
                    activeView === item.id 
                        ? "rounded-[12px] shadow-md shadow-primary/20 bg-primary text-primary-foreground" 
                        : "rounded-[16px] hover:rounded-[12px] text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setActiveView(item.id)}
                >
                  <item.icon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </aside>
  )
}
