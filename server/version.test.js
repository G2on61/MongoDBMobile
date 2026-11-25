import { describe, expect, it } from 'vitest'
import { GATEWAY_VERSION } from './version.js'

describe('GATEWAY_VERSION', () => {
  it('suit le format semver', () => {
    expect(GATEWAY_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
