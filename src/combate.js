// src/combate.js: reglas del Torneo (estadísticas, acciones e inteligencia del rival)

export const KI_MAX = 100

// La API da el ki como texto: "60.000.000" o "90 Septillion". Esto lo pasa a número.
const ESCALA = {
  Thousand: 1e3,
  Million: 1e6,
  Billion: 1e9,
  Trillion: 1e12,
  Quadrillion: 1e15,
  Quintillion: 1e18,
  Sextillion: 1e21,
  Septillion: 1e24,
  Octillion: 1e27,
  Googolplex: 1e30,
}

export function kiANumero(texto) {
  if (texto === null || texto === undefined) return NaN
  const [numero, palabra] = String(texto).trim().split(/\s+/)
  if (palabra) {
    const n = parseFloat(numero.replace(',', '.'))
    return ESCALA[palabra] && !isNaN(n) ? n * ESCALA[palabra] : NaN
  }
  return Number(numero.replace(/[.,]/g, ''))
}

// Nivel de poder: el logaritmo del ki (Goku ≈ 7.8, Bills ≈ 20). Así las diferencias no son absurdas.
export function nivelDe(personaje) {
  const ki = kiANumero(personaje.ki)
  if (!isNaN(ki)) return ki <= 10 ? 1 : Math.log10(ki)
  const maximo = kiANumero(personaje.maxKi)
  return isNaN(maximo) ? 8 : Math.max(1, Math.log10(maximo) - 3)
}

// Número que se muestra en pantalla
export const poderDe = (personaje) => Math.round(nivelDe(personaje) * 10)

// Convierte un personaje de la API en un luchador con vida, ataque y ki
export function crearLuchador(personaje, vida) {
  const nivel = nivelDe(personaje)
  const vidaMax = Math.round(120 + nivel * 6)
  return {
    id: personaje.id,
    nombreBase: personaje.name,
    nombre: personaje.name,
    imagen: personaje.image,
    nivel,
    vidaMax,
    vida: vida ? Math.min(vidaMax, Math.round(vida)) : vidaMax,
    ataque: 10 + nivel * 1.6,
    ki: 30,
    forma: 0, // cuántas transformaciones lleva
    transformaciones: personaje.transformations ?? [],
    defendiendo: false,
  }
}

export const ACCIONES = {
  golpe: { nombre: 'Golpe', icono: '👊', costo: 0, ganaKi: 15, multi: 1, ayuda: '+15 ki' },
  rafaga: { nombre: 'Ráfaga de ki', icono: '💥', costo: 35, multi: 1.7, ayuda: '35 ki · x1.7' },
  definitivo: { nombre: 'Ataque final', icono: '🌟', costo: 100, multi: 3, ayuda: '100 ki · x3' },
  cargar: { nombre: 'Cargar ki', icono: '🔋', costo: 0, ganaKi: 40, ayuda: '+40 ki' },
  defender: { nombre: 'Defender', icono: '🛡️', costo: 0, ganaKi: 10, ayuda: 'Mitad de daño' },
  transformar: { nombre: 'Transformar', icono: '⚡', costo: 50, ayuda: '50 ki · +25% ataque' },
}

export function puedeUsar(luchador, accion) {
  if (luchador.ki < ACCIONES[accion].costo) return false
  if (accion === 'transformar') return luchador.forma < luchador.transformaciones.length
  return true
}

const azar = (min, max) => min + Math.random() * (max - min)

// Aplica una acción. No modifica los objetos: devuelve copias nuevas para React.
export function resolver(atacante, defensor, accion) {
  const datos = ACCIONES[accion]
  const a = {
    ...atacante,
    defendiendo: false,
    ki: Math.min(KI_MAX, atacante.ki - datos.costo + (datos.ganaKi ?? 0)),
  }
  const d = { ...defensor }
  const resultado = { accion }

  if (accion === 'cargar') {
    resultado.texto = `${a.nombre} concentra su ki`
  } else if (accion === 'defender') {
    a.defendiendo = true
    resultado.texto = `${a.nombre} se pone en guardia`
  } else if (accion === 'transformar') {
    const t = a.transformaciones[a.forma]
    const cura = Math.round(a.vidaMax * 0.15)
    a.forma += 1
    a.nombre = t.name
    a.imagen = t.image
    a.ataque *= 1.25
    a.vida = Math.min(a.vidaMax, a.vida + cura)
    resultado.texto = `¡${atacante.nombre} se transforma en ${t.name}! +${cura} de vida`
  } else if (accion !== 'definitivo' && Math.random() < 0.08) {
    resultado.esquivo = true
    resultado.texto = `¡${d.nombre} esquiva el ${datos.nombre.toLowerCase()}!`
    d.defendiendo = false
  } else {
    const critico = Math.random() < 0.12
    let danio = a.ataque * datos.multi * azar(0.85, 1.15) * (critico ? 1.5 : 1)
    if (d.defendiendo) danio *= 0.5
    danio = Math.max(1, Math.round(danio))
    d.vida = Math.max(0, d.vida - danio)
    resultado.danio = danio
    resultado.critico = critico
    resultado.texto =
      `${a.nombre} usa ${datos.nombre}: ${danio} de daño` +
      (critico ? ' ¡CRÍTICO!' : '') +
      (d.defendiendo ? ' (bloqueó la mitad)' : '')
    d.defendiendo = false
  }

  return { ...resultado, atacante: a, defensor: d }
}

// Cómo decide el rival qué hacer
export function elegirAccion(yo, rival) {
  if (puedeUsar(yo, 'definitivo')) return 'definitivo'
  if (puedeUsar(yo, 'transformar') && Math.random() < 0.6) return 'transformar'
  if (rival.ki >= KI_MAX && Math.random() < 0.5) return 'defender'
  if (puedeUsar(yo, 'rafaga') && Math.random() < 0.45) return 'rafaga'
  if (yo.ki < 30 && Math.random() < 0.4) return 'cargar'
  if (Math.random() < 0.1) return 'defender'
  return 'golpe'
}

// Tres rivales: uno más débil, uno parecido y uno más fuerte que tu guerrero
export function elegirRivales(personajes, elegido) {
  const nivel = nivelDe(elegido)
  const usados = new Set([elegido.id])
  return [nivel - 2.5, nivel + 0.5, nivel + 3].map((objetivo) => {
    const cercanos = personajes
      .filter((p) => !usados.has(p.id))
      .sort((x, y) => Math.abs(nivelDe(x) - objetivo) - Math.abs(nivelDe(y) - objetivo))
      .slice(0, 4)
    const rival = cercanos[Math.floor(Math.random() * cercanos.length)]
    usados.add(rival.id)
    return rival
  })
}
