// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDL-2vFwkMlM__S8Vam_SD1D8pk3G2exs8",
  authDomain: "ppdb-online-361ef.firebaseapp.com",
  databaseURL: "https://ppdb-online-361ef-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ppdb-online-361ef",
  storageBucket: "ppdb-online-361ef.firebasestorage.app",
  messagingSenderId: "559756267963",
  appId: "1:559756267963:web:bcbb2b114e6c3381a4749e",
  measurementId: "G-2NEQZ7SRFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
