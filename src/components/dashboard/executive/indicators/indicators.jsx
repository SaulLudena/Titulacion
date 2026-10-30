import React, { useEffect, useState } from 'react'
import { apiFetch } from '../../../../libs/api'

const redondear = (n) => Math.round(n * 10) / 10

const formatear = (ind) => {
  if (!ind || ind.valor == null) return '—'
  const n = redondear(ind.valor)
  if (ind.unidad === 'porcentaje') return `${n}%`
  if (ind.unidad === 'horas') return `${n}h`
  return String(n)
}

const formatearMeta = (ind) => {
  if (ind.meta == null) return '—'
  const signo = ind.sentido === 'menor_mejor' ? '≤' : '≥'
  const u =
    ind.unidad === 'porcentaje' ? '%' : ind.unidad === 'horas' ? 'h' : ''
  return `${signo} ${redondear(ind.meta)}${u}`
}

const AMBITOS = [
  { clave: 'criterio', titulo: 'Criterios de aceptación' },
  { clave: 'objetivo', titulo: 'Objetivos' },
  { clave: 'tecnica', titulo: 'Pruebas técnicas' },
  { clave: 'gobierno', titulo: 'Gobierno' },
]

const SERIES = [
  { codigo: 'GOB-03', nombre: 'Datasets certificados', color: '#ea580c' },
  {
    codigo: 'GOB-02',
    nombre: 'Metadatos obligatorios completos',
    color: '#000000',
  },
]

// Las series pueden venir como arreglo o dentro de una propiedad
const puntosDe = (d) => {
  let arr = []
  if (Array.isArray(d)) arr = d
  else
    for (const k of ['serie', 'puntos', 'series', 'data', 'items']) {
      if (Array.isArray(d?.[k])) {
        arr = d[k]
        break
      }
    }
  return arr
    .map((p) => ({
      fecha: String(p.fecha ?? p.dia ?? p.fecha_corte ?? p.periodo ?? ''),
      valor: p.valor == null ? null : Number(p.valor),
    }))
    .filter((p) => p.fecha)
}

