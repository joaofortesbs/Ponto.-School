import { toast } from '@/components/ui/use-toast';

// Tipo de notificação
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Interface para os parâmetros da notificação
interface NotificationParams {
  title?: string;
  description: string;
  type?: NotificationType;
  duration?: number;
}

// Classe para gerenciar notificações
class NotificationService {
  // Exibir uma notificação usando o componente de toast
  show({ title, description, type = 'info', duration = 5000 }: NotificationParams): void {
    // Definir variantes de estilo baseadas no tipo
    const variantMap: Record<NotificationType, string> = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-amber-500 text-white',
      info: 'bg-blue-500 text-white'
    };

    let variant = variantMap[type];

    // Exibir o toast
    toast({
      title: title || this.getDefaultTitle(type),
      description,
      variant: 'default',
      duration,
      className: `${variant} border-none`
    });
  }

  // Exibir uma notificação de sucesso
  success(description: string, title?: string, duration?: number): void {
    this.show({ title, description, type: 'success', duration });
  }

  // Exibir uma notificação de erro
  error(description: string, title?: string, duration?: number): void {
    this.show({ title, description, type: 'error', duration });
  }

  // Exibir uma notificação de aviso
  warning(description: string, title?: string, duration?: number): void {
    this.show({ title, description, type: 'warning', duration });
  }

  // Exibir uma notificação informativa
  info(description: string, title?: string, duration?: number): void {
    this.show({ title, description, type: 'info', duration });
  }

  // Obter um título padrão baseado no tipo de notificação
  private getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'Sucesso!';
      case 'error':
        return 'Erro!';
      case 'warning':
        return 'Atenção!';
      case 'info':
      default:
        return 'Informação';
    }
  }
}

// Exportar uma instância única do serviço
export const notificationService = new NotificationService();