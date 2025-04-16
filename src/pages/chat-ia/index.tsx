import React from "react";
import ChatIAInterface from "@/components/chat-ia/ChatIAInterface";

export default function ChatIAPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatIAInterface />
        {/* Mensagem informativa invisível para leitores de tela */}
        <span className="sr-only">
          Esta interface de chat mantém um histórico completo da sua conversa,
          permitindo que a IA se lembre de perguntas e respostas anteriores na mesma sessão.
          Você pode limpar o histórico a qualquer momento usando o botão "Limpar histórico".
        </span>
      </div>
    </div>
  );
}