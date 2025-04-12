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

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("perfil");
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "Adicionar telefone",
    location: "Adicionar localização",
    birthDate: "Adicionar data de nascimento",
  });
  const [aboutMe, setAboutMe] = useState(
    "Olá! Sou estudante de Engenharia de Software na Universidade de São Paulo. Apaixonado por tecnologia, programação e matemática. Busco constantemente novos conhecimentos e desafios para aprimorar minhas habilidades. Nas horas vagas, gosto de jogar xadrez, ler livros de ficção científica e praticar esportes.",
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
          } else if (data) {
            // Ensure level and rank are set with defaults if not present
            setUserProfile({
              ...(data as unknown as UserProfile),
              level: data.level || 1,
              rank: data.rank || "Aprendiz",
            });

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
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
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

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Profile Info */}
          <div className="w-full md:w-1/3 flex flex-col space-y-6">
            {/* Profile Card */}
            <ProfileHeader
              userProfile={userProfile}
              onEditClick={() => setExpandedSection("account")}
            />

            {/* Contact Info - Full width */}
            <ContactInfo
              contactInfo={contactInfo}
              expandedSection={expandedSection}
              toggleSection={toggleSection}
              setContactInfo={setContactInfo}
              saveContactInfo={saveContactInfo}
            />
          </div>

          {/* Right Column - Tabs Content */}
          <div className="w-full md:w-2/3">
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-lg mb-6 h-[900px] backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 transition-all duration-300 hover:shadow-xl">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full h-full"
              >
                <div className="border-b border-[#E0E1DD] dark:border-white/10 bg-gradient-to-r from-white to-gray-50 dark:from-[#0A2540] dark:to-[#0F2D4A]">
                  <TabsList className="p-0 bg-transparent h-auto">
                    <TabsTrigger
                      value="perfil"
                      className="relative px-6 py-5 rounded-none transition-all duration-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00] hover:bg-white/10 dark:hover:bg-white/5 group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" className="fill-current" />
                          <path d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" className="fill-current" />
                        </svg>
                        Perfil
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D] transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="atividades"
                      className="relative px-6 py-5 rounded-none transition-all duration-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00] hover:bg-white/10 dark:hover:bg-white/5 group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" className="fill-current" />
                        </svg>
                        Atividades
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D] transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="turmas"
                      className="relative px-6 py-5 rounded-none transition-all duration-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00] hover:bg-white/10 dark:hover:bg-white/5 group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12.75C8.83 12.75 6.25 15.33 6.25 18.5V19.5H17.75V18.5C17.75 15.33 15.17 12.75 12 12.75Z" className="fill-current" />
                          <path d="M16 8.5C16 10.71 14.21 12.5 12 12.5C9.79 12.5 8 10.71 8 8.5C8 6.29 9.79 4.5 12 4.5C14.21 4.5 16 6.29 16 8.5Z" className="fill-current" />
                          <path d="M18 8.5C18 5.46 15.54 3 12.5 3C12.33 3 12.17 3.01 12 3.02C14.35 3.19 16.22 5.12 16.5 7.5H16V9.5H19.5V9C19.5 8.4 18.1 8.5 18 8.5Z" className="fill-current" />
                          <path d="M20.75 16C21.44 16 22 15.44 22 14.75C22 14.06 21.44 13.5 20.75 13.5C20.06 13.5 19.5 14.06 19.5 14.75C19.5 15.44 20.06 16 20.75 16Z" className="fill-current" />
                          <path d="M3.25 16C3.94 16 4.5 15.44 4.5 14.75C4.5 14.06 3.94 13.5 3.25 13.5C2.56 13.5 2 14.06 2 14.75C2 15.44 2.56 16 3.25 16Z" className="fill-current" />
                        </svg>
                        Turmas
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D] transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="configuracoes"
                      className="relative px-6 py-5 rounded-none transition-all duration-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] text-[#64748B] dark:text-white/60 data-[state=active]:text-[#FF6B00] hover:bg-white/10 dark:hover:bg-white/5 group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" className="fill-current" />
                        </svg>
                        Configurações
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D] transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
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

            {/* Badges & Achievements - Posicionado abaixo do componente de abas, com altura controlada */}
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-lg p-6 h-[900px] backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" className="fill-current" />
                  <path d="M19.5 12C19.5 12.88 19.33 13.72 19.03 14.5H20.25C20.66 14.5 21 14.84 21 15.25C21 15.66 20.66 16 20.25 16H18.6C17.55 17.95 15.44 19.27 13 19.46V20.25C13 20.66 12.66 21 12.25 21H11.75C11.34 21 11 20.66 11 20.25V19.46C8.56 19.27 6.45 17.95 5.4 16H3.75C3.34 16 3 15.66 3 15.25C3 14.84 3.34 14.5 3.75 14.5H4.97C4.67 13.72 4.5 12.88 4.5 12C4.5 11.12 4.67 10.28 4.97 9.5H3.75C3.34 9.5 3 9.16 3 8.75C3 8.34 3.34 8 3.75 8H5.4C6.45 6.05 8.56 4.73 11 4.54V3.75C11 3.34 11.34 3 11.75 3H12.25C12.66 3 13 3.34 13 3.75V4.54C15.44 4.73 17.55 6.05 18.6 8H20.25C20.66 8 21 8.34 21 8.75C21 9.16 20.66 9.5 20.25 9.5H19.03C19.33 10.28 19.5 11.12 19.5 12Z" className="fill-current" />
                </svg>
                Conquistas
              </h3>
              <div className="bg-gradient-to-br from-transparent to-orange-50/10 dark:to-blue-900/10 rounded-lg p-2">
                <Achievements />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}