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
import { getUserEvents, addEvent, updateEvent, deleteEvent, CalendarEvent } from "@/services/calendarEventService";

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

  // Estado para armazenar eventos do calendário
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // Mapeamento de eventos por dia para facilitar a renderização
  const [eventData, setEventData] = useState<Record<number, any[]>>({});
  // Estado para indicar carregamento
  const [loading, setLoading] = useState(false);

  // Buscar eventos do usuário ao carregar a página
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const userEvents = await getUserEvents();
        setEvents(userEvents);
        
        // Organizar eventos por dia para o formato esperado pelo calendário
        const eventsByDay: Record<number, any[]> = {};
        
        userEvents.forEach(event => {
          const eventDate = new Date(event.startDate);
          const day = eventDate.getDate();
          
          if (!eventsByDay[day]) {
            eventsByDay[day] = [];
          }
          
          eventsByDay[day].push({
            ...event,
            color: event.color || getEventColor(event.type),
            time: event.startTime || "00:00"
          });
        });
        
        setEventData(eventsByDay);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        toast({
          title: "Erro ao carregar eventos",
          description: "Não foi possível carregar seus eventos. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Função para formatar eventos próximos a partir dos eventos
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza a data atual para comparação
    const upcoming: any[] = [];
    
    events.forEach(event => {
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
          color: event.color || getEventColor(event.type),
          details: event.details,
          startTime: event.startTime || "00:00",
          // Guardar a data original para ordenação
          originalDate: eventDate,
          originalTime: event.startTime || "00:00"
        });
      }
    });
    
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

  // Array de eventos próximos atualizado a partir dos eventos
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
  const handleAddEvent = async (newEvent: any) => {
    try {
      console.log("Recebendo novo evento para adicionar:", newEvent);
      
      // Adicionar evento ao banco de dados
      const savedEvent = await addEvent({
        ...newEvent,
        color: getEventColor(newEvent.type),
      });
      
      if (savedEvent) {
        console.log("Evento salvo com sucesso:", savedEvent);
        
        // Atualizar o estado local com o novo evento
        setEvents(prevEvents => [...prevEvents, savedEvent]);
        
        // Atualizar o eventData para o calendário
        const eventDate = new Date(savedEvent.startDate);
        const day = eventDate.getDate();
        
        const eventForCalendar = {
          ...savedEvent,
          color: savedEvent.color || getEventColor(savedEvent.type),
          time: savedEvent.startTime || "00:00",
        };
        
        setEventData(prev => {
          const updated = { ...prev };
          if (updated[day]) {
            updated[day] = [...updated[day], eventForCalendar];
          } else {
            updated[day] = [eventForCalendar];
          }
          return updated;
        });
        
        // Exibe uma mensagem de sucesso
        toast({
          title: "Evento adicionado",
          description: "O evento foi adicionado com sucesso ao seu calendário e listado em Próximos Eventos.",
        });
      } else {
        console.error("Falha ao salvar o evento, retorno nulo");
        toast({
          title: "Erro ao adicionar evento",
          description: "O evento não pôde ser salvo no banco de dados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      toast({
        title: "Erro ao adicionar evento",
        description: "Ocorreu um erro ao adicionar o evento. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  };

  // Edit event
  const handleEditEvent = async (editedEvent: any) => {
    try {
      // Atualizar evento no banco de dados
      const updatedEvent = await updateEvent({
        ...editedEvent,
        color: editedEvent.color || getEventColor(editedEvent.type),
      });
      
      if (updatedEvent) {
        // Atualizar o estado local
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
        
        // Reorganizar os eventos por dia para o calendário
        const newEventData: Record<number, any[]> = {};
        
        // Remover o evento antigo de todos os dias
        events.forEach(event => {
          if (event.id !== updatedEvent.id) {
            const eventDate = new Date(event.startDate);
            const day = eventDate.getDate();
            
            if (!newEventData[day]) {
              newEventData[day] = [];
            }
            
            newEventData[day].push({
              ...event,
              color: event.color || getEventColor(event.type),
              time: event.startTime || "00:00",
            });
          }
        });
        
        // Adicionar o evento atualizado ao dia correto
        const updatedDate = new Date(updatedEvent.startDate);
        const updatedDay = updatedDate.getDate();
        
        if (!newEventData[updatedDay]) {
          newEventData[updatedDay] = [];
        }
        
        newEventData[updatedDay].push({
          ...updatedEvent,
          color: updatedEvent.color || getEventColor(updatedEvent.type),
          time: updatedEvent.startTime || "00:00",
        });
        
        setEventData(newEventData);
        
        // Exibe uma mensagem de sucesso
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro ao atualizar evento",
        description: "Ocorreu um erro ao atualizar o evento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Excluir evento do banco de dados
      const success = await deleteEvent(eventId);
      
      if (success) {
        // Atualizar o estado local
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        
        // Atualizar o eventData para o calendário
        const updatedEvents = { ...eventData };
        
        // Encontrar e remover o evento
        Object.keys(updatedEvents).forEach((day) => {
          const dayNum = parseInt(day);
          updatedEvents[dayNum] = updatedEvents[dayNum].filter(
            (event) => event.id !== eventId,
          );
          
          // Remover o dia se não tiver mais eventos
          if (updatedEvents[dayNum].length === 0) {
            delete updatedEvents[dayNum];
          }
        });
        
        setEventData(updatedEvents);
        
        // Exibe uma mensagem de sucesso
        toast({
          title: "Evento excluído",
          description: "O evento foi excluído com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast({
        title: "Erro ao excluir evento",
        description: "Ocorreu um erro ao excluir o evento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Handle event drag and drop
  const handleEventDrop = async (event: any, newDay: number) => {
    try {
      // Encontrar o evento original
      const originalEvent = events.find(e => e.id === event.id);
      
      if (!originalEvent) {
        console.error("Evento não encontrado:", event.id);
        return;
      }
      
      // Criar uma cópia do evento com a nova data
      const oldDate = new Date(originalEvent.startDate);
      const newDate = new Date(oldDate);
      newDate.setDate(newDay);
      
      // Atualizar a data de início
      const updatedEvent = {
        ...originalEvent,
        startDate: newDate.toISOString()
      };
      
      // Atualizar também a data de término se existir
      if (originalEvent.endDate) {
        const oldEndDate = new Date(originalEvent.endDate);
        const dayDiff = Math.round(
          (oldEndDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const newEndDate = new Date(newDate);
        newEndDate.setDate(newDate.getDate() + dayDiff);
        updatedEvent.endDate = newEndDate.toISOString();
      }
      
      // Salvar a mudança no banco de dados
      const savedEvent = await updateEvent(updatedEvent);
      
      if (savedEvent) {
        // Atualizar o estado local
        setEvents(prevEvents => 
          prevEvents.map(e => e.id === savedEvent.id ? savedEvent : e)
        );
        
        // Atualizar o eventData para o calendário
        const updatedEvents = { ...eventData };
        
        // Remover o evento do dia original
        Object.keys(updatedEvents).forEach((day) => {
          const dayNum = parseInt(day);
          updatedEvents[dayNum] = updatedEvents[dayNum].filter(
            (e) => e.id !== event.id,
          );
          
          // Remover o dia se não tiver mais eventos
          if (updatedEvents[dayNum].length === 0) {
            delete updatedEvents[dayNum];
          }
        });
        
        // Adicionar o evento ao novo dia
        const eventForCalendar = {
          ...savedEvent,
          color: savedEvent.color || getEventColor(savedEvent.type),
          time: savedEvent.startTime || "00:00",
        };
        
        if (updatedEvents[newDay]) {
          updatedEvents[newDay] = [...updatedEvents[newDay], eventForCalendar];
        } else {
          updatedEvents[newDay] = [eventForCalendar];
        }
        
        setEventData(updatedEvents);
        
        // Notificar o usuário sobre a mudança
        toast({
          title: "Evento movido",
          description: `O evento foi movido para o dia ${newDay}.`,
        });
      }
    } catch (error) {
      console.error("Erro ao mover evento:", error);
      toast({
        title: "Erro ao mover evento",
        description: "Ocorreu um erro ao mover o evento. Tente novamente.",
        variant: "destructive"
      });
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
                    setCalendarView={setCalendarView}
                    calendarView={calendarView}
                    loading={loading}
                  />
                )}
                {calendarView === "week" && (
                  <>
                    <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                          <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg tracking-wide">
                          Visualização Semanal
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "day" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("day")}
                          >
                            Dia
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "week" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("week")}
                          >
                            Semana
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "month" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("month")}
                          >
                            Mês
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-white hover:bg-white/20 rounded-lg px-3"
                            onClick={() => setSelectedDay(new Date())}
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <WeekView openEventDetails={openEventDetails} />
                  </>
                )}
                {calendarView === "day" && (
                  <>
                    <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                          <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg tracking-wide">
                          Visualização Diária
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "day" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("day")}
                          >
                            Dia
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "week" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("week")}
                          >
                            Semana
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "month" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("month")}
                          >
                            Mês
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-white hover:bg-white/20 rounded-lg px-3"
                            onClick={() => setSelectedDay(new Date())}
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DayView
                      selectedDay={selectedDay}
                      openEventDetails={openEventDetails}
                    />
                  </>
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
                <div className="p-4 flex flex-col">
                  {upcomingEventsData.length > 0 ? (
                    <div className="divide-y divide-[#FF6B00]/10 dark:divide-[#FF6B00]/20 w-full max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {upcomingEventsData.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 hover:bg-[#FF6B00]/5 cursor-pointer transition-colors group"
                          onClick={() => openEventDetails(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <div 
                                className={`w-8 h-8 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
                              >
                                {getEventIcon(event.type)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-[#FF6B00] transition-colors">
                                {event.title}
                              </h4>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                                {event.day} {event.startTime ? `às ${event.startTime}` : ""}
                              </div>
                              <div className="mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00] group-hover:bg-[#FF6B00]/10 transition-colors"
                                >
                                  {event.discipline}
                                </Badge>
                                {event.isOnline && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-blue-300/30 bg-transparent text-blue-500 ml-1 group-hover:bg-blue-500/10 transition-colors"
                                  >
                                    Online
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                        <CalendarIcon className="h-8 w-8 text-[#FF6B00]/40" />
                      </div>
                      <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Nenhum evento próximo</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                        Seus próximos eventos serão exibidos aqui à medida que você os adicionar ao seu calendário
                      </p>
                      <Button
                        onClick={() => setShowAddEventModal(true)}
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
                      </Button>
                    </div>
                  )}
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