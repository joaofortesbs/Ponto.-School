
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConstructionActivity } from './types';
import { ConstructionCard } from './ConstructionCard';
import { EditActivityModal } from './EditActivityModal';
import { ActivityViewModal } from './ActivityViewModal';
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
  
  // Estados para modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);

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

  // Função para abrir modal de edição
  const handleEditActivity = (atividade: AtividadeHistorico) => {
    console.log('✏️ Abrindo modal de edição para:', atividade.title);
    setSelectedActivity(atividade);
    setIsEditModalOpen(true);
  };

  // Função para abrir modal de visualização
  const handleViewActivity = (atividade: AtividadeHistorico) => {
    console.log('👁️ Abrindo modal de visualização para:', atividade.title);
    setSelectedActivity(atividade);
    setIsViewModalOpen(true);
  };

  // Função para compartilhar atividade
  const handleShareActivity = (activityId: string) => {
    console.log('📤 Compartilhando atividade do histórico:', activityId);
    // Implementar funcionalidade de compartilhamento
  };

  // Função para salvar alterações da atividade
  const handleSaveActivity = async (activityData: any) => {
    try {
      console.log('💾 Salvando alterações da atividade:', activityData);
      
      // Atualizar dados no localStorage
      const activityKey = `activity_${activityData.id}`;
      localStorage.setItem(activityKey, JSON.stringify(activityData));
      
      // Atualizar informações de construção
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activityData.id] = {
        ...constructedActivities[activityData.id],
        updatedAt: new Date().toISOString(),
        generatedContent: activityData.generatedContent || activityData
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      // Recarregar histórico para refletir mudanças
      carregarHistoricoAtividades();
      
      console.log('✅ Atividade salva com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
    }
  };

  // Função para atualizar atividade
  const handleUpdateActivity = async (activity: any) => {
    try {
      console.log('🔄 Atualizando atividade:', activity);
      await handleSaveActivity(activity);
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
    }
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
    <>
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
                {/* Card usando o componente ConstructionCard exato */}
                <ConstructionCard
                  id={atividade.id}
                  title={atividade.title}
                  description={atividade.description}
                  progress={atividade.progress}
                  type={atividade.type}
                  status={atividade.status}
                  onEdit={() => handleEditActivity(atividade)}
                  onView={() => handleViewActivity(atividade)}
                  onShare={() => handleShareActivity(atividade.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de Edição */}
      <EditActivityModal
        isOpen={isEditModalOpen}
        activity={selectedActivity}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={handleSaveActivity}
        onUpdateActivity={handleUpdateActivity}
      />

      {/* Modal de Visualização */}
      <ActivityViewModal
        isOpen={isViewModalOpen}
        activity={selectedActivity}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedActivity(null);
        }}
      />
    </>
  );
}
