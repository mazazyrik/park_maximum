const BASE = '/api/v1'

export async function fetchTariffs() {
  const res = await fetch(`${BASE}/tariffs/`)
  if (!res.ok) throw new Error('tariffs fetch failed')
  return res.json()
}

export async function fetchRoutes() {
  const res = await fetch(`${BASE}/routes/`)
  if (!res.ok) throw new Error('routes fetch failed')
  return res.json()
}

export async function createOrder(data) {
  const res = await fetch(`${BASE}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw json
  return json
}
