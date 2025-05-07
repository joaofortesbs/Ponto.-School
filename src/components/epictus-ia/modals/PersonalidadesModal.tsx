
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, User, Brain, Lightbulb, GraduationCap, Zap } from "lucide-react";

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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col personalidades-modal" style={{ zIndex: 999999 }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2 text-[#0D23A0]" />
            Personalidades da IA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-4 mt-4 max-h-[60vh]">
          <div className="space-y-4">
            {personalidades.map((personalidade) => (
              <div 
                key={personalidade.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer
                  ${personalidade.ativa 
                    ? 'border-[#0D23A0] bg-[#0D23A0]/5' 
                    : 'border-gray-200 hover:border-[#0D23A0]/50 dark:border-gray-700'
                  }`}
                onClick={() => onPersonalidadeSelect?.(personalidade.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${personalidade.ativa ? 'bg-[#0D23A0]/10' : 'bg-gray-100 dark:bg-gray-800'} mr-3`}>
                      {personalidade.icone}
                    </div>
                    <h3 className="font-medium text-lg">{personalidade.nome}</h3>
                  </div>
                  {personalidade.ativa && (
                    <div className="bg-[#0D23A0] text-white rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{personalidade.descricao}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#0D23A0] hover:bg-[#0A1C80] text-white"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dados padrão das personalidades com ícones personalizados
const defaultPersonalidades: Personalidade[] = [
  {
    id: "padrao",
    nome: "Padrão",
    descricao: "O assistente Epictus IA com comportamento padrão, equilibrando formalidade e conversação natural.",
    ativa: true,
    icone: <User className="h-5 w-5 text-[#0D23A0]" />
  },
  {
    id: "professor",
    nome: "Professor",
    descricao: "Explicações didáticas e completas, focando em exemplos e analogias para facilitar o aprendizado.",
    ativa: false,
    icone: <GraduationCap className="h-5 w-5 text-[#0D23A0]" />
  },
  {
    id: "cientista",
    nome: "Cientista",
    descricao: "Abordagem analítica e baseada em evidências, com referências a pesquisas e maior profundidade técnica.",
    ativa: false,
    icone: <Brain className="h-5 w-5 text-[#0D23A0]" />
  },
  {
    id: "mentor",
    nome: "Mentor",
    descricao: "Foco em orientação e desenvolvimento pessoal, com perguntas reflexivas e estímulo ao pensamento crítico.",
    ativa: false,
    icone: <Lightbulb className="h-5 w-5 text-[#0D23A0]" />
  },
  {
    id: "simplificador",
    nome: "Simplificador",
    descricao: "Explicações extremamente simplificadas e diretas, ideal para entendimento rápido de conceitos complexos.",
    ativa: false,
    icone: <Zap className="h-5 w-5 text-[#0D23A0]" />
  },
];

export default PersonalidadesModal;
