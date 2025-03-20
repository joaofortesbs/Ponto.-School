import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save } from "lucide-react";

interface AboutMeProps {
  aboutMe: string;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setAboutMe: React.Dispatch<React.SetStateAction<string>>;
  saveAboutMe: () => void;
}

export default function AboutMe({
  aboutMe,
  isEditing,
  setIsEditing,
  setAboutMe,
  saveAboutMe,
}: AboutMeProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Sobre Mim
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={() => (isEditing ? saveAboutMe() : setIsEditing(true))}
        >
          {isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isEditing ? (
        <Textarea
          className="min-h-[120px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
        />
      ) : (
        <p className="text-[#64748B] dark:text-white/80">{aboutMe}</p>
      )}
    </div>
  );
}
