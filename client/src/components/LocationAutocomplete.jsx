import { useState, useEffect, useRef, useCallback } from 'react'
import client from '../api/client'

export default function LocationAutocomplete({ value, onChange, onSelect, placeholder = 'Enter city, state, or country…' }) {
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
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!value || value.length < 2) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      try {
        const { data } = await client.get(`/api/geocode/suggest?q=${encodeURIComponent(value)}`)
        setResults(data)
        setOpen(data.length > 0)
        updatePosition()
      } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(timer.current)
  }, [value, updatePosition])

  function handleSelect(r) {
    onChange(r.display_name.split(',')[0].trim())
    setOpen(false)
    setResults([])
    onSelect(r)
  }

  function shortName(name) {
    return name.length > 60 ? name.slice(0, 57) + '…' : name
  }

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { if (results.length > 0) { updatePosition(); setOpen(true) } }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
        style={inputStyle}
      />
      {open && results.length > 0 && (
        <ul style={{
          ...dropdownStyle,
          background: 'rgba(18, 18, 36, 0.97)', border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
          borderRadius: 10, listStyle: 'none', zIndex: 10000,
          maxHeight: 240, overflowY: 'auto', padding: 0, margin: 0,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {results.map((r, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(r)}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--color-border)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ color: 'var(--color-text)', fontSize: '0.9em', fontWeight: 500 }}>
                {r.display_name.split(',')[0].trim()}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75em', marginTop: 2 }}>
                {shortName(r.display_name.split(',').slice(1).join(',').trim())}
              </div>
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
