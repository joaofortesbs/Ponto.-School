
import React, { useEffect } from 'react';
import { InterfaceCompartilharAtividade } from '@/features/schoolpower/components/interface-compartilhar-atividade-schoolpower';
import { extrairUTMDaURL, capturarConversaoLogin } from '@/features/schoolpower/services/gerador-link-atividades-schoolpower';

const AtividadeCompartilhadaPage: React.FC = () => {
  useEffect(() => {
    // 🔓 PÁGINA COMPLETAMENTE PÚBLICA - SEM AUTENTICAÇÃO NECESSÁRIA
    console.log('📄 [PÚBLICO] Página de atividade compartilhada carregada (modo independente)');
    console.log('🔗 [PÚBLICO] URL atual:', window.location.href);
    
    // Desabilitar verificações de autenticação para esta página
    localStorage.setItem('pontoschool_public_mode', 'true');

    // Extrair e processar UTM parameters
    const utmData = extrairUTMDaURL();
    if (Object.keys(utmData).some(key => utmData[key as keyof typeof utmData])) {
      console.log('📊 [UTM] Parâmetros UTM detectados:', utmData);
      
      // Salvar no localStorage para tracking
      try {
        localStorage.setItem('pontoschool_utm_tracking_page', JSON.stringify({
          ...utmData,
          pageUrl: window.location.href,
          loadedAt: new Date().toISOString()
        }));
      } catch (error) {
        console.warn('⚠️ [UTM] Erro ao salvar UTM no localStorage:', error);
      }
    }

    // Configurar metadados da página para SEO e compartilhamento
    const configurarMetadados = () => {
      try {
        // Meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Atividade educacional compartilhada via Ponto School - Plataforma de ensino com inteligência artificial');
        } else {
          const newMetaDescription = document.createElement('meta');
          newMetaDescription.name = 'description';
          newMetaDescription.content = 'Atividade educacional compartilhada via Ponto School - Plataforma de ensino com inteligência artificial';
          document.head.appendChild(newMetaDescription);
        }

        // Open Graph para compartilhamento em redes sociais
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
        setOpenGraphMeta('og:image', `${window.location.origin}/images/ponto-school-logo.png`);

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
        setTwitterMeta('twitter:image', `${window.location.origin}/images/ponto-school-logo.png`);

        // Garantir que a página seja indexável
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) {
          robotsMeta.setAttribute('content', 'index, follow, noarchive');
        } else {
          const newRobotsMeta = document.createElement('meta');
          newRobotsMeta.name = 'robots';
          newRobotsMeta.content = 'index, follow, noarchive';
          document.head.appendChild(newRobotsMeta);
        }

        // Configurar canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.href);

      } catch (error) {
        console.warn('⚠️ [META] Erro ao configurar metadados:', error);
      }
    };

    configurarMetadados();

    // Detectar se usuário logou via link de compartilhamento
    const detectarLoginViaCompartilhamento = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const loginSuccess = urlParams.get('login_success');
      const userId = urlParams.get('user_id');
      
      if (loginSuccess === 'true' && userId) {
        console.log('🎯 [CONVERSÃO] Login detectado via compartilhamento');
        capturarConversaoLogin(userId);
        
        // Limpar parâmetros da URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    };

    detectarLoginViaCompartilhamento();

    // Adicionar listener para detectar tentativas de login
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pontoschool_user_session' && e.newValue) {
        try {
          const sessionData = JSON.parse(e.newValue);
          if (sessionData.user?.id) {
            console.log('🔄 [REDIRECT] Usuário logou, capturando conversão...');
            capturarConversaoLogin(sessionData.user.id);
          }
        } catch (error) {
          console.warn('⚠️ [STORAGE] Erro ao processar mudança de sessão:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Configurar interceptador para links de login/registro
    const interceptarLinksAuth = () => {
      const currentUrl = encodeURIComponent(window.location.href);
      const utmParams = new URLSearchParams(window.location.search).toString();
      
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && (link.href.includes('/login') || link.href.includes('/register'))) {
          e.preventDefault();
          
          let authUrl = link.href;
          
          // Adicionar parâmetros de retorno
          const separator = authUrl.includes('?') ? '&' : '?';
          authUrl += `${separator}redirect_to=${currentUrl}`;
          
          // Preservar UTM parameters
          if (utmParams) {
            authUrl += `&${utmParams}`;
          }
          
          console.log('🔗 [AUTH] Redirecionando para autenticação:', authUrl);
          window.location.href = authUrl;
        }
      });
    };

    interceptarLinksAuth();

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log('📄 [PÚBLICO] Página de atividade compartilhada desmontada');
    };
  }, []);

  return (
    <div className="public-activity-page">
      {/* Container independente - sem dependências de autenticação */}
      <InterfaceCompartilharAtividade />
      
      {/* Script de fallback para casos extremos */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Fallback para garantir funcionamento independente
            if (typeof window !== 'undefined') {
              window.PONTO_SCHOOL_PUBLIC_MODE = true;
              
              // Desabilitar interceptadores de autenticação se existirem
              if (window.location.pathname.includes('/atividade/')) {
                localStorage.setItem('pontoschool_public_page_mode', 'true');
                
                // Remover redirects automáticos de auth
                const originalReplace = window.location.replace;
                window.location.replace = function(url) {
                  if (url.includes('/login') || url.includes('/dashboard')) {
                    console.log('🚫 [PÚBLICO] Redirect automático bloqueado:', url);
                    return;
                  }
                  return originalReplace.call(this, url);
                };
              }
            }
          `
        }}
      />
    </div>
  );
};

export default AtividadeCompartilhadaPage;
