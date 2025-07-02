
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Info, 
  Users, 
  Calendar, 
  Tag, 
  Globe, 
  Lock, 
  Eye, 
  BookOpen,
  Clock,
  MapPin,
  Star,
  Shield,
  Settings,
  Code,
  Sparkles,
  ChevronRight,
  Zap,
  Trophy,
  Target,
  Brain,
  Heart,
  Activity,
  Layers,
  Database,
  FileText,
  Link as LinkIcon,
  Share2
} from "lucide-react";

interface SobreTabProps {
  group: any;
  onUpdate: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  color?: string;
  isActive?: boolean;
}

export default function SobreTab({ group, onUpdate }: SobreTabProps) {
  const [activeSection, setActiveSection] = useState('informacoes-basicas');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'informacoes-basicas',
      label: 'Informações Básicas',
      icon: <Info className="h-5 w-5" />,
      description: 'Dados fundamentais e configurações do grupo',
      badge: 'Ativo',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      isActive: true
    },
    {
      id: 'configuracoes-avancadas',
      label: 'Configurações Avançadas',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configurações detalhadas e permissões',
      badge: 'Em Breve',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      isActive: false
    },
    {
      id: 'analytics',
      label: 'Analytics & Métricas',
      icon: <Activity className="h-5 w-5" />,
      description: 'Estatísticas e análises do grupo',
      badge: 'Em Breve',
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      isActive: false
    },
    {
      id: 'historico',
      label: 'Histórico & Logs',
      icon: <FileText className="h-5 w-5" />,
      description: 'Histórico de atividades e logs',
      badge: 'Em Breve',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      isActive: false
    }
  ];

  const getVisibilityInfo = () => {
    if (group.is_public) {
      return {
        icon: <Globe className="h-6 w-6" />,
        label: 'Público',
        description: 'Visível para todos os usuários da plataforma',
        color: 'from-emerald-500/20 via-green-400/30 to-emerald-300/20',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/15',
        borderColor: 'border-emerald-200 dark:border-emerald-700/50'
      };
    } else if (group.is_visible_to_partners) {
      return {
        icon: <Users className="h-6 w-6" />,
        label: 'Parceiros',
        description: 'Visível apenas para usuários parceiros',
        color: 'from-blue-500/20 via-cyan-400/30 to-blue-300/20',
        textColor: 'text-blue-700 dark:text-blue-400',
        iconBg: 'bg-blue-500/15',
        borderColor: 'border-blue-200 dark:border-blue-700/50'
      };
    } else {
      return {
        icon: <Lock className="h-6 w-6" />,
        label: 'Privado',
        description: 'Acesso restrito apenas aos membros',
        color: 'from-red-500/20 via-pink-400/30 to-red-300/20',
        textColor: 'text-red-700 dark:text-red-400',
        iconBg: 'bg-red-500/15',
        borderColor: 'border-red-200 dark:border-red-700/50'
      };
    }
  };

  const getGroupTypeInfo = (tipo: string) => {
    const types = {
      'estudo': {
        label: 'Grupo de Estudo',
        icon: <BookOpen className="h-5 w-5" />,
        color: 'from-[#FF6B00]/20 via-orange-400/30 to-[#FF6B00]/20',
        textColor: 'text-[#FF6B00] dark:text-[#FF8C40]',
        iconBg: 'bg-[#FF6B00]/15',
        borderColor: 'border-[#FF6B00]/30'
      },
      'discussao': {
        label: 'Grupo de Discussão',
        icon: <Users className="h-5 w-5" />,
        color: 'from-purple-500/20 via-violet-400/30 to-purple-300/20',
        textColor: 'text-purple-700 dark:text-purple-400',
        iconBg: 'bg-purple-500/15',
        borderColor: 'border-purple-200 dark:border-purple-700/50'
      },
      'projeto': {
        label: 'Grupo de Projeto',
        icon: <Target className="h-5 w-5" />,
        color: 'from-indigo-500/20 via-blue-400/30 to-indigo-300/20',
        textColor: 'text-indigo-700 dark:text-indigo-400',
        iconBg: 'bg-indigo-500/15',
        borderColor: 'border-indigo-200 dark:border-indigo-700/50'
      }
    };
    return types[tipo] || types['estudo'];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const visibilityInfo = getVisibilityInfo();
  const groupTypeInfo = getGroupTypeInfo(group.tipo_grupo);

  const renderInformacaoBasica = () => (
    <div className="space-y-10">
      {/* Hero Section Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-800/90 dark:via-gray-900/80 dark:to-gray-800/60 p-10 border-2 border-gray-100/80 dark:border-gray-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent dark:via-gray-700/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF6B00]/10 via-orange-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 via-cyan-100/20 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF6B00] via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-[#FF6B00]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Info className="h-12 w-12 text-white relative z-10" />
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                  {group.nome}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {group.descricao || 'Explore todas as informações e detalhes deste grupo de estudos'}
                </p>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${groupTypeInfo.color} border-2 ${groupTypeInfo.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className={`w-8 h-8 rounded-xl ${groupTypeInfo.iconBg} flex items-center justify-center`}>
                    {groupTypeInfo.icon}
                  </div>
                  <span className={`font-bold text-base ${groupTypeInfo.textColor}`}>
                    {groupTypeInfo.label}
                  </span>
                </div>
                
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${visibilityInfo.color} border-2 ${visibilityInfo.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className={`w-8 h-8 rounded-xl ${visibilityInfo.iconBg} flex items-center justify-center`}>
                    {visibilityInfo.icon}
                  </div>
                  <span className={`font-bold text-base ${visibilityInfo.textColor}`}>
                    {visibilityInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Informações Principais */}
        <Card className="group hover:shadow-2xl transition-all duration-500 border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-br from-blue-50/80 to-cyan-50/40 dark:from-blue-900/20 dark:to-cyan-900/10">
            <CardTitle className="flex items-center gap-4 text-gray-900 dark:text-white">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Detalhes Principais</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Informações essenciais do grupo</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40 hover:from-gray-100/80 hover:to-gray-200/60 dark:hover:from-gray-700/80 dark:hover:to-gray-600/60 transition-all duration-300 border border-gray-200/50 dark:border-gray-600/30">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Disciplina/Área
                </span>
                <span className="text-sm text-gray-900 dark:text-white font-black bg-white/60 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                  {group.disciplina_area || 'Não especificado'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40 hover:from-gray-100/80 hover:to-gray-200/60 dark:hover:from-gray-700/80 dark:hover:to-gray-600/60 transition-all duration-300 border border-gray-200/50 dark:border-gray-600/30">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Tópico Específico
                </span>
                <span className="text-sm text-gray-900 dark:text-white font-black bg-white/60 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                  {group.topico_especifico || 'Não especificado'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40 hover:from-gray-100/80 hover:to-gray-200/60 dark:hover:from-gray-700/80 dark:hover:to-gray-600/60 transition-all duration-300 border border-gray-200/50 dark:border-gray-600/30">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Criação
                </span>
                <span className="text-sm text-gray-900 dark:text-white font-black bg-white/60 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                  {formatDate(group.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Acesso Premium */}
        <Card className="group hover:shadow-2xl transition-all duration-500 border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-br from-purple-50/80 to-pink-50/40 dark:from-purple-900/20 dark:to-pink-900/10">
            <CardTitle className="flex items-center gap-4 text-gray-900 dark:text-white">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-xl">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Configurações</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Privacidade e controle de acesso</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border-2 bg-gradient-to-r ${visibilityInfo.color} ${visibilityInfo.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${visibilityInfo.iconBg} flex items-center justify-center shadow-md`}>
                    {visibilityInfo.icon}
                  </div>
                  <div>
                    <p className={`font-black text-lg ${visibilityInfo.textColor}`}>{visibilityInfo.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{visibilityInfo.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center shadow-md">
                    <Code className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="font-black text-lg text-gray-900 dark:text-white">Código de Acesso</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Código único para entrada no grupo</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl font-mono text-2xl font-black text-[#FF6B00] border-2 border-dashed border-[#FF6B00]/40 shadow-lg text-center tracking-wider">
                      {group.codigo_unico}
                    </code>
                    <Button size="sm" variant="outline" className="px-4 py-2 rounded-xl border-2 hover:bg-[#FF6B00]/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags e Categorias Premium */}
        {group.tags && group.tags.length > 0 && (
          <Card className="group hover:shadow-2xl transition-all duration-500 border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-br from-emerald-50/80 to-green-50/40 dark:from-emerald-900/20 dark:to-green-900/10">
              <CardTitle className="flex items-center gap-4 text-gray-900 dark:text-white">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
                  <Tag className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Tags do Grupo</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{group.tags.length} {group.tags.length === 1 ? 'tag ativa' : 'tags ativas'}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3">
                {group.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-[#FF6B00]/10 hover:to-orange-100/50 hover:text-[#FF6B00] hover:border-[#FF6B00]/30 transition-all duration-300 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl font-bold text-sm shadow-md hover:shadow-lg"
                  >
                    <Tag className="h-3 w-3 mr-2" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas Premium */}
      <Card className="border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-900/20 dark:to-blue-900/10 pb-6">
          <CardTitle className="flex items-center gap-4 text-gray-900 dark:text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xl">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Informações Adicionais</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Dados complementares e estatísticas</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-2 border-blue-200/50 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center shadow-md">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-bold uppercase tracking-wide">Criado em</p>
                  <p className="font-black text-blue-900 dark:text-blue-100 text-base">
                    {new Date(group.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-2 border-emerald-200/50 dark:border-emerald-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shadow-md">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-bold uppercase tracking-wide">Tipo</p>
                  <p className="font-black text-emerald-900 dark:text-emerald-100 text-base">
                    {groupTypeInfo.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-2 border-purple-200/50 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center shadow-md">
                  <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 font-bold uppercase tracking-wide">Código</p>
                  <p className="font-black text-purple-900 dark:text-purple-100 text-base">
                    {group.codigo_unico}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-2 border-orange-200/50 dark:border-orange-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shadow-md">
                  {visibilityInfo.icon}
                </div>
                <div>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-bold uppercase tracking-wide">Visibilidade</p>
                  <p className="font-black text-orange-900 dark:text-orange-100 text-base">
                    {visibilityInfo.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmBreve = () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-gray-50/80 to-gray-100/60 dark:from-gray-800/80 dark:to-gray-900/60 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#FF6B00]/20 to-orange-200/30 flex items-center justify-center">
          <Zap className="h-12 w-12 text-[#FF6B00]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Em Desenvolvimento</h3>
        <p className="text-gray-600 dark:text-gray-400 font-medium max-w-md">
          Esta seção está sendo desenvolvida e estará disponível em breve com funcionalidades avançadas.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'informacoes-basicas':
        return renderInformacaoBasica();
      case 'configuracoes-avancadas':
      case 'analytics':
      case 'historico':
        return renderEmBreve();
      default:
        return renderInformacaoBasica();
    }
  };

  return (
    <div className="flex h-full min-h-[800px] bg-gradient-to-br from-gray-50/90 via-white to-blue-50/60 dark:from-gray-900/90 dark:via-gray-800 dark:to-gray-900/60 rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
      {/* Ultra Modern Sidebar */}
      <div className="w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r-2 border-gray-200/60 dark:border-gray-700/60 flex flex-col shadow-2xl">
        {/* Sidebar Header Premium */}
        <div className="p-10 border-b-2 border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-[#FF6B00]/5 via-orange-50/80 to-amber-50/30 dark:from-[#FF6B00]/10 dark:via-gray-800/50 dark:to-gray-900/50">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF6B00] via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-[#FF6B00]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Info className="h-8 w-8 text-white relative z-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Sobre o Grupo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Informações completas e detalhadas
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Premium */}
        <div className="flex-1 p-8">
          <nav className="space-y-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.isActive && setActiveSection(item.id)}
                disabled={!item.isActive}
                className={`w-full group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 text-left ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#FF6B00]/15 via-orange-50/90 to-[#FF6B00]/10 border-2 border-[#FF6B00]/30 shadow-2xl shadow-[#FF6B00]/15 transform scale-[1.02]'
                    : item.isActive
                    ? 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/80 dark:hover:from-gray-700/30 dark:hover:to-gray-600/20 border-2 border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/30 hover:shadow-xl'
                    : 'border-2 border-transparent opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeSection === item.id
                      ? 'bg-[#FF6B00] text-white shadow-xl shadow-[#FF6B00]/40'
                      : item.isActive
                      ? item.color + ' text-white shadow-lg group-hover:shadow-xl'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-bold text-base transition-colors ${
                        activeSection === item.id ? 'text-[#FF6B00]' : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.label}
                      </p>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-3 py-1 rounded-xl font-bold ${
                            item.badge === 'Ativo' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-all duration-500 ${
                    activeSection === item.id 
                      ? 'text-[#FF6B00] transform rotate-90' 
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`} />
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Premium */}
        <div className="p-8 border-t-2 border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/80 dark:to-gray-700/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/50 border-2 border-[#FF6B00]/20 shadow-lg">
              <Sparkles className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                Mais seções em breve
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Premium */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-white/60 via-gray-50/80 to-white/40 dark:from-gray-800/60 dark:via-gray-900/80 dark:to-gray-800/40">
        {/* Content Header Premium */}
        <div className="p-10 border-b-2 border-gray-200/30 dark:border-gray-700/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Informações Básicas'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Explore todos os detalhes e configurações do grupo
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-[#FF6B00]/10 text-[#FF6B00] border-2 border-[#FF6B00]/20 px-4 py-2 rounded-xl font-bold">
                <Info className="h-4 w-4 mr-2" />
                Seção Ativa
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Area Premium */}
        <div className="flex-1 p-10 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
