
import React, { useState, useEffect } from 'react';
import { Clock, Users, BookOpen, Target, CheckCircle, FileText, Edit3, Plus } from 'lucide-react';

interface DesenvolvimentoInterfaceProps {
  data: any;
  contextoPlano: any;
  onDataChange: (data: any) => void;
}

const DesenvolvimentoInterface: React.FC<DesenvolvimentoInterfaceProps> = ({
  data,
  contextoPlano,
  onDataChange
}) => {
  const [etapas, setEtapas] = useState([
    {
      etapa: 1,
      titulo: 'Introdução',
      descricao: 'Apresentação do tema',
      tipo_interacao: 'Exposição',
      tempo_estimado: '15 min',
      recurso_gerado: 'Slides',
      nota_privada_professor: 'Contextualizar o tema'
    },
    {
      etapa: 2,
      titulo: 'Desenvolvimento',
      descricao: 'Explicação do conteúdo principal',
      tipo_interacao: 'Interativa',
      tempo_estimado: '25 min',
      recurso_gerado: 'Material didático',
      nota_privada_professor: 'Verificar compreensão'
    },
    {
      etapa: 3,
      titulo: 'Finalização',
      descricao: 'Síntese e avaliação',
      tipo_interacao: 'Avaliativa',
      tempo_estimado: '10 min',
      recurso_gerado: 'Atividade de fixação',
      nota_privada_professor: 'Aplicar avaliação'
    }
  ]);

  useEffect(() => {
    if (data?.desenvolvimento && Array.isArray(data.desenvolvimento)) {
      setEtapas(data.desenvolvimento);
    }
  }, [data]);

  const adicionarEtapa = () => {
    const novaEtapa = {
      etapa: etapas.length + 1,
      titulo: `Etapa ${etapas.length + 1}`,
      descricao: '',
      tipo_interacao: 'Interativa',
      tempo_estimado: '10 min',
      recurso_gerado: '',
      nota_privada_professor: ''
    };
    
    const novasEtapas = [...etapas, novaEtapa];
    setEtapas(novasEtapas);
    onDataChange({ desenvolvimento: novasEtapas });
  };

  const atualizarEtapa = (index: number, campo: string, valor: string) => {
    const novasEtapas = etapas.map((etapa, i) => 
      i === index ? { ...etapa, [campo]: valor } : etapa
    );
    setEtapas(novasEtapas);
    onDataChange({ desenvolvimento: novasEtapas });
  };

  const removerEtapa = (index: number) => {
    if (etapas.length > 1) {
      const novasEtapas = etapas.filter((_, i) => i !== index)
        .map((etapa, i) => ({ ...etapa, etapa: i + 1 }));
      setEtapas(novasEtapas);
      onDataChange({ desenvolvimento: novasEtapas });
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Desenvolvimento da Aula
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize as etapas do seu plano de aula de forma estruturada
          </p>
        </div>

        <div className="space-y-6">
          {etapas.map((etapa, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {etapa.etapa}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={etapa.titulo}
                    onChange={(e) => atualizarEtapa(index, 'titulo', e.target.value)}
                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-gray-900 dark:text-white"
                    placeholder="Título da etapa"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={etapa.tempo_estimado}
                    onChange={(e) => atualizarEtapa(index, 'tempo_estimado', e.target.value)}
                    className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 15 min"
                  />
                  {etapas.length > 1 && (
                    <button
                      onClick={() => removerEtapa(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={etapa.descricao}
                    onChange={(e) => atualizarEtapa(index, 'descricao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Descreva o que será realizado nesta etapa..."
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Interação
                    </label>
                    <select
                      value={etapa.tipo_interacao}
                      onChange={(e) => atualizarEtapa(index, 'tipo_interacao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Exposição">Exposição</option>
                      <option value="Interativa">Interativa</option>
                      <option value="Prática">Prática</option>
                      <option value="Avaliativa">Avaliativa</option>
                      <option value="Discussão">Discussão</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recurso Gerado
                    </label>
                    <input
                      type="text"
                      value={etapa.recurso_gerado}
                      onChange={(e) => atualizarEtapa(index, 'recurso_gerado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Slides, Material didático..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nota Privada do Professor
                </label>
                <textarea
                  value={etapa.nota_privada_professor}
                  onChange={(e) => atualizarEtapa(index, 'nota_privada_professor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Anotações e lembretes pessoais para esta etapa..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={adicionarEtapa}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Etapa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesenvolvimentoInterface;
