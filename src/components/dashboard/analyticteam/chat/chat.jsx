import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  HiCheckCircle,
  HiLockClosed,
  HiChevronDown,
  HiPaperAirplane,
} from 'react-icons/hi'
import { RiRobot2Fill } from 'react-icons/ri'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function Chat() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Historial inicia completamente vacío (sin hardcodeo)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: '¡Hola! Soy el agente conversacional de Banco Andino. Pregúntame por cualquier dataset, dominio o métrica que necesites localizar.',
      datasets: [],
    },
  ])

  // Desplazamiento automático hacia abajo al enviar o recibir mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Consumo del endpoint real POST /api/chat
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputValue.trim() || loading) return

    const questionText = inputValue.trim()
    setInputValue('')

    // 1. Agregar el mensaje del usuario al chat
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
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || sessionStorage.getItem('token')
          : null

      // Petición POST al endpoint /api/chat del backend
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
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

      // Procesar la respuesta del servidor de forma dinámica
      const botResponseText =
        typeof data === 'string'
          ? data
          : data.respuesta ||
            data.message ||
            data.resultado ||
            JSON.stringify(data)

      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: botResponseText,
        datasets: data.datasets || [],
      }

      setMessages((prev) => [...prev, agentMsg])
    } catch (err) {
      console.warn('Backend /api/chat no disponible:', err.message)

      const errorMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: 'Lo siento, ocurrió un error al procesar tu consulta con el servidor de IA. Por favor, intenta nuevamente.',
        datasets: [],
      }

      setMessages((prev) => [...prev, errorMsg])
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

                    {/* Renderizado dinámico de Tarjetas de Datasets devueltas por la API */}
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
                                {ds.title || ds.nombre}
                              </span>
                              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1 py-0.5 border border-gray-200">
                                {ds.code || ds.codigo}
                              </span>
                              {(ds.certified ||
                                ds.estado === 'Certificado') && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-none">
                                  <HiCheckCircle className="w-3.5 h-3.5 text-amber-600" />
                                  Certificado
                                </span>
                              )}
                              {(ds.confidential ||
                                ds.clasificacion === 'Confidencial') && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-none">
                                  <HiLockClosed className="w-3.5 h-3.5 text-orange-600" />
                                  Confidencial
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                router.push(`/dashboard/analyticteam/${ds.id}`)
                              }
                              className="px-3 py-1 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-none transition-colors cursor-pointer"
                            >
                              Ver ficha
                            </button>
                          </div>
                          {(ds.owner || ds.autor) && (
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                              <span className="text-gray-400">👤</span>
                              <span>{ds.owner || ds.autor}</span>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Botón desplegable de fuentes */}
                    {msg.datasets && msg.datasets.length > 0 && (
                      <div>
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-none transition-colors cursor-pointer">
                          <span>🔗</span>
                          <span>Ver ruta y fuentes</span>
                          <HiChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Indicador de Estado Cargando / Pensando */}
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
