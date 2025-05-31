
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  X, 
  UserPlus, 
  Search, 
  Mail, 
  Users, 
  User,
  Star,
  MapPin,
  Clock
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AddPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPartnersModal({ isOpen, onClose }: AddPartnersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("buscar");

  // Mock data para demonstração
  const suggestedPartners = [
    {
      id: 1,
      name: "Maria Silva",
      username: "@mariasilva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      course: "Engenharia de Software",
      location: "São Paulo, SP",
      mutualFriends: 5,
      isOnline: true
    },
    {
      id: 2,
      name: "João Santos",
      username: "@joaosantos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      course: "Ciência da Computação",
      location: "Rio de Janeiro, RJ",
      mutualFriends: 3,
      isOnline: false
    },
    {
      id: 3,
      name: "Ana Costa",
      username: "@anacosta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      course: "Engenharia de Software",
      location: "Belo Horizonte, MG",
      mutualFriends: 8,
      isOnline: true
    }
  ];

  const handleSendInvite = (partnerId: number, partnerName: string) => {
    toast({
      title: "Convite Enviado",
      description: `Convite de parceria enviado para ${partnerName}`,
    });
  };

  const handleAddByEmail = () => {
    if (!searchTerm.includes('@')) {
      toast({
        title: "Email Inválido",
        description: "Por favor, insira um email válido",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Convite Enviado",
      description: `Convite de parceria enviado para ${searchTerm}`,
    });
    setSearchTerm("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0A2540] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#E0E1DD] dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#E0E1DD] dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                      Adicionar Parceiros
                    </h2>
                    <p className="text-sm text-[#64748B] dark:text-white/60">
                      Encontre e conecte-se com outros estudantes
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#E0E1DD] dark:border-white/10">
                <button
                  onClick={() => setActiveTab("buscar")}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === "buscar"
                      ? "text-[#FF6B00] border-b-2 border-[#FF6B00] bg-[#FF6B00]/5"
                      : "text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                  }`}
                >
                  <Search className="h-4 w-4 inline-block mr-2" />
                  Buscar
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === "email"
                      ? "text-[#FF6B00] border-b-2 border-[#FF6B00] bg-[#FF6B00]/5"
                      : "text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                  }`}
                >
                  <Mail className="h-4 w-4 inline-block mr-2" />
                  Por Email
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {activeTab === "buscar" && (
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B] dark:text-white/60" />
                      <Input
                        placeholder="Buscar por nome, curso ou localização..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Suggested Partners */}
                    <div>
                      <h3 className="text-sm font-medium text-[#64748B] dark:text-white/60 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Parceiros Sugeridos
                      </h3>
                      <div className="space-y-3">
                        {suggestedPartners
                          .filter(partner => 
                            searchTerm === "" || 
                            partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            partner.location.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((partner) => (
                            <motion.div
                              key={partner.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 hover:bg-[#FF6B00]/5 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img
                                    src={partner.avatar}
                                    alt={partner.name}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                  />
                                  {partner.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-[#29335C] dark:text-white">
                                    {partner.name}
                                  </h4>
                                  <p className="text-sm text-[#64748B] dark:text-white/60">
                                    {partner.username}
                                  </p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {partner.course}
                                    </span>
                                    <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {partner.location}
                                    </span>
                                  </div>
                                  {partner.mutualFriends > 0 && (
                                    <span className="text-xs text-[#FF6B00] flex items-center gap-1 mt-1">
                                      <Star className="h-3 w-3" />
                                      {partner.mutualFriends} amigos em comum
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleSendInvite(partner.id, partner.name)}
                                className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF5B00] hover:to-[#FF8B40] text-white"
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Convidar
                              </Button>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "email" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-[#29335C] dark:text-white">
                        Email do Parceiro
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                        Envie um convite de parceria diretamente por email
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleAddByEmail}
                      disabled={!searchTerm}
                      className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF5B00] hover:to-[#FF8B40] text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Convite por Email
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#E0E1DD] dark:border-white/10 bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-white/60">
                    <Clock className="h-4 w-4" />
                    <span>Você pode enviar até 10 convites por dia</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-[#E0E1DD] dark:border-white/10"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
