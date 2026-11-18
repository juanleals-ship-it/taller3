import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { cargarDatos, limpiarDatos } from './almacen'

import Login from './components/login'
import Inicio from './components/inicio'
import Detalle from './components/detalle'
import Planetas from './components/planetas'
import Planeta from './components/planeta'
import Esferas from './components/esferas'
import Juegos from './components/juegos'
import Torneo from './components/torneo'
import Quiz from './components/quiz'
import Favoritos from './components/favoritos'
import Perfil from './components/perfil'
import Informacion from './components/informacion'
import './App.css'

const MENU = [
  { ruta: '/', icono: '👊', texto: 'Guerreros' },
  { ruta: '/planetas', icono: '🪐', texto: 'Planetas' },
  { ruta: '/esferas', icono: '🔮', texto: 'Esferas' },
  { ruta: '/juegos', icono: '🎮', texto: 'Juegos' },
  { ruta: '/favoritos', icono: '❤️', texto: 'Favoritos' },
  { ruta: '/perfil', icono: '👤', texto: 'Perfil' },
  { ruta: '/informacion', icono: 'ℹ️', texto: 'Info' },
]

// Al cambiar de pantalla, vuelve arriba
function SubirAlCambiar() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Firebase avisa cada vez que alguien inicia o cierra sesión.
  // Antes de mostrar la app se carga el progreso del usuario desde Firestore.
  useEffect(() => {
    const dejarDeEscuchar = onAuthStateChanged(auth, async (user) => {
      if (user) await cargarDatos(user)
      else limpiarDatos()
      setUsuario(user)
      setCargando(false)
    })
    return dejarDeEscuchar
  }, [])

  if (cargando) return <p className="c-cargando">Cargando...</p>

  // Sin sesión solo se ve el login
  if (!usuario) return <Login />

  return (
    // key: si cambia el usuario, todo se vuelve a montar con sus propios datos
    <BrowserRouter key={usuario.uid}>
      <SubirAlCambiar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/personaje/:id" element={<Detalle />} />
        <Route path="/planetas" element={<Planetas />} />
        <Route path="/planeta/:id" element={<Planeta />} />
        <Route path="/esferas" element={<Esferas />} />
        <Route path="/juegos" element={<Juegos />} />
        <Route path="/juegos/torneo" element={<Torneo />} />
        <Route path="/juegos/quiz" element={<Quiz />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <nav className="c-menu">
        <div className="c-menu-items">
          {MENU.map((item) => (
            <NavLink key={item.ruta} to={item.ruta} end={item.ruta === '/'}>
              <span className="c-menu-icono">{item.icono}</span>
              {item.texto}
            </NavLink>
          ))}
        </div>
      </nav>
    </BrowserRouter>
  )
}

export default App
