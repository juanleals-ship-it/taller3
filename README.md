# Radar del Dragón

Aplicación web (React + Vite) con temática de Dragon Ball. Se publica en Netlify y se abre en Android con un WebView.

- **API:** [Dragon Ball API](https://dragonball-api.com) (personajes, transformaciones y planetas)
- **Inicio de sesión:** Firebase Authentication (correo y contraseña)
- **Base de datos:** Cloud Firestore (progreso de cada usuario en `usuarios/{uid}`)
- **Hosting:** Netlify

## Pantallas

| Pantalla | Qué hace |
|---|---|
| Login / Registro | Crear cuenta e iniciar sesión con Firebase |
| Guerreros | Lista de personajes con búsqueda y filtro por raza |
| Detalle | Datos, ki, planeta de origen, transformaciones y botón de favorito |
| Planetas | Lista de planetas; cada uno muestra sus habitantes |
| Esferas | Colección: invoca a Shenlong para conseguir 4 guerreros al azar |
| Juegos → Torneo | Batallas por turnos contra 3 rivales: golpe, ráfaga de ki, ataque final, cargar ki, defender y transformaciones reales de la API. Los rivales derrotados se unen al álbum |
| Juegos → Quiz | Adivina el guerrero por su silueta (5 preguntas) |
| Favoritos | Tus guerreros favoritos |
| Perfil | Nombre, correo, estadísticas y cerrar sesión |
| Info | Datos de la aplicación |

El nombre, los favoritos, el álbum, los torneos ganados y el mejor puntaje se guardan en Firestore, en el documento `usuarios/{uid}` de cada usuario (con copia en el dispositivo por si no hay internet).

## Correr en tu PC

```
npm install
npm run dev
```

Abre http://localhost:5173

## Reglas de Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Integrante

Ramses Daniel Vilchez García
