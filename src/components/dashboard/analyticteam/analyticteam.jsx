import React, { useState } from 'react'

export default function analyticteam() {
  const [activeTab, setActiveTab] = useState('explorar')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu agente conversacional financiero de HextaStudio. ¿Qué dataset, transacción o métrica deseas consultar hoy?',
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = chatInput
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setChatInput('')

    // intervalos de respuesta simulados para el agente
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Analizando la consulta corporativa sobre "${userMsg}"... Encontré 3 registros de transacciones sincronizadas con Q3 y Q4.`,
        },
      ])
    }, 1000)
  }

  const datasets = [
    {
      id: 1,
      title: 'Encuenstas Globales Q3',
      category: 'Finanzas',
      size: '1.2 GB',
      update: 'Hace 2 horas',
      status: 'Activo',
    },
    {
      id: 2,
      title: 'Comportamiento de Clientes B2B',
      category: 'Analítica',
      size: '450 MB',
      update: 'Ayer',
      status: 'Sincronizado',
    },
    {
      id: 3,
      title: 'Predicción de Churn 2026',
      category: 'Machine Learning',
      size: '2.1 GB',
      update: 'Hace 3 días',
      status: 'Actualizando',
    },
    {
      id: 4,
      title: 'Flujo de Caja Consolidado',
      category: 'Contabilidad',
      size: '85 MB',
      update: 'Hace 5 min',
      status: 'Activo',
    },
  ]

  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-gray-900 flex font-sans select-none">
      {/* Sidebar - All White & Clean Minimalist */}
      <aside className="w-64 bg-gray-50/70 border-r border-gray-200 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9  bg-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0l2.2 7.8L22 4l-4.8 7.2L24 12l-6.8 0.8L22 20l-7.8-3.8L12 24l-2.2-7.8L2 20l4.8-7.2L0 12l6.8-0.8L2 4l7.8 3.8z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-sm text-gray-900">
                Equipo-6
              </h1>
              <p className="text-[10px] text-gray-400 ">Titulación 2026</p>
            </div>
          </div>

          {/* Navigation Links (3 options) */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('explorar')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs transition-all ${
                activeTab === 'explorar'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
              Explorar
            </button>

            <button
              onClick={() => setActiveTab('agente')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs transition-all ${
                activeTab === 'agente'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
              Agente Conversacional
            </button>
          </nav>
        </div>

        {/* perfil de usuario*/}
        <div className="pt-4  flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-orange-600">
            HI
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-900 truncate">John Doe</p>
            <p className="text-[10px] text-gray-500 truncate">
              Analista de Datos Senior
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Dynamic View Content Container */}
        <div className="flex-1 overflow-hidden p-8 bg-gray-50/40">
          {/* VISTA 2: EXPLORAR (Interactive Data Grid) */}
          {activeTab === 'explorar' && (
            <div className="w-full h-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Explorar Datasets
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Filtra y analiza mediante el asistente conversacional
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Buscar dataset..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-gray-200 px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all w-64 shadow-sm"
                  />
                </div>
              </div>

              {/* Grid of Datasets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
                {datasets
                  .filter((d) =>
                    d.title.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((ds) => (
                    <div
                      key={ds.id}
                      className="bg-white border border-gray-200 hover:border-orange-500/50 p-5 flex flex-col justify-between transition-all shadow-sm group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 text-[10px] font-semibold bg-orange-500 text-white">
                            {ds.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {ds.size}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors">
                          {ds.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2">
                          Actualizado: {ds.update}
                        </p>
                      </div>
                      <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                          Ver →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VISTA 3: AGENTE CONVERSACIONAL (Interactive Chat) */}
          {activeTab === 'agente' && (
            <div className="w-full h-full flex flex-col bg-white border border-gray-200 overflow-hidden shadow-sm">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                    IA
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">
                      Agente de Datos Financieros
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      Listo para consultar dataset
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-orange-600 text-white font-medium shadow-sm'
                          : 'shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Pregúntale algo al agente (ej: 'Muéstrame las ventas de Q3')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Enviar
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
