import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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

  const handleSubmit = () => {
    // Validate required fields
    if (!title.trim()) {
      alert("Por favor, insira um título para o evento.");
      return;
    }

    if (!startDate) {
      alert("Por favor, selecione uma data de início.");
      return;
    }

    // Create event object
    const newEvent = {
      id: `event-${Date.now()}`,
      type: eventType,
      title,
      description,
      discipline,
      professor,
      startDate,
      endDate,
      startTime,
      endTime,
      duration,
      location,
      isOnline,
      meetingLink,
      attachments: attachments.map((file) => file.name), // Just store names for demo
      reminders,
      repeat,
      guests,
      visibility,
      createdAt: new Date(),
    };

    // Call the onAddEvent callback with the new event
    if (onAddEvent) {
      onAddEvent(newEvent);
    }

    // Reset form and close modal
    resetForm();
    onOpenChange(false);
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
                <SelectItem value="reuniao">Reunião</SelectItem>
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

          {/* Data de Início */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Data de Início
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Data de Término (opcional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Data de Término
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy")
                    ) : (
                      <span>Mesma data de início</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
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