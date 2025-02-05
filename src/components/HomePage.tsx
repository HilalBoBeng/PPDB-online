import { Link } from 'react-router-dom'
import { FileText, ClipboardList, Trophy, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SignUpModal from './SignUpModal'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebase'

function HomePage() {
  const { currentUser } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [schoolName, setSchoolName] = useState('')

  useEffect(() => {
    const fetchSchoolSettings = async () => {
      try {
        const settingsRef = doc(firestore, 'school_settings', 'school_settings_doc')
        const snapshot = await getDoc(settingsRef)
        
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSchoolName(data.schoolName || '')
        }
      } catch (error) {
        console.error('Error fetching school settings:', error)
      }
    }

    fetchSchoolSettings()
  }, [])

  const handleLockClick = () => {
    if (!currentUser) {
      setShowLoginModal(true)
    } else {
      // If user is logged in, redirect to admin page
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Selamat Datang
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700">
            di PPDB Online
          </h2>
          {schoolName && (
            <h3 className="text-xl md:text-2xl font-medium text-blue-600">
              {schoolName}
            </h3>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link 
            to="/queue/cs" 
            className="ios-card group hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-4">
              <ClipboardList className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-gray-800">Daftar PPDB</span>
            </div>
          </Link>

          <Link 
            to="/leaderboard" 
            className="ios-card group hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-4">
              <Trophy className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-gray-800">Papan Peringkat</span>
            </div>
          </Link>

          <Link 
            to="/queue/teller" 
            className="ios-card group hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-4">
              <FileText className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-gray-800">Lihat Data PPDB</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer with Lock Icon */}
      <footer className="p-6 flex justify-center items-center">
        <button
          onClick={handleLockClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Admin Access"
        >
          <Lock className="w-16 h-16 text-gray-400 hover:text-gray-600 transition-colors" />
        </button>
      </footer>

      {/* Login Modal */}
      <SignUpModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

export default HomePage
