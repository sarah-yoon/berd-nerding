const request = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../index')
const { pool } = require('../src/db/mysql')

beforeEach(() => jest.clearAllMocks())

describe('POST /api/auth/register', () => {
  test('returns 400 if email missing', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ password: 'password123' })
    expect(res.status).toBe(400)
  })

  test('returns 400 if password too short', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'short' })
    expect(res.status).toBe(400)
  })

  test('returns 201 and token on success', async () => {
    pool.query
      .mockResolvedValueOnce([[]])         // check existing user
      .mockResolvedValueOnce([{ insertId: 1 }]) // insert user
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  test('returns 409 if email already exists', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]])
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'exists@test.com', password: 'password123' })
    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  test('returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('correctpass', 10)
    pool.query.mockResolvedValueOnce([[{ id: 1, email: 'a@b.com', password_hash: hash }]])
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })

  test('returns 200 and token on success', async () => {
    const hash = await bcrypt.hash('correctpass', 10)
    pool.query.mockResolvedValueOnce([[{ id: 1, email: 'a@b.com', password_hash: hash }]])
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'correctpass' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })
})
