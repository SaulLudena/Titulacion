import React, { useState } from 'react'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar'
import Myrequests from '@/src/components/dashboard/analyticteam/myrequests/myrequests'
export default function AnalyticTeam() {
  const [activeTab, setActiveTab] = useState('catalogo') // 'catalogo' o 'chat'

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidenav reutilizable para el rol de analista */}
      <Sidebar role="analyticteam" />

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        <Myrequests />
      </main>
    </div>
  )
}
