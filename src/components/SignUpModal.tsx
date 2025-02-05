import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth, firestore } from '../firebase'
import { setDoc, doc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void  // Explicitly marked as optional
}

type FormType = 'signup' | 'login'

function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  const { currentUser, userProfile, checkAndRouteUser } = useAuth()
  const [activeForm, setActiveForm] = useState<FormType>('signup')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    childName: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Persistence error:', error)
      })
  }, [])

  useEffect(() => {
    if (currentUser && userProfile) {
      handlePostLoginNavigation()
    }
  }, [currentUser, userProfile])

  const handlePostLoginNavigation = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      onClose()
      // If no onSuccess provided, handle default navigation
      const intendedPath = localStorage.getItem('intendedPath')
      if (intendedPath) {
        window.location.href = intendedPath
        localStorage.removeItem('intendedPath')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const createUserProfile = async (userId: string, email: string) => {
    try {
      const userProfileRef = doc(firestore, 'profiles', userId)
      await setDoc(userProfileRef, {
        email,
        childName: formData.childName,
        role: 'orang tua siswa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (activeForm === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Password tidak cocok')
        return
      }

      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter')
        return
      }

      if (!formData.childName.trim()) {
        setError('Nama anak harus diisi')
        return
      }
    }

    try {
      setIsLoading(true)
      if (activeForm === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        await createUserProfile(userCredential.user.uid, userCredential.user.email || '')
        localStorage.setItem('userEmail', userCredential.user.email || '')
        toast.success(`Berhasil mendaftar sebagai ${userCredential.user.email}`)
        await checkAndRouteUser(userCredential.user.email || '')
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
        localStorage.setItem('userEmail', userCredential.user.email || '')
        toast.success(`Berhasil login sebagai ${userCredential.user.email}`)
        await checkAndRouteUser(userCredential.user.email || '')
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar')
      } else if (error.code === 'auth/invalid-email') {
        setError('Email tidak valid')
      } else if (error.code === 'auth/wrong-password') {
        setError('Password salah')
      } else if (error.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar')
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const switchForm = (type: FormType) => {
    setActiveForm(type)
    setError('')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      childName: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="ios-card w-full max-w-3xl bg-white relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-4">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => switchForm('signup')}
              className={`flex-1 py-3 text-center font-medium transition-colors
                ${activeForm === 'signup' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Daftar Akun
            </button>
            <button
              onClick={() => switchForm('login')}
              className={`flex-1 py-3 text-center font-medium transition-colors
                ${activeForm === 'login' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Masuk
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="hidden md:block p-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {activeForm === 'signup' ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeForm === 'signup' 
                  ? 'Daftar sekarang untuk memulai pendaftaran PPDB online dengan mudah dan cepat.'
                  : 'Masuk ke akun Anda untuk melanjutkan pendaftaran atau melihat status pendaftaran.'}
              </p>
              <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r">
                <p className="text-sm text-blue-700">
                  {activeForm === 'signup'
                    ? 'Dengan mendaftar, Anda akan mendapatkan akses sebagai orang tua siswa.'
                    : 'Gunakan email dan password yang telah terdaftar untuk masuk.'}
                </p>
              </div>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeForm === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Anak
                    </label>
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan nama anak"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan email Anda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan password"
                  />
                </div>

                {activeForm === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Konfirmasi password Anda"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`ios-button w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading 
                    ? (activeForm === 'signup' ? 'Mendaftar...' : 'Masuk...')
                    : (activeForm === 'signup' ? 'Daftar' : 'Masuk')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpModal
