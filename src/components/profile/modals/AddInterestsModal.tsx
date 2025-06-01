
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Heart, Sparkles } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface AddInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: Interest[]) => void;
  existingInterests: Interest[];
}

export default function AddInterestsModal({ isOpen, onClose, onSave, existingInterests }: AddInterestsModalProps) {
  const [interests, setInterests] = useState<Interest[]>(existingInterests);
  const [newInterest, setNewInterest] = useState({
    name: '',
    category: ''
  });

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
    "Saúde & Bem-estar"
  ];

  const handleAddInterest = () => {
    if (!newInterest.name.trim() || !newInterest.category) return;

    const interest: Interest = {
      id: Date.now().toString(),
      name: newInterest.name.trim(),
      category: newInterest.category
    };

    setInterests([...interests, interest]);
    setNewInterest({ name: '', category: '' });
  };

  const handleRemoveInterest = (interestId: string) => {
    setInterests(interests.filter(interest => interest.id !== interestId));
  };

  const handleSave = () => {
    onSave(interests);
    onClose();
  };

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
      "Educação": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
      "Ciência": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      "Empreendedorismo": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
      "Saúde & Bem-estar": "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
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
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#0A2540] border-0 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-[#E0E1DD] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white">
                Gerenciar Interesses
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-[#E0E1DD] dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-6 py-6">
          {/* Formulário para adicionar novo interesse */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <h3 className="text-sm font-medium text-[#29335C] dark:text-white">
              Adicionar Novo Interesse
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestName" className="text-xs font-medium text-[#64748B] dark:text-white/60">
                  Nome do Interesse
                </Label>
                <Input
                  id="interestName"
                  value={newInterest.name}
                  onChange={(e) => setNewInterest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Inteligência Artificial, Futebol"
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interestCategory" className="text-xs font-medium text-[#64748B] dark:text-white/60">
                  Categoria
                </Label>
                <Select value={newInterest.category} onValueChange={(value) => setNewInterest(prev => ({ ...prev, category: value }))}>
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
              onClick={handleAddInterest}
              disabled={!newInterest.name.trim() || !newInterest.category}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Heart className="h-4 w-4 mr-2" />
              Adicionar Interesse
            </Button>
          </div>

          {/* Lista de interesses agrupados por categoria */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-medium text-[#29335C] dark:text-white mb-4">
              Seus Interesses ({interests.length})
            </h3>
            
            {interests.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-[#64748B] dark:text-white/60 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      {category} ({categoryInterests.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryInterests.map((interest) => (
                        <div
                          key={interest.id}
                          className={`${getCategoryColor(interest.category)} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 transition-all hover:scale-105`}
                        >
                          <Heart className="h-3 w-3" />
                          <span>{interest.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveInterest(interest.id)}
                            className="h-4 w-4 p-0 text-current hover:text-red-600 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#E0E1DD] dark:border-white/10 rounded-2xl">
                <Heart className="h-12 w-12 text-[#64748B] dark:text-white/40 mx-auto mb-3" />
                <p className="text-[#64748B] dark:text-white/60 text-sm">
                  Nenhum interesse adicionado ainda
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            Salvar Interesses
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
