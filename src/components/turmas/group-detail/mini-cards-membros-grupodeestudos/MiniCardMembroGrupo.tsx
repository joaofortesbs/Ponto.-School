
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MoreVertical } from "lucide-react";
import RemoverMembroComponent from "./RemoverMembroComponent";
import RemoverMembroModal from "./RemoverMembroModal";

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  lastActive: string;
}

interface MiniCardMembroGrupoProps {
  member: Member;
}

const MiniCardMembroGrupo: React.FC<MiniCardMembroGrupoProps> = ({ member }) => {
  const [showRemoverModal, setShowRemoverModal] = useState(false);

  const handleRemoverClick = () => {
    setShowRemoverModal(true);
  };

  const handleRemover = () => {
    // Funcionalidade será implementada no futuro
    console.log(`Removendo membro: ${member.name}`);
    setShowRemoverModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md relative">
        <div className="absolute top-2 right-2 z-10">
          <RemoverMembroComponent onClick={handleRemoverClick} />
        </div>
        <div className="relative mr-3">
          <Avatar className="h-12 w-12 ring-1 ring-blue-500/20">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {member.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-[#0f1525]"></div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium">{member.name}</h4>
            {member.role === "Administrador" && (
              <Badge className="ml-2 bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
                Administrador
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {member.isOnline ? (
              <span className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                Online
              </span>
            ) : (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {member.lastActive}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <RemoverMembroModal
        isOpen={showRemoverModal}
        onClose={() => setShowRemoverModal(false)}
        memberName={member.name}
        onRemove={handleRemover}
      />
    </>
  );
};

export default MiniCardMembroGrupo;
