
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
  ChevronRight
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
}

export default function SobreTab({ group, onUpdate }: SobreTabProps) {
  const [activeSection, setActiveSection] = useState('informacoes-basicas');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'informacoes-basicas',
      label: 'Informações Básicas',
      icon: <Info className="h-4 w-4" />,
      description: 'Dados fundamentais do grupo',
      badge: 'Ativo'
    }
  ];

  const getVisibilityInfo = () => {
    if (group.is_public) {
      return {
        icon: <Globe className="h-5 w-5" />,
        label: 'Público',
        description: 'Visível para todos os usuários',
        color: 'from-emerald-500/20 to-green-400/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10'
      };
    } else if (group.is_visible_to_partners) {
      return {
        icon: <Users className="h-5 w-5" />,
        label: 'Parceiros',
        description: 'Visível apenas para parceiros',
        color: 'from-blue-500/20 to-cyan-400/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-500/10'
      };
    } else {
      return {
        icon: <Lock className="h-5 w-5" />,
        label: 'Privado',
        description: 'Acesso restrito',
        color: 'from-red-500/20 to-pink-400/20',
        textColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-500/10'
      };
    }
  };

  const getGroupTypeInfo = (tipo: string) => {
    const types = {
      'estudo': {
        label: 'Grupo de Estudo',
        icon: <BookOpen className="h-4 w-4" />,
        color: 'from-[#FF6B00]/20 to-orange-400/20',
        textColor: 'text-[#FF6B00]',
        iconBg: 'bg-[#FF6B00]/10'
      },
      'discussao': {
        label: 'Grupo de Discussão',
        icon: <Users className="h-4 w-4" />,
        color: 'from-purple-500/20 to-violet-400/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-500/10'
      },
      'projeto': {
        label: 'Grupo de Projeto',
        icon: <Star className="h-4 w-4" />,
        color: 'from-indigo-500/20 to-blue-400/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-500/10'
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6B00]/5 via-orange-50/50 to-amber-50/30 dark:from-[#FF6B00]/10 dark:via-gray-800/50 dark:to-gray-900/30 p-8 border border-[#FF6B00]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF6B00]/25">
                <Info className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {group.nome}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {group.descricao || 'Explore todas as informações e detalhes deste grupo de estudos'}
              </p>
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${groupTypeInfo.color} border border-[#FF6B00]/20`}>
                  <div className={`w-6 h-6 rounded-full ${groupTypeInfo.iconBg} flex items-center justify-center`}>
                    {groupTypeInfo.icon}
                  </div>
                  <span className={`font-medium text-sm ${groupTypeInfo.textColor}`}>
                    {groupTypeInfo.label}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${visibilityInfo.color} border border-gray-200/50 dark:border-gray-700/50`}>
                  <div className={`w-6 h-6 rounded-full ${visibilityInfo.iconBg} flex items-center justify-center`}>
                    {visibilityInfo.icon}
                  </div>
                  <span className={`font-medium text-sm ${visibilityInfo.textColor}`}>
                    {visibilityInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Detalhes Principais</h3>
                <p className="text-sm text-gray-500 font-normal">Informações essenciais</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina/Área</span>
                <span className="text-sm text-gray-900 dark:text-white font-semibold">
                  {group.disciplina_area || 'Não especificado'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tópico Específico</span>
                <span className="text-sm text-gray-900 dark:text-white font-semibold">
                  {group.topico_especifico || 'Não especificado'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data de Criação</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {formatDate(group.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Acesso */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Configurações</h3>
                <p className="text-sm text-gray-500 font-normal">Privacidade e acesso</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border bg-gradient-to-r ${visibilityInfo.color} border-gray-200/50 dark:border-gray-700/50`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${visibilityInfo.iconBg} flex items-center justify-center`}>
                    {visibilityInfo.icon}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${visibilityInfo.textColor}`}>{visibilityInfo.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{visibilityInfo.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Code className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Código de Acesso</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Código único do grupo</p>
                  </div>
                </div>
                <div className="mt-3">
                  <code className="inline-block px-4 py-2 bg-white dark:bg-gray-800 rounded-lg font-mono text-lg font-bold text-[#FF6B00] border-2 border-dashed border-[#FF6B00]/30 shadow-sm">
                    {group.codigo_unico}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags e Categorias */}
        {group.tags && group.tags.length > 0 && (
          <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Tags do Grupo</h3>
                  <p className="text-sm text-gray-500 font-normal">{group.tags.length} {group.tags.length === 1 ? 'tag' : 'tags'}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-[#FF6B00]/10 hover:to-orange-100/50 hover:text-[#FF6B00] transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas */}
      <Card className="border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Informações Adicionais</h3>
              <p className="text-sm text-gray-500 font-normal">Dados complementares do grupo</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium uppercase tracking-wide">Criado em</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                    {new Date(group.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium uppercase tracking-wide">Tipo</p>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                    {groupTypeInfo.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/50 dark:border-purple-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium uppercase tracking-wide">Código</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 text-sm">
                    {group.codigo_unico}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200/50 dark:border-orange-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  {visibilityInfo.icon}
                </div>
                <div>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium uppercase tracking-wide">Visibilidade</p>
                  <p className="font-semibold text-orange-900 dark:text-orange-100 text-sm">
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

  const renderContent = () => {
    switch (activeSection) {
      case 'informacoes-basicas':
        return renderInformacaoBasica();
      default:
        return renderInformacaoBasica();
    }
  };

  return (
    <div className="flex h-full min-h-[700px] bg-gradient-to-br from-gray-50/80 via-white to-gray-100/60 dark:from-gray-900/80 dark:via-gray-800 dark:to-gray-900/60 rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      {/* Modern Sidebar */}
      <div className="w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-r border-gray-200/60 dark:border-gray-700/60 flex flex-col shadow-lg">
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-[#FF6B00]/5 to-orange-50/30 dark:from-[#FF6B00]/10 dark:to-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-orange-600 flex items-center justify-center shadow-xl shadow-[#FF6B00]/25">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Sobre o Grupo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Informações completas e detalhadas
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-6">
          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 text-left ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#FF6B00]/10 via-orange-50/80 to-[#FF6B00]/5 border-2 border-[#FF6B00]/20 shadow-lg shadow-[#FF6B00]/10 transform scale-[1.02]'
                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/80 dark:hover:from-gray-700/30 dark:hover:to-gray-600/20 border-2 border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/30 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold text-sm transition-colors ${
                        activeSection === item.id ? 'text-[#FF6B00]' : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.label}
                      </p>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'text-[#FF6B00] transform rotate-90' 
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`} />
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-700/30">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/50 border border-[#FF6B00]/20">
              <Sparkles className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Mais seções em breve
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-white/60 via-gray-50/80 to-white/40 dark:from-gray-800/60 dark:via-gray-900/80 dark:to-gray-800/40">
        {/* Content Header */}
        <div className="p-8 border-b border-gray-200/30 dark:border-gray-700/30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Informações Básicas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Explore todos os detalhes e configurações do grupo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                <Info className="h-3 w-3 mr-1" />
                Seção Ativa
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
