
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, BookOpen, Clock, User, Share2, Presentation, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PublicActivityData {
  id: string;
  title: string;
  description: string;
  subject: string;
  activityType: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
}

export default function PublicActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<PublicActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPublicActivity(id);
    }
  }, [id]);

  const fetchPublicActivity = async (activityId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/publicActivity/${activityId}`);
      const result = await response.json();
      
      if (result.success) {
        setActivity(result.data);
      } else {
        setError(result.message || 'Atividade não encontrada');
      }
    } catch (err) {
      setError('Erro ao carregar a atividade');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresentationMode = () => {
    setPresentationMode(!presentationMode);
  };

  const handleDownload = () => {
    if (!activity) return;
    
    const content = `
ATIVIDADE: ${activity.title}

DISCIPLINA: ${activity.subject}

DESCRIÇÃO: ${activity.description}

CONTEÚDO:
${activity.content}

---
Gerado pela Ponto School
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
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
        console.log('Erro ao compartilhar:', err);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copiado para a área de transferência!');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando atividade...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Atividade não encontrada</h2>
            <p className="text-gray-600 mb-4">
              {error || 'A atividade solicitada não existe ou foi removida.'}
            </p>
            <Button onClick={() => window.close()} variant="outline">
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (presentationMode) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header da apresentação */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">{activity.title}</h1>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {activity.subject}
            </Badge>
          </div>

          {/* Conteúdo da apresentação */}
          <div className="bg-white text-gray-900 rounded-lg p-8 mb-8">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: activity.content.replace(/\n/g, '<br>') }} />
            </div>
          </div>

          {/* Controles da apresentação */}
          <div className="text-center">
            <Button 
              onClick={handlePresentationMode}
              variant="secondary"
              size="lg"
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
      <div className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ponto School</h1>
                <p className="text-sm text-gray-600">Atividade Educacional</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
                <p className="text-orange-100 text-lg">{activity.description}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {activity.subject}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Atividade Pública</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Conteúdo da Atividade */}
            <div className="prose max-w-none mb-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo da Atividade</h3>
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: activity.content.replace(/\n/g, '<br>') }}
                />
              </div>
            </div>

            {/* Botão de Apresentação */}
            <div className="text-center">
              <Button 
                onClick={handlePresentationMode}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3"
              >
                <Presentation className="w-5 h-5 mr-2" />
                Apresentar para Alunos
              </Button>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta atividade foi compartilhada publicamente. Para criar suas próprias atividades personalizadas, 
                  acesse <a href="/" className="text-orange-600 hover:underline font-medium">Ponto School</a>.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
