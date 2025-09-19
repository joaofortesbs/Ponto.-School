
import React, { useState, useEffect } from 'react';
import { X, Check, Share2, Copy } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  show: boolean;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  show
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5" />;
      case 'info':
        return <Share2 className="w-5 h-5" />;
      default:
        return <Copy className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-orange-500 text-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${getStyles()} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
        {getIcon()}
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Hook para usar o toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
  }>>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast
  };
};
