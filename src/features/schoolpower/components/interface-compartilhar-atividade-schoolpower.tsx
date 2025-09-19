
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, BookOpen, Copy, Check } from 'lucide-react';
import { buscarAtividadeCompartilhada, AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';

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
  const [linkCopiado, setLinkCopiado] = useState(false);

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

  const copiarLink = async () => {
    if (!atividade) return;
    
    try {
      await navigator.clipboard.writeText(atividade.linkPublico);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Carregando atividade...</h3>
            <p className="text-gray-600">
              Aguarde enquanto buscamos a atividade compartilhada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Erro ao carregar</h3>
            <p className="text-red-600 mb-6">{erro}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!atividade) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simples */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ponto School</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copiarLink}
            >
              {linkCopiado ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{atividade.titulo}</CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Tipo: {atividade.tipo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Atividade Compartilhada
                </h4>
                <p className="text-sm text-blue-700">
                  Esta atividade foi compartilhada publicamente pela plataforma Ponto School. 
                  Você pode visualizar o conteúdo livremente.
                </p>
              </div>

              {atividade.dados && (
                <div>
                  <h3 className="font-semibold mb-3">Conteúdo da Atividade</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(atividade.dados, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer simples */}
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Gostou desta atividade?</h3>
              <p className="text-gray-600 mb-4">
                Acesse a plataforma Ponto School e crie suas próprias atividades.
              </p>
              <Button 
                onClick={() => window.open('/', '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Acessar Ponto School
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InterfaceCompartilharAtividade;
