// src/components/epictus-ia/sections/ferramentas-extras/index.ts
export * from "./SectionHeader";
export * from "./ToolCard";
export * from "./SuggestionCard";
export * from "./toolsData";

// src/components/epictus-ia/sections/ferramentas-extras/SectionHeader.tsx
import React from "react";
import { Wrench } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface SectionHeaderProps {
  title: string;
  description: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  const { theme } = useTheme();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Wrench className="h-6 w-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {title}
        </h2>
      </div>
      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
        {description}
      </p>
    </div>
  );
};


// src/components/epictus-ia/sections/ferramentas-extras/ToolCard.tsx
import React from "react";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ToolCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactElement;
    badge?: string;
    buttonText: string;
  };
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { theme } = useTheme();
  return (
    <Card
      key={tool.id}
      className={`p-5 h-full border overflow-hidden group relative ${
        theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"
      } hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/90 to-blue-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {tool.icon}
        </div>

        {tool.badge && (
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs shadow-sm">
            {tool.badge}
          </Badge>
        )}
      </div>

      <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
        <span className="relative">
          {tool.title}
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
        </span>
      </h3>

      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {tool.description}
      </p>

      <Button className="mt-auto w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex items-center justify-center gap-2">
        {tool.buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
};

// src/components/epictus-ia/sections/ferramentas-extras/SuggestionCard.tsx
import React from "react";
import { Card, Button } from "@/components/ui";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export const SuggestionCard: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Card className={`p-5 border overflow-hidden relative ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"} group`}>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>

      <div className="flex items-center justify-center gap-2 text-center">
        <Sparkles className="h-5 w-5 text-cyan-500" />
        <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
          <span className="relative">
            Sugestão de Ferramentas
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600"></span>
          </span>
        </h3>
      </div>

      <p className={`text-sm mt-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        Tem uma sugestão de nova ferramenta? Compartilhe conosco e podemos desenvolvê-la para você!
      </p>

      <div className="mt-4 flex justify-center">
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
          Enviar Sugestão
        </Button>
      </div>
    </Card>
  );
};


// src/components/epictus-ia/sections/ferramentas-extras/toolsData.tsx
import { 
  Calculator, 
  FileText, 
  Lightbulb, 
  Globe, 
  Share2, 
  Wrench 
} from "lucide-react";

export const tools = [
  {
    id: "calculadora-formulas",
    title: "Calculadora de Fórmulas",
    description: "Calcule resultados de fórmulas complexas com explicações passo a passo",
    icon: <Calculator className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Calcular"
  },
  {
    id: "extrator-texto",
    title: "Extrator de Texto",
    description: "Extraia texto de imagens, PDFs e arquivos escaneados com reconhecimento OCR",
    icon: <FileText className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Extrair Texto"
  },
  {
    id: "gerador-ideias",
    title: "Gerador de Ideias",
    description: "Receba sugestões de ideias inovadoras para projetos escolares e acadêmicos",
    icon: <Lightbulb className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Ideias"
  },
  {
    id: "tradutor-avancado",
    title: "Tradutor Avançado",
    description: "Traduza textos com contexto acadêmico preservado entre múltiplos idiomas",
    icon: <Globe className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Traduzir"
  },
  {
    id: "visualizador-3d",
    title: "Visualizador 3D",
    description: "Visualize conceitos complexos em modelos tridimensionais interativos",
    icon: <Share2 className="h-6 w-6 text-white" />,
    badge: "Experimental",
    buttonText: "Visualizar"
  },
  {
    id: "conversor-unidades",
    title: "Conversor de Unidades",
    description: "Converta facilmente entre diferentes unidades de medida com explicações",
    icon: <Wrench className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Converter"
  }
];


// src/components/epictus-ia/sections/FerramentasExtras.tsx
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  SectionHeader, 
  ToolCard, 
  SuggestionCard,
  tools
} from "./components/ferramentas-extras";

export default function FerramentasExtras() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        title="Ferramentas Extras" 
        description="Conjunto de ferramentas auxiliares para tornar seu aprendizado ainda mais completo"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <SuggestionCard />
      </div>
    </div>
  );
}