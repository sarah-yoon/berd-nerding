import { useAddress } from '../hooks/useAddress'

/**
 * Renders a reverse-geocoded address for a sighting.
 * Shows cleaned eBird locName initially, then updates to proper address.
 */
export default function AddressText({ sighting, style }) {
  const address = useAddress(sighting)
  return <span style={style}>{address}</span>
}
