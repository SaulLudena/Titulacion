import React from 'react'
import {
  HiDatabase,
  HiCheckCircle,
  HiLockClosed,
  HiKey,
  HiChevronRight,
  HiCheck,
  HiExternalLink,
  HiClipboardCopy,
  HiDownload,
} from 'react-icons/hi'

export default function ViewFile({ dataset, onBack, onRequestAccess }) {
  const [copied, setCopied] = React.useState(false)

  // Si no llega el dataset, mostramos un estado vacío defensivo en lugar de datos quemados
  if (!dataset) {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center text-xs text-gray-500">
        No hay información disponible para este dataset.
      </div>
    )
  }

  // Comprobamos si el acceso ya está vigente
  const hasAccess = dataset.hasAccess || dataset.mi_acceso === 'vigente'

  // Solicitud aprobada (acepta tanto el objeto crudo como el ya mapeado)
  const isApproved =
    dataset.solicitud?.estado === 'aprobada' ||
    dataset.requestStatus === 'aprobada' ||
    hasAccess

  // URL de descarga: soporta el dataset mapeado (datasetUrl) y la respuesta cruda (descarga.url)
  const downloadUrl = dataset.datasetUrl || dataset.descarga?.url || null
  const downloadAvailable = dataset.descarga?.disponible !== false

  // El botón solo se activa si está aprobado/vigente y existe una URL
  const canDownload = isApproved && downloadAvailable && Boolean(downloadUrl)

  // Formateador para capitalizar textos como la clasificación (ej. "restringida" -> "Restringida")
  const formatClassification = (text) => {
    if (!text) return 'Restringida'
    const cleanText =
      typeof text === 'object' ? text.nombre || 'Restringida' : String(text)
    return cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase()
  }

  const handleCopyUrl = () => {
    if (downloadUrl) {
      navigator.clipboard.writeText(downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Breadcrumb / Migaja de pan */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={onBack}
          className="hover:text-[#ea580c] hover:underline cursor-pointer transition-colors"
        >
          Catálogo
        </button>
        <HiChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{dataset.code}</span>
      </nav>

      {/* Header del Dataset */}
      <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-[#ea580c] flex items-center justify-center rounded-none text-2xl shrink-0">
            <HiDatabase />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {dataset.title}
              </h1>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 border border-gray-200 rounded-none">
                {dataset.code}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-none">
                <HiCheckCircle className="w-3.5 h-3.5 text-amber-600" />
                {dataset.status}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none">
                <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
                {formatClassification(dataset.classification)}
              </span>
            </div>
          </div>
        </div>

        {/* Solicitud de acceso vs Acceso vigente + Descargar */}
        {hasAccess ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-none">
              <HiCheck className="w-4 h-4 text-emerald-600" />
              <span>Acceso Vigente</span>
            </div>

            {canDownload ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer"
              >
                <HiDownload className="w-4 h-4" />
                <span>Descargar</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="La URL de descarga no está disponible"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-400 text-xs font-semibold rounded-none cursor-not-allowed"
              >
                <HiDownload className="w-4 h-4" />
                <span>Descargar</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onRequestAccess}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <HiKey className="w-4 h-4" />
            <span>Solicitar acceso</span>
          </button>
        )}
      </div>

      {/* URL del Dataset Crudo (visible si tiene acceso y URL disponible) */}
      {hasAccess && downloadUrl && (
        <div className="bg-emerald-50/60 border border-emerald-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5 overflow-hidden">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              URL del Dataset Crudo Aprobado:
            </span>
            <span className="text-xs font-mono text-emerald-950 break-all">
              {downloadUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-none transition-colors cursor-pointer"
            >
              <HiClipboardCopy className="w-3.5 h-3.5" />
              <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
            </button>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-none transition-colors cursor-pointer"
            >
              <span>Abrir</span>
              <HiExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Contenido de 2 columnas: Detalles e Información Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Columna Izquierda: Descripción y Esquema de Datos */}
        <div className="lg:col-span-3 space-y-6">
          {/* Bloque Descripción */}
          <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Descripción
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {dataset.description}
            </p>
          </div>

          {/* Bloque Esquema */}
          <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Esquema</h3>
              <span className="text-xs text-gray-400 font-medium">
                {dataset.columns?.length || 0} columnas
              </span>
            </div>

            {/* Tabla de columnas */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Columna</th>
                    <th className="py-2.5 px-3 font-bold">Tipo</th>
                    <th className="py-2.5 px-3 font-bold">Clave</th>
                    <th className="py-2.5 px-3 font-bold">Descripción</th>
                    <th className="py-2.5 px-3 font-bold">Dato Personal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {dataset.columns && dataset.columns.length > 0 ? (
                    dataset.columns.map((col, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">
                          {col.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600">
                          {col.type}
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-500">
                          {col.key || '—'}
                        </td>
                        <td className="py-3 px-3 text-gray-700">
                          {col.description || '—'}
                        </td>
                        <td className="py-3 px-3 text-gray-500">
                          {col.personalData || 'No'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-400"
                      >
                        No hay columnas registradas en el esquema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Datos Generales del Dataset */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none p-6 shadow-sm space-y-5 text-xs">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            Datos del dataset
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-gray-400 block mb-1">Fuente</span>
              <p className="font-medium text-gray-900">
                {dataset.metadata?.source || 'Base corporativa'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Ruta de origen</span>
              <p className="font-mono text-[11px] text-gray-700 break-all">
                {dataset.metadata?.originPath || 'schema / table'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Dominio</span>
              <p className="font-medium text-gray-900">
                {dataset.metadata?.domain || 'Cobranzas'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Data Owner</span>
              <p className="font-medium text-gray-900">
                {dataset.metadata?.owner || 'Sandra Valdivia Ponce'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Clasificación</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none mt-0.5">
                <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
                {formatClassification(dataset.classification)}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Vigencia</span>
              <p className="font-medium text-gray-900">
                {dataset.metadata?.validity || 'Vigente'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">
                Última actualización
              </span>
              <p className="font-medium text-gray-900">
                {dataset.metadata?.lastUpdate || 'Reciente'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Linaje</span>
              <p className="font-mono text-[11px] text-gray-700">
                {dataset.metadata?.lineage || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
