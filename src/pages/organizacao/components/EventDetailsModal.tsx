import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash, Edit, ExternalLink } from "lucide-react";
import { eventTypeColors } from "../types";
import EventTypeIcon from "./EventTypeIcon";

interface EventDetailsModalProps {
  showEventDetails: boolean;
  setShowEventDetails: (show: boolean) => void;
  selectedEvent: any;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function EventDetailsModal({
  showEventDetails,
  setShowEventDetails,
  selectedEvent,
  onEdit,
  onDelete,
}: EventDetailsModalProps) {
  if (!selectedEvent) return null;

  return (
    <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`${eventTypeColors[selectedEvent.type].bg} ${eventTypeColors[selectedEvent.type].text} p-2 rounded-md`}
            >
              <EventTypeIcon type={selectedEvent.type} />
            </div>
            <DialogTitle className="font-montserrat text-[#29335C] dark:text-white">
              {selectedEvent.title}
            </DialogTitle>
          </div>
          <DialogDescription>
            {selectedEvent.type === "aula_ao_vivo"
              ? "Aula ao Vivo"
              : selectedEvent.type === "aula_gravada"
                ? "Aula Gravada"
                : selectedEvent.type === "grupo_estudo"
                  ? "Grupo de Estudos"
                  : selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {selectedEvent.description && (
            <div className="border-b border-[#778DA9]/20 pb-4">
              <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                Descrição
              </h4>
              <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                {selectedEvent.description}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                Data e Hora de Início
              </h4>
              <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                {format(selectedEvent.start, "PPP 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                Data e Hora de Término
              </h4>
              <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                {format(selectedEvent.end, "PPP 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {selectedEvent.subject && (
              <div>
                <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                  Disciplina
                </h4>
                <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                  {selectedEvent.subject}
                </p>
              </div>
            )}
            {selectedEvent.professor && (
              <div>
                <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                  Professor
                </h4>
                <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                  {selectedEvent.professor}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                Modalidade
              </h4>
              <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                {selectedEvent.isOnline ? "Online" : "Presencial"}
              </p>
            </div>
            {selectedEvent.location && (
              <div>
                <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                  Local
                </h4>
                <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                  {selectedEvent.location}
                </p>
              </div>
            )}
            {selectedEvent.link && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                  Link
                </h4>
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {selectedEvent.link} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium mb-1 text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                Status
              </h4>
              <Badge
                className={
                  selectedEvent.status === "confirmado"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : selectedEvent.status === "pendente"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : selectedEvent.status === "cancelado"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                }
              >
                {selectedEvent.status === "confirmado"
                  ? "Confirmado"
                  : selectedEvent.status === "pendente"
                    ? "Pendente"
                    : selectedEvent.status === "cancelado"
                      ? "Cancelado"
                      : "Em Andamento"}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center">
          <div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(selectedEvent.id);
                setShowEventDetails(false);
              }}
            >
              <Trash className="h-4 w-4 mr-1" /> Excluir
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEventDetails(false)}
              className="border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10"
            >
              Fechar
            </Button>
            <Button
              className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
              onClick={() => {
                setShowEventDetails(false);
                onEdit();
              }}
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
