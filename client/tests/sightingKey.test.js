import { describe, it, expect } from 'vitest'
import { sightingKey } from '../src/utils/sightingKey'

describe('sightingKey', () => {
  it('produces composite key from subId and speciesCode', () => {
    expect(sightingKey({ subId: 'S123', speciesCode: 'amero' })).toBe('S123_amero')
  })

  it('handles null subId gracefully', () => {
    expect(sightingKey({ subId: null, speciesCode: 'amero' })).toBe('null_amero')
  })

  it('handles undefined speciesCode gracefully', () => {
    expect(sightingKey({ subId: 'S123' })).toBe('S123_undefined')
  })
})
