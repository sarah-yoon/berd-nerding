import { useToast } from '../context/ToastContext'

export default function Toast({ id, message, type }) {
  const { removeToast } = useToast()
  const bg = type === 'error' ? '#c0392b' : '#27ae60'
  return (
    <div style={{
      background: bg, color: '#fff', padding: '12px 16px', borderRadius: 8,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      minWidth: 260, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <span>{message}</span>
      <button onClick={() => removeToast(id)}
        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.1em', marginLeft: 12 }}>
        ×
      </button>
    </div>
  )
}
