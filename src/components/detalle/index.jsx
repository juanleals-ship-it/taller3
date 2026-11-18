import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { obtenerPersonaje } from '../../api'
import { traducir, traducirKi } from '../../traducciones'
import { leer, guardar } from '../../almacen'
import './style.css'

function Detalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personaje, setPersonaje] = useState(null)
  const [error, setError] = useState(false)
  const [favoritos, setFavoritos] = useState(() => leer('favoritos', []))

  useEffect(() => {
    setPersonaje(null)
    setError(false)
    obtenerPersonaje(id)
      .then(setPersonaje)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [id])

  if (error) return <p className="aviso">No se encontró este guerrero.</p>
  if (!personaje) return <p className="aviso">Cargando...</p>

  const esFavorito = favoritos.some((f) => f.id === personaje.id)

  const cambiarFavorito = () => {
    const nuevos = esFavorito
      ? favoritos.filter((f) => f.id !== personaje.id)
      : [...favoritos, { id: personaje.id, name: personaje.name, image: personaje.image, race: personaje.race }]
    setFavoritos(nuevos)
    guardar('favoritos', nuevos)
  }

  const planeta = personaje.originPlanet
  const transformaciones = personaje.transformations ?? []

  return (
    <main className="pagina c-detalle">
      <button type="button" className="c-volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <section className="c-detalle-cabecera">
        <div className="c-detalle-aura">
          <img src={personaje.image} alt={personaje.name} />
        </div>
        <div>
          <h1>{personaje.name}</h1>
          <div className="c-detalle-etiquetas">
            <span className="etiqueta">{traducir(personaje.race)}</span>
            <span className="etiqueta">{traducir(personaje.gender)}</span>
            <span className="etiqueta">{traducir(personaje.affiliation)}</span>
          </div>

          <div className="c-detalle-ki">
            <div className="tarjeta">
              <p className="guerrero-dato">Ki base</p>
              <p className="c-detalle-numero">{traducirKi(personaje.ki)}</p>
            </div>
            <div className="tarjeta">
              <p className="guerrero-dato">Ki máximo</p>
              <p className="c-detalle-numero">{traducirKi(personaje.maxKi)}</p>
            </div>
          </div>

          <button
            type="button"
            className={esFavorito ? 'boton c-detalle-fav activo' : 'boton c-detalle-fav'}
            onClick={cambiarFavorito}
          >
            {esFavorito ? '❤️ En favoritos' : '🤍 Agregar a favoritos'}
          </button>
        </div>
      </section>

      <section className="tarjeta c-detalle-bloque">
        <h2>Historia</h2>
        <p>{personaje.description}</p>
      </section>

      {planeta && (
        <section
          className="tarjeta c-detalle-bloque c-detalle-planeta"
          onClick={() => navigate(`/planeta/${planeta.id}`)}
        >
          <img src={planeta.image} alt={planeta.name} />
          <div>
            <p className="guerrero-dato">Planeta de origen</p>
            <h2>{planeta.name}</h2>
            <p className="guerrero-dato">{planeta.isDestroyed ? '💥 Destruido' : '🌍 Existe'} · Ver planeta →</p>
          </div>
        </section>
      )}

      {transformaciones.length > 0 && (
        <section className="c-detalle-bloque">
          <h2>Transformaciones ({transformaciones.length})</h2>
          <div className="rejilla">
            {transformaciones.map((t) => (
              <article key={t.id} className="guerrero tarjeta c-detalle-transformacion">
                <img src={t.image} alt={t.name} loading="lazy" />
                <p className="guerrero-nombre">{t.name}</p>
                <p className="guerrero-dato">Ki: {traducirKi(t.ki)}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default Detalle
