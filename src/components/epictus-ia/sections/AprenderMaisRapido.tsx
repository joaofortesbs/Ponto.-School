// src/components/epictus-ia/sections/aprender-mais-rapido/components/LearningToolCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface LearningToolCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  buttonText: string;
}

export const LearningToolCard: React.FC<LearningToolCardProps> = ({ id, title, description, icon, badge, buttonText }) => {
  const { theme } = useTheme();

  return (
    <Card
      key={id}
      className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/90 to-orange-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {badge && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs shadow-sm">
            {badge}
          </Badge>
        )}
      </div>

      <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
        <span className="relative">
          {title}
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-300"></span>
        </span>
      </h3>

      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {description}
      </p>

      <Button
        className="mt-auto w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white flex items-center justify-center gap-2"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
};

```

```typescript
// src/components/epictus-ia/sections/aprender-mais-rapido/components/MethodCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export const MethodCard: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
            <span className="relative">
              Método de Aprendizado Acelerado
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-600"></span>
            </span>
          </h3>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Combine as ferramentas desta seção em um fluxo de estudo otimizado: resumo do conteúdo → criação de mapa mental → teste de simulado → revisão guiada. Esta sequência aproveita técnicas comprovadas de aprendizado eficiente.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
              Ver detalhes
            </Button>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              Ativar método <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

```typescript
// src/components/epictus-ia/sections/aprender-mais-rapido/components/SectionHeader.tsx
import React from "react";
import { Zap } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export const SectionHeader: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Aprender Mais Rápido
        </h2>
      </div>
      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
        Acelere seu aprendizado com ferramentas que transformam conteúdos complexos em formatos fáceis de entender
      </p>
    </div>
  );
};
```

```typescript
// src/components/epictus-ia/sections/aprender-mais-rapido/index.tsx
import React from "react";
import { 
  SectionHeader, 
  LearningToolCard, 
  MethodCard
} from "./components";
import { useTheme } from "@/components/ThemeProvider";
import { 
  FileText, 
  Network, 
  FileQuestion, 
  BookOpen, 
  Undo
} from "lucide-react";

const learningTools = [
  {
    id: "resumos-inteligentes",
    title: "Resumos Inteligentes",
    description: "Obtenha resumos concisos e diretos de textos, vídeos, imagens ou PDFs.",
    icon: <FileText className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Resumo"
  },
  {
    id: "mapas-mentais",
    title: "Mapas Mentais",
    description: "Transforme qualquer conteúdo em um mapa mental visual e navegável para facilitar a compreensão.",
    icon: <Network className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Criar Mapa"
  },
  {
    id: "simulador-provas",
    title: "Simulador de Provas",
    description: "Faça quizzes e simulados com feedback instantâneo e análise de desempenho.",
    icon: <FileQuestion className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Simular Prova"
  },
  {
    id: "estudo-competencia",
    title: "Estudo por Competência (BNCC)",
    description: "Encontre atividades e materiais focados em competências específicas da BNCC.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Estudar"
  },
  {
    id: "revisao-guiada",
    title: "Revisão Guiada",
    description: "Deixe a IA montar uma rota de revisão personalizada com base nos seus erros passados.",
    icon: <Undo className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Revisar"
  }
];

export default function AprenderMaisRapido() {
  const { theme } = useTheme();
  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningTools.map(tool => (
          <LearningToolCard 
            key={tool.id}
            id={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            badge={tool.badge}
            buttonText={tool.buttonText}
          />
        ))}
      </div>

      <MethodCard />
    </div>
  );
}