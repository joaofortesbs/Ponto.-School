
import React, { useEffect } from 'react';
import { InterfaceCompartilharAtividade } from '@/features/schoolpower/components/interface-compartilhar-atividade-schoolpower';

const AtividadeCompartilhadaPage: React.FC = () => {
  useEffect(() => {
    // Configurar metadados da página para SEO e compartilhamento
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Atividade educacional compartilhada via Ponto School - Plataforma de ensino com inteligência artificial');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Atividade educacional compartilhada via Ponto School - Plataforma de ensino com inteligência artificial';
      document.head.appendChild(newMetaDescription);
    }

    // Configurar Open Graph para compartilhamento em redes sociais
    const setOpenGraphMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setOpenGraphMeta('og:site_name', 'Ponto School');
    setOpenGraphMeta('og:type', 'website');
    setOpenGraphMeta('og:title', 'Atividade Educacional - Ponto School');
    setOpenGraphMeta('og:description', 'Atividade educacional criada com inteligência artificial na plataforma Ponto School');
    setOpenGraphMeta('og:url', window.location.href);

    // Twitter Card
    const setTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setTwitterMeta('twitter:card', 'summary_large_image');
    setTwitterMeta('twitter:title', 'Atividade Educacional - Ponto School');
    setTwitterMeta('twitter:description', 'Atividade educacional criada com inteligência artificial');

    // Garantir que a página seja indexável
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    } else {
      const newRobotsMeta = document.createElement('meta');
      newRobotsMeta.name = 'robots';
      newRobotsMeta.content = 'index, follow';
      document.head.appendChild(newRobotsMeta);
    }

    // Log para debug
    console.log('📄 [PÚBLICO] Página de atividade compartilhada carregada');
    console.log('🔗 [PÚBLICO] URL atual:', window.location.href);

    // Cleanup
    return () => {
      console.log('📄 [PÚBLICO] Página de atividade compartilhada desmontada');
    };
  }, []);

  return (
    <div 
      className="public-activity-page shared-activity-isolated-page" 
      style={{
        backgroundColor: '#0f172a !important',
        color: '#ffffff !important',
        minHeight: '100vh !important',
        isolation: 'isolate !important'
      }}
      data-theme="dark-forced"
    >
      <InterfaceCompartilharAtividade />
    </div>
  );
};

export default AtividadeCompartilhadaPage;
