import React, { useState } from "react";
import { Bell, Clock, X, Check, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  time: string;
  type: "info" | "warning" | "alert" | "success";
  read: boolean;
}

interface NotificationsProps {
  notifications?: Notification[];
  onNotificationRead?: (id: string) => void;
  onClearAll?: () => void;
  isNewUser?: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications = [],
  onNotificationRead,
  onClearAll,
  isNewUser = true,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const markAsRead = (id: string) => {
    if (onNotificationRead) {
      onNotificationRead(id);
    }
  };

  const clearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "warning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "alert":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold flex items-center text-[#001427] dark:text-white">
            <Bell className="w-5 h-5 mr-2 text-[#FF6B00]" />
            Notificações
          </h3>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-[#FF6B00] text-white">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleExpand}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 flex-grow overflow-hidden">
          {notifications.length === 0 || isNewUser ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Nenhuma notificação</p>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs">
                Notificações de prazos, eventos e lembretes aparecerão aqui
              </p>
              <Button 
                variant="outline"
                className="mt-4 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                <Settings className="h-4 w-4 mr-1" /> Configurar Notificações
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100%-2rem)] overflow-y-auto pr-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border border-[#29335C]/10 rounded-lg p-3 transition duration-200 ${
                    notification.read
                      ? "bg-white dark:bg-[#001427]/60"
                      : "bg-blue-50/50 dark:bg-blue-900/5 border-blue-100 dark:border-blue-900/20"
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    <h4
                      className={`font-medium ${
                        notification.read
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-[#001427] dark:text-white"
                      }`}
                    >
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`${getNotificationTypeColor(notification.type)} text-xs px-2 py-0`}
                      >
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                          aria-label="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isNewUser && notifications.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#29335C]/10 flex justify-between">
          <Button
            variant="ghost"
            className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-sm"
            onClick={clearAll}
          >
            Limpar Todas
          </Button>
          <Button
            variant="ghost"
            className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-sm"
            onClick={() => {
              // Handle settings
            }}
          >
            <Settings className="h-3.5 w-3.5 mr-1" /> Configurações
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;