
import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DroppableDay from "./droppable-day";

interface MonthViewProps {
  currentYear: number;
  currentMonth: number;
  selectedDay: Date | null;
  setSelectedDay: (day: Date) => void;
  eventData: Record<number, any[]>;
  getEventIcon: (type: string) => React.ReactNode;
  openEventDetails: (event: any) => void;
  onEventDrop?: (event: any, day: number) => void;
  setCalendarView: (view: string) => void;
  calendarView: string;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentYear,
  currentMonth,
  selectedDay,
  setSelectedDay,
  eventData,
  getEventIcon,
  openEventDetails,
  onEventDrop,
  setCalendarView,
  calendarView,
}) => {
  const [year, setYear] = React.useState(currentYear);
  const [month, setMonth] = React.useState(currentMonth);

  // Ensure calendarView is tracked properly
  React.useEffect(() => {
    // This ensures we update our local state if the parent component
    // updates the calendarView prop
    console.log("Calendar view updated:", calendarView);
  }, [calendarView]);

  const currentDate = new Date(year, month, 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const startDay = monthStart.getDay();

  // Calculate the number of days to show from the previous month
  const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1;

  // Get the previous month's days to display
  const prevMonthDays = [];
  if (daysFromPrevMonth > 0) {
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthLastDay = prevMonth.getDate();
    for (
      let i = prevMonthLastDay - daysFromPrevMonth + 1;
      i <= prevMonthLastDay;
      i++
    ) {
      prevMonthDays.push(new Date(year, month - 1, i));
    }
  }

  // Get the next month's days to display
  const nextMonthDays = [];
  const totalDaysDisplayed = prevMonthDays.length + days.length;
  const daysFromNextMonth = 42 - totalDaysDisplayed; // 6 rows of 7 days = 42
  if (daysFromNextMonth > 0) {
    for (let i = 1; i <= daysFromNextMonth; i++) {
      nextMonthDays.push(new Date(year, month + 1, i));
    }
  }

  // Combine all days
  const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setSelectedDay(today);
  };

  const handleEventDrop = (event: any, day: number) => {
    if (onEventDrop) {
      onEventDrop(event, day);
    }
  };
  
  // Handler para alternar a visualização do calendário
  const handleViewChange = (view: string) => {
    console.log("Changing view to:", view);
    setCalendarView(view);
  };

  // Verificar se há eventos no dia
  const hasEvents = (day: number): boolean => {
    return eventData && eventData[day] && eventData[day].length > 0;
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
      <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg tracking-wide">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none ${calendarView === "day" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
              onClick={() => handleViewChange("day")}
            >
              Dia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none ${calendarView === "week" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
              onClick={() => handleViewChange("week")}
            >
              Semana
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none ${calendarView === "month" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
              onClick={() => handleViewChange("month")}
            >
              Mês
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-white/20 rounded-lg px-3"
              onClick={handleToday}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

        <div className="p-6">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
              (day, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar grid */}
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-7 gap-2">
              {weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const dayNumber = day.getDate();
                  const isCurrentMonthDay = isSameMonth(day, currentDate);
                  const isTodayDay = isToday(day);
                  const dayEvents = isCurrentMonthDay
                    ? eventData[dayNumber] || []
                    : [];
                  const isSelected =
                    selectedDay &&
                    selectedDay.getDate() === dayNumber &&
                    selectedDay.getMonth() === day.getMonth() &&
                    selectedDay.getFullYear() === day.getFullYear();

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="relative group"
                      onClick={() => setSelectedDay(day)}
                    >
                      <DroppableDay
                        day={dayNumber}
                        isCurrentMonth={isCurrentMonthDay}
                        isToday={isTodayDay}
                        isSelected={isSelected}
                        events={dayEvents}
                        onEventClick={openEventDetails}
                        onEventDrop={(event, day) => handleEventDrop(event, day)}
                      />

                    {/* Quick add button that appears on hover or when selected */}
                    {isCurrentMonthDay && (
                      <div
                        className={`absolute bottom-1 right-1 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 rounded-full bg-[#FF6B00] text-white hover:bg-[#FF8C40] shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Here you would trigger the add event modal with this day pre-selected
                            // This assumes you have a function to open the modal with a specific date
                            // For example: openAddEventModal(day);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }),
            )}
            </div>
          </DndProvider>
        </div>
      </div>
    );
};

export default MonthView;
