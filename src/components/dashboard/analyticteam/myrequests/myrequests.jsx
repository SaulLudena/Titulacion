import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { HiClock, HiCheckCircle, HiXCircle, HiPlus } from 'react-icons/hi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function MyRequests({ requests = [], onNewRequest }) {
  const router = useRouter()
  const [apiRequests, setApiRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    // Si ya recibimos datos explícitos por props, no consultamos la API
    if (requests && requests.length > 0) {
      setApiRequests(requests)
      setLoading(false)
      return
    }

    const fetchRequestsFromBackend = async () => {
      setLoading(true)
      setError(null)

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || sessionStorage.getItem('token')
          : null

      try {
        const response = await fetch(`${API_BASE_URL}/api/solicitudes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!response.ok) {
          throw new Error(
            'No se pudieron obtener las solicitudes del servidor.',
          )
        }

        const data = await response.json()
        console.log('data', data)
        if (!isMounted) return

        const rawList = Array.isArray(data)
          ? data
          : data.solicitudes || data.items || data.data || []

        const formatted = rawList.map((item, index) => {
          const estadoStr = String(
            item.estado || item.estado_texto || item.status || 'pendiente',
          ).toLowerCase()

          let type = 'pending-owner'
          if (estadoStr.includes('aprobada')) type = 'approved'
          else if (estadoStr.includes('rechazada')) type = 'rejected'
          else if (estadoStr.includes('cumplimiento'))
            type = 'pending-compliance'

          return {
            id: item.id || item.solicitud_id || index,
            dataset:
              item.dataset ||
              item.dataset_nombre ||
              item.nombre_dataset ||
              'Dataset',
            status: item.estado_texto || item.estado || 'Pendiente',
            statusType: type,
            sentDate:
              item.creada_en || item.fecha
                ? new Date(item.creada_en || item.fecha).toLocaleDateString(
                    'es-ES',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )
                : 'Reciente',
            permission: `${item.permiso || 'Lectura'} · ${item.vigencia_solicitada_dias || item.vigencia_dias || 90} d`,
            response:
              item.respuesta_texto ||
              item.justificacion ||
              item.comentario ||
              'En proceso de revisión',
          }
        })

        setApiRequests(formatted)
      } catch (err) {
        console.error('Error al cargar solicitudes:', err)
        if (isMounted) {
          setError(
            'No se pudo conectar con el servidor para obtener las solicitudes.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRequestsFromBackend()

    return () => {
      isMounted = false
    }
  }, []) // Arreglo de dependencias vacío para ejecutarse una sola vez al montar el componente

  // Fallback estático solo si la API no devuelve ningún dato y no vino prop
  const fallbackList = [
    {
      id: 1,
      dataset: 'deudor',
      status: 'Pendiente · Data Owner',
      statusType: 'pending-owner',
      sentDate: '24 sep 2026',
      permission: 'Lectura · 90 d',
      response: 'Esperando al Data Owner',
    },
    {
      id: 2,
      dataset: 'TB_CLIENTE',
      status: 'Pendiente · Cumplimiento',
      statusType: 'pending-compliance',
      sentDate: '25 sep 2026',
      permission: 'Lectura · 90 d',
      response: 'Aprobada por el Data Owner; falta Cumplimiento',
    },
    {
      id: 3,
      dataset: 'cuota',
      status: 'Aprobada',
      statusType: 'approved',
      sentDate: '6 sep 2026',
      permission: 'Lectura · 180 d',
      response: 'Acceso hasta el 5 mar 2027',
    },
    {
      id: 4,
      dataset: 'pago_2023_mig',
      status: 'Rechazada',
      statusType: 'rejected',
      sentDate: '12 sep 2026',
      permission: 'Lectura · 180 d',
      response: '«Dataset sin responsable; usa pago»',
    },
  ]

  const dataList =
    requests.length > 0
      ? requests
      : apiRequests.length > 0
        ? apiRequests
        : fallbackList

  // Renderizado dinámico de badges
  const renderStatusBadge = (status, type) => {
    switch (type) {
      case 'pending-owner':
      case 'pending-compliance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-orange-800 bg-orange-50 border border-orange-300 rounded-none">
            <HiClock className="w-3.5 h-3.5 text-orange-600" />
            {status}
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-orange-600 rounded-none">
            <HiCheckCircle className="w-3.5 h-3.5 text-white" />
            {status}
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-black rounded-none">
            <HiXCircle className="w-3.5 h-3.5 text-white" />
            {status}
          </span>
        )
      default:
        return <span className="text-xs text-gray-700">{status}</span>
    }
  }

  const handleNewRequestClick = () => {
    if (onNewRequest) {
      onNewRequest()
    } else {
      router.push('/dashboard/analyticteam/newrequest')
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Mis solicitudes
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Estado de tus solicitudes de acceso.
          </p>
        </div>

        <button
          onClick={handleNewRequestClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <HiPlus className="w-4 h-4 font-bold" />
          <span>Nueva solicitud</span>
        </button>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Cargando solicitudes desde el servidor...
          </div>
        ) : error ? (
          <div className="p-6 text-xs text-red-600 bg-red-50 text-center">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/70 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Dataset</th>
                  <th className="py-3 px-4 font-bold">Estado</th>
                  <th className="py-3 px-4 font-bold">Enviada</th>
                  <th className="py-3 px-4 font-bold">Permiso · Vigencia</th>
                  <th className="py-3 px-4 font-bold">Respuesta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans">
                {dataList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {item.dataset}
                    </td>
                    <td className="py-4 px-4">
                      {renderStatusBadge(item.status, item.statusType)}
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-medium">
                      {item.sentDate}
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-medium">
                      {item.permission}
                    </td>
                    <td className="py-4 px-4 text-gray-600 italic">
                      {item.response}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
