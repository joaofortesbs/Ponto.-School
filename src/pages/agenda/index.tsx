import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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
} from "lucide-react";

// Mock components (replace with actual UI components)
const PendingTasks = ({ tasks }: any) => {
  return (
    <div className="bg-[#001427] shadow-xl border-[#29335C]/10">
      <div>Pending Tasks</div>
    </div>
  );
};
const Notifications = ({ notifications }: any) => {
  return (
    <div className="bg-[#001427] shadow-xl border-[#29335C]/10">
      <div>Notifications</div>
    </div>
  );
};

const EmptyStateView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400 mb-4">
        Bem-vindo!
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        Comece a organizar sua vida acadêmica.
      </p>
      <Button className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]">
        Começar
      </Button>
    </div>
  );
};

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
  const [isNewUser, setIsNewUser] = useState(true);

  // Modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showEpictusAIModal, setShowEpictusAIModal] = useState(false);
  const [showEpictusCalendarModal, setShowEpictusCalendarModal] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
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

  // Sample event data for calendar
  const [eventData, setEventData] = useState<Record<number, any[]>>({
    3: [
      {
        id: "1",
        type: "aula",
        title: "Aula de Matemática",
        time: "10:00",
        color: "blue",
        description:
          "Estudo de funções trigonométricas e suas aplicações em problemas práticos",
        professor: "Prof. Carlos Santos",
        location: "Sala Virtual 3",
        status: "confirmado",
        discipline: "Matemática",
        materials: ["Slides da aula", "Exercícios"],
        participants: ["João Silva", "Maria Oliveira", "Pedro Santos"],
        isOnline: true,
      },
    ],
    8: [
      {
        id: "2",
        type: "trabalho",
        title: "Entrega de Trabalho de Química",
        time: "14:00",
        color: "amber",
        description: "Relatório sobre experimentos de titulação",
        professor: "Profa. Ana Martins",
        status: "pendente",
        discipline: "Química",
        dueDate: "2023-07-08T14:00:00",
        progress: 30,
      },
    ],
    15: [
      {
        id: "3",
        type: "aula",
        title: "Aula de Matemática",
        time: "10:00",
        color: "blue",
        description: "Continuação do estudo de funções trigonométricas",
        professor: "Prof. Carlos Santos",
        location: "Sala Virtual 3",
        status: "confirmado",
        discipline: "Matemática",
        isOnline: true,
      },
      {
        id: "4",
        type: "trabalho",
        title: "Entrega de Trabalho",
        time: "14:00",
        color: "amber",
        description: "Análise de dados experimentais",
        professor: "Prof. Roberto Alves",
        status: "pendente",
        discipline: "Física",
        dueDate: "2023-07-15T14:00:00",
        progress: 50,
      },
    ],
    22: [
      {
        id: "5",
        type: "prova",
        title: "Prova de Física",
        time: "14:00",
        color: "red",
        description: "Avaliação sobre Mecânica Quântica",
        professor: "Prof. Roberto Alves",
        location: "Sala 302",
        status: "confirmado",
        discipline: "Física",
        duration: "2 horas",
        isOnline: false,
      },
    ],
    27: [
      {
        id: "6",
        type: "reuniao",
        title: "Grupo de Estudos - Biologia Molecular",
        time: "15:30",
        color: "purple",
        description: "Discussão sobre o projeto de Biologia Molecular",
        location: "Sala Virtual 5",
        status: "confirmado",
        discipline: "Biologia",
        studyGroup: "Grupo de Biologia Molecular",
        participants: [
          "João Silva",
          "Maria Oliveira",
          "Pedro Santos",
          "Ana Costa",
        ],
        isOnline: true,
      },
    ],
  });

  // Sample upcoming events data
  const upcomingEventsData = [
    {
      id: "1",
      type: "prova",
      title: "Prova de Física",
      day: "Amanhã, 14:00 - 16:00",
      discipline: "Física",
      location: "Sala 302",
      isOnline: false,
    },
    {
      id: "2",
      type: "trabalho",
      title: "Entrega de Trabalho de Química",
      day: "Em 2 dias, até 23:59",
      discipline: "Química",
      isOnline: true,
    },
    {
      id: "3",
      type: "reuniao",
      title: "Grupo de Estudos - Biologia Molecular",
      day: "Quinta, 15:30 - 17:00",
      discipline: "Biologia",
      isOnline: true,
    },
  ];

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
  const handleAddEvent = (newEvent: any) => {
    if (newEvent.startDate) {
      const day = new Date(newEvent.startDate).getDate();

      // Add color based on event type
      const eventWithColor = {
        ...newEvent,
        color: getEventColor(newEvent.type),
        time: newEvent.startTime || "00:00",
      };

      // Add the event to the eventData state
      const updatedEvents = { ...eventData };
      if (updatedEvents[day]) {
        updatedEvents[day] = [...updatedEvents[day], eventWithColor];
      } else {
        updatedEvents[day] = [eventWithColor];
      }

      setEventData(updatedEvents);
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