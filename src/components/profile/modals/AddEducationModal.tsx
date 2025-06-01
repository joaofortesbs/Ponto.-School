
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, GraduationCap } from "lucide-react";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date | null;
  endDate: Date | null;
  current: boolean;
  description: string;
  grade?: string;
}

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (education: Omit<Education, 'id'>) => Promise<boolean>;
}

export default function AddEducationModal({ isOpen, onClose, onSave }: AddEducationModalProps) {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    grade: ''
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      grade: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!formData.institution.trim() || !formData.degree.trim()) {
      return;
    }

    setSaving(true);
    
    const educationData = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field: formData.field.trim(),
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.current ? null : (formData.endDate ? new Date(formData.endDate) : null),
      current: formData.current,
      description: formData.description.trim(),
      grade: formData.grade.trim() || undefined
    };

    const success = await onSave(educationData);
    
    if (success) {
      handleClose();
    }
    
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#0A2540] border-0 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-[#E0E1DD] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white">
                Adicionar Educação
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-[#E0E1DD] dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-medium text-[#29335C] dark:text-white">
                Instituição *
              </Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="ex: Universidade Federal de Pernambuco"
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-sm font-medium text-[#29335C] dark:text-white">
                Grau *
              </Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="ex: Bacharelado, Mestrado"
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field" className="text-sm font-medium text-[#29335C] dark:text-white">
              Área de Estudo
            </Label>
            <Input
              id="field"
              value={formData.field}
              onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
              placeholder="ex: Ciência da Computação"
              className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-[#29335C] dark:text-white">
                Data de Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-[#29335C] dark:text-white">
                Data de Conclusão
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={formData.current}
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="current"
              checked={formData.current}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                current: checked as boolean,
                endDate: checked ? '' : prev.endDate
              }))}
            />
            <Label htmlFor="current" className="text-sm text-[#64748B] dark:text-white/60">
              Atualmente estudando aqui
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium text-[#29335C] dark:text-white">
              Nota/GPA
            </Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              placeholder="ex: 8.5, 3.7 GPA"
              className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-[#29335C] dark:text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva atividades, projetos ou conquistas relevantes..."
              className="min-h-[80px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.institution.trim() || !formData.degree.trim() || saving}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
