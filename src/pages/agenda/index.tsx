
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CalendarRange,
  Plus,
  Calendar as CalendarIcon,
  PlusCircle,
  Filter,
  ArrowDown,
  LayoutGrid,
  ListIcon,
  MoveRight,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MonthView from "@/components/agenda/calendar-views/month-view";
import WeekView from "@/components/agenda/calendar-views/week-view";
import DayView from "@/components/agenda/calendar-views/day-view";
import NotificationsCard from "@/components/agenda/cards/notifications";
import PendingTasksCard from "@/components/agenda/cards/pending-tasks";
import UpcomingEventsCard from "@/components/agenda/cards/upcoming-events";
import AddEventModal from "@/components/agenda/modals/add-event-modal";
import AddTaskModal from "@/components/agenda/modals/add-task-modal";
import EventDetailsModal from "@/components/agenda/modals/event-details-modal";
import EpictusAIAssistantModal from "@/components/agenda/modals/epictus-ai-assistant-modal";
import EpictusAIModal from "@/components/agenda/modals/epictus-ai-modal";
import EpictusCalendarModal from "@/components/agenda/modals/epictus-calendar-modal";
import EpictusCalendar from "@/components/agenda/cards/epictus-calendar";
import FlowSummaryCard from "@/components/agenda/cards/flow-summary-card";
import TasksView from "@/components/agenda/tasks/TasksView";
import FlowView from "@/components/agenda/flow/FlowView";
import ChallengesView from "@/components/agenda/challenges/ChallengesView";
import QuickStats from "@/components/agenda/stats/quick-stats";
import TopMetrics from "@/components/dashboard/TopMetrics";
import AddReminderModal from "@/components/agenda/modals/add-reminder-modal";
import EditReminderModal from "@/components/agenda/modals/edit-reminder-modal";
import EmptyStateView from "@/components/agenda/EmptyStateView";
import EpictusAISuggestionsModal from "@/components/agenda/modals/epictus-ai-suggestions-modal";

// Mock data that should be moved to a proper data layer/API
const initialEvents = [
  {
    id: "1",
    title: "Reunião do Grupo de Estudos",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    color: "#4CAF50",
    allDay: false,
    type: "meeting",
    location: "Sala Online",
    description: "Discussão sobre o trabalho de história.",
  },
  {
    id: "2",
    title: "Entrega de Trabalho",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: "#F44336",
    allDay: true,
    type: "assignment",
    location: "Online",
    description: "Entrega do trabalho final de matemática.",
  },
  {
    id: "3",
    title: "Prova de Física",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: "#2196F3",
    allDay: true,
    type: "exam",
    location: "Sala 305",
    description: "Prova sobre Mecânica Quântica",
  },
  {
    id: "4",
    title: "Monitoria de Química",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 0, 0, 0)),
    color: "#FF9800",
    allDay: false,
    type: "study",
    location: "Laboratório 2",
    description: "Revisão para a prova da próxima semana",
  },
];

const initialTasks = [
  {
    id: "task1",
    title: "Estudar para a prova de cálculo",
    description: "Revisar capítulos 4 e 5 do livro",
    status: "pending",
    priority: "high",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    tags: ["matemática", "prova"],
  },
  {
    id: "task2",
    title: "Completar o trabalho de história",
    description: "Escrever 3 páginas sobre a Revolução Industrial",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    tags: ["história", "trabalho"],
  },
  {
    id: "task3",
    title: "Preparar apresentação de biologia",
    description: "Slides sobre sistema respiratório",
    status: "completed",
    priority: "low",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    tags: ["biologia", "apresentação"],
  },
  {
    id: "task4",
    title: "Ler o livro para o clube de leitura",
    description: "Ler até o capítulo 10",
    status: "pending",
    priority: "medium",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    tags: ["leitura", "português"],
  },
];

