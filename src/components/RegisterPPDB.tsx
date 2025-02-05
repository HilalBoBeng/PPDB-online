import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader } from 'lucide-react'
import { ref, push } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useRegistrationTime } from '../hooks/useRegistrationTime'
import ValidationModal from './ValidationModal'
import toast from 'react-hot-toast'

interface Registration {
  fullName: string
  birthPlace: string
  birthDate: string
  gender: string
  address: string
  score: string
  parentName: string
  phoneNumber: string
  previousSchool: string
}

const initialFormData: Registration = {
  fullName: '',
  birthPlace: '',
  birthDate: '',
  gender: '',
  address: '',
  score: '',
  parentName: '',
  phoneNumber: '',
  previousSchool: ''
}

function RegisterPPDB() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState<Registration>(initialFormData)
  const [scoreError, setScoreError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const { isWithinRegistrationPeriod, message, isLoading, error } = useRegistrationTime()

  // Load saved form data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('partial_regist_ppdb')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData)
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'score') {
      if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
        const updatedFormData = {
          ...formData,
          [name]: value
        }
        setFormData(updatedFormData)
        localStorage.setItem('partial_regist_ppdb', JSON.stringify(updatedFormData))
        
        if (value !== '' && Number(value) < 30) {
          setScoreError('Nilai terlalu rendah belum dapat mendaftar di sekolah ini')
        } else {
          setScoreError('')
        }
      }
      return
    }

    const updatedFormData = {
      ...formData,
      [name]: value
    }
    setFormData(updatedFormData)
    localStorage.setItem('partial_regist_ppdb', JSON.stringify(updatedFormData))
  }

  const checkExistingRegistration = (fullName: string): boolean => {
    try {
      const existingRegistrations = localStorage.getItem('pendaftaranppdbSekolah')
      if (existingRegistrations) {
        const registrations: Registration[] = JSON.parse(existingRegistrations)
        return registrations.some(
          registration => registration.fullName.toLowerCase() === fullName.toLowerCase()
        )
      }
      return false
    } catch (error) {
      console.error('Error checking existing registration:', error)
      return false
    }
  }

  const saveToLocalStorage = (data: Registration) => {
    try {
      const existingRegistrations = localStorage.getItem('pendaftaranppdbSekolah')
      let registrations: Registration[] = []
      
      if (existingRegistrations) {
        registrations = JSON.parse(existingRegistrations)
      }
      
      registrations.push(data)
      localStorage.setItem('pendaftaranppdbSekolah', JSON.stringify(registrations))
      localStorage.setItem('partial_regist_ppdb', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      throw new Error('Gagal menyimpan data lokasi')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('Silakan login terlebih dahulu')
      return
    }

    if (!isWithinRegistrationPeriod) {
      toast.error('Pendaftaran sedang ditutup')
      return
    }

    if (Number(formData.score) < 30) {
      setScoreError('Nilai terlalu rendah belum dapat mendaftar di sekolah ini')
      return
    }

    if (checkExistingRegistration(formData.fullName)) {
      setShowValidationModal(true)
      return
    }

    try {
      setIsSubmitting(true)
      
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        user_id_ortu: currentUser.uid,
        email_ortu: currentUser.email,
        status: 'pending'
      }

      const registrationsRef = ref(database, 'ppdb_registrations')
      await push(registrationsRef, submissionData)
      
      saveToLocalStorage(formData)
      toast.success('Pendaftaran berhasil disimpan!')
      navigate('/pendaftaran-saya')
    } catch (error) {
      console.error('Error submitting form:', error)
      if (error instanceof Error) {
        toast.error(`Terjadi kesalahan: ${error.message}`)
      } else {
        toast.error('Terjadi kesalahan yang tidak diketahui')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Memuat waktu pendaftaran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pendaftaran PPDB Online</h1>
        
        {/* Registration Period Message */}
        <div className={`ios-card mb-6 ${
          error ? 'bg-red-50' :
          isWithinRegistrationPeriod ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <p className={`text-sm ${
            error ? 'text-red-700' :
            isWithinRegistrationPeriod ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {message}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="ios-card space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  required
                  disabled={!isWithinRegistrationPeriod}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  disabled={!isWithinRegistrationPeriod}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nilai
              </label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                min="0"
                max="100"
                placeholder="Masukkan nilai (30-100)"
                className={`w-full rounded-lg border ${scoreError ? 'border-red-300' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 ${scoreError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {scoreError ? (
                <p className="text-sm text-red-500 mt-1">{scoreError}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Masukkan nilai rata-rata (minimal 30)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Orang Tua/Wali
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asal Sekolah
              </label>
              <input
                type="text"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleChange}
                required
                disabled={!isWithinRegistrationPeriod}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !!scoreError || !isWithinRegistrationPeriod}
              className={`ios-button w-full ${(isSubmitting || !!scoreError || !isWithinRegistrationPeriod) ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Menyimpan...' : 'Daftar Sekarang'}
            </button>
          </div>
        </form>
      </div>

      <ValidationModal 
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
      />
    </div>
  )
}

export default RegisterPPDB
