import { useEffect, useRef, useState } from 'react'
import { X, Bird } from 'lucide-react'
import { fetchBirdPhoto } from '../services/iNaturalistService'
import BirdSightingInfo from './BirdSightingInfo'

export default function MobileBirdCard({ sighting, onClose, phylopicUrl = null, addressMap }) {
  const cardRef = useRef(null)
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    if (!sighting) return
    setPhoto(null)
    fetchBirdPhoto(sighting.sciName).then(setPhoto)
  }, [sighting?.sciName])

  // Swipe-to-dismiss
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let startY = 0, startX = 0, startTime = 0, tracking = false, directionLocked = false

    function onTouchStart(e) {
      const touch = e.touches[0]
      startY = touch.clientY
      startX = touch.clientX
      startTime = Date.now()
      tracking = false
      directionLocked = false
      card.style.transition = 'none'
    }

    function onTouchMove(e) {
      const touch = e.touches[0]
      const deltaY = touch.clientY - startY
      const deltaX = touch.clientX - startX

      if (!directionLocked && (Math.abs(deltaY) + Math.abs(deltaX) > 10)) {
        directionLocked = true
        tracking = Math.abs(deltaY) > Math.abs(deltaX)
      }

      if (!tracking) return

      if (deltaY > 0 && card.scrollTop <= 0) {
        e.preventDefault()
        card.style.transform = `translateY(${deltaY}px)`
      }
    }

    function onTouchEnd(e) {
      if (!tracking) return
      const touch = e.changedTouches[0]
      const deltaY = touch.clientY - startY
      const velocity = deltaY / (Date.now() - startTime)

      if (deltaY > 80 || velocity > 0.5) {
        card.style.transition = 'transform 0.25s ease-out'
        card.style.transform = 'translateY(100%)'
        card.addEventListener('transitionend', () => onClose(), { once: true })
      } else {
        card.style.transition = 'transform 0.2s ease-out'
        card.style.transform = 'translateY(0)'
      }
    }

    card.addEventListener('touchstart', onTouchStart, { passive: true })
    card.addEventListener('touchmove', onTouchMove, { passive: false })
    card.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      card.removeEventListener('touchstart', onTouchStart)
      card.removeEventListener('touchmove', onTouchMove)
      card.removeEventListener('touchend', onTouchEnd)
    }
  }, [onClose])

  // Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!sighting) return null

  const thumbSrc = photo?.photoUrl ?? null

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 600,
        background: 'rgba(14,14,28,0.98)',
        borderTop: '2px solid var(--color-accent)',
        borderRadius: '12px 12px 0 0',
        padding: '8px 14px 14px',
        transform: 'translateY(0)',
        transition: 'transform 0.25s ease-out',
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ width: 30, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 8, right: 10,
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 24, height: 24, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}
      >
        <X size={12} />
      </button>

      <div style={{ display: 'flex', gap: 10 }}>
        {/* Thumbnail */}
        <div style={{
          width: 50, height: 50, borderRadius: 6, flexShrink: 0,
          background: '#0f0f1a', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {thumbSrc ? (
            <img src={thumbSrc} alt={sighting.comName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : phylopicUrl ? (
            <img src={phylopicUrl} alt={sighting.comName} style={{ width: 30, height: 30, filter: 'invert(1)', opacity: 0.6 }} />
          ) : (
            <Bird size={20} color="rgba(255,255,255,0.2)" />
          )}
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <BirdSightingInfo
            sighting={sighting}
            addressMap={addressMap}
            comName={sighting.comName}
            sciName={sighting.sciName}
            locName={sighting.locName}
            obsDt={sighting.obsDt}
            howMany={sighting.howMany}
            subId={sighting.subId}
            compact
          />
        </div>
      </div>
    </div>
  )
}
