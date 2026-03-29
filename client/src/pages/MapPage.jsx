import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMapParams } from '../hooks/useMapParams'
import { useTheme } from '../hooks/useTheme'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import SightingsMap from '../components/Map/SightingsMap'
import BirdPanel from '../components/BirdPanel'
import SightingsList from '../components/SightingsList'
import RegistrationNudge from '../components/RegistrationNudge'
import ErrorBanner from '../components/ErrorBanner'
import SpeciesAutocomplete from '../components/SpeciesAutocomplete'
import { fetchPhylopicIcon } from '../services/phylopicService'
import MobileBirdCard from '../components/MobileBirdCard'
import MobileSpeciesSheet from '../components/MobileSpeciesSheet'

const ACCENT = {
  dawn: '#f9a87a', morning: '#7dd4f8', afternoon: '#b8d870', dusk: '#f0c060', night: '#8080d0',
}

export default function MapPage() {
  const { params, setParams } = useMapParams()
  const { lat, lng, dist = 25, species } = params
  const [searchParams] = useSearchParams()
  const theme = useTheme()
  const breakpoint = useBreakpoint()
  const { isAuth } = useAuth()
  const navigate = useNavigate()
  const autoSelectSubId = searchParams.get('subId')
  const autoSelectSpeciesCode = searchParams.get('speciesCode')

  const [sightings, setSightings] = useState([])
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [speciesFilter, setSpeciesFilter] = useState(species ?? '')
  const [localDist, setLocalDist] = useState(dist ?? 25)
  const [nudge, setNudge] = useState(false)
  const [selectedSighting, setSelectedSighting] = useState(null)
  const [hoveredSighting, setHoveredSighting] = useState(null)
  const [iconMap, setIconMap] = useState(new Map())
  const [listOpen, setListOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('birdmap_list_open')) ?? true } catch { return true }
  })

  // Persist listOpen
  useEffect(() => {
    localStorage.setItem('birdmap_list_open', JSON.stringify(listOpen))
  }, [listOpen])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [s, h] = await Promise.all([
        client.get(`/api/birds/nearby?lat=${lat}&lng=${lng}&dist=${dist ?? 25}`),
        client.get(`/api/birds/hotspots?lat=${lat}&lng=${lng}`),
      ])
      setSightings(s.data)
      setHotspots(h.data)
    } catch {
      setError("Couldn't load sightings.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch sightings + hotspots
  useEffect(() => {
    if (lat === null || lng === null) return
    localStorage.setItem('birdmap_last_location', JSON.stringify({ lat, lng, name: '' }))
    fetchData()
  }, [lat, lng, dist])

  // Fetch Phylopic icons
  useEffect(() => {
    if (!sightings.length) return
    const unique = [...new Set(sightings.map(s => s.sciName).filter(Boolean))]
    Promise.all(unique.map(name => fetchPhylopicIcon(name).then(url => [name, url])))
      .then(entries => setIconMap(new Map(entries)))
  }, [sightings])


  useEffect(() => {
    if (species) setSpeciesFilter(species)
  }, [species])

  // Auto-select a sighting from URL params (when clicking activity card on HomePage)
  useEffect(() => {
    if (!autoSelectSubId || !autoSelectSpeciesCode || !sightings.length) return
    const match = sightings.find(s => s.subId === autoSelectSubId && s.speciesCode === autoSelectSpeciesCode)
    if (match && !selectedSighting) {
      setSelectedSighting(match)
    }
  }, [sightings, autoSelectSubId, autoSelectSpeciesCode])

  const uniqueSpecies = useMemo(() => {
    const seen = new Set()
    return sightings.filter(s => {
      if (!s.comName || seen.has(s.speciesCode)) return false
      seen.add(s.speciesCode)
      return true
    })
  }, [sightings])

  const handleBgClick = useCallback(() => setSelectedSighting(null), [])
  const handleHoverEnd = useCallback(() => setHoveredSighting(null), [])
  const handleClosePanel = useCallback(() => setSelectedSighting(null), [])

  function handleRadiusChange(e) {
    const d = Number(e.target.value)
    setLocalDist(d)
    setParams({ lat, lng, dist: d, species: speciesFilter || null })
  }

  if (lat === null || lng === null) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text)' }}>
        <p>No location selected.</p>
        <button onClick={() => navigate('/')} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>
          ← Go back and search
        </button>
      </div>
    )
  }

  const filtered = speciesFilter
    ? sightings.filter(s => s.comName?.toLowerCase().includes(speciesFilter.toLowerCase()))
    : sightings

  const handleRetry = fetchData

  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'
  const showList = !isMobile
  const panelOverlay = isTablet && selectedSighting

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 52px)', overflow: 'hidden', position: 'fixed', top: 52, left: 0, right: 0, bottom: 0 }}>
      {/* Mobile gets full map — filter is inside the species sheet */}

      {error && (
        <div style={{ padding: '0 16px', paddingTop: 12 }}>
          <ErrorBanner message={error} onRetry={handleRetry} />
        </div>
      )}

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Sightings list (desktop + tablet) */}
        {showList && (
          <SightingsList
            sightings={filtered}
            selectedSighting={selectedSighting}
            hoveredSighting={hoveredSighting}
            onSelect={(s) => {
              setSelectedSighting(s)
              if (!isAuth) setNudge(true)
            }}
            onHover={setHoveredSighting}
            onHoverEnd={handleHoverEnd}
            speciesFilter={speciesFilter}
            onSpeciesFilterChange={setSpeciesFilter}
            suggestions={uniqueSpecies}
            listOpen={listOpen}
            onToggleList={() => setListOpen(o => !o)}
            loading={loading}
          />
        )}

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Radius bar (desktop/tablet — above the map) */}
          {!isMobile && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 12px',
              background: 'rgba(14,14,28,0.85)', backdropFilter: 'blur(8px)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 10, fontSize: 12,
            }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Radius:</span>
              <select
                value={localDist}
                onChange={handleRadiusChange}
                style={{
                  padding: '4px 8px', borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'rgba(0,0,0,0.3)', color: 'var(--color-text)', fontSize: 11,
                }}>
                {[5, 10, 25, 50].map(d => <option key={d} value={d}>{d} km</option>)}
              </select>
              {loading && <span style={{ color: 'var(--color-text-muted)', fontSize: 11, marginLeft: 'auto' }}>Loading…</span>}
            </div>
          )}

          <SightingsMap
            center={[lat, lng]}
            sightings={filtered}
            hotspots={hotspots}
            accentColor={ACCENT[theme]}
            selectedSighting={selectedSighting}
            hoveredSighting={hoveredSighting}
            iconMap={iconMap}
            onMarkerClick={(s) => {
              setSelectedSighting(s)
              if (!isAuth) setNudge(true)
            }}
            onBgClick={handleBgClick}
          />
          {nudge && !isAuth && <RegistrationNudge />}
          {!loading && filtered.length === 0 && !error && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              color: 'var(--color-text-muted)', textAlign: 'center',
              pointerEvents: 'none', fontSize: '0.9em',
            }}>
              No sightings found. Try widening your radius.
            </div>
          )}
        </div>

        {/* Tablet scrim */}
        {panelOverlay && (
          <div
            onClick={() => setSelectedSighting(null)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.3)', zIndex: 550,
            }}
          />
        )}

        {/* BirdPanel — desktop: flex child, tablet: overlay */}
        {selectedSighting && !isMobile && (
          <BirdPanel
            sighting={selectedSighting}
            onClose={handleClosePanel}
            phylopicUrl={iconMap.get(selectedSighting.sciName) ?? null}
            style={panelOverlay ? {
              position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 600,
            } : undefined}
          />
        )}

        {/* Mobile species sheet */}
        {isMobile && (
          <MobileSpeciesSheet
            sightings={filtered}
            onSelect={(s) => {
              setSelectedSighting(s)
              if (!isAuth) setNudge(true)
            }}
            speciesFilter={speciesFilter}
            onSpeciesFilterChange={setSpeciesFilter}
            loading={loading}
            initialOpen={true}
          />
        )}

        {/* Mobile bottom card */}
        {selectedSighting && isMobile && (
          <MobileBirdCard
            sighting={selectedSighting}
            onClose={handleClosePanel}
            phylopicUrl={iconMap.get(selectedSighting.sciName) ?? null}
          />
        )}
      </div>
    </div>
  )
}
