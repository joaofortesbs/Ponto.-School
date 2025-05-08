import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, ChevronRight } from "lucide-react";

interface GroupProps {
  group: {
    id: string;
    name: string;
    members: string[];
    nextMeeting: string;
    course: string;
    description?: string;
    coverImage?: string;
    hasNewMessages?: boolean;
    nivel?: string;
    topico?: string;
  };
  onClick?: () => void;
}

const SimpleGroupCard: React.FC<GroupProps> = ({ group, onClick }) => {
  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden h-full"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
            {group.name}
          </h3>
          {group.hasNewMessages && (
            <Badge className="bg-[#FF6B00] text-white">Novo</Badge>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {group.topico && (
            <p className="line-clamp-1">
              <span className="font-medium">Tópico:</span> {group.topico}
            </p>
          )}
          <p className="line-clamp-1">
            <span className="font-medium">Disciplina:</span> {group.course}
          </p>
        </div>

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Users className="w-3.5 h-3.5 mr-1" />
          <span>{Array.isArray(group.members) ? group.members.length : group.members} | </span>
          <Calendar className="w-3.5 h-3.5 mx-1" />
          <span>{group.nextMeeting}</span>
        </div>

        {group.nivel && (
          <Badge variant="outline" className="mt-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {group.nivel}
          </Badge>
        )}
        
        <div className="flex justify-end mt-3">
          <ChevronRight className="w-4 h-4 text-[#FF6B00]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleGroupCard;