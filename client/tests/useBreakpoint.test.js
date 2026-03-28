import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBreakpoint } from '../src/hooks/useBreakpoint'

let listeners = {}
let queryObjects = {}

function makeMockMQL(query, initialMatch) {
  const mql = { matches: initialMatch, media: query,
    addEventListener: (event, fn) => { listeners[query] = fn },
    removeEventListener: (event, fn) => { if (listeners[query] === fn) delete listeners[query] },
  }
  queryObjects[query] = mql
  return mql
}

beforeEach(() => {
  listeners = {}
  queryObjects = {}

  vi.stubGlobal('matchMedia', (query) => {
    if (queryObjects[query]) return queryObjects[query]
    return makeMockMQL(query, false)
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useBreakpoint', () => {
  it('returns desktop when both queries are false', () => {
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('desktop')
  })

  it('returns tablet when max-1024 matches but max-768 does not', () => {
    makeMockMQL('(max-width: 1024px)', true)
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('tablet')
  })

  it('returns mobile when max-768 matches', () => {
    makeMockMQL('(max-width: 768px)', true)
    makeMockMQL('(max-width: 1024px)', true)
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('mobile')
  })

  it('responds to matchMedia change events', () => {
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('desktop')

    act(() => {
      queryObjects['(max-width: 768px)'].matches = true
      queryObjects['(max-width: 1024px)'].matches = true
      listeners['(max-width: 768px)']?.({ matches: true })
    })
    expect(result.current).toBe('mobile')
  })

  it('cleans up listeners on unmount', () => {
    const { unmount } = renderHook(() => useBreakpoint())
    expect(listeners['(max-width: 768px)']).toBeDefined()
    unmount()
    expect(listeners['(max-width: 768px)']).toBeUndefined()
  })
})
