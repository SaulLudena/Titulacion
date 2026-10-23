import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CatalogItem from './catalogitem'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function Catalog() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para filtros avanzados de la barra lateral
  const [selectedDominio, setSelectedDominio] = useState('')
  const [selectedClasificacion, setSelectedClasificacion] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')

  // Carga real desde el endpoint GET /api/catalogo usando los query params de Postman
  const fetchDatasetsFromBackend = async () => {
    setLoading(true)
    setError(null)

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null

    try {
      // Construcción de parámetros basada en la colección de Postman
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('q', searchTerm.trim())
      if (selectedDominio) params.append('dominio', selectedDominio)
      if (selectedClasificacion)
        params.append('clasificacion', selectedClasificacion.toLowerCase())
      if (selectedEstado) params.append('estado', selectedEstado.toLowerCase())

      const response = await fetch(
        `${API_BASE_URL}/api/catalogo?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      if (!response.ok) {
        throw new Error('No se pudo obtener el catálogo de datasets.')
      }

      const data = await response.json()
      const rawList = Array.isArray(data)
        ? data
        : data.datasets || data.items || []

      const formatted = rawList.map((item, index) => {
        console.log('item crudo del backend', item)
        const safeTitle =
          typeof item.nombre === 'object'
            ? item.nombre?.nombre
            : item.nombre ||
              item.nombre_negocio ||
              item.title ||
              `Dataset ${index + 1}`

        const safeCode =
          typeof item.codigo === 'object'
            ? item.codigo?.codigo
            : item.codigo || item.nombre_tecnico || item.code || 'dataset_code'

        const safeStatus =
          typeof item.estado === 'object'
            ? item.estado?.nombre
            : item.estado || 'Certificado'

        const safeClassification =
          typeof item.clasificacion === 'object'
            ? item.clasificacion?.nombre || item.clasificacion?.sugerida_ia
            : item.clasificacion || 'Confidencial'

        const safeDescription =
          typeof item.descripcion === 'object'
            ? item.descripcion?.nombre
            : item.descripcion ||
              item.description ||
              'Sin descripción disponible.'

        const safeDomain =
          typeof item.dominio === 'object'
            ? item.dominio?.nombre || item.dominio?.codigo || 'Cobranzas'
            : item.dominio || 'Cobranzas'

        // Determinamos si el acceso es vigente según la propiedad 'mi_acceso' del backend
        const hasActiveAccess =
          item.mi_acceso === 'vigente' || item.hasAccess === true

        // Extracción segura de la URL del dataset crudo o generación automática si el acceso es vigente
        const datasetUrl =
          item.url_dataset ||
          item.dataset_url ||
          item.url_crudo ||
          item.endpoint_url ||
          (hasActiveAccess
            ? `${API_BASE_URL}/api/datasets/${item.id || item.dataset_id}/data`
            : null)

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
          datasetUrl: datasetUrl, // <- URL enviada al item del catálogo
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

  // Ejecutar búsqueda al cambiar filtros o montar componente
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDatasetsFromBackend()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedDominio, selectedClasificacion, selectedEstado])

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

      {/* Barra de Búsqueda Superior */}
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

      {/* Layout principal: Filtros a la izquierda y Listado a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Panel de Filtros Izquierdo */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none p-5 space-y-6">
          {/* Dominio */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Dominio
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Clientes' },
                { name: 'Originación' },
                { name: 'Cartera y riesgo' },
                { name: 'Garantías' },
                { name: 'Cobranzas' },
                { name: 'Buró externo' },
                { name: 'Catálogos y parámetros' },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dominioFilter"
                      checked={selectedDominio === item.name}
                      onChange={() =>
                        setSelectedDominio(
                          selectedDominio === item.name ? '' : item.name,
                        )
                      }
                      className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                    />
                    <span>{item.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Clasificación */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Clasificación
            </h4>
            <div className="space-y-2 text-xs">
              {['Pública', 'Interna', 'Confidencial', 'Restringida'].map(
                (name, idx) => (
                  <label
                    key={idx}
                    className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="clasificacionFilter"
                        checked={selectedClasificacion === name}
                        onChange={() =>
                          setSelectedClasificacion(
                            selectedClasificacion === name ? '' : name,
                          )
                        }
                        className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                      />
                      <span>{name}</span>
                    </div>
                  </label>
                ),
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Estado */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Estado
            </h4>
            <div className="space-y-2 text-xs">
              {['Borrador', 'En revisión', 'Certificado', 'Deprecado'].map(
                (name, idx) => (
                  <label
                    key={idx}
                    className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="estadoFilter"
                        checked={selectedEstado === name}
                        onChange={() =>
                          setSelectedEstado(selectedEstado === name ? '' : name)
                        }
                        className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                      />
                      <span>{name}</span>
                    </div>
                  </label>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Listado de Tarjetas a la Derecha */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-xs text-gray-500">
              Cargando datasets desde el servidor...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600 text-center">
              {error}
            </div>
          ) : datasets.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-xs text-gray-500">
              No se encontraron datasets que coincidan con la búsqueda.
            </div>
          ) : (
            datasets.map((item) => (
              <CatalogItem
                key={item.id}
                {...item}
                onViewDetails={() =>
                  router.push(`/dashboard/analyticteam/${item.id}`)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
