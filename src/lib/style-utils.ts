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

/**
 * Utilitários para manipulação de estilos
 */

// Tipo para representar classes condicionais
type ConditionalClasses = Record<string, boolean>;

/**
 * Combina várias classes CSS, ignorando as falsas/nulas
 * @param classes - Array de strings ou objetos de classes condicionais
 * @returns String de classes CSS combinadas
 */
export function classNames(...classes: (string | ConditionalClasses | undefined | null | false)[]): string {
  const result: string[] = [];

  classes.forEach((item) => {
    if (!item) return;

    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      Object.entries(item).forEach(([className, condition]) => {
        if (condition) {
          result.push(className);
        }
      });
    }
  });

  return result.join(' ');
}

/**
 * Tipos de variantes para componentes
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ColorScheme = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';

/**
 * Gera classes CSS para um botão com base na variante
 * @param variant - Variante do botão
 * @returns Classes CSS correspondentes
 */
export function getButtonClasses(variant: ButtonVariant = 'primary', size: Size = 'md'): string {
  const baseClasses = "font-medium rounded focus:outline-none transition-colors";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };

  const sizeClasses: Record<Size, string> = {
    xs: "text-xs px-2 py-1",
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-2.5",
    xl: "text-xl px-6 py-3"
  };

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
}

export default {
  cn,
  getTypeColor,
  getPriorityColor,
  formatDueDate,
  classNames,
  getButtonClasses
};