
import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Edit3, Brain, CheckCircle, Clock } from 'lucide-react';
import { Template } from './types';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      case 'draft':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Rascunho';
    }
  };

  const getIAProviderColor = (provider: string) => {
    switch (provider) {
      case 'Gemini':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'OpenAI':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Claude':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:border-[#FF6B00]/30 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm leading-tight">
              {template.name}
            </h3>
            <p className="text-xs text-white/60 mt-1">
              ID: {template.id}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(template.status)} border text-xs`}
          >
            {getStatusIcon(template.status)}
            <span className="ml-1">{getStatusLabel(template.status)}</span>
          </Badge>
          
          <Badge 
            variant="outline" 
            className={`${getIAProviderColor(template.ia_provider)} border text-xs`}
          >
            <Brain className="h-3 w-3 mr-1" />
            {template.ia_provider}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button
          onClick={() => onEdit(template)}
          size="sm"
          className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
        >
          <Edit3 className="h-3 w-3 mr-2" />
          Editar Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
