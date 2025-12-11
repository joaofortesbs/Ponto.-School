import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X, Clock, MoreVertical, Users2, ChevronDown, Plus, Sparkles, Pencil, Camera, Check, Star } from 'lucide-react';
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

const CalendarioSchoolPanel: React.FC<CalendarioSchoolPanelProps> = ({
  isOpen,
  onClose
}) => {
  const today = new Date();
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

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (dayData: DayData) => {
    if (dayData.isCurrentMonth) {
      setSelectedDay(dayData.day);
    }
  };

  const handlePlanClick = () => {
    console.log('🗓️ Planejar clicked - Selected day:', selectedDay);
  };

  const handleAddIconClick = (e: React.MouseEvent, day: number) => {
    e.stopPropagation(); // Prevenir seleção do dia
    setModalSelectedDay(day);
    setIsAddEventModalOpen(true);
  };

  const handleAddEvent = (title: string, day: number, selectedIcon: string, selectedLabels: string[], labelData: { [key: string]: { name: string; color: string } }) => {
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
      labelColors
    };
    setEvents([...events, newEvent]);
    console.log('📅 Novo evento adicionado:', { title, day, month: MONTHS[currentMonth], year: currentYear, icon: selectedIcon, labels: selectedLabels });
  };

  const handleEditEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setIsEditEventModalOpen(true);
    }
  };

  const handleUpdateEvent = (title: string, selectedIcon: string, selectedLabels: string[], labelData: { [key: string]: { name: string; color: string } }) => {
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
      labelColors
    };

    setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e));
    setIsEditEventModalOpen(false);
    setEditingEvent(null);
    console.log('📝 Evento atualizado:', { title, icon: selectedIcon, labels: selectedLabels });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setIsEditEventModalOpen(false);
    setEditingEvent(null);
    console.log('🗑️ Evento deletado');
  };

  const handleEventDragStart = (e: React.DragEvent, event: Event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEventDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEventDrop = (e: React.DragEvent, newDay: number) => {
    e.preventDefault();
    if (!draggedEvent || !draggedEvent) return;

    setEvents(events.map(ev => 
      ev.id === draggedEvent.id ? { ...ev, day: newDay } : ev
    ));
    setDraggedEvent(null);
    console.log('➡️ Evento movido para dia:', newDay);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring',
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
          className="absolute inset-0 z-40 flex flex-col calendar-container"
          style={{ 
            background: '#030C2A',
            borderRadius: `${CALENDAR_BORDER_RADIUS}px`,
            border: '1px solid rgba(255, 107, 0, 0.2)',
            margin: `0 ${CALENDAR_PADDING_HORIZONTAL}px`,
            maxWidth: `calc(100% - ${CALENDAR_PADDING_HORIZONTAL * 2}px)`
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
            </div>
            
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <CalendarViewSelector activeView={viewMode} onViewChange={setViewMode} />
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <Clock className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(255, 107, 0, 0.1)',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  paddingLeft: '40px'
                }}
              >
                <div 
                  className="absolute left-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                    zIndex: 10,
                    boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)'
                  }}
                >
                  <Users2 className="w-4 h-4" />
                </div>
                <span style={{ marginLeft: '12px' }}>1° Ano</span>
                <ChevronDown className="w-4 h-4" style={{ marginLeft: '6px' }} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlanClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)'
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Planejar</span>
              </motion.button>
              
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
                    whileHover={{ scale: dayData.isCurrentMonth ? 1.05 : 1 }}
                    whileTap={{ scale: dayData.isCurrentMonth ? 0.95 : 1 }}
                    onClick={() => handleDayClick(dayData)}
                    onMouseEnter={() => dayData.isCurrentMonth && setHoveredDay(dayData.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onDragOver={(e) => handleEventDragOver(e)}
                    onDrop={(e) => handleEventDrop(e, dayData.day)}
                    disabled={!dayData.isCurrentMonth}
                    className={`
                      relative h-24 flex flex-col items-center justify-start pt-2 transition-all duration-200
                      ${dayData.isCurrentMonth 
                        ? 'cursor-pointer' 
                        : 'cursor-default opacity-30'
                      }
                    `}
                    style={{
                      borderRadius: '12px',
                      background: isSelected 
                        ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                        : dayData.isToday 
                          ? 'rgba(255, 107, 0, 0.15)'
                          : '#0A1434',
                      border: dayData.isToday && !isSelected
                        ? '2px solid rgba(255, 107, 0, 0.5)'
                        : dayData.isCurrentMonth 
                          ? '1px solid rgba(255, 107, 0, 0.2)'
                          : '1px solid rgba(255, 107, 0, 0.05)',
                      boxShadow: isSelected 
                        ? '0 4px 15px rgba(255, 107, 0, 0.4)'
                        : 'none'
                    }}
                  >
                    {/* Ícone de Adicionar (+) - aparece no hover */}
                    <AnimatePresence>
                      {isHovered && dayData.isCurrentMonth && (
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
                    
                    {/* Eventos do dia */}
                    {dayData.hasActivities && dayData.isCurrentMonth && (
                      <div className="flex-1 w-full px-1 mt-1 flex flex-col gap-1">
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
                              className="w-full text-xs font-medium text-white truncate px-1 py-0.5 rounded flex items-center justify-between cursor-grab active:cursor-grabbing hover:opacity-80 transition-all"
                              style={{
                                background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 107, 0, 0.15)',
                                overflow: 'hidden',
                                opacity: draggedEvent?.id === event.id ? 0.5 : 1
                              }}
                              title={`${event.title} - Clique para editar, arraste para mover`}
                            >
                              <div className="flex items-center gap-1 min-w-0 flex-1">
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
                          <div className="text-xs text-white/60 px-1">
                            +{dayData.activitiesCount - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendarioSchoolPanel;
