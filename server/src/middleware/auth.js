const jwt = require('jsonwebtoken')
const config = require('../config')

function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    const err = new Error('Unauthorized')
    err.status = 401
    return next(err)
  }
  try {
    req.user = jwt.verify(header.slice(7), config.jwt.secret)
    next()
  } catch {
    const err = new Error('Invalid or expired token')
    err.status = 401
    next(err)
  }
}

module.exports = requireAuth
