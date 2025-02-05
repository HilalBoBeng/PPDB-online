import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
//ganti const firebaseConfig = { .......... dengan punya anda sendiri, caranya lihat di https://youtu.be/2yZOCkcyNN4
const firebaseConfig = {
  apiKey: "GANTI DENGAN PUNYA ANDA SENDIRI",
  authDomain: "GANTI DENGAN PUNYA ANDA SENDIRI",
  databaseURL: "GANTI DENGAN PUNYA ANDA SENDIRI",
  projectId: "GANTI DENGAN PUNYA ANDA SENDIRI",
  storageBucket: "GANTI DENGAN PUNYA ANDA SENDIRI",
  messagingSenderId: "GANTI DENGAN PUNYA ANDA SENDIRI",
  appId: "GANTI DENGAN PUNYA ANDA SENDIRI",
  measurementId: "GANTI DENGAN PUNYA ANDA SENDIRI"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const auth = getAuth(app)
export const firestore = getFirestore(app)
