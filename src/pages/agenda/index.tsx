import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Components
import MonthView from "@/components/agenda/calendar-views/month-view";
import WeekView from "@/components/agenda/calendar-views/week-view";
import DayView from "@/components/agenda/calendar-views/day-view";
import EpictusAIWidget from "@/components/agenda/cards/epictus-ai-widget";
import EpictusAIAssistantModal from "@/components/agenda/modals/epictus-ai-assistant-modal";
import EpictusAISuggestionsModal from "@/components/agenda/modals/epictus-ai-suggestions-modal";
import EpictusCalendar from "@/components/agenda/cards/epictus-calendar";
import AIMentor from "@/components/agenda/cards/ai-mentor";
import UpcomingEvents from "@/components/agenda/cards/upcoming-events";
import FlowView from "@/components/agenda/flow/FlowView";
import AddEventModal from "@/components/agenda/modals/add-event-modal";
import AddTaskModal from "@/components/agenda/modals/add-task-modal";
import EventDetailsModal from "@/components/agenda/modals/event-details-modal";
import TasksView from "@/components/agenda/tasks/TasksView";
import ChallengesView from "@/components/agenda/challenges/ChallengesView";

// Icons
import {
  Calendar as CalendarIcon,
  Home,
  CheckSquare,
  Bell,
  Target,
  Search,
  Plus,
  Video,
  FileEdit,
  AlertCircle,
  Users,
  Moon,
  Sun,
  Smartphone,
  Brain,
  Clock,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Trophy,
  Star,
  LineChart,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Play,
  FileText,
  Flag,
  PieChart,
  Sparkles,
  Lightbulb,
  Flame,
  Award,
  Zap,
  Hourglass,
  Coins,
  ClipboardList,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Info,
  ChevronLeft,
} from "lucide-react";

// Calendar Event Interface
interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

// Import Calendar Event service
import { getAllEvents } from "@/services/calendarEventService";

