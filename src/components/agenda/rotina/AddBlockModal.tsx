
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface AddBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (block: any) => void;
  selectedDate?: Date;
  selectedTime?: number;
}

const AddBlockModal: React.FC<AddBlockModalProps> = ({
  open,
  onOpenChange,
  onAddBlock,
  selectedDate = new Date(),
  selectedTime
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [startTime, setStartTime] = useState<string>(
    selectedTime ? `${selectedTime}:00` : "08:00"
  );
  const [endTime, setEndTime] = useState<string>(
    selectedTime ? `${selectedTime + 1}:00` : "09:00"
  );
  const [color, setColor] = useState("#FF6B00");
  const [repetition, setRepetition] = useState("never");

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const handleSubmit = () => {
    // Validar entradas
    if (!title || !date || !startTime || !endTime) {
      // Mostrar erro...
      return;
    }

    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    if (startHour >= endHour) {
      // Mostrar erro...
      return;
    }

    // Criar objeto de bloco de rotina
    const block = {
      id: `block-${Date.now()}`,
      title,
      day: date,
      startTime: startHour,
      endTime: endHour,
      color,
      repetition
    };

    // Enviar para o componente pai
    onAddBlock(block);
    
    // Resetar o formulário e fechar modal
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setDate(selectedDate);
    setStartTime(selectedTime ? `${selectedTime}:00` : "08:00");
    setEndTime(selectedTime ? `${selectedTime + 1}:00` : "09:00");
    setColor("#FF6B00");
    setRepetition("never");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#001427] border-[#29335C]/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#FF6B00]">
            Adicionar Bloco de Rotina
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha os detalhes do seu novo bloco de rotina de estudos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Estudo de Matemática"
              className="border-[#FF6B00]/30 bg-[#29335C]/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-[#FF6B00]/30 bg-[#29335C]/10 text-white justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#FF6B00]" />
                    {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#29335C]" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="rounded-md border border-[#FF6B00]/30"
                    classNames={{
                      day_selected: "bg-[#FF6B00] text-white",
                      day_today: "bg-[#FF6B00]/20 text-white",
                      day: "text-white hover:bg-[#FF6B00]/20"
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Repetir</Label>
              <Select value={repetition} onValueChange={setRepetition}>
                <SelectTrigger className="border-[#FF6B00]/30 bg-[#29335C]/10 text-white">
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent className="bg-[#29335C] text-white border-[#FF6B00]/30">
                  <SelectItem value="never">Nunca (evento único)</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="weekdays">Dias úteis</SelectItem>
                  <SelectItem value="weekends">Fins de semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Hora de início</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="border-[#FF6B00]/30 bg-[#29335C]/10 text-white">
                  <SelectValue placeholder="Horário inicial" />
                </SelectTrigger>
                <SelectContent className="bg-[#29335C] text-white border-[#FF6B00]/30 h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Hora de término</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="border-[#FF6B00]/30 bg-[#29335C]/10 text-white">
                  <SelectValue placeholder="Horário final" />
                </SelectTrigger>
                <SelectContent className="bg-[#29335C] text-white border-[#FF6B00]/30 h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Cor</Label>
            <div className="flex gap-3">
              {["#FF6B00", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B"].map((c) => (
                <div
                  key={c}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                    color === c ? "ring-2 ring-white scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          >
            Adicionar Bloco
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockModal;
