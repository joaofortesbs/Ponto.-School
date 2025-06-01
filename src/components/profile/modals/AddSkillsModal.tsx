
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Star } from "lucide-react";
import { UserSkill } from "@/services/profileDataService";

interface AddSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skills: UserSkill[]) => void;
  existingSkills: UserSkill[];
}

export default function AddSkillsModal({ isOpen, onClose, onSave, existingSkills }: AddSkillsModalProps) {
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [skillLevel, setSkillLevel] = useState(1);
  const [tempSkills, setTempSkills] = useState<UserSkill[]>([]);

  const categories = [
    "Programação",
    "Design",
    "Marketing",
    "Gestão",
    "Comunicação",
    "Idiomas",
    "Análise de Dados"
  ];

  const addSkill = () => {
    if (!skillName || !skillCategory) return;

    const newSkill: UserSkill = {
      id: Date.now().toString(),
      name: skillName,
      category: skillCategory,
      level: skillLevel
    };

    setTempSkills([...tempSkills, newSkill]);
    setSkillName("");
    setSkillCategory("");
    setSkillLevel(1);
  };

  const removeSkill = (id: string) => {
    setTempSkills(tempSkills.filter(skill => skill.id !== id));
  };

  const handleSave = () => {
    const allSkills = [...existingSkills, ...tempSkills];
    onSave(allSkills);
    setTempSkills([]);
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
            Adicionar Habilidades
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Habilidade
              </Label>
              <Input
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Ex: React, Photoshop..."
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Categoria
              </Label>
              <Select value={skillCategory} onValueChange={setSkillCategory}>
                <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                  <SelectValue placeholder="Selecione" />
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
              <Label className="text-[#29335C] dark:text-white font-medium">
                Nível
              </Label>
              <Select value={skillLevel.toString()} onValueChange={(value) => setSkillLevel(parseInt(value))}>
                <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {getLevelText(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={addSkill}
            disabled={!skillName || !skillCategory}
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Habilidade
          </Button>

          {tempSkills.length > 0 && (
            <div className="space-y-3 border-t border-[#E0E1DD] dark:border-white/10 pt-4">
              <h4 className="text-sm font-medium text-[#29335C] dark:text-white">
                Habilidades a serem adicionadas:
              </h4>
              <div className="space-y-2">
                {tempSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#29335C] dark:text-white">
                        {skill.name}
                      </span>
                      <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                        {skill.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= skill.level
                                ? "fill-[#FF6B00] text-[#FF6B00]"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Remover
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
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={tempSkills.length === 0}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            Salvar {tempSkills.length} Habilidade(s)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
