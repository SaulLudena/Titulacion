import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiDownload,
  HiArrowUp,
  HiArrowDown,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi'
import { apiFetch } from '../../../../libs/api'

const API = process.env.NEXT_PUBLIC_API_URL
const POR_PAGINA = 15

const iso = (d) => d.toISOString().slice(0, 10)
const hoy = new Date()
const INICIO_MES = iso(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
const FIN_MES = iso(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0))

const CATEGORIAS = [
  { value: 'todas', label: 'Todas las categorías' },
  { value: 'sobreutilizado', label: 'Sobreutilizados' },
  { value: 'normal', label: 'Normales' },
  { value: 'infrautilizado', label: 'Infrautilizados' },
]
const CAPAS = ['todas', 'bronce', 'plata', 'oro']

const fechaCorta = (f) => {
  if (!f) return 'Sin consultas'
  const d = new Date(`${f}T00:00:00`)
  return isNaN(d)
    ? f
    : d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

const construirQuery = (desde, hasta, extra = {}) => {
  const p = new URLSearchParams(extra)
  if (desde) p.set('desde', desde)
  if (hasta) p.set('hasta', hasta)
  return p.toString()
}

function Categoria({ valor }) {
  if (valor === 'sobreutilizado')
    return (
      <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] px-2.5 py-1 font-bold">
        <HiArrowUp className="w-3 h-3" /> Sobreutilizado
      </span>
    )
  if (valor === 'infrautilizado')
    return (
      <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] px-2.5 py-1 font-bold">
        <HiArrowDown className="w-3 h-3" /> Infrautilizado
      </span>
    )
  return (
    <span className="inline-flex items-center border border-gray-200 text-gray-600 text-[10px] px-2.5 py-1 font-medium bg-gray-50">
      Normal
    </span>
  )
}

