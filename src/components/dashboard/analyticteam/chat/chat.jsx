import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  HiChevronDown,
  HiPaperAirplane,
  HiExclamation,
  HiOutlinePlus,
} from 'react-icons/hi'
import { RiRobot2Fill } from 'react-icons/ri'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ---------- Helpers ----------

const isPrimitive = (v) => typeof v === 'string' || typeof v === 'number'

const readText = (value, keys = ['nombre']) => {
  if (value === null || value === undefined) return ''
  if (isPrimitive(value)) return String(value)
  if (typeof value === 'object') {
    for (const key of keys) {
      if (isPrimitive(value[key])) return String(value[key])
    }
  }
  return ''
}

const getToken = () => {
  if (typeof window === 'undefined') return null
  const direct =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token')
  if (direct) return direct

  for (const store of [localStorage, sessionStorage]) {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i)
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        try {
          const parsed = JSON.parse(store.getItem(key))
          const token = parsed?.access_token || parsed?.[0]?.access_token
          if (token) return token
        } catch (e) {
          /* ignorar */
        }
      }
    }
  }
  return null
}

const authHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeDataset = (ds, index) => {
  if (!ds || typeof ds !== 'object') return null

  const id = ds.dataset_id ?? ds.id ?? null

  return {
    id,
    key: id ?? `ds-${index}`,
    title:
      readText(ds.nombre_tecnico) ||
      readText(ds.nombre) ||
      'Dataset sin nombre',
    code: readText(ds.nombre_tecnico),
    status: readText(ds.estado),
    classification: readText(ds.clasificacion),
    domain: readText(ds.dominio),
    owner: readText(ds.responsable),
    capa: readText(ds.capa),
    myAccess: readText(ds.mi_acceso),
    frescura: readText(ds.frescura),
    advertencias: Array.isArray(ds.advertencias) ? ds.advertencias : [],
    highlighted: Boolean(ds.highlighted),
    isCertified: !ds.advertencias?.includes('dataset_no_certificado'),
  }
}

const extractDatasets = (data) => {
  if (!data || typeof data !== 'object') return []
  const list = data.datasets || data.fuentes || data.resultados || []
  return Array.isArray(list) ? list.map(normalizeDataset).filter(Boolean) : []
}

const extractText = (data) => {
  if (typeof data === 'string') return data
  const text =
    readText(data?.respuesta, ['texto', 'text', 'mensaje']) ||
    readText(data?.message, ['texto', 'text', 'mensaje']) ||
    readText(data?.resultado, ['texto', 'text'])
  return text || 'No encontré información para tu consulta en el catálogo.'
}

const errorMessageFor = (status) => {
  if (status === 401 || status === 403)
    return 'Tu sesión no es válida o expiró. Cierra sesión e ingresa nuevamente.'
  if (status === 400 || status === 422)
    return 'El servidor no pudo interpretar la consulta. Intenta reformular tu pregunta.'
  if (status >= 500)
    return 'El servidor de IA tuvo un problema al procesar tu consulta. Intenta nuevamente en unos minutos.'
  return 'Lo siento, ocurrió un error al procesar tu consulta con el servidor de IA. Por favor, intenta nuevamente.'
}

// ---------- Adaptadores del historial ----------
// OJO: el formato exacto de GET /api/conversaciones y GET /api/conversaciones/{id}
// no está en la colección de Postman. Estos adaptadores aceptan los nombres de
// campo más probables; si el backend usa otros, solo hay que ajustar aquí.

const asList = (data, keys) => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    for (const k of keys) if (Array.isArray(data[k])) return data[k]
  }
  return []
}

const conversationId = (c) => c?.conversacion_id ?? c?.id ?? null

const conversationDate = (c) =>
  Date.parse(
    c?.actualizado_en ||
      c?.ultima_actividad ||
      c?.updated_at ||
      c?.creado_en ||
      c?.created_at ||
      '',
  ) || 0

const storedSources = (m) => {
  const src = m?.fuentes ?? m?.datasets ?? m?.ruta_fuentes ?? m?.metadata
  if (Array.isArray(src)) return src.map(normalizeDataset).filter(Boolean)
  if (src && typeof src === 'object') return extractDatasets(src)
  return []
}

