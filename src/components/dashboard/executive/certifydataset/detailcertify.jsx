import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { HiCheck, HiX, HiClock, HiExclamation } from 'react-icons/hi'
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
  owner: 'Data Owner',
  propietario_tecnico: 'Propietario técnico',
  frecuencia_sla: 'Frecuencia de actualización',
  ultima_actualizacion: 'Última actualización',
  linaje: 'Linaje',
  columnas_activas: 'Al menos una columna activa',
  columnas_sin_evaluar_dato_personal: 'Datos personales por columna',
}

const siNo = (v) => (v === true ? 'Sí' : v === false ? 'No' : null)

const btn =
  'bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-1.5 px-3 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
const btnSec =
  'border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-1.5 px-3 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

// ---------- Controles ----------

function Segmented({
  name,
  options,
  value,
  onChange,
  disabled = false,
  compact = false,
  ariaLabel,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex border border-gray-300 bg-white overflow-hidden"
    >
      {options.map((o, i) => {
        const selected = value === o.value
        return (
          <label
            key={String(o.value)}
            className={`relative select-none text-xs transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#ea580c] ${
              compact ? 'px-3 py-1.5' : 'px-4 py-2'
            } ${i > 0 ? 'border-l border-gray-300' : ''} ${
              selected
                ? 'bg-black text-white font-bold'
                : 'bg-white text-gray-700 font-medium hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        )
      })}
    </div>
  )
}

function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-[#ea580c]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="text-xs font-medium text-gray-800">
        {checked ? 'Sí' : 'No'}
      </span>
    </div>
  )
}

export default function DetailCertify({ id }) {
  const router = useRouter()
  const [d, setD] = useState(null)
  const [clasifs, setClasifs] = useState(CLASIFICACIONES_DEFAULT)
  const [comentario, setComentario] = useState('')
  const [edit, setEdit] = useState(null)
  const [verColumnas, setVerColumnas] = useState(false)
  const [evals, setEvals] = useState({})
  const [cats, setCats] = useState({})
  const [confirmar, setConfirmar] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const comentarioEditado = useRef(false)
  const columnasRef = useRef(null)
  const errorRef = useRef(null)

  const avisar = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const cargar = useCallback(async () => {
    if (!id) return
    try {
      const v = await apiFetch(`/api/datasets/${id}/validacion`)
      setD(v)

      if (!comentarioEditado.current) {
        const faltan = (v.metadatos_faltantes ?? [])
          .filter((k) => k !== 'columnas_sin_evaluar_dato_personal')
          .map((k) => (ETIQUETAS[k] ?? k).toLowerCase())
        const sin = (v.columnas ?? []).filter(
          (c) => c.es_dato_personal == null,
        ).length
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

  useEffect(() => {
    if (verColumnas) {
      columnasRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [verColumnas])

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [error])

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
    ejecutar(async () => {
      await apiFetch(`/api/datasets/${id}/sugerencias-ia/aceptar`, {
        method: 'POST',
      })
      setEvals({})
      setCats({})
    }, 'Sugerencias de la IA aceptadas')

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

  const columnas = d.columnas ?? []
  const faltantes = d.metadatos_faltantes ?? []
  const categorias = d.categorias_dato_personal ?? []

  const evaluadas = columnas.filter((c) => c.es_dato_personal != null).length
  const nombreClasif = (codigo) =>
    clasifs.find((c) => c.codigo === codigo)?.nombre ?? codigo
  const nombreCategoria = (codigo) =>
    categorias.find((k) => k.codigo === codigo)?.nombre ?? codigo

  const valorCol = (c) =>
    evals[c.id] !== undefined ? evals[c.id] : (c.es_dato_personal ?? null)

  const cambios = columnas.filter((c) => {
    const v = valorCol(c)
    if (v == null) return false
    if (v !== c.es_dato_personal) return true
    if (v === true) {
      const cat = cats[c.id]
      return cat !== undefined && cat !== (c.categoria_dato_personal ?? '')
    }
    return false
  })

  const cancelarEvaluacion = () => {
    setEvals({})
    setCats({})
    setVerColumnas(false)
  }

  const guardarEvaluacion = async () => {
    if (cambios.length === 0) return
    setEnviando(true)
    setError(null)

    const fallidas = []
    for (const c of cambios) {
      const v = valorCol(c)
      const body = { es_dato_personal: v }
      if (v) {
        const cat = cats[c.id] ?? c.categoria_dato_personal
        if (cat) body.categoria_dato_personal = cat
      }
      try {
        await apiFetch(`/api/columnas/${c.id}`, { method: 'PATCH', body })
      } catch (e) {
        fallidas.push(`${c.nombre}: ${e.message}`)
      }
    }

    await cargar()

    if (fallidas.length === 0) {
      setEvals({})
      setCats({})
      setVerColumnas(false)
      avisar('Evaluación guardada')
    } else {
      setError(
        `No se pudo guardar ${fallidas.length} columna(s). ${fallidas.join(' · ')}`,
      )
    }
    setEnviando(false)
  }

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
    {
      key: 'ultima_actualizacion',
      valor: d.ultima_actualizacion,
      soloLectura: true,
    },
    { key: 'linaje', valor: d.linaje, soloLectura: true },
    {
      key: 'columnas_activas',
      valor: d.columnas_activas ?? 'Registradas',
      soloLectura: true,
    },
    {
      key: 'columnas_sin_evaluar_dato_personal',
      valor: `${evaluadas} de ${columnas.length} evaluadas`,
      columnas: true,
    },
  ]

  const conocidas = filas.map((f) => f.key)
  const extras = faltantes
    .filter((k) => !conocidas.includes(k))
    .map((k) => ({ key: k, valor: null, soloLectura: true }))

  const todas = [...filas, ...extras].map((f) => ({
    ...f,
    label: f.label ?? ETIQUETAS[f.key] ?? f.key,
    cumple: !faltantes.includes(f.key) && f.valor != null,
  }))

  const bloqueado =
    (d.completos ?? 0) < (d.obligatorios ?? 10) || d.estado === 'certificado'

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
        <Segmented
          name="clasificacion"
          ariaLabel="Clasificación"
          options={clasifs.map((c) => ({ value: c.codigo, label: c.nombre }))}
          value={v ?? ''}
          onChange={set}
        />
      ),
      sino: (
        <Toggle
          label="¿Contiene datos personales?"
          checked={v === true}
          onChange={set}
        />
      ),
    }[f.editor]

    const vacio = v === '' || v == null
    return (
      <div className="space-y-2">
        {control}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={enviando || vacio}
            onClick={() => f.guardar(typeof v === 'string' ? v.trim() : v)}
            className={btn}
          >
            {enviando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => setEdit(null)}
            disabled={enviando}
            className={btnSec}
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  const valorInicial = (f) => {
    if (f.key === 'clasificacion') return d.clasificacion_codigo ?? ''
    if (f.key === 'contiene_datos_personales')
      return d.contiene_datos_personales ?? d.pii_sugerido_ia ?? false
    return f.valor ?? ''
  }

  return (
    <div className="font-sans text-gray-950 w-full space-y-6">
      <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4 flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-gray-800">
            {d.nombre_tecnico}
          </span>
          <span className="border border-gray-300 text-gray-600 px-1.5 py-0.5 text-[10px] uppercase font-bold">
            {d.capa}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {(d.estado ?? '').replace('_', ' ')}
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-700">
          {d.completos ?? 0} de {d.obligatorios ?? 10} metadatos obligatorios
          completos
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
                          type="button"
                          disabled={enviando}
                          onClick={f.usarIA}
                          className={btn}
                        >
                          Usar IA
                        </button>
                      )}
                      <button
                        type="button"
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
                      type="button"
                      onClick={() =>
                        verColumnas
                          ? cancelarEvaluacion()
                          : setVerColumnas(true)
                      }
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
          <div ref={columnasRef} className="space-y-3 scroll-mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Evaluar datos personales por columna
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {d.nombre_tecnico} · {evaluadas} de {columnas.length}{' '}
                  evaluadas
                </p>
              </div>
              <button
                type="button"
                disabled={enviando}
                onClick={aceptarIA}
                className={`${btnSec} inline-flex items-center gap-1.5 shrink-0`}
              >
                <HiCheck className="w-3.5 h-3.5" />
                Aceptar sugerencias de la IA
              </button>
            </div>

            <div className="border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[840px] text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Columna
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Tipo
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Descripción
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      ¿Dato personal?
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Categoría
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {columnas.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-gray-500 text-center"
                      >
                        Este dataset no tiene columnas registradas.
                      </td>
                    </tr>
                  )}
                  {columnas.map((c) => {
                    const v = valorCol(c)
                    const sinEvaluar = c.es_dato_personal == null
                    const catSugerida =
                      c.categoria_sugerida_ia ?? c.categoria_sugerida ?? null
                    return (
                      <tr
                        key={c.id}
                        className={sinEvaluar ? 'bg-[#ea580c]/5' : 'bg-white'}
                      >
                        <td className="px-3 py-3 font-mono font-bold text-gray-900 align-top">
                          {c.nombre}
                        </td>
                        <td className="px-3 py-3 font-mono text-gray-500 align-top">
                          {c.tipo_dato}
                        </td>
                        <td className="px-3 py-3 text-gray-600 align-top">
                          {c.descripcion_ia ?? c.descripcion}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <Segmented
                            compact
                            name={`dp-${c.id}`}
                            ariaLabel={`¿${c.nombre} es dato personal?`}
                            disabled={enviando}
                            options={[
                              { value: true, label: 'Sí' },
                              { value: false, label: 'No' },
                            ]}
                            value={v}
                            onChange={(val) =>
                              setEvals((p) => ({ ...p, [c.id]: val }))
                            }
                          />
                        </td>
                        <td className="px-3 py-3 align-top">
                          {v === false ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <select
                              aria-label={`Categoría de ${c.nombre}`}
                              disabled={enviando || v == null}
                              value={
                                cats[c.id] ?? c.categoria_dato_personal ?? ''
                              }
                              onChange={(e) =>
                                setCats((p) => ({
                                  ...p,
                                  [c.id]: e.target.value,
                                }))
                              }
                              className="border border-gray-300 bg-white px-2 py-1.5 text-[11px] w-44 focus:outline-none focus:border-[#ea580c] disabled:bg-gray-50 disabled:text-gray-400"
                            >
                              <option value="">—</option>
                              {categorias.map((k) => (
                                <option key={k.codigo} value={k.codigo}>
                                  {k.nombre}
                                  {k.es_sensible ? ' · sensible' : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {sinEvaluar ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 border border-amber-300 bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                                <HiExclamation className="w-3 h-3" />
                                Sin evaluar
                              </span>
                              {c.pii_sugerido_ia != null && (
                                <p className="text-[10px] text-gray-500">
                                  La IA sugiere:{' '}
                                  <span className="font-bold">
                                    {siNo(c.pii_sugerido_ia)}
                                  </span>
                                  {catSugerida
                                    ? ` · ${nombreCategoria(catSugerida)}`
                                    : ''}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 px-2 py-0.5 text-[10px] font-semibold">
                              <HiCheck className="w-3 h-3" />
                              Evaluada
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={cancelarEvaluacion}
                disabled={enviando}
                className="text-xs font-semibold text-[#ea580c] hover:underline cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarEvaluacion}
                disabled={enviando || cambios.length === 0}
                className={`${btn} py-2 px-4 text-xs`}
              >
                {enviando
                  ? 'Guardando...'
                  : `Guardar evaluación${
                      cambios.length > 0 ? ` (${cambios.length})` : ''
                    }`}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p
            ref={errorRef}
            role="alert"
            className="text-xs text-[#ea580c] border border-[#ea580c]/30 bg-[#ea580c]/5 px-3 py-2"
          >
            {error}
          </p>
        )}

        <div className="space-y-2 pt-2">
          <label
            htmlFor="comentario-pendiente"
            className="block text-xs font-bold text-gray-800"
          >
            Qué debe corregirse
          </label>
          <textarea
            id="comentario-pendiente"
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
            <span>
              {d.estado === 'certificado'
                ? 'Dataset certificado'
                : 'Certificar'}
            </span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        La certificación valida la ficha del catálogo, no la calidad de los
        registros. Las columnas con datos personales determinan la clasificación
        del dataset y quién debe aprobar los accesos.
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
              <button
                type="button"
                onClick={() => setConfirmar(false)}
                className={btnSec}
              >
                Cancelar
              </button>
              <button type="button" onClick={certificar} className={btn}>
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
