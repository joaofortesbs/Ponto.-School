
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, AlignLeft, FileText, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatTextForNotebookLines } from '@/services/notebookService';

interface ModelosNotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateContent: string) => void;
  originalContent?: string;
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
  onSelectTemplate,
  originalContent = ""
}) => {
  // Função para adaptar o conteúdo original ao modelo selecionado
  const adaptContentToTemplate = (templateKey: keyof typeof notebookTemplates) => {
    // Se não houver conteúdo original, retorna o template padrão
    if (!originalContent.trim()) {
      return notebookTemplates[templateKey];
    }
    
    const template = notebookTemplates[templateKey];
    
    try {
      // Extrai o tema do conteúdo original (primeira linha ou primeiras palavras)
      const lines = originalContent.split('\n');
      const firstLine = lines[0];
      const title = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
      
      // Identifica parágrafos principais do conteúdo original
      const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 0);
      
      let adaptedContent = '';
      
      switch (templateKey) {
        case 'estudoCompleto':
          adaptedContent = template.replace('[TEMA]', title);
          
          // Adiciona conteúdo original nas seções apropriadas
          if (paragraphs.length >= 1) {
            adaptedContent = adaptedContent.replace('Uma breve introdução sobre o assunto que está sendo estudado, contextualizando sua\nimportância e relevância para o aprendizado.', paragraphs[0]);
          }
          
          // Adiciona definições e conceitos principais
          if (paragraphs.length >= 2) {
            const concepts = paragraphs[1].split('\n').map(line => `• ${line.trim()}`).join('\n');
            adaptedContent = adaptedContent.replace('• Conceito principal: explicação clara e objetiva\n• Termos relacionados: significados e aplicações\n• Origem/contexto histórico: desenvolvimento ao longo do tempo', concepts);
          }
          
          // Adiciona desenvolvimento do tema
          if (paragraphs.length >= 3) {
            const development = paragraphs.slice(2, 5).map((p, i) => `${i+1}. ${p.trim()}`).join('\n');
            adaptedContent = adaptedContent.replace('1. Primeiro aspecto importante com explicação detalhada\n2. Segundo aspecto importante com exemplos práticos\n3. Terceiro aspecto relevante aplicado a situações reais', development);
          }
          break;
          
        case 'mapaConceitual':
          adaptedContent = template.replace('[TEMA CENTRAL]', title);
          
          // Divide o conteúdo em subtemas
          const subtemas = paragraphs.slice(0, 3);
          
          if (subtemas.length >= 1) {
            adaptedContent = adaptedContent.replace('• Característica principal\n  │    ├── • Elemento secundário\n  │    └── • Aplicação prática', 
              '• ' + subtemas[0].split('\n').slice(0, 3).join('\n• '));
          }
          
          if (subtemas.length >= 2) {
            adaptedContent = adaptedContent.replace('• Definição essencial\n  │    ├── • Fórmula/método\n  │    └── • Exemplo de uso', 
              '• ' + subtemas[1].split('\n').slice(0, 3).join('\n• '));
          }
          
          if (subtemas.length >= 3) {
            adaptedContent = adaptedContent.replace('• Princípio fundamental\n       ├── • Variação importante\n       └── • Conexão com outros temas', 
              '• ' + subtemas[2].split('\n').slice(0, 3).join('\n• '));
          }
          
          // Extrair palavras-chave do conteúdo (primeiras palavras de cada parágrafo)
          const keywords = paragraphs.map(p => {
            const firstWords = p.split(' ').slice(0, 1).join(' ');
            return firstWords.length > 10 ? firstWords.substring(0, 10) : firstWords;
          }).join(', ');
          
          adaptedContent = adaptedContent.replace('termo1, termo2, termo3, termo4, termo5', keywords);
          break;
          
        case 'revisaoRapida':
          adaptedContent = template.replace('[TEMA]', title);
          
          // Adiciona pontos essenciais
          if (paragraphs.length >= 1) {
            const points = paragraphs[0].split('\n')
              .filter(line => line.trim().length > 0)
              .slice(0, 3)
              .map((line, i) => `${i+1}. ${line.trim()} - explicação concisa`)
              .join('\n');
            
            adaptedContent = adaptedContent.replace('1. Conceito fundamental - definição concisa\n2. Elemento crítico - explicação direta\n3. Componente-chave - aplicação básica', points);
          }
          
          // Adiciona checklist de estudo
          if (paragraphs.length >= 2) {
            const checklist = paragraphs[1].split('\n')
              .filter(line => line.trim().length > 0)
              .slice(0, 3)
              .map(line => `□ Revisar ${line.trim()}`)
              .join('\n');
            
            adaptedContent = adaptedContent.replace('□ Revisar conceito X\n□ Praticar exemplo do tipo Y\n□ Memorizar fórmula Z', checklist);
          }
          break;
          
        case 'fichamento':
          adaptedContent = template.replace('[TÍTULO DA OBRA/TEXTO]', title);
          
          // Se houver parágrafos, usar o primeiro como citação
          if (paragraphs.length >= 1) {
            adaptedContent = adaptedContent.replace('"Trecho literal do texto que considero fundamental."\n(página XX)\n➤ Interpretação: minha explicação do que o autor quis dizer.\n➤ Reflexão: minha análise crítica sobre este trecho.', 
            `"${paragraphs[0]}"\n(página X)\n➤ Interpretação: Este trecho aborda os conceitos fundamentais do tema.\n➤ Reflexão: O autor apresenta uma visão interessante sobre o assunto.`);
          }
          
          // Ideias principais
          if (paragraphs.length >= 2) {
            const ideas = paragraphs.slice(1, 4)
              .map((p, i) => `• Conceito ${i+1}: ${p.slice(0, 50)}${p.length > 50 ? '...' : ''}`)
              .join('\n');
            
            adaptedContent = adaptedContent.replace('• Conceito 1: resumo conciso da primeira ideia central.\n• Conceito 2: síntese da segunda ideia relevante.\n• Conceito 3: explicação breve da terceira ideia importante.', ideas);
          }
          break;
          
        default:
          return template;
      }
      
      return formatTextForNotebookLines(adaptedContent);
    } catch (error) {
      console.error("Erro ao adaptar conteúdo:", error);
      return template;
    }
  };

  const handleSelectTemplate = (templateKey: keyof typeof notebookTemplates) => {
    const adaptedContent = adaptContentToTemplate(templateKey);
    onSelectTemplate(adaptedContent);
    onOpenChange(false);
    toast({
      title: "Modelo selecionado",
      description: "O conteúdo foi adaptado ao modelo e aplicado ao caderno.",
      duration: 2000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 bg-white dark:bg-[#121826] overflow-hidden flex flex-col rounded-xl border-0 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 backdrop-blur-sm sticky top-0 z-10 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-700/30 rounded-full p-2 mr-3">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-medium text-amber-800 dark:text-amber-300">
              Modelos de Anotações
            </DialogTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-amber-700 hover:text-red-600 hover:bg-red-50 dark:text-amber-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start text-left p-4 border-amber-200 hover:border-amber-400 transition-all duration-300 dark:border-amber-800/40 dark:hover:border-amber-700"
            onClick={() => handleSelectTemplate('estudoCompleto')}
          >
            <BookOpen className="h-5 w-5 mr-3 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Estudo Completo</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                Conteúdo completo e detalhado para aprendizado profundo
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start text-left p-4 border-amber-200 hover:border-amber-400 transition-all duration-300 dark:border-amber-800/40 dark:hover:border-amber-700"
            onClick={() => handleSelectTemplate('mapaConceitual')}
          >
            <Sparkles className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Mapa Conceitual</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                Visualização hierárquica de conceitos e suas relações
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start text-left p-4 border-amber-200 hover:border-amber-400 transition-all duration-300 dark:border-amber-800/40 dark:hover:border-amber-700"
            onClick={() => handleSelectTemplate('revisaoRapida')}
          >
            <AlignLeft className="h-5 w-5 mr-3 text-green-500 dark:text-green-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Revisão Rápida</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                Resumo direto para revisão antes de provas e simulados
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start text-left p-4 border-amber-200 hover:border-amber-400 transition-all duration-300 dark:border-amber-800/40 dark:hover:border-amber-700"
            onClick={() => handleSelectTemplate('fichamento')}
          >
            <FileText className="h-5 w-5 mr-3 text-purple-500 dark:text-purple-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Fichamento</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                Organiza citações, interpretações e análises críticas de textos
              </p>
            </div>
          </Button>
        </div>
        
        <div className="p-4 border-t border-amber-100 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300"
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
