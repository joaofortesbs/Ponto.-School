
import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, formatISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Settings,
  Info,
  Clock,
  CalendarCheck,
  CheckCircle,
  ClipboardList,
  Loader2,
  ChevronUp,
  ChevronDown,
  Target,
  X,
  AlertCircle,
  Flag,
  ArrowRight,
  Sparkles,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import DescrevaSuaRotinaModal from "./DescrevaSuaRotinaModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Import the required styles for the calendar
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/rotina-calendar.css";

// Import moment and configure it
import moment from 'moment';
import 'moment/locale/pt-br';

// Configure moment locale
moment.locale('pt-br');

// Create a proper localizer using moment
const localizer = momentLocalizer(moment);

// Custom messages for the calendar
const messages = {
  today: "Hoje",
  next: "Próximo",
  previous: "Anterior",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Inteiro",
  noEventsInRange: "Não há eventos neste período",
};

// Define type para eventos do calendário
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tipo?: string;
  recurringId?: string;
  color?: string;
  source?: 'rotina' | 'agenda' | 'tarefa' | 'ia';
  description?: string;
  isAISuggested?: boolean;
  taskId?: string;
  goalId?: string;
}

// Interfaces para dados externos
interface AgendaEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
}

interface Tarefa {
  id: string;
  nome: string;
  prazo?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  descricao?: string;
  status: 'a-fazer' | 'em-andamento' | 'concluida';
  categoria?: string;
}

interface Meta {
  id: string;
  nome: string;
  descricao?: string;
  progresso?: number;
  dataPrevista?: string;
}

// Função para mapear tipos a cores
const getEventColor = (tipo?: string) => {
  switch (tipo) {
    case "aula":
      return "#2563EB"; // Azul
    case "trabalho":
      return "#FF6B00"; // Laranja
    case "estudo":
      return "#10B981"; // Verde
    case "pessoal":
      return "#8B5CF6"; // Roxo
    case "agenda":
      return "#64748B"; // Cinza azulado
    case "tarefa":
      return "#EF4444"; // Vermelho
    case "estudo_ia":
      return "#14B8A6"; // Verde turquesa (para blocos de estudo da IA)
    case "pausa_ia":
      return "#8B5CF6"; // Roxo (para pausas sugeridas pela IA)
    case "tarefa_ia":
      return "#F97316"; // Laranja (para tarefas sugeridas pela IA)
    case "pessoal_ia":
      return "#8B5CF6"; // Roxo (para atividades pessoais sugeridas pela IA)
    default:
      return "#6B7280"; // Cinza
  }
};

// Função para obter cor de prioridade
const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case "alta":
      return "bg-red-500";
    case "media":
      return "bg-amber-500";
    case "baixa":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

// Custom components for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <div 
    className={`p-1 rounded text-xs truncate text-white flex items-center ${event.isAISuggested ? 'border border-dashed border-white/70' : ''}`}
    style={{ backgroundColor: event.color || getEventColor(event.tipo) }}
  >
    {event.source === 'agenda' && <CalendarCheck className="h-3 w-3 mr-1 flex-shrink-0" />}
    {event.source === 'tarefa' && <ClipboardList className="h-3 w-3 mr-1 flex-shrink-0" />}
    {event.source === 'ia' && <Sparkles className="h-3 w-3 mr-1 flex-shrink-0" />}
    <span className="truncate">{event.title}</span>
  </div>
);

