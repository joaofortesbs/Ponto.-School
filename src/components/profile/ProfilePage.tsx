
import React from "react";
import AboutMe from "./AboutMe";
import Education from "./Education";
import Skills from "./Skills";
import Interests from "./Interests";
import { ToastProvider } from "@/components/ui/toast";

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  return (
    <ToastProvider>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Seção Sobre Mim */}
        <AboutMe isOwnProfile={isOwnProfile} />
        
        {/* Grid com Educação, Habilidades e Interesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Education isOwnProfile={isOwnProfile} />
            <Skills isOwnProfile={isOwnProfile} />
          </div>
          <div className="space-y-6">
            <Interests isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
