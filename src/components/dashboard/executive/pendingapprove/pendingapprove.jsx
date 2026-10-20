import React, { useState } from 'react'
import {
  HiLockClosed,
  HiShieldCheck,
  HiInformationCircle,
  HiCheck,
} from 'react-icons/hi'

export default function Pendingapprove() {
  // Estado para la solicitud seleccionada
  const [selectedRequest, setSelectedRequest] = useState({
    id: 'SOL-2D80B4',
    solicitante: 'Ana Torres Villanueva',
    cargo: 'Riesgo Crediticio',
    dataset: 'deudor',
    tipoDataset: 'Restringida', // 'Restringida' o 'Confidencial'
    motivo:
      'Cruce de deudores con el score de buró para segmentar la cartera en mora temprana y priorizar la gestión preventiva.',
    permiso: 'Lectura',
    periodo: '90 días',
    requiereSegundaAprobacion: true,
  })

  // Estado del formulario de decisión
  const [decision, setDecision] = useState('aprobar') // 'aprobar' o 'rechazar'
  const [comentario, setComentario] = useState(
    'Aprobado; solo lectura y 90 días.',
  )

  // Lista de solicitudes pendientes de ejemplo
  const solicitudes = [
    {
      id: 'SOL-2D80B4',
      nombre: 'Ana Torres Villanueva',
      cargo: 'Riesgo Crediticio',
      dataset: 'deudor',
      badgeTipo: 'Restringida',
      permiso: 'Lectura · 90 d',
      plazo: 'Responder antes del 1 oct 2026',
      motivo:
        'Cruce de deudores con el score de buró para segmentar la cartera en mora temprana y priorizar la gestión preventiva.',
      requiereSegundaAprobacion: true,
    },
    {
      id: 'SOL-2D80B5',
      nombre: 'Marta Quispe Huamán',
      cargo: 'Analítica de Cobranzas',
      dataset: 'cartera_asignada',
      badgeTipo: 'Confidencial',
      permiso: 'Escritura · 180 d',
      plazo: 'Responder antes del 3 oct 2026',
      motivo:
        'Actualización y gestión de marcas de asignación de cartera de cobranza castigada.',
      requiereSegundaAprobacion: false,
    },
    {
      id: 'SOL-2D80B6',
      nombre: 'Luis Paredes Aguilar',
      cargo: 'Inteligencia de Negocios',
      dataset: 'gestion_cobranza',
      badgeTipo: 'Restringida',
      permiso: 'Lectura · 90 d',
      plazo: 'Responder antes del 4 oct 2026',
      motivo:
        'Auditoría interna de flujos de recuperaciones y gestión operativa.',
      requiereSegundaAprobacion: true,
    },
    {
      id: 'SOL-2D80B7',
      nombre: 'Luis Paredes Aguilar',
      cargo: 'Inteligencia de Negocios',
      dataset: 'pago',
      badgeTipo: 'Confidencial',
      permiso: 'Lectura · 180 d',
      plazo: 'Responder antes del 6 oct 2026',
      motivo: 'Cruce histórico de transacciones de pagos con pasarela central.',
      requiereSegundaAprobacion: false,
    },
  ]

  const handleSelect = (item) => {
    setSelectedRequest({
      id: item.id,
      solicitante: item.nombre,
      cargo: item.cargo,
      dataset: item.dataset,
      tipoDataset: item.badgeTipo,
      motivo: item.motivo,
      permiso: item.permiso.split('·')[0].trim(),
      periodo: item.permiso.includes('90') ? '90 días' : '180 días',
      requiereSegundaAprobacion: item.requiereSegundaAprobacion,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(
      `Solicitud ${selectedRequest.id} procesada con éxito: ${decision.toUpperCase()} - Comentario: ${comentario}`,
    )
  }

  return (
    <div className=" font-sans bg-[#f8f9fa] min-h-screen text-gray-900">
      {/* Título Principal */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Solicitudes por aprobar
      </h1>

      {/* Grid Principal de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Tabla / Lista de Solicitudes Pendientes */}
        <div className="lg:col-span-7 bg-white border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide">
              Solicitudes pendientes
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50">
                  <th className="py-3 px-6">Solicitante</th>
                  <th className="py-3 px-6">Dataset</th>
                  <th className="py-3 px-6">Permiso</th>
                  <th className="py-3 px-6">Plazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudes.map((item) => {
                  const isSelected = selectedRequest.id === item.id
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-orange-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-6 align-top">
                        <p className="font-bold text-gray-900 leading-snug">
                          {item.nombre}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {item.cargo}
                        </p>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className="font-mono text-gray-800 font-medium">
                          {item.dataset}
                        </span>
                        <div className="mt-1">
                          {item.badgeTipo === 'Restringida' ? (
                            <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] px-2 py-0.5 font-medium rounded-none">
                              <HiLockClosed className="w-3 h-3" /> Restringida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-[10px] px-2 py-0.5 font-medium rounded-none">
                              🔒 Confidencial
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top text-gray-700 font-medium">
                        {item.permiso}
                      </td>
                      <td className="py-4 px-6 align-top text-gray-500 text-[11px] leading-relaxed">
                        {item.plazo}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Panel de Detalle y Aprobación */}
        <div className="lg:col-span-5 bg-white border border-gray-200 shadow-sm p-6">
          <div className="border-b border-gray-200 pb-4 mb-5">
            <h2 className="text-sm font-bold text-gray-900">
              Solicitud {selectedRequest.id}
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium">Dataset</span>
              <div className="col-span-2 flex items-center gap-2">
                <span className="font-mono font-bold text-gray-800">
                  {selectedRequest.dataset}
                </span>
                {selectedRequest.tipoDataset === 'Restringida' ? (
                  <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] px-2 py-0.5 font-medium">
                    <HiLockClosed className="w-3 h-3" /> Restringida
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-[10px] px-2 py-0.5 font-medium">
                    🔒 Confidencial
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-start">
              <span className="text-gray-500 font-medium">Motivo</span>
              <p className="col-span-2 text-gray-700 leading-relaxed">
                {selectedRequest.motivo}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium">Permiso</span>
              <span className="col-span-2 text-gray-800 font-medium">
                {selectedRequest.permiso}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium">Periodo</span>
              <span className="col-span-2 text-gray-800 font-medium">
                {selectedRequest.periodo}
              </span>
            </div>

            {/* Alerta de Segunda Aprobación */}
            {selectedRequest.requiereSegundaAprobacion && (
              <div className="bg-orange-50/70 border border-orange-200 p-3 flex gap-2.5 items-start text-orange-800 my-4">
                <HiInformationCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Requiere segunda aprobación del Oficial de Cumplimiento; tu
                  aprobación sola no concede el acceso.
                </p>
              </div>
            )}

            {/* Opciones de Radio: Aprobar / Rechazar */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Opción Aprobar */}
                <label
                  onClick={() => setDecision('aprobar')}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                    decision === 'aprobar'
                      ? 'border-[#ea580c] bg-orange-50/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === 'aprobar'}
                    onChange={() => setDecision('aprobar')}
                    className="accent-[#ea580c] w-4 h-4"
                  />
                  <span className="font-bold text-gray-900">Aprobar</span>
                </label>

                {/* Opción Rechazar */}
                <label
                  onClick={() => setDecision('rechazar')}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                    decision === 'rechazar'
                      ? 'border-[#ea580c] bg-orange-50/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === 'rechazar'}
                    onChange={() => setDecision('rechazar')}
                    className="accent-[#ea580c] w-4 h-4"
                  />
                  <span className="font-bold text-gray-900">Rechazar</span>
                </label>
              </div>

              {/* Textarea para Comentarios */}
              <div>
                <textarea
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe un comentario u observación..."
                  className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] resize-none"
                />
              </div>

              {/* Botón de Confirmación */}
              <button
                type="submit"
                className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <HiCheck className="w-4 h-4" />
                <span>Confirmar decisión</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
