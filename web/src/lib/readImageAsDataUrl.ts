const MAX_PHOTO_BYTES = 2 * 1024 * 1024

/** Читает изображение как data URL (для локального превью в persist). */
export function readImageAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Нужен файл изображения (PNG, JPEG, WebP…).'))
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return Promise.reject(new Error('Фото не больше 2 МБ.'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}
