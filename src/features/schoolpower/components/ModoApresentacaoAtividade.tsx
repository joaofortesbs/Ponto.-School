import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, LogOut, Accessibility, Globe, Type, Volume2, Check } from 'lucide-react';
import { AtividadeDados } from '../services/data-sync-service';
import activitiesApiService, { ActivityData } from '@/services/activitiesApiService';
import { visitantesService } from '@/services/visitantesService';
import { AccessibilityProvider, useAccessibility, Language } from '@/contexts/AccessibilityContext';
import { useActivityTranslation } from '@/hooks/useActivityTranslation';
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Import dos previews das atividades
import ActivityPreview from '../activities/default/ActivityPreview';
import ExerciseListPreview from '../activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '../activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '../activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '../activities/flash-cards/FlashCardsPreview';
import QuadroInterativoPreview from '../activities/quadro-interativo/QuadroInterativoPreview';
import MapaMentalPreview from '../activities/mapa-mental/MapaMentalPreview';

const languageOptions: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// Componente interno que usa o contexto de acessibilidade
const ModoApresentacaoContent: React.FC<{
  atividade: AtividadeDados;
  uniqueCode: string;
  sparks: number;
  rating: number;
  hoverRating: number;
  setRating: (rating: number) => void;
  setHoverRating: (rating: number) => void;
  navigate: (path: string) => void;
}> = ({ atividade, uniqueCode, sparks, rating, hoverRating, setRating, setHoverRating, navigate }) => {
  const { language, fontSize, voiceReading, setLanguage, setFontSize, setVoiceReading } = useAccessibility();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  
  // Traduzir conteúdo da atividade com ID único para cache eficiente
  const { translatedContent, isTranslating } = useActivityTranslation(atividade.dados, {
    activityId: uniqueCode
  });

  const handleVoiceReadingToggle = () => {
    setVoiceReading(!voiceReading);
    if (!voiceReading) {
      const text = atividade?.titulo || 'Atividade carregada';
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'it' ? 'it-IT' : 'de-DE';
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
      console.log(`🔊 [ACESSIBILIDADE] Leitura por voz iniciada`);
    } else {
      window.speechSynthesis.cancel();
      console.log(`🔇 [ACESSIBILIDADE] Leitura por voz pausada`);
    }
  };

  const renderActivityPreview = () => {
    if (!atividade) return null;

    const activityType = atividade.tipo;
    // Usar conteúdo traduzido se disponível, senão usar original
    const activityData = translatedContent || atividade.dados || {};

    console.log('🎯 [APRESENTAÇÃO] Renderizando atividade:', { 
      tipo: activityType, 
      dados: activityData,
      atividade 
    });

    try {
      switch (activityType) {
        case 'lista-exercicios':
          return (
            <ExerciseListPreview
              data={activityData}
              customFields={atividade.customFields}
            />
          );

        case 'plano-aula':
          return (
            <PlanoAulaPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'sequencia-didatica':
          return (
            <SequenciaDidaticaPreview
              data={activityData}
              activityData={atividade}
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
              activityData={atividade}
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
              activityData={atividade}
            />
          );
      }
    } catch (error) {
      console.error('❌ [APRESENTAÇÃO] Erro ao renderizar preview:', error);
      return (
        <div className="flex items-center justify-center p-8 text-white">
          <div className="text-center">
            <p className="text-gray-300">Erro ao carregar atividade</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-auto bg-white dark:bg-gray-900"
      style={{ isolation: 'isolate', fontSize: `${fontSize}px` }}
    >
      {/* Cabeçalho Universal do Modo Apresentação */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Botão de Sair - Canto Esquerdo */}
          <Button
            onClick={() => navigate(`/atividade/${uniqueCode}`)}
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
          >
            <LogOut className="w-5 h-5" />
          </Button>

          {/* Sistema de Avaliação (5 Estrelas) + Acessibilidade + Sparks - Canto Direito */}
          <div className="flex items-center gap-4">
            {/* 5 Estrelas de Avaliação */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setRating(star);
                    console.log(`⭐ [AVALIAÇÃO] Usuário avaliou com ${star} estrelas`);
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Botão de Acessibilidade com Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                >
                  <Accessibility className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Configurações de Acessibilidade</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Opção de Idioma */}
                {!showLanguageMenu && !showFontSizeMenu && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setShowLanguageMenu(true)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Idioma: {languageOptions.find(l => l.code === language)?.name}</span>
                    </DropdownMenuItem>

                    {/* Opção de Tamanho de Fonte */}
                    <DropdownMenuItem 
                      onClick={() => setShowFontSizeMenu(true)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Type className="w-4 h-4" />
                      <span>Tamanho da Fonte: {fontSize}px</span>
                    </DropdownMenuItem>

                    {/* Opção de Leitura por Voz */}
                    <DropdownMenuItem 
                      onClick={handleVoiceReadingToggle}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Leitura por Voz: {voiceReading ? 'Ativada' : 'Desativada'}</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Menu de Seleção de Idioma */}
                {showLanguageMenu && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setShowLanguageMenu(false)}
                      className="flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {languageOptions.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                          console.log(`🌍 [ACESSIBILIDADE] Idioma alterado para: ${lang.name}`);
                        }}
                        className="flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {language === lang.code && <Check className="w-4 h-4" />}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                {/* Menu de Ajuste de Tamanho de Fonte */}
                {showFontSizeMenu && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setShowFontSizeMenu(false)}
                      className="flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tamanho: {fontSize}px</span>
                      </div>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => {
                          setFontSize(value[0]);
                          console.log(`📏 [ACESSIBILIDADE] Tamanho de fonte alterado para: ${value[0]}px`);
                        }}
                        min={12}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>12px</span>
                        <span>24px</span>
                      </div>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sparks - Sem ícone de estrela */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-full shadow-lg">
              <span className="text-white font-bold text-lg">{sparks} SKs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Atividade em Tela Cheia - Totalmente Funcional */}
      <div className="min-h-screen" style={{ fontSize: 'var(--accessibility-font-size, 16px)' }}>
        {isTranslating && (
          <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="animate-pulse text-blue-600 dark:text-blue-400">
              🌐 Traduzindo conteúdo...
            </div>
          </div>
        )}
        {renderActivityPreview()}
      </div>
    </div>
  );
};

