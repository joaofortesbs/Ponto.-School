import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";
import "@/styles/typewriter-loader.css";

// Import profile components
import ProfileHeader from "./ProfileHeader";
import ContactInfo from "./ContactInfo";
import Achievements from "./Achievements";
import AboutMe from "./AboutMe";
import Education from "./Education";
import Skills from "./Skills";
import Interests from "./Interests";

// Import tabs content
import ActivitiesTab from "../tabs/ActivitiesTab";
import ClassesTab from "../tabs/ClassesTab";
import SettingsTab from "../tabs/SettingsTab";

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

import ErrorBoundary from '../ErrorBoundary';
import { ApiErrorAlert } from '@/components/ui/api-error-alert';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("perfil");
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "Adicionar telefone",
    location: "Adicionar localização",
    birthDate: "Adicionar data de nascimento",
  });
  const [aboutMe, setAboutMe] = useState(
    "Olá! Sou estudante de Engenharia de Software na Universidade de São Paulo. Apaixonado por tecnologia, programação e matemática. Busco constantemente novos conhecimentos e desafios para aprimorar minhas habilidades. Nas horas vagas, gosto de jogar xadrez, ler livros de ficção científica e praticar esportes.",
  );

  // Função para buscar o perfil do usuário
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }
      
      if (!authData.user) {
        setLoading(false);
        return;
      }
      
      const user = authData.user;
      
      // Verificar cache primeiro para resposta rápida
      try {
        const cachedData = localStorage.getItem('userProfile');
        const cacheTime = localStorage.getItem('userProfileCacheTime');
        
        if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime) < 2 * 60 * 1000)) {
          const cachedProfile = JSON.parse(cachedData);
          
          // Usar dados do cache enquanto carrega do servidor
          setUserProfile({
            ...cachedProfile,
            level: cachedProfile.level || 1,
            rank: cachedProfile.rank || "Aprendiz",
          });
          
          setContactInfo({
            email: cachedProfile.email || user.email || "",
            phone: cachedProfile.phone || "Adicionar telefone",
            location: cachedProfile.location || "Adicionar localização",
            birthDate: cachedProfile.birth_date || 
              (user.user_metadata?.birth_date) || 
              (user.raw_user_meta_data?.birth_date) || 
              "Adicionar data de nascimento",
          });
          
          if (cachedProfile.bio) {
            setAboutMe(cachedProfile.bio);
          }
        }
      } catch (cacheError) {
        console.warn("Erro ao acessar cache do perfil:", cacheError);
      }
      
      // Buscar do servidor
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (fetchError) {
        // Verificar se ainda temos dados do cache em uso
        if (userProfile) {
          toast({
            title: "Aviso",
            description: "Não foi possível atualizar seu perfil. Mostrando informações salvas anteriormente.",
            variant: "default"
          });
          setLoading(false);
          return;
        }
        
        throw new Error(`Erro ao buscar perfil: ${fetchError.message}`);
      }
      
      if (!data) {
        setLoading(false);
        return;
      }
      
      // Atualizar cache
      try {
        localStorage.setItem('userProfile', JSON.stringify(data));
        localStorage.setItem('userProfileCacheTime', Date.now().toString());
      } catch (storageError) {
        console.warn("Erro ao salvar cache do perfil:", storageError);
      }
      
      // Ensure level and rank are set with defaults if not present
      const profile = {
        ...data,
        level: data.level || 1,
        rank: data.rank || "Aprendiz",
      };
      
      setUserProfile(profile);
      
      // Set contact info from user data
      setContactInfo({
        email: data.email || user.email || "",
        phone: data.phone || "Adicionar telefone",
        location: data.location || "Adicionar localização",
        birthDate: data.birth_date || 
          (user.user_metadata?.birth_date) || 
          (user.raw_user_meta_data?.birth_date) || 
          "Adicionar data de nascimento",
      });
      
      if (data.bio) {
        setAboutMe(data.bio);
      }
    } catch (error) {
      const handledError = await handleError(error, "Falha ao carregar seu perfil", {
        retry: fetchProfile
      });
      setError(handledError);
      
      // Tentar usar cache como último recurso
      try {
        const cachedData = localStorage.getItem('userProfile');
        if (cachedData && !userProfile) {
          const cachedProfile = JSON.parse(cachedData);
          setUserProfile({
            ...cachedProfile,
            level: cachedProfile.level || 1,
            rank: cachedProfile.rank || "Aprendiz",
          });
          
          toast({
            title: "Modo offline",
            description: "Mostrando informações salvas anteriormente devido a problemas de conexão.",
            variant: "default"
          });
        }
      } catch (fallbackError) {
        console.error("Falha ao usar dados em cache:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleSection = (section: string | null) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const saveContactInfo = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            email: contactInfo.email,
            phone:
              contactInfo.phone === "Adicionar telefone"
                ? null
                : contactInfo.phone,
            location:
              contactInfo.location === "Adicionar localização"
                ? null
                : contactInfo.location,
            birth_date:
              contactInfo.birthDate === "Adicionar data de nascimento"
                ? null
                : contactInfo.birthDate,
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating contact info:", error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
    toggleSection(null);
  };

  const saveAboutMe = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            bio: aboutMe,
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating bio:", error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full relative">
        <div className="typewriter-container">
          <div className="typewriter">
            <div className="slide"><i></i></div>
            <div className="paper"></div>
            <div className="keyboard"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !userProfile) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ApiErrorAlert
            title="Erro ao carregar perfil"
            description="Não foi possível carregar os dados do seu perfil. Verifique sua conexão e tente novamente."
            error={error}
            onRetry={fetchProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Profile Info */}
          <div className="w-full md:w-1/3 flex flex-col space-y-6">
            <div className="h-full flex flex-col gap-6">
              {/* Profile Card */}
              <div className="flex-1">
                <ProfileHeader
                  userProfile={userProfile}
                  onEditClick={() => setExpandedSection("account")}
                />
              </div>

              {/* Contact Info - Full width */}
              <div className="flex-1">
                <ContactInfo
                  contactInfo={contactInfo}
                  expandedSection={expandedSection}
                  toggleSection={toggleSection}
                  setContactInfo={setContactInfo}
                  saveContactInfo={saveContactInfo}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="w-full md:w-2/3">
            {/* Criando um grid com duas células de igual altura */}
            <div className="grid grid-cols-1 gap-6 h-full">
              {/* Componente de Abas - Primeira célula do grid */}
              <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm flex-grow">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full h-full"
                >
                  <div className="border-b border-[#E0E1DD] dark:border-white/10">
                    <TabsList className="p-0 bg-transparent h-auto">
                      <TabsTrigger
                        value="perfil"
                        className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                      >
                        Perfil
                      </TabsTrigger>
                      <TabsTrigger
                        value="atividades"
                        className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                      >
                        Atividades
                      </TabsTrigger>
                      <TabsTrigger
                        value="turmas"
                        className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                      >
                        Turmas
                      </TabsTrigger>
                      <TabsTrigger
                        value="configuracoes"
                        className="px-6 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00]"
                      >
                        Configurações
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <TabsContent
                      value="perfil"
                      className="p-6 focus:outline-none"
                    >
                      <div className="space-y-6 w-full">
                        {/* About Me */}
                        <AboutMe
                          aboutMe={aboutMe}
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                          setAboutMe={setAboutMe}
                          saveAboutMe={saveAboutMe}
                        />

                        {/* Education */}
                        <Education />

                        {/* Skills */}
                        <Skills />

                        {/* Interests */}
                        <Interests />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="atividades"
                      className="p-6 focus:outline-none"
                    >
                      <ActivitiesTab />
                    </TabsContent>

                    <TabsContent
                      value="turmas"
                      className="p-6 focus:outline-none"
                    >
                      <ClassesTab />
                    </TabsContent>

                    <TabsContent
                      value="configuracoes"
                      className="p-6 focus:outline-none"
                    >
                      <SettingsTab
                        userProfile={userProfile}
                        contactInfo={contactInfo}
                        aboutMe={aboutMe}
                        expandedSection={expandedSection}
                        toggleSection={toggleSection}
                        setContactInfo={setContactInfo}
                        setAboutMe={setAboutMe}
                        setUserProfile={setUserProfile}
                      />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
              
              {/* Badges & Achievements - Segunda célula do grid */}
              <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm p-6" style={{ minHeight: "420px" }}>
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-4">Conquistas</h3>
                <div className="h-[calc(100%-3rem)] overflow-auto">
                  <Achievements />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
