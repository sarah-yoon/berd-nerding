import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { LocateFixed, MapPin, Clock } from 'lucide-react'
import { formatLocName } from '../utils/formatLocName'
import client from '../api/client'
import SkeletonCard from '../components/SkeletonCard'
import LocationAutocomplete from '../components/LocationAutocomplete'
import SpeciesAutocomplete from '../components/SpeciesAutocomplete'

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
  const [speciesQuery,  setSpeciesQuery]    = useState('')
  const [selectedLoc,   setSelectedLoc]     = useState(null)  // { lat, lng, display_name }
  const [error,         setError]           = useState('')
  const [lastLocWarning, setLastLocWarning] = useState(null)  // name string | null
  const [loading,       setLoading]         = useState(false)
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

  // Infinite scroll — load 20 more when sentinel becomes visible
  useEffect(() => {
    const sentinel = sentinelRef.current
    const scroll = scrollRef.current
    if (!sentinel || !scroll) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => prev + 20)
        }
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
    setLastLocWarning(null)

    const hasLocation = !!selectedLoc
    const hasSpecies  = speciesQuery.trim().length > 0

    if (!hasLocation && !hasSpecies) {
      setError('Please enter a location to search.')
      return
    }

    if (hasLocation && !hasSpecies) {
      // Location only
      navigate(`/map?lat=${selectedLoc.lat}&lng=${selectedLoc.lng}&dist=25`)
      return
    }

    if (hasLocation && hasSpecies) {
      // Location + species
      navigate(`/map?lat=${selectedLoc.lat}&lng=${selectedLoc.lng}&dist=25&species=${encodeURIComponent(speciesQuery.trim())}`)
      return
    }

    // Species only — try last known location
    const saved = (() => { try { return JSON.parse(localStorage.getItem('birdmap_last_location')) } catch { return null } })()
    if (saved?.lat != null) {
      setLastLocWarning(saved.name || 'your last location')
      navigate(`/map?lat=${saved.lat}&lng=${saved.lng}&dist=25&species=${encodeURIComponent(speciesQuery.trim())}`)
    } else {
      setError('Please enter a location to search.')
    }
  }

  function reverseGeocode(lat, lng) {
    return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`, {
      headers: { 'User-Agent': 'BirdMap/1.0' },
    })
      .then(r => r.json())
      .then(data => {
        const addr = data.address || {}
        const city = addr.city || addr.town || addr.village || addr.county || ''
        const state = addr.state || ''
        const country = addr.country || ''
        // Format: "City, State" or "City, Country" depending on what's available
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
      ({ coords }) => {
        navigate(`/map?lat=${coords.latitude}&lng=${coords.longitude}&dist=25`)
      },
      () => {
        // Fallback to last known or default location
        const saved = (() => { try { return JSON.parse(localStorage.getItem('birdmap_last_location')) } catch { return null } })()
        const { lat, lng } = saved ?? DEFAULT
        navigate(`/map?lat=${lat}&lng=${lng}&dist=25`)
      }
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ color: 'var(--color-text)', fontSize: '2em', marginBottom: 8 }}>
        Find birds near you
      </h1>
      <p className="subtitle" style={{ marginBottom: 4 }}>Powered by live eBird data</p>
      <p style={{ color: 'var(--color-accent)', fontSize: '0.85em', marginBottom: 24 }}>{TIPS[theme]}</p>

      <form onSubmit={handleSearch}>
        {/* One continuous divider between location & bird (labels + inputs); titles stay above fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) 1px minmax(0, 1fr) auto',
          columnGap: 12,
          rowGap: 4,
          marginBottom: 8,
          alignItems: 'start',
        }}>
          <div style={{ minWidth: 0, paddingTop: 1 }}>
            <span style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              Location
            </span>
          </div>
          <div
            aria-hidden
            style={{
              gridColumn: 2,
              gridRow: '1 / span 2',
              width: 1,
              background: 'var(--color-border)',
              alignSelf: 'stretch',
              borderRadius: 1,
            }}
          />
          <div style={{ minWidth: 0, paddingTop: 1 }}>
            <span style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              Bird <span style={{ opacity: 0.5 }}>(optional)</span>
            </span>
          </div>
          <div style={{ width: 80 }} />

          <div style={{ minWidth: 0 }}>
            <LocationAutocomplete
              value={locationQuery}
              onChange={(v) => { setLocationQuery(v); setSelectedLoc(null) }}
              onSelect={handleLocationSelect}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <SpeciesAutocomplete
              value={speciesQuery}
              onChange={setSpeciesQuery}
              placeholder="Bird name (optional)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 20,
              background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
              border: 'none', fontWeight: 600, whiteSpace: 'nowrap',
              alignSelf: 'center',
            }}>
            {loading ? '…' : 'Search'}
          </button>
        </div>
      </form>

      <button
        onClick={handleGeolocate}
        style={{
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          fontSize: '0.85em', cursor: 'pointer', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
        <LocateFixed size={14} /> Use my location
      </button>

      {error && <p style={{ color: '#e74c3c', fontSize: '0.85em', marginBottom: 16 }}>{error}</p>}

      {lastLocWarning && (
        <div style={{
          background: 'rgba(240,192,96,0.1)', border: '1px solid rgba(240,192,96,0.3)',
          borderRadius: 8, padding: '10px 14px', fontSize: '0.85em',
          color: 'var(--color-accent)', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>No location set — using your last known location: <strong>{lastLocWarning}</strong>.</span>
          <button
            onClick={() => { setLastLocWarning(null); setLocationQuery(''); setSelectedLoc(null) }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1em' }}>
            Change
          </button>
        </div>
      )}

      {/* Activity bar */}
      <div style={{ marginTop: 32 }}>
        {activityLoading ? (
          <>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</>
        ) : activity ? (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85em', marginBottom: 12 }}>
              <strong style={{ color: 'var(--color-accent)' }}>{activity.species}</strong> species spotted near {activity.name} recently
            </p>
            <div ref={scrollRef} style={{
              maxHeight: 380, overflowY: 'auto', borderRadius: 8,
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}>
            {activity.sightings.slice(0, visibleCount).map((s, i) => (
              <div key={i}
                onClick={() => navigate(`/map?lat=${s.lat}&lng=${s.lng}&dist=25&species=${encodeURIComponent(s.comName)}&subId=${s.subId}&speciesCode=${s.speciesCode}`)}
                style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderLeft: '4px solid var(--color-accent)', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 8, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
              >
                <div style={{ fontFamily: 'Georgia,serif', fontWeight: 700, color: 'var(--color-text)' }}>
                  {s.comName}
                </div>
                <div style={{ fontSize: '0.8em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {formatLocName(s.locName)}
                </div>
                {s.obsDt && (
                  <div style={{ fontSize: '0.75em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, opacity: 0.7 }}>
                    <Clock size={10} /> {formatTime(s.obsDt)}
                  </div>
                )}
              </div>
            ))}
            {visibleCount < activity.sightings.length && (
              <div ref={sentinelRef} style={{ padding: 12, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8em' }}>
                Loading more…
              </div>
            )}
            </div>
            <button
              onClick={handleExploreMap}
              style={{ marginTop: 8, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9em' }}>
              Explore the map →
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
