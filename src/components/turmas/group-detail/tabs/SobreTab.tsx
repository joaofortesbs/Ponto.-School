import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  Users, 
  Calendar, 
  Tag, 
  Globe, 
  Lock, 
  Eye,
  Settings,
  Hash,
  BookOpen,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface GroupData {
  id: string;
  nome: string;
  descricao: string;
  disciplina_area: string;
  topico_especifico: string;
  codigo_unico: string;
  tags: string[];
  is_public: boolean;
  is_private: boolean;
  is_visible_to_all: boolean;
  is_visible_to_partners: boolean;
  created_at: string;
  criador_id: string;
  tipo_grupo: string;
  member_count?: number;
}

interface SobreTabProps {
  groupId: string;
}

export default function SobreTab({ groupId }: SobreTabProps) {
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('informacoes-basicas');
  const { user } = useAuth();

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      // Buscar contagem de membros
      const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      setGroupData({
        ...data,
        member_count: memberCount || 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados do grupo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrivacyLabel = (groupData: GroupData) => {
    if (groupData.is_public) return 'Público';
    if (groupData.is_private) return 'Privado';
    if (groupData.is_visible_to_partners) return 'Visível para Parceiros';
    return 'Restrito';
  };

  const getPrivacyIcon = (groupData: GroupData) => {
    if (groupData.is_public) return <Globe className="w-4 h-4 text-green-500" />;
    if (groupData.is_private) return <Lock className="w-4 h-4 text-red-500" />;
    return <Eye className="w-4 h-4 text-blue-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const menuItems = [
    { id: 'informacoes-basicas', label: 'Informações Básicas', icon: Info }
  ];

  const renderInformacoesBasicas = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#FF6B00]" />
            <span>Informações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Nome do Grupo</label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-800 font-medium">{groupData?.nome}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Descrição</label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-700">{groupData?.descricao}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Disciplina/Área</label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-gray-800">{groupData?.disciplina_area}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Tópico Específico</label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-gray-800">{groupData?.topico_especifico}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Código Único</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
              <Hash className="w-4 h-4 text-gray-500" />
              <code className="text-lg font-mono text-[#FF6B00] font-bold">
                {groupData?.codigo_unico}
              </code>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Tags do Grupo</label>
            <div className="flex flex-wrap gap-2">
              {groupData?.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#FF6B00]" />
            <span>Controle de Privacidade e Acesso</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {groupData && getPrivacyIcon(groupData)}
              <div>
                <p className="font-medium text-gray-800">Status de Privacidade</p>
                <p className="text-sm text-gray-600">
                  {groupData && getPrivacyLabel(groupData)}
                </p>
              </div>
            </div>
            <Badge 
              variant={groupData?.is_public ? 'default' : 'secondary'}
              className={groupData?.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            >
              {groupData && getPrivacyLabel(groupData)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-600">Visível para Todos</span>
              <Badge variant={groupData?.is_visible_to_all ? 'default' : 'secondary'}>
                {groupData?.is_visible_to_all ? 'Sim' : 'Não'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-600">Visível para Parceiros</span>
              <Badge variant={groupData?.is_visible_to_partners ? 'default' : 'secondary'}>
                {groupData?.is_visible_to_partners ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#FF6B00]" />
            <span>Estatísticas do Grupo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-lg border">
              <Users className="w-8 h-8 text-[#FF6B00] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#FF6B00]">
                {groupData?.member_count || 0}
              </div>
              <p className="text-sm text-gray-600">Membros</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">
                {groupData?.created_at ? formatDate(groupData.created_at) : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Data de Criação</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border">
              <Tag className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">
                {groupData?.tags?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Tags</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando informações do grupo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Menu Lateral */}
      <div className="w-64 bg-[#2c3e50] text-white flex-shrink-0">
        <div className="p-6 border-b border-[#34495e]">
          <h3 className="text-lg font-semibold">Sobre o Grupo</h3>
          <p className="text-sm text-gray-300 mt-1">Informações detalhadas</p>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-[#34495e] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeSection === 'informacoes-basicas' && renderInformacoesBasicas()}
        </div>
      </div>
    </div>
  );
}