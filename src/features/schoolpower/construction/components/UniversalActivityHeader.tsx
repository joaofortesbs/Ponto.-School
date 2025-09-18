
import React from 'react';
import { MoreHorizontal, Pencil, Route } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserInfo } from '../hooks/useUserInfo';

interface UniversalActivityHeaderProps {
  activityTitle: string;
  activityIcon: React.ComponentType<{ className?: string }>;
  userName?: string;
  userAvatar?: string;
  onMoreOptions?: () => void;
  schoolPoints?: number;
}

export const UniversalActivityHeader: React.FC<UniversalActivityHeaderProps> = ({
  activityTitle,
  activityIcon: ActivityIcon,
  userName,
  userAvatar,
  onMoreOptions,
  schoolPoints = 100
}) => {
  const userInfo = useUserInfo();
  const [isEditingSPs, setIsEditingSPs] = React.useState(false);
  const [currentSPs, setCurrentSPs] = React.useState(schoolPoints);
  const [tempSPs, setTempSPs] = React.useState(schoolPoints.toString());
  
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
    const newSPs = parseInt(tempSPs) || 100;
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

  return (
    <div className="universal-activity-header w-full h-28 bg-gradient-to-r from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-gray-800 dark:to-orange-950/20 border-b-2 border-orange-200 dark:border-orange-800/50 px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between h-full">
        {/* Lado Esquerdo - Ícone e Informações da Atividade */}
        <div className="flex items-center gap-4">
          {/* Ícone da Atividade */}
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <ActivityIcon className="w-6 h-6 text-white" />
          </div>

          {/* Título e Professor */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {activityTitle}
            </h1>
            
            {/* Linha do Professor */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-6 h-6 rounded-xl">
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
                    onChange={(e) => setTempSPs(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveSPs}
                    className="w-12 text-sm font-semibold text-orange-700 dark:text-orange-400 bg-transparent border-none outline-none"
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

          {/* Botão de Mais Opções */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoreOptions}
            className="w-10 h-10 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50 shadow-sm"
          >
            <MoreHorizontal className="w-5 h-5 rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UniversalActivityHeader;
