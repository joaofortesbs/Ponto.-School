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
            <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300 backdrop-blur-sm">
              <div className="p-3 border-b border-[#29335C]/30 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF8C40]/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Eventos do Dia
                    </h3>
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors px-2 py-0.5 text-xs">
                    0
                  </Badge>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#29335C]/40 flex items-center justify-center mb-3">
                  <CalendarIcon className="h-7 w-7 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Nenhum evento programado para hoje
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Adicione seus eventos para organizar sua rotina acadêmica
                </p>
                <Button
                  className="w-full mt-1 bg-[#FF6B00]/90 hover:bg-[#FF8C40] text-white rounded-lg transition-colors text-xs h-8"
                  onClick={() => setShowAddEventModal(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Evento
                </Button>
              </div>
            </div>

            {/* Card 2: Desempenho Semanal */}
            <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300 backdrop-blur-sm">
              <div className="p-3 border-b border-[#29335C]/30 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF8C40]/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Desempenho Semanal
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#29335C]/40 flex items-center justify-center mb-3">
                  <BarChart3 className="h-7 w-7 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Sem dados de desempenho
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Complete tarefas e atividades para visualizar seu progresso
                </p>
                <Button className="w-full mt-1 bg-[#FF6B00]/90 hover:bg-[#FF8C40] text-white rounded-lg transition-colors text-xs h-8">
                  <LineChart className="h-3.5 w-3.5 mr-1" /> Ver Detalhes
                </Button>
              </div>
            </div>

            {/* Card 3: Ranking */}
            <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300 backdrop-blur-sm">
              <div className="p-3 border-b border-[#29335C]/30 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF8C40]/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Ranking</h3>
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#29335C]/40 flex items-center justify-center mb-3">
                  <Trophy className="h-7 w-7 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Posição no Ranking: 0
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  0 pontos - Participe das atividades para subir no ranking
                </p>
                <Button className="w-full mt-1 bg-[#FF6B00]/90 hover:bg-[#FF8C40] text-white rounded-lg transition-colors text-xs h-8">
                  <Users className="h-3.5 w-3.5 mr-1" /> Ver Ranking
                </Button>
              </div>
            </div>

            {/* Card 4: Pontos */}
            <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300 backdrop-blur-sm">
              <div className="p-3 border-b border-[#29335C]/30 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF8C40]/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <Coins className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Pontos</h3>
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#29335C]/40 flex items-center justify-center mb-3">
                  <Coins className="h-7 w-7 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  0 pontos
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Complete desafios e tarefas para ganhar pontos e recompensas
                </p>
                <Button className="w-full mt-1 bg-[#FF6B00]/90 hover:bg-[#FF8C40] text-white rounded-lg transition-colors text-xs h-8">
                  <Award className="h-3.5 w-3.5 mr-1" /> Conquistas
                </Button>
              </div>
            </div>
          </div>

          {/* Eventos do Dia Card */}
          <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg mb-8 border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300">
            <div className="p-4 border-b border-[#29335C]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#FF6B00]" />
                  <h3 className="text-base font-bold text-white">
                    Eventos do Dia
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#29335C]/50 rounded-full"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#29335C]/30 flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Nenhum evento para hoje
              </h3>
              <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
                Comece a organizar sua agenda adicionando aulas, trabalhos, provas ou compromissos importantes
              </p>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg transition-all duration-300 shadow-md"
                onClick={() => setShowAddEventModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Study Time Card */}
              <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px]">
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Tempo de Estudo
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-white/10 rounded-lg p-0.5 flex text-xs">
                        <button
                          className={`px-2 py-0.5 ${timeRange === "semana" ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"} rounded-l-md`}
                          onClick={() => handleTimeRangeChange("semana")}
                        >
                          Semana
                        </button>
                        <button
                          className={`px-2 py-0.5 ${timeRange === "mes" ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"}`}
                          onClick={() => handleTimeRangeChange("mes")}
                        >
                          Mês
                        </button>
                        <button
                          className={`px-2 py-0.5 ${timeRange === "ano" ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"} rounded-r-md`}
                          onClick={() => handleTimeRangeChange("ano")}
                        >
                          Ano
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                        title="Definir Meta"
                        onClick={() => setShowSetGoalModal(true)}
                      >
                        <Target className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Weekly Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-white/60">
                          Progresso semanal
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          0/30h
                        </span>
                      </div>
                      <Progress
                        value={0}
                        className="h-2 bg-gray-100 dark:bg-gray-800"
                        indicatorClassName="bg-[#FF6B00]"
                      />
                    </div>

                    {/* Daily Study Graph */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                        Estudo diário
                      </h4>
                      <div className="grid grid-cols-7 gap-1 h-12">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-sm h-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {day}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subject Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                        Estudo por matéria
                      </h4>
                      {['Matemática', 'Física', 'Química', 'Biologia'].map((subject, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-white/60">
                              {subject}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              0h
                            </span>
                          </div>
                          <Progress
                            value={0}
                            className="h-1.5 bg-gray-100 dark:bg-gray-800"
                            indicatorClassName="bg-[#FF6B00]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Progress Card */}
              <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px]">
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                      <PieChart className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Progresso por Disciplina
                    </h3>
                  </div>
                </div>
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <PieChart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma disciplina registrada
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                    Adicione disciplinas e acompanhe seu progresso em cada uma delas
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-6 p-0 text-[#FF6B00] hover:text-[#FF8C40] transition-colors font-medium"
                  >
                    Definir Metas <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Pending Tasks */}
              <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px]">
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                      <CheckSquare className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Tarefas Pendentes
                    </h3>
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors px-3 py-1 font-medium">
                    0 tarefas
                  </Badge>
                </div>
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <CheckSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma tarefa pendente
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                    Adicione tarefas para organizar seus estudos e acompanhar seu progresso
                  </p>
                  <Button
                    size="sm"
                    className="h-9 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    onClick={() => setShowAddTaskModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Nova Tarefa
                  </Button>
                </div>
              </div>

              {/* Recomendações do Epictus IA */}
              <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px]">
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Recomendações do Epictus IA
                    </h3>
                  </div>
                </div>
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma recomendação disponível
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                    À medida que você utiliza a plataforma, o Epictus IA irá analisar seu desempenho e fornecer recomendações personalizadas
                  </p>
                  <Button
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    onClick={() => setShowEpictusAIModal(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Explorar Epictus IA
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Calendário Tab */}
        <TabsContent value="calendario" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Column */}
            <div className="lg:col-span-9">
              
              <div className="bg-[#001427] rounded-b-xl overflow-hidden shadow-md">
                {calendarView === "month" && (
                  <MonthView
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    eventData={eventData}
                    getEventIcon={getEventIcon}
                    openEventDetails={openEventDetails}
                    onEventDrop={handleEventDrop}
                  />
                )}
                {calendarView === "week" && (
                  <WeekView openEventDetails={openEventDetails} />
                )}
                {calendarView === "day" && (
                  <DayView
                    selectedDay={selectedDay}
                    openEventDetails={openEventDetails}
                  />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Próximos Eventos
                    </h3>
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors px-2 py-1">
                    {upcomingEventsData.length} eventos
                  </Badge>
                </div>
                <div className="divide-y divide-[#FF6B00]/10 dark:divide-[#FF6B00]/20">
                  {upcomingEventsData.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-[#FF6B00]/5 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow group-hover:bg-[#FF6B00]/20 dark:group-hover:bg-[#FF6B00]/30">
                            {getEventIcon(event.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-[#FF6B00] transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                            {event.day}
                          </div>
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00] group-hover:bg-[#FF6B00]/10 transition-colors"
                            >
                              {event.discipline}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <EpictusAIWidget
                onOpenAssistant={() => setShowEpictusAIModal(true)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="mt-0">
          <FlowView />
        </TabsContent>

        {/* Tarefas Tab */}
        <TabsContent value="tarefas" className="mt-0">
          <TasksView
            onOpenAddTask={() => setShowAddTaskModal(true)}
            onOpenAISuggestions={() => setShowAISuggestionsModal(true)}
          />
          {/* Add Task Modal */}
          {showAddTaskModal && (
            <AddTaskModal
              open={showAddTaskModal}
              onOpenChange={setShowAddTaskModal}
              onAddTask={handleAddTask}
            />
          )}
          {/* AI Suggestions Modal */}
          <EpictusAISuggestionsModal
            open={showAISuggestionsModal}
            onOpenChange={setShowAISuggestionsModal}
          />
        </TabsContent>



        {/* Desafios Tab */}
        <TabsContent value="desafios" className="mt-0">
          <ChallengesView />
        </TabsContent>
        {/* Rotina Tab */}
        <TabsContent value="rotina" className="mt-0">
          <div>Essa interface está em desenvolvimento</div>
        </TabsContent>
      </Tabs>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <AddEventModal
          open={showAddEventModal}
          onOpenChange={setShowAddEventModal}
          onAddEvent={handleAddEvent}
          selectedDate={selectedDay}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <EventDetailsModal
          open={showEventDetailsModal}
          onOpenChange={setShowEventDetailsModal}
          event={selectedEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {/* Set Goal Modal */}
      {showSetGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Definir Meta de Estudo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta de horas por semana
                </label>
                <Input
                  type="number"
                  placeholder="40"
                  defaultValue={studyTimeData.goal}
                  className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Disciplina com foco
                </label>
                <select className="w-full border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg p-2 text-sm">
                  <option value="all">Todas as disciplinas</option>
                  <option value="matematica">Matemática</option>
                  <option value="fisica">Física</option>
                  <option value="quimica">Química</option>
                  <option value="biologia">Biologia</option>
                  <option value="historia">História</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSetGoalModal(false)}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  onClick={() => setShowSetGoalModal(false)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}