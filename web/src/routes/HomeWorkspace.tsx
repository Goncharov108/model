import { Link } from 'react-router-dom'
import { PATH } from '../lib/appPaths'
import { PageHeader } from '../ui/PageHeader'
import { AppButton } from '../ui/AppButton'

/** Главная страница (вне «Продвинутых настроек»). */
export function HomeWorkspace() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Главная"
        title="Добро пожаловать"
        description="Основной интерфейс структурирования потока и реестров перенесён в Мастер-админ → Продвинутые настройки."
      />
      <Link to={PATH.masterAdmin.advanced.stream}>
        <AppButton type="button">Открыть продвинутые настройки</AppButton>
      </Link>
    </div>
  )
}