export const ModoApresentacaoAtividade: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  const navigate = useNavigate();
  const [atividade, setAtividade] = useState<AtividadeDados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sparks, setSparks] = useState<number>(100);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    const carregarAtividade = async () => {
      if (!uniqueCode) {
        setError('Código da atividade não encontrado');
        setLoading(false);
        return;
      }

      try {
        console.log('🎯 [APRESENTAÇÃO] Carregando atividade:', uniqueCode);
        
        const response = await activitiesApiService.getActivityByCode(uniqueCode);
        
        if (!response.success || !response.data) {
          setError('Atividade não encontrada');
          setLoading(false);
          return;
        }

        const activityData: any = Array.isArray(response.data) ? response.data[0] : response.data;
        const conteudoAtividade = activityData.id_json || activityData.conteudo || {};
        
        const atividadeConvertida: AtividadeDados = {
          id: activityData.id || activityData.codigo_unico,
          tipo: activityData.tipo,
          titulo: activityData.titulo || '',
          descricao: activityData.descricao || '',
          dados: conteudoAtividade,
          customFields: conteudoAtividade?.customFields || {}
        };

        setAtividade(atividadeConvertida);
        setSparks(activityData.sparks || 100);

        console.log('✅ [APRESENTAÇÃO] Atividade carregada:', atividadeConvertida);
        console.log('💰 [APRESENTAÇÃO] Sparks:', activityData.sparks || 100);
        
        setLoading(false);
      } catch (error) {
        console.error('❌ [APRESENTAÇÃO] Erro ao carregar atividade:', error);
        setError('Erro ao carregar atividade');
        setLoading(false);
      }
    };

    carregarAtividade();
  }, [uniqueCode]);

  useEffect(() => {
    const registrarVisita = async () => {
      if (!atividade || !uniqueCode) return;

      try {
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        
        await visitantesService.registrarVisita({
          codigo_atividade: uniqueCode,
          id_usuario_visitante: userId || undefined,
          tipo_visitante: userId ? 'registrado' : 'anonimo'
        });

        console.log('✅ [APRESENTAÇÃO] Visita registrada com sucesso');
      } catch (error) {
        console.error('⚠️ [APRESENTAÇÃO] Erro ao registrar visita (não crítico):', error);
      }
    };

    registrarVisita();
  }, [atividade, uniqueCode]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  if (error || !atividade) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Atividade não encontrada'}</p>
          <Button onClick={() => navigate(`/atividade/${uniqueCode}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <ModoApresentacaoContent
        atividade={atividade}
        uniqueCode={uniqueCode}
        sparks={sparks}
        rating={rating}
        hoverRating={hoverRating}
        setRating={setRating}
        setHoverRating={setHoverRating}
        navigate={navigate}
      />
    </AccessibilityProvider>
  );
};
