import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X, Settings, Users2, ChevronDown, Plus, Pencil, Camera, Check, Star, Share2, Download, Plug, FileText, Zap, BookOpen, Users, Presentation, Search, Filter, GraduationCap, Brain, Target, Shield } from 'lucide-react';
import CalendarViewSelector from './calendar-view-selector';
import AddEventModal from './add-event-modal';

interface CalendarioSchoolPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Event {
  id: string;
  title: string;
  day: number;
  icon: string;
  selectedLabels: string[];
  labelColors: { [key: string]: string };
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface DayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasActivities: boolean;
  activitiesCount: number;
}

// Configuração milimétrica do card de Calendário School
const CALENDAR_PADDING_HORIZONTAL = 13; // px - Padding horizontal interno
const CALENDAR_PADDING_VERTICAL_TOP = 16; // px - Padding vertical superior
const CALENDAR_PADDING_VERTICAL_BOTTOM = 16; // px - Padding vertical inferior
const CALENDAR_BORDER_RADIUS = 24; // px - Raio das bordas
const CALENDAR_HEADER_PADDING = 16; // px - Padding do header
const CALENDAR_HEADER_BORDER_RADIUS = 24; // px - Raio das bordas do header

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Templates de planejamento fictícios
const PLANNING_TEMPLATES = [
  { id: 1, title: '🔥 ENEM 2026 - Matemática Completa', category: 'ENEM & Vestibulares', description: 'Preparação completa para ENEM com foco em matemática' },
  { id: 2, title: '📐 Geometria Básica - Fund. I', category: 'Ensino Fundamental', description: 'Introdução aos conceitos de geometria' },
  { id: 3, title: '🌍 Biologia Humana Integrada', category: 'Ensino Médio', description: 'Sistema corporal e funções biológicas' },
  { id: 4, title: '⚗️ Química Orgânica - Vestibular', category: 'ENEM & Vestibulares', description: 'Preparação avançada em química' },
  { id: 5, title: '🎨 Projeto Arte & Cultura', category: 'Projetos Interdisciplinares', description: 'Integração de arte com história e culturas' },
  { id: 6, title: '📊 Gestão de Sala - Comportamento', category: 'Gestão de Sala', description: 'Técnicas de manejo de turma e disciplina' },
  { id: 7, title: '💻 Programação Básica', category: 'Matérias', description: 'Introdução à programação com Python' },
  { id: 8, title: '🚀 Projeto STEAM Integrado', category: 'Projetos Interdisciplinares', description: 'Ciência, tecnologia, engenharia e arte combinados' },
  { id: 9, title: '📚 Literatura Brasileira - Clássicos', category: 'Matérias', description: 'Estudo dos clássicos da literatura' },
  { id: 10, title: '✨ Gestão Positiva - Inclusão', category: 'Gestão de Sala', description: 'Estratégias inclusivas e diversidade' },
];

const CATEGORIES = [
  'Ensino Fundamental',
  'Ensino Médio',
  'ENEM & Vestibulares',
  'Gestão de Sala'
];

// Função auxiliar para obter o ícone correto
const getIconComponent = (iconId: string) => {
  const iconMap: { [key: string]: typeof Pencil } = {
    'pencil': Pencil,
    'camera': Camera,
    'check': Check,
    'star': Star,
  };
  return iconMap[iconId] || Pencil;
};

// Função para obter ícone representativo por categoria
const getCategoryIcon = (category: string) => {
  const categoryIconMap: { [key: string]: typeof GraduationCap } = {
    'Ensino Fundamental': GraduationCap,
    'Ensino Médio': Brain,
    'ENEM & Vestibulares': Target,
    'Gestão de Sala': Shield,
    'Meus templates': FileText,
  };
  return categoryIconMap[category] || BookOpen;
};

