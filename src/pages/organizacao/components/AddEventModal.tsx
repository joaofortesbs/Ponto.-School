import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventType } from "../types";

interface AddEventModalProps {
  showAddEvent: boolean;
  setShowAddEvent: (show: boolean) => void;
  selectedEvent: any;
  onSave: (event: any) => void;
}

export default function AddEventModal({
  showAddEvent,
  setShowAddEvent,
  selectedEvent,
  onSave,
}: AddEventModalProps) {
  const [title, setTitle] = React.useState(selectedEvent?.title || "");
  const [description, setDescription] = React.useState(
    selectedEvent?.description || "",
  );
  const [eventType, setEventType] = React.useState<EventType>(
    selectedEvent?.type || "evento",
  );
  const [subject, setSubject] = React.useState(selectedEvent?.subject || "");
  const [professor, setProfessor] = React.useState(
    selectedEvent?.professor || "",
  );
  const [isOnline, setIsOnline] = React.useState(
    selectedEvent?.isOnline || false,
  );
  const [location, setLocation] = React.useState(selectedEvent?.location || "");
  const [link, setLink] = React.useState(selectedEvent?.link || "");
  const [status, setStatus] = React.useState(
    selectedEvent?.status || "pendente",
  );

  const handleSave = () => {
    const updatedEvent = {
      ...selectedEvent,
      title,
      description,
      type: eventType,
      subject,
      professor,
      isOnline,
      location,
      link,
      status,
    };
    onSave(updatedEvent);
    setShowAddEvent(false);
  };

  return (
    <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-[#29335C] dark:text-white">
            {selectedEvent?.id ? "Editar Evento" : "Adicionar Evento"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do evento para adicioná-lo à sua agenda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="event-type"
              className="text-right text-[#29335C] dark:text-[#E0E1DD]"
            >
              Tipo de Evento
            </Label>
            <Select
              defaultValue={selectedEvent?.type || "evento"}
              onValueChange={(value) => setEventType(value as EventType)}
            >
              <SelectTrigger
                id="event-type"
                className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
              >
                <SelectValue placeholder="Selecione o tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aula_ao_vivo">Aula ao Vivo</SelectItem>
                <SelectItem value="aula_gravada">Aula Gravada</SelectItem>
                <SelectItem value="tarefa">Tarefa</SelectItem>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="plantao">Plantão de Dúvidas</SelectItem>
                <SelectItem value="grupo_estudo">Grupo de Estudos</SelectItem>
                <SelectItem value="desafio">Desafio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="title"
              className="text-right text-[#29335C] dark:text-[#E0E1DD]"
            >
              Título
            </Label>
            <Input
              id="title"
              className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
              placeholder="Título do evento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="description"
              className="text-right text-[#29335C] dark:text-[#E0E1DD]"
            >
              Descrição
            </Label>
            <Textarea
              id="description"
              className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
              placeholder="Descrição do evento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="subject"
              className="text-right text-[#29335C] dark:text-[#E0E1DD]"
            >
              Disciplina
            </Label>
            <Input
              id="subject"
              className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
              placeholder="Disciplina relacionada"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="professor"
              className="text-right text-[#29335C] dark:text-[#E0E1DD]"
            >
              Professor
            </Label>
            <Input
              id="professor"
              className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
              placeholder="Nome do professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-[#29335C] dark:text-[#E0E1DD]">
              Modalidade
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="is-online"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
              <Label
                htmlFor="is-online"
                className="text-[#29335C] dark:text-[#E0E1DD]"
              >
                {isOnline ? "Online" : "Presencial"}
              </Label>
            </div>
          </div>
          {isOnline ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="link"
                className="text-right text-[#29335C] dark:text-[#E0E1DD]"
              >
                Link
              </Label>
              <Input
                id="link"
                className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
                placeholder="Link da aula ou reunião"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="location"
                className="text-right text-[#29335C] dark:text-[#E0E1DD]"
              >
                Local
              </Label>
              <Input
                id="location"
                className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
                placeholder="Local do evento"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="status"
              className="text-right text-[#29335C] dark:text-[#E0E1DD]"
            >
              Status
            </Label>
            <Select
              defaultValue={selectedEvent?.status || "pendente"}
              onValueChange={(value) => setStatus(value)}
            >
              <SelectTrigger
                id="status"
                className="col-span-3 border-[#778DA9]/30 focus:ring-[#778DA9]/30"
              >
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowAddEvent(false)}
            className="border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
            onClick={handleSave}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
