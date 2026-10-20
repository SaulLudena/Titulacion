import React, { useState } from 'react'
import { HiCheck, HiX, HiClock } from 'react-icons/hi'

export default function CertifyDataset() {
  const [comentario, setComentario] = useState(
    'Falta el propietario técnico y evaluar los datos personales de 3 columnas.',
  )

  // Evaluaciones ejecutadas internamente por la plataforma
  const [metadatos] = useState([
    {
      id: 1,
      label: 'Descripción',
      valor: 'Gestiones de cobranza por deudor...',
      cumple: true,
    },
    {
      id: 2,
      label: 'Clasificación',
      valor: 'Restringida',
      cumple: true,
    },
    {
      id: 3,
      label: 'Datos personales',
      valor: 'Sí',
      cumple: true,
    },
    {
      id: 4,
      label: 'Data Owner',
      valor: 'Sandra Valdivia Ponce',
      cumple: true,
    },
    {
      id: 5,
      label: 'Propietario técnico',
      valor: 'Falta',
      cumple: false,
      accion: 'Completar',
    },
    {
      id: 6,
      label: 'Frecuencia de actualización',
      valor: 'Diaria',
      cumple: true,
    },
    {
      id: 7,
      label: 'Fuente',
      valor: 'Cobranzas y Pagos (PostgreSQL)',
      cumple: true,
    },
    {
      id: 8,
      label: 'Datos personales por columna',
      valor: '7 de 10 evaluadas',
      cumple: false,
      accion: 'Evaluar',
    },
  ])

  // Lógica interna: La certificación está deshabilitada si al menos 1 regla no cumple
  const tienePendientesCriticos = metadatos.some((item) => !item.cumple)

  return (
    <div className=" font-sans bg-[#f8f9fa] min-h-screen text-gray-900 max-w-5xl mx-auto">
      {/* Cabecera */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Certificar dataset
      </h1>

      {/* Contenedor Principal */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Identificador del Dataset */}
        <div className="border-b border-gray-200 pb-4">
          <p className="text-xs text-gray-500 font-medium">
            Gestiones de cobranza{' '}
            <span className="font-mono text-gray-800 font-bold">
              gestion_cobranza
            </span>
          </p>
        </div>

        {/* Resumen de Validación Interna */}
        <div>
          <p className="text-xs font-semibold text-gray-700">
            {metadatos.filter((m) => m.cumple).length} de {metadatos.length}{' '}
            metadatos obligatorios completos
          </p>
        </div>

        {/* Tabla de Indicadores de Cumplimiento (Solo Lectura) */}
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {metadatos.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3.5 w-1/3">
                {/* Ícono de estado del sistema: Cumple vs No Cumple */}
                {item.cumple ? (
                  <div
                    title="Cumple con la regla de gobierno"
                    className="w-5 h-5 bg-black text-white flex items-center justify-center rounded-none shrink-0"
                  >
                    <HiCheck className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div
                    title="Requiere subsanación en el catálogo"
                    className="w-5 h-5 bg-[#ea580c] text-white flex items-center justify-center rounded-none shrink-0"
                  >
                    <HiX className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="font-semibold text-gray-900">
                  {item.label}
                </span>
              </div>

              {/* Valor / Contenido del Metadato */}
              <div className="w-1/2 text-gray-700 font-medium truncate">
                {item.valor}
              </div>

              {/* Acción opcional enviada al módulo de edición/evaluación */}
              <div className="w-auto text-right">
                {item.accion && (
                  <button
                    onClick={() => alert(`Acción requerida: ${item.accion}`)}
                    className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-1.5 px-3 rounded-none transition-colors cursor-pointer text-[11px]"
                  >
                    {item.accion}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Observaciones de Subsanación */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-gray-800">
            Qué debe corregirse
          </label>
          <textarea
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] bg-gray-50/30 resize-none"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 flex items-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <HiClock className="w-4 h-4 text-gray-500" />
            <span>Dejar pendiente</span>
          </button>

          <button
            type="button"
            disabled={tienePendientesCriticos}
            className={`border font-bold py-2 px-6 flex items-center gap-2 text-xs transition-colors ${
              tienePendientesCriticos
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#ea580c] hover:bg-[#c2410c] text-white cursor-pointer'
            }`}
          >
            <HiCheck className="w-4 h-4" />
            <span>Certificar</span>
          </button>
        </div>
      </div>

      {/* Leyenda aclaratoria */}
      <p className="text-[11px] text-gray-400 mt-4">
        La certificación valida la ficha del catálogo, no la calidad de los
        registros.
      </p>
    </div>
  )
}
