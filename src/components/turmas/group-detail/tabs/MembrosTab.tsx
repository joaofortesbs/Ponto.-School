
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Crown, 
  Shield, 
  User, 
  MoreHorizontal,
  UserPlus,
  MessageCircle,
  Settings,
  UserMinus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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
}

interface MembrosTabProps {
  groupId: string;
}

export default function MembrosTab({ groupId }: MembrosTabProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'admins'>('all');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles!group_members_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const formattedMembers = data?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role || 'member',
        joined_at: member.joined_at,
        display_name: member.profiles?.display_name || 'Usuário',
        avatar_url: member.profiles?.avatar_url || '',
        is_online: Math.random() > 0.5, // Simulação de status online
        contribution_level: Math.floor(Math.random() * 100)
      })) || [];

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setIsLoading(false);
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

  const handleRemoveUser = (member: Member) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  const handleCloseRemoveModal = () => {
    setShowRemoveModal(false);
    setSelectedMember(null);
  };

  const handleConfirmRemove = () => {
    // Função para remover usuário (implementação futura)
    console.log('Removendo usuário:', selectedMember?.display_name);
    handleCloseRemoveModal();
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
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-[#FF6B00]"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-[#FF6B00]"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => handleRemoveUser(member)}
                        title="Retirar usuário"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação para Remover Usuário */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserMinus className="w-5 h-5 text-red-500" />
              <span>Remover Membro</span>
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {selectedMember?.display_name} do grupo?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedMember?.avatar_url} />
                <AvatarFallback>
                  {selectedMember?.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-800">{selectedMember?.display_name}</p>
                <p className="text-sm text-gray-500">
                  {getRoleLabel(selectedMember?.role || 'member')}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O usuário será removido do grupo e perderá acesso a todas as discussões e materiais.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCloseRemoveModal}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={true}
              className="px-4 py-2 bg-gray-300 text-gray-500 cursor-not-allowed"
              title="Funcionalidade em desenvolvimento"
            >
              Retirar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
