require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad: no exponer la versión de Express en los headers
app.disable('x-powered-by');

app.use(cors());
app.use(express.json());

// Health check — QA smoke test
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor NovaMarket-PYME corriendo con éxito',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Manejador de errores global — evita exponer stack traces al cliente
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error]', err.message);
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición.' });
  }
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

// Solo conecta a DB y levanta el servidor cuando se ejecuta directamente (no en tests)
if (require.main === module) {
  const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor NovaMarket-PYME escuchando en el puerto ${PORT}`);
    });
  };
  startServer();
}

module.exports = app;
