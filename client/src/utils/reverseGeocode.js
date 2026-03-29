const cache = new Map() // "lat,lng" → formatted address string

async function reverseGeocodeOne(lat, lng) {
  const key = `${lat},${lng}`
  if (cache.has(key)) return cache.get(key)

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'BerdNerding/1.0' } }
    )
    if (!res.ok) throw new Error(res.status)
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
 * Reverse geocode unique coordinates progressively.
 * Calls onUpdate after each batch so UI updates incrementally.
 */
export async function batchReverseGeocode(sightings, onUpdate) {
  const uniqueCoords = []
  const seen = new Set()
  sightings.forEach(s => {
    const key = `${s.lat},${s.lng}`
    if (!seen.has(key)) {
      seen.add(key)
      if (!cache.has(key)) {
        uniqueCoords.push({ lat: s.lat, lng: s.lng, key })
      }
    }
  })

  // Process one at a time with 1.1s delay (Nominatim rate limit)
  for (let i = 0; i < uniqueCoords.length; i++) {
    const { lat, lng } = uniqueCoords[i]
    await reverseGeocodeOne(lat, lng)

    // Update state after every 5 geocodes or at the end
    if ((i + 1) % 5 === 0 || i === uniqueCoords.length - 1) {
      const result = new Map()
      sightings.forEach(s => {
        const k = `${s.lat},${s.lng}`
        if (cache.has(k)) result.set(k, cache.get(k))
      })
      onUpdate(result)
    }

    if (i < uniqueCoords.length - 1) {
      await new Promise(r => setTimeout(r, 1100))
    }
  }
}
