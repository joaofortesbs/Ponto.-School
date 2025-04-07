import React, { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Timer,
  Zap,
  Award,
  Target,
  Filter,
  Download,
  Share2,
  PieChart,
  LineChart,
  BarChart,
  Activity,
} from "lucide-react";

export default function DesempenhoInterface() {
  const [activeTab, setActiveTab] = useState("geral");
  const [selectedPeriod, setSelectedPeriod] = useState("semana");

  // Dados simulados para o desempenho
  const performanceData = {
    overview: {
      totalStudyTime: "42h 30min",
      completedTasks: 28,
      totalTasks: 35,
      averageScore: 8.7,
      streak: 15,
    },
    subjects: [
      { name: "Matemática", progress: 85, trend: "up", score: 9.2 },
      { name: "Física", progress: 72, trend: "up", score: 8.5 },
      { name: "Química", progress: 63, trend: "down", score: 7.8 },
      { name: "Biologia", progress: 78, trend: "up", score: 8.9 },
      { name: "História", progress: 68, trend: "stable", score: 8.2 },
      { name: "Literatura", progress: 75, trend: "up", score: 9.0 },
    ],
    recentActivities: [
      {
        type: "quiz",
        title: "Quiz de Física Quântica",
        date: "Hoje, 14:30",
        result: "90%",
        status: "success",
      },
      {
        type: "task",
        title: "Exercícios de Cálculo Diferencial",
        date: "Hoje, 11:15",
        result: "Concluído",
        status: "success",
      },
      {
        type: "study",
        title: "Estudo de Literatura Brasileira",
        date: "Ontem, 16:45",
        result: "2h 15min",
        status: "success",
      },
      {
        type: "quiz",
        title: "Quiz de História Mundial",
        date: "Ontem, 10:20",
        result: "75%",
        status: "warning",
      },
      {
        type: "task",
        title: "Redação sobre Meio Ambiente",
        date: "2 dias atrás",
        result: "Pendente",
        status: "pending",
      },
    ],
    weeklyData: {
      studyTime: [2.5, 3.0, 1.5, 4.0, 3.5, 2.0, 3.0], // horas por dia
      taskCompletion: [5, 4, 3, 6, 5, 2, 4], // tarefas por dia
      scores: [8.5, 9.0, 7.5, 8.0, 9.5, 8.0, 9.0], // notas por dia
    },
    achievements: [
      {
        title: "Mestre em Matemática",
        description: "Completou 100 exercícios de matemática",
        date: "15/06/2024",
        icon: <Award className="h-6 w-6 text-[#FF6B00]" />,
      },
      {
        title: "Estudante Dedicado",
        description: "Estudou por 15 dias consecutivos",
        date: "10/06/2024",
        icon: <Zap className="h-6 w-6 text-[#FF6B00]" />,
      },
      {
        title: "Explorador de Conhecimento",
        description: "Explorou 10 tópicos diferentes",
        date: "05/06/2024",
        icon: <Target className="h-6 w-6 text-[#FF6B00]" />,
      },
    ],
  };

  // Componente para o ícone de status
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  // Componente para o ícone de tipo de atividade
  const ActivityTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "quiz":
        return <FileText className="h-5 w-5 text-[#FF6B00]" />;
      case "task":
        return <CheckCircle className="h-5 w-5 text-[#FF6B00]" />;
      case "study":
        return <BookOpen className="h-5 w-5 text-[#FF6B00]" />;
      default:
        return <FileText className="h-5 w-5 text-[#FF6B00]" />;
    }
  };

  // Componente para o ícone de tendência
  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return (
          <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        );
    }
  };

  // Componente para renderizar um gráfico simulado
  const ChartPlaceholder = ({
    type,
    height = 200,
  }: {
    type: string;
    height?: number;
  }) => {
    return (
      <div
        className="w-full bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          {type === "bar" && (
            <BarChart className="h-10 w-10 text-[#FF6B00] mx-auto mb-2" />
          )}
          {type === "line" && (
            <LineChart className="h-10 w-10 text-[#FF6B00] mx-auto mb-2" />
          )}
          {type === "pie" && (
            <PieChart className="h-10 w-10 text-[#FF6B00] mx-auto mb-2" />
          )}
          {type === "activity" && (
            <Activity className="h-10 w-10 text-[#FF6B00] mx-auto mb-2" />
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gráfico de{" "}
            {type === "bar"
              ? "barras"
              : type === "line"
                ? "linhas"
                : type === "pie"
                  ? "pizza"
                  : "atividade"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Dados interativos em tempo real
          </p>
        </div>
      </div>
    );
  };

  const { theme } = useTheme();

  return (
    <div
      className={`w-full h-full ${theme === "dark" ? "bg-[#001427] text-white" : "bg-[#f7f9fa] text-[#29335C]"} p-6 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#FF6B00]" /> Análise de
              Desempenho
            </h1>
            <p className="text-[#64748B] dark:text-white/60">
              Acompanhe seu progresso e identifique áreas para melhorar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-[#29335C]/20 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
              <Button
                variant={selectedPeriod === "semana" ? "default" : "ghost"}
                size="sm"
                className={
                  selectedPeriod === "semana"
                    ? "bg-[#FF6B00] text-white"
                    : "text-gray-600 dark:text-gray-300"
                }
                onClick={() => setSelectedPeriod("semana")}
              >
                Semana
              </Button>
              <Button
                variant={selectedPeriod === "mes" ? "default" : "ghost"}
                size="sm"
                className={
                  selectedPeriod === "mes"
                    ? "bg-[#FF6B00] text-white"
                    : "text-gray-600 dark:text-gray-300"
                }
                onClick={() => setSelectedPeriod("mes")}
              >
                Mês
              </Button>
              <Button
                variant={selectedPeriod === "ano" ? "default" : "ghost"}
                size="sm"
                className={
                  selectedPeriod === "ano"
                    ? "bg-[#FF6B00] text-white"
                    : "text-gray-600 dark:text-gray-300"
                }
                onClick={() => setSelectedPeriod("ano")}
              >
                Ano
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
            >
              <Filter className="h-4 w-4 mr-1" /> Filtrar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
            >
              <Download className="h-4 w-4 mr-1" /> Exportar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tempo Total de Estudo
              </h3>
              <Timer className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {performanceData.overview.totalStudyTime}
                </p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> 15% acima da média
                </p>
              </div>
              <div className="h-10 w-20 bg-[#FF6B00]/10 rounded-md flex items-center justify-center">
                <span className="text-xs font-medium text-[#FF6B00]">
                  Esta semana
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tarefas Concluídas
              </h3>
              <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {performanceData.overview.completedTasks}/
                  {performanceData.overview.totalTasks}
                </p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> 80% de conclusão
                </p>
              </div>
              <div className="h-10 w-20">
                <Progress value={80} className="h-2 mt-4" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nota Média
              </h3>
              <Award className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {performanceData.overview.averageScore}/10
                </p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> 0.5 acima do último período
                </p>
              </div>
              <div className="h-10 w-20 flex items-end justify-end">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Excelente
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sequência de Estudos
              </h3>
              <Zap className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {performanceData.overview.streak} dias
                </p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Seu melhor recorde!
                </p>
              </div>
              <div className="h-10 w-20 flex items-end justify-end">
                <Badge className="bg-[#FF6B00] text-white">Em alta</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Conteúdo */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
          <Button
            variant="ghost"
            className={`px-4 py-2 rounded-none ${activeTab === "geral" ? "text-[#FF6B00] border-b-2 border-[#FF6B00]" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setActiveTab("geral")}
          >
            Visão Geral
          </Button>
          <Button
            variant="ghost"
            className={`px-4 py-2 rounded-none ${activeTab === "materias" ? "text-[#FF6B00] border-b-2 border-[#FF6B00]" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setActiveTab("materias")}
          >
            Por Matéria
          </Button>
          <Button
            variant="ghost"
            className={`px-4 py-2 rounded-none ${activeTab === "atividades" ? "text-[#FF6B00] border-b-2 border-[#FF6B00]" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setActiveTab("atividades")}
          >
            Atividades
          </Button>
          <Button
            variant="ghost"
            className={`px-4 py-2 rounded-none ${activeTab === "conquistas" ? "text-[#FF6B00] border-b-2 border-[#FF6B00]" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setActiveTab("conquistas")}
          >
            Conquistas
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-350px)]">
          {/* Visão Geral */}
          {activeTab === "geral" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                    Tempo de Estudo
                  </h3>
                  <ChartPlaceholder type="bar" height={250} />
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Média Diária
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        2.8h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dia Mais Produtivo
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        Quinta
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Semanal
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        19.5h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                    Desempenho por Matéria
                  </h3>
                  <ChartPlaceholder type="pie" height={250} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {performanceData.subjects.map((subject, index) => (
                      <Badge
                        key={index}
                        className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >
                        {subject.name}: {subject.progress}%
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                    Atividades Recentes
                  </h3>
                  <Button
                    variant="ghost"
                    className="text-[#FF6B00] text-xs flex items-center gap-1"
                  >
                    Ver Todas <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {performanceData.recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg hover:bg-gray-100 dark:hover:bg-[#29335C]/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center">
                          <ActivityTypeIcon type={activity.type} />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {activity.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`
                            ${
                              activity.status === "success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : activity.status === "warning"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : activity.status === "error"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }
                          `}
                        >
                          {activity.result}
                        </Badge>
                        <StatusIcon status={activity.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-5 rounded-xl text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      Insights do Epictus IA{" "}
                      <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                    </h3>
                    <p className="text-white/80 mb-4">
                      Com base na sua análise de desempenho, o Epictus IA
                      identificou que você tem um desempenho melhor em
                      Matemática e Biologia, mas pode melhorar em Química.
                      Recomendamos dedicar mais tempo aos estudos de Química,
                      especialmente nos tópicos de Química Orgânica.
                    </p>
                    <Button className="bg-white text-[#29335C] hover:bg-white/90 shadow-sm">
                      Ver Recomendações Detalhadas{" "}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Por Matéria */}
          {activeTab === "materias" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                    Progresso por Matéria
                  </h3>
                  <ChartPlaceholder type="bar" height={250} />
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                    Notas por Matéria
                  </h3>
                  <ChartPlaceholder type="line" height={250} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                  Detalhamento por Matéria
                </h3>
                <div className="space-y-4">
                  {performanceData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#29335C] dark:text-white">
                              {subject.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Nota: {subject.score}/10
                              </Badge>
                              <div className="flex items-center gap-1">
                                <TrendIcon trend={subject.trend} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {subject.trend === "up"
                                    ? "Melhorando"
                                    : subject.trend === "down"
                                      ? "Precisa de atenção"
                                      : "Estável"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Progresso
                          </span>
                          <span className="text-sm font-medium text-[#FF6B00]">
                            {subject.progress}%
                          </span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tempo Dedicado
                          </p>
                          <p className="text-sm font-medium text-[#29335C] dark:text-white">
                            8h 30min
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Exercícios
                          </p>
                          <p className="text-sm font-medium text-[#29335C] dark:text-white">
                            45/60
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Média
                          </p>
                          <p className="text-sm font-medium text-[#29335C] dark:text-white">
                            {subject.score}/10
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Atividades */}
          {activeTab === "atividades" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                    Atividades por Tipo
                  </h3>
                  <ChartPlaceholder type="pie" height={250} />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quizzes
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        15
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tarefas
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        28
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estudos
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        42
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                    Atividades ao Longo do Tempo
                  </h3>
                  <ChartPlaceholder type="activity" height={250} />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Esta Semana
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        18
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Este Mês
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        85
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total
                      </p>
                      <p className="text-lg font-bold text-[#29335C] dark:text-white">
                        342
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                    Histórico de Atividades
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                    >
                      <Filter className="h-4 w-4 mr-1" /> Filtrar
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-[#FF6B00] text-xs flex items-center gap-1"
                    >
                      Ver Todas <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    ...performanceData.recentActivities,
                    ...performanceData.recentActivities,
                  ]
                    .slice(0, 8)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg hover:bg-gray-100 dark:hover:bg-[#29335C]/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center">
                            <ActivityTypeIcon type={activity.type} />
                          </div>
                          <div>
                            <h4 className="font-medium text-[#29335C] dark:text-white">
                              {activity.title}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {activity.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {activity.result}
                          </Badge>
                          <StatusIcon status={activity.status} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Conquistas */}
          {activeTab === "conquistas" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                  Conquistas Desbloqueadas
                </h3>
                <div className="space-y-4">
                  {performanceData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#29335C] dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Conquistado em {achievement.date}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-[#FF6B00] text-white">
                        Desbloqueado
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">
                  Próximas Conquistas
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Maratonista de Estudos",
                      description: "Estude por 30 dias consecutivos",
                      progress: 50,
                      icon: <Clock className="h-6 w-6 text-[#FF6B00]" />,
                    },
                    {
                      title: "Especialista em Literatura",
                      description: "Complete 50 resumos de literatura",
                      progress: 30,
                      icon: <BookOpen className="h-6 w-6 text-[#FF6B00]" />,
                    },
                    {
                      title: "Mestre em Exatas",
                      description:
                        "Obtenha nota máxima em 10 testes de matemática e física",
                      progress: 70,
                      icon: <BarChart3 className="h-6 w-6 text-[#FF6B00]" />,
                    },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#29335C] dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                          {achievement.description}
                        </p>
                        <div className="mb-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Progresso
                            </span>
                            <span className="text-xs text-[#FF6B00]">
                              {achievement.progress}%
                            </span>
                          </div>
                          <Progress
                            value={achievement.progress}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
