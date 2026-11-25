import { describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard.ts'

describe('copyText', () => {
  it('retourne true quand le presse-papiers accepte le texte', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(copyText('{"plan":"pro"}')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('{"plan":"pro"}')
  })

  it('retourne false si le presse-papiers est indisponible', async () => {
    vi.stubGlobal('navigator', {})

    await expect(copyText('{}')).resolves.toBe(false)
  })
})
