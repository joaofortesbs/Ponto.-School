
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Award, 
  Clock, 
  Zap, 
  BookOpen, 
  Users, 
  Target, 
  Gift,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  Calendar,
  Share2,
  X,
  Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Tipos e interfaces
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rewards: {
    pontoCoins: number;
    xp: number;
    badge?: string;
    physical?: string;
  };
  criteria: string[];
}

interface UserStats {
  totalXP: number;
  nextLevelXP: number;
  currentLevel: string;
  totalPontoCoins: number;
  unlockedBadges: number;
  focusStreak: number;
  rankingPosition: number;
}

export default function ConquistasPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'rewards' | 'ranking'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  // Dados mockados do usuário
  const userStats: UserStats = {
    totalXP: 2847,
    nextLevelXP: 3000,
    currentLevel: "Explorador Avançado",
    totalPontoCoins: 1250,
    unlockedBadges: 12,
    focusStreak: 7,
    rankingPosition: 1847
  };

  // Dados mockados de conquistas
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Primeiros Passos',
      description: 'Complete seu primeiro login na plataforma',
      category: 'Embarque',
      level: 'bronze',
      icon: <Star className="h-6 w-6" />,
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-15'),
      rewards: { pontoCoins: 50, xp: 100 },
      criteria: ['Fazer primeiro login', 'Completar perfil básico']
    },
    {
      id: '2',
      name: 'Sequência de Foco',
      description: 'Mantenha uma sequência de 7 dias consecutivos de estudo',
      category: 'Dedicação',
      level: 'gold',
      icon: <Flame className="h-6 w-6" />,
      progress: 7,
      maxProgress: 7,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-20'),
      rewards: { pontoCoins: 200, xp: 500, badge: 'Chama Dourada' },
      criteria: ['7 dias consecutivos', 'Mínimo 30min por dia', 'Sem faltas']
    },
    {
      id: '3',
      name: 'Mestre dos Resumos',
      description: 'Crie 50 resumos usando o Epictus IA',
      category: 'Inovador IA',
      level: 'silver',
      icon: <BookOpen className="h-6 w-6" />,
      progress: 32,
      maxProgress: 50,
      isUnlocked: false,
      rewards: { pontoCoins: 150, xp: 300, badge: 'Resumista Expert' },
      criteria: ['50 resumos criados', 'Uso da IA', 'Qualidade aprovada']
    },
    {
      id: '4',
      name: 'Navegador Curioso',
      description: 'Explore todas as seções da plataforma',
      category: 'Explorador',
      level: 'bronze',
      icon: <Target className="h-6 w-6" />,
      progress: 8,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 75, xp: 150 },
      criteria: ['Visitar 10 seções', 'Interagir com ferramentas', 'Completar tour']
    },
    {
      id: '5',
      name: 'Polímata da Ponto School',
      description: 'Domine todas as disciplinas e ferramentas da plataforma',
      category: 'Lendário',
      level: 'legendary',
      icon: <Crown className="h-6 w-6" />,
      progress: 3,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 1000, xp: 2000, badge: 'Mestre Supremo', physical: 'Troféu Premium' },
      criteria: ['Dominar 10 disciplinas', 'Usar todas as ferramentas IA', 'Manter média 95%+']
    }
  ];

  const categories = ['all', 'Embarque', 'Explorador', 'Dedicação', 'Conhecimento', 'Colaborador', 'Inovador IA', 'Colecionador', 'Lendário'];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'diamond': return 'from-blue-400 to-blue-600';
      case 'legendary': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getLevelBorder = (level: string) => {
    switch (level) {
      case 'bronze': return 'border-amber-500';
      case 'silver': return 'border-gray-400';
      case 'gold': return 'border-yellow-400';
      case 'diamond': return 'border-blue-400';
      case 'legendary': return 'border-purple-500';
      default: return 'border-gray-400';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'unlocked' && achievement.isUnlocked) ||
                         (selectedStatus === 'pending' && !achievement.isUnlocked);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const nearlyUnlocked = achievements
    .filter(a => !a.isUnlocked && a.progress / a.maxProgress >= 0.7)
    .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))
    .slice(0, 3);

  const recentlyUnlocked = achievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  // Componente Card de Conquista
  const AchievementCard = ({ achievement, variant = 'default' }: { achievement: Achievement, variant?: 'default' | 'compact' }) => (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
        ${achievement.isUnlocked 
          ? `bg-gradient-to-br ${getLevelColor(achievement.level)} shadow-xl border-2 ${getLevelBorder(achievement.level)}` 
          : 'bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl'
        }
        ${variant === 'compact' ? 'p-4' : 'p-6'}
      `}
      onClick={() => setSelectedAchievement(achievement)}
    >
      {/* Efeito de brilho para conquistas desbloqueadas */}
      {achievement.isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse" />
      )}
      
      {/* Badge de nível */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
        achievement.isUnlocked ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
      </div>

      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div className={`
          flex-shrink-0 p-3 rounded-full
          ${achievement.isUnlocked 
            ? 'bg-white/20 text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }
        `}>
          {achievement.icon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg mb-2 ${
            achievement.isUnlocked ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}>
            {achievement.name}
          </h3>
          
          <p className={`text-sm mb-3 line-clamp-2 ${
            achievement.isUnlocked ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'
          }`}>
            {achievement.description}
          </p>

          {/* Recompensas */}
          <div className="flex items-center gap-2 mb-3">
            {achievement.rewards.pontoCoins > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                +{achievement.rewards.pontoCoins} PC
              </Badge>
            )}
            {achievement.rewards.xp > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                +{achievement.rewards.xp} XP
              </Badge>
            )}
            {achievement.rewards.badge && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                <Award className="h-3 w-3 mr-1" />
                Badge
              </Badge>
            )}
          </div>

          {/* Barra de progresso para conquistas não desbloqueadas */}
          {!achievement.isUnlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Progresso</span>
                <span className="font-medium text-orange-600">{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <Progress 
                value={(achievement.progress / achievement.maxProgress) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Data de desbloqueio */}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="h-4 w-4" />
              Desbloqueada em {achievement.unlockedAt.toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-[#29335C] dark:text-white">
            Minhas Conquistas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sua jornada de evolução na Ponto School
          </p>
        </motion.div>

        {/* Card de Resumo do Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar e Nível */}
            <div className="flex items-center gap-4">
              <div className={`relative w-20 h-20 rounded-full border-4 ${getLevelBorder('gold')} overflow-hidden`}>
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">U</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Crown className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                  João Marcelo
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {userStats.currentLevel}
                </p>
              </div>
            </div>

            {/* Barra de Progresso XP */}
            <div className="flex-1 max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Progresso para próximo nível</span>
                <span className="font-medium text-orange-600">
                  {userStats.totalXP} / {userStats.nextLevelXP} XP
                </span>
              </div>
              <Progress 
                value={(userStats.totalXP / userStats.nextLevelXP) * 100} 
                className="h-3"
              />
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Gift className="h-5 w-5 text-orange-500 mr-1" />
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {userStats.totalPontoCoins}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">PC</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {userStats.unlockedBadges}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Badges</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="h-5 w-5 text-red-500 mr-1" />
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {userStats.focusStreak}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Dias 🔥</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  #{userStats.rankingPosition}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Ranking</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Abas de Navegação */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-b border-gray-200 dark:border-gray-700"
        >
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: <Star className="h-4 w-4" /> },
              { id: 'all', label: 'Todas as Conquistas', icon: <Trophy className="h-4 w-4" /> },
              { id: 'rewards', label: 'Minhas Recompensas', icon: <Gift className="h-4 w-4" /> },
              { id: 'ranking', label: 'Ranking', icon: <Medal className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-all
                  ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Conteúdo das Abas */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quase Lá */}
              <div>
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-6 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-orange-500" />
                  Quase Lá! Próximas a Desbloquear
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearlyUnlocked.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>

              {/* Últimas Medalhas */}
              <div>
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  Suas Últimas Medalhas de Honra
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentlyUnlocked.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filtros e Busca */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conquistas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'Todas as Categorias' : category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="unlocked">Desbloqueadas</option>
                      <option value="pending">Pendentes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de Conquistas */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">
                    Nenhuma conquista encontrada
                  </h3>
                  <p className="text-gray-400">
                    Tente ajustar seus filtros ou termo de busca
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  Seção em Desenvolvimento
                </h3>
                <p className="text-gray-400">
                  Suas recompensas aparecerão aqui em breve
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <Medal className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  Ranking em Desenvolvimento
                </h3>
                <p className="text-gray-400">
                  O ranking de conquistas estará disponível em breve
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes da Conquista */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-2xl">
            {selectedAchievement && (
              <div className="p-6">
                <div className="flex items-start gap-6 mb-6">
                  <div className={`
                    p-4 rounded-full bg-gradient-to-br ${getLevelColor(selectedAchievement.level)}
                    text-white shadow-lg
                  `}>
                    {selectedAchievement.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-2">
                      {selectedAchievement.name}
                    </h2>
                    <Badge className={`mb-3 bg-gradient-to-r ${getLevelColor(selectedAchievement.level)} text-white`}>
                      {selectedAchievement.level.charAt(0).toUpperCase() + selectedAchievement.level.slice(1)}
                    </Badge>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {selectedAchievement.description}
                    </p>
                  </div>
                </div>

                {/* Critérios */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
                    Critérios para Desbloqueio:
                  </h3>
                  <ul className="space-y-2">
                    {selectedAchievement.criteria.map((criterion, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recompensas */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
                    Recompensas:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedAchievement.rewards.pontoCoins > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-lg p-2">
                        <Gift className="h-4 w-4 mr-2" />
                        +{selectedAchievement.rewards.pontoCoins} Ponto Coins
                      </Badge>
                    )}
                    {selectedAchievement.rewards.xp > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-lg p-2">
                        <Star className="h-4 w-4 mr-2" />
                        +{selectedAchievement.rewards.xp} XP
                      </Badge>
                    )}
                    {selectedAchievement.rewards.badge && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-lg p-2">
                        <Award className="h-4 w-4 mr-2" />
                        {selectedAchievement.rewards.badge}
                      </Badge>
                    )}
                    {selectedAchievement.rewards.physical && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-lg p-2">
                        <Trophy className="h-4 w-4 mr-2" />
                        {selectedAchievement.rewards.physical}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progresso ou Data de Desbloqueio */}
                {!selectedAchievement.isUnlocked ? (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
                      Seu Progresso:
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Progresso Atual</span>
                        <span className="font-medium text-orange-600">
                          {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                        className="h-3"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
                      Desbloqueada em:
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Calendar className="h-5 w-5" />
                      {selectedAchievement.unlockedAt?.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3">
                  {selectedAchievement.isUnlocked && (
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar Conquista
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAchievement(null)}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
