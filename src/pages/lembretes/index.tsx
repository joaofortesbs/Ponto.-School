import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Reminder, RemindersList } from "@/components/agenda/cards/reminders";
import AddReminderModal from "@/components/agenda/modals/add-reminder-modal";

export default function LembretesPage() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "reminder-1",
      title: "Prova de Matemática",
      time: "Amanhã, 14:00",
      discipline: "Matemática",
      type: "event",
      status: "pending",
    },
    {
      id: "reminder-2",
      title: "Entrega do Trabalho de História",
      time: "Sexta-feira, 23:59",
      discipline: "História",
      type: "task",
      status: "pending",
    },
    {
      id: "reminder-3",
      title: "Reunião do Grupo de Estudos",
      time: "Quinta-feira, 16:00",
      discipline: "Física",
      type: "meeting",
      status: "pending",
    },
  ]);

  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);

  const handleAddReminder = (reminder: Reminder) => {
    setReminders([...reminders, reminder]);
    setIsAddReminderOpen(false);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id));
  };

  const handleCompleteReminder = (id: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, status: "completed" } : reminder,
      ),
    );
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
          Meus Lembretes
        </h1>
        <Button
          onClick={() => setIsAddReminderOpen(true)}
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Lembrete
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RemindersList
          reminders={reminders}
          onDelete={handleDeleteReminder}
          onComplete={handleCompleteReminder}
        />
      </div>

      <AddReminderModal
        open={isAddReminderOpen}
        onOpenChange={setIsAddReminderOpen}
        onAddReminder={handleAddReminder}
      />
    </div>
  );
}
