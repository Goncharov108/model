/** Целое число для отображения в UI (локаль пользователя). */
export function formatInt(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
}
