export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
    }}>
      <div style={{
        background: 'rgba(20,20,40,0.98)', border: '1px solid var(--color-border)',
        borderRadius: 12, padding: '24px 28px', maxWidth: 360, textAlign: 'center',
      }}>
        <p style={{ color: 'var(--color-text)', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onConfirm} style={{
            padding: '8px 20px', borderRadius: 20, background: '#e74c3c',
            color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
          }}>Delete</button>
          <button onClick={onCancel} style={{
            padding: '8px 20px', borderRadius: 20, background: 'transparent',
            border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
