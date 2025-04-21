import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AssistantData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  buttonText: string;
  highlight?: boolean;
  onButtonClick?: () => void;
}

interface ChatCardProps {
  assistant: AssistantData;
}

export const ChatCard: React.FC<ChatCardProps> = ({ assistant }) => {
  return (
    <Card className={`overflow-hidden border-0 ${assistant.highlight ? 'shadow-lg' : 'shadow-md'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col h-[210px]">
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${assistant.highlight ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-blue-500'}`}>
              {assistant.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{assistant.title}</h3>
                {assistant.badge && (
                  <Badge variant="outline" className="text-xs font-medium bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {assistant.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{assistant.description}</p>
            </div>
          </div>

          <div className="mt-auto">
            <Button 
              className={`w-full ${assistant.highlight 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600' 
                : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              onClick={assistant.onButtonClick}
            >
              {assistant.buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};