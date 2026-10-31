import React, { useEffect, useState, useMemo } from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import DetailCertify from '@/src/components/dashboard/executive/certifydataset/detailcertify'
import { apiFetch } from '../../../../src/libs/api'
import Head from 'next/head'

export default function CertifyDatasetPage() {
  const [datasets, setDatasets] = useState([])
  const [selectedDatasetId, setSelectedDatasetId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    apiFetch('/api/certificacion')
      .then((res) => {
        const dataList = Array.isArray(res)
          ? res
          : res.datasets || res.data || []
        setDatasets(dataList)
        if (dataList.length > 0) {
          const primerId = dataList[0].dataset_id || dataList[0].id
          setSelectedDatasetId(primerId)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  // Filtrado para el selector superior
  const datasetsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return datasets
    return datasets.filter((d) => {
      const nombre = d.dataset || d.nombre || d.nombre_tecnico || ''
      const owner = d.owner || d.responsable || d.data_owner || ''
      return (
        nombre.toLowerCase().includes(texto) ||
        owner.toLowerCase().includes(texto)
      )
    })
  }, [datasets, busqueda])

  return (
    <>
      <Head>
        <title>Banco Andino | Certificar Dataset</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <ExecutiveLayout>
        <div className="font-sans text-gray-900 max-w-6xl mx-auto space-y-6">
          {/* Título Principal similar al de Solicitudes */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Certificar dataset
          </h1>

          {/* SECCIÓN SUPERIOR: Panel de Selección y Filtro Rápido */}
          <div className="bg-white border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide mb-4 border-b border-gray-100 pb-2">
              Selección de Dataset para Certificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Buscar por nombre o responsable
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Escribe para filtrar..."
                  className="w-full border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Dataset disponible
                </label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  className="w-full border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#ea580c]"
                  disabled={cargando || datasets.length === 0}
                >
                  {datasets.length === 0 ? (
                    <option value="">No hay datasets disponibles</option>
                  ) : (
                    datasetsFiltrados.map((d) => {
                      const id = d.dataset_id || d.id
                      const nombre =
                        d.dataset ||
                        d.nombre ||
                        d.nombre_tecnico ||
                        'Dataset sin nombre'
                      const capaInfo = d.capa ? ` [Capa: ${d.capa}]` : ''
                      const estadoInfo = d.estado
                        ? ` (${d.estado.replace('_', ' ')})`
                        : ''
                      return (
                        <option key={id} value={id}>
                          {nombre}
                          {capaInfo}
                          {estadoInfo}
                        </option>
                      )
                    })
                  )}
                </select>
              </div>
            </div>
          </div>

          {cargando && (
            <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500 shadow-sm">
              Cargando listado de datasets...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600 shadow-sm">
              No se pudo cargar el listado ({error}).
            </div>
          )}

          {/* SECCIÓN INFERIOR: Carga dinámica del detalle con la misma estructura visual */}
          {!cargando && !error && (
            <div className="mt-4">
              {selectedDatasetId ? (
                <DetailCertify key={selectedDatasetId} id={selectedDatasetId} />
              ) : (
                <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500 shadow-sm">
                  Selecciona un dataset en el selector superior para ver y
                  evaluar sus metadatos.
                </div>
              )}
            </div>
          )}
        </div>
      </ExecutiveLayout>
    </>
  )
}
