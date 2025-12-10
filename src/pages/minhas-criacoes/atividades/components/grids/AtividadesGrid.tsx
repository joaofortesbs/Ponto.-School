import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, MoreVertical, Eye, Edit2, Trash2, Share2, Loader2 } from 'lucide-react';
import { atividadesNeonService, AtividadeNeon } from '@/services/atividadesNeonService';
import { ConstructionCard } from '@/features/schoolpower/construction/ConstructionCard';
import { EditActivityModal } from '@/features/schoolpower/construction/EditActivityModal';
import { ActivityViewModal } from '@/features/schoolpower/construction/ActivityViewModal';
import schoolPowerActivitiesData from '@/features/schoolpower/data/schoolPowerActivities.json';

interface AtividadesGridProps {
  searchTerm: string;
}

interface AtividadeFormatada {
  id: string;
  title: string;
  description: string;
  type: string;
  progress: number;
  status: 'draft' | 'in-progress' | 'completed' | 'pending';
  criadaEm: string;
  atualizadaEm?: string;
  customFields?: any;
  originalData?: any;
}

const getActivityNameById = (activityId: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === activityId);
  return activity ? activity.name : activityId;
};

const AtividadesGrid: React.FC<AtividadesGridProps> = ({ searchTerm }) => {
  const [atividades, setAtividades] = useState<AtividadeFormatada[]>([]);
  const [filteredAtividades, setFilteredAtividades] = useState<AtividadeFormatada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AtividadeFormatada | null>(null);

  useEffect(() => {
    carregarAtividades();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAtividades(atividades);
    } else {
      const filtered = atividades.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAtividades(filtered);
    }
  }, [searchTerm, atividades]);

  const carregarAtividades = async () => {
    console.log('📚 Carregando atividades do banco Neon...');
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('auth_token');
      
      if (!userId || !authToken) {
        console.warn('⚠️ Usuário não autenticado');
        setAtividades([]);
        setFilteredAtividades([]);
        setLoading(false);
        return;
      }

      console.log('👤 User ID:', userId);

      const apiResponse = await atividadesNeonService.buscarAtividadesUsuario(userId);
      console.log('🔍 Resposta da API:', apiResponse);
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log('✅ Atividades carregadas:', apiResponse.data.length);
        
        const atividadesFormatadas = apiResponse.data.map((activity: AtividadeNeon) => 
          convertNeonActivityToFormatado(activity)
        );

        atividadesFormatadas.sort((a, b) => 
          new Date(b.atualizadaEm || b.criadaEm).getTime() - 
          new Date(a.atualizadaEm || a.criadaEm).getTime()
        );
        
        setAtividades(atividadesFormatadas);
        setFilteredAtividades(atividadesFormatadas);
        
      } else {
        console.log('ℹ️ Nenhuma atividade encontrada no banco');
        setAtividades([]);
        setFilteredAtividades([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar atividades:', error);
      setError('Erro ao carregar atividades. Tente novamente.');
      setAtividades([]);
      setFilteredAtividades([]);
    } finally {
      setLoading(false);
    }
  };

  const convertNeonActivityToFormatado = (activity: AtividadeNeon): AtividadeFormatada => {
    const activityData = activity.id_json;
    
    return {
      id: activity.id,
      title: activityData?.title || getActivityNameById(activity.tipo),
      description: activityData?.description || 'Atividade criada na plataforma',
      type: activity.tipo,
      progress: 100,
      status: 'completed',
      criadaEm: activity.created_at || new Date().toISOString(),
      atualizadaEm: activity.updated_at,
      customFields: activityData?.customFields || {},
      originalData: activityData
    };
  };

  const handleEditActivity = (atividade: AtividadeFormatada) => {
    console.log('✏️ Abrindo modal de edição para:', atividade.title);
    setSelectedActivity(atividade);
    setIsEditModalOpen(true);
  };

  const handleViewActivity = (atividade: AtividadeFormatada) => {
    console.log('👁️ Abrindo modal de visualização para:', atividade.title);
    setSelectedActivity(atividade);
    setIsViewModalOpen(true);
  };

  const handleShareActivity = (activityId: string) => {
    console.log('📤 Compartilhando atividade:', activityId);
  };

  const handleDeleteActivity = async (activityId: string) => {
    console.log('🗑️ Deletando atividade:', activityId);
    
    try {
      const userId = localStorage.getItem('user_id');
      const result = await atividadesNeonService.deletarAtividade(activityId, userId || undefined);
      
      if (result.success) {
        console.log('✅ Atividade deletada com sucesso');
        await carregarAtividades();
      } else {
        console.error('❌ Erro ao deletar:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar atividade:', error);
    }
  };

  const handleSaveActivity = async (activityData: any) => {
    try {
      console.log('💾 Salvando alterações da atividade:', activityData);
      await carregarAtividades();
      console.log('✅ Atividade salva com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
    }
  };

  const handleUpdateActivity = async (activity: any) => {
    try {
      console.log('🔄 Atualizando atividade:', activity);
      await handleSaveActivity(activity);
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
    }
  };

  const handleCreateNew = () => {
    console.log('Criar nova atividade');
    window.location.href = '/professor/school-power';
  };

  const EmptyCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={handleCreateNew}
      className="aspect-[3/4] bg-[#1A2B3C]/50 border-2 border-[#FF6B00]/20 rounded-2xl flex items-center justify-center hover:border-[#FF6B00]/40 transition-colors cursor-pointer group"
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#FF6B00]/30 flex items-center justify-center mx-auto mb-3 group-hover:border-[#FF6B00]/50 transition-colors">
          <Plus className="w-6 h-6 text-[#FF6B00]/40 group-hover:text-[#FF6B00]/60" />
        </div>
        <p className="text-white/30 text-sm group-hover:text-white/50">Criar Atividade</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mx-auto mb-4" />
            <p className="text-white/60">Carregando atividades...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index} 
              className="aspect-[3/4] bg-[#1A2B3C]/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Erro ao carregar</h3>
          <p className="text-white/60 max-w-md mx-auto mb-4">{error}</p>
          <button 
            onClick={carregarAtividades}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAtividades.length > 0 ? (
            <>
              {filteredAtividades.map((atividade, index) => (
                <motion.div
                  key={atividade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
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
              <EmptyCard index={filteredAtividades.length} />
            </>
          ) : (
            <>
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A2B3C] flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[#FF6B00]/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Nenhuma atividade encontrada
                </h3>
                <p className="text-white/60 max-w-md mx-auto mb-6">
                  Comece a criar suas atividades no School Power e elas aparecerão aqui.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF6B00]/90 transition-colors font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Criar Atividade
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] font-medium text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Meus Templates</span>
              <motion.div
                animate={{ rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <i className="fas fa-chevron-down text-xs ml-1"></i>
              </motion.div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <EmptyCard key={`template-${index}`} index={index} />
            ))}
          </div>
        </div>
      </div>

      {selectedActivity && (
        <>
          <EditActivityModal
            isOpen={isEditModalOpen}
            activity={{
              id: selectedActivity.id,
              title: selectedActivity.title,
              description: selectedActivity.description,
              type: selectedActivity.type,
              progress: selectedActivity.progress,
              status: 'completed' as const,
              customFields: selectedActivity.customFields || {},
              isBuilt: true,
              builtAt: selectedActivity.criadaEm,
              categoryId: selectedActivity.type,
              categoryName: getActivityNameById(selectedActivity.type),
              icon: selectedActivity.type,
              tags: [],
              difficulty: 'Médio',
              estimatedTime: '30 min',
              originalData: selectedActivity.originalData
            }}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedActivity(null);
            }}
            onSave={handleSaveActivity}
            onUpdateActivity={handleUpdateActivity}
          />

          <ActivityViewModal
            isOpen={isViewModalOpen}
            activity={{
              id: selectedActivity.id,
              title: selectedActivity.title,
              description: selectedActivity.description,
              type: selectedActivity.type,
              progress: selectedActivity.progress,
              status: 'completed' as const,
              customFields: selectedActivity.customFields || {},
              isBuilt: true,
              builtAt: selectedActivity.criadaEm,
              categoryId: selectedActivity.type,
              categoryName: getActivityNameById(selectedActivity.type),
              icon: selectedActivity.type,
              tags: [],
              difficulty: 'Médio',
              estimatedTime: '30 min',
              originalData: selectedActivity.originalData
            }}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedActivity(null);
            }}
          />
        </>
      )}
    </>
  );
};

export default AtividadesGrid;
