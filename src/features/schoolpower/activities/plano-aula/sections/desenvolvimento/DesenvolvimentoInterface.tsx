
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Clock, Users, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { obterDadosDesenvolvimento, DesenvolvimentoData, EtapaDesenvolvimento } from './DesenvolvimentoData';

interface DesenvolvimentoInterfaceProps {
  data?: any;
  isVisible?: boolean;
}

export default function DesenvolvimentoInterface({ data, isVisible = true }: DesenvolvimentoInterfaceProps) {
  // Estado para controlar expansão das etapas
  const [etapasExpandidas, setEtapasExpandidas] = useState<{ [key: string]: boolean }>({});
  
  // Estado para os dados do desenvolvimento
  const [dadosDesenvolvimento, setDadosDesenvolvimento] = useState<DesenvolvimentoData | null>(null);

  // Carregar dados do desenvolvimento
  useEffect(() => {
    const dadosProcessados = obterDadosDesenvolvimento(data);
    setDadosDesenvolvimento(dadosProcessados);
    
    // Inicializar estado de expansão das etapas
    const estadoInicial: { [key: string]: boolean } = {};
    dadosProcessados.etapas.forEach(etapa => {
      estadoInicial[etapa.id] = false; // Começar todas fechadas
    });
    setEtapasExpandidas(estadoInicial);

    console.log('🏗️ Desenvolvimento Interface - Dados carregados:', dadosProcessados);
  }, [data]);

  // Função para alternar expansão de uma etapa específica
  const toggleEtapaExpansao = (etapaId: string) => {
    setEtapasExpandidas(prev => ({
      ...prev,
      [etapaId]: !prev[etapaId]
    }));
  };

  // Função para verificar se uma etapa está expandida
  const isEtapaExpandida = (etapaId: string): boolean => {
    return etapasExpandidas[etapaId] || false;
  };

  // Função para expandir todas as etapas
  const expandirTodasEtapas = () => {
    if (!dadosDesenvolvimento) return;
    
    const novoEstado: { [key: string]: boolean } = {};
    dadosDesenvolvimento.etapas.forEach(etapa => {
      novoEstado[etapa.id] = true;
    });
    setEtapasExpandidas(novoEstado);
  };

  // Função para contrair todas as etapas
  const contrairTodasEtapas = () => {
    if (!dadosDesenvolvimento) return;
    
    const novoEstado: { [key: string]: boolean } = {};
    dadosDesenvolvimento.etapas.forEach(etapa => {
      novoEstado[etapa.id] = false;
    });
    setEtapasExpandidas(novoEstado);
  };

  if (!isVisible || !dadosDesenvolvimento) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 max-h-[70vh] overflow-y-auto">
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Desenvolvimento da Aula</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={expandirTodasEtapas}
            className="text-xs"
          >
            Expandir Todas
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={contrairTodasEtapas}
            className="text-xs"
          >
            Contrair Todas
          </Button>
        </div>
      </div>

      {/* Informações Gerais */}
      {(dadosDesenvolvimento.metodologiaGeral || dadosDesenvolvimento.observacoesGerais) && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dadosDesenvolvimento.metodologiaGeral && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Metodologia:</h4>
                <p className="text-sm text-gray-700">{dadosDesenvolvimento.metodologiaGeral}</p>
              </div>
            )}
            {dadosDesenvolvimento.observacoesGerais && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Observações:</h4>
                <p className="text-sm text-gray-700">{dadosDesenvolvimento.observacoesGerais}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Etapas do Desenvolvimento */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Etapas do Desenvolvimento</h3>
        
        {dadosDesenvolvimento.etapas.map((etapa: EtapaDesenvolvimento, index: number) => (
          <Card key={etapa.id} className="border hover:shadow-md transition-shadow">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleEtapaExpansao(etapa.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isEtapaExpandida(etapa.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <CardTitle className="text-base font-medium">
                      {etapa.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {etapa.tempoEstimado}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {etapa.tipoInteracao}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Etapa {index + 1}
                </Badge>
              </div>
            </CardHeader>

            {isEtapaExpandida(etapa.id) && (
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                
                {/* Descrição da Etapa */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Descrição:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {etapa.descricao}
                    </p>
                  </div>

                  {/* Recursos Utilizados */}
                  {etapa.recursosUsados && etapa.recursosUsados.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Recursos Necessários:</h4>
                      <div className="flex flex-wrap gap-2">
                        {etapa.recursosUsados.map((recurso, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tipo de Interação */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-800 mb-1">Tipo de Interação:</h4>
                    <p className="text-sm text-blue-700">{etapa.tipoInteracao}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Recursos Complementares */}
      {dadosDesenvolvimento.recursosComplementares && dadosDesenvolvimento.recursosComplementares.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg">Recursos Complementares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dadosDesenvolvimento.recursosComplementares.map((recurso, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {recurso}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
