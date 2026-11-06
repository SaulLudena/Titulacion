import { apiFetch } from './api'

export async function descargarDataset(datasetId) {
  const ticket = await apiFetch(`/api/datasets/${datasetId}/descarga`, {
    method: 'POST',
  })
  const res = await fetch(ticket.url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  if (!res.ok) throw new Error(`No se pudo descargar (${res.status})`)
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = ticket.archivo
  a.click()
  URL.revokeObjectURL(url)
}
