import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

import CompartilharGrupoSection from './CompartilharGrupoSection';
import GrupoSairModal from './GrupoSairModal';

interface GrupoConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: any;
  onSalvar: (grupoAtualizado: any) => void;
  onSair: (grupoId: string) => void;
  onGerarCodigo: (grupoId: string) => Promise<string | null>;
}

const GrupoConfiguracoesModal: React.FC<GrupoConfiguracoesModalProps> = ({
  isOpen,
  onClose,
  grupo,
  onSalvar,
  onSair,
  onGerarCodigo
}) => {
  const [grupoAtualizado, setGrupoAtualizado] = useState({ ...grupo });
  const [activeTab, setActiveTab] = useState('informacoes');
  const [showSairModal, setShowSairModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGrupoAtualizado({ ...grupo });
    }
  }, [isOpen, grupo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGrupoAtualizado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setGrupoAtualizado(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSalvar = () => {
    onSalvar(grupoAtualizado);
    onClose();
  };

  const handleConfirmarSair = () => {
    onSair(grupo.id);
    setShowSairModal(false);
    onClose();
  };

  const handleGerarCodigo = async (grupoId: string) => {
    return await onGerarCodigo(grupoId);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações do Grupo
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="informacoes" className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informações
              </TabsTrigger>
              <TabsTrigger value="privacidade" className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="membros" className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Membros
              </TabsTrigger>
              <TabsTrigger value="compartilhar" className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartilhar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do grupo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={grupoAtualizado.nome || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    rows={4}
                    value={grupoAtualizado.descricao || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicos">Tópicos (separados por vírgula)</Label>
                  <Input
                    id="topicos"
                    name="topicos"
                    value={Array.isArray(grupoAtualizado.topicos) ? grupoAtualizado.topicos.join(', ') : grupoAtualizado.topicos || ''}
                    onChange={(e) => {
                      const topicosArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setGrupoAtualizado(prev => ({
                        ...prev,
                        topicos: topicosArray
                      }));
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacidade" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="privado">Grupo privado</Label>
                    <div className="text-sm text-muted-foreground">
                      Apenas membros convidados podem participar
                    </div>
                  </div>
                  <Switch
                    id="privado"
                    checked={grupoAtualizado.privado || false}
                    onCheckedChange={(checked) => handleSwitchChange('privado', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="moderacao">Moderação de novos membros</Label>
                    <div className="text-sm text-muted-foreground">
                      Aprovar membros antes de entrarem
                    </div>
                  </div>
                  <Switch
                    id="moderacao"
                    checked={grupoAtualizado.moderacao || false}
                    onCheckedChange={(checked) => handleSwitchChange('moderacao', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="membros" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gerenciamento de membros em desenvolvimento.</p>
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        O gerenciamento avançado de membros estará disponível em breve.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compartilhar" className="space-y-4">
              <CompartilharGrupoSection 
                grupo={grupo} 
                onGerarCodigo={handleGerarCodigo}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="sm:mr-auto" onClick={() => setShowSairModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair do grupo
            </Button>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSalvar}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GrupoSairModal 
        isOpen={showSairModal} 
        onClose={() => setShowSairModal(false)} 
        onConfirmar={handleConfirmarSair} 
        grupoNome={grupo?.nome || 'este grupo'} 
      />
    </>
  );
};

export default GrupoConfiguracoesModal;