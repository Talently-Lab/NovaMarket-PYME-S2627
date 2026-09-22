require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();


app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor NovaMarket-PYME corriendo con éxito'
  });
});

app.listen(PORT, () => {
  console.log(` Servidor NovaMarket-PYME escuchando en el puerto ${PORT}`);
});