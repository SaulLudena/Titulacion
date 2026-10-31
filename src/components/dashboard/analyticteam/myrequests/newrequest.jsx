import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  HiLockClosed,
  HiCheck,
  HiPaperAirplane,
  HiChevronRight,
  HiChevronDown,
} from 'react-icons/hi'

import ConfirmModal from '../../../../utils/confirmmodal'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const CATALOG_PAGE_SIZE = 100

// ---------- Helpers ----------

const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('token') || sessionStorage.getItem('token')
    : null

const authHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Devuelve el texto de un campo que puede ser string u objeto ({ nombre, ... })
const pickText = (field, keys = ['nombre'], fallback = '') => {
  if (field && typeof field === 'object') {
    for (const k of keys) if (field[k]) return String(field[k])
    return fallback
  }
  return field ? String(field) : fallback
}

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : ''

const listFrom = (data) =>
  Array.isArray(data) ? data : data.datasets || data.items || []

const fetchCatalogPage = ({ pagina, tamano }) => {
  const params = new URLSearchParams()
  params.append('pagina', String(pagina))
  if (tamano) params.append('tamano', String(tamano))
  return fetch(`${API_BASE_URL}/api/catalogo?${params.toString()}`, {
    method: 'GET',
    headers: authHeaders(),
  })
}

