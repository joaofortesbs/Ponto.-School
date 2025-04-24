import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Mic, Send, Brain, BookOpen, FileText, RotateCw, AlignJustify, Zap, X } from "lucide-react";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => {
  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                 text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md dark:from-[#0c2341]/50 dark:to-[#0f3562]/50 dark:text-white"
      whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

const TurboAdvancedMessageBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);

  // Efeito visual quando o input recebe texto
  const inputHasContent = message.trim().length > 0;

  const quickActions = [
    { icon: <Brain size={16} className="text-blue-300 dark:text-blue-300" />, label: "Simulador de Provas" },
    { icon: <BookOpen size={16} className="text-emerald-300 dark:text-emerald-300" />, label: "Gerar Caderno" },
    { icon: <AlignJustify size={16} className="text-purple-300 dark:text-purple-300" />, label: "Criar Fluxograma" },
    { icon: <RotateCw size={16} className="text-indigo-300 dark:text-indigo-300" />, label: "Reescrever Explicação" },
    { icon: <FileText size={16} className="text-amber-300 dark:text-amber-300" />, label: "Análise de Redação" },
    { icon: <Zap size={16} className="text-rose-300 dark:text-rose-300" />, label: "Resumir Conteúdo" }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Mensagem enviada:", message);
    // Aqui você implementaria a lógica de envio para o backend
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para iniciar a gravação de áudio
  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Criar uma instância do MediaRecorder com o stream de áudio
          const recorder = new MediaRecorder(stream);
          setAudioRecorder(recorder);
          setAudioChunks([]);

          // Coletar chunks de dados do áudio gravado
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              setAudioChunks(prev => [...prev, e.data]);
            }
          };

          // Quando a gravação parar
          recorder.onstop = () => {
            // Criar um blob com todos os chunks de áudio
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            // Aqui você pode implementar o envio do áudio para processamento
            console.log("Áudio gravado:", audioBlob);

            // Parar todos os tracks da stream
            stream.getTracks().forEach(track => track.stop());

            // Resetar estado de gravação
            setIsRecording(false);
          };

          // Iniciar gravação
          recorder.start();
          setIsRecording(true);
        })
        .catch(err => {
          console.error("Erro ao acessar microfone:", err);
        });
    }
  };

  // Função para parar a gravação
  const stopRecording = () => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      audioRecorder.stop();
    }
  };

  return (
    <>
      {/* Texto personalizado acima da caixa de mensagens */}
      <div className="text-center mb-16 w-full max-w-7xl mx-auto">
        <h2 className="text-4xl text-white dark:text-white">
          <span className="font-bold">Como a IA mais <span className="text-[#0049e2] bg-gradient-to-r from-[#0049e2] to-[#0049e2]/80 bg-clip-text text-transparent relative after:content-[''] after:absolute after:h-[3px] after:bg-[#0049e2] after:w-0 after:left-0 after:bottom-[-5px] after:transition-all after:duration-300 group-hover:after:w-full hover:after:w-full dark:text-[#0049e2]">Inteligente do mundo</span>
          </span><br />
          <span className="font-light text-3xl text-gray-800 dark:text-gray-300">pode te ajudar hoje {localStorage.getItem('username') || 'João Marcelo'}?</span>
        </h2>
      </div>

      {/* Adicionando espaço vertical antes da caixa de mensagens */}
      <div className="w-full h-20"></div>

      <div className="w-full mx-auto mb-2 p-1 hub-connected-width"> {/* Usando a mesma classe de largura do cabeçalho */}
      <motion.div 
        className="relative bg-gradient-to-r from-[#050e1d]/90 to-[#0d1a30]/90 rounded-2xl shadow-xl 
                   border border-white/5 backdrop-blur-sm overflow-hidden dark:bg-gradient-to-r dark:from-[#050e1d]/90 dark:to-[#0d1a30]/90 dark:border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Partículas de fundo */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Container principal */}
        <div className="relative z-10 p-3">

          {/* Botões de ação na parte superior */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 pl-1">
              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="text-sm font-medium">Buscar</span>
              </motion.button>

              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300 dark:text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"></path>
                  <path d="M12 16v.01"></path>
                  <path d="M12 12a2.5 2.5 0 0 0 2.5-2.5c0-1.5-2.5-2.5-2.5-4"></path>
                </svg>
                <span className="text-sm font-medium">Pensar</span>
              </motion.button>

              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300 dark:text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span className="text-sm font-medium">Gerar Imagem</span>
              </motion.button>
            </div>

            {/* Componente Espaços de Aprendizagem no canto direito */}
            <div className="pr-1">
              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-300 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                  <circle cx="10" cy="10" r="1"></circle>
                  <path d="M13 10h4"></path>
                  <circle cx="10" cy="14" r="1"></circle>
                  <path d="M13 14h4"></path>
                </svg>
                <span className="text-sm font-medium">Espaços de Aprendizagem</span>
              </motion.button>
            </div>
          </div>

          {/* Área de input */}
          <div className="flex items-center gap-2">
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white dark:text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Plus size={18} />
            </motion.button>

            <div className={`relative flex-grow overflow-hidden 
                            bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                            rounded-xl border ${isInputFocused ? 'border-[#1230CC]/70' : 'border-white/10'} 
                            transition-all duration-300 dark:bg-gradient-to-r dark:from-[#0c2341]/30 dark:to-[#0f3562]/30 dark:border-[#1230CC]/70`}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
                className="w-full bg-transparent text-white py-3 px-3 outline-none placeholder:text-gray-400 text-sm dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Botão de microfone (quando não há texto) */}
            {!inputHasContent ? (
              <motion.button 
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white dark:text-white"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
              >
                <Mic size={16} />
              </motion.button>
            ) : (
              /* Botão de enviar - Visível apenas quando há conteúdo no input */
              <motion.button
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white dark:text-white"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={handleSendMessage}
              >
                <Send size={16} />
              </motion.button>
            )}
          </div>

          {/* Interface de gravação de áudio */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                className="recording-interface mt-2 p-2 bg-[#0c2341]/40 rounded-xl border border-red-500/30 flex items-center justify-between dark:bg-[#0c2341]/40 dark:border-red-500/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm text-white/80 dark:text-white/80">Gravando áudio...</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white dark:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRecording(false)}
                  >
                    <X size={16} />
                  </motion.button>
                  <motion.button
                    className="p-1.5 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD]"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRecording}
                  >
                    <Send size={16} className="text-white dark:text-white" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ações rápidas */}
          <AnimatePresence>
            <motion.div 
              className="quick-actions mt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {quickActions.map((action, index) => (
                <QuickAction 
                  key={index} 
                  icon={action.icon} 
                  label={action.label} 
                  onClick={() => console.log(`Ação rápida: ${action.label}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Painel expandido (opcional) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="expanded-panel mt-3 p-3 bg-[#0c2341]/40 rounded-xl border border-white/10 dark:bg-[#0c2341]/40 dark:border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs text-white/70 mb-1 w-full dark:text-white/70">Opções avançadas:</div>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10 dark:text-white"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Escolher competência
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10 dark:text-white"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Modo resposta rápida
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10 dark:text-white"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Adicionar mídia
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="w-full max-w-full px-2"> {/* Changed px-4 to px-2 */}
            {/* Conteúdo da caixa de mensagens */}
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default TurboAdvancedMessageBox;