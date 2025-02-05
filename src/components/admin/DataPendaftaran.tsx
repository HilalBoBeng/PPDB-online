import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Check, X, Loader } from 'lucide-react'
import { ref, onValue, update } from 'firebase/database'
import { database } from '../../firebase'
import toast from 'react-hot-toast'

interface Registration {
  fullName: string
  previousSchool: string
  score: string
  parentName: string
  phoneNumber: string
  status: string
  timestamp: string
  email_ortu: string
}

interface RegistrationWithKey extends Registration {
  key: string
}

function DataPendaftaran() {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState<RegistrationWithKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    const adminVerified = sessionStorage.getItem('adminVerified')
    if (adminVerified !== 'true') {
      navigate('/admin')
      return
    }

    const registrationsRef = ref(database, 'ppdb_registrations')
    
    const unsubscribe = onValue(registrationsRef, (snapshot) => {
      try {
        const data = snapshot.val()
        if (data) {
          const registrationsArray = Object.entries(data).map(([key, value]) => ({
            key,
            ...(value as Registration)
          }))
          
          const sortedRegistrations = registrationsArray.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          
          setRegistrations(sortedRegistrations)
        } else {
          setRegistrations([])
        }
      } catch (error) {
        console.error('Error processing registrations:', error)
        toast.error('Gagal memuat data pendaftaran')
      } finally {
        setLoading(false)
      }
    }, (error) => {
      console.error('Error fetching registrations:', error)
      toast.error('Gagal memuat data pendaftaran')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleStatusUpdate = async (registrationKey: string, newStatus: string) => {
    try {
      setUpdatingStatus(registrationKey)
      const registrationRef = ref(database, `ppdb_registrations/${registrationKey}`)
      
      await update(registrationRef, {
        status: newStatus
      })
      
      toast.success(`Status berhasil diubah menjadi ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Gagal mengubah status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(registration => {
      const matchesSearch = 
        registration.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.previousSchool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.email_ortu.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = 
        statusFilter === 'all' || registration.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [registrations, searchQuery, statusFilter])

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Panel Admin</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-800">Data Pendaftaran PPDB</h1>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pendaftar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Diterima</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="ios-card overflow-hidden">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tidak ada data yang sesuai dengan filter'
                  : 'Belum ada pendaftaran'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal Sekolah</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orang Tua</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRegistrations.map((registration) => (
                    <tr 
                      key={registration.key}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="leading-tight">
                          <p className="text-sm font-medium text-gray-800">{registration.fullName}</p>
                          <p className="text-xs text-gray-500">{registration.email_ortu}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{registration.previousSchool}</td>
                      <td className="px-3 py-2 text-xs font-medium">{registration.score}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="leading-tight">
                          <p className="text-xs">{registration.parentName}</p>
                          <p className="text-xs text-gray-500">{registration.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(registration.status)}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(registration.timestamp)}
                      </td>
                      <td className="px-3 py-2">
                        {updatingStatus === registration.key ? (
                          <div className="flex items-center">
                            <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStatusUpdate(registration.key, 'approved')}
                              disabled={registration.status === 'approved'}
                              className={`p-1 rounded-full ${
                                registration.status === 'approved'
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title="Terima"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(registration.key, 'rejected')}
                              disabled={registration.status === 'rejected'}
                              className={`p-1 rounded-full ${
                                registration.status === 'rejected'
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                              title="Tolak"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
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

export default DataPendaftaran
