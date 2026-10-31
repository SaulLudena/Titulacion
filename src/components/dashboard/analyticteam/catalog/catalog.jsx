import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import CatalogItem from './catalogitem'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const PAGE_SIZE = 6

// Clave donde se guardan búsqueda y filtros del catálogo
const STORAGE_KEY = 'catalog:filters'

const DOMINIOS = [
  'Clientes',
  'Originación',
  'Cartera y riesgo',
  'Garantías',
  'Cobranzas',
  'Buró externo',
  'Catálogos y parámetros',
]
const CLASIFICACIONES = ['Pública', 'Interna', 'Confidencial', 'Restringida']
const ESTADOS = ['Borrador', 'En revisión', 'Certificado', 'Deprecado']

// Normaliza texto para comparar sin importar mayúsculas, tildes, espacios o guiones bajos
// Ej: "En revisión" === "en_revision" === "EN REVISION"
const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

// Devuelve el texto de un campo que puede ser string u objeto ({ nombre, ... }).
// Ojo: typeof null === 'object', por eso se valida que no sea null.
const pickText = (field, keys = ['nombre'], fallback = '') => {
  if (field && typeof field === 'object') {
    for (const k of keys) if (field[k]) return field[k]
    return fallback
  }
  return field || fallback
}

const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('token') || sessionStorage.getItem('token')
    : null

const CATALOG_PAGE_SIZE = 100 // tamaño pedido por página; el backend puede recortarlo

const fetchCatalogPage = ({ q, pagina, tamano, token }) => {
  const params = new URLSearchParams()
  if (q) params.append('q', q)
  params.append('pagina', String(pagina))
  if (tamano) params.append('tamano', String(tamano))

  return fetch(`${API_BASE_URL}/api/catalogo?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

const listFrom = (data) =>
  Array.isArray(data) ? data : data.datasets || data.items || []

// Trae TODAS las páginas del catálogo y las junta en una sola lista.
// El backend responde { total, pagina, tamano, datasets } y entrega una página
// a la vez, así que hay que pedir las siguientes hasta cubrir el total.
const fetchAllDatasets = async (q, token) => {
  // Primera página con tamaño grande; si el backend lo rechaza, usa el por defecto
  let res = await fetchCatalogPage({
    q,
    pagina: 1,
    tamano: CATALOG_PAGE_SIZE,
    token,
  })
  if (!res.ok && (res.status === 400 || res.status === 422)) {
    res = await fetchCatalogPage({ q, pagina: 1, token })
  }
  if (!res.ok) throw new Error('No se pudo obtener el catálogo de datasets.')

  const first = await res.json()
  const items = [...listFrom(first)]
  if (Array.isArray(first)) return items

  const total = Number(first.total) || items.length
  const size = Number(first.tamano) || items.length || 1
  const totalPages = Math.min(Math.ceil(total / size), 50) // tope de seguridad

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        fetchCatalogPage({ q, pagina: i + 2, tamano: size, token }).then(
          (r) => {
            if (!r.ok)
              throw new Error('No se pudo obtener el catálogo de datasets.')
            return r.json()
          },
        ),
      ),
    )
    rest.forEach((d) => items.push(...listFrom(d)))
  }

  // Quitar duplicados por id, por si el backend repite alguno entre páginas
  const seen = new Set()
  return items.filter((it) => {
    const id = it.id || it.dataset_id
    if (!id) return true
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

// Lee los filtros guardados. Si algo falla o no es válido, devuelve vacíos.
// Las opciones se validan contra las listas actuales para no dejar un filtro
// "fantasma" que deje el catálogo sin resultados.
const readSavedFilters = () => {
  const empty = { searchTerm: '', dominio: '', clasificacion: '', estado: '' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const saved = JSON.parse(raw)
    return {
      searchTerm: typeof saved.searchTerm === 'string' ? saved.searchTerm : '',
      dominio: DOMINIOS.includes(saved.dominio) ? saved.dominio : '',
      clasificacion: CLASIFICACIONES.includes(saved.clasificacion)
        ? saved.clasificacion
        : '',
      estado: ESTADOS.includes(saved.estado) ? saved.estado : '',
    }
  } catch (e) {
    return empty
  }
}

// Genera la lista de páginas con elipsis: [1, '...', 4, 5, 6, '...', 12]
const buildPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (current >= total - 2)
    [total - 1, total - 2, total - 3].forEach((p) => pages.add(p))
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...')
    result.push(p)
  })
  return result
}

function FilterGroup({ title, name, options, selected, onChange, counts }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      <div className="space-y-2 text-xs">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name={name}
                checked={selected === option}
                // onChange no se dispara al re-clickear un radio ya marcado,
                // por eso el "desmarcar" se resuelve en onClick
                onChange={() => onChange(option)}
                onClick={() => {
                  if (selected === option) onChange('')
                }}
                className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
              />
              <span>{option}</span>
            </div>
            <span className="text-[11px] text-gray-400">
              {counts[normalize(option)] || 0}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = buildPageList(page, totalPages)

  const baseBtn =
    'min-w-[34px] h-8 px-2 text-xs border transition-colors cursor-pointer rounded-none'

  return (
    <nav
      className="flex items-center justify-center gap-1.5 pt-4"
      aria-label="Paginación del catálogo"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${baseBtn} border-gray-200 bg-white text-gray-700 hover:border-[#ea580c] hover:text-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700`}
      >
        Anterior
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${baseBtn} ${
              p === page
                ? 'bg-[#ea580c] border-[#ea580c] text-white font-semibold'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#ea580c] hover:text-[#ea580c]'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`${baseBtn} border-gray-200 bg-white text-gray-700 hover:border-[#ea580c] hover:text-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700`}
      >
        Siguiente
      </button>
    </nav>
  )
}

export default function Catalog() {
  const router = useRouter()
  const listTopRef = useRef(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros de la barra lateral
  const [selectedDominio, setSelectedDominio] = useState('')
  const [selectedClasificacion, setSelectedClasificacion] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')

  // Paginación
  const [page, setPage] = useState(1)

  // Indica que ya se leyeron los filtros guardados. Hasta entonces no se guarda
  // ni se consulta nada, para no pisar lo guardado con los valores vacíos
  // iniciales ni hacer una primera consulta sin el texto de búsqueda.
  const [filtersLoaded, setFiltersLoaded] = useState(false)

  // Restaurar búsqueda y filtros al montar (en useEffect porque en Next.js
  // localStorage no existe durante el render del servidor)
  useEffect(() => {
    const saved = readSavedFilters()
    setSearchTerm(saved.searchTerm)
    setSelectedDominio(saved.dominio)
    setSelectedClasificacion(saved.clasificacion)
    setSelectedEstado(saved.estado)
    setFiltersLoaded(true)
  }, [])

  // Guardar búsqueda y filtros cada vez que cambian
  useEffect(() => {
    if (!filtersLoaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          searchTerm,
          dominio: selectedDominio,
          clasificacion: selectedClasificacion,
          estado: selectedEstado,
        }),
      )
    } catch (e) {
      /* almacenamiento lleno o bloqueado: se ignora */
    }
  }, [
    filtersLoaded,
    searchTerm,
    selectedDominio,
    selectedClasificacion,
    selectedEstado,
  ])

  // Carga desde el backend. Solo se envía la búsqueda de texto (q);
  // los filtros laterales se aplican en el cliente para que funcionen siempre,
  // sin depender de cómo el backend formatee dominio/clasificación/estado.
  const fetchDatasetsFromBackend = async () => {
    setLoading(true)
    setError(null)

    const token = getToken()

    try {
      const rawList = await fetchAllDatasets(searchTerm.trim(), token)

      // Para ver qué trae el listado, descomenta:
      // console.log('Primer item del listado:', rawList[0])

      const formatted = rawList.map((item, index) => {
        const safeTitle = pickText(
          item.nombre,
          ['nombre'],
          item.nombre_negocio ||
            item.nombre_tecnico ||
            item.title ||
            `Dataset ${index + 1}`,
        )

        const safeCode = pickText(
          item.codigo,
          ['codigo'],
          item.nombre_tecnico || item.code || 'dataset_code',
        )

        const safeStatus = pickText(item.estado, ['nombre'], 'Certificado')

        const safeClassification = pickText(
          item.clasificacion,
          ['nombre', 'sugerida_ia'],
          'Sin clasificar',
        )

        const safeDescription = pickText(
          item.descripcion,
          ['nombre'],
          item.description || 'Sin descripción disponible.',
        )

        const safeDomain = pickText(
          item.dominio,
          ['nombre', 'codigo'],
          'Cobranzas',
        )

        // Acceso vigente, o solicitud aprobada con acceso vigente
        const hasActiveAccess =
          item.mi_acceso === 'vigente' ||
          item.hasAccess === true ||
          item.descarga?.disponible === true ||
          (item.solicitud?.estado === 'aprobada' &&
            item.solicitud?.estado_acceso === 'vigente')

        return {
          id: item.id || item.dataset_id,
          title: String(safeTitle),
          code: String(safeCode),
          status: String(safeStatus),
          classification: String(safeClassification),
          description: String(safeDescription),
          domain: String(safeDomain),
          author:
            item.autor ||
            item.owner?.nombre ||
            item.responsable ||
            'Sandra Valdivia Ponce',
          date: item.actualizado_en
            ? new Date(item.actualizado_en).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '30 sep 2026',
          hasAccess: hasActiveAccess,
          solicitud: item.solicitud || null,
          // Objeto { disponible, url, archivo, formato, ... }
          descarga: item.descarga || null,
        }
      })

      setDatasets(formatted)
    } catch (err) {
      console.error('Error al obtener datasets del backend:', err)
      setError('No se pudieron cargar los datasets del backend.')
    } finally {
      setLoading(false)
    }
  }

  // Búsqueda con debounce: solo depende del texto, no de los filtros.
  // Espera a que se hayan restaurado los filtros guardados.
  useEffect(() => {
    if (!filtersLoaded) return
    const timer = setTimeout(() => {
      fetchDatasetsFromBackend()
    }, 300)
    return () => clearTimeout(timer)
  }, [filtersLoaded, searchTerm])

  // Al cambiar búsqueda o cualquier filtro, volver a la primera página
  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedDominio, selectedClasificacion, selectedEstado])

  // Aplicación de filtros en el cliente
  const filteredDatasets = useMemo(() => {
    const dom = normalize(selectedDominio)
    const cla = normalize(selectedClasificacion)
    const est = normalize(selectedEstado)

    return datasets.filter(
      (d) =>
        (!dom || normalize(d.domain) === dom) &&
        (!cla || normalize(d.classification) === cla) &&
        (!est || normalize(d.status) === est),
    )
  }, [datasets, selectedDominio, selectedClasificacion, selectedEstado])

  // Contadores por opción (sobre el resultado de la búsqueda actual)
  const counts = useMemo(() => {
    const acc = { domain: {}, classification: {}, status: {} }
    datasets.forEach((d) => {
      const keys = {
        domain: normalize(d.domain),
        classification: normalize(d.classification),
        status: normalize(d.status),
      }
      Object.entries(keys).forEach(([group, key]) => {
        acc[group][key] = (acc[group][key] || 0) + 1
      })
    })
    return acc
  }, [datasets])

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredDatasets.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pageItems = filteredDatasets.slice(startIndex, startIndex + PAGE_SIZE)

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasActiveFilters =
    selectedDominio || selectedClasificacion || selectedEstado

  const clearFilters = () => {
    setSelectedDominio('')
    setSelectedClasificacion('')
    setSelectedEstado('')
  }

  return (
    <div className="space-y-6">
      {/* Cabecera superior */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Catálogo de datasets
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Busca por nombre, dominio, clasificación o estado. Accede a las URLs
          de tus datasets aprobados.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchDatasetsFromBackend()
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-none text-sm text-gray-900 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] bg-white shadow-sm"
            placeholder="Buscar datasets (ej. pagos de cuotas)..."
          />
        </div>
        <button
          onClick={fetchDatasetsFromBackend}
          className="px-6 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer"
        >
          {loading ? 'Cargando...' : 'Buscar'}
        </button>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Panel de filtros */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none p-5 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">Filtros</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-[#ea580c] hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <FilterGroup
            title="Dominio"
            name="dominioFilter"
            options={DOMINIOS}
            selected={selectedDominio}
            onChange={setSelectedDominio}
            counts={counts.domain}
          />

          <hr className="border-gray-100" />

          <FilterGroup
            title="Clasificación"
            name="clasificacionFilter"
            options={CLASIFICACIONES}
            selected={selectedClasificacion}
            onChange={setSelectedClasificacion}
            counts={counts.classification}
          />

          <hr className="border-gray-100" />

          <FilterGroup
            title="Estado"
            name="estadoFilter"
            options={ESTADOS}
            selected={selectedEstado}
            onChange={setSelectedEstado}
            counts={counts.status}
          />
        </div>

        {/* Listado */}
        <div ref={listTopRef} className="lg:col-span-3 space-y-3 scroll-mt-6">
          {!loading && !error && filteredDatasets.length > 0 && (
            <p className="text-xs text-gray-500">
              Mostrando {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, filteredDatasets.length)} de{' '}
              {filteredDatasets.length} datasets
            </p>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-xs text-gray-500">
              Cargando datasets desde el servidor...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600 text-center">
              {error}
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-xs text-gray-500 space-y-2">
              <p>No se encontraron datasets con estos criterios.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[#ea580c] hover:underline cursor-pointer"
                >
                  Quitar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {pageItems.map((item) => (
                <CatalogItem
                  key={item.id}
                  {...item}
                  onViewDetails={() =>
                    router.push(`/dashboard/analyticteam/${item.id}`)
                  }
                />
              ))}
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
