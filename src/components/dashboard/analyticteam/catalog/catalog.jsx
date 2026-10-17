import React, { useState } from 'react'
import { useRouter } from 'next/router'
import CatalogItem from './catalogitem' // Ajusta la ruta según la estructura de tu proyecto

export default function Catalog() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('pagos de cuotas')

  // Data de ejemplo basada en tu interfaz
  const datasets = [
    {
      id: 1,
      title: 'Pagos de cuotas',
      code: 'pago',
      status: 'Certificado',
      classification: 'Confidencial',
      description:
        'Pagos recibidos y aplicados a cuotas, por canal y medio de pago.',
      domain: 'Cobranzas',
      author: 'Sandra Valdivia Ponce',
      date: '30 sep 2026',
      hasAccess: false,
    },
    {
      id: 2,
      title: 'Cuotas',
      code: 'cuota',
      status: 'Certificado',
      classification: 'Confidencial',
      description:
        'Cuotas exigibles de los últimos 12 meses y próximas a vencer, con días vencidos.',
      domain: 'Cobranzas',
      author: 'Sandra Valdivia Ponce',
      date: '30 sep 2026',
      hasAccess: true,
    },
    {
      id: 3,
      title: 'Pagos migrados 2023',
      code: 'pago_2023_mig',
      status: 'Borrador',
      classification: 'Confidencial',
      description:
        'Pagos históricos migrados en 2023 desde el sistema anterior, con columnas renombradas.',
      domain: 'Cobranzas',
      author: 'Sandra Valdivia Ponce',
      date: '15 ene 2024',
      hasAccess: false,
    },
    {
      id: 4,
      title: 'Gestiones de cobranza',
      code: 'gestion_cobranza',
      status: 'En revisión',
      classification: 'Restringida',
      description:
        'Gestiones de cobranza (llamadas, visitas, mensajes) por deudor, con su resultado y observaciones.',
      domain: 'Cobranzas',
      author: 'Sandra Valdivia Ponce',
      date: '30 sep 2026',
      hasAccess: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cabecera superior */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Catálogo de datasets
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Busca por nombre, dominio, clasificación o estado. Solo se muestran
          metadatos.
        </p>
      </div>

      {/* Barra de Búsqueda Superior */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-none text-sm text-gray-900 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] bg-white shadow-sm"
            placeholder="Buscar datasets..."
          />
        </div>
        <button className="px-6 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer">
          Buscar
        </button>
      </div>

      {/* Layout principal: Filtros a la izquierda y Listado a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Panel de Filtros Izquierdo */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none p-5 space-y-6">
          {/* Dominio */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Dominio
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Clientes', count: 2 },
                { name: 'Originación', count: 3 },
                { name: 'Cartera y riesgo', count: 2 },
                { name: 'Garantías', count: 3 },
                { name: 'Cobranzas', count: 9, checked: true },
                { name: 'Buró externo', count: 3 },
                { name: 'Catálogos y parámetros', count: 6 },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">
                    {item.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Clasificación */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Clasificación
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Pública', count: 2 },
                { name: 'Interna', count: 5 },
                { name: 'Confidencial', count: 11 },
                { name: 'Restringida', count: 10 },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">
                    {item.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Estado */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Estado
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Borrador', count: 12 },
                { name: 'En revisión', count: 6 },
                { name: 'Certificado', count: 9 },
                { name: 'Deprecado', count: 1 },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">
                    {item.count}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Listado de Tarjetas a la Derecha */}
        <div className="lg:col-span-3 space-y-3">
          {datasets.map((item) => (
            <CatalogItem
              key={item.id}
              {...item}
              onViewDetails={() =>
                router.push(`/dashboard/analyticteam/${item.code}`)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
