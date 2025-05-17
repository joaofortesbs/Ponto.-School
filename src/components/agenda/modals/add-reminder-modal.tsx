import React, { useState } from "react";
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

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReminder: (reminder: Reminder) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  open,
  onOpenChange,
  onAddReminder,
}) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [type, setType] = useState<"event" | "task" | "meeting" | "other">(
    "event",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !discipline) return;

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title,
      time,
      discipline,
      type,
      status: "pending",
    };

    onAddReminder(newReminder);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setTime("");
    setDiscipline("");
    setType("event");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Lembrete</DialogTitle>
          <DialogDescription>
            Crie um novo lembrete para não perder prazos importantes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Prova de Matemática"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Data/Hora</Label>
              <Input
                id="time"
                placeholder="Ex: Amanhã, 14:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Input
                id="discipline"
                placeholder="Ex: Matemática"
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderModal;
```

```text
The provided change snippet does not match the original code. There is no "reminderTime" variable in the original code. The user is asking to correct the "Invalid time value" error. To address this, I will modify the "time" input to accept a datetime-local format and handle the date and time correctly.
</text>

```typescript
import React, { useState } from "react";
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

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReminder: (reminder: Reminder) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  open,
  onOpenChange,
  onAddReminder,
}) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [type, setType] = useState<"event" | "task" | "meeting" | "other">(
    "event",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !discipline) return;

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title,
      time,
      discipline,
      type,
      status: "pending",
    };

    onAddReminder(newReminder);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setTime("");
    setDiscipline("");
    setType("event");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Lembrete</DialogTitle>
          <DialogDescription>
            Crie um novo lembrete para não perder prazos importantes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Prova de Matemática"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Data/Hora</Label>
              <Input
                id="time"
                type="datetime-local"
                placeholder="Ex: Amanhã, 14:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Input
                id="discipline"
                placeholder="Ex: Matemática"
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderModal;
```

```text
The previous attempt only added the "type='datetime-local'" attribute to the input. It did not take into account the changes provided in the snippet. I will now use the snippet to update the time input to correctly format the datetime value.
</text>

```typescript
import React, { useState } from "react";
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

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReminder: (reminder: Reminder) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  open,
  onOpenChange,
  onAddReminder,
}) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [type, setType] = useState<"event" | "task" | "meeting" | "other">(
    "event",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !discipline) return;

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title,
      time,
      discipline,
      type,
      status: "pending",
    };

    onAddReminder(newReminder);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setTime("");
    setDiscipline("");
    setType("event");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Lembrete</DialogTitle>
          <DialogDescription>
            Crie um novo lembrete para não perder prazos importantes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Prova de Matemática"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Data/Hora</Label>
              <Input
                id="time"
                type="datetime-local"
                placeholder="Ex: Amanhã, 14:00"
                value={time ? time.slice(0, 16) : ""}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Input
                id="discipline"
                placeholder="Ex: Matemática"
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderModal;