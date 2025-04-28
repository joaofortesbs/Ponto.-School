
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  FolderPlus, 
  Pencil, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  FolderOpen, 
  X,
  Filter,
  Star,
  Clock,
  History,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Pasta {
  id: string;
  nome: string;
  cor: string;
}

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  pastaId: string;
  data: Date;
  modelo: string;
  favorito: boolean;
}

const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  // Estados
  const [pastas, setPastas] = useState<Pasta[]>([
    { id: "p1", nome: "História", cor: "#F5C542" },
    { id: "p2", nome: "Matemática", cor: "#42C5F5" },
    { id: "p3", nome: "Biologia", cor: "#4CAF50" },
    { id: "p4", nome: "Literatura", cor: "#9C27B0" },
    { id: "p5", nome: "Provas Finais", cor: "#F44336" },
  ]);
  
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([
    { 
      id: "a1", 
      titulo: "Revolução Francesa", 
      conteudo: "# Revolução Francesa\n\n## Contexto Histórico\nA Revolução Francesa (1789-1799) foi um período de mudança social e política radical na França que teve um impacto profundo na história moderna.\n\n## Causas Principais\n- Crise financeira do estado\n- Desigualdade social (sistema de estados)\n- Influência do Iluminismo\n- Exemplo da Revolução Americana\n\n## Eventos Importantes\n1. Queda da Bastilha (14 de julho de 1789)\n2. Declaração dos Direitos do Homem e do Cidadão\n3. Período do Terror\n4. Ascensão de Napoleão Bonaparte", 
      resumo: "Análise completa da Revolução Francesa, suas causas, eventos principais e consequências históricas.",
      pastaId: "p1",
      data: new Date("2023-10-15"),
      modelo: "Estudo Completo",
      favorito: true
    },
    { 
      id: "a2", 
      titulo: "Teorema de Pitágoras", 
      conteudo: "# Teorema de Pitágoras\n\n## Definição\nEm um triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.\n\n## Fórmula\na² = b² + c²\n\nOnde:\n- a é a hipotenusa\n- b e c são os catetos\n\n## Exemplos de Aplicação\n1. Triângulo 3-4-5\n   - 5² = 3² + 4²\n   - 25 = 9 + 16 ✓\n\n2. Triângulo 5-12-13\n   - 13² = 5² + 12²\n   - 169 = 25 + 144 ✓", 
      resumo: "Explicação detalhada do Teorema de Pitágoras, suas aplicações e exemplos práticos.",
      pastaId: "p2",
      data: new Date("2023-11-20"),
      modelo: "Revisão Rápida",
      favorito: false
    },
    { 
      id: "a3", 
      titulo: "Fotossíntese", 
      conteudo: "# Fotossíntese\n\n## O que é\nProcesso bioquímico realizado pelas plantas, algas e algumas bactérias para converter energia luminosa em energia química.\n\n## Equação Química\n6CO₂ + 6H₂O + Energia Luminosa → C₆H₁₂O₆ + 6O₂\n\n## Fases da Fotossíntese\n1. **Fase Clara (Fotoquímica)**\n   - Ocorre nas membranas dos tilacoides\n   - Depende diretamente da luz\n   - Produção de ATP e NADPH\n\n2. **Fase Escura (Ciclo de Calvin)**\n   - Ocorre no estroma dos cloroplastos\n   - Não depende diretamente da luz\n   - Utiliza o CO₂ para produzir glicose", 
      resumo: "Estudo detalhado sobre o processo de fotossíntese, suas fases e importância biológica.",
      pastaId: "p3",
      data: new Date("2023-12-05"),
      modelo: "Estudo Completo",
      favorito: true
    },
  ]);
  
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>("p1");
  const [anotacaoSelecionada, setAnotacaoSelecionada] = useState<string | null>("a1");
  const [pesquisa, setPesquisa] = useState("");
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [novaPasta, setNovaPasta] = useState({ nome: "", cor: "#42C5F5" });
  
  // Funções auxiliares
  const getAnotacoesDaPasta = () => {
    if (!pastaSelecionada) return [];
    return anotacoes.filter(a => a.pastaId === pastaSelecionada && 
      (pesquisa === "" || a.titulo.toLowerCase().includes(pesquisa.toLowerCase())));
  };
  
  const getAnotacaoSelecionada = () => {
    return anotacoes.find(a => a.id === anotacaoSelecionada);
  };
  
  const handleCriarPasta = () => {
    if (novaPasta.nome.trim() === "") return;
    
    const novaPastaObj: Pasta = {
      id: `p${pastas.length + 1}`,
      nome: novaPasta.nome,
      cor: novaPasta.cor
    };
    
    setPastas([...pastas, novaPastaObj]);
    setNovaPasta({ nome: "", cor: "#42C5F5" });
    setCriandoPasta(false);
    setPastaSelecionada(novaPastaObj.id);
  };
  
  const handleExcluirPasta = (id: string) => {
    const novasPastas = pastas.filter(p => p.id !== id);
    setPastas(novasPastas);
    
    if (pastaSelecionada === id) {
      setPastaSelecionada(novasPastas.length > 0 ? novasPastas[0].id : null);
    }
  };
  
  const handleFavoritar = (id: string) => {
    setAnotacoes(
      anotacoes.map(a => 
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1400px] h-[85vh] max-h-[85vh] bg-[#0D0D0D] text-white rounded-2xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="py-4 px-6 flex flex-row justify-between items-center border-b border-gray-800 bg-[#0D0D0D]">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">📚</span> Apostila Inteligente
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)} 
            className="rounded-full hover:bg-gray-800"
          >
            <X size={20} />
          </Button>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Barra Lateral Esquerda (Pastas) */}
          <div className="w-[250px] border-r border-gray-800 bg-[#0D0D0D] p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Minhas Pastas</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 hover:bg-gray-800 text-[#42C5F5]"
                onClick={() => setCriandoPasta(true)}
              >
                <FolderPlus size={18} />
              </Button>
            </div>
            
            {criandoPasta && (
              <div className="mb-4 bg-[#1A1A1A] p-3 rounded-xl animate-in fade-in slide-in-from-left duration-300">
                <Input 
                  placeholder="Nome da pasta" 
                  className="bg-[#1A1A1A] border-gray-700 mb-2"
                  value={novaPasta.nome}
                  onChange={(e) => setNovaPasta({...novaPasta, nome: e.target.value})}
                />
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    {["#42C5F5", "#F5C542", "#4CAF50", "#F44336", "#9C27B0"].map(cor => (
                      <button
                        key={cor}
                        className="w-5 h-5 rounded-full border border-gray-600"
                        style={{ backgroundColor: cor }}
                        onClick={() => setNovaPasta({...novaPasta, cor})}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 hover:bg-gray-700"
                      onClick={() => setCriandoPasta(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 px-3 bg-[#42C5F5] hover:bg-[#3BABDB] text-white"
                      onClick={handleCriarPasta}
                    >
                      Criar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-1">
                {pastas.map(pasta => (
                  <div 
                    key={pasta.id}
                    className={`px-3 py-2 rounded-lg flex items-center justify-between group cursor-pointer 
                    ${pastaSelecionada === pasta.id ? 'bg-[#1A1A1A] border border-[#42C5F5]/50' : 'hover:bg-[#1A1A1A]'}`}
                    onClick={() => setPastaSelecionada(pasta.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pasta.cor }}></div>
                      <span className="truncate">{pasta.nome}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-gray-700">
                        <Pencil size={14} />
                      </button>
                      <button 
                        className="p-1 rounded hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluirPasta(pasta.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Área Central (Lista de Anotações) */}
          <div className="w-[350px] border-r border-gray-800 bg-[#0D0D0D] p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Anotações</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 hover:bg-gray-800 text-[#42C5F5]"
              >
                <Plus size={18} />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Pesquisar anotações..." 
                className="pl-9 bg-[#1A1A1A] border-gray-700"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
              <div className="flex items-center gap-1">
                <Filter size={14} />
                <span>Filtrar por:</span>
              </div>
              <Tabs defaultValue="recentes" className="w-32 h-7">
                <TabsList className="h-7 bg-[#1A1A1A]">
                  <TabsTrigger value="recentes" className="h-6 text-xs px-2">Recentes</TabsTrigger>
                  <TabsTrigger value="az" className="h-6 text-xs px-2">A-Z</TabsTrigger>
                  <TabsTrigger value="modelo" className="h-6 text-xs px-2">Modelo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-2">
                {getAnotacoesDaPasta().map(anotacao => (
                  <div 
                    key={anotacao.id}
                    className={`p-3 rounded-lg bg-[#1A1A1A] cursor-pointer group
                      ${anotacaoSelecionada === anotacao.id ? 'ring-1 ring-[#42C5F5]' : 'hover:bg-[#222222]'}
                      transition-all duration-200 ease-in-out transform hover:-translate-y-0.5`}
                    onClick={() => setAnotacaoSelecionada(anotacao.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white truncate">{anotacao.titulo}</h4>
                      <div className="flex gap-0.5">
                        <button 
                          className="p-1 rounded hover:bg-gray-700 text-amber-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoritar(anotacao.id);
                          }}
                        >
                          <Star size={13} fill={anotacao.favorito ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{anotacao.resumo}</p>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock size={12} />
                        {anotacao.data.toLocaleDateString()}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: anotacao.modelo === "Estudo Completo" ? "#42C5F5/20" : "#9C27B0/20",
                          color: anotacao.modelo === "Estudo Completo" ? "#42C5F5" : "#D39EE2"
                        }}
                      >
                        {anotacao.modelo}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-700 text-gray-300">
                        <Eye size={14} className="mr-1"/> Ver
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-700 text-gray-300">
                        <Pencil size={14} className="mr-1"/> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-700 text-gray-300">
                        <Trash2 size={14} className="mr-1"/> Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Área Direita (Visualização e Ações) */}
          <div className="flex-1 bg-[#0D0D0D] p-4 flex flex-col gap-4">
            {anotacaoSelecionada && getAnotacaoSelecionada() ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">{getAnotacaoSelecionada()?.titulo}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent border-gray-700 hover:bg-gray-800">
                      <Pencil size={14} /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent border-gray-700 hover:bg-gray-800">
                      <ArrowRight size={14} /> Mover
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent border-gray-700 hover:bg-gray-800">
                      <Download size={14} /> Baixar
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent border-gray-700 hover:bg-gray-800">
                      <Share2 size={14} /> Compartilhar
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <FolderOpen size={14} className="text-gray-400" />
                    <span className="text-gray-400">
                      {pastas.find(p => p.id === getAnotacaoSelecionada()?.pastaId)?.nome}
                    </span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-gray-400">
                      {getAnotacaoSelecionada()?.data.toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-1">
                    <History size={14} className="text-gray-400" />
                    <span className="text-gray-400">3 versões</span>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 bg-[#1A1A1A] rounded-xl p-6 custom-scrollbar">
                  <div className="max-w-3xl mx-auto prose prose-invert">
                    {getAnotacaoSelecionada()?.conteudo.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
                      } else if (line.startsWith('- ')) {
                        return <li key={i} className="ml-5 my-1">{line.substring(2)}</li>;
                      } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                        return <li key={i} className="ml-5 my-1 list-decimal">{line.substring(3)}</li>;
                      } else if (line === '') {
                        return <p key={i}>&nbsp;</p>;
                      } else {
                        return <p key={i} className="my-2">{line}</p>;
                      }
                    })}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-7xl mb-4">📝</div>
                <h3 className="text-xl font-medium mb-2">Nenhuma anotação selecionada</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Selecione uma anotação da lista para visualizar seu conteúdo ou crie uma nova anotação.
                </p>
                <Button className="mt-6 bg-[#42C5F5] hover:bg-[#3BABDB]">
                  <Plus size={16} className="mr-2" /> Criar Nova Anotação
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApostilaInteligenteModal;
