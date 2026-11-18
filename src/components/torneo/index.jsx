import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPersonajes, obtenerPersonaje } from '../../api'
import { leer, guardar } from '../../almacen'
import { traducir } from '../../traducciones'
import {
  ACCIONES,
  KI_MAX,
  crearLuchador,
  elegirAccion,
  elegirRivales,
  poderDe,
  puedeUsar,
  resolver,
} from '../../combate'
import './style.css'

const RONDAS = 3
const PAUSA = 1100 // milisegundos entre turnos (para ver las animaciones)
const ATAQUES = ['golpe', 'rafaga', 'definitivo']

function Barra({ valor, max, tipo }) {
  const porcentaje = Math.max(0, Math.min(100, (valor / max) * 100))
  return (
    <div className={`c-barra ${tipo}`}>
      <div className={porcentaje < 30 ? 'bajo' : ''} style={{ width: `${porcentaje}%` }} />
    </div>
  )
}

function Torneo() {
  const navigate = useNavigate()
  const [personajes, setPersonajes] = useState([])
  const [error, setError] = useState(false)
  const [fase, setFase] = useState('eleccion') // eleccion | presentacion | combate | fin
  const [busqueda, setBusqueda] = useState('')
  const [elegido, setElegido] = useState(null)
  const [rivales, setRivales] = useState([])
  const [ronda, setRonda] = useState(0)
  const [vidaGuardada, setVidaGuardada] = useState(null) // la vida pasa de una ronda a la otra
  const [jugador, setJugador] = useState(null)
  const [rival, setRival] = useState(null)
  const [turno, setTurno] = useState('jugador') // jugador | espera
  const [registro, setRegistro] = useState([])
  const [efecto, setEfecto] = useState(null) // animación de la última acción
  const [nuevos, setNuevos] = useState([]) // rivales que entraron al álbum
  const [campeon, setCampeon] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [historial, setHistorial] = useState(() => leer('torneos', { jugados: 0, ganados: 0 }))

  useEffect(() => {
    obtenerPersonajes()
      .then(setPersonajes)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
  }, [])

  const anotar = (texto, lado) =>
    setRegistro((r) => [{ texto, lado, n: Date.now() + Math.random() }, ...r].slice(0, 4))

  const mostrarEfecto = (lado, resultado) =>
    setEfecto({ lado, ...resultado, n: Date.now() + Math.random() })

  // ----- Flujo del torneo -----

  const entrarAlTorneo = () => {
    setRivales(elegirRivales(personajes, elegido))
    setRonda(0)
    setVidaGuardada(null)
    setNuevos([])
    setFase('presentacion')
  }

  const empezarRonda = async () => {
    setCargando(true)
    try {
      // El detalle trae las transformaciones de cada guerrero
      const [datosJugador, datosRival] = await Promise.all([
        obtenerPersonaje(elegido.id),
        obtenerPersonaje(rivales[ronda].id),
      ])
      setJugador(crearLuchador(datosJugador, vidaGuardada))
      setRival(crearLuchador(datosRival))
      setRegistro([{ texto: '¡Comienza el combate!', lado: 'arbitro', n: Date.now() }])
      setEfecto(null)
      setTurno('jugador')
      setFase('combate')
    } catch (e) {
      console.error('Error:', e)
      setError(true)
    } finally {
      setCargando(false)
    }
  }

  const terminarTorneo = (gano) => {
    const nuevoHistorial = {
      jugados: historial.jugados + 1,
      ganados: historial.ganados + (gano ? 1 : 0),
    }
    setHistorial(nuevoHistorial)
    guardar('torneos', nuevoHistorial)
    setCampeon(gano)
    setFase('fin')
  }

  const ganarRonda = (luchador) => {
    // El rival derrotado se une a tu álbum de las Esferas
    const derrotado = rivales[ronda]
    const capturados = leer('capturados', [])
    if (!capturados.includes(derrotado.id)) {
      guardar('capturados', [...capturados, derrotado.id])
      setNuevos((n) => [...n, derrotado.name])
    }

    if (ronda + 1 === RONDAS) {
      terminarTorneo(true)
    } else {
      setVidaGuardada(luchador.vida + luchador.vidaMax * 0.5) // recupera la mitad de su vida
      setRonda(ronda + 1)
      setFase('presentacion')
    }
  }

  // ----- Turnos -----

  const jugar = (accion) => {
    if (turno !== 'jugador' || !puedeUsar(jugador, accion)) return
    const r = resolver(jugador, rival, accion)
    setJugador(r.atacante)
    setRival(r.defensor)
    anotar(r.texto, 'jugador')
    mostrarEfecto('jugador', r)
    setTurno('espera')

    if (r.defensor.vida <= 0) {
      anotar(`¡${r.defensor.nombre} cae derrotado!`, 'arbitro')
      setTimeout(() => ganarRonda(r.atacante), PAUSA * 1.5)
    } else {
      setTimeout(() => turnoRival(r.atacante, r.defensor), PAUSA)
    }
  }

  const turnoRival = (luchador, enemigo) => {
    const r = resolver(enemigo, luchador, elegirAccion(enemigo, luchador))
    setRival(r.atacante)
    setJugador(r.defensor)
    anotar(r.texto, 'rival')
    mostrarEfecto('rival', r)

    if (r.defensor.vida <= 0) {
      anotar(`¡${r.defensor.nombre} cae derrotado!`, 'arbitro')
      setTimeout(() => terminarTorneo(false), PAUSA * 1.5)
    } else {
      setTimeout(() => setTurno('jugador'), PAUSA * 0.8)
    }
  }

  // ----- Pantallas -----

  if (error) return <p className="aviso">No se pudo conectar con la API. Revisa tu internet.</p>
  if (personajes.length === 0) return <p className="aviso">Preparando el torneo...</p>

  const volver = (
    <button type="button" className="c-volver" onClick={() => navigate('/juegos')}>
      ← Juegos
    </button>
  )

  // 1. Elegir guerrero
  if (fase === 'eleccion') {
    const texto = busqueda.trim().toLowerCase()
    const lista = personajes.filter((p) => p.name.toLowerCase().includes(texto))
    return (
      <main className="pagina c-torneo">
        {volver}
        <h1 className="pagina-titulo">Torneo de Artes Marciales</h1>
        <p className="pagina-sub">
          Elige tu guerrero y vence a {RONDAS} rivales. Los que derrotes se unen a tu álbum.
        </p>
        <p className="c-torneo-historial">
          🏆 {historial.ganados} torneos ganados de {historial.jugados}
        </p>

        <input
          type="search"
          placeholder="🔍 Buscar guerrero..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="c-buscador"
        />

        <section className="c-torneo-lista">
          {lista.map((p) => (
            <button
              type="button"
              key={p.id}
              className={elegido?.id === p.id ? 'tarjeta c-candidato elegido' : 'tarjeta c-candidato'}
              onClick={() => setElegido(p)}
            >
              <img src={p.image} alt={p.name} loading="lazy" />
              <span className="guerrero-nombre">{p.name}</span>
              <span className="c-poder">⚡ {poderDe(p)}</span>
            </button>
          ))}
        </section>

        {elegido && (
          <div className="c-torneo-panel">
            <img src={elegido.image} alt="" />
            <div>
              <p className="guerrero-nombre">{elegido.name}</p>
              <p className="guerrero-dato">
                {traducir(elegido.race)} · Poder {poderDe(elegido)}
              </p>
            </div>
            <button type="button" className="boton" onClick={entrarAlTorneo}>
              ¡Entrar!
            </button>
          </div>
        )}
      </main>
    )
  }

  // 2. Presentación de cada ronda
  if (fase === 'presentacion') {
    const proximo = rivales[ronda]
    const vidaMax = crearLuchador(elegido).vidaMax
    return (
      <main className="pagina c-torneo c-presentacion">
        <p className="c-ronda">
          Ronda {ronda + 1} de {RONDAS}
        </p>
        <div className="c-versus">
          <div className="c-versus-lado">
            <img src={elegido.image} alt={elegido.name} />
            <p className="guerrero-nombre">{elegido.name}</p>
            <p className="guerrero-dato">⚡ Poder {poderDe(elegido)}</p>
          </div>
          <span className="c-versus-vs">VS</span>
          <div className="c-versus-lado">
            <img src={proximo.image} alt={proximo.name} className="espejo" />
            <p className="guerrero-nombre">{proximo.name}</p>
            <p className="guerrero-dato">⚡ Poder {poderDe(proximo)}</p>
          </div>
        </div>

        {vidaGuardada && (
          <p className="guerrero-dato">
            Recuperaste energía: empiezas con {Math.round(Math.min(vidaGuardada, vidaMax))} / {vidaMax} de vida
          </p>
        )}
        {nuevos.length > 0 && <p className="c-torneo-nuevo">📖 {nuevos.at(-1)} se unió a tu álbum</p>}

        <button type="button" className="boton c-pelear" onClick={empezarRonda} disabled={cargando}>
          {cargando ? 'Entrando a la arena...' : '¡A pelear!'}
        </button>
        <button type="button" className="c-rendirse" onClick={() => setFase('eleccion')}>
          Abandonar torneo
        </button>
      </main>
    )
  }

  // 3. Fin del torneo
  if (fase === 'fin') {
    return (
      <main className="pagina c-torneo c-fin">
        <span className="c-fin-icono">{campeon ? '🏆' : '💀'}</span>
        <h1>{campeon ? '¡Campeón del torneo!' : 'Has sido derrotado'}</h1>
        <img src={jugador?.imagen ?? elegido.image} alt={elegido.name} className="c-fin-imagen" />
        <p>
          {campeon
            ? `${elegido.name} venció a ${RONDAS} rivales.`
            : `${elegido.name} cayó en la ronda ${ronda + 1} contra ${rivales[ronda].name}.`}
        </p>
        {nuevos.length > 0 && (
          <p className="c-torneo-nuevo">📖 Se unieron a tu álbum: {nuevos.join(', ')}</p>
        )}
        <p className="guerrero-dato">
          🏆 {historial.ganados} torneos ganados de {historial.jugados}
        </p>
        <button type="button" className="boton" onClick={entrarAlTorneo}>
          Otro torneo con {elegido.name}
        </button>
        <button type="button" className="boton-borde" onClick={() => setFase('eleccion')}>
          Cambiar de guerrero
        </button>
      </main>
    )
  }

  // 4. Combate
  const claseSprite = (lado) => {
    const luchador = lado === 'jugador' ? jugador : rival
    let clase = `c-sprite ${lado}`
    if (luchador.defendiendo) clase += ' guardia'
    if (!efecto) return clase
    const actua = efecto.lado === lado
    if (actua && ATAQUES.includes(efecto.accion)) clase += ' embiste'
    if (actua && efecto.accion === 'cargar') clase += ' carga'
    if (actua && efecto.accion === 'transformar') clase += ' transforma'
    if (!actua && efecto.danio) clase += efecto.critico ? ' golpeado fuerte' : ' golpeado'
    if (!actua && efecto.esquivo) clase += ' esquiva'
    return clase
  }

  const objetivo = efecto && (efecto.lado === 'jugador' ? 'rival' : 'jugador')
  const proyectil = efecto && (efecto.accion === 'rafaga' || efecto.accion === 'definitivo')

  return (
    <main className="pagina c-torneo c-combate">
      <p className="c-ronda">
        Ronda {ronda + 1} de {RONDAS}
      </p>

      <section className="c-marcadores">
        {[jugador, rival].map((l, i) => (
          <div key={i} className={i === 0 ? 'tarjeta c-marcador' : 'tarjeta c-marcador derecha'}>
            <p className="c-marcador-nombre">{l.nombre}</p>
            <Barra valor={l.vida} max={l.vidaMax} tipo="vida" />
            <p className="c-marcador-dato">
              ❤️ {l.vida}/{l.vidaMax}
            </p>
            <Barra valor={l.ki} max={KI_MAX} tipo="ki" />
            <p className="c-marcador-dato">🔥 Ki {l.ki}</p>
          </div>
        ))}
      </section>

      <section
        key={efecto?.accion === 'definitivo' ? efecto.n : 'arena'}
        className={efecto?.accion === 'definitivo' ? 'c-arena destello' : 'c-arena'}
      >
        <div key={`j-${efecto?.n}`} className={claseSprite('jugador')}>
          <img src={jugador.imagen} alt={jugador.nombre} />
        </div>
        <div key={`r-${efecto?.n}`} className={claseSprite('rival')}>
          <img src={rival.imagen} alt={rival.nombre} className="espejo" />
        </div>

        {proyectil && (
          <span
            key={`p-${efecto.n}`}
            className={`c-proyectil desde-${efecto.lado} ${efecto.accion === 'definitivo' ? 'grande' : ''}`}
          />
        )}
        {efecto?.danio && (
          <span key={`d-${efecto.n}`} className={`c-numero en-${objetivo} ${efecto.critico ? 'critico' : ''}`}>
            -{efecto.danio}
          </span>
        )}
        {efecto?.esquivo && (
          <span key={`e-${efecto.n}`} className={`c-numero en-${objetivo} fallo`}>
            ¡Esquivó!
          </span>
        )}
      </section>

      <ul className="c-registro">
        {registro.map((r) => (
          <li key={r.n} className={r.lado}>
            {r.texto}
          </li>
        ))}
      </ul>

      <section className="c-acciones">
        {Object.entries(ACCIONES).map(([clave, a]) => {
          const sinTransformaciones = clave === 'transformar' && jugador.transformaciones.length === 0
          return (
            <button
              type="button"
              key={clave}
              className={`c-accion ${clave}`}
              disabled={turno !== 'jugador' || !puedeUsar(jugador, clave)}
              onClick={() => jugar(clave)}
            >
              <span className="c-accion-icono">{a.icono}</span>
              <span className="c-accion-nombre">{a.nombre}</span>
              <span className="c-accion-ayuda">
                {sinTransformaciones
                  ? 'No tiene'
                  : clave === 'transformar' && jugador.forma === jugador.transformaciones.length
                    ? 'Forma máxima'
                    : a.ayuda}
              </span>
            </button>
          )
        })}
      </section>

      <p className="c-turno">{turno === 'jugador' ? 'Tu turno: elige una acción' : `Turno de ${rival.nombre}...`}</p>
    </main>
  )
}

export default Torneo
