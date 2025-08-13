
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Users, Clock, Calendar, CheckCircle } from 'lucide-react';

interface EditActivityProps {
  data?: any;
  onChange?: (data: any) => void;
  onSave?: (data: any) => void;
}

const EditActivity: React.FC<EditActivityProps> = ({ data = {}, onChange, onSave }) => {
  const [formData, setFormData] = useState({
    tituloTemaAssunto: data?.tituloTemaAssunto || '',
    anoSerie: data?.anoSerie || '',
    disciplina: data?.disciplina || '',
    bnccCompetencias: data?.bnccCompetencias || '',
    publicoAlvo: data?.publicoAlvo || '',
    objetivosAprendizagem: data?.objetivosAprendizagem || '',
    quantidadeAulas: data?.quantidadeAulas || '1',
    quantidadeDiagnosticos: data?.quantidadeDiagnosticos || '1',
    quantidadeAvaliacoes: data?.quantidadeAvaliacoes || '1',
    cronograma: data?.cronograma || ''
  });

  const disciplinas = [
    'Matemática', 'Português', 'História', 'Geografia', 'Ciências',
    'Física', 'Química', 'Biologia', 'Inglês', 'Educação Física',
    'Arte', 'Filosofia', 'Sociologia', 'Literatura', 'Redação'
  ];

  const anosSeries = [
    '1º ano', '2º ano', '3º ano', '4º ano', '5º ano',
    '6º ano', '7º ano', '8º ano', '9º ano',
    '1º ano EM', '2º ano EM', '3º ano EM'
  ];

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Cabeçalho */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Sequência Didática</h2>
        </div>
        <p className="text-sm text-gray-600">
          Configure os campos abaixo para criar uma sequência didática personalizada
        </p>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={18} />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tituloTemaAssunto">Título do Tema / Assunto *</Label>
            <Input
              id="tituloTemaAssunto"
              name="tituloTemaAssunto"
              value={formData.tituloTemaAssunto}
              onChange={(e) => handleInputChange('tituloTemaAssunto', e.target.value)}
              placeholder="Ex: Explorando Substantivos Próprios e Verbos"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="anoSerie">Ano / Série *</Label>
              <Select
                value={formData.anoSerie}
                onValueChange={(value) => handleInputChange('anoSerie', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o ano/série" />
                </SelectTrigger>
                <SelectContent>
                  {anosSeries.map(ano => (
                    <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="disciplina">Disciplina *</Label>
              <Select
                value={formData.disciplina}
                onValueChange={(value) => handleInputChange('disciplina', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map(disciplina => (
                    <SelectItem key={disciplina} value={disciplina}>{disciplina}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="publicoAlvo">Público-alvo</Label>
            <Input
              id="publicoAlvo"
              name="publicoAlvo"
              value={formData.publicoAlvo}
              onChange={(e) => handleInputChange('publicoAlvo', e.target.value)}
              placeholder="Ex: Estudantes do 5º ano do Ensino Fundamental"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Objetivos e Competências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={18} />
            Objetivos e Competências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="objetivosAprendizagem">Objetivos de Aprendizagem *</Label>
            <Textarea
              id="objetivosAprendizagem"
              name="objetivosAprendizagem"
              value={formData.objetivosAprendizagem}
              onChange={(e) => handleInputChange('objetivosAprendizagem', e.target.value)}
              placeholder="Descreva os objetivos que os alunos devem alcançar..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="bnccCompetencias">BNCC / Competências</Label>
            <Textarea
              id="bnccCompetencias"
              name="bnccCompetencias"
              value={formData.bnccCompetencias}
              onChange={(e) => handleInputChange('bnccCompetencias', e.target.value)}
              placeholder="Liste as competências da BNCC relacionadas..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Estrutura da Sequência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={18} />
            Estrutura da Sequência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantidadeAulas">Quantidade de Aulas</Label>
              <Input
                id="quantidadeAulas"
                name="quantidadeAulas"
                type="number"
                min="1"
                max="20"
                value={formData.quantidadeAulas}
                onChange={(e) => handleInputChange('quantidadeAulas', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="quantidadeDiagnosticos">Quantidade de Diagnósticos</Label>
              <Input
                id="quantidadeDiagnosticos"
                name="quantidadeDiagnosticos"
                type="number"
                min="0"
                max="10"
                value={formData.quantidadeDiagnosticos}
                onChange={(e) => handleInputChange('quantidadeDiagnosticos', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="quantidadeAvaliacoes">Quantidade de Avaliações</Label>
              <Input
                id="quantidadeAvaliacoes"
                name="quantidadeAvaliacoes"
                type="number"
                min="0"
                max="10"
                value={formData.quantidadeAvaliacoes}
                onChange={(e) => handleInputChange('quantidadeAvaliacoes', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={18} />
            Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="cronograma">Cronograma Detalhado</Label>
            <Textarea
              id="cronograma"
              name="cronograma"
              value={formData.cronograma}
              onChange={(e) => handleInputChange('cronograma', e.target.value)}
              placeholder="Descreva o cronograma das atividades, duração de cada etapa, etc..."
              className="mt-1 min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Users size={18} />
            Resumo da Sequência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formData.tituloTemaAssunto && (
              <Badge variant="secondary">{formData.tituloTemaAssunto}</Badge>
            )}
            {formData.disciplina && (
              <Badge variant="outline">{formData.disciplina}</Badge>
            )}
            {formData.anoSerie && (
              <Badge variant="outline">{formData.anoSerie}</Badge>
            )}
            <Badge variant="outline">{formData.quantidadeAulas} aulas</Badge>
            <Badge variant="outline">{formData.quantidadeDiagnosticos} diagnósticos</Badge>
            <Badge variant="outline">{formData.quantidadeAvaliacoes} avaliações</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditActivity;
