
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Calendar, 
  Clock, 
  ListTodo, 
  LineChart, 
  Hammer,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function OrganizarOtimizar() {
  const { theme } = useTheme();

  const organizationTools = [
    {
      id: "cronograma-estudos",
      title: "Cronograma de Estudos",
      description: "Crie um planejamento personalizado com base em sua rotina, prioridades e metas de aprendizado.",
      icon: <Calendar className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Planejar"
    },
    {
      id: "tecnica-pomodoro",
      title: "Timer Pomodoro Inteligente",
      description: "Otimize seu tempo de estudo com ciclos de foco e descanso ajustados ao seu perfil cognitivo.",
      icon: <Clock className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Iniciar Timer"
    },
    {
      id: "gerenciador-tarefas",
      title: "Gerenciador de Tarefas Acadêmicas",
      description: "Organize provas, trabalhos e leituras com priorização automática baseada em prazos.",
      icon: <ListTodo className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Organizar Tarefas"
    },
    {
      id: "rastreador-progresso",
      title: "Rastreador de Progresso",
      description: "Visualize e acompanhe seu avanço em matérias, habilidades e projetos ao longo do tempo.",
      icon: <LineChart className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Monitorar Progresso"
    },
    {
      id: "construtor-habitos",
      title: "Construtor de Hábitos de Estudo",
      description: "Desenvolva rotinas consistentes de estudo com estratégias comprovadas de formação de hábitos.",
      icon: <Hammer className="h-6 w-6 text-white" />,
      badge: "Novo",
      buttonText: "Criar Hábito"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Organizar e Otimizar
          </h2>
        </div>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
          Ferramentas para organização do tempo, planejamento e otimização da rotina de estudos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizationTools.map(tool => (
          <Card 
            key={tool.id}
            className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-red-500/10 blur-3xl group-hover:bg-red-500/20 transition-all duration-700"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/90 to-pink-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                {tool.icon}
              </div>

              {tool.badge && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-xs shadow-sm">
                  {tool.badge}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
              <span className="relative">
                {tool.title}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-500 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </h3>

            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tool.description}
            </p>

            <Button 
              className="mt-auto w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white flex items-center justify-center gap-2"
            >
              {tool.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex-1">
        <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
            <span className="relative">
              Tarefas Pendentes
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 to-pink-600"></span>
            </span>
          </h3>
          
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex items-center justify-between group hover:border-red-500/50 transition-colors duration-300`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} group-hover:bg-red-500/10 transition-colors duration-300`}>
                  <Clock className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Entregar trabalho de Biologia</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Vence em 2 dias</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors duration-300">
                <CheckCircle2 className={`h-5 w-5 ${theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} />
              </Button>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex items-center justify-between group hover:border-red-500/50 transition-colors duration-300`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} group-hover:bg-red-500/10 transition-colors duration-300`}>
                  <ListTodo className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Revisar capítulos 5-7 de História</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Vence hoje</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors duration-300">
                <CheckCircle2 className={`h-5 w-5 ${theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} />
              </Button>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex items-center justify-between group hover:border-red-500/50 transition-colors duration-300`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} group-hover:bg-red-500/10 transition-colors duration-300`}>
                  <Calendar className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Preparar para avaliação de Matemática</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Vence em 5 dias</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors duration-300">
                <CheckCircle2 className={`h-5 w-5 ${theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} />
              </Button>
            </div>
          </div>
          
          <Button variant="outline" className={`mt-4 w-full ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"} group`}>
            <span className="relative">
              Ver todas as tarefas
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-red-500 to-pink-600 group-hover:w-full transition-all duration-300"></span>
            </span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
