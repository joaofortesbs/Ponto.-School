
import React from 'react';
import { MoreHorizontal, Pencil, Route, Plus, Download, Share2, Send, Lock, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useUserInfo } from '../hooks/useUserInfo';
import schoolPowerActivities from '../../data/schoolPowerActivities.json';
import { ShareActivityModal } from '@/components/ui/share-activity-modal';
import { 
  Wrench, CheckSquare, Filter, 
  Trophy, Zap, Brain, Heart, 
  PenTool, Presentation, Search, MapPin, Calculator, Globe,
  Microscope, Palette, Music, Camera, Video, Headphones,
  Gamepad2, Puzzle, Award, Star, Flag, Compass,
  Upload, Share2 as ShareIcon, MessageSquare, ThumbsUp,
  Pause, SkipForward, Volume2, Wifi, Battery,
  Shield, Key, Mail, Phone, Home, Car, Plane,
  TreePine, Sun, Moon, Cloud, Umbrella, Snowflake, Triangle,
  BookOpen, FileText, Target, Users, Calendar, Lightbulb,
  Edit3, Eye, CheckCircle, Clock, Building2, Play
} from "lucide-react";

interface UniversalActivityHeaderProps {
  activityTitle: string;
  activityIcon?: React.ComponentType<{ className?: string }>;
  activityType?: string;
  activityId?: string; // Adicionar activityId para sincronização
  userName?: string;
  userAvatar?: string;
  onMoreOptions?: () => void;
  schoolPoints?: number;
  onAddToClass?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onSendMaterial?: () => void;
  onMakePrivate?: () => void;
  onDelete?: () => void;
  isSharedActivity?: boolean; // Nova prop para identificar página de compartilhamento
}

// Sistema de sincronização de ícones - EXATAMENTE igual ao CardDeConstrucao.tsx
const getIconByActivityId = (activityId: string) => {
  // 100% unique mapping system - cada ID tem seu próprio ícone específico
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
    "emails-escolares": Mail,
    "erros-comuns": Search,
    "exemplos-contextualizados": BookOpen,
    "experimento-cientifico": Microscope,
    "fichamento-obra-literaria": BookOpen,
    "gerador-tracejados": PenTool,
    "historias-sociais": Heart,
    "ideias-atividades": Lightbulb,
    "ideias-aulas-acessiveis": Heart,
    "ideias-avaliacoes-adaptadas": Heart,
    "ideias-brincadeiras-infantis": Play,
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
    "resposta-email": Mail,
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
    "tornar-relevante": Star
  };

  // Verifica se existe mapeamento direto para o ID
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

  // Gera hash consistente baseado no ID
  let hash = 0;
  for (let i = 0; i < activityId.length; i++) {
    const char = activityId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const iconIndex = Math.abs(hash) % fallbackIcons.length;
  return fallbackIcons[iconIndex];
};

