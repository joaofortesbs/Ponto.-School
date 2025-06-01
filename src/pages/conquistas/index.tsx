
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Medal, Award, Crown, Zap, Target, Calendar, Search, Filter, Gift, Coins, Share2, X, Check, Clock, Package, Truck, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data para demonstração
const mockUserData = {
  name: "João Silva",
  level: 15,
  title: "Mestre dos Estudos",
  currentXP: 2150,
  nextLevelXP: 3000,
  totalPoints: 45780,
  badges: 23,
  streak: 12,
  avatar: "/api/placeholder/80/80"
};

const mockAchievements = [
  {
    id: 1,
    name: "Primeira Vitória",
    description: "Complete sua primeira aula na plataforma",
    icon: "🎯",
    reward: "100 Ponto Coins",
    currentProgress: 1,
    totalProgress: 1,
    status: "desbloqueada",
    level: "Bronze",
    dateUnlocked: "2024-01-15",
    category: "Primeiros Passos"
  },
  {
    id: 2,
    name: "Estudante Dedicado",
    description: "Estude por 7 dias consecutivos",
    icon: "🔥",
    reward: "200 Ponto Coins + Badge Dedicação",
    currentProgress: 5,
    totalProgress: 7,
    status: "pendente",
    level: "Prata",
    category: "Consistência"
  },
  {
    id: 3,
    name: "Explorador do Conhecimento",
    description: "Complete aulas em 5 disciplinas diferentes",
    icon: "🧭",
    reward: "300 Ponto Coins + Acesso Premium 7 dias",
    currentProgress: 3,
    totalProgress: 5,
    status: "pendente",
    level: "Ouro",
    category: "Exploração"
  },
  {
    id: 4,
    name: "Mestre da Matemática",
    description: "Complete 50 exercícios de matemática",
    icon: "📐",
    reward: "500 Ponto Coins + Badge Matemático",
    currentProgress: 50,
    totalProgress: 50,
    status: "desbloqueada",
    level: "Ouro",
    dateUnlocked: "2024-02-20",
    category: "Disciplinas"
  },
  {
    id: 5,
    name: "Lenda da Plataforma",
    description: "Alcance o nível 50 e complete 1000 aulas",
    icon: "👑",
    reward: "Certificado Físico + Placa de Reconhecimento",
    currentProgress: 287,
    totalProgress: 1000,
    status: "pendente",
    level: "Lendário",
    category: "Marcos"
  }
];

const mockRewards = [
  {
    id: 1,
    name: "100 Ponto Coins",
    type: "digital",
    dateReceived: "2024-01-15",
    status: "usado",
    icon: "💰"
  },
  {
    id: 2,
    name: "Badge Dedicação",
    type: "digital",
    dateReceived: "2024-02-10",
    status: "ativo",
    icon: "🏆"
  },
  {
    id: 3,
    name: "Placa de Reconhecimento",
    type: "fisica",
    dateReceived: "2024-03-01",
    status: "enviado",
    trackingCode: "BR123456789",
    icon: "🏅"
  }
];

