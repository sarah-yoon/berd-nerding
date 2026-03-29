import { useMemo, useState, useCallback } from 'react'
import { sightingKey } from '../utils/sightingKey'
import { getDisplayAddress } from '../utils/formatLocName'

function formatShortTime(obsDt) {
  if (!obsDt) return ''
  const timePart = obsDt.split(' ')[1]
  if (!timePart) return ''
  const [h, m] = timePart.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function groupBySpecies(sightings) {
  const map = new Map()
  sightings.forEach(s => {
    const key = s.speciesCode || s.comName
    if (!map.has(key)) {
      map.set(key, { comName: s.comName, sciName: s.sciName, speciesCode: s.speciesCode, sightings: [] })
    }
    map.get(key).sightings.push(s)
  })
  // Sort species alphabetically by common name
  return [...map.values()].sort((a, b) => a.comName.localeCompare(b.comName))
}

export default function SightingsList({
  sightings,
  selectedSighting,
  hoveredSighting,
  onSelect,
  onHover,
  onHoverEnd,
  speciesFilter,
  onSpeciesFilterChange,
  listOpen,
  onToggleList,
  loading,
  addressMap,
}) {
  const [expandedSpecies, setExpandedSpecies] = useState(new Set())

  const groups = useMemo(() => groupBySpecies(sightings), [sightings])

  const { matched, unmatched } = useMemo(() => {
    if (!speciesFilter || speciesFilter.length < 2) {
      return { matched: groups, unmatched: [] }
    }
    const q = speciesFilter.toLowerCase()
    const m = []
    const u = []
    groups.forEach(g => {
      if (g.comName?.toLowerCase().includes(q) || g.sciName?.toLowerCase().includes(q)) {
        m.push(g)
      } else {
        u.push(g)
      }
    })
    return { matched: m, unmatched: u }
  }, [groups, speciesFilter])

  const totalMatchedSightings = matched.reduce((sum, g) => sum + g.sightings.length, 0)

  const toggleExpand = useCallback((speciesCode) => {
    setExpandedSpecies(prev => {
      const next = new Set(prev)
      if (next.has(speciesCode)) next.delete(speciesCode)
      else next.add(speciesCode)
      return next
    })
  }, [])

  const selectedKey = selectedSighting ? sightingKey(selectedSighting) : null

  return (
    <>
      {/* Collapse tab */}
      <div
        role="button"
        tabIndex={0}
        aria-label={listOpen ? 'Collapse sightings list' : 'Expand sightings list'}
        aria-expanded={listOpen}
        onClick={onToggleList}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleList() } }}
        style={{
          position: 'absolute', top: '50%', left: listOpen ? 220 : 0,
          transform: 'translateY(-50%)',
          width: 16, height: 48, background: 'rgba(14,14,28,0.98)',
          border: '1px solid var(--color-border)', borderLeft: 'none',
          borderRadius: '0 6px 6px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)', fontSize: 11, cursor: 'pointer',
          zIndex: 500, transition: 'left 180ms ease-in-out',
          userSelect: 'none',
        }}
      >
        {listOpen ? '‹' : '›'}
      </div>

      {/* Panel */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(14,14,28,0.98)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        transform: listOpen ? 'translateX(0)' : 'translateX(-220px)',
        marginRight: listOpen ? 0 : -220,
        transition: 'transform 180ms ease-in-out, margin-right 180ms ease-in-out',
        overflow: 'hidden',
      }}>
        {/* Filter */}
        <div style={{ padding: 10, borderBottom: '1px solid var(--color-border)' }}>
          <input
            value={speciesFilter}
            onChange={e => onSpeciesFilterChange(e.target.value)}
            placeholder="Filter species…"
            autoComplete="off"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 16,
              border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)',
              color: 'var(--color-text)', fontSize: '0.85em', outline: 'none',
            }}
          />
        </div>

        {/* Summary */}
        <div style={{
          padding: '4px 10px', fontSize: 9, color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {speciesFilter && speciesFilter.length >= 2
            ? <span style={{ color: 'var(--color-accent)' }}>{matched.length} species match · {totalMatchedSightings} sightings</span>
            : <span>{groups.length} species · {sightings.length} sightings</span>
          }
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 12, color: 'var(--color-text-muted)', fontSize: 12 }}>
              <div aria-label="loading">Loading sightings…</div>
            </div>
          ) : matched.length === 0 && speciesFilter ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
              No matches for "{speciesFilter}".
              <button onClick={() => onSpeciesFilterChange('')}
                style={{ display: 'block', margin: '8px auto 0', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                Clear filter
              </button>
            </div>
          ) : groups.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
              No sightings found. Try widening your radius.
            </div>
          ) : (
            <>
              {/* Matched species */}
              {matched.map(g => (
                <SpeciesGroup
                  key={g.speciesCode}
                  group={g}
                  expanded={expandedSpecies.has(g.speciesCode)}
                  onToggle={() => toggleExpand(g.speciesCode)}
                  onSelect={onSelect}
                  onHover={onHover}
                  onHoverEnd={onHoverEnd}
                  selectedKey={selectedKey}
                  isMatch={speciesFilter && speciesFilter.length >= 2}
                  filter={speciesFilter}
                  addressMap={addressMap}
                />
              ))}

              {/* Divider + unmatched */}
              {unmatched.length > 0 && (
                <>
                  <div style={{
                    padding: '4px 10px', background: 'rgba(255,255,255,0.02)',
                    color: 'var(--color-text-muted)', fontSize: 9,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    opacity: 0.6,
                  }}>
                    Other species nearby
                  </div>
                  {unmatched.map(g => (
                    <SpeciesGroup
                      key={g.speciesCode}
                      group={g}
                      expanded={expandedSpecies.has(g.speciesCode)}
                      onToggle={() => toggleExpand(g.speciesCode)}
                      onSelect={onSelect}
                      onHover={onHover}
                      onHoverEnd={onHoverEnd}
                      selectedKey={selectedKey}
                      dimmed
                      addressMap={addressMap}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function HighlightMatch({ text, filter }) {
  if (!filter || filter.length < 2) return text
  const idx = text.toLowerCase().indexOf(filter.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: 'rgba(240,192,96,0.2)', color: 'var(--color-accent)', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + filter.length)}
      </span>
      {text.slice(idx + filter.length)}
    </>
  )
}

function SpeciesGroup({ group, expanded, onToggle, onSelect, onHover, onHoverEnd, selectedKey, isMatch, dimmed, filter, addressMap }) {
  return (
    <div style={{ opacity: dimmed ? 0.4 : 1 }}>
      {/* Species header row */}
      <div
        onClick={onToggle}
        onMouseEnter={() => {
          // Hover all sightings for this species
          if (group.sightings[0]) onHover(group.sightings[0])
        }}
        onMouseLeave={onHoverEnd}
        style={{
          padding: '9px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderLeft: isMatch ? '3px solid var(--color-accent)' : '3px solid transparent',
          background: expanded ? 'rgba(240,192,96,0.06)' : 'transparent',
          cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'background 0.1s',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 12,
            color: expanded ? 'var(--color-accent)' : 'var(--color-text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {filter ? <HighlightMatch text={group.comName} filter={filter} /> : group.comName}
          </div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 1 }}>
            {group.sciName}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 6 }}>
          <span style={{
            background: 'rgba(240,192,96,0.15)', color: 'var(--color-accent)',
            fontSize: 9, padding: '2px 6px', borderRadius: 8,
          }}>
            {group.sightings.length}
          </span>
          <span style={{ color: expanded ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: 9 }}>
            {expanded ? '▾' : '▸'}
          </span>
        </div>
      </div>

      {/* Expanded sighting locations */}
      {expanded && group.sightings.map(s => {
        const key = sightingKey(s)
        const isActive = key === selectedKey
        return (
          <div
            key={key}
            onClick={() => onSelect(s)}
            onMouseEnter={() => onHover(s)}
            onMouseLeave={onHoverEnd}
            style={{
              padding: '7px 10px 7px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              background: isActive ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'rgba(240,192,96,0.02)',
              cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              transition: 'background 0.1s',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: 140,
              }}>
                {getDisplayAddress(s, addressMap)}
              </div>
              {s.howMany && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 9, marginTop: 1 }}>
                  × {s.howMany} individual{s.howMany !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 10, flexShrink: 0, marginLeft: 6 }}>
              {formatShortTime(s.obsDt)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
