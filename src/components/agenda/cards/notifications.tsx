import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell, Info } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  description: string;
  date: string;
  action?: string;
}

interface NotificationsProps {
  notifications: Notification[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
  return (
    <div className="bg-[#001427] text-white rounded-lg overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">Avisos Importantes</h3>
        </div>
        <div className="text-xs text-white/80">
          {notifications.length} novos avisos
        </div>
      </div>
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
    </div>
  );
};

export default Notifications;
