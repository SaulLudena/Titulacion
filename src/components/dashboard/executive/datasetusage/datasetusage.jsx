import React, { useState } from 'react'
import { HiDownload, HiArrowUp, HiArrowDown } from 'react-icons/hi'

export default function DatasetUsage() {
  const [fechaInicio, setFechaInicio] = useState('1 jul 2026')
  const [fechaFin, setFechaFin] = useState('30 sep 2026')

  // Datos para la tabla de uso
  const datasets = [
    {
      nombre: 'TB_CREDITO',
      consultas: 412,
      porcentaje: 17.0,
      porcentajeBarra: 100, // Relativo al valor más alto
      categoria: 'Sobreutilizado',
    },
    {
      nombre: 'pago',
      consultas: 331,
      porcentaje: 13.7,
      porcentajeBarra: 80,
      categoria: 'Sobreutilizado',
    },
    {
      nombre: 'TB_CLIENTE',
      consultas: 290,
      porcentaje: 12.0,
      porcentajeBarra: 70,
      categoria: 'Sobreutilizado',
    },
    {
      nombre: 'cuota',
      consultas: 255,
      porcentaje: 10.5,
      porcentajeBarra: 62,
      categoria: 'Sobreutilizado',
    },
    {
      nombre: 'TB_SALDO_CARTERA_MES',
      consultas: 214,
      porcentaje: 8.8,
      porcentajeBarra: 52,
      categoria: 'Sobreutilizado',
    },
    {
      nombre: 'gestion_cobranza',
      consultas: 168,
      porcentaje: 6.9,
      porcentajeBarra: 40,
      categoria: 'Normal',
    },
    // Fila con los tres puntos (...)
    {
      isEllipsis: true,
    },
    {
      nombre: 'colaterales_tasaciones.xlsx',
      consultas: 3,
      porcentaje: 0.1,
      porcentajeBarra: 2,
      categoria: 'Normal',
    },
    {
      nombre: 'TB_CLIENTE_BK',
      consultas: 2,
      porcentaje: 0.1,
      porcentajeBarra: 1.5,
      categoria: 'Infrautilizado',
    },
    {
      nombre: 'homologacion_producto_buro.xlsx',
      consultas: 1,
      porcentaje: 0.0,
      porcentajeBarra: 1,
      categoria: 'Infrautilizado',
    },
  ]

  const handleDescargar = () => {
    alert('Descargando reporte de uso de datasets...')
  }

  const handleGenerarReporte = () => {
    alert(`Generando reporte para el periodo: ${fechaInicio} - ${fechaFin}`)
  }

  return (
    <div className="font-sans bg-[#f8f9fa] min-h-screen text-gray-900 max-w-7xl">
      {/* Título y Subtítulo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Uso de datasets</h1>
        <p className="text-xs text-gray-500 mt-1">
          Datasets ordenados por consultas en el catálogo y con el agente. No
          mide el uso fuera de la aplicación.
        </p>
      </div>

      {/* Filtros de Periodo y Botones de Acción */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          {/* Selector de Rango de Fechas */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Periodo
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border border-gray-200 px-3 py-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#ea580c] w-36"
              />
              <span className="text-gray-400 text-xs">→</span>
              <input
                type="text"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border border-gray-200 px-3 py-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#ea580c] w-36"
              />
            </div>
          </div>

          {/* Botones de Descarga y Generación */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleDescargar}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer rounded-none"
            >
              <HiDownload className="w-4 h-4 text-gray-600" />
              <span>Descargar</span>
            </button>

            <button
              onClick={handleGenerarReporte}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-2.5 px-5 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer rounded-none"
            >
              <span>Generar reporte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados de Uso */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50">
                <th className="py-3 px-6">Dataset</th>
                <th className="py-3 px-6 text-right">Consultas</th>
                <th className="py-3 px-6 w-2/5"></th>
                <th className="py-3 px-6 text-left">% del total</th>
                <th className="py-3 px-6 text-center">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {datasets.map((item, idx) => {
                // Caso de la fila separadora de tres puntos (...)
                if (item.isEllipsis) {
                  return (
                    <tr key={`ellipsis-${idx}`} className="bg-gray-50/30">
                      <td
                        colSpan="5"
                        className="py-2 text-center text-gray-400 font-bold tracking-widest text-sm"
                      >
                        ...
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Nombre del Dataset */}
                    <td className="py-3.5 px-6 font-mono font-medium text-gray-900">
                      {item.nombre}
                    </td>

                    {/* Número de Consultas */}
                    <td className="py-3.5 px-6 text-right font-bold text-gray-900">
                      {item.consultas}
                    </td>

                    {/* Barra de Progreso Visual */}
                    <td className="py-3.5 px-6">
                      <div className="w-full bg-gray-100 h-2 rounded-none overflow-hidden">
                        <div
                          className="bg-[#ea580c] h-full"
                          style={{ width: `${item.porcentajeBarra}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Porcentaje del Total */}
                    <td className="py-3.5 px-6 text-gray-600 font-medium">
                      {item.porcentaje.toFixed(1)} %
                    </td>

                    {/* Categoría / Badge */}
                    <td className="py-3.5 px-6 text-center">
                      {item.categoria === 'Sobreutilizado' && (
                        <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] px-2.5 py-1 font-bold rounded-none">
                          <HiArrowUp className="w-3 h-3" /> Sobreutilizado
                        </span>
                      )}

                      {item.categoria === 'Normal' && (
                        <span className="inline-flex items-center border border-gray-200 text-gray-600 text-[10px] px-2.5 py-1 font-medium bg-gray-50 rounded-none">
                          Normal
                        </span>
                      )}

                      {item.categoria === 'Infrautilizado' && (
                        <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] px-2.5 py-1 font-bold rounded-none">
                          <HiArrowDown className="w-3 h-3" /> Infrautilizado
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
