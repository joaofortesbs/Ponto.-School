
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionContent from "../components/SectionContent";
import { FileText, PresentationIcon, BookOpen, Gamepad2, Puzzle, PlusCircle } from "lucide-react";

const tools = [
  {
    id: "planos-aula",
    title: "Gerador de Planos de Aula",
    description: "Crie planos de aula completos em minutos, baseados no tema, ano escolar e BNCC.",
    icon: <BookOpen className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-indigo-600",
    button: "Gerar Plano",
    tag: "Para Professores"
  },
  {
    id: "slides",
    title: "Gerador de Slides Didáticos",
    description: "Transforme seus tópicos em apresentações de slides visualmente atraentes e organizadas.",
    icon: <PresentationIcon className="h-5 w-5 text-white" />,
    color: "from-teal-500 to-emerald-600",
    button: "Criar Slides",
    tag: "Para Professores"
  },
  {
    id: "exercicios",
    title: "Gerador de Lista de Exercícios",
    description: "Crie listas de exercícios personalizadas (alternativas, dissertativas, V/F) com gabarito.",
    icon: <FileText className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    button: "Gerar Exercícios",
    tag: "Para Professores"
  },
  {
    id: "jogos-didaticos",
    title: "Gerador de Jogos Didáticos",
    description: "Crie caça-palavras, forcas e outros jogos interativos baseados no seu conteúdo.",
    icon: <Gamepad2 className="h-5 w-5 text-white" />,
    color: "from-pink-500 to-rose-600",
    button: "Criar Jogo",
    tag: "Para Professores"
  },
  {
    id: "interdisciplinar",
    title: "Gerador de Atividades Interdisciplinares",
    description: "Desenvolva propostas de atividades que conectam duas ou mais disciplinas.",
    icon: <Puzzle className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-violet-600",
    button: "Gerar Atividade",
    tag: "Para Professores"
  },
  {
    id: "apresentacao",
    title: "Assistente de Apresentação",
    description: "Estruture sua apresentação oral, receba sugestões de tópicos e visualize como apresentar.",
    icon: <PresentationIcon className="h-5 w-5 text-white" />,
    color: "from-cyan-500 to-blue-600",
    button: "Criar Apresentação",
    tag: "Para Alunos"
  }
];

export default function CriarConteudo() {
  const { theme } = useTheme();
  
  return (
    <SectionContent>
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Criar Conteúdo
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Ferramentas avançadas para criar materiais didáticos e conteúdos de alta qualidade
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
        
        <div className={`mt-4 p-5 rounded-xl border border-dashed ${theme === "dark" ? "border-gray-600 bg-gray-800/30" : "border-gray-300 bg-gray-50/50"} flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors`}>
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
            <PlusCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className={`text-base font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Sugerir nova ferramenta
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Tem ideias para novas ferramentas? Compartilhe conosco!
          </p>
        </div>
      </div>
    </SectionContent>
  );
}
