import { useState, useEffect, useRef } from 'react'
import { X, Bird } from 'lucide-react'
import { fetchBirdPhoto } from '../services/iNaturalistService'
import BirdSightingInfo from './BirdSightingInfo'

export default function BirdPanel({ sighting, onClose, phylopicUrl = null, style, addressMap }) {
  const [photo, setPhoto] = useState(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!sighting) return
    setPhoto(null)
    fetchBirdPhoto(sighting.sciName).then(setPhoto)
  }, [sighting?.sciName])

  // Focus close button when panel opens
  useEffect(() => {
    if (sighting) closeRef.current?.focus()
  }, [sighting?.sciName])

  if (!sighting) return null

  return (
    <div style={{
      width: 360, flexShrink: 0,
      background: 'rgba(14,14,28,0.98)',
      borderLeft: '2px solid var(--color-accent)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', position: 'relative',
      ...style,
    }}>
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close panel"
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
          width: 28, height: 28, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}>
        <X size={14} />
      </button>

      {/* Photo area — natural aspect ratio */}
      <div style={{
        background: '#0f0f1a', flexShrink: 0,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: photo?.photoUrl ? 0 : 120,
      }}>
        {photo?.photoUrl ? (
          <>
            <img
              src={photo.photoUrl}
              alt={sighting.comName}
              style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
            />
            {photo.attribution && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.55)',
                fontSize: 9, padding: '3px 8px',
              }}>
                {photo.attribution}
              </div>
            )}
          </>
        ) : phylopicUrl ? (
          <img
            src={phylopicUrl}
            alt={sighting.comName}
            style={{ width: 80, height: 80, filter: 'invert(1)', opacity: 0.6 }}
          />
        ) : (
          <Bird size={40} color="rgba(255,255,255,0.2)" />
        )}

        {phylopicUrl && photo?.photoUrl && (
          <div style={{
            position: 'absolute', bottom: photo.attribution ? 22 : 8, right: 8,
            width: 28, height: 28,
            background: 'rgba(0,0,0,0.5)', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={phylopicUrl} alt="" style={{ width: 18, height: 18, filter: 'invert(1)', opacity: 0.8 }} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px', flex: 1 }}>
        <BirdSightingInfo
          sighting={sighting}
          addressMap={addressMap}
          comName={sighting.comName}
          sciName={sighting.sciName}
          locName={sighting.locName}
          obsDt={sighting.obsDt}
          howMany={sighting.howMany}
          subId={sighting.subId}
        />
      </div>
    </div>
  )
}
