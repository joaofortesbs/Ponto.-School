
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, GraduationCap, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserEducation } from "@/services/profileDataService";

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (education: Omit<UserEducation, 'id'>) => void;
}

export default function AddEducationModal({ isOpen, onClose, onSave }: AddEducationModalProps) {
  const [formData, setFormData] = useState<Omit<UserEducation, 'id'>>({
    institution: "",
    degree: "",
    field: "",
    start_date: null,
    end_date: null,
    current: false,
    description: "",
    grade: ""
  });

  const degreeTypes = [
    "Ensino Fundamental",
    "Ensino Médio",
    "Técnico",
    "Tecnólogo",
    "Bacharelado",
    "Licenciatura",
    "Especialização",
    "MBA",
    "Mestrado",
    "Doutorado",
    "Pós-Doutorado"
  ];

  const handleSave = () => {
    if (!formData.institution || !formData.degree) return;
    
    onSave(formData);
    setFormData({
      institution: "",
      degree: "",
      field: "",
      start_date: null,
      end_date: null,
      current: false,
      description: "",
      grade: ""
    });
    onClose();
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setFormData({ ...formData, start_date: date ? date.toISOString().split('T')[0] : null });
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setFormData({ ...formData, end_date: date ? date.toISOString().split('T')[0] : null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-[#29335C] dark:text-white">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-[#FF6B00]" />
            </div>
            Adicionar Educação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Instituição *
              </Label>
              <Input
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Ex: Universidade de São Paulo"
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Tipo de Curso *
              </Label>
              <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {degreeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#29335C] dark:text-white font-medium">
              Área de Estudo
            </Label>
            <Input
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              placeholder="Ex: Engenharia de Software, Medicina, Administração..."
              className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Data de Início
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(new Date(formData.start_date), "PPP", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={handleStartDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Data de Conclusão
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="current"
                    checked={formData.current}
                    onChange={(e) => setFormData({ ...formData, current: e.target.checked, end_date: e.target.checked ? null : formData.end_date })}
                    className="rounded border-[#E0E1DD] focus:ring-[#FF6B00]"
                  />
                  <Label htmlFor="current" className="text-sm text-[#64748B] dark:text-white/60">
                    Estou cursando atualmente
                  </Label>
                </div>
                {!formData.current && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(new Date(formData.end_date), "PPP", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={handleEndDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#29335C] dark:text-white font-medium">
              Nota/CRA (opcional)
            </Label>
            <Input
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              placeholder="Ex: 8.5, A, Summa Cum Laude..."
              className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#29335C] dark:text-white font-medium">
              Descrição (opcional)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva atividades relevantes, projetos, conquistas..."
              className="min-h-[100px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:border-[#29335C] hover:text-[#29335C]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.institution || !formData.degree}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Educação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
