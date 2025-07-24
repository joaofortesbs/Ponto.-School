import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Template } from './types';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit }) => {
  const getStatusColor = (status: string) => {
    return status === 'published' ? 'bg-green-500' : 'bg-yellow-500';
  };

  return (
    <Card className="bg-[#0A2540] border-[#FF6B00]/20 hover:border-[#FF6B00]/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-lg">{template.name}</CardTitle>
            <p className="text-gray-400 text-sm mt-1">ID: {template.id}</p>
          </div>
          <Badge className={`${getStatusColor(template.status)} text-white`}>
            {template.status === 'published' ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-gray-300 text-sm">
              <span className="font-medium">IA:</span> {template.ia_provider}
            </p>
          </div>
          <Button
            onClick={() => onEdit(template)}
            className="w-full bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;