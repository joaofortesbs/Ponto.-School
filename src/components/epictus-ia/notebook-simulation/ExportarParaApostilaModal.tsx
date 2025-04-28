
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
      </DialogContent>
    </Dialog>
  );
};

export default ExportarParaApostilaModal;
