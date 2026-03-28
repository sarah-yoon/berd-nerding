const request = require('supertest')
const app = require('../index')
const { getCache, setCache } = require('../src/services/cacheService')
const ebirdService = require('../src/services/ebirdService')
const geocodeService = require('../src/services/geocodeService')

jest.mock('../src/services/cacheService')
jest.mock('../src/services/ebirdService')
jest.mock('../src/services/geocodeService')

beforeEach(() => jest.clearAllMocks())

test('GET /api/birds/nearby returns 400 if lat missing', async () => {
  const res = await request(app).get('/api/birds/nearby?lng=-74&dist=10')
  expect(res.status).toBe(400)
})

test('GET /api/birds/nearby returns cached result on hit', async () => {
  const cached = [{ speciesCode: 'amero' }]
  getCache.mockResolvedValueOnce(cached)
  const res = await request(app).get('/api/birds/nearby?lat=40.71&lng=-74.00&dist=10')
  expect(res.status).toBe(200)
  expect(res.body).toEqual(cached)
  expect(ebirdService.getNearby).not.toHaveBeenCalled()
})

test('GET /api/birds/nearby calls eBird on cache miss and caches result', async () => {
  getCache.mockResolvedValueOnce(null)
  const data = [{ speciesCode: 'baeagl' }]
  ebirdService.getNearby.mockResolvedValueOnce(data)
  const res = await request(app).get('/api/birds/nearby?lat=40.71&lng=-74.00&dist=10')
  expect(res.status).toBe(200)
  expect(setCache).toHaveBeenCalled()
  expect(res.body).toEqual(data)
})

test('GET /api/geocode returns 400 if q missing', async () => {
  const res = await request(app).get('/api/geocode')
  expect(res.status).toBe(400)
})

test('GET /api/geocode returns cached result', async () => {
  const cached = { lat: 40.71, lng: -74.00, display_name: 'New York' }
  getCache.mockResolvedValueOnce(cached)
  const res = await request(app).get('/api/geocode?q=New+York')
  expect(res.status).toBe(200)
  expect(res.body.lat).toBe(40.71)
  expect(geocodeService.geocode).not.toHaveBeenCalled()
})

test('GET /api/geocode calls Nominatim on miss', async () => {
  getCache.mockResolvedValueOnce(null)
  geocodeService.geocode.mockResolvedValueOnce({ lat: 40.71, lng: -74.00, display_name: 'New York' })
  const res = await request(app).get('/api/geocode?q=New+York')
  expect(res.status).toBe(200)
  expect(setCache).toHaveBeenCalled()
})
