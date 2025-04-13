
import { useReducer, useCallback } from 'react';

type NotificationType = 'message' | 'system' | 'alert';

interface Notification {
  id: string;
  type: NotificationType;
  content: string;
  read: boolean;
  timestamp: Date;
}

type SilenceType = 'all' | 'messages' | 'notifications';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  silenceType: SilenceType;
  lastAutoNotificationTime: Date | null;
  deletedIds: string[];
  isReplyModalOpen: boolean;
  selectedMessageForReply: Notification | null;
}

type NotificationsAction =
  | { type: 'ADD_NOTIFICATION', payload: Omit<Notification, 'read' | 'timestamp'> }
  | { type: 'MARK_AS_READ', payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION', payload: string }
  | { type: 'SET_SILENCE_TYPE', payload: SilenceType }
  | { type: 'SET_REPLY_MODAL', payload: { open: boolean, message?: Notification | null } }
  | { type: 'UPDATE_AUTO_NOTIFICATION_TIME' };

const notificationsReducer = (state: NotificationsState, action: NotificationsAction): NotificationsState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification = {
        ...action.payload,
        read: false,
        timestamp: new Date()
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification as Notification],
        unreadCount: state.unreadCount + 1
      };
      
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === action.payload 
          ? { ...notification, read: true } 
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };
      
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
      
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        deletedIds: [...state.deletedIds, action.payload],
        unreadCount: state.notifications.filter(n => !n.read && n.id !== action.payload).length
      };
      
    case 'SET_SILENCE_TYPE':
      return {
        ...state,
        silenceType: action.payload
      };
      
    case 'SET_REPLY_MODAL':
      return {
        ...state,
        isReplyModalOpen: action.payload.open,
        selectedMessageForReply: action.payload.message || null
      };
      
    case 'UPDATE_AUTO_NOTIFICATION_TIME':
      return {
        ...state,
        lastAutoNotificationTime: new Date()
      };
      
    default:
      return state;
  }
};

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  silenceType: 'all',
  lastAutoNotificationTime: null,
  deletedIds: [],
  isReplyModalOpen: false,
  selectedMessageForReply: null
};

export function useNotifications() {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);
  
  const addNotification = useCallback((notification: Omit<Notification, 'read' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);
  
  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);
  
  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);
  
  const deleteNotification = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  }, []);
  
  const setSilenceType = useCallback((type: SilenceType) => {
    dispatch({ type: 'SET_SILENCE_TYPE', payload: type });
  }, []);
  
  const openReplyModal = useCallback((message: Notification) => {
    dispatch({ type: 'SET_REPLY_MODAL', payload: { open: true, message } });
  }, []);
  
  const closeReplyModal = useCallback(() => {
    dispatch({ type: 'SET_REPLY_MODAL', payload: { open: false } });
  }, []);
  
  const updateAutoNotificationTime = useCallback(() => {
    dispatch({ type: 'UPDATE_AUTO_NOTIFICATION_TIME' });
  }, []);
  
  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    silenceType: state.silenceType,
    lastAutoNotificationTime: state.lastAutoNotificationTime,
    deletedIds: state.deletedIds,
    isReplyModalOpen: state.isReplyModalOpen,
    selectedMessageForReply: state.selectedMessageForReply,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setSilenceType,
    openReplyModal,
    closeReplyModal,
    updateAutoNotificationTime
  };
}
