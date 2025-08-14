import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Target, BookOpen, FileText, Brain } from 'lucide-react';
import { SequenciaDidaticaResult, SequenciaDidaticaAula } from './SequenciaDidaticaBuilder';
import { AulaCard } from './components/AulaCard';
import { DiagnosticoCard } from './components/DiagnosticoCard';
import { AvaliacaoCard } from './components/AvaliacaoCard';
import { SequenciaDidaticaHeader } from './components/SequenciaDidaticaHeader';

interface SequenciaDidaticaPreviewProps {
  data?: SequenciaDidaticaResult | null;
  isLoading?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
}

export function SequenciaDidaticaPreview({ 
  data, 
  isLoading = false, 
  onSave, 
  onEdit 
}: SequenciaDidaticaPreviewProps) {
  const [displayData, setDisplayData] = useState<SequenciaDidaticaResult | null>(null);

  useEffect(() => {
    console.log('🎯 SequenciaDidaticaPreview: Dados recebidos:', data);

    if (data) {
      setDisplayData(data);
    } else {
      // Tentar carregar dados do localStorage como fallback
      try {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('sequencia_didatica_')
        );

        if (keys.length > 0) {
          const latestKey = keys.sort().pop();
          const storedData = localStorage.getItem(latestKey!);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('📂 Dados carregados do localStorage:', parsedData);
            setDisplayData(parsedData);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do localStorage:', error);
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 dark:text-gray-300">
              Gerando sequência didática...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!displayData || !displayData.aulas || displayData.aulas.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma sequência didática encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Configure os dados nos campos acima e clique em "Gerar Sequência" para criar sua sequência didática personalizada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCard = (aula: SequenciaDidaticaAula, index: number) => {
    const baseProps = {
      key: aula.id,
      aula,
      index,
      onEdit: () => onEdit?.(),
    };

    switch (aula.tipo) {
      case 'Diagnostico':
        return <DiagnosticoCard {...baseProps} />;
      case 'Avaliacao':
        return <AvaliacaoCard {...baseProps} />;
      default:
        return <AulaCard {...baseProps} />;
    }
  };

  const organizeAulasByRows = (aulas: SequenciaDidaticaAula[]) => {
    const rows: SequenciaDidaticaAula[][] = [];
    for (let i = 0; i < aulas.length; i += 3) {
      rows.push(aulas.slice(i, i + 3));
    }
    return rows;
  };

  const aulasSorted = [...displayData.aulas].sort((a, b) => a.ordem - b.ordem);
  const aulasRows = organizeAulasByRows(aulasSorted);

  return (
    <div className="space-y-6">
      {/* Header com informações gerais */}
      <SequenciaDidaticaHeader 
        metadados={displayData.metadados}
        totalAulas={displayData.aulas.length}
      />

      {/* Grid de aulas organizadas */}
      <div className="space-y-4">
        {aulasRows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {row.map((aula, index) => renderCard(aula, rowIndex * 3 + index))}
          </motion.div>
        ))}
      </div>

      {/* Footer com ações */}
      {(onSave || onEdit) && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Sequência didática gerada com sucesso
              </span>
            </div>
            <div className="flex items-center gap-3">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                >
                  Editar
                </Button>
              )}
              {onSave && (
                <Button 
                  size="sm"
                  onClick={onSave}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Salvar Sequência
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SequenciaDidaticaPreview;