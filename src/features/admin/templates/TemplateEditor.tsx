import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Template, TemplateFormData } from './types';

interface TemplateEditorProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TemplateFormData) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: template?.name || '',
    status: template?.status || 'draft',
    ia_provider: template?.ia_provider || 'Gemini',
    fields: template?.fields || {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A2540] border-[#FF6B00]/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#001427] border-[#FF6B00]/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => 
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger className="bg-[#001427] border-[#FF6B00]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ia_provider">Provedor de IA</Label>
            <Select value={formData.ia_provider} onValueChange={(value) => 
              setFormData({ ...formData, ia_provider: value })
            }>
              <SelectTrigger className="bg-[#001427] border-[#FF6B00]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gemini">Gemini</SelectItem>
                <SelectItem value="OpenAI">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#FF6B00] hover:bg-[#FF8C40]">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;