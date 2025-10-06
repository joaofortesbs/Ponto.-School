import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MessageCircle, CheckCircle } from "lucide-react";

interface ExpertCardProps {
  expert: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
    specialties: string[];
    verified: boolean;
    online: boolean;
    completedRequests: number;
  };
  onClick: () => void;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)" }}
      className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden border border-[#E0E1DD] dark:border-[#29335C]/30 cursor-pointer transition-all duration-300"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-[#FF6B00]/20">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {expert.online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1E293B]"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-[#29335C] dark:text-white">
                {expert.name}
              </h3>
              {expert.verified && (
                <Badge className="ml-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.floor(expert.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                />
              ))}
              <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                ({expert.rating.toFixed(1)})
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {expert.specialties.map((specialty, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
            <span>Responde em {expert.responseTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5 text-[#FF6B00]" />
            <span>{expert.completedRequests} pedidos</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertCard;
