import React from 'react'
import {
  HiDatabase,
  HiCheckCircle,
  HiLockClosed,
  HiKey,
  HiChevronRight,
} from 'react-icons/hi'

export default function ViewFile({ dataset, onBack, onRequestAccess }) {
  // Datos de fallback por si no se pasa la prop de dataset
  const data = dataset || {
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
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Breadcrumb / Migaja de pan */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={onBack}
          className="hover:text-[#ea580c] hover:underline cursor-pointer transition-colors"
        >
          Catálogo
        </button>
        <HiChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{data.code}</span>
      </nav>

      {/* Header del Dataset */}
      <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-[#ea580c] flex items-center justify-center rounded-none text-2xl shrink-0">
            <HiDatabase />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {data.title}
              </h1>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 border border-gray-200 rounded-none">
                {data.code}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-none">
                <HiCheckCircle className="w-3.5 h-3.5 text-amber-600" />
                {data.status}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none">
                <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
                {data.classification}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onRequestAccess}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <HiKey className="w-4 h-4" />
          <span>Solicitar acceso</span>
        </button>
      </div>

      {/* Contenido de 2 columnas: Detalles e Información Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Columna Izquierda: Descripción y Esquema de Datos */}
        <div className="lg:col-span-3 space-y-6">
          {/* Bloque Descripción */}
          <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Descripción
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Bloque Esquema */}
          <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Esquema</h3>
              <span className="text-xs text-gray-400 font-medium">
                {data.columns.length} de 9 columnas
              </span>
            </div>

            {/* Tabla de columnas */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Columna</th>
                    <th className="py-2.5 px-3 font-bold">Tipo</th>
                    <th className="py-2.5 px-3 font-bold">Clave</th>
                    <th className="py-2.5 px-3 font-bold">Descripción</th>
                    <th className="py-2.5 px-3 font-bold">Dato Personal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {data.columns.map((col, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {col.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-600">
                        {col.type}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500">
                        {col.key}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {col.description}
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {col.personalData}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Datos Generales del Dataset */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-5 text-xs">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            Datos del dataset
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-gray-400 block mb-1">Fuente</span>
              <p className="font-medium text-gray-900">
                {data.metadata?.source || 'Cobranzas y Pagos (PostgreSQL)'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Ruta de origen</span>
              <p className="font-mono text-[11px] text-gray-700 break-all">
                {data.metadata?.originPath ||
                  'neon_cobranzas / cobranzas / pago'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Dominio</span>
              <p className="font-medium text-gray-900">
                {data.metadata?.domain || 'Cobranzas'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Data Owner</span>
              <p className="font-medium text-gray-900">
                {data.metadata?.owner ||
                  'Sandra Valdivia Ponce · Gerencia de Cobranzas'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Clasificación</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none mt-0.5">
                <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
                {data.classification}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Vigencia</span>
              <p className="font-medium text-gray-900">
                {data.metadata?.validity || 'Actualización diaria · Vigente'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">
                Última actualización
              </span>
              <p className="font-medium text-gray-900">
                {data.metadata?.lastUpdate || '30 sep 2026 · 06:12'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Linaje</span>
              <p className="font-mono text-[11px] text-gray-700">
                {data.metadata?.lineage ||
                  'Viene de cuota · alimenta stg_pagos'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
