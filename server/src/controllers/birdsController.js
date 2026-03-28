const { getCache, setCache } = require('../services/cacheService')
const ebirdService = require('../services/ebirdService')

function cacheProxy(keyFn, fetchFn, ttl) {
  return async (req, res) => {
    const key = keyFn(req.query)
    const cached = await getCache(key)
    if (cached) return res.json(cached)
    const data = await fetchFn(req.query)
    await setCache(key, data, ttl)
    res.json(data)
  }
}

const nearby = cacheProxy(
  ({ lat, lng, dist }) => `nearby:${parseFloat(lat)}:${parseFloat(lng)}:${parseFloat(dist)}`,
  ({ lat, lng, dist }) => ebirdService.getNearby(lat, lng, dist),
  3600
)

const hotspots = cacheProxy(
  ({ lat, lng }) => `hotspots:${parseFloat(lat)}:${parseFloat(lng)}`,
  ({ lat, lng }) => ebirdService.getHotspots(lat, lng),
  3600
)

const species = cacheProxy(
  ({ q }) => `species:${q}`,
  ({ q }) => ebirdService.getSpecies(q),
  86400
)

module.exports = { nearby, hotspots, species }
