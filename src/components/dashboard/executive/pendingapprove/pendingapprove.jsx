import React, { useState, useEffect } from 'react'
import { HiLockClosed, HiInformationCircle, HiCheck } from 'react-icons/hi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function Pendingapprove() {
  const [solicitudes, setSolicitudes] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [decision, setDecision] = useState('aprobar') // 'aprobar' o 'rechazar'
  const [comentario, setComentario] = useState(
    'Aprobado; solo lectura y 90 días.',
  )
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Cargar solicitudes pendientes desde la API al montar el componente
  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    setLoading(true)
    setError(null)

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

    try {
      // Endpoint correcto especificado en Postman (/api/bandeja)
      const response = await fetch(`${API_BASE_URL}/api/bandeja`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error('No se pudieron obtener las solicitudes pendientes.')
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : data.solicitudes || []

      // Mapeo adaptado a la bandeja del ejecutivo
      const formatted = list.map((item) => ({
        id: item.solicitud_id || item.id,
        nombre: item.solicitante || item.nombre || 'Analista',
        cargo: item.cargo || 'Analítica de Datos',
        dataset: item.dataset || 'Dataset',
        badgeTipo: item.clasificacion || 'Restringida',
        permiso: `${item.permiso || 'Lectura'} · ${item.vigencia_dias || 90} d`,
        plazo: item.plazo || 'Pendiente de revisión',
        motivo:
          item.justificacion ||
          item.motivo ||
          'Sin justificación especificada.',
        requiereSegundaAprobacion: item.requiere_cumplimiento ?? true,
      }))

      setSolicitudes(formatted)
      if (formatted.length > 0) {
        setSelectedRequest(formatted[0])
      }
    } catch (err) {
      console.error('Error al cargar la bandeja:', err)
      setError('No se pudo conectar con el servidor para obtener la bandeja.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item) => {
    setSelectedRequest(item)
  }

  // Envío de la decisión al backend (POST /api/solicitudes/{id}/decision)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    setSubmitting(true)
    setError(null)

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

    try {
      // Estructura exacta requerida por el backend según Postman
      const payload = {
        aprobar: decision === 'aprobar', // true o false
        comentario: comentario,
      }

      const response = await fetch(
        `${API_BASE_URL}/api/solicitudes/${selectedRequest.id}/decision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        let errorMsg = 'Error al registrar la decisión en el servidor.'
        try {
          const errData = await response.json()
          const rawMsg =
            errData.message || errData.error || errData.detail || errData
          errorMsg =
            typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : String(rawMsg)
        } catch (parseErr) {
          // Si no es JSON válido
        }
        throw new Error(errorMsg)
      }

      alert(
        `Solicitud ${selectedRequest.id} procesada con éxito: ${decision.toUpperCase()}`,
      )

      // Actualizar la lista local quitando la solicitud procesada
      const updatedList = solicitudes.filter((s) => s.id !== selectedRequest.id)
      setSolicitudes(updatedList)
      setSelectedRequest(updatedList.length > 0 ? updatedList[0] : null)
    } catch (err) {
      console.error('Error al procesar solicitud:', err)
      setError(err.message || 'Hubo un error al procesar la decisión.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500 font-sans">
        Cargando solicitudes pendientes de aprobación...
      </div>
    )
  }

  return (
    <div className="font-sans bg-[#f8f9fa] min-h-screen text-gray-900">
      {/* Título Principal */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Solicitudes por aprobar
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 text-xs text-red-600">
          {error}
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500">
          No hay solicitudes pendientes de aprobación en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Tabla / Lista de Solicitudes Pendientes */}
          <div className="lg:col-span-7 bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide">
                Solicitudes pendientes ({solicitudes.length})
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
                    const isSelected = selectedRequest?.id === item.id
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
          {selectedRequest && (
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
                    {selectedRequest.badgeTipo === 'Restringida' ? (
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

                {/* Alerta de Segunda Aprobación */}
                {selectedRequest.requiereSegundaAprobacion && (
                  <div className="bg-orange-50/70 border border-orange-200 p-3 flex gap-2.5 items-start text-orange-800 my-4">
                    <HiInformationCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Requiere segunda aprobación del Oficial de Cumplimiento;
                      tu aprobación sola no concede el acceso. Esto se reflejará
                      en el panel del analista.
                    </p>
                  </div>
                )}

                {/* Formulario de Decisión */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
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

                  <div>
                    <textarea
                      rows={3}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Escribe un comentario u observación..."
                      className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs disabled:opacity-50"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>
                      {submitting ? 'Procesando...' : 'Confirmar decisión'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
