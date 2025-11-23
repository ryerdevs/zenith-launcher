import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import './index.css'

import { ThemeProvider } from "@/app/providers/ThemeProvider"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="minelauncher-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
