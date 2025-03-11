import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Clock,
  Video,
  MapPin,
  Users,
  Edit,
  Trash,
  Plus,
  Calendar,
} from "lucide-react";
import { Event, EventType, eventTypeColors } from "../types";
import EventTypeIcon from "./EventTypeIcon";

interface ListViewProps {
  filteredEvents: Event[];
  setSelectedEvent: (event: Event) => void;
  setShowEventDetails: (show: boolean) => void;
  setShowAddEvent: (show: boolean) => void;
  filterType: EventType | null;
  setFilterType: (type: EventType | null) => void;
  onDeleteEvent: (id: string) => void;
}

export default function ListView({
  filteredEvents,
  setSelectedEvent,
  setShowEventDetails,
  setShowAddEvent,
  filterType,
  setFilterType,
  onDeleteEvent,
}: ListViewProps) {
  return (
    <div className="border border-[#778DA9]/30 dark:border-[#778DA9]/20 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 p-4 border-b border-[#778DA9]/20 flex justify-between items-center">
        <h3 className="font-semibold font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
          Todos os Eventos
        </h3>
        <div className="flex items-center gap-2">
          <Select
            value={filterType || ""}
            onValueChange={(value) =>
              setFilterType((value as EventType) || null)
            }
          >
            <SelectTrigger className="h-8 w-[180px] border-[#778DA9]/30 focus:ring-[#778DA9]/30">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent className="border-[#778DA9]/30">
              <SelectItem value="">Todos os tipos</SelectItem>
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
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10"
          >
            <Filter className="h-4 w-4 mr-1" /> Mais Filtros
          </Button>
        </div>
      </div>
      <div className="divide-y divide-[#778DA9]/10 dark:divide-[#778DA9]/20 bg-white dark:bg-[#29335C]/10">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 hover:bg-[#778DA9]/5 dark:hover:bg-[#29335C]/30 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedEvent(event);
                setShowEventDetails(true);
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text} p-3 rounded-md`}
                >
                  <EventTypeIcon type={event.type} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                      {event.title}
                    </h4>
                    <div className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                      {format(event.start, "d 'de' MMM", { locale: ptBR })}
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70 mt-1">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {format(event.start, "HH:mm")} -{" "}
                      {format(event.end, "HH:mm")}
                    </div>
                    {event.subject && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#778DA9]/30 text-[#778DA9]"
                      >
                        {event.subject}
                      </Badge>
                    )}
                    {event.isOnline ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                        <Video className="h-3 w-3 mr-1" /> Online
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                        <MapPin className="h-3 w-3 mr-1" /> Presencial
                      </Badge>
                    )}
                    {event.professor && (
                      <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {event.professor}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#778DA9]/10 text-[#778DA9]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowAddEvent(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-100 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#778DA9]/10 dark:bg-[#29335C]/30 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-[#778DA9]" />
            </div>
            <h3 className="text-lg font-medium text-[#29335C] dark:text-[#E0E1DD] mb-1 font-montserrat">
              Nenhum evento encontrado
            </h3>
            <p className="text-[#29335C]/70 dark:text-[#E0E1DD]/70 mb-4">
              Tente ajustar seus filtros ou adicione um novo evento.
            </p>
            <Button
              className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
              onClick={() => setShowAddEvent(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
