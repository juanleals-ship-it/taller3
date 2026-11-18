// src/traducciones.js: la API devuelve algunos datos en inglés; aquí se pasan a español
const TEXTOS = {
  // Razas
  Saiyan: 'Saiyajin',
  Namekian: 'Namekiano',
  Human: 'Humano',
  'Frieza Race': 'Raza de Freezer',
  Android: 'Androide',
  Majin: 'Majin',
  God: 'Dios',
  Angel: 'Ángel',
  Unknown: 'Desconocida',
  'Jiren Race': 'Raza de Jiren',
  Evil: 'Maligno',
  'Nucleico benigno': 'Nucleico benigno',
  Nucleico: 'Nucleico',
  // Género
  Male: 'Masculino',
  Female: 'Femenino',
  // Afiliación
  'Z Fighter': 'Guerrero Z',
  'Army of Frieza': 'Ejército de Freezer',
  Freelancer: 'Independiente',
  Villain: 'Villano',
  Other: 'Otro',
  'Assistant of Beerus': 'Asistente de Bills',
  'Pride Troopers': 'Tropas del Orgullo',
  'Assistant of Vermoud': 'Asistente de Vermoud',
}

// Si no hay traducción, devuelve el texto original
export function traducir(texto) {
  return TEXTOS[texto] ?? texto
}

// Las cifras de ki grandes vienen en inglés ("90 Septillion"); se traducen las palabras
const ESCALAS = {
  Thousand: 'mil',
  Million: 'millones',
  Billion: 'mil millones',
  Trillion: 'billones',
  Quadrillion: 'mil billones',
  Quintillion: 'trillones',
  Sextillion: 'mil trillones',
  Septillion: 'cuatrillones',
  Googolplex: 'googolplex',
  Unknown: 'desconocido',
  unknown: 'desconocido',
}

export function traducirKi(ki) {
  if (!ki) return '?'
  return String(ki).replace(/[A-Za-z]+/g, (palabra) => ESCALAS[palabra] ?? palabra)
}
