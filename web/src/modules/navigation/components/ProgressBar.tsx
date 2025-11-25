import { HardDriveDownload } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
    progress: number
    label: string
    sublabel?: string
    color?: string
}

export function ProgressBar({ progress, label, sublabel, color = "bg-blue-500" }: ProgressBarProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-1 animate-in fade-in zoom-in-95 px-2">
            <div className="flex items-center justify-between w-full text-xs font-bold tracking-wider text-white uppercase">
                <div className="flex items-center gap-2">
                    <HardDriveDownload className="h-4 w-4 animate-pulse" />
                    <span>{label}</span>
                </div>
                <span className="text-blue-300 font-mono bg-blue-900/50 px-1.5 rounded">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-200 ease-linear shadow-[0_0_8px_currentColor]", color)}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {sublabel && (
                <span className="text-[10px] text-zinc-400 truncate w-full text-center mt-0.5 font-mono opacity-80">
                    {sublabel}
                </span>
            )}
        </div>
    )
}
