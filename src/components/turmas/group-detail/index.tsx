
import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Calendar, FolderOpen, Info, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatSection from "./ChatSection";

interface GroupDetailProps {
  group: {
    id: string;
    nome: string;
    descricao: string;
    membros: number;
    tags: string[];
  };
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  return (
    <div className="min-h-screen bg-[#001427] text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-4 text-white hover:bg-[#1E293B]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#FF6B00]">{group.nome}</h1>
            <p className="text-gray-300">{group.membros} membros</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#1E293B]">
            <TabsTrigger
              value="discussions"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussões
            </TabsTrigger>
            <TabsTrigger
              value="events"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger
              value="members"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <Users className="h-4 w-4 mr-2" />
              Membros
            </TabsTrigger>
            <TabsTrigger
              value="files"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Arquivos
            </TabsTrigger>
            <TabsTrigger
              value="about"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <Info className="h-4 w-4 mr-2" />
              Sobre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="mt-6">
            <ChatSection groupId={group.id} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Eventos em desenvolvimento
              </h3>
              <p className="text-gray-500">
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Membros em desenvolvimento
              </h3>
              <p className="text-gray-500">
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Arquivos em desenvolvimento
              </h3>
              <p className="text-gray-500">
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="text-center py-12">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Sobre em desenvolvimento
              </h3>
              <p className="text-gray-500">
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetail;
