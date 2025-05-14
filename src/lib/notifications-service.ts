
/**
 * Serviço de gerenciamento de notificações
 */
import { v4 as uuidv4 } from 'uuid';
import { getWebPersistence, setWebPersistence } from './web-persistence';

export type NotificationType = 'message' | 'system' | 'alert' | 'success' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  timestamp: Date;
  important?: boolean;
  actionText?: string;
  actionUrl?: string;
}

interface NotificationsStore {
  items: Notification[];
  lastUpdated: string;
  unreadCount: number;
}

const STORAGE_KEY = 'notifications_data';

// Carregar notificações do armazenamento local
const loadNotifications = (): NotificationsStore => {
  try {
    const storedData = getWebPersistence(STORAGE_KEY);
    if (storedData && Array.isArray(storedData.items)) {
      // Converter strings de data para objetos Date
      const processedItems = storedData.items.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      
      return {
        items: processedItems,
        lastUpdated: storedData.lastUpdated || new Date().toISOString(),
        unreadCount: storedData.unreadCount || processedItems.filter(n => !n.read).length,
      };
    }
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
  
  // Retornar store vazia se não houver dados ou ocorrer erro
  return {
    items: [],
    lastUpdated: new Date().toISOString(),
    unreadCount: 0
  };
};

// Salvar notificações no armazenamento local
const saveNotifications = (store: NotificationsStore): void => {
  try {
    setWebPersistence(STORAGE_KEY, {
      ...store,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao salvar notificações:', error);
  }
};

// Adicionar nova notificação
export const addNotification = (
  title: string,
  content: string,
  type: NotificationType = 'system',
  options?: {
    important?: boolean;
    actionText?: string;
    actionUrl?: string;
  }
): Notification => {
  const store = loadNotifications();
  
  const notification: Notification = {
    id: uuidv4(),
    type,
    title,
    content,
    read: false,
    timestamp: new Date(),
    important: options?.important || false,
    actionText: options?.actionText,
    actionUrl: options?.actionUrl
  };
  
  // Adicionar no início da lista para mostrar notificações mais recentes primeiro
  store.items.unshift(notification);
  store.unreadCount += 1;
  
  // Limitar o número de notificações armazenadas (manter as 100 mais recentes)
  if (store.items.length > 100) {
    store.items = store.items.slice(0, 100);
  }
  
  saveNotifications(store);
  
  // Enviar evento para que outros componentes possam reagir
  window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
  
  return notification;
};

// Marcar notificação como lida
export const markAsRead = (id: string): void => {
  const store = loadNotifications();
  
  const updatedItems = store.items.map(item => {
    if (item.id === id && !item.read) {
      store.unreadCount = Math.max(0, store.unreadCount - 1);
      return { ...item, read: true };
    }
    return item;
  });
  
  store.items = updatedItems;
  saveNotifications(store);
  
  // Enviar evento para atualização da interface
  window.dispatchEvent(new CustomEvent('notificationUpdate'));
};

// Marcar todas notificações como lidas
export const markAllAsRead = (): void => {
  const store = loadNotifications();
  
  store.items = store.items.map(item => ({ ...item, read: true }));
  store.unreadCount = 0;
  
  saveNotifications(store);
  
  // Enviar evento para atualização da interface
  window.dispatchEvent(new CustomEvent('notificationUpdate'));
};

// Remover notificação
export const removeNotification = (id: string): void => {
  const store = loadNotifications();
  
  const notification = store.items.find(item => item.id === id);
  if (notification && !notification.read) {
    store.unreadCount = Math.max(0, store.unreadCount - 1);
  }
  
  store.items = store.items.filter(item => item.id !== id);
  saveNotifications(store);
  
  // Enviar evento para atualização da interface
  window.dispatchEvent(new CustomEvent('notificationUpdate'));
};

// Obter todas as notificações
export const getNotifications = (): Notification[] => {
  const store = loadNotifications();
  return store.items;
};

// Obter número de notificações não lidas
export const getUnreadCount = (): number => {
  const store = loadNotifications();
  return store.unreadCount;
};

// Gerar uma notificação do sistema automaticamente
export const generateSystemNotification = (
  forceType?: 'feature' | 'event' | 'award' | 'update'
): Notification => {
  // Tipos de notificações possíveis
  const notificationTypes = [
    {
      type: 'feature',
      titles: [
        'Nova funcionalidade disponível',
        'Atualização da plataforma',
        'Novidade na Ponto.School'
      ],
      contents: [
        'Experimente o novo sistema de recomendações personalizadas!',
        'Agora você pode personalizar seu dashboard com seus widgets favoritos.',
        'Nova interface de estudos com foco em produtividade.',
        'Modo escuro aprimorado para reduzir o cansaço visual.',
        'Sistema de conquistas renovado com mais recompensas!'
      ]
    },
    {
      type: 'event',
      titles: [
        'Evento próximo',
        'Não perca este evento',
        'Programação Ponto.School'
      ],
      contents: [
        'Webinar sobre técnicas de estudo avançadas nesta sexta-feira.',
        'Workshop de preparação para o ENEM no próximo sábado.',
        'Maratona de programação com premiações exclusivas!',
        'Palestra com especialistas em educação e tecnologia.',
        'Encontro virtual da comunidade Ponto.School neste domingo.'
      ]
    },
    {
      type: 'award',
      titles: [
        'Premiações disponíveis',
        'Conquiste recompensas',
        'Desbloqueie conquistas'
      ],
      contents: [
        'Você desbloqueou uma nova medalha por sua dedicação aos estudos!',
        'Parabéns! Você completou 7 dias consecutivos de estudo.',
        'Uma nova conquista foi desbloqueada. Confira seu perfil!',
        'Seu desempenho impressionante rendeu 500 pontos de experiência.',
        'Você subiu de nível! Novas vantagens foram desbloqueadas.'
      ]
    },
    {
      type: 'update',
      titles: [
        'Atualização do sistema',
        'Melhorias na plataforma',
        'Novidades implementadas'
      ],
      contents: [
        'Acabamos de melhorar o sistema de grupos de estudo!',
        'A plataforma está mais rápida e estável com as últimas otimizações.',
        'Novos recursos de acessibilidade foram implementados.',
        'Corrigimos problemas reportados pela comunidade. Obrigado pelo feedback!',
        'A experiência de estudo foi aprimorada com nossa última atualização.'
      ]
    }
  ];

  // Selecionar um tipo de notificação aleatoriamente ou usar o tipo forçado
  const selectedType = forceType
    ? notificationTypes.find(t => t.type === forceType)
    : notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

  // Selecionar título e conteúdo aleatórios para o tipo selecionado
  const titleIndex = Math.floor(Math.random() * selectedType.titles.length);
  const contentIndex = Math.floor(Math.random() * selectedType.contents.length);

  // Definir o tipo da notificação
  let notificationType: NotificationType = 'system';
  if (selectedType.type === 'award') notificationType = 'success';
  else if (selectedType.type === 'event') notificationType = 'info';
  else if (selectedType.type === 'update') notificationType = 'info';

  // Criar e adicionar a notificação
  return addNotification(
    selectedType.titles[titleIndex],
    selectedType.contents[contentIndex],
    notificationType,
    { important: selectedType.type === 'award' || selectedType.type === 'update' }
  );
};

// Inicializar o sistema de notificações e adicionar uma notificação de boas-vindas se for a primeira vez
export const initializeNotifications = (): void => {
  try {
    const store = loadNotifications();
    
    // Se não houver notificações, adicionar notificação de boas-vindas
    if (store.items.length === 0) {
      addNotification(
        'Bem-vindo à Ponto.School!',
        'Estamos felizes em tê-lo como parte da nossa comunidade de aprendizado.',
        'success',
        { important: true }
      );
      
      // Adicionar notificação explicando o sistema
      setTimeout(() => {
        addNotification(
          'Sistema de notificações',
          'Você receberá notificações importantes sobre eventos, atualizações e conquistas aqui.',
          'info'
        );
      }, 3000);
    }
    
    // Configurar verificação periódica para gerar novas notificações (a cada 3 horas)
    const checkLastNotification = () => {
      const currentStore = loadNotifications();
      const now = new Date();
      const lastUpdated = new Date(currentStore.lastUpdated);
      
      // Se a última atualização foi há mais de 3 horas, gerar nova notificação
      if (now.getTime() - lastUpdated.getTime() > 3 * 60 * 60 * 1000) {
        generateSystemNotification();
      }
    };
    
    // Verificar imediatamente e configurar verificação periódica
    checkLastNotification();
    const intervalId = setInterval(checkLastNotification, 30 * 60 * 1000); // Verificar a cada 30 minutos
    
    // Limpar intervalo quando a janela for fechada
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
    });
    
    console.log('Sistema de notificações inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar sistema de notificações:', error);
  }
};
