import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle2, Clock, Users, BookOpen, Target, Lightbulb, FileText, Zap, Settings, RefreshCw, Save, Eye, X } from 'lucide-react';
import CarrosselQuadrosSalaAula from './CarrosselQuadrosSalaAula';
import { QuadroContentGenerator, type QuadroContent, type SequenciaDidaticaData } from './QuadroContentGenerator';

interface QuadroInterativoBuilderProps {
  onSave: (data: SequenciaDidaticaData) => void;
  onClose: () => void;
  onPreview: () => void;
}

export function QuadroInterativoBuilder({ onSave, onClose, onPreview }: QuadroInterativoBuilderProps) {
  const [formData, setFormData] = useState({
    tema: '',
    serie: '',
    disciplina: '',
    duracao: '',
    objetivos: [''],
    conteudos: [''],
    metodologia: '',
    recursos: [''],
    avaliacao: '',
    referencias: ['']
  });

  const [quadros, setQuadros] = useState<QuadroContent[]>([]);
  const [showCarrossel, setShowCarrossel] = useState(false);
  const [selectedQuadro, setSelectedQuadro] = useState<QuadroContent | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (index: number, field: keyof typeof formData, value: string, arrayField: keyof typeof formData) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayField] as any[])];
      newArray[index] = value;
      return { ...prev, [arrayField]: newArray };
    });
  };

  const addArrayField = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] as string[]), ''] }));
  };

  const removeArrayField = (index: number, field: keyof typeof formData) => {
    setFormData(prev => {
      const newArray = [...(prev[field] as string[])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSave = () => {
    console.log('Salvando sequência didática:', formData);
    if (onSave) {
      onSave(formData);
    }
  };

  const generateQuadros = () => {
    if (!formData.tema || !formData.serie || !formData.disciplina) {
      alert('Por favor, preencha pelo menos o tema, série e disciplina antes de gerar os quadros.');
      return;
    }

    const sequenciaData: SequenciaDidaticaData = {
      tema: formData.tema,
      serie: formData.serie,
      disciplina: formData.disciplina,
      duracao: formData.duracao || '45 minutos',
      objetivos: formData.objetivos.filter(obj => obj.trim() !== ''),
      conteudos: formData.conteudos.filter(cont => cont.trim() !== ''),
      metodologia: formData.metodologia,
      recursos: formData.recursos.filter(rec => rec.trim() !== ''),
      avaliacao: formData.avaliacao,
      referencias: formData.referencias.filter(ref => ref.trim() !== '')
    };

    const novosQuadros = QuadroContentGenerator.generateQuadrosFromSequencia(sequenciaData);
    setQuadros(novosQuadros);
    setShowCarrossel(true);
  };

  const handleEditQuadro = (quadroId: string) => {
    const quadro = quadros.find(q => q.id === quadroId);
    if (quadro) {
      setSelectedQuadro(quadro);
      // Aqui você pode abrir um modal de edição específico para o quadro
      console.log('Editando quadro:', quadro);
    }
  };

  const handleRegenerateQuadro = (quadroId: string) => {
    const sequenciaData: SequenciaDidaticaData = {
      tema: formData.tema,
      serie: formData.serie,
      disciplina: formData.disciplina,
      duracao: formData.duracao || '45 minutos',
      objetivos: formData.objetivos.filter(obj => obj.trim() !== ''),
      conteudos: formData.conteudos.filter(cont => cont.trim() !== ''),
      metodologia: formData.metodologia,
      recursos: formData.recursos.filter(rec => rec.trim() !== ''),
      avaliacao: formData.avaliacao,
      referencias: formData.referencias.filter(ref => ref.trim() !== '')
    };

    const novoQuadro = QuadroContentGenerator.regenerateQuadro(quadroId, sequenciaData);
    setQuadros(prevQuadros => 
      prevQuadros.map(quadro => 
        quadro.id === quadroId ? novoQuadro : quadro
      )
    );
  };

  const handleDeleteQuadro = (quadroId: string) => {
    if (confirm('Tem certeza que deseja excluir este quadro?')) {
      setQuadros(prevQuadros => prevQuadros.filter(quadro => quadro.id !== quadroId));
    }
  };

  const handleQuadroSelect = (quadroId: string) => {
    const quadro = quadros.find(q => q.id === quadroId);
    setSelectedQuadro(quadro || null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Criar/Editar Sequência Didática</h2>
      
      <Separator className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <Label htmlFor="tema">Tema da Sequência</Label>
          <Input
            id="tema"
            name="tema"
            value={formData.tema}
            onChange={handleInputChange}
            placeholder="Ex: Revolução Francesa"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="serie">Série/Ano</Label>
          <Input
            id="serie"
            name="serie"
            value={formData.serie}
            onChange={handleInputChange}
            placeholder="Ex: 9º Ano"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="disciplina">Disciplina</Label>
          <Input
            id="disciplina"
            name="disciplina"
            value={formData.disciplina}
            onChange={handleInputChange}
            placeholder="Ex: História"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="duracao">Duração Estimada</Label>
          <Input
            id="duracao"
            name="duracao"
            value={formData.duracao}
            onChange={handleInputChange}
            placeholder="Ex: 3 aulas de 50 minutos"
            className="mt-1"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="objetivos">Objetivos de Aprendizagem</Label>
        <ScrollArea className="h-24 mt-1 border rounded-md p-2">
          {formData.objetivos.map((objetivo, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={objetivo}
                onChange={(e) => handleArrayInputChange(index, 'objetivos', e.target.value, 'objetivos')}
                placeholder={`Objetivo ${index + 1}`}
                className="flex-1"
              />
              {index > 0 && (
                <Button variant="ghost" size="sm" onClick={() => removeArrayField(index, 'objetivos')}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
              {index === formData.objetivos.length - 1 && (
                <Button variant="ghost" size="sm" onClick={() => addArrayField('objetivos')}>
                  <Plus className="h-4 w-4 text-blue-500" />
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="mt-4">
        <Label htmlFor="conteudos">Conteúdos Programáticos</Label>
        <ScrollArea className="h-24 mt-1 border rounded-md p-2">
          {formData.conteudos.map((conteudo, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={conteudo}
                onChange={(e) => handleArrayInputChange(index, 'conteudos', e.target.value, 'conteudos')}
                placeholder={`Conteúdo ${index + 1}`}
                className="flex-1"
              />
              {index > 0 && (
                <Button variant="ghost" size="sm" onClick={() => removeArrayField(index, 'conteudos')}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
              {index === formData.conteudos.length - 1 && (
                <Button variant="ghost" size="sm" onClick={() => addArrayField('conteudos')}>
                  <Plus className="h-4 w-4 text-blue-500" />
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="mt-4">
        <Label htmlFor="metodologia">Metodologia de Ensino</Label>
        <Textarea
          id="metodologia"
          name="metodologia"
          value={formData.metodologia}
          onChange={handleInputChange}
          placeholder="Descreva a metodologia a ser utilizada..."
          className="mt-1 h-24"
        />
      </div>

      <div className="mt-4">
        <Label htmlFor="recursos">Recursos Didáticos</Label>
        <ScrollArea className="h-24 mt-1 border rounded-md p-2">
          {formData.recursos.map((recurso, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={recurso}
                onChange={(e) => handleArrayInputChange(index, 'recursos', e.target.value, 'recursos')}
                placeholder={`Recurso ${index + 1}`}
                className="flex-1"
              />
              {index > 0 && (
                <Button variant="ghost" size="sm" onClick={() => removeArrayField(index, 'recursos')}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
              {index === formData.recursos.length - 1 && (
                <Button variant="ghost" size="sm" onClick={() => addArrayField('recursos')}>
                  <Plus className="h-4 w-4 text-blue-500" />
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="mt-4">
        <Label htmlFor="avaliacao">Formas de Avaliação</Label>
        <Textarea
          id="avaliacao"
          name="avaliacao"
          value={formData.avaliacao}
          onChange={handleInputChange}
          placeholder="Como a aprendizagem será avaliada..."
          className="mt-1 h-24"
        />
      </div>

      <div className="mt-4 mb-6">
        <Label htmlFor="referencias">Referências Bibliográficas</Label>
        <ScrollArea className="h-24 mt-1 border rounded-md p-2">
          {formData.referencias.map((referencia, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={referencia}
                onChange={(e) => handleArrayInputChange(index, 'referencias', e.target.value, 'referencias')}
                placeholder={`Referência ${index + 1}`}
                className="flex-1"
              />
              {index > 0 && (
                <Button variant="ghost" size="sm" onClick={() => removeArrayField(index, 'referencias')}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
              {index === formData.referencias.length - 1 && (
                <Button variant="ghost" size="sm" onClick={() => addArrayField('referencias')}>
                  <Plus className="h-4 w-4 text-blue-500" />
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={onPreview} variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button 
            onClick={generateQuadros} 
            variant="outline" 
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
          >
            <Zap className="h-4 w-4" />
            Gerar Quadros 3D
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Sequência
          </Button>
        </div>
      </div>

      {/* Modal do Carrossel 3D */}
      {showCarrossel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-full h-full bg-gray-100">
            <button
              onClick={() => setShowCarrossel(false)}
              className="absolute top-4 right-4 z-30 bg-white/20 backdrop-blur-md rounded-full p-2 
                         text-gray-700 hover:text-gray-900 hover:bg-white/30 transition-all duration-300"
            >
              <X size={24} />
            </button>

            <CarrosselQuadrosSalaAula
              quadros={quadros.map(quadro => ({
                id: quadro.id,
                backgroundColor: quadro.backgroundColor,
                isActive: selectedQuadro?.id === quadro.id
              }))}
              onEdit={handleEditQuadro}
              onRegenerate={handleRegenerateQuadro}
              onDelete={handleDeleteQuadro}
              onQuadroSelect={handleQuadroSelect}
            />

            {/* Painel de informações do quadro selecionado */}
            {selectedQuadro && (
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md 
                              rounded-lg p-4 shadow-xl max-h-48 overflow-y-auto z-20">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{selectedQuadro.title}</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {selectedQuadro.content}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock de uma função Plus para evitar erro de compilação, caso não esteja definida em algum lugar
const Plus = ({ size, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);