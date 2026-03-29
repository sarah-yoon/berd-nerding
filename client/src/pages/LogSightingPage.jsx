import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import SpeciesAutocomplete from '../components/SpeciesAutocomplete'
import { useBreakpoint } from '../hooks/useBreakpoint'

export default function LogSightingPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const isMobile = useBreakpoint() === 'mobile'
  const isEdit = !!id

  const savedLocation = (() => { try { return JSON.parse(localStorage.getItem('birdmap_last_location')) } catch { return null } })()

  const [form, setForm] = useState({
    species_name:  state?.sighting?.species_name  || '',
    species_code:  state?.sighting?.species_code  || '',
    location_name: state?.sighting?.location_name || savedLocation?.name || '',
    date:          state?.sighting?.date?.slice(0,10) || new Date().toISOString().slice(0,10),
    count:         state?.sighting?.count || 1,
    notes:         state?.sighting?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [nearbySightings, setNearbySightings] = useState([])

  // Fetch nearby sightings for species suggestions
  useEffect(() => {
    const loc = savedLocation
    if (!loc?.lat) return
    client.get(`/api/birds/nearby?lat=${loc.lat}&lng=${loc.lng}&dist=25`)
      .then(({ data }) => setNearbySightings(data))
      .catch(() => {})
  }, [])

  const suggestions = useMemo(() => {
    const seen = new Set()
    return nearbySightings.filter(s => {
      if (!s.comName || seen.has(s.speciesCode)) return false
      seen.add(s.speciesCode)
      return true
    })
  }, [nearbySightings])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.species_name) { setError('Species name is required'); return }
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await client.patch(`/api/sightings/${id}`, form)
        addToast('Sighting updated!')
      } else {
        const { data } = await client.post('/api/sightings', form)
        addToast(data.isNewSpecies ? '🎉 New species added to your life list!' : 'Sighting logged!')
      }
      navigate('/list')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleSpeciesSelect(name) {
    // Find the matching sighting to also set the species_code
    const match = suggestions.find(s => s.comName === name)
    setForm(prev => ({
      ...prev,
      species_name: name,
      species_code: match?.speciesCode || '',
    }))
  }

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ width: isMobile ? '80%' : '50%', margin: '40px auto', padding: '0 24px' }}>
      <h2 style={{ color: 'var(--color-text)', marginBottom: 24 }}>
        {isEdit ? 'Edit Sighting' : 'Log a Sighting'}
      </h2>
      {error && <p style={{ color: '#e74c3c', marginBottom: 12, fontSize: '0.9em' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SpeciesAutocomplete
          value={form.species_name}
          onChange={handleSpeciesSelect}
          placeholder="Species name"
          suggestions={suggestions}
        />
        <input value={form.location_name} onChange={e => set('location_name')(e.target.value)}
          placeholder="Location" style={inputStyle} />
        <input value={form.date} onChange={e => set('date')(e.target.value)}
          type="date" style={inputStyle} />
        <input value={form.count} onChange={e => set('count')(Number(e.target.value))}
          type="number" min="1" placeholder="Count" style={inputStyle} />
        <textarea value={form.notes} onChange={e => set('notes')(e.target.value)}
          placeholder="Notes (optional)" rows={3}
          style={{ ...inputStyle, borderRadius: 8, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? 'Saving…' : (isEdit ? 'Update' : 'Save Sighting')}
          </button>
          <button type="button" onClick={() => navigate('/list')}
            style={{ ...btnStyle(false), background: 'transparent',
              border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '0.9em',
}
const btnStyle = (disabled) => ({
  padding: '10px 24px', borderRadius: 20, background: 'var(--color-accent)',
  color: 'var(--color-accent-fg)', border: 'none', fontWeight: 600,
  opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
})
