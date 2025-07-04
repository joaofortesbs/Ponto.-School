
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Crown, 
  Shield, 
  User, 
  UserPlus,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { blockService } from '@/services/blockService';
import BloquearMembroModal from '../mini-cards-membros-grupodeestudos/BloquearMembroModal';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  display_name: string;
  avatar_url?: string;
  is_online?: boolean;
  last_seen?: string;
  contribution_level?: number;
  isBlocked?: boolean;
}

interface MembrosTabProps {
  groupId: string;
}

const MembrosTab: React.FC<MembrosTabProps> = ({ 
  groupId
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'admins'>('all');
  const [isGroupCreator, setIsGroupCreator] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
    checkUserPermissions();
  }, [groupId]);

  const checkUserPermissions = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setCurrentUser(currentUser);

      const { data: groupData, error } = await supabase
        .from('grupos_estudo')
        .select('criador_id')
        .eq('id', groupId)
        .single();

      if (error) {
        console.error('Erro ao verificar permissões:', error);
        return;
      }

      setIsGroupCreator(groupData?.criador_id === currentUser.id);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  };

  const loadMembers = async () => {
    try {
      setIsLoading(true);

      // Buscar membros do grupo
      const { data: membersData, error: membersError } = await supabase
        .from('membros_grupos')
        .select(`
          user_id,
          joined_at,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('grupo_id', groupId);

      if (membersError) {
        console.error('Erro ao carregar membros:', membersError);
        toast({
          title: "Erro",
          description: "Erro ao carregar membros do grupo",
          variant: "destructive"
        });
        return;
      }

      // Buscar dados do criador do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select(`
          criador_id,
          profiles:criador_id (
            display_name,
            avatar_url
          )
        `)
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Erro ao carregar dados do grupo:', groupError);
        return;
      }

      const formattedMembers: Member[] = [];

      // Adicionar criador primeiro
      if (groupData?.profiles) {
        formattedMembers.push({
          id: `member-${groupData.criador_id}`,
          user_id: groupData.criador_id,
          role: 'admin',
          joined_at: new Date().toISOString(),
          display_name: groupData.profiles.display_name || 'Criador',
          avatar_url: groupData.profiles.avatar_url,
          is_online: Math.random() > 0.5,
          contribution_level: Math.floor(Math.random() * 100)
        });
      }

      // Adicionar outros membros
      if (membersData) {
        membersData.forEach((memberData: any) => {
          if (memberData.user_id !== groupData.criador_id) {
            formattedMembers.push({
              id: `member-${memberData.user_id}`,
              user_id: memberData.user_id,
              role: 'member',
              joined_at: memberData.joined_at,
              display_name: memberData.profiles?.display_name || 'Usuário',
              avatar_url: memberData.profiles?.avatar_url,
              is_online: Math.random() > 0.5,
              contribution_level: Math.floor(Math.random() * 100)
            });
          }
        });
      }

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar membros",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockMember = (memberId: string, memberName: string) => {
    setSelectedMember({ id: memberId, name: memberName });
    setBlockModalOpen(true);
  };

  const handleBlockConfirm = async () => {
    if (!selectedMember) return;

    try {
      const success = await blockService.blockUser(groupId, selectedMember.id);
      if (success) {
        toast({
          title: "Sucesso",
          description: `${selectedMember.name} foi bloqueado do grupo`,
        });
        
        // Remover membro da lista local
        setMembers(prev => prev.filter(member => member.user_id !== selectedMember.id));
        
        setBlockModalOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Erro ao bloquear membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao bloquear membro",
        variant: "destructive"
      });
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.display_name.toLowerCase().includes(searchTerm.toLowerCase());

    switch (selectedFilter) {
      case 'online':
        return matchesSearch && member.is_online;
      case 'admins':
        return matchesSearch && (member.role === 'admin' || member.role === 'moderator');
      default:
        return matchesSearch;
    }
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Membro';
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-[#FF6B00]" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Membros do Grupo</h3>
              <p className="text-sm text-gray-500">
                {members.length} {members.length === 1 ? 'membro' : 'membros'} no total
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Membros
          </Button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className={selectedFilter === 'all' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
            >
              Todos
            </Button>
            <Button
              variant={selectedFilter === 'online' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('online')}
              className={selectedFilter === 'online' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
            >
              Online
            </Button>
            <Button
              variant={selectedFilter === 'admins' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('admins')}
              className={selectedFilter === 'admins' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
            >
              Administradores
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando membros...</p>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum membro encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {member.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-800">{member.display_name}</h4>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            {getRoleLabel(member.role)}
                          </Badge>
                          <span>Entrou em {formatJoinDate(member.joined_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-[#FF6B00] rounded-full"></div>
                            <span className="text-xs text-gray-500">
                              Nível de contribuição: {member.contribution_level}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação - apenas para criadores do grupo */}
                    {isGroupCreator && member.user_id !== currentUser?.id && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlockMember(member.user_id, member.display_name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Bloquear
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Bloqueio */}
      <BloquearMembroModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setSelectedMember(null);
        }}
        memberName={selectedMember?.name || ''}
        memberId={selectedMember?.id || ''}
        groupId={groupId}
        onBlock={handleBlockConfirm}
      />
    </div>
  );
};

export default MembrosTab;
