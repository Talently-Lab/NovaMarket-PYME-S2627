# NovaMarket - PYME 🛒

Plataforma web integral para la gestión y venta de productos orientada a pequeñas y medianas empresas. Desarrollada con arquitectura desacoplada (Frontend y Backend separados).

---

## 🛠️ Tecnologías

- **Backend:** Node.js, Express, PostgreSQL (`pg`), CORS, Dotenv.
- **Frontend:** React, Vite.
- **Base de Datos:** PostgreSQL (alojada en Supabase).

---

## 📁 Estructura del Proyecto

```text
NovaMarket-PYME/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión a base de datos
│   │   ├── controllers/     # Lógica de peticiones
│   │   ├── middlewares/     # Interceptores y validaciones
│   │   ├── models/          # Consultas SQL
│   │   ├── routes/          # Endpoints de la API
│   │   └── index.js         # Entrada del servidor
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Vistas de la aplicación
│   │   ├── services/        # Llamadas HTTP a la API
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 🧩 Decisiones de arquitectura del Frontend

Carpetas de `frontend/src` (ver el detalle de cada componente en `docs/COMPONENTES-FRONTEND.md`):

| Carpeta | Para qué se usa |
|---|---|
| `components/` | Piezas reutilizables (`layout/` y `ui/`) |
| `pages/` | Vistas completas, una por ruta |
| `services/` | Llamadas HTTP a la API (`api.js`, con Axios) |
| `context/` | Estado global (React Context) |
| `hooks/`, `utils/`, `constants/` | Lógica compartida, utilidades y listas fijas |

**Qué va en estado global (Context) y qué en estado local**

| Estado | Dónde | Por qué |
|---|---|---|
| Sesión (`user`, `token`, `loading`) | `AuthContext` | Lo necesitan el header, las rutas protegidas y el checkout |
| Carrito (`items`, total y cantidad) | `CartContext` | Se ve en el header y en varias páginas, y se guarda en `localStorage` |
| Tema claro/oscuro | `ThemeContext` | Afecta a toda la aplicación |
| Formularios (login, registro, checkout) | Local en cada página (`useState`) | Solo importan mientras la página está abierta |
| Filtros, orden y paginación del catálogo | Local en la página | No hace falta compartirlos |
| Estados de carga y error de cada pantalla | Local en la página | Dependen de cada petición |

**Sesión:** el token se guarda en `localStorage` (`nm-token`). Al cargar la app se llama a `GET /api/auth/me` para restaurar la sesión. Si la API responde 401, el interceptor de `services/api.js` borra el token y avisa al `AuthContext` para cerrar la sesión también en pantalla.

**Rutas:** `ProtectedRoute` exige sesión y `AdminRoute` además exige rol admin.

---

## 🚀 Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/Talently-Lab/NovaMarket-PYME-S2627.git
cd NovaMarket-PYME-S2627
```

### 2. Configurar y levantar el Backend

Ingresar a la carpeta del backend:

```bash
cd backend
npm install
```

Crear el archivo `.env` dentro de la carpeta `backend/`, basándose en `.env.example`.

Luego iniciar el servidor:

```bash
npm run dev
```

### 3. Configurar y levantar el Frontend

Abrir otra terminal y ubicarse en la carpeta principal del proyecto:

```bash
cd frontend
npm install
```

Crear el archivo `.env` dentro de la carpeta `frontend/` con:

```env
VITE_API_URL=http://localhost:3000/api
```

Luego iniciar el frontend:

```bash
npm run dev
```
