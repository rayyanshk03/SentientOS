import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Landing from './pages/Landing.jsx'

// Import new page components
import ChatPage from './pages/ChatPage.jsx'
import PipelinePage from './pages/PipelinePage.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import UserManagementPage from './pages/UserManagementPage.jsx'
import MetricsPage from './pages/MetricsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import LLMSettingsPage from './pages/LLMSettingsPage.jsx'
import ConfigurationPage from './pages/ConfigurationPage.jsx'
import MemoriesPage from './pages/MemoriesPage.jsx'
import AdrsPage from './pages/AdrsPage.jsx'
import BugsPage from './pages/BugsPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<App />}>
          <Route index element={<ChatPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="vault" element={<MemoriesPage />} />
          <Route path="adr" element={<AdrsPage />} />
          <Route path="bugs" element={<BugsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="llm-settings" element={<LLMSettingsPage />} />
          <Route path="configuration" element={<ConfigurationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
