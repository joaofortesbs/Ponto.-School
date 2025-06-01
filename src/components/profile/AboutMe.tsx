
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, User } from "lucide-react";

interface AboutMeProps {
  aboutMe: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  setAboutMe: (text: string) => void;
  saveAboutMe: () => void;
}

export default function AboutMe({
  aboutMe,
  isEditing,
  setIsEditing,
  setAboutMe,
  saveAboutMe,
}: AboutMeProps) {
  const hasContent = aboutMe && aboutMe.trim() !== "" && 
    !aboutMe.includes("Olá! Sou estudante de Engenharia de Software") && 
    !aboutMe.includes("Apaixonado por tecnologia, programação");

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
            <User className="h-4 w-4 text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Sobre Mim
          </h3>
        </div>
        {hasContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={hasContent ? aboutMe : ""}
            onChange={(e) => setAboutMe(e.target.value)}
            className="min-h-[120px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 resize-none"
            placeholder="Conte um pouco sobre você, seus interesses, objetivos de estudo..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                saveAboutMe();
                setIsEditing(false);
              }}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-[#64748B] dark:text-white/60 leading-relaxed">
          {hasContent ? (
            <p>{aboutMe}</p>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-[#FF6B00]" />
              </div>
              <p className="text-[#64748B] dark:text-white/60 mb-3">
                Conte um pouco sobre você para que outros usuários possam te conhecer melhor.
              </p>
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Adicionar Biografia
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
