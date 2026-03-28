import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ToastProvider } from '../src/context/ToastContext'
import { AuthProvider } from '../src/context/AuthContext'
import HomePage from '../src/pages/HomePage'

vi.mock('../src/api/client', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider><ToastProvider>
        <HomePage />
      </ToastProvider></AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

test('renders location and bird search fields', () => {
  renderPage()
  expect(screen.getByPlaceholderText(/city, state/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/bird.*optional/i)).toBeInTheDocument()
})

test('shows error when search clicked with no location and no saved location', async () => {
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: /search/i }))
  await waitFor(() => {
    expect(screen.getByText(/please enter a location/i)).toBeInTheDocument()
  })
})

test('uses last known location for bird-only search', async () => {
  localStorage.setItem('birdmap_last_location', JSON.stringify({ lat: 40.71, lng: -74.00, name: 'New York' }))
  renderPage()
  // Type in species field only
  fireEvent.change(screen.getByPlaceholderText(/bird.*optional/i), { target: { value: 'Bald Eagle' } })
  fireEvent.click(screen.getByRole('button', { name: /search/i }))
  await waitFor(() => {
    expect(screen.getByText(/using your last known location/i)).toBeInTheDocument()
    expect(screen.getByText(/New York/)).toBeInTheDocument()
  })
})
