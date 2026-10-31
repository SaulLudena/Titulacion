// src/utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchWithAuth(endpoint, options = {}) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || sessionStorage.getItem('token')
      : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Si el backend responde con 401 (Token expirado o no autorizado)
    if (response.status === 401) {
      handleSessionExpired()
      throw new Error('Sesión expirada')
    }

    return response
  } catch (error) {
    if (error.message === 'Sesión expirada') {
      throw error
    }
    throw error
  }
}

export function handleSessionExpired() {
  if (typeof window === 'undefined') return

  // Limpiar tokens almacenados
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')

  // Mostrar el pop-up solicitado
  alert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.')

  // Redirigir al login
  window.location.href = '/'
}
