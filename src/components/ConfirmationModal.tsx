import { X, Printer, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PrintTicket from './PrintTicket'
import SignUpModal from './SignUpModal'
import { useState } from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  ticketNumber: string
  type: string
}

function ConfirmationModal({ isOpen, onClose, ticketNumber, type }: ConfirmationModalProps) {
  const navigate = useNavigate()
  const [showSignUp, setShowSignUp] = useState(false)
  
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const handleOnlineRegistration = () => {
    setShowSignUp(true)
  }

  const currentDate = new Date().toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const serviceType = type === 'PPDB' ? 'Pendaftaran PPDB' : 'Teller'

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in print:hidden">
        <div className="ios-card w-full max-w-sm bg-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center pt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nomor Antrian Anda
            </h3>
            <p className="text-4xl font-bold text-blue-500 mb-6">
              {ticketNumber}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Silahkan menunggu nomor antrian anda dipanggil atau daftar secara Online melalui aplikasi INI
            </p>
            <div className="space-y-3">
              <button 
                onClick={handlePrint}
                className="ios-button w-full flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Cetak Nomor Antrian
              </button>
              <button 
                onClick={handleOnlineRegistration}
                className="ios-button w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
              >
                <Globe className="w-5 h-5" />
                Daftar Online
              </button>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      <SignUpModal 
        isOpen={showSignUp}
        onClose={() => {
          setShowSignUp(false)
          onClose()
        }}
      />

      <PrintTicket 
        ticketNumber={ticketNumber}
        type={serviceType}
        date={currentDate}
      />
    </>
  )
}

export default ConfirmationModal
