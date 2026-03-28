import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import SightingsList from '../src/components/SightingsList'

const sightings = [
  { comName: 'American Robin', sciName: 'Turdus migratorius', locName: 'Central Park', obsDt: '2026-03-25 07:42', subId: 'S1', speciesCode: 'amero', howMany: 3 },
  { comName: 'American Robin', sciName: 'Turdus migratorius', locName: 'Prospect Park', obsDt: '2026-03-25 09:15', subId: 'S4', speciesCode: 'amero', howMany: 1 },
  { comName: 'Rock Pigeon', sciName: 'Columba livia', locName: 'Bryant Park', obsDt: '2026-03-25 19:27', subId: 'S2', speciesCode: 'rocpig', howMany: 5 },
  { comName: 'House Sparrow', sciName: 'Passer domesticus', locName: 'Union Square', obsDt: '2026-03-25 12:30', subId: 'S3', speciesCode: 'houspa', howMany: 8 },
]

const defaultProps = {
  sightings,
  selectedSighting: null,
  hoveredSighting: null,
  onSelect: vi.fn(),
  onHover: vi.fn(),
  onHoverEnd: vi.fn(),
  speciesFilter: '',
  onSpeciesFilterChange: vi.fn(),
  listOpen: true,
  onToggleList: vi.fn(),
  loading: false,
}

test('renders species groups alphabetically', () => {
  render(<SightingsList {...defaultProps} />)
  expect(screen.getByText('American Robin')).toBeInTheDocument()
  expect(screen.getByText('House Sparrow')).toBeInTheDocument()
  expect(screen.getByText('Rock Pigeon')).toBeInTheDocument()
})

test('shows species and sighting counts', () => {
  render(<SightingsList {...defaultProps} />)
  expect(screen.getByText(/3 species/)).toBeInTheDocument()
  expect(screen.getByText(/4 sightings/)).toBeInTheDocument()
})

test('shows sighting count badge per species', () => {
  render(<SightingsList {...defaultProps} />)
  // American Robin has 2 sightings
  expect(screen.getByText('2')).toBeInTheDocument()
})

test('expands species to show locations on click', () => {
  render(<SightingsList {...defaultProps} />)
  // Locations should not be visible initially
  expect(screen.queryByText('Central Park')).not.toBeInTheDocument()

  // Click American Robin species header
  fireEvent.click(screen.getByText('American Robin'))

  // Now locations should be visible
  expect(screen.getByText('Central Park')).toBeInTheDocument()
  expect(screen.getByText('Prospect Park')).toBeInTheDocument()
})

test('calls onSelect when location row clicked', () => {
  const onSelect = vi.fn()
  render(<SightingsList {...defaultProps} onSelect={onSelect} />)

  // Expand American Robin
  fireEvent.click(screen.getByText('American Robin'))
  // Click a location
  fireEvent.click(screen.getByText('Central Park'))

  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ locName: 'Central Park' }))
})

test('filters to matching species', () => {
  render(<SightingsList {...defaultProps} speciesFilter="sparrow" />)
  // HighlightMatch splits text, so use regex
  expect(screen.getByText(/House/)).toBeInTheDocument()
  expect(screen.getByText(/1 species match/)).toBeInTheDocument()
  expect(screen.getByText('Other species nearby')).toBeInTheDocument()
})

test('shows filtered empty state', () => {
  render(<SightingsList {...defaultProps} speciesFilter="xyz" sightings={[]} />)
  expect(screen.getByText(/no matches for "xyz"/i)).toBeInTheDocument()
})

test('shows clear filter button on empty filter', () => {
  const onFilter = vi.fn()
  render(<SightingsList {...defaultProps} speciesFilter="xyz" sightings={[]} onSpeciesFilterChange={onFilter} />)
  fireEvent.click(screen.getByText(/clear filter/i))
  expect(onFilter).toHaveBeenCalledWith('')
})

test('shows collapse toggle with correct aria', () => {
  render(<SightingsList {...defaultProps} />)
  const toggle = screen.getByRole('button', { name: /collapse/i })
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
})

test('calls onToggleList when tab clicked', () => {
  const onToggleList = vi.fn()
  render(<SightingsList {...defaultProps} onToggleList={onToggleList} />)
  fireEvent.click(screen.getByRole('button', { name: /collapse/i }))
  expect(onToggleList).toHaveBeenCalled()
})

test('shows loading state', () => {
  render(<SightingsList {...defaultProps} loading={true} sightings={[]} />)
  expect(screen.queryByText(/loading/i)).toBeInTheDocument()
})

test('shows empty state when no sightings', () => {
  render(<SightingsList {...defaultProps} sightings={[]} />)
  expect(screen.getByText(/no sightings/i)).toBeInTheDocument()
})

test('calls onHover when hovering species header', () => {
  const onHover = vi.fn()
  render(<SightingsList {...defaultProps} onHover={onHover} />)
  fireEvent.mouseEnter(screen.getByText('American Robin').closest('div[style]'))
  expect(onHover).toHaveBeenCalled()
})
