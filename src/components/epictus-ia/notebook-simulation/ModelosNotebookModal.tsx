
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

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.02, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)" }
  };

  const iconConfig = {
    estudoCompleto: { icon: BookOpen, color: "text-amber-500 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-800/30" },
    mapaConceitual: { icon: Sparkles, color: "text-blue-500 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-800/30" },
    revisaoRapida: { icon: AlignLeft, color: "text-green-500 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-800/30" },
    fichamento: { icon: FileText, color: "text-purple-500 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-800/30" }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden flex flex-col rounded-xl border-0 shadow-2xl dark:shadow-amber-900/10">
        <DialogHeader className="p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-600/20 to-amber-700/30 backdrop-blur-sm sticky top-0 z-10 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-500/20 rounded-full p-2.5 mr-3 backdrop-blur-md">
              <BookOpen className="h-5 w-5 text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-amber-300 tracking-tight">
              Modelos de Anotações
            </DialogTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-amber-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {(Object.keys(notebookTemplates) as Array<keyof typeof notebookTemplates>).map((key, index) => {
            const IconComponent = iconConfig[key].icon;
            return (
              <motion.div
                key={key}
                initial="initial"
                animate="animate"
                whileHover="hover"
                variants={cardVariants}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className={`group w-full justify-between text-left p-5 border border-transparent bg-slate-800/80 hover:bg-slate-700/80 hover:border-${iconConfig[key].color.split('-')[1]}-500/30 backdrop-blur-sm transition-all duration-300 rounded-xl relative overflow-hidden`}
                  onClick={() => handleSelectTemplate(key)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700/40 to-slate-800/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start z-10 relative">
                    <div className={`${iconConfig[key].bgColor} rounded-lg p-3 mr-4`}>
                      <IconComponent className={`h-6 w-6 ${iconConfig[key].color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">
                        {key === 'estudoCompleto' ? 'Estudo Completo' : 
                         key === 'mapaConceitual' ? 'Mapa Conceitual' : 
                         key === 'revisaoRapida' ? 'Revisão Rápida' : 'Fichamento'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 pr-6 line-clamp-2">
                        {key === 'estudoCompleto' ? 'Conteúdo completo e detalhado para aprendizado profundo' : 
                         key === 'mapaConceitual' ? 'Visualização hierárquica de conceitos e suas relações' : 
                         key === 'revisaoRapida' ? 'Resumo direto para revisão antes de provas e simulados' : 
                         'Organiza citações, interpretações e análises críticas de textos'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-amber-400 shrink-0 transition-all duration-300 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-amber-500/20 bg-gradient-to-r from-amber-600/10 to-amber-700/20 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-700/30 bg-transparent text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all duration-300"
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
