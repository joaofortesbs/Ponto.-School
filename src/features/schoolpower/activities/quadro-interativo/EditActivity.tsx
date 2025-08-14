
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditActivityProps {
  data?: any;
  onChange?: (data: any) => void;
}

const EditActivity: React.FC<EditActivityProps> = ({ data = {}, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Quadro Interativo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Editor para atividade de Quadro Interativo em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
};

export default EditActivity;
