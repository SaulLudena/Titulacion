import React, { useState } from 'react'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar'
import Myrequests from '@/src/components/dashboard/analyticteam/myrequests/myrequests'
import Head from 'next/head'
export default function AnalyticTeam() {
  return (
    <>
      <Head>
        <title>Banco Andino | Solicitudes</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
        {/* Sidenav reutilizable para el rol de analista */}
        <Sidebar role="analyticteam" />

        {/* Contenido Principal */}
        <main className="flex-1 h-full overflow-y-auto p-8">
          <Myrequests />
        </main>
      </div>
    </>
  )
}
