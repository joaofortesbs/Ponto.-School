
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Target, 
  Users, 
  Clock, 
  Settings, 
  Presentation,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';

interface QuadroInterativoFormData {
  quadroInterativoTitulo: string;
  quadroInterativoDescricao: string;
  quadroInterativoMateria: string;
  quadroInterativoTema: string;
  quadroInterativoAnoEscolar: string;
  quadroInterativoNumeroQuestoes: number;
  quadroInterativoNivelDificuldade: string;
  quadroInterativoModalidadeQuestao: string;
  quadroInterativoCampoEspecifico: string;
}

interface EditActivityProps {
  data: QuadroInterativoFormData;
  onChange: (field: string, value: any) => void;
  onSave?: () => void;
}

const materias = [
  'Português', 'Matemática', 'História', 'Geografia', 'Ciências',
  'Inglês', 'Educação Física', 'Artes', 'Física', 'Química',
  'Biologia', 'Filosofia', 'Sociologia', 'Literatura'
];

const anosEscolares = [
  '1º ano', '2º ano', '3º ano', '4º ano', '5º ano',
  '6º ano', '7º ano', '8º ano', '9º ano',
  '1º ano EM', '2º ano EM', '3º ano EM'
];

const nivesDificuldade = [
  'Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil'
];

const modalidadesQuestao = [
  'Múltipla escolha',
  'Verdadeiro ou Falso',
  'Dissertativa',
  'Lacunas para preencher',
  'Associação',
  'Ordenação'
];

export default function EditActivity({ data, onChange, onSave }: EditActivityProps) {
  const [isValid, setIsValid] = useState(false);

  // Verificar se os dados estão válidos
  useEffect(() => {
    const requiredFields = [
      data.quadroInterativoTitulo,
      data.quadroInterativoMateria,
      data.quadroInterativoTema
    ];
    
    const valid = requiredFields.every(field => field && field.trim() !== '');
    setIsValid(valid);
  }, [data]);

  const handleFieldChange = (field: string, value: any) => {
    console.log(`📝 Campo alterado: ${field} = ${value}`);
    onChange(field, value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-[#FF6B00]/20 bg-gradient-to-r from-[#FF6B00]/5 to-[#FF8C40]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-[#FF6B00] rounded-lg">
              <Presentation className="h-6 w-6 text-white" />
            </div>
            <div>
              <span>Quadro Interativo: Relevo e Formação de Montanhas</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                Configure os materiais e gere o conteúdo da atividade
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#FF6B00]" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-medium">
                Título da Atividade *
              </Label>
              <Input
                id="titulo"
                placeholder="Ex: Relevo e Formação de Montanhas"
                value={data.quadroInterativoTitulo || ''}
                onChange={(e) => handleFieldChange('quadroInterativoTitulo', e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materia" className="text-sm font-medium">
                Matéria/Disciplina *
              </Label>
              <Select
                value={data.quadroInterativoMateria || ''}
                onValueChange={(value) => handleFieldChange('quadroInterativoMateria', value)}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]">
                  <SelectValue placeholder="Selecione a matéria" />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((materia) => (
                    <SelectItem key={materia} value={materia}>
                      {materia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição da Atividade
            </Label>
            <Textarea
              id="descricao"
              placeholder="Descreva brevemente o que a atividade abordará..."
              value={data.quadroInterativoDescricao || ''}
              onChange={(e) => handleFieldChange('quadroInterativoDescricao', e.target.value)}
              className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
            Configurações de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tema" className="text-sm font-medium">
                Tema Específico *
              </Label>
              <Input
                id="tema"
                placeholder="Ex: Processos de formação de montanhas"
                value={data.quadroInterativoTema || ''}
                onChange={(e) => handleFieldChange('quadroInterativoTema', e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anoEscolar" className="text-sm font-medium">
                Ano Escolar
              </Label>
              <Select
                value={data.quadroInterativoAnoEscolar || ''}
                onValueChange={(value) => handleFieldChange('quadroInterativoAnoEscolar', value)}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {anosEscolares.map((ano) => (
                    <SelectItem key={ano} value={ano}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campoEspecifico" className="text-sm font-medium">
              Campo Específico
            </Label>
            <Input
              id="campoEspecifico"
              placeholder="Ex: Geologia, Tectônica de placas..."
              value={data.quadroInterativoCampoEspecifico || ''}
              onChange={(e) => handleFieldChange('quadroInterativoCampoEspecifico', e.target.value)}
              className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Interatividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#FF6B00]" />
            Configurações de Interatividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nivelDificuldade" className="text-sm font-medium">
                Nível de Dificuldade
              </Label>
              <Select
                value={data.quadroInterativoNivelDificuldade || ''}
                onValueChange={(value) => handleFieldChange('quadroInterativoNivelDificuldade', value)}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {nivesDificuldade.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidadeQuestao" className="text-sm font-medium">
                Modalidade das Questões
              </Label>
              <Select
                value={data.quadroInterativoModalidadeQuestao || ''}
                onValueChange={(value) => handleFieldChange('quadroInterativoModalidadeQuestao', value)}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {modalidadesQuestao.map((modalidade) => (
                    <SelectItem key={modalidade} value={modalidade}>
                      {modalidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Número de Questões: {data.quadroInterativoNumeroQuestoes || 10}
            </Label>
            <Slider
              value={[data.quadroInterativoNumeroQuestoes || 10]}
              onValueChange={(value) => handleFieldChange('quadroInterativoNumeroQuestoes', value[0])}
              max={20}
              min={5}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 questões</span>
              <span>20 questões</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status e Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isValid ? "default" : "secondary"} className={isValid ? "bg-green-500" : ""}>
                {isValid ? "Pronto para gerar" : "Campos obrigatórios pendentes"}
              </Badge>
              {!isValid && (
                <span className="text-sm text-gray-500">
                  * Preencha o título, matéria e tema
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset fields
                  Object.keys(data).forEach(key => {
                    if (key.startsWith('quadroInterativo')) {
                      handleFieldChange(key, '');
                    }
                  });
                  handleFieldChange('quadroInterativoNumeroQuestoes', 10);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={!isValid}
                  className="bg-[#FF6B00] hover:bg-[#FF8C40]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
