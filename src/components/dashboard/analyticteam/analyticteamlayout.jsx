import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/src/components/dashboard/sidebar/sidebar'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://banco-andino-backend.vercel.app'

export default function AnalyticTeamLayout({ children }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const cachedRole = sessionStorage.getItem('user_role')
      if (cachedRole === 'analista') {
        setAuthorized(true)
        setLoading(false)
        return
      }

      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token')

      if (!token) {
        router.push('/')
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) throw new Error('Sesión invalida')

        const data = await res.json()
        const userRole = String(data.rol || data.role || '').toLowerCase()

        if (userRole.includes('analista')) {
          sessionStorage.setItem('user_role', 'analista')
          setAuthorized(true)
        } else {
          router.push('/unauthorized')
        }
      } catch (err) {
        console.error('Error de autenticación:', err)
        localStorage.clear()
        sessionStorage.clear()
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
          Cargando módulo de analítica...
        </div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Tu Sidebar existente integrado limpiamente */}
      <Sidebar role="analyticteam" />
      <main className="flex-1 h-full overflow-y-auto p-8 bg-[#f8f9fa]">
        {children}
      </main>
    </div>
  )
}
