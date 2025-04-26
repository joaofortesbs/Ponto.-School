import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Search, Clock, Sparkles, RefreshCw, ThumbsUp, ChevronRight } from "lucide-react";
import { generateAIResponse } from "@/services/aiChatService";

interface PromptSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  currentContext?: string;
  onHistoricoClick?: () => void; // Added for the history modal
}

const PromptSuggestionsModal: React.FC<PromptSuggestionsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  currentContext = "estudos",
  onHistoricoClick
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggested' | 'recent' | 'custom'>('suggested');
  const [customContent, setCustomContent] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default suggested prompts baseados no contexto
  const defaultPrompts = {
    estudos: [
      "Explique o conceito de [tópico] de forma simples e didática",
      "Quais são as principais aplicações de [conceito] na vida real?",
      "Como resolver problemas de [matéria] de forma mais eficiente?",
      "Crie um resumo completo sobre [assunto] com pontos-chave",
      "Quais são as estratégias mais eficazes para estudar [matéria]?"
    ],
    escrita: [
      "Ajude-me a elaborar um texto sobre [tema] com argumentos fortes",
      "Como posso melhorar a coesão e coerência do meu texto?",
      "Dê sugestões para tornar minha redação mais persuasiva",
      "Quais conectivos posso usar para melhorar a fluidez do texto?",
      "Explique a estrutura ideal para uma redação dissertativa-argumentativa"
    ],
    geral: [
      "Me ajude a compreender melhor o assunto de [tema]",
      "Crie um plano de estudos para [objetivo]",
      "Quais são as melhores técnicas para memorizar [conteúdo]?",
      "Como aplicar o método Pomodoro para estudar [matéria]?",
      "Explique [conceito] usando analogias do cotidiano"
    ]
  };

  // Carregar prompts sugeridos baseados no contexto
  useEffect(() => {
    const contextKey = currentContext in defaultPrompts 
      ? currentContext as keyof typeof defaultPrompts
      : 'geral';

    setSuggestedPrompts(defaultPrompts[contextKey]);

    // Carregar prompts recentes do localStorage
    const savedRecentPrompts = localStorage.getItem('recentPrompts');
    if (savedRecentPrompts) {
      try {
        setRecentPrompts(JSON.parse(savedRecentPrompts));
      } catch (e) {
        console.error('Erro ao carregar prompts recentes:', e);
        setRecentPrompts([]);
      }
    }
  }, [currentContext]);

  // Filtrar prompts baseados na pesquisa
  const filteredPrompts = suggestedPrompts.filter(prompt => 
    prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para salvar um prompt recente
  const saveRecentPrompt = (prompt: string) => {
    const updatedRecentPrompts = [
      prompt,
      ...recentPrompts.filter(p => p !== prompt).slice(0, 4) // Limitar a 5 itens
    ];
    setRecentPrompts(updatedRecentPrompts);
    localStorage.setItem('recentPrompts', JSON.stringify(updatedRecentPrompts));
  };

  // Função para selecionar um prompt
  const handleSelectPrompt = (prompt: string) => {
    saveRecentPrompt(prompt);
    onSelectPrompt(prompt);
    onClose();
  };

  // Função para gerar prompts personalizados baseados no conteúdo
  const generateCustomPrompts = async () => {
    if (!customContent.trim()) return;

    setIsGenerating(true);
    setGeneratedPrompts([]);

    try {
      // Criar um prompt para o AI gerar sugestões de prompts
      const promptEngineering = `
        Com base no seguinte contexto ou anotações de estudo, gere 5 perguntas ou prompts inteligentes e específicos 
        que o usuário poderia fazer para obter informações valiosas sobre o assunto.
        Os prompts devem ser variados, cobrir diferentes aspectos do tema, e ser formulados para obter respostas detalhadas.
        Responda APENAS com os 5 prompts, um por linha, sem numeração ou explicações adicionais.

        Contexto de estudo:
        ${customContent}
      `;

      // Chamar a API para gerar os prompts
      const response = await generateAIResponse(
        promptEngineering,
        `prompt_suggestions_${Date.now()}`,
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );

      // Processar a resposta para extrair os prompts
      if (response) {
        const extractedPrompts = response
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && !line.startsWith('Prompt') && !line.startsWith('-'));

        setGeneratedPrompts(extractedPrompts.slice(0, 5));
      }
    } catch (error) {
      console.error('Erro ao gerar prompts personalizados:', error);
      // Definir alguns prompts padrão em caso de erro
      setGeneratedPrompts([
        "Explique os principais conceitos deste assunto de forma detalhada",
        "Como este tema se relaciona com aplicações práticas?",
        "Quais são os pontos mais importantes a serem estudados neste tópico?",
        "Crie um resumo estruturado deste conteúdo para revisão",
        "Quais conceitos deste tema costumam aparecer em provas e avaliações?"
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#061528] border border-blue-900/50 rounded-xl w-full max-w-md overflow-hidden shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-4 bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] flex justify-between items-center">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-300" />
                <span>Sugestão de Prompts Inteligentes</span>
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-blue-900/30">
              <button
                className={`px-4 py-2 text-sm font-medium flex-1 ${
                  activeTab === 'suggested'
                    ? 'text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('suggested')}
              >
                Sugestões
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex-1 ${
                  activeTab === 'recent'
                    ? 'text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('recent')}
              >
                Recentes
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex-1 ${
                  activeTab === 'custom'
                    ? 'text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('custom')}
              >
                Personalizado
              </button>
            </div>

            {/* Barra de pesquisa (apenas para aba de sugestões) */}
            {activeTab === 'suggested' && (
              <div className="p-3 border-b border-blue-900/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar sugestões..."
                    className="w-full pl-10 pr-4 py-2 bg-[#0a1a30] border border-blue-900/30 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Conteúdo da aba selecionada */}
            <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-1">
              {activeTab === 'suggested' && (
                <div className="space-y-2 p-2">
                  {filteredPrompts.length > 0 ? (
                    filteredPrompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gradient-to-r from-[#0a1a30] to-[#0c1d35] rounded-lg border border-blue-900/30 hover:border-blue-500/50 cursor-pointer group transition-all duration-200"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D23A0]/30 to-[#5B21BD]/30 flex-shrink-0 flex items-center justify-center group-hover:from-[#0D23A0]/50 group-hover:to-[#5B21BD]/50 transition-colors">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                          </div>
                          <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{prompt}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Nenhum prompt encontrado</p>
                      <p className="text-sm mt-1">Tente uma pesquisa diferente</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recent' && (
                <div className="space-y-2 p-2">
                  {recentPrompts.length > 0 ? (
                    recentPrompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gradient-to-r from-[#0a1a30] to-[#0c1d35] rounded-lg border border-blue-900/30 hover:border-blue-500/50 cursor-pointer group transition-all duration-200"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D23A0]/30 to-[#5B21BD]/30 flex-shrink-0 flex items-center justify-center group-hover:from-[#0D23A0]/50 group-hover:to-[#5B21BD]/50 transition-colors">
                            <Clock className="h-4 w-4 text-blue-400" />
                          </div>
                          <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{prompt}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Nenhum prompt recente</p>
                      <p className="text-sm mt-1">Seus prompts usados recentemente aparecerão aqui</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="p-3 space-y-4">
                  <div>
                    <label htmlFor="custom-content" className="block text-sm font-medium text-gray-300 mb-1">
                      Cole seu texto ou anotações para gerar prompts personalizados:
                    </label>
                    <textarea
                      id="custom-content"
                      rows={5}
                      className="w-full p-3 bg-[#0a1a30] border border-blue-900/30 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      placeholder="Cole aqui o texto ou suas anotações para gerar prompts inteligentes e personalizados..."
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    className="w-full py-2 bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={generateCustomPrompts}
                    disabled={!customContent.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Gerando prompts...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Gerar prompts inteligentes</span>
                      </>
                    )}
                  </button>

                  {generatedPrompts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-400" />
                        <span>Prompts personalizados gerados:</span>
                      </h4>

                      {generatedPrompts.map((prompt, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gradient-to-r from-[#0a1a30] to-[#0c1d35] rounded-lg border border-blue-900/30 hover:border-blue-500/50 cursor-pointer group transition-all duration-200"
                          onClick={() => handleSelectPrompt(prompt)}
                        >
                          <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{prompt}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="p-3 bg-[#061020] border-t border-blue-900/30 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Selecione um prompt para iniciar
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Cancelar
              </button>
              {onHistoricoClick && ( // Conditionally render the button
                <div className="p-2">
                  <button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-between text-gray-300 bg-[#1A2634]/30 hover:bg-[#1A2634]/50 border-[#2A3645]/50"
                    onClick={() => {
                      if (typeof onClose === 'function') {
                        onClose();
                      }
                      if (typeof onHistoricoClick === 'function') {
                        onHistoricoClick();
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-[#4A90E2]" />
                      <span>Histórico de conversas</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromptSuggestionsModal;