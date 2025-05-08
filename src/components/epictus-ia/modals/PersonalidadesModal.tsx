
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check, User, Brain, Lightbulb, GraduationCap, BookOpen, Award, Star } from "lucide-react";

interface Personalidade {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  icone: React.ReactNode;
}

interface PersonalidadesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personalidades?: Personalidade[];
  onPersonalidadeSelect?: (personalidadeId: string) => void;
}

const PersonalidadesModal: React.FC<PersonalidadesModalProps> = ({
  open,
  onOpenChange,
  personalidades = defaultPersonalidades,
  onPersonalidadeSelect,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[550px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border-0 rounded-xl shadow-xl personalidades-modal"
        style={{ zIndex: 100001 }}
      >
        <DialogHeader className="pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center text-slate-800 dark:text-slate-100">
            <span className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#007aff] to-[#0057b8] text-white shadow-md">
              <User className="h-5 w-5" />
            </span>
            Personalidades da IA
          </DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 ml-1">
            Selecione como você prefere que a IA se comporte durante suas interações
          </p>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 mt-4 personalidades-list">
          <div className="space-y-3">
            {personalidades.map((personalidade) => (
              <motion.div 
                key={personalidade.id}
                className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 
                  ${personalidade.ativa 
                    ? 'bg-blue-50 dark:bg-[#007aff]/10 border-[1.5px] border-[#007aff] dark:border-[#007aff]'
                    : 'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700/50 border-[1.5px] border-gray-100 dark:border-slate-700'
                  }`}
                onClick={() => onPersonalidadeSelect?.(personalidade.id)}
                whileHover={{ 
                  scale: 1.01, 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" 
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center p-2 rounded-full 
                      ${personalidade.ativa 
                        ? 'bg-[#007aff]/20 dark:bg-[#007aff]/30 text-[#007aff] dark:text-[#007aff]' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      } mr-3 w-11 h-11`}
                    >
                      {personalidade.icone}
                    </div>
                    <div>
                      <h3 className="font-medium text-base text-gray-900 dark:text-white">
                        {personalidade.nome}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {personalidade.descricao}
                      </p>
                    </div>
                  </div>
                  {personalidade.ativa && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="bg-[#007aff] text-white rounded-full p-1.5 shadow-md">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-[#007aff] to-[#0057b8] hover:opacity-90 text-white rounded-lg px-6 py-2.5 text-sm font-medium shadow-md"
          >
            Concluído
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dados padrão das personalidades com ícones personalizados
const defaultPersonalidades: Personalidade[] = [
  {
    id: "nenhuma",
    nome: "Personalidades",
    descricao: "Sem personalidade específica. Interações padrão sem adaptação a um perfil particular.",
    ativa: false,
    icone: <User className="h-5 w-5" />
  },
  {
    id: "estudante",
    nome: "Estudante",
    descricao: "Respostas didáticas e simplificadas, ideais para aprendizado e revisão de conteúdos acadêmicos.",
    ativa: true,
    icone: <GraduationCap className="h-5 w-5" />
  },
  {
    id: "professor",
    nome: "Professor",
    descricao: "Explicações detalhadas com exemplos práticos e acompanhamento pedagógico de alto nível.",
    ativa: false,
    icone: <BookOpen className="h-5 w-5" />
  },
  {
    id: "mentor",
    nome: "Mentor",
    descricao: "Foco em desenvolvimento pessoal, orientação de carreira e apoio para tomada de decisões.",
    ativa: false,
    icone: <Lightbulb className="h-5 w-5" />
  },
  {
    id: "expert",
    nome: "Expert",
    descricao: "Abordagem técnica avançada com conhecimento especializado e termos específicos da área.",
    ativa: false,
    icone: <Award className="h-5 w-5" />
  }
];

export default PersonalidadesModal;
