
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionContent from "../components/SectionContent";
import { ClipboardCheck, FileText, Search, BarChart3, Database } from "lucide-react";

const tools = [
  {
    id: "correcao-avaliacoes",
    title: "Correção de Avaliações",
    description: "Faça upload de provas com gabarito e receba correções automáticas, estatísticas e gráficos.",
    icon: <ClipboardCheck className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-indigo-600",
    button: "Corrigir Prova",
    tag: "Para Professores"
  },
  {
    id: "correcao-redacoes",
    title: "Correção de Redações",
    description: "Receba correções de redações (estilo ENEM ou personalizada) com notas por competência e sugestões.",
    icon: <FileText className="h-5 w-5 text-white" />,
    color: "from-emerald-500 to-teal-600",
    button: "Corrigir Redação",
    tag: "Para Professores"
  },
  {
    id: "correcao-tarefas",
    title: "Correção de Tarefas",
    description: "Corrija textos, questões discursivas ou imagens de tarefas enviadas pelos alunos.",
    icon: <ClipboardCheck className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    button: "Corrigir Tarefa",
    tag: "Para Professores"
  },
  {
    id: "detector-plagio",
    title: "Detector de Plágio",
    description: "Verifique a originalidade de redações e respostas com nosso detector de similaridade.",
    icon: <Search className="h-5 w-5 text-white" />,
    color: "from-red-500 to-pink-600",
    button: "Verificar Plágio",
    tag: "Para Professores"
  },
  {
    id: "painel-progresso",
    title: "Painel de Progresso do Aluno",
    description: "Visualize gráficos detalhados sobre sua evolução, tempo de estudo e acertos por matéria.",
    icon: <BarChart3 className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-violet-600",
    button: "Ver Progresso"
  }
];

const stats = [
  { label: "Avaliações corrigidas", value: "254" },
  { label: "Redações analisadas", value: "186" },
  { label: "Tarefas processadas", value: "537" },
  { label: "Plágios detectados", value: "12" }
];

export default function AnalisarCorrigir() {
  const { theme } = useTheme();
  
  return (
    <SectionContent>
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Analisar e Corrigir
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Ferramentas para análise automática, correção e verificação de desempenho
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <h3 className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-1`}>
                {stat.label}
              </h3>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {stat.value}
              </p>
            </div>
          ))}
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
        
        <div className={`mt-6 p-4 rounded-xl border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-blue-50 border-blue-100"} flex items-center gap-4`}>
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} mb-1`}>
              Integração com o sistema de notas
            </h3>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              As avaliações corrigidas podem ser exportadas para o sistema de notas da sua instituição
            </p>
          </div>
          <Button className="ml-auto" variant="outline" size="sm">
            Configurar
          </Button>
        </div>
      </div>
    </SectionContent>
  );
}
