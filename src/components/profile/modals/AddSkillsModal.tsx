
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Save, X } from "lucide-react";

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
    name: "",
    level: 1,
    category: ""
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
    if (!newSkill.name || !newSkill.category) return;
    
    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name,
      level: newSkill.level,
      category: newSkill.category
    };
    
    setSkills([...skills, skill]);
    setNewSkill({ name: "", level: 1, category: "" });
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleSave = () => {
    onSave(skills);
    onClose();
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
      <DialogContent className="max-w-2xl bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-[#29335C] dark:text-white">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#FF6B00]" />
            </div>
            Gerenciar Habilidades
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add new skill form */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <h4 className="font-medium text-[#29335C] dark:text-white">Adicionar Nova Habilidade</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Nome *</Label>
                <Input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="Ex: React, Photoshop, Inglês..."
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Categoria *</Label>
                <Select value={newSkill.category} onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}>
                  <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                    <SelectValue placeholder="Selecione a categoria" />
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
            </div>

            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Nível: {getLevelText(newSkill.level)}
              </Label>
              <Slider
                value={[newSkill.level]}
                onValueChange={(value) => setNewSkill({ ...newSkill, level: value[0] })}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#64748B] dark:text-white/60">
                <span>Iniciante</span>
                <span>Básico</span>
                <span>Intermediário</span>
                <span>Avançado</span>
                <span>Especialista</span>
              </div>
            </div>

            <Button
              onClick={handleAddSkill}
              disabled={!newSkill.name || !newSkill.category}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Habilidade
            </Button>
          </div>

          {/* Skills list */}
          {skills.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-[#29335C] dark:text-white">
                Suas Habilidades ({skills.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-medium text-[#29335C] dark:text-white">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {skill.category}
                          </Badge>
                          <span className="text-xs text-[#64748B] dark:text-white/60">
                            {getLevelText(skill.level)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Habilidades
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
