import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, firestore } from '../firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

interface UserProfile {
  role?: string
  email: string
}

interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  checkAndRouteUser: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isLoading: true,
  checkAndRouteUser: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const checkAndRouteUser = async (email: string) => {
    try {
      const profilesRef = collection(firestore, 'profiles')
      const q = query(profilesRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const profileData = querySnapshot.docs[0].data() as UserProfile
        setUserProfile(profileData)
        localStorage.setItem('userProfile', JSON.stringify(profileData))

        // Route based on role
        if (profileData.role === 'admin') {
          navigate('/admin')
        } else if (profileData.role === 'orang tua siswa') {
          navigate('/register-ppdb')
        }
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
    }
  }

  const fetchUserProfile = async (uid: string) => {
    try {
      const userProfileRef = doc(firestore, 'profiles', uid)
      const userProfileSnap = await getDoc(userProfileRef)
      
      if (userProfileSnap.exists()) {
        const profileData = userProfileSnap.data() as UserProfile
        setUserProfile(profileData)
        localStorage.setItem('userProfile', JSON.stringify(profileData))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return

      if (user) {
        setCurrentUser(user)
        localStorage.setItem('authUser', JSON.stringify({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        }))
        
        await fetchUserProfile(user.uid)
        if (user.email) {
          await checkAndRouteUser(user.email)
        }
      } else {
        setCurrentUser(null)
        localStorage.removeItem('authUser')
        localStorage.removeItem('userProfile')
        setUserProfile(null)
      }
      
      setIsLoading(false)
    })

    // Load cached data
    const savedUser = localStorage.getItem('authUser')
    const savedProfile = localStorage.getItem('userProfile')
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    userProfile,
    isLoading,
    checkAndRouteUser
  }

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}
