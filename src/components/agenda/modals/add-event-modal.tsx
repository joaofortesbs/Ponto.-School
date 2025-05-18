import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  FileText,
  Link as LinkIcon,
  MapPin,
  Plus,
  Upload,
  User,
  Users,
  X,
  Globe,
  Bell,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent?: (event: any) => void;
  selectedDate?: Date | null;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  open,
  onOpenChange,
  onAddEvent,
  selectedDate,
}) => {
  const [eventType, setEventType] = useState("aula");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [professor, setProfessor] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    selectedDate || undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    selectedDate || undefined,
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [reminders, setReminders] = useState<string[]>(["30min"]);
  const [repeat, setRepeat] = useState("none");
  const [guests, setGuests] = useState<string[]>([]);
  const [newGuest, setNewGuest] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [isAllDay, setIsAllDay] = useState(false);

  // Sample disciplines
  const disciplines = [
    { id: "matematica", name: "Matemática" },
    { id: "fisica", name: "Física" },
    { id: "quimica", name: "Química" },
    { id: "biologia", name: "Biologia" },
    { id: "historia", name: "História" },
    { id: "geografia", name: "Geografia" },
    { id: "literatura", name: "Literatura" },
    { id: "ingles", name: "Inglês" },
  ];

  // Sample professors
  const professors = [
    { id: "prof1", name: "Prof. Carlos Santos" },
    { id: "prof2", name: "Profa. Maria Silva" },
    { id: "prof3", name: "Prof. João Oliveira" },
    { id: "prof4", name: "Profa. Ana Pereira" },
  ];

  const handleAddGuest = () => {
    if (newGuest.trim() && !guests.includes(newGuest.trim())) {
      setGuests([...guests, newGuest.trim()]);
      setNewGuest("");
    }
  };

  const handleRemoveGuest = (guestToRemove: string) => {
    setGuests(guests.filter((guest) => guest !== guestToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setAttachments(attachments.filter((file) => file !== fileToRemove));
  };

  const calculateDuration = () => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      setDuration(`${hours}h ${mins}min`);
    } else {
      setDuration("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Verify form has minimum required fields
      if (!title || !startDate) {
        const { toast } = await import("@/components/ui/use-toast");
        toast({
          title: "Campos obrigatórios",
          description: "Título e data são campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      // Create event object
      const newEvent = {
        id: uuidv4(),
        title,
        description,
        type: eventType,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : startDate.toISOString(),
        startTime,
        endTime,
        isAllDay,
        location,
        isOnline,
        meetingLink,
        discipline,
        professor,
        createdAt: new Date().toISOString(),
      };

      let userId = null;
      try {
        const { getCurrentUser } = await import('@/services/databaseService');
        const user = await getCurrentUser();
        if (user) {
          userId = user.id;
          newEvent.userId = userId;
        }
      } catch (userError) {
        console.log("Usuário não autenticado, salvando evento localmente.");
      }

      const { addEvent, syncLocalEvents } = await import('@/services/calendarEventService');
      await addEvent(newEvent);

      // Sync with database if user is logged in
      if (userId) {
        try {
          await syncLocalEvents(userId);
        } catch (syncError) {
          console.error("Erro ao sincronizar eventos:", syncError);
        }
      }

      // Clear form
      setTitle("");
      setDescription("");
      setEventType("evento");
      setStartTime("");
      setEndTime("");
      setIsAllDay(false);
      setLocation("");
      setIsOnline(false);
      setMeetingLink("");
      setDiscipline("");
      setProfessor("");

      // Call parent callback if provided
      if (onAddEvent) {
        onAddEvent(newEvent);
      }

      // Close modal
      onOpenChange(false);

      // Show success toast
      const { toast } = await import("@/components/ui/use-toast");
      toast({
        title: "Evento adicionado",
        description: "O evento foi adicionado com sucesso.",
      });

      // Trigger a refresh of events in the parent component and EventosDoDiaCard
      window.dispatchEvent(new CustomEvent('agenda-events-updated', { 
        detail: { events: newEvent } 
      }));

    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      const { toast } = await import("@/components/ui/use-toast");
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o evento.",
        variant: "destructive",
      });
    }
  };

  // Função para adicionar um evento
  const handleAddEvent = async () => {
    if (!selectedDate) return;

    try {
      const newEventData = {
        title: title,
        description: description,
        type: eventType,
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        endDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: startTime,
        endTime: endTime,
        location: location,
        isOnline: isOnline,
        meetingLink: meetingLink,
        discipline: discipline || "Geral",
        professor: "",
        userId: "local" // Será substituído pelo ID real do usuário no serviço
      };

      // Importar função de serviço
      const { addEvent, getAllLocalEvents } = await import('@/services/calendarEventService');
      const { getCurrentUser } = await import('@/services/databaseService');

      let userId = "local";

      try {
        const currentUser = await getCurrentUser();
        if (currentUser?.id) {
          userId = currentUser.id;
        }
      } catch (error) {
        console.warn("Erro ao obter usuário atual:", error);
      }

      // Adicionar ID do usuário
      const eventWithUserId = {
        ...newEventData,
        userId: userId
      };

      console.log("Adicionando evento:", eventWithUserId);

      // Adicionar o evento no serviço (banco de dados e/ou armazenamento local)
      const addedEvent = await addEvent(eventWithUserId);

      if (addedEvent) {
        console.log("Evento adicionado com sucesso:", addedEvent);

        // Fechar o modal e notificar o componente pai
        onOpenChange(false);

        if (onAddEvent) {
          onAddEvent(addedEvent);
        }

        // Atualizar a variável global para manter consistência entre visualizações
        try {
          if (window.agendaEventData) {
            const day = new Date(addedEvent.startDate).getDate();
            if (!window.agendaEventData[day]) {
              window.agendaEventData[day] = [];
            }

            // Adicionar o evento na estrutura global
            window.agendaEventData[day].push({
              ...addedEvent,
              color: getEventTypeColor(addedEvent.type || "evento")
            });
          }
        } catch (globalUpdateError) {
          console.warn("Não foi possível atualizar a variável global:", globalUpdateError);
        }

        // Disparar evento para notificar todos os componentes que dependem dos eventos
        try {
          window.dispatchEvent(new CustomEvent('agenda-events-updated', { 
            detail: { event: addedEvent }
          }));
          console.log("Evento de notificação disparado para todos os componentes");
        } catch (eventError) {
          console.warn("Erro ao disparar evento de notificação:", eventError);
        }

        const { toast } = await import("@/components/ui/use-toast");
        toast({
          title: "Evento adicionado",
          description: "O evento foi salvo com sucesso.",
          variant: "default",
        });
      } else {
        console.error("Falha ao adicionar evento");
        const { toast } = await import("@/components/ui/use-toast");
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o evento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      const { toast } = await import("@/components/ui/use-toast");
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o evento. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Função auxiliar para obter cor baseada no tipo de evento
  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case "aula":
        return "blue";
      case "trabalho":
      case "tarefa":
        return "amber";
      case "prova":
        return "red";
      case "reuniao":
        return "green";
      case "lembrete":
        return "yellow";
      case "evento":
        return "purple";
      default:
        return "gray";
    }
  };

  const resetForm = () => {
    setEventType("aula");
    setTitle("");
    setDescription("");
    setDiscipline("");
    setProfessor("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("");
    setEndTime("");
    setDuration("");
    setLocation("");
    setIsOnline(false);
    setMeetingLink("");
    setAttachments([]);
    setReminders(["30min"]);
    setRepeat("none");
    setGuests([]);
    setNewGuest("");
    setVisibility("private");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Adicionar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do evento abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tipo de Evento */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aula">Aula</SelectItem>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="reuniao">Reuniao</SelectItem>
                <SelectItem value="evento">Evento Pessoal</SelectItem>
                <SelectItem value="lembrete">Lembrete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              placeholder="Título do evento"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Descrição */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descrição detalhada"
              className="col-span-3"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Disciplina */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discipline" className="text-right">
              Disciplina
            </Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {disciplines.map((disc) => (
                  <SelectItem key={disc.id} value={disc.id}>
                    {disc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professor (condicional) */}
          {["aula", "prova"].includes(eventType) && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professor" className="text-right">
                Professor
              </Label>
              <Select value={professor} onValueChange={setProfessor}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {professors.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Calendário para seleção de datas */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="dates" className="text-right pt-2">
              Datas
            </Label>
            <div className="col-span-3">
              {/* Calendário para seleção de datas */}
              <div className="border rounded-md p-4 bg-white dark:bg-slate-950">
                <Calendar
                  mode="range"
                  selected={{
                    from: startDate,
                    to: endDate || startDate
                  }}
                  onSelect={(range) => {
                    if (range?.from) {
                      setStartDate(range.from);
                      setEndDate(range.to || range.from);
                    }
                  }}
                  numberOfMonths={1}
                  className="rounded-md border"
                  disabled={false}
                  initialFocus
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {startDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="font-semibold">Início:</span> {format(startDate, "dd/MM/yyyy")}
                  </Badge>
                )}
                {endDate && endDate !== startDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="font-semibold">Término:</span> {format(endDate, "dd/MM/yyyy")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Horário */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Horário
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div className="flex gap-2 items-center flex-1">
                <Input
                  id="startTime"
                  type="time"
                  className="flex-1"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (endTime) calculateDuration();
                  }}
                />
                <span className="text-gray-500">até</span>
                <Input
                  id="endTime"
                  type="time"
                  className="flex-1"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (startTime) calculateDuration();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Duração (calculada automaticamente) */}
          {duration && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duração
              </Label>
              <div className="col-span-3">
                <Badge variant="outline" className="text-sm">
                  {duration}
                </Badge>
              </div>
            </div>
          )}

          {/* Local (condicional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Local
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                id="location"
                placeholder="Local do evento"
                className="flex-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isOnline}
              />
            </div>
          </div>

          {/* Online/Presencial */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Online</Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="isOnline"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
              <Label htmlFor="isOnline">
                {isOnline ? "Evento online" : "Evento presencial"}
              </Label>
            </div>
          </div>

          {/* Link da reunião (condicional) */}
          {isOnline && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meetingLink" className="text-right">
                Link
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-500" />
                <Input
                  id="meetingLink"
                  placeholder="Link da reunião/aula online"
                  className="flex-1"
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Anexos */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="attachments" className="text-right pt-2">
              Anexos
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="h-4 w-4" /> Adicionar arquivo
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="text-xs text-gray-500">
                  Máx. 10MB por arquivo
                </span>
              </div>

              {/* Lista de arquivos anexados */}
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveFile(file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lembretes */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Lembretes</Label>
            <div className="col-span-3 space-y-2">
              <Select
                value={reminders[0]}
                onValueChange={(value) => setReminders([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quando lembrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem lembrete</SelectItem>
                  <SelectItem value="10min">10 minutos antes</SelectItem>
                  <SelectItem value="30min">30 minutos antes</SelectItem>
                  <SelectItem value="1hour">1 hora antes</SelectItem>
                  <SelectItem value="3hours">3 horas antes</SelectItem>
                  <SelectItem value="1day">1 dia antes</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox id="notifyEmail" />
                <Label htmlFor="notifyEmail" className="text-sm">
                  Notificar por e-mail
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notifyPlatform" defaultChecked />
                <Label htmlFor="notifyPlatform" className="text-sm">
                  Notificar na plataforma
                </Label>
              </div>
            </div>
          </div>

          {/* Repetição */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repeat" className="text-right">
              Repetição
            </Label>
            <Select value={repeat} onValueChange={setRepeat}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não repetir</SelectItem>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="biweekly">A cada duas semanas</SelectItem>
                <SelectItem value="monthly">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Convidados */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Convidados</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Adicionar convidado (email ou nome)"
                    value={newGuest}
                    onChange={(e) => setNewGuest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddGuest()}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddGuest}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Convidados adicionados */}
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {guests.map((guest, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs"
                    >
                      <User className="h-3 w-3 text-gray-500" />
                      <span>{guest}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-gray-500 hover:text-red-500 hover:bg-transparent"
                        onClick={() => handleRemoveGuest(guest)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visibilidade */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibility" className="text-right">
              Visibilidade
            </Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Privado (somente você)</span>
                  </div>
                </SelectItem>
                <SelectItem value="class">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Turma (visível para sua turma)</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Público (visível para todos)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={handleSubmit}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;