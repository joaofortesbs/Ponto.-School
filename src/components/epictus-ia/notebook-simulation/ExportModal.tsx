
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, BookOpen, Folder, Plus, Tag, Check } from 'lucide-react';
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
      await onExport({
        titulo,
        conteudo: initialContent,
        pastaId,
        tags,
        modelo
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um problema ao exportar sua anotação.",
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
