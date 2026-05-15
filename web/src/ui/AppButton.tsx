import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { JSX } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

const variantClass: Record<Variant, string> = {
  primary:
    'bg-violet-600 text-white hover:bg-violet-500 focus-visible:ring-violet-400/80 disabled:opacity-40',
  ghost:
    'border border-zinc-600/90 bg-zinc-900/90 text-zinc-50 hover:border-zinc-500 hover:bg-zinc-800 focus-visible:ring-zinc-400/80 disabled:opacity-40',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400/80 disabled:opacity-40',
}

/** Кнопка действия с предсказуемыми вариантами стиля. */
export function AppButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    children: ReactNode
  },
): JSX.Element {
  const { variant = 'primary', className = '', children, type = 'button', ...rest } = props
  const base =
    'inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed'
  return (
    <button type={type} className={`${base} ${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
