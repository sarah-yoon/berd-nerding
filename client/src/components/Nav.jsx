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
      padding: '6px 14px', background: 'rgba(0,0,0,0.3)',
      borderBottom: '1px solid var(--color-border)', height: 44,
    }}>
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        textDecoration: 'none',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          transition: 'background 0.4s ease',
        }}>
          <img
            src="/berd-nerding-logo.png"
            alt="Berd Nerding"
            style={{ width: 22, height: 22, objectFit: 'contain' }}
          />
        </div>
        <span style={{
          fontFamily: 'Georgia,serif', color: 'var(--color-logo)',
          fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.85em',
        }}>BERD NERDING</span>
      </Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.8em' }}>
        {isAuth ? (
          <>
            <Link to="/list" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>My List</Link>
            <Link to="/log" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Log</Link>
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
