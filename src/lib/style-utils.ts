
/**
 * Utilitários para manipulação de estilos e classes CSS
 */
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes utilizando clsx e tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Obtém a cor específica para um determinado tipo de tarefa
 */
export function getTypeColor(type: string): string {
  const typeMap: Record<string, string> = {
    "exercício": "text-blue-500",
    "relatório": "text-amber-500",
    "estudo": "text-purple-500",
    "apresentação": "text-green-500",
    "leitura": "text-teal-500",
    "projeto": "text-yellow-500",
    "resumo": "text-indigo-500",
    "prova": "text-red-500",
    "laboratório": "text-pink-500",
  };
  
  return typeMap[type.toLowerCase()] || "text-gray-500";
}

/**
 * Obtém a cor de prioridade para tarefas
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "alta":
      return "border-l-red-500";
    case "média":
      return "border-l-yellow-500";
    case "baixa":
      return "border-l-green-500";
    default:
      return "border-l-gray-500";
  }
}

/**
 * Formata uma data para exibição amigável
 */
export function formatDueDate(dateString: string): string {
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday =
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear();

  const isTomorrow =
    dueDate.getDate() === tomorrow.getDate() &&
    dueDate.getMonth() === tomorrow.getMonth() &&
    dueDate.getFullYear() === tomorrow.getFullYear();

  if (isToday) {
    return `Hoje, ${dueDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (isTomorrow) {
    return `Amanhã, ${dueDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return (
      dueDate.toLocaleDateString() +
      ", " +
      dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
}
