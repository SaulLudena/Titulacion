export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const API = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login' // ajusta a tu ruta de login
    throw new ApiError(401, 'Sesión vencida')
  }
  if (res.status === 403) {
    window.location.href = '/dashboard/unauthorized' // ajusta a tu ruta
    throw new ApiError(403, 'Sin permiso')
  }

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {}

  if (!res.ok) {
    const msg =
      data?.detail ?? data?.message ?? data?.error ?? `Error ${res.status}`
    throw new ApiError(
      res.status,
      typeof msg === 'string' ? msg : JSON.stringify(msg),
    )
  }
  return data // null si fue 204
}
