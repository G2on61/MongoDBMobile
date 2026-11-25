import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadTheme, saveTheme } from './theme.ts'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  })
})

describe('theme', () => {
  it('retourne system par défaut', () => {
    expect(loadTheme()).toBe('system')
  })

  it('lit un thème enregistré', () => {
    store.set('mongodbmobile.theme.v1', 'dark')
    expect(loadTheme()).toBe('dark')
  })

  it('ignore une valeur invalide', () => {
    store.set('mongodbmobile.theme.v1', 'neon')
    expect(loadTheme()).toBe('system')
  })

  it('persiste le thème choisi', () => {
    saveTheme('light')
    expect(loadTheme()).toBe('light')
  })
})
