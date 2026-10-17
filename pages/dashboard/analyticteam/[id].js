import React from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar'
import Viewfile from '@/src/components/dashboard/analyticteam/catalog/viewFile'

export default function Viewfilepage() {
  const router = useRouter()
  const { id } = router.query // Captura el ID desde la URL (ej: /dashboard/analyticteam/pago)

  // Datos estáticos de ejemplo mapeados por ID/código
  const mockDatasets = {
    pago: {
      title: 'Pagos de cuotas',
      code: 'pago',
      status: 'Certificado',
      classification: 'Confidencial',
      description:
        'Pagos recibidos y aplicados a cuotas, por canal y medio de pago.',
      columns: [
        {
          name: 'id_pago',
          type: 'bigint',
          key: 'PK',
          description: 'Identificador único del pago.',
          personalData: 'No',
        },
        {
          name: 'id_cuota',
          type: 'bigint',
          key: 'FK — cuota',
          description: 'Cuota a la que se aplicó el pago.',
          personalData: 'No',
        },
        {
          name: 'num_credito',
          type: 'varchar(20)',
          key: '—',
          description: 'Crédito al que pertenece la cuota.',
          personalData: 'No',
        },
        {
          name: 'fec_pago',
          type: 'date',
          key: '—',
          description: 'Fecha en que se recibió el pago.',
          personalData: 'No',
        },
        {
          name: 'imp_pago',
          type: 'numeric(12,2)',
          key: '—',
          description: 'Importe pagado.',
          personalData: 'No',
        },
        {
          name: 'canal_pago',
          type: 'varchar(20)',
          key: '—',
          description: 'Canal por el que ingresó el pago.',
          personalData: 'No',
        },
      ],
      metadata: {
        source: 'Cobranzas y Pagos (PostgreSQL)',
        originPath: 'neon_cobranzas / cobranzas / pago',
        domain: 'Cobranzas',
        owner: 'Sandra Valdivia Ponce · Gerencia de Cobranzas',
        classification: 'Confidencial',
        validity: 'Actualización diaria · Vigente',
        lastUpdate: '30 sep 2026 · 06:12',
        lineage: 'Viene de cuota · alimenta stg_pagos',
      },
    },
    cuota: {
      title: 'Cuotas',
      code: 'cuota',
      status: 'Certificado',
      classification: 'Confidencial',
      description:
        'Cuotas exigibles de los últimos 12 meses y próximas a vencer, con días vencidos.',
      columns: [
        {
          name: 'id_cuota',
          type: 'bigint',
          key: 'PK',
          description: 'Identificador único de la cuota.',
          personalData: 'No',
        },
        {
          name: 'num_credito',
          type: 'varchar(20)',
          key: 'FK — credito',
          description: 'Número de crédito asociado.',
          personalData: 'No',
        },
        {
          name: 'fec_vencimiento',
          type: 'date',
          key: '—',
          description: 'Fecha de vencimiento programada.',
          personalData: 'No',
        },
        {
          name: 'imp_cuota',
          type: 'numeric(12,2)',
          key: '—',
          description: 'Monto total de la cuota exigible.',
          personalData: 'No',
        },
      ],
      metadata: {
        source: 'Cobranzas y Pagos (PostgreSQL)',
        originPath: 'neon_cobranzas / cobranzas / cuota',
        domain: 'Cobranzas',
        owner: 'Sandra Valdivia Ponce · Gerencia de Cobranzas',
        classification: 'Confidencial',
        validity: 'Actualización diaria · Vigente',
        lastUpdate: '30 sep 2026 · 06:12',
        lineage: 'Viene de maestr_creditos · alimenta pago',
      },
    },
  }

  // Selecciona el dataset estático según el ID de la URL o usa 'pago' por defecto
  const datasetData = mockDatasets[id] || mockDatasets.pago

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidenav reutilizable para el rol de analista */}
      <Sidebar role="analyticteam" />

      {/* Contenido Principal */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        <Viewfile
          dataset={datasetData}
          onBack={() => router.push('/dashboard/analyticteam')}
          onRequestAccess={() =>
            alert(`Solicitud de acceso enviada para: ${datasetData.title}`)
          }
        />
      </main>
    </div>
  )
}
