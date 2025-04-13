
/**
 * Utility functions for styling and visual formatting
 */

/**
 * Get CSS class for priority level
 */
export const getPriorityColor = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "alta":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "media":
    case "média":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "baixa":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

/**
 * Get comparative icon class/type
 */
export const getComparativeStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "acima":
      return { 
        class: "text-green-500 rotate-[-45deg]",
        direction: "up"
      };
    case "abaixo":
      return { 
        class: "text-red-500 rotate-45",
        direction: "down"
      };
    case "na media":
      return { 
        class: "text-amber-500 rotate-0",
        direction: "same"
      };
    default:
      return { 
        class: "text-gray-500",
        direction: "neutral"
      };
  }
};

/**
 * Get event type icon name
 */
export const getEventTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "aula":
      return "Video";
    case "tarefa":
      return "FileText";
    case "discussao":
    case "discussão":
      return "MessageCircle";
    case "avaliacao":
    case "avaliação":
      return "FileQuestion";
    default:
      return "Calendar";
  }
};
