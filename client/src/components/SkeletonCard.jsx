export default function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 8, padding: '10px 14px', marginBottom: 8,
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
      <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '40%' }} />
    </div>
  )
}
