
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Eye, 
  Edit3,
  FileText,
  BookOpen,
  Calculator,
  Gamepad2,
  Users,
  PenTool,
  Presentation,
  Brain,
  Target,
  Zap,
  Search,
  MessageSquare,
  ThumbsUp,
  Heart,
  Wrench,
  Star,
  Compass,
  Trophy,
  Award,
  Microscope,
  Palette,
  Camera,
  Video,
  Headphones,
  Lightbulb,
  Flag,
  Key,
  Shield,
  TreePine,
  Sun,
  Cloud,
  Home,
  Car,
  MapPin,
  Music,
  Globe,
  Puzzle,
  CheckSquare,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressCircle } from './ProgressCircle';
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';

interface ConstructionActivityProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in-progress' | 'completed' | 'pending';
  onEdit: () => void;
  onView: (activityData?: any) => void;
  onShare: (activityId: string) => void;
}

// Mapeamento de ícones idêntico ao CardDeConstrucao.tsx
const getIconByActivityId = (activityId: string) => {
  // 100% unique mapping system - cada ID tem seu ícone específico
  const uniqueIconMapping: { [key: string]: any } = {
    "atividade-adaptada": Heart,
    "atividades-contos-infantis": BookOpen,
    "atividades-ia": Brain,
    "atividades-matematica": Target,
    "atividades-ortografia-alfabeto": PenTool,
    "aulas-eletivas": Star,
    "bncc-descomplicada": BookOpen,
    "caca-palavras": Puzzle,
    "capitulo-livro": BookOpen,
    "charadas": Puzzle,
    "chatbot-bncc": MessageSquare,
    "consulta-video": Video,
    "corretor-gramatical": CheckSquare,
    "corretor-provas-feedback": CheckSquare,
    "corretor-provas-papel": FileText,
    "corretor-questoes": PenTool,
    "corretor-redacao": PenTool,
    "criterios-avaliacao": CheckSquare,
    "desenho-simetrico": Puzzle,
    "desenvolvimento-caligrafia": PenTool,
    "dinamicas-sala-aula": Users,
    "emails-escolares": MessageSquare,
    "erros-comuns": Search,
    "exemplos-contextualizados": BookOpen,
    "experimento-cientifico": Microscope,
    "fichamento-obra-literaria": BookOpen,
    "gerador-tracejados": PenTool,
    "historias-sociais": Heart,
    "ideias-atividades": Lightbulb,
    "ideias-aulas-acessiveis": Heart,
    "ideias-avaliacoes-adaptadas": Heart,
    "ideias-brincadeiras-infantis": Users,
    "ideias-confraternizacoes": Users,
    "ideias-datas-comemorativas": Calendar,
    "imagem-para-colorir": Palette,
    "instrucoes-claras": FileText,
    "jogos-educacionais-interativos": Gamepad2,
    "jogos-educativos": Puzzle,
    "lista-exercicios": FileText,
    "lista-vocabulario": BookOpen,
    "maquete": Wrench,
    "mapa-mental": Brain,
    "mensagens-agradecimento": Heart,
    "musica-engajar": Music,
    "niveador-textos": BookOpen,
    "objetivos-aprendizagem": Target,
    "palavras-cruzadas": Puzzle,
    "pei-pdi": Heart,
    "perguntas-taxonomia-bloom": MessageSquare,
    "pergunte-texto": MessageSquare,
    "plano-aula": BookOpen,
    "plano-ensino": BookOpen,
    "plano-recuperacao": Heart,
    "projeto": Wrench,
    "projeto-vida": Star,
    "proposta-redacao": PenTool,
    "prova": CheckSquare,
    "questoes-pdf": FileText,
    "questoes-site": Globe,
    "questoes-texto": FileText,
    "questoes-video": Video,
    "redacao": PenTool,
    "reescritor-texto": PenTool,
    "reflexao-incidente": MessageSquare,
    "relatorio": FileText,
    "relatorio-desempenho": Trophy,
    "resposta-email": MessageSquare,
    "revisor-gramatical": CheckSquare,
    "revisao-guiada": BookOpen,
    "resumo": FileText,
    "resumo-texto": FileText,
    "resumo-video": Video,
    "sequencia-didatica": BookOpen,
    "simulado": CheckSquare,
    "sugestoes-intervencao": Lightbulb,
    "tabela-apoio": Puzzle,
    "tarefa-adaptada": Heart,
    "texto-apoio": BookOpen,
    "gerar-questoes": PenTool,
    "apresentacao-slides": Target,
    "tornar-relevante": Star,
    "quiz-interativo": Gamepad2,
    "quadro-interativo": Brain
  };

  // Verificar se existe mapeamento direto para o ID
  if (uniqueIconMapping[activityId]) {
    return uniqueIconMapping[activityId];
  }

  // Sistema de fallback com hash consistente para IDs não mapeados
  const fallbackIcons = [
    BookOpen, FileText, PenTool, Search, Brain,
    Users, MessageSquare, Presentation, ThumbsUp, Heart,
    Wrench, Target, Compass, Trophy, Edit3,
    Calendar, Clock, CheckSquare, Star, Award,
    Microscope, Calculator, Eye, Globe, MapPin,
    Music, Palette, Camera, Video, Headphones,
    Lightbulb, Zap, Flag, Key, Shield,
    TreePine, Sun, Cloud, Home, Car
  ];

  // Gerar hash consistente baseado no ID
  let hash = 0;
  for (let i = 0; i < activityId.length; i++) {
    const char = activityId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const iconIndex = Math.abs(hash) % fallbackIcons.length;
  return fallbackIcons[iconIndex];
};

const getActivityNameById = (activityId: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === activityId);
  return activity ? activity.name : activityId;
};

