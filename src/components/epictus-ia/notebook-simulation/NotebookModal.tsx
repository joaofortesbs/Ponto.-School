import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NotebookSimulation from '@/components/chat/NotebookSimulation';
import { Button } from '@/components/ui/button';
import { BookOpen, Copy, Download, Share2, X, Pencil, Save, FileText, Star, StarOff, BarChart, AlignLeft, Sparkles } from 'lucide-react';
import { FileText as FileIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ModelosNotebookModal from './ModelosNotebookModal';
import ExportModal from './ExportModal'; // Added import for the export modal
import { supabase } from '@/lib/supabase';


interface NotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

// Templates para formatações comuns
const contentTemplates = {
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

const NotebookModal: React.FC<NotebookModalProps> = ({ open, onOpenChange, content }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  const [showModelosModal, setShowModelosModal] = useState(false);
  const [anotacaoTitulo, setAnotacaoTitulo] = useState(''); // State for suggested title
  const [exportModalOpen, setExportModalOpen] = useState(false); // State for export modal
  const [isExporting, setIsExporting] = useState(false); //State for exporting

  // Atualiza o conteúdo do caderno quando props.content muda
  useEffect(() => {
    if (content && !isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  // Contador de palavras
  const wordCount = editedContent.split(/\s+/).filter(word => word.length > 0).length;

  // Função para aplicar o modelo selecionado
  const handleApplyTemplate = (templateContent: string) => {
    setEditedContent(templateContent);
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedContent : content)
      .then(() => {
        toast({
          title: "Conteúdo copiado!",
          description: "O texto das anotações foi copiado para a área de transferência.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Erro ao copiar texto:', err);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o conteúdo.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  const handleDownload = () => {
    // Create a blob from the content
    const blob = new Blob([isEditing ? editedContent : content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anotacoes-caderno.txt';
    document.body.appendChild(a);
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Download iniciado!",
      description: "Suas anotações foram baixadas como arquivo de texto.",
      duration: 3000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minhas anotações',
        text: isEditing ? editedContent : content
      })
      .then(() => {
        toast({
          title: "Compartilhado com sucesso!",
          description: "Suas anotações foram compartilhadas.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Erro ao compartilhar:', err);
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar o conteúdo.",
          variant: "destructive",
          duration: 3000,
        });
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopy();
      toast({
        title: "Conteúdo copiado para compartilhar",
        description: "O recurso de compartilhamento não está disponível no seu navegador, mas o conteúdo foi copiado para a área de transferência.",
        duration: 3000,
      });
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportação para PDF",
      description: "A funcionalidade de exportação para PDF está sendo preparada.",
      duration: 3000,
    });
    // Aqui seria implementada a lógica de exportação para PDF
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isFavorite 
        ? "Esta anotação foi removida dos seus favoritos." 
        : "Esta anotação foi adicionada aos seus favoritos.",
      duration: 2000,
    });
  };

  const startEditing = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const saveChanges = () => {
    setIsEditing(false);
    setShowSuggestions(true);

    // Aqui você poderia adicionar lógica para salvar as alterações no backend
    toast({
      title: "Alterações salvas!",
      description: "Suas edições no caderno foram salvas com sucesso.",
      duration: 2000,
    });

    // Simulação de uma animação de escrita finalizada
    setTimeout(() => {
      setShowSuggestions(false);
    }, 8000);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedContent(content);
    toast({
      title: "Edição cancelada",
      description: "As alterações foram descartadas.",
      duration: 2000,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);

    // Exemplo mais robusto de auto-correção com regex para identificar palavras inteiras
    const correctedText = e.target.value
      .replace(/\b(nao)\b/gi, "não")
      .replace(/\b(eh)\b/gi, "é")
      .replace(/\b(pra)\b/gi, "para")
      .replace(/\b(tbm)\b/gi, "também")
      .replace(/\b(vc)\b/gi, "você")
      .replace(/\b(q)\b/gi, "que")
      .replace(/\b(qdo)\b/gi, "quando")
      .replace(/\b(pq)\b/gi, "porque");

    if (correctedText !== e.target.value) {
      setEditedContent(correctedText);
    }

    // Ajusta automaticamente a altura do textarea baseado no conteúdo
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, window.innerHeight * 0.65)}px`;
  };

  const handleSaveToLocal = () => {
    localStorage.setItem('saved_notebook_content', editedContent);
    setIsEditing(false);
    toast({
      title: "Anotação salva!",
      description: "Seu conteúdo foi salvo localmente com sucesso.",
    });
  };

  // Extrair título do conteúdo para usar como sugestão de título
  useEffect(() => {
    if (editedContent) {
      // Tentar extrair o título do conteúdo
      const lines = editedContent.split('\n');
      for (const line of lines) {
        if (line.trim().length > 0 && line.trim().length < 100) {
          setAnotacaoTitulo(line.trim());
          break;
        }
      }
    }
  }, [editedContent]);

  const handleExportToApostila = () => {
    // Salvar localmente primeiro
    localStorage.setItem('saved_notebook_content', editedContent);

    // Abrir modal de exportação
    setExportModalOpen(true);
  };

  const handleExportComplete = async (data: {
    titulo: string;
    conteudo: string;
    pastaId: string;
    tags: string[];
    modelo: string;
  }) => {
    let sucesso = false;
    let ultimoErro;
    let tentativas = 0;

    while (!sucesso && tentativas < 3) { // Até 3 tentativas
      try {
        setIsExporting(true);
        const userId = localStorage.getItem('user_id') || 'anonymous';

        // Verificar se os dados foram fornecidos corretamente
        if (!data.titulo || !data.conteudo || !data.pastaId) {
          throw new Error('Dados incompletos para exportação');
        }

        console.log('Iniciando exportação para Apostila:', { 
          userId, 
          titulo: data.titulo,
          pastaId: data.pastaId,
          tamanhoConteudo: data.conteudo.length
        });

        // 1. Salvar a anotação no caderno_anotacoes
        const { data: cadernoInsertData, error: cadernoError } = await supabase
          .from('caderno_anotacoes')
          .insert([
            {
              user_id: userId,
              titulo: data.titulo,
              conteudo: data.conteudo,
              modelo_anotacao: data.modelo,
              tags: data.tags,
              status: 'exportado',
              data_criacao: new Date().toISOString()
            }
          ])
          .select('id')
          .single();

        if (cadernoError) {
          console.error('Erro ao salvar no caderno_anotacoes:', cadernoError);
          throw new Error(`Erro na tabela caderno_anotacoes: ${cadernoError.message}`);
        }

        console.log('Anotação salva no caderno_anotacoes com ID:', cadernoInsertData?.id);
        const result = cadernoInsertData;

        // Se chegou aqui, a inserção no caderno foi bem-sucedida
        sucesso = true;

        // 2. Exportar para a apostila_anotacoes
        const {
          data: apostilaData,
          error: apostilaError
        } = await supabase
          .from('apostila_anotacoes')
          .insert([
            {
              user_id: userId,
              pasta_id: data.pastaId,
              titulo: data.titulo,
              conteudo: data.conteudo,
              modelo_anotacao: data.modelo,
              tags: data.tags,
              data_criacao: new Date().toISOString(),
              data_exportacao: new Date().toISOString(),
              origem: 'caderno'
            }
          ])
          .select();

        if (apostilaError) {
          console.error('Erro ao exportar para Apostila:', apostilaError);

          // Verificar se o erro está relacionado à permissão RLS
          if (apostilaError.code === '42501') {
            throw new Error('Erro de permissão: Verifique se você tem acesso para exportar anotações.');
          } else {
            throw new Error(`Erro ao exportar para Apostila: ${apostilaError.message}`);
          }
        }

        // 3. Atualizar o status da anotação no caderno
        if (result.data && result.data[0]) {
          const { error: updateError } = await supabase
            .from('caderno_anotacoes')
            .update({ 
              status: 'exportado',
              data_atualizacao: new Date().toISOString()
            })
            .eq('id', result.data[0].id)
            .eq('user_id', userId); // Garantir que atualize apenas as anotações do usuário

          if (updateError) {
            console.error('Erro ao atualizar status da anotação:', updateError);
            // Não falhar o processo principal se apenas a atualização de status falhar
          }
        }

        // 4. Registrar a atividade (opcional)
        try {
          await supabase.from('user_activity_logs').insert({
            user_id: userId,
            acao: 'exportou anotação',
            anotacao_id: apostilaData?.[0]?.id,
            timestamp: new Date().toISOString(),
            detalhes: `Anotação "${data.titulo}" exportada para a Apostila Inteligente.`
          });
        } catch (logError) {
          console.warn('Falha ao registrar log de atividade:', logError);
          // Não falhar o processo principal por causa do log
        }

        console.log('Exportação concluída com sucesso');

        toast({
          title: "Exportado com sucesso!",
          description: "Sua anotação foi exportada para a Apostila Inteligente.",
        });

      } catch (err) {
        ultimoErro = err;
        console.error(`Tentativa ${tentativas + 1} falhou:`, err);
        // Esperar um tempo antes de tentar novamente (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, tentativas) * 1000));
        tentativas++;
      }
    }

    if (!sucesso) {
      // Se todas as tentativas falharam
      console.error('Todas as tentativas de exportação falharam:', ultimoErro);
      toast({
        title: "Erro ao exportar",
        description: `Não foi possível exportar após várias tentativas: ${ultimoErro instanceof Error ? ultimoErro.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } else {
        // Apenas fechar o modal após confirmar que tudo foi processado
        setTimeout(() => {
          setExportModalOpen(false);
        }, 1000);

      // Atualizar as anotações no componente de Apostila se estiver aberto
      const apostilaModalEvent = new CustomEvent('apostila-anotacao-adicionada', {
        detail: { pastaId: data.pastaId }
      });
      window.dispatchEvent(apostilaModalEvent);
    }
    finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 bg-white dark:bg-[#121826] overflow-hidden flex flex-col rounded-xl border-0 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 backdrop-blur-sm flex flex-row items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-700/30 rounded-full p-2 mr-3">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-center">
              <DialogTitle className="text-xl font-medium text-amber-800 dark:text-amber-300">
                Anotações em Caderno
              </DialogTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2 h-7 w-7 text-amber-600 hover:text-amber-500 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-800/30 transition-all duration-300"
                      onClick={toggleFavorite}
                    >
                      {isFavorite ? 
                        <Star className="h-4 w-4 fill-amber-400" /> : 
                        <StarOff className="h-4 w-4" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 hover:text-green-600 hover:bg-green-50 dark:text-amber-400 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-300"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4 mr-1.5" /> Copiar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copiar conteúdo do caderno</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 hover:text-blue-600 hover:bg-blue-50 dark:text-amber-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-300"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-1.5" /> Baixar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Baixar como arquivo de texto</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 hover:text-purple-600 hover:bg-purple-50 dark:text-amber-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 transition-all duration-300"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-1.5" /> Compartilhar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartilhar anotações</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 hover:text-red-600 hover:bg-red-50 dark:text-amber-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300"
                    onClick={handleExportPDF}
                  >
                    <FileIcon className="h-4 w-4 mr-1.5" /> PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar como PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 hover:text-red-600 hover:bg-red-50 dark:text-amber-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 ml-1 transition-all duration-300"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fechar caderno</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-8 bg-gradient-to-b from-amber-50/50 to-amber-100/30 dark:from-amber-900/10 dark:to-[#1a1f2c]/95">
          <div className="relative max-w-4xl mx-auto">
            {/* Decorative elements */}
            <div className="absolute -left-6 top-4 w-3 h-[95%] bg-amber-200 dark:bg-amber-700/40 rounded-r-md"></div>
            <div className="absolute -left-3 top-2 bottom-2 w-0.5 h-[98%] bg-red-400/60 dark:bg-red-500/40"></div>

            {/* Paper effect with shadow */}
            <div className="bg-[#fffef5] dark:bg-[#161c26] rounded-md p-6 shadow-[0_5px_25px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_25px_rgba(0,0,0,0.3)] relative before:absolute before:inset-0 before:bg-[url('/images/pattern-grid.svg')] before:opacity-[0.03] before:bg-repeat before:z-0">
              <div className="relative z-10">
                {isEditing ? (
                  <div className="editor-container">
                    <div className="formatting-toolbar bg-amber-50/80 dark:bg-amber-900/20 p-2 rounded-t-md mb-2 flex items-center space-x-2 border border-amber-200 dark:border-amber-800/30">
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `## ${prev}`)}
                        title="Adicionar título"
                      >
                        <span className="font-bold text-sm">H1</span>
                      </button>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `### ${prev}`)}
                        title="Adicionar subtítulo"
                      >
                        <span className="font-bold text-sm">H2</span>
                      </button>
                      <span className="w-px h-5 bg-amber-200 dark:bg-amber-700/30"></span>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `**${prev}**`)}
                        title="Negrito"
                      >
                        <span className="font-bold">B</span>
                      </button>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `• ${prev}`)}
                        title="Adicionar marcador"
                      >
                        <span>•</span>
                      </button>
                      <span className="w-px h-5 bg-amber-200 dark:bg-amber-700/30"></span>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `${prev} 📖`)}
                        title="Emoji livro"
                      >
                        <span>📖</span>
                      </button>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `${prev} 🧠`)}
                        title="Emoji cerebro"
                      >
                        <span>🧠</span>
                      </button>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `${prev} 💡`)}
                        title="Emoji lampada"
                      >
                        <span>💡</span>
                      </button>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `${prev} ⚙️`)}
                        title="Emoji engrenagem"
                      >
                        <span>⚙️</span>
                      </button>
                      <button 
                        type="button" 
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-400"
                        onClick={() => setEditedContent(prev => `${prev} ✅`)}
                        title="Emoji check"
                      >
                        <span>✅</span>
                      </button>
                    </div>
                    <Textarea 
                      value={editedContent}
                      onChange={handleContentChange}
                      className="w-full min-h-[250px] p-0 bg-transparent focus:ring-0 focus:border-0 border-none shadow-none resize-none font-['Architects_Daughter',_'Comic_Sans_MS',_cursive,_system-ui] text-lg leading-notebook-line notebook-textarea text-[#333] dark:text-[#f0f0f0] whitespace-pre-wrap"
                      placeholder="Digite suas anotações aqui..."
                      onKeyDown={(e) => {
                        // Verificar se a linha atual excede o tamanho recomendado ao apertar Enter
                        if (e.key === 'Enter') {
                          const textarea = e.currentTarget;
                          const cursorPosition = textarea.selectionStart;
                          const text = textarea.value;

                          // Encontrar o início da linha atual
                          let lineStart = cursorPosition;
                          while (lineStart > 0 && text[lineStart - 1] !== '\n') {
                            lineStart--;
                          }

                          // Verificar o comprimento da linha atual
                          const currentLineText = text.substring(lineStart, cursorPosition);
                          if (currentLineText.length > 58) {
                            // Sugerir quebrar em linhas menores
                            toast({
                              title: "Dica de formatação",
                              description: "Linha muito longa! Considere quebrar em linhas menores para melhor visualização.",
                              duration: 3000,
                            });
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <NotebookSimulation content={isEditing ? editedContent : content} />
                )}
              </div>

              {/* Decorative pencil icon */}
              <div className="absolute -right-2 -bottom-2 bg-amber-100 dark:bg-amber-700/30 rounded-full p-2 shadow-md transform rotate-12">
                <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            {/* Suggestions after editing */}
            {showSuggestions && !isEditing && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/30 animate-fadeIn">
                <h4 className="text-blue-700 dark:text-blue-300 font-medium mb-2">Sugestões para sua anotação:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-blue-600 dark:text-blue-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                    <button className="text-sm hover:underline">Adicionar um resumo no final</button>
                  </li>
                  <li className="flex itemscenter text-blue-600 dark:text-blue-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                    <button className="text-sm hover:underline">Marcar como importante</button>
                  </li>
                  <li className="flex items-center text-blue-600 dark:text-blue-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                    <button className="text-sm hover:underline">Organizar em tópicos</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal de seleção de modelos */}
        <ModelosNotebookModal 
          open={showModelosModal} 
          onOpenChange={setShowModelosModal} 
          onSelectTemplate={handleApplyTemplate}
        />

        {/* Footer with stats and edit controls */}
        <div className="px-6 py-3 border-t border-amber-100 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 flex items-center justify-between">
          <div className="flex items-center text-amber-700 dark:text-amber-400 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mr-4">
                    <FileText className="h-4 w-4 mr-1.5 opacity-70" />
                    <span>{wordCount} palavras</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total de palavras na anotação</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-1.5 opacity-70" />
                    <span>{editedContent.length} caracteres</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total de caracteres na anotação</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            {isEditing ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelEditing}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300"
                >
                  Cancelar
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300 flex items-center"
                  onClick={() => setShowModelosModal(true)}
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  Modelos
                </Button>

                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={saveChanges}
                  className="bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Salvar alterações
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleExportToApostila}
                  className="text-[#42C5F5] hover:text-white hover:bg-[#42C5F5]/20"
                >
                  <BookOpen size={16} className="mr-2" /> Exportar para Apostila
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowModelosModal(true)}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  Modelos
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startEditing}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300"
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Editar texto
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} onExport={handleExportComplete} initialTitle={anotacaoTitulo} initialContent={editedContent}/>
    </>
  );
};

export default NotebookModal;