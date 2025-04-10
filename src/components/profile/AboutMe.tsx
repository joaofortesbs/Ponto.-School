import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { UserProfile, DEFAULT_USER_PROFILE } from "@/types/user-profile";

interface AboutMeProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

const AboutMe = ({ userProfile, isEditing }: AboutMeProps) => {
  // Usar perfil padrão se userProfile for null
  const profile = userProfile || DEFAULT_USER_PROFILE;

  return (
    <Card className="mb-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2 text-[#FF6B00]" />
          Sobre Mim
        </CardTitle>
        <CardDescription>Um breve resumo sobre quem sou</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-700 dark:text-gray-300">
            {profile.bio || 
              "Estudante utilizando a plataforma Epictus para aprimorar meus conhecimentos."}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};
export default AboutMe;