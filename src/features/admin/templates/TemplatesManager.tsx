
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { useTemplates } from './hooks/useTemplates';
import TemplateCard from './TemplateCard';
import TemplateEditor from './TemplateEditor';
import { Template, TemplateFilters } from './types';
import { toast } from '@/components/ui/use-toast';

const TemplatesManager: React.FC = () => {
  const { templates, isLoading, error, refetch, updateTemplate, deleteTemplate } = useTemplates();
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !template.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && template.category !== filters.category) {
      return false;
    }
    if (filters.difficulty && template.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.enabled !== undefined && template.enabled !== filters.enabled) {
      return false;
    }
    return true;
  });

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    // Implementar modal de visualização se necessário
    toast({
      title: "Visualizar Template",
      description: `Template: ${template.name}`,
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este template?')) {
      const success = await deleteTemplate(id);
      if (success) {
        toast({
          title: "Template deletado",
          description: "O template foi removido com sucesso.",
        });
      }
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    const success = await updateTemplate(id, { enabled });
    if (success) {
      toast({
        title: enabled ? "Template ativado" : "Template desativado",
        description: `O template foi ${enabled ? 'ativado' : 'desativado'} com sucesso.`,
      });
    }
  };

  const handleSaveTemplate = async (templateData: Partial<Template>) => {
    if (selectedTemplate) {
      const success = await updateTemplate(selectedTemplate.id, templateData);
      if (success) {
        toast({
          title: "Template atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
        setIsEditorOpen(false);
        setSelectedTemplate(null);
      }
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(templates.map(t => t.category))];
    return categories.sort();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Gerenciamento de Templates
          </h2>
          <p className="text-gray-300">
            Gerencie e edite templates de atividades do School Power
          </p>
        </div>
        <Card className="bg-[#0A2540] border-red-500/20">
          <CardContent className="pt-6">
            <div className="text-center text-red-400">
              <p className="mb-4">Erro ao carregar templates: {error}</p>
              <Button onClick={refetch} variant="outline" className="border-red-500/30 text-red-400">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Gerenciamento de Templates
          </h2>
          <p className="text-gray-300">
            Gerencie e edite templates de atividades do School Power
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refetch}
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-[#0A2540] border-[#FF6B00]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar templates..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-[#001427] border-[#FF6B00]/30 text-white"
              />
            </div>
            
            <Select
              value={filters.category || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}
            >
              <SelectTrigger className="bg-[#001427] border-[#FF6B00]/30 text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.difficulty || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value || undefined }))}
            >
              <SelectTrigger className="bg-[#001427] border-[#FF6B00]/30 text-white">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as dificuldades</SelectItem>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.enabled?.toString() || ''}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                enabled: value === '' ? undefined : value === 'true' 
              }))}
            >
              <SelectTrigger className="bg-[#001427] border-[#FF6B00]/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="true">Ativados</SelectItem>
                <SelectItem value="false">Desativados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0A2540] border-[#FF6B00]/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{templates.length}</div>
              <div className="text-sm text-gray-300">Total de Templates</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A2540] border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {templates.filter(t => t.enabled).length}
              </div>
              <div className="text-sm text-gray-300">Ativados</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A2540] border-red-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {templates.filter(t => !t.enabled).length}
              </div>
              <div className="text-sm text-gray-300">Desativados</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A2540] border-blue-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{filteredTemplates.length}</div>
              <div className="text-sm text-gray-300">Filtrados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade de Templates */}
      <Card className="bg-[#0A2540] border-[#FF6B00]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Templates Disponíveis</CardTitle>
            <Badge variant="outline" className="text-gray-300">
              {filteredTemplates.length} template(s)
            </Badge>
          </div>
          <CardDescription className="text-gray-300">
            Lista de todos os templates de atividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 bg-gray-700/20 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onToggleEnabled={handleToggleEnabled}
                  onView={handleViewTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                {filters.search || filters.category || filters.difficulty || filters.enabled !== undefined
                  ? 'Nenhum template encontrado com os filtros aplicados.'
                  : 'Nenhum template encontrado.'}
              </p>
              {(filters.search || filters.category || filters.difficulty || filters.enabled !== undefined) && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {isEditorOpen && selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedTemplate(null);
          }}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
};

export default TemplatesManager;
