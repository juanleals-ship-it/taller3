import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPersonajes } from '../../api'
import { traducir, traducirKi } from '../../traducciones'
import './style.css'

function Inicio() {
  const [personajes, setPersonajes] = useState([])
  const [error, setError] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [raza, setRaza] = useState('Todas')
  const navigate = useNavigate()

  useEffect(() => {
    obtenerPersonajes()
      .then(setPersonajes)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [])

  // Las razas salen de los mismos datos de la API
  const razas = ['Todas', ...new Set(personajes.map((p) => p.race))]

  const texto = busqueda.trim().toLowerCase()
  const resultados = personajes.filter(
    (p) => (raza === 'Todas' || p.race === raza) && p.name.toLowerCase().includes(texto)
  )

  return (
    <main className="pagina">
      <h1 className="pagina-titulo">Guerreros</h1>
      <p className="pagina-sub">{personajes.length} personajes del universo Dragon Ball</p>

      <input
        type="search"
        placeholder="🔍 Buscar guerrero..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      <div className="c-filtros">
        {razas.map((r) => (
          <button
            type="button"
            key={r}
            className={r === raza ? 'c-filtro activo' : 'c-filtro'}
            onClick={() => setRaza(r)}
          >
            {r === 'Todas' ? 'Todas' : traducir(r)}
          </button>
        ))}
      </div>

      {error && <p className="aviso">No se pudo conectar con la API. Revisa tu internet.</p>}
      {!error && personajes.length === 0 && <p className="aviso">Cargando guerreros...</p>}
      {personajes.length > 0 && resultados.length === 0 && (
        <p className="aviso">No se encontraron guerreros.</p>
      )}

      <section className="rejilla">
        {resultados.map((p) => (
          <article
            key={p.id}
            className="guerrero tarjeta"
            onClick={() => navigate(`/personaje/${p.id}`)}
          >
            <img src={p.image} alt={p.name} loading="lazy" />
            <p className="guerrero-nombre">{p.name}</p>
            <p className="guerrero-dato">{traducir(p.race)}</p>
            <p className="guerrero-dato">Ki: {traducirKi(p.ki)}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Inicio