const CalendarioSchoolPanel: React.FC<CalendarioSchoolPanelProps> = ({
  isOpen,
  onClose
}) => {
  const today = new Date();
  const [headerBounds, setHeaderBounds] = useState({ left: 88, right: 24, top: 96 });

  const detectHeaderBounds = useCallback(() => {
    const headerEl = document.querySelector('[data-header-flutuante="true"]');
    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      if (rect.width > 0) {
        setHeaderBounds({
          left: rect.left,
          right: window.innerWidth - rect.right,
          top: rect.bottom + 16
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      detectHeaderBounds();
      const resizeObserver = new ResizeObserver(detectHeaderBounds);
      const headerEl = document.querySelector('[data-header-flutuante="true"]');
      if (headerEl) {
        resizeObserver.observe(headerEl);
      }
      window.addEventListener('resize', detectHeaderBounds);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', detectHeaderBounds);
      };
    }
  }, [isOpen, detectHeaderBounds]);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [modalSelectedDay, setModalSelectedDay] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [viewAllEventsDay, setViewAllEventsDay] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [selectedPlanningCategory, setSelectedPlanningCategory] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const filterRef = React.useRef<HTMLDivElement>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const calendarDays = useMemo((): DayData[] => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();
    
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    const days: DayData[] = [];
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        hasActivities: false,
        activitiesCount: 0
      });
    }
    
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
      
      const dayEvents = events.filter(e => e.day === day);
      const hasActivities = dayEvents.length > 0;
      const activitiesCount = dayEvents.length;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        hasActivities,
        activitiesCount
      });
    }
    
    const remainingSlots = 35 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasActivities: false,
        activitiesCount: 0
      });
    }
    
    return days;
  }, [currentMonth, currentYear, today, events]);

  const getWeekRange = (date: Date) => {
    const d = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  const getFocusedDate = () => {
    const d = selectedDay || today.getDate();
    return new Date(currentYear, currentMonth, d);
  };

  const goToPrevious = () => {
    if (viewMode === 'day') {
      const focused = getFocusedDate();
      focused.setDate(focused.getDate() - 1);
      setCurrentDate(new Date(focused.getFullYear(), focused.getMonth(), 1));
      setSelectedDay(focused.getDate());
    } else if (viewMode === 'week') {
      const focused = getFocusedDate();
      focused.setDate(focused.getDate() - 7);
      setCurrentDate(new Date(focused.getFullYear(), focused.getMonth(), 1));
      setSelectedDay(focused.getDate());
    } else if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
      setSelectedDay(null);
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
      setSelectedDay(null);
    }
  };

  const goToNext = () => {
    if (viewMode === 'day') {
      const focused = getFocusedDate();
      focused.setDate(focused.getDate() + 1);
      setCurrentDate(new Date(focused.getFullYear(), focused.getMonth(), 1));
      setSelectedDay(focused.getDate());
    } else if (viewMode === 'week') {
      const focused = getFocusedDate();
      focused.setDate(focused.getDate() + 7);
      setCurrentDate(new Date(focused.getFullYear(), focused.getMonth(), 1));
      setSelectedDay(focused.getDate());
    } else if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
      setSelectedDay(null);
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
      setSelectedDay(null);
    }
  };

  const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const getViewTitle = () => {
    if (viewMode === 'day') {
      const d = selectedDay || today.getDate();
      return `${d} de ${MONTHS[currentMonth]} ${currentYear}`;
    } else if (viewMode === 'week') {
      const focused = getFocusedDate();
      const { start, end } = getWeekRange(focused);
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} - ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
    } else if (viewMode === 'year') {
      return `${currentYear}`;
    }
    return `${MONTHS[currentMonth]} ${currentYear}`;
  };

  const handleDayClick = (dayData: DayData) => {
    if (dayData.isCurrentMonth) {
      setSelectedDay(dayData.day);
    }
  };

  const handlePlanClick = () => {
    console.log('🗓️ Planejar clicked - Selected day:', selectedDay);
    setIsPlanningModalOpen(true);
  };

  const filteredTemplates = PLANNING_TEMPLATES.filter(t => {
    const matchesCategory = selectedPlanningCategory ? t.category === selectedPlanningCategory : true;
    const matchesSearch = templateSearch ? t.title.toLowerCase().includes(templateSearch.toLowerCase()) : true;
    return matchesCategory && matchesSearch;
  }).slice(0, 6);

  // Fechar menu ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isMenuOpen || isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen, isFilterOpen]);

  const handleAddIconClick = (e: React.MouseEvent, day: number) => {
    e.stopPropagation(); // Prevenir seleção do dia
    setModalSelectedDay(day);
    setIsAddEventModalOpen(true);
  };

  const handleAddEvent = (title: string, day: number, selectedIcon: string, selectedLabels: string[], labelData: { [key: string]: { name: string; color: string } }, startTime: string | null, endTime: string | null, isAllDay: boolean, repeat: string) => {
    const labelColors: { [key: string]: string } = {};
    selectedLabels.forEach(labelId => {
      if (labelData[labelId]) {
        labelColors[labelId] = labelData[labelId].color;
      }
    });

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      title,
      day,
      icon: selectedIcon,
      selectedLabels,
      labelColors,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      isAllDay,
      repeat: repeat as Event['repeat']
    };
    setEvents([...events, newEvent]);
  };

  const handleEditEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setIsEditEventModalOpen(true);
    }
  };

  const handleUpdateEvent = (title: string, selectedIcon: string, selectedLabels: string[], labelData: { [key: string]: { name: string; color: string } }, startTime: string | null, endTime: string | null, isAllDay: boolean, repeat: string) => {
    if (!editingEvent) return;

    const labelColors: { [key: string]: string } = {};
    selectedLabels.forEach(labelId => {
      if (labelData[labelId]) {
        labelColors[labelId] = labelData[labelId].color;
      }
    });

    const updatedEvent: Event = {
      ...editingEvent,
      title,
      icon: selectedIcon,
      selectedLabels,
      labelColors,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      isAllDay,
      repeat: repeat as Event['repeat']
    };

    setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e));
    setIsEditEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setIsEditEventModalOpen(false);
    setEditingEvent(null);
    console.log('🗑️ Evento deletado');
  };

  const handleEventDragStart = (e: React.DragEvent<HTMLDivElement>, event: Event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEventDragOver = (e: React.DragEvent<HTMLButtonElement> | React.MouseEvent) => {
    if ('preventDefault' in e && 'dataTransfer' in e) {
      (e as React.DragEvent<HTMLButtonElement>).preventDefault();
      (e as React.DragEvent<HTMLButtonElement>).dataTransfer.dropEffect = 'move';
    } else {
      e.preventDefault();
    }
  };

  const handleEventDrop = (e: React.DragEvent<HTMLButtonElement> | React.MouseEvent, newDay: number) => {
    e.preventDefault?.();
    if (!draggedEvent) return;

    setEvents(events.map(ev => 
      ev.id === draggedEvent.id ? { ...ev, day: newDay } : ev
    ));
    setDraggedEvent(null);
    console.log('➡️ Evento movido para dia:', newDay);
  };

  const calendarContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998]"
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="absolute inset-0"
            style={{ 
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'transparent'
            }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed z-[9999] flex flex-col calendar-container"
            style={{ 
              background: '#030C2A',
              borderRadius: `${CALENDAR_BORDER_RADIUS}px`,
              border: '1px solid rgba(255, 107, 0, 0.2)',
              top: `${headerBounds.top}px`,
              left: `${headerBounds.left}px`,
              right: `${headerBounds.right}px`,
              bottom: '16px',
            }}
          >
          <div className="flex items-center justify-between border-b border-[#FF6B00]/20 flex-shrink-0 relative z-50" style={{ padding: `${CALENDAR_HEADER_PADDING}px ${CALENDAR_PADDING_HORIZONTAL}px`, background: '#0a1434', borderRadius: `${CALENDAR_HEADER_BORDER_RADIUS}px ${CALENDAR_HEADER_BORDER_RADIUS}px 0 0` }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255, 107, 0, 0.15)' }}
              >
                <Calendar className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h2 className="text-lg font-bold text-white">Calendário School</h2>
              <CalendarViewSelector activeView={viewMode} onViewChange={setViewMode} />
            </div>
            
            <div className="flex items-center gap-3">
              <div ref={menuRef} style={{ position: 'relative' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>

                {/* Menu Dropdown */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-lg"
                      style={{
                        background: '#0a1434',
                        border: '1px solid rgba(255, 107, 0, 0.3)',
                        zIndex: 10000
                      }}
                    >
                      {[
                        { label: 'Compartilhar', icon: Share2 },
                        { label: 'Exportar', icon: Download },
                        { label: 'Integrações', icon: Plug },
                        { label: 'Templates', icon: FileText }
                      ].map((option) => (
                        <motion.button
                          key={option.label}
                          onClick={() => {
                            console.log(`📋 ${option.label} clicked`);
                            setIsMenuOpen(false);
                          }}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70 hover:text-white transition-all"
                          style={{
                            background: 'transparent',
                            borderLeft: '3px solid transparent'
                          }}
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto relative" style={{ padding: `${CALENDAR_PADDING_VERTICAL_TOP}px ${CALENDAR_PADDING_HORIZONTAL}px` }}>
            <div className="flex items-center justify-between mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPrevious}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <h3 className="text-white font-bold text-lg">
                {getViewTitle()}
              </h3>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNext}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {viewMode === 'day' && (() => {
              const focusDay = selectedDay || today.getDate();
              const focusDate = new Date(currentYear, currentMonth, focusDay);
              const currentHour = today.getHours();
              const dayEvents = events.filter(e => e.day === focusDay && currentMonth === currentDate.getMonth());
              const dayOfWeek = WEEKDAYS[focusDate.getDay()];

              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255, 107, 0, 0.1)' }}>
                    <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)' }}>
                      <span className="text-white text-lg font-bold leading-none">{focusDay}</span>
                      <span className="text-white/80 text-[10px] font-medium uppercase">{dayOfWeek}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{MONTHS[currentMonth]} {currentYear}</p>
                      <p className="text-white/40 text-xs">{dayEvents.length} compromisso(s)</p>
                    </div>
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="mb-4 flex flex-col gap-2">
                      {dayEvents.map((event) => {
                        const IconComp = getIconComponent(event.icon);
                        const labelColor = event.selectedLabels.length > 0 && event.labelColors[event.selectedLabels[0]] ? event.labelColors[event.selectedLabels[0]] : '#999999';
                        return (
                          <motion.div
                            key={event.id}
                            whileHover={{ x: 4 }}
                            onClick={() => handleEditEvent(event.id)}
                            draggable
                            onDragStart={(e) => handleEventDragStart(e, event)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                            style={{ background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 107, 0, 0.2)' }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 107, 0, 0.2)' }}>
                              <IconComp className="w-4 h-4 text-[#FF6B00]" />
                            </div>
                            <span className="text-white text-sm font-medium flex-1 truncate">{event.title}</span>
                            <span className="text-white/40 text-xs ml-auto">{event.isAllDay ? 'Dia todo' : `${event.startTime} - ${event.endTime}`}</span>
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: labelColor }} />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-col">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const isCurrentHour = hour === currentHour && focusDay === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                      return (
                        <div
                          key={hour}
                          className="flex items-stretch relative cursor-pointer hover:bg-white/[0.02] transition-colors"
                          style={{ height: '48px', borderBottom: '1px solid rgba(255, 107, 0, 0.1)' }}
                          onClick={() => { setModalSelectedDay(focusDay); setIsAddEventModalOpen(true); }}
                          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                          onDrop={(e) => { e.preventDefault(); if (draggedEvent) { setEvents(events.map(ev => ev.id === draggedEvent.id ? { ...ev, day: focusDay, startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: `${(hour + 1).toString().padStart(2, '0')}:00`, isAllDay: false } : ev)); setDraggedEvent(null); } }}
                        >
                          <div className="w-16 flex-shrink-0 flex items-center justify-end pr-3">
                            <span className="text-xs text-white/40">{hour.toString().padStart(2, '0')}:00</span>
                          </div>
                          <div className="flex-1 relative" style={{ borderLeft: '1px solid rgba(255, 107, 0, 0.1)' }}>
                            {isCurrentHour && (
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#FF6B00] z-10">
                                <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}

            {viewMode === 'week' && (() => {
              const focused = getFocusedDate();
              const { start } = getWeekRange(focused);
              const currentHour = today.getHours();
              const weekDays = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                return d;
              });

              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="grid gap-0" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
                    <div className="h-12" />
                    {weekDays.map((d, i) => {
                      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                      return (
                        <div
                          key={i}
                          className="h-12 flex flex-col items-center justify-center"
                          style={{
                            borderBottom: '1px solid rgba(255, 107, 0, 0.15)',
                            background: isToday ? 'rgba(255, 107, 0, 0.08)' : 'transparent'
                          }}
                        >
                          <span className="text-[#FF6B00]/70 text-xs font-semibold uppercase">{WEEKDAYS[i]}</span>
                          <span className={`text-sm font-bold ${isToday ? 'text-[#FF6B00]' : 'text-white/80'}`}>{d.getDate()}</span>
                        </div>
                      );
                    })}

                    {Array.from({ length: 18 }, (_, hourIdx) => {
                      const hour = hourIdx + 6;
                      return (
                        <React.Fragment key={hour}>
                          <div className="flex items-center justify-end pr-3" style={{ height: '48px', borderBottom: '1px solid rgba(255, 107, 0, 0.05)' }}>
                            <span className="text-xs text-white/40">{hour.toString().padStart(2, '0')}:00</span>
                          </div>
                          {weekDays.map((d, dayIdx) => {
                            const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                            const isCurrentHourLine = isToday && hour === currentHour;
                            const dayEvts = d.getMonth() === currentMonth ? events.filter(e => e.day === d.getDate()) : [];

                            return (
                              <div
                                key={dayIdx}
                                className="relative cursor-pointer hover:bg-white/[0.02] transition-colors"
                                style={{
                                  height: '48px',
                                  borderBottom: '1px solid rgba(255, 107, 0, 0.05)',
                                  borderLeft: '1px solid rgba(255, 107, 0, 0.05)',
                                  background: isToday ? 'rgba(255, 107, 0, 0.04)' : 'transparent'
                                }}
                                onClick={() => {
                                  setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                                  setSelectedDay(d.getDate());
                                  setModalSelectedDay(d.getDate());
                                  setIsAddEventModalOpen(true);
                                }}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                onDrop={(e) => { e.preventDefault(); if (draggedEvent) { setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1)); setEvents(events.map(ev => ev.id === draggedEvent.id ? { ...ev, day: d.getDate(), startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: `${(hour + 1).toString().padStart(2, '0')}:00`, isAllDay: false } : ev)); setDraggedEvent(null); } }}
                              >
                                {isCurrentHourLine && (
                                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#FF6B00] z-10" />
                                )}
                                {hour === 6 && dayEvts.slice(0, 2).map((event) => {
                                  const IconComp = getIconComponent(event.icon);
                                  return (
                                    <div
                                      key={event.id}
                                      draggable
                                      onDragStart={(e) => { e.stopPropagation(); handleEventDragStart(e as any, event); }}
                                      onClick={(e) => { e.stopPropagation(); handleEditEvent(event.id); }}
                                      className="absolute left-0.5 right-0.5 top-0.5 h-5 text-[10px] font-medium text-white truncate px-1 rounded flex items-center gap-1 cursor-grab active:cursor-grabbing hover:opacity-80"
                                      style={{ background: 'rgba(255, 107, 0, 0.25)', zIndex: 5 }}
                                    >
                                      <IconComp className="w-2.5 h-2.5 flex-shrink-0" />
                                      <span className="truncate">{event.isAllDay ? event.title : `${event.startTime} ${event.title}`}</span>
                                    </div>
                                  );
                                })}
                                {hour === 6 && dayEvts.length > 2 && (
                                  <div
                                    className="absolute left-0.5 right-0.5 top-6 h-4 text-[9px] font-semibold text-[#FF6B00] flex items-center justify-center rounded"
                                    style={{ background: 'rgba(255, 107, 0, 0.1)', zIndex: 5 }}
                                  >
                                    +{dayEvts.length - 2}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}

            {viewMode === 'month' && (
              <>
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {WEEKDAYS.map((day) => (
                    <div 
                      key={day} 
                      className="h-10 flex items-center justify-center text-[#FF6B00]/70 text-sm font-semibold uppercase tracking-wide"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((dayData, index) => {
                const isSelected = selectedDay === dayData.day && dayData.isCurrentMonth;
                const isHovered = hoveredDay === dayData.day && dayData.isCurrentMonth;
                
                return (
                  <motion.button
                    key={`${dayData.day}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: dayData.isCurrentMonth ? 1.05 : 1 }}
                    whileTap={{ scale: dayData.isCurrentMonth ? 0.95 : 1 }}
                    onClick={() => handleDayClick(dayData)}
                    onMouseEnter={() => dayData.isCurrentMonth && setHoveredDay(dayData.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onDragOver={(e: any) => handleEventDragOver(e)}
                    onDrop={(e: any) => handleEventDrop(e, dayData.day)}
                    disabled={!dayData.isCurrentMonth}
                    className={`
                      relative h-32 flex flex-col items-center justify-start pt-2 transition-all duration-200 rounded-2xl
                      ${dayData.isCurrentMonth 
                        ? 'cursor-pointer' 
                        : 'cursor-default opacity-30'
                      }
                    `}
                    style={{
                      borderRadius: '16px',
                      background: isSelected 
                        ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                        : dayData.isToday 
                          ? 'rgba(255, 107, 0, 0.15)'
                          : 'rgba(26, 43, 60, 0.5)',
                      border: dayData.isToday && !isSelected
                        ? '2px solid rgba(255, 107, 0, 0.5)'
                        : dayData.isCurrentMonth 
                          ? '2px solid rgba(255, 107, 0, 0.2)'
                          : '1px solid rgba(255, 107, 0, 0.05)',
                      boxShadow: isSelected 
                        ? '0 4px 15px rgba(255, 107, 0, 0.4)'
                        : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {dayData.isCurrentMonth && (
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-1 right-1 z-10"
                            onClick={(e) => handleAddIconClick(e, dayData.day)}
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                              style={{
                                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                                boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)'
                              }}
                            >
                              <Plus className="w-3.5 h-3.5 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    <span 
                      className={`
                        text-sm font-medium
                        ${isSelected 
                          ? 'text-white' 
                          : dayData.isToday 
                            ? 'text-[#FF6B00]' 
                            : dayData.isCurrentMonth 
                              ? 'text-white/80' 
                              : 'text-white/20'
                        }
                      `}
                    >
                      {dayData.day}
                    </span>
                    
                    {dayData.hasActivities && dayData.isCurrentMonth && (
                      <div className="flex-1 w-full px-1 mt-1 flex flex-col gap-1 overflow-hidden">
                        {events.filter(e => e.day === dayData.day).slice(0, 2).map((event) => {
                          const IconComponent = getIconComponent(event.icon);
                          const labelColor = event.selectedLabels.length > 0 && event.labelColors[event.selectedLabels[0]] 
                            ? event.labelColors[event.selectedLabels[0]]
                            : '#999999';
                          
                          return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={(e) => handleEventDragStart(e, event)}
                              onClick={() => handleEditEvent(event.id)}
                              className="w-full h-6 text-xs font-medium text-white truncate px-2 rounded-full flex items-center justify-between cursor-grab active:cursor-grabbing hover:opacity-80 transition-all"
                              style={{
                                background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 107, 0, 0.15)',
                                overflow: 'hidden',
                                opacity: draggedEvent?.id === event.id ? 0.5 : 1
                              }}
                              title={`${event.title} - Clique para editar, arraste para mover`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <IconComponent className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{event.title}</span>
                              </div>
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0 ml-1"
                                style={{ background: labelColor }}
                              />
                            </div>
                          );
                        })}
                        {dayData.activitiesCount > 2 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewAllEventsDay(dayData.day);
                            }}
                            className="w-full h-6 text-xs font-semibold text-white px-2 rounded-full cursor-pointer hover:opacity-80 transition-all flex items-center justify-center"
                            style={{
                              background: 'rgba(255, 107, 0, 0.2)',
                              border: '1px solid rgba(255, 107, 0, 0.4)'
                            }}
                          >
                            +{dayData.activitiesCount - 2}
                          </motion.button>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
                </div>
              </>
            )}

            {viewMode === 'year' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 12 }, (_, monthIdx) => {
                  const isCurrentMonthCell = monthIdx === today.getMonth() && currentYear === today.getFullYear();
                  const firstDay = new Date(currentYear, monthIdx, 1).getDay();
                  const totalDays = new Date(currentYear, monthIdx + 1, 0).getDate();
                  const miniDays = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: totalDays }, (_, d) => d + 1));

                  return (
                    <motion.div
                      key={monthIdx}
                      whileHover={{ scale: 1.03, y: -2 }}
                      onClick={() => {
                        setCurrentDate(new Date(currentYear, monthIdx, 1));
                        setSelectedDay(null);
                        setViewMode('month');
                      }}
                      className="p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: 'rgba(26, 43, 60, 0.5)',
                        border: isCurrentMonthCell ? '2px solid rgba(255, 107, 0, 0.5)' : '1px solid rgba(255, 107, 0, 0.15)',
                        boxShadow: isCurrentMonthCell ? '0 0 12px rgba(255, 107, 0, 0.15)' : 'none'
                      }}
                    >
                      <p className={`text-xs font-semibold mb-2 ${isCurrentMonthCell ? 'text-[#FF6B00]' : 'text-white/80'}`}>
                        {MONTHS[monthIdx]}
                      </p>
                      <div className="grid grid-cols-7 gap-px">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((wd, i) => (
                          <div key={i} className="text-[8px] text-[#FF6B00]/50 text-center font-medium">{wd}</div>
                        ))}
                        {miniDays.map((day, i) => {
                          if (day === null) return <div key={`empty-${i}`} className="h-3.5" />;
                          const isTodayCell = day === today.getDate() && monthIdx === today.getMonth() && currentYear === today.getFullYear();
                          const hasEvents = events.some(e => e.day === day && monthIdx === currentMonth);
                          return (
                            <div key={i} className="h-3.5 flex flex-col items-center justify-center relative">
                              <span
                                className={`text-[10px] leading-none ${isTodayCell ? 'text-[#FF6B00] font-bold' : 'text-white/60'}`}
                                style={isTodayCell ? { background: 'rgba(255, 107, 0, 0.2)', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}
                              >
                                {day}
                              </span>
                              {hasEvents && (
                                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#FF6B00]" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Modal de adicionar evento */}
            <AnimatePresence>
              {isAddEventModalOpen && (
                <AddEventModal
                  isOpen={isAddEventModalOpen}
                  onClose={() => setIsAddEventModalOpen(false)}
                  selectedDay={modalSelectedDay}
                  onAddEvent={handleAddEvent}
                />
              )}
            </AnimatePresence>

            {/* Modal de editar evento */}
            <AnimatePresence>
              {isEditEventModalOpen && editingEvent && (
                <AddEventModal
                  isOpen={isEditEventModalOpen}
                  onClose={() => {
                    setIsEditEventModalOpen(false);
                    setEditingEvent(null);
                  }}
                  selectedDay={editingEvent.day}
                  onAddEvent={handleAddEvent}
                  isEditing={true}
                  editingEvent={editingEvent}
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}
            </AnimatePresence>

            {/* Modal de visualizar todos os eventos do dia */}
            <AnimatePresence>
              {viewAllEventsDay !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setViewAllEventsDay(null)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-br rounded-3xl p-6 max-w-lg w-full max-h-96 overflow-y-auto shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(3, 12, 42, 0.95) 0%, rgba(10, 21, 52, 0.95) 100%)',
                      border: '1px solid rgba(255, 107, 0, 0.2)'
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                      <h2 className="text-xl font-bold text-white">
                        Compromissos do dia {viewAllEventsDay}
                      </h2>
                      <motion.button
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setViewAllEventsDay(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>

                    {/* Lista de eventos */}
                    <div className="flex flex-col gap-3">
                      {events.filter(e => e.day === viewAllEventsDay).map((event) => {
                        const IconComponent = getIconComponent(event.icon);
                        const labelColor = event.selectedLabels.length > 0 && event.labelColors[event.selectedLabels[0]] 
                          ? event.labelColors[event.selectedLabels[0]]
                          : '#999999';

                        return (
                          <motion.div
                            key={event.id}
                            whileHover={{ x: 4 }}
                            draggable
                            onDragStart={(e) => handleEventDragStart(e, event)}
                            onClick={() => {
                              handleEditEvent(event.id);
                              setViewAllEventsDay(null);
                            }}
                            className="w-full text-sm font-medium text-white px-3 py-2 rounded-full flex items-center justify-between cursor-grab active:cursor-grabbing hover:opacity-90 transition-all"
                            style={{
                              background: 'rgba(255, 107, 0, 0.2)',
                              border: '1px solid rgba(255, 107, 0, 0.3)',
                              opacity: draggedEvent?.id === event.id ? 0.5 : 1
                            }}
                            title={`${event.title} - Clique para editar, arraste para mover`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <IconComponent className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
                              style={{ background: labelColor }}
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Footer info */}
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                      <p className="text-xs text-white/60">
                        Total: {events.filter(e => e.day === viewAllEventsDay).length} compromisso(s)
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de Planejamento */}
      <AnimatePresence>
        {isPlanningModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsPlanningModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br rounded-3xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(3, 12, 42, 0.95) 0%, rgba(10, 21, 52, 0.95) 100%)',
              border: '1px solid rgba(255, 107, 0, 0.2)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="text-2xl font-bold text-white">Escolha seu planejamento:</h2>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsPlanningModalOpen(false);
                  setSelectedPlanningCategory(null);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Card Gerar Planejamento Max */}
            <motion.div
              whileHover={{ y: -4 }}
              className="mb-6 p-5 rounded-2xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                boxShadow: '0 8px 24px rgba(255, 107, 0, 0.3)'
              }}
              onClick={() => console.log('Gerar Planejamento Max clicked')}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-white flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white">Gerar Planejamento Max</h3>
                  <p className="text-sm text-white/90">IA realiza planejamento completo com contexto</p>
                </div>
              </div>
            </motion.div>

            {/* Templates - Título */}
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#FF6B00]" />
              <h3 className="text-2xl font-bold text-white">Templates</h3>
            </div>

            {/* Barra de Pesquisa + Filtro */}
            <div className="mb-6 flex items-center gap-3" ref={filterRef}>
              {/* Input de Pesquisa */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Pesquisar templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-sm text-white transition-all"
                  style={{
                    background: 'rgba(255, 107, 0, 0.15)',
                    border: '1px solid rgba(255, 107, 0, 0.3)',
                    color: 'white'
                  }}
                />
              </div>

              {/* Botão Filtro Circular */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                  style={{
                    background: 'rgba(255, 107, 0, 0.15)',
                    border: '1px solid rgba(255, 107, 0, 0.3)'
                  }}
                >
                  <Filter className="w-5 h-5 text-[#FF6B00]" />
                </motion.button>

                {/* Dropdown de Categorias */}
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 rounded-xl shadow-xl min-w-max"
                      style={{
                        background: 'linear-gradient(135deg, rgba(3, 12, 42, 0.98) 0%, rgba(10, 21, 52, 0.98) 100%)',
                        border: '1px solid rgba(255, 107, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 9999
                      }}
                    >
                      {/* Todos */}
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setSelectedPlanningCategory(null);
                          setIsFilterOpen(false);
                        }}
                        className="w-full px-4 py-3 text-sm text-white text-left flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/10"
                        style={{
                          background: selectedPlanningCategory === null 
                            ? 'rgba(255, 107, 0, 0.2)'
                            : 'transparent',
                          borderLeft: selectedPlanningCategory === null
                            ? '3px solid #FF6B00'
                            : '3px solid transparent'
                        }}
                      >
                        <Calendar className="w-4 h-4 text-[#FF6B00]" />
                        Todos
                      </motion.button>

                      {/* Meus templates */}
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setSelectedPlanningCategory('Meus templates');
                          setIsFilterOpen(false);
                        }}
                        className="w-full px-4 py-3 text-sm text-white text-left flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/10"
                        style={{
                          background: selectedPlanningCategory === 'Meus templates' 
                            ? 'rgba(255, 107, 0, 0.2)'
                            : 'transparent'
                        }}
                      >
                        <FileText className="w-4 h-4 text-[#FF6B00]" />
                        Meus templates
                      </motion.button>

                      {/* Categorias */}
                      {CATEGORIES.map((category) => {
                        const IconComponent = getCategoryIcon(category);
                        return (
                          <motion.button
                            key={category}
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              setSelectedPlanningCategory(category);
                              setIsFilterOpen(false);
                            }}
                            className="w-full px-4 py-3 text-sm text-white text-left flex items-center gap-3 hover:bg-white/5 transition-colors"
                            style={{
                              background: selectedPlanningCategory === category 
                                ? 'rgba(255, 107, 0, 0.2)'
                                : 'transparent',
                              borderBottom: category !== CATEGORIES[CATEGORIES.length - 1] 
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : 'none'
                            }}
                          >
                            <IconComponent className="w-4 h-4 text-[#FF6B00]" />
                            {category}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(255, 107, 0, 0.2)' }}
                  onClick={() => console.log('Template selecionado:', template.title)}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'rgba(255, 107, 0, 0.08)',
                    border: '1px solid rgba(255, 107, 0, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <h4 className="font-semibold text-white mb-1">{template.title}</h4>
                  <p className="text-xs text-white/70">{template.category}</p>
                </motion.div>
              ))}
            </div>

            {/* Info Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-white/60">
                {filteredTemplates.length} template(s) disponível(is)
              </p>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(calendarContent, document.body);
};

export default CalendarioSchoolPanel;