export default function AgendaPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view") || "visao-geral";
  const [activeTab, setActiveTab] = useState(viewParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [calendarView, setCalendarView] = useState("month");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState("semana"); // semana, mes, ano
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showEpictusAIModal, setShowEpictusAIModal] = useState(false);
  const [showEpictusCalendarModal, setShowEpictusCalendarModal] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showSetGoalModal, setShowSetGoalModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAISuggestionsModal, setShowAISuggestionsModal] = useState(false);
  const [tasksData, setTasksData] = useState([
    {
      id: "1",
      title: "Lista de Exercícios - Funções Trigonométricas",
      discipline: "Matemática",
      dueDate: "Vence hoje, 18:00",
      progress: 75,
      urgent: true,
      priority: "alta",
    },
    {
      id: "2",
      title: "Relatório de Experimento - Titulação",
      discipline: "Química",
      dueDate: "Vence em 2 dias",
      progress: 30,
      urgent: false,
      priority: "média",
    },
    {
      id: "3",
      title: "Preparação para Prova - Mecânica Quântica",
      discipline: "Física",
      dueDate: "Vence em 1 dia",
      progress: 10,
      urgent: true,
      priority: "alta",
    },
  ]);

  // Get current date for calendar
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Update URL when active tab changes
  useEffect(() => {
    setSearchParams({ view: activeTab });
  }, [activeTab, setSearchParams]);

  // Update active tab when URL changes
  useEffect(() => {
    if (viewParam) {
      setActiveTab(viewParam);
    }
  }, [viewParam]);

  // Dados de eventos para o calendário (vazio por padrão)
  const [eventData, setEventData] = useState<Record<number, any[]>>({});

  // Função para formatar eventos próximos a partir do eventData
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza a data atual para comparação
    const upcoming: any[] = [];

    // Verifica se eventData existe antes de processar
    if (eventData && typeof eventData === 'object') {
      // Percorre todos os dias com eventos
      Object.keys(eventData).forEach(day => {
        const dayEvents = eventData[parseInt(day)] || [];

        // Para cada evento nesse dia
        dayEvents.forEach(event => {
          if (event && event.startDate) {
            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0); // Normaliza a data do evento para comparação

            // Adiciona eventos que ocorrem hoje ou no futuro
            if (eventDate >= today) {
              // Formata a data com date-fns
              const formattedDate = format(eventDate, "dd/MM/yyyy", { locale: ptBR });

              upcoming.push({
                id: event.id,
                type: event.type,
                title: event.title,
                day: formattedDate,
                discipline: event.discipline || "Geral",
                isOnline: event.isOnline || false,
                color: event.color,
                details: event.details,
                startTime: event.startTime || event.time || "00:00",
                // Guardar a data original para ordenação
                originalDate: eventDate,
                originalTime: event.startTime || event.time || "00:00"
              });
            }
          }
        });
      });
    }

    // Ordena eventos cronologicamente (por data e hora)
    upcoming.sort((a, b) => {
      // Primeiro compara por data
      const dateComparison = a.originalDate.getTime() - b.originalDate.getTime();

      // Se for a mesma data, compara pelo horário
      if (dateComparison === 0) {
        const [hoursA, minutesA] = a.originalTime.split(':').map(Number);
        const [hoursB, minutesB] = b.originalTime.split(':').map(Number);

        // Compara horas
        if (hoursA !== hoursB) {
          return hoursA - hoursB;
        }

        // Se as horas forem iguais, compara minutos
        return minutesA - minutesB;
      }

      return dateComparison;
    });

    return upcoming;
  };

  // Array de eventos próximos atualizado a partir do eventData
  const upcomingEventsData = getUpcomingEvents();

  // Sample AI recommendations
  const aiRecommendations = [
    {
      id: "1",
      priority: "high",
      title: "Prioridade Alta: Você tem uma prova de Física amanhã",
      description:
        "Recomendo revisar os conceitos de Mecânica Quântica hoje à noite.",
      actions: [
        {
          label: "Ver Material",
          icon: <FileText className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
        },
        {
          label: "Criar Resumo",
          icon: <FileEdit className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
        },
      ],
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    {
      id: "2",
      priority: "medium",
      title: "Seu desempenho em Química caiu 15% na última semana",
      description: "Que tal revisar os conceitos de titulação?",
      actions: [
        {
          label: "Ver Desempenho",
          icon: <LineChart className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
        },
        {
          label: "Praticar Exercícios",
          icon: <CheckSquare className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
        },
      ],
      icon: <Flame className="h-5 w-5 text-amber-500" />,
    },
    {
      id: "3",
      priority: "low",
      title: "Você está com uma sequência de 7 dias de estudo!",
      description: "Continue assim para ganhar mais pontos de experiência.",
      actions: [
        {
          label: "Ver Conquistas",
          icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
        },
      ],
      icon: <Zap className="h-5 w-5 text-green-500" />,
    },
  ];

  // Sample study time data
  const studyTimeData = {
    total: 32,
    goal: 40,
    progress: 80, // 32/40 = 80%
    byDay: [
      { day: "Seg", hours: 5 },
      { day: "Ter", hours: 6 },
      { day: "Qua", hours: 4 },
      { day: "Qui", hours: 7 },
      { day: "Sex", hours: 5 },
      { day: "Sáb", hours: 3 },
      { day: "Dom", hours: 2 },
    ],
    bySubject: [
      { subject: "Matemática", hours: 10, color: "#FF6B00" },
      { subject: "Física", hours: 8, color: "#FF8C40" },
      { subject: "Química", hours: 6, color: "#E85D04" },
      { subject: "Biologia", hours: 5, color: "#DC2F02" },
      { subject: "História", hours: 3, color: "#9D0208" },
    ],
  };

  // Sample last accessed classes
  const lastAccessedClasses = [
    {
      id: "1",
      title: "Funções Trigonométricas",
      discipline: "Matemática",
      professor: "Prof. Carlos Santos",
      progress: 75,
      thumbnail:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=80",
      lastAccessed: "Hoje, 10:30",
    },
    {
      id: "2",
      title: "Mecânica Quântica - Introdução",
      discipline: "Física",
      professor: "Prof. Roberto Alves",
      progress: 45,
      thumbnail:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&q=80",
      lastAccessed: "Ontem, 15:20",
    },
    {
      id: "3",
      title: "Titulação e pH",
      discipline: "Química",
      professor: "Profa. Ana Martins",
      progress: 90,
      thumbnail:
        "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=300&q=80",
      lastAccessed: "2 dias atrás, 14:15",
    },
  ];

  // Sample ranking data
  const rankingData = {
    position: 42,
    total: 210,
    points: 3750,
    nextReward: 4000,
    progress: 75, // (3750/4000)*100 = 93.75%
    trend: "+5", // Subiu 5 posições
  };

  // Sample subject progress data
  const subjectProgressData = [
    { subject: "Matemática", progress: 85, goal: 90, color: "#FF6B00" },
    { subject: "Física", progress: 72, goal: 80, color: "#FF8C40" },
    { subject: "Química", progress: 65, goal: 75, color: "#E85D04" },
    { subject: "Biologia", progress: 90, goal: 85, color: "#DC2F02" },
    { subject: "História", progress: 78, goal: 80, color: "#9D0208" },
  ];

  // Sample today's events data
  const todayEventsData = [
    {
      id: "1",
      type: "aula",
      title: "Aula de Matemática",
      time: "10:00 - 11:30",
      status: "agora",
      discipline: "Matemática",
      isOnline: true,
    },
    {
      id: "2",
      type: "trabalho",
      title: "Entrega de Trabalho",
      time: "até 18:00",
      status: "pendente",
      discipline: "Química",
      isOnline: true,
    },
  ];

  // Get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-4 w-4" />;
      case "trabalho":
        return <FileEdit className="h-4 w-4" />;
      case "prova":
        return <AlertCircle className="h-4 w-4" />;
      case "reuniao":
        return <Users className="h-4 w-4" />;
      case "lembrete":
        return <Bell className="h-4 w-4" />;
      case "tarefa":
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Get event color based on type
  const getEventColor = (type: string) => {
    switch (type) {
      case "aula":
        return "blue";
      case "trabalho":
      case "tarefa":
        return "amber";
      case "prova":
        return "red";
      case "reuniao":
        return "green";
      case "lembrete":
        return "yellow";
      case "evento":
        return "purple";
      default:
        return "gray";
    }
  };

  // Get task icon based on type
  const getTaskIcon = (discipline: string) => {
    switch (discipline) {
      case "Matemática":
        return <span className="text-[#FF6B00] font-bold">π</span>;
      case "Física":
        return <span className="text-[#FF8C40] font-bold">⚛</span>;
      case "Química":
        return <span className="text-[#E85D04] font-bold">⚗</span>;
      case "Biologia":
        return <span className="text-[#DC2F02] font-bold">🧬</span>;
      case "História":
        return <span className="text-[#9D0208] font-bold">📜</span>;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "média":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agora":
        return <Badge className="bg-green-500 text-white">Agora</Badge>;
      case "pendente":
        return <Badge className="bg-amber-500 text-white">Pendente</Badge>;
      default:
        return null;
    }
  };

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      // Simulate search suggestions
      const suggestions = [
        "Aula de Matemática",
        "Prova de Física",
        "Grupo de Estudos",
        "Entrega de Trabalho",
        "Matemática",
        "Física",
        "Prof. Carlos Santos",
      ].filter((item) => item.toLowerCase().includes(query.toLowerCase()));

      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(suggestions.length > 0);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  // Open event details modal
  const openEventDetails = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  // Add new event
  const handleAddEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    try {
      // O evento já foi salvo no banco de dados pelo modal
      // Agora apenas atualizamos a interface
      const updatedEvents = await getAllEvents();
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Erro ao atualizar lista de eventos:", error);
    }
  };

  // Edit event
  const handleEditEvent = (editedEvent: any) => {
    const updatedEvents = { ...eventData };

    // Find the event in all days and update it
    let eventFound = false;

    Object.keys(updatedEvents).forEach((day) => {
      const dayNum = parseInt(day);
      const eventIndex = updatedEvents[dayNum].findIndex(
        (event) => event.id === editedEvent.id,
      );

      if (eventIndex !== -1) {
        // Update the event in place
        updatedEvents[dayNum][eventIndex] = {
          ...editedEvent,
          color: getEventColor(editedEvent.type),
          time: editedEvent.startTime || editedEvent.time || "00:00",
        };
        eventFound = true;
      }
    });

    // If the event wasn't found (rare case) or if the date changed
    if (!eventFound && editedEvent.startDate) {
      const newDay = new Date(editedEvent.startDate).getDate();
      handleDeleteEvent(editedEvent.id);

      // Add to the new day
      const eventWithColor = {
        ...editedEvent,
        color: getEventColor(editedEvent.type),
        time: editedEvent.startTime || "00:00",
      };

      if (updatedEvents[newDay]) {
        updatedEvents[newDay] = [...updatedEvents[newDay], eventWithColor];
      } else {
        updatedEvents[newDay] = [eventWithColor];
      }
    }

    setEventData(updatedEvents);

    // Exibe uma mensagem de sucesso
    toast({
      title: "Evento atualizado",
      description: "O evento foi atualizado com sucesso.",
    });
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = { ...eventData };

    // Find and remove the event
    Object.keys(updatedEvents).forEach((day) => {
      const dayNum = parseInt(day);
      updatedEvents[dayNum] = updatedEvents[dayNum].filter(
        (event) => event.id !== eventId,
      );

      // Remove the day if it has no events
      if (updatedEvents[dayNum].length === 0) {
        delete updatedEvents[dayNum];
      }
    });

    setEventData(updatedEvents);
  };

  // Handle event drag and drop
  const handleEventDrop = (event: any, newDay: number) => {
    // First, remove the event from its original day
    const updatedEvents = { ...eventData };
    let eventToMove = null;

    // Find and remove the event from its original day
    Object.keys(updatedEvents).forEach((day) => {
      const dayNum = parseInt(day);
      const eventIndex = updatedEvents[dayNum].findIndex(
        (e) => e.id === event.id,
      );

      if (eventIndex !== -1) {
        // Save the event before removing it
        eventToMove = { ...updatedEvents[dayNum][eventIndex] };

        // Remove the event from its original day
        updatedEvents[dayNum] = updatedEvents[dayNum].filter(
          (e) => e.id !== event.id,
        );

        // Remove the day if it has no events
        if (updatedEvents[dayNum].length === 0) {
          delete updatedEvents[dayNum];
        }
      }
    });

    // If we found the event, add it to the new day
    if (eventToMove) {
      // Update the event's date if it has one
      if (eventToMove.startDate) {
        const oldDate = new Date(eventToMove.startDate);
        const newDate = new Date(oldDate);
        newDate.setDate(newDay);
        eventToMove.startDate = newDate;

        // Also update endDate if it exists
        if (eventToMove.endDate) {
          const oldEndDate = new Date(eventToMove.endDate);
          const dayDiff = Math.round(
            (oldEndDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          const newEndDate = new Date(newDate);
          newEndDate.setDate(newDate.getDate() + dayDiff);
          eventToMove.endDate = newEndDate;
        }
      }

      // Add the event to the new day
      if (updatedEvents[newDay]) {
        updatedEvents[newDay] = [...updatedEvents[newDay], eventToMove];
      } else {
        updatedEvents[newDay] = [eventToMove];
      }

      setEventData(updatedEvents);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Handle subject filter change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  // Handle add task
  const handleAddTask = (newTask: any) => {
    try {
      if (!newTask || !newTask.title) {
        console.error("Invalid task data", newTask);
        return;
      }

      // First close modal to prevent UI freezing
      setShowAddTaskModal(false);

      setTimeout(() => {
        // Format the task for the dashboard view
        const formattedTask = {
          id: newTask.id || `task-${Date.now()}`,
          title: newTask.title,
          discipline: newTask.discipline || "Geral",
          dueDate: newTask.dueDate
            ? `Vence ${new Date(newTask.dueDate).toLocaleDateString("pt-BR")}`
            : "Sem data definida",
          progress: newTask.progress || 0,
          urgent: newTask.priority === "alta",
          priority: newTask.priority || "média",
        };

        // Update the tasks list in the dashboard
        setTasksData((prev) => [formattedTask, ...prev]);

        // Show success message
        toast({
          title: "Tarefa adicionada",
          description: "A nova tarefa foi adicionada com sucesso.",
        });

        // Refresh the tasks view
        setTimeout(() => {
          const tasksView = document.querySelector(
            '[data-testid="tasks-view"]',
          );
          if (tasksView) {
            const refreshEvent = new CustomEvent("refresh-tasks", {
              detail: newTask,
            });
            tasksView.dispatchEvent(refreshEvent);
          }
        }, 200); // Small delay to ensure DOM is ready
      }, 100);
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Ocorreu um erro ao adicionar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Calendar View
  const [view, setView] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    // Carregar eventos do banco de dados
    const loadEvents = async () => {
      try {
        const loadedEvents = await getAllEvents();
        setEvents(loadedEvents);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    };

    loadEvents();
    setView("month");
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Modals */}
      <EpictusAIAssistantModal
        open={showEpictusAIModal}
        onOpenChange={setShowEpictusAIModal}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
              Agenda
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm">
              Organize seus eventos, tarefas e compromissos acadêmicos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar eventos..."
              className="pl-9 w-[250px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            onClick={() => setShowAddEventModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-center items-center mb-6">
          <TabsList className="bg-[#29335C]/10 dark:bg-[#29335C]/30 p-2 rounded-xl shadow-md">
            <TabsTrigger
              value="visao-geral"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <Home className="h-5 w-5 mr-1" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <CalendarIcon className="h-5 w-5 mr-1" /> Calendário
            </TabsTrigger>
            <TabsTrigger
              value="flow"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <BookOpenCheck className="h-5 w-5 mr-1" /> Flow
            </TabsTrigger>
            <TabsTrigger
              value="tarefas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <CheckSquare className="h-5 w-5 mr-1" /> Tarefas
            </TabsTrigger>

            <TabsTrigger
              value="desafios"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <Target className="h-5 w-5 mr-1" /> Desafios
            </TabsTrigger>
            <TabsTrigger
              value="rotina"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <Clock className="h-5 w-5 mr-1" /> Rotina
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Visão Geral Tab */}
        <TabsContent value="visao-geral" className="mt-0">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Card 1: Eventos do Dia */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-slate-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Eventos de Hoje
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="space-y-3">
                  {todayEventsData.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-150 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
                      onClick={() => openEventDetails(event)}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          event.type === "aula"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {event.title}
                          </h4>
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {event.time}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {event.discipline}
                            </span>
                            {event.isOnline && (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    className="w-full h-8 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200"
                    variant="ghost"
                    onClick={() => setShowAddEventModal(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar evento
                  </Button>
                </div>
              </div>
            </div>
            {/* More cards would go here */}
          </div>

          {/* Add your other dashboard components here */}
        </TabsContent>

        {/* Calendário Tab */}
        <TabsContent value="calendario" className="mt-0">
          <DndProvider backend={HTML5Backend}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-slate-700 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-3/4">
                  {/* Calendar Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Calendário
                      </h2>
                      {/* Calendar View Toggle */}
                      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                        <Button
                          variant={calendarView === "month" ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 ${
                            calendarView === "month"
                              ? "bg-white dark:bg-slate-600 text-gray-800 dark:text-white shadow-sm"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setCalendarView("month")}
                        >
                          Mês
                        </Button>
                        <Button
                          variant={calendarView === "week" ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 ${
                            calendarView === "week"
                              ? "bg-white dark:bg-slate-600 text-gray-800 dark:text-white shadow-sm"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setCalendarView("week")}
                        >
                          Semana
                        </Button>
                        <Button
                          variant={calendarView === "day" ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 ${
                            calendarView === "day"
                              ? "bg-white dark:bg-slate-600 text-gray-800 dark:text-white shadow-sm"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setCalendarView("day")}
                        >
                          Dia
                        </Button>
                      </div>
                    </div>

                    {/* Month/Year Navigation */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <span className="text-sm font-medium mx-2 min-w-[100px] text-center text-gray-800 dark:text-white">
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-9 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200"
                        onClick={() => {
                          const today = new Date();
                          setSelectedDay(today);
                        }}
                      >
                        Hoje
                      </Button>
                    </div>
                  </div>

                  {/* Calendar View */}
                  <div className="calendar-container">
                    {calendarView === "month" && (
                      <MonthView
                        eventData={eventData}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                        onEventClick={openEventDetails}
                        onAddEvent={() => setShowAddEventModal(true)}
                        onEventDrop={handleEventDrop}
                      />
                    )}
                    {calendarView === "week" && (
                      <WeekView
                        eventData={eventData}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                        onEventClick={openEventDetails}
                        onAddEvent={() => setShowAddEventModal(true)}
                      />
                    )}
                    {calendarView === "day" && (
                      <DayView
                        eventData={eventData}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                        onEventClick={openEventDetails}
                        onAddEvent={() => setShowAddEventModal(true)}
                      />
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-1/4 mt-4 md:mt-0">
                  <div className="space-y-6">
                    {/* Mini month calendar */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                      <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        Próximos Eventos
                      </h3>
                      <UpcomingEvents
                        events={upcomingEventsData}
                        onEventClick={openEventDetails}
                        getEventIcon={getEventIcon}
                      />
                    </div>

                    {/* AI Mentor Widget */}
                    <AIMentor onAction={() => setShowEpictusAIModal(true)} />

                    {/* EpictusAI Widget */}
                    <EpictusAIWidget onAction={() => setShowEpictusAIModal(true)} />
                  </div>
                </div>
              </div>
            </div>
          </DndProvider>

          {/* Add Event Modal */}
          {showAddEventModal && (
            <AddEventModal
              open={showAddEventModal}
              onOpenChange={setShowAddEventModal}
              onSave={handleAddEvent}
              selectedDate={selectedDay || new Date()}
            />
          )}

          {/* Event Details Modal */}
          {showEventDetailsModal && selectedEvent && (
            <EventDetailsModal
              open={showEventDetailsModal}
              onOpenChange={setShowEventDetailsModal}
              event={selectedEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          )}
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="mt-0">
          <FlowView />
        </TabsContent>

        {/* Tarefas Tab */}
        <TabsContent value="tarefas" className="mt-0">
          <TasksView
            initialTasks={tasksData}
            showAddTaskModal={() => setShowAddTaskModal(true)}
          />
          {showAddTaskModal && (
            <AddTaskModal
              open={showAddTaskModal}
              onOpenChange={setShowAddTaskModal}
              onSave={handleAddTask}
            />
          )}
        </TabsContent>

        {/* Desafios Tab */}
        <TabsContent value="desafios" className="mt-0">
          <ChallengesView />
        </TabsContent>

        {/* Rotina Tab */}
        <TabsContent value="rotina" className="mt-0">
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
            <div className="max-w-md text-center">
              <Clock className="w-16 h-16 mx-auto mb-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                Rotina Inteligente
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Otimize seus horários de estudo com a ajuda da IA. Crie uma rotina
                personalizada baseada no seu perfil e objetivos.
              </p>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Criar Rotina Inteligente
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}