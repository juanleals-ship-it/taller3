import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { obtenerPlaneta } from '../../api'
import { traducir } from '../../traducciones'
import './style.css'

function Planeta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [planeta, setPlaneta] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setPlaneta(null)
    setError(false)
    obtenerPlaneta(id)
      .then(setPlaneta)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [id])

  if (error) return <p className="aviso">No se encontró este planeta.</p>
  if (!planeta) return <p className="aviso">Cargando...</p>

  const habitantes = planeta.characters ?? []

  return (
    <main className="pagina">
      <button type="button" className="c-volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <section className="tarjeta c-planeta-cabecera">
        <img src={planeta.image} alt={planeta.name} className={planeta.isDestroyed ? 'destruido' : ''} />
        <div className="c-planeta-texto">
          <h1>{planeta.name}</h1>
          <span className={planeta.isDestroyed ? 'c-estado destruido' : 'c-estado'}>
            {planeta.isDestroyed ? '💥 Destruido' : '🌍 Existe'}
          </span>
          <p>{planeta.description}</p>
        </div>
      </section>

      <h2 className="c-planeta-subtitulo">Habitantes ({habitantes.length})</h2>
      {habitantes.length === 0 && <p className="aviso">No hay guerreros registrados en este planeta.</p>}

      <section className="rejilla">
        {habitantes.map((p) => (
          <article
            key={p.id}
            className="guerrero tarjeta"
            onClick={() => navigate(`/personaje/${p.id}`)}
          >
            <img src={p.image} alt={p.name} loading="lazy" />
            <p className="guerrero-nombre">{p.name}</p>
            <p className="guerrero-dato">{traducir(p.race)}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Planeta