// Custom Toolbar for the calendar
const CustomToolbar = ({ onNavigate, date }: any) => {
  const goToPrev = () => onNavigate("PREV");
  const goToNext = () => onNavigate("NEXT");
  const goToToday = () => onNavigate("TODAY");

  // Format the week range for display
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const weekRange = `${format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - ${format(
    weekEnd,
    "dd 'de' MMMM, yyyy",
    { locale: ptBR }
  )}`;

  return (
    <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
          <CalendarIcon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-white">{weekRange}</h3>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-white hover:bg-white/20"
          onClick={goToPrev}
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-white hover:bg-white/20"
          onClick={goToToday}
        >
          Hoje
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-white hover:bg-white/20"
          onClick={goToNext}
        >
          Próximo <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

const components = {
  event: EventComponent,
  toolbar: CustomToolbar,
};

const RotinaInteligente: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  
  // Estados para integrações
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(false);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(false);
  const [isLoadingMetas, setIsLoadingMetas] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMetas, setShowMetas] = useState(true);
  const [draggedTarefa, setDraggedTarefa] = useState<Tarefa | null>(null);
  
  // Estados para otimização por IA
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasOptimizedSchedule, setHasOptimizedSchedule] = useState(false);
  const [manualEvents, setManualEvents] = useState<CalendarEvent[]>([]);

  // Acesso ao toast para feedback
  const { toast } = useToast();
  
  // Ref para o calendário para criar eventos por arrastar e soltar
  const calendarRef = useRef<HTMLDivElement>(null);

  // Função para otimizar a rotina com IA
  const optimizeWithAI = async () => {
    setIsOptimizing(true);
    
    try {
      // Coletar todos os dados necessários
      const rotinaString = localStorage.getItem("pontoUserRoutine");
      let blocosFixos: any[] = [];
      let atividadesRecorrentes: any[] = [];
      let preferenciasEstudo: any = { melhoresHorarios: [], duracaoSessao: 60, duracaoPausa: 10 };
      
      if (rotinaString) {
        try {
          const rotina = JSON.parse(rotinaString);
          blocosFixos = rotina.blocosFixos || [];
          atividadesRecorrentes = rotina.atividadesRecorrentes || [];
          preferenciasEstudo = rotina.preferenciasEstudo || {};
        } catch (error) {
          console.error("Erro ao parsear rotina do localStorage:", error);
        }
      }
      
      // Salvar uma cópia dos eventos manuais para poder removê-los depois
      const currentManualEvents = events.filter(event => 
        !event.recurringId && event.source !== 'agenda' && event.source !== 'ia'
      );
      setManualEvents(currentManualEvents);
      
      // Preparar payload para a API
      const payload = {
        blocosFixos,
        atividadesRecorrentes,
        preferenciasEstudo,
        tarefasPendentes: tarefas,
        metasAprendizado: metas,
        eventosAgenda: agendaEvents,
        semanaAtual: formatISO(startOfWeek(currentDate), { representation: 'date' })
      };
      
      // Simular chamada à API (em um ambiente real, isto seria uma chamada HTTP)
      console.log("Enviando payload para API de IA:", payload);
      
      // Simular resposta da API após 2 segundos
      setTimeout(() => {
        try {
          // Gerar dados mockados como resposta da IA
          const response = generateMockAIResponse(currentDate, tarefas, metas);
          processAIResponse(response);
        } catch (error) {
          console.error("Erro ao processar resposta da IA:", error);
          toast({
            title: "Erro ao otimizar rotina",
            description: "Não foi possível processar a resposta da IA. Tente novamente mais tarde.",
            variant: "destructive"
          });
          setIsOptimizing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error("Erro na otimização por IA:", error);
      toast({
        title: "Erro na otimização",
        description: "Ocorreu um erro ao tentar otimizar sua rotina. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setIsOptimizing(false);
    }
  };
  
  // Gerar resposta mockada da IA
  const generateMockAIResponse = (baseDate: Date, tarefas: Tarefa[], metas: Meta[]) => {
    const weekStart = startOfWeek(baseDate);
    const suggestedBlocks = [];
    
    // Gerar blocos de estudo com base nas metas
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      // Para cada meta, criar 2-3 blocos de estudo durante a semana
      const numBlocks = 2 + Math.floor(Math.random() * 2);
      
      for (let j = 0; j < numBlocks; j++) {
        const dayOffset = 1 + Math.floor(Math.random() * 5); // Dia da semana (1-5, seg-sex)
        const hourOffset = 9 + Math.floor(Math.random() * 8); // Hora (9-17)
        
        const startTime = new Date(weekStart);
        startTime.setDate(startTime.getDate() + dayOffset);
        startTime.setHours(hourOffset, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 60); // 1 hora de estudo
        
        suggestedBlocks.push({
          id: `ai-study-${meta.id}-${j}`,
          title: `Estudo Focado: ${meta.nome}`,
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          type: 'estudo_ia',
          goalId: meta.id
        });
        
        // Adicionar uma pausa após o estudo
        const pauseStart = new Date(endTime);
        const pauseEnd = new Date(pauseStart);
        pauseEnd.setMinutes(pauseEnd.getMinutes() + 15); // 15 minutos de pausa
        
        suggestedBlocks.push({
          id: `ai-pause-${meta.id}-${j}`,
          title: "Pausa Ativa",
          start: pauseStart.toISOString(),
          end: pauseEnd.toISOString(),
          type: 'pausa_ia'
        });
      }
    }
    
    // Adicionar blocos para tarefas pendentes
    for (let i = 0; i < tarefas.length; i++) {
      const tarefa = tarefas[i];
      
      // Distribuir tarefas ao longo da semana, priorizando as de alta prioridade
      const prioridadeValue = tarefa.prioridade === 'alta' ? 1 : (tarefa.prioridade === 'media' ? 3 : 5);
      const dayOffset = prioridadeValue + Math.floor(Math.random() * (7 - prioridadeValue));
      
      // Para tarefas com prazo, tentar agendar antes do prazo
      let targetDay = dayOffset;
      if (tarefa.prazo) {
        const prazoDate = new Date(tarefa.prazo);
        const diffDays = Math.floor((prazoDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays < 7) {
          targetDay = Math.min(diffDays - 1, 6); // Um dia antes do prazo, no máximo
        }
      }
      
      const hourOffset = 12 + Math.floor(Math.random() * 6); // Hora (12-18)
      
      const startTime = new Date(weekStart);
      startTime.setDate(startTime.getDate() + targetDay);
      startTime.setHours(hourOffset, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 75); // 1h15min para cada tarefa
      
      suggestedBlocks.push({
        id: `ai-task-${tarefa.id}`,
        title: `Trabalhar em: ${tarefa.nome}`,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        type: 'tarefa_ia',
        taskId: tarefa.id
      });
    }
    
    return {
      success: true,
      message: "Rotina otimizada com sucesso",
      suggestedBlocks
    };
  };
  
  // Processar resposta da IA
  const processAIResponse = (response: any) => {
    if (response.success && response.suggestedBlocks) {
      // Remover eventos manuais do calendário (exceto os blocos fixos)
      const fixedAndAgendaEvents = events.filter(event => 
        event.recurringId || event.source === 'agenda'
      );
      
      // Converter blocos sugeridos pela IA para o formato de eventos do calendário
      const aiEvents = response.suggestedBlocks.map((block: any) => ({
        id: block.id,
        title: block.title,
        start: new Date(block.start),
        end: new Date(block.end),
        tipo: block.type,
        source: 'ia',
        color: getEventColor(block.type),
        isAISuggested: true,
        taskId: block.taskId,
        goalId: block.goalId
      }));
      
      // Combinar eventos fixos com os sugeridos pela IA
      setEvents([...fixedAndAgendaEvents, ...aiEvents]);
      setHasOptimizedSchedule(true);
      
      toast({
        title: "Rotina otimizada com sucesso!",
        description: `Foram gerados ${aiEvents.length} blocos sugeridos baseados em suas metas e tarefas.`,
        duration: 5000,
      });
    } else {
      toast({
        title: "Erro na otimização",
        description: response.message || "Não foi possível otimizar sua rotina. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
    
    setIsOptimizing(false);
  };
  
  // Funções de feedback da rotina otimizada
  const handleLikeOptimization = () => {
    console.log("Usuário gostou da otimização");
    toast({
      title: "Feedback registrado",
      description: "Obrigado pelo seu feedback positivo!",
      duration: 3000,
    });
  };
  
  const handleDislikeOptimization = () => {
    console.log("Usuário não gostou da otimização");
    // Reverter para eventos manuais se necessário
    const currentEvents = events.filter(event => !event.isAISuggested);
    setEvents([...currentEvents, ...manualEvents]);
    setHasOptimizedSchedule(false);
    
    toast({
      title: "Rotina restaurada",
      description: "Seus eventos manuais foram restaurados.",
      duration: 3000,
    });
  };

  // Carregar dados da agenda
  const loadAgendaEvents = async () => {
    setIsLoadingAgenda(true);
    try {
      // Em um ambiente real, esta seria uma chamada à API
      // Por enquanto, simulamos os dados
      const weekStart = startOfWeek(currentDate);
      const formattedWeekStart = formatISO(weekStart, { representation: 'date' });
      
      // Simular uma chamada API: [API_ENDPOINT_AGENDA]/eventos?semana=YYYY-MM-DD
      setTimeout(() => {
        // Dados mockados da agenda
        const mockAgendaEvents: AgendaEvent[] = [
          {
            id: 'agenda-1',
            title: 'Prova de Matemática',
            start: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(), // Quarta-feira, 10h
            end: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),   // Quarta-feira, 12h
            description: 'Prova sobre Cálculo Diferencial e Integral'
          },
          {
            id: 'agenda-2',
            title: 'Entrega de Trabalho',
            start: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // Sexta-feira, 14h
            end: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),   // Sexta-feira, 14h
            description: 'Entrega do trabalho de Física'
          },
          {
            id: 'agenda-3',
            title: 'Reunião de Grupo',
            start: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(), // Terça-feira, 16h
            end: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),   // Terça-feira, 18h
            description: 'Reunião do grupo de estudos de Biologia'
          }
        ];
        
        setAgendaEvents(mockAgendaEvents);
        setIsLoadingAgenda(false);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao carregar eventos da agenda:", error);
      setIsLoadingAgenda(false);
    }
  };

  // Carregar tarefas pendentes
  const loadTarefas = async () => {
    setIsLoadingTarefas(true);
    try {
      // Simular uma chamada API: [API_ENDPOINT_TAREFAS]/pendentes
      setTimeout(() => {
        // Dados mockados de tarefas
        const mockTarefas: Tarefa[] = [
          {
            id: 'tarefa-1',
            nome: 'Exercícios de Algoritmos',
            prazo: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            prioridade: 'alta',
            descricao: 'Completar a lista de exercícios da semana',
            status: 'a-fazer',
            categoria: 'Programação'
          },
          {
            id: 'tarefa-2',
            nome: 'Revisão de Literatura',
            prazo: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            prioridade: 'media',
            descricao: 'Revisar literatura para o artigo',
            status: 'em-andamento',
            categoria: 'Pesquisa'
          },
          {
            id: 'tarefa-3',
            nome: 'Apresentação de Slides',
            prazo: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            prioridade: 'alta',
            descricao: 'Preparar slides para apresentação',
            status: 'a-fazer',
            categoria: 'Apresentação'
          },
          {
            id: 'tarefa-4',
            nome: 'Leitura Complementar',
            prioridade: 'baixa',
            descricao: 'Ler capítulo adicional do livro',
            status: 'a-fazer',
            categoria: 'Estudo'
          },
          {
            id: 'tarefa-5',
            nome: 'Resumo do Capítulo 5',
            prazo: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            prioridade: 'media',
            descricao: 'Fazer resumo do capítulo 5',
            status: 'em-andamento',
            categoria: 'Estudo'
          }
        ];
        
        setTarefas(mockTarefas);
        setIsLoadingTarefas(false);
      }, 800);
      
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setIsLoadingTarefas(false);
    }
  };

  // Carregar metas de aprendizado
  const loadMetas = async () => {
    setIsLoadingMetas(true);
    try {
      // Simular uma chamada API: [API_ENDPOINT_CMA]/metasAtuais
      setTimeout(() => {
        // Dados mockados de metas
        const mockMetas: Meta[] = [
          {
            id: 'meta-1',
            nome: 'Completar Módulo de Física Quântica',
            descricao: 'Finalizar os estudos do módulo de introdução à física quântica',
            progresso: 60,
            dataPrevista: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'meta-2',
            nome: 'Revisar Conceitos de Química Orgânica',
            descricao: 'Revisar os princípios fundamentais de química orgânica',
            progresso: 30,
            dataPrevista: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'meta-3',
            nome: 'Praticar Redação Argumentativa',
            descricao: 'Exercitar técnicas de redação argumentativa',
            progresso: 45,
            dataPrevista: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setMetas(mockMetas);
        setIsLoadingMetas(false);
      }, 1200);
      
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      setIsLoadingMetas(false);
    }
  };

  // Converter eventos da agenda para o formato do calendário
  const convertAgendaEventsToCalendarEvents = (agendaEvents: AgendaEvent[]): CalendarEvent[] => {
    return agendaEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      tipo: 'agenda',
      source: 'agenda',
      color: getEventColor('agenda'),
      description: event.description
    }));
  };

  // Função para adicionar uma tarefa ao calendário via drag-and-drop
  const addTarefaToCalendar = (tarefa: Tarefa, startDate: Date) => {
    // Criar um novo bloco de tempo para a tarefa
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora por padrão
    
    // Gerar ID único
    const newId = `tarefa-calendar-${Date.now()}`;
    
    // Criar o evento
    const newEvent: CalendarEvent = {
      id: newId,
      title: `Trabalhar em: ${tarefa.nome}`,
      start: startDate,
      end: endDate,
      tipo: 'tarefa',
      source: 'tarefa',
      color: getEventColor('tarefa'),
      description: tarefa.descricao
    };
    
    // Salvar no localStorage para persistência
    saveManualEvent(newEvent);
    
    // Atualizar eventos no estado
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Salvar um evento manual no localStorage
  const saveManualEvent = (event: CalendarEvent) => {
    // Buscar eventos manuais salvos
    const savedEventsString = localStorage.getItem("pontoManualEvents");
    let savedEvents: CalendarEvent[] = [];
    
    if (savedEventsString) {
      try {
        savedEvents = JSON.parse(savedEventsString);
      } catch (error) {
        console.error("Erro ao carregar eventos manuais:", error);
      }
    }
    
    // Adicionar o novo evento
    savedEvents.push({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString()
    } as any);
    
    // Salvar no localStorage
    localStorage.setItem("pontoManualEvents", JSON.stringify(savedEvents));
  };

  // Carregar eventos manuais do localStorage
  const loadManualEvents = (): CalendarEvent[] => {
    const savedEventsString = localStorage.getItem("pontoManualEvents");
    if (!savedEventsString) return [];
    
    try {
      const savedEvents = JSON.parse(savedEventsString);
      return savedEvents.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    } catch (error) {
      console.error("Erro ao carregar eventos manuais:", error);
      return [];
    }
  };

  // Carregar dados da rotina e integrações quando a data muda
  useEffect(() => {
    const loadAllData = async () => {
      // Carregar dados de rotina do localStorage
      const rotinaString = localStorage.getItem("pontoUserRoutine");
      let rotinaEvents: CalendarEvent[] = [];
      let hasRotinaData = false;
      
      if (rotinaString) {
        try {
          const rotina = JSON.parse(rotinaString);
          const { blocosFixos = [], atividadesRecorrentes = [] } = rotina;
          
          // Lista de dias da semana para criar eventos recorrentes
          const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
          
          // Data inicial (começando do domingo da semana atual)
          const dataInicial = startOfWeek(currentDate);
          
          // Converter blocos fixos em eventos
          blocosFixos.forEach((bloco: any) => {
            // Para cada dia da semana selecionado no bloco
            bloco.diasSemana.forEach((diaSemana: string) => {
              // Encontrar o índice do dia da semana
              const indexDia = diasSemana.indexOf(diaSemana);
              if (indexDia === -1) return;
              
              // Calcular a data do evento
              const dataEvento = new Date(dataInicial);
              dataEvento.setDate(dataInicial.getDate() + indexDia);
              
              // Definir horário de início
              const [horaInicio, minutoInicio] = bloco.horarioInicio.split(':').map(Number);
              const dataInicio = new Date(dataEvento);
              dataInicio.setHours(horaInicio, minutoInicio, 0);
              
              // Definir horário de fim
              const [horaFim, minutoFim] = bloco.horarioFim.split(':').map(Number);
              const dataFim = new Date(dataEvento);
              dataFim.setHours(horaFim, minutoFim, 0);
              
              // Criar evento
              const evento: CalendarEvent = {
                id: `${bloco.id}-${diaSemana}`,
                title: bloco.nome,
                start: dataInicio,
                end: dataFim,
                tipo: bloco.tipo,
                recurringId: bloco.id,
                color: getEventColor(bloco.tipo),
                source: 'rotina'
              };
              
              rotinaEvents.push(evento);
            });
          });
          
          // Converter atividades recorrentes em eventos
          atividadesRecorrentes.forEach((atividade: any) => {
            const diasParaAdicionar: number[] = [];
            
            // Determinar quais dias adicionar com base na frequência
            atividade.frequencia.forEach((freq: string) => {
              if (freq === "Diariamente") {
                // Adicionar todos os dias da semana
                diasParaAdicionar.push(0, 1, 2, 3, 4, 5, 6);
              } else if (freq === "Dias úteis") {
                // Adicionar apenas dias úteis (segunda a sexta)
                diasParaAdicionar.push(1, 2, 3, 4, 5);
              } else if (freq === "Fim de semana") {
                // Adicionar sábado e domingo
                diasParaAdicionar.push(0, 6);
              } else if (freq === "Dias específicos") {
                // Aqui poderia ser expandido se houvesse dias específicos selecionados
              }
            });
            
            // Remover duplicatas
            const diasUnicos = [...new Set(diasParaAdicionar)];
            
            // Para cada dia selecionado, criar um evento
            diasUnicos.forEach((indexDia) => {
              // Calcular a data do evento
              const dataEvento = new Date(dataInicial);
              dataEvento.setDate(dataInicial.getDate() + indexDia);
              
              // Por padrão, colocar a atividade recorrente às 12h com a duração especificada
              const dataInicio = new Date(dataEvento);
              dataInicio.setHours(12, 0, 0);
              
              // Definir o fim com base na duração
              const dataFim = new Date(dataInicio);
              const duracao = atividade.duracao;
              if (atividade.unidadeDuracao === "minutos") {
                dataFim.setMinutes(dataFim.getMinutes() + duracao);
              } else if (atividade.unidadeDuracao === "horas") {
                dataFim.setHours(dataFim.getHours() + duracao);
              }
              
              // Criar evento
              const evento: CalendarEvent = {
                id: `${atividade.id}-${indexDia}`,
                title: atividade.nome,
                start: dataInicio,
                end: dataFim,
                tipo: "pessoal", // Por padrão, considerar como atividade pessoal
                recurringId: atividade.id,
                color: "#8B5CF6", // Roxo para atividades recorrentes
                source: 'rotina'
              };
              
              rotinaEvents.push(evento);
            });
          });
          
          hasRotinaData = true;
        } catch (error) {
          console.error("Erro ao carregar rotina:", error);
        }
      }
      
      // Carregar eventos manuais
      const manualEvents = loadManualEvents();
      
      // Abrir modal de configuração se necessário
      if (!hasRotinaData && firstLoad) {
        setShowConfigModal(true);
        setFirstLoad(false);
      }
      
      setHasLoadedData(hasRotinaData || manualEvents.length > 0);
      
      // Buscar dados da agenda, tarefas e metas
      await loadAgendaEvents();
      await loadTarefas();
      await loadMetas();
      
      // Combinar todos os eventos
      const allEvents = [
        ...rotinaEvents,
        ...manualEvents,
        ...convertAgendaEventsToCalendarEvents(agendaEvents)
      ];
      
      setEvents(allEvents);
    };
    
    loadAllData();
  }, [currentDate, showConfigModal, firstLoad]);

  // Atualizar eventos quando os eventos da agenda mudarem
  useEffect(() => {
    if (agendaEvents.length > 0) {
      setEvents(prevEvents => {
        // Remover eventos da agenda antigos
        const filteredEvents = prevEvents.filter(event => event.source !== 'agenda');
        // Adicionar os novos eventos da agenda
        return [...filteredEvents, ...convertAgendaEventsToCalendarEvents(agendaEvents)];
      });
    }
  }, [agendaEvents]);

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (action === "NEXT") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (action === "TODAY") {
      setCurrentDate(new Date());
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Manipuladores de drag-and-drop para tarefas
  const handleDragStart = (e: React.DragEvent, tarefa: Tarefa) => {
    e.dataTransfer.setData('text/plain', tarefa.id);
    setDraggedTarefa(tarefa);
    // Alterar o cursor para indicar que o elemento está sendo arrastado
    document.body.style.cursor = 'grabbing';
  };
  
  const handleDragEnd = () => {
    setDraggedTarefa(null);
    // Restaurar o cursor
    document.body.style.cursor = 'auto';
  };

  // Função para lidar com o drop de uma tarefa no calendário
  const handleCalendarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedTarefa) return;
    
    // Obter as coordenadas do drop
    const rect = calendarRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calcular a posição relativa dentro do calendário
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Aqui, em um cenário real, precisaríamos mapear as coordenadas x,y para uma hora/data específica
    // no calendário. Como isso é complexo e requer conhecimento interno de como a biblioteca renderiza o calendário,
    // vamos simplificar usando a data atual mais uma hora arredondada:
    
    const now = new Date();
    now.setMinutes(0, 0, 0); // Arredondar para a hora atual
    
    // Adicionar a tarefa ao calendário
    addTarefaToCalendar(draggedTarefa, now);
    
    // Limpar a tarefa arrastada
    setDraggedTarefa(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
          Minha Rotina Inteligente
        </h2>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? (
              <>
                <ChevronRight className="h-4 w-4 mr-1" />
                Ocultar Painel
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Mostrar Painel
              </>
            )}
          </Button>
          
          <Button
            variant={isOptimizing ? "outline" : "default"}
            className={isOptimizing 
              ? "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors" 
              : "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"}
            onClick={optimizeWithAI}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Otimizando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Otimizar com IA ✨
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
            onClick={() => setShowConfigModal(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Rotina
          </Button>
        </div>
      </div>
      
      {/* Feedback buttons for AI optimization */}
      {hasOptimizedSchedule && (
        <div className="flex items-center justify-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-xl border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
            <span className="font-medium">✨ Rotina otimizada por IA</span> - Como você avalia as sugestões?
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400"
            onClick={handleLikeOptimization}
          >
            <ThumbsUp className="h-4 w-4" /> Gostei
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400"
            onClick={handleDislikeOptimization}
          >
            <ThumbsDown className="h-4 w-4" /> Prefiro Ajustar
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex-grow bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          {/* Calendar Container */}
          {hasLoadedData ? (
            <div 
              className="p-0" 
              style={{ height: "calc(100vh - 280px)", minHeight: "600px" }}
              ref={calendarRef}
              onDrop={handleCalendarDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={[Views.WEEK]}
                defaultView={Views.WEEK}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                messages={messages}
                components={components}
                className="dark:text-white"
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event: any) => ({
                  style: {
                    backgroundColor: event.color || getEventColor(event.tipo),
                    borderStyle: event.isAISuggested ? 'dashed' : 'solid',
                    borderWidth: event.isAISuggested ? '1px' : '0px',
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    opacity: event.isAISuggested ? 0.9 : 1
                  }
                })}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-6">
              <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                Nenhuma rotina configurada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                Configure sua rotina base clicando no botão abaixo para visualizar 
                suas atividades recorrentes no calendário.
              </p>
              <Button
                onClick={() => setShowConfigModal(true)}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Configurar Minha Rotina
              </Button>
            </div>
          )}
        </div>
        
        {/* Painel Lateral */}
        {showSidebar && (
          <div className="w-80 flex-shrink-0 animate-in fade-in slide-in-from-right-5 duration-300">
            {/* Seção de Tarefas Pendentes */}
            <Card className="shadow-md dark:bg-[#1E293B] mb-4">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-[#001427] dark:text-white flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2 text-[#FF6B00]" />
                  Tarefas Pendentes
                </h3>
                <Badge variant="outline" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30">
                  {tarefas.length}
                </Badge>
              </div>
              
              <div className="p-4">
                {isLoadingTarefas ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 text-[#FF6B00] animate-spin" />
                  </div>
                ) : tarefas.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Não há tarefas pendentes</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-3">
                    <div className="space-y-3">
                      {tarefas.map(tarefa => (
                        <div 
                          key={tarefa.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-[#111827] hover:shadow-md transition-shadow cursor-grab"
                          draggable
                          onDragStart={(e) => handleDragStart(e, tarefa)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getPrioridadeColor(tarefa.prioridade)}`} />
                                <h4 className="font-medium text-[#001427] dark:text-white">{tarefa.nome}</h4>
                              </div>
                              
                              {tarefa.prazo && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Prazo: {format(new Date(tarefa.prazo), "dd/MM/yyyy")}
                                </p>
                              )}
                            </div>
                            
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                tarefa.status === 'a-fazer' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30'
                              }`}
                            >
                              {tarefa.status === 'a-fazer' ? 'A Fazer' : 'Em Andamento'}
                            </Badge>
                          </div>
                          
                          {tarefa.descricao && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                              {tarefa.descricao}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                            <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {tarefa.categoria || "Geral"}
                            </Badge>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs text-gray-500 dark:text-gray-400 hover:text-[#FF6B00]"
                            >
                              Arrastar para Agendar
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </Card>
            
            {/* Seção de Metas de Aprendizado */}
            <Card className="shadow-md dark:bg-[#1E293B]">
              <div 
                className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
                onClick={() => setShowMetas(!showMetas)}
              >
                <h3 className="font-semibold text-[#001427] dark:text-white flex items-center">
                  <Target className="h-4 w-4 mr-2 text-[#FF6B00]" />
                  Metas de Aprendizado Atuais
                </h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {showMetas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {showMetas && (
                <div className="p-4">
                  {isLoadingMetas ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 text-[#FF6B00] animate-spin" />
                    </div>
                  ) : metas.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>Nenhuma meta definida</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {metas.map(meta => (
                        <div key={meta.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-[#111827]">
                          <h4 className="font-medium text-[#001427] dark:text-white">{meta.nome}</h4>
                          
                          {meta.descricao && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 mb-2 line-clamp-2">
                              {meta.descricao}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="w-full max-w-[180px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Progresso</span>
                                <span className="text-xs font-medium text-[#FF6B00]">{meta.progresso}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full"
                                  style={{ width: `${meta.progresso}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {meta.dataPrevista && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(meta.dataPrevista), "dd/MM")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
            
            <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              <p>Arraste tarefas para o calendário para planejar seu tempo</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Configuração */}
      <DescrevaSuaRotinaModal 
        open={showConfigModal} 
        onOpenChange={setShowConfigModal} 
      />

      {/* Event Details Tooltip */}
      {selectedEvent && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden">
                Detalhes do Evento
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-white dark:bg-[#1E293B] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col space-y-1">
                <div className="font-medium">{selectedEvent.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                </div>
                
                {selectedEvent.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-[250px]">
                    {selectedEvent.description}
                  </div>
                )}
                
                <div className="text-xs flex items-center mt-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: selectedEvent.color || getEventColor(selectedEvent.tipo) }} 
                  />
                  <span className="capitalize text-gray-600 dark:text-gray-300">
                    {selectedEvent.source === 'agenda' ? 'Agenda' : 
                      selectedEvent.source === 'tarefa' ? 'Tarefa' : 
                      selectedEvent.source === 'ia' ? 'Sugerido por IA' : 
                      selectedEvent.tipo || "Evento"}
                  </span>
                  {selectedEvent.isAISuggested && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      IA
                    </span>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all"
          title="Adicionar Bloco"
          onClick={() => setShowConfigModal(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default RotinaInteligente;
