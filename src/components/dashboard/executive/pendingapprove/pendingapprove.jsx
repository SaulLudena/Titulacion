import React, { useState, useEffect } from 'react'
import { HiLockClosed, HiInformationCircle, HiCheck } from 'react-icons/hi'
import ConfirmModal from '../../../../utils/confirmmodal'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function Pendingapprove() {
  const [solicitudes, setSolicitudes] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [decision, setDecision] = useState('aprobar') // 'aprobar' o 'rechazar'
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Estado para controlar la visibilidad del modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Cargar solicitudes pendientes desde la API al montar el componente
  useEffect(() => {
    fetchPendingRequests()
  }, [])

  // Función auxiliar para calcular los días restantes hasta la fecha límite
  const calcularPlazo = (fechaLimiteStr) => {
    if (!fechaLimiteStr) return 'Pendiente de revisión'
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const limite = new Date(fechaLimiteStr)
    limite.setHours(0, 0, 0, 0)

    const diffTime = limite - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Vencido'
    if (diffDays === 0) return 'Vence hoy'
    return `vence en ${diffDays} d`
  }

  const fetchPendingRequests = async () => {
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
        throw new Error('No se pudieron obtener las solicitudes pendientes.')
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : data.solicitudes || []

      const formatted = list.map((item) => {
        const diasVigencia =
          item.vigencia_otorgada_dias ?? item.vigencia_solicitada_dias ?? 90

        const tipoPermiso = item.permiso || 'lectura'

        return {
          id: item.solicitud_id || item.id,
          codigo: item.codigo || 'SOL-XXXXXX',
          nombre: item.solicitante || 'Analista',
          cargo: item.cargo || item.area || null,
          dataset: item.dataset || 'Dataset',
          badgeTipo:
            item.clasificacion_codigo === 'restringida'
              ? 'Restringida'
              : 'Confidencial',
          permiso: `${tipoPermiso} · ${diasVigencia} d`,
          dias: diasVigencia,
          plazo: calcularPlazo(item.fecha_limite),
          motivo: item.justificacion || 'Sin justificación especificada.',
          requiereSegundaAprobacion: item.requiere_cumplimiento ?? true,
        }
      })

      setSolicitudes(formatted)
      if (formatted.length > 0) {
        setSelectedRequest(formatted[0])
        setComentario(`Aprobado; solo lectura y ${formatted[0].dias} días.`)
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
    if (decision === 'aprobar') {
      setComentario(`Aprobado; solo lectura y ${item.dias} días.`)
    } else {
      setComentario('')
    }
  }

  const handleDecisionChange = (nuevaDecision) => {
    setDecision(nuevaDecision)
    setError(null)
    if (nuevaDecision === 'aprobar' && selectedRequest) {
      setComentario(`Aprobado; solo lectura y ${selectedRequest.dias} días.`)
    } else {
      setComentario('')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!selectedRequest) return
    setError(null)

    if (decision === 'rechazar' && comentario.trim().length < 10) {
      setError(
        'El motivo del rechazo debe contener al menos 10 caracteres (CU-07, FA-01).',
      )
      return
    }

    setShowConfirmModal(true)
  }

  const executeSubmitDecision = async () => {
    setSubmitting(true)
    setError(null)

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

    try {
      const payload = {
        aprobar: decision === 'aprobar',
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
        } catch (parseErr) {}
        throw new Error(errorMsg)
      }

      setShowConfirmModal(false)

      const updatedList = solicitudes.filter((s) => s.id !== selectedRequest.id)
      setSolicitudes(updatedList)
      if (updatedList.length > 0) {
        setSelectedRequest(updatedList[0])
        setComentario(
          decision === 'aprobar'
            ? `Aprobado; solo lectura y ${updatedList[0].dias} días.`
            : '',
        )
      } else {
        setSelectedRequest(null)
      }
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
    <div className="font-sans bg-[#f8f9fa] min-h-screen text-gray-950 w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Solicitudes por aprobar
      </h1>

      {error && !showConfirmModal && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 text-xs text-red-600">
          {error}
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500">
          No hay solicitudes pendientes de aprobación en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 items-start w-full">
          <div className="lg:col-span-7 bg-white border border-gray-200 shadow-sm min-w-0">
            <div className="px-4 lg:px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide">
                Solicitudes pendientes ({solicitudes.length})
              </h2>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50">
                    <th className="py-3 px-3 lg:px-4">Solicitante</th>
                    <th className="py-3 px-3 lg:px-4">Dataset</th>
                    <th className="py-3 px-3 lg:px-4">Permiso</th>
                    <th className="py-3 px-3 lg:px-4">Plazo</th>
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
                        <td className="py-3.5 px-3 lg:px-4 align-top">
                          <p className="font-bold text-gray-900 leading-snug">
                            {item.nombre}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 lg:px-4 align-top min-w-0">
                          <span
                            className="font-mono text-gray-800 font-medium block truncate max-w-[140px] xl:max-w-[200px]"
                            title={item.dataset}
                          >
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
                        <td className="py-3.5 px-3 lg:px-4 align-top text-gray-700 font-medium whitespace-nowrap">
                          {item.permiso}
                        </td>
                        <td className="py-3.5 px-3 lg:px-4 align-top text-gray-500 text-[11px] leading-relaxed whitespace-nowrap">
                          {item.plazo}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedRequest && (
            <div className="lg:col-span-5 bg-white border border-gray-200 shadow-sm p-4 lg:p-5 min-w-0">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h2
                  className="text-xs lg:text-sm font-bold text-gray-900 truncate"
                  title={`Solicitud ${selectedRequest.codigo}`}
                >
                  Solicitud {selectedRequest.codigo}
                </h2>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-gray-500 font-medium">Dataset</span>
                  <div className="col-span-2 flex items-center gap-1.5 flex-wrap min-w-0">
                    <span
                      className="font-mono font-bold text-gray-800 truncate max-w-full"
                      title={selectedRequest.dataset}
                    >
                      {selectedRequest.dataset}
                    </span>
                    {selectedRequest.badgeTipo === 'Restringida' ? (
                      <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] px-1.5 py-0.5 font-medium shrink-0">
                        <HiLockClosed className="w-3 h-3" /> Restringida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-[10px] px-1.5 py-0.5 font-medium shrink-0">
                        🔒 Confidencial
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 items-start">
                  <span className="text-gray-500 font-medium">Motivo</span>
                  <p className="col-span-2 text-gray-700 leading-relaxed break-words">
                    {selectedRequest.motivo}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Permiso</span>
                  <span className="col-span-2 text-gray-800 font-medium">
                    {selectedRequest.permiso}
                  </span>
                </div>

                {selectedRequest.requiereSegundaAprobacion && (
                  <div className="bg-orange-50/70 border border-orange-200 p-2.5 lg:p-3 flex gap-2 items-start text-orange-800 my-3">
                    <HiInformationCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Requiere segunda aprobación del Oficial de Cumplimiento;
                      tu aprobación sola no concede el acceso. Esto se reflejará
                      en el panel del analista.
                    </p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      onClick={() => handleDecisionChange('aprobar')}
                      className={`flex items-center gap-2 p-2.5 border cursor-pointer transition-all ${
                        decision === 'aprobar'
                          ? 'border-[#ea580c] bg-orange-50/20 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'aprobar'}
                        onChange={() => handleDecisionChange('aprobar')}
                        className="accent-[#ea580c] w-4 h-4"
                      />
                      <span className="font-bold text-gray-900">Aprobar</span>
                    </label>

                    <label
                      onClick={() => handleDecisionChange('rechazar')}
                      className={`flex items-center gap-2 p-2.5 border cursor-pointer transition-all ${
                        decision === 'rechazar'
                          ? 'border-[#ea580c] bg-orange-50/20 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'rechazar'}
                        onChange={() => handleDecisionChange('rechazar')}
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
                      placeholder={
                        decision === 'rechazar'
                          ? 'Escribe el motivo del rechazo (mínimo 10 caracteres)...'
                          : 'Escribe un comentario u observación...'
                      }
                      className="w-full border border-gray-200 p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] resize-none"
                    />
                    {decision === 'rechazar' && (
                      <p
                        className={`text-[10px] mt-1 ${comentario.trim().length < 10 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {comentario.trim().length}/10 caracteres mínimos
                        requeridos para rechazar.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs disabled:opacity-50"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>Confirmar decisión</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={showConfirmModal}
        title="Confirmar decisión de solicitud"
        confirmLabel="Sí, procesar"
        cancelLabel="Cancelar"
        onConfirm={executeSubmitDecision}
        onCancel={() => !submitting && setShowConfirmModal(false)}
        loading={submitting}
        loadingLabel="Procesando decisión..."
        error={error}
        variant={decision === 'rechazar' ? 'danger' : 'default'}
      >
        <div className="space-y-3">
          <p>
            Estás a punto de{' '}
            <span className="font-bold text-gray-900 uppercase">
              {decision}
            </span>{' '}
            la solicitud{' '}
            <span className="font-mono font-bold text-gray-900">
              {selectedRequest?.codigo}
            </span>{' '}
            para el dataset{' '}
            <span className="font-mono font-bold text-gray-900">
              {selectedRequest?.dataset}
            </span>
            .
          </p>
          <div className="bg-gray-50 p-3 border border-gray-200 font-mono text-[11px] text-gray-700">
            <strong>Comentario:</strong> "{comentario}"
          </div>
          <p className="text-gray-500">¿Deseas proceder con esta acción?</p>
        </div>
      </ConfirmModal>
    </div>
  )
}
