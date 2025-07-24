
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Eye, Tag } from 'lucide-react';
import { Template } from './types';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onView: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onToggleEnabled,
  onView
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medio':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'dificil':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'planejamento': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'avaliacao': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'criacao': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'comunicacao': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'organizacao': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'geral': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || colors.geral;
  };

  return (
    <Card className={`bg-[#0A2540] border-[#FF6B00]/20 transition-all duration-200 hover:border-[#FF6B00]/40 hover:shadow-lg ${!template.enabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg font-semibold line-clamp-2">
              {template.name}
            </CardTitle>
            <CardDescription className="text-gray-300 mt-1 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          <Switch
            checked={template.enabled}
            onCheckedChange={(enabled) => onToggleEnabled(template.id, enabled)}
            className="ml-2"
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tags e Categoria */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getCategoryColor(template.category)}>
            {template.category}
          </Badge>
          <Badge className={getDifficultyColor(template.difficulty)}>
            {template.difficulty}
          </Badge>
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {template.apiType.toUpperCase()}
          </Badge>
        </div>

        {/* Tags do template */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(template)}
            className="flex-1 bg-transparent border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(template)}
            className="flex-1 bg-transparent border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Data de criação */}
        {template.created_at && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              Criado em: {new Date(template.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
