const router = require('express').Router()
const { nearby, hotspots, species } = require('../controllers/birdsController')

function requireQuery(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => !req.query[f])
    if (missing.length) {
      const err = new Error(`Missing required query params: ${missing.join(', ')}`)
      err.status = 400
      return next(err)
    }
    const dist = Number(req.query.dist)
    if (req.query.dist && (dist < 5 || dist > 50)) {
      const err = new Error('dist must be between 5 and 50')
      err.status = 400
      return next(err)
    }
    next()
  }
}

router.get('/nearby',   requireQuery('lat', 'lng', 'dist'), nearby)
router.get('/hotspots', requireQuery('lat', 'lng'), hotspots)
router.get('/species',  requireQuery('q'), species)

module.exports = router
