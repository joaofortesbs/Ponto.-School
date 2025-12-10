import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarioSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasActivities: boolean;
  activitiesCount: number;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CalendarioSchoolModal: React.FC<CalendarioSchoolModalProps> = ({
  isOpen,
  onClose
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

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
      
      const hasActivities = [3, 7, 12, 15, 18, 22, 28].includes(day);
      const activitiesCount = hasActivities ? Math.floor(Math.random() * 3) + 1 : 0;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        hasActivities,
        activitiesCount
      });
    }
    
    const remainingSlots = 42 - days.length;
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
  }, [currentMonth, currentYear, today]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="bg-[#0D1B2A] border border-[#FF6B00]/30 shadow-2xl overflow-hidden w-full"
              style={{ 
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.1)',
                maxWidth: '680px',
                pointerEvents: 'auto'
              }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#FF6B00]/20">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255, 107, 0, 0.15)' }}
                  >
                    <Calendar className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Calendário School</h2>
                </div>
                
                <div className="flex items-center gap-3">
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              <div className="px-8 py-6">
                <div className="flex items-center justify-between mb-8">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousMonth}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  
                  <h3 className="text-white font-semibold text-base">
                    {MONTHS[currentMonth]} {currentYear}
                  </h3>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextMonth}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
                
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
                    
                    return (
                      <motion.button
                        key={`${dayData.day}-${index}`}
                        whileHover={{ scale: dayData.isCurrentMonth ? 1.05 : 1 }}
                        whileTap={{ scale: dayData.isCurrentMonth ? 0.95 : 1 }}
                        onClick={() => handleDayClick(dayData)}
                        disabled={!dayData.isCurrentMonth}
                        className={`
                          relative h-14 flex flex-col items-center justify-center transition-all duration-200
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
                              : 'rgba(26, 43, 60, 0.6)',
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
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: Math.min(dayData.activitiesCount, 3) }).map((_, i) => (
                              <div 
                                key={i}
                                className={`w-1 h-1 rounded-full ${
                                  isSelected ? 'bg-white/80' : 'bg-[#FF6B00]'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-[#FF6B00]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-md bg-[#1A2B3C] border border-[#FF6B00]/20" />
                      <span>Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-md border-2 border-[#FF6B00]/50" />
                      <span>Hoje</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                      <span>Atividades</span>
                    </div>
                  </div>
                  
                  <span className="text-xs text-white/40">
                    {selectedDay ? `${selectedDay} de ${MONTHS[currentMonth]}` : 'Selecione um dia'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CalendarioSchoolModal;
