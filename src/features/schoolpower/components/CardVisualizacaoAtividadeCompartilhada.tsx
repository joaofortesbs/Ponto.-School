
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Eye, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';
import { DataSyncService, AtividadeDados } from '../services/data-sync-service';
import { UniversalActivityHeader } from '../construction/components/UniversalActivityHeader';

// Import dos previews das atividades
import ActivityPreview from '../activities/default/ActivityPreview';
import ExerciseListPreview from '../activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '../activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '../activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '../activities/flash-cards/FlashCardsPreview';
import QuadroInterativoPreview from '../activities/quadro-interativo/QuadroInterativoPreview';
import MapaMentalPreview from '../activities/mapa-mental/MapaMentalPreview';

interface CardVisualizacaoAtividadeCompartilhadaProps {
  titulo: string;
  atividade?: AtividadeCompartilhavel;
  onApresentarMaterial?: () => void;
  onUsarMaterial?: () => void;
}

export const CardVisualizacaoAtividadeCompartilhada: React.FC<CardVisualizacaoAtividadeCompartilhadaProps> = ({
  titulo,
  atividade,
  onApresentarMaterial,
  onUsarMaterial
}) => {
  // Estado para armazenar a atividade sincronizada
  const [atividadeSincronizada, setAtividadeSincronizada] = useState<AtividadeDados | null>(null);

  // Efeito para sincronizar dados da atividade quando o componente é montado ou a atividade muda
  useEffect(() => {
    console.log('🔍 [CARD] Sincronizando dados da atividade compartilhada');
    console.log('📋 [CARD] Atividade recebida:', atividade);

    if (atividade) {
      // Sincronizar dados usando o serviço com dados completos
      const dadosParaSincronizar = {
        ...atividade,
        // Garantir que todos os campos essenciais estejam presentes
        id: atividade.id,
        titulo: atividade.titulo || atividade.title,
        tipo: atividade.tipo || atividade.type,
        descricao: atividade.descricao || atividade.description || atividade.dados?.descricao || atividade.dados?.description,
        dados: atividade.dados || {},
        customFields: atividade.customFields || {}
      };

      console.log('🔄 [CARD] Dados preparados para sincronização:', dadosParaSincronizar);

      const atividadeSincronizada = DataSyncService.sincronizarAtividade(dadosParaSincronizar);
      setAtividadeSincronizada(atividadeSincronizada);

      console.log('✅ [CARD] Dados sincronizados finais:', {
        id: atividadeSincronizada.id,
        titulo: atividadeSincronizada.titulo,
        descricao: atividadeSincronizada.descricao?.substring(0, 100) + '...',
        temDescricao: !!atividadeSincronizada.descricao
      });

      // Verificar se a descrição foi sincronizada corretamente
      if (!atividadeSincronizada.descricao) {
        console.warn('⚠️ [CARD] Descrição não encontrada após sincronização, tentando buscar diretamente');

        // Tentar buscar descrição diretamente do localStorage
        const chavesParaBuscar = [
          `constructedActivity_${atividade.id}`,
          `activity_${atividade.id}`,
          `schoolpower_activity_${atividade.id}`
        ];

        for (const chave of chavesParaBuscar) {
          try {
            const dados = localStorage.getItem(chave);
            if (dados) {
              const dadosParseados = JSON.parse(dados);
              if (dadosParseados.descricao || dadosParseados.description) {
                console.log('✅ [CARD] Descrição encontrada em:', chave);
                setAtividadeSincronizada(prev => ({
                  ...prev,
                  descricao: dadosParseados.descricao || dadosParseados.description
                }));
                break;
              }
            }
          } catch (e) {
            console.log('⚠️ [CARD] Erro ao buscar em:', chave, e);
          }
        }
      }
    }
  }, [atividade]);

  // Estado para controlar se a descrição está expandida - inicia minimizado
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Estados para Container Transform (Shared Element Transition)
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Função para renderizar a pré-visualização baseada no tipo da atividade
  const renderActivityPreview = () => {
    if (!atividadeSincronizada) return null;

    const activityType = atividadeSincronizada.tipo;
    const activityData = atividadeSincronizada.dados || {};

    console.log('🎯 Renderizando preview da atividade sincronizada:', { 
      tipo: activityType, 
      dados: activityData,
      atividadeSincronizada 
    });

    try {
      switch (activityType) {
        case 'lista-exercicios':
          return (
            <ExerciseListPreview
              data={activityData}
              customFields={atividadeSincronizada.customFields}
            />
          );

        case 'plano-aula':
          return (
            <PlanoAulaPreview
              data={activityData}
              activityData={atividadeSincronizada}
            />
          );

        case 'sequencia-didatica':
          return (
            <SequenciaDidaticaPreview
              data={activityData}
              activityData={atividadeSincronizada}
            />
          );

        case 'quiz-interativo':
          return (
            <QuizInterativoPreview
              content={activityData}
              isLoading={false}
            />
          );

        case 'flash-cards':
          return (
            <FlashCardsPreview
              content={activityData}
              isLoading={false}
            />
          );

        case 'quadro-interativo':
          return (
            <QuadroInterativoPreview
              data={activityData}
              activityData={atividadeSincronizada}
            />
          );

        case 'mapa-mental':
          return (
            <MapaMentalPreview
              data={activityData}
            />
          );

        default:
          return (
            <ActivityPreview
              content={activityData}
              activityData={atividadeSincronizada}
            />
          );
      }
    } catch (error) {
      console.error('❌ Erro ao renderizar preview da atividade compartilhada:', error);
      return (
        <div className="flex items-center justify-center p-8" style={{ color: '#ffffff' }}>
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
            <p style={{ color: '#d1d5db' }}>Erro ao carregar pré-visualização</p>
          </div>
        </div>
      );
    }
  };

  // Função para iniciar Container Transform (expansão do card)
  const handlePresentarAtividade = async () => {
    if (!cardRef.current || isAnimating) return;

    setIsAnimating(true);

    // Obter posição inicial do card
    const cardRect = cardRef.current.getBoundingClientRect();

    // Criar elemento temporário para animação
    const animationElement = document.createElement('div');
    animationElement.style.cssText = `
      position: fixed;
      top: ${cardRect.top}px;
      left: ${cardRect.left}px;
      width: ${cardRect.width}px;
      height: ${cardRect.height}px;
      background: #111827;
      border-radius: 16px;
      z-index: 9999;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform-origin: center;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Clonar conteúdo do card original
    const cardClone = cardRef.current.cloneNode(true) as HTMLElement;
    cardClone.style.transform = 'scale(0.75)';
    cardClone.style.transformOrigin = 'top left';
    animationElement.appendChild(cardClone);

    document.body.appendChild(animationElement);

    // Animar para tela cheia
    requestAnimationFrame(() => {
      animationElement.style.top = '0px';
      animationElement.style.left = '0px';
      animationElement.style.width = '100vw';
      animationElement.style.height = '100vh';
      animationElement.style.borderRadius = '0px';

      // Escalar conteúdo para tamanho normal
      const clonedContent = animationElement.firstChild as HTMLElement;
      if (clonedContent) {
        clonedContent.style.transform = 'scale(1)';
        clonedContent.style.height = '100vh';
      }
    });

    // Após animação, mostrar interface fullscreen
    setTimeout(() => {
      setIsFullscreenMode(true);
      document.body.removeChild(animationElement);
      setIsAnimating(false);

      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
    }, 600);

    // Chamar função original se existir
    if (onApresentarMaterial) {
      onApresentarMaterial();
    }
  };

  // Função para fechar modo fullscreen com animação reversa otimizada
  const handleCloseFullscreen = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Obter posição do card original de forma mais eficiente
    const originalCardRect = cardRef.current?.getBoundingClientRect();
    if (!originalCardRect) {
      // Fallback direto se não conseguir obter posição
      setIsFullscreenMode(false);
      setIsAnimating(false);
      document.body.style.overflow = 'auto';
      return;
    }

    // Criar elemento temporário otimizado para animação reversa
    const animationElement = document.createElement('div');
    animationElement.style.cssText = `
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100vw;
      height: 100vh;
      background: #111827;
      border-radius: 0px;
      z-index: 10000;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, width, height, border-radius;
      backface-visibility: hidden;
    `;

    document.body.appendChild(animationElement);

    // Esconder interface fullscreen imediatamente para evitar conflitos
    setIsFullscreenMode(false);

    // Usar requestAnimationFrame duplo para garantir que o DOM esteja pronto
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animationElement.style.top = `${originalCardRect.top}px`;
        animationElement.style.left = `${originalCardRect.left}px`;
        animationElement.style.width = `${originalCardRect.width}px`;
        animationElement.style.height = `${originalCardRect.height}px`;
        animationElement.style.borderRadius = '16px';
        animationElement.style.opacity = '0.8';
      });
    });

    // Limpar após animação com timeout reduzido
    setTimeout(() => {
      if (document.body.contains(animationElement)) {
        document.body.removeChild(animationElement);
      }
      setIsAnimating(false);

      // Restaurar scroll do body
      document.body.style.overflow = 'auto';
    }, 500);
  };

  // Estilos forçados para tema escuro - aplicados diretamente via CSS inline
  const darkThemeStyles = {
    container: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      colorScheme: 'dark'
    },
    card: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      color: '#ffffff'
    },
    text: {
      color: '#ffffff'
    },
    textSecondary: {
      color: '#e5e7eb'
    },
    textMuted: {
      color: '#9ca3af'
    },
    button: {
      color: '#ffffff'
    }
  };

  return (
    <div style={darkThemeStyles.container} className="w-full max-w-4xl">
      {/* UniversalActivityHeader - Com estilo específico para página de compartilhamento */}
      <div style={darkThemeStyles.container}>
        <UniversalActivityHeader
          isSharedActivity={true}
          activityTitle={atividadeSincronizada?.titulo || titulo}
          activityId={atividadeSincronizada?.id || atividade?.id}
          activityIcon={(() => {
            const activityType = atividadeSincronizada?.tipo || '';
            if (activityType.includes('flash-cards')) {
              return () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              );
            } else if (activityType.includes('quiz')) {
              return () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              );
            } else if (activityType.includes('lista-exercicios')) {
              return () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
              );
            } else if (activityType.includes('plano-aula')) {
              return () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              );
            } else if (activityType.includes('sequencia-didatica')) {
              return () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M9 4v1.38c-.83-.33-1.72-.5-2.61-.5-1.79 0-3.58.68-4.95 2.05l3.33 3.33h1.11v1.11c.86.86 1.98 1.31 3.11 1.36V15H8v1.38c-.83-.33-1.72-.5-2.61-.5-1.79 0-3.58.68-4.95 2.05L3.77 21.3c.69.69 1.73.69 2.42 0l3.33-3.33h1.11v1.11c.86.86 1.98 1.31 3.11 1.36V22h1v-1.56c1.13-.05 2.25-.5 3.11-1.36V9h-1v1.56c-1.13.05-2.25.5-3.11 1.36v1.11H9.89l-3.33-3.33c-.69-.69-1.73-.69-2.42 0L.81 12.03c-.69.69-.69 1.73 0 2.42l3.33 3.33v1.11h1.11c.86.86 1.98 1.31 3.11 1.36V22h1v-1.56c1.13-.05 2.25-.5 3.11-1.36v-1.11h1.11l3.33 3.33c.69.69 1.73.69 2.42 0l3.33-3.33c.69-.69.69-1.73 0-2.42l-3.33-3.33v-1.11h-1.11c-.86-.86-1.98-1.31-3.11-1.36V4h-1z"/>
                </svg>
              );
            } else {
              return () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              );
            }
          })()}
          activityType={(() => {
            const tipo = atividadeSincronizada?.tipo || '';
            if (tipo.includes('flash-cards')) return 'Flash Cards';
            if (tipo.includes('quiz')) return 'Quiz Interativo';
            if (tipo.includes('lista-exercicios')) return 'Lista de Exercícios';
            if (tipo.includes('plano-aula')) return 'Plano de Aula';
            if (tipo.includes('sequencia-didatica')) return 'Sequência Didática';
            if (tipo.includes('quadro-interativo')) return 'Quadro Interativo';
            if (tipo.includes('mapa-mental')) return 'Mapa Mental';
            return 'Atividade';
          })()}
          activityId={atividadeSincronizada?.id || 'atividade-compartilhada'}
          userName={atividade?.professorNome || 'Prof. João'}
          userAvatar={atividade?.professorAvatar}
          schoolPoints={atividade?.schoolPoints || 100}
          onMoreOptions={() => {
            console.log('Menu de opções na atividade compartilhada');
          }}
          onAddToClass={() => {
            console.log('Adicionar à aula - atividade compartilhada');
          }}
          onDownload={() => {
            console.log('Download da atividade compartilhada');
          }}
          onShare={() => {
            console.log('Compartilhar atividade');
          }}
          onSendMaterial={() => {
            console.log('Enviar material da atividade compartilhada');
          }}
          onMakePrivate={() => {
            console.log('Tornar atividade privada');
          }}
          onDelete={() => {
            console.log('Deletar atividade compartilhada');
          }}
          showShareButton={true}
        />
      </div>

      {/* Card principal forçado para modo escuro - independente do tema da plataforma */}
      <Card style={darkThemeStyles.card} className="w-full max-w-4xl shadow-xl border">
        <CardContent style={darkThemeStyles.card} className="p-8 min-h-[550px] flex flex-col">
          {/* Seção de Descrição da Atividade - Expansível com Clique - Forçada para modo escuro */}
          <div className="mb-6">
            <Card 
              style={{
                background: 'linear-gradient(to right, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.25))',
                borderColor: 'rgba(251, 146, 60, 0.3)',
                color: '#ffffff'
              }}
              className="rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <CardContent className={`transition-all duration-500 ease-in-out ${
                isDescriptionExpanded ? 'p-6' : 'p-3'
              }`} style={{ color: '#ffffff' }}>
                <div className="flex items-start gap-4">
                  {/* Barra lateral indicadora otimizada para modo escuro */}
                  <div className={`w-2 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full flex-shrink-0 transition-all duration-500 shadow-lg shadow-orange-500/30 ${
                    isDescriptionExpanded ? 'h-20' : 'h-8'
                  }`}></div>

                  <div className="flex-1">
                    {/* Cabeçalho com indicador de expansão otimizado para modo escuro */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold flex items-center gap-2 transition-all duration-300 ${
                        isDescriptionExpanded ? 'text-lg' : 'text-base'
                      }`} style={{ color: '#ffffff' }}>
                        <span style={{ color: '#fed7aa' }}>📋</span>
                        Sobre esta Atividade
                      </h3>
                      <div className="flex items-center gap-1 text-xs hover:text-orange-200 transition-colors" style={{ color: '#fed7aa' }}>
                        {isDescriptionExpanded ? (
                          <>
                            <span>Minimizar</span>
                            <ChevronUp className="w-3 h-3 transition-transform duration-300" />
                          </>
                        ) : (
                          <>
                            <span>Ver mais</span>
                            <ChevronDown className="w-3 h-3 transition-transform duration-300" />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Container da descrição com animação suave otimizado para modo escuro */}
                    <div className="relative overflow-hidden">
                      {/* Descrição só aparece quando expandido */}
                      {isDescriptionExpanded && (
                        <div className="transition-all duration-700 ease-in-out max-h-96 opacity-100">
                          <p className="leading-relaxed text-sm" style={{ color: '#e5e7eb' }}>
                            {atividadeSincronizada?.descricao || 'Descrição da atividade não disponível.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Metadados da Atividade otimizados para modo escuro - só aparece quando expandido */}
                    {isDescriptionExpanded && (
                      <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in duration-500">
                        <div className="rounded-full px-3 py-1 text-xs font-medium shadow-sm" style={{ backgroundColor: 'rgba(249, 115, 22, 0.3)', borderColor: 'rgba(251, 146, 60, 0.4)', color: '#fed7aa', border: '1px solid' }}>
                          {(() => {
                            const tipo = atividadeSincronizada?.tipo || '';
                            if (tipo.includes('flash-cards')) return 'Flash Cards';
                            if (tipo.includes('quiz')) return 'Quiz Interativo';
                            if (tipo.includes('lista-exercicios')) return 'Lista de Exercícios';
                            if (tipo.includes('plano-aula')) return 'Plano de Aula';
                            if (tipo.includes('sequencia-didatica')) return 'Sequência Didática';
                            if (tipo.includes('quadro-interativo')) return 'Quadro Interativo';
                            if (tipo.includes('mapa-mental')) return 'Mapa Mental';
                            return 'Atividade';
                          })()}
                        </div>
                        {atividadeSincronizada?.disciplina && (
                          <div className="rounded-full px-3 py-1 text-xs font-medium shadow-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)', borderColor: 'rgba(96, 165, 250, 0.4)', color: '#bfdbfe', border: '1px solid' }}>
                            {atividadeSincronizada.disciplina}
                          </div>
                        )}
                        {atividadeSincronizada?.nivel && (
                          <div className="rounded-full px-3 py-1 text-xs font-medium shadow-sm" style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)', borderColor: 'rgba(74, 222, 128, 0.4)', color: '#bbf7d0', border: '1px solid' }}>
                            {atividadeSincronizada.nivel}
                          </div>
                        )}
                        {atividadeSincronizada?.tempo_estimado && (
                          <div className="rounded-full px-3 py-1 text-xs font-medium shadow-sm" style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)', borderColor: 'rgba(196, 181, 253, 0.4)', color: '#e9d5ff', border: '1px solid' }}>
                            {atividadeSincronizada.tempo_estimado} min
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card de Pré-visualização da Atividade forçado para modo escuro */}
          <div className="mb-8 flex-1 relative group">
            <Card 
              ref={cardRef} 
              style={{
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                borderColor: 'rgba(75, 85, 99, 0.4)',
                color: '#ffffff'
              }}
              className="rounded-2xl shadow-xl overflow-hidden h-full backdrop-blur-sm"
            >
              <CardContent className="p-0 h-full flex flex-col" style={{ color: '#ffffff' }}>
                <div className="p-4 shadow-lg" style={{ background: 'linear-gradient(to right, #f97316, #ea580c)' }}>
                  <div className="flex items-center justify-center gap-2" style={{ color: '#ffffff' }}>
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">Pré-visualização da Atividade</span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden min-h-[350px] max-h-[350px] relative">
                  {/* Conteúdo da pré-visualização com interação desabilitada - visualização fixa tipo captura */}
                  <div className="p-4 pointer-events-none overflow-hidden h-full" style={{ color: '#ffffff' }}>
                    <div className="transform scale-75 origin-top-left w-[133%] h-[133%] overflow-hidden">
                      <div style={darkThemeStyles.container}>
                        {renderActivityPreview()}
                      </div>
                    </div>
                  </div>

                  {/* Container unificado SEMPRE VISÍVEL: Overlay + Ícone + Texto otimizado para modo escuro */}
                  <div 
                    onClick={handlePresentarAtividade}
                    className="absolute inset-0 z-40 pointer-events-auto cursor-pointer bg-black/0 group-hover:bg-black/50 backdrop-blur-none group-hover:backdrop-blur-md transition-all duration-700 ease-in-out flex items-center justify-center"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 10000
                    }}
                  >
                    {/* Container unificado com ícone e texto FIXO otimizado para modo escuro */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-800 ease-out transform scale-75 group-hover:scale-100 translate-y-4 group-hover:translate-y-0 flex flex-col items-center gap-4 pointer-events-none relative" style={{ color: '#ffffff' }}>
                      {/* Ícone de play com animação aprimorada otimizado para modo escuro */}
                      <div className="bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 rounded-full p-5 shadow-2xl transition-all duration-500 ease-out transform group-hover:rotate-[360deg] group-hover:scale-110 border-2 border-orange-200/40 relative overflow-hidden shadow-orange-500/30">
                        {/* Efeito de brilho interno do ícone otimizado para modo escuro */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        <Play className="w-10 h-10 fill-white drop-shadow-xl relative z-10 transition-all duration-300 group-hover:scale-110" />
                      </div>

                      {/* Texto com efeitos aprimorados forçado para modo escuro */}
                      <div className="text-xl font-bold px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl text-center whitespace-nowrap transform transition-all duration-600 ease-out group-hover:shadow-orange-400/40 group-hover:border-orange-300/50 relative overflow-hidden" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(251, 146, 60, 0.3)', border: '1px solid' }}>
                        {/* Efeito de brilho no texto forçado para modo escuro */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" style={{ background: 'linear-gradient(to right, transparent, rgba(251, 191, 36, 0.15), transparent)' }}></div>
                        <span className="relative z-10" style={{ color: '#ffffff' }}>Apresentar Atividade</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões na base do card otimizados para modo escuro */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={handlePresentarAtividade}
              style={{
                background: 'linear-gradient(to right, #f97316, #ea580c)',
                color: '#ffffff',
                border: 'none'
              }}
              className="flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/30"
            >
              <Play className="w-5 h-5" />
              Apresentar Material
            </Button>

            <Button
              onClick={onUsarMaterial}
              style={{
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                color: '#ffffff',
                border: 'none'
              }}
              className="flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/30"
            >
              <Download className="w-5 h-5" />
              Usar Material
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interface Fullscreen forçada para modo escuro - Container Transform */}
      {isFullscreenMode && (
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 z-50 overflow-auto"
          style={{ 
            isolation: 'isolate',
            backgroundColor: '#111827',
            color: '#ffffff',
            colorScheme: 'dark'
          }}
        >
          {/* Header minimalista com apenas botão de fechar otimizado para modo escuro */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              onClick={handleCloseFullscreen}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: 'rgba(75, 85, 99, 0.4)',
                border: '1px solid',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
              }}
            >
              <X className="w-6 h-6" style={{ color: '#e5e7eb' }} />
            </Button>
          </div>

          {/* Atividade em Tela Cheia - Totalmente Funcional */}
          <div className="w-full h-full" style={darkThemeStyles.container}>
            {renderActivityPreview()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardVisualizacaoAtividadeCompartilhada;
