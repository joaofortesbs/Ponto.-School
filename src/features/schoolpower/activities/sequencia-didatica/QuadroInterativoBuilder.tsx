
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface QuadroSlide {
  slideNumber: number;
  title: string;
  content: string;
  visual: string;
  audio: string;
}

interface QuadroInterativoBuilderProps {
  initialSlides?: QuadroSlide[];
  onChange?: (slides: QuadroSlide[]) => void;
}

export const QuadroInterativoBuilder: React.FC<QuadroInterativoBuilderProps> = ({
  initialSlides = [],
  onChange
}) => {
  const [slides, setSlides] = useState<QuadroSlide[]>(initialSlides);

  const addSlide = () => {
    const newSlide: QuadroSlide = {
      slideNumber: slides.length + 1,
      title: '',
      content: '',
      visual: '',
      audio: ''
    };
    const updatedSlides = [...slides, newSlide];
    setSlides(updatedSlides);
    onChange?.(updatedSlides);
  };

  const removeSlide = (index: number) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
    onChange?.(updatedSlides);
  };

  const updateSlide = (index: number, field: keyof QuadroSlide, value: string | number) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setSlides(updatedSlides);
    onChange?.(updatedSlides);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Construtor de Quadro Interativo</h3>
        <Button onClick={addSlide} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Slide
        </Button>
      </div>

      {slides.map((slide, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Slide {slide.slideNumber}</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeSlide(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={slide.title}
                onChange={(e) => updateSlide(index, 'title', e.target.value)}
                placeholder="Título do slide"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea
                value={slide.content}
                onChange={(e) => updateSlide(index, 'content', e.target.value)}
                placeholder="Conteúdo principal do slide"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição Visual</label>
              <Textarea
                value={slide.visual}
                onChange={(e) => updateSlide(index, 'visual', e.target.value)}
                placeholder="Descrição dos elementos visuais"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Áudio/Narração</label>
              <Textarea
                value={slide.audio}
                onChange={(e) => updateSlide(index, 'audio', e.target.value)}
                placeholder="Script da narração"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {slides.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum slide criado ainda</p>
            <Button onClick={addSlide}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Slide
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuadroInterativoBuilder;
