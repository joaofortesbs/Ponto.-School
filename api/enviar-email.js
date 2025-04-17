
require('dotenv').config();
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Configurar a chave da API SendGrid
sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY || process.env.SENDGRID_API_KEY);

// Endpoint para enviar e-mail
router.post('/enviar-email', async (req, res) => {
  const { para, conteudo, assunto } = req.body;

  if (!para || !conteudo) {
    return res.status(400).json({ 
      sucesso: false, 
      erro: 'O endereço de e-mail e conteúdo são obrigatórios' 
    });
  }

  const msg = {
    to: para,
    from: 'no-reply@ponto.school',
    subject: assunto || 'Mensagem compartilhada da IA',
    html: conteudo,
  };

  try {
    await sgMail.send(msg);
    console.log('E-mail enviado com sucesso para:', para);
    res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ 
      sucesso: false, 
      erro: error.message || 'Erro ao enviar e-mail' 
    });
  }
});

module.exports = router;
