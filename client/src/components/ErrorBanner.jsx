export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: 'rgba(231,76,60,0.15)', border: '1px solid #e74c3c',
      borderRadius: 8, padding: '10px 14px', marginBottom: 12,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ color: '#e74c3c', fontSize: '0.9em' }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: 'none', border: 'none', color: '#e74c3c',
          textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85em',
        }}>Retry</button>
      )}
    </div>
  )
}
