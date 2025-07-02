
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
  MapPin
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
}

export default function SobreTab({ group, onUpdate }: SobreTabProps) {
  const [activeSection, setActiveSection] = useState('informacoes-basicas');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'informacoes-basicas',
      label: 'Informações Básicas',
      icon: <Info className="h-4 w-4" />,
      description: 'Dados fundamentais do grupo'
    }
  ];

  const getVisibilityInfo = () => {
    if (group.is_public) {
      return {
        icon: <Globe className="h-4 w-4" />,
        label: 'Público',
        description: 'Visível para todos os usuários',
        color: 'bg-green-500/10 text-green-600 border-green-200'
      };
    } else if (group.is_visible_to_partners) {
      return {
        icon: <Users className="h-4 w-4" />,
        label: 'Parceiros',
        description: 'Visível apenas para parceiros',
        color: 'bg-blue-500/10 text-blue-600 border-blue-200'
      };
    } else {
      return {
        icon: <Lock className="h-4 w-4" />,
        label: 'Privado',
        description: 'Acesso restrito',
        color: 'bg-red-500/10 text-red-600 border-red-200'
      };
    }
  };

  const getGroupTypeLabel = (tipo: string) => {
    const types = {
      'estudo': 'Grupo de Estudo',
      'discussao': 'Grupo de Discussão',
      'projeto': 'Grupo de Projeto'
    };
    return types[tipo] || tipo;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const visibilityInfo = getVisibilityInfo();

  const renderInformacaoBasica = () => (
    <div className="space-y-6">
      {/* Header da Seção */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Informações Básicas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dados fundamentais e configurações do grupo
          </p>
        </div>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Principal */}
        <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-[#FF6B00]" />
              Detalhes do Grupo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome do Grupo
                </label>
                <p className="text-base text-gray-900 dark:text-white font-medium">
                  {group.nome}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {group.descricao || 'Nenhuma descrição fornecida'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Grupo
                </label>
                <Badge variant="outline" className="mt-1 bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                  {getGroupTypeLabel(group.tipo_grupo)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Configurações */}
        <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Eye className="h-5 w-5 text-[#FF6B00]" />
              Configurações de Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visibilidade
                </label>
                <div className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-lg border ${visibilityInfo.color}`}>
                  {visibilityInfo.icon}
                  <div>
                    <p className="font-medium text-sm">{visibilityInfo.label}</p>
                    <p className="text-xs opacity-80">{visibilityInfo.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código de Acesso
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm border">
                    {group.codigo_unico}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Informações Acadêmicas */}
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
            Informações Acadêmicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Disciplina/Área
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {group.disciplina_area || 'Não especificado'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tópico Específico
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {group.topico_especifico || 'Não especificado'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Criação
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(group.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Tags */}
      {group.tags && group.tags.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Tag className="h-5 w-5 text-[#FF6B00]" />
              Tags do Grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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
    <div className="flex h-full min-h-[600px] bg-gray-50 dark:bg-[#0f1525] rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-[#1a2332] border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sobre o Grupo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Informações detalhadas
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-lg transition-all duration-200 text-left group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 border border-[#FF6B00]/20 text-[#FF6B00]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${
                    activeSection === item.id ? 'text-[#FF6B00]' : ''
                  }`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Mais seções em breve
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
