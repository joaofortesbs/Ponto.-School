
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  X 
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: Date;
}

interface NotificationsContentProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const NotificationsContent: React.FC<NotificationsContentProps> = ({
  notifications,
  setNotifications
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Bell className="h-3.5 w-3.5 text-orange-500" />
            <h3 className="text-sm font-semibold">Notificações</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full px-2 py-0 h-6 text-xs"
            onClick={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true })),
              );
            }}
          >
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <ScrollArea
        className="flex-1 custom-scrollbar"
        style={{ maxHeight: "calc(100% - 60px)" }}
      >
        <div className="p-4 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
                  notification.read 
                    ? "border-orange-200 dark:border-orange-700 bg-white dark:bg-transparent" 
                    : "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === "info" 
                          ? "bg-blue-100 text-blue-600" 
                          : notification.type === "success" 
                          ? "bg-green-100 text-green-600" 
                          : notification.type === "warning" 
                          ? "bg-yellow-100 text-yellow-600" 
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {notification.type === "info" && <MessageCircle className="h-4 w-4" />}
                      {notification.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                      {notification.type === "warning" && <Clock className="h-4 w-4" />}
                      {notification.type === "error" && <X className="h-4 w-4" />}
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {notification.title}
                    </h4>
                  </div>
                  {!notification.read && (
                    <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Nova
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3 ml-10">
                  {notification.message}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-400 ml-10">
                  <span>
                    {notification.timestamp.toLocaleDateString()} às{" "}
                    {notification.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/20"
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) =>
                          n.id === notification.id ? { ...n, read: true } : n,
                        ),
                      );
                    }}
                  >
                    {notification.read ? "Lida" : "Marcar como lida"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-4 dark:text-gray-300">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                Nenhuma notificação
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
                Você não tem notificações no momento
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
