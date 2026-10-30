import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { HiChevronRight, HiChevronLeft } from 'react-icons/hi'
import { apiFetch } from '@/src/lib/api'

const POR_PAGINA = 15

const ESTADOS = [
  { value: 'por_revisar', label: 'Por revisar' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'certificado', label: 'Certificados' },
  { value: 'todos', label: 'Todos' },
]
const CAPAS = ['todas', 'bronce', 'plata', 'oro']

export default function CertifyDataset() {
  const [datasets, setDatasets] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [q, setQ] = useState('')
  const [capa, setCapa] = useState('todas')
  const [estado, setEstado] = useState('por_revisar')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    apiFetch('/api/certificacion')
      .then(setDatasets)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase()
    return datasets
      .filter((d) => {
        if (texto && !d.dataset.toLowerCase().includes(texto)) return false
        if (capa !== 'todas' && d.capa !== capa) return false
        if (estado === 'por_revisar') return d.estado !== 'certificado'
        if (estado !== 'todos') return d.estado === estado
        return true
      })
      .sort(
        (a, b) => a.cantidad - b.cantidad || a.dataset.localeCompare(b.dataset),
      )
  }, [datasets, q, capa, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA)

  const cambiar = (setter) => (e) => {
    setter(e.target.value)
    setPagina(1)
  }

  return (
    <div className="font-sans text-gray-900 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Certificar dataset
      </h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={q}
          onChange={cambiar(setQ)}
          placeholder="Buscar dataset..."
          className="border border-gray-200 bg-white px-3 py-2 text-xs w-64 focus:outline-none focus:border-[#ea580c]"
        />
        <select
          value={capa}
          onChange={cambiar(setCapa)}
          className="border border-gray-200 bg-white px-3 py-2 text-xs capitalize focus:outline-none focus:border-[#ea580c]"
        >
          {CAPAS.map((c) => (
            <option key={c} value={c}>
              {c === 'todas' ? 'Todas las capas' : c}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={cambiar(setEstado)}
          className="border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#ea580c]"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        {cargando && <p className="p-6 text-xs text-gray-500">Cargando...</p>}

        {error && (
          <p className="p-6 text-xs text-[#ea580c]">
            No se pudo cargar el listado ({error}).
          </p>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <p className="p-6 text-xs text-gray-500">
            No hay datasets con esos filtros.
          </p>
        )}

        <ul className="divide-y divide-gray-100">
          {visibles.map((d) => (
            <li key={d.dataset_id}>
              <Link
                href={`/dashboard/executive/certifydataset/${d.dataset_id}`}
                className="flex items-center justify-between px-6 py-3.5 text-xs hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900">
                    {d.dataset}
                  </span>
                  <span className="border border-gray-300 text-gray-600 px-1.5 py-0.5 text-[10px] uppercase">
                    {d.capa}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-gray-500 capitalize">
                    {d.estado.replace('_', ' ')}
                  </span>
                  {d.estado === 'certificado' ? (
                    <span className="text-gray-400">Completo</span>
                  ) : (
                    <span className="text-[#ea580c] font-semibold">
                      {d.cantidad}{' '}
                      {d.cantidad === 1 ? 'pendiente' : 'pendientes'}
                    </span>
                  )}
                  <HiChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {filtrados.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-xs text-gray-600">
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
