import React, { useState } from "react";
import { Send, Plus, Mic, Loader2, Brain, BookOpen, AlignJustify, RotateCw, Search, Image, Lightbulb, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import QuickActionButton from "./QuickActionButton";
import AddButton from "@/components/ui/add-button";
import DeepSearchModal from "./DeepSearchModal";
import BibliotecaModal from "./BibliotecaModal";


interface EpictusMessageBoxProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
  charCount: number;
  MAX_CHARS: number;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleButtonClick: (action: string) => void;
}

const EpictusMessageBox: React.FC<EpictusMessageBoxProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isTyping,
  charCount,
  MAX_CHARS,
  handleKeyDown,
  handleButtonClick
}) => {
  const [isDeepSearchModalOpen, setIsDeepSearchModalOpen] = useState(false);
  const [isBibliotecaModalOpen, setIsBibliotecaModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isPensarActive, setIsPensarActive] = useState(false);
  const [isGerarImagemActive, setIsGerarImagemActive] = useState(false);
  const [isBibliotecaActive, setIsBibliotecaActive] = useState(() => {
    try {
      // Verificar se há uma configuração salva no localStorage
      const bibliotecaConteudos = localStorage.getItem('bibliotecaConteudos');
      if (bibliotecaConteudos) {
        // Por padrão, se existirem conteúdos na biblioteca, assumimos que a opção está ativa
        return true;
      }
    } catch (e) {
      console.error("Erro ao carregar estado da biblioteca:", e);
    }
    return false;
  });
  return (
    <motion.div 
      className="relative w-[60%] h-auto mx-auto bg-transparent rounded-2xl shadow-xl 
                border border-white/5 backdrop-blur-sm overflow-hidden flex-shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '120px' }}
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 p-4">
        {/* Opções superiores */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs 
                       rounded-lg border backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm
                       ${isSearchActive 
                         ? "bg-gradient-to-r from-[#0D23A0]/70 to-[#5B21BD]/70 text-white border-blue-500/50" 
                         : "bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 border-white/10 hover:bg-gradient-to-r hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-blue-500/30 hover:text-white"
                       }`}
              onClick={() => setIsDeepSearchModalOpen(true)}
            >
              <Search size={14} className={isSearchActive ? "text-blue-100" : "text-blue-300"} />
              <span>Buscar</span>
            </button>
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs 
                       rounded-lg border backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm
                       ${isPensarActive 
                         ? "bg-gradient-to-r from-[#0D23A0]/70 to-[#5B21BD]/70 text-white border-purple-500/50" 
                         : "bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 border-white/10 hover:bg-gradient-to-r hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-purple-500/30 hover:text-white"
                       }`}
              onClick={() => {
                setIsPensarActive(!isPensarActive);
                handleButtonClick('Pensar');
              }}
            >
              <Brain size={14} className={isPensarActive ? "text-purple-100" : "text-purple-300"} />
              <span>Pensar</span>
            </button>
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs 
                       rounded-lg border backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm
                       ${isGerarImagemActive 
                         ? "bg-gradient-to-r from-[#0D23A0]/70 to-[#5B21BD]/70 text-white border-emerald-500/50" 
                         : "bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 border-white/10 hover:bg-gradient-to-r hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-emerald-500/30 hover:text-white"
                       }`}
              onClick={() => {
                setIsGerarImagemActive(!isGerarImagemActive);
                handleButtonClick('Gerar Imagem');
              }}
            >
              <Image size={14} className={isGerarImagemActive ? "text-emerald-100" : "text-emerald-300"} />
              <span>Gerar Imagem</span>
            </button>
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs 
                       rounded-lg border backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm
                       ${isBibliotecaActive 
                         ? "bg-gradient-to-r from-[#0D23A0]/70 to-[#5B21BD]/70 text-white border-amber-500/50" 
                         : "bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 border-white/10 hover:bg-gradient-to-r hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-amber-500/30 hover:text-white"
                       }`}
              onClick={() => setIsBibliotecaModalOpen(true)}
            >
              <BookOpen size={14} className={isBibliotecaActive ? "text-amber-100" : "text-amber-300"} />
              <span>Biblioteca</span>
            </button>
          </div>

          {/* Espaços de Aprendizagem no canto direito */}
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-[#001427] to-[#002447] text-gray-200 
                    rounded-lg border border-white/10 backdrop-blur-sm hover:bg-gradient-to-r 
                    hover:from-[#001e3b] hover:to-[#002e5c] hover:border-blue-500/30
                    hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
            onClick={() => handleButtonClick('Espaços de Aprendizagem')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Espaços de Aprendizagem</span>
          </button>
        </div>

        {/* Área de input */}
        <div className="flex items-center gap-2">
          <AddButton 
            onFileUpload={(files) => {
              // Aqui você pode implementar a lógica para lidar com os arquivos enviados
              toast({
                title: `${files.length} arquivo(s) enviado(s) com sucesso`,
                description: "Os arquivos serão processados em breve.",
              });
            }} 
          />

          <div className={`relative flex-grow overflow-hidden 
                          bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                          rounded-xl border ${isTyping ? 'border-[#1230CC]/70' : 'border-white/10'} 
                          transition-all duration-300`}>
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
              className="w-full bg-transparent text-white py-3 px-3 text-sm outline-none placeholder:text-gray-400"
              disabled={isTyping}
            />
          </div>

          {/* Botão de Prompt Aprimorado - visível apenas quando o usuário começar a digitar */}
          {inputMessage.trim().length > 0 && (
            <motion.button
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#007aff] to-[#007aff] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 122, 255, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick('PromptAprimorado')}
              title="Prompt Aprimorado com IA"
            >
              <PenLine size={16} />
            </motion.button>
          )}

          {/* Botão de sugestão de prompts inteligentes - sempre visível */}
          <motion.button
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#007aff] to-[#007aff] 
                     flex items-center justify-center shadow-lg text-white"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 122, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick('SugestaoPrompts')}
            title="Sugestão de Prompts Inteligentes"
          >
            <Lightbulb size={16} />
          </motion.button>

          {/* Botão de microfone (quando não há texto) */}
          {!inputMessage.trim() ? (
            <motion.button 
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#007aff] to-[#007aff] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 122, 255, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={16} />
            </motion.button>
          ) : (
            /* Botão de enviar - Visível apenas quando há conteúdo no input */
            <motion.button
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#007aff] to-[#007aff] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 122, 255, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0 0 0px rgba(0, 122, 255, 0)", "0 0 15px rgba(0, 122, 255, 0.5)", "0 0 0px rgba(0, 122, 255, 0)"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={handleSendMessage}
              disabled={isTyping}
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send size={16} />
              )}
            </motion.button>
          )}
        </div>

        {/* Ações rápidas */}
        <motion.div 
          className="quick-actions mt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {/* Área de quick actions foi removida conforme solicitado */}
        </motion.div>
      </div>

      {/* DeepSearch Modal */}
      <DeepSearchModal 
        isOpen={isDeepSearchModalOpen}
        onClose={() => setIsDeepSearchModalOpen(false)}
        onSearch={(query, options) => {
          // Fechar o modal
          setIsDeepSearchModalOpen(false);

          // Verificar se há alguma opção ativa para destacar o botão de busca
          setIsSearchActive(options.webGlobal || options.academico || options.social);

          if (options.webGlobal || options.academico || options.social) {
            // Construir a mensagem de busca avançada apenas se tiver opções ativas
            let searchMessage = `🔍 DeepSearch`;

            // Adicionar fontes selecionadas
            const fontes = [];
            if (options.webGlobal) fontes.push("Web Global");
            if (options.academico) fontes.push("Acadêmico");
            if (options.social) fontes.push("Social");
            searchMessage += ` [Fontes: ${fontes.join(", ")}]`;

            // Adicionar profundidade da busca
            searchMessage += ` [Profundidade: ${options.searchDepth}]`;

            // Definir a mensagem no campo de input
            setInputMessage(searchMessage);
          }
        }}
      />

      {/* Biblioteca Modal */}
      <BibliotecaModal 
        isOpen={isBibliotecaModalOpen}
        onClose={() => setIsBibliotecaModalOpen(false)}
        onPermiteUsarTodosChange={(value) => setIsBibliotecaActive(value)}
      />
    </motion.div>
  );
};

export default EpictusMessageBox;