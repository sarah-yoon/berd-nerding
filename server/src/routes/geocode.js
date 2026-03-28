const router = require('express').Router()
const { geocode, suggest } = require('../controllers/geocodeController')

const requireQ = (req, res, next) => {
  if (!req.query.q) {
    const err = new Error('q is required')
    err.status = 400
    return next(err)
  }
  next()
}

router.get('/', requireQ, geocode)
router.get('/suggest', requireQ, suggest)

module.exports = router
