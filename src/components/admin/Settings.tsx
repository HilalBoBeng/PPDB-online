import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Clock, CircleAlert } from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from '../../firebase'
import toast from 'react-hot-toast'

interface SchoolSettings {
  schoolName: string
  registrationStart: string
  registrationEnd: string
}

interface ValidationErrors {
  registrationStart?: string
  registrationEnd?: string
}

const SETTINGS_DOC_ID = 'school_settings_doc' // Fixed document ID

function Settings() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: '',
    registrationStart: '',
    registrationEnd: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    // Check if admin is verified
    const adminVerified = sessionStorage.getItem('adminVerified')
    if (adminVerified !== 'true') {
      navigate('/admin')
      return
    }

    // Load settings from Firestore
    const loadSettings = async () => {
      try {
        const settingsRef = doc(firestore, 'school_settings', SETTINGS_DOC_ID)
        const snapshot = await getDoc(settingsRef)
        
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSettings({
            schoolName: data.schoolName || '',
            registrationStart: data.registrationStart || '',
            registrationEnd: data.registrationEnd || ''
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Gagal memuat pengaturan')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [navigate])

  const validateDates = (newSettings: SchoolSettings): ValidationErrors => {
    const errors: ValidationErrors = {}
    const now = new Date()
    
    // Only validate that end time is in the future and after start time
    if (newSettings.registrationEnd) {
      const endDate = new Date(newSettings.registrationEnd)
      const startDate = new Date(newSettings.registrationStart)
      
      if (endDate <= now) {
        errors.registrationEnd = 'Waktu selesai harus di masa depan'
      }
      
      if (endDate <= startDate) {
        errors.registrationEnd = 'Waktu selesai harus setelah waktu mulai'
      }
    }

    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newSettings = {
      ...settings,
      [name]: value
    }
    
    setSettings(newSettings)

    // Validate dates on change
    if (name === 'registrationStart' || name === 'registrationEnd') {
      const errors = validateDates(newSettings)
      setValidationErrors(errors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate before submission
    const errors = validateDates(settings)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Mohon perbaiki error pada form')
      return
    }

    setIsSaving(true)

    try {
      // Save to Firestore
      const settingsRef = doc(firestore, 'school_settings', SETTINGS_DOC_ID)
      await setDoc(settingsRef, {
        schoolName: settings.schoolName,
        registrationStart: settings.registrationStart,
        registrationEnd: settings.registrationEnd,
        updatedAt: new Date().toISOString()
      }, { merge: true }) // Use merge: true to update existing document

      toast.success('Pengaturan berhasil disimpan')
      setValidationErrors({})
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  const hasValidationErrors = Object.keys(validationErrors).length > 0

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Panel Admin
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        {isLoading ? (
          <div className="ios-card">
            <p className="text-gray-500">Memuat pengaturan...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="ios-card space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">Pengaturan Sekolah</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={settings.schoolName}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama sekolah"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Pendaftaran Mulai
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={settings.registrationStart}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 focus:ring-blue-500 px-4 py-2 focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Pendaftaran Selesai
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={settings.registrationEnd}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-lg border ${
                      validationErrors.registrationEnd 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    } px-4 py-2 focus:outline-none focus:ring-2`}
                  />
                  {validationErrors.registrationEnd && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                      <CircleAlert className="w-4 h-4" />
                      <span>{validationErrors.registrationEnd}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving || hasValidationErrors}
                  className={`ios-button w-full flex items-center justify-center gap-2 ${
                    (isSaving || hasValidationErrors) ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
                
                {hasValidationErrors && (
                  <p className="text-center text-red-500 text-sm mt-2">
                    Mohon perbaiki error pada form sebelum menyimpan
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Settings
