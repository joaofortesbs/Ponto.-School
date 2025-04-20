
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  MessageSquare, 
  Book, 
  Brain, 
  Sparkles, 
  Lightbulb,
  ArrowRight 
} from "lucide-react";

export default function ChatInteligente() {
  const { theme } = useTheme();

  const assistants = [
    {
      id: "assistente-pessoal",
      title: "Assistente Pessoal",
      description: "Tire dúvidas rápidas, peça sugestões, receba ajuda personalizada e execute ações rápidas com comandos de voz ou texto.",
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      badge: "Popular",
      buttonText: "Conversar"
    },
    {
      id: "tutor-inteligente",
      title: "Tutor Inteligente",
      description: "Receba explicações detalhadas sobre qualquer assunto acadêmico, com exemplos e diferentes níveis de profundidade.",
      icon: <Book className="h-6 w-6 text-blue-500" />,
      badge: null,
      buttonText: "Aprender"
    },
    {
      id: "brainstorm",
      title: "Tempestade de Ideias (Brainstorm)",
      description: "Gere ideias criativas, explore conceitos e estruture seus projetos com a ajuda da IA.",
      icon: <Lightbulb className="h-6 w-6 text-blue-500" />,
      badge: null,
      buttonText: "Criar"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Chat Inteligente
        </h2>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Escolha o assistente ideal para suas necessidades de aprendizado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assistants.map((assistant) => (
          <Card 
            key={assistant.id}
            className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-shadow duration-300`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                {assistant.icon}
              </div>

              {assistant.badge && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
                  {assistant.badge}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {assistant.title}
            </h3>

            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {assistant.description}
            </p>

            <Button 
              className="mt-auto w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center gap-2"
            >
              {assistant.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex-1 flex flex-col">
        <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Novidade: Assistente com Memória Avançada
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Agora nossos assistentes aprendem com suas interações anteriores, lembrando de suas preferências e adaptando respostas de acordo com seu histórico de conversas.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  Saiba mais
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                  Experimentar <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
