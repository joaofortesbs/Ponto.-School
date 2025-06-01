
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, X, Save, Search, Sparkles } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface AddInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: Interest[]) => void;
  existingInterests?: Interest[];
}

export default function AddInterestsModal({ isOpen, onClose, onSave, existingInterests = [] }: AddInterestsModalProps) {
  const [interests, setInterests] = useState<Interest[]>(existingInterests);
  const [newInterestName, setNewInterestName] = useState("");
  const [newInterestCategory, setNewInterestCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "Tecnologia",
    "Esportes",
    "Arte & Cultura",
    "Música",
    "Cinema & TV",
    "Literatura",
    "Culinária",
    "Viagens",
    "Natureza",
    "Jogos",
    "Educação",
    "Ciência",
    "Empreendedorismo",
    "Fotografia",
    "Moda",
    "Saúde & Bem-estar",
    "Carros",
    "Animais",
    "História",
    "Filosofia",
    "Outros"
  ];

  const commonInterests = [
    // Tecnologia
    { name: "Programação", category: "Tecnologia" },
    { name: "Inteligência Artificial", category: "Tecnologia" },
    { name: "Jogos de Video Game", category: "Tecnologia" },
    { name: "Robótica", category: "Tecnologia" },
    { name: "Criptomoedas", category: "Tecnologia" },
    
    // Esportes
    { name: "Futebol", category: "Esportes" },
    { name: "Basquete", category: "Esportes" },
    { name: "Natação", category: "Esportes" },
    { name: "Corrida", category: "Esportes" },
    { name: "Academia", category: "Esportes" },
    { name: "Yoga", category: "Esportes" },
    
    // Arte & Cultura
    { name: "Pintura", category: "Arte & Cultura" },
    { name: "Desenho", category: "Arte & Cultura" },
    { name: "Teatro", category: "Arte & Cultura" },
    { name: "Dança", category: "Arte & Cultura" },
    { name: "Museus", category: "Arte & Cultura" },
    
    // Música
    { name: "Violão", category: "Música" },
    { name: "Piano", category: "Música" },
    { name: "Rock", category: "Música" },
    { name: "Jazz", category: "Música" },
    { name: "MPB", category: "Música" },
    { name: "Eletrônica", category: "Música" },
    
    // Cinema & TV
    { name: "Filmes de Ação", category: "Cinema & TV" },
    { name: "Documentários", category: "Cinema & TV" },
    { name: "Séries", category: "Cinema & TV" },
    { name: "Anime", category: "Cinema & TV" },
    { name: "Cinema Nacional", category: "Cinema & TV" },
    
    // Literatura
    { name: "Ficção Científica", category: "Literatura" },
    { name: "Romance", category: "Literatura" },
    { name: "Biografia", category: "Literatura" },
    { name: "Poesia", category: "Literatura" },
    { name: "Quadrinhos", category: "Literatura" },
    
    // Culinária
    { name: "Cozinhar", category: "Culinária" },
    { name: "Gastronomia", category: "Culinária" },
    { name: "Vinhos", category: "Culinária" },
    { name: "Café", category: "Culinária" },
    { name: "Doces", category: "Culinária" },
    
    // Viagens
    { name: "Backpacking", category: "Viagens" },
    { name: "Turismo Cultural", category: "Viagens" },
    { name: "Ecoturismo", category: "Viagens" },
    { name: "Fotografia de Viagem", category: "Viagens" },
    
    // Natureza
    { name: "Trilhas", category: "Natureza" },
    { name: "Camping", category: "Natureza" },
    { name: "Jardinagem", category: "Natureza" },
    { name: "Observação de Aves", category: "Natureza" },
    { name: "Astronomia", category: "Natureza" },
    
    // Outros
    { name: "Meditação", category: "Saúde & Bem-estar" },
    { name: "Psicologia", category: "Ciência" },
    { name: "Sustentabilidade", category: "Natureza" },
    { name: "Investimentos", category: "Empreendedorismo" },
    { name: "Idiomas", category: "Educação" }
  ];

  const filteredCommonInterests = commonInterests.filter(interest =>
    interest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !interests.some(existingInterest => existingInterest.name.toLowerCase() === interest.name.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      "Tecnologia": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "Esportes": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "Arte & Cultura": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "Música": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      "Cinema & TV": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      "Literatura": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      "Culinária": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "Viagens": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      "Natureza": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      "Jogos": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const addInterest = (name: string, category: string) => {
    if (!name.trim()) return;
    
    const newInterest: Interest = {
      id: Date.now().toString() + Math.random(),
      name: name.trim(),
      category: category || "Outros"
    };
    
    setInterests([...interests, newInterest]);
    setNewInterestName("");
    setNewInterestCategory("");
  };

  const removeInterest = (id: string) => {
    setInterests(interests.filter(interest => interest.id !== id));
  };

  const handleSave = () => {
    onSave(interests);
    onClose();
  };

  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-[#29335C] dark:text-white">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-[#FF6B00]" />
            </div>
            Gerenciar Interesses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New Interest */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-xl">
            <h3 className="font-medium text-[#29335C] dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FF6B00]" />
              Adicionar Novo Interesse
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Nome do Interesse</Label>
                <Input
                  value={newInterestName}
                  onChange={(e) => setNewInterestName(e.target.value)}
                  placeholder="Ex: Fotografia, Culinária, Programação..."
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest(newInterestName, newInterestCategory)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#29335C] dark:text-white font-medium">Categoria</Label>
                <Select value={newInterestCategory} onValueChange={setNewInterestCategory}>
                  <SelectTrigger className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => addInterest(newInterestName, newInterestCategory)}
              disabled={!newInterestName.trim()}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Interesse
            </Button>
          </div>

          {/* Common Interests Quick Add */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#29335C] dark:text-white">Interesses Populares</h3>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar interesses..."
                  className="pl-10 border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {filteredCommonInterests.map((interest) => (
                <Button
                  key={interest.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addInterest(interest.name, interest.category)}
                  className="justify-start border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] text-left h-auto p-2"
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex items-center gap-1">
                      <Plus className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate text-xs font-medium">{interest.name}</span>
                    </div>
                    <span className="text-xs text-[#64748B] dark:text-white/60 truncate">
                      {interest.category}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Current Interests */}
          {interests.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#29335C] dark:text-white">
                Seus Interesses ({interests.length})
              </h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-[#64748B] dark:text-white/60 flex items-center gap-2">
                      <Heart className="h-3 w-3" />
                      {category} ({categoryInterests.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryInterests.map((interest) => (
                        <div
                          key={interest.id}
                          className="flex items-center gap-1 p-2 bg-white dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10 group hover:border-[#FF6B00] transition-colors"
                        >
                          <Badge className={getCategoryColor(interest.category)}>
                            {interest.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInterest(interest.id)}
                            className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:border-[#29335C] hover:text-[#29335C]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Interesses ({interests.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
