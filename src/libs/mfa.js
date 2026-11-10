const BASE = process.env.NEXT_PUBLIC_SUPABASE_TOKEN_URL.split('/token')[0]
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

async function authFetch(path, token, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body && JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      data.msg ||
        data.message ||
        data.error_description ||
        `Error ${res.status}`,
    )
  }
  return data
}

export async function factoresTotp(token) {
  const usuario = await authFetch('/user', token)
  return (usuario.factors || []).filter((f) => f.factor_type === 'totp')
}

export async function iniciarRegistro(token) {
  const pendientes = (await factoresTotp(token)).filter(
    (f) => f.status !== 'verified',
  )
  for (const f of pendientes) {
    await authFetch(`/factors/${f.id}`, token, { method: 'DELETE' }).catch(
      () => {},
    )
  }
  const factor = await authFetch('/factors', token, {
    method: 'POST',
    body: {
      factor_type: 'totp',
      friendly_name: `app-${Date.now()}`,
      issuer: 'Banco Andino',
    },
  })
  const svg = factor.totp.qr_code
  return {
    factorId: factor.id,
    qr: svg.startsWith('data:')
      ? svg
      : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    secreto: factor.totp.secret,
  }
}

export async function verificarCodigo(token, factorId, code) {
  const reto = await authFetch(`/factors/${factorId}/challenge`, token, {
    method: 'POST',
    body: {},
  })
  return authFetch(`/factors/${factorId}/verify`, token, {
    method: 'POST',
    body: { challenge_id: reto.id, code },
  })
}
