import { useState, useEffect, useRef, useCallback } from 'react'
import client from '../api/client'

export default function SpeciesAutocomplete({ value, onChange, placeholder = 'Species name…', suggestions = null }) {
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const timer = useRef(null)
  const inputRef = useRef(null)

  const updatePosition = useCallback(() => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!value || value.length < 2) { setResults([]); setOpen(false); return }

    // If suggestions provided, filter locally (no API call)
    if (suggestions) {
      const q = value.toLowerCase()
      const matches = suggestions
        .filter(s => s.comName?.toLowerCase().includes(q) || s.sciName?.toLowerCase().includes(q))
        .slice(0, 8)
      setResults(matches)
      setOpen(matches.length > 0)
      updatePosition()
      return
    }

    // Otherwise hit API
    timer.current = setTimeout(async () => {
      try {
        const { data } = await client.get(`/api/birds/species?q=${encodeURIComponent(value)}`)
        setResults(data.slice(0, 8))
        setOpen(true)
        updatePosition()
      } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(timer.current)
  }, [value, suggestions, updatePosition])

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input ref={inputRef} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off"
        onFocus={() => { if (results.length > 0) { updatePosition(); setOpen(true) } }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={inputStyle} />
      {open && results.length > 0 && (
        <ul style={{
          ...dropdownStyle,
          background: 'rgba(18,18,36,0.97)', border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8, listStyle: 'none', zIndex: 10000, maxHeight: 200, overflowY: 'auto',
          padding: 0, margin: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {results.map((r, i) => (
            <li key={r.speciesCode ?? i}
              onMouseDown={() => { onChange(r.comName); setOpen(false) }}
              style={{
                padding: '8px 14px', cursor: 'pointer', color: 'var(--color-text)',
                fontSize: '0.9em', borderBottom: '1px solid var(--color-border)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {r.comName}
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8em', marginLeft: 8 }}>
                {r.sciName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 16px', borderRadius: 20,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: '#fff', fontSize: '0.9em',
}
