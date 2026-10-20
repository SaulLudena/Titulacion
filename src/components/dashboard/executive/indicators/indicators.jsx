import React from 'react'

export default function Indicators() {
  // Datos de las tarjetas métricas superiores
  const metrics = [
    {
      title: 'Datasets catalogados',
      value: '28',
      variant: 'dark', // Fondo negro, texto blanco
    },
    {
      title: 'Con responsable',
      value: '100%',
      variant: 'light',
    },
    {
      title: 'Certificados',
      value: '33.3%',
      variant: 'light',
    },
    {
      title: 'Solicitudes pendientes',
      value: '7',
      variant: 'orange', // Fondo naranja, texto blanco
    },
    {
      title: 'Tiempo medio de atención',
      value: '18.4h',
      variant: 'light',
    },
  ]

  // Puntos de datos para el gráfico de evolución
  const chartData = [
    { date: '9 sep', certificados: 12, metadatos: 18 },
    { date: '15 sep', certificados: 19, metadatos: 26 },
    { date: '21 sep', certificados: 26, metadatos: 33 },
    { date: '27 sep', certificados: 33, metadatos: 41 },
    { date: '30 sep', certificados: 33, metadatos: 44 },
  ]

  return (
    <div className=" font-sans bg-[#f8f9fa] min-h-screen text-gray-900 max-w-7xl">
      {/* Título Principal */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Indicadores de gobierno
      </h1>

      {/* Fila Superior: Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((item, idx) => {
          let bgClass = 'bg-white text-gray-900 border border-gray-200'
          let titleClass = 'text-gray-500'

          if (item.variant === 'dark') {
            bgClass = 'bg-black text-white'
            titleClass = 'text-gray-400'
          } else if (item.variant === 'orange') {
            bgClass = 'bg-[#ea580c] text-white'
            titleClass = 'text-orange-100'
          }

          return (
            <div
              key={idx}
              className={`${bgClass} p-5 shadow-sm rounded-none flex flex-col justify-between`}
            >
              <p
                className={`text-[11px] font-medium uppercase tracking-wider ${titleClass}`}
              >
                {item.title}
              </p>
              <p className="text-3xl font-bold mt-4 tracking-tight">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Sección Inferior: Gráfico de Evolución */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900">Evolución</h2>
          <p className="text-[11px] text-gray-500">% sobre datasets activos</p>
        </div>

        {/* Contenedor del Gráfico Estilizado */}
        <div className="relative h-64 w-full pt-4 pb-8 px-4">
          {/* Líneas horizontales de referencia */}
          <div className="absolute inset-x-0 top-4 flex justify-between text-[10px] text-gray-300 border-b border-gray-100 pb-1">
            <span>100</span>
          </div>
          <div className="absolute inset-x-0 top-16 flex justify-between text-[10px] text-gray-300 border-b border-gray-100 pb-1">
            <span>75</span>
          </div>
          <div className="absolute inset-x-0 top-28 flex justify-between text-[10px] text-gray-300 border-b border-gray-100 pb-1">
            <span>50</span>
          </div>
          <div className="absolute inset-x-0 top-40 flex justify-between text-[10px] text-gray-300 border-b border-gray-100 pb-1">
            <span>25</span>
          </div>
          <div className="absolute inset-x-0 top-52 flex justify-between text-[10px] text-gray-300 border-b border-gray-100 pb-1">
            <span>0</span>
          </div>

          {/* SVG para renderizar las líneas de tendencia */}
          <svg className="absolute inset-x-12 inset-y-6 w-[calc(100%-6rem)] h-48 overflow-visible">
            {/* Línea Naranja (Datasets certificados) */}
            <polyline
              fill="none"
              stroke="#ea580c"
              strokeWidth="2"
              points="0,135 150,110 300,85 450,60 600,60"
            />
            {/* Línea Negra (Metadatos obligatorios completos) */}
            <polyline
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              points="0,110 150,90 300,75 450,55 600,45"
            />

            {/* Puntos Interactivos / Nodos */}
            {/* Naranja */}
            <circle
              cx="0"
              cy="135"
              r="4"
              fill="white"
              stroke="#ea580c"
              strokeWidth="2"
            />
            <circle
              cx="150"
              cy="110"
              r="4"
              fill="white"
              stroke="#ea580c"
              strokeWidth="2"
            />
            <circle
              cx="300"
              cy="85"
              r="4"
              fill="white"
              stroke="#ea580c"
              strokeWidth="2"
            />
            <circle
              cx="450"
              cy="60"
              r="4"
              fill="white"
              stroke="#ea580c"
              strokeWidth="2"
            />
            <circle
              cx="600"
              cy="60"
              r="4"
              fill="white"
              stroke="#ea580c"
              strokeWidth="2"
            />

            {/* Negro */}
            <circle
              cx="0"
              cy="110"
              r="4"
              fill="white"
              stroke="#000000"
              strokeWidth="2"
            />
            <circle
              cx="150"
              cy="90"
              r="4"
              fill="white"
              stroke="#000000"
              strokeWidth="2"
            />
            <circle
              cx="300"
              cy="75"
              r="4"
              fill="white"
              stroke="#000000"
              strokeWidth="2"
            />
            <circle
              cx="450"
              cy="55"
              r="4"
              fill="white"
              stroke="#000000"
              strokeWidth="2"
            />
            <circle
              cx="600"
              cy="45"
              r="4"
              fill="white"
              stroke="#000000"
              strokeWidth="2"
            />
          </svg>

          {/* Etiquetas del Eje X (Fechas) */}
          <div className="absolute bottom-0 inset-x-12 flex justify-between text-[11px] text-gray-400 font-medium">
            {chartData.map((d, index) => (
              <span key={index}>{d.date}</span>
            ))}
          </div>
        </div>

        {/* Leyenda del Gráfico */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-xs mt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ea580c] inline-block"></span>
            <span className="text-gray-600 font-medium">
              Datasets certificados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-black inline-block"></span>
            <span className="text-gray-600 font-medium">
              Metadatos obligatorios completos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
