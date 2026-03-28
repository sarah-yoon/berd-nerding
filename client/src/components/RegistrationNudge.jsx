import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RegistrationNudge() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(20,20,40,0.95)', border: '1px solid var(--color-accent)',
      borderRadius: 10, padding: '14px 18px', zIndex: 500, minWidth: 280,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <p style={{ color: 'var(--color-text)', fontSize: '0.9em', margin: 0 }}>
        Save birds to your life list →{' '}
        <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign up free</Link>
      </p>
      <button onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)',
          fontSize: '1.2em', cursor: 'pointer', lineHeight: 1 }}>×</button>
    </div>
  )
}
