import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Instance } from '../api'

interface Log {
    time: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
}

interface LauncherState {
    // Auth
    username: string | null
    loginMode: 'online' | 'offline' | null
    setUser: (user: string, mode: 'online' | 'offline') => void
    logout: () => void

    // UI State
    instances: Instance[]
    setInstances: (inst: Instance[]) => void
    selectedInstanceName: string | null
    setSelectedInstanceName: (name: string | null) => void
    
    sidebarPosition: 'left' | 'right'
    setSidebarPosition: (pos: 'left' | 'right') => void

    // --- NUEVO: Estado de instalación ---
    isInstalled: boolean
    setIsInstalled: (v: boolean) => void

    // Game Process State
    gameStatus: string // 'idle' | 'downloading' | 'installing' | 'launching' | 'running'
    gameStatusMessage: string
    downloadProgress: number
    setGameStatus: (status: string, message: string, progress?: number) => void
    
    isPlaying: boolean
    setIsPlaying: (v: boolean) => void

    // Console Logs
    logs: Log[]
    addLog: (msg: string, type?: 'info' | 'warning' | 'error' | 'success') => void
    clearLogs: () => void
}

export const useLauncher = create<LauncherState>()(
    persist(
        (set) => ({
            username: null,
            loginMode: null,
            setUser: (u, m) => set({ username: u, loginMode: m }),
            logout: () => set({ username: null, loginMode: null, selectedInstanceName: null }),

            instances: [],
            setInstances: (i) => set({ instances: i }),
            selectedInstanceName: null,
            setSelectedInstanceName: (n) => set({ selectedInstanceName: n }),

            // Por defecto asumimos false, deberás comprobarlo al seleccionar instancia
            isInstalled: false, 
            setIsInstalled: (v) => set({ isInstalled: v }),

            gameStatus: 'idle',
            gameStatusMessage: 'Listo',
            downloadProgress: 0,
            isPlaying: false,
            setIsPlaying: (v) => set({ isPlaying: v }),

            setGameStatus: (status, message, progress) => set({
                gameStatus: status,
                gameStatusMessage: message,
                downloadProgress: progress ?? 0
            }),

            // UI Preferences
            sidebarPosition: 'left',
            setSidebarPosition: (pos) => set({ sidebarPosition: pos }),

            logs: [],
            addLog: (msg, type = 'info') => {
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })
                set(state => ({
                    logs: [...state.logs, { time: now, message: msg, type }]
                }))
            },
            clearLogs: () => set({ logs: [] })
        }),
        {
            name: 'minelauncher-storage',
            partialize: (state) => ({
                username: state.username,
                loginMode: state.loginMode,
                selectedInstanceName: state.selectedInstanceName,
                sidebarPosition: state.sidebarPosition,
                // Guardamos logs si quieres persistencia, sino quítalo
                // logs: state.logs 
            }),
        }
    )
)
