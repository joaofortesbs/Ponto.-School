import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar, List, Kanban, Filter, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { Event, EventType } from "./types";
import ListView from "./components/ListView";
import CalendarView from "./components/CalendarView";
import KanbanView from "./components/KanbanView";
import EventDetailsModal from "./components/EventDetailsModal";
import AddEventModal from "./components/AddEventModal";

// Dados de exemplo para eventos
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Aula de Matemática Avançada",
    description: "Estudo de funções trigonométricas e suas aplicações",
    type: "aula_ao_vivo",
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 2)),
    subject: "Matemática",
    professor: "Prof. Carlos Silva",
    isOnline: true,
    link: "https://meet.google.com/abc-defg-hij",
    status: "confirmado",
  },
  {
    id: "2",
    title: "Prova de Física",
    description: "Avaliação sobre Mecânica Quântica",
    type: "prova",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    subject: "Física",
    professor: "Profa. Ana Martins",
    isOnline: false,
    location: "Sala 302, Bloco B",
    status: "confirmado",
  },
  {
    id: "3",
    title: "Entrega de Trabalho de Química",
    description: "Relatório sobre o experimento de titulação",
    type: "trabalho",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    subject: "Química",
    professor: "Prof. Roberto Alves",
    isOnline: true,
    status: "pendente",
  },
  {
    id: "4",
    title: "Grupo de Estudos - Biologia Molecular",
    description: "Discussão sobre DNA e RNA",
    type: "grupo_estudo",
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
    subject: "Biologia",
    isOnline: true,
    link: "https://meet.google.com/xyz-abcd-efg",
    status: "confirmado",
  },
  {
    id: "5",
    title: "Plantão de Dúvidas - Cálculo",
    description: "Resolução de exercícios e dúvidas sobre integrais",
    type: "plantao",
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
    subject: "Matemática",
    professor: "Prof. Carlos Silva",
    isOnline: true,
    link: "https://meet.google.com/lmn-opqr-stu",
    status: "confirmado",
  },
  {
    id: "6",
    title: "Desafio Jornada do Conhecimento - Física",
    description: "Resolva problemas de física aplicada e ganhe pontos extras",
    type: "desafio",
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 7)),
    subject: "Física",
    isOnline: true,
    status: "em_andamento",
  },
  {
    id: "7",
    title: "Webinar: Carreira em Ciência de Dados",
    description:
      "Palestra com profissionais da área sobre oportunidades e desafios",
    type: "evento",
    start: new Date(new Date().setDate(new Date().getDate() + 5)),
    end: new Date(new Date().setDate(new Date().getDate() + 5)),
    isOnline: true,
    link: "https://meet.google.com/webinar-data-science",
    status: "confirmado",
  },
  {
    id: "8",
    title: "Aula Gravada: Introdução à Biologia Celular",
    description: "Fundamentos da estrutura e função celular",
    type: "aula_gravada",
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
    subject: "Biologia",
    professor: "Profa. Mariana Costa",
    isOnline: true,
    link: "https://ponto.school/aulas/biologia-celular",
    status: "confirmado",
  },
];

// Componente principal da página de Organização
export default function OrganizacaoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");

  const [activeTab, setActiveTab] = useState(viewParam || "lista");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filterType, setFilterType] = useState<EventType | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Atualizar a URL quando a aba ativa mudar
  useEffect(() => {
    setSearchParams({ view: activeTab });
  }, [activeTab, setSearchParams]);

  // Atualizar a aba ativa quando o parâmetro da URL mudar
  useEffect(() => {
    if (viewParam && ["lista", "calendario", "kanban"].includes(viewParam)) {
      setActiveTab(viewParam);
    }
  }, [viewParam]);

  // Filtrar eventos com base no tipo e na busca
  const filteredEvents = events.filter((event) => {
    const matchesType = filterType ? event.type === filterType : true;
    const matchesSearch = searchQuery
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false)
      : true;
    return matchesType && matchesSearch;
  });

  // Função para verificar se duas datas são o mesmo dia
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Função para salvar um evento (novo ou editado)
  const handleSaveEvent = (event: Event) => {
    if (event.id) {
      // Editar evento existente
      setEvents(events.map((e) => (e.id === event.id ? event : e)));
    } else {
      // Adicionar novo evento
      const newEvent = {
        ...event,
        id: String(Date.now()),
      };
      setEvents([...events, newEvent]);
    }
  };

  // Função para excluir um evento
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  // Função para abrir o modal de adicionar evento
  const handleAddEvent = () => {
    setSelectedEvent({
      id: "",
      title: "",
      type: "evento",
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
      isOnline: false,
      status: "pendente",
    });
    setShowAddEvent(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#29335C] dark:text-white font-montserrat">
          Organização
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#778DA9]" />
            <Input
              placeholder="Buscar eventos..."
              className="pl-9 w-[250px] border-[#778DA9]/30 focus:border-[#778DA9] focus:ring-[#778DA9]/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
            onClick={handleAddEvent}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList className="bg-[#778DA9]/10 dark:bg-[#29335C]/30 p-1">
            <TabsTrigger
              value="lista"
              className="data-[state=active]:bg-[#778DA9] data-[state=active]:text-white"
            >
              <List className="h-4 w-4 mr-1" /> Lista
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="data-[state=active]:bg-[#778DA9] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-1" /> Calendário
            </TabsTrigger>
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-[#778DA9] data-[state=active]:text-white"
            >
              <Kanban className="h-4 w-4 mr-1" /> Kanban
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lista" className="mt-0">
          <ListView
            filteredEvents={filteredEvents}
            setSelectedEvent={setSelectedEvent}
            setShowEventDetails={setShowEventDetails}
            setShowAddEvent={setShowAddEvent}
            filterType={filterType}
            setFilterType={setFilterType}
            onDeleteEvent={handleDeleteEvent}
          />
        </TabsContent>

        <TabsContent value="calendario" className="mt-0">
          <CalendarView
            events={filteredEvents}
            setSelectedEvent={setSelectedEvent}
            setShowEventDetails={setShowEventDetails}
            handleAddEvent={handleAddEvent}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-0">
          <KanbanView
            events={filteredEvents}
            setSelectedEvent={setSelectedEvent}
            setShowEventDetails={setShowEventDetails}
            setShowAddEvent={setShowAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </TabsContent>
      </Tabs>

      {/* Modais */}
      {selectedEvent && (
        <>
          <EventDetailsModal
            showEventDetails={showEventDetails}
            setShowEventDetails={setShowEventDetails}
            selectedEvent={selectedEvent}
            onEdit={() => setShowAddEvent(true)}
            onDelete={handleDeleteEvent}
          />

          <AddEventModal
            showAddEvent={showAddEvent}
            setShowAddEvent={setShowAddEvent}
            selectedEvent={selectedEvent}
            onSave={handleSaveEvent}
          />
        </>
      )}
    </div>
  );
}
