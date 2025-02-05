import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB0oEGAQ5LOtVZIjhJg9FO_f5paw1EGuYs",
  authDomain: "debby-79cd4.firebaseapp.com",
  databaseURL: "https://debby-79cd4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "debby-79cd4",
  storageBucket: "debby-79cd4.appspot.com",
  messagingSenderId: "627228031116",
  appId: "1:627228031116:web:7e91103c12fd9e5d58a3a9",
  measurementId: "G-4QGN0VXC09"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const auth = getAuth(app)
export const firestore = getFirestore(app)
