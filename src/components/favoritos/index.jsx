import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { leer, guardar } from '../../almacen'
import { traducir } from '../../traducciones'
import './style.css'

function Favoritos() {
  const navigate = useNavigate()
  const [favoritos, setFavoritos] = useState(() => leer('favoritos', []))

  const quitar = (e, id) => {
    e.stopPropagation() // para que no abra el detalle al quitar
    const nuevos = favoritos.filter((f) => f.id !== id)
    setFavoritos(nuevos)
    guardar('favoritos', nuevos)
  }

  return (
    <main className="pagina">
      <h1 className="pagina-titulo">Favoritos</h1>
      <p className="pagina-sub">
        {favoritos.length} {favoritos.length === 1 ? 'guerrero guardado' : 'guerreros guardados'}
      </p>

      {favoritos.length === 0 && (
        <div className="aviso">
          <p>Todavía no tienes favoritos.</p>
          <p>Abre un guerrero y toca 🤍 para guardarlo aquí.</p>
          <button type="button" className="boton c-fav-ir" onClick={() => navigate('/')}>
            Ver guerreros
          </button>
        </div>
      )}

      <section className="rejilla">
        {favoritos.map((p) => (
          <article
            key={p.id}
            className="guerrero tarjeta c-fav"
            onClick={() => navigate(`/personaje/${p.id}`)}
          >
            <button
              type="button"
              className="c-fav-quitar"
              onClick={(e) => quitar(e, p.id)}
              aria-label={`Quitar a ${p.name} de favoritos`}
            >
              ✕
            </button>
            <img src={p.image} alt={p.name} loading="lazy" />
            <p className="guerrero-nombre">{p.name}</p>
            <p className="guerrero-dato">{traducir(p.race)}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Favoritos
