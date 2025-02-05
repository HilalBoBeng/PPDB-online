import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Trophy, Clock } from 'lucide-react'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'

interface Registration {
  fullName: string
  previousSchool: string
  score: string
  parentName: string
  phoneNumber: string
  status: string
  timestamp: string
}

interface RegistrationWithKey extends Registration {
  key: string
}

function LeaderboardPage() {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState<RegistrationWithKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const registrationsRef = ref(database, 'ppdb_registrations')
    
    const unsubscribe = onValue(registrationsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const registrationsArray = Object.entries(data)
          .map(([key, value]) => ({
            key,
            ...(value as Registration)
          }))
          // Sort by score (highest to lowest)
          .sort((a, b) => Number(b.score) - Number(a.score))
        
        setRegistrations(registrationsArray)
      } else {
        setRegistrations([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const approvedRegistrations = useMemo(() => {
    return registrations.filter(registration => 
      registration.status === 'approved' &&
      (registration.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       registration.previousSchool.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [registrations, searchQuery])

  const pendingRegistrations = useMemo(() => {
    return registrations
      .filter(registration => registration.status === 'pending')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [registrations])

  const getRankColor = (index: number) => {
    switch(index) {
      case 0: return 'text-yellow-500'
      case 1: return 'text-gray-500'
      case 2: return 'text-amber-600'
      default: return 'text-gray-600'
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

  return (
    <div className="min-h-screen p-4">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Kembali</span>
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Approved Registrations Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h1 className="text-xl font-bold text-gray-800">Papan Peringkat PPDB</h1>
          </div>

          <div className="ios-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Pendaftaran Terverifikasi</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pendaftar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Memuat data...</p>
              </div>
            ) : approvedRegistrations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  {searchQuery 
                    ? 'Tidak ada pendaftar terverifikasi yang sesuai dengan pencarian'
                    : 'Belum ada pendaftar yang terverifikasi'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal Sekolah</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approvedRegistrations.map((registration, index) => (
                      <tr 
                        key={registration.key}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className={`px-3 py-2 text-sm font-semibold ${getRankColor(index)}`}>
                          #{index + 1}
                        </td>
                        <td className="px-3 py-2">{registration.fullName}</td>
                        <td className="px-3 py-2 text-xs">{registration.previousSchool}</td>
                        <td className="px-3 py-2 text-xs font-medium">{registration.score}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">
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

        {/* Pending Registrations Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">Pendaftaran Pending</h2>
          </div>

          <div className="ios-card">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Memuat data...</p>
              </div>
            ) : pendingRegistrations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Tidak ada pendaftaran yang menunggu verifikasi</p>
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingRegistrations.map((registration) => (
                      <tr 
                        key={registration.key}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-2">{registration.fullName}</td>
                        <td className="px-3 py-2 text-xs">{registration.previousSchool}</td>
                        <td className="px-3 py-2 text-xs font-medium">{registration.score}</td>
                        <td className="px-3 py-2 text-xs">{registration.parentName}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">
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
    </div>
  )
}

export default LeaderboardPage
