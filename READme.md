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