const etiquetaFecha = (f) => {
  const dt = new Date(f.length <= 10 ? `${f}T00:00:00` : f)
  return isNaN(dt)
    ? f
    : dt.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

function Grafico({ series }) {
  const W = 800
  const H = 260
  const M = { t: 16, r: 24, b: 32, l: 36 }

  const fechas = [
    ...new Set(series.flatMap((s) => s.puntos.map((p) => p.fecha))),
  ].sort()
  const todos = series
    .flatMap((s) => s.puntos.map((p) => p.valor))
    .filter((v) => v != null)

  if (fechas.length === 0) {
    return (
      <p className="text-xs text-gray-500 py-10 text-center">
        Aún no hay datos de evolución.
      </p>
    )
  }

  const ymax = Math.max(100, ...todos)
  const x = (i) =>
    M.l +
    (fechas.length === 1
      ? (W - M.l - M.r) / 2
      : (i * (W - M.l - M.r)) / (fechas.length - 1))
  const y = (v) => M.t + (1 - v / ymax) * (H - M.t - M.b)
  const guias = [0, 25, 50, 75, 100].map((p) => (p / 100) * ymax)
  const paso = Math.ceil(fechas.length / 6)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {guias.map((g) => (
        <g key={g}>
          <line x1={M.l} x2={W - M.r} y1={y(g)} y2={y(g)} stroke="#f1f1f1" />
          <text
            x={M.l - 8}
            y={y(g) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#b5b5b5"
          >
            {Math.round(g)}
          </text>
        </g>
      ))}

      {fechas.map(
        (f, i) =>
          i % paso === 0 && (
            <text
              key={f}
              x={x(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#9ca3af"
            >
              {etiquetaFecha(f)}
            </text>
          ),
      )}

      {series.map((s) => {
        const pts = fechas
          .map((f, i) => {
            const p = s.puntos.find((q) => q.fecha === f)
            return p && p.valor != null ? { f, i, v: p.valor } : null
          })
          .filter(Boolean)

        return (
          <g key={s.codigo}>
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              points={pts.map((p) => `${x(p.i)},${y(p.v)}`).join(' ')}
            />
            {pts.map((p) => (
              <circle
                key={p.f}
                cx={x(p.i)}
                cy={y(p.v)}
                r="4"
                fill="white"
                stroke={s.color}
                strokeWidth="2"
              >
                <title>{`${s.nombre}: ${redondear(p.v)}% (${etiquetaFecha(p.f)})`}</title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function Estado({ ind }) {
  if (ind.cumple === true)
    return (
      <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-bold uppercase">
        Cumple
      </span>
    )
  if (ind.cumple === false)
    return (
      <span className="bg-[#ea580c] text-white px-1.5 py-0.5 text-[10px] font-bold uppercase">
        No cumple
      </span>
    )
  return (
    <span className="border border-gray-300 text-gray-500 px-1.5 py-0.5 text-[10px] font-bold uppercase">
      {ind.meta == null ? 'Sin meta' : 'Sin datos'}
    </span>
  )
}

export default function Indicators() {
  const [tablero, setTablero] = useState(null)
  const [series, setSeries] = useState(
    SERIES.map((s) => ({ ...s, puntos: [] })),
  )
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/tablero'),
      // si una serie falla, el resto de la pantalla sigue funcionando
      ...SERIES.map((s) =>
        apiFetch(`/api/tablero/series/${s.codigo}`).catch(() => null),
      ),
    ])
      .then(([t, ...resp]) => {
        setTablero(t)
        setSeries(SERIES.map((s, i) => ({ ...s, puntos: puntosDe(resp[i]) })))
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p className="text-xs text-gray-500">Cargando...</p>
  if (!tablero)
    return (
      <p className="text-xs text-[#ea580c]">
        No se pudo cargar los indicadores ({error}).
      </p>
    )

  const inds = tablero.indicadores ?? []
  const porCodigo = (c) => inds.find((i) => i.codigo === c)

  const tarjetas = [
    {
      titulo: 'Datasets catalogados',
      valor: tablero.datasets_catalogados ?? '—',
      variante: 'dark',
    },
    { titulo: 'Con responsable', valor: formatear(porCodigo('GOB-01')) },
    { titulo: 'Certificados', valor: formatear(porCodigo('GOB-03')) },
    {
      titulo: 'Solicitudes pendientes',
      valor: tablero.solicitudes_pendientes ?? '—',
      variante: 'orange',
    },
    {
      titulo: 'Tiempo medio de atención',
      valor: formatear(porCodigo('GOB-04')),
    },
  ]

  return (
    <div className="font-sans text-gray-900 max-w-7xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Indicadores de gobierno
      </h1>

      {error && (
        <p className="text-xs text-[#ea580c] border border-[#ea580c]/30 bg-[#ea580c]/5 px-3 py-2">
          {error}
        </p>
      )}

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tarjetas.map((t) => {
          const bg =
            t.variante === 'dark'
              ? 'bg-black text-white'
              : t.variante === 'orange'
                ? 'bg-[#ea580c] text-white'
                : 'bg-white text-gray-900 border border-gray-200'
          const sub =
            t.variante === 'dark'
              ? 'text-gray-400'
              : t.variante === 'orange'
                ? 'text-orange-100'
                : 'text-gray-500'
          return (
            <div
              key={t.titulo}
              className={`${bg} p-5 shadow-sm flex flex-col justify-between`}
            >
              <p
                className={`text-[11px] font-medium uppercase tracking-wider ${sub}`}
              >
                {t.titulo}
              </p>
              <p className="text-3xl font-bold mt-4 tracking-tight">
                {t.valor}
              </p>
            </div>
          )
        })}
      </div>

      {/* Evolución */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900">Evolución</h2>
          <p className="text-[11px] text-gray-500">% sobre datasets activos</p>
        </div>

        <Grafico series={series} />

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 text-xs mt-2">
          {series.map((s) => (
            <div key={s.codigo} className="flex items-center gap-2">
              <span
                className="w-3 h-3 inline-block"
                style={{ background: s.color }}
              />
              <span className="text-gray-600 font-medium">{s.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle de todos los indicadores */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-gray-900">
          Detalle de indicadores
        </h2>

        {AMBITOS.map(({ clave, titulo }) => {
          const grupo = inds.filter((i) => i.ambito === clave)
          if (grupo.length === 0) return null
          return (
            <div key={clave}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                {titulo}
              </p>
              <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="px-4 py-3 font-bold">Código</th>
                      <th className="px-4 py-3 font-bold">Indicador</th>
                      <th className="px-4 py-3 font-bold text-right">Valor</th>
                      <th className="px-4 py-3 font-bold text-right">Meta</th>
                      <th className="px-4 py-3 font-bold text-right">
                        Detalle
                      </th>
                      <th className="px-4 py-3 font-bold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grupo.map((i) => (
                      <tr key={i.codigo} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">
                          {i.codigo}
                        </td>
                        <td className="px-4 py-3">
                          {i.nombre}
                          {i.referencia_informe && (
                            <span className="block text-[11px] text-gray-400">
                              {i.referencia_informe}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                          {formatear(i)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">
                          {formatearMeta(i)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                          {i.denominador
                            ? `${redondear(i.numerador)} de ${i.denominador}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Estado ind={i} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
