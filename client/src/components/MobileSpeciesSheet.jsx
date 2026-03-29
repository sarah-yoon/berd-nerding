import { useMemo, useState } from 'react'
import { sightingKey } from '../utils/sightingKey'
import { formatLocName } from '../utils/formatLocName'
import { List, X } from 'lucide-react'

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
  return [...map.values()].sort((a, b) => a.comName.localeCompare(b.comName))
}

export default function MobileSpeciesSheet({ sightings, onSelect, speciesFilter, onSpeciesFilterChange, loading }) {
  const [open, setOpen] = useState(false)
  const [expandedSpecies, setExpandedSpecies] = useState(new Set())

  const groups = useMemo(() => groupBySpecies(sightings), [sightings])

  const { matched, unmatched } = useMemo(() => {
    if (!speciesFilter || speciesFilter.length < 2) return { matched: groups, unmatched: [] }
    const q = speciesFilter.toLowerCase()
    const m = [], u = []
    groups.forEach(g => {
      if (g.comName?.toLowerCase().includes(q) || g.sciName?.toLowerCase().includes(q)) m.push(g)
      else u.push(g)
    })
    return { matched: m, unmatched: u }
  }, [groups, speciesFilter])

  function handleLocationClick(s) {
    setOpen(false)
    onSelect(s)
  }

  function toggleExpand(speciesCode) {
    setExpandedSpecies(prev => {
      const next = new Set(prev)
      if (next.has(speciesCode)) next.delete(speciesCode)
      else next.add(speciesCode)
      return next
    })
  }

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 500,
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(14,14,28,0.92)', border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            cursor: 'pointer',
          }}
        >
          <List size={18} color="var(--color-accent)" />
        </button>
      )}

      {/* Scrim */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 550, transition: 'opacity 0.2s',
          }}
        />
      )}

      {/* Top sliding panel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 600, background: 'rgba(14,14,28,0.98)',
        borderBottom: '2px solid var(--color-accent)',
        borderRadius: '0 0 14px 14px',
        transform: open ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-out',
        maxHeight: '60%', display: 'flex', flexDirection: 'column',
        boxShadow: open ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: '10px 12px 8px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={speciesFilter}
            onChange={e => onSpeciesFilterChange(e.target.value)}
            placeholder="Filter species…"
            autoComplete="off"
            style={{
              flex: 1, padding: '7px 12px', borderRadius: 14,
              border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)',
              color: 'var(--color-text)', fontSize: '0.8em', outline: 'none',
            }}
          />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7em', flexShrink: 0 }}>
            {matched.length} species
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4,
            }}
          >
            <X size={16} color="var(--color-text-muted)" />
          </button>
        </div>

        {/* Species list */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>Loading…</div>
          ) : matched.length === 0 && speciesFilter ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
              No matches for "{speciesFilter}".
              <button onClick={() => onSpeciesFilterChange('')}
                style={{ display: 'block', margin: '6px auto 0', color: 'var(--color-accent)', background: 'none', border: 'none', fontSize: 12 }}>
                Clear filter
              </button>
            </div>
          ) : (
            <>
              {matched.map(g => (
                <div key={g.speciesCode}>
                  <div
                    onClick={() => toggleExpand(g.speciesCode)}
                    style={{
                      padding: '9px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: expandedSpecies.has(g.speciesCode) ? 'rgba(240,192,96,0.05)' : 'transparent',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: 12,
                        color: expandedSpecies.has(g.speciesCode) ? 'var(--color-accent)' : 'var(--color-text)',
                      }}>
                        {g.comName}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{g.sciName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <span style={{
                        background: 'rgba(240,192,96,0.15)', color: 'var(--color-accent)',
                        fontSize: 9, padding: '2px 6px', borderRadius: 8,
                      }}>{g.sightings.length}</span>
                      <span style={{ color: expandedSpecies.has(g.speciesCode) ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: 9 }}>
                        {expandedSpecies.has(g.speciesCode) ? '▾' : '▸'}
                      </span>
                    </div>
                  </div>

                  {expandedSpecies.has(g.speciesCode) && g.sightings.map(s => (
                    <div
                      key={sightingKey(s)}
                      onClick={() => handleLocationClick(s)}
                      style={{
                        padding: '7px 12px 7px 22px',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: 'rgba(240,192,96,0.02)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ color: 'var(--color-text)', fontSize: 11 }}>{formatLocName(s.locName)}</div>
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
                  ))}
                </div>
              ))}

              {unmatched.length > 0 && (
                <>
                  <div style={{
                    padding: '4px 12px', background: 'rgba(255,255,255,0.02)',
                    color: 'var(--color-text-muted)', fontSize: 9,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: 0.6,
                  }}>
                    Other species
                  </div>
                  {unmatched.map(g => (
                    <div
                      key={g.speciesCode}
                      onClick={() => toggleExpand(g.speciesCode)}
                      style={{
                        padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        opacity: 0.4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--color-text)' }}>{g.comName}</div>
                      <span style={{
                        background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)',
                        fontSize: 9, padding: '2px 6px', borderRadius: 8,
                      }}>{g.sightings.length}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom handle */}
        <div onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', cursor: 'pointer' }}>
          <div style={{ width: 30, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
        </div>
      </div>
    </>
  )
}
