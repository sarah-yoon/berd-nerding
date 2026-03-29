const cache = new Map() // "lat,lng" → formatted address string

export async function reverseGeocode(lat, lng) {
  const key = `${lat},${lng}`
  if (cache.has(key)) return cache.get(key)

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'BerdNerding/1.0' } }
    )
    const data = await res.json()
    const addr = data.address || {}

    const street = addr.road || addr.pedestrian || addr.footway || ''
    const houseNum = addr.house_number || ''
    const city = addr.city || addr.town || addr.village || addr.hamlet || addr.county || ''
    const state = addr.state || ''
    const country = addr.country || ''

    const parts = []
    if (street) parts.push(houseNum ? `${houseNum} ${street}` : street)
    if (city) parts.push(city)
    if (state) parts.push(state)
    if (!state && country) parts.push(country)

    const result = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || ''
    cache.set(key, result)
    return result
  } catch {
    cache.set(key, '')
    return ''
  }
}

/**
 * Reverse geocode all unique coordinates from a list of sightings.
 * Returns a Map of "lat,lng" → formatted address.
 * Rate-limited to avoid hitting Nominatim's 1 req/sec limit.
 */
export async function batchReverseGeocode(sightings) {
  const uniqueCoords = new Map()
  sightings.forEach(s => {
    const key = `${s.lat},${s.lng}`
    if (!uniqueCoords.has(key) && !cache.has(key)) {
      uniqueCoords.set(key, { lat: s.lat, lng: s.lng })
    }
  })

  // Process in batches of 3 with 1 second delay between batches
  const entries = [...uniqueCoords.entries()]
  for (let i = 0; i < entries.length; i += 3) {
    const batch = entries.slice(i, i + 3)
    await Promise.all(batch.map(([, { lat, lng }]) => reverseGeocode(lat, lng)))
    if (i + 3 < entries.length) {
      await new Promise(r => setTimeout(r, 1100)) // Nominatim rate limit
    }
  }

  // Return full cache for all coordinates in the sightings
  const result = new Map()
  sightings.forEach(s => {
    const key = `${s.lat},${s.lng}`
    if (cache.has(key)) result.set(key, cache.get(key))
  })
  return result
}
