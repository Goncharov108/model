import { Navigate, Route, Routes } from 'react-router-dom'
import { AdvancedSettingsShell } from './layouts/AdvancedSettingsShell'
import { AppShell } from './layouts/AppShell'
import { PATH } from './lib/appPaths'
import { AdminPanelWorkspace } from './routes/AdminPanelWorkspace'
import { DomainWorkspace } from './routes/DomainWorkspace'
import { HelpWorkspace } from './routes/HelpWorkspace'
import { HomeWorkspace } from './routes/HomeWorkspace'
import { AccountSettingsWorkspace } from './routes/AccountSettingsWorkspace'
import { MasterAdminEnvironmentWorkspace } from './routes/MasterAdminEnvironmentWorkspace'
import { MasterAdminOverviewWorkspace } from './routes/MasterAdminOverviewWorkspace'
import { MasterAdminHermesWorkspace } from './routes/MasterAdminHermesWorkspace'
import { MasterAdminIncomingWorkspace } from './routes/MasterAdminIncomingWorkspace'
import { MasterAdminPhilosophyWorkspace } from './routes/MasterAdminPhilosophyWorkspace'
import { MasterAdminUsersWorkspace } from './routes/MasterAdminUsersWorkspace'
import { OrchestraWorkspace } from './routes/OrchestraWorkspace'
import { PlanningQuestionnaireWorkspace } from './routes/PlanningQuestionnaireWorkspace'
import { PromptStructuresWorkspace } from './routes/PromptStructuresWorkspace'
import { StreamWorkspace } from './routes/StreamWorkspace'

/** Редирект со старых URL (до бокового меню) на «Продвинутые настройки». */
function LegacyRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />
}

/** Корневые маршруты приложения. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeWorkspace />} />
        <Route path="account" element={<AccountSettingsWorkspace />} />
        <Route path="admin" element={<AdminPanelWorkspace />} />

        <Route path="master-admin">
          <Route index element={<Navigate to={PATH.masterAdmin.overview} replace />} />
          <Route path="overview" element={<MasterAdminOverviewWorkspace />} />
          <Route path="environment" element={<MasterAdminEnvironmentWorkspace />} />
          <Route path="users" element={<MasterAdminUsersWorkspace />} />
          <Route path="philosophy" element={<MasterAdminPhilosophyWorkspace />} />
          <Route path="hermes" element={<MasterAdminHermesWorkspace />} />
          <Route path="incoming" element={<MasterAdminIncomingWorkspace />} />
          <Route path="advanced" element={<AdvancedSettingsShell />}>
            <Route index element={<StreamWorkspace />} />
            <Route path="structures" element={<PromptStructuresWorkspace />} />
            <Route path="plan" element={<PlanningQuestionnaireWorkspace />} />
            <Route path="orchestra" element={<OrchestraWorkspace />} />
            <Route path="domain" element={<DomainWorkspace />} />
            <Route path="help" element={<HelpWorkspace />} />
          </Route>
        </Route>

        <Route path="structures" element={<LegacyRedirect to={PATH.masterAdmin.advanced.structures} />} />
        <Route path="plan" element={<LegacyRedirect to={PATH.masterAdmin.advanced.plan} />} />
        <Route path="orchestra" element={<LegacyRedirect to={PATH.masterAdmin.advanced.orchestra} />} />
        <Route path="domain" element={<LegacyRedirect to={PATH.masterAdmin.advanced.domain} />} />
        <Route path="help" element={<LegacyRedirect to={PATH.masterAdmin.advanced.help} />} />
      </Route>
    </Routes>
  )
}
