import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useBreakpoint } from '../hooks/useBreakpoint'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const isMobile = useBreakpoint() === 'mobile'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      addToast('Welcome back!')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: isMobile ? '80%' : '50%', maxWidth: 600, margin: isMobile ? '40px auto' : '60px auto', padding: '0 24px' }}>
      <h2 style={{ color: 'var(--color-text)', marginBottom: isMobile ? 20 : 28 }}>Sign in</h2>
      {error && <p style={{ color: '#e74c3c', marginBottom: 16, fontSize: '0.9em' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
        <input value={email} onChange={e => setEmail(e.target.value)}
          type="email" placeholder="Email" required style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)}
          type="password" placeholder="Password" required style={inputStyle} />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85em', marginTop: isMobile ? 20 : 24 }}>
        No account? <Link to="/register" style={{ color: 'var(--color-accent)' }}>Sign up free</Link>
      </p>
    </div>
  )
}

const inputStyle = {
  padding: '14px 18px', borderRadius: 12,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '0.95em',
}
const btnStyle = {
  padding: '14px 24px', borderRadius: 20, background: 'var(--color-accent)',
  color: 'var(--color-accent-fg)', border: 'none', fontWeight: 600, marginTop: 4,
}
