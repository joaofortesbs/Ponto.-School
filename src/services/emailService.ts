
import sgMail from '@sendgrid/mail';

// A chave será injetada pelo ambiente ou usada como variável local para testes
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;

// Inicializar SendGrid se a chave estiver disponível
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("Email service now using SendGrid API");
} else {
  console.warn("SendGrid API key not found. Email service will use fallback methods.");
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Envia um e-mail usando SendGrid
 * @returns Promise<boolean> - True se o email foi enviado com sucesso
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
      from: emailData.from || 'no-reply@ponto.school', // Use o from fornecido ou o padrão
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || stripHtml(emailData.html) // Versão texto do email
    };

    await sgMail.send(msg);
    console.log('E-mail enviado com sucesso para:', emailData.to);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
};

/**
 * Remover tags HTML para criar versão texto do email
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<script[^>]*>.*<\/script>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Verifica se o serviço de email está configurado
 */
export const isEmailServiceConfigured = (): boolean => {
  return !!SENDGRID_API_KEY;
};

export default {
  sendEmail,
  isEmailServiceConfigured
};
