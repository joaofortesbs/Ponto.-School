
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

interface NotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

// Templates para formatações comuns
const contentTemplates = {
  estudoCompleto: `📖 Título do Tema

Uma breve introdução sobre o assunto que está sendo estudado.

🧠 Definição:
• Ponto principal do conceito
• Características importantes
• Princípios fundamentais

⚙️ Fórmulas Importantes:
• Fórmula 1
• Fórmula 2

🔍 Exemplos Práticos:
1. Primeiro exemplo com solução
2. Segundo exemplo com solução

💡 Dicas Importantes:
• Dica 1
• Dica 2

✅ Resumo Final:
Síntese dos principais pontos aprendidos.`,

  mapaConceitual: `📑 MAPA CONCEITUAL: [TEMA]

🔑 CONCEITO CENTRAL
└── 📌 Subtema 1
    ├── • Característica 1
    ├── • Característica 2
    └── • Exemplo prático

└── 📌 Subtema 2
    ├── • Definição
    ├── • Fórmula
    └── • Aplicação

📝 OBSERVAÇÕES IMPORTANTES:
• Ponto 1
• Ponto 2

✅ PARA LEMBRAR:
• Regra principal
• Exceção`,

  revisao: `📚 REVISÃO RÁPIDA: [TEMA]

⏱️ Principais tópicos:
1. Tópico 1
2. Tópico 2
3. Tópico 3

🧩 Conceitos-chave:
• Conceito A: definição breve
• Conceito B: definição breve

⚠️ ATENÇÃO PARA:
• Erro comum 1
• Erro comum 2

✅ Checklist de revisão:
□ Item 1
□ Item 2
□ Item 3`,

  fichamento: `📘 FICHAMENTO: [LIVRO/TEXTO]

📝 Referência:
Autor, A. (Ano). Título. Editora.

🔍 Ideias Principais:
• Ideia 1
• Ideia 2
• Ideia 3

💬 Citações Importantes:
"Citação relevante do texto" (página)

🧠 Análise Pessoal:
Minhas observações e reflexões sobre o texto.

🔄 Conexões com outros temas:
• Conexão 1
• Conexão 2`
};

const NotebookModal: React.FC<NotebookModalProps> = ({ open, onOpenChange, content }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  
  // Atualiza o conteúdo do caderno quando props.content muda
  useEffect(() => {
    if (content && !isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  // Contador de palavras
  const wordCount = editedContent.split(/\s+/).filter(word => word.length > 0).length;
  
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

  return (
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
                  <li className="flex items-center text-blue-600 dark:text-blue-300">
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
                
                <Popover open={showTemplatePopover} onOpenChange={setShowTemplatePopover}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300 flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1.5" />
                      Modelos
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 p-0 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/40"
                    align="end"
                  >
                    <div className="py-2 px-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/20">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Modelos de Anotações</h4>
                    </div>
                    <div className="p-3 space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => {
                          setEditedContent(contentTemplates.estudoCompleto);
                          setShowTemplatePopover(false);
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Estudo Completo
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => {
                          setEditedContent(contentTemplates.mapaConceitual);
                          setShowTemplatePopover(false);
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Mapa Conceitual
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => {
                          setEditedContent(contentTemplates.revisao);
                          setShowTemplatePopover(false);
                        }}
                      >
                        <AlignLeft className="h-4 w-4 mr-2" />
                        Revisão Rápida
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => {
                          setEditedContent(contentTemplates.fichamento);
                          setShowTemplatePopover(false);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Fichamento
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={saveChanges}
                  className="bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Salvar alterações
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startEditing}
                className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-300"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Editar texto
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
