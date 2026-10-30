import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { HiCheck, HiX, HiClock } from 'react-icons/hi'
import { apiFetch } from '../../../../libs/api'

const VOLVER = '/dashboard/executive/certifydataset'

const CLASIFICACIONES_DEFAULT = [
  { codigo: 'publica', nombre: 'Pública' },
  { codigo: 'interna', nombre: 'Interna' },
  { codigo: 'confidencial', nombre: 'Confidencial' },
  { codigo: 'restringida', nombre: 'Restringida' },
]

const ETIQUETAS = {
  descripcion: 'Descripción',
  clasificacion: 'Clasificación',
  contiene_datos_personales: 'Datos personales',
  propietario_tecnico: 'Propietario técnico',
  frecuencia_sla: 'Frecuencia de actualización',
  columnas_sin_evaluar_dato_personal: 'Datos personales por columna',
  linaje: 'Linaje',
}

const siNo = (v) => (v === true ? 'Sí' : v === false ? 'No' : null)

const btn =
  'bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-1.5 px-3 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
const btnSec =
  'border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-1.5 px-3 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

export default function DetailCertify({ id }) {
  const router = useRouter()
  const [d, setD] = useState(null)
  const [clasifs, setClasifs] = useState(CLASIFICACIONES_DEFAULT)
  const [comentario, setComentario] = useState('')
  const [edit, setEdit] = useState(null)
  const [verColumnas, setVerColumnas] = useState(false)
  const [cats, setCats] = useState({})
  const [confirmar, setConfirmar] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const comentarioEditado = useRef(false)

  const avisar = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const cargar = useCallback(async () => {
    try {
      const v = await apiFetch(`/api/datasets/${id}/validacion`)
      setD(v)

      if (!comentarioEditado.current) {
        const faltan = v.metadatos_faltantes
          .filter((k) => k !== 'columnas_sin_evaluar_dato_personal')
          .map((k) => (ETIQUETAS[k] ?? k).toLowerCase())
        const sin = v.columnas.filter((c) => c.es_dato_personal === null).length
        if (sin > 0)
          faltan.push(`evaluar los datos personales de ${sin} columnas`)
        setComentario(faltan.length ? `Falta: ${faltan.join(', ')}.` : '')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    apiFetch('/api/catalogo/filtros')
      .then((f) => {
        const lista = f?.clasificacion
        if (Array.isArray(lista) && lista.length) {
          setClasifs(
            lista.map((x) =>
              typeof x === 'string'
                ? { codigo: x, nombre: x }
                : { codigo: x.codigo ?? x.id, nombre: x.nombre ?? x.codigo },
            ),
          )
        }
      })
      .catch(() => {})
  }, [])

  const ejecutar = async (fn, okMsg) => {
    try {
      setEnviando(true)
      setError(null)
      await fn()
      await cargar()
      if (okMsg) avisar(okMsg)
    } catch (e) {
      setError(e.message)
      await cargar().catch(() => {})
    } finally {
      setEnviando(false)
    }
  }

  const patchMetadatos = (campos, okMsg = 'Guardado') =>
    ejecutar(async () => {
      await apiFetch(`/api/datasets/${id}/metadatos`, {
        method: 'PATCH',
        body: campos,
      })
      setEdit(null)
    }, okMsg)

  const aceptarIA = () =>
    ejecutar(
      () =>
        apiFetch(`/api/datasets/${id}/sugerencias-ia/aceptar`, {
          method: 'POST',
        }),
      'Sugerencias de la IA aceptadas',
    )

  const evaluarColumna = (c, esPersonal) => {
    const body = { es_dato_personal: esPersonal }
    if (esPersonal) {
      const cat = cats[c.id] ?? c.categoria_dato_personal
      if (cat) body.categoria_dato_personal = cat
    }
    return ejecutar(
      () => apiFetch(`/api/columnas/${c.id}`, { method: 'PATCH', body }),
      `Columna ${c.nombre} evaluada`,
    )
  }

  const certificar = async () => {
    setConfirmar(false)
    try {
      setEnviando(true)
      setError(null)
      await apiFetch(`/api/datasets/${id}/certificar`, { method: 'POST' })
      router.push(VOLVER)
    } catch (e) {
      setError(e.message)
      await cargar().catch(() => {})
      setEnviando(false)
    }
  }

  const dejarPendiente = async () => {
    if (!comentario.trim()) {
      setError('Escribe qué debe corregirse antes de dejar pendiente.')
      return
    }
    try {
      setEnviando(true)
      setError(null)
      await apiFetch(`/api/datasets/${id}/pendiente`, {
        method: 'POST',
        body: { comentario },
      })
      router.push(VOLVER)
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  if (cargando) return <p className="text-xs text-gray-500">Cargando...</p>
  if (!d)
    return (
      <p className="text-xs text-[#ea580c]">No se pudo cargar ({error}).</p>
    )

  const evaluadas = d.columnas.filter((c) => c.es_dato_personal !== null).length
  const nombreClasif = (codigo) =>
    clasifs.find((c) => c.codigo === codigo)?.nombre ?? codigo

  const filas = [
    {
      key: 'descripcion',
      valor: d.descripcion,
      ia: d.descripcion_ia,
      usarIA: d.descripcion_ia
        ? () => patchMetadatos({ descripcion: d.descripcion_ia })
        : null,
      editor: 'texto',
      guardar: (v) => patchMetadatos({ descripcion: v }),
    },
    {
      key: 'clasificacion',
      valor: d.clasificacion_codigo
        ? nombreClasif(d.clasificacion_codigo)
        : null,
      ia: d.clasificacion_sugerida_ia
        ? nombreClasif(d.clasificacion_sugerida_ia)
        : null,
      usarIA: d.clasificacion_sugerida_ia
        ? () =>
            patchMetadatos({
              clasificacion_codigo: d.clasificacion_sugerida_ia,
            })
        : null,
      editor: 'clasificacion',
      guardar: (v) => patchMetadatos({ clasificacion_codigo: v }),
    },
    {
      key: 'contiene_datos_personales',
      valor: siNo(d.contiene_datos_personales),
      ia: d.pii_sugerido_ia == null ? null : siNo(d.pii_sugerido_ia),
      usarIA:
        d.pii_sugerido_ia == null
          ? null
          : () =>
              patchMetadatos({ contiene_datos_personales: d.pii_sugerido_ia }),
      editor: 'sino',
      guardar: (v) => patchMetadatos({ contiene_datos_personales: v }),
    },
    {
      key: 'owner',
      label: 'Data Owner',
      valor: d.owner_nombre,
      soloLectura: true,
    },
    {
      key: 'propietario_tecnico',
      valor: d.propietario_tecnico,
      editor: 'linea',
      guardar: (v) => patchMetadatos({ propietario_tecnico: v }),
    },
    { key: 'frecuencia_sla', valor: d.frecuencia_sla, soloLectura: true },
    { key: 'fuente', label: 'Fuente', valor: d.fuente, soloLectura: true },
    {
      key: 'columnas_sin_evaluar_dato_personal',
      valor: `${evaluadas} de ${d.columnas.length} evaluadas`,
      columnas: true,
    },
  ]

  const conocidas = filas.map((f) => f.key)
  const extras = d.metadatos_faltantes
    .filter((k) => !conocidas.includes(k))
    .map((k) => ({ key: k, valor: null, soloLectura: true }))

  const todas = [...filas, ...extras].map((f) => ({
    ...f,
    label: f.label ?? ETIQUETAS[f.key] ?? f.key,
    cumple: !d.metadatos_faltantes.includes(f.key) && f.valor != null,
  }))

  const bloqueado = d.completos < d.obligatorios

  const renderEditor = (f) => {
    const v = edit.value
    const set = (value) => setEdit({ key: f.key, value })
    const control = {
      texto: (
        <textarea
          autoFocus
          rows={4}
          value={v ?? ''}
          onChange={(e) => set(e.target.value)}
          className="w-full border border-gray-300 p-2 text-xs focus:outline-none focus:border-[#ea580c]"
        />
      ),
      linea: (
        <input
          autoFocus
          value={v ?? ''}
          onChange={(e) => set(e.target.value)}
          placeholder="Ej. TI · Base de datos corporativa"
          className="w-full border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#ea580c]"
        />
      ),
      clasificacion: (
        <select
          value={v ?? ''}
          onChange={(e) => set(e.target.value)}
          className="border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:border-[#ea580c]"
        >
          <option value="">Selecciona...</option>
          {clasifs.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.nombre}
            </option>
          ))}
        </select>
      ),
      sino: (
        <select
          value={v === true ? 'si' : v === false ? 'no' : ''}
          onChange={(e) => set(e.target.value === 'si')}
          className="border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:border-[#ea580c]"
        >
          <option value="">Selecciona...</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      ),
    }[f.editor]

    const vacio = v === '' || v == null
    return (
      <div className="space-y-2">
        {control}
        <div className="flex gap-2">
          <button
            disabled={enviando || vacio}
            onClick={() => f.guardar(typeof v === 'string' ? v.trim() : v)}
            className={btn}
          >
            Guardar
          </button>
          <button onClick={() => setEdit(null)} className={btnSec}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  const valorInicial = (f) => {
    if (f.key === 'clasificacion') return d.clasificacion_codigo ?? ''
    if (f.key === 'contiene_datos_personales')
      return d.contiene_datos_personales
    return f.valor ?? ''
  }

  return (
    <div className="font-sans text-gray-900 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Certificar dataset</h1>

      <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4 flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-gray-800">
            {d.nombre_tecnico}
          </span>
          <span className="border border-gray-300 text-gray-600 px-1.5 py-0.5 text-[10px] uppercase">
            {d.capa}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {d.estado.replace('_', ' ')}
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-700">
          {d.completos} de {d.obligatorios} metadatos obligatorios completos
        </p>

        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {todas.map((f) => {
            const editando = edit?.key === f.key
            return (
              <div
                key={f.key}
                className="py-3.5 flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3.5 w-1/3 shrink-0">
                  <div
                    className={`w-5 h-5 text-white flex items-center justify-center shrink-0 ${
                      f.cumple ? 'bg-black' : 'bg-[#ea580c]'
                    }`}
                  >
                    {f.cumple ? (
                      <HiCheck className="w-3.5 h-3.5" />
                    ) : (
                      <HiX className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="font-semibold">{f.label}</span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {editando ? (
                    renderEditor(f)
                  ) : (
                    <p
                      className={`font-medium break-words ${
                        f.cumple ? 'text-gray-700' : 'text-[#ea580c]'
                      }`}
                    >
                      {f.valor ?? 'Falta'}
                    </p>
                  )}

                  {!editando && !f.cumple && f.ia && (
                    <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1.5">
                      <span className="font-bold text-gray-600">
                        Sugerencia IA:{' '}
                      </span>
                      {f.ia}
                    </p>
                  )}
                </div>

                <div className="w-44 flex justify-end gap-2 shrink-0">
                  {!editando && !f.soloLectura && !f.columnas && (
                    <>
                      {!f.cumple && f.usarIA && (
                        <button
                          disabled={enviando}
                          onClick={f.usarIA}
                          className={btn}
                        >
                          Usar IA
                        </button>
                      )}
                      <button
                        disabled={enviando}
                        onClick={() =>
                          setEdit({ key: f.key, value: valorInicial(f) })
                        }
                        className={f.cumple || f.usarIA ? btnSec : btn}
                      >
                        {f.cumple ? 'Editar' : 'Completar'}
                      </button>
                    </>
                  )}
                  {f.columnas && (
                    <button
                      onClick={() => setVerColumnas((x) => !x)}
                      className={f.cumple ? btnSec : btn}
                    >
                      {verColumnas
                        ? 'Ocultar'
                        : f.cumple
                          ? 'Revisar'
                          : 'Evaluar'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {verColumnas && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-800">Columnas</p>
              <button disabled={enviando} onClick={aceptarIA} className={btn}>
                Aceptar todas las sugerencias de la IA
              </button>
            </div>

            <div className="border border-gray-100 divide-y divide-gray-100">
              {d.columnas.map((c) => (
                <div
                  key={c.id}
                  className="p-3 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p>
                      <span className="font-mono font-bold">{c.nombre}</span>{' '}
                      <span className="text-gray-400">{c.tipo_dato}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {c.descripcion_ia}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Sugerencia IA:{' '}
                      <span className="font-bold">
                        {c.pii_sugerido_ia ? 'dato personal' : 'no personal'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <select
                      value={cats[c.id] ?? c.categoria_dato_personal ?? ''}
                      onChange={(e) =>
                        setCats((p) => ({ ...p, [c.id]: e.target.value }))
                      }
                      className="border border-gray-300 bg-white px-1.5 py-1 text-[11px] w-44 focus:outline-none focus:border-[#ea580c]"
                    >
                      <option value="">Categoría (si es personal)</option>
                      {d.categorias_dato_personal.map((k) => (
                        <option key={k.codigo} value={k.codigo}>
                          {k.nombre}
                          {k.es_sensible ? ' · sensible' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1.5">
                      {[
                        { v: true, t: 'Personal' },
                        { v: false, t: 'No personal' },
                      ].map(({ v, t }) => (
                        <button
                          key={t}
                          disabled={enviando}
                          onClick={() => evaluarColumna(c, v)}
                          className={`border px-2 py-1 text-[11px] font-bold cursor-pointer disabled:opacity-50 ${
                            c.es_dato_personal === v
                              ? 'bg-black text-white border-black'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-[#ea580c] border border-[#ea580c]/30 bg-[#ea580c]/5 px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-gray-800">
            Qué debe corregirse
          </label>
          <textarea
            rows={3}
            value={comentario}
            onChange={(e) => {
              comentarioEditado.current = true
              setComentario(e.target.value)
            }}
            className="w-full border border-gray-200 p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ea580c] bg-gray-50/30 resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={dejarPendiente}
            disabled={enviando}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <HiClock className="w-4 h-4 text-gray-500" />
            <span>Dejar pendiente</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmar(true)}
            disabled={bloqueado || enviando}
            className={`border font-bold py-2 px-6 flex items-center gap-2 text-xs ${
              bloqueado || enviando
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#ea580c] hover:bg-[#c2410c] text-white cursor-pointer'
            }`}
          >
            <HiCheck className="w-4 h-4" />
            <span>Certificar</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        La certificación valida la ficha del catálogo, no la calidad de los
        registros.
      </p>

      {confirmar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 shadow-lg p-6 max-w-sm w-full space-y-4">
            <p className="text-sm font-bold">¿Certificar este dataset?</p>
            <p className="text-xs text-gray-600">
              <span className="font-mono font-bold">{d.nombre_tecnico}</span>{' '}
              quedará como certificado en el catálogo y la acción se registrará
              en la bitácora.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmar(false)} className={btnSec}>
                Cancelar
              </button>
              <button onClick={certificar} className={btn}>
                Certificar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-xs font-semibold px-4 py-2.5 shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
