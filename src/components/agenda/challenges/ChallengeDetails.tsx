import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Challenge } from "./ChallengeCard";
import { ChallengeTask } from "./ChallengeTaskList";
import ChallengeTaskList from "./ChallengeTaskList";
import {
  Trophy,
  Clock,
  Users,
  Share2,
  ArrowLeft,
  Calendar,
  BookOpen,
  MessageSquare,
  FileText,
  Award,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Flame,
  Zap,
  Target,
  CheckCircle2,
  Coins,
  Gift,
} from "lucide-react";

interface ChallengeDetailsProps {
  challenge: Challenge;
  onBack: () => void;
  onParticipate: (challengeId: string) => void;
}

const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({
  challenge,
  onBack,
  onParticipate,
}) => {
  const [activeTab, setActiveTab] = useState("visao-geral");

  // Sample tasks data
  const tasks: ChallengeTask[] = [
    {
      id: "1",
      title: "Assistir à videoaula sobre Técnicas de Estudo",
      description:
        "Aprenda técnicas eficazes para otimizar seu tempo de estudo",
      status: "completed",
      dueDate: "2023-07-15",
      type: "video",
      points: 50,
      resources: [
        { type: "video", url: "#", title: "Videoaula: Técnicas de Estudo" },
        { type: "pdf", url: "#", title: "Material Complementar" },
      ],
    },
    {
      id: "2",
      title: "Criar um plano de estudos semanal",
      description:
        "Desenvolva um plano de estudos personalizado para a próxima semana",
      status: "in-progress",
      dueDate: "2023-07-20",
      type: "activity",
      points: 100,
      resources: [
        { type: "template", url: "#", title: "Template de Plano de Estudos" },
        { type: "article", url: "#", title: "Como criar um plano eficaz" },
      ],
    },
    {
      id: "3",
      title: "Participar do fórum de discussão sobre organização",
      description:
        "Compartilhe suas experiências e aprenda com outros estudantes",
      status: "pending",
      dueDate: "2023-07-25",
      type: "forum",
      points: 75,
      resources: [
        { type: "forum", url: "#", title: "Fórum: Organização e Planejamento" },
      ],
    },
    {
      id: "4",
      title: "Completar o quiz sobre técnicas de memorização",
      description: "Teste seus conhecimentos sobre técnicas de memorização",
      status: "pending",
      dueDate: "2023-07-30",
      type: "quiz",
      points: 50,
      resources: [
        { type: "quiz", url: "#", title: "Quiz: Técnicas de Memorização" },
        {
          type: "article",
          url: "#",
          title: "Artigo: Memorização Eficiente",
        },
      ],
    },
  ];

  // Sample rewards data
  const rewards = [
    {
      id: "1",
      title: "Badge Organizador Mestre",
      description: "Reconhecimento por completar o módulo de organização",
      icon: <Award className="h-5 w-5 text-[#FF6B00]" />,
      unlocked: true,
    },
    {
      id: "2",
      title: "100 Ponto Coins",
      description: "Moedas para trocar por recompensas na plataforma",
      icon: <Coins className="h-5 w-5 text-[#FF6B00]" />,
      unlocked: false,
    },
    {
      id: "3",
      title: "Acesso ao material exclusivo",
      description: "Conteúdo premium sobre técnicas avançadas de estudo",
      icon: <FileText className="h-5 w-5 text-[#FF6B00]" />,
      unlocked: false,
    },
    {
      id: "4",
      title: "Certificado de Conclusão",
      description: "Certificado oficial de conclusão do desafio",
      icon: <CheckCircle2 className="h-5 w-5 text-[#FF6B00]" />,
      unlocked: false,
    },
  ];

  // Sample participants data
  const participants = [
    {
      id: "1",
      name: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      progress: 75,
    },
    {
      id: "2",
      name: "Carlos Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      progress: 60,
    },
    {
      id: "3",
      name: "Mariana Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      progress: 90,
    },
    {
      id: "4",
      name: "Pedro Costa",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      progress: 45,
    },
    {
      id: "5",
      name: "Juliana Lima",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana",
      progress: 80,
    },
  ];

  // Sample discussions data
  const discussions = [
    {
      id: "1",
      title: "Como vocês organizam o tempo de estudo?",
      author: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      date: "2023-07-10",
      replies: 12,
      lastActivity: "2023-07-12",
    },
    {
      id: "2",
      title: "Dicas para manter o foco durante os estudos",
      author: "Carlos Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      date: "2023-07-08",
      replies: 8,
      lastActivity: "2023-07-11",
    },
    {
      id: "3",
      title: "Qual a melhor técnica de memorização para vocês?",
      author: "Mariana Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      date: "2023-07-05",
      replies: 15,
      lastActivity: "2023-07-09",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em-andamento":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Em Andamento
          </Badge>
        );
      case "disponivel":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Disponível
          </Badge>
        );
      case "concluido":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
            Concluído
          </Badge>
        );
      case "encerrado":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
            Encerrado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-600 dark:text-green-400"
          >
            Iniciante
          </Badge>
        );
      case "intermediario":
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-600 dark:text-blue-400"
          >
            Intermediário
          </Badge>
        );
      case "avancado":
        return (
          <Badge
            variant="outline"
            className="border-red-500 text-red-600 dark:text-red-400"
          >
            Avançado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "individual":
        return (
          <Badge
            variant="outline"
            className="border-[#FF6B00] text-[#FF6B00] dark:text-[#FF8C40]"
          >
            Individual
          </Badge>
        );
      case "grupo":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-600 dark:text-purple-400"
          >
            Em Grupo
          </Badge>
        );
      case "comunidade":
        return (
          <Badge
            variant="outline"
            className="border-teal-500 text-teal-600 dark:text-teal-400"
          >
            Comunidade
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
      {/* Header */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={challenge.image}
          alt={challenge.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute top-4 right-4 flex gap-2">
          {getStatusBadge(challenge.status)}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {challenge.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {getDifficultyBadge(challenge.difficulty)}
            {getTypeBadge(challenge.type)}
            <Badge variant="outline" className="border-gray-300 text-gray-200">
              {challenge.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Progress Bar (if in progress) */}
        {challenge.status === "em-andamento" && (
          <div className="mb-6 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Seu Progresso
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Continue avançando para ganhar recompensas!
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#FF6B00]">
                  {challenge.progress}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {challenge.completedTasks}/{challenge.totalTasks} tarefas
                </div>
              </div>
            </div>
            <Progress
              value={challenge.progress}
              className="h-3 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
            />
            <div className="flex justify-between mt-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1 text-[#FF6B00]" />
                {challenge.daysLeft !== undefined && (
                  <span>
                    {challenge.daysLeft > 0
                      ? `${challenge.daysLeft} dias restantes`
                      : "Último dia"}
                  </span>
                )}
              </div>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                Continuar Desafio
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-[#29335C]/10 dark:bg-[#29335C]/30 p-1 rounded-lg">
            <TabsTrigger
              value="visao-geral"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="tarefas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Tarefas
            </TabsTrigger>
            <TabsTrigger
              value="recompensas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Recompensas
            </TabsTrigger>
            <TabsTrigger
              value="participantes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Participantes
            </TabsTrigger>
            <TabsTrigger
              value="discussoes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md"
            >
              Discussões
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral Tab */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Sobre o Desafio
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {challenge.description}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    A Jornada do Conhecimento é um programa de aprendizado
                    contínuo, personalizado e gamificado, projetado para engajar
                    os alunos, desenvolver suas habilidades e prepará-los para o
                    futuro. Não é um evento pontual, mas uma jornada com
                    múltiplas etapas e desafios.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Objetivos
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Aumentar o engajamento com a plataforma de estudos
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Incentivar o estudo regular e a prática consistente
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Desenvolver habilidades de organização, disciplina e
                        foco
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Promover o aprendizado autônomo e colaborativo
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Preparar para provas, vestibulares e desafios futuros
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Como Funciona
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-[#FF6B00] font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Inscreva-se no Desafio
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Clique no botão "Participar" para começar sua jornada
                          de aprendizado.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-[#FF6B00] font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Complete as Tarefas
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Realize as atividades propostas no seu próprio ritmo,
                          ganhando pontos e desbloqueando conquistas.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-[#FF6B00] font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Interaja com a Comunidade
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Participe das discussões, compartilhe experiências e
                          aprenda com outros estudantes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-[#FF6B00] font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Receba Recompensas
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ganhe badges, pontos e acesso a conteúdos exclusivos
                          conforme avança no desafio.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Perguntas Frequentes
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Quanto tempo dura o desafio?
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        O desafio não tem uma duração fixa. Você pode participar
                        no seu próprio ritmo, completando as tarefas quando for
                        conveniente para você.
                      </p>
                    </div>
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Posso participar de mais de um desafio ao mesmo tempo?
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sim, você pode participar de quantos desafios quiser
                        simultaneamente. Recomendamos começar com um ou dois
                        para não se sobrecarregar.
                      </p>
                    </div>
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Como as recompensas são distribuídas?
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        As recompensas são desbloqueadas automaticamente
                        conforme você completa tarefas e atinge marcos
                        específicos no desafio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Call to Action */}
                {challenge.status === "disponivel" && (
                  <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-xl p-5 text-white shadow-lg">
                    <h3 className="text-xl font-bold mb-3">
                      Pronto para começar?
                    </h3>
                    <p className="text-white/90 mb-4">
                      Junte-se a {challenge.participants} outros estudantes
                      nesta jornada de aprendizado e desenvolvimento!
                    </p>
                    <Button
                      className="w-full bg-white text-[#FF6B00] hover:bg-white/90 font-bold rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                      onClick={() => onParticipate(challenge.id)}
                    >
                      Participar Agora
                    </Button>
                  </div>
                )}

                {/* Info Cards */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <div className="p-4 border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Informações do Desafio
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-[#FF6B00]" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Data de Início
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          10 de Julho, 2023
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-[#FF6B00]" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Duração Estimada
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          4 semanas (flexível)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-3 text-[#FF6B00]" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Módulos
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          4 módulos, 20 tarefas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3 text-[#FF6B00]" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Participantes
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.participants} estudantes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 mr-3 text-[#FF6B00]" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Pontos Disponíveis
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          1.000 Ponto Coins
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-3 text-[#FF6B00]" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Criado por
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Equipe Ponto.School
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview of Tasks */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <div className="p-4 border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Próximas Tarefas
                    </h3>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-6 p-0 text-xs text-[#FF6B00] hover:text-[#FF8C40] transition-colors"
                      onClick={() => setActiveTab("tarefas")}
                    >
                      Ver todas <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    {tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center p-2 hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-3 ${task.status === "completed" ? "bg-green-500" : task.status === "in-progress" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        ></div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${task.status === "completed" ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-800 dark:text-gray-200"}`}
                          >
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className="ml-2">{task.points} pts</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview of Rewards */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                  <div className="p-4 border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Recompensas
                    </h3>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-6 p-0 text-xs text-[#FF6B00] hover:text-[#FF8C40] transition-colors"
                      onClick={() => setActiveTab("recompensas")}
                    >
                      Ver todas <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    {rewards.slice(0, 3).map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center p-2 hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${reward.unlocked ? "bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20" : "bg-gray-100 dark:bg-gray-800"}`}
                        >
                          {reward.icon}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${reward.unlocked ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            {reward.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {reward.description}
                          </div>
                        </div>
                        {reward.unlocked ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            Desbloqueado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-500 dark:text-gray-400"
                          >
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Need Help */}
                <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <HelpCircle className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Precisa de ajuda?
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Se você tiver dúvidas sobre o desafio, entre em contato com
                    nossa equipe de suporte.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
                  >
                    Falar com Suporte
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tarefas Tab */}
          <TabsContent value="tarefas" className="space-y-6">
            <ChallengeTaskList tasks={tasks} />
          </TabsContent>

          {/* Recompensas Tab */}
          <TabsContent value="recompensas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md border ${reward.unlocked ? "border-[#FF6B00]/30 dark:border-[#FF6B00]/40" : "border-gray-200 dark:border-gray-700"} hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]`}
                >
                  <div
                    className={`p-6 flex flex-col items-center text-center ${reward.unlocked ? "bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10" : "bg-gray-50 dark:bg-gray-800/50"}`}
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${reward.unlocked ? "bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      {reward.unlocked ? (
                        reward.icon
                      ) : (
                        <Gift className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <h3
                      className={`text-lg font-bold mb-2 ${reward.unlocked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {reward.title}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${reward.unlocked ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {reward.description}
                    </p>
                    {reward.unlocked ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                        Desbloqueado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-gray-500 dark:text-gray-400 px-3 py-1"
                      >
                        Bloqueado
                      </Badge>
                    )}
                  </div>
                  {reward.unlocked && (
                    <div className="p-4 border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex justify-center">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {reward.id === "1" ? "Ver Badge" : "Resgatar"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Participantes Tab */}
          <TabsContent value="participantes" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Participantes ({participants.length})
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar participante..."
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#29335C]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:border-transparent"
                />
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4"
                >
                  <Avatar className="h-12 w-12 border-2 border-[#FF6B00]/20">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {participant.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full"
                            style={{ width: `${participant.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {participant.progress}%
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Discussões Tab */}
          <TabsContent value="discussoes" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Discussões
              </h3>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                Nova Discussão
              </Button>
            </div>

            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-[#FF6B00]/30"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border-2 border-[#FF6B00]/20">
                      <AvatarImage src={discussion.avatar} />
                      <AvatarFallback>
                        {discussion.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1 hover:text-[#FF6B00] transition-colors">
                        {discussion.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{discussion.author}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(discussion.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                          <span>
                            {discussion.replies}{" "}
                            {discussion.replies === 1
                              ? "resposta"
                              : "respostas"}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            Última atividade:{" "}
                            {new Date(
                              discussion.lastActivity,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
                        >
                          Ver Discussão
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChallengeDetails;
