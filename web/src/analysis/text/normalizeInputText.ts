/** Приводит переводы строк и пробелы к предсказуемому виду перед сегментацией. */
export function normalizeInputText(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}
