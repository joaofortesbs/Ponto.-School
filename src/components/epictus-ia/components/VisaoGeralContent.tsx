
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  FileText,
  BookOpen,
  BarChart3,
  Compass,
  ChevronRight,
  MessageSquare
} from "lucide-react";

interface VisaoGeralContentProps {
  theme: string;
}

const VisaoGeralContent: React.FC<VisaoGeralContentProps> = ({ theme }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
        >
          Olá, João Silva!
        </h2>
        <Badge className="bg-[#FF6B00] text-white">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Versão Premium
        </Badge>
      </div>

      <div
        className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} rounded-xl p-6 border shadow-sm`}
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3
              className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
            >
              Epictus IA
            </h3>
            <p
              className={`${theme === "dark" ? "text-white/80" : "text-[#64748B]"} mb-4`}
            >
              Seu assistente de estudos pessoal. Como posso ajudar
              você hoje?
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                Tire suas dúvidas
              </Badge>
              <Badge
                className={`${theme === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#29335C]/10 text-[#29335C] hover:bg-[#29335C]/20"} cursor-pointer`}
              >
                Crie planos de estudo
              </Badge>
              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                Resumos inteligentes
              </Badge>
              <Badge
                className={`${theme === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#29335C]/10 text-[#29335C] hover:bg-[#29335C]/20"} cursor-pointer`}
              >
                Análise de desempenho
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <FeatureCards theme={theme} />
      <RecentInteractions theme={theme} />
    </>
  );
};

// Componente para os cards de funcionalidades
const FeatureCards: React.FC<{ theme: string }> = ({ theme }) => {
  const features = [
    {
      title: "Resumos",
      description: "Resumos inteligentes de conteúdos",
      icon: <FileText className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      title: "Plano de Estudos",
      description: "Planos personalizados para você",
      icon: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      title: "Desempenho",
      description: "Análise do seu progresso",
      icon: <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      title: "Modo Exploração",
      description: "Explore temas com um guia pessoal",
      icon: <Compass className="h-6 w-6 text-[#FF6B00]" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
              {feature.icon}
            </div>
            <h3
              className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}
            >
              {feature.title}
            </h3>
            <p
              className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
            >
              {feature.description}
            </p>
            <Button
              variant="ghost"
              className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
            >
              Acessar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para as interações recentes
const RecentInteractions: React.FC<{ theme: string }> = ({ theme }) => {
  const interactions = [
    {
      title: "Plano de Estudos ENEM",
      time: "Hoje, 10:30",
      type: "Plano",
      icon: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
    },
    {
      title: "Resumo de Física Quântica",
      time: "Ontem, 15:45",
      type: "Resumo",
      icon: <FileText className="h-5 w-5 text-[#FF6B00]" />,
    },
    {
      title: "Dúvidas sobre Cálculo Diferencial",
      time: "3 dias atrás",
      type: "Dúvidas",
      icon: <MessageSquare className="h-5 w-5 text-[#FF6B00]" />,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
        >
          Últimas Interações
        </h3>
        <Button
          variant="ghost"
          className="text-[#FF6B00] text-xs flex items-center gap-1"
        >
          Ver Todas <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {interactions.map((interaction, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 ${theme === "dark" ? "bg-[#29335C]/20 hover:bg-[#29335C]/30 border-gray-800" : "bg-white hover:bg-gray-50 border-gray-200"} rounded-lg transition-colors cursor-pointer border`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${theme === "dark" ? "bg-[#29335C]/50" : "bg-gray-100"} flex items-center justify-center`}
              >
                {interaction.icon}
              </div>
              <div>
                <h4
                  className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                >
                  {interaction.title}
                </h4>
                <p
                  className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                >
                  {interaction.type}
                </p>
              </div>
            </div>
            <div
              className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
            >
              {interaction.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisaoGeralContent;
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Star, BookOpen, BarChart3, Brain, MessageSquare } from "lucide-react";

export default function VisaoGeralContent() {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}>
          Bem-vindo ao Epictus IA
        </h2>
        <Badge className="bg-[#FF6B00] text-white">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium
        </Badge>
      </div>

      <div className={`bg-gradient-to-br from-[#001427] to-[#29335C] rounded-xl p-6 text-white`}>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Potencialize seus estudos com IA</h2>
            <p className="text-white/80 mb-4">
              O Epictus IA utiliza inteligência artificial avançada para personalizar sua experiência de aprendizado, 
              oferecendo resumos inteligentes, planos de estudo adaptados às suas necessidades e análises detalhadas do seu desempenho.
            </p>
            <Button className="bg-white text-[#29335C] hover:bg-white/90">
              Começar a usar <MessageSquare className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}>
        Ferramentas populares
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}
        >
          <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
            <Zap className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}>
            Assistente Pessoal
          </h3>
          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-3`}>
            Tire dúvidas rápidas, peça sugestões e receba ajuda personalizada.
          </p>
          <Button variant="outline" className="w-full text-[#FF6B00] border-[#FF6B00]/30 hover:bg-[#FF6B00]/10">
            Acessar
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}
        >
          <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
            <Star className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}>
            Resumos Inteligentes
          </h3>
          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-3`}>
            Gere resumos concisos de textos, vídeos ou PDFs para estudar melhor.
          </p>
          <Button variant="outline" className="w-full text-[#FF6B00] border-[#FF6B00]/30 hover:bg-[#FF6B00]/10">
            Acessar
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}
        >
          <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
            <BookOpen className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}>
            Plano de Estudos
          </h3>
          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-3`}>
            Crie um plano personalizado com base nos seus objetivos e tempo disponível.
          </p>
          <Button variant="outline" className="w-full text-[#FF6B00] border-[#FF6B00]/30 hover:bg-[#FF6B00]/10">
            Acessar
          </Button>
        </motion.div>
      </div>

      <div>
        <h3 className={`text-lg font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}>
          Estatísticas de uso
        </h3>
        
        <div className={`p-5 rounded-xl border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[180px]">
              <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Assistente Pessoal
              </h4>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>32 interações</span>
                <span>75%</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-[180px]">
              <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Resumos Inteligentes
              </h4>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "45%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>18 gerados</span>
                <span>45%</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-[180px]">
              <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Plano de Estudos
              </h4>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "25%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>3 criados</span>
                <span>25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
