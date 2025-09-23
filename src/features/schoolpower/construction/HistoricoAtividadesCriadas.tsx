
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConstructionActivity } from './types';
import { ConstructionCard } from './ConstructionCard';
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';

interface HistoricoAtividadesCriadasProps {
  onBack: () => void;
}

interface AtividadeHistorico extends ConstructionActivity {
  criadaEm: string;
  atualizadaEm?: string;
}

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
              
              // Criar objeto da atividade histórica compatível com ConstructionCard
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
                atualizadaEm: constructedInfo?.updatedAt,
                // Campos adicionais necessários para ConstructionActivity
                categoryId: activityId,
                categoryName: getActivityNameById(activityId),
                icon: activityId,
                tags: [],
                difficulty: 'Médio',
                estimatedTime: '30 min',
                originalData: parsedData
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

  const handleViewActivity = (atividade: AtividadeHistorico) => {
    console.log('👁️ Visualizando atividade do histórico:', atividade.title);
    // A funcionalidade de visualização será a mesma do ConstructionCard
    // Os dados já estão salvos no localStorage e serão carregados automaticamente
  };

  const handleEditActivity = (atividade: AtividadeHistorico) => {
    console.log('✏️ Editando atividade do histórico:', atividade.title);
    // A funcionalidade de edição será a mesma do ConstructionCard
  };

  const handleShareActivity = (activityId: string) => {
    console.log('📤 Compartilhando atividade do histórico:', activityId);
    // A funcionalidade de compartilhamento será a mesma do ConstructionCard
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

      {/* Lista de Atividades usando ConstructionCard */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
          {atividadesHistorico.map((atividade, index) => (
            <motion.div
              key={atividade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative group"
            >
              {/* Botão de remoção no canto superior direito */}
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoverAtividade(atividade.id);
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md"
                  title="Remover do histórico"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Card usando o componente ConstructionCard exato */}
              <ConstructionCard
                id={atividade.id}
                title={atividade.title}
                description={atividade.description}
                progress={atividade.progress}
                type={atividade.type}
                status={atividade.status}
                onEdit={() => handleEditActivity(atividade)}
                onView={(activityData) => handleViewActivity(activityData || atividade)}
                onShare={() => handleShareActivity(atividade.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
