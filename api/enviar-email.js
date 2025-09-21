
import express from 'express';
import sgMail from '@sendgrid/mail';

const router = express.Router();

// Configurar SendGrid apenas se a chave API estiver disponível
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key não encontrada. O serviço de e-mail poderá falhar.');
}

router.post('/enviar-email', async (req, res) => {
  try {
    const { to, subject, html, from = 'noreply@pontoschool.com' } = req.body;

    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Serviço de e-mail não configurado'
      });
    }

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, subject, html'
      });
    }

    const msg = {
      to,
      from,
      subject,
      html
    };

    await sgMail.send(msg);

    res.json({
      success: true,
      message: 'E-mail enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar e-mail'
    });
  }
});

export default router;
