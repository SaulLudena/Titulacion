import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function ExecutiveLayout({ children }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Revisar rol guardado en caché de sesión
      const cachedRole = sessionStorage.getItem('user_role')

      // Si hay un rol en caché y NO es 'ejecutivo', lo redirigimos a unauthorized de inmediato
      if (cachedRole && cachedRole !== 'ejecutivo') {
        router.push('/unauthorized')
        return
      }

      // Si el rol verificado en esta sesión es 'ejecutivo', se le da paso libre sin consultar a la API
      if (cachedRole === 'ejecutivo') {
        setAuthorized(true)
        setLoading(false)
        return
      }

      // 2. Si no hay caché de rol, verificamos el token
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token')

      if (!token) {
        router.push('/')
        return
      }

      try {
        // 3. Consulta de seguridad al backend de Banco Andino
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) throw new Error('Sesión o token no válido')

        const data = await res.json()
        const userRole = String(data.rol || data.role || '').toLowerCase()

        if (userRole.includes('ejecutivo')) {
          sessionStorage.setItem('user_role', 'ejecutivo')
          setAuthorized(true)
        } else {
          // Guardamos su rol real para que las navegaciones futuras sean inmediatas
          sessionStorage.setItem('user_role', userRole)
          router.push('/unauthorized')
        }
      } catch (err) {
        console.error('Error de autenticación:', err)
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user_role')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white font-sans">
        <div className="text-xs text-gray-400 animate-pulse font-medium">
          Cargando entorno seguro ejecutivo...
        </div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar role="executive" />
      <main className="flex-1 h-full overflow-y-auto p-8 bg-[#f8f9fa]">
        {children}
      </main>
    </div>
  )
}
