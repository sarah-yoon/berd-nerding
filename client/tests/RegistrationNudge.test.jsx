import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegistrationNudge from '../src/components/RegistrationNudge'

function renderNudge() {
  return render(
    <MemoryRouter>
      <RegistrationNudge />
    </MemoryRouter>
  )
}

test('renders the sign up link', () => {
  renderNudge()
  expect(screen.getByText('Sign up free')).toBeInTheDocument()
})

test('dismisses when × is clicked', () => {
  renderNudge()
  const dismissBtn = screen.getByRole('button')
  fireEvent.click(dismissBtn)
  expect(screen.queryByText('Sign up free')).not.toBeInTheDocument()
})