const isUserRole = (m) => {
  const role = String(
    m?.rol ?? m?.role ?? m?.autor ?? m?.emisor ?? m?.tipo ?? '',
  ).toLowerCase()
  return ['user', 'usuario', 'pregunta', 'human'].includes(role)
}

// Convierte un mensaje guardado en 0, 1 o 2 mensajes del front
const toFrontMessages = (m, index) => {
  const base = m?.id ?? m?.mensaje_id ?? `h-${index}`

  // Caso A: un registro con pregunta y respuesta juntas
  if (m?.pregunta && (m?.respuesta || m?.respuesta_texto)) {
    return [
      {
        id: `${base}-q`,
        sender: 'user',
        text: String(m.pregunta),
        initials: 'AT',
      },
      {
        id: `${base}-a`,
        sender: 'agent',
        text: extractText(m),
        datasets: storedSources(m),
      },
    ]
  }

  // Caso B: un registro por mensaje, con rol
  const text =
    readText(m?.contenido, ['texto', 'text']) ||
    readText(m?.texto) ||
    readText(m?.mensaje) ||
    readText(m?.content, ['texto', 'text'])
  if (!text) return []

  return isUserRole(m)
    ? [{ id: base, sender: 'user', text, initials: 'AT' }]
    : [{ id: base, sender: 'agent', text, datasets: storedSources(m) }]
}

// ---------- Componente ----------

