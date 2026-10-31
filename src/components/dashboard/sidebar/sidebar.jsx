import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  HiOutlineViewGrid,
  HiOutlineChip,
  HiOutlineInbox,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineFolder,
  HiOutlineDatabase,
  HiOutlineClock,
  HiOutlineLogout,
} from 'react-icons/hi'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function Sidebar({ role: customRole }) {
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState('analista')
  const [user, setUser] = useState({ nombre: 'Cargando...' })

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

  // Rol del usuario que se muestra en el pie del sidebar
  const roleLabels = {
    analista: 'Analista',
    ejecutivo: 'Ejecutivo',
    cumplimiento: 'Oficial de Cumplimiento',
  }

  // Iniciales para el avatar (máximo 2 letras)
  const initials =
    user.nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || 'U'

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
              icon: HiOutlineViewGrid,
            },
            {
              name: 'ChatBot de Descubrimiento',
              path: '/dashboard/analyticteam/chat',
              icon: HiOutlineChip,
            },
          ],
        },
        {
          title: 'Mis gestiones',
          items: [
            {
              name: 'Mis solicitudes',
              path: '/dashboard/analyticteam/myrequestspage',
              icon: HiOutlineInbox,
            },
          ],
        },
      ],
    },
    ejecutivo: {
      sections: [
        {
          title: 'Accesos y gobierno',
          items: [
            {
              name: 'Por aprobar',
              path: '/dashboard/executive',
              icon: HiOutlineFolder,
            },
            {
              name: 'Certificar dataset',
              path: '/dashboard/executive/certifydataset',
              icon: HiOutlineShieldCheck,
            },
            {
              name: 'Nuevo proceso core',
              path: '/dashboard/executive/newcoreprocess',
              icon: HiOutlineClipboardList,
            },
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            {
              name: 'Indicadores',
              path: '/dashboard/executive/indicators',
              icon: HiOutlineChartBar,
            },
            {
              name: 'Uso de datasets',
              path: '/dashboard/executive/datasetusage',
              icon: HiOutlineDocumentReport,
            },
            {
              name: 'Bitácora',
              path: '/dashboard/executive/binnacle',
              icon: HiOutlineDatabase,
            },
          ],
        },
      ],
    },
    cumplimiento: {
      sections: [
        {
          title: 'Cumplimiento',
          items: [
            {
              name: 'Segunda aprobación',
              path: '/dashboard/complianceoffice',
              icon: HiOutlineShieldCheck,
            },
            {
              name: 'Bitácora',
              path: '/dashboard/complianceoffice/binnacle',
              icon: HiOutlineClock,
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
    <aside className="w-64 h-screen bg-[#0a0a0a] text-white flex flex-col justify-between p-5 font-sans rounded-none shrink-0">
      <div>
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#ea580c] flex items-center justify-center rounded-none">
            <HiOutlineChartBar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none text-white">
              Catálogo de Datos
            </h2>
            <p className="text-gray-400 text-[11px] mt-1">
              Banco Andino S.A.C.
            </p>
          </div>
        </div>

        {/* Secciones del menú */}
        <div className="space-y-6">
          {currentConfig.sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em]">
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
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                        isActive
                          ? 'bg-[#ea580c] text-white font-semibold'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
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

      {/* Pie: usuario, rol y cierre de sesión */}
      <div className="pt-4 border-t border-white/15">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 bg-[#ea580c] text-white flex items-center justify-center rounded-full shrink-0 font-semibold text-[11px]"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white leading-tight">
              {user.nombre}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {roleLabels[currentRole]}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <HiOutlineLogout className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
