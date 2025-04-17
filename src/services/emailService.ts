
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
 * Envia um e-mail usando SendGrid ou API personalizada
 * @returns Promise<boolean> - True se o email foi enviado com sucesso
 */
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Primeiro, tente usar a API de e-mail personalizada
    try {
      const response = await fetch('/api/enviar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          para: emailData.to,
          conteudo: emailData.html,
          assunto: emailData.subject || 'Mensagem compartilhada da IA'
        }),
      });

      const resultado = await response.json();
      
      if (resultado.sucesso) {
        console.log('E-mail enviado com sucesso via API para:', emailData.to);
        return true;
      }
      
      // Se o servidor indicar para usar o cliente local como fallback
      if (resultado.useClientFallback) {
        console.log('Usando cliente de e-mail local como fallback');
        
        // Usar método mailto
        const subject = encodeURIComponent(emailData.subject || 'Mensagem compartilhada da Ponto.School');
        const body = encodeURIComponent(emailData.text || stripHtml(emailData.html));
        window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
        return true;
      }
    } catch (apiError) {
      console.warn('Erro ao enviar via API, tentando SendGrid:', apiError);
    }
    
    // Fallback para SendGrid se a API falhar
    if (SENDGRID_API_KEY) {
      const msg = {
        to: emailData.to,
        from: emailData.from || 'no-reply@ponto.school', // Use o from fornecido ou o padrão
        subject: emailData.subject || 'Mensagem compartilhada da Ponto.School',
        html: emailData.html,
        text: emailData.text || stripHtml(emailData.html) // Versão texto do email
      };

      await sgMail.send(msg);
      console.log('E-mail enviado com sucesso via SendGrid para:', emailData.to);
      return true;
    } else {
      console.error('Não foi possível enviar o e-mail: nenhum método disponível');
      
      // Fallback final: abrir cliente de e-mail local
      const subject = encodeURIComponent(emailData.subject || 'Mensagem compartilhada da Ponto.School');
      const body = encodeURIComponent(emailData.text || stripHtml(emailData.html));
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      return true;
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    // Em caso de erro, tenta abrir o cliente de e-mail local
    try {
      const subject = encodeURIComponent(emailData.subject || 'Mensagem compartilhada da Ponto.School');
      const body = encodeURIComponent(emailData.text || stripHtml(emailData.html));
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      return true;
    } catch (mailtoError) {
      console.error('Erro ao tentar abrir cliente de e-mail local:', mailtoError);
      return false;
    }
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
