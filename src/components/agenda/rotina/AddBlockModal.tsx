import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

interface AddBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (block: any) => void;
  selectedDate?: Date;
  selectedTime?: number;
}

const AddBlockModal = ({ open, onOpenChange, onAddBlock, selectedDate, selectedTime }: AddBlockModalProps) => {
  const [blockTitle, setBlockTitle] = useState("");
  const [blockDay, setBlockDay] = useState(selectedDate || new Date());
  const [startTime, setStartTime] = useState(selectedTime || 8);
  const [endTime, setEndTime] = useState((selectedTime ? selectedTime + 1 : 9));
  const [blockColor, setBlockColor] = useState("#FF6B00");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setBlockDay(selectedDate);
    }
    if (selectedTime !== undefined) {
      setStartTime(selectedTime);
      setEndTime(selectedTime + 1);
    }
  }, [selectedDate, selectedTime]);

  const handleSubmit = () => {
    if (!blockTitle.trim()) {
      return; // Don't submit if title is empty
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      title: blockTitle,
      day: blockDay,
      startTime: startTime,
      endTime: endTime,
      color: blockColor
    };

    onAddBlock(newBlock);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setBlockTitle("");
    setBlockDay(new Date());
    setStartTime(8);
    setEndTime(9);
    setBlockColor("#FF6B00");
  };

  // Generate time options for select (8:00 - 21:00)
  const timeOptions = Array.from({ length: 14 }, (_, i) => i + 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#001427] text-white border border-[#29335C]/30 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Adicionar Bloco de Rotina</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="block-title" className="text-right">
              Título
            </Label>
            <Input
              id="block-title"
              value={blockTitle}
              onChange={(e) => setBlockTitle(e.target.value)}
              className="col-span-3 bg-[#29335C]/20 border-[#29335C]/30 text-white placeholder:text-gray-400"
              placeholder="Ex: Estudo de Matemática"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="block-day" className="text-right">
              Data
            </Label>
            <div className="col-span-3 flex">
              <Input
                id="block-day"
                value={format(blockDay, "dd/MM/yyyy", { locale: ptBR })}
                readOnly
                className="bg-[#29335C]/20 border-[#29335C]/30 text-white"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="ml-2 border-[#29335C]/30 bg-[#29335C]/20 hover:bg-[#29335C]/30 text-[#FF6B00]"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#001427] border border-[#29335C]/30">
                  <Calendar
                    mode="single"
                    selected={blockDay}
                    onSelect={(date) => date && setBlockDay(date)}
                    className="border-[#29335C]/30"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Horário
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={String(startTime)} onValueChange={(value) => setStartTime(Number(value))}>
                <SelectTrigger className="w-[110px] bg-[#29335C]/20 border-[#29335C]/30 text-white">
                  <SelectValue placeholder="Início" />
                </SelectTrigger>
                <SelectContent className="bg-[#001427] text-white border border-[#29335C]/30">
                  {timeOptions.map((time) => (
                    <SelectItem key={`start-${time}`} value={String(time)}>
                      {time}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>até</span>
              <Select value={String(endTime)} onValueChange={(value) => setEndTime(Number(value))}>
                <SelectTrigger className="w-[110px] bg-[#29335C]/20 border-[#29335C]/30 text-white">
                  <SelectValue placeholder="Fim" />
                </SelectTrigger>
                <SelectContent className="bg-[#001427] text-white border border-[#29335C]/30">
                  {timeOptions.map((time) => (
                    <SelectItem 
                      key={`end-${time}`} 
                      value={String(time)}
                      disabled={time <= startTime}
                    >
                      {time}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="block-color" className="text-right">
              Cor
            </Label>
            <div className="col-span-3">
              <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    id="block-color"
                    variant="outline" 
                    className="w-full flex justify-between items-center bg-[#29335C]/20 border-[#29335C]/30 text-white hover:bg-[#29335C]/30"
                  >
                    <span>Selecionar cor</span>
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20" 
                      style={{ backgroundColor: blockColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 bg-[#001427] border border-[#29335C]/30">
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-400">
                      Cor: <span className="font-mono">{blockColor}</span>
                    </div>
                    <Button size="sm" onClick={() => setColorPickerOpen(false)}>
                      Ok
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[#29335C]/30 text-[#FF6B00] hover:bg-[#29335C]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockModal;