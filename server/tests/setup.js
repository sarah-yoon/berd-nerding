// Mock redis so tests never need a real Redis instance
jest.mock('../src/db/redis', () => {
  const store = new Map()
  const redis = {
    get: jest.fn(async (key) => store.get(key) ?? null),
    set: jest.fn(async (key, value) => { store.set(key, value) }),
    on:  jest.fn(),
    _store: store,
  }
  return redis
})

beforeEach(() => {
  const redis = require('../src/db/redis')
  redis._store.clear()
})

// Mock mysql pool — tests that need DB use their own mock
jest.mock('../src/db/mysql', () => ({
  pool: { query: jest.fn() },
  runSetup: jest.fn(),
}))
