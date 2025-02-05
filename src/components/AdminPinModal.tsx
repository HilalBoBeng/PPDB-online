import { useState } from 'react'
import { X } from 'lucide-react'
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore'
import toast from 'react-hot-toast'

interface AdminPinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PinDocument {
  pin: number
}

function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const db = getFirestore()
      const pinRef = collection(db, 'pin_admin')
      const q = query(pinRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const pinDoc = querySnapshot.docs[0].data() as PinDocument
        console.log('Successfully fetched PIN from Firestore')

        if (pinDoc.pin === parseInt(pin)) {
          toast.success('PIN verified successfully')
          onSuccess()
        } else {
          toast.error('PIN ADMIN salah')
          onClose()
        }
      } else {
        console.error('No PIN document found in Firestore')
        toast.error('Error: PIN configuration not found')
        onClose()
      }
    } catch (error) {
      console.error('Error fetching PIN from Firestore:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="ios-card w-full max-w-md bg-white relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Masukkan PIN Admin
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN"
                maxLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
                required
                className="w-full text-center text-2xl tracking-wider rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length !== 4}
              className={`ios-button w-full ${(isLoading || pin.length !== 4) ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Memeriksa...' : 'Verifikasi PIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminPinModal
