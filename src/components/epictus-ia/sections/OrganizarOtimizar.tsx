
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import SectionContent from "../components/SectionContent";
import { Calendar, CalendarDays, BookOpen, Bell } from "lucide-react";

const tools = [
  {
    id: "planner-estudos",
    title: "Planner de Estudos",
    description: "Crie um cronograma de estudos automático e personalizado com base na sua rotina e metas.",
    icon: <Calendar className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-indigo-600",
    button: "Criar Planner"
  },
  {
    id: "cronograma-aulas",
    title: "Cronograma de Aulas",
    description: "Divida o conteúdo anual em blocos semanais e adapte conforme o progresso da turma.",
    icon: <CalendarDays className="h-5 w-5 text-white" />,
    color: "from-emerald-500 to-teal-600",
    button: "Gerar Cronograma",
    tag: "Para Professores"
  },
  {
    id: "caderno-digital",
    title: "Caderno Digital",
    description: "Transforme resumos, listas e slides em páginas de um caderno digital organizado.",
    icon: <BookOpen className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-600",
    button: "Abrir Caderno"
  },
  {
    id: "notificacoes",
    title: "Notificações Inteligentes",
    description: "Configure alertas e lembretes inteligentes para não perder prazos ou esquecer de revisar.",
    icon: <Bell className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-violet-600",
    button: "Configurar Notificações"
  }
];

export default function OrganizarOtimizar() {
  const { theme } = useTheme();
  
  return (
    <SectionContent>
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Organizar e Otimizar
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Ferramentas para organizar seus estudos, otimizar seu tempo e aumentar sua produtividade
          </p>
        </div>
        
        <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-indigo-900/20 border border-indigo-800/30" : "bg-indigo-50 border border-indigo-100"} mb-6`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h3 className={`text-lg font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Dica de organização
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}>
                Use o Planner de Estudos para criar um cronograma balanceado e realista.
                Estudos mostram que sessões de estudo de 25-30 minutos com intervalos curtos
                aumentam a produtividade e a retenção de informações.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`rounded-xl overflow-hidden border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {tool.title}
                    </h3>
                    {tool.tag && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>
                        {tool.tag}
                      </span>
                    )}
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
        
        <div className={`mt-6 rounded-xl overflow-hidden border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`px-6 py-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
            <h3 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Seus planejamentos recentes
            </h3>
          </div>
          
          <div className={`${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
            <div className={`py-3 px-6 flex items-center justify-between border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <Calendar className={`h-5 w-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Plano de Estudos ENEM 2024
                </span>
              </div>
              <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Atualizado há 2 dias
              </span>
            </div>
            
            <div className={`py-3 px-6 flex items-center justify-between border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <BookOpen className={`h-5 w-5 ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`} />
                <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Caderno Digital - Física
                </span>
              </div>
              <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Atualizado ontem
              </span>
            </div>
            
            <div className={`py-3 px-6 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <Bell className={`h-5 w-5 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Lembretes de Revisão - Biologia
                </span>
              </div>
              <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Atualizado hoje
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionContent>
  );
}
