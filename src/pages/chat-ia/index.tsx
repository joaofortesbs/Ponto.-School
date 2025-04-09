
import React from "react";
import ChatIAInterface from "@/components/chat-ia/ChatIAInterface";

export default function ChatIAPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatIAInterface />
      </div>
    </div>
  );
}
