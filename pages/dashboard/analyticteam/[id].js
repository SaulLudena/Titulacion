import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Viewfile from '@/src/components/dashboard/analyticteam/catalog/viewFile'
import AnalyticTeamLayout from '@/src/components/dashboard/analyticteam/analyticteamlayout'
import Head from 'next/head'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Etiquetas legibles para el estado del dataset
const ESTADOS_LABEL = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  certificado: 'Certificado',
  deprecado: 'Deprecado',
}

export default function Viewfilepage() {
  const router = useRouter()
  const { id } = router.query

  const [datasetData, setDatasetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id || id === 'mis-solicitudes' || Array.isArray(id)) {
      setLoading(false)
      return
    }

    const fetchDataset = async () => {
      setLoading(true)
      setError(null)

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || sessionStorage.getItem('token')
          : null

      try {
        const response = await fetch(`${API_BASE_URL}/api/datasets/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!response.ok) {
          throw new Error('No se pudo obtener el detalle del dataset.')
        }

        const result = await response.json()

        // Para depurar, descomenta:
        // console.log('descarga:', result.descarga)

        // Mapeo defensivo basado en el JSON real de tu API
        const safeOwner =
          typeof result.owner === 'object'
            ? result.owner?.nombre
              ? `${result.owner.nombre} · ${result.owner.area || ''}`
              : 'Propietario no asignado'
            : result.owner || 'Propietario no asignado'

        const safeDomain =
          typeof result.dominio === 'object'
            ? result.dominio?.nombre
            : result.dominio || 'General'

        const safeSource =
          typeof result.fuente === 'object'
            ? result.fuente?.nombre
            : result.fuente || 'Base corporativa'

        const safeClassification =
          typeof result.clasificacion === 'object'
            ? result.clasificacion?.nombre || result.clasificacion?.sugerida_ia
            : result.clasificacion || 'Restringida'

        // Mapeo de la lista de columnas (esquema)
        const rawColumns = result.columnas || result.columns || []
        const formattedColumns = rawColumns.map((col) => {
          let keyType = '—'
          if (col.es_clave_primaria) keyType = 'PK'
          else if (col.es_clave_foranea) keyType = 'FK'

          return {
            name: col.nombre,
            type: col.tipo_dato,
            key: keyType,
            description: col.descripcion || '—',
            personalData: col.es_dato_personal ? 'Sí' : 'No',
          }
        })

        // Acceso vigente
        const hasActiveAccess =
          result.mi_acceso === 'vigente' || result.hasAccess === true

        // La URL firmada viene en result.descarga.url
        const datasetUrl = result.descarga?.url ?? null

        const formatted = {
          id: result.id || id,
          title: result.nombre_negocio || result.nombre_tecnico || 'Dataset',
          code: result.nombre_tecnico || 'codigo',
          status: ESTADOS_LABEL[result.estado] || result.estado || 'Borrador',

          classification: safeClassification,
          description: result.descripcion || 'Sin descripción disponible.',
          columns: formattedColumns,
          hasAccess: hasActiveAccess,
          mi_acceso: result.mi_acceso,

          // Datos de descarga
          datasetUrl: datasetUrl,
          descarga: result.descarga ?? null,
          solicitud: result.solicitud ?? null,

          metadata: {
            source: safeSource,
            originPath: `${result.capa || 'gold'} / ${result.esquema_origen || 'schema'} / ${result.nombre_tecnico || 'tabla'}`,
            domain: safeDomain,
            owner: safeOwner,
            validity: result.frecuencia_sla
              ? `Actualización ${result.frecuencia_sla}`
              : 'Vigente',
            lastUpdate: result.perfil?.ultima_actualizacion_en
              ? new Date(
                  result.perfil.ultima_actualizacion_en,
                ).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Reciente',
            lineage:
              result.linaje?.origen?.map((o) => o.nombre).join(' + ') ||
              'Origen primario',
          },
        }

        setDatasetData(formatted)
      } catch (err) {
        console.error('Error al cargar dataset:', err)
        setError('Error al conectar con el servidor.')
      } finally {
        setLoading(false)
      }
    }

    fetchDataset()
  }, [id])

  return (
    <>
      <Head>
        <title>Banco Andino | Ficha Dataset</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <AnalyticTeamLayout>
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white border border-gray-200 p-12 text-center text-xs text-gray-500">
              Cargando detalles del dataset desde el servidor...
            </div>
          ) : error || !datasetData ? (
            <div className="bg-red-50 border border-red-200 p-6 text-xs text-red-600 text-center">
              {error || 'No se encontró información para este dataset.'}
            </div>
          ) : (
            <Viewfile
              dataset={datasetData}
              onBack={() => router.push('/dashboard/analyticteam')}
              onRequestAccess={() =>
                router.push(
                  `/dashboard/analyticteam/newrequest?dataset_id=${datasetData.id || datasetData.dataset_id}`,
                )
              }
            />
          )}
        </div>
      </AnalyticTeamLayout>
    </>
  )
}
