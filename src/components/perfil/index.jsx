import { useState } from 'react'
import { signOut, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase'
import { leer, guardar } from '../../almacen'
import './style.css'

function Perfil() {
  const usuario = auth.currentUser // aquí siempre hay sesión
  const [nombre, setNombre] = useState(() => leer('nombre', '') || usuario?.displayName || '')
  const [mensaje, setMensaje] = useState('')

  const favoritos = leer('favoritos', []).length
  const capturados = leer('capturados', []).length
  const mejorQuiz = leer('mejorQuiz', 0)
  const torneos = leer('torneos', { jugados: 0, ganados: 0 }).ganados

  const guardarNombre = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(usuario, { displayName: nombre.trim() })
      guardar('nombre', nombre.trim()) // también en Firestore
      setMensaje('Nombre guardado ✔')
    } catch (error) {
      console.error(error)
      setMensaje('No se pudo guardar. Intenta de nuevo.')
    }
  }

  const fecha = usuario?.metadata?.creationTime
    ? new Date(usuario.metadata.creationTime).toLocaleDateString('es-CO')
    : ''

  return (
    <main className="pagina c-perfil">
      <div className="c-perfil-avatar">{(nombre || usuario?.email || '?')[0].toUpperCase()}</div>
      <h1>{nombre || 'Guerrero'}</h1>
      <p className="guerrero-dato">{usuario?.email}</p>
      <p className="c-perfil-nube">☁️ Tu progreso se guarda en la nube</p>
      {fecha && <p className="guerrero-dato">Entrenando desde el {fecha}</p>}

      <form className="tarjeta c-perfil-form" onSubmit={guardarNombre}>
        <label htmlFor="nombre">Nombre de guerrero</label>
        <div className="c-perfil-fila">
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              setMensaje('')
            }}
            placeholder="Escribe tu nombre"
          />
          <button type="submit" className="boton">
            Guardar
          </button>
        </div>
        {mensaje && <p className="guerrero-dato">{mensaje}</p>}
      </form>

      <section className="c-perfil-stats">
        <div className="tarjeta">
          <p className="c-perfil-numero">{favoritos}</p>
          <p className="guerrero-dato">Favoritos</p>
        </div>
        <div className="tarjeta">
          <p className="c-perfil-numero">{capturados}</p>
          <p className="guerrero-dato">En el álbum</p>
        </div>
        <div className="tarjeta">
          <p className="c-perfil-numero">{mejorQuiz}</p>
          <p className="guerrero-dato">Mejor quiz</p>
        </div>
        <div className="tarjeta">
          <p className="c-perfil-numero">{torneos}</p>
          <p className="guerrero-dato">Torneos ganados</p>
        </div>
      </section>

      <button type="button" className="c-perfil-salir" onClick={() => signOut(auth)}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default Perfil
