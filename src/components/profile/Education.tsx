
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GraduationCap, Building2, Calendar, Trash2 } from "lucide-react";
import AddEducationModal from "./modals/AddEducationModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProfileDataService, UserEducation } from "@/services/profileDataService";
import { useToast } from "@/components/ui/toast";

interface EducationProps {
  isOwnProfile?: boolean;
}

export default function Education({ isOwnProfile = true }: EducationProps) {
  const [educations, setEducations] = useState<UserEducation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Carregar educações ao montar o componente
  useEffect(() => {
    const loadEducations = async () => {
      try {
        setIsLoading(true);
        const data = await ProfileDataService.getUserEducation();
        setEducations(data);
      } catch (error) {
        console.error('Erro ao carregar educações:', error);
        showToast('Erro ao carregar educações', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOwnProfile) {
      loadEducations();
    }
  }, [isOwnProfile, showToast]);

  const handleAddEducation = async (education: Omit<UserEducation, 'id'>) => {
    try {
      const result = await ProfileDataService.addUserEducation(education);
      
      if (result.success) {
        showToast(result.message, 'success');
        // Recarregar educações
        const data = await ProfileDataService.getUserEducation();
        setEducations(data);
        setIsModalOpen(false);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao adicionar educação:', error);
      showToast('Erro ao adicionar educação', 'error');
    }
  };

  const handleRemoveEducation = async (id: string) => {
    try {
      const result = await ProfileDataService.removeUserEducation(id);
      
      if (result.success) {
        showToast(result.message, 'success');
        setEducations(educations.filter(edu => edu.id !== id));
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao remover educação:', error);
      showToast('Erro ao remover educação', 'error');
    }
  };

  const formatDateRange = (startDate: string | null, endDate: string | null, current: boolean) => {
    const start = startDate ? format(new Date(startDate), "MMM yyyy", { locale: ptBR }) : "";
    const end = current ? "Presente" : endDate ? format(new Date(endDate), "MMM yyyy", { locale: ptBR }) : "";
    return `${start} - ${end}`;
  };

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
            <GraduationCap className="h-4 w-4 text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Educação
          </h3>
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

      {educations.length > 0 ? (
        <div className="space-y-4">
          {educations.map((education) => (
            <div key={education.id} className="p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-[#FF6B00]" />
                    <h4 className="font-semibold text-[#29335C] dark:text-white">
                      {education.institution}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                      {education.degree}
                    </Badge>
                    {education.field && (
                      <span className="text-[#64748B] dark:text-white/60 text-sm">
                        em {education.field}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-white/60 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange(education.start_date, education.end_date, education.current)}
                    </div>
                    {education.grade && (
                      <div>
                        Nota: {education.grade}
                      </div>
                    )}
                  </div>
                  {education.description && (
                    <p className="text-sm text-[#64748B] dark:text-white/60 mt-2">
                      {education.description}
                    </p>
                  )}
                </div>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEducation(education.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <p className="text-[#64748B] dark:text-white/60 mb-3">
            {isOwnProfile 
              ? "Adicione informações sobre sua formação acadêmica"
              : "Este usuário ainda não adicionou informações educacionais."
            }
          </p>
          {isOwnProfile && (
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Educação
            </Button>
          )}
        </div>
      )}

      {isOwnProfile && (
        <AddEducationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEducation}
        />
      )}
    </div>
  );
}
