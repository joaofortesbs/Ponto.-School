import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Video,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  ListTodo,
  CalendarDays,
  Trash2,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TaskType = "homework" | "exam" | "study" | "class";

interface ClassSession {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  duration: string;
  isOnline: boolean;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  type: TaskType;
}

interface UpcomingClassesCardProps {
  classes?: ClassSession[];
}

const defaultClasses: ClassSession[] = [
  {
    id: "1",
    subject: "Matemática Avançada",
    teacher: "Prof. Carlos Santos",
    time: "14:00",
    duration: "15:30",
    isOnline: true,
  },
  {
    id: "2",
    subject: "Entrega de Exercícios",
    teacher: "Plataforma",
    time: "23:59",
    duration: "23:59",
    isOnline: false,
  },
  {
    id: "3",
    subject: "Grupo de Estudos",
    teacher: "Sala Virtual 3",
    time: "16:00",
    duration: "17:30",
    isOnline: true,
  },
];

const taskTypeConfig = {
  homework: {
    icon: <BookOpen className="h-5 w-5" />,
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    label: "Exercícios",
  },
  exam: {
    icon: <GraduationCap className="h-5 w-5" />,
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    label: "Prova",
  },
  study: {
    icon: <ListTodo className="h-5 w-5" />,
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    label: "Estudo",
  },
  class: {
    icon: <Video className="h-5 w-5" />,
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    label: "Aula",
  },
};

const UpcomingClassesCard = ({
  classes = defaultClasses,
}: UpcomingClassesCardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<{
    title: string;
    dueDate: string;
    type: TaskType;
  }>({
    title: "",
    dueDate: "",
    type: "homework",
  });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Segunda-feira como padrão
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [weekDays, setWeekDays] =
    useState<Array<{ day: string; date: number; month: string }>>();
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const days = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        days.push({
          day: currentDate
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .slice(0, 3),
          date: currentDate.getDate(),
          month: currentDate
            .toLocaleDateString("pt-BR", { month: "short" })
            .slice(0, 3),
        });
      }

      setWeekDays(days);
      setSelectedDay(0);
    }
  }, [dateRange]);

  const handleAddTask = () => {
    if (newTask.title && newTask.dueDate) {
      setTasks([
        ...tasks,
        { ...newTask, id: Date.now().toString(), completed: false },
      ]);
      setNewTask({ title: "", dueDate: "", type: "homework" });
      setIsAddTaskOpen(false);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    if (!dateRange.start || !dateRange.end) return true;
    const taskDate = new Date(task.dueDate);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return taskDate >= startDate && taskDate <= endDate;
  });

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return "Selecione um período";
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return `${start.getDate()} ${start.toLocaleDateString("pt-BR", { month: "short" }).slice(0, 3)}. - ${end.getDate()} ${end.toLocaleDateString("pt-BR", { month: "short" }).slice(0, 3)}.`;
  };

  const defaultWeekDays = [
    { day: "Dom", date: 11 },
    { day: "Seg", date: 12 },
    { day: "Ter", date: 13 },
    { day: "Qua", date: 14 },
    { day: "Qui", date: 15 },
    { day: "Sex", date: 16 },
    { day: "Sáb", date: 17 },
  ];

  const displayWeekDays = weekDays || defaultWeekDays;

  return (
    <Card className="w-full h-full bg-white dark:bg-[#0A2540] border-border font-body">
      <CardHeader className="p-6 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-primary/10">
            <CalendarDays className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-black dark:text-white">
              Agenda da semana
            </h3>
            <p className="text-sm text-brand-muted dark:text-white/60">
              Gerencie suas atividades
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/calendar", "_blank")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Calendário
          </Button>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-brand-primary hover:bg-brand-primary/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Título da tarefa"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
                <Select
                  value={newTask.type}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, type: value as TaskType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {taskTypeConfig[newTask.type].label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(taskTypeConfig) as TaskType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <span className={taskTypeConfig[type].textColor}>
                            {taskTypeConfig[type].icon}
                          </span>
                          {taskTypeConfig[type].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                />
                <Button
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                  onClick={handleAddTask}
                >
                  Adicionar Tarefa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="schedule" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">
              <ListTodo className="h-4 w-4 mr-2" /> Tarefas
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/5">
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[300px] justify-start text-left font-normal ${!dateRange.start && "text-muted-foreground"}`}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="grid gap-2">
                      <Input
                        id="start"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                      />
                      <Input
                        id="end"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setIsDateRangeOpen(false);
                    }}
                  >
                    Aplicar Filtro
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/5">
            {displayWeekDays.map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`h-14 w-14 flex flex-col items-center justify-center gap-1 rounded-lg ${index === selectedDay ? "bg-brand-primary/10 text-brand-primary" : ""}`}
                onClick={() => setSelectedDay(index)}
              >
                <span className="text-xs text-muted-foreground">{day.day}</span>
                <span className="text-sm font-semibold">{day.date}</span>
                {index === selectedDay && (
                  <div className="w-2 h-2 rounded-full bg-brand-primary mt-1" />
                )}
              </Button>
            ))}
          </div>

          <TabsContent value="schedule" className="mt-0">
            <ScrollArea className="h-[264px]">
              <div className="px-6 py-4 space-y-4">
                {classes.map((session) => (
                  <div
                    key={session.id}
                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/5 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                      {session.isOnline ? (
                        <Video className="h-5 w-5 text-brand-primary" />
                      ) : (
                        <Calendar className="h-5 w-5 text-brand-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-brand-black dark:text-white truncate group-hover:text-brand-primary transition-colors">
                        {session.subject}
                      </h4>
                      <p className="text-sm text-brand-muted dark:text-white/60 truncate">
                        {session.teacher}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/5">
                      <Clock className="h-4 w-4 text-brand-muted dark:text-white/40" />
                      <span className="text-sm text-brand-muted dark:text-white/60 whitespace-nowrap">
                        {session.time} - {session.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <ScrollArea className="h-[264px]">
              <div className="px-6 py-4 space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma tarefa encontrada neste período
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/5 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${task.completed ? "bg-green-500/10" : taskTypeConfig[task.type].bgColor}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <span className={taskTypeConfig[task.type].textColor}>
                            {taskTypeConfig[task.type].icon}
                          </span>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-semibold truncate ${task.completed ? "line-through text-muted-foreground" : "text-brand-black dark:text-white group-hover:text-brand-primary"}`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-sm text-brand-muted dark:text-white/60 truncate">
                          {taskTypeConfig[task.type].label} • Vence em:{" "}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UpcomingClassesCard;
