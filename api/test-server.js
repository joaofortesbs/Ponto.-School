import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3002;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  console.log('✅ Rota de teste funcionando!');
  res.json({ message: 'Servidor de teste funcionando!' });
});

// Rota para atividades
app.post('/api/atividades', (req, res) => {
  console.log('✅ POST /api/atividades funcionando!');
  res.json({ 
    success: true, 
    message: 'Endpoint de atividades funcionando!',
    data: req.body 
  });
});

app.get('/api/atividades/test', (req, res) => {
  console.log('✅ GET /api/atividades/test funcionando!');
  res.json({ 
    success: true, 
    message: 'Endpoint GET funcionando!',
    atividades: []
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`🌐 Acesse em: http://0.0.0.0:${PORT}/api/test`);
});