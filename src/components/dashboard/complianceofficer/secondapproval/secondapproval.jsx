import React, { useState, useEffect } from 'react'
import { HiLockClosed, HiCheck, HiUser } from 'react-icons/hi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function SecondApproval() {
  const [solicitudes, setSolicitudes] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [decision, setDecision] = useState('aprobar') // 'aprobar' o 'rechazar'
  const [comentario, setComentario] = useState(
    'Aprobado; usar solo las columnas de segmentación.',
  )
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Cargar solicitudes pendientes desde la bandeja del backend
  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    setLoading(true)
    setError(null)

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

    try {
      const response = await fetch(`${API_BASE_URL}/api/bandeja`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(
          'No se pudieron obtener las solicitudes de segunda aprobación.',
        )
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : data.solicitudes || []

      const formatted = list.map((item, idx) => ({
        id: item.solicitud_id || item.id || `SOL-${idx}`,
        nombre: item.solicitante || item.nombre || 'Luis Paredes Aguilar',
        cargo: item.cargo || 'Inteligencia de Negocios',
        dataset: item.dataset || 'TB_CLIENTE',
        badgeTipo: item.clasificacion || 'Restringida',
        dataOwnerInfo:
          item.data_owner_aprobacion ||
          'Aprobado por el Data Owner responsable.',
        finalidad:
          item.justificacion || item.motivo || 'Sin finalidad especificada.',
        permisoYPeriodo: `${item.permiso || 'Lectura'} · ${item.vigencia_dias || 90} días`,
        datosPersonales: item.datos_personales || [
          'Documento de Identidad',
          'Nombre completo',
          'Fecha de nacimiento',
          'Domicilio',
          'Contacto',
          'Ingresos económicos (sensible)',
        ],
        plazo: item.plazo || 'Pendiente de revisión',
      }))

      setSolicitudes(formatted)
      if (formatted.length > 0) {
        setSelectedRequest(formatted[0])
      }
    } catch (err) {
      console.error('Error al cargar bandeja:', err)
      setError('No se pudo conectar con el servidor para obtener la bandeja.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item) => {
    setSelectedRequest(item)
  }

  // Enviar decisión de segunda aprobación a la API oficial (POST /api/solicitudes/{id}/decision)
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
        let errorMsg =
          'Error al registrar la decisión de cumplimiento en el servidor.'
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
        `Segunda aprobación para ${selectedRequest.id} registrada con éxito: ${decision.toUpperCase()}`,
      )

      // Actualizar la lista local quitando la solicitud procesada
      const updatedList = solicitudes.filter((s) => s.id !== selectedRequest.id)
      setSolicitudes(updatedList)
      setSelectedRequest(updatedList.length > 0 ? updatedList[0] : null)
    } catch (err) {
      console.error('Error al enviar decisión:', err)
      setError(err.message || 'Hubo un error al procesar la decisión.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500 font-sans">
        Cargando bandeja de segunda aprobación...
      </div>
    )
  }

  return (
    <div className="font-sans bg-[#f8f9fa] min-h-screen text-gray-900 space-y-6">
      {/* Título y subtítulo superior */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Segunda aprobación
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Solicitudes con datos personales que ya aprobó el Data Owner.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600">
          {error}
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-400">
          No hay solicitudes pendientes de segunda aprobación.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Tabla de Pendientes */}
          <div className="lg:col-span-7 bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-white">
              <h2 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                Pendientes ({solicitudes.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50 text-[10px]">
                    <th className="py-3 px-4">Solicitante</th>
                    <th className="py-3 px-4">Dataset</th>
                    <th className="py-3 px-4">Data Owner</th>
                    <th className="py-3 px-4">Plazo</th>
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
                          isSelected
                            ? 'bg-orange-50/50 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3.5 px-4 align-top">
                          <p className="font-bold text-gray-900 leading-snug">
                            {item.nombre}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.cargo}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono font-medium text-gray-800">
                          {item.dataset}
                        </td>
                        <td className="py-3.5 px-4 align-top text-gray-600 text-[11px]">
                          Aprobado
                        </td>
                        <td className="py-3.5 px-4 align-top text-gray-500 text-[11px]">
                          {item.plazo}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna Derecha: Detalle y Formulario de Aprobación */}
          {selectedRequest && (
            <div className="lg:col-span-5 bg-white border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-sm font-bold text-gray-900">
                  Solicitud {selectedRequest.id}
                </h2>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Dataset */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-gray-400 font-medium">Dataset</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">
                      {selectedRequest.dataset}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] px-2 py-0.5 font-medium rounded-none">
                      <HiLockClosed className="w-3 h-3 text-white" />{' '}
                      Restringida
                    </span>
                  </div>
                </div>

                {/* Finalidad */}
                <div className="grid grid-cols-3 gap-2 items-start">
                  <span className="text-gray-400 font-medium">Finalidad</span>
                  <p className="col-span-2 text-gray-800 leading-relaxed">
                    {selectedRequest.finalidad}
                  </p>
                </div>

                {/* Permiso y periodo */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-gray-400 font-medium">
                    Permiso y periodo
                  </span>
                  <span className="col-span-2 text-gray-800 font-medium">
                    {selectedRequest.permisoYPeriodo}
                  </span>
                </div>

                {/* Datos personales */}
                <div className="grid grid-cols-3 gap-2 items-start">
                  <span className="text-gray-400 font-medium pt-1">
                    Datos personales
                  </span>
                  <div className="col-span-2 flex flex-wrap gap-1.5">
                    {selectedRequest.datosPersonales.map((dato, i) => {
                      const isSensible = dato.includes('sensible')
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium border rounded-none ${
                            isSensible
                              ? 'bg-black text-white border-black font-bold'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {!isSensible && (
                            <HiUser className="w-3 h-3 text-gray-400" />
                          )}
                          {dato}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Data Owner */}
                <div className="grid grid-cols-3 gap-2 items-start pt-1 border-t border-gray-100">
                  <span className="text-gray-400 font-medium">Data Owner</span>
                  <p className="col-span-2 text-gray-700 text-[11px] leading-relaxed">
                    {selectedRequest.dataOwnerInfo}
                  </p>
                </div>

                {/* Formulario de Decisión */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 pt-3 border-t border-gray-100"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {/* Aprobar */}
                    <label
                      onClick={() => setDecision('aprobar')}
                      className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                        decision === 'aprobar'
                          ? 'border-[#ea580c] bg-orange-50/10 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="secondApprovalDecision"
                        checked={decision === 'aprobar'}
                        onChange={() => setDecision('aprobar')}
                        className="accent-[#ea580c] w-4 h-4"
                      />
                      <span className="font-bold text-gray-900">Aprobar</span>
                    </label>

                    {/* Rechazar */}
                    <label
                      onClick={() => setDecision('rechazar')}
                      className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                        decision === 'rechazar'
                          ? 'border-[#ea580c] bg-orange-50/10 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="secondApprovalDecision"
                        checked={decision === 'rechazar'}
                        onChange={() => setDecision('rechazar')}
                        className="accent-[#ea580c] w-4 h-4"
                      />
                      <span className="font-bold text-gray-900">Rechazar</span>
                    </label>
                  </div>

                  {/* Comentario */}
                  <div>
                    <textarea
                      rows={3}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Escribe un comentario u observación..."
                      className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] resize-none bg-white"
                    />
                  </div>

                  {/* Botón e Información inferior */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-5 transition-colors cursor-pointer text-xs disabled:opacity-50"
                    >
                      <HiCheck className="w-4 h-4" />
                      <span>
                        {submitting ? 'Confirmando...' : 'Confirmar decisión'}
                      </span>
                    </button>

                    <span className="text-[11px] text-gray-400">
                      Se concede solo porque el Data Owner también aprobó.
                    </span>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
