
const express = require('express');
const cors = require('cors');
const emailRoutes = require('./enviar-email');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', emailRoutes);

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor de API funcionando corretamente!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de API rodando na porta ${PORT}`);
});
