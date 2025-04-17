import dotenv from 'dotenv';
import express from 'express';
import sgMail from '@sendgrid/mail';

dotenv.config();

const router = express.Router();

// Configurar a chave da API SendGrid
const apiKey = process.env.VITE_SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;

if (apiKey) {
  sgMail.setApiKey(apiKey);
  console.log('SendGrid API configurada com sucesso');
} else {
  console.warn('SendGrid API key não encontrada. O serviço de e-mail poderá falhar.');
}

// Endpoint para enviar e-mail
router.post('/enviar-email', async (req, res) => {
  const { para, conteudo, assunto } = req.body;

  if (!para || !conteudo) {
    return res.status(400).json({ 
      sucesso: false, 
      erro: 'O endereço de e-mail e conteúdo são obrigatórios' 
    });
  }

  // Verificar se a API key está configurada
  if (!process.env.VITE_SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY) {
    return res.status(503).json({ 
      sucesso: false, 
      erro: 'Serviço de e-mail não configurado', 
      useClientFallback: true 
    });
  }

  const msg = {
    to: para,
    from: 'no-reply@ponto.school',
    subject: assunto || 'Mensagem compartilhada da IA',
    html: conteudo,
  };

  try {
    const [response] = await sgMail.send(msg);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('E-mail enviado com sucesso para:', para);
      res.status(200).json({ sucesso: true });
    } else {
      throw new Error(`SendGrid retornou status code ${response.statusCode}`);
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ 
      sucesso: false, 
      erro: error.message || 'Erro ao enviar e-mail', 
      useClientFallback: true 
    });
  }
});

export default router;