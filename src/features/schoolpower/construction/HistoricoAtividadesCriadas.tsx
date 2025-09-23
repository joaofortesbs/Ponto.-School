
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, FileText, Download, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ConstructionActivity } from './types';
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';

interface HistoricoAtividadesCriadasProps {
  onBack: () => void;
}

interface AtividadeHistorico extends ConstructionActivity {
  criadaEm: string;
  atualizadaEm?: string;
}

// Função para obter ícone da atividade (mesma lógica do CardDeConstrucao)
const getIconByActivityId = (activityId: string) => {
  const uniqueIconMapping: { [key: string]: any } = {
    "flash-cards": FileText,
    "quiz-interativo": CheckCircle2,
    "plano-aula": FileText,
    "sequencia-didatica": FileText,
    "lista-exercicios": FileText,
    "prova": CheckCircle2,
    // ... outros mapeamentos podem ser adicionados conforme necessário
  };

  return uniqueIconMapping[activityId] || FileText;
};

// Função para obter nome da atividade
const getActivityNameById = (activityId: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === activityId);
  return activity ? activity.name : activityId;
};

export function HistoricoAtividadesCriadas({ onBack }: HistoricoAtividadesCriadasProps) {
  const [atividadesHistorico, setAtividadesHistorico] = useState<AtividadeHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistoricoAtividades();
  }, []);

  const carregarHistoricoAtividades = () => {
    console.log('📚 Carregando histórico de atividades criadas...');
    setLoading(true);

    try {
      const atividades: AtividadeHistorico[] = [];
      
      // Buscar todas as atividades construídas no localStorage
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      
      // Iterar por todas as chaves do localStorage para encontrar atividades salvas
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('activity_')) {
          const activityId = key.replace('activity_', '');
          const activityData = localStorage.getItem(key);
          
          if (activityData) {
            try {
              const parsedData = JSON.parse(activityData);
              const constructedInfo = constructedActivities[activityId];
              
              // Criar objeto da atividade histórica
              const atividadeHistorica: AtividadeHistorico = {
                id: activityId,
                title: parsedData.title || getActivityNameById(activityId),
                description: parsedData.description || 'Atividade criada',
                type: activityId,
                progress: 100,
                status: 'completed',
                customFields: parsedData.customFields || {},
                approved: true,
                isTrilhasEligible: false,
                isBuilt: true,
                builtAt: constructedInfo?.builtAt || new Date().toISOString(),
                criadaEm: constructedInfo?.builtAt || new Date().toISOString(),
                atualizadaEm: constructedInfo?.updatedAt
              };
              
              atividades.push(atividadeHistorica);
            } catch (parseError) {
              console.warn('❌ Erro ao parsear dados da atividade:', key);
            }
          }
        }
      }

      // Ordenar por data de criação (mais recente primeiro)
      atividades.sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());
      
      console.log('✅ Histórico carregado:', atividades.length, 'atividades encontradas');
      setAtividadesHistorico(atividades);
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverAtividade = (activityId: string) => {
    console.log('🗑️ Removendo atividade do histórico:', activityId);
    
    // Remover do localStorage
    localStorage.removeItem(`activity_${activityId}`);
    
    // Atualizar constructedActivities
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    delete constructedActivities[activityId];
    localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    
    // Atualizar estado local
    setAtividadesHistorico(prev => prev.filter(atividade => atividade.id !== activityId));
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#D65A00] flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Histórico de Atividades Criadas
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {atividadesHistorico.length} {atividadesHistorico.length === 1 ? 'atividade criada' : 'atividades criadas'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Lista de Atividades */}
      {atividadesHistorico.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma atividade no histórico
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            As atividades que você criar aparecerão aqui para fácil acesso posterior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {atividadesHistorico.map((atividade, index) => {
            const ActivityIcon = getIconByActivityId(atividade.id);
            
            return (
              <motion.div
                key={atividade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="relative overflow-hidden border-2 border-green-300 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-4">
                    {/* Botão de remoção */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoverAtividade(atividade.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3">
                      {/* Ícone da atividade */}
                      <div className="relative w-12 h-12 rounded-xl bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-md">
                        <ActivityIcon className="h-6 w-6 text-white" />
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                          <CheckCircle2 className="h-3 w-3 text-green-500 dark:text-green-400" />
                        </div>
                      </div>

                      {/* Título da atividade */}
                      <h3 className="text-sm font-bold text-green-800 dark:text-green-200 leading-tight line-clamp-2">
                        {atividade.title}
                      </h3>

                      {/* Descrição */}
                      <p className="text-xs text-green-600 dark:text-green-300 leading-relaxed line-clamp-2 min-h-[2rem]">
                        {atividade.description}
                      </p>

                      {/* Data de criação */}
                      <div className="w-full">
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatarData(atividade.criadaEm)}
                        </Badge>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 w-full">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white text-xs"
                          onClick={() => {
                            // Aqui você pode implementar a visualização da atividade
                            console.log('👁️ Visualizar atividade:', atividade.id);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30 text-xs"
                          onClick={() => {
                            // Aqui você pode implementar o compartilhamento
                            console.log('📤 Compartilhar atividade:', atividade.id);
                          }}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
