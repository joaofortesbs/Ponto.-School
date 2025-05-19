import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, CheckSquare, Plus, ExternalLink, Settings } from "lucide-react";
import AddTaskModal from "../modals/add-task-modal";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  subject: string;
  completed: boolean;
  priority?: "alta" | "media" | "baixa";
}

// Sem tarefas padrão/fictícias - vamos iniciar com uma lista vazia
const defaultTasks: Task[] = [];

const TarefasPendentes = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"pendentes" | "hoje" | "semana">("pendentes");
  
  // Log para monitorar o estado das tarefas ao iniciar o componente
  React.useEffect(() => {
    console.log("TarefasPendentes inicializado com tarefas:", tasks);
  }, []);

  // Referência para o elemento DOM do componente
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  // Escuta por eventos externos de adição de tarefas
  React.useEffect(() => {
    // Função para manipular eventos de adição de tarefas
    const handleExternalTaskAddition = (event: CustomEvent) => {
      if (event.detail) {
        console.log("TarefasPendentes: Evento de tarefa adicionada recebido:", event.detail);
        // Prevenir possível duplicação ao processar o mesmo evento múltiplas vezes
        if (!event.defaultPrevented) {
          handleAddTask(event.detail);
          // Não marcar como preventDefault para permitir que outros componentes também processem
        }
      }
    };

    // Adiciona o event listener no window
    window.addEventListener('task-added' as any, handleExternalTaskAddition);
    
    // Adiciona o event listener diretamente ao componente atual usando a ref
    if (cardRef.current) {
      cardRef.current.addEventListener('task-added' as any, handleExternalTaskAddition);
      console.log("TarefasPendentes: Listener adicionado ao elemento do card");
    }
    
    // Referência ao elemento com data-attribute para redundância
    const currentElement = document.querySelector('[data-tasks-container="true"]');
    if (currentElement && currentElement !== cardRef.current) {
      currentElement.addEventListener('task-added' as any, handleExternalTaskAddition);
      console.log("TarefasPendentes: Listener adicionado ao elemento com data-attribute");
    }

    // Log para confirmar que o listener está ativo
    console.log("TarefasPendentes: Listener de eventos de tarefas configurado");

    // Limpa o event listener quando o componente é desmontado
    return () => {
      window.removeEventListener('task-added' as any, handleExternalTaskAddition);
      
      if (cardRef.current) {
        cardRef.current.removeEventListener('task-added' as any, handleExternalTaskAddition);
      }
      
      if (currentElement && currentElement !== cardRef.current) {
        currentElement.removeEventListener('task-added' as any, handleExternalTaskAddition);
      }
    };
  }, []);

  const handleAddTask = (newTask: any) => {
    console.log("TarefasPendentes: Processando nova tarefa:", newTask);
    
    if (!newTask.title) {
      console.warn("TarefasPendentes: Tarefa sem título recebida, ignorando");
      return;
    }
    
    // Format the due date for display
    let dueDateDisplay = "";
    if (newTask.dueDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Converter a data se for uma string ISO
      let dueDate;
      try {
        dueDate = new Date(newTask.dueDate);
        
        // Verificar se a data é válida
        if (isNaN(dueDate.getTime())) {
          console.warn("TarefasPendentes: Data inválida, usando data atual como fallback");
          dueDate = today;
        }
      } catch (error) {
        console.error("TarefasPendentes: Erro ao processar data de vencimento:", error);
        dueDate = today; // Fallback para hoje em caso de erro
      }

      if (dueDate.toDateString() === today.toDateString()) {
        dueDateDisplay = `hoje, ${newTask.startTime || "23:59"}`;
      } else if (dueDate.toDateString() === tomorrow.toDateString()) {
        dueDateDisplay = `amanhã, ${newTask.startTime || "23:59"}`;
      } else {
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        dueDateDisplay = `em ${diffDays} dias`;
      }
    }

    // Criar um ID confiável com base no timestamp ou usar o fornecido
    const taskId = newTask.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Verificar se já existe uma tarefa com o mesmo ID ou com título muito similar
    const existingTaskIndex = tasks.findIndex(task => 
      task.id === taskId || 
      (task.title === newTask.title && 
       (task.subject === newTask.discipline || task.subject === newTask.subject))
    );
    
    const task: Task = {
      id: taskId,
      title: newTask.title,
      dueDate: dueDateDisplay || (typeof newTask.dueDate === 'string' 
        ? newTask.dueDate.includes('T') 
          ? newTask.dueDate.split("T")[0] 
          : newTask.dueDate 
        : new Date().toISOString().split("T")[0]),
      subject: newTask.discipline || newTask.subject || "Geral",
      completed: Boolean(newTask.completed),
      priority: (newTask.priority || "media").toLowerCase(),
    };

    console.log("TarefasPendentes: Tarefa formatada para exibição:", task);
    
    // Usar função de atualização de estado que não depende do estado anterior
    // para garantir que sempre teremos o estado mais atual
    setTasks(prevTasks => {
      // Se já existe uma tarefa com esse ID ou similar, atualiza em vez de adicionar
      if (existingTaskIndex >= 0) {
        const updatedTasks = [...prevTasks];
        updatedTasks[existingTaskIndex] = task;
        console.log("TarefasPendentes: Tarefa atualizada com sucesso, novo estado:", updatedTasks);
        return updatedTasks;
      } else {
        // Adiciona a nova tarefa ao início da lista para maior visibilidade
        const newTasks = [task, ...prevTasks];
        console.log("TarefasPendentes: Nova tarefa adicionada com sucesso, novo estado:", newTasks);
        return newTasks;
      }
    });
    
    // Verificar se a adição funcionou após um curto delay e tentar novamente se necessário
    setTimeout(() => {
      setTasks(prevTasks => {
        const taskExists = prevTasks.some(t => 
          t.id === taskId || 
          (t.title === newTask.title && 
           (t.subject === newTask.discipline || t.subject === newTask.subject))
        );
        
        if (!taskExists) {
          console.log("TarefasPendentes: Adição da tarefa não foi detectada, adicionando novamente...");
          return [task, ...prevTasks];
        }
        return prevTasks;
      });
    }, 300);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Função auxiliar para verificar se uma data está na semana atual
  const isDateInCurrentWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Função auxiliar para verificar se uma data é hoje
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const priorityColors = {
    alta: "bg-red-500/10 text-red-500 border-red-500/30",
    media: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    baixa: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
        <CheckSquare className="h-8 w-8 text-[#FF6B00]" />
      </div>
      <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
        Sem tarefas pendentes
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-[280px]">
        Adicione novas tarefas utilizando o botão abaixo ou através da mini-seção de Tarefas.
      </p>
      <Button
        onClick={() => setIsAddTaskModalOpen(true)}
        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
      >
        <Plus className="h-4 w-4 mr-2" /> Adicionar Tarefa
      </Button>
    </div>
  );

  const MainContent = () => (
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Título removido do CardHeader */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-2 pb-4">
            {tasks
              .filter((task) => {
                // Filtra com base no modo de visualização selecionado
                if (!task.completed) {
                  if (viewMode === "pendentes") {
                    return true;
                  }
                  if (viewMode === "hoje") {
                    if (typeof task.dueDate === 'string') {
                      if (task.dueDate.includes('hoje')) return true;
                      if (task.dueDate.includes('-')) return isToday(task.dueDate);
                    }
                    return false;
                  }
                  if (viewMode === "semana") {
                    if (typeof task.dueDate === 'string') {
                      if (task.dueDate.includes('hoje') || task.dueDate.includes('amanhã')) return true;
                      if (task.dueDate.includes('em ') && parseInt(task.dueDate.split(' ')[1]) <= 7) return true;
                      if (task.dueDate.includes('-')) return isDateInCurrentWeek(task.dueDate);
                    }
                    return false;
                  }
                }
                return false;
              })
              .map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {task.title}
                        </label>
                        {task.priority && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              priorityColors[task.priority as keyof typeof priorityColors]
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> 
                          {typeof task.dueDate === 'string' && task.dueDate.includes('-') 
                            ? new Date(task.dueDate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})
                            : task.dueDate}
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          {task.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>

        {/* Ver todas as tarefas */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={() => window.location.href = "/agenda?view=tasks"}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Ver todas as tarefas
          </Button>
        </div>
      </CardContent>
    </>
  );

  return (
    <Card 
      ref={cardRef}
      data-tasks-container="true" 
      data-pending-tasks="true" 
      className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl"
    >
      {/* Título dentro do card com o mesmo estilo do TempoEstudo */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Tarefas Pendentes</h3>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "pendentes" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("pendentes")}
          >
            Pendentes
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "hoje" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("hoje")}
          >
            Hoje
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "semana" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("semana")}
          >
            Semana
          </span>
          <button className="p-1 rounded-full hover:bg-white/30 transition-colors" onClick={() => setIsAddTaskModalOpen(true)}>
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState />
      ) : tasks.filter((task) => {
          // Verificar se existem tarefas para o modo de visualização atual
          if (!task.completed) {
            if (viewMode === "pendentes") {
              return true;
            }
            if (viewMode === "hoje") {
              if (typeof task.dueDate === 'string') {
                if (task.dueDate.includes('hoje')) return true;
                if (task.dueDate.includes('-')) return isToday(task.dueDate);
              }
              return false;
            }
            if (viewMode === "semana") {
              if (typeof task.dueDate === 'string') {
                if (task.dueDate.includes('hoje') || task.dueDate.includes('amanhã')) return true;
                if (task.dueDate.includes('em ') && parseInt(task.dueDate.split(' ')[1]) <= 7) return true;
                if (task.dueDate.includes('-')) return isDateInCurrentWeek(task.dueDate);
              }
              return false;
            }
          }
          return false;
        }).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Nenhuma tarefa para {viewMode === "pendentes" ? "mostrar" : viewMode === "hoje" ? "hoje" : "esta semana"}.
            </p>
            <Button
              onClick={() => setIsAddTaskModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
        ) : (
          <MainContent />
        )}

      <AddTaskModal
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        onAddTask={handleAddTask}
      />
    </Card>
  );
};

export default TarefasPendentes;