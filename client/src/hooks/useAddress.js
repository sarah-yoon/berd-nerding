import { useState, useEffect } from 'react'
import { reverseGeocode } from '../utils/reverseGeocode'
import { formatLocName } from '../utils/formatLocName'

/**
 * Hook that returns a display address for a sighting.
 * Initially shows the cleaned eBird locName, then updates
 * to the reverse-geocoded address once it loads.
 */
export function useAddress(sighting) {
  const fallback = formatLocName(sighting?.locName)
  const [address, setAddress] = useState(fallback)

  useEffect(() => {
    if (!sighting?.lat || !sighting?.lng) {
      setAddress(fallback)
      return
    }

    // Reset to fallback for new sighting
    setAddress(fallback)

    let cancelled = false
    reverseGeocode(sighting.lat, sighting.lng).then(result => {
      if (!cancelled && result) setAddress(result)
    })
    return () => { cancelled = true }
  }, [sighting?.lat, sighting?.lng])

  return address
}
