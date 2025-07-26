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

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
}) => {
  if (!activity) return null;

  const handleSave = () => {
    onSave(activity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Editar Atividade: {activity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-[#001427] dark:text-white">
              Informações da Atividade
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Título:</strong> {activity.title}</p>
              <p><strong>Descrição:</strong> {activity.description}</p>
              <p><strong>Tipo:</strong> {activity.type}</p>
              <p><strong>Duração:</strong> {activity.duration}</p>
            </div>
          </div>

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
};