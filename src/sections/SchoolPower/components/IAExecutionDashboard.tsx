
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Download, 
  Share2, 
  RefreshCw,
  CheckCircle,
  Clock,
  Brain,
  FileText,
  BookOpen,
  Presentation,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolPowerStore } from '@/store/schoolPowerStore';

interface GeneratedContent {
  id: string;
  type: 'lesson_plan' | 'presentation' | 'exercise_list' | 'assessment' | 'activity';
  title: string;
  description: string;
  status: 'generating' | 'completed' | 'error';
  progress: number;
  content?: string;
  downloadUrl?: string;
}

export const IAExecutionDashboard: React.FC = () => {
  const { 
    contextData, 
    userMessage,
    setLoading, 
    setError,
    isLoading 
  } = useSchoolPowerStore();

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentlyGenerating, setCurrentlyGenerating] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar geração de conteúdo
    startContentGeneration();
  }, [contextData]);

  const startContentGeneration = async () => {
    const contentToGenerate: GeneratedContent[] = [
      {
        id: 'lesson_plan',
        type: 'lesson_plan',
        title: 'Plano de Aula Completo',
        description: 'Plano detalhado com objetivos, metodologia e avaliação',
        status: 'generating',
        progress: 0
      },
      {
        id: 'presentation',
        type: 'presentation',
        title: 'Apresentação Interativa',
        description: 'Slides organizados com conteúdo visual e explicações',
        status: 'generating',
        progress: 0
      },
      {
        id: 'exercise_list',
        type: 'exercise_list',
        title: 'Lista de Exercícios',
        description: 'Exercícios práticos com diferentes níveis de dificuldade',
        status: 'generating',
        progress: 0
      },
      {
        id: 'assessment',
        type: 'assessment',
        title: 'Avaliação Personalizada',
        description: 'Prova ou teste adaptado ao conteúdo e turma',
        status: 'generating',
        progress: 0
      }
    ];

    setGeneratedContent(contentToGenerate);

    // Simular geração de conteúdo
    for (let i = 0; i < contentToGenerate.length; i++) {
      const item = contentToGenerate[i];
      setCurrentlyGenerating(item.id);
      
      // Simular progresso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setGeneratedContent(prev => 
          prev.map(content => 
            content.id === item.id 
              ? { ...content, progress }
              : content
          )
        );
        
        setOverallProgress(((i * 100) + progress) / contentToGenerate.length);
      }
      
      // Marcar como concluído
      setGeneratedContent(prev => 
        prev.map(content => 
          content.id === item.id 
            ? { 
                ...content, 
                status: 'completed', 
                progress: 100,
                content: generateMockContent(item.type),
                downloadUrl: '#'
              }
            : content
        )
      );
    }
    
    setCurrentlyGenerating(null);
  };

  const generateMockContent = (type: string): string => {
    switch (type) {
      case 'lesson_plan':
        return `
# Plano de Aula: ${contextData.content.join(', ')}

## Objetivos
- Compreender os conceitos fundamentais
- Aplicar conhecimentos na prática
- Desenvolver habilidades críticas

## Metodologia
1. Introdução ao tema (15 min)
2. Desenvolvimento teórico (20 min)
3. Atividades práticas (15 min)
4. Conclusão e avaliação (10 min)

## Recursos Necessários
${contextData.materials.map(material => `- ${material}`).join('\n')}

## Avaliação
Avaliação contínua através de participação e exercícios práticos.
        `;
      case 'presentation':
        return `
# Apresentação: ${contextData.content.join(', ')}

## Slide 1: Introdução
- Apresentação do tema
- Objetivos da aula

## Slide 2: Conceitos Fundamentais
- Definições importantes
- Exemplos práticos

## Slide 3: Aplicações
- Casos de uso
- Exercícios interativos

## Slide 4: Conclusão
- Resumo dos pontos principais
- Próximos passos
        `;
      default:
        return `Conteúdo gerado para ${type}`;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'lesson_plan': return <BookOpen className="h-5 w-5" />;
      case 'presentation': return <Presentation className="h-5 w-5" />;
      case 'exercise_list': return <FileText className="h-5 w-5" />;
      case 'assessment': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleDownload = (content: GeneratedContent) => {
    const blob = new Blob([content.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (content: GeneratedContent) => {
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.description,
        url: window.location.href
      });
    } else {
      // Fallback para cópia
      navigator.clipboard.writeText(content.content || '');
      alert('Conteúdo copiado para a área de transferência!');
    }
  };

  const completedItems = generatedContent.filter(item => item.status === 'completed').length;
  const totalItems = generatedContent.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-[#FF6B00]" />
          <h2 className="text-2xl font-bold text-white">IA Executando seu Plano</h2>
        </div>
        <p className="text-white/80 max-w-2xl mx-auto">
          Nossa inteligência artificial está criando todos os materiais personalizados 
          baseados no seu contexto e necessidades específicas.
        </p>
      </div>

      {/* Progresso Geral */}
      <Card className="bg-white/5 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF6B00]" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">
                {completedItems} de {totalItems} materiais concluídos
              </span>
              <span className="text-[#FF6B00] font-bold">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            {currentlyGenerating && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="h-4 w-4" />
                </motion.div>
                Gerando: {generatedContent.find(c => c.id === currentlyGenerating)?.title}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Gerado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {generatedContent.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/20 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="text-[#FF6B00]">
                    {getContentIcon(content.type)}
                  </div>
                  {content.title}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {content.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(content.status)}>
                    {content.status === 'generating' && <Clock className="h-3 w-3 mr-1" />}
                    {content.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {content.status === 'generating' ? 'Gerando...' : 'Concluído'}
                  </Badge>
                  <span className="text-sm text-white/60">
                    {content.progress}%
                  </span>
                </div>
                
                <Progress value={content.progress} className="h-2" />
                
                {content.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(content)}
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                    <Button
                      onClick={() => handleShare(content)}
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resumo do Contexto */}
      <Card className="bg-white/5 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Resumo do Contexto Utilizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Mensagem Original:</h4>
              <p className="text-white/80 text-sm italic mb-4">"{userMessage}"</p>
              
              <h4 className="text-white font-semibold mb-2">Conteúdos:</h4>
              <div className="flex flex-wrap gap-2">
                {contextData.content.map((item, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-400">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-2">Materiais:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {contextData.materials.map((item, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-500/20 text-green-400">
                    {item}
                  </Badge>
                ))}
              </div>
              
              <h4 className="text-white font-semibold mb-2">Datas:</h4>
              <div className="flex flex-wrap gap-2">
                {contextData.dates.map((item, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Finais */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
        <Button
          onClick={() => {
            // Implementar salvamento
            alert('Plano salvo com sucesso!');
          }}
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Salvar Tudo
        </Button>
      </div>
    </motion.div>
  );
};
