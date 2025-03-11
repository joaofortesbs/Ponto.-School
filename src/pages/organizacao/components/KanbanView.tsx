import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event, eventTypeColors } from "../types";
import EventTypeIcon from "./EventTypeIcon";
import { Clock, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

interface KanbanViewProps {
  events: Event[];
  setSelectedEvent: (event: Event) => void;
  setShowEventDetails: (show: boolean) => void;
  setShowAddEvent: (show: boolean) => void;
  onDeleteEvent: (id: string) => void;
}

export default function KanbanView({
  events,
  setSelectedEvent,
  setShowEventDetails,
  setShowAddEvent,
  onDeleteEvent,
}: KanbanViewProps) {
  // Filtrar eventos por status
  const pendingEvents = events.filter((event) => event.status === "pendente");
  const inProgressEvents = events.filter(
    (event) => event.status === "em_andamento",
  );
  const completedEvents = events.filter(
    (event) => event.status === "confirmado",
  );

  // Função para atualizar o status de um evento (drag and drop)
  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const event = events.find((event) => event.id === id);
    if (event) {
      setSelectedEvent({
        ...event,
        status: newStatus as
          | "pendente"
          | "em_andamento"
          | "confirmado"
          | "cancelado",
      });
      setShowAddEvent(true);
    }
  };

  return (
    <div className="border border-[#778DA9]/30 dark:border-[#778DA9]/20 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 p-4 border-b border-[#778DA9]/20 flex justify-between items-center">
        <h3 className="font-semibold font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
          Kanban
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10"
            onClick={() => {
              setSelectedEvent({
                id: "",
                title: "",
                type: "evento",
                start: new Date(),
                end: new Date(new Date().setHours(new Date().getHours() + 1)),
                isOnline: false,
                status: "pendente",
              });
              setShowAddEvent(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Coluna
          </Button>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#29335C]/10 overflow-x-auto">
        <div className="flex gap-4" style={{ minWidth: "900px" }}>
          {/* Coluna: A Fazer */}
          <div className="flex-1 min-w-[300px]">
            <div className="bg-[#778DA9]/10 dark:bg-[#29335C]/30 p-3 rounded-t-lg">
              <h4 className="font-medium font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
                A Fazer
              </h4>
            </div>
            <div
              className="border border-[#778DA9]/20 dark:border-[#778DA9]/10 rounded-b-lg p-2 min-h-[400px] bg-white dark:bg-[#29335C]/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "pendente")}
            >
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="mb-2 p-3 bg-white dark:bg-[#29335C]/20 border border-[#778DA9]/20 dark:border-[#778DA9]/10 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", event.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text}`}
                    >
                      {event.type === "aula_ao_vivo"
                        ? "Aula ao Vivo"
                        : event.type === "aula_gravada"
                          ? "Aula Gravada"
                          : event.type === "grupo_estudo"
                            ? "Grupo de Estudos"
                            : event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                    </Badge>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-[#778DA9]/10"
                        >
                          <MoreHorizontal className="h-4 w-4 text-[#778DA9]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none h-9 px-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              setShowAddEvent(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none h-9 px-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <h5 className="font-medium mb-1 font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
                    {event.title}
                  </h5>
                  {event.description && (
                    <p className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(event.start, "d MMM, HH:mm", { locale: ptBR })}
                    </div>
                    {event.subject && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#778DA9]/30 text-[#778DA9]"
                      >
                        {event.subject}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {pendingEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[#29335C]/50 dark:text-[#E0E1DD]/50">
                  <div className="w-10 h-10 rounded-full bg-[#778DA9]/10 dark:bg-[#29335C]/30 flex items-center justify-center mb-2">
                    <Plus className="h-5 w-5 text-[#778DA9]" />
                  </div>
                  <p>Nenhum evento pendente</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna: Em Andamento */}
          <div className="flex-1 min-w-[300px]">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-t-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 font-montserrat">
                Em Andamento
              </h4>
            </div>
            <div
              className="border border-[#778DA9]/20 dark:border-[#778DA9]/10 rounded-b-lg p-2 min-h-[400px] bg-white dark:bg-[#29335C]/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "em_andamento")}
            >
              {inProgressEvents.map((event) => (
                <div
                  key={event.id}
                  className="mb-2 p-3 bg-white dark:bg-[#29335C]/20 border border-[#778DA9]/20 dark:border-[#778DA9]/10 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", event.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text}`}
                    >
                      {event.type === "aula_ao_vivo"
                        ? "Aula ao Vivo"
                        : event.type === "aula_gravada"
                          ? "Aula Gravada"
                          : event.type === "grupo_estudo"
                            ? "Grupo de Estudos"
                            : event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                    </Badge>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-[#778DA9]/10"
                        >
                          <MoreHorizontal className="h-4 w-4 text-[#778DA9]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none h-9 px-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              setShowAddEvent(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none h-9 px-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <h5 className="font-medium mb-1 font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
                    {event.title}
                  </h5>
                  {event.description && (
                    <p className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(event.start, "d MMM, HH:mm", { locale: ptBR })}
                    </div>
                    {event.subject && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#778DA9]/30 text-[#778DA9]"
                      >
                        {event.subject}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {inProgressEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[#29335C]/50 dark:text-[#E0E1DD]/50">
                  <div className="w-10 h-10 rounded-full bg-[#778DA9]/10 dark:bg-[#29335C]/30 flex items-center justify-center mb-2">
                    <Plus className="h-5 w-5 text-[#778DA9]" />
                  </div>
                  <p>Nenhum evento em andamento</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna: Concluído */}
          <div className="flex-1 min-w-[300px]">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-t-lg">
              <h4 className="font-medium text-green-800 dark:text-green-300 font-montserrat">
                Concluído
              </h4>
            </div>
            <div
              className="border border-[#778DA9]/20 dark:border-[#778DA9]/10 rounded-b-lg p-2 min-h-[400px] bg-white dark:bg-[#29335C]/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "confirmado")}
            >
              {completedEvents.map((event) => (
                <div
                  key={event.id}
                  className="mb-2 p-3 bg-white dark:bg-[#29335C]/20 border border-[#778DA9]/20 dark:border-[#778DA9]/10 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetails(true);
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", event.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text}`}
                    >
                      {event.type === "aula_ao_vivo"
                        ? "Aula ao Vivo"
                        : event.type === "aula_gravada"
                          ? "Aula Gravada"
                          : event.type === "grupo_estudo"
                            ? "Grupo de Estudos"
                            : event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                    </Badge>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-[#778DA9]/10"
                        >
                          <MoreHorizontal className="h-4 w-4 text-[#778DA9]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none h-9 px-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              setShowAddEvent(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none h-9 px-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <h5 className="font-medium mb-1 font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
                    {event.title}
                  </h5>
                  {event.description && (
                    <p className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(event.start, "d MMM, HH:mm", { locale: ptBR })}
                    </div>
                    {event.subject && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#778DA9]/30 text-[#778DA9]"
                      >
                        {event.subject}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {completedEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[#29335C]/50 dark:text-[#E0E1DD]/50">
                  <div className="w-10 h-10 rounded-full bg-[#778DA9]/10 dark:bg-[#29335C]/30 flex items-center justify-center mb-2">
                    <Plus className="h-5 w-5 text-[#778DA9]" />
                  </div>
                  <p>Nenhum evento concluído</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
