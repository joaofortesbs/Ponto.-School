
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionContent from "../components/SectionContent";
import { FileQuestion, PresentationIcon, GraduationCap, Brain, FileText } from "lucide-react";

const tools = [
  {
    id: "assistente-provas",
    title: "Assistente de Provas",
    description: "Deixe a IA montar provas balanceadas automaticamente com base nos seus objetivos.",
    icon: <FileQuestion className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-indigo-600",
    button: "Montar Prova",
    tag: "Para Professores"
  },
  {
    id: "simulados",
    title: "Gerador de Simulados (ENEM/Vestibulares)",
    description: "Crie simulados completos baseados em provas reais, com correção TRI simulada.",
    icon: <FileQuestion className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-violet-600",
    button: "Gerar Simulado"
  },
  {
    id: "assistente-tcc",
    title: "Assistente de TCC/Projetos",
    description: "Receba ajuda para estruturar seu TCC ou projeto, encontrar referências e formatar (ABNT).",
    icon: <GraduationCap className="h-5 w-5 text-white" />,
    color: "from-emerald-500 to-teal-600",
    button: "Iniciar Projeto",
    tag: "Para Alunos"
  },
  {
    id: "explicacao-simplificada",
    title: "Explique como se eu tivesse 10 anos",
    description: "Adapte qualquer conteúdo para uma linguagem simples e fácil de entender.",
    icon: <Brain className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    button: "Simplificar"
  },
  {
    id: "explicador-videos",
    title: "Explicador de Vídeos e PDFs",
    description: "Envie um vídeo ou PDF e receba resumos, perguntas, mapas mentais e flashcards.",
    icon: <FileText className="h-5 w-5 text-white" />,
    color: "from-red-500 to-pink-600",
    button: "Explicar"
  }
];

export default function FerramentasExtras() {
  const { theme } = useTheme();
  
  return (
    <SectionContent>
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Ferramentas Extras
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Ferramentas adicionais para ampliar ainda mais seu potencial acadêmico
          </p>
        </div>
        
        <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-amber-900/20 border-amber-800/30" : "bg-amber-50 border-amber-100"} mb-6 flex items-center gap-3`}>
          <span className={`text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 p-1 rounded`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
          <p className={`text-sm ${theme === "dark" ? "text-amber-300" : "text-amber-700"}`}>
            Estas ferramentas estão em fase experimental. Experimente e envie seu feedback!
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`rounded-xl overflow-hidden border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                      {tool.icon}
                    </div>
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {tool.title}
                    </h3>
                  </div>
                  
                  {tool.tag && (
                    <Badge className={`bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}>
                      {tool.tag}
                    </Badge>
                  )}
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
        
        <div className={`mt-8 p-6 rounded-xl ${theme === "dark" ? "bg-gray-800/80 border border-gray-700" : "bg-white border border-gray-200"} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-2/3">
              <h3 className={`text-lg font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Sugestão de novas ferramentas
              </h3>
              <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Tem uma ideia para uma nova ferramenta que gostaria de ver no Epictus IA?
                Compartilhe conosco e ajude a melhorar nossa plataforma!
              </p>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Nome da ferramenta" 
                  className={`w-full p-2 rounded-md text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} border`} 
                />
                <textarea 
                  placeholder="Descreva o que essa ferramenta faria..." 
                  rows={3}
                  className={`w-full p-2 rounded-md text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} border`}
                ></textarea>
                <Button 
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00]"
                >
                  Enviar sugestão
                </Button>
              </div>
            </div>
            
            <div className={`md:w-1/3 p-4 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Ferramentas em desenvolvimento
              </h4>
              <ul className={`space-y-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Leitor com Timer Pomodoro
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Organizador de Bibliografia
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Monitor de Produtividade
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Gerador de Storytelling
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionContent>
  );
}
