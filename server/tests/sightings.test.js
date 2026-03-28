const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../index')
const { pool } = require('../src/db/mysql')
const config = require('../src/config')

const token = jwt.sign({ id: 1, email: 'a@b.com' }, config.jwt.secret)
const auth = { Authorization: `Bearer ${token}` }
const otherToken = jwt.sign({ id: 2, email: 'b@c.com' }, config.jwt.secret)
const otherAuth = { Authorization: `Bearer ${otherToken}` }

beforeEach(() => jest.clearAllMocks())

test('GET /api/sightings requires auth', async () => {
  const res = await request(app).get('/api/sightings')
  expect(res.status).toBe(401)
})

test('GET /api/sightings returns user sightings', async () => {
  pool.query.mockResolvedValueOnce([[{ id: 1, species_name: 'Robin' }]])
  const res = await request(app).get('/api/sightings').set(auth)
  expect(res.status).toBe(200)
  expect(res.body[0].species_name).toBe('Robin')
})

test('POST /api/sightings returns 400 if species_name missing', async () => {
  const res = await request(app).post('/api/sightings').set(auth)
    .send({ date: '2026-03-24', count: 1 })
  expect(res.status).toBe(400)
})

test('POST /api/sightings creates sighting and returns isNewSpecies', async () => {
  pool.query
    .mockResolvedValueOnce([{ insertId: 5 }])
    .mockResolvedValueOnce([[]])
    .mockResolvedValueOnce([[{ id: 5, species_name: 'Robin', species_code: 'amero', user_id: 1 }]])
  const res = await request(app).post('/api/sightings').set(auth)
    .send({ species_name: 'Robin', species_code: 'amero', date: '2026-03-24', count: 1 })
  expect(res.status).toBe(201)
  expect(res.body.isNewSpecies).toBe(true)
})

test('DELETE /api/sightings/:id returns 403 if not owner', async () => {
  pool.query.mockResolvedValueOnce([[{ user_id: 1 }]])
  const res = await request(app).delete('/api/sightings/1').set(otherAuth)
  expect(res.status).toBe(403)
})

test('DELETE /api/sightings/:id deletes if owner', async () => {
  pool.query
    .mockResolvedValueOnce([[{ user_id: 1 }]])
    .mockResolvedValueOnce([{}])
  const res = await request(app).delete('/api/sightings/1').set(auth)
  expect(res.status).toBe(204)
})

test('PATCH /api/sightings/:id returns 403 if not owner', async () => {
  pool.query.mockResolvedValueOnce([[{ user_id: 1 }]])
  const res = await request(app).patch('/api/sightings/1').set(otherAuth)
    .send({ species_name: 'Eagle' })
  expect(res.status).toBe(403)
})

test('PATCH /api/sightings/:id updates if owner', async () => {
  pool.query
    .mockResolvedValueOnce([[{ user_id: 1 }]])                          // ownership check
    .mockResolvedValueOnce([{}])                                         // UPDATE
    .mockResolvedValueOnce([[{ id: 1, species_name: 'Eagle', user_id: 1 }]]) // SELECT updated
  const res = await request(app).patch('/api/sightings/1').set(auth)
    .send({ species_name: 'Eagle' })
  expect(res.status).toBe(200)
  expect(res.body.species_name).toBe('Eagle')
})
