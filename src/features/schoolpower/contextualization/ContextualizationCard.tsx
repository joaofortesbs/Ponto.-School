
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, BookOpen, Users, GraduationCap } from 'lucide-react';

export interface ContextualizationData {
  disciplina: string;
  anoEscolar: string;
  tema: string;
  objetivos: string;
  metodologia: string;
  recursos: string;
  avaliacao: string;
  observacoes?: string;
}

interface ContextualizationCardProps {
  onSubmit: (data: ContextualizationData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ContextualizationCard: React.FC<ContextualizationCardProps> = ({
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ContextualizationData>({
    disciplina: '',
    anoEscolar: '',
    tema: '',
    objetivos: '',
    metodologia: '',
    recursos: '',
    avaliacao: '',
    observacoes: ''
  });

  const handleInputChange = (field: keyof ContextualizationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.disciplina && formData.anoEscolar && formData.tema && formData.objetivos) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.disciplina && formData.anoEscolar && formData.tema && formData.objetivos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Contextualização
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disciplina" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Disciplina *
              </Label>
              <Input
                id="disciplina"
                value={formData.disciplina}
                onChange={(e) => handleInputChange('disciplina', e.target.value)}
                placeholder="Ex: Matemática, Português, História..."
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anoEscolar" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ano Escolar *
              </Label>
              <Select value={formData.anoEscolar} onValueChange={(value) => handleInputChange('anoEscolar', value)}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ano">1º Ano</SelectItem>
                  <SelectItem value="2ano">2º Ano</SelectItem>
                  <SelectItem value="3ano">3º Ano</SelectItem>
                  <SelectItem value="4ano">4º Ano</SelectItem>
                  <SelectItem value="5ano">5º Ano</SelectItem>
                  <SelectItem value="6ano">6º Ano</SelectItem>
                  <SelectItem value="7ano">7º Ano</SelectItem>
                  <SelectItem value="8ano">8º Ano</SelectItem>
                  <SelectItem value="9ano">9º Ano</SelectItem>
                  <SelectItem value="1ensino">1º Ensino Médio</SelectItem>
                  <SelectItem value="2ensino">2º Ensino Médio</SelectItem>
                  <SelectItem value="3ensino">3º Ensino Médio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tema da Aula *
            </Label>
            <Input
              id="tema"
              value={formData.tema}
              onChange={(e) => handleInputChange('tema', e.target.value)}
              placeholder="Ex: Funções de 1º Grau, Revolução Francesa..."
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivos" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Objetivos de Aprendizagem *
            </Label>
            <Textarea
              id="objetivos"
              value={formData.objetivos}
              onChange={(e) => handleInputChange('objetivos', e.target.value)}
              placeholder="Descreva os objetivos que os alunos devem alcançar com esta aula..."
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metodologia" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Metodologia
              </Label>
              <Textarea
                id="metodologia"
                value={formData.metodologia}
                onChange={(e) => handleInputChange('metodologia', e.target.value)}
                placeholder="Como será desenvolvida a aula?"
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recursos" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Recursos Necessários
              </Label>
              <Textarea
                id="recursos"
                value={formData.recursos}
                onChange={(e) => handleInputChange('recursos', e.target.value)}
                placeholder="Materiais, equipamentos, ferramentas..."
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avaliacao" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Forma de Avaliação
            </Label>
            <Textarea
              id="avaliacao"
              value={formData.avaliacao}
              onChange={(e) => handleInputChange('avaliacao', e.target.value)}
              placeholder="Como os alunos serão avaliados?"
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Observações Adicionais
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Informações complementares, adaptações necessárias..."
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gerar Plano de Ação
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContextualizationCard;
