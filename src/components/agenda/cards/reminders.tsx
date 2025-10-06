import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Calendar,
  Clock,
  FileEdit,
  Trash2,
  CheckCircle,
  Volume2,
  Plus,
  ChevronRight,
} from "lucide-react";

export interface Reminder {
  id: string;
  title: string;
  time: string;
  discipline: string;
  type: "event" | "task" | "meeting" | "other";
  status: "pending" | "completed";
}

interface RemindersProps {
  reminders: Reminder[];
  onViewAll: () => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onComplete: (reminderId: string) => void;
  onSilence: (reminderId: string) => void;
  onAddReminder: () => void;
}

const Reminders: React.FC<RemindersProps> = ({
  reminders = [],
  onViewAll,
  onEdit,
  onDelete,
  onComplete,
  onSilence,
  onAddReminder,
}) => {
  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "task":
        return <FileEdit className="h-4 w-4 text-amber-500" />;
      case "meeting":
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <Card className="overflow-hidden border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-base font-bold text-white">Lembretes</h3>
        </div>
        <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors px-2 py-1">
          {reminders.length} lembretes
        </Badge>
      </div>

      <div className="divide-y divide-[#FF6B00]/10 dark:divide-[#FF6B00]/20">
        {reminders.length > 0 ? (
          reminders.slice(0, 3).map((reminder) => (
            <div
              key={reminder.id}
              className={`p-3 hover:bg-[#FF6B00]/5 transition-colors ${reminder.status === "completed" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${reminder.status === "completed" ? "bg-green-100 dark:bg-green-900/20" : "bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"}`}
                  >
                    {reminder.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      getReminderTypeIcon(reminder.type)
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium ${reminder.status === "completed" ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}
                  >
                    {reminder.title}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                    {reminder.time}
                  </div>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
                    >
                      {reminder.discipline}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => onComplete(reminder.id)}
                    title={
                      reminder.status === "completed"
                        ? "Marcar como pendente"
                        : "Marcar como concluído"
                    }
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => onEdit(reminder)}
                    title="Editar lembrete"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => onDelete(reminder.id)}
                    title="Excluir lembrete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Nenhum lembrete
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Você não possui lembretes ativos no momento.
            </p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex justify-between items-center">
        <Button
          variant="link"
          className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto text-sm transition-colors flex items-center"
          onClick={onViewAll}
        >
          Ver todos <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          onClick={onAddReminder}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Novo Lembrete
        </Button>
      </div>
    </Card>
  );
};

export default Reminders;
