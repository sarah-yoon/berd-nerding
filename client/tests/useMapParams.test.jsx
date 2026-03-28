import { useMapParams } from '../src/hooks/useMapParams'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const wrap = (initialEntries) => ({ wrapper: ({ children }) =>
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
})

test('returns null for missing params', () => {
  const { result } = renderHook(() => useMapParams(), wrap(['/map']))
  expect(result.current.params).toEqual({ lat: null, lng: null, dist: null, species: null })
})

test('parses valid params', () => {
  const { result } = renderHook(() => useMapParams(), wrap(['/map?lat=40.71&lng=-74.00&dist=25']))
  expect(result.current.params).toEqual({ lat: 40.71, lng: -74.00, dist: 25, species: null })
})

test('returns null for invalid lat', () => {
  const { result } = renderHook(() => useMapParams(), wrap(['/map?lat=banana&lng=-74&dist=10']))
  expect(result.current.params.lat).toBeNull()
})

test('returns null for out-of-range dist', () => {
  const { result } = renderHook(() => useMapParams(), wrap(['/map?lat=40&lng=-74&dist=999']))
  expect(result.current.params.dist).toBeNull()
})

test('returns null species when not in URL', () => {
  const { result } = renderHook(() => useMapParams(), wrap(['/map?lat=40&lng=-74&dist=25']))
  expect(result.current.params.species).toBeNull()
})

test('returns decoded species string from URL', () => {
  const { result } = renderHook(
    () => useMapParams(),
    wrap(['/map?lat=40&lng=-74&dist=25&species=Bald%20Eagle'])
  )
  expect(result.current.params.species).toBe('Bald Eagle')
})
