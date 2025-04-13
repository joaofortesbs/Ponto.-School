
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAuthentication } from '@/lib/auth-utils';

export function useWelcomeModal(pathname: string, isAuthRoute: boolean) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    // Função que previne a rolagem quando o modal está aberto
    const preventScroll = () => {
      document.body.classList.add('modal-open');
    };

    // Função que restaura a rolagem quando o modal é fechado
    const restoreScroll = () => {
      document.body.classList.remove('modal-open');
    };

    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthentication();

        // Não mostrar o modal nas rotas de autenticação
        if (isAuthRoute) {
          setShowWelcomeModal(false);
          // Limpar sessão apenas se estiver deslogando para garantir novo modal ao logar
          if (pathname === "/login") {
            sessionStorage.removeItem('welcomeModalShown');
          }
          restoreScroll();
          return;
        }

        if (isAuthenticated) {
          // Obter ID do usuário atual para controle de primeiro login por conta
          const { data: { session } } = await supabase.auth.getSession();
          const currentUserId = session?.user?.id;

          if (!currentUserId) return;

          // Chave específica para este usuário
          const userLoginKey = `hasLoggedInBefore_${currentUserId}`;
          const sessionKey = `currentSession_${currentUserId}`;
          const userHasLoggedBefore = localStorage.getItem(userLoginKey);
          const currentSession = sessionStorage.getItem(sessionKey);

          if (!userHasLoggedBefore) {
            // Primeiro login desta conta específica - mostrar modal de comemoração
            console.log("Primeiro login detectado para esta conta!");
            setIsFirstLogin(true);
            setShowWelcomeModal(true);
            preventScroll(); // Evitar rolagem
            localStorage.setItem(userLoginKey, 'true');
            localStorage.setItem('hasLoggedInBefore', 'true'); // Compatibilidade com código existente
            // Marcar sessão atual
            sessionStorage.setItem(sessionKey, 'active');
          } else if (!currentSession) {
            // Login subsequente, mas primeira visita nesta sessão de navegador
            console.log("Nova sessão detectada - mostrando modal de boas-vindas");
            setIsFirstLogin(false);
            setShowWelcomeModal(true);
            preventScroll(); // Evitar rolagem
            // Marcar sessão atual
            sessionStorage.setItem(sessionKey, 'active');
          } else if (pathname === "/") {
            // Na página inicial, sempre mostrar o modal para garantir que seja visto
            setIsFirstLogin(false);
            setShowWelcomeModal(true);
            preventScroll(); // Evitar rolagem
          } else {
            // Navegação dentro da mesma sessão - não mostrar o modal em outras páginas
            console.log("Navegação dentro da mesma sessão - modal não será mostrado");
            setShowWelcomeModal(false);
            restoreScroll(); // Restaurar rolagem
          }
        }
        console.log("Aplicação inicializada com sucesso.");

      } catch (error) {
        console.error("Erro ao inicializar aplicação:", error);
        setShowWelcomeModal(false);
        restoreScroll(); // Restaurar rolagem em caso de erro
      }
    };

    // Aguardar apenas um curto tempo para inicialização prioritária do modal
    const timer = setTimeout(() => {
      console.log("Iniciando aplicação e verificando autenticação...");
      checkAuth();
    }, 100);

    return () => {
      clearTimeout(timer);
      restoreScroll(); // Garantir que a rolagem seja restaurada ao desmontar
    };
  }, [pathname, isAuthRoute]);

  return { showWelcomeModal, setShowWelcomeModal, isFirstLogin };
}
