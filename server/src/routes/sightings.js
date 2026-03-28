const router = require('express').Router()
const requireAuth = require('../middleware/auth')
const validate = require('../middleware/validate')
const { list, create, update, remove } = require('../controllers/sightingsController')

const createSchema = {
  species_name: { required: true },
  date:         { required: true, isDate: true },
  count:        { isInt: true, min: 1 },
}

router.get('/',      requireAuth, list)
router.post('/',     requireAuth, validate(createSchema), create)
router.patch('/:id', requireAuth, update)
router.delete('/:id',requireAuth, remove)

module.exports = router
