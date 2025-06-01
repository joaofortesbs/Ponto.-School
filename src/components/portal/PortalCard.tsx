
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Gift,
  Clock,
  Calendar,
  ChevronRight,
  Users,
  Share2,
  Sparkles,
  BarChart3,
  Coins,
  Copy,
  ExternalLink,
  Filter,
  Download,
  Search,
  RefreshCw,
  TrendingUp,
  Zap,
  Award,
  ShoppingBag,
  Repeat,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Brain,
  Target,
  Star,
  Lightbulb,
} from "lucide-react";

interface Activity {
  id: string;
  type: "study" | "achievement" | "interaction" | "creation" | "discovery";
  title: string;
  description: string;
  date: Date;
  status: "completed" | "in_progress" | "upcoming";
  category?: string;
  points?: number;
  duration?: number;
}

interface PortalCardProps {
  totalPoints?: number;
  activities?: Activity[];
  studyStreak?: number;
  completedCourses?: number;
  knowledgeAreas?: number;
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    type: "study",
    title: "Concluído: Física Quântica Avançada",
    description: "Finalização do módulo de mecânica quântica",
    date: new Date(2024, 3, 15),
    status: "completed",
    category: "Curso",
    points: 150,
    duration: 120,
  },
  {
    id: "2",
    type: "achievement",
    title: "Nova Conquista: Mestre em Matemática",
    description: "Completou todos os módulos de cálculo",
    date: new Date(2024, 3, 14),
    status: "completed",
    category: "Conquista",
    points: 200,
  },
  {
    id: "3",
    type: "creation",
    title: "Criação: Resumo de Química Orgânica",
    description: "Gerado resumo inteligente via Epictus IA",
    date: new Date(2024, 3, 12),
    status: "completed",
    category: "Criação",
    points: 100,
  },
  {
    id: "4",
    type: "interaction",
    title: "Participação: Discussão sobre Algoritmos",
    description: "Contribuição ativa no grupo de Ciência da Computação",
    date: new Date(2024, 3, 10),
    status: "completed",
    category: "Interação",
    points: 75,
  },
  {
    id: "5",
    type: "discovery",
    title: "Descoberta: Nova Área de Interesse",
    description: "Exploração de Inteligência Artificial",
    date: new Date(2024, 3, 8),
    status: "completed",
    category: "Descoberta",
    points: 125,
  },
];

const activityIcons = {
  study: <BookOpen className="h-4 w-4 text-blue-500" />,
  achievement: <Award className="h-4 w-4 text-purple-500" />,
  interaction: <Users className="h-4 w-4 text-green-500" />,
  creation: <Lightbulb className="h-4 w-4 text-orange-500" />,
  discovery: <Star className="h-4 w-4 text-yellow-500" />,
};

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-500" />,
  upcoming: <Calendar className="h-4 w-4 text-blue-500" />,
};

