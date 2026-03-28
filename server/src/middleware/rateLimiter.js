const rateLimit = require('express-rate-limit')
exports.global = rateLimit({ windowMs: 60_000, max: 100 })
exports.auth   = rateLimit({ windowMs: 15 * 60_000, max: 10 })
exports.birds  = rateLimit({ windowMs: 60_000, max: 60 })
