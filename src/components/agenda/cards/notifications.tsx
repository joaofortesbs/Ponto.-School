import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell, Info, BellOff } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  description: string;
  date: string;
  action?: string;
}

interface NotificationsProps {
  notifications?: Notification[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications = [] }) => {
  const hasNotifications = notifications.length > 0;

  return (
    <div className="bg-[#001427] text-white rounded-lg overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">Avisos Importantes</h3>
        </div>
        {hasNotifications && (
          <div className="text-xs text-white/80">
            {notifications.length} novos avisos
          </div>
        )}
      </div>

      {!hasNotifications ? (
        <div className="py-12 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#29335C]/30 flex items-center justify-center mb-4">
            <BellOff className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Sem notificações</h4>
          <p className="text-gray-400 text-sm text-center mb-6 max-w-[90%]">
            Você receberá notificações sobre eventos importantes, prazos e atualizações na plataforma aqui.
          </p>
          <Button
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
          >
            <Info className="h-4 w-4 mr-1" /> Configurar Notificações
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-[#29335C]/20">
          {notifications.map((notification) => {
            // Get notification icon based on type
            let NotificationIcon = Bell;
            let iconColor = "text-gray-500";

            if (notification.type === "urgent") {
              NotificationIcon = AlertCircle;
              iconColor = "text-red-500";
            } else if (notification.type === "important") {
              NotificationIcon = Info;
              iconColor = "text-amber-500";
            } else if (notification.type === "info") {
              NotificationIcon = Info;
              iconColor = "text-blue-500";
            }

            return (
              <div
                key={notification.id}
                className="p-4 hover:bg-[#29335C]/10 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <NotificationIcon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {notification.date}
                      </span>
                      {notification.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs py-0 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          {notification.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
