import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('correoempresa@edu.com')
  const [password, setPassword] = useState('••••••••••••')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Logging in:', { email, password })
    router.push('/dashboard/analyticteam/')
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 sm:p-6 bg-white font-sans overflow-hidden">
      <div className="w-full h-full flex flex-col md:flex-row items-stretch gap-6 md:gap-12">
        <div className="w-full md:w-1/2 h-full bg-black p-6 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div>
            <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl leading-[1.15] z-10 tracking-tight font-light">
              Encuentra. Gobierna.
              <br />
              Crece.
              <br />
            </h1>
            <span className="mt-10 text-xs sm:text-sm   bg-black text-white">
              Powered by{' '}
              <span className="font-semibold text-[#ea580c]">Grupo 06</span>
            </span>
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-end justify-start pl-8 gap-3 opacity-90">
            <div className="w-16 h-3/5 bg-gradient-to-t from-[#ea580c] via-[#d97706] to-transparent rounded-t-none blur-[1px]" />
            <div className="w-12 h-4/5 bg-gradient-to-t from-[#c2410c] via-[#ea580c] to-transparent rounded-t-none blur-[1px]" />
            <div className="w-16 h-2/3 bg-gradient-to-t from-[#9a3412] via-[#c2410c] to-transparent rounded-t-none blur-[2px]" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#ea580c]/60 to-transparent blur-2xl pointer-events-none" />
        </div>

        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-2 sm:px-6">
          {/* Encabezados */}
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Inicia sesión
            </h2>
            <p className="text-gray-400 text-xs font-normal">
              Bienvenido, inicia sesión para continuar
            </p>
            <div className="w-full h-[1px] bg-gray-100 mt-3" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            {/* Campo Email */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Email corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correoempresa@edu.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-orange-400/80 text-gray-900 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all placeholder:text-gray-400 tracking-widest font-bold"
              />
            </div>

            {/* Botón Principal Naranja */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#ea580c] hover:bg-[#d94e09] text-white font-medium text-sm shadow-sm transition-all mt-2 cursor-pointer"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
