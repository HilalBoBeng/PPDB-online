import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from '../firebase'

interface RegistrationTime {
  isWithinRegistrationPeriod: boolean
  registrationStart: string
  registrationEnd: string
  message: string
  isLoading: boolean
  error: string | null
}

const SETTINGS_DOC_ID = 'school_settings_doc'

export function useRegistrationTime(): RegistrationTime {
  const [registrationTime, setRegistrationTime] = useState<RegistrationTime>({
    isWithinRegistrationPeriod: false,
    registrationStart: '',
    registrationEnd: '',
    message: 'Memuat waktu pendaftaran...',
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const settingsRef = doc(firestore, 'school_settings', SETTINGS_DOC_ID)
    
    const unsubscribe = onSnapshot(settingsRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          const now = new Date()
          const startDate = new Date(data.registrationStart)
          const endDate = new Date(data.registrationEnd)

          let message = ''
          let isWithinPeriod = false

          if (now < startDate) {
            message = `Pendaftaran belum dibuka. Pendaftaran akan dibuka pada ${startDate.toLocaleString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`
          } else if (now > endDate) {
            message = `Pendaftaran sudah ditutup. Pendaftaran ditutup pada ${endDate.toLocaleString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`
          } else {
            message = `Pendaftaran sedang dibuka sampai ${endDate.toLocaleString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`
            isWithinPeriod = true
          }

          setRegistrationTime({
            isWithinRegistrationPeriod: isWithinPeriod,
            registrationStart: data.registrationStart,
            registrationEnd: data.registrationEnd,
            message,
            isLoading: false,
            error: null
          })
        } else {
          setRegistrationTime(prev => ({
            ...prev,
            isLoading: false,
            error: 'Pengaturan waktu pendaftaran belum diatur oleh admin',
            message: 'Pengaturan waktu pendaftaran belum diatur oleh admin'
          }))
        }
      },
      (error) => {
        console.error('Error fetching registration time:', error)
        setRegistrationTime(prev => ({
          ...prev,
          isLoading: false,
          error: 'Gagal memuat waktu pendaftaran',
          message: 'Gagal memuat waktu pendaftaran'
        }))
      }
    )

    return () => unsubscribe()
  }, [])

  return registrationTime
}
