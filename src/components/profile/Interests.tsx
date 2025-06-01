
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Sparkles } from "lucide-react";
import AddInterestsModal from "./modals/AddInterestsModal";
import { ProfileDataService, UserInterest } from "@/services/profileDataService";
import { useToast } from "@/components/ui/toast";

interface InterestsProps {
  isOwnProfile?: boolean;
}

export default function Interests({ isOwnProfile = true }: InterestsProps) {
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Carregar interesses ao montar o componente
  useEffect(() => {
    const loadInterests = async () => {
      try {
        setIsLoading(true);
        const data = await ProfileDataService.getUserInterests();
        setInterests(data);
      } catch (error) {
        console.error('Erro ao carregar interesses:', error);
        showToast('Erro ao carregar interesses', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOwnProfile) {
      loadInterests();
    }
  }, [isOwnProfile, showToast]);

  const handleSaveInterests = async (newInterests: UserInterest[]) => {
    try {
      // Encontrar quais interesses foram adicionados
      const currentInterestNames = interests.map(i => i.name);
      const interestsToAdd = newInterests.filter(i => !currentInterestNames.includes(i.name));
      
      // Adicionar cada novo interesse
      for (const interest of interestsToAdd) {
        const result = await ProfileDataService.addUserInterest(interest);
        if (!result.success) {
          showToast(result.message, 'error');
          return;
        }
      }

      if (interestsToAdd.length > 0) {
        showToast(`${interestsToAdd.length} interesse(s) adicionado(s) com sucesso!`, 'success');
        // Recarregar interesses
        const data = await ProfileDataService.getUserInterests();
        setInterests(data);
      }
    } catch (error) {
      console.error('Erro ao salvar interesses:', error);
      showToast('Erro ao salvar interesses', 'error');
    }
  };

  const handleRemoveInterest = async (id: string) => {
    try {
      const result = await ProfileDataService.removeUserInterest(id);
      
      if (result.success) {
        showToast(result.message, 'success');
        setInterests(interests.filter(interest => interest.id !== id));
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao remover interesse:', error);
      showToast('Erro ao remover interesse', 'error');
    }
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
  }, {} as Record<string, UserInterest[]>);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Interesses
          </h3>
          {interests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {interests.length}
            </Badge>
          )}
        </div>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {interests.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-[#64748B] dark:text-white/60 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                {category} ({categoryInterests.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryInterests.map((interest) => (
                  <Badge
                    key={interest.id}
                    className={`${getCategoryColor(interest.category)} transition-all hover:scale-105 cursor-default group relative`}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {interest.name}
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInterest(interest.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 h-4 w-4 p-0 text-red-500 hover:text-red-700 bg-white rounded-full border border-red-300"
                      >
                        ×
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mais Interesses
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <p className="text-[#64748B] dark:text-white/60 mb-3">
            {isOwnProfile 
              ? "Compartilhe seus interesses para conectar-se com pessoas que têm gostos similares"
              : "Este usuário ainda não adicionou interesses."
            }
          </p>
          {isOwnProfile && (
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Interesses
            </Button>
          )}
        </div>
      )}

      {isOwnProfile && (
        <AddInterestsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveInterests}
          existingInterests={interests}
        />
      )}
    </div>
  );
}
