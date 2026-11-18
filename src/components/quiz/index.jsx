import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPersonajes } from '../../api'
import { leer, guardar, mezclar } from '../../almacen'
import './style.css'

const TOTAL_PREGUNTAS = 5

// Cada pregunta: un guerrero (se muestra su silueta) y 4 nombres para elegir
function crearPreguntas(personajes) {
  return mezclar(personajes)
    .slice(0, TOTAL_PREGUNTAS)
    .map((correcto) => {
      const otros = mezclar(personajes.filter((p) => p.id !== correcto.id)).slice(0, 3)
      return {
        personaje: correcto,
        opciones: mezclar([correcto, ...otros].map((p) => p.name)),
      }
    })
}

function Quiz() {
  const navigate = useNavigate()
  const [personajes, setPersonajes] = useState([])
  const [preguntas, setPreguntas] = useState([])
  const [indice, setIndice] = useState(0)
  const [puntos, setPuntos] = useState(0)
  const [elegida, setElegida] = useState(null)
  const [terminado, setTerminado] = useState(false)
  const [error, setError] = useState(false)
  const [mejor, setMejor] = useState(() => leer('mejorQuiz', 0))

  useEffect(() => {
    obtenerPersonajes()
      .then((datos) => {
        setPersonajes(datos)
        setPreguntas(crearPreguntas(datos))
      })
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [])

  const responder = (opcion) => {
    if (elegida) return
    setElegida(opcion)
    if (opcion === preguntas[indice].personaje.name) setPuntos((p) => p + 1)
  }

  const siguiente = () => {
    if (indice + 1 < preguntas.length) {
      setIndice(indice + 1)
      setElegida(null)
      return
    }
    if (puntos > mejor) {
      setMejor(puntos)
      guardar('mejorQuiz', puntos)
    }
    setTerminado(true)
  }

  const reiniciar = () => {
    setPreguntas(crearPreguntas(personajes))
    setIndice(0)
    setPuntos(0)
    setElegida(null)
    setTerminado(false)
  }

  if (error) return <p className="aviso">No se pudo cargar el quiz. Revisa tu internet.</p>
  if (preguntas.length === 0) return <p className="aviso">Preparando el quiz...</p>

  if (terminado) {
    const mensaje =
      puntos === TOTAL_PREGUNTAS
        ? '¡Tu poder es de más de 9000!'
        : puntos >= 3
          ? '¡Buen entrenamiento, guerrero!'
          : 'Necesitas entrenar con el Maestro Roshi...'
    return (
      <main className="pagina c-quiz">
        <h1>Resultado</h1>
        <p className="c-quiz-puntos">
          {puntos} / {preguntas.length}
        </p>
        <p className="c-quiz-mensaje">{mensaje}</p>
        <p className="guerrero-dato">Mejor puntaje: {mejor}</p>
        <button type="button" className="boton" onClick={reiniciar}>
          Jugar otra vez
        </button>
      </main>
    )
  }

  const pregunta = preguntas[indice]
  const correcto = pregunta.personaje.name

  return (
    <main className="pagina c-quiz">
      <button type="button" className="c-volver c-quiz-volver" onClick={() => navigate('/juegos')}>
        ← Juegos
      </button>
      <h1>¿Quién es este guerrero?</h1>
      <p className="guerrero-dato">
        Pregunta {indice + 1} de {preguntas.length} · Puntos: {puntos} · Mejor: {mejor}
      </p>

      <div className="c-quiz-imagen">
        <img
          key={pregunta.personaje.id}
          src={pregunta.personaje.image}
          alt="Guerrero misterioso"
          className={elegida ? 'revelado' : ''}
        />
      </div>

      <div className="c-quiz-opciones">
        {pregunta.opciones.map((opcion) => {
          let clase = 'c-quiz-opcion'
          if (elegida) {
            if (opcion === correcto) clase += ' correcta'
            else if (opcion === elegida) clase += ' incorrecta'
          }
          return (
            <button type="button" key={opcion} className={clase} onClick={() => responder(opcion)}>
              {opcion}
            </button>
          )
        })}
      </div>

      {elegida && (
        <>
          <p className="c-quiz-mensaje">
            {elegida === correcto ? '¡Correcto!' : `Era ${correcto}`}
          </p>
          <button type="button" className="boton" onClick={siguiente}>
            {indice + 1 < preguntas.length ? 'Siguiente' : 'Ver resultado'}
          </button>
        </>
      )}
    </main>
  )
}

export default Quiz
