import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import MobileBirdCard from '../src/components/MobileBirdCard'

vi.mock('../src/services/iNaturalistService.js', () => ({
  fetchBirdPhoto: vi.fn().mockResolvedValue(null),
}))

const sighting = {
  comName: 'American Robin',
  sciName: 'Turdus migratorius',
  locName: 'Central Park',
  obsDt: '2026-03-25 07:42',
  howMany: 3,
  subId: 'S123',
  speciesCode: 'amero',
}

test('renders bird name and details', () => {
  render(<MobileBirdCard sighting={sighting} onClose={() => {}} />)
  expect(screen.getByText('American Robin')).toBeInTheDocument()
  expect(screen.getByText('Turdus migratorius')).toBeInTheDocument()
})

test('renders close button that calls onClose', () => {
  const onClose = vi.fn()
  render(<MobileBirdCard sighting={sighting} onClose={onClose} />)
  fireEvent.click(screen.getByLabelText('Close'))
  expect(onClose).toHaveBeenCalled()
})

test('dismisses on Escape key', () => {
  const onClose = vi.fn()
  render(<MobileBirdCard sighting={sighting} onClose={onClose} />)
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(onClose).toHaveBeenCalled()
})

test('renders nothing when sighting is null', () => {
  const { container } = render(<MobileBirdCard sighting={null} onClose={() => {}} />)
  expect(container.innerHTML).toBe('')
})

test('renders drag handle', () => {
  render(<MobileBirdCard sighting={sighting} onClose={() => {}} />)
  const handle = document.querySelector('[style*="width: 30px"]') || document.querySelector('[style*="width:30px"]')
  expect(handle).toBeTruthy()
})
