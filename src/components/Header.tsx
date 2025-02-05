import { useState } from 'react'
import { User, LogOut, ClipboardList, ChevronDown, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import SignUpModal from './SignUpModal'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

function Header() {
  const { currentUser } = useAuth()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userEmail')
      localStorage.removeItem('authUser')
      localStorage.removeItem('userProfile')
      toast.success('Berhasil logout')
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Gagal logout')
    }
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
    // Close user menu when mobile menu is toggled
    setShowUserMenu(false)
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <header className="bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="text-lg font-bold text-blue-500 flex-shrink-0">
            PPDB Online
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-500 hover:text-gray-600"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <Link 
                to="/pendaftaran-saya"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Pendaftaran Saya
              </Link>
            )}
            
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{currentUser.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Desktop User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignUpModal(true)}
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 py-2">
            {currentUser && (
              <Link 
                to="/pendaftaran-saya"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                <ClipboardList className="w-4 h-4" />
                Pendaftaran Saya
              </Link>
            )}
            
            {currentUser ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowSignUpModal(true)
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        )}
      </div>

      <SignUpModal 
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />
    </header>
  )
}

export default Header
