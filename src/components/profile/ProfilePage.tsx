import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserProfile } from "@/types/user-profile";
import "@/styles/typewriter-loader.css";
import { useProfile } from "@/contexts/ProfileContext";

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
  const { 
    userProfile,
    isLoading,
    contactInfo,
    aboutMe,
    expandedSection,
    isEditing,
    setContactInfo,
    setAboutMe,
    toggleSection,
    setIsEditing,
    saveContactInfo,
    saveAboutMe
  } = useProfile();

  if (isLoading) {
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
