import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Mic, Send, Brain, BookOpen, FileText, RotateCw, AlignJustify, Zap, X } from "lucide-react";
import ParticlesBackground from "./components/ParticlesBackground";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => {
  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                 text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
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

const TurboMessageBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);

  // Efeito visual quando o input recebe texto
  const inputHasContent = message.trim().length > 0;

  const quickActions = [
    { icon: <Brain size={16} className="text-blue-300" />, label: "Simulador de Provas" },
    { icon: <BookOpen size={16} className="text-emerald-300" />, label: "Gerar Caderno" },
    { icon: <AlignJustify size={16} className="text-purple-300" />, label: "Criar Fluxograma" },
    { icon: <RotateCw size={16} className="text-indigo-300" />, label: "Reescrever Explicação" },
    { icon: <FileText size={16} className="text-amber-300" />, label: "Análise de Redação" },
    { icon: <Zap size={16} className="text-rose-300" />, label: "Resumir Conteúdo" }
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
    <div className="w-full max-w-5xl mx-auto mb-4 px-4">
      <motion.div 
        className="relative bg-gradient-to-r from-[#050e1d]/90 to-[#0d1a30]/90 rounded-2xl shadow-xl 
                   border border-white/5 backdrop-blur-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Partículas de fundo */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Container principal */}
        <div className="relative z-10 p-4">
          {/* Área de input */}
          <div className="flex items-center gap-2">
            <motion.button
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Plus size={22} />
            </motion.button>

            <div className={`relative flex-grow overflow-hidden 
                            bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                            rounded-xl border ${isInputFocused ? 'border-[#1230CC]/70' : 'border-white/10'} 
                            transition-all duration-300`}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
                className="w-full bg-transparent text-white py-4 px-4 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Botão de microfone (quando não há texto) */}
            {!inputHasContent ? (
              <motion.button 
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
              >
                <Mic size={20} />
              </motion.button>
            ) : (
              /* Botão de enviar - Visível apenas quando há conteúdo no input */
              <motion.button
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={handleSendMessage}
              >
                <Send size={20} />
              </motion.button>
            )}
          </div>

          {/* Interface de gravação de áudio */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                className="recording-interface mt-2 p-2 bg-[#0c2341]/40 rounded-xl border border-red-500/30 flex items-center justify-between"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm text-white/80">Gravando áudio...</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
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
                    <Send size={16} className="text-white" />
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
                className="expanded-panel mt-3 p-3 bg-[#0c2341]/40 rounded-xl border border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs text-white/70 mb-1 w-full">Opções avançadas:</div>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Escolher competência
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Modo resposta rápida
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Adicionar mídia
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TurboMessageBox;