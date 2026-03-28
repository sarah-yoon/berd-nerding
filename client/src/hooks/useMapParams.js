import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

function parseNum(val) {
  if (val === null || val === undefined) return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

export function useMapParams() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const rawLat  = searchParams.get('lat')
  const rawLng  = searchParams.get('lng')
  const rawDist = searchParams.get('dist')
  const rawSpecies = searchParams.get('species')

  const lat  = parseNum(rawLat)
  const lng  = parseNum(rawLng)
  const dist = (() => {
    const d = parseNum(rawDist)
    return d !== null && d >= 5 && d <= 50 ? d : null
  })()
  const species = rawSpecies ?? null   // already decoded by searchParams.get

  const setParams = useCallback(({ lat, lng, dist, species }) => {
    const speciesStr = species ? `&species=${encodeURIComponent(species)}` : ''
    navigate(`/map?lat=${lat}&lng=${lng}&dist=${dist ?? 25}${speciesStr}`, { replace: true })
  }, [navigate])

  return { params: { lat, lng, dist, species }, setParams }
}