// Trae TODAS las páginas del catálogo (el backend responde
// { total, pagina, tamano, datasets } y entrega una página a la vez)
const fetchAllDatasets = async () => {
  let res = await fetchCatalogPage({ pagina: 1, tamano: CATALOG_PAGE_SIZE })
  if (!res.ok && (res.status === 400 || res.status === 422)) {
    res = await fetchCatalogPage({ pagina: 1 })
  }
  if (!res.ok) throw new Error('No se pudo obtener la lista de datasets.')

  const first = await res.json()
  const items = [...listFrom(first)]
  if (Array.isArray(first)) return items

  const total = Number(first.total) || items.length
  const size = Number(first.tamano) || items.length || 1
  const totalPages = Math.min(Math.ceil(total / size), 50)

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        fetchCatalogPage({ pagina: i + 2, tamano: size }).then((r) => {
          if (!r.ok) throw new Error('No se pudo obtener la lista de datasets.')
          return r.json()
        }),
      ),
    )
    rest.forEach((d) => items.push(...listFrom(d)))
  }

  const seen = new Set()
  return items.filter((it) => {
    const id = it.id || it.dataset_id
    if (!id) return false
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

// Convierte un item del catálogo en un dataset para el combo box
const toDataset = (item) => {
  const id = item.id || item.dataset_id
  const code = pickText(
    item.codigo,
    ['codigo'],
    item.nombre_tecnico || item.code || '',
  )
  return {
    id: String(id),
    title: pickText(
      item.nombre,
      ['nombre'],
      item.nombre_negocio || item.nombre_tecnico || item.title || code,
    ),
    code,
    capa: capitalize(pickText(item.capa, ['nombre', 'codigo'], '')),
    classification: pickText(item.clasificacion, ['nombre'], ''),
    owner: pickText(
      item.autor || item.owner || item.responsable,
      ['nombre'],
      '',
    ),
  }
}

// Etiqueta del combo: nombre + capa, porque un mismo dataset puede existir
// en varias capas (por ejemplo Bronce y Silver)
const optionLabel = (ds) =>
  `${ds.title || ds.code || 'Dataset sin nombre'}${ds.capa ? ` (${ds.capa})` : ''}`

const formatDate = (date) =>
  date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// ---------- Componente ----------

export default function NewRequest({
  datasetId: propDatasetId,
  datasetInfo: propDatasetInfo,
}) {
  const router = useRouter()

  // Dataset elegido en el combo box (vacío hasta que el usuario elija).
  // Solo viene preseleccionado si se llega desde una ficha o el catálogo.
  const [selectedId, setSelectedId] = useState(
    propDatasetId ? String(propDatasetId) : '',
  )
  const [dataset, setDataset] = useState(propDatasetInfo || null)

  // Lista para el combo box
  const [options, setOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState(null)

  // Formulario (sin textos de ejemplo)
  const [motivo, setMotivo] = useState('')
  const [dias, setDias] = useState(90)

  const [loadingDataset, setLoadingDataset] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // Fecha actual, solo en el cliente (evita desajuste de hidratación en Next.js)
  const [today, setToday] = useState(null)
  useEffect(() => {
    setToday(new Date())
  }, [])

  // Preselección si se llega con ?dataset_id= o ?id= en la URL
  useEffect(() => {
    if (!router.isReady || selectedId) return
    const fromQuery = router.query.dataset_id || router.query.id
    if (fromQuery) setSelectedId(String(fromQuery))
  }, [router.isReady, router.query.dataset_id, router.query.id])

  // Cargar todos los datasets para el combo box
  useEffect(() => {
    let cancelled = false

    const loadOptions = async () => {
      setLoadingOptions(true)
      setOptionsError(null)
      try {
        const items = await fetchAllDatasets()
        if (cancelled) return
        const list = items.map(toDataset).sort((a, b) =>
          optionLabel(a).localeCompare(optionLabel(b), 'es', {
            sensitivity: 'base',
          }),
        )
        setOptions(list)
      } catch (err) {
        console.error('Error al cargar los datasets:', err)
        if (!cancelled)
          setOptionsError(
            'No se pudo cargar la lista de datasets. Recarga la página e intenta nuevamente.',
          )
      } finally {
        if (!cancelled) setLoadingOptions(false)
      }
    }

    loadOptions()
    return () => {
      cancelled = true
    }
  }, [])

  // Al elegir un dataset, mostrar sus datos y completarlos con el detalle
  useEffect(() => {
    if (!selectedId) {
      setDataset(null)
      return
    }

    // Datos inmediatos desde la lista (o desde las props)
    const fromList = options.find((o) => o.id === selectedId)
    if (fromList) setDataset(fromList)
    else if (propDatasetInfo && String(propDatasetId) === selectedId)
      setDataset(propDatasetInfo)

    if (propDatasetInfo && String(propDatasetId) === selectedId) return

    let cancelled = false

    const fetchDatasetDetail = async () => {
      setLoadingDataset(true)
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/datasets/${selectedId}`,
          { method: 'GET', headers: authHeaders() },
        )

        if (response.ok && !cancelled) {
          const data = await response.json()
          setDataset((prev) => ({
            ...(prev || {}),
            id: selectedId,
            title:
              pickText(data.nombre_negocio) ||
              pickText(data.nombre) ||
              prev?.title ||
              '',
            code:
              pickText(data.nombre_tecnico) ||
              pickText(data.codigo) ||
              prev?.code ||
              '',
            capa:
              capitalize(pickText(data.capa, ['nombre', 'codigo'], '')) ||
              prev?.capa ||
              '',
            classification:
              pickText(data.clasificacion, ['nombre'], '') ||
              prev?.classification ||
              '',
            owner:
              pickText(data.owner, ['nombre'], '') ||
              pickText(data.autor) ||
              pickText(data.responsable) ||
              prev?.owner ||
              '',
          }))
        }
      } catch (err) {
        console.warn('No se pudo cargar el detalle del dataset:', err)
      } finally {
        if (!cancelled) setLoadingDataset(false)
      }
    }

    fetchDatasetDetail()
    return () => {
      cancelled = true
    }
  }, [selectedId, options, propDatasetId, propDatasetInfo])

  // Si el dataset preseleccionado no está en la lista, se agrega para que el
  // combo box pueda mostrarlo
  const selectOptions = useMemo(() => {
    if (selectedId && dataset && !options.some((o) => o.id === selectedId)) {
      return [{ ...dataset, id: selectedId }, ...options]
    }
    return options
  }, [options, selectedId, dataset])

  const canSubmit = Boolean(selectedId) && motivo.trim().length > 0

  // Texto del periodo elegido, para el formulario y la ventana de confirmación
  const periodRange = today
    ? `Del ${formatDate(today)} al ${formatDate(
        new Date(today.getTime() + dias * 24 * 60 * 60 * 1000),
      )}`
    : ''

  // Al pulsar "Enviar solicitud": validar y pedir confirmación (aún no se envía)
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedId) {
      setError('Selecciona el dataset al que necesitas acceso.')
      return
    }
    if (!motivo.trim()) {
      setError('Indica el motivo de la solicitud.')
      return
    }

    setError(null)
    setShowConfirm(true)
  }

  const handleCancelConfirm = () => {
    if (submitting) return
    setShowConfirm(false)
    setError(null)
  }

  // Envío al backend (POST /api/datasets/{id}/solicitudes), solo tras confirmar
  const submitRequest = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        justificacion: motivo.trim(),
        vigencia_dias: Number(dias),
      }

      const response = await fetch(
        `${API_BASE_URL}/api/datasets/${selectedId}/solicitudes`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        let errorMsg = `El servidor rechazó la solicitud (error ${response.status}).`
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
      // El error se muestra dentro de la ventana de confirmación
      setError(
        String(err.message || 'Hubo un error al registrar la solicitud.'),
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Migas de pan / Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button
          type="button"
          onClick={() => router.push('/dashboard/analyticteam/myrequestspage')}
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

      {error && !showConfirm && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 p-4 text-xs text-red-600"
        >
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
            {/* Combo box de dataset */}
            <div className="space-y-1.5">
              <label
                htmlFor="dataset-select"
                className="block text-xs font-bold text-gray-900"
              >
                Dataset <span className="text-[#ea580c]">*</span>
              </label>

              <div className="relative">
                <select
                  id="dataset-select"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value)
                    setError(null)
                  }}
                  disabled={loadingOptions || Boolean(optionsError)}
                  required
                  className="w-full appearance-none px-3 py-2.5 pr-9 text-xs text-gray-900 border border-gray-200 rounded-none bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingOptions
                      ? 'Cargando datasets...'
                      : 'Selecciona un dataset'}
                  </option>
                  {selectOptions.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {optionLabel(ds)}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {optionsError && (
                <p className="text-[11px] text-red-600">{optionsError}</p>
              )}

              {/* Detalle del dataset elegido */}
              {selectedId && (
                <div className="border-2 border-[#ea580c] bg-white p-4 rounded-none space-y-1.5 mt-2">
                  {loadingDataset && !dataset?.title ? (
                    <div className="text-xs text-gray-400 animate-pulse">
                      Cargando información del dataset...
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-gray-900">
                        {dataset?.title || dataset?.code}
                      </div>
                      <div className="text-xs font-mono text-gray-500">
                        {dataset?.code}
                        {dataset?.capa ? ` · Capa ${dataset.capa}` : ''}
                      </div>
                      {dataset?.classification && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-black rounded-none">
                            <HiLockClosed className="w-3.5 h-3.5 text-white" />
                            {dataset.classification}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Motivo / Justificación */}
            <div className="space-y-1.5">
              <label
                htmlFor="motivo"
                className="block text-xs font-bold text-gray-900"
              >
                Motivo <span className="text-[#ea580c]">*</span>
              </label>
              <textarea
                id="motivo"
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
              <span className="block text-xs font-bold text-gray-900">
                Periodo de acceso <span className="text-[#ea580c]">*</span>
              </span>
              <div
                className="inline-flex border border-gray-300 rounded-none overflow-hidden bg-white"
                role="group"
                aria-label="Periodo de acceso"
              >
                {[30, 60, 90].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDias(num)}
                    aria-pressed={dias === num}
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
                {periodRange ? `${periodRange}. ` : ''}
                Máximo permitido por política: 90 días.
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
                disabled={submitting || !canSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-[11px] text-gray-500">
                  {dataset?.owner || 'Se asigna según el dataset'}
                </p>
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

      {/* Ventana de confirmación antes de enviar la solicitud */}
      <ConfirmModal
        open={showConfirm}
        title="Confirmar solicitud de acceso"
        confirmLabel="Confirmar y enviar"
        loadingLabel="Enviando..."
        loading={submitting}
        error={error}
        onConfirm={submitRequest}
        onCancel={handleCancelConfirm}
      >
        <p>
          Vas a enviar una solicitud de acceso. Se notificará al Data Owner para
          su revisión. ¿Deseas continuar?
        </p>

        <dl className="border border-gray-200 divide-y divide-gray-100">
          <div className="flex gap-3 px-3 py-2">
            <dt className="w-20 shrink-0 font-semibold text-gray-900">
              Dataset
            </dt>
            <dd className="min-w-0 break-words">
              {dataset?.title || dataset?.code}
              {dataset?.capa ? ` (${dataset.capa})` : ''}
            </dd>
          </div>
          <div className="flex gap-3 px-3 py-2">
            <dt className="w-20 shrink-0 font-semibold text-gray-900">
              Periodo
            </dt>
            <dd>
              {dias} días{periodRange ? ` · ${periodRange}` : ''}
            </dd>
          </div>
          <div className="flex gap-3 px-3 py-2">
            <dt className="w-20 shrink-0 font-semibold text-gray-900">
              Motivo
            </dt>
            <dd className="min-w-0 break-words line-clamp-3">{motivo}</dd>
          </div>
        </dl>
      </ConfirmModal>
    </div>
  )
}
