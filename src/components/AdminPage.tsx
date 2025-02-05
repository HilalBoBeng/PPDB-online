import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Settings } from 'lucide-react'
import AdminPinModal from './AdminPinModal'

function AdminPage() {
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)
  const [showPinModal, setShowPinModal] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      // Check if admin is already verified in this session
      const adminVerified = sessionStorage.getItem('adminVerified')
      if (adminVerified === 'true') {
        setIsVerified(true)
        setShowPinModal(false)
      }
    } catch (error) {
      console.error('Error checking admin verification:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handlePinSuccess = () => {
    setIsVerified(true)
    setShowPinModal(false)
    // Store verification status in session storage
    sessionStorage.setItem('adminVerified', 'true')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <AdminPinModal
        isOpen={showPinModal}
        onClose={() => navigate('/')}
        onSuccess={handlePinSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel Admin</h1>
        
        <div className="ios-card mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Selamat Datang, Admin</h2>
              <p className="text-gray-600">
                Halaman ini memberikan akses ke fungsi administratif sistem PPDB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="ios-card bg-blue-50 border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Pendaftar</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>

              <div className="ios-card bg-green-50 border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-2">Pendaftar Hari Ini</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Glassy Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/data-pendaftaran')}
            className="group p-6 rounded-2xl border border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-lg shadow-lg hover:bg-opacity-20 transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-4">
              <Database className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg font-semibold text-gray-800">Data Pendaftaran</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/settings')}
            className="group p-6 rounded-2xl border border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-lg shadow-lg hover:bg-opacity-20 transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-4">
              <Settings className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg font-semibold text-gray-800">Settings</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              sessionStorage.removeItem('adminVerified')
              navigate('/')
            }}
            className="ios-button bg-red-500 hover:bg-red-600"
          >
            Keluar dari Panel Admin
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
