import { useTheme } from '../src/hooks/useTheme'
import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

const mockHour = (h) => vi.spyOn(Date.prototype, 'getHours').mockReturnValue(h)
afterEach(() => vi.restoreAllMocks())

test('returns dawn for hour 5', () => {
  mockHour(5)
  const { result } = renderHook(() => useTheme())
  expect(result.current).toBe('dawn')
})

test('returns morning for hour 9', () => {
  mockHour(9)
  const { result } = renderHook(() => useTheme())
  expect(result.current).toBe('morning')
})

test('returns afternoon for hour 14', () => {
  mockHour(14)
  const { result } = renderHook(() => useTheme())
  expect(result.current).toBe('afternoon')
})

test('returns dusk for hour 17', () => {
  mockHour(17)
  const { result } = renderHook(() => useTheme())
  expect(result.current).toBe('dusk')
})

test('returns night for hour 22', () => {
  mockHour(22)
  const { result } = renderHook(() => useTheme())
  expect(result.current).toBe('night')
})
