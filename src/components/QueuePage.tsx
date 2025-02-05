import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { ref, get, set, onValue } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import ConfirmationModal from './ConfirmationModal'
import SignUpModal from './SignUpModal'
import toast from 'react-hot-toast'

function QueuePage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { currentUser, isLoading } = useAuth()
  const [currentNumber, setCurrentNumber] = useState(0)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [newTicketNumber, setNewTicketNumber] = useState('')

  const prefix = type?.toUpperCase() === 'CS' ? 'PPDB' : 'TL'

  useEffect(() => {
    // Set the intended path in localStorage when accessing this page
    localStorage.setItem('intendedPath', `/queue/${type}`)

    const queueRef = ref(database, `queues/${prefix}`)
    
    // Listen for real-time updates
    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setCurrentNumber(data.currentNumber || 0)
      }
    })

    // Initialize if no data exists
    get(queueRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(queueRef, { currentNumber: 0 })
      }
    })

    return () => {
      unsubscribe()
      // Clean up intended path when component unmounts
      localStorage.removeItem('intendedPath')
    }
  }, [prefix, type])

  const getNextNumber = async () => {
    try {
      const queueRef = ref(database, `queues/${prefix}`)
      const snapshot = await get(queueRef)
      const currentVal = snapshot.exists() ? snapshot.val().currentNumber : 0
      const nextNumber = currentVal + 1
      
      await set(queueRef, { currentNumber: nextNumber })
      
      // Format the ticket number
      const formattedNumber = `${prefix}-${nextNumber.toString().padStart(5, '0')}`
      setNewTicketNumber(formattedNumber)

      if (!currentUser) {
        // For non-logged in users, show confirmation modal
        setShowConfirmationModal(true)
      } else {
        // For logged-in users, store the ticket number and redirect to registration form
        localStorage.setItem('queueNumber', formattedNumber)
        navigate('/register-ppdb')
      }
    } catch (error) {
      console.error('Error getting next number:', error)
      toast.error('Gagal mengambil nomor antrian')
    }
  }

  const resetQueue = async () => {
    try {
      const queueRef = ref(database, `queues/${prefix}`)
      await set(queueRef, { currentNumber: 0 })
      toast.success('Antrian berhasil direset')
    } catch (error) {
      console.error('Error resetting queue:', error)
      toast.error('Gagal mereset antrian')
    }
  }

  const handleSignUpSuccess = () => {
    setShowSignUpModal(false)
    // After successful login, redirect to registration form
    navigate('/register-ppdb')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          {type?.toUpperCase() === 'CS' ? 'Ambil Antrian PPDB' : 'Teller'}
        </h1>

        <div className="ios-card w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-gray-500 mb-2">Nomor Antrian Terakhir</p>
            <p className="text-4xl font-bold text-blue-500">
              {prefix}-{currentNumber.toString().padStart(5, '0')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={getNextNumber}
              className="ios-button w-full"
            >
              Ambil Nomor Antrian
            </button>

            {currentUser && (
              <button 
                onClick={resetQueue}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Antrian
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Show ConfirmationModal for non-logged in users */}
      <ConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        ticketNumber={newTicketNumber}
        type={prefix}
      />

      {/* Show SignUpModal only when user clicks "Daftar Online" in ConfirmationModal */}
      <SignUpModal 
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSuccess={handleSignUpSuccess}
      />
    </div>
  )
}

export default QueuePage
