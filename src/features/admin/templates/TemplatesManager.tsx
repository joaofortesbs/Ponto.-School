
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import TemplateCard from './TemplateCard';
import TemplateEditor from './TemplateEditor';
import { useTemplates } from './hooks/useTemplates';
import { Template } from './types';
import { Skeleton } from '../../../components/ui/skeleton';

const TemplatesManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { templates, loading, syncTemplates, updateTemplate } = useTemplates();

  useEffect(() => {
    syncTemplates();
  }, []);

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setSelectedTemplate(null);
    setShowEditor(false);
  };

  const handleSaveTemplate = async (template: Template) => {
    await updateTemplate(template);
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const handleSyncTemplates = async () => {
    await syncTemplates();
  };

  if (showEditor && selectedTemplate) {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onClose={handleCloseEditor}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Templates Disponíveis
          </h2>
          <p className="text-white/60">
            {templates.length} template(s) sincronizado(s) com o sistema
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleSyncTemplates}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="p-6 bg-white/5 rounded-lg border border-white/10">
              <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
              <Skeleton className="h-4 w-1/2 mb-4 bg-white/10" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 bg-white/10" />
                <Skeleton className="h-6 w-20 bg-white/10" />
              </div>
              <Skeleton className="h-9 w-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
            />
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-white/40" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-white/60 mb-6">
            Execute a sincronização para carregar os templates do sistema
          </p>
          <Button
            onClick={handleSyncTemplates}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar Templates
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplatesManager;
