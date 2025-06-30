import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

interface GroupSettingsModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ groupId, isOpen, onClose, onUpdate }) => {
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGroupImage, setUploadingGroupImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadGroupData();
    }
  }, [isOpen, groupId]);

  const loadGroupData = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      setGroupData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do grupo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .update(groupData)
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, type: 'banner' | 'group_image') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${groupId}/${type}_${Date.now()}.${fileExt}`;

      // Upload da imagem
      const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('group-images')
        .getPublicUrl(fileName);

      if (!publicUrlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem');
      }

      // Atualizar no banco de dados
      const field = type === 'banner' ? 'banner_url' : 'group_image_url';
      const { error: updateError } = await supabase
        .from('grupos_estudo')
        .update({ [field]: publicUrlData.publicUrl })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Atualizar estado local
      setGroupData(prev => ({ ...prev, [field]: publicUrlData.publicUrl }));

      toast({
        title: "Sucesso",
        description: `Imagem de ${type === 'banner' ? 'capa' : 'grupo'} salva com sucesso!`
      });

      onUpdate?.();
    } catch (error) {
      console.error(`Erro ao enviar imagem ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao salvar imagem de ${type === 'banner' ? 'capa' : 'grupo'}`,
        variant: "destructive"
      });
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    await uploadImage(file, 'banner');
    setUploadingBanner(false);
  };

  const handleGroupImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingGroupImage(true);
    await uploadImage(file, 'group_image');
    setUploadingGroupImage(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Configurações do Grupo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Informações Básicas
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Grupo
                </label>
                <Input
                  value={groupData?.nome || ''}
                  onChange={(e) => setGroupData({ ...groupData, nome: e.target.value })}
                  placeholder="Nome do grupo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <Textarea
                  value={groupData?.descricao || ''}
                  onChange={(e) => setGroupData({ ...groupData, descricao: e.target.value })}
                  placeholder="Descrição do grupo"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grupo Privado
                </span>
                <Switch
                  checked={groupData?.is_private || false}
                  onCheckedChange={(checked) => setGroupData({ ...groupData, is_private: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visível para Todos
                </span>
                <Switch
                  checked={groupData?.is_visible_to_all || false}
                  onCheckedChange={(checked) => setGroupData({ ...groupData, is_visible_to_all: checked })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código Único
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={groupData?.codigo_unico || ''}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(groupData?.codigo_unico || '');
                      toast({
                        title: "Copiado!",
                        description: "Código copiado para a área de transferência"
                      });
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Aparência & Tema */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Aparência & Tema
              </h3>

              {/* Imagem de Capa/Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagem de Capa
                </label>
                <div className="space-y-3">
                  {groupData?.banner_url && (
                    <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={groupData.banner_url} 
                        alt="Capa Atual" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload">
                      <Button variant="outline" size="sm" disabled={uploadingBanner} asChild>
                        <span className="cursor-pointer">
                          {uploadingBanner ? 'Enviando...' : 'Escolher Imagem de Capa'}
                        </span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: 800x200px ou superior, formato JPG/PNG
                  </p>
                </div>
              </div>

              {/* Imagem do Grupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagem do Grupo
                </label>
                <div className="space-y-3">
                  {groupData?.group_image_url && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={groupData.group_image_url} 
                        alt="Imagem Atual" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGroupImageUpload}
                      className="hidden"
                      id="group-image-upload"
                    />
                    <label htmlFor="group-image-upload">
                      <Button variant="outline" size="sm" disabled={uploadingGroupImage} asChild>
                        <span className="cursor-pointer">
                          {uploadingGroupImage ? 'Enviando...' : 'Escolher Imagem do Grupo'}
                        </span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: formato quadrado, 200x200px ou superior, formato JPG/PNG
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSettingsModal;