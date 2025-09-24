
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
import activitiesApi, { ActivityData } from '@/services/activitiesApiService';
import { profileService } from '@/services/profileService';

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
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  
  // Estados para modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);

  useEffect(() => {
    carregarHistoricoAtividades();
  }, []);

  const carregarHistoricoAtividades = async () => {
    console.log('📚 Carregando histórico de atividades do banco de dados...');
    setLoading(true);
    setMigrationStatus('');

    try {
      // 1. Obter perfil do usuário atual para pegar o user_id correto
      const profile = await profileService.getCurrentUserProfile();
      if (!profile || !profile.id) {
        console.warn('⚠️ Usuário não encontrado ou sem ID');
        // Tentar carregar do localStorage como fallback
        await carregarDoLocalStorageFallback();
        return;
      }

      // Usar profile.id (UUID da tabela perfis) em vez de user_id
      const userId = profile.id;
      console.log('👤 Carregando atividades para usuário:', userId);

      // 2. Buscar atividades do banco de dados
      const apiResponse = await activitiesApi.getUserActivities(userId);
      
      if (apiResponse.success && apiResponse.data) {
        // Converter dados da API para formato do componente
        const atividadesDoBanco = apiResponse.data.map((activity: ActivityData) => 
          convertApiActivityToHistorico(activity)
        );

        console.log('✅ Atividades carregadas do banco:', atividadesDoBanco.length);
        
        // 3. Verificar se há atividades no localStorage para migrar
        const localStorageActivities = await verificarEMigrarLocalStorage(userId);
        
        // 4. Combinar atividades do banco com as migradas
        const todasAtividades = [...atividadesDoBanco, ...localStorageActivities];
        
        // Ordenar por data de atualização (mais recente primeiro)
        todasAtividades.sort((a, b) => 
          new Date(b.atualizadaEm || b.criadaEm).getTime() - 
          new Date(a.atualizadaEm || a.criadaEm).getTime()
        );
        
        setAtividadesHistorico(todasAtividades);
        
      } else {
        console.log('⚠️ Erro ao carregar atividades da API:', apiResponse.error);
        console.log('🔄 Tentando carregar do localStorage como fallback...');
        await carregarDoLocalStorageFallback();
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      // Fallback para localStorage em caso de erro
      await carregarDoLocalStorageFallback();
    } finally {
      setLoading(false);
      setMigrationStatus('');
    }
  };

  // Converter atividade da API para formato do histórico
  const convertApiActivityToHistorico = (activity: ActivityData): AtividadeHistorico => {
    return {
      id: activity.codigo_unico, // Usar código único como ID para compatibilidade
      title: activity.titulo || getActivityNameById(activity.tipo),
      description: activity.descricao || 'Atividade do banco de dados',
      type: activity.tipo,
      progress: 100,
      status: 'completed',
      customFields: {},
      approved: true,
      isTrilhasEligible: false,
      isBuilt: true,
      builtAt: activity.criado_em || new Date().toISOString(),
      criadaEm: activity.criado_em || new Date().toISOString(),
      atualizadaEm: activity.atualizado_em,
      // Campos adicionais necessários para ConstructionActivity
      categoryId: activity.tipo,
      categoryName: getActivityNameById(activity.tipo),
      icon: activity.tipo,
      tags: [],
      difficulty: 'Médio',
      estimatedTime: '30 min',
      originalData: activity.conteudo,
      // Adicionar dados específicos do banco
      codigoUnico: activity.codigo_unico,
      userId: activity.user_id
    };
  };

  // Verificar e migrar atividades do localStorage para o banco
  const verificarEMigrarLocalStorage = async (userId: string): Promise<AtividadeHistorico[]> => {
    try {
      setMigrationStatus('Verificando atividades locais para migração...');
      
      const atividadesMigradas: AtividadeHistorico[] = [];
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      
      // Iterar por todas as chaves do localStorage para encontrar atividades
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('activity_')) {
          const activityId = key.replace('activity_', '');
          const activityData = localStorage.getItem(key);
          
          if (activityData) {
            try {
              const parsedData = JSON.parse(activityData);
              const constructedInfo = constructedActivities[activityId];
              
              if (constructedInfo?.isBuilt) {
                setMigrationStatus(`Migrando atividade: ${activityId}...`);
                
                // Tentar migrar para o banco
                const migrationResult = await activitiesApi.migrateFromLocalStorage(
                  userId,
                  parsedData,
                  activityId
                );
                
                if (migrationResult.success && migrationResult.data) {
                  console.log('✅ Atividade migrada:', activityId);
                  
                  // Converter para formato do histórico
                  const atividadeMigrada = convertApiActivityToHistorico(migrationResult.data);
                  atividadesMigradas.push(atividadeMigrada);
                  
                  // Remover do localStorage após migração bem-sucedida
                  localStorage.removeItem(key);
                  delete constructedActivities[activityId];
                } else {
                  console.warn('⚠️ Falha na migração de:', activityId, migrationResult.error);
                }
              }
            } catch (parseError) {
              console.warn('❌ Erro ao parsear dados da atividade:', key);
            }
          }
        }
      }
      
      // Atualizar localStorage removendo atividades migradas
      if (Object.keys(constructedActivities).length > 0) {
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      } else {
        localStorage.removeItem('constructedActivities');
      }
      
      if (atividadesMigradas.length > 0) {
        console.log('🔄 Migração concluída:', atividadesMigradas.length, 'atividades migradas');
      }
      
      return atividadesMigradas;
      
    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      return [];
    }
  };

  // Carregar do localStorage como fallback
  const carregarDoLocalStorageFallback = async () => {
    console.log('🔄 Carregando do localStorage como fallback...');
    
    try {
      const atividades: AtividadeHistorico[] = [];
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('activity_')) {
          const activityId = key.replace('activity_', '');
          const activityData = localStorage.getItem(key);
          
          if (activityData) {
            try {
              const parsedData = JSON.parse(activityData);
              const constructedInfo = constructedActivities[activityId];
              
              if (constructedInfo?.isBuilt) {
                const atividadeHistorica: AtividadeHistorico = {
                  id: activityId,
                  title: parsedData.title || getActivityNameById(activityId),
                  description: parsedData.description || 'Atividade criada (localStorage)',
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
                  categoryId: activityId,
                  categoryName: getActivityNameById(activityId),
                  icon: activityId,
                  tags: [],
                  difficulty: 'Médio',
                  estimatedTime: '30 min',
                  originalData: parsedData
                };
                
                atividades.push(atividadeHistorica);
              }
            } catch (parseError) {
              console.warn('❌ Erro ao parsear dados da atividade:', key);
            }
          }
        }
      }

      atividades.sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());
      
      console.log('✅ Histórico carregado do localStorage:', atividades.length, 'atividades');
      setAtividadesHistorico(atividades);
      
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      setAtividadesHistorico([]);
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
      console.log('💾 Salvando alterações da atividade no banco:', activityData);
      
      // Verificar se tem código único (é atividade do banco) ou ID (localStorage)
      const codigoUnico = (activityData as any).codigoUnico || (activityData as any).codigo_unico;
      
      if (codigoUnico) {
        // É atividade do banco - atualizar via API
        const updateResult = await activitiesApi.updateActivity(codigoUnico, {
          titulo: activityData.title || activityData.titulo,
          descricao: activityData.description || activityData.descricao,
          conteudo: activityData.generatedContent || activityData
        });
        
        if (updateResult.success) {
          console.log('✅ Atividade atualizada no banco com sucesso');
        } else {
          console.error('❌ Erro ao atualizar no banco:', updateResult.error);
          throw new Error(updateResult.error);
        }
      } else {
        // É atividade do localStorage - tentar migrar primeiro
        const profile = await profileService.getCurrentUserProfile();
        if (profile?.user_id) {
          const migrationResult = await activitiesApi.syncActivity(
            profile.user_id,
            activityData.generatedContent || activityData,
            activityData.id,
            true // forceUpdate
          );
          
          if (migrationResult.success) {
            console.log('✅ Atividade migrada e salva no banco');
            
            // Remover do localStorage após migração bem-sucedida
            localStorage.removeItem(`activity_${activityData.id}`);
            const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
            delete constructedActivities[activityData.id];
            localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
          } else {
            console.warn('⚠️ Falha na migração, salvando no localStorage como fallback');
            // Fallback para localStorage
            await saveToLocalStorageFallback(activityData);
          }
        } else {
          console.warn('⚠️ Usuário não encontrado, salvando no localStorage como fallback');
          await saveToLocalStorageFallback(activityData);
        }
      }
      
      // Recarregar histórico para refletir mudanças
      await carregarHistoricoAtividades();
      
      console.log('✅ Atividade salva com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
      // Fallback para localStorage em caso de erro
      await saveToLocalStorageFallback(activityData);
      await carregarHistoricoAtividades();
    }
  };

  // Salvar no localStorage como fallback
  const saveToLocalStorageFallback = async (activityData: any) => {
    try {
      console.log('🔄 Salvando no localStorage como fallback...');
      
      const activityKey = `activity_${activityData.id}`;
      localStorage.setItem(activityKey, JSON.stringify(activityData));
      
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activityData.id] = {
        ...constructedActivities[activityData.id],
        updatedAt: new Date().toISOString(),
        generatedContent: activityData.generatedContent || activityData,
        isBuilt: true
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      console.log('✅ Atividade salva no localStorage como fallback');
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
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
                {migrationStatus && (
                  <span className="text-blue-600 dark:text-blue-400 ml-2">
                    • {migrationStatus}
                  </span>
                )}
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