export default function Chat() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [openSources, setOpenSources] = useState({})
  const [convId, setConvId] = useState(null)
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState([])

  // Al entrar: abrir la conversación más reciente del usuario
  useEffect(() => {
    let cancelled = false

    const loadLatestConversation = async () => {
      try {
        const listRes = await fetch(`${API_BASE_URL}/api/conversaciones`, {
          headers: authHeaders(),
        })
        if (!listRes.ok) return

        const conversations = asList(await listRes.json(), [
          'conversaciones',
          'items',
          'data',
        ])
        if (conversations.length === 0) return

        const latest = [...conversations].sort(
          (a, b) => conversationDate(b) - conversationDate(a),
        )[0]
        const id = conversationId(latest)
        if (!id) return

        const detailRes = await fetch(
          `${API_BASE_URL}/api/conversaciones/${id}`,
          { headers: authHeaders() },
        )
        if (!detailRes.ok) return

        const detail = await detailRes.json()
        const stored = asList(detail, ['mensajes', 'messages', 'items', 'data'])
        const restored = stored.flatMap(toFrontMessages)

        if (!cancelled) {
          setConvId(id)
          setMessages(restored)
        }
      } catch (err) {
        console.error('No se pudo cargar el historial del chat:', err)
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    loadLatestConversation()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, loadingHistory])

  const toggleSources = (messageId) =>
    setOpenSources((prev) => ({ ...prev, [messageId]: !prev[messageId] }))

  const handleNewConversation = () => {
    if (loading) return
    setConvId(null)
    setMessages([])
    setOpenSources({})
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputValue.trim() || loading || loadingHistory) return

    const questionText = inputValue.trim()
    setInputValue('')

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: questionText, initials: 'AT' },
    ])
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          pregunta: questionText,
          ...(convId ? { conversacion_id: convId } : {}),
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        const err = new Error(`Error ${response.status}: ${errorBody}`)
        err.status = response.status
        throw err
      }

      const data = await response.json()

      // Guardar el id para que los siguientes mensajes continúen la conversación
      const returnedId = data?.conversacion_id ?? data?.conversacion?.id
      if (returnedId) setConvId(returnedId)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: extractText(data),
          datasets: extractDatasets(data),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: err.status
            ? `${errorMessageFor(err.status)} (código ${err.status})`
            : 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.',
          datasets: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    // Alto = pantalla completa menos el padding vertical de la página (p-8 = 4rem).
    // Si tu layout usa otro padding, ajusta el 4rem.
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-[580px] gap-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          ChatBot de Descubrimiento
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-none flex flex-col shadow-sm flex-1 min-h-0">
        {/* Cabecera del agente */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 bg-[#ea580c] flex items-center justify-center rounded-none text-white text-lg">
            <RiRobot2Fill />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              Agente de descubrimiento
            </h2>
            <p className="text-xs text-gray-500">
              Responde solo con metadatos y cita sus fuentes
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewConversation}
            disabled={loading || messages.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Nueva conversación
          </button>
        </div>

        {/* Conversación */}
        <div className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto bg-white">
          {loadingHistory && (
            <p className="text-xs text-gray-500">Cargando conversación...</p>
          )}

          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.sender === 'user' ? (
                <div className="flex justify-end items-start gap-3">
                  <div className="bg-black text-white text-xs px-4 py-3 rounded-none shadow-sm font-medium tracking-wide">
                    {msg.text}
                  </div>
                  <div className="w-8 h-8 bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center rounded-none shrink-0">
                    {msg.initials || 'AT'}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#ea580c] flex items-center justify-center rounded-none text-white text-lg shrink-0 mt-0.5">
                    <RiRobot2Fill />
                  </div>

                  <div className="space-y-4 max-w-3xl flex-1">
                    <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Tarjetas de datasets */}
                    {msg.datasets?.map((ds) => (
                      <div
                        key={ds.key}
                        className="bg-white p-4 rounded-none space-y-2 border border-gray-200 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 font-mono">
                              {ds.title}
                            </span>
                            {ds.capa && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 border border-gray-200">
                                Capa: {ds.capa}
                              </span>
                            )}
                            {ds.myAccess && (
                              <span className="text-[10px] font-medium text-red-700 bg-red-50 px-2 py-0.5 border border-red-200">
                                {ds.myAccess}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/analyticteam/${ds.id}`)
                            }
                            disabled={!ds.id}
                            className="px-3 py-1 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Ver ficha
                          </button>
                        </div>

                        {ds.advertencias?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {ds.advertencias.map((adv, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5"
                              >
                                <HiExclamation className="w-3 h-3 text-amber-600" />
                                {adv}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-1">
                          {ds.owner && (
                            <span className="flex items-center gap-1.5">
                              <span className="text-gray-400">👤</span>
                              {ds.owner}
                            </span>
                          )}
                          {ds.domain && <span>Dominio: {ds.domain}</span>}
                          {ds.frescura && <span>Frescura: {ds.frescura}</span>}
                        </div>
                      </div>
                    ))}

                    {/* Ruta y fuentes (desplegable) */}
                    {msg.datasets?.length > 0 && (
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleSources(msg.id)}
                          aria-expanded={Boolean(openSources[msg.id])}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-none transition-colors cursor-pointer"
                        >
                          <span>🔗</span>
                          <span>Ver ruta y fuentes</span>
                          <HiChevronDown
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                              openSources[msg.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {openSources[msg.id] && (
                          <ul className="border border-gray-200 bg-gray-50 divide-y divide-gray-200 text-[11px] text-gray-600">
                            {msg.datasets.map((ds) => (
                              <li key={ds.key} className="px-3 py-2">
                                <span className="font-semibold text-gray-800">
                                  {ds.title}
                                </span>
                                <div className="text-gray-500 mt-0.5">
                                  Dominio: {ds.domain || 'N/D'} | Responsable:{' '}
                                  {ds.owner || 'N/D'}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#ea580c] flex items-center justify-center rounded-none text-white text-lg shrink-0">
                <RiRobot2Fill className="animate-spin" />
              </div>
              <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500 font-medium">
                Consultando el catálogo de datos y fuentes corporativas...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Formulario */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 bg-white border border-gray-200 p-2 rounded-none shadow-sm"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregunta por un dato, una tabla o un proceso..."
              className="flex-1 px-3 py-2 text-xs text-gray-900 focus:outline-none bg-transparent placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={loading || loadingHistory || !inputValue.trim()}
              className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#d94e09] text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Enviando...' : 'Enviar'}</span>
              <HiPaperAirplane className="w-3.5 h-3.5 rotate-90" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
