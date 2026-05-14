/** Читает текстовый файл как UTF-8 строку (для .txt и подобных). */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'))
    reader.readAsText(file, 'UTF-8')
  })
}
