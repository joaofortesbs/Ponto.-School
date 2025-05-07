
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
            <span className="mr-2 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
              <User className="h-5 w-5" />
            </span>
            Personalidades da IA
          </DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
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
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-[1.5px] border-blue-500 dark:border-blue-500'
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
                        ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      } mr-3 w-10 h-10`}
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
                      <div className="bg-blue-500 text-white rounded-full p-1 shadow-sm">
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
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white rounded-lg px-5 py-2 text-sm font-medium"
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
