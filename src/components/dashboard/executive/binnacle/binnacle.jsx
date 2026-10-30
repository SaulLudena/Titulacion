import React, { useCallback, useEffect, useState } from 'react'
import { HiSearch, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { apiFetch } from '../../../../libs/api'

const TAMANOS = [20, 50, 100]

const iso = (d) => d.toISOString().slice(0, 10)
const HOY = new Date()
const HACE_30 = new Date(HOY.getTime() - 30 * 24 * 60 * 60 * 1000)

const listaTipos = (d) => {
  const arr = Array.isArray(d) ? d : (d?.tipos ?? d?.items ?? [])
  return arr
    .map((t) =>
      typeof t === 'string'
        ? t
        : (t.codigo ?? t.tipo ?? t.tipo_evento ?? t.nombre),
    )
    .filter(Boolean)
}

const texto = (v) => {
  if (v == null) return null
  if (typeof v === 'object') return v.nombre_tecnico ?? v.nombre ?? null
  return String(v)
}

const partesFecha = (f) => {
  const d = new Date(f)
  if (!f || isNaN(d)) return { dia: '—', hora: '' }
  const zona = { timeZone: 'America/Lima' }
  return {
    dia: d.toLocaleDateString('es-PE', {
      ...zona,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    hora: d.toLocaleTimeString('es-PE', {
      ...zona,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  }
}

const codigoSolicitud = (e) =>
  e.solicitud_codigo ??
  (e.solicitud_id
    ? `SOL-${String(e.solicitud_id).replace(/-/g, '').slice(0, 6).toUpperCase()}`
    : null)

const detalleUtil = (d) =>
  d && typeof d === 'object'
    ? Object.fromEntries(
        Object.entries(d).filter(([, v]) => v !== null && v !== ''),
      )
    : {}

export default function Binnacle() {
  const [desde, setDesde] = useState(iso(HACE_30))
  const [hasta, setHasta] = useState(iso(HOY))
  const [tiposSel, setTiposSel] = useState([])
  const [tamano, setTamano] = useState(20)
  const [solicitudId, setSolicitudId] = useState('')
  const [abierto, setAbierto] = useState(false)

  const [tipos, setTipos] = useState([])
  const [eventos, setEventos] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [aplicados, setAplicados] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/api/bitacora/tipos')
      .then((r) => setTipos(listaTipos(r)))
      .catch(() => {})
  }, [])

  const buscar = useCallback(async (f, pag = 1) => {
    try {
      setCargando(true)
      setError(null)
      const p = new URLSearchParams()
      p.set('tamano', f.tamano)
      p.set('pagina', pag)
      if (f.desde) p.set('desde', f.desde)
      if (f.hasta) p.set('hasta', f.hasta)
      f.tiposSel.forEach((t) => p.append('tipo', t))
      if (f.solicitudId) p.set('solicitud_id', f.solicitudId)

      const r = await apiFetch(`/api/bitacora?${p}`)
      setEventos(Array.isArray(r?.eventos) ? r.eventos : [])
      setTotal(r?.total ?? 0)
      setPagina(r?.pagina ?? pag)
      setAplicados(f)
      setExpandido(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  const filtros = { desde, hasta, tiposSel, tamano, solicitudId }

  useEffect(() => {
    buscar(filtros, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    setAbierto(false)
    buscar(filtros, 1)
  }

  const verSolicitud = (id) => {
    setSolicitudId(id)
    buscar({ ...filtros, solicitudId: id }, 1)
  }

  const quitarSolicitud = () => {
    setSolicitudId('')
    buscar({ ...filtros, solicitudId: '' }, 1)
  }

  const irAPagina = (n) => aplicados && buscar(aplicados, n)

  const tamanoAplicado = aplicados?.tamano ?? tamano
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoAplicado))
  const inicio = total === 0 ? 0 : (pagina - 1) * tamanoAplicado + 1
  const fin = Math.min(pagina * tamanoAplicado, total)

  const input =
    'border border-gray-200 px-3.5 py-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#ea580c]'
  const label =
    'block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2'

  return (
    <div className="font-sans text-gray-900 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bitácora de auditoría
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Quién hizo qué y cuándo. El Data Owner ve sus datasets y sus acciones;
          Cumplimiento ve todo.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 mb-6">
        <form
          onSubmit={onSubmit}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
        >
          <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
            <div>
              <label className={label}>Desde</label>
              <input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
                className={`${input} w-40`}
              />
            </div>
            <div>
              <label className={label}>Hasta</label>
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                className={`${input} w-40`}
              />
            </div>

            <div className="relative">
              <label className={label}>Evento</label>
              <button
                type="button"
                onClick={() => setAbierto((a) => !a)}
                className={`${input} w-56 text-left cursor-pointer`}
              >
                {tiposSel.length === 0
                  ? 'Todos'
                  : `${tiposSel.length} seleccionado${tiposSel.length > 1 ? 's' : ''}`}
              </button>

              {abierto && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAbierto(false)}
                  />
                  <div className="absolute z-20 mt-1 w-72 max-h-64 overflow-y-auto bg-white border border-gray-200 shadow-lg">
                    <button
                      type="button"
                      onClick={() => setTiposSel([])}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold text-gray-500 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      Limpiar selección
                    </button>
                    {tipos.map((t) => (
                      <label
                        key={t}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tiposSel.includes(t)}
                          onChange={() =>
                            setTiposSel((s) =>
                              s.includes(t)
                                ? s.filter((x) => x !== t)
                                : [...s, t],
                            )
                          }
                        />
                        {t}
                      </label>
                    ))}
                    {tipos.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-400">
                        Sin tipos disponibles.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <label className={label}>Por página</label>
              <select
                value={tamano}
                onChange={(e) => setTamano(Number(e.target.value))}
                className={`${input} w-24 cursor-pointer`}
              >
                {TAMANOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2 px-5 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            <HiSearch className="w-4 h-4" />
            <span>{cargando ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </form>

        {solicitudId && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Trazabilidad de la solicitud:</span>
            <span className="font-mono font-bold bg-gray-100 px-2 py-1">
              SOL-{solicitudId.replace(/-/g, '').slice(0, 6).toUpperCase()}
            </span>
            <button
              onClick={quitarSolicitud}
              className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 px-2 py-1 font-bold text-gray-700 cursor-pointer"
            >
              <HiX className="w-3 h-3" /> Quitar
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[#ea580c] border border-[#ea580c]/30 bg-[#ea580c]/5 px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {cargando && <p className="p-6 text-xs text-gray-500">Cargando...</p>}

        {!cargando && eventos.length === 0 && (
          <p className="p-6 text-xs text-gray-500">
            No hay eventos con esos filtros.
          </p>
        )}

        {!cargando && eventos.length > 0 && (
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
                {eventos.map((e) => {
                  const f = partesFecha(e.ocurrido_en)
                  const cod = codigoSolicitud(e)
                  const det = detalleUtil(e.detalle)
                  const hayDetalle = Object.keys(det).length > 0
                  const abiertoFila = expandido === e.id
                  const dataset = texto(e.dataset)

                  return (
                    <React.Fragment key={e.id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-gray-700 whitespace-nowrap">
                          <p>{f.dia}</p>
                          <p className="text-[10px] text-gray-400">{f.hora}</p>
                        </td>

                        <td className="py-3.5 px-6">
                          <p className="text-gray-900 font-medium">
                            {e.actor_nombre ?? '—'}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {[e.actor_rol, e.canal].filter(Boolean).join(' · ')}
                          </p>
                        </td>

                        <td className="py-3.5 px-6">
                          <p className="font-mono font-bold text-gray-900 whitespace-nowrap">
                            {e.tipo_evento ?? '—'}
                          </p>
                          {e.descripcion_evento && (
                            <p className="text-[11px] text-gray-500">
                              {e.descripcion_evento}
                            </p>
                          )}
                          {hayDetalle && (
                            <button
                              onClick={() =>
                                setExpandido(abiertoFila ? null : e.id)
                              }
                              className="text-[11px] text-[#ea580c] font-bold hover:underline cursor-pointer mt-0.5"
                            >
                              {abiertoFila ? 'Ocultar detalle' : 'Ver detalle'}
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-6">
                          {dataset ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-gray-800">
                                {dataset}
                              </span>
                              {e.capa && (
                                <span className="border border-gray-300 text-gray-500 px-1.5 py-0.5 text-[10px] uppercase">
                                  {e.capa}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 font-mono text-gray-600 whitespace-nowrap">
                          {e.solicitud_id && cod ? (
                            <button
                              onClick={() => verSolicitud(e.solicitud_id)}
                              title="Ver la trazabilidad de esta solicitud"
                              className="underline decoration-dotted hover:text-[#ea580c] cursor-pointer"
                            >
                              {cod}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>

                      {abiertoFila && (
                        <tr className="bg-gray-50/60">
                          <td colSpan={5} className="px-6 py-3">
                            <pre className="text-[11px] text-gray-600 font-mono whitespace-pre-wrap">
                              {JSON.stringify(det, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!cargando && total > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-xs text-gray-600">
            <span>
              Mostrando {inicio}-{fin} de {total.toLocaleString('es-PE')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => irAPagina(pagina - 1)}
                disabled={pagina <= 1}
                className="border border-gray-300 p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <span>
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => irAPagina(pagina + 1)}
                disabled={pagina >= totalPaginas}
                className="border border-gray-300 p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
