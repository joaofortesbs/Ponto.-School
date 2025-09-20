
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buscarAtividadeCompartilhada, AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';
import ParticlesBackground from '@/sections/SchoolPower/components/ParticlesBackground';
import CardVisualizacaoAtividadeCompartilhada from './CardVisualizacaoAtividadeCompartilhada';

interface InterfaceCompartilharAtividadeProps {
  activityId?: string;
  uniqueCode?: string;
}

export const InterfaceCompartilharAtividade: React.FC<InterfaceCompartilharAtividadeProps> = ({
  activityId: propActivityId,
  uniqueCode: propUniqueCode
}) => {
  const { activityId, uniqueCode } = useParams();
  const [atividade, setAtividade] = useState<AtividadeCompartilhavel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const finalActivityId = propActivityId || activityId;
  const finalUniqueCode = propUniqueCode || uniqueCode;

  // Estilos forçados para tema escuro
  const darkThemeStyles = {
    container: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      colorScheme: 'dark' as const
    },
    card: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      color: '#ffffff'
    }
  };

  useEffect(() => {
    const carregarAtividade = async () => {
      if (!finalActivityId || !finalUniqueCode) {
        setErro('Link inválido: parâmetros faltando');
        setCarregando(false);
        return;
      }

      try {
        console.log('🔍 [PÚBLICO] Carregando atividade:', { finalActivityId, finalUniqueCode });
        console.log('🌐 [PÚBLICO] URL completa:', window.location.href);
        
        const atividadeEncontrada = await buscarAtividadeCompartilhada(finalActivityId, finalUniqueCode);
        
        if (!atividadeEncontrada) {
          console.error('❌ [PÚBLICO] Atividade não encontrada com parâmetros:', { finalActivityId, finalUniqueCode });
          
          // Tentar buscar no localStorage como fallback
          const storageKey = 'ponto_school_atividades_compartilhaveis_v1.0';
          const todasAtividades = JSON.parse(localStorage.getItem(storageKey) || '[]');
          console.log('📋 [PÚBLICO] Atividades no localStorage:', todasAtividades);
          
          // Buscar por ID da atividade
          const atividadeFallback = todasAtividades.find((ativ: any) => 
            ativ.id === finalActivityId && ativ.ativo === true
          );
          
          if (atividadeFallback) {
            console.log('✅ [PÚBLICO] Atividade encontrada via fallback:', atividadeFallback);
            setAtividade(atividadeFallback);
            setCarregando(false);
            return;
          }
          
          setErro('Atividade não encontrada ou link expirado');
          setCarregando(false);
          return;
        }

        setAtividade(atividadeEncontrada);
        document.title = `${atividadeEncontrada.titulo} - Ponto School`;
        
      } catch (error) {
        console.error('❌ [PÚBLICO] Erro ao carregar:', error);
        setErro('Erro ao carregar atividade');
      } finally {
        setCarregando(false);
      }
    };

    carregarAtividade();
  }, [finalActivityId, finalUniqueCode]);

  if (carregando) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden" style={darkThemeStyles.container}>
        {/* Background de partículas */}
        <ParticlesBackground isDarkTheme={true} />
        
        {/* Conteúdo centralizado */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card style={darkThemeStyles.card} className="w-full max-w-md shadow-xl">
            <CardContent className="p-8 text-center" style={{ color: '#ffffff' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#f97316' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Carregando atividade...</h3>
              <p style={{ color: '#d1d5db' }}>
                Aguarde enquanto buscamos a atividade compartilhada.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden" style={darkThemeStyles.container}>
        {/* Background de partículas */}
        <ParticlesBackground isDarkTheme={true} />
        
        {/* Conteúdo centralizado */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card style={darkThemeStyles.card} className="w-full max-w-md shadow-xl">
            <CardContent className="p-8 text-center" style={{ color: '#ffffff' }}>
              <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#ef4444' }}>Erro ao carregar</h3>
              <p style={{ color: '#fca5a5' }} className="mb-6">{erro}</p>
              <Button 
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#f97316',
                  color: '#ffffff',
                  border: 'none'
                }}
                className="w-full hover:bg-orange-700 transition-colors"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!atividade) {
    return null;
  }

  const handleApresentarMaterial = () => {
    console.log('🎯 Apresentar Material clicado para:', atividade.titulo);
    // Aqui será implementada a lógica para apresentar o material
  };

  const handleUsarMaterial = () => {
    console.log('📥 Usar Material clicado para:', atividade.titulo);
    // Aqui será implementada a lógica para usar o material
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={darkThemeStyles.container}>
      {/* Background de partículas - igual ao School Power */}
      <ParticlesBackground isDarkTheme={true} />
      
      {/* Interface com o card centralizado */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <CardVisualizacaoAtividadeCompartilhada
          titulo={atividade.titulo}
          atividade={atividade}
          onApresentarMaterial={handleApresentarMaterial}
          onUsarMaterial={handleUsarMaterial}
        />
      </div>
    </div>
  );
};

export default InterfaceCompartilharAtividade;
