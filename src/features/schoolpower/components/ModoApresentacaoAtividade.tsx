import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, LogOut, Accessibility, ChevronDown, Languages, Type, Contrast, Volume2 } from 'lucide-react';
import { AtividadeDados } from '../services/data-sync-service';
import activitiesApiService, { ActivityData } from '@/services/activitiesApiService';
import { visitantesService } from '@/services/visitantesService';
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

export const ModoApresentacaoAtividade: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  const navigate = useNavigate();
  const [atividade, setAtividade] = useState<AtividadeDados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolPoints, setSchoolPoints] = useState<number>(100);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Estados de acessibilidade
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [fontSize, setFontSize] = useState<'normal' | 'medium' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceReading, setVoiceReading] = useState<boolean>(false);

  useEffect(() => {
    const carregarAtividade = async () => {
      if (!uniqueCode) {
        setError('Código da atividade não encontrado');
        setLoading(false);
        return;
      }

      try {
        console.log('🎯 [APRESENTAÇÃO] Carregando atividade:', uniqueCode);
        
        // Carregar atividade usando API service
        const response = await activitiesApiService.getActivityByCode(uniqueCode);
        
        if (!response.success || !response.data) {
          setError('Atividade não encontrada');
          setLoading(false);
          return;
        }

        // Converter ActivityData para AtividadeDados
        const activityData: any = Array.isArray(response.data) ? response.data[0] : response.data;
        
        // O backend retorna id_json, precisamos mapear para conteudo
        const conteudoAtividade = activityData.id_json || activityData.conteudo || {};
        
        const atividadeConvertida: AtividadeDados = {
          id: activityData.id || activityData.codigo_unico,
          tipo: activityData.tipo,
          titulo: activityData.titulo || '',
          descricao: activityData.descricao || '',
          dados: conteudoAtividade,
          customFields: conteudoAtividade?.customFields || {}
        };

        console.log('✅ [APRESENTAÇÃO] Atividade carregada:', atividadeConvertida);
        setAtividade(atividadeConvertida);
        
        // Buscar School Points do banco de dados
        const sps = activityData.school_points ?? 100;
        setSchoolPoints(sps);
        console.log('💰 [APRESENTAÇÃO] School Points carregados do banco:', sps, 'da atividade:', activityData.id || activityData.codigo_unico);
        
        setLoading(false);
      } catch (err) {
        console.error('❌ [APRESENTAÇÃO] Erro ao carregar atividade:', err);
        setError('Erro ao carregar atividade');
        setLoading(false);
      }
    };

    carregarAtividade();
  }, [uniqueCode]);

  // Registrar visita automaticamente quando atividade é carregada
  useEffect(() => {
    const registrarVisita = async () => {
      if (!atividade || !uniqueCode) return;

      try {
        // Buscar dados do usuário logado (se houver)
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
        // Não bloquear a exibição da atividade se falhar o registro
      }
    };

    registrarVisita();
  }, [atividade, uniqueCode]);

  // Funções de acessibilidade
  const handleLanguageChange = (lang: 'pt' | 'en' | 'es') => {
    setLanguage(lang);
    console.log(`🌍 [ACESSIBILIDADE] Idioma alterado para: ${lang}`);
  };

  const handleFontSizeChange = () => {
    const sizes: Array<'normal' | 'medium' | 'large'> = ['normal', 'medium', 'large'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    setFontSize(nextSize);
    console.log(`📏 [ACESSIBILIDADE] Tamanho de fonte alterado para: ${nextSize}`);
  };

  const handleHighContrastToggle = () => {
    setHighContrast(!highContrast);
    console.log(`🎨 [ACESSIBILIDADE] Alto contraste ${!highContrast ? 'ativado' : 'desativado'}`);
  };

  const handleVoiceReadingToggle = () => {
    setVoiceReading(!voiceReading);
    if (!voiceReading) {
      // Iniciar leitura por voz
      const text = atividade?.titulo || 'Atividade carregada';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES';
      window.speechSynthesis.speak(utterance);
      console.log(`🔊 [ACESSIBILIDADE] Leitura por voz iniciada`);
    } else {
      // Parar leitura por voz
      window.speechSynthesis.cancel();
      console.log(`🔇 [ACESSIBILIDADE] Leitura por voz pausada`);
    }
  };

  // Aplicar estilos de acessibilidade
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'medium': return 'text-lg';
      case 'large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getContrastClass = () => {
    return highContrast 
      ? 'bg-black text-white' 
      : 'bg-white dark:bg-gray-900';
  };

  // Função para renderizar a pré-visualização baseada no tipo da atividade
  const renderActivityPreview = () => {
    if (!atividade) return null;

    const activityType = atividade.tipo;
    const activityData = atividade.dados || {};

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
    <div 
      className={`fixed inset-0 z-[100] overflow-auto ${getContrastClass()} ${getFontSizeClass()}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Cabeçalho Universal do Modo Apresentação */}
      <div className={`sticky top-0 z-30 backdrop-blur-md border-b ${highContrast ? 'bg-black/90 border-white' : 'bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800'}`}>
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

          {/* Sistema de Avaliação (5 Estrelas) + Acessibilidade + School Points - Canto Direito */}
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Configurações de Acessibilidade</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Opção de Idioma */}
                <DropdownMenuItem 
                  onClick={() => {
                    const nextLang = language === 'pt' ? 'en' : language === 'en' ? 'es' : 'pt';
                    handleLanguageChange(nextLang);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Languages className="w-4 h-4" />
                  <span>Idioma: {language === 'pt' ? 'Português' : language === 'en' ? 'English' : 'Español'}</span>
                </DropdownMenuItem>

                {/* Opção de Aumentar Fonte */}
                <DropdownMenuItem 
                  onClick={handleFontSizeChange}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Type className="w-4 h-4" />
                  <span>Tamanho da Fonte: {fontSize === 'normal' ? 'Normal' : fontSize === 'medium' ? 'Médio' : 'Grande'}</span>
                </DropdownMenuItem>

                {/* Opção de Alto Contraste */}
                <DropdownMenuItem 
                  onClick={handleHighContrastToggle}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Contrast className="w-4 h-4" />
                  <span>Alto Contraste: {highContrast ? 'Ativado' : 'Desativado'}</span>
                </DropdownMenuItem>

                {/* Opção de Leitura por Voz */}
                <DropdownMenuItem 
                  onClick={handleVoiceReadingToggle}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Leitura por Voz: {voiceReading ? 'Ativada' : 'Desativada'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* School Points - Sem ícone de estrela */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-full shadow-lg">
              <span className="text-white font-bold text-lg">{schoolPoints} SPs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Atividade em Tela Cheia - Totalmente Funcional */}
      <div className="w-full min-h-screen pt-4">
        {renderActivityPreview()}
      </div>
    </div>
  );
};

export default ModoApresentacaoAtividade;
