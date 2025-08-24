import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Target } from "lucide-react";

interface QuadroInterativoPreviewProps {
  data: any;
}

export function QuadroInterativoPreview({ data }: QuadroInterativoPreviewProps) {
  const [displayData, setDisplayData] = useState(null);

  useEffect(() => {
    console.log('🖥️ QuadroInterativoPreview - Dados recebidos:', data);

    // Processar dados de diferentes fontes
    let processedData = null;

    if (data?.cardContent) {
      // Dados já processados pela IA
      processedData = {
        title: data.cardContent.title || data.title || 'Quadro Interativo',
        text: data.cardContent.text || data.description || 'Conteúdo educativo interativo',
        isGenerated: data.isGeneratedByAI || false,
        customFields: data.customFields || {}
      };
    } else if (data?.respostasIA?.data) {
      // Dados da resposta da IA
      const aiData = data.respostasIA.data;
      processedData = {
        title: aiData.title || 'Quadro Interativo',
        text: aiData.description || 'Conteúdo educativo interativo',
        isGenerated: true,
        customFields: aiData.customFields || {}
      };
    } else {
      // Dados básicos
      processedData = {
        title: data?.title || 'Quadro Interativo',
        text: data?.description || 'Conteúdo educativo para interação no quadro digital',
        isGenerated: false,
        customFields: data?.customFields || {}
      };
    }

    console.log('📋 Dados processados para exibição:', processedData);
    setDisplayData(processedData);
  }, [data]);

  if (!displayData) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho com Badge de Status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Quadro Interativo
          </h2>
          {displayData.isGenerated && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Gerado por IA
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          Visualização do conteúdo educativo para o quadro digital
        </p>
      </div>

      {/* Card Principal do Quadro Interativo */}
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-blue-800 flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            {displayData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-white rounded-lg p-6 shadow-inner border border-blue-100 min-h-[120px] flex items-center justify-center">
            <p className="text-gray-700 leading-relaxed text-center text-lg font-medium">
              {displayData.text}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Atividade */}
      {Object.keys(displayData.customFields).length > 0 && (
        <Card className="w-full bg-gray-50 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Detalhes da Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(displayData.customFields).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="font-semibold text-gray-600 text-sm mb-2">{key}:</p>
                <p className="text-gray-800 text-sm">{String(value)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Indicador de Status */}
      <div className="text-center">
        <Badge variant="outline" className="px-4 py-2">
          {displayData.isGenerated ? '✅ Conteúdo gerado pela IA Gemini' : '📝 Conteúdo base configurado'}
        </Badge>
      </div>
    </div>
  );
}