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
  rewards: { pontoSchools: number; xp: number; badge?: string; physical?: string; };
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

interface Reward {
  id: string;
  name: string;
  description?: string;
  type: 'coins' | 'badges' | 'profile_items' | 'physical' | 'digital';
  dateReceived: Date;
  status?: 'pending' | 'shipped' | 'delivered' | 'redeemed';
  trackingCode?: string;
  value?: number;
  action?: {
    type: 'primary' | 'secondary';
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
}

export default function ConquistasPage() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'premiacoes' | 'rewards' | 'ranking'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);
  const [currentUser, setCurrentUser] = useState<{ displayName?: string } | null>(null);
  const [selectedRewardType, setSelectedRewardType] = useState('all');
  const [selectedRewardStatus, setSelectedRewardStatus] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  // Buscar informações do usuário
  useEffect(() => {
    const storedUserData = localStorage.getItem('currentUser');
    if (storedUserData) {
      setCurrentUser(JSON.parse(storedUserData));
    }
  }, []);

  // Obter nome do usuário do localStorage
  const getUserDisplayName = () => {
    // Primeiro, tentar pegar do currentUser
    if (currentUser?.displayName && currentUser.displayName !== 'Usuário') {
      return currentUser.displayName;
    }
    
    // Depois, tentar do localStorage
    const userDisplayName = localStorage.getItem('userDisplayName');
    if (userDisplayName && userDisplayName !== 'Usuário') {
      return userDisplayName;
    }

    const userFirstName = localStorage.getItem('userFirstName');
    if (userFirstName && userFirstName !== 'Usuário') {
      return userFirstName;
    }

    const username = localStorage.getItem('username');
    if (username && username !== 'Usuário' && !username.includes('user_')) {
      return username;
    }

    return 'Usuário';
  };

  // Dados iniciais do usuário (para novos usuários)
  const userStats: UserStats = {
    totalXP: 0,
    nextLevelXP: 100,
    currentLevel: "Iniciante",
    totalPontoCoins: 0,
    unlockedBadges: 0,
    focusStreak: 0,
    rankingPosition: 0
  };

  // Dados de recompensas para novos usuários (vazio inicialmente)
  const userRewards: Reward[] = [];

  // Dados das premiações físicas
  interface Premiacao {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    image: string;
    rarity: 'comum' | 'raro' | 'epico' | 'lendario';
    pontoSchoolsRequired: number;
    isAvailable: boolean;
    category: 'material_escolar' | 'acessorio' | 'utilidade';
  }

  const premiacoes: Premiacao[] = [
    // Lendário
    {
      id: '1',
      name: 'Kit de Materiais Escolares',
      subtitle: 'Arsenal do Gênio',
      description: 'Kit completo com lápis, canetas, réguas, borrachas e muito mais para seus estudos.',
      image: '/images/kit-materiais.jpg',
      rarity: 'lendario',
      pontoSchoolsRequired: 5000,
      isAvailable: true,
      category: 'material_escolar'
    },
    {
      id: '4',
      name: 'Mochila',
      subtitle: 'Manto do Conhecimento',
      description: 'Mochila resistente e espaçosa com compartimentos especiais para estudantes.',
      image: '/images/mochila.jpg',
      rarity: 'lendario',
      pontoSchoolsRequired: 4500,
      isAvailable: true,
      category: 'acessorio'
    },
    // Épico
    {
      id: '3',
      name: 'Caderno',
      subtitle: 'Anotação Lendária',
      description: 'Caderno premium com design exclusivo e papel de alta qualidade.',
      image: '/images/caderno.jpg',
      rarity: 'epico',
      pontoSchoolsRequired: 2000,
      isAvailable: true,
      category: 'material_escolar'
    },
    {
      id: '5',
      name: 'Lápis & Canetas',
      subtitle: 'Escrita Épica',
      description: 'Set premium de lápis e canetas para uma escrita suave e precisa.',
      image: '/images/lapis-canetas.jpg',
      rarity: 'epico',
      pontoSchoolsRequired: 1200,
      isAvailable: true,
      category: 'material_escolar'
    },
    {
      id: '9',
      name: 'Boné',
      subtitle: 'Coroa da Sabedoria',
      description: 'Boné exclusivo Ponto School com proteção UV e design moderno.',
      image: '/images/bone.jpg',
      rarity: 'epico',
      pontoSchoolsRequired: 1800,
      isAvailable: true,
      category: 'acessorio'
    },
    {
      id: '11',
      name: 'Estojo',
      subtitle: 'Cofre das Ideias',
      description: 'Estojo compacto e resistente para guardar seus materiais de forma organizada.',
      image: '/images/estojo.jpg',
      rarity: 'epico',
      pontoSchoolsRequired: 600,
      isAvailable: true,
      category: 'material_escolar'
    },
    // Raro
    {
      id: '2',
      name: 'Garrafa',
      subtitle: 'Dose da Sabedoria',
      description: 'Garrafa térmica exclusiva Ponto School para te manter hidratado durante os estudos.',
      image: '/images/garrafa.jpg',
      rarity: 'raro',
      pontoSchoolsRequired: 1500,
      isAvailable: true,
      category: 'utilidade'
    },
    {
      id: '7',
      name: 'Caneca',
      subtitle: 'Cálice da Inspiração',
      description: 'Caneca térmica com design motivacional para seus momentos de estudo.',
      image: '/images/caneca.jpg',
      rarity: 'raro',
      pontoSchoolsRequired: 800,
      isAvailable: true,
      category: 'utilidade'
    },
    {
      id: '8',
      name: 'Pulseira',
      subtitle: 'Bracelete do Estudioso',
      description: 'Pulseira exclusiva Ponto School com design minimalista e elegante.',
      image: '/images/pulseira.jpg',
      rarity: 'raro',
      pontoSchoolsRequired: 1000,
      isAvailable: true,
      category: 'acessorio'
    },
    {
      id: '10',
      name: 'Pasta',
      subtitle: 'Escudo do Aprendizado',
      description: 'Pasta organizadora resistente para manter seus materiais sempre em ordem.',
      image: '/images/pasta.jpg',
      rarity: 'raro',
      pontoSchoolsRequired: 1300,
      isAvailable: true,
      category: 'material_escolar'
    },
    {
      id: '12',
      name: 'Marca Texto',
      subtitle: 'Luz da Atenção',
      description: 'Kit de marca textos coloridos para destacar os pontos mais importantes dos seus estudos.',
      image: '/images/marca-texto.jpg',
      rarity: 'raro',
      pontoSchoolsRequired: 400,
      isAvailable: true,
      category: 'material_escolar'
    },
    // Comum
    {
      id: '6',
      name: 'Borracha',
      subtitle: 'Escudo contra Erros',
      description: 'Borracha de alta qualidade que apaga sem danificar o papel.',
      image: '/images/borracha.jpg',
      rarity: 'comum',
      pontoSchoolsRequired: 300,
      isAvailable: true,
      category: 'material_escolar'
    }
  ];

  // Funções auxiliares para recompensas
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins': return <Gift className="h-8 w-8 text-orange-500" />;
      case 'badges': return <Award className="h-8 w-8 text-yellow-500" />;
      case 'profile_items': return <Users className="h-8 w-8 text-purple-500" />;
      case 'physical': return <Trophy className="h-8 w-8 text-blue-500" />;
      case 'digital': return <BookOpen className="h-8 w-8 text-green-500" />;
      default: return <Gift className="h-8 w-8 text-gray-500" />;
    }
  };

  const getRewardIconBg = (type: string) => {
    switch (type) {
      case 'coins': return 'bg-orange-100 border border-orange-200 dark:bg-orange-500/20 dark:border-orange-400/30';
      case 'badges': return 'bg-yellow-100 border border-yellow-200 dark:bg-yellow-500/20 dark:border-yellow-400/30';
      case 'profile_items': return 'bg-purple-100 border border-purple-200 dark:bg-purple-500/20 dark:border-purple-400/30';
      case 'physical': return 'bg-blue-100 border border-blue-200 dark:bg-blue-500/20 dark:border-blue-400/30';
      case 'digital': return 'bg-green-100 border border-green-200 dark:bg-green-500/20 dark:border-green-400/30';
      default: return 'bg-gray-100 border border-gray-200 dark:bg-gray-500/20 dark:border-gray-400/30';
    }
  };

  const getRewardTypeBadge = (type: string) => {
    switch (type) {
      case 'coins': return 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300';
      case 'badges': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'profile_items': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300';
      case 'physical': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
      case 'digital': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'coins': return 'Ponto Schools';
      case 'badges': return 'Badge';
      case 'profile_items': return 'Item de Perfil';
      case 'physical': return 'Física';
      case 'digital': return 'Digital';
      default: return 'Outro';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'redeemed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Envio';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'redeemed': return 'Resgatado';
      default: return 'Indefinido';
    }
  };

  const handleRewardAction = (reward: Reward) => {
    if (reward.action) {
      reward.action.onClick();
    }
  };

  // Funções auxiliares para premiações
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'comum': return 'from-gray-400 to-gray-600';
      case 'raro': return 'from-blue-400 to-blue-600';
      case 'epico': return 'from-purple-400 to-purple-600';
      case 'lendario': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'comum': return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
      case 'raro': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
      case 'epico': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300';
      case 'lendario': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'material_escolar': return <BookOpen className="h-4 w-4" />;
      case 'acessorio': return <Crown className="h-4 w-4" />;
      case 'utilidade': return <Coffee className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const handlePremiacaoRedeem = (premiacao: Premiacao) => {
    // Aqui implementar lógica de resgate
    console.log(`Resgatando premiação: ${premiacao.name}`);
  };

  // Filtrar recompensas
  const filteredRewards = userRewards.filter(reward => {
    const matchesType = selectedRewardType === 'all' || reward.type === selectedRewardType;
    const matchesStatus = selectedRewardStatus === 'all' || reward.status === selectedRewardStatus;

    let matchesDate = true;
    if (selectedDateFilter !== 'all') {
      const now = new Date();
      const rewardDate = reward.dateReceived;

      switch (selectedDateFilter) {
        case '7days':
          matchesDate = (now.getTime() - rewardDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
          break;
        case '30days':
          matchesDate = (now.getTime() - rewardDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
          break;
        case 'thisMonth':
          matchesDate = rewardDate.getMonth() === now.getMonth() && rewardDate.getFullYear() === now.getFullYear();
          break;
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          matchesDate = rewardDate.getMonth() === lastMonth.getMonth() && rewardDate.getFullYear() === lastMonth.getFullYear();
          break;
      }
    }

    return matchesType && matchesStatus && matchesDate;
  });

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
      progress: 0,
      maxProgress: 1,
      isUnlocked: false,
      rewards: { pontoSchools: 20, xp: 10, badge: 'Explorador Iniciante' },
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
      rewards: { pontoSchools: 30, xp: 15, badge: 'Identidade Revelada' },
      criteria: ['Adicionar foto', 'Completar bio', 'Definir interesses']
    },
    {
      id: '3',
      name: 'Primeira Turma Acessada',
      description: 'Acesse a página de conteúdo de qualquer turma pela primeira vez',
      category: 'Embarque',
      level: 'bronze',
      icon: <GraduationCap className="h-5 w-5" />,
      progress: 0,
      maxProgress: 1,
      isUnlocked: false,
      rewards: { pontoSchools: 10, xp: 5 },
      criteria: ['Acessar primeira turma']
    },
    {
      id: '4',
      name: 'Conhecendo o Epictus IA',
      description: 'Use qualquer ferramenta do Epictus IA pela primeira vez',
      category: 'Embarque',
      level: 'bronze',
      icon: <Brain className="h-5 w-5" />,
      progress: 0,
      maxProgress: 1,
      isUnlocked: false,
      rewards: { pontoSchools: 20, xp: 10, badge: 'Amigo da IA' },
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
      progress: 0,
      maxProgress: 10,
      isUnlocked: false,
      rewards: { pontoSchools: 50, xp: 25, badge: 'Cartógrafo da Ponto. School' },
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
      rewards: { pontoSchools: 15, xp: 10 },
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
      rewards: { pontoSchools: 25, xp: 15, badge: 'Bibliotecário Júnior' },
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
      rewards: { pontoSchools: 75, xp: 40, badge: 'Bibliotecário Pleno' },
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
      progress: 0,
      maxProgress: 7,
      isUnlocked: false,
      rewards: { pontoSchools: 100, xp: 50, badge: 'Fogo da Dedicação Nv. 1' },
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
      rewards: { pontoSchools: 300, xp: 150, badge: 'Fogo da Dedicação Nv. 2' },
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
      rewards: { pontoSchools: 80, xp: 40, badge: 'Resistência de Bronze' },
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
      rewards: { pontoSchools: 60, xp: 30, badge: 'Arquiteto dos Estudos' },
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
      rewards: { pontoSchools: 120, xp: 60, badge: 'Mestre da Matemática' },
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
      rewards: { pontoSchools: 200, xp: 100, badge: 'Destruidor de Provas' },
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
      rewards: { pontoSchools: 40, xp: 20, badge: 'Comunicador Ativo' },
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
      rewards: { pontoSchools: 150, xp: 75, badge: 'Mentor da Comunidade' },
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
      rewards: { pontoSchools: 50, xp: 25, badge: 'Resumista Profissional' },
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
      rewards: { pontoSchools: 60, xp: 30, badge: 'Arquiteto Mental' },
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
      rewards: { pontoSchools: 90, xp: 45, badge: 'Participante Ativo' },
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
      rewards: { pontoSchools: 1000, xp: 500, badge: 'Polímata Supremo', physical: 'Troféu Ponto. School Personalizado' },
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
      rewards: { pontoSchools: 2000, xp: 1000, badge: 'Guardião Supremo', physical: 'Kit Material Escolar Premium' },
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
    .filter(a => !a.isUnlocked && a.progress > 0 && a.progress / a.maxProgress >= 0.3)
    .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))
    .slice(0, 3);

  const recentlyUnlocked = achievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  // Para novos usuários, mostrar conquistas mais próximas de serem desbloqueadas
  const availableAchievements = achievements
    .filter(a => !a.isUnlocked)
    .sort((a, b) => {
      // Priorizar conquistas com algum progresso
      if (a.progress > 0 && b.progress === 0) return -1;
      if (b.progress > 0 && a.progress === 0) return 1;
      // Depois por porcentagem de progresso
      return (b.progress / b.maxProgress) - (a.progress / a.maxProgress);
    })
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
            {achievement.rewards.pontoSchools > 0 && (
              <div className="bg-orange-500/20 backdrop-blur-md border border-orange-400/30 rounded-full px-2 py-0.5 text-xs text-orange-200 font-medium">
                +{achievement.rewards.pontoSchools}
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
                  {getUserDisplayName()}
                </h2>
                <p className={`mb-3 ${
                  isLightMode ? 'text-gray-600' : 'text-white/70'
                }`}>
                  {userStats.currentLevel}
                </p>
                <div className={`flex items-center gap-4 text-sm ${
                  isLightMode ? 'text-gray-500' : 'text-white/60'
                }`}>
                  <span>Ranking: {userStats.rankingPosition > 0 ? `#${userStats.rankingPosition}` : 'Não classificado'}</span>
                  <span>•</span>
                  <span>Sequência: {userStats.focusStreak} dias {userStats.focusStreak > 0 ? '🔥' : '💪'}</span>
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
                    animate={{ width: userStats.totalXP > 0 ? `${Math.max(5, (userStats.totalXP / userStats.nextLevelXP) * 100)}%` : "0%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Métricas Premium */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Gift, value: userStats.totalPontoCoins, label: "Ponto Schools", color: "orange" },
                  { icon: Trophy, value: userStats.unlockedBadges, label: "Badges", color: "yellow" },
                  { icon: TrendingUp, value: userStats.rankingPosition > 0 ? `#${userStats.rankingPosition}` : "Sem ranking", label: "Ranking", color: "green" }
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
              { id: 'premiacoes', label: 'Premiações', icon: <Crown className="h-4 w-4" /> },
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
              {/* Conquistas Próximas ou Disponíveis */}
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
                  {nearlyUnlocked.length > 0 ? 'Quase Lá! Próximas a Desbloquear' : 'Conquistas Disponíveis'}
                </motion.h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(nearlyUnlocked.length > 0 ? nearlyUnlocked : availableAchievements).map((achievement, index) => (
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
                {nearlyUnlocked.length === 0 && availableAchievements.length === 0 && (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full backdrop-blur-md border flex items-center justify-center ${
                      isLightMode 
                        ? 'bg-gray-100 border-gray-200' 
                        : 'bg-white/10 border-white/20'
                    }`}>
                      <Trophy className={`h-8 w-8 ${
                        isLightMode ? 'text-gray-400' : 'text-white/40'
                      }`} />
                    </div>
                    <h3 className={`text-lg font-medium mb-2 ${
                      isLightMode ? 'text-gray-600' : 'text-white/70'
                    }`}>
                      Comece sua jornada!
                    </h3>
                    <p className={isLightMode ? 'text-gray-500' : 'text-white/50'}>
                      Use a plataforma para começar a desbloquear suas primeiras conquistas
                    </p>
                  </div>
                )}
              </div>

              {/* Últimas Medalhas */}
              {recentlyUnlocked.length > 0 && (
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
              )}
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

          {activeTab === 'premiacoes' && (
            <motion.div
              key="premiacoes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Cabeçalho da Aba */}
              <div className="text-center space-y-2">
                <motion.h2 
                  className={`text-3xl font-bold ${
                    isLightMode ? 'text-gray-800' : 'text-white'
                  }`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  🏆 Premiações Exclusivas
                </motion.h2>
                <motion.p 
                  className={`text-lg ${
                    isLightMode ? 'text-gray-600' : 'text-white/70'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Resgate prêmios físicos incríveis com seus Ponto Schools!
                </motion.p>
              </div>

              {/* Grid de Premiações */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {premiacoes.map((premiacao, index) => (
                  <motion.div
                    key={premiacao.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500
                      backdrop-blur-xl border hover:border-orange-400/30 hover:shadow-2xl
                      ${isLightMode 
                        ? 'bg-white/90 border-gray-200 hover:shadow-gray-200/50' 
                        : 'bg-white/10 border-white/20 hover:shadow-orange-500/20'
                      }
                      hover:scale-105 h-80
                    `}
                    onClick={() => handlePremiacaoRedeem(premiacao)}
                  >
                    {/* Imagem da Premiação (70% do card) */}
                    <div className="relative h-56 overflow-hidden">
                      {/* Placeholder para imagem - 70% do card */}
                      <div className={`
                        w-full h-full bg-gradient-to-br ${getRarityColor(premiacao.rarity)}
                        flex items-center justify-center
                      `}>
                        <div className="text-center text-white">
                          {getCategoryIcon(premiacao.category)}
                          <div className="mt-2 text-xs opacity-80">
                            {premiacao.name}
                          </div>
                        </div>
                      </div>

                      {/* Badge de Raridade */}
                      <div className={`
                        absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
                        ${getRarityBadgeColor(premiacao.rarity)} backdrop-blur-md
                      `}>
                        {premiacao.rarity.charAt(0).toUpperCase() + premiacao.rarity.slice(1)}
                      </div>

                      {/* Indicador de Disponibilidade */}
                      {!premiacao.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Indisponível</span>
                        </div>
                      )}
                    </div>

                    {/* Informações da Premiação (30% do card) */}
                    <div className="p-4 h-24 flex flex-col justify-between">
                      <div>
                        <h3 className={`font-bold text-sm line-clamp-1 ${
                          isLightMode ? 'text-gray-800' : 'text-white'
                        }`}>
                          {premiacao.name}
                        </h3>
                        <p className={`text-xs font-medium text-orange-500 line-clamp-1`}>
                          {premiacao.subtitle}
                        </p>
                      </div>

                      {/* Preço e Botão */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-orange-500" />
                          <span className={`text-sm font-bold ${
                            isLightMode ? 'text-gray-800' : 'text-white'
                          }`}>
                            {premiacao.pontoSchoolsRequired}
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          disabled={!premiacao.isAvailable || userStats.totalPontoCoins < premiacao.pontoSchoolsRequired}
                          className={`
                            text-xs px-3 py-1 h-7
                            ${userStats.totalPontoCoins >= premiacao.pontoSchoolsRequired && premiacao.isAvailable
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          {userStats.totalPontoCoins >= premiacao.pontoSchoolsRequired && premiacao.isAvailable
                            ? 'Resgatar'
                            : 'Insuficiente'
                          }
                        </Button>
                      </div>
                    </div>

                    {/* Efeito hover */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                    `} />
                  </motion.div>
                ))}
              </div>

              {/* Informações adicionais */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`
                  backdrop-blur-xl border rounded-2xl p-6 text-center
                  ${isLightMode 
                    ? 'bg-white/80 border-gray-200' 
                    : 'bg-white/10 border-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="h-5 w-5 text-orange-500" />
                  <span className={`font-medium ${
                    isLightMode ? 'text-gray-800' : 'text-white'
                  }`}>
                    Seus Ponto Schools: {userStats.totalPontoCoins}
                  </span>
                </div>
                <p className={`text-sm ${
                  isLightMode ? 'text-gray-600' : 'text-white/70'
                }`}>
                  Complete conquistas e participe das atividades da plataforma para ganhar mais Ponto Schools!
                </p>
              </motion.div>
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
              {/* Cabeçalho da Aba */}
              {/* Removed header texts as requested */}

              {/* Filtros */}
              <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
                isLightMode 
                  ? 'bg-white/80 border-gray-200' 
                  : 'bg-white/10 border-white/20'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por Tipo */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isLightMode ? 'text-gray-700' : 'text-white/80'
                    }`}>
                      Tipo de Recompensa
                    </label>
                    <select
                      value={selectedRewardType}
                      onChange={(e) => setSelectedRewardType(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl backdrop-blur-md focus:outline-none focus:border-orange-400/50 ${
                        isLightMode 
                          ? 'bg-white/80 border-gray-200 text-gray-800' 
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      <option value="all" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Todas</option>
                      <option value="coins" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Ponto Schools</option>
                      <option value="badges" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Badges</option>
                      <option value="profile_items" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Itens de Perfil</option>
                      <option value="physical" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Físicas</option>
                      <option value="digital" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Digitais</option>
                    </select>
                  </div>

                  {/* Filtro por Status */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isLightMode ? 'text-gray-700' : 'text-white/80'
                    }`}>
                      Status
                    </label>
                    <select
                      value={selectedRewardStatus}
                      onChange={(e) => setSelectedRewardStatus(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl backdrop-blur-md focus:outline-none focus:border-orange-400/50 ${
                        isLightMode 
                          ? 'bg-white/80 border-gray-200 text-gray-800' 
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      <option value="all" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Todas</option>
                      <option value="pending" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Aguardando Envio</option>
                      <option value="shipped" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Enviado</option>
                      <option value="delivered" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Entregue</option>
                      <option value="redeemed" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Resgatado</option>
                    </select>
                  </div>

                  {/* Filtro por Data */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isLightMode ? 'text-gray-700' : 'text-white/80'
                    }`}>
                      Data de Recebimento
                    </label>
                    <select
                      value={selectedDateFilter}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl backdrop-blur-md focus:outline-none focus:border-orange-400/50 ${
                        isLightMode 
                          ? 'bg-white/80 border-gray-200 text-gray-800' 
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      <option value="all" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Todas</option>
                      <option value="7days" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Últimos 7 dias</option>
                      <option value="30days" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Últimos 30 dias</option>
                      <option value="thisMonth" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Este Mês</option>
                      <option value="lastMonth" className={isLightMode ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'}>Mês Anterior</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de Recompensas */}
              {filteredRewards.length === 0 ? (
                <div className="text-center py-16">
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
                    Suas Recompensas Aparecerão Aqui!
                  </h3>
                  <p className={isLightMode ? 'text-gray-500' : 'text-white/50'}>
                    Continue estudando e completando conquistas para desbloquear prêmios incríveis!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredRewards.map((reward, index) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        rounded-2xl overflow-hidden backdrop-blur-xl border p-6 hover:shadow-lg transition-all duration-300
                        ${isLightMode 
                          ? 'bg-white/90 border-gray-200 hover:shadow-gray-200/50' 
                          : 'bg-white/10 border-white/20 hover:shadow-white/10'
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        {/* Ícone/Imagem da Recompensa */}
                        <div className={`
                          flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center
                          ${getRewardIconBg(reward.type)}
                        `}>
                          {getRewardIcon(reward.type)}
                        </div>

                        {/* Informações da Recompensa */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={`text-lg font-bold ${
                                isLightMode ? 'text-gray-800' : 'text-white'
                              }`}>
                                {reward.name}
                              </h3>
                              {reward.description && (
                                <p className={`text-sm ${
                                  isLightMode ? 'text-gray-600' : 'text-white/70'
                                }`}>
                                  {reward.description}
                                </p>
                              )}
                            </div>

                            {/* Badge de Tipo */}
                            <div className={`
                              px-3 py-1 rounded-full text-xs font-semibold
                              ${getRewardTypeBadge(reward.type)}
                            `}>
                              {getRewardTypeLabel(reward.type)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              {/* Data de Recebimento */}
                              <div className={`flex items-center gap-2 text-sm ${
                                isLightMode ? 'text-gray-600' : 'text-white/70'
                              }`}>
                                <Calendar className="h-4 w-4" />
                                Conquistado em: {reward.dateReceived.toLocaleDateString('pt-BR')}
                              </div>

                              {/* Status (se aplicável) */}
                              {reward.status && (
                                <div className={`flex items-center gap-2 text-sm ${
                                  isLightMode ? 'text-gray-600' : 'text-white/70'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(reward.status)}`} />
                                  Status: {getStatusLabel(reward.status)}
                                </div>
                              )}

                              {/* Código de Rastreio (se aplicável) */}
                              {reward.trackingCode && (
                                <div className={`flex items-center gap-2 text-sm ${
                                  isLightMode ? 'text-gray-600' : 'text-white/70'
                                }`}>
                                  <span>Rastreio:</span>
                                  <button
                                    onClick={() => window.open(`https://www.correios.com.br/precisa-de-ajuda/rastrea-objeto-correios?rastreio=${reward.trackingCode}`, '_blank')}
                                    className="text-orange-500 hover:text-orange-600 underline font-medium"
                                  >
                                    {reward.trackingCode}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Botão de Ação */}
                            {reward.action && (
                              <Button
                                onClick={() => handleRewardAction(reward)}
                                className={`
                                  ${reward.action.type === 'primary' 
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                                    : 'bg-transparent border border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'
                                  }
                                `}
                              >
                                {reward.action.icon && <reward.action.icon className="h-4 w-4 mr-2" />}
                                {reward.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                    {selectedAchievement.rewards.pontoSchools > 0 && (
                      <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Gift className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <div className="font-semibold text-orange-500">+{selectedAchievement.rewards.pontoSchools}</div>
                        <div className="text-xs text-orange-400">Ponto Schools</div>
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