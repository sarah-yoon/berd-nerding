import { useState, useEffect } from 'react'
import { reverseGeocode } from '../utils/reverseGeocode'

export function useAddress(sighting) {
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sighting?.lat || !sighting?.lng) {
      setAddress(null)
      setLoading(false)
      return
    }

    setLoading(true)
    let cancelled = false
    reverseGeocode(sighting.lat, sighting.lng).then(result => {
      if (!cancelled) {
        setAddress(result || null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [sighting?.lat, sighting?.lng])

  return { address, loading }
}
