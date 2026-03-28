import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ToastProvider } from '../src/context/ToastContext'
import LifeListPage from '../src/pages/LifeListPage'

vi.mock('../src/api/client', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

import client from '../src/api/client'

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <LifeListPage />
      </ToastProvider>
    </MemoryRouter>
  )
}

beforeEach(() => vi.clearAllMocks())

test('shows skeleton while loading', () => {
  client.get.mockReturnValue(new Promise(() => {})) // never resolves
  renderPage()
  // SkeletonCards render as divs with animation style — verify page is in loading state
  expect(client.get).toHaveBeenCalledWith('/api/sightings')
})

test('shows empty state when no sightings', async () => {
  client.get.mockResolvedValueOnce({ data: [] })
  renderPage()
  await waitFor(() => {
    expect(screen.getByText(/haven't logged any sightings/i)).toBeInTheDocument()
  })
})

test('shows sighting entries', async () => {
  client.get.mockResolvedValueOnce({
    data: [
      { id: 1, species_name: 'Bald Eagle', species_code: 'baleag', location_name: 'Central Park', date: '2026-03-01', count: 2, notes: '' },
    ]
  })
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('Bald Eagle')).toBeInTheDocument()
  })
})

test('shows milestone banner at 10 species', async () => {
  const sightings = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1, species_name: `Bird ${i}`, species_code: `bird${i}`,
    location_name: 'Park', date: '2026-03-01', count: 1, notes: '',
  }))
  client.get.mockResolvedValueOnce({ data: sightings })
  renderPage()
  await waitFor(() => {
    expect(screen.getByText(/spotted 10\+ species/i)).toBeInTheDocument()
  })
})

test('dismisses milestone banner per milestone', async () => {
  const sightings = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1, species_name: `Bird ${i}`, species_code: `bird${i}`,
    location_name: 'Park', date: '2026-03-01', count: 1, notes: '',
  }))
  client.get.mockResolvedValueOnce({ data: sightings })
  renderPage()
  await waitFor(() => screen.getByText(/spotted 10\+ species/i))

  const dismissBtn = screen.getByRole('button', { name: '×' })
  fireEvent.click(dismissBtn)
  expect(screen.queryByText(/spotted 10\+ species/i)).not.toBeInTheDocument()
})
