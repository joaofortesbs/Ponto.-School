
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Star } from "lucide-react";
import AddSkillsModal from "./modals/AddSkillsModal";
import { ProfileDataService, UserSkill } from "@/services/profileDataService";
import { useToast } from "@/components/ui/toast";

interface SkillsProps {
  isOwnProfile?: boolean;
}

export default function Skills({ isOwnProfile = true }: SkillsProps) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Carregar habilidades ao montar o componente
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        const data = await ProfileDataService.getUserSkills();
        setSkills(data);
      } catch (error) {
        console.error('Erro ao carregar habilidades:', error);
        showToast('Erro ao carregar habilidades', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOwnProfile) {
      loadSkills();
    }
  }, [isOwnProfile, showToast]);

  const handleSaveSkills = async (newSkills: UserSkill[]) => {
    try {
      // Encontrar quais skills foram adicionadas
      const currentSkillNames = skills.map(s => s.name);
      const skillsToAdd = newSkills.filter(s => !currentSkillNames.includes(s.name));
      
      // Adicionar cada nova skill
      for (const skill of skillsToAdd) {
        const result = await ProfileDataService.addUserSkill(skill);
        if (!result.success) {
          showToast(result.message, 'error');
          return;
        }
      }

      if (skillsToAdd.length > 0) {
        showToast(`${skillsToAdd.length} habilidade(s) adicionada(s) com sucesso!`, 'success');
        // Recarregar habilidades
        const data = await ProfileDataService.getUserSkills();
        setSkills(data);
      }
    } catch (error) {
      console.error('Erro ao salvar habilidades:', error);
      showToast('Erro ao salvar habilidades', 'error');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      const result = await ProfileDataService.removeUserSkill(id);
      
      if (result.success) {
        showToast(result.message, 'success');
        setSkills(skills.filter(skill => skill.id !== id));
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao remover habilidade:', error);
      showToast('Erro ao remover habilidade', 'error');
    }
  };

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

  const getCategoryColor = (category: string) => {
    const colors = {
      "Programação": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "Design": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "Marketing": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "Gestão": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      "Comunicação": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      "Idiomas": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      "Análise de Dados": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, UserSkill[]>);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Habilidades
          </h3>
          {skills.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {skills.length}
            </Badge>
          )}
        </div>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {skills.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-[#64748B] dark:text-white/60 flex items-center gap-2">
                <Zap className="h-3 w-3" />
                {category} ({categorySkills.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#29335C] dark:text-white text-sm">
                          {skill.name}
                        </span>
                        <Badge className={getCategoryColor(skill.category)} size="sm">
                          {skill.category}
                        </Badge>
                      </div>
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
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getLevelColor(skill.level)} transition-all`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#64748B] dark:text-white/60 font-medium">
                        {getLevelText(skill.level)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mais Habilidades
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
            <Zap className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <p className="text-[#64748B] dark:text-white/60 mb-3">
            {isOwnProfile 
              ? "Adicione suas habilidades e conhecimentos para que outros possam conhecer suas competências"
              : "Este usuário ainda não adicionou habilidades."
            }
          </p>
          {isOwnProfile && (
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Habilidades
            </Button>
          )}
        </div>
      )}

      {isOwnProfile && (
        <AddSkillsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSkills}
          existingSkills={skills}
        />
      )}
    </div>
  );
}