const PortalCard = ({
  totalPoints = 2850,
  activities = defaultActivities,
  studyStreak = 15,
  completedCourses = 12,
  knowledgeAreas = 8,
}: PortalCardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showProgress, setShowProgress] = useState(true);
  const [isExploring, setIsExploring] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType ? activity.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const chartData = [
    { month: "Jan", value: 1200 },
    { month: "Fev", value: 1800 },
    { month: "Mar", value: 2400 },
    { month: "Abr", value: 2850 },
  ];

  const maxChartValue = Math.max(...chartData.map((item) => item.value));

  const handleExploreMore = () => {
    setIsExploring(false);
    alert("Iniciando nova jornada de descoberta!");
  };

  return (
    <Card className="w-full bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#29335C]/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#29335C]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#29335C] dark:text-white">
                Portal
              </h3>
              <p className="text-sm text-[#778DA9] dark:text-white/60">
                Seu universo de conhecimento
              </p>
            </div>
          </div>

          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Progresso
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Descobrir
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Conquistas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-0 m-0">
          <div className="p-6 space-y-6">
            {/* Knowledge Progress Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#29335C] to-[#3D4E81] p-6 text-white">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1932&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#29335C]/80 to-[#3D4E81]/80" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-white/70">Pontos de Conhecimento</p>
                    <div className="flex items-center gap-2">
                      {showProgress ? (
                        <h2 className="text-3xl font-bold">
                          {totalPoints.toLocaleString()} PC
                        </h2>
                      ) : (
                        <h2 className="text-3xl font-bold">••••••</h2>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setShowProgress(!showProgress)}
                      >
                        {showProgress ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      onClick={() => setIsExploring(true)}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Explorar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Focar
                    </Button>
                  </div>
                </div>

                {/* Progress Chart */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-white/70">Evolução do Conhecimento</p>
                    <Badge className="bg-white/20 text-white text-xs hover:bg-white/30">
                      Últimos 4 meses
                    </Badge>
                  </div>

                  <div className="flex items-end h-24 gap-1">
                    {chartData.map((item, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-white/20 hover:bg-white/30 rounded-t-sm transition-all duration-300 group relative"
                          style={{
                            height: `${(item.value / maxChartValue) * 100}%`,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#29335C] text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {item.value} PC
                          </div>
                        </div>
                        <span className="text-xs text-white/70">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <div className="floating-icon floating-icon-1">
                    <BookOpen className="h-4 w-4 text-white/30" />
                  </div>
                  <div className="floating-icon floating-icon-2">
                    <Brain className="h-4 w-4 text-white/30" />
                  </div>
                  <div className="floating-icon floating-icon-3">
                    <Star className="h-4 w-4 text-white/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 hover:border-[#29335C] hover:bg-[#29335C]/5 group"
                onClick={() => setActiveTab("discover")}
              >
                <div className="w-10 h-10 rounded-full bg-[#29335C]/10 flex items-center justify-center mb-2 group-hover:bg-[#29335C]/20 transition-colors">
                  <Search className="h-5 w-5 text-[#29335C]" />
                </div>
                <span className="text-sm font-medium">Descobrir Novo</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 hover:border-purple-500 hover:bg-purple-500/5 group"
                onClick={() => setActiveTab("progress")}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-2 group-hover:bg-purple-500/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Ver Progresso</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 hover:border-orange-500 hover:bg-orange-500/5 group"
                onClick={() => setActiveTab("achievements")}
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-2 group-hover:bg-orange-500/20 transition-colors">
                  <Award className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-sm font-medium">Conquistas</span>
              </Button>
            </div>

            {/* Recent Activities */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                  Atividades Recentes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#29335C] dark:text-white/70 hover:text-[#29335C] dark:hover:text-white"
                  onClick={() => setActiveTab("progress")}
                >
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {activities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#E0E1DD]/30 dark:hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#29335C]/10 to-[#3D4E81]/10">
                        {activityIcons[activity.type]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#29335C] dark:text-white group-hover:text-[#29335C]/80 dark:group-hover:text-white/80 transition-colors">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#778DA9] dark:text-white/60">
                            {activity.date.toLocaleDateString()}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 border-[#778DA9]/30 text-[#778DA9] dark:border-white/20 dark:text-white/60"
                          >
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {activity.points && (
                      <div className="text-sm font-medium text-[#29335C] dark:text-white">
                        +{activity.points} PC
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Explore Dialog */}
          {isExploring && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#0A2540] rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-[#29335C] dark:text-white mb-4">
                  Explorar Novo Conhecimento
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {["Matemática", "Física", "Química", "Biologia", "História", "Literatura", "Programação", "Idiomas"].map((area) => (
                      <Button
                        key={area}
                        type="button"
                        variant="outline"
                        className="h-12 text-sm font-medium hover:border-[#29335C] hover:text-[#29335C]"
                        onClick={() => alert(`Explorando ${area}...`)}
                      >
                        {area}
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setIsExploring(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-[#29335C] hover:bg-[#29335C]/90 text-white"
                      onClick={handleExploreMore}
                    >
                      Explorar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="p-0 m-0">
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-[#29335C] dark:text-white" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Cursos Concluídos
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {completedCourses}
                </div>
              </div>

              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Sequência de Estudos
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {studyStreak} dias
                </div>
              </div>

              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Áreas de Conhecimento
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {knowledgeAreas}
                </div>
              </div>
            </div>

            {/* Progress Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                Progresso Detalhado
              </h3>
              
              {[
                { subject: "Matemática", progress: 85, color: "bg-blue-500" },
                { subject: "Física", progress: 72, color: "bg-green-500" },
                { subject: "Química", progress: 90, color: "bg-purple-500" },
                { subject: "Programação", progress: 65, color: "bg-orange-500" },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#29335C] dark:text-white">
                      {item.subject}
                    </span>
                    <span className="text-sm text-[#778DA9] dark:text-white/60">
                      {item.progress}%
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="p-0 m-0">
          <div className="p-6 space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#29335C]/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-[#29335C] dark:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
                Descobrir Novo Conhecimento
              </h3>
              <p className="text-[#778DA9] dark:text-white/60 mb-6">
                Explore novas áreas e expanda seus horizontes
              </p>
              <Button
                className="bg-[#29335C] hover:bg-[#29335C]/90 text-white"
                onClick={() => setIsExploring(true)}
              >
                Começar Exploração
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="p-0 m-0">
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              {[
                { title: "Primeiro Passo", description: "Completou o primeiro curso", earned: true },
                { title: "Dedicado", description: "7 dias consecutivos de estudo", earned: true },
                { title: "Explorador", description: "Descobriu 5 áreas diferentes", earned: true },
                { title: "Mestre", description: "Completou 10 cursos", earned: false },
              ].map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    achievement.earned ? "bg-[#29335C]/5" : "bg-gray-100/50 dark:bg-white/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.earned ? "bg-[#FFD700]/20" : "bg-gray-300/50"
                  }`}>
                    <Award className={`h-5 w-5 ${
                      achievement.earned ? "text-[#FFD700]" : "text-gray-400"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#29335C] dark:text-white">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-[#778DA9] dark:text-white/60">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        .floating-icon {
          position: absolute;
          animation: float 6s ease-in-out infinite;
        }
        
        .floating-icon-1 {
          top: 20%;
          right: 15%;
          animation-delay: 0s;
        }
        
        .floating-icon-2 {
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }
        
        .floating-icon-3 {
          top: 40%;
          right: 20%;
          animation-delay: 4s;
        }
      `}</style>
    </Card>
  );
};

export default PortalCard;
