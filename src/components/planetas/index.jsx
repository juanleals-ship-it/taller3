import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPlanetas } from '../../api'
import './style.css'

function Planetas() {
  const [planetas, setPlanetas] = useState([])
  const [error, setError] = useState(false)
  const [soloExistentes, setSoloExistentes] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    obtenerPlanetas()
      .then(setPlanetas)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [])

  const destruidos = planetas.filter((p) => p.isDestroyed).length
  const visibles = soloExistentes ? planetas.filter((p) => !p.isDestroyed) : planetas

  return (
    <main className="pagina">
      <h1 className="pagina-titulo">Planetas</h1>
      <p className="pagina-sub">
        {planetas.length} planetas · {destruidos} destruidos
      </p>

      <label className="c-planetas-filtro">
        <input
          type="checkbox"
          checked={soloExistentes}
          onChange={(e) => setSoloExistentes(e.target.checked)}
        />
        Ocultar planetas destruidos
      </label>

      {error && <p className="aviso">No se pudo conectar con la API. Revisa tu internet.</p>}
      {!error && planetas.length === 0 && <p className="aviso">Cargando planetas...</p>}

      <section className="c-planetas">
        {visibles.map((p) => (
          <article
            key={p.id}
            className="tarjeta c-planeta-tarjeta"
            onClick={() => navigate(`/planeta/${p.id}`)}
          >
            <img src={p.image} alt={p.name} loading="lazy" className={p.isDestroyed ? 'destruido' : ''} />
            <div className="c-planeta-info">
              <p className="guerrero-nombre">{p.name}</p>
              <span className={p.isDestroyed ? 'c-estado destruido' : 'c-estado'}>
                {p.isDestroyed ? '💥 Destruido' : '🌍 Existe'}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Planetas
