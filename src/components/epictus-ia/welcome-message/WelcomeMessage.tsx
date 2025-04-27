
import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const WelcomeMessage: React.FC = () => {
  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="relative w-[85%] max-w-3xl bg-gradient-to-br from-[#0D23A0]/10 to-[#5B21BD]/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl overflow-hidden"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
      >
        {/* Efeito de partículas flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#4A90E2]/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [0, Math.random() * -30 - 10],
                x: [0, Math.random() * 20 - 10],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center mb-6">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-lg border-2 border-white/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.5 }}
          >
            <Bot className="h-10 w-10 text-white" />
          </motion.div>
        </div>

        <motion.h1
          className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-[#FFFFFF] to-[#A0A0FF] bg-clip-text text-transparent"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Bem-vindo ao Modo Epictus IA BETA
        </motion.h1>

        <motion.div
          className="text-center text-white/80 mb-6 max-w-2xl mx-auto"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="mb-2">
            Seu assistente pessoal para aprendizado e programação está pronto para ajudar!
          </p>
          <p>
            Digite sua primeira mensagem abaixo para começar nossa conversa.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          {[
            {
              title: "Pergunte o que quiser",
              icon: "🔍",
              description: "Tire dúvidas sobre qualquer assunto acadêmico"
            },
            {
              title: "Obtenha explicações detalhadas",
              icon: "📚",
              description: "Receba explicações claras com exemplos práticos"
            },
            {
              title: "Desenvolva suas habilidades",
              icon: "🚀",
              description: "Melhore seus conhecimentos com ajuda personalizada"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 + index * 0.2 }}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              <p className="text-sm text-white/70">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          Digite sua mensagem na caixa abaixo para começar a conversar
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;
