import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  MessageCircle,
  Users,
  FileText,
  Brain,
  Target,
  Award,
  Zap,
  BarChart,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Rocket,
  Info,
  Video,
  Play,
  FileQuestion,
  Sparkles,
  Plus,
  Search,
  Eye,
} from "lucide-react";

interface TurmaDetailProps {
  turmaDetalhada: any;
  onBack: () => void;
}

const TurmaDetail: React.FC<TurmaDetailProps> = ({
  turmaDetalhada,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState("conteudo");
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1"]);

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "text-green-500";
      case "pendente":
        return "text-amber-500";
      case "novo":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pendente":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "novo":
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "media":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Get comparative icon
  const getComparativeIcon = (status: string) => {
    switch (status) {
      case "acima":
        return (
          <ArrowRight className="h-4 w-4 text-green-500 rotate-[-45deg]" />
        );
      case "abaixo":
        return <ArrowRight className="h-4 w-4 text-red-500 rotate-45" />;
      case "na media":
        return <ArrowRight className="h-4 w-4 text-amber-500 rotate-0" />;
      default:
        return null;
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "tarefa":
        return <FileText className="h-4 w-4 text-amber-500" />;
      case "discussao":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "avaliacao":
        return <FileQuestion className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Turma Header */}
      <div className="relative h-64 rounded-xl overflow-hidden">
        <img
          src={turmaDetalhada.imagem}
          alt={turmaDetalhada.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
            onClick={onBack}
          >
            <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Voltar para
            Minhas Turmas
          </Button>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Ver Fórum
          </Button>

          <Button
            variant="ghost"
            className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
          >
            <Users className="h-4 w-4 mr-1" /> Ver Colegas
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={turmaDetalhada.professor.avatar} />
              <AvatarFallback>
                {turmaDetalhada.professor.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white font-montserrat">
                {turmaDetalhada.nome}
              </h1>
              <p className="text-gray-200 font-open-sans">
                {turmaDetalhada.professor.nome} •{" "}
                {turmaDetalhada.professor.especialidade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] backdrop-blur-sm">
              {turmaDetalhada.status}
            </Badge>

            <div className="flex items-center gap-1 text-white text-sm">
              <Calendar className="h-4 w-4 text-[#FF6B00]" />
              <span>{turmaDetalhada.inicioFim}</span>
            </div>

            <div className="flex items-center gap-1 text-white text-sm">
              <Clock className="h-4 w-4 text-[#FF6B00]" />
              <span>{turmaDetalhada.horarios}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white dark:bg-[#1E293B] p-1 rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <TabsTrigger
            value="conteudo"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <BookOpen className="h-4 w-4 mr-2" /> Conteúdo
          </TabsTrigger>

          <TabsTrigger
            value="visao-geral"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <BarChart className="h-4 w-4 mr-2" /> Visão Geral
          </TabsTrigger>

          <TabsTrigger
            value="forum"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Fórum
          </TabsTrigger>

          <TabsTrigger
            value="agenda"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <Calendar className="h-4 w-4 mr-2" /> Agenda
          </TabsTrigger>

          <TabsTrigger
            value="membros"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <Users className="h-4 w-4 mr-2" /> Membros
          </TabsTrigger>

          <TabsTrigger
            value="notas"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2 font-montserrat"
          >
            <FileText className="h-4 w-4 mr-2" /> Notas
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo Tab */}
        <TabsContent value="conteudo" className="space-y-6">
          {/* Painel de Aprendizagem Personalizado */}
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-[#FF6B00]" /> Painel de
                  Aprendizagem Personalizado
                </h3>
                <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Gerado pelo Mentor
                  IA
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Seu Próximo Passo */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <Rocket className="h-5 w-5 mr-2 text-[#FF6B00]" /> Seu
                    Próximo Passo
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-open-sans">
                    Revisar o conceito de Dualidade Onda-Partícula antes de
                    prosseguir para o próximo módulo.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat">
                    Ir para a Atividade
                  </Button>
                </div>

                {/* Recomendado para Você */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <Lightbulb className="h-5 w-5 mr-2 text-[#FF6B00]" />{" "}
                    Recomendado para Você
                  </h4>
                  <div className="space-y-3">
                    {turmaDetalhada.recomendacoes.map((rec: any) => (
                      <div key={rec.id} className="flex items-start gap-2">
                        {rec.icone}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            {rec.titulo}
                          </p>
                          <Badge
                            className={`mt-1 text-xs ${getPriorityColor(rec.prioridade)}`}
                          >
                            Prioridade {rec.prioridade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metas Semanais */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <Target className="h-5 w-5 mr-2 text-[#FF6B00]" /> Metas
                    Semanais
                  </h4>
                  <div className="space-y-3">
                    {turmaDetalhada.metasSemanais.map((meta: any) => (
                      <div key={meta.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            {meta.titulo}
                          </p>
                          <span className="text-xs font-bold text-[#FF6B00]">
                            {meta.progresso}%
                          </span>
                        </div>
                        <Progress
                          value={meta.progresso}
                          className="h-1.5 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seus Pontos Fortes */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <Award className="h-5 w-5 mr-2 text-[#FF6B00]" /> Seus
                    Pontos Fortes
                  </h4>
                  <div className="space-y-2">
                    {turmaDetalhada.pontosFortes.map(
                      (ponto: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            {ponto}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Áreas para Melhorar */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <Zap className="h-5 w-5 mr-2 text-[#FF6B00]" /> Áreas para
                    Melhorar
                  </h4>
                  <div className="space-y-2">
                    {turmaDetalhada.pontosFracos.map(
                      (ponto: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            {ponto}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                  <Button
                    variant="link"
                    className="mt-2 p-0 h-auto text-[#FF6B00] hover:text-[#FF8C40]"
                  >
                    Ver materiais de revisão{" "}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                {/* Comparativo com a Turma */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                    <BarChart className="h-5 w-5 mr-2 text-[#FF6B00]" />{" "}
                    Comparativo com a Turma
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                        Participação no Fórum
                      </p>
                      <div className="flex items-center gap-1">
                        {getComparativeIcon(
                          turmaDetalhada.comparativoTurma.participacao,
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {turmaDetalhada.comparativoTurma.participacao ===
                          "acima"
                            ? "Acima da média"
                            : turmaDetalhada.comparativoTurma.participacao ===
                                "abaixo"
                              ? "Abaixo da média"
                              : "Na média"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                        Entrega de Tarefas
                      </p>
                      <div className="flex items-center gap-1">
                        {getComparativeIcon(
                          turmaDetalhada.comparativoTurma.entregaTarefas,
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {turmaDetalhada.comparativoTurma.entregaTarefas ===
                          "acima"
                            ? "Acima da média"
                            : turmaDetalhada.comparativoTurma.entregaTarefas ===
                                "abaixo"
                              ? "Abaixo da média"
                              : "Na média"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                        Desempenho Geral
                      </p>
                      <div className="flex items-center gap-1">
                        {getComparativeIcon(
                          turmaDetalhada.comparativoTurma.desempenhoGeral,
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {turmaDetalhada.comparativoTurma.desempenhoGeral ===
                          "acima"
                            ? "Acima da média"
                            : turmaDetalhada.comparativoTurma
                                  .desempenhoGeral === "abaixo"
                              ? "Abaixo da média"
                              : "Na média"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulos */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">
              Módulos do Curso
            </h3>

            {turmaDetalhada.modulos.map((modulo: any) => (
              <Card
                key={modulo.id}
                className={`bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md hover:shadow-lg transition-all duration-300 ${expandedModules.includes(modulo.id) ? "border-[#FF6B00]/30" : ""}`}
              >
                <div
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleModule(modulo.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                        {modulo.titulo}
                      </h4>
                      {modulo.progresso === 100 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                      {modulo.descricao}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#FF6B00]">
                        {modulo.progresso}%
                      </span>
                      <div className="w-20 h-2 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full"
                          style={{ width: `${modulo.progresso}%` }}
                        ></div>
                      </div>
                    </div>

                    {expandedModules.includes(modulo.id) ? (
                      <ChevronUp className="h-5 w-5 text-[#FF6B00]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#FF6B00]" />
                    )}
                  </div>
                </div>

                {/* Conteúdos do Módulo */}
                {expandedModules.includes(modulo.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4 space-y-3"
                  >
                    <div className="border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20 pt-3">
                      {modulo.conteudos.map((conteudo: any) => (
                        <div
                          key={conteudo.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10 transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0">{conteudo.icone}</div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5
                                className={`text-base font-medium font-montserrat ${conteudo.status === "concluido" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
                              >
                                {conteudo.titulo}
                              </h5>
                              <div className={getStatusColor(conteudo.status)}>
                                {getStatusIcon(conteudo.status)}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[#FF6B00]" />
                                <span>{conteudo.duracao}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                <span>{conteudo.data}</span>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
                          >
                            Acessar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Visão Geral Tab */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações da Turma */}
            <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-4">
                  <Info className="h-5 w-5 mr-2 text-[#FF6B00]" /> Informações
                  da Turma
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Período
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {turmaDetalhada.inicioFim}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Horários
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {turmaDetalhada.horarios}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Carga Horária
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {turmaDetalhada.cargaHoraria}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Professor
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {turmaDetalhada.professor.nome} (
                        {turmaDetalhada.professor.email})
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Especialidade: {turmaDetalhada.professor.especialidade}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descrição
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {turmaDetalhada.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso Geral */}
            <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-4">
                  <BarChart className="h-5 w-5 mr-2 text-[#FF6B00]" /> Progresso
                  Geral
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progresso Total
                      </span>
                      <span className="text-sm font-bold text-[#FF6B00]">
                        {turmaDetalhada.progresso}%
                      </span>
                    </div>
                    <Progress
                      value={turmaDetalhada.progresso}
                      className="h-3 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progresso por Módulo
                    </h4>

                    {turmaDetalhada.modulos.map((modulo: any) => (
                      <div key={modulo.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {modulo.titulo.split(":")[0]}
                          </span>
                          <span className="text-xs font-medium text-[#FF6B00]">
                            {modulo.progresso}%
                          </span>
                        </div>
                        <Progress
                          value={modulo.progresso}
                          className="h-2 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Estatísticas
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-[#FF6B00]">
                          {turmaDetalhada.modulos.reduce(
                            (acc: number, modulo: any) =>
                              acc +
                              modulo.conteudos.filter(
                                (c: any) => c.status === "concluido",
                              ).length,
                            0,
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Atividades Concluídas
                        </div>
                      </div>

                      <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-[#FF6B00]">
                          {turmaDetalhada.modulos.reduce(
                            (acc: number, modulo: any) =>
                              acc +
                              modulo.conteudos.filter(
                                (c: any) => c.status === "pendente",
                              ).length,
                            0,
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Atividades Pendentes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grupos de Estudo */}
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[#FF6B00]" /> Grupos de
                  Estudo
                </h3>
                <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                  <Plus className="h-4 w-4 mr-1" /> Criar Grupo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {turmaDetalhada.gruposEstudo.map((grupo: any) => (
                  <div
                    key={grupo.id}
                    className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20"
                  >
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-2">
                      {grupo.nome}
                    </h4>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-2">
                        {grupo.membros
                          .slice(0, 3)
                          .map((membro: string, index: number) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-xs font-bold text-[#FF6B00] border-2 border-white dark:border-[#1E293B]"
                            >
                              {membro === "Você" ? "Você" : membro.charAt(0)}
                            </div>
                          ))}
                        {grupo.membros.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-xs font-bold text-[#FF6B00] border-2 border-white dark:border-[#1E293B]">
                            +{grupo.membros.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {grupo.membros.length} membros
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 text-[#FF6B00]" />
                        <span>Próxima reunião: {grupo.proximaReuniao}</span>
                      </div>

                      <Button
                        variant="ghost"
                        className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
                      >
                        Entrar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fórum Tab */}
        <TabsContent value="forum" className="space-y-6">
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-[#FF6B00]" />{" "}
                  Fórum da Turma
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      placeholder="Buscar no fórum..."
                      className="pl-9 w-[200px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg h-9 bg-transparent border"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                    <Plus className="h-4 w-4 mr-1" /> Novo Tópico
                  </Button>
                </div>
              </div>

              {/* Tópicos Fixados */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">
                  Tópicos Fixados
                </h4>

                <div className="space-y-3">
                  {turmaDetalhada.forumTopicos
                    .filter((t: any) => t.fixado)
                    .map((topico: any) => (
                      <div
                        key={topico.id}
                        className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 hover:border-[#FF6B00]/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex-shrink-0 mt-1">
                            Fixado
                          </Badge>

                          <div className="flex-1">
                            <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-1">
                              {topico.titulo}
                            </h5>

                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <div className="flex items-center gap-1">
                                <span>Por: {topico.autor}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                <span>{topico.data}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <MessageCircle className="h-3 w-3 text-[#FF6B00]" />
                                <span>{topico.respostas} respostas</span>
                              </div>

                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Eye className="h-3 w-3 text-[#FF6B00]" />
                                <span>
                                  {topico.visualizacoes} visualizações
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Tópicos Recentes */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">
                  Tópicos Recentes
                </h4>

                <div className="space-y-3">
                  {turmaDetalhada.forumTopicos
                    .filter((t: any) => !t.fixado)
                    .map((topico: any) => (
                      <div
                        key={topico.id}
                        className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-1">
                              {topico.titulo}
                            </h5>

                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <div className="flex items-center gap-1">
                                <span>Por: {topico.autor}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                <span>{topico.data}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <MessageCircle className="h-3 w-3 text-[#FF6B00]" />
                                <span>{topico.respostas} respostas</span>
                              </div>

                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Eye className="h-3 w-3 text-[#FF6B00]" />
                                <span>
                                  {topico.visualizacoes} visualizações
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda Tab */}
        <TabsContent value="agenda" className="space-y-6">
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#FF6B00]" /> Agenda da
                  Turma
                </h3>
                <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                  Ver Calendário Completo
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                  Próximos Eventos
                </h4>

                <div className="space-y-3">
                  {turmaDetalhada.eventos.map((evento: any) => (
                    <div
                      key={evento.id}
                      className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
                          {getEventTypeIcon(evento.tipo)}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat">
                              {evento.titulo}
                            </h5>

                            <Badge
                              className={`
                              ${
                                evento.tipo === "aula"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : evento.tipo === "tarefa"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : evento.tipo === "discussao"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : evento.tipo === "avaliacao"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                              }`}
                            >
                              {evento.tipo.charAt(0).toUpperCase() +
                                evento.tipo.slice(1)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-[#FF6B00]" />
                              <span>{evento.data}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-[#FF6B00]" />
                              <span>{evento.hora}</span>
                            </div>

                            {evento.local && (
                              <div className="flex items-center gap-1">
                                <span>{evento.local}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membros Tab */}
        <TabsContent value="membros" className="space-y-6">
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[#FF6B00]" /> Membros da
                  Turma
                </h3>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    placeholder="Buscar membros..."
                    className="pl-9 w-[200px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg h-9 bg-transparent border"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                  Professor
                </h4>

                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-[#FF6B00]/30">
                    <AvatarImage src={turmaDetalhada.professor.avatar} />
                    <AvatarFallback>
                      {turmaDetalhada.professor.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat">
                      {turmaDetalhada.professor.nome}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {turmaDetalhada.professor.especialidade}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {turmaDetalhada.professor.email}
                    </p>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mt-6">
                  Colegas
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {turmaDetalhada.colegas.map((colega: any) => (
                    <div
                      key={colega.id}
                      className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={colega.avatar} />
                          <AvatarFallback>
                            {colega.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {colega.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1E293B]"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {colega.nome}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {colega.online ? "Online" : "Offline"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notas Tab */}
        <TabsContent value="notas" className="space-y-6">
          <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#FF6B00]" /> Boletim
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Avaliação
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Nota
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Peso
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {turmaDetalhada.notas.map((nota: any) => (
                      <tr
                        key={nota.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {nota.avaliacao}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          {nota.nota !== null ? (
                            <span
                              className={`font-medium ${nota.nota >= 7 ? "text-green-600 dark:text-green-400" : nota.nota >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {nota.nota.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">
                          {nota.peso}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                          {nota.data}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10">
                      <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white">
                        Média Final
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-center text-[#FF6B00]">
                        8.5
                      </td>
                      <td className="py-3 px-4 text-sm text-center">-</td>
                      <td className="py-3 px-4 text-sm text-right">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 p-4 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Observações
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5"></div>
                    <span>Média mínima para aprovação: 7.0</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5"></div>
                    <span>Recuperação: entre 5.0 e 6.9</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5"></div>
                    <span>Reprovação: abaixo de 5.0</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TurmaDetail;
