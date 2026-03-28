const redis = require('../src/db/redis')
const { getCache, setCache } = require('../src/services/cacheService')

beforeEach(() => jest.clearAllMocks())

test('getCache returns parsed value on hit', async () => {
  redis.get.mockResolvedValueOnce(JSON.stringify({ bird: 'robin' }))
  const result = await getCache('test-key')
  expect(result).toEqual({ bird: 'robin' })
})

test('getCache returns null on miss', async () => {
  redis.get.mockResolvedValueOnce(null)
  const result = await getCache('missing')
  expect(result).toBeNull()
})

test('getCache returns null if redis throws', async () => {
  redis.get.mockRejectedValueOnce(new Error('Redis down'))
  const result = await getCache('key')
  expect(result).toBeNull()
})

test('setCache calls redis.set with EX', async () => {
  await setCache('key', { x: 1 }, 3600)
  expect(redis.set).toHaveBeenCalledWith('key', JSON.stringify({ x: 1 }), 'EX', 3600)
})

test('setCache does not throw if redis throws', async () => {
  redis.set.mockRejectedValueOnce(new Error('Redis down'))
  await expect(setCache('key', {}, 60)).resolves.toBeUndefined()
})
