import { useEffect } from 'react'
import '@/styles/globals.css' // O tus rutas de estilos globales

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Solo se ejecuta en el navegador (client-side)
    if (typeof window === 'undefined') return

    // Respaldamos el fetch original del navegador
    const originalFetch = window.fetch

    // Sobrescribimos el fetch global
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)

      // Si el servidor detecta que el token expiró o no es válido (401)
      if (response.status === 401) {
        // Evitamos que salten múltiples alertas si hay varios fetch simultáneos
        if (!window._sessionExpiredAlertShown) {
          window._sessionExpiredAlertShown = true

          // Limpiamos las credenciales de la sesión
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')

          // Mostramos el pop-up solicitado
          alert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.')

          // Redirigimos al login (ajusta la ruta '/' si tu login está en otra ruta)
          window.location.href = '/'
        }
      }

      return response
    }

    // Limpieza al desmontar
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return <Component {...pageProps} />
}
