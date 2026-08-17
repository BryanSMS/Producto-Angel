import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Registra el service worker generado por vite-plugin-pwa. Con
// `registerType: 'autoUpdate'` el catálogo se actualiza solo en segundo
// plano; no interrumpe al usuario con confirmaciones.
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
