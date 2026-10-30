import React, { useCallback, useEffect, useState } from 'react'
import { HiPaperAirplane } from 'react-icons/hi'
import { apiFetch } from '../../../../libs/api'

const VACIO = {
  nombre: '',
  justificacion: '',
  areas: '',
  fuentes: '',
  alcance: '',
}

const campo =
  'w-full border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] transition-colors bg-white'

const fecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''

export default function NewCoreProcess() {
  const [form, setForm] = useState(VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarSolicitudes = useCallback(async () => {
    try {
      const data = await apiFetch('/api/procesos-core/solicitudes')
      setSolicitudes(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarSolicitudes()
  }, [cargarSolicitudes])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setAviso(null)

    // Solo se envían las fuentes si el usuario las llenó
    const body = {
      nombre: form.nombre.trim(),
      justificacion: form.justificacion.trim(),
      areas: form.areas.trim(),
      alcance: form.alcance.trim(),
    }
    if (form.fuentes.trim()) body.fuentes = form.fuentes.trim()

    try {
      setEnviando(true)
      const r = await apiFetch('/api/procesos-core/solicitudes', {
        method: 'POST',
        body,
      })
      setAviso(
        r?.correo_enviado
          ? 'Solicitud registrada. Se notificó al equipo del proyecto por correo.'
          : 'Solicitud registrada. No se pudo enviar el correo al equipo; quedó guardada igualmente.',
      )
      setForm(VACIO)
      await cargarSolicitudes()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="font-sans text-gray-900 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Solicitar nuevo proceso core
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          El equipo del proyecto evaluará y coordinará su incorporación como un
          nuevo módulo.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Nombre del proceso <span className="text-[#ea580c]">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Recuperación judicial y castigos"
              className={`${campo} px-3.5 py-2.5`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Justificación <span className="text-[#ea580c]">*</span>
            </label>
            <textarea
              name="justificacion"
              required
              rows={3}
              value={form.justificacion}
              onChange={handleChange}
              placeholder="Describa el motivo de la solicitud..."
              className={`${campo} p-3 resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900">
                Áreas involucradas <span className="text-[#ea580c]">*</span>
              </label>
              <input
                type="text"
                name="areas"
                required
                value={form.areas}
                onChange={handleChange}
                placeholder="Ej. Cobranzas, Asesoría legal"
                className={`${campo} px-3.5 py-2.5`}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900">
                Fuentes de datos{' '}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                name="fuentes"
                value={form.fuentes}
                onChange={handleChange}
                placeholder="Ej. Sistema de procesos judiciales (Oracle)"
                className={`${campo} px-3.5 py-2.5`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900">
              Alcance esperado <span className="text-[#ea580c]">*</span>
            </label>
            <textarea
              name="alcance"
              required
              rows={3}
              value={form.alcance}
              onChange={handleChange}
              placeholder="Detalle los objetivos o tablas estimadas..."
              className={`${campo} p-3 resize-none`}
            />
          </div>

          {error && (
            <p className="text-xs text-[#ea580c] border border-[#ea580c]/30 bg-[#ea580c]/5 px-3 py-2">
              {error}
            </p>
          )}
          {aviso && (
            <p className="text-xs text-gray-800 border border-gray-200 bg-gray-50 px-3 py-2">
              {aviso}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-5 flex items-center gap-2 text-xs transition-colors cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiPaperAirplane className="w-4 h-4 rotate-90" />
              <span>{enviando ? 'Enviando...' : 'Enviar solicitud'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Mis solicitudes */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          Mis solicitudes
        </h2>
        <div className="bg-white border border-gray-200 shadow-sm">
          {cargando && <p className="p-6 text-xs text-gray-500">Cargando...</p>}

          {!cargando && solicitudes.length === 0 && (
            <p className="p-6 text-xs text-gray-500">
              Aún no has enviado solicitudes.
            </p>
          )}

          <ul className="divide-y divide-gray-100">
            {solicitudes.map((s, i) => (
              <li
                key={s.id ?? s.solicitud_id ?? i}
                className="px-6 py-3.5 text-xs"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-gray-900">{s.nombre}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.estado && (
                      <span className="border border-gray-300 text-gray-600 px-1.5 py-0.5 text-[10px] uppercase">
                        {String(s.estado).replace('_', ' ')}
                      </span>
                    )}
                    <span className="text-gray-400">
                      {fecha(s.creada_en ?? s.created_at ?? s.fecha)}
                    </span>
                  </div>
                </div>
                {s.areas && <p className="text-gray-500 mt-0.5">{s.areas}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
