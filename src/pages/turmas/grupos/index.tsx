
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users2, Search } from "lucide-react";

export default function GruposEstudo() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Users2 className="h-8 w-8 text-[#FF6B00] mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-[#001427] dark:text-white">
              Grupos de Estudo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Seção em reconstrução - Em breve, novas funcionalidades!
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Em breve..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-[#FF6B00]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Seção em Reconstrução
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Estamos trabalhando em uma experiência completamente nova para os Grupos de Estudo. 
            Em breve, você terá acesso a funcionalidades incríveis para colaborar e aprender com seus colegas!
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></div>
            <span>Aguarde as novidades...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
