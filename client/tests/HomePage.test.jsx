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

test('renders location search field', () => {
  renderPage()
  expect(screen.getByText(/city, state/i)).toBeInTheDocument()
})

test('shows error when search clicked with no location', async () => {
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: /search/i }))
  await waitFor(() => {
    expect(screen.getByText(/please enter a location/i)).toBeInTheDocument()
  })
})

test('renders use my location button', () => {
  renderPage()
  expect(screen.getByText(/use my location/i)).toBeInTheDocument()
})
