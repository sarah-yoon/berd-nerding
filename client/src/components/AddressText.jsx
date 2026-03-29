import { useAddress } from '../hooks/useAddress'
import { formatLocName } from '../utils/formatLocName'

export default function AddressText({ sighting, style }) {
  const { address, loading } = useAddress(sighting)

  if (loading) {
    return (
      <span style={{
        ...style,
        display: 'inline-block',
        width: '70%',
        height: '0.9em',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 4,
        animation: 'pulse 1.2s ease-in-out infinite',
      }} />
    )
  }

  return <span style={style}>{address || formatLocName(sighting?.locName)}</span>
}
