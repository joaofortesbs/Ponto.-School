
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './enviar-email.js';

dotenv.config();

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de API rodando na porta ${PORT}`);
});
