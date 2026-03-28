const redis = require('../db/redis')

async function getCache(key) {
  try {
    const val = await redis.get(key)
    return val !== null ? JSON.parse(val) : null
  } catch {
    return null
  }
}

async function setCache(key, data, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
  } catch {
    // Redis unavailable — continue without caching
  }
}

module.exports = { getCache, setCache }
