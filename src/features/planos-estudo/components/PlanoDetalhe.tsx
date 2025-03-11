import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronRight,
  FileText,
  Lightbulb,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  X,
  ArrowRight,
  Download,
  Share2,
  Sparkles,
  Rocket,
  Target,
  CheckSquare,
  Layers,
  Play,
  Code,
  Globe,
  Edit,
} from "lucide-react";
import Link from "@/components/epictus-ia/Link";
import HelpCircle from "@/components/epictus-ia/HelpCircle";

interface PlanoDetalheProps {
  planoId: string;
  planos: any[];
  onClose: () => void;
  onEdit: () => void;
}

const PlanoDetalhe = ({
  planoId,
  planos,
  onClose,
  onEdit,
}: PlanoDetalheProps) => {
  const plano = planos.find((p) => p.id === planoId);
  if (!plano) return null;

  const [detailTab, setDetailTab] = useState("visao-geral");

  // Componente para o ícone do tipo de plano
  const PlanTypeIcon = ({ tipo }: { tipo: string }) => {
    switch (tipo) {
      case "personalizado":
        return <BookOpen className="h-5 w-5 text-[#FF6B00]" />;
      case "curso":
        return <Code className="h-5 w-5 text-[#FF6B00]" />;
      case "idioma":
        return <Globe className="h-5 w-5 text-[#FF6B00]" />;
      default:
        return <BookOpen className="h-5 w-5 text-[#FF6B00]" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#FF6B00]/5 to-transparent dark:from-[#FF6B00]/10 dark:to-transparent">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <PlanTypeIcon tipo={plano.tipo} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                {plano.nome}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {plano.dataInicio} - {plano.dataFim}
                  </span>
                </div>
                <Badge
                  className={`
                    ${
                      plano.progresso < 30
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : plano.progresso < 70
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }
                  `}
                >
                  {plano.progresso}% Concluído
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-1" /> Fechar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
            <Button
              size="sm"
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Rocket className="h-4 w-4 mr-1" /> Iniciar Estudo
            </Button>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mt-4">
          {plano.descricao}
        </p>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Progresso geral
            </span>
            <span className="text-sm font-medium text-[#FF6B00]">
              {plano.progresso}%
            </span>
          </div>
          <Progress value={plano.progresso} className="h-2" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-800 px-6">
          <TabsList className="bg-transparent h-auto p-0 mt-2">
            <TabsTrigger
              value="visao-geral"
              className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-gray-600 dark:text-gray-300 data-[state=active]:text-[#FF6B00]"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="tarefas"
              className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-gray-600 dark:text-gray-300 data-[state=active]:text-[#FF6B00]"
            >
              Tarefas
            </TabsTrigger>
            <TabsTrigger
              value="materias"
              className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-gray-600 dark:text-gray-300 data-[state=active]:text-[#FF6B00]"
            >
              Matérias
            </TabsTrigger>
            <TabsTrigger
              value="metas"
              className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-gray-600 dark:text-gray-300 data-[state=active]:text-[#FF6B00]"
            >
              Metas
            </TabsTrigger>
            <TabsTrigger
              value="recursos"
              className="px-4 py-2 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-gray-600 dark:text-gray-300 data-[state=active]:text-[#FF6B00]"
            >
              Recursos
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="h-[calc(100vh-450px)] p-6">
          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="mt-0 space-y-6">
            {/* Content for visao-geral tab */}
            {/* ... (rest of the visao-geral content) */}
          </TabsContent>

          {/* Tarefas */}
          <TabsContent value="tarefas" className="mt-0 space-y-6">
            {/* Content for tarefas tab */}
            {/* ... (rest of the tarefas content) */}
          </TabsContent>

          {/* Matérias */}
          <TabsContent value="materias" className="mt-0 space-y-6">
            {/* Content for materias tab */}
            {/* ... (rest of the materias content) */}
          </TabsContent>

          {/* Metas */}
          <TabsContent value="metas" className="mt-0 space-y-6">
            {/* Content for metas tab */}
            {/* ... (rest of the metas content) */}
          </TabsContent>

          {/* Recursos */}
          <TabsContent value="recursos" className="mt-0 space-y-6">
            {/* Content for recursos tab */}
            {/* ... (rest of the recursos content) */}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default PlanoDetalhe;
