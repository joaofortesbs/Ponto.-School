
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  Target, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  User,
  MapPin,
  GraduationCap,
  ChevronRight,
  Download,
  Share2,
  Edit,
  Eye,
  Lightbulb,
  Brain,
  Star,
  Award,
  Loader2
} from 'lucide-react';
import { generateAIResponse } from '@/services/aiChatService';

interface PlanoAulaData {
  disciplina?: string;
  turma?: string;
  professor?: string;
  duracao?: string;
  objetivos?: string;
  conteudo?: string;
  metodologia?: string;
  recursos?: string;
  avaliacao?: string;
  tema?: string;
  nivel?: string;
  instituicao?: string;
  data?: string;
  [key: string]: any;
}

interface PlanoAulaContent {
  tema: string;
  disciplina: string;
  turma: string;
  professor: string;
  duracao: string;
  objetivosGerais: string[];
  objetivosEspecificos: string[];
  conteudoProgramatico: {
    titulo: string;
    topicos: string[];
  }[];
  metodologias: {
    fase: string;
    atividade: string;
    tempo: string;
    recursos: string[];
  }[];
  recursosNecessarios: string[];
  avaliacaoAprendizagem: {
    tipo: string;
    descricao: string;
    criterios: string[];
  }[];
  referencias: string[];
  observacoes: string;
  competenciasHabilidades: string[];
}

interface PlanoAulaPreviewProps {
  activity: {
    id: string;
    title: string;
    type: string;
    data?: PlanoAulaData;
  };
  onEdit?: () => void;
  onClose?: () => void;
}

