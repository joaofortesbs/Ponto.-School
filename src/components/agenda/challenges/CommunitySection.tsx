import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  Clock,
  ChevronRight,
  PlusCircle,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  likes: number;
  comments: number;
  tags: string[];
}

interface CommunitySectionProps {
  discussions: DiscussionPost[];
  onCreatePost: () => void;
  onViewPost: (postId: string) => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
  discussions,
  onCreatePost,
  onViewPost,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-white font-montserrat">
            Comunidade da Jornada
          </h3>
          <Badge className="bg-[#FF6B00]/20 text-[#FF6B00]">
            {discussions.length} discussões
          </Badge>
        </div>
        <Button
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          onClick={onCreatePost}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Nova Discussão
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {discussions.map((post) => (
          <Card
            key={post.id}
            className="bg-white/5 border-[#FF6B00]/20 hover:border-[#FF6B00]/50 transition-all duration-300 p-4 cursor-pointer"
            onClick={() => onViewPost(post.id)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border-2 border-[#FF6B00]/20">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>
                  {post.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-base font-medium text-white mb-1 hover:text-[#FF6B00] transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center text-xs text-gray-400 mb-2">
                  <span>{post.author.name}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                    {post.date}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors flex items-center gap-1 p-2"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors flex items-center gap-1 p-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          Ver Mais Discussões <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default CommunitySection;
