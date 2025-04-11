
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutMe from "@/components/profile/AboutMe";
import ContactInfo from "@/components/profile/ContactInfo";
import Education from "@/components/profile/Education";
import Skills from "@/components/profile/Skills";
import Interests from "@/components/profile/Interests";
import type { UserProfile } from "@/types/user-profile";
import { profileService } from "@/services/profileService";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Tenta buscar o perfil do usuário
        const profile = await profileService.getUserProfile();
        
        // Se o perfil existir, define-o no estado
        if (profile) {
          setUserProfile({
            ...profile,
            // Garantir que os campos essenciais estejam definidos
            id: profile.id || "1",
            user_id: profile.user_id || `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            full_name: profile.full_name || "Usuário Demonstração",
            display_name: profile.display_name || "Usuário",
            email: profile.email || "usuario@exemplo.com",
            avatar_url: profile.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            level: profile.level || 1,
            plan_type: profile.plan_type || "lite"
          });
        } else {
          // Se nenhum perfil for retornado, criar um perfil padrão
          setUserProfile({
            id: "1",
            user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            full_name: "Usuário Demonstração",
            display_name: "Usuário",
            email: "usuario@exemplo.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            level: 1,
            plan_type: "lite"
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        setError(error instanceof Error ? error : new Error("Erro desconhecido ao buscar perfil"));
        
        // Em caso de erro, criar um perfil padrão para evitar UI quebrada
        setUserProfile({
          id: "1",
          user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          full_name: "Usuário Demonstração",
          display_name: "Usuário",
          email: "usuario@exemplo.com",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          level: 1,
          plan_type: "lite"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Carregando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-40">
        <p className="text-red-500 mb-2">Ocorreu um erro ao carregar o perfil:</p>
        <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#FF6B00]/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-4 max-w-screen-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Coluna da esquerda - Card de perfil e contato */}
          <div className="md:col-span-3">
            <div className="flex flex-col gap-6">
              <ProfileHeader userProfile={userProfile} isEditing={isEditing} onEdit={handleEditProfile} />
              <ContactInfo userProfile={userProfile} isEditing={isEditing} />
            </div>
          </div>
          
          {/* Coluna da direita - Informações detalhadas em tabs */}
          <div className="md:col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Tabs defaultValue="perfil" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-0 h-14">
                  <TabsTrigger 
                    value="perfil"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] h-14 px-4"
                  >
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger 
                    value="atividades"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] h-14 px-4"
                  >
                    Atividades
                  </TabsTrigger>
                  <TabsTrigger 
                    value="turmas"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] h-14 px-4"
                  >
                    Turmas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="configuracoes"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] h-14 px-4"
                  >
                    Configurações
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="perfil" className="p-0 m-0">
                  <div className="p-6">
                    <AboutMe userProfile={userProfile} isEditing={isEditing} />
                    <Education userProfile={userProfile} isEditing={isEditing} />
                    <Skills userProfile={userProfile} isEditing={isEditing} />
                    <Interests userProfile={userProfile} isEditing={isEditing} />
                  </div>
                </TabsContent>
                
                <TabsContent value="atividades" className="p-6">
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Atividades em breve</h3>
                    <p className="text-gray-500 dark:text-gray-400">Acompanhe suas atividades recentes nesta aba.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="turmas" className="p-6">
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Suas turmas em breve</h3>
                    <p className="text-gray-500 dark:text-gray-400">Veja todas as suas turmas e grupos de estudo.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="configuracoes" className="p-6">
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Configurações de perfil</h3>
                    <p className="text-gray-500 dark:text-gray-400">Personalize suas configurações de perfil.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}
