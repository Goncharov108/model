import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { PromptStructuresWorkspace } from './routes/PromptStructuresWorkspace'
import { StreamWorkspace } from './routes/StreamWorkspace'

/** Корневые маршруты приложения (рабочее место структурирования потока). */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<StreamWorkspace />} />
        <Route path="/structures" element={<PromptStructuresWorkspace />} />
      </Route>
    </Routes>
  )
}
