// src/almacen.js: guarda el progreso de cada usuario en Firestore (colección "usuarios").
// Documento: usuarios/{uid} → { nombre, correo, creado, favoritos, capturados, mejorQuiz, torneos }
//
// Al iniciar sesión se carga el documento una sola vez (cargarDatos) y queda en memoria,
// así las pantallas leen al instante con leer(). Cada guardar() actualiza la memoria,
// una copia en el celular (localStorage, por si no hay internet) y Firestore.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

const CAMPOS = ['favoritos', 'capturados', 'mejorQuiz', 'torneos']

let datos = {} // copia en memoria del documento del usuario

const claveLocal = (nombre, uid) => `${nombre}-${uid}`
const documento = (uid) => doc(db, 'usuarios', uid)

export async function cargarDatos(usuario) {
  const uid = usuario.uid

  // 1. Lo que haya guardado en este dispositivo
  const local = {}
  for (const campo of CAMPOS) {
    try {
      const valor = localStorage.getItem(claveLocal(campo, uid))
      if (valor !== null) local[campo] = JSON.parse(valor)
    } catch {
      // dato dañado o sin almacenamiento: se ignora
    }
  }
  datos = local

  // 2. Lo que hay en Firestore manda sobre lo local
  try {
    const snap = await getDoc(documento(uid))
    if (snap.exists()) {
      datos = { ...local, ...snap.data() }
    } else {
      // Primera vez: se crea el documento del usuario
      await setDoc(
        documento(uid),
        { correo: usuario.email, nombre: usuario.displayName ?? '', creado: serverTimestamp(), ...local },
        { merge: true }
      )
    }
  } catch (error) {
    console.error('No se pudo leer Firestore:', error)
  }
}

export function limpiarDatos() {
  datos = {}
}

export function leer(nombre, porDefecto) {
  return datos[nombre] ?? porDefecto
}

export function guardar(nombre, valor) {
  datos = { ...datos, [nombre]: valor }
  const uid = auth.currentUser?.uid
  if (!uid) return

  try {
    localStorage.setItem(claveLocal(nombre, uid), JSON.stringify(valor))
  } catch {
    // sin almacenamiento local: igual se guarda en Firestore
  }

  // merge: true actualiza solo ese campo sin borrar los demás
  setDoc(documento(uid), { [nombre]: valor }, { merge: true }).catch((error) =>
    console.error('No se pudo guardar en Firestore:', error)
  )
}

// Mezcla una lista al azar (algoritmo de Fisher-Yates)
export function mezclar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
