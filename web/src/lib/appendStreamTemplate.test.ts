import { describe, expect, it } from 'vitest'
import { appendTextToStream } from './appendStreamTemplate'

describe('appendTextToStream', () => {
  it('возвращает только шаблон, если поле пустое', () => {
    expect(appendTextToStream('', 'шаблон')).toBe('шаблон')
    expect(appendTextToStream('   ', 'шаблон')).toBe('шаблон')
  })

  it('добавляет шаблон через разделитель', () => {
    expect(appendTextToStream('текст', 'шаблон')).toBe('текст\n\n---\n\nшаблон')
  })

  it('не меняет поле при пустом шаблоне', () => {
    expect(appendTextToStream('текст', '')).toBe('текст')
  })
})
