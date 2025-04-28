
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, AlignLeft, FileText, X, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface ModelosNotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateContent: string) => void;
}

// Modelos de anotações definidos
const notebookTemplates = {
  estudoCompleto: `📖 ESTUDO COMPLETO: [TEMA]

Uma breve introdução sobre o assunto que está sendo estudado, contextualizando sua
importância e relevância para o aprendizado.

🧠 Definições Importantes:
• Conceito principal: explicação clara e objetiva
• Termos relacionados: significados e aplicações
• Origem/contexto histórico: desenvolvimento ao longo do tempo

⚙️ Desenvolvimento do Tema:
1. Primeiro aspecto importante com explicação detalhada
2. Segundo aspecto importante com exemplos práticos
3. Terceiro aspecto relevante aplicado a situações reais

📊 Exemplos Práticos:
• Exemplo 1: descrição e resolução passo a passo
• Exemplo 2: variação do problema com solução completa

💡 Pontos de Atenção:
• Erros comuns a evitar
• Dicas para memorização
• Estratégias para resolução de problemas similares

✅ Resumo Final:
Síntese dos principais pontos estudados, reforçando os conceitos mais importantes
e como eles se relacionam entre si.`,

  mapaConceitual: `✨ MAPA CONCEITUAL: [TEMA CENTRAL]

🔍 CONCEITO PRINCIPAL
  │
  ├── 📌 Subtema 1
  │    ├── • Característica principal
  │    ├── • Elemento secundário
  │    └── • Aplicação prática
  │
  ├── 📌 Subtema 2
  │    ├── • Definição essencial
  │    ├── • Fórmula/método
  │    └── • Exemplo de uso
  │
  └── 📌 Subtema 3
       ├── • Princípio fundamental
       ├── • Variação importante
       └── • Conexão com outros temas

📝 CONEXÕES IMPORTANTES:
• Relação entre Subtema 1 e Subtema 3
• Como Subtema 2 influencia o Conceito Principal
• Aplicações interdisciplinares

⭐ PALAVRAS-CHAVE:
termo1, termo2, termo3, termo4, termo5`,

  revisaoRapida: `⏱️ REVISÃO RÁPIDA: [TEMA]

🚀 PONTOS ESSENCIAIS:
1. Conceito fundamental - definição concisa
2. Elemento crítico - explicação direta
3. Componente-chave - aplicação básica

📋 FÓRMULAS/REGRAS:
• Fórmula 1: [fórmula com breve explicação]
• Regra principal: [descrição clara e direta]
• Exceção importante: [quando não se aplica]

🎯 CHECKLIST PRÉ-PROVA:
□ Revisar conceito X
□ Praticar exemplo do tipo Y
□ Memorizar fórmula Z

⚠️ ATENÇÃO PARA:
• Erro comum 1 - como evitar
• Confusão frequente - como diferenciar
• Pegadinha típica - o que observar

💪 DICA FINAL: orientação estratégica para resolver questões sobre o tema`,

  fichamento: `📘 FICHAMENTO: [TÍTULO DA OBRA/TEXTO]

📑 REFERÊNCIA COMPLETA:
Autor, A. (Ano). Título. Editora. Páginas XX-XX.

💬 CITAÇÕES IMPORTANTES:
"Trecho literal do texto que considero fundamental."
(página XX)
➤ Interpretação: minha explicação do que o autor quis dizer.
➤ Reflexão: minha análise crítica sobre este trecho.

"Segunda citação relevante do material estudado."
(página XX)
➤ Interpretação: como entendo esta passagem.
➤ Reflexão: por que isto é importante ou questionável.

🔍 IDEIAS PRINCIPAIS:
• Conceito 1: resumo conciso da primeira ideia central.
• Conceito 2: síntese da segunda ideia relevante.
• Conceito 3: explicação breve da terceira ideia importante.

🧠 ANÁLISE CRÍTICA GERAL:
Minha avaliação sobre o texto como um todo, considerando
sua contribuição, limitações e relações com outros conhecimentos.

🔄 CONEXÕES COM OUTROS TEMAS:
• Relação com tema X estudado anteriormente
• Como se aplica ao contexto Y
• Contradições ou complementos com a teoria Z`
};

const ModelosNotebookModal: React.FC<ModelosNotebookModalProps> = ({ 
  open, 
  onOpenChange,
  onSelectTemplate
}) => {
  const handleSelectTemplate = (templateKey: keyof typeof notebookTemplates) => {
    onSelectTemplate(notebookTemplates[templateKey]);
    onOpenChange(false);
    toast({
      title: "Modelo selecionado",
      description: "O modelo foi aplicado ao caderno de anotações.",
      duration: 2000,
    });
  };

  // Variantes para animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden flex flex-col rounded-2xl border-0 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-gradient-to-b from-[#111827] to-[#0c1018]">
        <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b border-gray-800/60 backdrop-blur-md bg-black/30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <div className="relative mr-3 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-sm"></div>
                <BookOpen className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-medium text-white">
                  Modelos de Anotações
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  Selecione um template para suas anotações
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all duration-300"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogHeader>
        
        <motion.div 
          className="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            className="relative overflow-hidden group"
          >
            <Button
              variant="outline"
              onClick={() => handleSelectTemplate('estudoCompleto')}
              className="w-full justify-start text-left p-4 rounded-xl border border-gray-800/30 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/40 transition-all duration-300"
            >
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-800 mr-3">
                  <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Estudo Completo</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    Conteúdo completo e detalhado para aprendizado profundo
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-all duration-300 ml-2" />
              </div>
            </Button>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            className="relative overflow-hidden group"
          >
            <Button
              variant="outline"
              onClick={() => handleSelectTemplate('mapaConceitual')}
              className="w-full justify-start text-left p-4 rounded-xl border border-gray-800/30 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/40 transition-all duration-300"
            >
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-800 mr-3">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Mapa Conceitual</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    Visualização hierárquica de conceitos e suas relações
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-all duration-300 ml-2" />
              </div>
            </Button>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            className="relative overflow-hidden group"
          >
            <Button
              variant="outline"
              onClick={() => handleSelectTemplate('revisaoRapida')}
              className="w-full justify-start text-left p-4 rounded-xl border border-gray-800/30 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/40 transition-all duration-300"
            >
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-800 mr-3">
                  <AlignLeft className="h-3.5 w-3.5 text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Revisão Rápida</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    Resumo direto para revisão antes de provas e simulados
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-all duration-300 ml-2" />
              </div>
            </Button>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            className="relative overflow-hidden group"
          >
            <Button
              variant="outline"
              onClick={() => handleSelectTemplate('fichamento')}
              className="w-full justify-start text-left p-4 rounded-xl border border-gray-800/30 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/40 transition-all duration-300"
            >
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-800 mr-3">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Fichamento</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    Organiza citações, interpretações e análises críticas de textos
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-all duration-300 ml-2" />
              </div>
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="p-4 backdrop-blur-md border-t border-gray-800/30 bg-black/20 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-lg bg-transparent border border-gray-700/50 text-gray-300 hover:bg-gray-800/30 hover:text-white transition-all duration-300"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelosNotebookModal;
