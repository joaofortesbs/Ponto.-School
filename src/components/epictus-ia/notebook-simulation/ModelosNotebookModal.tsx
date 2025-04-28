
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, AlignLeft, FileText, X, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] p-0 bg-white dark:bg-[#121826] overflow-hidden flex flex-col rounded-xl border-0 shadow-[0_0_50px_rgba(255,107,0,0.15)] dark:shadow-[0_0_50px_rgba(255,107,0,0.1)]">
        <DialogHeader className="px-6 py-5 border-b border-amber-100/50 dark:border-amber-900/20 bg-gradient-to-r from-amber-50/90 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-800/5 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800/30 dark:to-amber-700/20 flex items-center justify-center shadow-sm">
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle className="text-xl font-medium text-amber-900 dark:text-amber-300">
                Modelos de Anotações
              </DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full h-8 w-8 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-800/20 transition-all duration-200"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-1 pl-[52px]">
            Escolha um modelo para estruturar suas anotações
          </p>
        </DialogHeader>
        
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-900/5 dark:to-transparent p-0.5 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md group">
            <Button
              variant="ghost"
              className="w-full justify-between text-left py-6 px-5 rounded-xl bg-white/80 dark:bg-[#151b29]/80 hover:bg-white dark:hover:bg-[#151b29] transition-all duration-300 border-0 h-auto"
              onClick={() => handleSelectTemplate('estudoCompleto')}
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base text-amber-900 dark:text-amber-300 mb-1">Estudo Completo</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/60 leading-relaxed">
                    Estrutura detalhada para aprendizado profundo com definições, desenvolvimento, exemplos e pontos de atenção.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 dark:text-amber-700 opacity-50 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 ml-2" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50/80 to-transparent dark:from-blue-900/5 dark:to-transparent p-0.5 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md group">
            <Button
              variant="ghost"
              className="w-full justify-between text-left py-6 px-5 rounded-xl bg-white/80 dark:bg-[#151b29]/80 hover:bg-white dark:hover:bg-[#151b29] transition-all duration-300 border-0 h-auto"
              onClick={() => handleSelectTemplate('mapaConceitual')}
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base text-amber-900 dark:text-amber-300 mb-1">Mapa Conceitual</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/60 leading-relaxed">
                    Visualização hierárquica de conceitos e suas relações, ideal para compreender conexões entre temas.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 dark:text-amber-700 opacity-50 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 ml-2" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-900/5 dark:to-transparent p-0.5 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md group">
            <Button
              variant="ghost"
              className="w-full justify-between text-left py-6 px-5 rounded-xl bg-white/80 dark:bg-[#151b29]/80 hover:bg-white dark:hover:bg-[#151b29] transition-all duration-300 border-0 h-auto"
              onClick={() => handleSelectTemplate('revisaoRapida')}
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlignLeft className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base text-amber-900 dark:text-amber-300 mb-1">Revisão Rápida</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/60 leading-relaxed">
                    Resumo objetivo e direto para revisões antes de provas, com checklist e dicas práticas.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 dark:text-amber-700 opacity-50 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 ml-2" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-900/5 dark:to-transparent p-0.5 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md group">
            <Button
              variant="ghost"
              className="w-full justify-between text-left py-6 px-5 rounded-xl bg-white/80 dark:bg-[#151b29]/80 hover:bg-white dark:hover:bg-[#151b29] transition-all duration-300 border-0 h-auto"
              onClick={() => handleSelectTemplate('fichamento')}
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base text-amber-900 dark:text-amber-300 mb-1">Fichamento</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/60 leading-relaxed">
                    Organiza citações, interpretações e análises críticas de textos acadêmicos ou literários.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 dark:text-amber-700 opacity-50 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 ml-2" />
            </Button>
          </div>
        </div>
        
        <div className="px-5 py-4 border-t border-amber-100/50 dark:border-amber-900/20 bg-gradient-to-r from-amber-50/90 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-800/5 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:border-amber-800/40 dark:text-amber-400 dark:hover:bg-amber-900/10 dark:hover:border-amber-700 transition-all duration-200"
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
