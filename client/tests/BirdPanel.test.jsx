import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import BirdPanel from '../src/components/BirdPanel'

vi.mock('../src/services/iNaturalistService.js', () => ({
  fetchBirdPhoto: vi.fn().mockResolvedValue(null),
}))
vi.mock('../src/services/phylopicService.js', () => ({
  fetchPhylopicIcon: vi.fn().mockResolvedValue(null),
}))

const sighting = {
  comName: 'American Robin',
  sciName: 'Turdus migratorius',
  locName: 'Central Park – The Ramble',
  obsDt: '2026-03-25 07:42',
  howMany: 3,
  subId: 'S12345',
  lat: 40.78, lng: -73.96,
}

test('renders species name and scientific name', async () => {
  render(<BirdPanel sighting={sighting} onClose={() => {}} />)
  expect(screen.getByText('American Robin')).toBeInTheDocument()
  expect(screen.getByText('Turdus migratorius')).toBeInTheDocument()
})

test('renders location', async () => {
  render(<BirdPanel sighting={sighting} onClose={() => {}} />)
  expect(screen.getByText('Central Park – The Ramble')).toBeInTheDocument()
})

test('renders formatted date and time', async () => {
  render(<BirdPanel sighting={sighting} onClose={() => {}} />)
  // Should show date and time from obsDt "2026-03-25 07:42"
  expect(screen.getByText(/Mar 25, 2026/)).toBeInTheDocument()
  expect(screen.getByText(/7:42/)).toBeInTheDocument()
})

test('renders count as number when howMany is set', async () => {
  render(<BirdPanel sighting={sighting} onClose={() => {}} />)
  expect(screen.getByText(/3 individual/)).toBeInTheDocument()
})

test('renders "present" when howMany is null', async () => {
  render(<BirdPanel sighting={{ ...sighting, howMany: null }} onClose={() => {}} />)
  expect(screen.getByText('present')).toBeInTheDocument()
})

test('renders eBird link when subId present', async () => {
  render(<BirdPanel sighting={sighting} onClose={() => {}} />)
  const link = screen.getByRole('link', { name: /View checklist on eBird/i })
  expect(link).toHaveAttribute('href', 'https://ebird.org/checklist/S12345')
})

test('hides eBird link when subId missing', async () => {
  render(<BirdPanel sighting={{ ...sighting, subId: null }} onClose={() => {}} />)
  expect(screen.queryByRole('link', { name: /ebird/i })).not.toBeInTheDocument()
})

test('calls onClose when × button clicked', async () => {
  const onClose = vi.fn()
  render(<BirdPanel sighting={sighting} onClose={onClose} />)
  screen.getByRole('button').click()
  expect(onClose).toHaveBeenCalled()
})

test('shows iNaturalist photo when loaded', async () => {
  const { fetchBirdPhoto } = await import('../src/services/iNaturalistService.js')
  fetchBirdPhoto.mockResolvedValue({ photoUrl: 'https://example.com/robin.jpg', attribution: '© Photographer' })

  render(<BirdPanel sighting={sighting} onClose={() => {}} />)
  await waitFor(() => {
    expect(screen.getByRole('img', { name: 'American Robin' })).toBeInTheDocument()
  })
})
