const API_URL = "http://localhost:5000/api"

export interface Instance {
    id: string
    name: string
    version: string
    modLoader: string
    loaderVersion?: string
    image: string
    state: 'created' | 'installing' | 'ready' | 'running' | 'error'
    playTime?: string
    lastPlayed?: string
}

export const api = {
    auth: {
        loginOffline: async (username: string) => {
            const res = await fetch(`${API_URL}/auth/offline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            })
            return res.json()
        }
    },
    instances: {
        list: async (): Promise<Instance[]> => {
            const res = await fetch(`${API_URL}/instances/list`)
            return res.json()
        },
        create: async (data: any) => {
            const res = await fetch(`${API_URL}/instances/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            return res.json()
        },
        update: async (data: any) => {
            const res = await fetch(`${API_URL}/instances/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            return res.json()
        },
        // --- NUEVA FUNCIÓN: Eliminar instancia ---
        delete: async (id: string) => {
            const res = await fetch(`${API_URL}/instances/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            return res.json()
        },
        // -----------------------------------------
        install: async (id: string) => {
            const res = await fetch(`${API_URL}/instances/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            return res.json()
        },
        launch: async (data: { instanceName: string, username: string }) => {
            const res = await fetch(`${API_URL}/launcher/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            return res.json()
        },
        kill: async () => {
            const res = await fetch(`${API_URL}/launcher/kill`, {
                method: 'POST'
            })
            return res.json()
        },
        importModpack: async (data: FormData | { url: string }) => {
            const isFormData = data instanceof FormData
            const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' }
            const body = isFormData ? data : JSON.stringify(data)

            const res = await fetch(`${API_URL}/instances/import-modpack`, {
                method: 'POST',
                headers,
                body
            })
            return res.json()
        }
    },
    info: {
        getVersions: async () => {
            const res = await fetch(`${API_URL}/info/versions`)
            return res.json()
        },
        getLoaders: async (mc_version: string, loader_type: string) => {
            const res = await fetch(`${API_URL}/info/loaders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mc_version, loader_type })
            })
            return res.json()
        }
    },
    settings: {
        get: async () => {
            const res = await fetch(`${API_URL}/settings/`)
            return res.json()
        },
        update: async (data: any) => {
            const res = await fetch(`${API_URL}/settings/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            return res.json()
        }
    }
}