// Função para truncar descrição em até 7 palavras
const truncateDescription = (description: string, maxWords: number = 7): string => {
  const words = description.split(' ');
  if (words.length <= maxWords) return description;
  return words.slice(0, maxWords).join(' ') + '...';
};

export function ConstructionCard({
  id,
  title,
  description,
  progress,
  type,
  status,
  onView,
  onShare,
  onEdit
}: ConstructionActivityProps) {
  const isCompleted = status === 'completed' || progress >= 100;
  const ActivityIcon = getIconByActivityId(id);
  const activityName = getActivityNameById(id);

  // Cores baseadas no status - otimizado para modo claro e escuro
  const cardTheme = isCompleted ? {
    borderColor: 'border-green-300 dark:border-green-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    iconBg: 'bg-green-500 dark:bg-green-600',
    iconColor: 'text-white',
    titleColor: 'text-green-800 dark:text-green-200',
    descColor: 'text-green-600 dark:text-green-300',
    buttonStyle: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white'
  } : {
    borderColor: 'border-orange-300 dark:border-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
    iconBg: 'bg-orange-500 dark:bg-orange-600',
    iconColor: 'text-white',
    titleColor: 'text-orange-800 dark:text-orange-200',
    descColor: 'text-orange-600 dark:text-orange-300',
    buttonStyle: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white'
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border-2 ${cardTheme.borderColor}
        ${cardTheme.bgColor} p-6 transition-all duration-300
        hover:shadow-lg dark:hover:shadow-2xl ${isCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'} group
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
      `}
    onClick={() => isCompleted && onView()}
    >
      {/* Botão de edição - só aparece quando construído */}
      {isCompleted && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 p-0 rounded-lg border-2 border-green-500 dark:border-green-400 bg-transparent hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 dark:text-green-400 shadow-md hover:shadow-lg transition-all"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Conteúdo principal do card */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Ícone da atividade */}
        <div className={`
          relative w-16 h-16 rounded-2xl ${cardTheme.iconBg} 
          flex items-center justify-center shadow-lg
          ${isCompleted ? 'group-hover:scale-110' : ''} transition-all duration-300
        `}>
          {/* Ícone original */}
          <ActivityIcon className={`h-8 w-8 ${cardTheme.iconColor} ${isCompleted ? 'group-hover:opacity-0 transition-opacity duration-0' : ''}`} />
          
          {/* Ícone de visualizar no hover - só para atividades construídas */}
          {isCompleted && (
            <Eye className={`h-8 w-8 ${cardTheme.iconColor} absolute opacity-0 group-hover:opacity-100 transition-opacity duration-0`} />
          )}

          {/* Indicador de progresso no ícone */}
          {!isCompleted && progress > 0 && (
            <div className="absolute -bottom-1 -right-1">
              <ProgressCircle progress={progress} size={20} />
            </div>
          )}

          {/* Indicador de conclusão */}
          {isCompleted && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
              <CheckCircle2 className="h-3 w-3 text-green-500 dark:text-green-400" />
            </div>
          )}
        </div>

        {/* Nome da atividade */}
        <h3 className={`
          text-lg font-bold ${cardTheme.titleColor} 
          leading-tight max-w-full
        `}>
          {activityName}
        </h3>

        {/* Descrição limitada a 7 palavras */}
        <p className={`
          text-sm ${cardTheme.descColor} 
          leading-relaxed min-h-[2.5rem] flex items-center
        `}>
          {truncateDescription(description, 7)}
        </p>

        {/* Status badge - apenas para não construídas */}
        {!isCompleted && (
          <div className="w-full flex justify-center">
            {progress > 0 ? (
              <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                <Clock className="h-3 w-3 mr-1" />
                Em Progresso
              </Badge>
            ) : (
              <Badge variant="outline" className="border-orange-200 dark:border-orange-600 text-orange-700 dark:text-orange-300">
                <Clock className="h-3 w-3 mr-1" />
                Pendente
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white dark:via-white/10 to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
    </motion.div>
  );
}
