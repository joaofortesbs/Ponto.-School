
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Zap, Star } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface AddSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skills: Skill[]) => void;
  existingSkills: Skill[];
}

export default function AddSkillsModal({ isOpen, onClose, onSave, existingSkills }: AddSkillsModalProps) {
  const [skills, setSkills] = useState<Skill[]>(existingSkills);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 1,
    category: ''
  });

  const categories = [
    "Programação",
    "Design",
    "Marketing",
    "Gestão",
    "Comunicação",
    "Idiomas",
    "Análise de Dados"
  ];

  const handleAddSkill = () => {
    if (!newSkill.name.trim() || !newSkill.category) return;

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: newSkill.category
    };

    setSkills([...skills, skill]);
    setNewSkill({ name: '', level: 1, category: '' });
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const handleSave = () => {
    onSave(skills);
    onClose();
  };

  const renderStars = (level: number, onLevelChange?: (level: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 cursor-pointer transition-colors ${
              star <= level
                ? "fill-[#FF6B00] text-[#FF6B00]"
                : "text-gray-300 dark:text-gray-600 hover:text-[#FF6B00]"
            }`}
            onClick={() => onLevelChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const getLevelText = (level: number) => {
    if (level <= 1) return "Iniciante";
    if (level <= 2) return "Básico";
    if (level <= 3) return "Intermediário";
    if (level <= 4) return "Avançado";
    return "Especialista";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#0A2540] border-0 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-[#E0E1DD] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white">
                Gerenciar Habilidades
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-[#E0E1DD] dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-6 py-6">
          {/* Formulário para adicionar nova habilidade */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <h3 className="text-sm font-medium text-[#29335C] dark:text-white">
              Adicionar Nova Habilidade
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillName" className="text-xs font-medium text-[#64748B] dark:text-white/60">
                  Nome da Habilidade
                </Label>
                <Input
                  id="skillName"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: JavaScript, Photoshop"
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skillCategory" className="text-xs font-medium text-[#64748B] dark:text-white/60">
                  Categoria
                </Label>
                <Select value={newSkill.category} onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#64748B] dark:text-white/60">
                  Nível ({getLevelText(newSkill.level)})
                </Label>
                <div className="flex items-center justify-center pt-1">
                  {renderStars(newSkill.level, (level) => setNewSkill(prev => ({ ...prev, level })))}
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleAddSkill}
              disabled={!newSkill.name.trim() || !newSkill.category}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Adicionar Habilidade
            </Button>
          </div>

          {/* Lista de habilidades */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-medium text-[#29335C] dark:text-white mb-4">
              Suas Habilidades ({skills.length})
            </h3>
            
            {skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#29335C] dark:text-white text-sm">
                          {skill.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-white/60 mb-2">
                      <span>{skill.category}</span>
                      <span>{getLevelText(skill.level)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {renderStars(skill.level)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#E0E1DD] dark:border-white/10 rounded-2xl">
                <Zap className="h-12 w-12 text-[#64748B] dark:text-white/40 mx-auto mb-3" />
                <p className="text-[#64748B] dark:text-white/60 text-sm">
                  Nenhuma habilidade adicionada ainda
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            Salvar Habilidades
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
