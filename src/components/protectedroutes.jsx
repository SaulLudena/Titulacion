import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const API_BASE_URL = 'https://banco-andino-backend.vercel.app'

export default function ProtectedRoute({ children, allowedRole }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || sessionStorage.getItem('token')
          : null

      if (!token) {
        router.push('/')
        return
      }

      try {
        // Validación en tiempo real contra el backend del Banco Andino
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error('Token inválido o expirado')
        }

        const userData = await res.json()
        const userRole = String(
          userData.rol || userData.role || '',
        ).toLowerCase()
        const requiredRole = allowedRole.toLowerCase()

        // Verificamos si el rol coincide con la ruta protegida
        if (
          userRole.includes(requiredRole) ||
          requiredRole.includes(userRole)
        ) {
          setAuthorized(true)
        } else {
          // Si no le corresponde, lo mandamos a la vista de acceso restringido
          router.push('/unauthorized')
        }
      } catch (err) {
        console.error('Error de autorización:', err)
        localStorage.clear()
        sessionStorage.clear()
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    verifyAccess()
  }, [router, allowedRole])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white font-sans">
        <div className="text-xs text-gray-500 animate-pulse font-medium">
          Verificando permisos corporativos...
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
