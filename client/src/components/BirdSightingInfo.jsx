import { MapPin, Calendar, Hash, ExternalLink } from 'lucide-react'
import { getDisplayAddress } from '../utils/formatLocName'

function formatObsDt(obsDt) {
  if (!obsDt) return null
  const [datePart, timePart] = obsDt.split(' ')
  if (!timePart) return datePart
  const date = new Date(`${datePart}T${timePart}:00`)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${dateStr} · ${timeStr}`
}

export default function BirdSightingInfo({ comName, sciName, locName, obsDt, howMany, subId, compact = false, sighting, addressMap }) {
  const countDisplay = !howMany
    ? 'present'
    : `${howMany} individual${howMany !== 1 ? 's' : ''}`
  const formattedDate = formatObsDt(obsDt)
  const nameSize = compact ? 14 : 16
  const factSize = compact ? 12 : 13
  const iconSize = compact ? 12 : 13
  const gap = compact ? 7 : 10

  const displayLoc = sighting && addressMap
    ? getDisplayAddress(sighting, addressMap)
    : getDisplayAddress({ locName }, null)

  return (
    <div>
      <div style={{ fontFamily: 'Georgia,serif', fontWeight: 700, color: 'var(--color-text)', fontSize: nameSize, lineHeight: 1.3 }}>
        {comName}
      </div>
      <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: 11, marginTop: 3 }}>
        {sciName}
      </div>

      <div style={{ marginTop: compact ? 10 : 16, display: 'flex', flexDirection: 'column', gap }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <MapPin size={iconSize} style={{ color: 'var(--color-text-muted)', marginTop: 1, flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text)', fontSize: factSize, lineHeight: 1.4 }}>{displayLoc}</span>
        </div>

        {formattedDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={iconSize} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text)', fontSize: factSize }}>{formattedDate}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hash size={iconSize} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text)', fontSize: factSize }}>{countDisplay}</span>
        </div>
      </div>

      {subId && (
        <div style={{ marginTop: compact ? 10 : 18, paddingTop: compact ? 8 : 14, borderTop: '1px solid var(--color-border)' }}>
          <a
            href={`https://ebird.org/checklist/${subId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            View checklist on eBird <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  )
}
