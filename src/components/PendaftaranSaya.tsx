import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Registration {
  fullName: string
  previousSchool: string
  score: string
  status: string
  timestamp: string
  user_id_ortu: string
}

function PendaftaranSaya() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      toast.error('Silakan login terlebih dahulu')
      navigate('/')
      return
    }

    // Reference to the registrations node
    const registrationsRef = ref(database, 'ppdb_registrations')
    
    // Create query to filter by user_id_ortu
    const userRegistrationsQuery = query(
      registrationsRef,
      orderByChild('user_id_ortu'),
      equalTo(currentUser.uid)
    )

    // Set up real-time listener
    const unsubscribe = onValue(userRegistrationsQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert object to array and sort by timestamp (newest first)
        const registrationsArray = Object.values(data) as Registration[]
        const sortedRegistrations = registrationsArray.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setRegistrations(sortedRegistrations)
      } else {
        setRegistrations([])
      }
      setLoading(false)
    }, (error) => {
      console.error('Error fetching registrations:', error)
      toast.error('Gagal memuat data pendaftaran')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser, navigate])

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu'
      case 'approved':
        return 'Diterima'
      case 'rejected':
        return 'Ditolak'
      default:
        return status
    }
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

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pendaftaran Saya</h1>
        
        <div className="ios-card overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada pendaftaran</p>
              <button
                onClick={() => navigate('/register-ppdb')}
                className="ios-button mt-4"
              >
                Daftar Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama Lengkap</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Asal Sekolah</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nilai</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration, index) => (
                    <tr 
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">{registration.fullName}</td>
                      <td className="px-6 py-4">{registration.previousSchool}</td>
                      <td className="px-6 py-4 font-medium">{registration.score}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(registration.status)}>
                          {getStatusText(registration.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(registration.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PendaftaranSaya
