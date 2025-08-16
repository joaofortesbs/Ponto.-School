
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Clock, Users, Lightbulb, CheckCircle } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

export default function QuadroInterativoPreview({ data, activityData }: QuadroInterativoPreviewProps) {
  console.log('🖼️ QuadroInterativoPreview: Dados recebidos:', data);
  console.log('🖼️ QuadroInterativoPreview: Activity data:', activityData);

  // Extrair dados estruturados
  let processedData = {
    titulo: 'Quadro Interativo',
    disciplina: 'Matemática',
    anoSerie: '6º Ano',
    tema: 'Tema da Aula',
    objetivos: 'Objetivos de aprendizagem',
    nivelDificuldade: 'Intermediário',
    atividadeMostrada: 'Atividade interativa',
    conteudo: 'Conteúdo será gerado pela IA Gemini...',
    duracao: '50 minutos',
    materiais: 'Quadro digital, computador',
  };

  // Processar dados recebidos
  if (data) {
    // Se data é uma string JSON, fazer parse
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        processedData = { ...processedData, ...parsedData };
      } catch (error) {
        console.warn('Erro ao fazer parse dos dados:', error);
      }
    } else if (typeof data === 'object') {
      // Extrair título
      processedData.titulo = data.titulo || 
                            data.title || 
                            data.data?.titulo ||
                            activityData?.title ||
                            activityData?.personalizedTitle ||
                            'Quadro Interativo';

      // Extrair conteúdo - garantir que seja sempre uma string
      if (data.conteudo) {
        if (typeof data.conteudo === 'string') {
          processedData.conteudo = data.conteudo;
        } else if (typeof data.conteudo === 'object') {
          // Se conteudo for um objeto, extrair propriedades específicas
          let conteudoFormatado = '';
          
          if (data.conteudo.titulo) conteudoFormatado += `**${data.conteudo.titulo}**\n\n`;
          if (data.conteudo.descricao) conteudoFormatado += `${data.conteudo.descricao}\n\n`;
          if (data.conteudo.introducao) conteudoFormatado += `**Introdução:**\n${data.conteudo.introducao}\n\n`;
          if (data.conteudo.conceitosPrincipais) conteudoFormatado += `**Conceitos Principais:**\n${data.conteudo.conceitosPrincipais}\n\n`;
          if (data.conteudo.exemplosPraticos) conteudoFormatado += `**Exemplos Práticos:**\n${data.conteudo.exemplosPraticos}\n\n`;
          if (data.conteudo.atividadesPraticas) conteudoFormatado += `**Atividades Práticas:**\n${data.conteudo.atividadesPraticas}\n\n`;
          if (data.conteudo.resumo) conteudoFormatado += `**Resumo:**\n${data.conteudo.resumo}\n\n`;
          if (data.conteudo.proximosPassos) conteudoFormatado += `**Próximos Passos:**\n${data.conteudo.proximosPassos}`;
          
          processedData.conteudo = conteudoFormatado || 'Conteúdo estruturado disponível';
        }
      } else if (data.data?.conteudo) {
        processedData.conteudo = typeof data.data.conteudo === 'string' ? data.data.conteudo : 'Conteúdo processado pela IA';
      }

      // Extrair outros campos
      processedData.disciplina = data.disciplina || data.subject || data.data?.disciplina || 'Matemática';
      processedData.anoSerie = data.anoSerie || data.schoolYear || data.data?.anoSerie || '6º Ano';
      processedData.tema = data.tema || data.theme || data.data?.tema || activityData?.title || 'Tema da Aula';
      processedData.objetivos = data.objetivos || data.objectives || data.data?.objetivos || 'Objetivos de aprendizagem';
      processedData.nivelDificuldade = data.nivelDificuldade || data.difficultyLevel || data.data?.nivelDificuldade || 'Intermediário';
      processedData.atividadeMostrada = data.atividadeMostrada || data.quadroInterativoCampoEspecifico || data.data?.atividadeMostrada || 'Atividade interativa';
      processedData.duracao = data.duracao || data.timeLimit || data.data?.duracao || '50 minutos';
      processedData.materiais = data.materiais || data.materials || data.data?.materiais || 'Quadro digital, computador';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Quadro Interativo</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{processedData.titulo}</h1>
          <p className="text-gray-600 text-lg">{processedData.disciplina} • {processedData.anoSerie}</p>
        </div>

        {/* Card Principal Destacado */}
        <Card className="mb-8 border-4 border-blue-300 rounded-3xl shadow-2xl bg-gradient-to-br from-white to-blue-50/50 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              Conteúdo Educacional
            </CardTitle>
            <CardDescription className="text-blue-100 mt-2 text-lg">
              Apresentação interativa do {processedData.tema}, explorando suas aplicações e demonstrações visuais.
            </CardDescription>
          </div>

          <CardContent className="p-8">
            {/* Badges de Informações */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-full">
                <Clock className="w-4 h-4 mr-2" />
                {processedData.duracao}
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                {processedData.nivelDificuldade}
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800 rounded-full">
                <Users className="w-4 h-4 mr-2" />
                Turma Completa
              </Badge>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-inner">
              <div className="prose prose-lg max-w-none">
                {processedData.conteudo.split('\n').map((paragrafo, index) => {
                  if (!paragrafo.trim()) return null;
                  
                  if (paragrafo.startsWith('**') && paragrafo.endsWith('**')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        {paragrafo.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragrafo}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Seções Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Objetivos */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos de Aprendizagem
                </h4>
                <p className="text-green-700">{processedData.objetivos}</p>
              </div>

              {/* Atividade */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Atividade Interativa
                </h4>
                <p className="text-orange-700">{processedData.atividadeMostrada}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
