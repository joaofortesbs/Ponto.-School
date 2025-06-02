
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
  Gem,
  Hexagon,
  Shield,
  Diamond,
  Brain,
  Map,
  FileText,
  MessageSquare,
  GraduationCap,
  Coffee,
  Sun,
  Moon,
  Lightbulb,
  Compass,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'rewards' | 'ranking'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);
  const [currentUser, setCurrentUser] = useState<{ displayName?: string } | null>(null);

  // Buscar informações do usuário
  useEffect(() => {
    const storedUserData = localStorage.getItem('currentUser');
    if (storedUserData) {
      setCurrentUser(JSON.parse(storedUserData));
    }
  }, []);

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

  // Novas conquistas baseadas na sua lista detalhada
  const achievements: Achievement[] = [
    // === EMBARQUE ===
    {
      id: '1',
      name: 'Primeiros Passos na Ponto. School',
      description: 'Complete o tour guiado da plataforma',
      category: 'Embarque',
      level: 'bronze',
      icon: <Star className="h-5 w-5" />,
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-15'),
      rewards: { pontoCoins: 20, xp: 10, badge: 'Explorador Iniciante' },
      criteria: ['Completar tour guiado']
    },
    {
      id: '2',
      name: 'Perfil Completo',
      description: 'Preencha 100% das informações do seu perfil',
      category: 'Embarque',
      level: 'bronze',
      icon: <Users className="h-5 w-5" />,
      progress: 85,
      maxProgress: 100,
      isUnlocked: false,
      rewards: { pontoCoins: 30, xp: 15, badge: 'Identidade Revelada' },
      criteria: ['Adicionar foto', 'Completar bio', 'Definir interesses']
    },
    {
      id: '3',
      name: 'Primeira Turma Acessada',
      description: 'Acesse a página de conteúdo de qualquer turma pela primeira vez',
      category: 'Embarque',
      level: 'bronze',
      icon: <GraduationCap className="h-5 w-5" />,
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-16'),
      rewards: { pontoCoins: 10, xp: 5 },
      criteria: ['Acessar primeira turma']
    },
    {
      id: '4',
      name: 'Conhecendo o Epictus IA',
      description: 'Use qualquer ferramenta do Epictus IA pela primeira vez',
      category: 'Embarque',
      level: 'bronze',
      icon: <Brain className="h-5 w-5" />,
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-17'),
      rewards: { pontoCoins: 20, xp: 10, badge: 'Amigo da IA' },
      criteria: ['Usar primeira ferramenta IA']
    },

    // === EXPLORADOR ===
    {
      id: '5',
      name: 'Navegador Curioso',
      description: 'Visite todas as seções principais do menu lateral',
      category: 'Explorador',
      level: 'bronze',
      icon: <Compass className="h-5 w-5" />,
      progress: 8,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 50, xp: 25, badge: 'Cartógrafo da Ponto. School' },
      criteria: ['Visitar 10 seções principais']
    },
    {
      id: '6',
      name: 'Mestre dos Atalhos',
      description: 'Personalize os "Atalhos Rápidos" no Painel',
      category: 'Explorador',
      level: 'bronze',
      icon: <Settings className="h-5 w-5" />,
      progress: 0,
      maxProgress: 1,
      isUnlocked: false,
      rewards: { pontoCoins: 15, xp: 10 },
      criteria: ['Personalizar atalhos rápidos']
    },
    {
      id: '7',
      name: 'Bibliotecário Júnior',
      description: 'Acesse 10 materiais diferentes na Biblioteca',
      category: 'Explorador',
      level: 'bronze',
      icon: <BookOpen className="h-5 w-5" />,
      progress: 6,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 25, xp: 15, badge: 'Bibliotecário Júnior' },
      criteria: ['Acessar 10 materiais diferentes']
    },
    {
      id: '8',
      name: 'Bibliotecário Pleno',
      description: 'Acesse 50 materiais diferentes na Biblioteca',
      category: 'Explorador',
      level: 'silver',
      icon: <BookOpen className="h-5 w-5" />,
      progress: 6,
      maxProgress: 50,
      isUnlocked: false,
      rewards: { pontoCoins: 75, xp: 40, badge: 'Bibliotecário Pleno' },
      criteria: ['Acessar 50 materiais diferentes']
    },

    // === ESTUDANTE DEDICADO ===
    {
      id: '9',
      name: 'Sequência de Foco - Iniciante',
      description: 'Gire a roleta de login diário por 7 dias consecutivos',
      category: 'Estudante Dedicado',
      level: 'bronze',
      icon: <Flame className="h-5 w-5" />,
      progress: 7,
      maxProgress: 7,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-20'),
      rewards: { pontoCoins: 100, xp: 50, badge: 'Fogo da Dedicação Nv. 1' },
      criteria: ['7 dias consecutivos', 'Login diário']
    },
    {
      id: '10',
      name: 'Sequência de Foco - Persistente',
      description: 'Mantenha uma sequência de 30 dias consecutivos',
      category: 'Estudante Dedicado',
      level: 'silver',
      icon: <Flame className="h-5 w-5" />,
      progress: 7,
      maxProgress: 30,
      isUnlocked: false,
      rewards: { pontoCoins: 300, xp: 150, badge: 'Fogo da Dedicação Nv. 2' },
      criteria: ['30 dias consecutivos', 'Giro especial +25% sorte']
    },
    {
      id: '11',
      name: 'Maratonista dos Estudos - Bronze',
      description: 'Acumule 10 horas de estudo na plataforma',
      category: 'Estudante Dedicado',
      level: 'bronze',
      icon: <Clock className="h-5 w-5" />,
      progress: 6,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 80, xp: 40, badge: 'Resistência de Bronze' },
      criteria: ['10 horas de estudo rastreadas']
    },
    {
      id: '12',
      name: 'Mestre do Planejamento',
      description: 'Use o Planner de Estudos por 4 semanas consecutivas',
      category: 'Estudante Dedicado',
      level: 'bronze',
      icon: <Calendar className="h-5 w-5" />,
      progress: 1,
      maxProgress: 4,
      isUnlocked: false,
      rewards: { pontoCoins: 60, xp: 30, badge: 'Arquiteto dos Estudos' },
      criteria: ['4 semanas de planejamento consecutivo']
    },

    // === MESTRE DO CONHECIMENTO ===
    {
      id: '13',
      name: 'Expert em Matemática',
      description: 'Atinja 85% de progresso em todos os materiais de Matemática',
      category: 'Mestre do Conhecimento',
      level: 'bronze',
      icon: <Award className="h-5 w-5" />,
      progress: 72,
      maxProgress: 85,
      isUnlocked: false,
      rewards: { pontoCoins: 120, xp: 60, badge: 'Mestre da Matemática' },
      criteria: ['85% de progresso em Matemática']
    },
    {
      id: '14',
      name: 'Detonador de Provas',
      description: 'Tire nota máxima em 3 simulados diferentes',
      category: 'Mestre do Conhecimento',
      level: 'silver',
      icon: <Target className="h-5 w-5" />,
      progress: 1,
      maxProgress: 3,
      isUnlocked: false,
      rewards: { pontoCoins: 200, xp: 100, badge: 'Destruidor de Provas' },
      criteria: ['Nota máxima em 3 simulados']
    },

    // === COLABORADOR ===
    {
      id: '15',
      name: 'Voz Ativa',
      description: 'Envie 20 mensagens em fóruns ou chats de grupos',
      category: 'Colaborador',
      level: 'bronze',
      icon: <MessageSquare className="h-5 w-5" />,
      progress: 8,
      maxProgress: 20,
      isUnlocked: false,
      rewards: { pontoCoins: 40, xp: 20, badge: 'Comunicador Ativo' },
      criteria: ['20 mensagens enviadas em grupos']
    },
    {
      id: '16',
      name: 'Mentor da Comunidade',
      description: 'Responda a 5 pedidos de ajuda na Conexão Expert',
      category: 'Colaborador',
      level: 'silver',
      icon: <Users className="h-5 w-5" />,
      progress: 2,
      maxProgress: 5,
      isUnlocked: false,
      rewards: { pontoCoins: 150, xp: 75, badge: 'Mentor da Comunidade' },
      criteria: ['5 respostas com avaliação positiva']
    },

    // === INOVADOR IA ===
    {
      id: '17',
      name: 'Resumista Ágil',
      description: 'Use o Gerador de Resumos 10 vezes',
      category: 'Inovador IA',
      level: 'bronze',
      icon: <FileText className="h-5 w-5" />,
      progress: 4,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoCoins: 50, xp: 25, badge: 'Resumista Profissional' },
      criteria: ['10 resumos gerados']
    },
    {
      id: '18',
      name: 'Mapeador de Ideias',
      description: 'Crie 5 Mapas Mentais com o Epictus IA',
      category: 'Inovador IA',
      level: 'bronze',
      icon: <Map className="h-5 w-5" />,
      progress: 2,
      maxProgress: 5,
      isUnlocked: false,
      rewards: { pontoCoins: 60, xp: 30, badge: 'Arquiteto Mental' },
      criteria: ['5 mapas mentais criados']
    },

    // === COLECIONADOR ===
    {
      id: '19',
      name: 'Participante de Eventos',
      description: 'Participe de 3 webinars ou workshops ao vivo',
      category: 'Colecionador',
      level: 'bronze',
      icon: <Play className="h-5 w-5" />,
      progress: 1,
      maxProgress: 3,
      isUnlocked: false,
      rewards: { pontoCoins: 90, xp: 45, badge: 'Participante Ativo' },
      criteria: ['3 eventos ao vivo']
    },

    // === LENDÁRIO ===
    {
      id: '20',
      name: 'Polímata da Ponto. School',
      description: 'Domine 85% de progresso em 5 disciplinas diferentes',
      category: 'Lendário',
      level: 'legendary',
      icon: <Crown className="h-5 w-5" />,
      progress: 2,
      maxProgress: 5,
      isUnlocked: false,
      rewards: { pontoCoins: 1000, xp: 500, badge: 'Polímata Supremo', physical: 'Troféu Ponto. School Personalizado' },
      criteria: ['85% em 5 disciplinas', 'Excelência acadêmica', 'Dedicação excepcional']
    },
    {
      id: '21',
      name: 'Guardião do Conhecimento',
      description: 'Seja um Expert na Conexão Expert por 3 meses',
      category: 'Lendário',
      level: 'legendary',
      icon: <Shield className="h-5 w-5" />,
      progress: 1,
      maxProgress: 3,
      isUnlocked: false,
      rewards: { pontoCoins: 2000, xp: 1000, badge: 'Guardião Supremo', physical: 'Kit Material Escolar Premium' },
      criteria: ['3 meses como Expert', 'Avaliação excepcional', 'Múltiplas respostas aceitas']
    }
  ];

  const categories = ['all', 'Embarque', 'Explorador', 'Estudante Dedicado', 'Mestre do Conhecimento', 'Colaborador', 'Inovador IA', 'Colecionador', 'Lendário'];

  const getLevelGradient = (level: string) => {
    switch (level) {
      case 'bronze': return 'from-amber-500 via-orange-500 to-amber-600';
      case 'silver': return 'from-gray-300 via-slate-400 to-gray-500';
      case 'gold': return 'from-yellow-300 via-yellow-500 to-amber-600';
      case 'diamond': return 'from-cyan-300 via-blue-400 to-indigo-500';
      case 'legendary': return 'from-purple-400 via-pink-500 to-rose-500';
      default: return 'from-gray-300 via-slate-400 to-gray-500';
    }
  };

  const getLevelShadow = (level: string) => {
    switch (level) {
      case 'bronze': return 'shadow-amber-500/30';
      case 'silver': return 'shadow-gray-400/30';
      case 'gold': return 'shadow-yellow-500/30';
      case 'diamond': return 'shadow-blue-500/30';
      case 'legendary': return 'shadow-purple-500/30';
      default: return 'shadow-gray-400/30';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return <Shield className="h-3 w-3" />;
      case 'silver': return <Hexagon className="h-3 w-3" />;
      case 'gold': return <Crown className="h-3 w-3" />;
      case 'diamond': return <Diamond className="h-3 w-3" />;
      case 'legendary': return <Gem className="h-3 w-3" />;
      default: return <Medal className="h-3 w-3" />;
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

  // Componente Card de Conquista Modernizado
  const AchievementCard = ({ achievement, variant = 'default' }: { achievement: Achievement, variant?: 'default' | 'compact' }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500
        backdrop-blur-xl border hover:border-orange-400/30
        ${achievement.isUnlocked 
          ? `bg-gradient-to-br ${getLevelGradient(achievement.level)} shadow-2xl ${getLevelShadow(achievement.level)} hover:shadow-3xl` 
          : isLightMode
            ? 'bg-white/80 border-gray-200 shadow-lg hover:shadow-xl hover:bg-white'
            : 'bg-white/5 border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10'
        }
        ${variant === 'compact' ? 'p-4 h-40' : 'p-5 h-44'}
      `}
      onClick={() => setSelectedAchievement(achievement)}
    >
      {/* Efeito de cristal/vidro */}
      <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
        isLightMode 
          ? 'from-white/20 via-transparent to-gray-50/5' 
          : 'from-white/10 via-transparent to-black/5'
      }`} />
      
      {/* Efeito de brilho animado para conquistas desbloqueadas */}
      {achievement.isUnlocked && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: [-100, 300] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      )}
      
      {/* Badge de nível sofisticado */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full backdrop-blur-md border text-xs font-semibold flex items-center gap-1 ${
        achievement.isUnlocked 
          ? 'bg-white/20 border-white/30 text-white' 
          : isLightMode
            ? 'bg-gray-100/80 border-gray-200 text-gray-600'
            : 'bg-black/20 border-white/10 text-gray-300'
      }`}>
        {getLevelIcon(achievement.level)}
        {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Ícone sofisticado */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mb-3
          ${achievement.isUnlocked 
            ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white' 
            : isLightMode
              ? 'bg-gray-100/80 backdrop-blur-md border border-gray-200 text-gray-600'
              : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-300'
          }
          group-hover:scale-110 transition-transform duration-300
        `}>
          {achievement.icon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <div>
            <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${
              achievement.isUnlocked 
                ? 'text-white' 
                : isLightMode
                  ? 'text-gray-800'
                  : 'text-white/90'
            }`}>
              {achievement.name}
            </h3>
            
            <p className={`text-xs mb-2 line-clamp-2 leading-relaxed ${
              achievement.isUnlocked 
                ? 'text-white/80' 
                : isLightMode
                  ? 'text-gray-600'
                  : 'text-white/70'
            }`}>
              {achievement.description}
            </p>
          </div>

          {/* Recompensas compactas */}
          <div className="flex items-center gap-1 mb-2">
            {achievement.rewards.pontoCoins > 0 && (
              <div className="bg-orange-500/20 backdrop-blur-md border border-orange-400/30 rounded-full px-2 py-0.5 text-xs text-orange-200 font-medium">
                +{achievement.rewards.pontoCoins}
              </div>
            )}
            {achievement.rewards.xp > 0 && (
              <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full px-2 py-0.5 text-xs text-blue-200 font-medium">
                +{achievement.rewards.xp}
              </div>
            )}
          </div>

          {/* Barra de progresso elegante */}
          {!achievement.isUnlocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Progresso</span>
                <span className="font-medium text-orange-300">{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-md">
                <motion.div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* Data de desbloqueio */}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="flex items-center gap-1 text-xs text-white/70">
              <Calendar className="h-3 w-3" />
              {achievement.unlockedAt.toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">

        {/* Card de Resumo Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative overflow-hidden rounded-3xl backdrop-blur-xl shadow-2xl ${
            isLightMode 
              ? 'bg-white/90 border border-gray-200/50' 
              : 'bg-white/10 border border-white/20'
          }`}
        >
          <div className={`absolute inset-0 ${
            isLightMode 
              ? 'bg-gradient-to-br from-orange-100/20 via-transparent to-blue-100/20' 
              : 'bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20'
          }`} />
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar Premium */}
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-4 flex items-center justify-center shadow-2xl ${
                  isLightMode ? 'border-white/70' : 'border-white/30'
                }`}>
                  <span className="text-3xl font-bold text-white">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className={`absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-2 border-2 ${
                  isLightMode ? 'border-white/70' : 'border-white/30'
                }`}>
                  <Crown className="h-5 w-5 text-yellow-900" />
                </div>
              </div>

              {/* Informações do Usuário */}
              <div className="text-center lg:text-left">
                <h2 className={`text-2xl font-bold mb-1 ${
                  isLightMode ? 'text-gray-800' : 'text-white'
                }`}>
                  {currentUser?.displayName || 'Usuário'}
                </h2>
                <p className={`mb-3 ${
                  isLightMode ? 'text-gray-600' : 'text-white/70'
                }`}>
                  {userStats.currentLevel}
                </p>
                <div className={`flex items-center gap-4 text-sm ${
                  isLightMode ? 'text-gray-500' : 'text-white/60'
                }`}>
                  <span>Ranking: #{userStats.rankingPosition}</span>
                  <span>•</span>
                  <span>Sequência: {userStats.focusStreak} dias 🔥</span>
                </div>
              </div>

              {/* Barra de Progresso XP */}
              <div className="flex-1 max-w-md space-y-3">
                <div className={`flex justify-between text-sm ${
                  isLightMode ? 'text-gray-700' : 'text-white/80'
                }`}>
                  <span>Progresso para próximo nível</span>
                  <span className="font-medium text-orange-500">
                    {userStats.totalXP} / {userStats.nextLevelXP} XP
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden backdrop-blur-md ${
                  isLightMode ? 'bg-gray-200' : 'bg-black/20'
                }`}>
                  <motion.div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(userStats.totalXP / userStats.nextLevelXP) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Métricas Premium */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Gift, value: userStats.totalPontoCoins, label: "Ponto Coins", color: "orange" },
                  { icon: Trophy, value: userStats.unlockedBadges, label: "Badges", color: "yellow" },
                  { icon: TrendingUp, value: `#${userStats.rankingPosition}`, label: "Ranking", color: "green" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full backdrop-blur-md border flex items-center justify-center ${
                      isLightMode 
                        ? 'bg-orange-100/50 border-orange-200' 
                        : 'bg-orange-500/20 border-orange-400/30'
                    }`}>
                      <stat.icon className={`h-6 w-6 ${
                        isLightMode ? 'text-orange-600' : 'text-orange-300'
                      }`} />
                    </div>
                    <div className={`text-xl font-bold ${
                      isLightMode ? 'text-gray-800' : 'text-white'
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs ${
                      isLightMode ? 'text-gray-500' : 'text-white/60'
                    }`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Abas de Navegação Elegantes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className={`inline-flex rounded-2xl backdrop-blur-xl border p-1 ${
            isLightMode 
              ? 'bg-white/80 border-gray-200' 
              : 'bg-white/10 border-white/20'
          }`}>
            {[
              { id: 'overview', label: 'Visão Geral', icon: <Star className="h-4 w-4" /> },
              { id: 'all', label: 'Todas', icon: <Trophy className="h-4 w-4" /> },
              { id: 'rewards', label: 'Recompensas', icon: <Gift className="h-4 w-4" /> },
              { id: 'ranking', label: 'Ranking', icon: <Medal className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : isLightMode 
                      ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
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
                <motion.h2 
                  className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
                    isLightMode ? 'text-gray-800' : 'text-white'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Quase Lá! Próximas a Desbloquear
                </motion.h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearlyUnlocked.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AchievementCard achievement={achievement} variant="compact" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Últimas Medalhas */}
              <div>
                <motion.h2 
                  className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
                    isLightMode ? 'text-gray-800' : 'text-white'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-yellow-900" />
                  </div>
                  Suas Últimas Medalhas de Honra
                </motion.h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentlyUnlocked.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AchievementCard achievement={achievement} variant="compact" />
                    </motion.div>
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
              {/* Filtros Premium */}
              <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
                isLightMode 
                  ? 'bg-white/80 border-gray-200' 
                  : 'bg-white/10 border-white/20'
              }`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1 relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      isLightMode ? 'text-gray-400' : 'text-white/40'
                    }`} />
                    <input
                      placeholder="Buscar conquistas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl backdrop-blur-md focus:outline-none focus:border-orange-400/50 ${
                        isLightMode 
                          ? 'bg-white/80 border-gray-200 text-gray-800 placeholder:text-gray-400' 
                          : 'bg-white/10 border-white/20 text-white placeholder:text-white/40'
                      }`}
                    />
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`px-4 py-3 border rounded-xl backdrop-blur-md focus:outline-none focus:border-orange-400/50 ${
                        isLightMode 
                          ? 'bg-white/80 border-gray-200 text-gray-800' 
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category} className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>
                          {category === 'all' ? 'Todas as Categorias' : category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className={`px-4 py-3 border rounded-xl backdrop-blur-md focus:outline-none focus:border-orange-400/50 ${
                        isLightMode 
                          ? 'bg-white/80 border-gray-200 text-gray-800' 
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      <option value="all" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Todos os Status</option>
                      <option value="unlocked" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Desbloqueadas</option>
                      <option value="pending" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Pendentes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid de Conquistas */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AchievementCard achievement={achievement} variant="compact" />
                  </motion.div>
                ))}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-16">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full backdrop-blur-md border flex items-center justify-center ${
                    isLightMode 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <Trophy className={`h-10 w-10 ${
                      isLightMode ? 'text-gray-400' : 'text-white/40'
                    }`} />
                  </div>
                  <h3 className={`text-xl font-medium mb-2 ${
                    isLightMode ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    Nenhuma conquista encontrada
                  </h3>
                  <p className={isLightMode ? 'text-gray-500' : 'text-white/50'}>
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
              className="text-center py-16"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full backdrop-blur-md border flex items-center justify-center ${
                isLightMode 
                  ? 'bg-gray-100 border-gray-200' 
                  : 'bg-white/10 border-white/20'
              }`}>
                <Gift className={`h-10 w-10 ${
                  isLightMode ? 'text-gray-400' : 'text-white/40'
                }`} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${
                isLightMode ? 'text-gray-600' : 'text-white/70'
              }`}>
                Seção em Desenvolvimento
              </h3>
              <p className={isLightMode ? 'text-gray-500' : 'text-white/50'}>
                Suas recompensas aparecerão aqui em breve
              </p>
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full backdrop-blur-md border flex items-center justify-center ${
                isLightMode 
                  ? 'bg-gray-100 border-gray-200' 
                  : 'bg-white/10 border-white/20'
              }`}>
                <Medal className={`h-10 w-10 ${
                  isLightMode ? 'text-gray-400' : 'text-white/40'
                }`} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${
                isLightMode ? 'text-gray-600' : 'text-white/70'
              }`}>
                Ranking em Desenvolvimento
              </h3>
              <p className={isLightMode ? 'text-gray-500' : 'text-white/50'}>
                O ranking de conquistas estará disponível em breve
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes Premium */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className={`max-w-2xl backdrop-blur-xl border ${
            isLightMode 
              ? 'bg-white/95 border-gray-200 text-gray-800' 
              : 'bg-slate-900/95 border-white/20 text-white'
          }`}>
            {selectedAchievement && (
              <div className="p-6">
                <div className="flex items-start gap-6 mb-6">
                  <div className={`
                    p-4 rounded-2xl bg-gradient-to-br ${getLevelGradient(selectedAchievement.level)}
                    shadow-2xl ${getLevelShadow(selectedAchievement.level)}
                  `}>
                    {selectedAchievement.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold mb-2 ${
                      isLightMode ? 'text-gray-800' : 'text-white'
                    }`}>
                      {selectedAchievement.name}
                    </h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getLevelGradient(selectedAchievement.level)}`}>
                      {getLevelIcon(selectedAchievement.level)}
                      {selectedAchievement.level.charAt(0).toUpperCase() + selectedAchievement.level.slice(1)}
                    </div>
                    <p className={`text-lg mt-3 ${
                      isLightMode ? 'text-gray-600' : 'text-white/80'
                    }`}>
                      {selectedAchievement.description}
                    </p>
                  </div>
                </div>

                {/* Critérios */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isLightMode ? 'text-gray-800' : 'text-white'
                  }`}>
                    Critérios para Desbloqueio:
                  </h3>
                  <ul className="space-y-2">
                    {selectedAchievement.criteria.map((criterion, index) => (
                      <li key={index} className={`flex items-center gap-2 ${
                        isLightMode ? 'text-gray-600' : 'text-white/70'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recompensas */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isLightMode ? 'text-gray-800' : 'text-white'
                  }`}>
                    Recompensas:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedAchievement.rewards.pontoCoins > 0 && (
                      <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Gift className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <div className="font-semibold text-orange-500">+{selectedAchievement.rewards.pontoCoins}</div>
                        <div className="text-xs text-orange-400">Ponto Coins</div>
                      </div>
                    )}
                    {selectedAchievement.rewards.xp > 0 && (
                      <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <div className="font-semibold text-blue-500">+{selectedAchievement.rewards.xp}</div>
                        <div className="text-xs text-blue-400">XP</div>
                      </div>
                    )}
                    {selectedAchievement.rewards.badge && (
                      <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <div className="font-semibold text-purple-500 text-xs">{selectedAchievement.rewards.badge}</div>
                        <div className="text-xs text-purple-400">Badge</div>
                      </div>
                    )}
                    {selectedAchievement.rewards.physical && (
                      <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                        <div className="font-semibold text-emerald-500 text-xs">{selectedAchievement.rewards.physical}</div>
                        <div className="text-xs text-emerald-400">Físico</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progresso */}
                {!selectedAchievement.isUnlocked && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${
                        isLightMode ? 'text-gray-700' : 'text-white/80'
                      }`}>
                        Progresso Atual
                      </span>
                      <span className="font-bold text-orange-500">
                        {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                      </span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${
                      isLightMode ? 'bg-gray-200' : 'bg-white/10'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {selectedAchievement.isUnlocked && (
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar Conquista
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAchievement(null)}
                    className={`flex-1 ${
                      isLightMode 
                        ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
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
