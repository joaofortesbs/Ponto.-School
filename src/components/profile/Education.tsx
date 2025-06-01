
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GraduationCap, Building2, Calendar, Trash2 } from "lucide-react";
import AddEducationModal from "./modals/AddEducationModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface EducationProps {
  education: Education[];
  onAddEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  onRemoveEducation: (id: string) => Promise<boolean>;
}

export default function Education({ education, onAddEducation, onRemoveEducation }: EducationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDateRange = (startDate: Date | null, endDate: Date | null, current: boolean) => {
    const start = startDate ? format(startDate, "MMM yyyy", { locale: ptBR }) : "";
    const end = current ? "Presente" : endDate ? format(endDate, "MMM yyyy", { locale: ptBR }) : "";
    return `${start} - ${end}`;
  };

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {education.length > 0 ? (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-[#FF6B00]" />
                    <h4 className="font-semibold text-[#29335C] dark:text-white">
                      {edu.institution}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                      {edu.degree}
                    </Badge>
                    {edu.field && (
                      <span className="text-[#64748B] dark:text-white/60 text-sm">
                        em {edu.field}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-white/60 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </div>
                    {edu.grade && (
                      <div>
                        Nota: {edu.grade}
                      </div>
                    )}
                  </div>
                  {edu.description && (
                    <p className="text-sm text-[#64748B] dark:text-white/60 mt-2">
                      {edu.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEducation(edu.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
            Adicione informações sobre sua formação acadêmica
          </p>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Educação
          </Button>
        </div>
      )}

      <AddEducationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddEducation}
      />
    </div>
  );
}
