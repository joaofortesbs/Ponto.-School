
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Plus, FolderPlus, Tag, Save, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ExportarParaApostilaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anotacaoContent: string;
  anotacaoTitulo: string;
  anotacaoModelo: string;
  onExport: (data: {
    titulo: string;
    conteudo: string;
    pastaId: string;
    tags: string[];
    modelo: string;
  }) => Promise<void>;
}

const ExportarParaApostilaModal: React.FC<ExportarParaApostilaModalProps> = ({
  open,
  onOpenChange,
  anotacaoContent,
  anotacaoTitulo,
  anotacaoModelo,
  onExport
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
  const [titulo, setTitulo] = useState(anotacaoTitulo || "");
  const [pastaId, setPastaId] = useState<string>("");
  const [novaPasta, setNovaPasta] = useState({ nome: "", cor: "#42C5F5" });
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Preencher os dados iniciais quando o modal abrir
  useEffect(() => {
    if (open) {
      setTitulo(anotacaoTitulo);
      // Se tiver tags na anotação original, adicioná-las aqui
    }
  }, [open, anotacaoTitulo]);
  
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
    if (novaPasta.nome.trim()) {
      const novaPastaObj = {
        id: `p${pastas.length + 1}`,
        nome: novaPasta.nome,
        cor: novaPasta.cor
      };
      
      setPastas([...pastas, novaPastaObj]);
      setPastaId(novaPastaObj.id);
      setCriandoPasta(false);
      setNovaPasta({ nome: "", cor: "#42C5F5" });
    }
  };
  
  const handleExport = async () => {
    if (!titulo.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, adicione um título para sua anotação.",
        variant: "destructive"
      });
      return;
    }
    
    if (!pastaId) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione uma pasta para salvar sua anotação.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Validar e garantir que os dados estejam no formato correto
      const conteudoValidado = typeof anotacaoContent === 'string' ? anotacaoContent : '';
      const tituloValidado = titulo.trim().substring(0, 255); // Limitar tamanho do título
      const tagsValidadas = Array.isArray(tags) ? tags : [];
      const modeloValidado = anotacaoModelo || 'Estudo Completo';
      
      console.log("Iniciando exportação de anotação:", {
        titulo: tituloValidado,
        tamanhoConteudo: conteudoValidado.length,
        pastaId,
        tags: tagsValidadas,
        modelo: modeloValidado
      });
      
      await onExport({
        titulo: tituloValidado,
        conteudo: conteudoValidado,
        pastaId,
        tags: tagsValidadas,
        modelo: modeloValidado
      });
      
      toast({
        title: "Sucesso!",
        description: "Anotação exportada com sucesso para a Apostila Inteligente.",
      });
      
      console.log("Exportação concluída com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao exportar anotação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar a anotação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] bg-[#0D0D0D] text-white border-gray-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#42C5F5] to-[#0A84FF] w-8 h-8 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            Exportar para Apostila Inteligente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da anotação</Label>
            <Input
              id="titulo"
              placeholder="Digite um título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="bg-[#151515] border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Escolha uma pasta</Label>
            {criandoPasta ? (
              <div className="bg-[#151515] p-3 rounded-lg border border-gray-700 space-y-3 animate-in fade-in-50 slide-in-from-left duration-200">
                <Input
                  placeholder="Nome da pasta..."
                  value={novaPasta.nome}
                  onChange={(e) => setNovaPasta({...novaPasta, nome: e.target.value})}
                  className="bg-[#1A1A1A] border-gray-700"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-normal text-gray-400">Cor:</Label>
                  <div className="flex gap-1">
                    {["#42C5F5", "#F5C542", "#4CAF50", "#F44336", "#9C27B0", "#FF9800"].map(cor => (
                      <button
                        key={cor}
                        className={`w-5 h-5 rounded-full ${novaPasta.cor === cor ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setNovaPasta({...novaPasta, cor})}
                      />
                    ))}
                  </div>
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCriandoPasta(false)}
                      className="h-7 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCriarPasta}
                      className="h-7 bg-[#42C5F5] hover:bg-[#3BABDB]"
                    >
                      Criar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[180px] border border-gray-700 rounded-lg bg-[#151515] p-1">
                  <div className="p-2 grid grid-cols-1 gap-2">
                    {pastas.map(pasta => (
                      <button
                        key={pasta.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pastaId === pasta.id 
                            ? 'bg-[#1A1A1A] border-l-4 pl-2' 
                            : 'hover:bg-[#1A1A1A] border-l-4 border-transparent pl-2'
                        }`}
                        style={{
                          borderLeftColor: pastaId === pasta.id ? pasta.cor : 'transparent'
                        }}
                        onClick={() => setPastaId(pasta.id)}
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: pasta.cor }}
                        />
                        <span className="text-sm">{pasta.nome}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-dashed border-gray-600 hover:border-[#42C5F5] hover:bg-[#151515] text-gray-400 hover:text-[#42C5F5]"
                  onClick={() => setCriandoPasta(true)}
                >
                  <FolderPlus size={16} className="mr-2" />
                  Criar nova pasta
                </Button>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Adicionar tags (opcional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="bg-[#151515] border-gray-700 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
                className="bg-[#1A1A1A] hover:bg-[#222222]"
              >
                <Plus size={16} className="mr-1" /> Adicionar
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag} 
                    className="bg-[#1A1A1A] hover:bg-[#222222] text-white flex items-center gap-1 px-2 py-1"
                  >
                    <Tag size={12} />
                    {tag}
                    <button 
                      className="ml-1 hover:bg-gray-700 rounded-full p-0.5"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Prévia do conteúdo</Label>
            <div className="bg-[#151515] border border-gray-700 rounded-lg p-3 max-h-[150px] overflow-y-auto text-sm text-gray-300">
              {anotacaoContent.slice(0, 300)}
              {anotacaoContent.length > 300 && '...'}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 hover:bg-[#151515] hover:text-white"
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-[#42C5F5] to-[#0A84FF] hover:from-[#3BABDB] hover:to-[#0972DB]"
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </div>
            ) : (
              <>
                <Save size={16} className="mr-2" /> Salvar na Apostila
              </>
            )}
          </Button>
        </DialogFooter>
      </Dconst handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleExport = async () => {
    if (!titulo || !pastaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e selecione uma pasta",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      await onExport({
        titulo,
        conteudo: anotacaoContent,
        pastaId,
        tags,
        modelo: anotacaoModelo
      });
      
      onOpenChange(false);
      
      toast({
        title: "Anotação exportada!",
        description: "Sua anotação foi adicionada à Apostila Inteligente com sucesso",
      });
      
    } catch (error) {
      console.error("Erro ao exportar anotação:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar sua anotação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6">
          <div className="mb-4">
            <Label htmlFor="titulo" className="mb-1.5 block text-gray-700 dark:text-gray-300">Título da anotação</Label>
            <Input 
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full"
              placeholder="Digite um título para sua anotação"
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="pasta" className="mb-1.5 block text-gray-700 dark:text-gray-300">Selecione uma pasta</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              {pastas.map(pasta => (
                <div
                  key={pasta.id}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                    pastaId === pasta.id
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'border-gray-200 hover:border-blue-200 dark:border-gray-700 dark:hover:border-blue-700'
                  }`}
                  onClick={() => setPastaId(pasta.id)}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: pasta.cor }}
                  />
                  <span className="flex-1 text-sm">{pasta.nome}</span>
                </div>
              ))}
            </div>
            
            {criandoPasta ? (
              <div className="mt-2 p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center mb-2">
                  <Label htmlFor="novaPasta" className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                    Nova pasta:
                  </Label>
                  <Input 
                    id="novaPasta"
                    value={novaPasta.nome}
                    onChange={(e) => setNovaPasta({...novaPasta, nome: e.target.value})}
                    className="flex-1 h-8 text-sm"
                    placeholder="Nome da pasta"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {["#42C5F5", "#F5C542", "#4CAF50", "#F44336", "#9C27B0"].map(cor => (
                      <button
                        key={cor}
                        className={`w-4 h-4 rounded-full ${novaPasta.cor === cor ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setNovaPasta({...novaPasta, cor})}
                        type="button"
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCriandoPasta(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        // Simular a criação de pasta (em produção, chamar a API)
                        const novaPastaObj = {
                          id: `nova-${Date.now()}`,
                          nome: novaPasta.nome || "Nova Pasta",
                          cor: novaPasta.cor
                        };
                        setPastas([...pastas, novaPastaObj]);
                        setPastaId(novaPastaObj.id);
                        setCriandoPasta(false);
                        setNovaPasta({ nome: "", cor: "#42C5F5" });
                      }}
                    >
                      Criar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => setCriandoPasta(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Criar nova pasta
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            <Label className="mb-1.5 block text-gray-700 dark:text-gray-300">Tags (opcional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 rounded-full ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1"
                placeholder="Adicionar tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Adicionar
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || !titulo || !pastaId}
              className="gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              {isExporting ? "Exportando..." : "Exportar para Apostila"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportarParaApostilaModal;rt default ExportarParaApostilaModal;
