import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { ToastProvider } from '../src/context/ToastContext'
import LogSightingPage from '../src/pages/LogSightingPage'

vi.mock('../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('../src/components/SpeciesAutocomplete', () => ({
  default: ({ value, onChange }) => (
    <input
      data-testid="species-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Species name…"
    />
  ),
}))

import client from '../src/api/client'

function renderNew() {
  return render(
    <MemoryRouter initialEntries={['/log']}>
      <ToastProvider>
        <Routes>
          <Route path="/log" element={<LogSightingPage />} />
          <Route path="/list" element={<div>List page</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

test('shows "Log a Sighting" title for new sighting', () => {
  renderNew()
  expect(screen.getByText('Log a Sighting')).toBeInTheDocument()
})

test('validates species name is required', async () => {
  renderNew()
  const submitBtn = screen.getByRole('button', { name: 'Save Sighting' })
  fireEvent.click(submitBtn)
  await waitFor(() => {
    expect(screen.getByText('Species name is required')).toBeInTheDocument()
  })
})

test('submits new sighting and navigates to /list', async () => {
  client.post.mockResolvedValueOnce({ data: { id: 1, isNewSpecies: false } })
  renderNew()

  const speciesInput = screen.getByTestId('species-input')
  fireEvent.change(speciesInput, { target: { value: 'Bald Eagle' } })

  const submitBtn = screen.getByRole('button', { name: 'Save Sighting' })
  fireEvent.click(submitBtn)

  await waitFor(() => {
    expect(client.post).toHaveBeenCalledWith('/api/sightings', expect.objectContaining({ species_name: 'Bald Eagle' }))
    expect(screen.getByText('List page')).toBeInTheDocument()
  })
})
