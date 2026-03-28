import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

describe('fetchPhylopicIcon', () => {
  it('returns SVG URL for a known species', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ build: 536 }) }) // getBuild
      .mockResolvedValueOnce({ json: async () => ({
        _embedded: { items: [{ _links: { vectorFile: { href: 'https://images.phylopic.org/test.svg' } } }] }
      }) })

    const { fetchPhylopicIcon } = await import('../src/services/phylopicService.js')
    const url = await fetchPhylopicIcon('Turdus migratorius')
    expect(url).toBe('https://images.phylopic.org/test.svg')
  })

  it('returns null when no items found', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ build: 536 }) })
      .mockResolvedValueOnce({ json: async () => ({ _embedded: { items: [] } }) })

    const { fetchPhylopicIcon } = await import('../src/services/phylopicService.js')
    const url = await fetchPhylopicIcon('Unknown species')
    expect(url).toBeNull()
  })

  it('returns null on fetch error', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ build: 536 }) })
      .mockRejectedValueOnce(new Error('network error'))

    const { fetchPhylopicIcon } = await import('../src/services/phylopicService.js')
    const url = await fetchPhylopicIcon('Branta canadensis')
    expect(url).toBeNull()
  })
})

describe('fetchBirdPhoto', () => {
  it('returns photoUrl and attribution when found', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({
      results: [{ default_photo: { medium_url: 'https://example.com/robin.jpg', attribution: '© John Doe' } }]
    }) })

    const { fetchBirdPhoto } = await import('../src/services/iNaturalistService.js')
    const result = await fetchBirdPhoto('Turdus migratorius')
    expect(result).toEqual({ photoUrl: 'https://example.com/robin.jpg', attribution: '© John Doe' })
  })

  it('returns null when no results', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ results: [] }) })

    const { fetchBirdPhoto } = await import('../src/services/iNaturalistService.js')
    const result = await fetchBirdPhoto('Unknown species')
    expect(result).toBeNull()
  })

  it('returns null on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'))

    const { fetchBirdPhoto } = await import('../src/services/iNaturalistService.js')
    const result = await fetchBirdPhoto('Turdus migratorius')
    expect(result).toBeNull()
  })
})