export const UniversalActivityHeader: React.FC<UniversalActivityHeaderProps> = ({
  activityTitle,
  activityIcon: ActivityIcon,
  activityType,
  activityId, // Novo parâmetro para sincronização
  userName,
  userAvatar,
  onMoreOptions,
  schoolPoints = 100,
  onAddToClass,
  onDownload,
  onShare,
  onSendMaterial,
  onMakePrivate,
  onDelete,
  isSharedActivity = false // Nova prop com valor padrão
}) => {
  const userInfo = useUserInfo();
  const [isEditingSPs, setIsEditingSPs] = React.useState(false);
  const [currentSPs, setCurrentSPs] = React.useState(schoolPoints);
  const [tempSPs, setTempSPs] = React.useState(schoolPoints.toString());
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  
  // Usar dados do hook se não forem fornecidos via props
  const finalUserName = userName || userInfo.name || 'Usuário';
  const finalUserAvatar = userAvatar || userInfo.avatar;

  // Função para obter o ícone correto - SINCRONIZADA com CardDeConstrucao.tsx
  const getActivityIcon = () => {
    // PRIORIDADE 1: Se activityId foi fornecido, usar sistema de sincronização
    if (activityId) {
      console.log('🎯 UniversalActivityHeader: Usando ícone sincronizado para activityId:', activityId);
      return getIconByActivityId(activityId);
    }
    
    // PRIORIDADE 2: Se ActivityIcon foi passado diretamente
    if (ActivityIcon) {
      console.log('🎯 UniversalActivityHeader: Usando ícone passado via props');
      return ActivityIcon;
    }
    
    // PRIORIDADE 3: Buscar no schoolPowerActivities por activityType
    if (activityType && schoolPowerActivities) {
      const activity = schoolPowerActivities.find(act => 
        act.type === activityType || act.title === activityType || act.id === activityType
      );
      if (activity && activity.id) {
        console.log('🎯 UniversalActivityHeader: Encontrou atividade por tipo, usando ícone sincronizado para:', activity.id);
        return getIconByActivityId(activity.id);
      }
    }
    
    // FALLBACK: Ícone padrão
    console.log('🎯 UniversalActivityHeader: Usando ícone padrão (BookOpen)');
    return BookOpen;
  };

  const FinalActivityIcon = getActivityIcon();
  
  // Função para obter as iniciais do nome do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Funções para gerenciar edição de SPs
  const handleEditSPs = () => {
    setTempSPs(currentSPs.toString());
    setIsEditingSPs(true);
  };

  const handleSaveSPs = () => {
    const newSPs = parseInt(tempSPs) || 0;
    setCurrentSPs(newSPs);
    setIsEditingSPs(false);
  };

  const handleCancelEdit = () => {
    setTempSPs(currentSPs.toString());
    setIsEditingSPs(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveSPs();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSPsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir qualquer número positivo até 99999
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99999)) {
      setTempSPs(value);
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
    if (onShare) {
      onShare();
    }
  };

  // Definir estilo condicional baseado na prop isSharedActivity
  const headerStyle = isSharedActivity 
    ? { backgroundColor: '#021321' }
    : {};

  return (
    <div 
      className={`universal-activity-header w-full h-24 ${!isSharedActivity ? 'border-b-2 border-orange-200 dark:border-orange-800/50' : ''} px-6 py-4 shadow-sm rounded-t-2xl ${!isSharedActivity ? 'bg-gradient-to-r from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-gray-800 dark:to-orange-950/20' : ''}`}
      style={headerStyle}
    >
      <div className="flex items-center justify-between h-full">
        {/* Lado Esquerdo - Ícone e Informações da Atividade */}
        <div className="flex items-center gap-4">
          {/* Ícone da Atividade */}
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg border border-orange-200 dark:border-orange-700/50">
            <FinalActivityIcon className="w-6 h-6 text-white" />
          </div>

          {/* Título e Professor */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {activityTitle}
            </h1>
            
            {/* Linha do Professor */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-7 h-7 rounded-full border-2 border-orange-400 dark:border-orange-500">
                <AvatarImage src={finalUserAvatar} alt={`Prof. ${finalUserName}`} />
                <AvatarFallback className="text-base bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full">
                  {getUserInitials(finalUserName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-lg text-orange-700 dark:text-orange-300 font-medium">
                {userInfo.isLoading ? (
                  <div className="w-24 h-5 bg-orange-200 dark:bg-orange-800 animate-pulse rounded"></div>
                ) : (
                  `Prof. ${finalUserName}`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Controles */}
        <div className="flex items-center gap-3">
          {/* Card de Trilha */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl px-3 py-2 border border-orange-200 dark:border-orange-700/50 shadow-sm">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">0</span>
            </div>
          </div>

          {/* Card de School Points - Apenas visualização para página de compartilhamento */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl px-3 py-2 border border-orange-200 dark:border-orange-700/50 shadow-sm">
            <div className="flex items-center gap-2">
              {!isSharedActivity && isEditingSPs ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempSPs}
                    onChange={handleSPsChange}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveSPs}
                    min="0"
                    max="99999"
                    className="w-16 text-sm font-semibold text-orange-700 dark:text-orange-400 bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">SPs</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  {currentSPs} SPs
                </span>
              )}
              {!isSharedActivity && (
                <button onClick={handleEditSPs} className="hover:bg-orange-200/50 dark:hover:bg-orange-700/30 p-1 rounded transition-colors">
                  <Pencil className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                </button>
              )}
            </div>
          </div>

          {/* Dropdown de Mais Opções - Apenas se não for página de compartilhamento */}
          {!isSharedActivity && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50 shadow-sm"
                >
                  <MoreHorizontal className="w-5 h-5 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-52 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl border border-orange-200 dark:border-orange-700/50 shadow-lg p-2"
              >
                <DropdownMenuItem onClick={onAddToClass} className="group cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-200/80 dark:hover:bg-orange-600/40 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200">
                  <Plus className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
                  <span className="text-gray-800 dark:text-gray-200 group-hover:text-orange-800 dark:group-hover:text-orange-200 font-medium">Adicionar à aula</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload} className="group cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-200/80 dark:hover:bg-orange-600/40 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200">
                  <Download className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-200" />
                  <span className="text-gray-800 dark:text-gray-200 group-hover:text-orange-800 dark:group-hover:text-orange-200 font-medium">Baixar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareClick} className="group cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-200/80 dark:hover:bg-orange-600/40 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200">
                  <Share2 className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
                  <span className="text-gray-800 dark:text-gray-200 group-hover:text-orange-800 dark:group-hover:text-orange-200 font-medium">Compartilhar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSendMaterial} className="group cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-200/80 dark:hover:bg-orange-600/40 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200">
                  <Send className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:translate-x-1 transition-all duration-200" />
                  <span className="text-gray-800 dark:text-gray-200 group-hover:text-orange-800 dark:group-hover:text-orange-200 font-medium">Enviar material</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMakePrivate} className="group cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-200/80 dark:hover:bg-orange-600/40 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200">
                  <Lock className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-200" />
                  <span className="text-gray-800 dark:text-gray-200 group-hover:text-orange-800 dark:group-hover:text-orange-200 font-medium">Tornar privado</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="group cursor-pointer rounded-xl px-3 py-3 hover:bg-red-200/80 dark:hover:bg-red-600/40 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200">
                  <Trash2 className="w-4 h-4 mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
                  <span className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 font-medium">Deletar atividade</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Modal de Compartilhar */}
      <ShareActivityModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activityTitle={activityTitle}
        activityId={activityId || 'default-activity'}
        activityType={activityType || 'atividade'}
        activityData={{
          title: activityTitle,
          type: activityType || 'atividade',
          id: activityId || 'default-activity'
        }}
      />
    </div>
  );
};

export default UniversalActivityHeader;
