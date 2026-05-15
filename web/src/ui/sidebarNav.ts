/** Классы пункта бокового меню (NavLink). */
export function sidebarNavClass(isActive: boolean): string {
  return [
    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70',
    isActive
      ? 'bg-violet-500/15 text-violet-100 ring-1 ring-violet-500/30'
      : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200',
  ].join(' ')
}

/** Классы вложенного пункта (продвинутые настройки). */
export function sidebarSubNavClass(isActive: boolean): string {
  return [
    'flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition',
    isActive ? 'bg-zinc-800 text-violet-100' : 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300',
  ].join(' ')
}
