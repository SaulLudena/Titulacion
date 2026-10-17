import React, { useState, useRef, useEffect } from 'react'
import {
  HiCheckCircle,
  HiLockClosed,
  HiChevronDown,
  HiPaperAirplane,
  HiSparkles,
} from 'react-icons/hi'
import { RiRobot2Fill } from 'react-icons/ri'

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Historial de la conversación
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: '¿Dónde encuentro los pagos de las cuotas?',
      initials: 'AT',
    },
    {
      id: 2,
      sender: 'agent',
      text: 'El dataset más adecuado es **Pagos de cuotas** (`pago`) [1]: contiene los pagos aplicados a cada cuota. Está certificado, es Confidencial y lo gestiona Sandra Valdivia Ponce. Para relacionarlo con su cuota usa `cuota` [2].',
      datasets: [
        {
          id: '07d2ecb6-bc89-4fc8-bcee-9d1aeea90123',
          title: 'Pagos de cuotas',
          code: 'pago',
          certified: true,
          confidential: true,
          owner: 'Sandra Valdivia Ponce',
          highlighted: true,
        },
        {
          id: 'a277a842-54ff-4d6c-8e97-bb266c0305bf',
          title: 'Cuotas',
          code: 'cuota',
          certified: true,
          confidential: true,
          owner: 'Sandra Valdivia Ponce',
          highlighted: false,
        },
      ],
    },
  ])

  // Desplazamiento automático al enviar mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // CONSUMO DIRECTO DEL ENDPOINT POST /api/chat
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputValue.trim() || loading) return

    const questionText = inputValue.trim()
    setInputValue('')

    // 1. Agregar el mensaje del usuario
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: questionText,
      initials: 'AT',
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null

      // Petición POST según especificación Postman (/api/chat)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pregunta: questionText,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se obtuvo respuesta del servidor.`,
        )
      }

      const data = await response.json()

      // Procesar la respuesta del servidor
      const botResponseText =
        data.respuesta || data.message || data.resultado || JSON.stringify(data)

      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: botResponseText,
        // Si el backend devuelve datasets o fuentes relacionadas, se pueden mapear dinámicamente
        datasets: data.datasets || [],
      }

      setMessages((prev) => [...prev, agentMsg])
    } catch (err) {
      console.warn(
        'Backend local /api/chat no disponible o devolvió un error:',
        err.message,
      )

      // Fallback para no interrumpir la experiencia en el prototipo
      const fallbackAgentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: `Consultando la base de conocimiento para "${questionText}": La información se encuentra catalogada bajo el módulo de gobierno. Puedes solicitar los permisos de acceso correspondientes.`,
        datasets: [],
      }

      setMessages((prev) => [...prev, fallbackAgentMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Título de la sección */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Agente conversacional
        </h1>
      </div>

      {/* Contenedor principal del chat */}
      <div className="bg-white border border-gray-200 rounded-none flex flex-col justify-between shadow-sm min-h-[580px]">
        {/* Cabecera del Agente */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 bg-[#ea580c] flex items-center justify-center rounded-none text-white text-lg">
            <RiRobot2Fill />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              Agente de descubrimiento
            </h2>
            <p className="text-xs text-gray-500">
              Responde solo con metadatos y cita sus fuentes
            </p>
          </div>
        </div>

        {/* Cuerpo de la Conversación */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-white max-h-[520px]">
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {/* Mensaje del Usuario */}
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
                /* Respuesta del Agente */
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#ea580c] flex items-center justify-center rounded-none text-white text-lg shrink-0 mt-0.5">
                    <RiRobot2Fill />
                  </div>

                  <div className="space-y-4 max-w-3xl flex-1">
                    {/* Texto del Agente */}
                    <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Renderizado dinámico de Tarjetas de Datasets adjuntas */}
                    {msg.datasets &&
                      msg.datasets.map((ds, idx) => (
                        <div
                          key={ds.id || idx}
                          className={`bg-white p-4 rounded-none space-y-2 shadow-sm ${
                            ds.highlighted
                              ? 'border-2 border-[#ea580c]'
                              : 'border border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">
                                {ds.title}
                              </span>
                              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1 py-0.5 border border-gray-200">
                                {ds.code}
                              </span>
                              {ds.certified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-none">
                                  <HiCheckCircle className="w-3.5 h-3.5 text-amber-600" />
                                  Certificado
                                </span>
                              )}
                              {ds.confidential && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none">
                                  <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
                                  Confidencial
                                </span>
                              )}
                            </div>
                            <button className="px-3 py-1 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-none transition-colors cursor-pointer">
                              Ver ficha
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                            <span className="text-gray-400">👤</span>
                            <span>{ds.owner}</span>
                          </div>
                        </div>
                      ))}

                    {/* Botón desplegable de fuentes */}
                    <div>
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-none transition-colors cursor-pointer">
                        <span>🔗</span>
                        <span>Ver ruta y fuentes</span>
                        <HiChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Indicador de Estado Pensando / Cargando */}
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

        {/* Formulario Inferior de Mensajería */}
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
              disabled={loading || !inputValue.trim()}
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
