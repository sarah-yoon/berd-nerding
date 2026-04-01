const cache = new Map() // "lat,lng" → formatted address string
const pending = new Map() // "lat,lng" → Promise (dedup in-flight requests)
const queue = [] // queued resolve callbacks
let lastRequest = 0

function processQueue() {
  if (queue.length === 0) return
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastRequest))
  setTimeout(() => {
    const next = queue.shift()
    if (next) next()
    if (queue.length > 0) processQueue()
  }, wait)
}

function enqueue() {
  return new Promise(resolve => {
    queue.push(resolve)
    if (queue.length === 1) processQueue()
  })
}

export async function reverseGeocode(lat, lng) {
  const key = `${lat},${lng}`
  if (cache.has(key)) return cache.get(key)
  if (pending.has(key)) return pending.get(key)

  const promise = (async () => {
    await enqueue()
    lastRequest = Date.now()
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'BerdNerding/1.0' } }
      )
      if (!res.ok) throw new Error(res.status)
      const data = await res.json()
      const addr = data.address || {}

      const street = addr.road || addr.pedestrian || addr.footway || ''
      const city = addr.city || addr.town || addr.village || addr.hamlet || addr.county || ''
      const state = addr.state || ''
      const country = addr.country || ''

      const parts = []
      if (street) parts.push(street)
      if (city) parts.push(city)
      if (state) parts.push(state)
      if (!state && country) parts.push(country)

      const result = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || ''
      cache.set(key, result)
      return result
    } catch {
      cache.set(key, '')
      return ''
    } finally {
      pending.delete(key)
    }
  })()

  pending.set(key, promise)
  return promise
}
