import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { isAuth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 20px', background: 'rgba(0,0,0,0.3)',
      borderBottom: '1px solid var(--color-border)', height: 52,
    }}>
      <Link to="/" style={{
        fontFamily: 'Georgia,serif', color: 'var(--color-logo)',
        textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.95em',
      }}>✦ BERD NERDING</Link>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.85em' }}>
        {isAuth ? (
          <>
            <Link to="/list" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>My List</Link>
            <Link to="/log" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Log Sighting</Link>
            <button onClick={handleLogout} style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: 'inherit',
            }}>Sign out</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        )}
      </div>
    </nav>
  )
}
