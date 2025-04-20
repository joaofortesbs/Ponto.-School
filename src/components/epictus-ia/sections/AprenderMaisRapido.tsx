
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import SectionContent from "../components/SectionContent";
import { FileText, Map, BookOpen, ListChecks, Repeat, FlaskConical, Volume2 } from "lucide-react";

const tools = [
  {
    id: "resumos",
    title: "Resumos Inteligentes",
    description: "Obtenha resumos concisos e diretos de textos, vídeos, imagens ou PDFs.",
    icon: <FileText className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-indigo-600",
    button: "Gerar Resumo"
  },
  {
    id: "mapas",
    title: "Mapas Mentais",
    description: "Transforme qualquer conteúdo em um mapa mental visual e navegável para facilitar a compreensão.",
    icon: <Map className="h-5 w-5 text-white" />,
    color: "from-emerald-500 to-teal-600",
    button: "Criar Mapa"
  },
  {
    id: "simulador",
    title: "Simulador de Provas",
    description: "Faça quizzes e simulados com feedback instantâneo e análise de desempenho.",
    icon: <ListChecks className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    button: "Simular Prova"
  },
  {
    id: "bncc",
    title: "Estudo por Competência (BNCC)",
    description: "Encontre atividades e materiais focados em competências específicas da BNCC.",
    icon: <BookOpen className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-violet-600",
    button: "Estudar"
  },
  {
    id: "revisao",
    title: "Revisão Guiada",
    description: "Deixe a IA montar uma rota de revisão personalizada com base nos seus erros passados.",
    icon: <Repeat className="h-5 w-5 text-white" />,
    color: "from-pink-500 to-rose-600",
    button: "Revisar"
  },
  {
    id: "flashcards",
    title: "Flashcards Inteligentes",
    description: "Crie flashcards automaticamente e use a repetição espaçada (estilo Anki) para memorizar.",
    icon: <FlaskConical className="h-5 w-5 text-white" />,
    color: "from-red-500 to-orange-600",
    button: "Gerar Flashcards"
  },
  {
    id: "audio",
    title: "Áudio Explicativo",
    description: "Transforme resumos em áudio para revisar o conteúdo enquanto faz outras coisas.",
    icon: <Volume2 className="h-5 w-5 text-white" />,
    color: "from-cyan-500 to-blue-600",
    button: "Gerar Áudio"
  }
];

export default function AprenderMaisRapido() {
  const { theme } = useTheme();
  
  return (
    <SectionContent>
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Aprender Mais Rápido
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Ferramentas e técnicas para otimizar seu aprendizado e memorização
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-xl overflow-hidden border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    {tool.icon}
                  </div>
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {tool.title}
                  </h3>
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
        
        <div className={`mt-6 p-6 rounded-xl ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-200"}`}>
          <h3 className={`text-lg font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Dicas para aprender mais rápido
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-300 font-medium">1</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Use várias ferramentas para o mesmo conteúdo
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Combine resumos + mapas mentais + flashcards para fixar melhor o conhecimento
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-300 font-medium">2</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Teste seu conhecimento constantemente
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Use o Simulador de Provas para identificar lacunas no seu aprendizado
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 dark:text-amber-300 font-medium">3</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Revise em períodos estratégicos
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Use a Revisão Guiada para aproveitar a curva de esquecimento a seu favor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContent>
  );
}
