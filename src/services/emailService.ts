
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
  console.log('Iniciando processo de envio de e-mail para:', emailData.to);
  
  try {
    // Primeiro, tente usar a API de e-mail personalizada
    try {
      console.log('Tentando enviar via API de e-mail...');
      
      const response = await fetch('/api/enviar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          para: emailData.to,
          conteudo: emailData.html,
          assunto: emailData.subject || 'Mensagem compartilhada da Ponto.School'
        }),
      });

      const resultado = await response.json();
      console.log('Resposta da API de e-mail:', resultado);
      
      if (resultado.sucesso) {
        console.log('✅ E-mail enviado com sucesso via API para:', emailData.to);
        return true;
      }
      
      // Se o servidor indicar para usar o cliente local como fallback
      if (resultado.useClientFallback) {
        console.log('⚠️ API sugeriu usar cliente de e-mail local como fallback');
        
        // Usar método mailto
        const subject = encodeURIComponent(emailData.subject || 'Mensagem compartilhada da Ponto.School');
        const body = encodeURIComponent(emailData.text || stripHtml(emailData.html));
        
        console.log('Abrindo cliente de e-mail local com mailto:');
        window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
        return true;
      }
      
      // Se chegou aqui, a API não teve sucesso mas também não indicou fallback
      console.log('❌ API falhou sem indicar fallback, tentando outros métodos');
      throw new Error('API de e-mail retornou erro: ' + (resultado.erro || 'Desconhecido'));
      
    } catch (apiError) {
      console.warn('❌ Erro ao enviar via API, detalhes:', apiError);
      console.log('Tentando métodos alternativos...');
    }
    
    // Fallback para SendGrid se a API falhar
    if (SENDGRID_API_KEY) {
      console.log('Tentando enviar via SendGrid...');
      
      const msg = {
        to: emailData.to,
        from: emailData.from || 'no-reply@ponto.school',
        subject: emailData.subject || 'Mensagem compartilhada da Ponto.School',
        html: emailData.html,
        text: emailData.text || stripHtml(emailData.html)
      };

      try {
        const result = await sgMail.send(msg);
        console.log('Resposta do SendGrid:', result);
        console.log('✅ E-mail enviado com sucesso via SendGrid para:', emailData.to);
        return true;
      } catch (sendGridError) {
        console.error('❌ Erro ao enviar via SendGrid:', sendGridError);
        throw sendGridError;
      }
    } else {
      console.warn('⚠️ SendGrid não configurado (API_KEY ausente)');
      
      // Fallback final: abrir cliente de e-mail local
      console.log('Usando cliente de e-mail local como último recurso');
      const subject = encodeURIComponent(emailData.subject || 'Mensagem compartilhada da Ponto.School');
      const body = encodeURIComponent(emailData.text || stripHtml(emailData.html));
      
      console.log('Abrindo cliente de e-mail local com mailto:');
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      return true;
    }
  } catch (error) {
    console.error('❌ Erro crítico ao enviar e-mail:', error);
    
    // Em caso de erro, tenta abrir o cliente de e-mail local como último recurso
    try {
      console.log('🔄 Tentando abrir cliente de e-mail local após falha...');
      const subject = encodeURIComponent(emailData.subject || 'Mensagem compartilhada da Ponto.School');
      const body = encodeURIComponent(emailData.text || stripHtml(emailData.html));
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      console.log('✅ Cliente de e-mail local aberto como fallback de emergência');
      return true;
    } catch (mailtoError) {
      console.error('❌❌ Falha também ao tentar abrir cliente de e-mail local:', mailtoError);
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
