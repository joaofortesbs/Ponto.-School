import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, BookOpen, Folder, Plus, Tag, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase'; // Importing from correct path

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (data: {
    titulo: string;
    conteudo: string;
    pastaId: string;
    tags: string[];
    modelo: string;
  }) => Promise<void>;
  initialTitle: string;
  initialContent: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  onExport,
  initialTitle,
  initialContent
}) => {
  // Estado para armazenar as pastas da Apostila Inteligente
  const [pastas, setPastas] = useState<{id: string; nome: string; cor: string}[]>([
    { id: "p1", nome: "História", cor: "#F5C542" },
    { id: "p2", nome: "Matemática", cor: "#42C5F5" },
    { id: "p3", nome: "Biologia", cor: "#4CAF50" },
    { id: "p4", nome: "Literatura", cor: "#9C27B0" },
    { id: "p5", nome: "Provas Finais", cor: "#F44336" },
  ]);

  // Estado para controlar os dados do formulário
  const [titulo, setTitulo] = useState(initialTitle || "");
  const [pastaId, setPastaId] = useState<string>("");
  const [novaPasta, setNovaPasta] = useState({ nome: "", cor: "#42C5F5" });
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [modelo, setModelo] = useState<string>("estudo geral");

  // Preencher os dados iniciais quando o modal abrir
  useEffect(() => {
    if (open) {
      setTitulo(initialTitle);
      // Se tiver tags na anotação original, adicioná-las aqui
    }
  }, [open, initialTitle]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCriarPasta = () => {
    if (!novaPasta.nome.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, forneça um nome para a pasta.",
        variant: "destructive"
      });
      return;
    }

    const newPasta = {
      id: `p${pastas.length + 1}`,
      nome: novaPasta.nome.trim(),
      cor: novaPasta.cor,
    };

    setPastas([...pastas, newPasta]);
    setPastaId(newPasta.id);
    setCriandoPasta(false);
    setNovaPasta({ nome: "", cor: "#42C5F5" });

    toast({
      title: "Pasta criada!",
      description: `A pasta "${newPasta.nome}" foi criada com sucesso.`,
    });
  };

  const handleExportClick = async () => {
    if (!titulo.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, adicione um título para a anotação.",
        variant: "destructive"
      });
      return;
    }

    if (!pastaId) {
      toast({
        title: "Pasta não selecionada",
        description: "Por favor, selecione ou crie uma pasta para salvar sua anotação.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      let finalPastaId = pastaId;

      // Se estiver criando nova pasta, criá-la primeiro
      if (criandoPasta && novaPasta.nome.trim()) {
        const userId = localStorage.getItem('user_id') || 'anonymous';

        // Criar nova pasta no Supabase
        const { data: pastaCriada, error: pastaError } = await supabase
          .from('apostila_pastas')
          .insert([
            {
              user_id: userId,
              nome: novaPasta.nome,
              cor: novaPasta.cor,
              descricao: ""
            }
          ])
          .select()
          .single();

        if (pastaError) {
          console.error('Erro ao criar pasta:', pastaError);
          throw new Error(`Erro ao criar pasta: ${pastaError.message}`);
        }

        finalPastaId = pastaCriada.id;

        // Registrar criação de pasta
        const { error: logError } = await supabase
          .from('user_activity_logs')
          .insert([
            {
              user_id: userId,
              acao: 'criou pasta',
              detalhes: `Criou pasta "${novaPasta.nome}" durante exportação`
            }
          ]);
          
        if (logError) {
          console.warn('Erro ao registrar log:', logError);
          // Não interromper o fluxo por erro de log
        }
      }

      // Verifica se o conteúdo está definido
      if (!initialContent) {
        throw new Error('Conteúdo da anotação está vazio');
      }

      await onExport({
        titulo,
        conteudo: initialContent,
        pastaId: finalPastaId,
        tags,
        modelo
      });
      
      toast({
        title: "Exportação concluída!",
        description: "Sua anotação foi exportada para a Apostila Inteligente com sucesso.",
      });
      
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar para a Apostila Inteligente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#121826] rounded-xl border-0 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-blue-100 dark:border-blue-900/30 bg-gradient-to-r from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 backdrop-blur-sm flex flex-row items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-700/30 rounded-full p-2 mr-3">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-medium text-blue-800 dark:text-blue-300">
              Exportar para Apostila Inteligente
            </DialogTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-700 hover:text-red-600 hover:bg-red-50 dark:text-blue-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 ml-1 transition-all duration-300"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 max-h-[70vh] overflow-y-auto bg-gradient-to-b from-blue-50/50 to-blue-100/30 dark:from-blue-900/10 dark:to-[#1a1f2c]/95">
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo" className="block mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                Título da Anotação
              </Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-white/80 dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800/50 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                placeholder="Digite um título descritivo..."
              />
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                Selecione uma Pasta
              </Label>
              {criandoPasta ? (
                <div className="border border-blue-200 dark:border-blue-800/50 rounded-md p-3 bg-white/80 dark:bg-gray-800/80 mb-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Nova Pasta</h4>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={novaPasta.nome}
                      onChange={(e) => setNovaPasta({...novaPasta, nome: e.target.value})}
                      className="flex-1 bg-white dark:bg-gray-800"
                      placeholder="Nome da pasta..."
                    />
                    <Input
                      type="color"
                      value={novaPasta.cor}
                      onChange={(e) => setNovaPasta({...novaPasta, cor: e.target.value})}
                      className="w-16 p-1 h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-200 text-blue-700 dark:border-blue-800/50 dark:text-blue-400"
                      onClick={() => setCriandoPasta(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCriarPasta}
                    >
                      <Check className="h-4 w-4 mr-1" /> Criar Pasta
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {pastas.map((pasta) => (
                      <div
                        key={pasta.id}
                        onClick={() => setPastaId(pasta.id)}
                        className={`flex items-center border p-2 rounded-md cursor-pointer transition-all ${
                          pasta.id === pastaId 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' 
                            : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-700'
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: pasta.cor }}
                        />
                        <span className="truncate text-sm">
                          {pasta.nome}
                        </span>
                      </div>
                    ))}
                    <div
                      onClick={() => setCriandoPasta(true)}
                      className="flex items-center justify-center border border-dashed border-blue-300 dark:border-blue-700 p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      <Plus className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-1" />
                      <span className="text-sm text-blue-500 dark:text-blue-400">Nova Pasta</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                Tags (opcional)
              </Label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 bg-white/80 dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800/50"
                  placeholder="Adicione tags para organizar..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-200 text-blue-700 dark:border-blue-800/50 dark:text-blue-400"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div 
                      key={tag} 
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                      <button 
                        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                Modelo da Anotação
              </Label>
              <select
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full bg-white/80 dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800/50 rounded-md p-2"
              >
                <option value="estudo geral">Estudo Geral</option>
                <option value="estudo completo">Estudo Completo</option>
                <option value="mapa conceitual">Mapa Conceitual</option>
                <option value="revisão rápida">Revisão Rápida</option>
                <option value="fichamento">Fichamento</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-800/30">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Prévia da Anotação</h4>
              <div className="max-h-28 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white/50 dark:bg-gray-800/50 p-2 rounded border border-blue-100 dark:border-blue-800/30">
                {initialContent.substring(0, 300)}{initialContent.length > 300 ? '...' : ''}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-blue-100 dark:border-blue-900/30 bg-gradient-to-r from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
          <Button 
            variant="outline" 
            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleExportClick}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Exportar para Apostila
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, BookOpen, Folder, Tag, Save } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (data: {
    titulo: string;
    conteudo: string;
    pastaId: string;
    tags: string[];
    modelo: string;
  }) => void;
  initialTitle: string;
  initialContent: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  onExport,
  initialTitle,
  initialContent,
}) => {
  const [titulo, setTitulo] = useState(initialTitle || '');
  const [conteudo] = useState(initialContent || '');
  const [pastaId, setPastaId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [pastas, setPastas] = useState<{ id: string; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelo, setModelo] = useState('padrão');

  // Carregar pastas do usuário ao abrir o modal
  useEffect(() => {
    if (open) {
      loadPastas();
    }
  }, [open]);

  // Carregar pastas do Supabase
  const loadPastas = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar seu usuário. Tente fazer login novamente.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('apostila_pastas')
        .select('id, nome')
        .eq('user_id', userId)
        .order('nome');
        
      if (error) {
        console.error('Erro ao carregar pastas:', error);
        toast({
          title: "Erro ao carregar pastas",
          description: "Não foi possível carregar suas pastas. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        setPastas(data || []);
        
        // Se tiver pelo menos uma pasta, seleciona a primeira por padrão
        if (data && data.length > 0) {
          setPastaId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar pastas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, adicione um título para sua anotação.",
        variant: "destructive",
      });
      return;
    }

    if (!pastaId) {
      toast({
        title: "Selecione uma pasta",
        description: "Por favor, selecione uma pasta para exportar a anotação.",
        variant: "destructive",
      });
      return;
    }

    onExport({
      titulo,
      conteudo,
      pastaId,
      tags,
      modelo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#121826] rounded-xl shadow-2xl border-0">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-3">
              <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-medium">
              Exportar para Apostila Inteligente
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium mb-1">
              Título da Anotação
            </label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Adicione um título descritivo"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="pasta" className="block text-sm font-medium mb-1">
              Pasta de Destino
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="pasta"
                  value={pastaId}
                  onChange={(e) => setPastaId(e.target.value)}
                  className="w-full pl-10 h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1f2c] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {pastas.length === 0 ? (
                    <option value="">Nenhuma pasta encontrada</option>
                  ) : (
                    pastas.map((pasta) => (
                      <option key={pasta.id} value={pasta.id}>{pasta.nome}</option>
                    ))
                  )}
                </select>
              </div>
              {/* Botão para criar nova pasta - implementação futura */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "Criar nova pasta estará disponível em breve.",
                })}
              >
                Nova Pasta
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags (opcional)
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Adicione tags e pressione Enter"
                  className="w-full pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddTag}
              >
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div 
                    key={tag} 
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full flex items-center"
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="modelo" className="block text-sm font-medium mb-1">
              Modelo de Anotação
            </label>
            <select
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1f2c] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="padrão">Padrão</option>
              <option value="estudo">Estudo Completo</option>
              <option value="mapa-conceitual">Mapa Conceitual</option>
              <option value="revisão">Revisão Rápida</option>
              <option value="fichamento">Fichamento</option>
            </select>
          </div>

          <div className="pt-2">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/20">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Prévia de Conteúdo</h4>
              <div className="max-h-24 overflow-y-auto text-sm text-gray-600 dark:text-gray-300">
                {conteudo.slice(0, 150)}...
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {conteudo.length} caracteres | {conteudo.split(/\s+/).filter(word => word.length > 0).length} palavras
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" /> Exportar para Apostila
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
