
import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image, 
  Brain, 
  BookOpen, 
  AlignJustify, 
  RotateCw, 
  FileText, 
  Zap, 
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "../ui/use-toast";

const EpictusTurboAdvancedMessageBox: React.FC = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Visual effect when input has content
  const inputHasContent = message.trim().length > 0;
  const isDark = theme === "dark";

  // Quick actions for the chat
  const quickActions = [
    { icon: <Brain size={16} className="text-blue-300 dark:text-blue-300" />, label: "Simulador de Provas" },
    { icon: <BookOpen size={16} className="text-emerald-300 dark:text-emerald-300" />, label: "Gerar Caderno" },
    { icon: <AlignJustify size={16} className="text-purple-300 dark:text-purple-300" />, label: "Criar Fluxograma" },
    { icon: <RotateCw size={16} className="text-indigo-300 dark:text-indigo-300" />, label: "Reescrever Explicação" },
    { icon: <FileText size={16} className="text-amber-300 dark:text-amber-300" />, label: "Análise de Redação" },
    { icon: <Zap size={16} className="text-rose-300 dark:text-rose-300" />, label: "Resumir Conteúdo" }
  ];

  // Handle sending message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Mensagem enviada:", message);
    // Here you would implement the actual sending logic to your backend
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada para o Epictus IA",
    });
    setMessage("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  }, [message]);

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      setAudioRecorder(mediaRecorder);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would send the audio to your speech-to-text service
        console.log("Áudio gravado:", audioBlob);
        setAudioChunks([]);
        setIsRecording(false);
        
        toast({
          title: "Áudio gravado",
          description: "Processando sua mensagem de voz...",
        });
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast({
        title: "Erro ao gravar",
        description: "Não foi possível iniciar a gravação de áudio",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorder && isRecording) {
      audioRecorder.stop();
      // Stop all audio tracks
      (audioRecorder.stream as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Advanced message box with animated gradient bg */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-xl overflow-hidden ${
          isInputFocused || inputHasContent || isExpanded
            ? "shadow-xl"
            : "shadow-lg"
        } transition-all duration-300 transform ${
          isInputFocused ? "scale-[1.01]" : "scale-100"
        } mb-4`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047e1]/20 to-[#0099ff]/20 dark:from-[#0047e1]/30 dark:to-[#0099ff]/30 backdrop-blur-sm"></div>
        
        {/* Outer container with border effect */}
        <div className={`relative px-4 py-3 border ${
          isDark ? "border-[#0055ff]/40" : "border-[#0055ff]/30"
        } rounded-xl backdrop-blur-sm overflow-hidden`}>
          
          {/* Quick action chips - visible when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 flex flex-wrap gap-2 overflow-x-auto pb-2 thin-scrollbar"
              >
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-full cursor-pointer transition-colors 
                      ${isDark 
                        ? "bg-[#0047e1]/20 hover:bg-[#0055ff]/30 text-white" 
                        : "bg-[#0055ff]/10 hover:bg-[#0055ff]/20 text-[#0047e1]"
                      } border border-[#0055ff]/30`}
                    onClick={() => {
                      setMessage(action.label);
                      if (textAreaRef.current) {
                        textAreaRef.current.focus();
                      }
                    }}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main input area */}
          <div className="flex items-end gap-2">
            {/* Expandable textarea */}
            <div className={`flex-grow relative rounded-lg transition-all duration-300 ${
              isInputFocused || inputHasContent
                ? isDark ? "bg-[#001a4d]/70" : "bg-white/90"
                : isDark ? "bg-[#001a4d]/50" : "bg-white/70"
            } border ${
              isInputFocused 
                ? "border-[#0055ff]/60" 
                : isDark ? "border-[#0055ff]/30" : "border-[#0055ff]/20"
            }`}>
              <textarea
                ref={textAreaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Envie uma mensagem para o Epictus IA..."
                className={`w-full resize-none py-3 px-4 bg-transparent outline-none rounded-lg ${
                  isDark ? "text-white placeholder:text-gray-400" : "text-gray-800 placeholder:text-gray-500"
                } min-h-[52px] max-h-32 overflow-auto thin-scrollbar`}
                rows={1}
              />
              
              {/* Attachment buttons */}
              <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
                {inputHasContent && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`p-1 rounded-full ${
                      isDark ? "hover:bg-[#0055ff]/20" : "hover:bg-[#0055ff]/10"
                    }`}
                    onClick={() => setMessage("")}
                  >
                    <X size={18} className="text-gray-400" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Button toolbar */}
            <div className="flex items-center gap-1.5">
              {/* Toggle expand button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-full ${
                  isExpanded 
                    ? "bg-[#0055ff]/20 text-[#0099ff]" 
                    : isDark ? "bg-[#001a4d]/70 text-[#0099ff]" : "bg-white/80 text-[#0047e1]"
                } border ${
                  isExpanded 
                    ? "border-[#0055ff]/50" 
                    : isDark ? "border-[#0055ff]/30" : "border-[#0055ff]/20"
                }`}
              >
                <Plus size={20} className={`transform transition-transform ${isExpanded ? "rotate-45" : ""}`} />
              </motion.button>

              {/* Attachment button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full ${
                  isDark ? "bg-[#001a4d]/70 text-[#0099ff]" : "bg-white/80 text-[#0047e1]"
                } border ${
                  isDark ? "border-[#0055ff]/30" : "border-[#0055ff]/20"
                }`}
              >
                <Paperclip size={20} />
              </motion.button>

              {/* Image upload button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full ${
                  isDark ? "bg-[#001a4d]/70 text-[#0099ff]" : "bg-white/80 text-[#0047e1]"
                } border ${
                  isDark ? "border-[#0055ff]/30" : "border-[#0055ff]/20"
                }`}
              >
                <Image size={20} />
              </motion.button>

              {/* Voice record button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                className={`p-2 rounded-full ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 border-red-500/50"
                    : isDark ? "bg-[#001a4d]/70 text-[#0099ff] border-[#0055ff]/30" : "bg-white/80 text-[#0047e1] border-[#0055ff]/20"
                } border`}
              >
                <Mic size={20} className={isRecording ? "animate-pulse" : ""} />
              </motion.button>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputHasContent && !isRecording}
                className={`p-2 rounded-full ${
                  inputHasContent
                    ? "bg-gradient-to-r from-[#0047e1] to-[#0099ff] text-white shadow-md shadow-blue-500/20"
                    : isDark ? "bg-[#001a4d]/70 text-[#0099ff] border-[#0055ff]/30" : "bg-white/80 text-[#0047e1] border-[#0055ff]/20"
                } ${!inputHasContent && !isRecording ? "opacity-70" : "opacity-100"} border ${
                  inputHasContent ? "border-transparent" : isDark ? "border-[#0055ff]/30" : "border-[#0055ff]/20"
                }`}
              >
                <Send size={20} className={inputHasContent ? "fill-white" : ""} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EpictusTurboAdvancedMessageBox;
