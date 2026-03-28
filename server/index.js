require('express-async-errors')
const express = require('express')
const cors = require('cors')
const config = require('./src/config')
const errorHandler = require('./src/middleware/errorHandler')
const rateLimiter = require('./src/middleware/rateLimiter')

const app = express()

app.use(cors({
  origin: [...new Set(['http://localhost:5173', config.frontendUrl].filter(Boolean))],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}))
app.use(express.json())
app.use(rateLimiter.global)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth',     rateLimiter.auth,  require('./src/routes/auth'))
app.use('/api/sightings',                   require('./src/routes/sightings'))
app.use('/api/birds',    rateLimiter.birds, require('./src/routes/birds'))
app.use('/api/geocode',                     require('./src/routes/geocode'))

app.use(errorHandler)

if (require.main === module) {
  app.listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  )
}

module.exports = app
