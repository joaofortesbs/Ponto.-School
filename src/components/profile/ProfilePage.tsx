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
              birthDate: data.birth_date || "Adicionar data de nascimento",
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
          <div className="w-full md:w-1/3 flex flex-col">
            {/* Profile Card */}
            <ProfileHeader
              userProfile={userProfile}
              onEditClick={() => setExpandedSection("account")}
              className="mb-6"
            />

            {/* Contact Info and Achievements in same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Info */}
              <ContactInfo
                contactInfo={contactInfo}
                expandedSection={expandedSection}
                toggleSection={toggleSection}
                setContactInfo={setContactInfo}
                saveContactInfo={saveContactInfo}
              />
              
              {/* Badges & Achievements */}
              <Achievements />
            </div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="w-full md:w-2/3">
            <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
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
          </div>
        </div>
      </div>
    </div>
  );
}
