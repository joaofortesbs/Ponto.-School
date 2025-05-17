import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reminder } from "../cards/reminders";

interface EditReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: Reminder;
  onEditReminder: (reminder: Reminder) => void;
}

const EditReminderModal: React.FC<EditReminderModalProps> = ({
  open,
  onOpenChange,
  reminder,
  onEditReminder,
}) => {
  const [title, setTitle] = useState(reminder.title);
  const [time, setTime] = useState(reminder.time);
  const [discipline, setDiscipline] = useState(reminder.discipline);
  const [type, setType] = useState<"event" | "task" | "meeting" | "other">(
    reminder.type,
  );
  const [status, setStatus] = useState(reminder.status);

  useEffect(() => {
    if (open) {
      setTitle(reminder.title);
      setTime(reminder.time);
      setDiscipline(reminder.discipline);
      setType(reminder.type);
      setStatus(reminder.status);
    }
  }, [open, reminder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !discipline) return;

    const updatedReminder: Reminder = {
      ...reminder,
      title,
      time,
      discipline,
      type,
      status,
    };

    onEditReminder(updatedReminder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Lembrete</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu lembrete.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Data/Hora</Label>
              <Input
                id="time"
                value={reminder?.dueDate ? new Date(reminder.dueDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Input
                id="discipline"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as any)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReminderModal;