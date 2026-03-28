import { render, act, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { vi } from 'vitest'

vi.mock('../src/api/client', () => ({
  default: {
    post: vi.fn(),
  },
}))

import client from '../src/api/client'

function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="is-auth">{String(auth.isAuth)}</span>
      <button onClick={() => auth.logout()}>logout</button>
      <button onClick={() => auth.login('test@test.com', 'password123')}>login</button>
    </div>
  )
}

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

test('isAuth is false with no token', () => {
  renderWithProviders()
  expect(screen.getByTestId('is-auth').textContent).toBe('false')
})

test('login calls API, stores token, and sets isAuth true', async () => {
  // Create a fake JWT with base64url-encoded payload
  const payload = btoa(JSON.stringify({ id: 1, email: 'test@test.com' }))
  const fakeToken = `header.${payload}.sig`
  client.post.mockResolvedValueOnce({ data: { token: fakeToken } })

  renderWithProviders()
  expect(screen.getByTestId('is-auth').textContent).toBe('false')

  await act(async () => {
    screen.getByRole('button', { name: 'login' }).click()
  })

  // Verify client.post was called with the correct endpoint and credentials
  expect(client.post).toHaveBeenCalledWith('/api/auth/login', {
    email: 'test@test.com',
    password: 'password123',
  })
  // Verify token was stored in localStorage
  expect(localStorage.getItem('birdmap_token')).toBe(fakeToken)
  // Verify isAuth transitioned to true in the UI
  expect(screen.getByTestId('is-auth').textContent).toBe('true')
})

test('logout clears token and sets isAuth false', async () => {
  const payload = btoa(JSON.stringify({ id: 1, email: 'test@test.com' }))
  const fakeToken = `header.${payload}.sig`
  localStorage.setItem('birdmap_token', fakeToken)

  renderWithProviders()
  expect(screen.getByTestId('is-auth').textContent).toBe('true')

  await act(async () => {
    screen.getByRole('button', { name: 'logout' }).click()
  })
  expect(screen.getByTestId('is-auth').textContent).toBe('false')
  expect(localStorage.getItem('birdmap_token')).toBeNull()
})
