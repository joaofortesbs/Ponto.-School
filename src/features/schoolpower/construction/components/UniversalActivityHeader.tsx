
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

interface UniversalActivityHeaderProps {
  activityTitle: string;
  activityIcon: React.ComponentType<{ className?: string }>;
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
}

export const UniversalActivityHeader: React.FC<UniversalActivityHeaderProps> = ({
  activityTitle,
  activityIcon: ActivityIcon,
  userName,
  userAvatar,
  onMoreOptions,
  schoolPoints = 100,
  onAddToClass,
  onDownload,
  onShare,
  onSendMaterial,
  onMakePrivate,
  onDelete
}) => {
  const userInfo = useUserInfo();
  const [isEditingSPs, setIsEditingSPs] = React.useState(false);
  const [currentSPs, setCurrentSPs] = React.useState(Math.max(schoolPoints, 100));
  const [tempSPs, setTempSPs] = React.useState(Math.max(schoolPoints, 100).toString());
  
  // Usar dados do hook se não forem fornecidos via props
  const finalUserName = userName || userInfo.name || 'Usuário';
  const finalUserAvatar = userAvatar || userInfo.avatar;
  
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
    const newSPs = Math.max(parseInt(tempSPs) || 100, 100);
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
    if (value === '' || (parseInt(value) >= 100 && parseInt(value) <= 9999)) {
      setTempSPs(value);
    }
  };

  return (
    <div className="universal-activity-header w-full h-28 bg-gradient-to-r from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-gray-800 dark:to-orange-950/20 border-b-2 border-orange-200 dark:border-orange-800/50 px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between h-full">
        {/* Lado Esquerdo - Ícone e Informações da Atividade */}
        <div className="flex items-center gap-4">
          {/* Ícone da Atividade */}
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg border border-orange-200 dark:border-orange-700/50">
            <ActivityIcon className="w-6 h-6 text-white" />
          </div>

          {/* Título e Professor */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {activityTitle}
            </h1>
            
            {/* Linha do Professor */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-6 h-6 rounded-xl border-2 border-orange-400 dark:border-orange-500">
                <AvatarImage src={finalUserAvatar} alt={`Prof. ${finalUserName}`} />
                <AvatarFallback className="text-sm bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl">
                  {getUserInitials(finalUserName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-base text-orange-700 dark:text-orange-300 font-medium">
                {userInfo.isLoading ? (
                  <div className="w-20 h-4 bg-orange-200 dark:bg-orange-800 animate-pulse rounded"></div>
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
            <Route className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Card de School Points */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl px-3 py-2 border border-orange-200 dark:border-orange-700/50 shadow-sm">
            <div className="flex items-center gap-2">
              {isEditingSPs ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempSPs}
                    onChange={handleSPsChange}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveSPs}
                    min="100"
                    max="9999"
                    className="w-12 text-sm font-semibold text-orange-700 dark:text-orange-400 bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">SPs</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  {currentSPs} SPs
                </span>
              )}
              <button onClick={handleEditSPs} className="hover:bg-orange-200/50 dark:hover:bg-orange-700/30 p-1 rounded transition-colors">
                <Pencil className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </button>
            </div>
          </div>

          {/* Dropdown de Mais Opções */}
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
              <DropdownMenuItem onClick={onAddToClass} className="cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-100/70 dark:hover:bg-orange-700/30 transition-colors">
                <Plus className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-800 dark:text-gray-200">Adicionar à aula</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload} className="cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-100/70 dark:hover:bg-orange-700/30 transition-colors">
                <Download className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-800 dark:text-gray-200">Baixar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare} className="cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-100/70 dark:hover:bg-orange-700/30 transition-colors">
                <Share2 className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-800 dark:text-gray-200">Compartilhar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSendMaterial} className="cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-100/70 dark:hover:bg-orange-700/30 transition-colors">
                <Send className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-800 dark:text-gray-200">Enviar material</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMakePrivate} className="cursor-pointer rounded-xl px-3 py-3 mb-2 hover:bg-orange-100/70 dark:hover:bg-orange-700/30 transition-colors">
                <Lock className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-800 dark:text-gray-200">Tornar privado</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer rounded-xl px-3 py-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <Trash2 className="w-4 h-4 mr-3 text-orange-600 dark:text-orange-400" />
                <span className="text-red-600 dark:text-red-400">Deletar atividade</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default UniversalActivityHeader;
