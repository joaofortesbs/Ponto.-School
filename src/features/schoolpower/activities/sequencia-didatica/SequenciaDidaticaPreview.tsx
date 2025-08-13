
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Users, Clock, Calendar, CheckCircle, FileText, Lightbulb, Edit3, RotateCcw, Plus, Minus } from 'lucide-react';

interface SequenciaDidaticaPreviewProps {
  data: any;
  activityData?: any;
  isBuilt?: boolean;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  activityData,
  isBuilt = false 
}) => {
  console.log('📚 SequenciaDidaticaPreview - Dados recebidos:', { data, activityData, isBuilt });

  // Estados para edição
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  const [isEditingQuantities, setIsEditingQuantities] = useState(false);
  const [tempObjectives, setTempObjectives] = useState('');
  const [tempQuantities, setTempQuantities] = useState({
    aulas: 4,
    diagnosticos: 2,
    avaliacoes: 2
  });

  // Dados fictícios para demonstração do design
  const sequenciaData = {
    tituloTemaAssunto: 'Substantivos Próprios e Verbos',
    disciplina: 'Português',
    anoSerie: '6º Ano',
    objetivosAprendizagem: 'Identificar e classificar substantivos próprios e verbos em textos diversos, compreendendo suas funções sintáticas e semânticas. Aplicar corretamente o uso de substantivos próprios e verbos na produção textual.',
    publicoAlvo: 'Estudantes do 6º ano do Ensino Fundamental',
    bnccCompetencias: 'EF67LP32, EF67LP33',
    quantidadeAulas: 4,
    quantidadeDiagnosticos: 2,
    quantidadeAvaliacoes: 2
  };

  if (!isBuilt) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Sequência Didática não gerada
        </h4>
        <p className="text-gray-500 dark:text-gray-500">
          Configure os campos necessários e clique em "Construir Atividade" para gerar sua sequência didática.
        </p>
      </div>
    );
  }

  const handleSaveObjectives = () => {
    setIsEditingObjectives(false);
    // Aqui implementaremos a lógica de salvamento
  };

  const handleSaveQuantities = () => {
    setIsEditingQuantities(false);
    // Aqui implementaremos a lógica de salvamento
  };

  const handleRegenerate = () => {
    // Aqui implementaremos a lógica de regeneração
    console.log('🔄 Regenerando Sequência Didática...');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 overflow-y-auto h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Cabeçalho Principal */}
      <div className="text-center pb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <BookOpen className="text-orange-600 dark:text-orange-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Sequência Didática
          </h1>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {sequenciaData.tituloTemaAssunto}
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            {sequenciaData.disciplina}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            {sequenciaData.anoSerie}
          </Badge>
        </div>
      </div>

      {/* Botão de Regenerar */}
      <div className="flex justify-center mb-6">
        <Button 
          onClick={handleRegenerate}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Regenerar Sequência Didática
        </Button>
      </div>

      {/* Card de Informações Básicas */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Objetivos de Aprendizagem - Editável */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Target size={18} />
                Objetivos de Aprendizagem
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempObjectives(sequenciaData.objetivosAprendizagem);
                  setIsEditingObjectives(true);
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <Edit3 size={16} />
              </Button>
            </div>
            
            {isEditingObjectives ? (
              <div className="space-y-3">
                <textarea
                  value={tempObjectives}
                  onChange={(e) => setTempObjectives(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveObjectives}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setIsEditingObjectives(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 p-2 rounded transition-colors"
                 onClick={() => {
                   setTempObjectives(sequenciaData.objetivosAprendizagem);
                   setIsEditingObjectives(true);
                 }}>
                {sequenciaData.objetivosAprendizagem}
              </p>
            )}
          </div>

          {/* Outras informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium flex items-center gap-2 mb-2 text-green-800 dark:text-green-200">
                <Users size={16} />
                Público-alvo
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaData.publicoAlvo}</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium flex items-center gap-2 mb-2 text-purple-800 dark:text-purple-200">
                <CheckCircle size={16} />
                BNCC / Competências
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{sequenciaData.bnccCompetencias}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Estrutura da Sequência */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            Estrutura da Sequência
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempQuantities({
                  aulas: sequenciaData.quantidadeAulas,
                  diagnosticos: sequenciaData.quantidadeDiagnosticos,
                  avaliacoes: sequenciaData.quantidadeAvaliacoes
                });
                setIsEditingQuantities(true);
              }}
              className="ml-auto text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 dark:text-indigo-400"
            >
              <Edit3 size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingQuantities ? (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Aulas</label>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempQuantities(prev => ({ ...prev, aulas: Math.max(1, prev.aulas - 1) }))}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{tempQuantities.aulas}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempQuantities(prev => ({ ...prev, aulas: prev.aulas + 1 }))}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Diagnósticos</label>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempQuantities(prev => ({ ...prev, diagnosticos: Math.max(0, prev.diagnosticos - 1) }))}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{tempQuantities.diagnosticos}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempQuantities(prev => ({ ...prev, diagnosticos: prev.diagnosticos + 1 }))}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Avaliações</label>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempQuantities(prev => ({ ...prev, avaliacoes: Math.max(0, prev.avaliacoes - 1) }))}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{tempQuantities.avaliacoes}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTempQuantities(prev => ({ ...prev, avaliacoes: prev.avaliacoes + 1 }))}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-center pt-3">
                <Button
                  onClick={handleSaveQuantities}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Salvar Alterações
                </Button>
                <Button
                  onClick={() => setIsEditingQuantities(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <div 
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setTempQuantities({
                    aulas: sequenciaData.quantidadeAulas,
                    diagnosticos: sequenciaData.quantidadeDiagnosticos,
                    avaliacoes: sequenciaData.quantidadeAvaliacoes
                  });
                  setIsEditingQuantities(true);
                }}
              >
                <div className="text-4xl font-bold mb-2">{sequenciaData.quantidadeAulas}</div>
                <div className="text-sm font-medium opacity-90">Aulas</div>
              </div>

              <div 
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setTempQuantities({
                    aulas: sequenciaData.quantidadeAulas,
                    diagnosticos: sequenciaData.quantidadeDiagnosticos,
                    avaliacoes: sequenciaData.quantidadeAvaliacoes
                  });
                  setIsEditingQuantities(true);
                }}
              >
                <div className="text-4xl font-bold mb-2">{sequenciaData.quantidadeDiagnosticos}</div>
                <div className="text-sm font-medium opacity-90">Diagnósticos</div>
              </div>

              <div 
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setTempQuantities({
                    aulas: sequenciaData.quantidadeAulas,
                    diagnosticos: sequenciaData.quantidadeDiagnosticos,
                    avaliacoes: sequenciaData.quantidadeAvaliacoes
                  });
                  setIsEditingQuantities(true);
                }}
              >
                <div className="text-4xl font-bold mb-2">{sequenciaData.quantidadeAvaliacoes}</div>
                <div className="text-sm font-medium opacity-90">Avaliações</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Conteúdo Gerado */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Lightbulb className="text-green-600 dark:text-green-400" size={24} />
            </div>
            Conteúdo da Sequência Didática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="mx-auto h-16 w-16 mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">Conteúdo será exibido aqui</h4>
            <p className="text-sm">
              Após finalizar a estrutura e configurações, o conteúdo detalhado das aulas, 
              diagnósticos e avaliações será gerado e exibido nesta seção.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Geração */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
        Sequência didática gerada em {new Date().toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default SequenciaDidaticaPreview;
