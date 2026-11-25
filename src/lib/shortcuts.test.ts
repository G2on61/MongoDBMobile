import { describe, expect, it } from 'vitest'
import { isRunShortcut } from './shortcuts.ts'

describe('isRunShortcut', () => {
  it('accepte Ctrl+Entrée', () => {
    expect(isRunShortcut({ key: 'Enter', ctrlKey: true, metaKey: false })).toBe(true)
  })

  it('accepte Cmd+Entrée', () => {
    expect(isRunShortcut({ key: 'Enter', ctrlKey: false, metaKey: true })).toBe(true)
  })

  it('refuse Entrée seul et les autres touches', () => {
    expect(isRunShortcut({ key: 'Enter', ctrlKey: false, metaKey: false })).toBe(false)
    expect(isRunShortcut({ key: 'a', ctrlKey: true, metaKey: false })).toBe(false)
  })
})
