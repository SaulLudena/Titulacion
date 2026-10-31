import React, { useEffect, useState } from 'react'
import { HiChevronDown, HiOutlineSearch, HiX } from 'react-icons/hi'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const PAGE_SIZE = 50

// ---------- Helpers ----------

const getToken = () => {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token')
  )
}

const authHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const isPrimitive = (v) => typeof v === 'string' || typeof v === 'number'

// Texto de un campo que puede ser string, número u objeto ({ nombre, ... })
const pickText = (value, keys = ['nombre']) => {
  if (value === null || value === undefined) return ''
  if (isPrimitive(value)) return String(value)
  if (typeof value === 'object') {
    for (const k of keys) if (isPrimitive(value[k])) return String(value[k])
  }
  return ''
}

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]
const pad = (n) => String(n).padStart(2, '0')

// Date -> "2026-09-30" (para los filtros)
const toISODate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// "2026-09-30" -> "30 sep 2026"
const formatIsoDay = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

// Fecha del evento -> { day: "30 sep 2026", time: "09:41:07" }
const splitDateTime = (value) => {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime()))
    return { day: value ? String(value) : '—', time: '' }
  return {
    day: `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  }
}

// ---------- Adaptadores de la respuesta ----------
// El formato exacto de los eventos no está en la colección de Postman; estos
// adaptadores aceptan los nombres de campo más probables. Si el backend usa
// otros, solo hay que ajustar aquí.

// Código corto de la solicitud ("SOL-0B87F6"): si el backend no lo manda,
// se arma con los primeros 6 caracteres del id
const solicitudCode = (e) => {
  const direct = pickText(
    e.solicitud_codigo ?? e.codigo_solicitud ?? e.solicitud_ref ?? e.solicitud,
    ['codigo', 'codigo_corto'],
  )
  if (direct) return direct
  return e.solicitud_id
    ? `SOL-${String(e.solicitud_id).replace(/-/g, '').slice(0, 6).toUpperCase()}`
    : ''
}

const normalizeEvent = (e, index) => ({
  key: e.id ?? e.evento_id ?? `ev-${index}`,
  fecha: splitDateTime(
    e.fecha ??
      e.creado_en ??
      e.ocurrido_en ??
      e.created_at ??
      e.fecha_hora ??
      e.timestamp ??
      null,
  ),
  quien: pickText(
    e.quien ?? e.actor_nombre ?? e.usuario_nombre ?? e.actor ?? e.usuario,
    ['nombre', 'correo', 'email'],
  ),
  que: pickText(e.tipo ?? e.tipo_evento ?? e.evento, ['codigo', 'nombre']),
  dataset: pickText(e.dataset_nombre_tecnico ?? e.dataset_nombre ?? e.dataset, [
    'nombre_tecnico',
    'nombre',
    'codigo',
  ]),
  solicitudId: e.solicitud_id ?? null,
  solicitud: solicitudCode(e),
})

const normalizeTypes = (data) => {
  const list = Array.isArray(data) ? data : (data?.tipos ?? data?.items ?? [])
  return list
    .map((t) =>
      typeof t === 'string' ? t : (t.codigo ?? t.tipo ?? t.id ?? ''),
    )
    .filter(Boolean)
}

const errorFor = (status) => {
  if (status === 401)
    return 'Tu sesión no es válida o expiró. Cierra sesión e ingresa nuevamente.'
  if (status === 403) return 'No tienes permiso para ver la bitácora.'
  if (status >= 500)
    return 'El servidor tuvo un problema al consultar la bitácora. Intenta nuevamente en unos minutos.'
  return `No se pudo consultar la bitácora (código ${status}).`
}

// ---------- Campo de fecha ----------
// Muestra la fecha como "1 sep 2026" y usa el selector nativo al hacer clic
function DateField({ id, label, value, onChange }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold text-gray-900 mb-1.5"
      >
        {label}
      </label>
      <div className="relative w-44 border border-gray-200 bg-white focus-within:border-[#ea580c] focus-within:ring-1 focus-within:ring-[#ea580c]">
        <div className="px-3 py-2.5 text-xs text-gray-900" aria-hidden="true">
          {value ? (
            formatIsoDay(value)
          ) : (
            <span className="text-gray-400">Seleccionar</span>
          )}
        </div>
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.()
            } catch (err) {
              /* el navegador abrirá el selector por su cuenta */
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

// ---------- Componente ----------

export default function ComplianceOfficerBinnacle() {
  const [tipos, setTipos] = useState([])

  // Filtros en edición vs. filtros aplicados a la consulta
  const [draft, setDraft] = useState({ desde: '', hasta: '', tipo: '' })
  const [applied, setApplied] = useState(null) // null = aún sin inicializar
  const [solicitud, setSolicitud] = useState(null) // { id, codigo } | null
  const [page, setPage] = useState(1)

  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(null)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rangeError, setRangeError] = useState(null)

  // Rango inicial: mes en curso (se calcula en el cliente para evitar
  // desajustes de hidratación en Next.js)
  useEffect(() => {
    const now = new Date()
    const range = {
      desde: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
      hasta: toISODate(now),
      tipo: '',
    }
    setDraft(range)
    setApplied(range)
  }, [])

  // Tipos de evento para el selector: GET /api/bitacora/tipos
  useEffect(() => {
    let cancelled = false
    const loadTypes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bitacora/tipos`, {
          headers: authHeaders(),
        })
        if (!res.ok) return
        const list = normalizeTypes(await res.json())
        if (!cancelled) setTipos(list)
      } catch (err) {
        console.warn('No se pudieron cargar los tipos de evento:', err)
      }
    }
    loadTypes()
    return () => {
      cancelled = true
    }
  }, [])

  // Eventos: GET /api/bitacora
  useEffect(() => {
    if (!applied) return
    const controller = new AbortController()

    const loadEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.append('tamano', String(PAGE_SIZE))
        params.append('pagina', String(page))
        if (applied.tipo) params.append('tipo', applied.tipo)
        if (applied.desde) params.append('desde', applied.desde)
        if (applied.hasta) params.append('hasta', applied.hasta)
        if (solicitud) params.append('solicitud_id', String(solicitud.id))

        const res = await fetch(
          `${API_BASE_URL}/api/bitacora?${params.toString()}`,
          { headers: authHeaders(), signal: controller.signal },
        )
        if (!res.ok) {
          const err = new Error(errorFor(res.status))
          err.status = res.status
          throw err
        }

        const data = await res.json()
        const list = Array.isArray(data)
          ? data
          : (data.eventos ?? data.items ?? [])

        setEvents(list.map(normalizeEvent))
        setTotal(Number(data.total) || null)
        setPageSize(Number(data.tamano) || PAGE_SIZE)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Error al consultar la bitácora:', err)
        setEvents([])
        setTotal(null)
        setError(
          err.status
            ? err.message
            : 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.',
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadEvents()
    return () => controller.abort()
  }, [applied, page, solicitud])

  const handleSearch = (e) => {
    e?.preventDefault()
    if (draft.desde && draft.hasta && draft.desde > draft.hasta) {
      setRangeError('La fecha "Desde" no puede ser posterior a "Hasta".')
      return
    }
    setRangeError(null)
    setPage(1)
    setApplied({ ...draft })
  }

  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : null
  const hasNext = totalPages ? page < totalPages : events.length >= pageSize
  const showFooter = page > 1 || hasNext
  const from = events.length ? (page - 1) * pageSize + 1 : 0
  const to = (page - 1) * pageSize + events.length

  const fieldClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-none text-xs text-gray-900 bg-white focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]'

  const thClass =
    'px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500'

  return (
    <div className="space-y-6 font-sans">
      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Bitácora de auditoría
        </h1>
        <p className="text-xs text-gray-500 mt-1">Quién hizo qué y cuándo.</p>
      </div>

      {/* Filtros */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-none p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-end gap-4">
          <DateField
            id="bitacora-desde"
            label="Desde"
            value={draft.desde}
            onChange={(v) => setDraft((p) => ({ ...p, desde: v }))}
          />
          <DateField
            id="bitacora-hasta"
            label="Hasta"
            value={draft.hasta}
            onChange={(v) => setDraft((p) => ({ ...p, hasta: v }))}
          />

          <div className="w-64">
            <label
              htmlFor="bitacora-evento"
              className="block text-[11px] font-semibold text-gray-900 mb-1.5"
            >
              Evento
            </label>
            <div className="relative">
              <select
                id="bitacora-evento"
                value={draft.tipo}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, tipo: e.target.value }))
                }
                className={`${fieldClass} appearance-none pr-9 cursor-pointer`}
              >
                <option value="">Todos</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer"
          >
            <HiOutlineSearch className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {rangeError && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {rangeError}
          </p>
        )}
      </form>

      {/* Filtro activo por solicitud (se activa desde la tabla) */}
      {solicitud && (
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span>Trazabilidad de la solicitud</span>
          <span className="inline-flex items-center gap-1.5 border border-gray-300 bg-white px-2 py-1 font-mono font-semibold">
            {solicitud.codigo}
            <button
              type="button"
              onClick={() => {
                setSolicitud(null)
                setPage(1)
              }}
              aria-label="Quitar filtro de solicitud"
              className="text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <HiX className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Tabla */}
      {error ? (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 p-4 text-xs text-red-600 text-center"
        >
          {error}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[900px] text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th scope="col" className={thClass}>
                  Fecha
                </th>
                <th scope="col" className={thClass}>
                  Quién
                </th>
                <th scope="col" className={thClass}>
                  Qué
                </th>
                <th scope="col" className={thClass}>
                  Dataset
                </th>
                <th scope="col" className={thClass}>
                  Solicitud
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    Cargando eventos desde el servidor...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No se encontraron eventos con estos criterios.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.key} className="align-top">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">
                        {ev.fecha.day}
                      </div>
                      {ev.fecha.time && (
                        <div className="text-gray-500 mt-0.5">
                          {ev.fecha.time}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-800">
                      {ev.quien || '—'}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-gray-900">
                      {ev.que || '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-700">
                      {ev.dataset || '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-700">
                      {ev.solicitudId ? (
                        <button
                          type="button"
                          title="Ver la trazabilidad de esta solicitud"
                          onClick={() => {
                            setSolicitud({
                              id: ev.solicitudId,
                              codigo: ev.solicitud,
                            })
                            setPage(1)
                          }}
                          className="font-mono hover:text-[#ea580c] hover:underline cursor-pointer"
                        >
                          {ev.solicitud}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pie con paginación (solo si hay más de una página) */}
          {!loading && showFooter && (
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-[11px] text-gray-500" aria-live="polite">
                {total
                  ? `Mostrando ${from}–${to} de ${total} eventos`
                  : `Página ${page}`}
              </p>
              <nav
                className="flex items-center gap-2"
                aria-label="Paginación de la bitácora"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 text-xs border border-gray-200 bg-white text-gray-700 hover:border-[#ea580c] hover:text-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-colors cursor-pointer rounded-none"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="h-8 px-3 text-xs border border-gray-200 bg-white text-gray-700 hover:border-[#ea580c] hover:text-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-colors cursor-pointer rounded-none"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
