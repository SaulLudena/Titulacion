import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  HiDatabase,
  HiChatAlt2,
  HiChartBar,
  HiDocumentReport,
  HiShieldCheck,
  HiClipboardList,
  HiFolder,
  HiLogout,
  HiUser,
  HiClock,
} from 'react-icons/hi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function Sidebar({ role: customRole }) {
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState('analista')
  const [user, setUser] = useState({
    nombre: 'Cargando...',
    correo: '...',
  })

  // Normalizar la cadena de rol
  const normalizeRole = (r) => {
    if (!r) return 'analista'
    const lower = r.toLowerCase()
    if (lower.includes('analist') || lower.includes('analytic'))
      return 'analista'
    if (lower.includes('ejecutiv') || lower.includes('executiv'))
      return 'ejecutivo'
    if (lower.includes('cumplimien') || lower.includes('compliance'))
      return 'cumplimiento'
    return lower
  }

  // Cargar datos reales del usuario autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) return

      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (res.ok) {
          const data = await res.json()
          setUser({
            nombre:
              data.nombre ||
              data.name ||
              data.full_name ||
              data.email?.split('@')[0] ||
              'Usuario',
            correo: data.correo || data.email || '',
          })

          const fetchedRole = normalizeRole(data.rol || data.role)
          if (!customRole) {
            setCurrentRole(fetchedRole)
          }
        }
      } catch (error) {
        console.error('Error al obtener perfil en Sidebar:', error)
      }
    }

    fetchUserData()
  }, [])

  // Detectar el rol dinámicamente según props o URL
  useEffect(() => {
    if (customRole) {
      setCurrentRole(normalizeRole(customRole))
      return
    }

    const path = router.asPath || router.pathname || ''
    if (path.includes('/dashboard/executive')) {
      setCurrentRole('ejecutivo')
    } else if (path.includes('/dashboard/complianceoffice')) {
      setCurrentRole('cumplimiento')
    } else {
      setCurrentRole('analista')
    }
  }, [router.asPath, router.pathname, customRole])

  // Etiquetas para la cabecera
  const roleLabels = {
    analista: 'Analítica de Datos',
    ejecutivo: 'Ejecutivo / Gerencia',
    cumplimiento: 'Oficialía de Cumplimiento',
  }

  // Configuración de menús por rol
  const menuConfig = {
    analista: {
      sections: [
        {
          title: 'Explorar',
          items: [
            {
              name: 'Catálogo',
              path: '/dashboard/analyticteam',
              icon: HiDatabase,
            },
            {
              name: 'Agente Conversacional',
              path: '/dashboard/analyticteam/chat',
              icon: HiChatAlt2,
            },
          ],
        },
        {
          title: 'Mis gestiones',
          items: [
            {
              name: 'Mis solicitudes',
              path: '/dashboard/analyticteam/myrequestspage',
              icon: HiFolder,
            },
          ],
        },
      ],
    },
    ejecutivo: {
      sections: [
        {
          title: 'ACCESOS Y GOBIERNO',
          items: [
            {
              name: 'Por aprobar',
              path: '/dashboard/executive',
              icon: HiFolder,
            },
            {
              name: 'Certificar dataset',
              path: '/dashboard/executive/certifydataset',
              icon: HiShieldCheck,
            },
            {
              name: 'Nuevo proceso core',
              path: '/dashboard/executive/newcoreprocess',
              icon: HiClipboardList,
            },
          ],
        },
        {
          title: 'SEGUIMIENTO',
          items: [
            {
              name: 'Indicadores',
              path: '/dashboard/executive/indicators',
              icon: HiChartBar,
            },
            {
              name: 'Uso de datasets',
              path: '/dashboard/executive/datasetusage',
              icon: HiDocumentReport,
            },
            {
              name: 'Bitácora',
              path: '/dashboard/executive/binnacle',
              icon: HiDatabase,
            },
          ],
        },
      ],
    },
    cumplimiento: {
      sections: [
        {
          title: 'CUMPLIMIENTO',
          items: [
            {
              name: 'Segunda aprobación',
              path: '/dashboard/complianceoffice',
              icon: HiShieldCheck,
            },
            {
              name: 'Bitácora',
              path: '/dashboard/complianceoffice/audit-log',
              icon: HiClock,
            },
          ],
        },
      ],
    },
  }

  const currentConfig = menuConfig[currentRole] || menuConfig.analista

  // Cierre de sesión completo: limpia cookies, sessionStorage y localStorage
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()

      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    }

    router.push('/')
  }

  return (
    <aside className="w-64 h-screen bg-white text-gray-900 flex flex-col justify-between border-r border-gray-200 p-6 font-sans rounded-none shrink-0">
      <div>
        {/* Cabecera del Banco */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#ea580c] flex items-center justify-center rounded-none shadow-sm">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none text-gray-900">
              Banco Andino
            </h2>
            <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider font-medium">
              {roleLabels[currentRole]}
            </p>
          </div>
        </div>

        {/* Secciones del Menú */}
        <div className="space-y-6">
          {currentConfig.sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="px-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = item.icon
                  const isActive = router.asPath === item.path

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#ea580c] text-white font-semibold shadow-sm'
                          : 'text-gray-600 hover:bg-[#ea580c]/10 hover:text-[#ea580c]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bloque de Perfil de Usuario Real y Logout */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-none">
          <div className="w-7 h-7 bg-gray-200 text-gray-700 flex items-center justify-center rounded-none shrink-0 font-bold text-xs">
            <HiUser className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user.nombre}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{user.correo}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-none transition-colors cursor-pointer font-medium"
        >
          <HiLogout className="w-4 h-4 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
