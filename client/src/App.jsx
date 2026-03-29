import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { useTheme } from './hooks/useTheme'
import Nav from './components/Nav'
import ToastContainer from './components/ToastContainer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import LifeListPage from './pages/LifeListPage'
import LogSightingPage from './pages/LogSightingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './styles/global.css'
import './styles/themes.css'

function ThemedApp() {
  const theme = useTheme()
  return (
    <div className={`theme-${theme}`} style={{ minHeight: '100dvh', background: 'var(--color-bg)', backgroundAttachment: 'fixed', backgroundColor: 'var(--color-bg-solid)' }}>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/map"      element={<MapPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/list"     element={<ProtectedRoute><LifeListPage /></ProtectedRoute>} />
          <Route path="/log"      element={<ProtectedRoute><LogSightingPage /></ProtectedRoute>} />
          <Route path="/log/:id"  element={<ProtectedRoute><LogSightingPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemedApp />
      </ToastProvider>
    </AuthProvider>
  )
}
