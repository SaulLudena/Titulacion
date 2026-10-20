import React, { useState } from 'react'
import { HiSearch } from 'react-icons/hi'

export default function Binnacle() {
  const [desde, setDesde] = useState('1 sep 2026')
  const [hasta, setHasta] = useState('30 sep 2026')
  const [evento, setEvento] = useState('Todos')

  // Registros de auditoría basados en la imagen
  const logs = [
    {
      fecha: '30 sep 2026',
      hora: '09:30:12',
      quien: 'Luis Paredes Aguilar',
      que: 'dataset.vista',
      dataset: 'pago',
      solicitud: '—',
    },
    {
      fecha: '30 sep 2026',
      hora: '09:12:44',
      quien: 'Sandra Valdivia Ponce',
      que: 'dataset.metadatos_actualizados',
      dataset: 'gestion_cobranza',
      solicitud: '—',
    },
    {
      fecha: '30 sep 2026',
      hora: '08:05:01',
      quien: 'Sistema · pg_cron',
      que: 'acceso.vencido',
      dataset: 'cartera_asignada',
      solicitud: 'SOL-8E21A7',
    },
    {
      fecha: '30 sep 2026',
      hora: '07:30:15',
      quien: 'Sistema · perfilador',
      que: 'alerta.generada',
      dataset: 'pago_2023_mig',
      solicitud: '—',
    },
    {
      fecha: '30 sep 2026',
      hora: '07:28:40',
      quien: 'Agente (a nombre de Ana Torres)',
      que: 'agente.cita_dataset',
      dataset: 'cuota',
      solicitud: '—',
    },
    {
      fecha: '29 sep 2026',
      hora: '11:02:36',
      quien: 'Luis Paredes Aguilar',
      que: 'acceso.solicitado',
      dataset: 'pago',
      solicitud: 'SOL-9B3D07',
    },
    {
      fecha: '26 sep 2026',
      hora: '14:05:33',
      quien: 'Sandra Valdivia Ponce',
      que: 'acceso.aprobado_owner',
      dataset: 'gestion_cobranza',
      solicitud: 'SOL-C58A13',
    },
    {
      fecha: '24 sep 2026',
      hora: '08:40:15',
      quien: 'Ana Torres Villanueva',
      que: 'acceso.solicitado',
      dataset: 'deudor',
      solicitud: 'SOL-2D80B4',
    },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    alert(
      `Buscando eventos desde ${desde} hasta ${hasta} con filtro: ${evento}`,
    )
  }

  return (
    <div className="font-sans bg-[#f8f9fa] min-h-screen text-gray-900 max-w-7xl">
      {/* Título y Subtítulo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bitácora de auditoría
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Quién hizo qué y cuándo. Solo los datasets de tu dominio.
        </p>
      </div>

      {/* Panel de Filtros y Búsqueda */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Campo Desde */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                Desde
              </label>
              <input
                type="text"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border border-gray-200 px-3.5 py-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#ea580c] w-36"
              />
            </div>

            {/* Campo Hasta */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                Hasta
              </label>
              <input
                type="text"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="border border-gray-200 px-3.5 py-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#ea580c] w-36"
              />
            </div>

            {/* Selector de Evento */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                Evento
              </label>
              <select
                value={evento}
                onChange={(e) => setEvento(e.target.value)}
                className="border border-gray-200 px-3.5 py-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#ea580c] w-48 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="dataset.vista">dataset.vista</option>
                <option value="acceso.solicitado">acceso.solicitado</option>
                <option value="acceso.vencido">acceso.vencido</option>
                <option value="alerta.generada">alerta.generada</option>
              </select>
            </div>
          </div>

          {/* Botón Buscar */}
          <button
            type="submit"
            className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2 px-5 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer rounded-none w-full md:w-auto"
          >
            <HiSearch className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </form>
      </div>

      {/* Tabla de Eventos de Auditoría */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50">
                <th className="py-3 px-6">Fecha</th>
                <th className="py-3 px-6">Quién</th>
                <th className="py-3 px-6">Qué</th>
                <th className="py-3 px-6">Dataset</th>
                <th className="py-3 px-6">Solicitud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  {/* Fecha y Hora */}
                  <td className="py-3.5 px-6 font-medium text-gray-700">
                    <p>{item.fecha}</p>
                    <p className="text-[10px] text-gray-400">{item.hora}</p>
                  </td>

                  {/* Quién */}
                  <td className="py-3.5 px-6 text-gray-900 font-medium">
                    {item.quien}
                  </td>

                  {/* Qué */}
                  <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                    {item.que}
                  </td>

                  {/* Dataset */}
                  <td className="py-3.5 px-6 font-mono font-medium text-gray-800">
                    {item.dataset}
                  </td>

                  {/* Solicitud */}
                  <td className="py-3.5 px-6 font-mono text-gray-600">
                    {item.solicitud}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
