import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConstructionActivity } from './types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
  onSave: (activity: ConstructionActivity) => void;
}

export function EditActivityModal({ isOpen, onClose, activity, onSave }: EditActivityModalProps) {
  if (!activity) return null;

  const handleSave = () => {
    console.log('💾 Salvando alterações da atividade:', activity.title);
    onSave(activity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#001427] dark:text-white">
            Editar Materiais - {activity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da Atividade */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-[#001427] dark:text-white">
              Informações da Atividade
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Título:</span> {activity.title}</p>
              <p><span className="font-medium">Descrição:</span> {activity.description}</p>
              <p><span className="font-medium">Progresso:</span> {activity.progress}%</p>
              <p><span className="font-medium">Status:</span> {
                activity.status === 'completed' ? 'Concluída' :
                activity.status === 'in_progress' ? 'Em andamento' : 'Pendente'
              }</p>
            </div>
          </div>

          {/* Área de Edição de Materiais */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-[#001427] dark:text-white">
              Edição de Materiais
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Esta funcionalidade permite editar os materiais associados à atividade.
              Em breve, você poderá adicionar, remover e modificar recursos educacionais.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              >
                Salvar Alterações
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}