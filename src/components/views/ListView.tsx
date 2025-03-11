import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event, EventType, eventTypeColors } from "@/pages/agenda/types";
import EventTypeIcon from "@/pages/agenda/components/EventTypeIcon";
import {
  Filter,
  Clock,
  Video,
  MapPin,
  Users,
  Edit,
  Trash,
  Plus,
  MoreHorizontal,
} from "lucide-react";

interface ListViewProps {
  filteredEvents: Event[];
  setSelectedEvent: (event: Event) => void;
  setShowEventDetails: (show: boolean) => void;
  setShowAddEvent: (show: boolean) => void;
  filterType: EventType | null;
  setFilterType: (type: EventType | null) => void;
}

export default function ListView({
  filteredEvents,
  setSelectedEvent,
  setShowEventDetails,
  setShowAddEvent,
  filterType,
  setFilterType,
}: ListViewProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Todos os Eventos</h3>
        <div className="flex items-center gap-2">
          <Select
            value={filterType || ""}
            onValueChange={(value) =>
              setFilterType((value as EventType) || null)
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
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
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-4 w-4 mr-1" /> Mais Filtros
          </Button>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
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
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(event.start, "d 'de' MMM", { locale: ptBR })}
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {format(event.start, "HH:mm")} -{" "}
                      {format(event.end, "HH:mm")}
                    </div>
                    {event.subject && (
                      <Badge variant="outline" className="text-xs">
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
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {event.professor}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Tente ajustar seus filtros ou adicione um novo evento.
            </p>
            <Button onClick={() => setShowAddEvent(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
