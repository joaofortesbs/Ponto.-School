
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import SectionContent from "../components/SectionContent";
import { MessageSquare, Sparkles, Lightbulb } from "lucide-react";

const tools = [
  {
    id: "assistente-pessoal",
    title: "Assistente Pessoal",
    description: "Tire dúvidas rápidas, peça sugestões, receba ajuda personalizada e execute ações rápidas com comandos de voz ou texto.",
    icon: <MessageSquare className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-indigo-600",
    button: "Conversar"
  },
  {
    id: "tutor-inteligente",
    title: "Tutor Inteligente",
    description: "Receba explicações detalhadas sobre qualquer assunto acadêmico, com exemplos e diferentes níveis de profundidade.",
    icon: <Sparkles className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-violet-600",
    button: "Aprender"
  },
  {
    id: "brainstorm",
    title: "Tempestade de Ideias (Brainstorm)",
    description: "Gere ideias criativas, explore conceitos e estruture seus projetos com a ajuda da IA.",
    icon: <Lightbulb className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    button: "Criar"
  }
];

export default function ChatInteligente() {
  const { theme } = useTheme();
  
  return (
    <SectionContent>
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Chat Inteligente
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Converse com diferentes assistentes de IA especializados para diferentes necessidades
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`rounded-xl overflow-hidden border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {tool.title}
                    </h3>
                  </div>
                </div>
                
                <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {tool.description}
                </p>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${tool.color} hover:brightness-110 transition-all`}
                >
                  {tool.button}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className={`mt-8 p-6 rounded-xl ${theme === "dark" ? "bg-gray-900/50 border border-gray-700" : "bg-gray-100 border border-gray-200"}`}>
          <h3 className={`text-lg font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Como usar o Chat Inteligente
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="font-medium">Escolha o assistente</span> mais adequado para sua necessidade
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="font-medium">Faça sua pergunta ou solicitação</span> de maneira clara e específica
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="font-medium">Refine a resposta</span> com perguntas de acompanhamento ou pedidos de clarificação
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContent>
  );
}
