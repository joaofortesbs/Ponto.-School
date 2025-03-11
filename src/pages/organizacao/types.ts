// Tipos de eventos
export type EventType =
  | "aula_ao_vivo"
  | "aula_gravada"
  | "tarefa"
  | "prova"
  | "trabalho"
  | "evento"
  | "plantao"
  | "grupo_estudo"
  | "desafio";

// Cores para os tipos de eventos
export const eventTypeColors: Record<EventType, { bg: string; text: string }> =
  {
    aula_ao_vivo: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-800 dark:text-blue-300",
    },
    aula_gravada: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-800 dark:text-purple-300",
    },
    tarefa: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-800 dark:text-amber-300",
    },
    prova: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
    },
    trabalho: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
    },
    evento: {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      text: "text-indigo-800 dark:text-indigo-300",
    },
    plantao: {
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
      text: "text-cyan-800 dark:text-cyan-300",
    },
    grupo_estudo: {
      bg: "bg-teal-100 dark:bg-teal-900/30",
      text: "text-teal-800 dark:text-teal-300",
    },
    desafio: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-800 dark:text-orange-300",
    },
  };

// Interface para eventos
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  start: Date;
  end: Date;
  subject?: string;
  professor?: string;
  isOnline: boolean;
  location?: string;
  link?: string;
  status?: "confirmado" | "pendente" | "cancelado" | "em_andamento";
  color?: string;
}
