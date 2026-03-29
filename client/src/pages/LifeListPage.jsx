import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import ErrorBanner from '../components/ErrorBanner'
import SkeletonCard from '../components/SkeletonCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { MapPin, Star } from 'lucide-react'
import { useBreakpoint } from '../hooks/useBreakpoint'

const MILESTONES = [10, 25, 50, 100, 200]

export default function LifeListPage() {
  const { addToast } = useToast()
  const isMobile = useBreakpoint() === 'mobile'
  const [sightings, setSightings] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [deleting,  setDeleting]  = useState(null)
  const [dismissedMilestone, setDismissedMilestone] = useState(null)

  useEffect(() => { fetchSightings() }, [])

  async function fetchSightings() {
    setLoading(true); setError(null)
    try {
      const { data } = await client.get('/api/sightings')
      setSightings(data)
    } catch { setError("Couldn't load your sightings.") }
    finally { setLoading(false) }
  }

  async function confirmDelete() {
    try {
      await client.delete(`/api/sightings/${deleting}`)
      setSightings(prev => prev.filter(s => s.id !== deleting))
      addToast('Sighting deleted')
    } catch { addToast('Failed to delete sighting', 'error') }
    finally { setDeleting(null) }
  }

  const speciesCount = new Set(sightings.map(s => s.species_code || s.species_name)).size
  const milestone = MILESTONES.filter(m => speciesCount >= m).pop()

  return (
    <div style={{ width: isMobile ? '80%' : '50%', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--color-text)' }}>My Life List</h2>
        <Link to="/log" style={{
          background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
          padding: '8px 18px', borderRadius: 20, textDecoration: 'none',
          fontWeight: 600, fontSize: '0.85em',
        }}>+ Log Sighting</Link>
      </div>

      {milestone && milestone !== dismissedMilestone && (
        <div style={{ background: 'rgba(240,192,96,0.15)', border: '1px solid var(--color-accent)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} /> You've spotted {milestone}+ species!
          </span>
          <button onClick={() => setDismissedMilestone(milestone)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1em' }}>×</button>
        </div>
      )}

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85em', marginBottom: 20 }}>
        {speciesCount} species observed
      </p>

      {error && <ErrorBanner message={error} onRetry={fetchSightings} />}

      {loading ? (
        [1,2,3].map(i => <SkeletonCard key={i} />)
      ) : sightings.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 60 }}>
          You haven't logged any sightings yet. <Link to="/" style={{ color: 'var(--color-accent)' }}>Go find some birds!</Link>
        </p>
      ) : (
        sightings.map(s => (
          <div key={s.id} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderLeft: `4px solid var(--color-accent)`, borderRadius: 10,
            padding: '12px 16px', marginBottom: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ fontFamily: 'Georgia,serif', fontWeight: 700, color: 'var(--color-text)' }}>
                {s.species_name}
              </div>
              <div style={{ fontSize: '0.78em', color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {s.location_name} · {s.date?.slice(0,10)} · Count: {s.count}
              </div>
              {s.notes && <div style={{ fontSize: '0.8em', color: 'var(--color-text-muted)', marginTop: 4 }}>
                "{s.notes}"
              </div>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
              <Link to={`/log/${s.id}`} state={{ sighting: s }}
                style={{ color: 'var(--color-text-muted)', fontSize: '0.8em', textDecoration: 'none' }}>Edit</Link>
              <button onClick={() => setDeleting(s.id)}
                style={{ background: 'none', border: 'none', color: '#e74c3c',
                  fontSize: '0.8em', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))
      )}

      {deleting && (
        <ConfirmDialog
          message="Delete this sighting? This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
