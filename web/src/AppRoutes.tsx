import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { OrchestraWorkspace } from './routes/OrchestraWorkspace'
import { PlanningQuestionnaireWorkspace } from './routes/PlanningQuestionnaireWorkspace'
import { PromptStructuresWorkspace } from './routes/PromptStructuresWorkspace'
import { StreamWorkspace } from './routes/StreamWorkspace'

/** Корневые маршруты приложения (рабочее место структурирования потока). */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<StreamWorkspace />} />
        <Route path="/structures" element={<PromptStructuresWorkspace />} />
        <Route path="/plan" element={<PlanningQuestionnaireWorkspace />} />
        <Route path="/orchestra" element={<OrchestraWorkspace />} />
      </Route>
    </Routes>
  )
}
