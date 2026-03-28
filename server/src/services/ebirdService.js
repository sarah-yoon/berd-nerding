const axios = require('axios')
const config = require('../config')

const BASE = 'https://api.ebird.org/v2'
const headers = { 'X-eBirdApiToken': config.ebird.apiKey }

async function getNearby(lat, lng, dist) {
  const { data } = await axios.get(`${BASE}/data/obs/geo/recent`, {
    params: { lat, lng, dist, fmt: 'json' }, headers,
  })
  return data
}

async function getHotspots(lat, lng) {
  const { data } = await axios.get(`${BASE}/ref/hotspot/geo`, {
    params: { lat, lng, fmt: 'json' }, headers,
  })
  return data
}

async function getSpecies(q) {
  const { data } = await axios.get(`${BASE}/ref/taxon/find`, {
    params: { q, fmt: 'json' }, headers,
  })
  return data
}

module.exports = { getNearby, getHotspots, getSpecies }
