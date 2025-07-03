import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Crown, Shield, UserMinus, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RemoverMembroModal from "./RemoverMembroModal";

interface MiniCardMembroGrupoProps {
  member: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline: boolean;
    lastActive: string;
  };
  groupId?: string;
  currentUserId?: string;
  groupCreatorId?: string;
}

const MiniCardMembroGrupo: React.FC<MiniCardMembroGrupoProps> = ({ 
  member, 
  groupId, 
  currentUserId,
  groupCreatorId 
}) => {
  const [showRemoverModal, setShowRemoverModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Verificar se o usuário atual é o criador do grupo
  const isCurrentUserCreator = currentUserId === groupCreatorId;

  // Verificar se o membro é o criador do grupo
  const isMemberCreator = member.id === groupCreatorId;

  // Verificar se pode remover este membro
  const canRemoveMember = isCurrentUserCreator && !isMemberCreator && member.id !== currentUserId;

  const handleRemoverClick = () => {
    console.log(`Iniciando processo de remoção para membro: ${member.name} (${member.id}) do grupo ${groupId}`);
    console.log(`Usuário atual: ${currentUserId}, É criador: ${isCurrentUserCreator}, Pode remover: ${canRemoveMember}`);
    console.log(`GroupCreatorId: ${groupCreatorId}, Member role: ${member.role}`);

    if (!canRemoveMember) {
      console.warn('Usuário não tem permissão para remover este membro');
      return;
    }

    setShowRemoverModal(true);
    setShowOptions(false);
  };

  const handleRemover = async () => {
    console.log(`Modal de remoção fechado para membro ${member.name}`);
    setShowRemoverModal(false);
  };

  const getRoleIcon = () => {
    if (isMemberCreator) {
      return <Crown className="h-3 w-3 text-yellow-500" />;
    }
    if (member.role === "Administrador") {
      return <Shield className="h-3 w-3 text-blue-500" />;
    }
    return null;
  };

  const getRoleBadgeColor = () => {
    if (isMemberCreator) {
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300";
    }
    if (member.role === "Administrador") {
      return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300";
    }
    return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-300";
  };

  const getDisplayRole = () => {
    if (isMemberCreator) {
      return "Criador";
    }
    return member.role || "Membro";
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar com indicador de status online */}
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-[#FF6B00] text-white font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {member.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#0f1525] rounded-full"></div>
              )}
            </div>

            {/* Informações do membro */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {member.name}
                </h4>
                {getRoleIcon()}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-xs px-2 py-1 border ${getRoleBadgeColor()}`}>
                  {getDisplayRole()}
                </Badge>

                {member.isOnline ? (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {member.lastActive || "Offline"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu de opções (apenas para criadores do grupo) */}
          {isCurrentUserCreator && (
            <Popover open={showOptions} onOpenChange={setShowOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-700" align="end">
                <div className="space-y-1">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                    onClick={() => {
                      console.log(`Iniciando conversa com ${member.name}`);
                      setShowOptions(false);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar mensagem
                  </button>

                  {canRemoveMember && (
                    <button 
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2"
                      onClick={handleRemoverClick}
                    >
                      <UserMinus className="h-4 w-4" />
                      Remover do grupo
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Modal de remoção */}
      <RemoverMembroModal
        isOpen={showRemoverModal}
        onClose={() => setShowRemoverModal(false)}
        memberName={member.name}
        memberId={member.id}
        groupId={groupId || ""}
      />
    </>
  );
};

export default MiniCardMembroGrupo;