import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDL-2vFwkMlM__S8Vam_SD1D8pk3G2exs8",
    authDomain: "ppdb-online-361ef.firebaseapp.com",
    projectId: "ppdb-online-361ef",
    storageBucket: "ppdb-online-361ef.firebasestorage.app",
    messagingSenderId: "559756267963",
    appId: "1:559756267963:web:bcbb2b114e6c3381a4749e",
    measurementId: "G-2NEQZ7SRFT"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const auth = getAuth(app)
export const firestore = getFirestore(app)
