import { useNavigate } from 'react-router-dom'
import { leer } from '../../almacen'
import './style.css'

function Juegos() {
  const navigate = useNavigate()
  const mejorQuiz = leer('mejorQuiz', 0)
  const torneos = leer('torneos', { jugados: 0, ganados: 0 })

  const juegos = [
    {
      ruta: '/juegos/torneo',
      icono: '🥊',
      nombre: 'Torneo de Artes Marciales',
      descripcion:
        'Batallas por turnos: elige tu guerrero, carga ki, transfórmate y vence a 3 rivales. Los derrotados se unen a tu álbum.',
      record: `🏆 ${torneos.ganados} torneos ganados de ${torneos.jugados}`,
    },
    {
      ruta: '/juegos/quiz',
      icono: '❓',
      nombre: '¿Quién es este guerrero?',
      descripcion: 'Adivina el personaje por su silueta. 5 preguntas.',
      record: `Mejor puntaje: ${mejorQuiz} / 5`,
    },
  ]

  return (
    <main className="pagina c-juegos">
      <h1 className="pagina-titulo">Juegos</h1>
      <p className="pagina-sub">Demuestra tu poder y lo que sabes</p>

      <section className="c-juegos-lista">
        {juegos.map((j) => (
          <article key={j.ruta} className="tarjeta c-juego" onClick={() => navigate(j.ruta)}>
            <span className="c-juego-icono">{j.icono}</span>
            <div>
              <h2>{j.nombre}</h2>
              <p>{j.descripcion}</p>
              <p className="guerrero-dato">{j.record}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Juegos