export default function DatasetUsage() {
  const [desde, setDesde] = useState(INICIO_MES)
  const [hasta, setHasta] = useState(FIN_MES)
  const [datos, setDatos] = useState([])
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [capa, setCapa] = useState('todas')
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState(null)

  const consultar = useCallback(async (d, h) => {
    try {
      setCargando(true)
      setError(null)
      const qs = construirQuery(d, h)
      const r = await apiFetch(`/api/reportes/uso${qs ? `?${qs}` : ''}`)
      setDatos(Array.isArray(r) ? r : [])
      setPagina(1)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    consultar(INICIO_MES, FIN_MES)
  }, [consultar])

  const generar = () => consultar(desde, hasta)

  const usarMes = () => {
    setDesde(INICIO_MES)
    setHasta(FIN_MES)
    consultar(INICIO_MES, FIN_MES)
  }

  const usarAnio = () => {
    setDesde('')
    setHasta('')
    consultar('', '')
  }

  const descargar = async () => {
    try {
      setDescargando(true)
      setError(null)
      const res = await fetch(
        `${API}/api/reportes/uso?${construirQuery(desde, hasta, { formato: 'csv' })}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )
      if (res.status === 403) {
        window.location.href = '/dashboard/unauthorized'
        return
      }
      if (!res.ok) throw new Error(`Error ${res.status} al descargar`)
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = `uso_datasets_${desde || 'ultimos-365-dias'}_${hasta || ''}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setDescargando(false)
    }
  }

  const maximo = useMemo(
    () => Math.max(1, ...datos.map((d) => d.consultas_total ?? 0)),
    [datos],
  )

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase()
    return datos
      .filter((d) => {
        if (t && !d.nombre_tecnico.toLowerCase().includes(t)) return false
        if (categoria !== 'todas' && d.categoria !== categoria) return false
        if (capa !== 'todas' && d.capa !== capa) return false
        return true
      })
      .sort(
        (a, b) =>
          b.consultas_total - a.consultas_total ||
          a.nombre_tecnico.localeCompare(b.nombre_tecnico),
      )
  }, [datos, q, categoria, capa])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  const cambiar = (setter) => (e) => {
    setter(e.target.value)
    setPagina(1)
  }

  const resumen = useMemo(
    () => ({
      sobre: datos.filter((d) => d.categoria === 'sobreutilizado').length,
      infra: datos.filter((d) => d.categoria === 'infrautilizado').length,
      sinUso: datos.filter((d) => d.consultas_total === 0).length,
    }),
    [datos],
  )

  const sinFechas = !desde && !hasta
  const esMes = desde === INICIO_MES && hasta === FIN_MES

  const input =
    'border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c]'
  const atajo = (activo) =>
    `border font-bold py-1 px-2 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
      activo
        ? 'bg-black text-white border-black'
        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
    }`

  return (
    <div className="font-sans text-gray-900 w-full space-y-6">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-900">Uso de datasets</h1>
        <p className="text-xs text-gray-500 mt-1">
          Datasets ordenados por consultas en el catálogo y con el agente. No
          mide el uso fuera de la aplicación.
        </p>
      </div>

      {/* Periodo y acciones */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 w-full">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Periodo
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
                className={`${input} w-40`}
              />
              <span className="text-gray-400 text-xs">→</span>
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                className={`${input} w-40`}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={usarMes}
                disabled={cargando}
                className={atajo(esMes)}
              >
                Este mes
              </button>
              <button
                type="button"
                onClick={usarAnio}
                disabled={cargando}
                className={atajo(sinFechas)}
              >
                Últimos 365 días
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={descargar}
              disabled={descargando || cargando}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiDownload className="w-4 h-4 text-gray-600" />
              <span>{descargando ? 'Descargando...' : 'Descargar CSV'}</span>
            </button>
            <button
              onClick={generar}
              disabled={cargando}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-5 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{cargando ? 'Generando...' : 'Generar reporte'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {!cargando && datos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { t: 'Datasets', v: datos.length },
            { t: 'Sobreutilizados', v: resumen.sobre },
            { t: 'Infrautilizados', v: resumen.infra },
            { t: 'Sin ninguna consulta', v: resumen.sinUso },
          ].map((c) => (
            <div
              key={c.t}
              className="bg-white border border-gray-200 shadow-sm px-4 py-3 w-full"
            >
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                {c.t}
              </p>
              <p className="text-2xl font-bold mt-1">{c.v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros de la tabla */}
      <div className="flex flex-wrap gap-3 w-full">
        <input
          value={q}
          onChange={cambiar(setQ)}
          placeholder="Buscar dataset..."
          className={`${input} w-64`}
        />
        <select
          value={categoria}
          onChange={cambiar(setCategoria)}
          className={input}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={capa}
          onChange={cambiar(setCapa)}
          className={`${input} capitalize`}
        >
          {CAPAS.map((c) => (
            <option key={c} value={c}>
              {c === 'todas' ? 'Todas las capas' : c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-xs text-[#ea580c] border border-[#ea580c]/30 bg-[#ea580c]/5 px-3 py-2 w-full">
          {error}
        </p>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden w-full">
        {cargando && <p className="p-6 text-xs text-gray-500">Cargando...</p>}

        {!cargando && filtrados.length === 0 && (
          <p className="p-6 text-xs text-gray-500">
            No hay datasets con esos filtros.
          </p>
        )}

        {!cargando && filtrados.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50">
                  <th className="py-3 px-6">Dataset</th>
                  <th className="py-3 px-6 text-right">Consultas</th>
                  <th className="py-3 px-6 w-1/4"></th>
                  <th className="py-3 px-6 text-left">% del total</th>
                  <th className="py-3 px-6 text-left">Detalle</th>
                  <th className="py-3 px-6 text-center">Categoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibles.map((d) => (
                  <tr
                    key={d.dataset_id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900">
                          {d.nombre_tecnico}
                        </span>
                        <span className="border border-gray-300 text-gray-500 px-1.5 py-0.5 text-[10px] uppercase">
                          {d.capa}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {d.dominio}
                      </p>
                    </td>

                    <td className="py-3.5 px-6 text-right font-bold text-gray-900">
                      {d.consultas_total}
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="w-full bg-gray-100 h-2 overflow-hidden">
                        <div
                          className="bg-[#ea580c] h-full"
                          style={{
                            width: `${(d.consultas_total / maximo) * 100}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-gray-600 font-medium whitespace-nowrap">
                      {Number(d.porcentaje_del_total).toFixed(1)} %
                    </td>

                    <td className="py-3.5 px-6 text-[11px] text-gray-500 whitespace-nowrap">
                      <p>
                        {d.vistas} vistas · {d.citas_agente} agente ·{' '}
                        {d.solicitudes}{' '}
                        {d.solicitudes === 1 ? 'solicitud' : 'solicitudes'}
                      </p>
                      <p className="text-gray-400">
                        Última: {fechaCorta(d.ultima_consulta)}
                      </p>
                    </td>

                    <td className="py-3.5 px-6 text-center">
                      <Categoria valor={d.categoria} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!cargando && filtrados.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-xs text-gray-600 w-full">
            <span>
              Mostrando {inicio + 1}-
              {Math.min(inicio + POR_PAGINA, filtrados.length)} de{' '}
              {filtrados.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="border border-gray-300 p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <span>
                {paginaActual} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
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
