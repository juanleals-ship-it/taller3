import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPersonajes } from '../../api'
import { leer, guardar } from '../../almacen'
import './style.css'

const POR_INVOCACION = 4

function Esferas() {
  const [personajes, setPersonajes] = useState([])
  const [error, setError] = useState(false)
  const [capturados, setCapturados] = useState(() => leer('capturados', []))
  const [nuevos, setNuevos] = useState([])
  const [invocando, setInvocando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    obtenerPersonajes()
      .then(setPersonajes)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [])

  const total = personajes.length
  const completo = total > 0 && capturados.length >= total

  // Shenlong entrega 4 guerreros al azar (pueden salir repetidos)
  const invocar = () => {
    setInvocando(true)
    setNuevos([])
    setTimeout(() => {
      const elegidos = Array.from(
        { length: POR_INVOCACION },
        () => personajes[Math.floor(Math.random() * personajes.length)]
      )
      const vistos = new Set(capturados)
      const resultado = elegidos.map((p) => {
        const repetido = vistos.has(p.id)
        vistos.add(p.id)
        return { ...p, repetido }
      })
      const actualizados = [...vistos]
      setCapturados(actualizados)
      guardar('capturados', actualizados)
      setNuevos(resultado)
      setInvocando(false)
    }, 900)
  }

  const reiniciar = () => {
    setCapturados([])
    setNuevos([])
    guardar('capturados', [])
  }

  const porcentaje = total ? Math.round((capturados.length / total) * 100) : 0

  return (
    <main className="pagina">
      <h1 className="pagina-titulo">Esferas del Dragón</h1>
      <p className="pagina-sub">Invoca a Shenlong y completa tu colección</p>

      <div className="c-esferas-fila" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} className={invocando ? 'c-esfera brilla' : 'c-esfera'}>
            {'★'.repeat(n)}
          </span>
        ))}
      </div>

      <div className="tarjeta c-esferas-panel">
        <p className="c-esferas-contador">
          {capturados.length} <span>/ {total || '?'}</span>
        </p>
        <div className="c-esferas-barra">
          <div style={{ width: `${porcentaje}%` }} />
        </div>
        <button
          type="button"
          className="boton"
          onClick={invocar}
          disabled={total === 0 || invocando || completo}
        >
          {invocando ? '🐉 Invocando...' : completo ? '¡Colección completa!' : '🐉 Invocar a Shenlong'}
        </button>
        {capturados.length > 0 && (
          <button type="button" className="c-esferas-reiniciar" onClick={reiniciar}>
            Reiniciar colección
          </button>
        )}
      </div>

      {error && <p className="aviso">No se pudo conectar con la API. Revisa tu internet.</p>}

      {nuevos.length > 0 && (
        <section className="c-esferas-nuevos">
          <h2>Shenlong te concedió</h2>
          <div className="rejilla">
            {nuevos.map((p, i) => (
              <article
                key={`${p.id}-${i}`}
                className={p.repetido ? 'guerrero tarjeta c-nuevo repetido' : 'guerrero tarjeta c-nuevo'}
                onClick={() => navigate(`/personaje/${p.id}`)}
              >
                <span className="c-nuevo-sello">{p.repetido ? 'Repetido' : '¡Nuevo!'}</span>
                <img src={p.image} alt={p.name} />
                <p className="guerrero-nombre">{p.name}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <h2 className="c-esferas-titulo">Tu álbum</h2>
      <section className="c-album">
        {personajes.map((p) => {
          const tiene = capturados.includes(p.id)
          return (
            <article
              key={p.id}
              className={tiene ? 'tarjeta c-album-casilla tiene' : 'tarjeta c-album-casilla'}
              onClick={() => tiene && navigate(`/personaje/${p.id}`)}
            >
              <img src={p.image} alt={tiene ? p.name : 'Guerrero desconocido'} loading="lazy" />
              <p>{tiene ? p.name : `#${p.id}`}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default Esferas
