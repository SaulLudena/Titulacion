import React, { useState } from 'react'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar' // Ajusta la ruta según tu estructura
import Catalog from '@/src/components/dashboard/analyticteam/catalog/catalog'

export default function AnalyticTeam() {
  const [activeTab, setActiveTab] = useState('catalogo') // 'catalogo' o 'chat'

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidenav reutilizable para el rol de analista */}
      <Sidebar role="analyticteam" />

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        <Catalog />
      </main>
    </div>
  )
}
