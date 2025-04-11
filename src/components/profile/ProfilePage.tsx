
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
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
import { useMediaQuery } from "@/lib/utils";

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Efeito de parallax suave
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Animações para os elementos da página
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.8,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };

  const tabIndicatorVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "100%", opacity: 1, transition: { duration: 0.3 } }
  };

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
    
    // Efeito de carregamento com delay para melhor UX
    const loadingTimer = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(loadingTimer);
  }, []);

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 1, 0.5], 
            scale: [0.8, 1, 0.8],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent mb-6"
        />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-500 dark:text-gray-400 font-medium"
        >
          Carregando seu perfil...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center h-[50vh] p-6"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-red-100 dark:border-red-900">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3"
          >
            Ocorreu um erro
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-gray-600 dark:text-gray-300 mb-6"
          >
            {error.message}
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(255, 107, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: 0.5 }}
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium"
          >
            Tentar novamente
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        onMouseMove={handleMouseMove}
        className="min-h-screen relative profile-3d-container"
      >
        {/* Efeito de background com gradiente interativo */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-blue-50/30 to-orange-50/30 dark:from-navy-950/50 dark:to-navy-900/50 z-0 pointer-events-none"
          style={{ 
            backgroundPosition: isMobile ? 'center' : `${mousePosition.x / 50}px ${mousePosition.y / 50}px`,
            transition: 'background-position 0.3s ease-out'
          }}
        >
          {/* Elementos decorativos de fundo */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl"
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10 max-w-screen-xl">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Coluna da esquerda - Card de perfil e contato */}
            <motion.div 
              className="md:col-span-3"
              variants={itemVariants}
            >
              <div className="flex flex-col gap-6">
                <ProfileHeader userProfile={userProfile} isEditing={isEditing} onEdit={handleEditProfile} />
                <ContactInfo userProfile={userProfile} isEditing={isEditing} />
              </div>
            </motion.div>
            
            {/* Coluna da direita - Informações detalhadas em tabs */}
            <motion.div 
              className="md:col-span-9"
              variants={itemVariants}
            >
              <motion.div 
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-lg"
                whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ duration: 0.3 }}
              >
                <Tabs defaultValue="perfil" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="w-full bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-0 h-14">
                    {["perfil", "atividades", "turmas", "configuracoes"].map((tab) => (
                      <TabsTrigger 
                        key={tab}
                        value={tab}
                        className="relative h-14 px-4 font-medium transition-all duration-300 data-[state=active]:text-orange-500 group"
                      >
                        <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                        
                        {/* Indicador animado de tab ativa */}
                        {activeTab === tab && (
                          <motion.span 
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500"
                            layoutId="tabIndicator"
                            initial="initial"
                            animate="animate"
                            variants={tabIndicatorVariants}
                          />
                        )}
                        
                        {/* Efeito de hover nas tabs */}
                        <span className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors duration-300" />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <AnimatePresence mode="wait">
                    <TabsContent 
                      value="perfil" 
                      className="p-0 m-0"
                    >
                      <motion.div 
                        className="p-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AboutMe userProfile={userProfile} isEditing={isEditing} />
                        <Education userProfile={userProfile} isEditing={isEditing} />
                        <Skills userProfile={userProfile} isEditing={isEditing} />
                        <Interests userProfile={userProfile} isEditing={isEditing} />
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="atividades" className="p-6">
                      <motion.div 
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-6"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Atividades em breve</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          Acompanhe suas atividades recentes, progresso nos cursos e conquistas nesta aba.
                        </p>
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="turmas" className="p-6">
                      <motion.div 
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-6"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Suas turmas</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          Veja todas as suas turmas e grupos de estudo, gerencie participações e acompanhe novidades.
                        </p>
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="configuracoes" className="p-6">
                      <motion.div 
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-6"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Configurações de perfil</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          Personalize suas configurações de perfil, privacidade e preferências de notificação.
                        </p>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}
