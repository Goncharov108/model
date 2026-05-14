/** Извлекает слова (Unicode-буквы); приводит к нижнему регистру. */
export function tokenizeWords(text: string): string[] {
  const matches = text.toLowerCase().match(/\p{L}+/gu)
  return matches ?? []
}
