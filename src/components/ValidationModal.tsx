import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ValidationModalProps {
  isOpen: boolean
  onClose: () => void
}

function ValidationModal({ isOpen, onClose }: ValidationModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleClose = () => {
    onClose()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="ios-card w-full max-w-md bg-white relative">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-4">
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            Pendaftaran Gagal
          </h3>
          <p className="text-gray-600 mb-6">
            Anda sudah pernah mendaftarkan anak ini, tidak dapat mendaftarkan anak yang sama.
          </p>
          <button
            onClick={handleClose}
            className="ios-button w-full bg-red-500 hover:bg-red-600"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    </div>
  )
}

export default ValidationModal
