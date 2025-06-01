
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Plus, X, Save, Search } from "lucide-react";

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
  existingSkills?: Skill[];
}

export default function AddSkillsModal({ isOpen, onClose, onSave, existingSkills = [] }: AddSkillsModalProps) {
  const [skills, setSkills] = useState<Skill[]>(existingSkills);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState([3]);
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "Programação",
    "Design",
    "Marketing",
    "Gestão",
    "Comunicação",
    "Idiomas",
    "Análise de Dados",
    "Vendas",
    "Educação",
    "Finanças",
    "Tecnologia",
    "Criatividade",
    "Liderança",
    "Outros"
  ];

  const commonSkills = [
    { name: "JavaScript", category: "Programação" },
    { name: "Python", category: "Programação" },
    { name: "React", category: "Programação" },
    { name: "Node.js", category: "Programação" },
    { name: "TypeScript", category: "Programação" },
    { name: "HTML/CSS", category: "Programação" },
    { name: "Java", category: "Programação" },
    { name: "C++", category: "Programação" },
    { name: "SQL", category: "Análise de Dados" },
    { name: "Excel", category: "Análise de Dados" },
    { name: "Power BI", category: "Análise de Dados" },
    { name: "Photoshop", category: "Design" },
    { name: "Figma", category: "Design" },
    { name: "Illustrator", category: "Design" },
    { name: "Inglês", category: "Idiomas" },
    { name: "Espanhol", category: "Idiomas" },
    { name: "Francês", category: "Idiomas" },
    { name: "Marketing Digital", category: "Marketing" },
    { name: "SEO", category: "Marketing" },
    { name: "Google Ads", category: "Marketing" },
    { name: "Gestão de Projetos", category: "Gestão" },
    { name: "Scrum", category: "Gestão" },
    { name: "Kanban", category: "Gestão" }
  ];

  const filteredCommonSkills = commonSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !skills.some(existingSkill => existingSkill.name.toLowerCase() === skill.name.toLowerCase())
  );

  const getLevelText = (level: number) => {
    if (level <= 1) return "Iniciante";
    if (level <= 2) return "Básico";
    if (level <= 3) return "Intermediário";
    if (level <= 4) return "Avançado";
    return "Especialista";
  };

  const getLevelColor = (level: number) => {
    if (level <= 1) return "bg-red-500";
    if (level <= 2) return "bg-orange-500";
    if (level <= 3) return "bg-yellow-500";
    if (level <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const addSkill = (name: string, category: string, level: number = 3) => {
    if (!name.trim()) return;
    
    const newSkill: Skill = {
      id: Date.now().toString() + Math.random(),
      name: name.trim(),
      level,
      category: category || "Outros"
    };
    
    setSkills([...skills, newSkill]);
    setNewSkillName("");
    setNewSkillLevel([3]);
    setNewSkillCategory("");
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const updateSkillLevel = (id: string, level: number) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, level } : skill
    ));
  };

  const handleSave = () => {
    onSave(skills);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-[#29335C] dark:text-white">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#FF6B00]" />
            </div>
            Gerenciar Habilidades
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New Skill */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-xl">
            <h3 className="font-medium text-[#29335C] dark:text-white">Adicionar Nova Habilidade</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Nome da Habilidade</Label>
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Ex: JavaScript, Photoshop, Inglês..."
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkillName, newSkillCategory, newSkillLevel[0])}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Categoria</Label>
                <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
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
            </div>

            <div className="space-y-3">
              <Label className="text-[#29335C] dark:text-white font-medium">
                Nível: {getLevelText(newSkillLevel[0])}
              </Label>
              <div className="px-2">
                <Slider
                  value={newSkillLevel}
                  onValueChange={setNewSkillLevel}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#64748B] dark:text-white/60 mt-1">
                  <span>Iniciante</span>
                  <span>Básico</span>
                  <span>Intermediário</span>
                  <span>Avançado</span>
                  <span>Especialista</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => addSkill(newSkillName, newSkillCategory, newSkillLevel[0])}
              disabled={!newSkillName.trim()}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Habilidade
            </Button>
          </div>

          {/* Common Skills Quick Add */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#29335C] dark:text-white">Habilidades Comuns</h3>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar habilidades..."
                  className="pl-10 border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredCommonSkills.map((skill) => (
                <Button
                  key={skill.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill.name, skill.category)}
                  className="border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {skill.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Current Skills */}
          {skills.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#29335C] dark:text-white">Suas Habilidades ({skills.length})</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#29335C] dark:text-white">{skill.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getLevelColor(skill.level)} transition-all`}
                              style={{ width: `${(skill.level / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#64748B] dark:text-white/60 min-w-0">
                            {getLevelText(skill.level)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <div className="w-24">
                        <Slider
                          value={[skill.level]}
                          onValueChange={(value) => updateSkillLevel(skill.id, value[0])}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
            Salvar Habilidades ({skills.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
