
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
  Play,
  Lock,
  CheckCircle,
  ArrowRight,
  Gem,
  Hexagon,
  Shield,
  Swords
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
  rarity: 'comum' | 'raro' | 'épico' | 'lendário';
}

interface UserStats {
  totalXP: number;
  nextLevelXP: number;
  currentLevel: string;
  totalPontoCoins: number;
  unlockedBadges: number;
  focusStreak: number;
  rankingPosition: number;
  completionRate: number;
  nextRankTitle: string;
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
    rankingPosition: 1847,
    completionRate: 68,
    nextRankTitle: "Mestre Acadêmico"
  };

  // Dados mockados de conquistas
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Primeiros Passos na Jornada',
      description: 'Complete seu primeiro login e configure seu perfil na plataforma',
      category: 'Embarque',
      level: 'bronze',
      icon: <Star className="h-6 w-6" />,
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-15'),
      rewards: { pontoCoins: 50, xp: 100 },
      criteria: ['Fazer primeiro login', 'Completar perfil básico'],
      rarity: 'comum'
    },
    {
      id: '2',
      name: 'Chama da Dedicação',
      description: 'Mantenha uma sequência épica de 7 dias consecutivos de estudo focado',
      category: 'Dedicação',
      level: 'gold',
      icon: <Flame className="h-6 w-6" />,
      progress: 7,
      maxProgress: 7,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-20'),
      rewards: { pontoCoins: 200, xp: 500, badge: 'Chama Dourada' },
      criteria: ['7 dias consecutivos', 'Mínimo 30min por dia', 'Sem faltas'],
      rarity: 'épico'
    },
    {
      id: '3',
      name: 'Arquiteto do Conhecimento',
      description: 'Domine a arte de criar resumos inteligentes usando o Epictus IA',
      category: 'Inovador IA',
      level: 'silver',
      icon: <BookOpen className="h-6 w-6" />,
      progress: 32,
      maxProgress: 50,
      isUnlocked: false,
      rewards: { pontoCoins: 150, xp: 300, badge: 'Resumista Expert' },
      criteria: ['50 resumos criados', 'Uso da IA', 'Qualidade aprovada'],
      rarity: 'raro'
    },
    {
      id: '4',
      name: 'Desbravador Digital',
      description: 'Explore cada canto da plataforma e descubra todos os recursos disponíveis',
      category: 'Explorador',
      level: 'bronze',
      icon: <Target className="h-6 w-6" />,
      progress: 8,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 75, xp: 150 },
      criteria: ['Visitar 10 seções', 'Interagir com ferramentas', 'Completar tour'],
      rarity: 'comum'
    },
    {
      id: '5',
      name: 'Imperador do Saber',
      description: 'Alcance a maestria suprema dominando todas as disciplinas e ferramentas',
      category: 'Lendário',
      level: 'legendary',
      icon: <Crown className="h-6 w-6" />,
      progress: 3,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 1000, xp: 2000, badge: 'Mestre Supremo', physical: 'Troféu Premium' },
      criteria: ['Dominar 10 disciplinas', 'Usar todas as ferramentas IA', 'Manter média 95%+'],
      rarity: 'lendário'
    }
  ];

  const categories = ['all', 'Embarque', 'Explorador', 'Dedicação', 'Conhecimento', 'Colaborador', 'Inovador IA', 'Colecionador', 'Lendário'];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'from-amber-500 via-amber-600 to-amber-700';
      case 'silver': return 'from-slate-400 via-slate-500 to-slate-600';
      case 'gold': return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 'diamond': return 'from-cyan-400 via-blue-500 to-indigo-600';
      case 'legendary': return 'from-purple-500 via-pink-500 to-red-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'comum': return 'from-gray-400 to-gray-600';
      case 'raro': return 'from-blue-400 to-blue-600';
      case 'épico': return 'from-purple-400 to-purple-600';
      case 'lendário': return 'from-orange-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'comum': return <Shield className="h-4 w-4" />;
      case 'raro': return <Gem className="h-4 w-4" />;
      case 'épico': return <Hexagon className="h-4 w-4" />;
      case 'lendário': return <Swords className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
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

  // Componente Card de Conquista Ultra Moderno
  const AchievementCard = ({ achievement, variant = 'default' }: { achievement: Achievement, variant?: 'default' | 'compact' | 'premium' }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500
        ${achievement.isUnlocked 
          ? `bg-gradient-to-br ${getLevelColor(achievement.level)} shadow-2xl shadow-black/20 border-2 border-white/30` 
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-orange-500/30'
        }
        ${variant === 'compact' ? 'p-5' : variant === 'premium' ? 'p-8' : 'p-6'}
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent 
        before:-translate-x-full before:transition-transform before:duration-700 hover:before:translate-x-full
      `}
      onClick={() => setSelectedAchievement(achievement)}
    >
      {/* Efeito de partículas flutuantes para conquistas desbloqueadas */}
      {achievement.isUnlocked && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-bounce"></div>
          <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping"></div>
        </div>
      )}
      
      {/* Badge de raridade superior */}
      <div className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
        achievement.isUnlocked 
          ? 'bg-white/20 text-white border border-white/30' 
          : `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white border border-white/20`
      }`}>
        {getRarityIcon(achievement.rarity)}
        <span className="capitalize">{achievement.rarity}</span>
      </div>

      {/* Status de bloqueio */}
      {!achievement.isUnlocked && (
        <div className="absolute top-3 left-3 p-2 rounded-full bg-gray-100 dark:bg-gray-800 border">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Check de conquista desbloqueada */}
      {achievement.isUnlocked && (
        <div className="absolute top-3 left-3 p-2 rounded-full bg-green-500/20 border border-green-400/30">
          <CheckCircle className="h-4 w-4 text-green-400" />
        </div>
      )}

      <div className="flex items-start gap-5 relative z-10">
        {/* Ícone principal com efeito halo */}
        <div className={`
          relative flex-shrink-0 p-4 rounded-2xl transition-all duration-300
          ${achievement.isUnlocked 
            ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
            : 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-600 dark:text-orange-400 group-hover:scale-110'
          }
        `}>
          {achievement.isUnlocked && (
            <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
          )}
          <div className="relative z-10">
            {achievement.icon}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold text-xl mb-1 ${
              achievement.isUnlocked ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {achievement.name}
            </h3>
          </div>
          
          <p className={`text-sm mb-4 leading-relaxed ${
            achievement.isUnlocked ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
          }`}>
            {achievement.description}
          </p>

          {/* Seção de recompensas com design premium */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {achievement.rewards.pontoCoins > 0 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Gift className="h-3 w-3 mr-1" />
                +{achievement.rewards.pontoCoins} PC
              </Badge>
            )}
            {achievement.rewards.xp > 0 && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Star className="h-3 w-3 mr-1" />
                +{achievement.rewards.xp} XP
              </Badge>
            )}
            {achievement.rewards.badge && (
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Award className="h-3 w-3 mr-1" />
                Badge
              </Badge>
            )}
            {achievement.rewards.physical && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Trophy className="h-3 w-3 mr-1" />
                Físico
              </Badge>
            )}
          </div>

          {/* Barra de progresso moderna para conquistas não desbloqueadas */}
          {!achievement.isUnlocked && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progresso</span>
                <span className="text-sm font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-3 bg-gray-200 dark:bg-gray-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((achievement.progress / achievement.maxProgress) * 100)}% concluído
              </div>
            </div>
          )}

          {/* Data de desbloqueio com estilo refinado */}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Calendar className="h-4 w-4" />
              <span>Conquistada em {achievement.unlockedAt.toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Seta de ação */}
        <div className={`flex-shrink-0 transition-all duration-300 ${
          achievement.isUnlocked ? 'text-white/60' : 'text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1'
        }`}>
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-all duration-700">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Cabeçalho Ultra Moderno */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Centro de Conquistas
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-medium mt-2">
                  Sua jornada épica de evolução e maestria acadêmica
                </p>
              </div>
            </div>
            
            {/* Estatísticas destacadas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">{achievements.filter(a => a.isUnlocked).length}</div>
                <div className="text-sm opacity-90">Conquistas</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">{userStats.totalXP}</div>
                <div className="text-sm opacity-90">XP Total</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">{userStats.completionRate}%</div>
                <div className="text-sm opacity-90">Conclusão</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">#{userStats.rankingPosition}</div>
                <div className="text-sm opacity-90">Ranking</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card de Resumo do Perfil Ultra Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl border border-white/20 dark:border-gray-700/30 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-purple-500/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Avatar e Nível Premium */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl border-4 border-white/30">
                    <span className="text-3xl font-bold text-white">J</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-2 shadow-lg border-2 border-white">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    João Marcelo
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                    {userStats.currentLevel}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4" />
                    Próximo: {userStats.nextRankTitle}
                  </div>
                </div>
              </div>

              {/* Barra de Progresso XP Premium */}
              <div className="flex-1 max-w-md space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Evolução para próximo nível</span>
                  <span className="font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                    {userStats.totalXP} / {userStats.nextLevelXP} XP
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={(userStats.totalXP / userStats.nextLevelXP) * 100} 
                    className="h-4 bg-gray-200 dark:bg-gray-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((userStats.totalXP / userStats.nextLevelXP) * 100)}% para evolução
                </div>
              </div>

              {/* Métricas Premium Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 mb-2 shadow-lg group-hover:shadow-xl transition-all">
                    <Gift className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.totalPontoCoins}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Ponto Coins</div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 mb-2 shadow-lg group-hover:shadow-xl transition-all">
                    <Trophy className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.unlockedBadges}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Badges</div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 mb-2 shadow-lg group-hover:shadow-xl transition-all">
                    <Flame className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.focusStreak}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Sequência</div>
                </div>

                <div className="text-center group">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 mb-2 shadow-lg group-hover:shadow-xl transition-all">
                    <TrendingUp className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    #{userStats.rankingPosition}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Ranking</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Abas de Navegação Premium */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
        >
          <nav className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Visão Geral', icon: <Sparkles className="h-5 w-5" /> },
              { id: 'all', label: 'Todas as Conquistas', icon: <Trophy className="h-5 w-5" /> },
              { id: 'rewards', label: 'Recompensas', icon: <Gift className="h-5 w-5" /> },
              { id: 'ranking', label: 'Hall da Fama', icon: <Medal className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-3 py-6 px-8 font-semibold text-sm transition-all duration-300 whitespace-nowrap relative
                  ${activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-orange-500 to-purple-600 shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl -z-10"
                  />
                )}
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      🚀 Quase Conquistadas
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Continue assim! Estas conquistas estão ao seu alcance
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearlyUnlocked.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} variant="premium" />
                  ))}
                </div>
              </div>

              {/* Últimas Medalhas */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      ⭐ Últimas Conquistas
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Suas vitórias mais recentes na jornada do conhecimento
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentlyUnlocked.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} variant="premium" />
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
              {/* Filtros e Busca Premium */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar conquistas épicas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm"
                    />
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-12 px-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg"
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
                      className="h-12 px-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg"
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
                  <AchievementCard key={achievement.id} achievement={achievement} variant="premium" />
                ))}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-block mb-4">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Nenhuma conquista encontrada
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
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
              <div className="text-center py-16">
                <div className="p-6 bg-gradient-to-br from-orange-100 to-purple-100 dark:from-orange-900/30 dark:to-purple-900/30 rounded-3xl inline-block mb-6">
                  <Gift className="h-20 w-20 text-orange-500 mx-auto" />
                </div>
                <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
                  Centro de Recompensas
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Suas recompensas exclusivas aparecerão aqui em breve
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
              <div className="text-center py-16">
                <div className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-3xl inline-block mb-6">
                  <Medal className="h-20 w-20 text-yellow-500 mx-auto" />
                </div>
                <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
                  Hall da Fama
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  O ranking épico de conquistas estará disponível em breve
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes da Conquista Premium */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl">
            {selectedAchievement && (
              <div className="p-8">
                <div className="flex items-start gap-8 mb-8">
                  <div className={`
                    p-6 rounded-3xl bg-gradient-to-br ${getLevelColor(selectedAchievement.level)}
                    text-white shadow-2xl border-4 border-white/30
                  `}>
                    {selectedAchievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedAchievement.name}
                      </h2>
                      <Badge className={`bg-gradient-to-r ${getRarityColor(selectedAchievement.rarity)} text-white border-0 text-sm px-3 py-1`}>
                        {selectedAchievement.rarity.charAt(0).toUpperCase() + selectedAchievement.rarity.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                      {selectedAchievement.description}
                    </p>
                  </div>
                </div>

                {/* Critérios */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Critérios para Desbloqueio
                  </h3>
                  <ul className="space-y-3">
                    {selectedAchievement.criteria.map((criterion, index) => (
                      <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recompensas */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-orange-500" />
                    Recompensas Épicas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedAchievement.rewards.pontoCoins > 0 && (
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center">
                        <Gift className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-bold text-lg">+{selectedAchievement.rewards.pontoCoins}</div>
                        <div className="text-sm opacity-90">Ponto Coins</div>
                      </div>
                    )}
                    {selectedAchievement.rewards.xp > 0 && (
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                        <Star className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-bold text-lg">+{selectedAchievement.rewards.xp}</div>
                        <div className="text-sm opacity-90">XP</div>
                      </div>
                    )}
                    {selectedAchievement.rewards.badge && (
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
                        <Award className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-bold text-sm">{selectedAchievement.rewards.badge}</div>
                        <div className="text-xs opacity-90">Badge</div>
                      </div>
                    )}
                    {selectedAchievement.rewards.physical && (
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-bold text-sm">{selectedAchievement.rewards.physical}</div>
                        <div className="text-xs opacity-90">Recompensa Física</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progresso ou Data de Desbloqueio */}
                {!selectedAchievement.isUnlocked ? (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Seu Progresso Atual
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 dark:text-gray-300">Progresso Atual</span>
                        <span className="font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                          {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                        className="h-4 mb-2"
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round((selectedAchievement.progress / selectedAchievement.maxProgress) * 100)}% concluído
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Data de Conquista
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700/30">
                      <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                        <Calendar className="h-6 w-6" />
                        <span className="text-lg font-medium">
                          Conquistada em {selectedAchievement.unlockedAt?.toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-4">
                  {selectedAchievement.isUnlocked && (
                    <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar Conquista
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAchievement(null)}
                    className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
