import React, { useState } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddBlockModal from "./AddBlockModal";

const RotinaView: React.FC = () => {
  console.log("Renderizando...");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [rotinaBlocks, setRotinaBlocks] = useState([
    {
      id: "1",
      title: "Estudo de Matemática",
      day: new Date(2023, 5, 14), // ano, mês (0-11), dia
      startTime: 10, // Hora (formato 24h)
      endTime: 12,
      color: "#FF6B00"
    },
    {
      id: "2",
      title: "Revisão de Física",
      day: new Date(2023, 5, 16),
      startTime: 14,
      endTime: 16,
      color: "#29335C"
    }
  ]);

  // Obter o início e fim da semana atual
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 0 });

  // Gerar array com todos os dias da semana
  const daysOfWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek
  });

  // Horários para a visualização do calendário (8h às 20h)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  // Navegar para a semana anterior
  const goToPreviousWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  // Navegar para a próxima semana
  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  // Ir para a semana atual
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Função para lidar com a adição de novos blocos
  const handleAddBlock = (newBlock: any) => {
    setRotinaBlocks([...rotinaBlocks, newBlock]);
  };

  // Função para abrir o modal com horário e data selecionados
  const openAddBlockModal = (day: Date, hour: number) => {
    setSelectedDate(day);
    setSelectedTime(hour);
    setShowAddBlockModal(true);
  };

  return (
    <div className="container mx-auto p-0 md:p-4">
      console.log("Renderizando...");
      <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30">
        {/* Header da Seção */}
        <div className="p-4 border-b border-[#29335C]/30 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Minha Rotina Inteligente</h2>
            </div>
          </div>
        </div>

        {/* Controles de navegação */}
        <div className="p-4 bg-[#29335C]/10 flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-2 md:mb-0">
            <h3 className="text-lg font-semibold text-[#FF6B00] mr-3">
              {format(startOfCurrentWeek, "dd 'de' MMMM", { locale: ptBR })} - 
              {format(endOfCurrentWeek, " dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
              Semana {format(currentDate, "w", { locale: ptBR })}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
              onClick={goToToday}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
              onClick={goToNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendário Semanal */}
        <div className="p-4 bg-[#001427] overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-center font-medium text-[#FF6B00] bg-[#29335C]/10 rounded-tl-md">
                Horário
              </div>
              {daysOfWeek.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={index} 
                    className={`p-2 text-center font-medium ${
                      isToday 
                        ? "bg-[#FF6B00]/10 text-[#FF6B00]" 
                        : "bg-[#29335C]/10 text-gray-300"
                    } ${index === 6 ? "rounded-tr-md" : ""}`}
                  >
                    <div>{format(day, "EEE", { locale: ptBR })}</div>
                    <div className={`text-sm ${isToday ? "font-bold" : ""}`}>
                      {format(day, "dd/MM")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grade de horários */}
            {timeSlots.map((hour, hourIndex) => (
              <div 
                key={hourIndex} 
                className={`grid grid-cols-8 gap-1 ${
                  hourIndex === timeSlots.length - 1 ? "rounded-b-md overflow-hidden" : ""
                }`}
              >
                <div className="p-2 text-center text-gray-400 bg-[#29335C]/10 flex items-center justify-center">
                  {hour}:00
                </div>
                {daysOfWeek.map((day, dayIndex) => {
                  // Verificar se existe um bloco para esse horário e dia
                  const block = rotinaBlocks.find(
                    b => 
                      isSameDay(b.day, day) && 
                      b.startTime <= hour && 
                      b.endTime > hour
                  );

                  // Verificar se é o início de um bloco
                  const isBlockStart = block && block.startTime === hour;

                  // Altura do bloco em função da duração
                  const blockDuration = block ? block.endTime - block.startTime : 0;

                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-1 min-h-[60px] border border-[#29335C]/20 ${
                        block 
                          ? "bg-opacity-20 relative" 
                          : "bg-[#001427] hover:bg-[#29335C]/5 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!block) {
                          openAddBlockModal(day, hour);
                        }
                      }}
                    >
                      {isBlockStart && (
                        <div 
                          className="absolute inset-0 m-1 p-2 rounded-md shadow-sm cursor-pointer transition-transform hover:translate-y-[-2px]"
                          style={{ 
                            backgroundColor: `${block.color}20`,
                            borderLeft: `3px solid ${block.color}`,
                            height: `calc(${blockDuration * 60}px - 2px)`,
                            zIndex: 10
                          }}
                        >
                          <div className="font-medium text-sm" style={{ color: block.color }}>
                            {block.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {block.startTime}:00 - {block.endTime}:00
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé com opções */}
        <div className="p-4 border-t border-[#29335C]/30 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Clique em um horário para adicionar um bloco de rotina
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
            onClick={() => setShowAddBlockModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Bloco
          </Button>
        </div>
      </div>

      {/* Botão flutuante para adicionar bloco em telas menores */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg"
          onClick={() => setShowAddBlockModal(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Modal para adicionar novos blocos de rotina */}
      <AddBlockModal 
        open={showAddBlockModal}
        onOpenChange={setShowAddBlockModal}
        onAddBlock={handleAddBlock}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </div>
  );
};

export default RotinaView;