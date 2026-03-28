import { render, screen } from '@testing-library/react'
import BirdSightingInfo from '../src/components/BirdSightingInfo'

const props = {
  comName: 'American Robin',
  sciName: 'Turdus migratorius',
  locName: 'Central Park – The Ramble',
  obsDt: '2026-03-25 07:42',
  howMany: 3,
  subId: 'S12345',
}

test('renders common name and scientific name', () => {
  render(<BirdSightingInfo {...props} />)
  expect(screen.getByText('American Robin')).toBeInTheDocument()
  expect(screen.getByText('Turdus migratorius')).toBeInTheDocument()
})

test('renders location', () => {
  render(<BirdSightingInfo {...props} />)
  expect(screen.getByText('Central Park – The Ramble')).toBeInTheDocument()
})

test('renders formatted date and time', () => {
  render(<BirdSightingInfo {...props} />)
  expect(screen.getByText(/Mar 25, 2026/)).toBeInTheDocument()
  expect(screen.getByText(/7:42/)).toBeInTheDocument()
})

test('renders count', () => {
  render(<BirdSightingInfo {...props} />)
  expect(screen.getByText(/3 individual/)).toBeInTheDocument()
})

test('renders "present" when howMany is null', () => {
  render(<BirdSightingInfo {...props} howMany={null} />)
  expect(screen.getByText('present')).toBeInTheDocument()
})

test('renders eBird link when subId present', () => {
  render(<BirdSightingInfo {...props} />)
  const link = screen.getByRole('link', { name: /View checklist on eBird/i })
  expect(link).toHaveAttribute('href', 'https://ebird.org/checklist/S12345')
})

test('hides eBird link when subId missing', () => {
  render(<BirdSightingInfo {...props} subId={null} />)
  expect(screen.queryByRole('link', { name: /ebird/i })).not.toBeInTheDocument()
})

test('accepts compact prop for smaller font sizes', () => {
  const { container } = render(<BirdSightingInfo {...props} compact />)
  const name = screen.getByText('American Robin')
  expect(name.style.fontSize).toBe('14px')
})
