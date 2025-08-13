
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  RefreshCw,
  LayoutGrid,
  Clock,
  List
} from 'lucide-react';

interface SequenciaDidaticaPreviewProps {
  data: any;
  activityData?: any;
  isBuilt?: boolean;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData,
  isBuilt = false 
}) => {
  console.log('📚 SequenciaDidaticaPreview - Dados recebidos:', { data, activityData, isBuilt });

  // Estados para edição
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  const [isEditingQuantities, setIsEditingQuantities] = useState(false);
  const [tempObjectives, setTempObjectives] = useState('');
  const [tempQuantities, setTempQuantities] = useState({
    aulas: 4,
    diagnosticos: 2,
    avaliacoes: 2
  });

  // Estado para visualização
  const [viewMode, setViewMode] = useState('cards');

  // Processar dados da sequência
  const sequenciaData = data || activityData || {};
  
  // Verificar se há dados válidos
  const hasValidData = sequenciaData && (
    sequenciaData.tituloTemaAssunto || 
    sequenciaData.title || 
    sequenciaData.aulas?.length > 0 ||
    Object.keys(sequenciaData).length > 5
  );

  console.log('🔍 Verificação de dados válidos:', {
    hasValidData,
    sequenciaDataKeys: Object.keys(sequenciaData),
    hasAulas: !!sequenciaData.aulas,
    aulaCount: sequenciaData.aulas?.length
  });

  // Extrair valores dos campos customizados
  const customFields = sequenciaData.customFields || {};
  const objetivosAprendizagem = customFields['Objetivos de Aprendizagem'] || 
    sequenciaData.objetivosAprendizagem || 
    'Desenvolver competências específicas da disciplina através de metodologias ativas';

  const quantidadeAulas = parseInt(customFields['Quantidade de Aulas'] || sequenciaData.quantidadeAulas) || 4;
  const quantidadeDiagnosticos = parseInt(customFields['Quantidade de Diagnósticos'] || sequenciaData.quantidadeDiagnosticos) || 2;
  const quantidadeAvaliacoes = parseInt(customFields['Quantidade de Avaliações'] || sequenciaData.quantidadeAvaliacoes) || 2;

  const handleRegenerateSequence = () => {
    console.log('🔄 Regenerando sequência didática...');
    // Implementar lógica de regeneração
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    console.log('👁️ Modo de visualização alterado para:', mode);
  };

  if (!hasValidData) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-600">
            Nenhum conteúdo gerado ainda
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Configure os campos necessários e gere a sequência didática para visualizar o conteúdo nesta seção.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho Flutuante */}
      <Card className="sticky top-4 z-10 bg-white/95 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Lado Esquerdo - Informações Principais */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Target className="text-orange-500" size={18} />
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Objetivos:</span>
                  <p className="text-xs text-gray-600 max-w-xs truncate">
                    {objetivosAprendizagem}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="text-blue-500" size={16} />
                  <Badge variant="outline" className="text-xs">
                    {quantidadeAulas} Aulas
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <BarChart3 className="text-green-500" size={16} />
                  <Badge variant="outline" className="text-xs">
                    {quantidadeDiagnosticos} Diagnósticos
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <CheckSquare className="text-purple-500" size={16} />
                  <Badge variant="outline" className="text-xs">
                    {quantidadeAvaliacoes} Avaliações
                  </Badge>
                </div>
              </div>
            </div>

            {/* Lado Direito - Controles */}
            <div className="flex items-center gap-3">
              {/* Seletor de Visualização */}
              <Select value={viewMode} onValueChange={handleViewModeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={14} />
                      Cards
                    </div>
                  </SelectItem>
                  <SelectItem value="timeline">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      Timeline
                    </div>
                  </SelectItem>
                  <SelectItem value="grade">
                    <div className="flex items-center gap-2">
                      <List size={14} />
                      Grade
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Botão Regenerar */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRegenerateSequence}
                className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
              >
                <RefreshCw size={14} />
                Regenerar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de Conteúdo Principal */}
      <div className="space-y-6">
        {viewMode === 'cards' && (
          <div className="grid gap-6">
            {/* Conteúdo será renderizado aqui baseado no modo de visualização */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Visualização em Cards</h3>
                  <p className="text-sm">
                    O conteúdo da sequência didática será exibido em formato de cards interativos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'timeline' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Visualização Timeline</h3>
                <p className="text-sm">
                  O conteúdo da sequência didática será exibido em formato de linha do tempo cronológica.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'grade' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <List size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Visualização em Grade</h3>
                <p className="text-sm">
                  O conteúdo da sequência didática será exibido em formato de grade organizacional.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informações de Geração */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
        Sequência didática gerada em {new Date().toLocaleDateString('pt-BR')} • Modo de visualização: {viewMode}
      </div>
    </div>
  );
};

export default SequenciaDidaticaPreview;
