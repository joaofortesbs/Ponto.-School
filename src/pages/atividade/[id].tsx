import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, BookOpen, Clock, User, Share2, Presentation, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSharedActivityByCode, validarCodigoUnico, validarIdAtividade } from '@/utils/generateShareLink';

interface PublicActivityData {
  id: string;
  uniqueCode?: string;
  title: string;
  description: string;
  subject?: string;
  activityType: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
}

export default function PublicActivityPage() {
  const { id, code } = useParams<{ id: string; code?: string }>();
  const [activity, setActivity] = useState<PublicActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);

  useEffect(() => {
    console.log('🔍 PublicActivityPage carregada com parâmetros:', { id, code });
    console.log('🔓 Página pública carregando independentemente da autenticação');

    if (id) {
      fetchPublicActivity(id, code);
    } else {
      setError('ID da atividade não fornecido');
      setLoading(false);
    }
  }, [id, code]);

  const fetchPublicActivity = async (activityId: string, uniqueCode?: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando atividade pública:', { activityId, uniqueCode });

      // Primeira tentativa: buscar localmente pelo código único
      if (uniqueCode && validarCodigoUnico(uniqueCode)) {
        console.log('🔍 Tentando buscar atividade localmente pelo código único...');
        const localActivity = getSharedActivityByCode(uniqueCode);

        if (localActivity) {
          console.log('✅ Atividade encontrada localmente:', localActivity);
          setActivity({
            id: localActivity.id,
            uniqueCode: localActivity.uniqueCode,
            title: localActivity.title,
            description: localActivity.description || 'Atividade educacional',
            subject: 'Educação Geral',
            activityType: localActivity.activityType,
            content: typeof localActivity.content === 'string'
              ? localActivity.content
              : JSON.stringify(localActivity.content, null, 2),
            createdAt: localActivity.createdAt,
            isPublic: localActivity.isPublic
          });
          setLoading(false);
          return;
        }
      }

      // Segunda tentativa: buscar via API
      console.log('🌐 Tentando buscar via API...');
      try {
        const apiUrl = uniqueCode
          ? `/api/publicActivity/${activityId}/${uniqueCode}`
          : `/api/publicActivity/${activityId}`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && result.data) {
          console.log('✅ Atividade encontrada via API:', result.data);
          setActivity(result.data);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ Erro na API, tentando dados mock:', apiError);
      }

      // Terceira tentativa: gerar dados mock como fallback
      console.log('🎭 Gerando dados mock como fallback...');
      const mockActivity: PublicActivityData = {
        id: activityId,
        uniqueCode: uniqueCode || 'mock-code',
        title: `Atividade: ${activityId.charAt(0).toUpperCase() + activityId.slice(1).replace(/-/g, ' ')}`,
        description: 'Esta é uma atividade educacional compartilhada publicamente.',
        subject: 'Educação Geral',
        activityType: activityId,
        content: generateMockContent(activityId),
        createdAt: new Date().toISOString(),
        isPublic: true
      };

      setActivity(mockActivity);
      setLoading(false);

    } catch (err) {
      console.error('❌ Erro ao carregar atividade:', err);
      setError('Erro ao carregar a atividade');
      setLoading(false);
    }
  };

  const generateMockContent = (activityType: string): string => {
    const contentMap: Record<string, string> = {
      'sequencia-didatica': `
## Sequência Didática Educacional

### Objetivo Geral
Desenvolver competências específicas através de atividades estruturadas e progressivas.

### Atividades Propostas:

**1. Atividade Inicial (15 min)**
- Introdução ao tema com discussão dirigida
- Levantamento de conhecimentos prévios
- Estabelecimento de objetivos de aprendizagem

**2. Desenvolvimento (25 min)**
- Atividade prática em grupos
- Aplicação de conceitos teóricos
- Resolução de problemas práticos

**3. Consolidação (10 min)**
- Apresentação dos resultados
- Discussão coletiva
- Síntese dos aprendizados

### Recursos Necessários:
- Material didático específico
- Quadro interativo ou tradicional
- Tempo estimado: 50 minutos

### Avaliação:
- Participação nas atividades
- Qualidade das produções
- Compreensão dos conceitos abordados
      `,
      'flash-cards': `
## Flash Cards Educacionais

### Conjunto de Cartões para Memorização

**Cartão 1**
**Frente:** Qual é a fórmula da área do triângulo?
**Verso:** A = (base × altura) ÷ 2

**Cartão 2**
**Frente:** O que é um substantivo próprio?
**Verso:** Nome específico de pessoas, lugares ou instituições. Sempre escrito com letra maiúscula.

**Cartão 3**
**Frente:** Qual é a capital do Brasil?
**Verso:** Brasília - localizada no Distrito Federal, região Centro-Oeste

**Cartão 4**
**Frente:** Como calcular a velocidade média?
**Verso:** V = Δs / Δt (variação do espaço dividida pela variação do tempo)

**Cartão 5**
**Frente:** Quais são os tipos de triângulos quanto aos lados?
**Verso:** Equilátero (3 lados iguais), Isósceles (2 lados iguais), Escaleno (lados diferentes)

### Instruções de Uso:
1. Leia a pergunta na frente do cartão
2. Tente responder mentalmente
3. Vire o cartão para conferir a resposta
4. Repita até memorizar completamente
      `,
      'quiz-interativo': `
## Quiz Interativo Educacional

### Instruções:
Responda às questões abaixo e verifique seus conhecimentos!

**Questão 1:** Qual é a capital da França?
a) Londres  
b) Paris ✓
c) Roma  
d) Madrid

**Questão 2:** Quanto é 7 × 8?
a) 54  
b) 56 ✓
c) 58  
d) 60

**Questão 3:** Qual é o maior planeta do sistema solar?
a) Terra  
b) Marte  
c) Júpiter ✓
d) Saturno

**Questão 4:** Quem escreveu "Dom Casmurro"?
a) José de Alencar  
b) Machado de Assis ✓
c) Monteiro Lobato  
d) Clarice Lispector

**Questão 5:** Qual é a fórmula da água?
a) CO₂  
b) H₂O ✓
c) NaCl  
d) O₂

### Pontuação:
- 5 acertos: Excelente! 🌟
- 4 acertos: Muito bom! 👏
- 3 acertos: Bom trabalho! 👍
- 2 ou menos: Continue estudando! 📚
      `
    };

    return contentMap[activityType] || `
## Atividade Educacional: ${activityType}

Esta é uma atividade educacional do tipo **${activityType}**.

### Descrição:
Atividade interativa desenvolvida para promover o aprendizado de forma eficaz e engajante.

### Objetivos:
- Desenvolver competências específicas da área
- Promover o pensamento crítico
- Facilitar a assimilação de conteúdos
- Estimular a participação ativa do estudante

### Metodologia:
A atividade foi estruturada para ser:
1. **Interativa:** Promove a participação ativa
2. **Progressiva:** Conteúdo organizado em níveis crescentes
3. **Prática:** Aplicação real dos conceitos
4. **Avaliativa:** Permite verificar o aprendizado

### Recursos Necessários:
- Material didático adequado
- Ambiente de aprendizagem apropriado
- Tempo estimado: 45-60 minutos

### Instrução para Uso:
1. Leia atentamente todo o conteúdo
2. Execute as atividades na ordem proposta
3. Reflita sobre os conceitos apresentados
4. Aplique os conhecimentos adquiridos

*Esta atividade foi compartilhada publicamente através da plataforma Ponto School.*
    `;
  };

  const handlePresentationMode = () => {
    setPresentationMode(!presentationMode);
  };

  const handleDownload = () => {
    if (!activity) return;

    const content = `
ATIVIDADE EDUCACIONAL
${activity.title}

DISCIPLINA: ${activity.subject || 'Geral'}
TIPO: ${activity.activityType}
DATA: ${new Date(activity.createdAt).toLocaleDateString('pt-BR')}

DESCRIÇÃO:
${activity.description}

CONTEÚDO:
${activity.content}

---
Compartilhado via Ponto School
${window.location.href}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activity.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: activity?.title || 'Atividade Educacional',
          text: activity?.description || 'Confira esta atividade educacional',
          url: url
        });
      } catch (err) {
        console.log('Compartilhamento cancelado pelo usuário:', err);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg">Carregando atividade...</p>
          <p className="text-gray-500 text-sm">Aguarde enquanto preparamos o conteúdo</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Atividade não encontrada</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error || 'A atividade solicitada não existe ou não está mais disponível.'}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.href = '/'}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Ir para Ponto School
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (presentationMode) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header da apresentação */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-6 text-orange-400">{activity.title}</h1>
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="text-lg px-6 py-2 bg-orange-500/20 text-orange-300">
                {activity.subject}
              </Badge>
              <Badge variant="secondary" className="text-lg px-6 py-2 bg-blue-500/20 text-blue-300">
                {activity.activityType}
              </Badge>
            </div>
          </div>

          {/* Conteúdo da apresentação */}
          <div className="bg-white text-gray-900 rounded-2xl p-12 mb-8 shadow-2xl">
            <div className="prose prose-lg max-w-none">
              <div
                className="leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: activity.content
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/##\s(.*?)(?=\n|$)/g, '<h2 class="text-2xl font-bold mb-4 text-orange-600">$1</h2>')
                    .replace(/###\s(.*?)(?=\n|$)/g, '<h3 class="text-xl font-semibold mb-3 text-gray-700">$1</h3>')
                }}
              />
            </div>
          </div>

          {/* Controles da apresentação */}
          <div className="text-center space-x-4">
            <Button
              onClick={handlePresentationMode}
              variant="secondary"
              size="lg"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3"
            >
              <Eye className="w-5 h-5 mr-2" />
              Sair da Apresentação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ponto School</h1>
                <p className="text-gray-600">Atividade Educacional Pública</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleShare} variant="outline" size="sm" className="shadow-sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" className="shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-5xl mx-auto p-8">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">{activity.title}</h2>
                <p className="text-orange-100 text-lg leading-relaxed">{activity.description}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-4">
                {activity.subject}
              </Badge>
            </div>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-orange-400/30">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">
                  {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="text-sm">Acesso Público</span>
              </div>
              {activity.uniqueCode && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Código: {activity.uniqueCode}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-10">
            {/* Conteúdo da Atividade */}
            <div className="mb-10">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
                  Conteúdo da Atividade
                </h3>
                <div
                  className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: activity.content
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/##\s(.*?)(?=\n|$)/g, '<h2 class="text-2xl font-bold mb-4 mt-6 text-orange-600">$1</h2>')
                      .replace(/###\s(.*?)(?=\n|$)/g, '<h3 class="text-xl font-semibold mb-3 mt-4 text-gray-700">$1</h3>')
                  }}
                />
              </div>
            </div>

            {/* Botão de Apresentação */}
            <div className="text-center mb-8">
              <Button
                onClick={handlePresentationMode}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 text-lg shadow-lg"
              >
                <Presentation className="w-6 h-6 mr-3" />
                Apresentar para Estudantes
              </Button>
            </div>

            {/* Informações Adicionais */}
            <div className="pt-8 border-t border-gray-200">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>💡 Sobre esta atividade:</strong> Este conteúdo foi compartilhado publicamente e pode ser acessado sem necessidade de cadastro.
                  Para criar suas próprias atividades personalizadas e acessar recursos exclusivos,
                  <a href="/" className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline">
                    visite a Ponto School
                  </a>.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}