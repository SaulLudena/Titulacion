import React, { useState } from 'react'
import { HiPaperAirplane } from 'react-icons/hi'

export default function NewCoreProcess() {
  const [formData, setFormData] = useState({
    nombreProceso: 'Recuperación judicial y castigos',
    justificacion:
      'Los créditos castigados se gestionan en archivos de estudios externos y no están catalogados.',
    fuentesInvolucradas:
      'Cobranzas, Asesoría legal · Sistema de procesos judiciales (Oracle)',
    alcanceEsperado:
      'Catalogar las tablas de expedientes, castigos y recuperaciones (unas 12 tablas).',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulación de envío de formulario al backend
    setTimeout(() => {
      alert('Solicitud de nuevo proceso core enviada con éxito.')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen text-gray-900 max-w-4xl">
      {/* Título Principal y Subtítulo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Solicitar nuevo proceso core
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          El equipo del proyecto evaluará y coordinará su incorporación como un
          nuevo módulo.
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-white border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del proceso */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Nombre del proceso <span className="text-[#ea580c]">*</span>
            </label>
            <input
              type="text"
              name="nombreProceso"
              required
              value={formData.nombreProceso}
              onChange={handleChange}
              placeholder="Ej. Recuperación judicial y castigos"
              className="w-full border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] transition-colors bg-white"
            />
          </div>

          {/* Justificación */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Justificación <span className="text-[#ea580c]">*</span>
            </label>
            <textarea
              name="justificacion"
              required
              rows={3}
              value={formData.justificacion}
              onChange={handleChange}
              placeholder="Describa el motivo de la solicitud..."
              className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] transition-colors bg-white resize-none"
            />
          </div>

          {/* Fuentes o áreas involucradas */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Fuentes o áreas involucradas{' '}
              <span className="text-[#ea580c]">*</span>
            </label>
            <input
              type="text"
              name="fuentesInvolucradas"
              required
              value={formData.fuentesInvolucradas}
              onChange={handleChange}
              placeholder="Ej. Cobranzas, Asesoría legal..."
              className="w-full border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] transition-colors bg-white"
            />
          </div>

          {/* Alcance esperado */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Alcance esperado <span className="text-[#ea580c]">*</span>
            </label>
            <textarea
              name="alcanceEsperado"
              required
              rows={3}
              value={formData.alcanceEsperado}
              onChange={handleChange}
              placeholder="Detalle los objetivos o tablas estimadas..."
              className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] transition-colors bg-white resize-none"
            />
          </div>

          {/* Botón de Enviar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-5 flex items-center gap-2 text-xs transition-colors cursor-pointer rounded-none disabled:opacity-50"
            >
              <HiPaperAirplane className="w-4 h-4 rotate-90" />
              <span>{loading ? 'Enviando...' : 'Enviar solicitud'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
