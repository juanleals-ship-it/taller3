// src/api.js: todas las peticiones a la Dragon Ball API (https://dragonball-api.com)
// Se usa /api en vez de la URL completa: Netlify y Vite lo redirigen a la API real.
const API = '/api'

// Guarda cada respuesta para no pedir lo mismo dos veces
const cache = {}

function pedir(ruta) {
  if (!cache[ruta]) {
    cache[ruta] = fetch(`${API}${ruta}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)
        return respuesta.json()
      })
      .catch((error) => {
        delete cache[ruta] // si falla, se puede volver a intentar
        throw error
      })
  }
  return cache[ruta]
}

// Lista de los 58 personajes (cada uno: id, name, ki, maxKi, race, gender, description, image, affiliation)
export const obtenerPersonajes = () => pedir('/characters?limit=100').then((datos) => datos.items)

// Un personaje con su planeta de origen (originPlanet) y sus transformaciones
export const obtenerPersonaje = (id) => pedir(`/characters/${id}`)

// Lista de planetas (id, name, isDestroyed, description, image)
export const obtenerPlanetas = () => pedir('/planets?limit=100').then((datos) => datos.items)

// Un planeta con sus habitantes (characters)
export const obtenerPlaneta = (id) => pedir(`/planets/${id}`)
