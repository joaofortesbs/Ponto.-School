import React from 'react';
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditActivityProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

export function EditActivity({ formData, onFieldChange }: EditActivityProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="objectives" className="text-sm">Objetivos de Aprendizagem</Label>
        <Textarea
          id="objectives"
          value={formData.objectives || ''}
          onChange={(e) => onFieldChange('objectives', e.target.value)}
          placeholder="Descreva os objetivos que os alunos devem alcançar..."
          className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="materials" className="text-sm">Materiais Necessários</Label>
        <Textarea
          id="materials"
          value={formData.materials || ''}
          onChange={(e) => onFieldChange('materials', e.target.value)}
          placeholder="Liste os materiais necessários (um por linha)..."
          className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="instructions" className="text-sm">Instruções da Atividade</Label>
        <Textarea
          id="instructions"
          value={formData.instructions || ''}
          onChange={(e) => onFieldChange('instructions', e.target.value)}
          placeholder="Descreva como a atividade deve ser executada..."
          className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="evaluation" className="text-sm">Critérios de Avaliação</Label>
        <Textarea
          id="evaluation"
          value={formData.evaluation || ''}
          onChange={(e) => onFieldChange('evaluation', e.target.value)}
          placeholder="Como a atividade será avaliada..."
          className="mt-1 min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Campos específicos para Quadro Interativo */}
      <div>
        <Label htmlFor="subject" className="text-sm">Disciplina</Label>
        <Input
          id="subject"
          value={formData.subject || ''}
          onChange={(e) => onFieldChange('subject', e.target.value)}
          placeholder="Ex: Matemática, Português..."
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="theme" className="text-sm">Tema</Label>
        <Input
          id="theme"
          value={formData.theme || ''}
          onChange={(e) => onFieldChange('theme', e.target.value)}
          placeholder="Ex: Substantivos e Verbos..."
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label htmlFor="schoolYear" className="text-sm">Ano de Escolaridade</Label>
        <Input
          id="schoolYear"
          value={formData.schoolYear || ''}
          onChange={(e) => onFieldChange('schoolYear', e.target.value)}
          placeholder="Ex: 5º ano, 9º ano..."
          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { generateQuadroInterativoContent } from './quadroInterativoProcessor';

interface EditActivityProps {
  activityData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditActivity({ activityData, onSave, onCancel }: EditActivityProps) {
  const [formData, setFormData] = useState({
    disciplina: activityData?.customFields?.['Disciplina / Área de conhecimento'] || '',
    anoSerie: activityData?.customFields?.['Ano / Série'] || '',
    tema: activityData?.customFields?.['Tema ou Assunto da aula'] || '',
    objetivo: activityData?.customFields?.['Objetivo de aprendizagem da aula'] || '',
    nivelDificuldade: activityData?.customFields?.['Nível de Dificuldade'] || '',
    atividadeMostrada: activityData?.customFields?.['Atividade mostrada'] || ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    titulo: activityData?.generatedContent?.titulo || '',
    conteudo: activityData?.generatedContent?.conteudo || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    if (!formData.disciplina || !formData.tema) {
      alert('Por favor, preencha pelo menos a disciplina e o tema.');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🎯 Gerando conteúdo do Quadro Interativo com dados:', formData);
      
      const result = await generateQuadroInterativoContent(formData);
      
      if (result.success) {
        setGeneratedContent({
          titulo: result.titulo,
          conteudo: result.conteudo
        });
        console.log('✅ Conteúdo gerado com sucesso:', result);
      } else {
        console.error('❌ Erro na geração:', result.error);
        alert('Erro ao gerar conteúdo: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Erro na geração do conteúdo:', error);
      alert('Erro inesperado ao gerar conteúdo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const updatedData = {
      ...activityData,
      customFields: {
        'Disciplina / Área de conhecimento': formData.disciplina,
        'Ano / Série': formData.anoSerie,
        'Tema ou Assunto da aula': formData.tema,
        'Objetivo de aprendizagem da aula': formData.objetivo,
        'Nível de Dificuldade': formData.nivelDificuldade,
        'Atividade mostrada': formData.atividadeMostrada
      },
      generatedContent: generatedContent,
      isBuilt: !!(generatedContent.titulo && generatedContent.conteudo),
      builtAt: generatedContent.titulo && generatedContent.conteudo ? new Date().toISOString() : null
    };

    console.log('💾 Salvando dados do Quadro Interativo:', updatedData);
    onSave(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Quadro Interativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="disciplina">Disciplina / Área de conhecimento</Label>
              <Input
                id="disciplina"
                value={formData.disciplina}
                onChange={(e) => handleInputChange('disciplina', e.target.value)}
                placeholder="Ex: Língua Portuguesa"
              />
            </div>
            
            <div>
              <Label htmlFor="anoSerie">Ano / Série</Label>
              <Input
                id="anoSerie"
                value={formData.anoSerie}
                onChange={(e) => handleInputChange('anoSerie', e.target.value)}
                placeholder="Ex: 3º Bimestre"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tema">Tema ou Assunto da aula</Label>
            <Input
              id="tema"
              value={formData.tema}
              onChange={(e) => handleInputChange('tema', e.target.value)}
              placeholder="Ex: Substantivos Próprios e Verbos"
            />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo de aprendizagem da aula</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={(e) => handleInputChange('objetivo', e.target.value)}
              placeholder="Ex: Identificar e utilizar corretamente substantivos próprios e verbos"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nivelDificuldade">Nível de Dificuldade</Label>
              <Input
                id="nivelDificuldade"
                value={formData.nivelDificuldade}
                onChange={(e) => handleInputChange('nivelDificuldade', e.target.value)}
                placeholder="Ex: Médio"
              />
            </div>
            
            <div>
              <Label htmlFor="atividadeMostrada">Atividade mostrada</Label>
              <Input
                id="atividadeMostrada"
                value={formData.atividadeMostrada}
                onChange={(e) => handleInputChange('atividadeMostrada', e.target.value)}
                placeholder="Ex: lista-exercicios"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !formData.disciplina || !formData.tema}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Conteúdo...
                </>
              ) : (
                'Gerar Conteúdo com IA'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedContent.titulo && (
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {generatedContent.titulo}
              </div>
            </div>
            
            <div>
              <Label>Conteúdo</Label>
              <div className="p-3 bg-gray-50 rounded-md border min-h-[100px] whitespace-pre-wrap">
                {generatedContent.conteudo}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!generatedContent.titulo || !generatedContent.conteudo}
          className="flex-1"
        >
          Salvar Atividade
        </Button>
      </div>
    </div>
  );
}
