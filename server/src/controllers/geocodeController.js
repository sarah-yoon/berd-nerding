const { getCache, setCache } = require('../services/cacheService')
const geocodeService = require('../services/geocodeService')

async function geocode(req, res) {
  const q = req.query.q.toLowerCase().trim()
  const key = `geocode:${q}`
  const cached = await getCache(key)
  if (cached) return res.json(cached)
  const result = await geocodeService.geocode(q)
  await setCache(key, result, 86400)
  res.json(result)
}

async function suggest(req, res) {
  const q = req.query.q.toLowerCase().trim()
  const key = `geocode:suggest:${q}`
  const cached = await getCache(key)
  if (cached) return res.json(cached)
  const results = await geocodeService.suggest(q)
  await setCache(key, results, 3600)
  res.json(results)
}

module.exports = { geocode, suggest }
