
import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  subject: string;
  completed: boolean;
  priority?: "alta" | "media" | "baixa";
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleTaskCompletion: (taskId: string) => void;
  getTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  addTask: (task: Task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  toggleTaskCompletion: (taskId: string) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
  })),
  getTasks: () => get().tasks,
}));

// Inicialização do serviço
let isInitialized = false;

export const initTaskService = () => {
  if (isInitialized) return;

  try {
    const storedTasks = localStorage.getItem('sharedTasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      if (Array.isArray(parsedTasks)) {
        useTaskStore.setState({ tasks: parsedTasks });
      } else {
        useTaskStore.setState({ tasks: [] });
        localStorage.setItem('sharedTasks', JSON.stringify([]));
      }
    } else {
      // Garante que tasks seja inicializado como um array vazio
      useTaskStore.setState({ tasks: [] });
      localStorage.setItem('sharedTasks', JSON.stringify([]));
    }
    isInitialized = true;
    console.log('Serviço de tarefas inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o serviço de tarefas:', error);
    // Reinicializa para garantir um estado consistente
    useTaskStore.setState({ tasks: [] });
    localStorage.setItem('sharedTasks', JSON.stringify([]));
    isInitialized = true;
  }
};

// Inicializar automaticamente ao importar
initTaskService();
