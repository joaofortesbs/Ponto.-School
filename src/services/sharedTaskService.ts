
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
