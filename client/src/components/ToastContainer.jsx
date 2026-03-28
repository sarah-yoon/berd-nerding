import { useToast } from '../context/ToastContext'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts } = useToast()
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000,
    }}>
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  )
}
