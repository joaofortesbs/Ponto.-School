import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TemplatesManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Gerenciamento de Templates
        </h2>
        <p className="text-gray-300">
          Gerencie e edite templates de atividades do School Power
        </p>
      </div>

      <Card className="bg-[#0A2540] border-[#FF6B00]/20">
        <CardHeader>
          <CardTitle className="text-white">Templates Disponíveis</CardTitle>
          <CardDescription className="text-gray-300">
            Lista de todos os templates de atividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-400">
              Sistema de templates em desenvolvimento...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatesManager;