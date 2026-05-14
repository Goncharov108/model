import { tokenizeWords } from './tokenizeWords'

/** Количество слов по токенизации Unicode-букв. */
export function countWords(text: string): number {
  return tokenizeWords(text).length
}
