import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Calendar as CalendarIcon,
  CalendarRange,
  CheckSquare,
  Clock,
  Wand2,
} from "lucide-react";

interface EpictusCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EpictusCalendarModal: React.FC<EpictusCalendarModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#001427] to-[#29335C] text-white border-none">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Epictus Calendário
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Deixe a IA organizar seu calendário de forma inteligente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-[#29335C]/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">
              O que você deseja fazer?
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30 h-auto py-3"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <CalendarRange className="h-4 w-4 mr-2 text-[#FF6B00]" />
                    <span className="font-medium">Organizar Calendário</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 ml-6">
                    Otimize seu tempo com IA
                  </span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30 h-auto py-3"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <CheckSquare className="h-4 w-4 mr-2 text-[#FF6B00]" />
                    <span className="font-medium">Criar Checklist</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 ml-6">
                    Para suas tarefas diárias
                  </span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30 h-auto py-3"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-[#FF6B00]" />
                    <span className="font-medium">Planejar Estudos</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 ml-6">
                    Horários otimizados
                  </span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30 h-auto py-3"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-[#FF6B00]" />
                    <span className="font-medium">Configurar Lembretes</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 ml-6">
                    Notificações inteligentes
                  </span>
                </div>
              </Button>
            </div>
          </div>

          <div className="bg-[#29335C]/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">
              Período para organizar
            </h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs text-gray-400 mb-1 block">
                  Data inicial
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#29335C] text-white hover:bg-[#29335C]/30"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) =>
                        setDateRange({ ...dateRange, from: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-gray-400 mb-1 block">
                  Data final
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-[#29335C] text-white hover:bg-[#29335C]/30"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        format(dateRange.to, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) =>
                        setDateRange({ ...dateRange, to: date })
                      }
                      initialFocus
                      disabled={(date) =>
                        dateRange.from ? date < dateRange.from : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            className="border-[#29335C] text-white hover:bg-[#29335C]/30"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            <Wand2 className="h-4 w-4 mr-1" /> Aplicar IA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpictusCalendarModal;
