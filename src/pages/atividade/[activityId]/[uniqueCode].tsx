import React, { useEffect, useState } from 'react';
import { InterfaceCompartilharAtividade } from '@/features/schoolpower/components/interface-compartilhar-atividade-schoolpower';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Edit, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '@/hooks/useActivities';
import { Activity } from '@/services/activitiesService';

const AtividadeCompartilhadaPage: React.FC = () => {
  const { activityId, uniqueCode } = useParams();
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getActivity } = useActivities();

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Carregando atividade:', uniqueCode);

        // Primeiro, tentar carregar do banco de dados Neon via API
        if (uniqueCode) {
          const neonActivity = await getActivity(uniqueCode);

          if (neonActivity) {
            console.log('✅ Atividade carregada do banco Neon');
            setActivityData(neonActivity);
            setLoading(false);
            return;
          }
        }

        console.log('⚠️ Atividade não encontrada no banco, tentando LocalStorage...');

        // Fallback: Buscar nos dados compartilhados do localStorage
        const sharedKey = `shared_activity_${uniqueCode}`;
        const sharedData = localStorage.getItem(sharedKey);

        if (sharedData) {
          console.log('✅ Atividade encontrada no LocalStorage compartilhado');
          const parsedData = JSON.parse(sharedData);
          setActivityData({
            activity_code: uniqueCode!,
            type: activityId || 'unknown',
            title: parsedData.title || parsedData.nome || 'Atividade',
            content: parsedData,
            user_id: 'legacy'
          } as Activity);
          setLoading(false);
          return;
        }

        // Fallback: Buscar no localStorage local
        const localKey = `activity_${activityId}_${uniqueCode}`;
        const localData = localStorage.getItem(localKey);

        if (localData) {
          console.log('✅ Atividade encontrada no LocalStorage local');
          const parsedData = JSON.parse(localData);
          setActivityData({
            activity_code: uniqueCode!,
            type: activityId || 'unknown',
            title: parsedData.title || parsedData.nome || 'Atividade',
            content: parsedData,
            user_id: 'legacy'
          } as Activity);
          setLoading(false);
          return;
        }

        // Se não encontrou em lugar nenhum
        console.error('❌ Atividade não encontrada em nenhuma fonte');
        setError('Atividade não encontrada');
        setLoading(false);

      } catch (err) {
        console.error('❌ Erro ao carregar atividade:', err);
        setError('Erro ao carregar atividade');
        setLoading(false);
      }
    };

    if (uniqueCode) {
      loadActivity();
    }
  }, [activityId, uniqueCode, getActivity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0F4171] flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <div className="text-xl">Carregando atividade...</div>
          <div className="text-sm text-white/60 mt-2">Buscando no banco de dados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0F4171] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-lg mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-activity-page">
      <InterfaceCompartilharAtividade />
    </div>
  );
};

export default AtividadeCompartilhadaPage;