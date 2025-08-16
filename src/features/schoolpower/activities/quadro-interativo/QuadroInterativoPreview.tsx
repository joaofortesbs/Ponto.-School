
<old_str>import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, Lightbulb, Users } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  console.log('🖼️ QuadroInterativoPreview renderizando com dados:', data);

  // Extrair dados do objeto data ou activityData
  const title = data?.personalizedTitle || data?.title || activityData?.title || 'Quadro Interativo';
  const description = data?.personalizedDescription || data?.description || activityData?.description || 'Atividade de quadro interativo';
  const subject = data?.subject || data?.formData?.subject || activityData?.customFields?.subject || 'Matemática';
  const schoolYear = data?.schoolYear || data?.formData?.schoolYear || activityData?.customFields?.schoolYear || '6º Ano';
  const theme = data?.theme || data?.formData?.theme || activityData?.customFields?.theme || 'Tema da Aula';
  const objectives = data?.objectives || data?.formData?.objectives || activityData?.customFields?.objectives || 'Objetivos de aprendizagem';
  const difficultyLevel = data?.difficultyLevel || data?.formData?.difficultyLevel || activityData?.customFields?.difficultyLevel || 'Intermediário';
  const quadroInterativoCampoEspecifico = data?.quadroInterativoCampoEspecifico || data?.formData?.quadroInterativoCampoEspecifico || activityData?.customFields?.quadroInterativoCampoEspecifico || 'Atividade interativa';
  
  // Campos opcionais
  const materials = data?.materials || data?.formData?.materials || '';
  const instructions = data?.instructions || data?.formData?.instructions || '';
  const evaluation = data?.evaluation || data?.formData?.evaluation || '';
  const timeLimit = data?.timeLimit || data?.formData?.timeLimit || '';
  const context = data?.context || data?.formData?.context || '';

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <BookOpen className="h-3 w-3 mr-1" />
              {subject}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <Users className="h-3 w-3 mr-1" />
              {schoolYear}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              <Target className="h-3 w-3 mr-1" />
              {difficultyLevel}
            </Badge>
            {timeLimit && (
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {timeLimit}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Card - Principal */}
        <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Lightbulb className="h-5 w-5" />
              Conteúdo Gerado pela IA do Gemini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    📋 {title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 dark:bg-orange-900/20 py-3 rounded-r-lg">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                    🎯 Tema da Aula
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300">
                    {theme}
                  </p>
                </div>

                <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 dark:bg-blue-900/20 py-3 rounded-r-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    🎮 Atividade Interativa
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    {quadroInterativoCampoEspecifico}
                  </p>
                </div>

                <div className="border-l-4 border-green-400 pl-4 bg-green-50 dark:bg-green-900/20 py-3 rounded-r-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                    🏆 Objetivos de Aprendizagem
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    {objectives}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        {(materials || instructions || evaluation || context) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-200">
                Informações Complementares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {materials && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    📦 Materiais Necessários
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {materials}
                  </p>
                </div>
              )}

              {instructions && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    📝 Instruções
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {instructions}
                  </p>
                </div>
              )}

              {evaluation && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    📊 Critérios de Avaliação
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {evaluation}
                  </p>
                </div>
              )}

              {context && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    🌐 Contexto de Aplicação
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {context}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer de Metadados */}
        {data?.isGeneratedByAI && (
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ✨ Conteúdo gerado automaticamente pela IA do Gemini
              {data.generatedAt && (
                <span className="ml-2">
                  em {new Date(data.generatedAt).toLocaleString('pt-BR')}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;</old_str>
<new_str>import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, Lightbulb, Users, Play, Settings } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  console.log('🖼️ QuadroInterativoPreview renderizando com dados:', data);
  console.log('🖼️ ActivityData recebido:', activityData);

  // Extrair dados com fallbacks robustos
  const title = data?.personalizedTitle || data?.title || activityData?.personalizedTitle || activityData?.title || 'Quadro Interativo';
  const description = data?.personalizedDescription || data?.description || activityData?.personalizedDescription || activityData?.description || 'Atividade de quadro interativo';
  
  // Dados específicos do Quadro Interativo
  const subject = data?.subject || data?.formData?.subject || activityData?.customFields?.subject || activityData?.subject || 'Matemática';
  const schoolYear = data?.schoolYear || data?.formData?.schoolYear || activityData?.customFields?.schoolYear || activityData?.schoolYear || '6º Ano';
  const theme = data?.theme || data?.formData?.theme || activityData?.customFields?.theme || activityData?.theme || 'Tema da Aula';
  const objectives = data?.objectives || data?.formData?.objectives || activityData?.customFields?.objectives || activityData?.objectives || 'Objetivos de aprendizagem';
  const difficultyLevel = data?.difficultyLevel || data?.formData?.difficultyLevel || activityData?.customFields?.difficultyLevel || activityData?.difficultyLevel || 'Intermediário';
  const quadroInterativoCampoEspecifico = data?.quadroInterativoCampoEspecifico || data?.formData?.quadroInterativoCampoEspecifico || activityData?.customFields?.quadroInterativoCampoEspecifico || 'Atividade interativa no quadro';
  
  // Campos opcionais
  const materials = data?.materials || data?.formData?.materials || activityData?.materials || '';
  const instructions = data?.instructions || data?.formData?.instructions || activityData?.instructions || '';
  const evaluation = data?.evaluation || data?.formData?.evaluation || activityData?.evaluation || '';
  const timeLimit = data?.timeLimit || data?.formData?.timeLimit || activityData?.timeLimit || '';
  const context = data?.context || data?.formData?.context || activityData?.context || '';

  // Verificar se tem conteúdo gerado pela IA
  const isGeneratedByAI = data?.isGeneratedByAI || false;
  const generatedAt = data?.generatedAt;
  const hasError = data?.error;

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header Principal */}
        <div className="text-center space-y-4 pb-6 border-b-2 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-center gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-xl shadow-lg">
              <Settings className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>

          {/* Badges de Informação */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1">
              <BookOpen className="h-4 w-4 mr-2" />
              {subject}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1">
              <Users className="h-4 w-4 mr-2" />
              {schoolYear}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-3 py-1">
              <Target className="h-4 w-4 mr-2" />
              {difficultyLevel}
            </Badge>
            {timeLimit && (
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {timeLimit}
              </Badge>
            )}
          </div>
        </div>

        {/* Card Principal - Conteúdo Gerado */}
        <Card className="border-2 border-orange-300 dark:border-orange-600 shadow-xl bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-orange-900 dark:text-orange-100">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
                <Lightbulb className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <span className="text-xl">Quadro Interativo Gerado pela IA</span>
                {isGeneratedByAI && (
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    ✨ Powered by Gemini AI
                  </p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Card Flutuante para o Texto da IA */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-600 transform hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-6">
                {/* Título Principal */}
                <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    📚 {title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {description}
                  </p>
                </div>

                {/* Seções de Conteúdo */}
                <div className="grid gap-6">
                  {/* Tema da Aula */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 border-l-4 border-orange-400">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                        <Target className="h-5 w-5 text-orange-700 dark:text-orange-200" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                          Tema da Aula
                        </h3>
                        <p className="text-orange-700 dark:text-orange-300 text-base leading-relaxed">
                          {theme}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Atividade Interativa */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border-l-4 border-blue-400">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                        <Play className="h-5 w-5 text-blue-700 dark:text-blue-200" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          Atividade Interativa no Quadro
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-base leading-relaxed">
                          {quadroInterativoCampoEspecifico}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Objetivos de Aprendizagem */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border-l-4 border-green-400">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-green-700 dark:text-green-200" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                          Objetivos de Aprendizagem
                        </h3>
                        <p className="text-green-700 dark:text-green-300 text-base leading-relaxed">
                          {objectives}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Complementares */}
        {(materials || instructions || evaluation || context) && (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informações Complementares
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {materials && (
                <div className="border-l-4 border-purple-400 pl-4 py-2">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    📦 Materiais Necessários
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {materials}
                  </p>
                </div>
              )}

              {instructions && (
                <div className="border-l-4 border-indigo-400 pl-4 py-2">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                    📝 Instruções da Atividade
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {instructions}
                  </p>
                </div>
              )}

              {evaluation && (
                <div className="border-l-4 border-red-400 pl-4 py-2">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    📊 Critérios de Avaliação
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {evaluation}
                  </p>
                </div>
              )}

              {context && (
                <div className="border-l-4 border-teal-400 pl-4 py-2">
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">
                    🌐 Contexto de Aplicação
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {context}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer com Metadados */}
        <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-inner">
          {isGeneratedByAI ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                ✨ Conteúdo gerado automaticamente pela IA do Gemini
              </p>
              {generatedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerado em {new Date(generatedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              📝 Dados preenchidos manualmente
            </p>
          )}
          
          {hasError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ Houve um problema na geração: {hasError}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;</new_str>
