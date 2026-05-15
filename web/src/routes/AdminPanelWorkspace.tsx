import { PageHeader } from '../ui/PageHeader'

/** Админ-панель (отдельно от Мастер-админ). */
export function AdminPanelWorkspace() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Администрирование"
        title="Админ-панель"
        description="Общие административные действия репозитория model. Расширенный рабочий UI — в разделе «Мастер-админ»."
      />
      <p className="text-sm text-zinc-500">
        Здесь позже появятся настройки доступа, журнал и интеграции. Пока используйте «Мастер-админ» для
        полного прежнего интерфейса.
      </p>
    </div>
  )
}
