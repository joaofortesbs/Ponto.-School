
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Star } from "lucide-react";
import AddSkillsModal from "./modals/AddSkillsModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Carregar habilidades ao montar o componente
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar habilidades:', error);
          return;
        }

        if (data) {
          const formattedSkills = data.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.level || 1,
            category: skill.category
          }));
          setSkills(formattedSkills);
        }
      } catch (error) {
        console.error('Erro ao carregar habilidades:', error);
      }
    };

    loadSkills();
  }, []);

  const handleSaveSkills = async (newSkills: Skill[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Deletar habilidades existentes do usuário
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id);

      // Inserir novas habilidades
      if (newSkills.length > 0) {
        const skillsToInsert = newSkills.map(skill => ({
          user_id: user.id,
          name: skill.name,
          level: skill.level,
          category: skill.category
        }));

        const { error } = await supabase
          .from('user_skills')
          .insert(skillsToInsert);

        if (error) {
          console.error('Erro ao salvar habilidades:', error);
          toast({
            title: "Erro",
            description: "Erro ao salvar habilidades. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      }

      setSkills(newSkills);
      toast({
        title: "Sucesso",
        description: "Habilidades salvas com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error) {
      console.error('Erro ao salvar habilidades:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar habilidades.",
        variant: "destructive"
      });
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
  }, {} as Record<string, Skill[]>);

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
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
                  <div key={skill.id} className="p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Editar Habilidades
          </Button>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
            <Zap className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <p className="text-[#64748B] dark:text-white/60 mb-3">
            Adicione suas habilidades e competências
          </p>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Habilidades
          </Button>
        </div>
      )}

      <AddSkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSkills}
        existingSkills={skills}
      />
    </div>
  );
}
