import { useRouter } from 'next/router'
import { useState } from 'react'
import { HiOutlineChartBar } from 'react-icons/hi'

const SUPABASE_TOKEN_URL = process.env.NEXT_PUBLIC_SUPABASE_TOKEN_URL
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Mapeo de roles (los que devuelve el backend) a rutas
const roleRoutes = {
  analista: '/dashboard/analyticteam',
  ejecutivo: '/dashboard/executive',
  cumplimiento: '/dashboard/complianceoffice',
}

// Usuarios semilla del prototipo (solo rellenan y ejecutan el login real)
const SEED_PASSWORD = 'bancoandino'
const seedUsers = [
  { label: 'Giacomo (Analista)', email: 'giacomo.delgado@bancoandino.pe' },
  { label: 'Wilson (Ejecutivo)', email: 'wilson.cornejo@bancoandino.pe' },
  { label: 'Jorge (Cumplimiento)', email: 'jorge.cerdan@bancoandino.pe' },
]

// Barras decorativas del panel izquierdo
const heroBars = [
  { height: '15%', color: '#7c2d12' },
  { height: '24%', color: '#9a3412' },
  { height: '32%', color: '#c2410c' },
  { height: '46%', color: '#ea580c' },
  { height: '36%', color: '#fb923c' },
  { height: '26%', color: '#fdba74' },
  { height: '16%', color: '#fed7aa' },
]

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('giacomo.delgado@bancoandino.pe')
  const [password, setPassword] = useState(SEED_PASSWORD)
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Lógica unificada de login
  const login = async (loginEmail, loginPassword) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Limpieza absoluta previa para evitar conflictos de sesiones anteriores
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // 2. Autenticación con Supabase Auth
      let authRes
      try {
        authRes = await fetch(SUPABASE_TOKEN_URL, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        })
      } catch {
        throw new Error(
          'No se pudo conectar con el servidor de autenticación. Revisa tu conexión.',
        )
      }

      if (!authRes.ok) {
        throw new Error(
          authRes.status === 400 || authRes.status === 401
            ? 'Correo o contraseña incorrectos.'
            : 'Error de autenticación. Inténtalo nuevamente.',
        )
      }

      const authData = await authRes.json()
      const token = authData.access_token
      if (!token) {
        throw new Error('La respuesta de autenticación no incluyó un token.')
      }

      // 3. Obtener el rol desde el backend (única fuente de verdad)
      let meRes
      try {
        meRes = await fetch(`${API_BASE_URL}/api/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      } catch {
        throw new Error('No se pudo consultar el perfil del usuario (/api/me).')
      }

      if (!meRes.ok) {
        throw new Error(
          `No se pudo obtener el perfil del usuario (código ${meRes.status}).`,
        )
      }

      const userData = await meRes.json()
      const userRole = String(userData.rol || userData.role || '').toLowerCase()
      const destination = roleRoutes[userRole]

      if (!destination) {
        throw new Error(
          `Tu rol (${userRole || 'sin rol'}) no tiene un panel asignado.`,
        )
      }

      // 4. Guardar la sesión en el almacenamiento seleccionado
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', token)
      if (authData.refresh_token) {
        storage.setItem('refresh_token', authData.refresh_token)
      }

      // 5. Redirección dura para garantizar la limpieza total del estado en memoria
      window.location.href = destination
    } catch (err) {
      console.error(err)
      setError(err.message || 'Ocurrió un error al iniciar sesión.')
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email, password)
  }

  const handleSelectSeedUser = (selectedEmail) => {
    setEmail(selectedEmail)
    setPassword(SEED_PASSWORD)
    login(selectedEmail, SEED_PASSWORD)
  }

  return (
    <div className="w-full h-screen flex bg-white font-sans overflow-hidden">
      {/* Panel izquierdo */}
      <div className="hidden md:flex md:w-1/2 h-full bg-[#0a0a0a] relative overflow-hidden flex-col px-8 lg:px-12 py-8">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-[#ea580c] flex items-center justify-center rounded-none">
            <HiOutlineChartBar className="w-4 h-4 text-[#0a0a0a]" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-white">
              Catálogo de Datos
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Banco Andino S.A.C.
            </p>
          </div>
        </div>

        <div className="mt-16 lg:mt-20 relative z-10 max-w-md">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-light leading-[1.08] tracking-tight text-white">
            Encuentra.
            <br />
            Gobierna.
            <br />
            <span className="text-[#fb923c] font-normal">Crece.</span>
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-gray-300">
            Un catálogo de datasets con gobierno incorporado y un agente
            conversacional que responde con metadatos y cita siempre sus
            fuentes.
          </p>
        </div>

        <div
          className="absolute bottom-0 left-8 lg:left-12 h-full flex items-end gap-2 pointer-events-none"
          aria-hidden="true"
        >
          {heroBars.map((bar, i) => (
            <div
              key={i}
              className="w-9 lg:w-12 xl:w-14"
              style={{ height: bar.height, backgroundColor: bar.color }}
            />
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Inicia sesión
            </h2>
            <p className="text-gray-400 text-xs font-normal">
              Usa tu correo corporativo del Banco Andino. Verás las opciones que
              corresponden a tu rol.
            </p>
            <div className="w-full h-[1px] bg-gray-100 mt-3" />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-none"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-medium text-gray-500 mb-1"
              >
                Correo corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="giacomo.delgado@bancoandino.pe"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-medium text-gray-500 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-orange-400/80 text-gray-900 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#ea580c] border-gray-300 rounded-none focus:ring-[#ea580c] accent-[#ea580c]"
                />
                <span className="text-gray-700 font-medium">
                  Mantener la sesión iniciada
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#ea580c] hover:bg-[#d94e09] text-white font-medium text-sm shadow-sm transition-all mt-2 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Autenticando...' : 'Iniciar sesión'}</span>
              {!loading && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Caja del Prototipo con Semillas */}
          <div className="mt-4 p-3 border border-dashed border-gray-300 rounded-none">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-2">
              <span>▷</span> REVISAR PROTOTIPO CON USUARIOS SEMILLA
            </div>

            <div className="flex flex-wrap gap-2">
              {seedUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectSeedUser(user.email)}
                  className="px-2.5 py-1.5 border border-gray-200 text-xs font-medium text-gray-800 hover:bg-gray-50 bg-white cursor-pointer disabled:opacity-50"
                >
                  {user.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
