import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  HiLockClosed,
  HiCheck,
  HiPaperAirplane,
  HiChevronRight,
} from 'react-icons/hi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function NewRequest({
  datasetId: propDatasetId,
  datasetInfo: propDatasetInfo,
}) {
  const router = useRouter()
  const { id: queryId, dataset_id } = router.query

  // Determinar el ID real del dataset desde las props o los query params
  const targetDatasetId =
    propDatasetId ||
    dataset_id ||
    queryId ||
    'a277a842-54ff-4d6c-8e97-bb266c0305bf'

  // Estados del Formulario
  const [dataset, setDataset] = useState(
    propDatasetInfo || {
      title: 'Gestiones de cobranza',
      code: 'gestion_cobranza',
      classification: 'Restringida',
      owner: 'Sandra Valdivia Ponce',
    },
  )

  const [motivo, setMotivo] = useState(
    'Ejemplo por defecto: Modelo de propensión de pago para la campaña de recuperación del cuarto trimestre.',
  )
  const [dias, setDias] = useState(90)

  const [loadingDataset, setLoadingDataset] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Cargar datos dinámicos del dataset si tenemos su ID
  useEffect(() => {
    if (!targetDatasetId || propDatasetInfo) return

    const fetchDatasetDetail = async () => {
      setLoadingDataset(true)
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || sessionStorage.getItem('token')
          : null

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/datasets/${targetDatasetId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          setDataset({
            id: data.id || targetDatasetId,
            title:
              data.nombre_negocio || data.nombre || 'Gestiones de cobranza',
            code: data.nombre_tecnico || data.codigo || 'gestion_cobranza',
            classification:
              typeof data.clasificacion === 'object'
                ? data.clasificacion?.nombre
                : data.clasificacion || 'Restringida',
            owner:
              typeof data.owner === 'object'
                ? data.owner?.nombre
                : data.autor || data.owner || 'Sandra Valdivia Ponce',
          })
        }
      } catch (err) {
        console.warn(
          'No se pudo cargar el detalle del dataset, usando valores por defecto:',
          err,
        )
      } finally {
        setLoadingDataset(false)
      }
    }

    fetchDatasetDetail()
  }, [targetDatasetId, propDatasetInfo])

  // Envío del formulario al backend (POST /api/datasets/{id}/solicitudes)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

    try {
      // Payload limpio SIN el campo 'permiso' (el backend no lo acepta)
      const payload = {
        justificacion: motivo,
        vigencia_dias: Number(dias),
      }

      const response = await fetch(
        `${API_BASE_URL}/api/datasets/${targetDatasetId}/solicitudes`,
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
        let errorMsg = 'El servidor rechazó la solicitud (Error 422).'
        try {
          const errData = await response.json()
          const rawMsg =
            errData.message || errData.error || errData.detail || errData
          errorMsg =
            typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : String(rawMsg)
        } catch (parseErr) {
          errorMsg = 'Error al procesar la respuesta del servidor.'
        }
        throw new Error(errorMsg)
      }

      // Redireccionar al listado de solicitudes si todo sale bien
      router.push('/dashboard/analyticteam/myrequestspage')
    } catch (err) {
      console.error('Error enviando la solicitud:', err)
      const finalMsg =
        typeof err.message === 'object'
          ? JSON.stringify(err.message)
          : String(err.message || 'Hubo un error al registrar la solicitud.')
      setError(finalMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Migas de pan / Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={() => router.push('/dashboard/analyticteam/mis-solicitudes')}
          className="hover:text-[#ea580c] hover:underline cursor-pointer transition-colors"
        >
          Mis solicitudes
        </button>
        <HiChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">Nueva solicitud</span>
      </nav>

      {/* Título Principal */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Solicitar acceso
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Contenedor Principal en Grid (Formulario + Panel Lateral) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda / Formulario */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            Solicitud de acceso
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tarjeta del Dataset */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-900">
                Dataset <span className="text-[#ea580c]">*</span>
              </label>

              <div className="border-2 border-[#ea580c] bg-white p-4 rounded-none space-y-1.5">
                {loadingDataset ? (
                  <div className="text-xs text-gray-400 animate-pulse">
                    Cargando información del dataset...
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold text-gray-900">
                      {dataset.title}
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {dataset.code}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-black rounded-none">
                        <HiLockClosed className="w-3.5 h-3.5 text-white" />
                        {dataset.classification}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Motivo / Justificación */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-900">
                Motivo <span className="text-[#ea580c]">*</span>
              </label>
              <textarea
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Indique el propósito o justificación del acceso..."
                className="w-full p-3 text-xs text-gray-900 border border-gray-200 rounded-none focus:outline-none focus:border-[#ea580c] bg-white resize-none"
                required
              />
            </div>

            {/* Periodo de Acceso */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900">
                Periodo de acceso <span className="text-[#ea580c]">*</span>
              </label>
              <div className="inline-flex border border-gray-300 rounded-none overflow-hidden bg-white">
                {[30, 60, 90].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDias(num)}
                    className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      dias === num
                        ? 'bg-black text-white font-bold'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num} días
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500">
                Del 1 oct al 29 dic 2026. Máximo permitido por política: 90
                días.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-xs font-semibold text-[#ea580c] hover:underline cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <HiPaperAirplane className="w-3.5 h-3.5 rotate-90" />
                <span>{submitting ? 'Enviando...' : 'Enviar solicitud'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Flujo de Aprobación Derecha */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            Quién la aprueba
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white">
                <HiCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-900">Tú</p>
                <p className="text-[11px] text-gray-500">Solicitante</p>
              </div>
            </div>

            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center text-[11px] font-bold ring-4 ring-white">
                2
              </span>
              <div>
                <p className="text-xs font-bold text-gray-900">Data Owner</p>
                <p className="text-[11px] text-gray-500">{dataset.owner}</p>
              </div>
            </div>

            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px] font-bold ring-4 ring-white">
                3
              </span>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Oficial de Cumplimiento
                </p>
                <p className="text-[11px] text-gray-500">
                  Por contener datos personales
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-3 border-t border-gray-100 leading-relaxed">
            Si no hay respuesta en 7 días, la solicitud vence y queda
            registrada.
          </p>
        </div>
      </div>
    </div>
  )
}
