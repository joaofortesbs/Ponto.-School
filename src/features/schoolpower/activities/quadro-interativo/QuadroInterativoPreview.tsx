
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

export default function QuadroInterativoPreview({ data, activityData }: QuadroInterativoPreviewProps) {
  console.log('🖼️ QuadroInterativoPreview: Dados recebidos:', data);
  console.log('🖼️ QuadroInterativoPreview: Activity data:', activityData);

  // Extrair título e conteúdo gerado pela IA
  let titulo = 'Quadro Interativo';
  let conteudo = '';

  // Verificar se há dados gerados pela IA
  if (data) {
    // Tentar extrair título
    titulo = data.titulo || 
             data.title || 
             data.data?.titulo ||
             activityData?.title ||
             activityData?.personalizedTitle ||
             'Quadro Interativo';

    // Tentar extrair conteúdo - garantir que seja sempre uma string
    if (data.conteudo) {
      if (typeof data.conteudo === 'string') {
        conteudo = data.conteudo;
      } else if (typeof data.conteudo === 'object') {
        // Se conteudo for um objeto, converter para string JSON formatada ou extrair propriedades específicas
        if (data.conteudo.titulo || data.conteudo.descricao || data.conteudo.introducao) {
          let conteudoFormatado = '';
          
          if (data.conteudo.titulo) conteudoFormatado += `**${data.conteudo.titulo}**\n\n`;
          if (data.conteudo.descricao) conteudoFormatado += `${data.conteudo.descricao}\n\n`;
          if (data.conteudo.introducao) conteudoFormatado += `**Introdução:**\n${data.conteudo.introducao}\n\n`;
          
          if (data.conteudo.conceitosPrincipais && Array.isArray(data.conteudo.conceitosPrincipais)) {
            conteudoFormatado += `**Conceitos Principais:**\n`;
            data.conteudo.conceitosPrincipais.forEach((conceito: string, index: number) => {
              conteudoFormatado += `${index + 1}. ${conceito}\n`;
            });
            conteudoFormatado += `\n`;
          }
          
          if (data.conteudo.exemplosPraticos && Array.isArray(data.conteudo.exemplosPraticos)) {
            conteudoFormatado += `**Exemplos Práticos:**\n`;
            data.conteudo.exemplosPraticos.forEach((exemplo: string, index: number) => {
              conteudoFormatado += `${index + 1}. ${exemplo}\n`;
            });
            conteudoFormatado += `\n`;
          }
          
          if (data.conteudo.atividadesPraticas && Array.isArray(data.conteudo.atividadesPraticas)) {
            conteudoFormatado += `**Atividades Práticas:**\n`;
            data.conteudo.atividadesPraticas.forEach((atividade: string, index: number) => {
              conteudoFormatado += `${index + 1}. ${atividade}\n`;
            });
            conteudoFormatado += `\n`;
          }
          
          if (data.conteudo.resumo) conteudoFormatado += `**Resumo:**\n${data.conteudo.resumo}\n\n`;
          
          if (data.conteudo.proximosPassos && Array.isArray(data.conteudo.proximosPassos)) {
            conteudoFormatado += `**Próximos Passos:**\n`;
            data.conteudo.proximosPassos.forEach((passo: string, index: number) => {
              conteudoFormatado += `${index + 1}. ${passo}\n`;
            });
          }
          
          conteudo = conteudoFormatado;
        } else {
          conteudo = JSON.stringify(data.conteudo, null, 2);
        }
      } else {
        conteudo = String(data.conteudo);
      }
    } else {
      // Fallbacks para conteúdo
      conteudo = data.data?.conteudo ||
                 data.data?.descricao ||
                 data.description ||
                 data.descricao ||
                 activityData?.description ||
                 activityData?.personalizedDescription ||
                 'Conteúdo do quadro interativo será exibido aqui.';
      
      // Garantir que conteudo seja sempre string
      if (typeof conteudo !== 'string') {
        conteudo = String(conteudo);
      }
    }
  } else {
    // Dados padrão se não houver dados
    titulo = activityData?.title || activityData?.personalizedTitle || 'Quadro Interativo';
    conteudo = activityData?.description || activityData?.personalizedDescription || 'Conteúdo será exibido quando a atividade for gerada.';
  }

  console.log('🖼️ QuadroInterativoPreview: Título processado:', titulo);
  console.log('🖼️ QuadroInterativoPreview: Conteúdo processado:', conteudo);

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {titulo}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full">
            Quadro Interativo
          </span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conteúdo Educacional
          </h3>
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {conteudo}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      {data && (data.customFields || data.subject || data.schoolYear) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Informações da Atividade
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.subject || data.customFields?.['Disciplina / Área de conhecimento']) && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Disciplina:</span>
                <p className="text-gray-900 dark:text-white">
                  {data.subject || data.customFields?.['Disciplina / Área de conhecimento']}
                </p>
              </div>
            )}
            
            {(data.schoolYear || data.customFields?.['Ano / Série']) && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ano/Série:</span>
                <p className="text-gray-900 dark:text-white">
                  {data.schoolYear || data.customFields?.['Ano / Série']}
                </p>
              </div>
            )}
            
            {(data.theme || data.customFields?.['Tema ou Assunto da aula']) && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema:</span>
                <p className="text-gray-900 dark:text-white">
                  {data.theme || data.customFields?.['Tema ou Assunto da aula']}
                </p>
              </div>
            )}
            
            {(data.objectives || data.customFields?.['Objetivo de aprendizagem da aula']) && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Objetivo:</span>
                <p className="text-gray-900 dark:text-white">
                  {data.objectives || data.customFields?.['Objetivo de aprendizagem da aula']}
                </p>
              </div>
            )}
            
            {(data.difficultyLevel || data.customFields?.['Nível de Dificuldade']) && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dificuldade:</span>
                <p className="text-gray-900 dark:text-white">
                  {data.difficultyLevel || data.customFields?.['Nível de Dificuldade']}
                </p>
              </div>
            )}
            
            {(data.quadroInterativoCampoEspecifico || data.customFields?.['Atividade mostrada']) && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Atividade:</span>
                <p className="text-gray-900 dark:text-white">
                  {data.quadroInterativoCampoEspecifico || data.customFields?.['Atividade mostrada']}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );o Interativo';

    // Tentar extrair conteúdo - verificar se é um objeto estruturado ou texto simples
    if (typeof data === 'object' && data !== null) {
      // Se o data tem a estrutura com seções (introducao, conceitosPrincipais, etc.)
      if (data.introducao || data.conceitosPrincipais || data.exemplosPraticos || 
          data.atividadesPraticas || data.resumo || data.proximosPassos) {
        
        // Construir conteúdo formatado a partir das seções
        const secoes = [];
        
        if (data.introducao) {
          secoes.push(`Introdução:\n${data.introducao}`);
        }
        
        if (data.conceitosPrincipais) {
          secoes.push(`Conceitos Principais:\n${data.conceitosPrincipais}`);
        }
        
        if (data.exemplosPraticos) {
          secoes.push(`Exemplos Práticos:\n${data.exemplosPraticos}`);
        }
        
        if (data.atividadesPraticas) {
          secoes.push(`Atividades Práticas:\n${data.atividadesPraticas}`);
        }
        
        if (data.resumo) {
          secoes.push(`Resumo:\n${data.resumo}`);
        }
        
        if (data.proximosPassos) {
          secoes.push(`Próximos Passos:\n${data.proximosPassos}`);
        }
        
        conteudo = secoes.join('\n\n');
      } else {
        // Tentar outras propriedades
        conteudo = data.conteudo || 
                   data.content || 
                   data.data?.conteudo ||
                   data.descricao ||
                   data.description ||
                   '';
      }
    } else if (typeof data === 'string') {
      conteudo = data;
    }

    console.log('🎯 Título extraído:', titulo);
    console.log('📝 Conteúdo extraído:', conteudo);
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-4xl mx-auto border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6" />
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {conteudo ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              >
                {conteudo}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Conteúdo será carregado quando gerado pela IA</p>
              <p className="text-gray-400 text-sm mt-2">
                O conteúdo do quadro interativo será exibido aqui quando gerado pela IA do Gemini.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
