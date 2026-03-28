const router = require('express').Router()
const validate = require('../middleware/validate')
const { register, login } = require('../controllers/authController')

const authSchema = {
  email:    { required: true, email: true },
  password: { required: true, minLength: 8 },
}

router.post('/register', validate(authSchema), register)
router.post('/login',    validate({ email: { required: true, email: true }, password: { required: true } }), login)

module.exports = router
