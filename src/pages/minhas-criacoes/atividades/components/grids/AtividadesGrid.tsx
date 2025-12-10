import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, MoreVertical, Eye, Edit2, Trash2, Share2, Loader2, RefreshCw } from 'lucide-react';
import { atividadesNeonService, AtividadeNeon } from '@/services/atividadesNeonService';
import schoolPowerActivitiesData from '@/features/schoolpower/data/schoolPowerActivities.json';
import { EditActivityModal } from '@/features/schoolpower/construction/EditActivityModal';
import { ActivityViewModal } from '@/features/schoolpower/construction/ActivityViewModal';

interface AtividadesGridProps {
  searchTerm: string;
}

interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  criadoEm: string;
  atualizadoEm?: string;
  status: 'rascunho' | 'publicada' | 'arquivada' | 'completed';
  stars?: number;
  customFields?: any;
  originalData?: any;
}

const getActivityNameById = (activityId: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === activityId);
  return activity ? activity.name : activityId;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const AtividadesGrid: React.FC<AtividadesGridProps> = ({ searchTerm }) => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [filteredAtividades, setFilteredAtividades] = useState<Atividade[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const carregarAtividades = async () => {
    console.log('📚 ==========================================');
    console.log('📚 CARREGANDO ATIVIDADES DO BANCO NEON');
    console.log('📚 ==========================================');
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('auth_token');

      if (!userId || !authToken) {
        console.warn('⚠️ Usuário não autenticado');
        setError('Usuário não autenticado. Faça login para ver suas atividades.');
        setAtividades([]);
        setLoading(false);
        return;
      }

      console.log('👤 User ID:', userId);

      const apiResponse = await atividadesNeonService.buscarAtividadesUsuario(userId);
      console.log('🔍 Resposta da API:', apiResponse);

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log('✅ Atividades carregadas:', apiResponse.data.length);

        const atividadesConvertidas = apiResponse.data.map((activity: AtividadeNeon) => 
          convertNeonActivityToAtividade(activity)
        );

        atividadesConvertidas.sort((a, b) => 
          new Date(b.atualizadoEm || b.criadoEm).getTime() - 
          new Date(a.atualizadoEm || a.criadoEm).getTime()
        );

        setAtividades(atividadesConvertidas);
      } else {
        console.log('ℹ️ Nenhuma atividade encontrada');
        setAtividades([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar atividades:', err);
      setError('Erro ao carregar atividades. Tente novamente.');
      setAtividades([]);
    } finally {
      setLoading(false);
    }
  };

  const convertNeonActivityToAtividade = (activity: AtividadeNeon): Atividade => {
    const activityData = activity.id_json;
    
    return {
      id: activity.id,
      titulo: activityData?.title || activityData?.titulo || getActivityNameById(activity.tipo),
      descricao: activityData?.description || activityData?.descricao || 'Atividade criada na plataforma',
      tipo: activity.tipo,
      criadoEm: activity.created_at || new Date().toISOString(),
      atualizadoEm: activity.updated_at,
      status: 'completed',
      stars: activity.stars,
      customFields: activityData?.customFields || {},
      originalData: activityData
    };
  };

  useEffect(() => {
    carregarAtividades();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAtividades(atividades);
    } else {
      const filtered = atividades.filter(a => 
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAtividades(filtered);
    }
  }, [searchTerm, atividades]);

  const handleViewActivity = (atividade: Atividade) => {
    console.log('👁️ Visualizando atividade:', atividade.titulo);
    const activityForModal = {
      id: atividade.id,
      title: atividade.titulo,
      description: atividade.descricao,
      type: atividade.tipo,
      progress: 100,
      status: 'completed',
      customFields: atividade.customFields,
      originalData: atividade.originalData,
      isBuilt: true,
      builtAt: atividade.criadoEm
    };
    setSelectedActivity(activityForModal);
    setIsViewModalOpen(true);
    setActiveMenu(null);
  };

  const handleEditActivity = (atividade: Atividade) => {
    console.log('✏️ Editando atividade:', atividade.titulo);
    const activityForModal = {
      id: atividade.id,
      title: atividade.titulo,
      description: atividade.descricao,
      type: atividade.tipo,
      progress: 100,
      status: 'completed',
      customFields: atividade.customFields,
      originalData: atividade.originalData,
      isBuilt: true,
      builtAt: atividade.criadoEm
    };
    setSelectedActivity(activityForModal);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteActivity = async (atividade: Atividade) => {
    console.log('🗑️ Excluindo atividade:', atividade.titulo);
    
    if (!confirm(`Tem certeza que deseja excluir a atividade "${atividade.titulo}"?`)) {
      return;
    }

    try {
      const userId = localStorage.getItem('user_id');
      const result = await atividadesNeonService.deletarAtividade(atividade.id, userId || undefined);
      
      if (result.success) {
        console.log('✅ Atividade excluída com sucesso');
        await carregarAtividades();
      } else {
        console.error('❌ Erro ao excluir:', result.error);
        alert('Erro ao excluir atividade. Tente novamente.');
      }
    } catch (err) {
      console.error('❌ Erro ao excluir atividade:', err);
      alert('Erro ao excluir atividade. Tente novamente.');
    }
    setActiveMenu(null);
  };

  const handleShareActivity = (atividade: Atividade) => {
    console.log('📤 Compartilhando atividade:', atividade.titulo);
    setActiveMenu(null);
  };

  const handleSaveActivity = async (activityData: any) => {
    try {
      console.log('💾 Salvando atividade:', activityData);
      await carregarAtividades();
      setIsEditModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error('❌ Erro ao salvar atividade:', err);
    }
  };

  const EmptyCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="aspect-[3/4] bg-[#1A2B3C]/50 border-2 border-[#FF6B00]/20 rounded-2xl flex items-center justify-center hover:border-[#FF6B00]/40 transition-colors cursor-pointer group"
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#FF6B00]/30 flex items-center justify-center mx-auto mb-3 group-hover:border-[#FF6B00]/50 transition-colors">
          <Plus className="w-6 h-6 text-[#FF6B00]/40 group-hover:text-[#FF6B00]/60" />
        </div>
        <p className="text-white/30 text-sm group-hover:text-white/50">Vazio</p>
      </div>
    </motion.div>
  );

  const AtividadeCard = ({ atividade, index }: { atividade: Atividade; index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="aspect-[3/4] bg-[#1A2B3C] border-2 border-[#FF6B00]/30 rounded-2xl overflow-hidden hover:border-[#FF6B00] transition-all group relative"
    >
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === atividade.id ? null : atividade.id);
          }}
          className="w-8 h-8 rounded-full bg-[#0D1B2A]/80 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {activeMenu === atividade.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-10 w-36 bg-[#0D1B2A] border border-[#FF6B00]/30 rounded-xl shadow-xl overflow-hidden z-20"
          >
            <button 
              onClick={() => handleViewActivity(atividade)}
              className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm"
            >
              <Eye className="w-4 h-4" /> Visualizar
            </button>
            <button 
              onClick={() => handleEditActivity(atividade)}
              className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm"
            >
              <Edit2 className="w-4 h-4" /> Editar
            </button>
            <button 
              onClick={() => handleShareActivity(atividade)}
              className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm"
            >
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            <button 
              onClick={() => handleDeleteActivity(atividade)}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </motion.div>
        )}
      </div>

      <div 
        onClick={() => handleViewActivity(atividade)}
        className="h-2/3 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center cursor-pointer"
      >
        <FileText className="w-16 h-16 text-[#FF6B00]/40" />
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-medium text-sm truncate mb-1">{atividade.titulo}</h3>
        <p className="text-white/50 text-xs mb-2 truncate">{getActivityNameById(atividade.tipo)}</p>
        <div className="flex items-center gap-1 text-white/40 text-xs">
          <Clock className="w-3 h-3" />
          <span>{formatDate(atividade.criadoEm)}</span>
        </div>
      </div>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mb-4" />
      <p className="text-white/60 text-sm">Carregando atividades...</p>
    </div>
  );

  const ErrorState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-white/80 text-sm mb-4">{error}</p>
      <button
        onClick={carregarAtividades}
        className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF6B00]/80 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-[#FF6B00]/60" />
      </div>
      <h3 className="text-white text-lg font-medium mb-2">Nenhuma atividade encontrada</h3>
      <p className="text-white/50 text-sm text-center max-w-md">
        As atividades que você criar no School Power aparecerão aqui.
      </p>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/60 text-sm">
            {!loading && !error && (
              <>
                {filteredAtividades.length} {filteredAtividades.length === 1 ? 'atividade' : 'atividades'}
                {searchTerm && ` encontrada${filteredAtividades.length !== 1 ? 's' : ''}`}
              </>
            )}
          </div>
          {!loading && (
            <button
              onClick={carregarAtividades}
              className="flex items-center gap-2 px-3 py-1.5 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : filteredAtividades.length > 0 ? (
            filteredAtividades.map((atividade, index) => (
              <AtividadeCard key={atividade.id} atividade={atividade} index={index} />
            ))
          ) : (
            <EmptyState />
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

      <EditActivityModal
        isOpen={isEditModalOpen}
        activity={selectedActivity}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={handleSaveActivity}
        onUpdateActivity={handleSaveActivity}
      />

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
};

export default AtividadesGrid;
