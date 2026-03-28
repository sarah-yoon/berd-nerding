const Redis = require('ioredis')
const config = require('../config')

const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  enableOfflineQueue: false,
})

redis.on('error', (err) => {
  console.warn('Redis unavailable:', err.message)
})

module.exports = redis
