import React, { useState } from 'react'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar' // Ajusta la ruta según tu estructura
import Chat from '@/src/components/dashboard/analyticteam/chat/chat'

export default function chat() {
  const [activeTab, setActiveTab] = useState('catalogo') // 'catalogo' o 'chat'

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidenav reutilizable para el rol de analista */}
      <Sidebar role="analyticteam" />

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        <Chat />
      </main>
    </div>
  )
}
