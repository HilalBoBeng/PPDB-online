import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import HomePage from './components/HomePage'
import QueuePage from './components/QueuePage'
import RegisterPPDB from './components/RegisterPPDB'
import LeaderboardPage from './components/LeaderboardPage'
import AdminPage from './components/AdminPage'
import DataPendaftaran from './components/admin/DataPendaftaran'
import Settings from './components/admin/Settings'
import PendaftaranSaya from './components/PendaftaranSaya'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/queue/:type" element={<QueuePage />} />
          <Route path="/register-ppdb" element={<RegisterPPDB />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/data-pendaftaran" element={<DataPendaftaran />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/pendaftaran-saya" element={<PendaftaranSaya />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
