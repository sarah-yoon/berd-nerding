const axios = require('axios')

async function geocode(q) {
  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'BirdMap/1.0 (portfolio project; peresarahyoon@gmail.com)' },
  })
  if (!data.length) {
    const err = new Error('Location not found')
    err.status = 404
    throw err
  }
  const lat = parseFloat(data[0].lat)
  const lng = parseFloat(data[0].lon)
  if (!isFinite(lat) || !isFinite(lng)) {
    const err = new Error('Invalid coordinates from geocoding service')
    err.status = 502
    throw err
  }
  return { lat, lng, display_name: data[0].display_name }
}

async function suggest(q) {
  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q, format: 'json', limit: 6, addressdetails: 1 },
    headers: { 'User-Agent': 'BirdMap/1.0 (portfolio project; peresarahyoon@gmail.com)' },
  })
  return data
    .filter(r => isFinite(parseFloat(r.lat)) && isFinite(parseFloat(r.lon)))
    .map(r => ({
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      type: r.type,
    }))
}

module.exports = { geocode, suggest }
