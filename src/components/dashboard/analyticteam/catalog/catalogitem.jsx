import React, { useState } from 'react'
import { useRouter } from 'next/router'
import {
  HiCheckCircle,
  HiPencilAlt,
  HiClock,
  HiLockClosed,
  HiCheck,
  HiChevronRight,
  HiExternalLink,
  HiClipboardCopy,
} from 'react-icons/hi'

export default function CatalogItem({
  id,
  title,
  code,
  status,
  classification,
  description,
  domain,
  author,
  date,
  hasAccess = false,
  datasetUrl = null,
  onViewDetails,
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  // Manejador para navegar hacia el slug ([id].js)
  const handleNavigate = (e) => {
    e?.stopPropagation()
    if (onViewDetails) {
      onViewDetails()
    } else {
      router.push(`/dashboard/analyticteam/${code || id}`)
    }
  }

  // Copiar URL al portapapeles
  const handleCopyUrl = (e) => {
    e.stopPropagation()
    if (datasetUrl) {
      navigator.clipboard.writeText(datasetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Renderizado dinámico de las etiquetas de Estado
  const renderStatusBadge = () => {
    if (status === 'Certificado') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-none">
          <HiCheckCircle className="w-3.5 h-3.5 text-amber-600" />
          Certificado
        </span>
      )
    }
    if (status === 'Borrador') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-none border-dashed">
          <HiPencilAlt className="w-3.5 h-3.5 text-gray-500" />
          Borrador
        </span>
      )
    }
    if (status === 'En revisión') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-none">
          <HiClock className="w-3.5 h-3.5 text-amber-600" />
          En revisión
        </span>
      )
    }
    return null
  }

  // Renderizado dinámico de la Clasificación
  const renderClassificationBadge = () => {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none">
        <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
        {classification}
      </span>
    )
  }

  return (
    <div
      onClick={handleNavigate}
      className="bg-white border border-gray-200 rounded-none p-5 hover:border-gray-400 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
    >
      {/* Información principal del Dataset */}
      <div className="space-y-2 flex-1 w-full">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#ea580c] transition-colors">
            {title}
          </h3>
          <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-none border border-gray-100">
            {code}
          </span>
          {renderStatusBadge()}
          {renderClassificationBadge()}
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>

        {/* Sección de URL del Dataset Crudo (Visible solo si tiene acceso y URL) */}
        {hasAccess && datasetUrl && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-emerald-50/50 border border-emerald-200 p-2.5 flex items-center justify-between gap-2 mt-2"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider shrink-0">
                URL Dataset:
              </span>
              <span className="text-xs font-mono text-emerald-900 truncate">
                {datasetUrl}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Copiar URL"
                className="p-1 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <HiClipboardCopy className="w-4 h-4" />
              </button>
              {copied && (
                <span className="text-[10px] text-emerald-700 font-medium animate-pulse">
                  ¡Copiado!
                </span>
              )}
              <a
                href={datasetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir recurso"
                className="p-1 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <HiExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
          <span className="font-medium text-gray-500">{domain}</span>
          <span>•</span>
          <span>{author}</span>
          <span>•</span>
          <span>Actualizado {date}</span>
        </div>
      </div>

      {/* Botones de Acceso y Detalle */}
      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
        {hasAccess ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-none">
            <HiCheck className="w-3.5 h-3.5 text-emerald-600" />
            Acceso vigente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-none">
            <HiLockClosed className="w-3.5 h-3.5 text-gray-400" />
            Sin acceso
          </span>
        )}

        <button
          type="button"
          onClick={handleNavigate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-none transition-colors cursor-pointer"
        >
          <span>Ver ficha</span>
          <HiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
