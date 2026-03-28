import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
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
    <div style={{ maxWidth: 380, margin: '80px auto', padding: '0 16px' }}>
      <h2 style={{ color: 'var(--color-text)', marginBottom: 24 }}>Sign in</h2>
      {error && <p style={{ color: '#e74c3c', marginBottom: 12, fontSize: '0.9em' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={email} onChange={e => setEmail(e.target.value)}
          type="email" placeholder="Email" required style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)}
          type="password" placeholder="Password" required style={inputStyle} />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85em', marginTop: 16 }}>
        No account? <Link to="/register" style={{ color: 'var(--color-accent)' }}>Sign up free</Link>
      </p>
    </div>
  )
}

const inputStyle = {
  padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '0.9em',
}
const btnStyle = {
  padding: '10px 20px', borderRadius: 20, background: 'var(--color-accent)',
  color: 'var(--color-accent-fg)', border: 'none', fontWeight: 600,
}
