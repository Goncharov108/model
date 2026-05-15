import { Link } from 'react-router-dom'
import { PATH } from '../lib/appPaths'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'

/** Обзор раздела «Мастер-админ». */
export function MasterAdminOverviewWorkspace() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Мастер-админ"
        title="Обзор"
        description="Расширенные инструменты владельца. Полный прежний интерфейс (Поток, Структуры, План, Оркестр, Домен) — во вкладке «Продвинутые настройки» слева."
      />
      <Link to={PATH.masterAdmin.advanced.stream}>
        <AppButton type="button">Продвинутые настройки</AppButton>
      </Link>
    </div>
  )
}
