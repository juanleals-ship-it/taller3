import './style.css'

function Informacion() {
  return (
    <main className="pagina c-info">
      <h1 className="pagina-titulo">Información</h1>
      <p className="pagina-sub">Radar del Dragón</p>

      <section className="tarjeta c-info-lista">
        <div>
          <p className="guerrero-dato">Descripción</p>
          <p>
            Aplicación para explorar los guerreros y planetas de Dragon Ball, coleccionarlos en un álbum,
            pelear en un torneo por turnos y poner a prueba lo que sabes.
          </p>
        </div>
        <div>
          <p className="guerrero-dato">API usada</p>
          <p>
            <a href="https://dragonball-api.com" target="_blank" rel="noreferrer">
              https://dragonball-api.com
            </a>
          </p>
        </div>
        <div>
          <p className="guerrero-dato">Endpoints</p>
          <p>/api/characters · /api/characters/:id · /api/planets · /api/planets/:id</p>
        </div>
        <div>
          <p className="guerrero-dato">Tecnologías</p>
          <p>React + Vite · React Router · Firebase Authentication · Cloud Firestore · Netlify</p>
        </div>
        <div>
          <p className="guerrero-dato">Integrantes</p>
          <p>Ramses Daniel Vilchez García</p>
        </div>
        <div>
          <p className="guerrero-dato">Versión</p>
          <p>1.0.0</p>
        </div>
      </section>
    </main>
  )
}

export default Informacion