const initialReminders = [
  {
    id: "rem1",
    title: "Inscrição para o curso de verão",
    description: "Último dia para se inscrever no curso de programação",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    time: "12:00",
    isCompleted: false,
  },
  {
    id: "rem2",
    title: "Reunião com o orientador",
    description: "Discutir o progresso do projeto de pesquisa",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    time: "14:30",
    isCompleted: false,
  },
  {
    id: "rem3",
    title: "Devolver livros na biblioteca",
    description: "Prazo final para evitar multa",
    dueDate: new Date(new Date().setDate(new Date().getDate())),
    time: "18:00",
    isCompleted: true,
  },
];

const Agenda = () => {
  // State hooks
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [tasks, setTasks] = useState(initialTasks);
  const [reminders, setReminders] = useState(initialReminders);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<any | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showEditReminderModal, setShowEditReminderModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showEpictusAIModal, setShowEpictusAIModal] = useState(false);
  const [showEpictusAIAssistantModal, setShowEpictusAIAssistantModal] =
    useState(false);
  const [showEpictusCalendarModal, setShowEpictusCalendarModal] =
    useState(false);
  const [showEpictusAISuggestionsModal, setShowEpictusAISuggestionsModal] =
    useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [activeTab, setActiveTab] = useState("calendar");
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);

  // Effects
  useEffect(() => {
    // Simulate loading data from database/API
    setTimeout(() => {
      setIsDataLoaded(true);
    }, 1000);
  }, []);

  // Functions
  const handleAddEvent = (newEvent: any) => {
    const updatedEvents = [...events, { ...newEvent, id: `${Date.now()}` }];
    setEvents(updatedEvents);
    setShowAddEventModal(false);
  };

  const handleAddTask = (newTask: any) => {
    const updatedTasks = [...tasks, { ...newTask, id: `task${Date.now()}` }];
    setTasks(updatedTasks);
    setShowAddTaskModal(false);
  };

  const handleAddReminder = (newReminder: any) => {
    const updatedReminders = [
      ...reminders,
      { ...newReminder, id: `rem${Date.now()}` },
    ];
    setReminders(updatedReminders);
    setShowAddReminderModal(false);
  };

  const handleEditReminder = (updatedReminder: any) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === updatedReminder.id ? updatedReminder : reminder
    );
    setReminders(updatedReminders);
    setShowEditReminderModal(false);
  };

  const handleDeleteReminder = (id: string) => {
    const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
    setReminders(updatedReminders);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleReminderClick = (reminder: any) => {
    setSelectedReminder(reminder);
    setShowEditReminderModal(true);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    setShowEventDetailsModal(false);
  };

  const handleAIRequest = () => {
    // For real implementation, here we would call an API for the AI
    const aiSuggestionTypes = [
      {
        type: "schedule-optimization",
        title: "Otimização de Horário",
        description:
          "Posso otimizar seu horário de estudos para melhorar sua produtividade.",
        action: "Otimizar Horário",
      },
      {
        type: "study-plan",
        title: "Plano de Estudos",
        description:
          "Com base em suas tarefas e eventos, posso criar um plano de estudos personalizado.",
        action: "Criar Plano",
      },
      {
        type: "exam-preparation",
        title: "Preparação para Provas",
        description:
          "Vejo que você tem provas chegando. Posso ajudar a organizar sua preparação.",
        action: "Preparar para Provas",
      },
      {
        type: "task-prioritization",
        title: "Priorização de Tarefas",
        description:
          "Posso analisar suas tarefas e ajudar a priorizar as mais importantes.",
        action: "Priorizar Tarefas",
      },
    ];

    setAiSuggestion(
      aiSuggestionTypes[Math.floor(Math.random() * aiSuggestionTypes.length)]
    );
    setShowEpictusAIAssistantModal(true);
  };

  // Empty state checks
  const hasNoEvents = events.length === 0;
  const hasNoTasks = tasks.length === 0;
  const hasNoData = hasNoEvents && hasNoTasks && reminders.length === 0;

  // If no data is loaded yet and empty state, show empty state view
  if (isDataLoaded && hasNoData) {
    return <EmptyStateView />;
  }

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Modals */}
      <EpictusAIAssistantModal
        open={showEpictusAIAssistantModal}
        onClose={() => setShowEpictusAIAssistantModal(false)}
        suggestion={aiSuggestion}
      />

      <EpictusAIModal
        open={showEpictusAIModal}
        onClose={() => setShowEpictusAIModal(false)}
      />

      <EpictusCalendarModal
        open={showEpictusCalendarModal}
        onClose={() => setShowEpictusCalendarModal(false)}
        events={events}
      />

      <EpictusAISuggestionsModal
        open={showEpictusAISuggestionsModal}
        onClose={() => setShowEpictusAISuggestionsModal(false)}
      />

      <AddEventModal
        open={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />

      <AddTaskModal
        open={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAddTask={handleAddTask}
      />

      <AddReminderModal
        open={showAddReminderModal}
        onClose={() => setShowAddReminderModal(false)}
        onAddReminder={handleAddReminder}
      />

      <EditReminderModal
        open={showEditReminderModal}
        onClose={() => setShowEditReminderModal(false)}
        onEditReminder={handleEditReminder}
        onDeleteReminder={handleDeleteReminder}
        reminder={selectedReminder}
      />

      <EventDetailsModal
        open={showEventDetailsModal}
        onClose={() => setShowEventDetailsModal(false)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Agenda
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Organize seus estudos, tarefas e eventos
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowAddEventModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <CalendarRange className="h-4 w-4" />
            Novo Evento
          </Button>
          <Button
            onClick={() => setShowAddTaskModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
          <Button
            onClick={() => setShowAddReminderModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Lembrete
          </Button>
          <Button
            onClick={handleAIRequest}
            className="bg-[#FF6B00] hover:bg-[#FF8736] text-white flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Epictus IA
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="calendar"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
          </TabsList>

          {activeTab === "calendar" && (
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className={`${
                  calendarView === "month" ? "bg-gray-100 dark:bg-gray-800" : ""
                } hidden sm:flex`}
                onClick={() => setCalendarView("month")}
              >
                Mês
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  calendarView === "week" ? "bg-gray-100 dark:bg-gray-800" : ""
                } hidden sm:flex`}
                onClick={() => setCalendarView("week")}
              >
                Semana
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  calendarView === "day" ? "bg-gray-100 dark:bg-gray-800" : ""
                } hidden sm:flex`}
                onClick={() => setCalendarView("day")}
              >
                Dia
              </Button>
              <select
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 sm:hidden"
                value={calendarView}
                onChange={(e) =>
                  setCalendarView(e.target.value as "month" | "week" | "day")
                }
              >
                <option value="month">Mês</option>
                <option value="week">Semana</option>
                <option value="day">Dia</option>
              </select>
            </div>
          )}
        </div>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar section (3/4 width on desktop) */}
            <div className="bg-white dark:bg-[#0A2540] rounded-xl shadow-md p-4 lg:col-span-3 border border-gray-100 dark:border-gray-800">
              {calendarView === "month" && (
                <MonthView
                  events={events}
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                  onEventClick={handleEventClick}
                />
              )}
              {calendarView === "week" && (
                <WeekView
                  events={events}
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                  onEventClick={handleEventClick}
                />
              )}
              {calendarView === "day" && (
                <DayView
                  events={events}
                  selectedDate={selectedDate}
                  onEventClick={handleEventClick}
                />
              )}
            </div>

            {/* Sidebar with cards (1/4 width on desktop) */}
            <div className="space-y-6">
              <UpcomingEventsCard
                events={events}
                onEventClick={handleEventClick}
              />

              <PendingTasksCard
                tasks={tasks}
                onStatusChange={handleUpdateTaskStatus}
              />

              <NotificationsCard
                reminders={reminders}
                onReminderClick={handleReminderClick}
              />

              <FlowSummaryCard />

              <EpictusCalendar
                events={events}
                onShowFull={() => setShowEpictusCalendarModal(true)}
              />
            </div>
          </div>

          <TopMetrics />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksView
            tasks={tasks}
            onAddTask={() => setShowAddTaskModal(true)}
            onStatusChange={handleUpdateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="flow">
          <FlowView />
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengesView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agenda;
