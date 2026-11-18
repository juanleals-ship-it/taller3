// src/firebase.js: conexión con Firebase (Authentication + Firestore)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Proyecto de Firebase: juegodetronos-907b4
const firebaseConfig = {
  apiKey: 'AIzaSyDDSsZvdV-E8QMfd3HcaIrF_Bx_AzCoyEU',
  authDomain: 'juegodetronos-907b4.firebaseapp.com',
  projectId: 'juegodetronos-907b4',
  storageBucket: 'juegodetronos-907b4.firebasestorage.app',
  messagingSenderId: '514351430049',
  appId: '1:514351430049:web:b435dbfd2f7b82e8aab3e0',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)