// Componente do Card de Resumo do Perfil
const ProfileSummaryCard = ({ userData }: { userData: any }) => {
  const progressPercentage = (userData.currentXP / userData.nextLevelXP) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
    >
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[#FFD700] overflow-hidden">
            <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#FFD700] rounded-full p-1">
            <Crown className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Info do Usuário */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-1">{userData.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">Nível {userData.level} - {userData.title}</p>
          
          {/* Barra de Progresso XP */}
          <div className="relative mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFD700] relative"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {userData.currentXP} / {userData.nextLevelXP} XP
            </p>
          </div>

          {/* Métricas */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-sm font-medium">Pontuação Total: {userData.totalPoints.toLocaleString()} PC</span>
            </div>
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-sm font-medium">Badges: {userData.badges}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-sm font-medium">Sequência de Foco: {userData.streak} Dias 🔥</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente do Card de Conquista
const AchievementCard = ({ achievement, onClick }: { achievement: any; onClick: () => void }) => {
  const isUnlocked = achievement.status === "desbloqueada";
  const progressPercentage = (achievement.currentProgress / achievement.totalProgress) * 100;

  const levelColors = {
    Bronze: "from-[#CD7F32] to-[#B87333]",
    Prata: "from-[#C0C0C0] to-[#A8A8A8]",
    Ouro: "from-[#FFD700] to-[#FFA500]",
    Diamante: "from-[#B9F2FF] to-[#87CEEB]",
    Lendário: "from-[#9333EA] to-[#FFD700]"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300
        ${isUnlocked 
          ? `bg-gradient-to-br ${levelColors[achievement.level as keyof typeof levelColors]} shadow-lg` 
          : "bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-lg"
        }
      `}
    >
      {/* Efeito de brilho para conquistas desbloqueadas */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      )}

      <div className="relative z-10">
        {/* Ícone */}
        <div className={`text-4xl mb-3 ${isUnlocked ? "filter-none" : "grayscale opacity-60"}`}>
          {achievement.icon}
        </div>

        {/* Informações */}
        <h3 className={`font-bold text-lg mb-2 ${isUnlocked ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
          {achievement.name}
        </h3>
        
        <p className={`text-sm mb-3 ${isUnlocked ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
          {achievement.description}
        </p>

        {/* Progresso */}
        {!isUnlocked && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progresso</span>
              <span className="text-gray-600 dark:text-gray-400">
                {achievement.currentProgress}/{achievement.totalProgress}
              </span>
            </div>
            <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-[#FF6B00] rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Recompensa */}
        <div className={`text-sm font-medium ${isUnlocked ? "text-white" : "text-[#FF6B00]"}`}>
          🎁 {achievement.reward}
        </div>

        {/* Data de desbloqueio */}
        {isUnlocked && achievement.dateUnlocked && (
          <div className="text-xs text-white/80 mt-2">
            Desbloqueado em {new Date(achievement.dateUnlocked).toLocaleDateString('pt-BR')}
          </div>
        )}

        {/* Badge do nível */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={`${isUnlocked ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {achievement.level}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

// Componente do Card de Recompensa
const RewardCard = ({ reward }: { reward: any }) => {
  const handleTrackingClick = () => {
    window.open(`https://rastreamento.correios.com.br/app/index.php?codigo=${reward.trackingCode}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl">{reward.icon}</div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
            {reward.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Recebido em {new Date(reward.dateReceived).toLocaleDateString('pt-BR')}
          </p>
          
          {reward.type === "fisica" && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              <span className="capitalize">{reward.status}</span>
              {reward.trackingCode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTrackingClick}
                  className="text-[#FF6B00] hover:text-[#FF6B00]/80 p-0 h-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {reward.trackingCode}
                </Button>
              )}
            </div>
          )}
          
          {reward.type === "digital" && reward.status !== "usado" && (
            <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/80">
              Usar Agora
            </Button>
          )}
        </div>

        <Badge 
          variant={reward.status === "ativo" ? "default" : "secondary"}
          className={reward.status === "ativo" ? "bg-green-500" : ""}
        >
          {reward.status}
        </Badge>
      </div>
    </motion.div>
  );
};

// Modal de Detalhes da Conquista
const AchievementModal = ({ achievement, isOpen, onClose }: { achievement: any; isOpen: boolean; onClose: () => void }) => {
  if (!achievement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl">{achievement.icon}</span>
            {achievement.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Descrição</h4>
            <p className="text-gray-600 dark:text-gray-400">{achievement.description}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Recompensa</h4>
            <p className="text-[#FF6B00] font-medium">{achievement.reward}</p>
          </div>
          
          {achievement.status === "pendente" && (
            <div>
              <h4 className="font-semibold mb-2">Progresso</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso atual</span>
                  <span>{achievement.currentProgress}/{achievement.totalProgress}</span>
                </div>
                <Progress value={(achievement.currentProgress / achievement.totalProgress) * 100} />
              </div>
            </div>
          )}
          
          {achievement.dateUnlocked && (
            <div>
              <h4 className="font-semibold mb-2">Data de Desbloqueio</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(achievement.dateUnlocked).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button onClick={onClose} className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/80">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Modal de Celebração
const RewardNotificationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6"
        >
          <div className="text-6xl animate-bounce">🏆</div>
          <h2 className="text-3xl font-bold text-[#FF6B00]">CONQUISTA DESBLOQUEADA!</h2>
          <h3 className="text-xl font-semibold">Estudante Dedicado</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Você ganhou: 200 Ponto Coins + Badge Dedicação
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continuar
            </Button>
            <Button className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/80">
              Ver Minhas Conquistas
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default function ConquistasPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rewardTypeFilter, setRewardTypeFilter] = useState("all");

  // Filtros para conquistas
  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || achievement.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || achievement.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtros para recompensas
  const filteredRewards = mockRewards.filter(reward => {
    return rewardTypeFilter === "all" || reward.type === rewardTypeFilter;
  });

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  // Conquistas quase desbloqueadas (progresso > 50%)
  const nearlyUnlockedAchievements = mockAchievements
    .filter(a => a.status === "pendente" && (a.currentProgress / a.totalProgress) > 0.5)
    .slice(0, 3);

  // Últimas conquistas desbloqueadas
  const recentAchievements = mockAchievements
    .filter(a => a.status === "desbloqueada")
    .slice(0, 3);

  return (
    <div className="w-full h-full bg-[#001427] dark:bg-[#001427] transition-colors duration-300 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Minhas Conquistas</h1>
          <p className="text-gray-300 text-lg">Sua jornada de evolução na Ponto. School</p>
        </motion.div>

        {/* Card de Resumo do Perfil */}
        <ProfileSummaryCard userData={mockUserData} />

        {/* Navegação por Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/10 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-[#29335C] text-white"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:text-[#29335C] text-white"
            >
              Todas as Conquistas
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="data-[state=active]:bg-white data-[state=active]:text-[#29335C] text-white"
            >
              Minhas Recompensas
            </TabsTrigger>
            <TabsTrigger 
              value="ranking" 
              className="data-[state=active]:bg-white data-[state=active]:text-[#29335C] text-white"
            >
              Ranking
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo da Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-8">
            {/* Seção: Quase Lá! */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-[#FF6B00]" />
                Quase Lá! Próximas a Desbloquear
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearlyUnlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => handleAchievementClick(achievement)}
                  />
                ))}
              </div>
            </div>

            {/* Seção: Últimas Medalhas */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Medal className="h-6 w-6 text-[#FF6B00]" />
                Suas Últimas Medalhas de Honra
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => handleAchievementClick(achievement)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Conteúdo da Aba: Todas as Conquistas */}
          <TabsContent value="all" className="space-y-6">
            {/* Painel de Filtros */}
            <div className="bg-white/10 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conquistas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-gray-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-white text-sm mb-2 block">Categoria</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-white/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Primeiros Passos">Primeiros Passos</SelectItem>
                      <SelectItem value="Consistência">Consistência</SelectItem>
                      <SelectItem value="Exploração">Exploração</SelectItem>
                      <SelectItem value="Disciplinas">Disciplinas</SelectItem>
                      <SelectItem value="Marcos">Marcos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-white text-sm mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="desbloqueada">Desbloqueadas</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de Conquistas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Conteúdo da Aba: Minhas Recompensas */}
          <TabsContent value="rewards" className="space-y-6">
            {/* Filtro de Tipo */}
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <label className="text-white text-sm">Tipo de Recompensa:</label>
                <Select value={rewardTypeFilter} onValueChange={setRewardTypeFilter}>
                  <SelectTrigger className="w-48 bg-white/20 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="digital">Digitais</SelectItem>
                    <SelectItem value="fisica">Físicas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Recompensas */}
            <div className="space-y-4">
              {filteredRewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </TabsContent>

          {/* Conteúdo da Aba: Ranking */}
          <TabsContent value="ranking" className="space-y-6">
            <div className="bg-white/10 rounded-xl p-8 text-center">
              <Trophy className="h-16 w-16 text-[#FF6B00] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Ranking em Desenvolvimento</h3>
              <p className="text-gray-300">
                Estamos preparando um sistema de ranking incrível para você competir com outros estudantes!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
      />

      <RewardNotificationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
      />
    </div>
  );
}
