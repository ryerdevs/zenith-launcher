import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Quitamos la extensión .tsx, es más estándar
import './index.css'

import { ThemeProvider } from "@/components/theme-provider"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="minelauncher-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)