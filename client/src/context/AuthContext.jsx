import { createContext, useContext, useState, useCallback } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('birdmap_token'))
  const [user,  setUser]  = useState(() => {
    const t = localStorage.getItem('birdmap_token')
    if (!t) return null
    try { return JSON.parse(atob(t.split('.')[1])) } catch { return null }
  })

  const saveToken = useCallback((t) => {
    localStorage.setItem('birdmap_token', t)
    setToken(t)
    try { setUser(JSON.parse(atob(t.split('.')[1]))) } catch {}
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('birdmap_token')
    setToken(null)
    setUser(null)
  }, [])

  const register = useCallback(async (email, password) => {
    const { data } = await client.post('/api/auth/register', { email, password })
    saveToken(data.token)
  }, [saveToken])

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/api/auth/login', { email, password })
    saveToken(data.token)
  }, [saveToken])

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
