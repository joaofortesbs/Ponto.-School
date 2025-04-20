
import React from "react";
import { Calculator, FileText, Lightbulb, Languages, Cube, Move } from "lucide-react";

export interface ToolData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  badge?: string;
}

export const tools: ToolData[] = [
  {
    id: "calculadora-formulas",
    title: "Calculadora de Fórmulas",
    description: "Solucione equações complexas de física, química e matemática com explicações detalhadas",
    icon: <Calculator className="h-6 w-6 text-white" />,
    buttonText: "Calcular",
    badge: "Novo"
  },
  {
    id: "extrator-texto",
    title: "Extrator de Texto",
    description: "Extraia texto de imagens, PDFs e outros documentos para facilitar seus estudos",
    icon: <FileText className="h-6 w-6 text-white" />,
    buttonText: "Extrair conteúdo"
  },
  {
    id: "gerador-ideias",
    title: "Gerador de Ideias",
    description: "Obtenha inspiração para projetos, redações e trabalhos escolares",
    icon: <Lightbulb className="h-6 w-6 text-white" />,
    buttonText: "Gerar ideias"
  },
  {
    id: "tradutor-avancado",
    title: "Tradutor Avançado",
    description: "Traduza textos com contexto acadêmico e termos técnicos preservados",
    icon: <Languages className="h-6 w-6 text-white" />,
    buttonText: "Traduzir"
  },
  {
    id: "visualizador-3d",
    title: "Visualizador 3D",
    description: "Visualize modelos 3D interativos para melhor compreensão de conceitos complexos",
    icon: <Cube className="h-6 w-6 text-white" />,
    buttonText: "Visualizar",
    badge: "Beta"
  },
  {
    id: "conversor-unidades",
    title: "Conversor de Unidades",
    description: "Converta entre diferentes unidades de medida para física, química e matemática",
    icon: <Move className="h-6 w-6 text-white" />,
    buttonText: "Converter"
  }
];
import React from "react";
import { Calculator, FileText, Lightbulb, Languages, Cube, Move } from "lucide-react";

export interface ToolData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  badge?: string;
}

export const tools: ToolData[] = [
  {
    id: "calculadora-formulas",
    title: "Calculadora de Fórmulas",
    description: "Solucione equações complexas de física, química e matemática com explicações detalhadas",
    icon: <Calculator className="h-6 w-6 text-white" />,
    buttonText: "Calcular",
    badge: "Novo"
  },
  {
    id: "extrator-texto",
    title: "Extrator de Texto",
    description: "Extraia texto de imagens, PDFs e outros documentos para facilitar seus estudos",
    icon: <FileText className="h-6 w-6 text-white" />,
    buttonText: "Extrair conteúdo"
  },
  {
    id: "gerador-ideias",
    title: "Gerador de Ideias",
    description: "Obtenha inspiração para projetos, redações e trabalhos escolares",
    icon: <Lightbulb className="h-6 w-6 text-white" />,
    buttonText: "Gerar ideias"
  },
  {
    id: "tradutor-avancado",
    title: "Tradutor Avançado",
    description: "Traduza textos com contexto acadêmico e termos técnicos preservados",
    icon: <Languages className="h-6 w-6 text-white" />,
    buttonText: "Traduzir"
  },
  {
    id: "visualizador-3d",
    title: "Visualizador 3D",
    description: "Visualize modelos 3D interativos para melhor compreensão de conceitos complexos",
    icon: <Cube className="h-6 w-6 text-white" />,
    buttonText: "Visualizar",
    badge: "Beta"
  },
  {
    id: "conversor-unidades",
    title: "Conversor de Unidades",
    description: "Converta entre diferentes unidades de medida para física, química e matemática",
    icon: <Move className="h-6 w-6 text-white" />,
    buttonText: "Converter"
  }
];
