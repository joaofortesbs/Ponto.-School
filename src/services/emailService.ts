
import sgMail from '@sendgrid/mail';

// A chave será injetada pelo ambiente
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;

// Inicializar SendGrid se a chave estiver disponível
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envia um e-mail usando SendGrid
 */
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Verificar se a chave API está configurada
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key não configurada');
      return false;
    }

    const msg = {
      to: emailData.to,
      from: 'no-reply@ponto.school', // Altere para o e-mail verificado no SendGrid
      subject: emailData.subject,
      html: emailData.html,
    };

    await sgMail.send(msg);
    console.log('E-mail enviado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
};
