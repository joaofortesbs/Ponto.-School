
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buscarAtividadeCompartilhada, AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';
import ParticlesBackground from '@/sections/SchoolPower/components/ParticlesBackground';
import CardVisualizacaoAtividadeCompartilhada from './CardVisualizacaoAtividadeCompartilhada';
import { useTheme } from '@/hooks/useTheme';

interface InterfaceCompartilharAtividadeProps {
  activityId?: string;
  uniqueCode?: string;
}

export const InterfaceCompartilharAtividade: React.FC<InterfaceCompartilharAtividadeProps> = ({
  activityId: propActivityId,
  uniqueCode: propUniqueCode
}) => {
  const params = useParams();
  const [atividade, setAtividade] = useState<AtividadeCompartilhavel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [theme, setTheme] = useTheme();

  // O código único pode estar em params.uniqueCode ou params.activityId (se for rota curta)
  const finalUniqueCode = propUniqueCode || params.uniqueCode || params.activityId;
  const finalActivityId = propActivityId;

  // Ativar dark mode NATIVO da plataforma para páginas compartilhadas
  useEffect(() => {
    const temaAnterior = localStorage.getItem('theme');
    console.log('🌙 [TEMA] Ativando dark mode nativo para atividade compartilhada');
    console.log('🌙 [TEMA] Tema anterior:', temaAnterior);
    
    // Forçar dark mode
    setTheme('dark');
    
    // Cleanup: restaurar tema anterior quando sair da página
    return () => {
      if (temaAnterior === 'light') {
        console.log('🌙 [TEMA] Restaurando tema anterior:', temaAnterior);
        setTheme('light');
      }
    };
  }, [setTheme]);

  useEffect(() => {
    const carregarAtividade = async () => {
      // O código único agora é o ID da atividade no banco
      const codigoUnicoAtividade = finalUniqueCode || finalActivityId;
      
      if (!codigoUnicoAtividade) {
        setErro('Link inválido: código único não encontrado');
        setCarregando(false);
        return;
      }

      try {
        console.log('🔍 [PÚBLICO] Carregando atividade do banco Neon...');
        console.log('🔑 [PÚBLICO] Código único:', codigoUnicoAtividade);
        console.log('🌐 [PÚBLICO] URL completa:', window.location.href);
        
        // Buscar atividade com dados do criador do banco Neon
        const { atividadesNeonService } = await import('@/services/atividadesNeonService');
        const resultado = await atividadesNeonService.buscarAtividadeComCriador(codigoUnicoAtividade);
        
        if (resultado.success && resultado.data) {
          console.log('✅ [PÚBLICO] Atividade encontrada no banco Neon:', resultado.data);
          
          // Converter dados do banco para formato da interface
          const atividadeNeon = resultado.data;
          const criador = atividadeNeon.criador;
          
          // Usar dados do criador se disponíveis, senão usar fallback
          const professorNome = criador?.nome_completo || atividadeNeon.id_json?.professorNome || 'Professor';
          const professorAvatar = criador?.imagem_avatar || atividadeNeon.id_json?.professorAvatar;
          
          console.log('👤 [PÚBLICO] Dados do criador:', {
            nome: professorNome,
            avatar: professorAvatar ? 'Disponível' : 'Não disponível'
          });
          
          console.log('💰 [PÚBLICO] School Points carregados do banco Neon:', atividadeNeon.school_points || 100);
          
          const atividadeConvertida: AtividadeCompartilhavel = {
            id: atividadeNeon.id,
            titulo: atividadeNeon.id_json?.title || 'Atividade',
            descricao: atividadeNeon.id_json?.description || '',
            tipo: atividadeNeon.tipo,
            dados: atividadeNeon.id_json,
            customFields: atividadeNeon.id_json?.customFields || {},
            professorNome: professorNome,
            professorAvatar: professorAvatar,
            schoolPoints: atividadeNeon.school_points || 100,
            criadoPor: atividadeNeon.id_user,
            criadoEm: atividadeNeon.created_at || new Date().toISOString(),
            codigoUnico: atividadeNeon.id,
            linkPublico: window.location.href,
            ativo: true,
            disciplina: atividadeNeon.id_json?.disciplina,
            nivel: atividadeNeon.id_json?.nivel,
            tempo_estimado: atividadeNeon.id_json?.tempo_estimado
          };
          
          console.log('🔄 [PÚBLICO] Setando atividade convertida com dados do criador:', atividadeConvertida);
          setAtividade(atividadeConvertida);
          console.log('📝 [PÚBLICO] Mudando título do documento para:', `${atividadeConvertida.titulo} - Ponto School`);
          document.title = `${atividadeConvertida.titulo} - Ponto School`;
          console.log('✅ [PÚBLICO] Atividade carregada, finalizando loading...');
          
        } else {
          console.log('⚠️ [PÚBLICO] Atividade não encontrada no banco Neon');
          console.log('🔄 [PÚBLICO] Tentando buscar no localStorage como fallback...');
          
          // Fallback: buscar do localStorage
          const atividadeEncontrada = await buscarAtividadeCompartilhada(
            finalActivityId || codigoUnicoAtividade, 
            codigoUnicoAtividade
          );
          
          if (atividadeEncontrada) {
            console.log('✅ [PÚBLICO] Atividade encontrada no localStorage:', atividadeEncontrada);
            setAtividade(atividadeEncontrada);
            document.title = `${atividadeEncontrada.titulo} - Ponto School`;
          } else {
            console.error('❌ [PÚBLICO] Atividade não encontrada em nenhum lugar');
            setErro('Atividade não encontrada ou link inválido');
          }
        }
        
      } catch (error) {
        console.error('❌ [PÚBLICO] Erro ao carregar:', error);
        setErro('Erro ao carregar atividade');
      } finally {
        console.log('🏁 [PÚBLICO] Finally block - setando carregando para false');
        setCarregando(false);
        console.log('🏁 [PÚBLICO] Carregando setado para false');
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

  const handleApresentarMaterial = () => {
    console.log('🎯 Apresentar Material clicado para:', atividade.titulo);
    // Aqui será implementada a lógica para apresentar o material
  };

  const handleUsarMaterial = () => {
    console.log('📥 Usar Material clicado para:', atividade.titulo);
    // Aqui será implementada a lógica para usar o material
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: "rgb(15, 23, 42)" }}>
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
