
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buscarAtividadeCompartilhada, AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';
import ParticlesBackground from '@/sections/SchoolPower/components/ParticlesBackground';

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

  useEffect(() => {
    const carregarAtividade = async () => {
      if (!finalActivityId || !finalUniqueCode) {
        setErro('Link inválido: parâmetros faltando');
        setCarregando(false);
        return;
      }

      try {
        console.log('🔍 [PÚBLICO] Carregando atividade:', { finalActivityId, finalUniqueCode });
        
        const atividadeEncontrada = await buscarAtividadeCompartilhada(finalActivityId, finalUniqueCode);
        
        if (!atividadeEncontrada) {
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
      <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: "rgb(15, 23, 42)" }}>
        {/* Background de partículas */}
        <ParticlesBackground isDarkTheme={true} />
        
        {/* Conteúdo centralizado */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-slate-800/90 border-slate-700">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
              <h3 className="text-lg font-semibold mb-2 text-white">Carregando atividade...</h3>
              <p className="text-slate-300">
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
      <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: "rgb(15, 23, 42)" }}>
        {/* Background de partículas */}
        <ParticlesBackground isDarkTheme={true} />
        
        {/* Conteúdo centralizado */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-slate-800/90 border-slate-700">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2 text-red-400">Erro ao carregar</h3>
              <p className="text-red-300 mb-6">{erro}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-orange-600 hover:bg-orange-700"
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: "rgb(15, 23, 42)" }}>
      {/* Background de partículas - igual ao School Power */}
      <ParticlesBackground isDarkTheme={true} />
      
      {/* Interface vazia - apenas o fundo de partículas */}
      <div className="relative z-10 min-h-screen">
        {/* Conteúdo da interface será adicionado aqui futuramente */}
      </div>
    </div>
  );
};

export default InterfaceCompartilharAtividade;
