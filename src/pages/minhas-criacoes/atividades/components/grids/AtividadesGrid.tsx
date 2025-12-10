import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Clock, MoreVertical, Eye, Edit2, Trash2, Share2, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { atividadesNeonService, AtividadeNeon } from '@/services/atividadesNeonService';
import schoolPowerActivitiesData from '@/features/schoolpower/data/schoolPowerActivities.json';
import { EditActivityModal } from '@/features/schoolpower/construction/EditActivityModal';
import { ActivityViewModal } from '@/features/schoolpower/construction/ActivityViewModal';
import { useNavigate } from 'react-router-dom';

interface AtividadesGridProps {
  searchTerm: string;
  onCountChange?: (count: number) => void;
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

const CARDS_PER_ROW = 5;
const INITIAL_ROWS = 2;

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

const AtividadesGrid: React.FC<AtividadesGridProps> = ({ searchTerm, onCountChange }) => {
  const navigate = useNavigate();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [filteredAtividades, setFilteredAtividades] = useState<Atividade[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const carregarAtividades = async () => {
    console.log('📚 CARREGANDO ATIVIDADES DO BANCO NEON');
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

      const apiResponse = await atividadesNeonService.buscarAtividadesUsuario(userId);

      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        const atividadesConvertidas = apiResponse.data.map((activity: AtividadeNeon) => 
          convertNeonActivityToAtividade(activity)
        );

        atividadesConvertidas.sort((a, b) => 
          new Date(b.atualizadoEm || b.criadoEm).getTime() - 
          new Date(a.atualizadoEm || a.criadoEm).getTime()
        );

        setAtividades(atividadesConvertidas);
        onCountChange?.(atividadesConvertidas.length);
      } else {
        setAtividades([]);
        onCountChange?.(0);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar atividades:', err);
      setError('Erro ao carregar atividades. Tente novamente.');
      setAtividades([]);
      onCountChange?.(0);
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
    setVisibleRows(INITIAL_ROWS);
  }, [searchTerm, atividades]);

  const visibleAtividades = useMemo(() => {
    const maxVisible = visibleRows * CARDS_PER_ROW;
    return filteredAtividades.slice(0, maxVisible);
  }, [filteredAtividades, visibleRows]);

  const hasMoreToShow = filteredAtividades.length > visibleRows * CARDS_PER_ROW;

  const handleShowMore = () => {
    setVisibleRows(prev => prev + 2);
  };

  const handleViewActivity = (atividade: Atividade) => {
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
    if (!confirm(`Tem certeza que deseja excluir a atividade "${atividade.titulo}"?`)) {
      return;
    }

    try {
      const userId = localStorage.getItem('user_id');
      const result = await atividadesNeonService.deletarAtividade(atividade.id, userId || undefined);
      
      if (result.success) {
        await carregarAtividades();
      } else {
        alert('Erro ao excluir atividade. Tente novamente.');
      }
    } catch (err) {
      alert('Erro ao excluir atividade. Tente novamente.');
    }
    setActiveMenu(null);
  };

  const handleShareActivity = (atividade: Atividade) => {
    setActiveMenu(null);
  };

  const handleSaveActivity = async (activityData: any) => {
    try {
      await carregarAtividades();
      setIsEditModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error('❌ Erro ao salvar atividade:', err);
    }
  };

  const handleCreateActivity = () => {
    const schoolPowerKeys = [
      'schoolpower_current_activity',
      'schoolpower_activity_data',
      'schoolpower_step',
      'schoolpower_progress',
      'schoolpower_form_data',
      'schoolpower_selected_activity',
      'schoolpower_construction_state',
      'current_activity_id',
      'activity_in_progress',
      'schoolpower_chat_messages',
      'schoolpower_generated_content'
    ];
    
    schoolPowerKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🧹 LocalStorage do School Power limpo para nova atividade');
    navigate('/professor/school-power');
  };

  const CreateActivityCard = () => (
    <div
      onClick={handleCreateActivity}
      className="flex flex-col items-center justify-center border-2 border-dashed border-[#FF6B00]/40 rounded-2xl hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
      style={{ width: 208, height: 260 }}
    >
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#FF6B00]/40 flex items-center justify-center mb-3 group-hover:border-[#FF6B00] group-hover:bg-[#FF6B00]/10 transition-all duration-300">
        <Sparkles className="w-6 h-6 text-[#FF6B00]/60 group-hover:text-[#FF6B00]" />
      </div>
      <p className="text-[#FF6B00]/60 text-sm font-medium group-hover:text-[#FF6B00]">Gerar Atividade</p>
    </div>
  );

  const AtividadeCard = ({ atividade }: { atividade: Atividade }) => {
    const isHovered = hoveredCard === atividade.id;
    const isMenuOpen = activeMenu === atividade.id;
    
    return (
      <div
        onMouseEnter={() => setHoveredCard(atividade.id)}
        onMouseLeave={() => {
          if (!isMenuOpen) {
            setHoveredCard(null);
          }
        }}
        className={`bg-[#1A2B3C] rounded-2xl overflow-hidden transition-all duration-300 relative cursor-pointer ${
          isHovered ? 'border border-[#FF6B00]/60 scale-[1.02]' : 'border border-[#FF6B00]/20'
        }`}
        style={{ width: 208, height: 260 }}
      >
        <div 
          className={`absolute top-3 right-3 z-10 transition-opacity duration-200 ${
            isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(isMenuOpen ? null : atividade.id);
            }}
            className="w-8 h-8 rounded-full bg-[#0D1B2A]/80 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-36 bg-[#0D1B2A] border border-[#FF6B00]/30 rounded-xl shadow-xl overflow-hidden z-20">
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
            </div>
          )}
        </div>

        <div 
          onClick={() => handleViewActivity(atividade)}
          className="h-[160px] bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center"
        >
          <FileText className="w-14 h-14 text-[#FF6B00]/40" />
        </div>
        
        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate mb-1">{atividade.titulo}</h3>
          <p className="text-white/50 text-xs mb-2 truncate">{getActivityNameById(atividade.tipo)}</p>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatDate(atividade.criadoEm)}</span>
          </div>
        </div>
      </div>
    );
  };

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
        Tentar novamente
      </button>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-start">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : (
            <>
              <CreateActivityCard />
              {visibleAtividades.map((atividade) => (
                <AtividadeCard key={atividade.id} atividade={atividade} />
              ))}
            </>
          )}
        </div>

        {!loading && !error && hasMoreToShow && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleShowMore}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A2B3C] border border-[#FF6B00]/30 text-[#FF6B00] rounded-full hover:bg-[#FF6B00]/10 hover:border-[#FF6B00] transition-all font-medium text-sm"
            >
              <span>Visualizar mais</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] font-medium text-sm">
              <FileText className="w-4 h-4" />
              <span>Meus Templates</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-start">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={`template-${index}`}
                className="flex flex-col items-center justify-center border border-dashed border-[#FF6B00]/20 rounded-2xl hover:border-[#FF6B00]/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                style={{ width: 208, height: 260 }}
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#FF6B00]/30 flex items-center justify-center mb-3 group-hover:border-[#FF6B00]/50 transition-colors">
                  <Plus className="w-6 h-6 text-[#FF6B00]/40 group-hover:text-[#FF6B00]/60" />
                </div>
                <p className="text-white/30 text-sm group-hover:text-white/50">Vazio</p>
              </div>
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
