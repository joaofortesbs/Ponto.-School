import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Clock,
  Copy,
  Edit,
  FileText,
  MapPin,
  Share,
  Trash,
  UserPlus,
  Users,
  Video,
  RefreshCw,
  Bell,
  Globe,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onEditEvent?: (event: any) => void;
  onDeleteEvent?: (eventId: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  open,
  onOpenChange,
  event,
  onEditEvent,
  onDeleteEvent,
}) => {
  if (!event) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-4 w-4" />;
      case "trabalho":
        return <FileText className="h-4 w-4" />;
      case "prova":
        return <FileText className="h-4 w-4" />;
      case "reuniao":
        return <Users className="h-4 w-4" />;
      case "lembrete":
        return <Bell className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleEdit = async () => {
    if (onEditEvent) {
      try {
        // Importar serviços necessários
        const { updateEvent } = await import('@/services/calendarEventService');

        const editedEvent = {
          ...event,
          title: editedTitle,
          description: editedDescription,
          type: editedType,
          discipline: editedDiscipline,
          location: editedLocation,
          isOnline: editedIsOnline,
          meetingLink: editedMeetingLink,
          startTime: editedStartTime,
          startDate: editedDate ? format(editedDate, 'yyyy-MM-dd') : event.startDate,
          endTime: editedEndTime,
        };

        // Salvar no banco de dados
        const updatedEvent = await updateEvent(editedEvent);

        if (updatedEvent) {
          toast({
            title: "Evento atualizado",
            description: "O evento foi atualizado com sucesso no banco de dados."
          });
        } else {
          toast({
            title: "Aviso",
            description: "O evento foi atualizado localmente, mas houve um problema ao salvá-lo no servidor.",
            variant: "warning"
          });
        }

        // Atualizar a interface independentemente do resultado do banco
        onEditEvent(editedEvent);
        onOpenChange(false);

      } catch (error) {
        console.error("Erro ao editar evento:", error);
        toast({
          title: "Erro ao editar evento",
          description: "Ocorreu um erro ao atualizar o evento. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = async () => {
    if (onDeleteEvent) {
      try {
        // Importar serviços necessários
        const { deleteEvent } = await import('@/services/calendarEventService');

        // Excluir do banco de dados
        const deleted = await deleteEvent(event.id);

        if (deleted) {
          toast({
            title: "Evento excluído",
            description: "O evento foi excluído com sucesso do banco de dados."
          });
        } else {
          toast({
            title: "Aviso",
            description: "O evento foi removido localmente, mas houve um problema ao excluí-lo no servidor.",
            variant: "warning"
          });
        }

        // Atualizar a interface independentemente do resultado do banco
        onDeleteEvent(event.id);
        onOpenChange(false);

      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        toast({
          title: "Erro ao excluir evento",
          description: "Ocorreu um erro ao excluir o evento. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className="sm:max-w-[600px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#FF6B00]">
              {getEventIcon(event.type)}
            </div>
            <DialogTitle>{event.title}</DialogTitle>
          </div>
          <DialogDescription>{event.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Data e Hora
              </span>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-[#FF6B00]" />
                {event.time}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Disciplina
              </span>
              <div className="flex items-center text-sm">
                <BookOpen className="h-4 w-4 mr-1 text-[#FF6B00]" />
                {event.discipline}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Status
              </span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {event.status === "confirmado" ? "Confirmado" : "Pendente"}
              </Badge>
            </div>
          </div>

          {event.professor && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Professor
              </span>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-[#FF6B00]" />
                {event.professor}
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Local
              </span>
              <div className="flex items-center text-sm">
                {event.isOnline ? (
                  <Video className="h-4 w-4 mr-1 text-[#FF6B00]" />
                ) : (
                  <MapPin className="h-4 w-4 mr-1 text-[#FF6B00]" />
                )}
                {event.location}
                {event.isOnline && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Online
                  </Badge>
                )}
              </div>
            </div>
          )}

          {event.meetingLink && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Link da Reunião
              </span>
              <div className="flex items-center text-sm">
                <Video className="h-4 w-4 mr-1 text-[#FF6B00]" />
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {event.meetingLink}
                </a>
              </div>
            </div>
          )}

          {event.materials && event.materials.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Materiais
              </span>
              <div className="flex flex-wrap gap-2">
                {event.materials.map((material: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" /> {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {event.guests && event.guests.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Convidados
              </span>
              <div className="flex flex-wrap gap-2">
                {event.guests.map((guest: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="h-3 w-3" /> {guest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {event.repeat && event.repeat !== "none" && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Repetição
              </span>
              <div className="flex items-center text-sm">
                <RefreshCw className="h-4 w-4 mr-1 text-[#FF6B00]" />
                {event.repeat === "daily" && "Diariamente"}
                {event.repeat === "weekly" && "Semanalmente"}
                {event.repeat === "biweekly" && "A cada duas semanas"}
                {event.repeat === "monthly" && "Mensalmente"}
              </div>
            </div>
          )}

          {event.visibility && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Visibilidade
              </span>
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 mr-1 text-[#FF6B00]" />
                {event.visibility === "private" && "Privado"}
                {event.visibility === "class" && "Turma"}
                {event.visibility === "public" && "Público"}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Share className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            {event.type === "aula" && event.isOnline && event.meetingLink && (
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={() => window.open(event.meetingLink, "_blank")}
              >
                <Video className="h-4 w-4 mr-1" /> Entrar na Aula
              </Button>
            )}
            {event.materials && event.materials.length > 0 && (
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-1" /> Ver Materiais
              </Button>
            )}
             <div className="mt-4 space-y-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2 text-[#FF6B00]" />
                {event.startDate && format(new Date(event.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
          </div>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;