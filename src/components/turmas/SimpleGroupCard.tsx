
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, BookOpen, MessageSquare } from "lucide-react";

interface SimpleGroupCardProps {
  group: {
    id: string;
    name: string;
    members: string[];
    nextMeeting: string;
    course: string;
    description: string;
    hasNewMessages: boolean;
    lastActivity: string;
    coverImage?: string;
  };
  onClick: () => void;
}

const SimpleGroupCard: React.FC<SimpleGroupCardProps> = ({ group, onClick }) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {group.coverImage && (
        <div className="h-32 overflow-hidden">
          <img 
            src={group.coverImage} 
            alt={group.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{group.name}</h3>
          {group.hasNewMessages && (
            <Badge className="bg-[#FF6B00] text-white">Novo</Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
          {group.description}
        </p>
        
        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <BookOpen className="h-4 w-4 mr-1 text-[#FF6B00]" />
          <span>{group.course}</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4 mr-1 text-[#FF6B00]" />
          <span>{group.members.length} membros</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-1 text-[#FF6B00]" />
          <span>Próxima reunião: {group.nextMeeting}</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-4 w-4 mr-1 text-[#FF6B00]" />
          <span>Última atividade: {group.lastActivity}</span>
        </div>
      </div>
    </Card>
  );
};

export default SimpleGroupCard;
