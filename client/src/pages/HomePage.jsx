import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { LocateFixed, MapPin, Clock } from 'lucide-react'
import client from '../api/client'
import SkeletonCard from '../components/SkeletonCard'
import LocationAutocomplete from '../components/LocationAutocomplete'
import AddressText from '../components/AddressText'

const DEFAULT = { lat: 40.7128, lng: -74.0060, name: 'New York' }

function formatTime(obsDt) {
  if (!obsDt) return ''
  const [datePart, timePart] = obsDt.split(' ')
  if (!timePart) return datePart
  const date = new Date(`${datePart}T${timePart}:00`)
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${dateStr} · ${timeStr}`
}

const TIPS = {
  dawn:      'Dawn chorus in full swing',
  morning:   'Peak morning activity window',
  afternoon: 'Shorebirds and waders most active',
  dusk:      'Golden hour — owls emerging soon',
  night:     'Owls and migrants overhead',
}

export default function HomePage() {
  const theme    = useTheme()
  const navigate = useNavigate()
  const [locationQuery, setLocationQuery]   = useState('')
  const [selectedLoc,   setSelectedLoc]     = useState(null)
  const [error,         setError]           = useState('')
  const [activity,      setActivity]        = useState(null)
  const [activityLoading, setActivityLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(20)
  const sentinelRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('birdmap_last_location')) } catch { return null } })()
    const { lat, lng, name } = saved ?? DEFAULT
    setActivityLoading(true)
    client.get(`/api/birds/nearby?lat=${lat}&lng=${lng}&dist=25`)
      .then(({ data }) => {
        const species = [...new Set(data.map(s => s.speciesCode))].length
        setActivity({ sightings: data, species, name, lat, lng })
      })
      .catch(() => {})
      .finally(() => setActivityLoading(false))
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const scroll = scrollRef.current
    if (!sentinel || !scroll) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount(prev => prev + 20)
      },
      { root: scroll, threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [activity])

  function handleLocationSelect(r) {
    setSelectedLoc(r)
    setLocationQuery(r.display_name.split(',')[0].trim())
    localStorage.setItem('birdmap_last_location', JSON.stringify({ lat: r.lat, lng: r.lng, name: r.display_name.split(',')[0].trim() }))
  }

  function handleSearch(e) {
    e.preventDefault()
    setError('')
    if (!selectedLoc) {
      setError('Please enter a location to search.')
      return
    }
    navigate(`/map?lat=${selectedLoc.lat}&lng=${selectedLoc.lng}&dist=25`)
  }

  function reverseGeocode(lat, lng) {
    return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`, {
      headers: { 'User-Agent': 'BerdNerding/1.0' },
    })
      .then(r => r.json())
      .then(data => {
        const addr = data.address || {}
        const city = addr.city || addr.town || addr.village || addr.county || ''
        const state = addr.state || ''
        const country = addr.country || ''
        if (city && state) return `${city}, ${state}`
        if (city && country) return `${city}, ${country}`
        if (state && country) return `${state}, ${country}`
        return city || state || country || 'Current location'
      })
      .catch(() => 'Current location')
  }

  function handleGeolocate() {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        reverseGeocode(coords.latitude, coords.longitude).then(name => {
          setLocationQuery(name)
          setSelectedLoc({ lat: coords.latitude, lng: coords.longitude, display_name: name })
          localStorage.setItem('birdmap_last_location', JSON.stringify({ lat: coords.latitude, lng: coords.longitude, name }))
        })
      },
      () => setError('Location access was denied. Please enter a city name instead.')
    )
  }

  function handleExploreMap() {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => navigate(`/map?lat=${coords.latitude}&lng=${coords.longitude}&dist=25`),
      () => {
        const saved = (() => { try { return JSON.parse(localStorage.getItem('birdmap_last_location')) } catch { return null } })()
        const { lat, lng } = saved ?? DEFAULT
        navigate(`/map?lat=${lat}&lng=${lng}&dist=25`)
      }
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px 20px' }}>
      <h1 style={{ color: 'var(--color-text)', fontSize: 'clamp(1.4em, 5vw, 2em)', marginBottom: 4 }}>
        Find birds near you
      </h1>
      <p className="subtitle" style={{ marginBottom: 2, fontSize: '0.85em' }}>Powered by live eBird data</p>
      <p style={{ color: 'var(--color-accent)', fontSize: '0.8em', marginBottom: 20 }}>{TIPS[theme]}</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <LocationAutocomplete
            value={locationQuery}
            onChange={(v) => { setLocationQuery(v); setSelectedLoc(null) }}
            onSelect={handleLocationSelect}
            placeholder="City, state, or country…"
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px', borderRadius: 20,
            background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
            border: 'none', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
          Search
        </button>
      </form>

      <button
        onClick={handleGeolocate}
        style={{
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          fontSize: '0.8em', cursor: 'pointer', marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
        <LocateFixed size={13} /> Use my location
      </button>

      {error && <p style={{ color: '#e74c3c', fontSize: '0.8em', marginBottom: 12 }}>{error}</p>}

      {/* Activity */}
      <div style={{ marginTop: 24 }}>
        {activityLoading ? (
          <>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</>
        ) : activity ? (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8em', marginBottom: 10 }}>
              <strong style={{ color: 'var(--color-accent)' }}>{activity.species}</strong> species spotted near {activity.name} recently
            </p>
            <div ref={scrollRef} style={{
              maxHeight: 'calc(100dvh - 320px)', overflowY: 'auto', borderRadius: 8,
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}>
            {activity.sightings.slice(0, visibleCount).map((s, i) => (
              <div key={i}
                onClick={() => navigate(`/map?lat=${s.lat}&lng=${s.lng}&dist=25&species=${encodeURIComponent(s.comName)}&subId=${s.subId}&speciesCode=${s.speciesCode}`)}
                style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderLeft: '3px solid var(--color-accent)', borderRadius: 6,
                  padding: '8px 12px', marginBottom: 6, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9em' }}>
                    {s.comName}
                  </div>
                  {s.obsDt && (
                    <span style={{ fontSize: '0.7em', color: 'var(--color-text-muted)', opacity: 0.7, flexShrink: 0, marginLeft: 8 }}>
                      {formatTime(s.obsDt)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <MapPin size={10} /> <AddressText sighting={s} style={{ fontSize: 'inherit', color: 'inherit' }} />
                </div>
              </div>
            ))}
            {visibleCount < activity.sightings.length && (
              <div ref={sentinelRef} style={{ padding: 10, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75em' }}>
                Loading more…
              </div>
            )}
            </div>
            <button
              onClick={handleExploreMap}
              style={{ marginTop: 8, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85em' }}>
              Explore the map →
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
