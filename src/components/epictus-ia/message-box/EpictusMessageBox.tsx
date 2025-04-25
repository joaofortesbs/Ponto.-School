import React from "react";
import { Send, Plus, Mic, Loader2, Brain, BookOpen, AlignJustify, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import QuickActionButton from "./QuickActionButton";


interface EpictusMessageBoxProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
  charCount: number;
  MAX_CHARS: number;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const EpictusMessageBox: React.FC<EpictusMessageBoxProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isTyping,
  charCount,
  MAX_CHARS,
  handleKeyDown
}) => {
  return (
    <motion.div
      className="relative w-full hub-connected-width bg-gradient-to-b from-[#111827]/90 to-[#0F172A]/95 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4A90E2]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-5 -left-5 w-40 h-40 bg-[#4338CA]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 p-5"> {/*Added p-5 for padding */}
        <div className="flex items-center gap-3">
          <motion.button
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-lg text-white"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
          >
            <Plus size={22} />
          </motion.button>


          <div className={`relative flex-grow overflow-hidden group`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3662A9]/50 to-[#4A90E2]/50 rounded-lg blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <Textarea
              placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-16 bg-[#0A101D] border-[#2A3349]/50 rounded-lg focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] text-white resize-none shadow-inner relative z-10 transition-all duration-200 px-4 py-3"
              disabled={isTyping}
            />
            <div className="absolute bottom-2.5 right-3 text-xs text-[#A9B5D9]/80 font-mono">
              {charCount}/{MAX_CHARS}
            </div>
          </div>

          {!inputMessage.trim() ? (
            <motion.button
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={20} />
            </motion.button>
          ) : (
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={isTyping}
              className="relative h-16 w-16 rounded-lg overflow-hidden group disabled:opacity-70 transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3662A9] to-[#4A90E2] transition-all duration-300 group-hover:brightness-110"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHg9IjAiIHk9IjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgcGF0dGVyblVuaXRzPSJ1c3VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+CiAgICAgIDxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxMCIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDQpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIgLz4KPC9zdmc+')]"></div>
              <div className="relative z-10 flex items-center justify-center">
                {isTyping ? (
                  <Loader2 className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] animate-spin" />
                ) : (
                  <Send className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-white to-transparent transition-opacity duration-300"></div>
            </Button>
          )}
        </div>

        <motion.div
          className="quick-actions mt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <QuickActionButton
            icon={<Brain size={16} className="text-blue-300" />}
            text="Simulador de Provas"
          />
          <QuickActionButton
            icon={<BookOpen size={16} className="text-emerald-300" />}
            text="Gerar Caderno"
          />
          <QuickActionButton
            icon={<AlignJustify size={16} className="text-purple-300" />}
            text="Criar Fluxograma"
          />
          <QuickActionButton
            icon={<RotateCw size={16} className="text-indigo-300" />}
            text="Reescrever Explicação"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EpictusMessageBox;