const PlanoAulaPreview: React.FC<PlanoAulaPreviewProps> = ({ activity, onEdit, onClose }) => {
  const [planoContent, setPlanoContent] = useState<PlanoAulaContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('visao-geral');

  // Seções da sidebar
  const sidebarSections = [
    {
      id: 'visao-geral',
      label: 'Visão Geral',
      icon: Eye,
      description: 'Informações principais'
    },
    {
      id: 'objetivos',
      label: 'Objetivos',
      icon: Target,
      description: 'Metas de aprendizagem'
    },
    {
      id: 'conteudo',
      label: 'Conteúdo',
      icon: BookOpen,
      description: 'Programa da aula'
    },
    {
      id: 'metodologia',
      label: 'Metodologia',
      icon: Brain,
      description: 'Estratégias pedagógicas'
    },
    {
      id: 'recursos',
      label: 'Recursos',
      icon: FileText,
      description: 'Materiais necessários'
    },
    {
      id: 'avaliacao',
      label: 'Avaliação',
      icon: CheckCircle,
      description: 'Critérios e métodos'
    }
  ];

  useEffect(() => {
    generatePlanoContent();
  }, [activity]);

  const generatePlanoContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Coletar dados do modal de edição
      const activityData = activity.data || {};
      
      // Prompt otimizado para gerar plano de aula completo
      const prompt = `
        Crie um plano de aula completo e detalhado baseado nos seguintes dados:

        DADOS COLETADOS:
        - Disciplina: ${activityData.disciplina || 'Não especificado'}
        - Turma: ${activityData.turma || 'Não especificado'}
        - Professor: ${activityData.professor || 'Não especificado'}
        - Duração: ${activityData.duracao || '50 minutos'}
        - Tema: ${activityData.tema || activity.title}
        - Nível: ${activityData.nivel || 'Ensino Fundamental'}
        - Instituição: ${activityData.instituicao || 'Escola'}
        - Objetivos: ${activityData.objetivos || 'Desenvolver conhecimentos sobre o tema'}
        - Conteúdo: ${activityData.conteudo || 'Conteúdo relacionado ao tema'}
        - Metodologia: ${activityData.metodologia || 'Aula expositiva e participativa'}
        - Recursos: ${activityData.recursos || 'Quadro, projetor, material didático'}
        - Avaliação: ${activityData.avaliacao || 'Participação e exercícios'}

        FORMATO DE RESPOSTA (JSON):
        {
          "tema": "Título específico da aula",
          "disciplina": "Nome da disciplina",
          "turma": "Série/turma específica",
          "professor": "Nome do professor",
          "duracao": "Tempo da aula",
          "objetivosGerais": [
            "Objetivo geral 1",
            "Objetivo geral 2"
          ],
          "objetivosEspecificos": [
            "Objetivo específico 1",
            "Objetivo específico 2",
            "Objetivo específico 3"
          ],
          "conteudoProgramatico": [
            {
              "titulo": "Tópico 1",
              "topicos": ["Subtópico 1.1", "Subtópico 1.2"]
            },
            {
              "titulo": "Tópico 2", 
              "topicos": ["Subtópico 2.1", "Subtópico 2.2"]
            }
          ],
          "metodologias": [
            {
              "fase": "Introdução",
              "atividade": "Descrição da atividade introdutória",
              "tempo": "10 min",
              "recursos": ["Recurso 1", "Recurso 2"]
            },
            {
              "fase": "Desenvolvimento",
              "atividade": "Descrição da atividade principal",
              "tempo": "30 min",
              "recursos": ["Recurso 1", "Recurso 2"]
            },
            {
              "fase": "Conclusão",
              "atividade": "Descrição da atividade de fechamento",
              "tempo": "10 min",
              "recursos": ["Recurso 1"]
            }
          ],
          "recursosNecessarios": [
            "Material 1",
            "Material 2",
            "Material 3"
          ],
          "avaliacaoAprendizagem": [
            {
              "tipo": "Formativa",
              "descricao": "Descrição da avaliação formativa",
              "criterios": ["Critério 1", "Critério 2"]
            },
            {
              "tipo": "Somativa",
              "descricao": "Descrição da avaliação somativa", 
              "criterios": ["Critério 1", "Critério 2"]
            }
          ],
          "referencias": [
            "Referência bibliográfica 1",
            "Referência bibliográfica 2"
          ],
          "observacoes": "Observações importantes sobre a aula",
          "competenciasHabilidades": [
            "Competência/Habilidade 1",
            "Competência/Habilidade 2"
          ]
        }

        INSTRUÇÕES:
        1. Use os dados fornecidos como base
        2. Seja específico e pedagógico
        3. Adapte o conteúdo ao nível educacional
        4. Inclua metodologias ativas
        5. Detalhe recursos e avaliações
        6. Responda APENAS com o JSON válido
      `;

      // Chamar API do Gemini
      const response = await generateAIResponse(prompt, 'plano-aula-generation', {
        intelligenceLevel: 'advanced',
        languageStyle: 'formal'
      });

      // Processar resposta
      let parsedContent: PlanoAulaContent;
      
      try {
        // Extrair JSON da resposta
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        
        // Fallback: gerar conteúdo estruturado manualmente
        parsedContent = {
          tema: activityData.tema || activity.title || 'Plano de Aula',
          disciplina: activityData.disciplina || 'Disciplina',
          turma: activityData.turma || 'Ensino Fundamental',
          professor: activityData.professor || 'Professor(a)',
          duracao: activityData.duracao || '50 minutos',
          objetivosGerais: [
            'Desenvolver conhecimentos fundamentais sobre o tema',
            'Promover o pensamento crítico e analítico'
          ],
          objetivosEspecificos: [
            'Identificar conceitos principais do conteúdo',
            'Aplicar conhecimentos em situações práticas',
            'Desenvolver habilidades de comunicação'
          ],
          conteudoProgramatico: [
            {
              titulo: 'Introdução ao Tema',
              topicos: ['Conceitos básicos', 'Contextualização histórica']
            },
            {
              titulo: 'Desenvolvimento',
              topicos: ['Aplicações práticas', 'Exercícios dirigidos']
            }
          ],
          metodologias: [
            {
              fase: 'Introdução',
              atividade: 'Apresentação do tema com recursos audiovisuais',
              tempo: '10 min',
              recursos: ['Projetor', 'Slides']
            },
            {
              fase: 'Desenvolvimento',
              atividade: 'Explicação teórica com exemplos práticos',
              tempo: '30 min',
              recursos: ['Quadro', 'Material didático']
            },
            {
              fase: 'Conclusão',
              atividade: 'Síntese e fixação do conteúdo',
              tempo: '10 min',
              recursos: ['Exercícios', 'Discussão']
            }
          ],
          recursosNecessarios: [
            'Quadro branco',
            'Projetor multimídia',
            'Material didático impresso',
            'Computador'
          ],
          avaliacaoAprendizagem: [
            {
              tipo: 'Formativa',
              descricao: 'Observação da participação e engajamento',
              criterios: ['Participação ativa', 'Qualidade das perguntas']
            },
            {
              tipo: 'Somativa',
              descricao: 'Exercício de fixação ao final da aula',
              criterios: ['Compreensão do conteúdo', 'Aplicação correta']
            }
          ],
          referencias: [
            'Material didático da instituição',
            'Bibliografia complementar da disciplina'
          ],
          observacoes: 'Adaptar metodologia conforme necessidades da turma',
          competenciasHabilidades: [
            'Pensamento crítico',
            'Comunicação eficaz',
            'Resolução de problemas'
          ]
        };
      }

      setPlanoContent(parsedContent);
    } catch (error) {
      console.error('Erro ao gerar plano de aula:', error);
      setError('Erro ao gerar conteúdo do plano de aula');
    } finally {
      setIsLoading(false);
    }
  };

  const renderVisaoGeral = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Disciplina:</span>
              <Badge variant="outline">{planoContent?.disciplina}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Turma:</span>
              <Badge variant="outline">{planoContent?.turma}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Professor:</span>
              <span className="text-sm font-medium">{planoContent?.professor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Duração:</span>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                <Clock className="h-3 w-3 mr-1" />
                {planoContent?.duracao}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Competências e Habilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {planoContent?.competenciasHabilidades?.map((competencia, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{competencia}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{planoContent?.tema}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Metodologias</div>
              <div className="text-lg font-semibold">{planoContent?.metodologias?.length || 0}</div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Objetivos</div>
              <div className="text-lg font-semibold">{(planoContent?.objetivosGerais?.length || 0) + (planoContent?.objetivosEspecificos?.length || 0)}</div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recursos</div>
              <div className="text-lg font-semibold">{planoContent?.recursosNecessarios?.length || 0}</div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avaliações</div>
              <div className="text-lg font-semibold">{planoContent?.avaliacaoAprendizagem?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderObjetivos = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Objetivos Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planoContent?.objetivosGerais?.map((objetivo, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{objetivo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Objetivos Específicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planoContent?.objetivosEspecificos?.map((objetivo, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{objetivo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConteudo = () => (
    <div className="space-y-6">
      {planoContent?.conteudoProgramatico?.map((secao, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              {secao.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {secao.topicos?.map((topico, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{topico}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMetodologia = () => (
    <div className="space-y-6">
      {planoContent?.metodologias?.map((metodologia, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                {metodologia.fase}
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                <Clock className="h-3 w-3 mr-1" />
                {metodologia.tempo}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{metodologia.atividade}</p>
            <div>
              <h4 className="text-sm font-semibold mb-2">Recursos necessários:</h4>
              <div className="flex flex-wrap gap-2">
                {metodologia.recursos?.map((recurso, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {recurso}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRecursos = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Recursos Necessários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {planoContent?.recursosNecessarios?.map((recurso, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm">{recurso}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAvaliacao = () => (
    <div className="space-y-6">
      {planoContent?.avaliacaoAprendizagem?.map((avaliacao, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Avaliação {avaliacao.tipo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{avaliacao.descricao}</p>
            <div>
              <h4 className="text-sm font-semibold mb-2">Critérios de avaliação:</h4>
              <div className="space-y-2">
                {avaliacao.criterios?.map((criterio, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{criterio}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {planoContent?.referencias && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Referências Bibliográficas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {planoContent.referencias.map((referencia, index) => (
                <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  {index + 1}. {referencia}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {planoContent?.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{planoContent.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <div>
              <h3 className="font-semibold">Gerando Plano de Aula</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processando dados e criando conteúdo personalizado...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">Erro ao gerar conteúdo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
              <Button 
                onClick={generatePlanoContent} 
                className="mt-2"
                size="sm"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'visao-geral':
        return renderVisaoGeral();
      case 'objetivos':
        return renderObjetivos();
      case 'conteudo':
        return renderConteudo();
      case 'metodologia':
        return renderMetodologia();
      case 'recursos':
        return renderRecursos();
      case 'avaliacao':
        return renderAvaliacao();
      default:
        return renderVisaoGeral();
    }
  };

  return (
    <div className="h-[600px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Layout Principal */}
      <div className="flex flex-1 h-full">
        {/* Sidebar de Navegação */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-800 dark:hover:text-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-orange-500/20' 
                        : 'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-orange-600' : 'text-orange-500 dark:text-orange-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isActive ? 'text-orange-800 dark:text-orange-100' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {section.label}
                      </h3>
                      <p className={`text-sm ${
                        isActive ? 'text-orange-700' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {section.description}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área de Conteúdo Principal */}
        <div className="flex-1 overflow-hidden">
          <div className="h-[600px] overflow-y-auto">
            <div className="p-8">
              {/* Header da Seção */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {planoContent?.tema || activity.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {sidebarSections.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Conteúdo da Seção */}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoAulaPreview;
