
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { InterfaceCompartilharAtividade } from '@/features/schoolpower/components/interface-compartilhar-atividade-schoolpower';
import { buscarAtividadeCompartilhada } from '@/features/schoolpower/services/gerador-link-atividades-schoolpower';
import { Helmet } from 'react-helmet-async';

const AtividadeCompartilhadaPage: React.FC = () => {
  const { activityId, uniqueCode } = useParams<{ activityId: string; uniqueCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activityData, setActivityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configurar UTM tracking se necessário
    const urlParams = new URLSearchParams(location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    if (utmSource || utmMedium || utmCampaign) {
      console.log('🔗 [PÚBLICO] UTM tracking detectado:', {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        activityId,
        uniqueCode
      });
      
      // Salvar UTM para uso posterior se usuário fizer login
      localStorage.setItem('shared_activity_utm', JSON.stringify({
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        activityId,
        uniqueCode,
        timestamp: Date.now()
      }));
    }

    // Configurar metadados da página para SEO e compartilhamento
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Metadados básicos
    setMetaTag('description', 'Atividade educacional compartilhada via Ponto School - Plataforma de ensino com inteligência artificial');
    setMetaTag('robots', 'index, follow');
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph para compartilhamento em redes sociais
    setMetaTag('og:site_name', 'Ponto School', true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:title', 'Atividade Educacional - Ponto School', true);
    setMetaTag('og:description', 'Atividade educacional criada com inteligência artificial na plataforma Ponto School', true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('og:locale', 'pt_BR', true);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', 'Atividade Educacional - Ponto School');
    setMetaTag('twitter:description', 'Atividade educacional criada com inteligência artificial');
    setMetaTag('twitter:site', '@pontoschool');

    // Log para debug
    console.log('📄 [PÚBLICO] Página de atividade compartilhada carregada');
    console.log('🔗 [PÚBLICO] URL atual:', window.location.href);
    console.log('🎯 [PÚBLICO] Parâmetros:', { activityId, uniqueCode });

    // Buscar dados da atividade
    loadActivityData();

    // Cleanup
    return () => {
      console.log('📄 [PÚBLICO] Página de atividade compartilhada desmontada');
    };
  }, [activityId, uniqueCode, location.search]);

  const loadActivityData = async () => {
    if (!activityId || !uniqueCode) {
      setError('Parâmetros de atividade inválidos');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 [PÚBLICO] Buscando atividade:', { activityId, uniqueCode });
      
      const atividade = await buscarAtividadeCompartilhada(activityId, uniqueCode);
      
      if (!atividade) {
        console.warn('⚠️ [PÚBLICO] Atividade não encontrada');
        setError('Atividade não encontrada ou link inválido');
        setLoading(false);
        return;
      }

      console.log('✅ [PÚBLICO] Atividade carregada:', atividade.titulo);
      setActivityData(atividade);
      
      // Atualizar título da página com nome da atividade
      document.title = `${atividade.titulo} - Ponto School`;
      
      setLoading(false);
    } catch (error) {
      console.error('❌ [PÚBLICO] Erro ao carregar atividade:', error);
      setError('Erro ao carregar atividade. Tente novamente.');
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Salvar contexto da atividade antes de redirecionar
    localStorage.setItem('redirect_after_login', JSON.stringify({
      type: 'shared_activity',
      activityId,
      uniqueCode,
      timestamp: Date.now()
    }));
    
    console.log('🔄 [PÚBLICO] Redirecionando para login com contexto salvo');
    navigate('/login?redirect=shared-activity');
  };

  if (loading) {
    return (
      <div className="public-activity-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Helmet>
          <title>Carregando Atividade - Ponto School</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando atividade...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-activity-page min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <Helmet>
          <title>Erro - Atividade não encontrada - Ponto School</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Atividade não encontrada
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fazer Login na Plataforma
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-activity-page">
      <Helmet>
        <title>{activityData?.titulo || 'Atividade Educacional'} - Ponto School</title>
        <meta name="description" content={`${activityData?.titulo || 'Atividade educacional'} - Criada com inteligência artificial na plataforma Ponto School`} />
      </Helmet>
      
      <InterfaceCompartilharAtividade 
        activityData={activityData}
        isPublicView={true}
        onLoginRedirect={handleLoginRedirect}
      />
    </div>
  );
};

export default AtividadeCompartilhadaPage;
